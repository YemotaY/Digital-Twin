import { useState } from 'react';
import { CssBaseline, Box, Toolbar } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import './App.css';

import { DigitalTwinProvider } from './context/DigitalTwinContext';
import { Navbar, Sidebar, MainContainer } from './components/Layout';
import Dashboard from './components/Dashboard';

// Erstelle ein Dark/Light Theme
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

function App() {
  const [drawerOpen, setDrawerOpen] = useState(true);

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  return (
    <ThemeProvider theme={theme}>
      <DigitalTwinProvider>
        <Box sx={{ display: 'flex' }}>
          <CssBaseline />
          <Navbar onMenuToggle={handleDrawerToggle} open={drawerOpen} />
          <Sidebar open={drawerOpen} onClose={handleDrawerToggle} />
          
          <MainContainer sx={{ 
            marginLeft: drawerOpen ? `${280}px` : 0,
            width: drawerOpen ? `calc(100% - ${280}px)` : '100%',
            transition: theme => theme.transitions.create(['width', 'margin'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
          }}>
            <Toolbar />
            <Dashboard />
          </MainContainer>
        </Box>
      </DigitalTwinProvider>
    </ThemeProvider>
  )
}

export default App
