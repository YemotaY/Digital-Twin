import { type FC, useState, memo, useMemo } from 'react';
import { styled } from '@mui/material/styles';
import {
  Box,
  Paper,
  Stack,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Badge,
  CircularProgress,
  Chip,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';

import Visualizer from '../modules/visualizer/Visualizer';
import { useDigitalTwin } from '../context/DigitalTwinContext';
import { DataConnector } from '../modules/dataConnector/DataConnector';
import SimulationEngine from '../modules/simulator/SimulationEngine';
import { DataSourceType } from '../types/digitalTwin';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`twin-tabpanel-${index}`}
      aria-labelledby={`twin-tab-${index}`}
      style={{ height: '100%' }}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3, height: '100%' }}>{children}</Box>
      )}
    </div>
  );
}

const StyledCard = styled(Card)(() => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
}));

const TwinVisualizerContainer = styled(Box)(() => ({
  height: 'calc(100vh - 240px)',
  width: '100%',
  position: 'relative',
}));

export const Dashboard: FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const { getSelectedTwin, selectComponent, dataSources, simulations } = useDigitalTwin();

  const selectedTwin = getSelectedTwin();

  const handleChangeTab = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Memoize twin data source to prevent unnecessary re-renders
  const twinDataSource = useMemo(() => {
    return dataSources.find(ds => ds.type === DataSourceType.MOCK) || dataSources[0];
  }, [dataSources]);
  // Memoize twin simulations to prevent unnecessary re-renders
  const activeSimulation = useMemo(() => {
    const sims = simulations.filter(sim => sim.target.twinId === selectedTwin?.id);
    return sims.length > 0 ? sims[0] : null;
  }, [simulations, selectedTwin?.id]);

  if (!selectedTwin) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h5">Kein Digital Twin ausgewählt</Typography>
        <Typography variant="body1" sx={{ mt: 2 }}>
          Bitte wählen Sie einen Digital Twin aus der Seitenleiste aus oder erstellen Sie einen neuen.
        </Typography>
      </Box>    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {selectedTwin.name}
      </Typography>
      <Typography variant="body1" gutterBottom>
        {selectedTwin.description}
      </Typography>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleChangeTab} aria-label="twin dashboard tabs">
          <Tab label="Übersicht" />
          <Tab label="Komponenten" />
          <Tab label="Simulationen" />
          <Tab label="Daten" />
        </Tabs>
      </Box>
      
      <TabPanel value={tabValue} index={0}>
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <TwinVisualizerContainer>
              <Visualizer 
                digitalTwin={selectedTwin} 
                onSelectComponent={(component) => selectComponent(component.id)}
              />
            </TwinVisualizerContainer>
          </Box>
          
          <Box sx={{ width: 400, minWidth: 300 }}>
            <Stack spacing={2}>
              <StyledCard>
                <CardHeader 
                  title="Status" 
                  action={
                    <IconButton aria-label="refresh">
                      <RefreshIcon />
                    </IconButton>
                  }
                />
                <CardContent>
                  <StatusSummary twin={selectedTwin} />
                </CardContent>
              </StyledCard>
              
              <StyledCard>
                <CardHeader title="Eigenschaften" />
                <CardContent>
                  {Object.entries(selectedTwin.properties).map(([key, value]) => (
                    <Box key={key} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">{key}:</Typography>
                      <Typography variant="body2">{String(value)}</Typography>
                    </Box>
                  ))}
                </CardContent>
              </StyledCard>
              
              {twinDataSource && (
                <StyledCard>
                  <CardHeader 
                    title="Aktuelle Daten" 
                    subheader={`Quelle: ${twinDataSource.name}`}
                  />
                  <CardContent>
                    <LiveDataDisplay dataSource={twinDataSource} />
                  </CardContent>
                </StyledCard>
              )}
            </Stack>
          </Box>
        </Box>
      </TabPanel>
      
      <TabPanel value={tabValue} index={1}>
        <ComponentsList twin={selectedTwin} />
      </TabPanel>
      
      <TabPanel value={tabValue} index={2}>
        {activeSimulation ? (
          <Box sx={{ height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Simulation: {activeSimulation.name}
            </Typography>
            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography variant="body2">
                Typ: {activeSimulation.type}, Dauer: {(activeSimulation.duration || 0) / 1000}s
              </Typography>
            </Paper>
            
            <Box sx={{ height: 'calc(100% - 120px)' }}>
              <SimulationEngine
                simulation={activeSimulation}
                digitalTwin={selectedTwin}
                onUpdate={(updatedTwin) => {
                  console.log('Simulation update:', updatedTwin);
                }}
              />
            </Box>
          </Box>
        ) : (
          <Typography>Keine Simulationen verfügbar für diesen Digital Twin.</Typography>
        )}
      </TabPanel>
      
      <TabPanel value={tabValue} index={3}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {dataSources.map((dataSource) => (
            <Box key={dataSource.id} sx={{ minWidth: 300, flex: 1 }}>
              <StyledCard>
                <CardHeader 
                  title={dataSource.name}
                  subheader={`Typ: ${dataSource.type}`}
                  action={
                    <IconButton aria-label="info">
                      <InfoIcon />
                    </IconButton>
                  }
                />
                <CardContent>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Endpunkt: {dataSource.endpoint}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Update-Intervall: {dataSource.updateInterval || 'Echtzeit'}
                  </Typography>
                  
                  <Box sx={{ mt: 2 }}>
                    <LiveDataDisplay dataSource={dataSource} />
                  </Box>
                </CardContent>
              </StyledCard>
            </Box>
          ))}
        </Box>
      </TabPanel>
    </Box>
  );
};

const StatusSummary: FC<{ twin: any }> = memo(({ twin }) => {
  // Memoize status calculation to prevent unnecessary recalculations
  const statusInfo = useMemo(() => {
    const componentsStatus = twin.components.map((c: any) => c.properties.status || 'OK');
    const hasError = componentsStatus.includes('ERROR');
    const hasWarning = componentsStatus.includes('WARNING');
    
    let statusIcon;
    let statusColor;
    let statusText;
    
    if (hasError) {
      statusIcon = <ErrorIcon color="error" />;
      statusColor = 'error';
      statusText = 'Fehler erkannt';
    } else if (hasWarning) {
      statusIcon = <WarningIcon color="warning" />;
      statusColor = 'warning';
      statusText = 'Warnung';
    } else {
      statusIcon = <CheckCircleIcon color="success" />;
      statusColor = 'success';
      statusText = 'Normal';
    }
    
    return { statusIcon, statusColor, statusText };
  }, [twin.components]);
  
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Badge variant="dot" color={statusInfo.statusColor as 'error' | 'warning' | 'success'}>
          {statusInfo.statusIcon}
        </Badge>
        <Typography variant="h6" sx={{ ml: 1 }}>{statusInfo.statusText}</Typography>
      </Box>
      
      <Typography variant="body2" gutterBottom>Komponenten:</Typography>
      <List dense>
        {twin.components.map((component: any) => (
          <ListItem key={component.id}>
            <ListItemText 
              primary={component.name}
              secondary={`Status: ${component.properties.status || 'OK'}`}
            />
            {component.properties.status === 'WARNING' && <WarningIcon color="warning" fontSize="small" />}
            {component.properties.status === 'ERROR' && <ErrorIcon color="error" fontSize="small" />}
            {(!component.properties.status || component.properties.status === 'OK') && 
              <CheckCircleIcon color="success" fontSize="small" />}
          </ListItem>
        ))}
      </List>
    </Box>
  );
});

StatusSummary.displayName = 'StatusSummary';

const LiveDataDisplay: FC<{ dataSource: any }> = memo(({ dataSource }) => {
  // Memoize the data source ID to prevent unnecessary re-renders
  const dataSourceId = useMemo(() => dataSource.id, [dataSource.id]);
  
  return (
    <DataConnector 
      dataSource={dataSource}
      key={dataSourceId} // Add key to force re-mount only when dataSource ID changes
    >
      {({ data, loading, error }) => {
        if (loading) {
          return <CircularProgress size={24} />;
        }
        if (error) {
          return <Typography color="error">Fehler beim Abrufen der Daten</Typography>;
        }
        if (!data) {
          return <Typography color="text.secondary">Keine Daten verfügbar</Typography>;
        }
        
        return (
          <Box>
            {data.timestamp && (
              <Typography variant="caption" display="block" gutterBottom>
                Letztes Update: {new Date(data.timestamp).toLocaleTimeString()}
              </Typography>
            )}
            
            {data.values && Object.entries(data.values).map(([key, value]) => (
              <Box key={key} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">{key}:</Typography>
                <Typography variant="body2">
                  {typeof value === 'number' ? value.toFixed(1) : String(value)}
                  {key === 'status' && (
                    <Chip 
                      size="small" 
                      label={String(value)} 
                      color={value === 'OK' ? 'success' : 'warning'} 
                      sx={{ ml: 1 }}
                    />
                  )}
                </Typography>
              </Box>
            ))}
          </Box>
        );
      }}
    </DataConnector>
  );
});

LiveDataDisplay.displayName = 'LiveDataDisplay';

const ComponentsList: FC<{ twin: any }> = ({ twin }) => {
  const { selectComponent, selectedComponentId } = useDigitalTwin();
  
  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
      {twin.components.map((component: any) => (
        <Box key={component.id} sx={{ minWidth: 300, maxWidth: 400, flex: 1 }}>
          <Paper 
            elevation={selectedComponentId === component.id ? 6 : 1}
            sx={{ 
              p: 2, 
              cursor: 'pointer',
              border: selectedComponentId === component.id ? '2px solid primary.main' : 'none',
              height: '100%'
            }}
            onClick={() => selectComponent(component.id)}
          >
            <Typography variant="h6" gutterBottom>
              {component.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Typ: {component.type}
            </Typography>
            
            <Typography variant="subtitle2" sx={{ mt: 1, mb: 0.5 }}>
              Eigenschaften:
            </Typography>
            {Object.entries(component.properties).map(([key, value]) => (
              <Box key={key} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="caption" color="text.secondary">{key}:</Typography>
                <Typography variant="caption">
                  {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                </Typography>
              </Box>
            ))}
            
            {component.position && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="caption" display="block" color="text.secondary">
                  Position: X: {component.position.x}, Y: {component.position.y}, Z: {component.position.z}
                </Typography>
              </Box>
            )}
          </Paper>
        </Box>
      ))}
    </Box>
  );
};

export default Dashboard;
