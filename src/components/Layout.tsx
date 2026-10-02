import { type FC, useState } from 'react';
import { styled } from '@mui/material/styles';
import {
  Box,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
  AppBar,
  Toolbar,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Storage as DataIcon,
  Science as SimulationIcon,
  LibraryBooks as AssetIcon,
  Settings as SettingsIcon,
  Add as AddIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';

import { useDigitalTwin } from '../context/DigitalTwinContext';
import { type DigitalTwin } from '../types/digitalTwin';

const drawerWidth = 280;

interface NavbarProps {
  onMenuToggle: () => void;
  open: boolean;
}

// Navigationsleiste oben
export const Navbar: FC<NavbarProps> = ({ onMenuToggle, open }) => {
  const { getSelectedTwin } = useDigitalTwin();
  const selectedTwin = getSelectedTwin();

  return (
    <AppBar
      position="fixed"
      sx={{
        width: { sm: `calc(100% - ${open ? drawerWidth : 0}px)` },
        ml: { sm: `${open ? drawerWidth : 0}px` },
        zIndex: (theme) => theme.zIndex.drawer + 1,
        transition: (theme) =>
          theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={onMenuToggle}
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
          Digital Twin Baukasten
          {selectedTwin && ` - ${selectedTwin.name}`}
        </Typography>
        <IconButton color="inherit">
          <AddIcon />
        </IconButton>
        <IconButton color="inherit">
          <SettingsIcon />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};

interface SidebarProps {
  open: boolean;
}

// Seitenleiste mit Navigation
export const Sidebar: FC<SidebarProps> = ({ open }) => {
  const { digitalTwins, selectDigitalTwin, selectedTwinId } = useDigitalTwin();
  const [currentSection, setCurrentSection] = useState('dashboard');

  const handleSectionClick = (section: string) => {
    setCurrentSection(section);
  };

  return (
    <Drawer
      variant="persistent"
      anchor="left"
      open={open}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
        },
      }}
      ModalProps={{
        keepMounted: true,
      }}
    >
      <Toolbar />
      <Box sx={{ overflow: 'auto' }}>
        <List>
          <ListItem disablePadding>
            <ListItemButton
              selected={currentSection === 'dashboard'}
              onClick={() => handleSectionClick('dashboard')}
            >
              <ListItemIcon>
                <DashboardIcon />
              </ListItemIcon>
              <ListItemText primary="Dashboard" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton
              selected={currentSection === 'data'}
              onClick={() => handleSectionClick('data')}
            >
              <ListItemIcon>
                <DataIcon />
              </ListItemIcon>
              <ListItemText primary="Datenquellen" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton
              selected={currentSection === 'simulation'}
              onClick={() => handleSectionClick('simulation')}
            >
              <ListItemIcon>
                <SimulationIcon />
              </ListItemIcon>
              <ListItemText primary="Simulationen" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton
              selected={currentSection === 'assets'}
              onClick={() => handleSectionClick('assets')}
            >
              <ListItemIcon>
                <AssetIcon />
              </ListItemIcon>
              <ListItemText primary="Asset-Bibliothek" />
            </ListItemButton>
          </ListItem>
        </List>
        <Divider />
        <Typography sx={{ p: 2, fontWeight: 'bold' }}>Digital Twins</Typography>
        <List>
          {digitalTwins.map((twin) => (
            <DigitalTwinListItem
              key={twin.id}
              twin={twin}
              selected={selectedTwinId === twin.id}
              onClick={() => selectDigitalTwin(twin.id)}
            />
          ))}
        </List>
      </Box>
    </Drawer>
  );
};

interface DigitalTwinListItemProps {
  twin: DigitalTwin;
  selected: boolean;
  onClick: () => void;
}

// Eintrag für einen Digital Twin in der Seitenleiste
const DigitalTwinListItem: FC<DigitalTwinListItemProps> = ({ twin, selected, onClick }) => {
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(menuAnchorEl);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  return (
    <ListItem
      disablePadding
      secondaryAction={
        <IconButton edge="end" aria-label="more" onClick={handleMenuClick}>
          <MoreVertIcon />
        </IconButton>
      }
    >
      <ListItemButton selected={selected} onClick={onClick}>
        <ListItemIcon>
          {twin.type === 'INDUSTRIAL' && <DashboardIcon />}
          {twin.type === 'BUILDING' && <DashboardIcon />}
          {twin.type === 'PRODUCT' && <DashboardIcon />}
          {twin.type === 'CUSTOM' && <DashboardIcon />}
        </ListItemIcon>
        <ListItemText primary={twin.name} secondary={twin.description} />
      </ListItemButton>
      <Menu
        anchorEl={menuAnchorEl}
        open={menuOpen}
        onClose={handleMenuClose}
        MenuListProps={{
          'aria-labelledby': 'twin-menu-button',
        }}
      >
        <MenuItem onClick={handleMenuClose}>Bearbeiten</MenuItem>
        <MenuItem onClick={handleMenuClose}>Duplizieren</MenuItem>
        <MenuItem onClick={handleMenuClose}>Löschen</MenuItem>
      </Menu>
    </ListItem>
  );
};

// Container für den Hauptinhalt
const MainContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  flexGrow: 1,
  padding: theme.spacing(3),
}));

export { MainContainer };
