import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { DigitalTwin, Simulation } from '../types/digitalTwin';
import { DigitalTwinType, SimulationStatus, SimulationType, ComponentType } from '../types/digitalTwin';
import type { DataSource } from '../types/dataSource';
import { DataSourceType } from '../types/dataSource';

// Demo-Daten für einen Beispiel Digital Twin
const demoIndustrialTwin: DigitalTwin = {
  id: 'industrial-twin-1',
  name: 'Industrieanlage A',
  description: 'Digitaler Zwilling einer Fertigungsanlage',
  modelPath: '/models/industrial-plant.glb',
  type: DigitalTwinType.INDUSTRIAL,
  properties: {
    location: 'Halle 3',
    manufacturer: 'Industrial Solutions GmbH',
    installationDate: '2023-02-15',
    lastMaintenance: '2025-01-10',
  },
  components: [    {
      id: 'component-1',
      name: 'Temperatur-Sensor',
      type: ComponentType.SENSOR,
      properties: {
        temperature: 42.5,
        status: 'OK',
        unit: '°C',
        lastUpdated: new Date().toISOString(),
      },
      position: { x: 2, y: 1.5, z: 0 },
    },    {
      id: 'component-2',
      name: 'Druck-Sensor',
      type: ComponentType.SENSOR,
      properties: {
        pressure: 1024,
        status: 'WARNING',
        unit: 'hPa',
        lastUpdated: new Date().toISOString(),
      },
      position: { x: -1, y: 1, z: 2 },
    },    {
      id: 'component-3',
      name: 'Motor',
      type: ComponentType.ACTUATOR,
      properties: {
        powerOutput: 85,
        rpm: 1200,
        status: 'OK',
        lastUpdated: new Date().toISOString(),
      },
      position: { x: 0, y: 0.5, z: -3 },
      rotation: { x: 0, y: Math.PI / 2, z: 0 },
    },    {
      id: 'component-4',
      name: 'Steuerungseinheit',
      type: ComponentType.STATIC,
      properties: {
        firmwareVersion: '3.2.1',
        status: 'OK',
        lastUpdated: new Date().toISOString(),
      },
      position: { x: -2, y: 0, z: -1 },
    }
  ],
  position: { x: 0, y: 0, z: 0 },
  rotation: { x: 0, y: 0, z: 0 },
  scale: { x: 1, y: 1, z: 1 },
};

// Demo-Daten für einen Datenquellen
const demoDatasources: DataSource[] = [
  {
    id: 'datasource-1',
    name: 'Temperatursensor API',
    type: DataSourceType.API,
    endpoint: 'https://api.example.com/sensors/temperature',
    updateInterval: 5000,
    credentials: {
      apiKey: 'demo-api-key',
    }
  },
  {
    id: 'datasource-2',
    name: 'Maschine-Status Websocket',
    type: DataSourceType.WEBSOCKET,
    endpoint: 'wss://api.example.com/machine-status',
  },  {
    id: 'datasource-3',
    name: 'Mock-Daten',
    type: DataSourceType.MOCK,
    endpoint: 'internal://mock-data',
    updateInterval: 5000, // Increased from 2000 to 5000ms (5 seconds)
  }
];

// Demo-Daten für Simulationen
const demoSimulations: Simulation[] = [
  {
    id: 'simulation-1',
    name: 'Motor-Überhitzung',
    type: SimulationType.THERMAL,
    parameters: {
      ambientTemperature: 22,
      heatGenerationRate: 1.5,
      coolingRate: 0.05,
    },
    target: {
      twinId: 'industrial-twin-1',
      componentIds: ['component-3'],
    },
    duration: 60000, // 60 Sekunden
    status: SimulationStatus.IDLE,
  },
  {
    id: 'simulation-2',
    name: 'Sensor-Ausfall',
    type: SimulationType.FAILURE,
    parameters: {
      failureRate: 0.02,
      wearRate: 0.01,
    },
    target: {
      twinId: 'industrial-twin-1',
      componentIds: ['component-1', 'component-2'],
    },
    duration: 120000, // 120 Sekunden
    status: SimulationStatus.IDLE,
  },
];

interface DigitalTwinContextType {
  digitalTwins: DigitalTwin[];
  selectedTwinId: string | null;
  selectedComponentId: string | null;
  dataSources: DataSource[];
  simulations: Simulation[];
  addDigitalTwin: (twin: DigitalTwin) => void;
  updateDigitalTwin: (twin: DigitalTwin) => void;
  deleteDigitalTwin: (twinId: string) => void;
  selectDigitalTwin: (twinId: string | null) => void;
  selectComponent: (componentId: string | null) => void;
  addDataSource: (dataSource: DataSource) => void;
  updateDataSource: (dataSource: DataSource) => void;
  deleteDataSource: (dataSourceId: string) => void;
  addSimulation: (simulation: Simulation) => void;
  updateSimulation: (simulation: Simulation) => void;
  deleteSimulation: (simulationId: string) => void;
  updateSimulationStatus: (simulationId: string, status: SimulationStatus) => void;
  getSelectedTwin: () => DigitalTwin | null;
  getSelectedComponent: () => any | null;
}

const DigitalTwinContext = createContext<DigitalTwinContextType | null>(null);

interface DigitalTwinProviderProps {
  children: ReactNode;
  initialTwins?: DigitalTwin[];
  initialDataSources?: DataSource[];
  initialSimulations?: Simulation[];
}

export const DigitalTwinProvider = ({
  children,
  initialTwins = [demoIndustrialTwin],
  initialDataSources = demoDatasources,
  initialSimulations = demoSimulations
}: DigitalTwinProviderProps) => {
  // Zustand
  const [digitalTwins, setDigitalTwins] = useState<DigitalTwin[]>(initialTwins);
  const [selectedTwinId, setSelectedTwinId] = useState<string | null>(null);
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);
  const [dataSources, setDataSources] = useState<DataSource[]>(initialDataSources);
  const [simulations, setSimulations] = useState<Simulation[]>(initialSimulations);

  // Wähle den ersten Digital Twin beim Start aus
  useEffect(() => {
    if (digitalTwins.length > 0 && selectedTwinId === null) {
      setSelectedTwinId(digitalTwins[0].id);
    }
  }, [digitalTwins, selectedTwinId]);

  // Digital Twin hinzufügen
  const addDigitalTwin = (twin: DigitalTwin) => {
    setDigitalTwins(prev => [...prev, twin]);
  };

  // Digital Twin aktualisieren
  const updateDigitalTwin = (twin: DigitalTwin) => {
    setDigitalTwins(prev => prev.map(t => t.id === twin.id ? twin : t));
  };

  // Digital Twin löschen
  const deleteDigitalTwin = (twinId: string) => {
    setDigitalTwins(prev => prev.filter(t => t.id !== twinId));
    if (selectedTwinId === twinId) {
      setSelectedTwinId(null);
      setSelectedComponentId(null);
    }
  };

  // Digital Twin auswählen
  const selectDigitalTwin = (twinId: string | null) => {
    setSelectedTwinId(twinId);
    setSelectedComponentId(null); // Zurücksetzen der Komponenten-Auswahl
  };

  // Komponente auswählen
  const selectComponent = (componentId: string | null) => {
    setSelectedComponentId(componentId);
  };

  // Datenquelle hinzufügen
  const addDataSource = (dataSource: DataSource) => {
    setDataSources(prev => [...prev, dataSource]);
  };

  // Datenquelle aktualisieren
  const updateDataSource = (dataSource: DataSource) => {
    setDataSources(prev => prev.map(ds => ds.id === dataSource.id ? dataSource : ds));
  };

  // Datenquelle löschen
  const deleteDataSource = (dataSourceId: string) => {
    setDataSources(prev => prev.filter(ds => ds.id !== dataSourceId));
  };

  // Simulation hinzufügen
  const addSimulation = (simulation: Simulation) => {
    setSimulations(prev => [...prev, simulation]);
  };

  // Simulation aktualisieren
  const updateSimulation = (simulation: Simulation) => {
    setSimulations(prev => prev.map(sim => sim.id === simulation.id ? simulation : sim));
  };

  // Simulation löschen
  const deleteSimulation = (simulationId: string) => {
    setSimulations(prev => prev.filter(sim => sim.id !== simulationId));
  };

  // Simulationsstatus aktualisieren
  const updateSimulationStatus = (simulationId: string, status: SimulationStatus) => {
    setSimulations(prev =>
      prev.map(sim =>
        sim.id === simulationId ? { ...sim, status } : sim
      )
    );
  };

  // Ausgewählten Digital Twin abrufen
  const getSelectedTwin = (): DigitalTwin | null => {
    return selectedTwinId ? digitalTwins.find(t => t.id === selectedTwinId) || null : null;
  };

  // Ausgewählte Komponente abrufen
  const getSelectedComponent = (): any | null => {
    if (!selectedTwinId || !selectedComponentId) {
      return null;
    }
    const selectedTwin = digitalTwins.find(t => t.id === selectedTwinId);
    if (!selectedTwin) {
      return null;
    }
    return selectedTwin.components.find(c => c.id === selectedComponentId) || null;
  };

  const contextValue: DigitalTwinContextType = {
    digitalTwins,
    selectedTwinId,
    selectedComponentId,
    dataSources,
    simulations,
    addDigitalTwin,
    updateDigitalTwin,
    deleteDigitalTwin,
    selectDigitalTwin,
    selectComponent,
    addDataSource,
    updateDataSource,
    deleteDataSource,
    addSimulation,
    updateSimulation,
    deleteSimulation,
    updateSimulationStatus,
    getSelectedTwin,
    getSelectedComponent,
  };

  return (
    <DigitalTwinContext.Provider value={contextValue}>
      {children}
    </DigitalTwinContext.Provider>
  );
};

// Hook für einfachen Zugriff auf den Kontext
export const useDigitalTwin = () => {
  const context = useContext(DigitalTwinContext);
  if (!context) {
    throw new Error('useDigitalTwin muss innerhalb eines DigitalTwinProviders verwendet werden');
  }
  return context;
};

export default DigitalTwinContext;
