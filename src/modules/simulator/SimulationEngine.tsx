import { useState, useEffect, useCallback } from 'react';
import {
  type Simulation,
  SimulationStatus,
  SimulationType,
  type DigitalTwin,
  type DigitalTwinComponent
} from '../../types/digitalTwin';

interface SimulationEngineProps {
  simulation: Simulation;
  digitalTwin: DigitalTwin;
  onUpdate?: (updatedTwin: DigitalTwin) => void;
  onStatusChange?: (status: SimulationStatus) => void;
  onCompleted?: (results: any) => void;
  onError?: (error: Error) => void;
}

/**
 * Simulationsengine-Komponente, die verschiedene Simulationen auf einem Digital Twin ausführt
 */
export const SimulationEngine: React.FC<SimulationEngineProps> = ({
  simulation,
  digitalTwin,
  onUpdate,
  onStatusChange,
  onCompleted,
  onError,
}) => {
  const [status, setStatus] = useState<SimulationStatus>(simulation.status || SimulationStatus.IDLE);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [simulationTwin, setSimulationTwin] = useState<DigitalTwin>({...digitalTwin});
  
  // Status-Änderung melden
  useEffect(() => {
    if (status !== simulation.status) {
      onStatusChange?.(status);
    }
  }, [status, simulation.status, onStatusChange]);
  
  // Simulation starten
  const startSimulation = useCallback(() => {
    setStatus(SimulationStatus.RUNNING);
    setElapsedTime(0);
  }, []);
  
  // Simulation pausieren
  const pauseSimulation = useCallback(() => {
    setStatus(SimulationStatus.PAUSED);
  }, []);
  
  // Simulation fortsetzen
  const resumeSimulation = useCallback(() => {
    setStatus(SimulationStatus.RUNNING);
  }, []);
  
  // Simulation stoppen
  const stopSimulation = useCallback(() => {
    setStatus(SimulationStatus.IDLE);
    setElapsedTime(0);
  }, []);
  
  // Simulationslogik für verschiedene Simulationstypen
  const runSimulationStep = useCallback((twin: DigitalTwin, deltaTime: number) => {
    try {
      let updatedTwin = {...twin};
      
      // Hole die Zielkomponenten für die Simulation
      const targetComponents = simulation.target.componentIds
        ? updatedTwin.components.filter(c => 
            simulation.target.componentIds!.includes(c.id)
          )
        : updatedTwin.components;
      
      // Führe Simulation basierend auf dem Typ aus
      switch (simulation.type) {
        case SimulationType.BEHAVIOR:
          // Verhaltens-Simulation
          updatedTwin = simulateBehavior(updatedTwin, targetComponents, deltaTime, simulation.parameters);
          break;
          
        case SimulationType.PHYSICAL:
          // Physikalische Simulation
          updatedTwin = simulatePhysical(updatedTwin, targetComponents, deltaTime, simulation.parameters);
          break;
          
        case SimulationType.THERMAL:
          // Thermische Simulation
          updatedTwin = simulateThermal(updatedTwin, targetComponents, deltaTime, simulation.parameters);
          break;
          
        case SimulationType.FAILURE:
          // Ausfall-Simulation
          updatedTwin = simulateFailure(updatedTwin, targetComponents, deltaTime, simulation.parameters);
          break;
          
        case SimulationType.CUSTOM:
          // Benutzerdefinierte Simulation
          updatedTwin = simulateCustom(updatedTwin, targetComponents, deltaTime, simulation.parameters);
          break;
          
        default:
          console.warn(`Unsupported simulation type: ${simulation.type}`);
      }
      
      return updatedTwin;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown simulation error');
      onError?.(error);
      setStatus(SimulationStatus.ERROR);
      return twin;
    }
  }, [simulation, onError]);
  
  // Main simulation loop
  useEffect(() => {
    if (status !== SimulationStatus.RUNNING) {
      return;
    }
    
    let lastTime = Date.now();
    let animationFrameId: number;
    
    const simulationLoop = () => {
      const currentTime = Date.now();
      const deltaTime = (currentTime - lastTime) / 1000; // in Sekunden
      lastTime = currentTime;
      
      // Simulation ausführen
      const updatedTwin = runSimulationStep(simulationTwin, deltaTime);
      setSimulationTwin(updatedTwin);
      onUpdate?.(updatedTwin);
      
      // Zeit aktualisieren
      const newElapsedTime = elapsedTime + deltaTime * 1000;
      setElapsedTime(newElapsedTime);
      
      // Prüfen, ob die Simulation abgeschlossen ist
      if (simulation.duration && newElapsedTime >= simulation.duration) {
        setStatus(SimulationStatus.COMPLETED);
        onCompleted?.(updatedTwin);
        return;
      }
      
      // Nächsten Frame planen
      animationFrameId = requestAnimationFrame(simulationLoop);
    };
    
    simulationLoop();
    
    // Cleanup
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [
    status, 
    simulationTwin, 
    elapsedTime, 
    runSimulationStep, 
    simulation.duration,
    onUpdate,
    onCompleted
  ]);
  
  return (
    <div className="simulation-engine">
      <div className="simulation-controls">
        <button onClick={startSimulation} disabled={status === SimulationStatus.RUNNING}>
          Start
        </button>
        <button onClick={pauseSimulation} disabled={status !== SimulationStatus.RUNNING}>
          Pause
        </button>
        <button onClick={resumeSimulation} disabled={status !== SimulationStatus.PAUSED}>
          Resume
        </button>
        <button onClick={stopSimulation} disabled={status === SimulationStatus.IDLE}>
          Stop
        </button>
      </div>
      <div className="simulation-info">
        <div>Status: {status}</div>
        <div>Elapsed Time: {Math.round(elapsedTime / 1000)}s</div>
        <div>Simulation Type: {simulation.type}</div>
      </div>
    </div>
  );
};

// Implementierungen der verschiedenen Simulationstypen

function simulateBehavior(
  twin: DigitalTwin, 
  components: DigitalTwinComponent[], 
  deltaTime: number, 
  parameters: Record<string, any>
): DigitalTwin {
  // Bewegungsmuster oder Verhaltensweisen (z.B. Rotation, zyklische Bewegung)
  const rotationSpeed = parameters.rotationSpeed || 0.1;
  const movementAmplitude = parameters.movementAmplitude || 0.1;
  const movementFrequency = parameters.movementFrequency || 1;
  
  // Aktualisierte Komponenten
  const updatedComponents = components.map(component => {
    // Erzeuge eine einfache rotierende oder schwebende Bewegung
    const updatedComponent = {...component};
    
    if (component.position) {
      updatedComponent.position = {
        x: component.position.x,
        y: component.position.y + Math.sin(Date.now() * 0.001 * movementFrequency) * movementAmplitude * deltaTime,
        z: component.position.z
      };
    }
    
    if (component.rotation) {
      updatedComponent.rotation = {
        x: component.rotation.x,
        y: component.rotation.y + rotationSpeed * deltaTime,
        z: component.rotation.z
      };
    }
    
    // Aktualisiere ggf. weitere Eigenschaften
    if (updatedComponent.properties.behavior) {
      updatedComponent.properties.lastUpdated = new Date().toISOString();
    }
    
    return updatedComponent;
  });
  
  // Komponenten im Twin aktualisieren
  return {
    ...twin,
    components: twin.components.map(c => {
      const updatedComponent = updatedComponents.find(uc => uc.id === c.id);
      return updatedComponent || c;
    })
  };
}

function simulatePhysical(
  twin: DigitalTwin, 
  components: DigitalTwinComponent[], 
  deltaTime: number, 
  parameters: Record<string, any>
): DigitalTwin {
  // Physikalische Simulation (z.B. Schwerkraft, Kollision)
  const gravity = parameters.gravity || 9.81;
  const friction = parameters.friction || 0.1;
  const elasticity = parameters.elasticity || 0.5;
  
  // Aktualisierte Komponenten
  const updatedComponents = components.map(component => {
    const updatedComponent = {...component};
    
    // Vermeide Berechnungen, wenn keine Position vorhanden ist
    if (!component.properties.velocity || !component.position) {
      return updatedComponent;
    }
    
    // Hole die aktuelle Geschwindigkeit oder initialisiere sie
    const velocity = component.properties.velocity || { x: 0, y: 0, z: 0 };
    
    // Anwenden der Schwerkraft
    velocity.y -= gravity * deltaTime;
    
    // Anwenden der Reibung
    velocity.x *= (1 - friction * deltaTime);
    velocity.y *= (1 - friction * deltaTime);
    velocity.z *= (1 - friction * deltaTime);
    
    // Bewegung anwenden
    updatedComponent.position = {
      x: component.position.x + velocity.x * deltaTime,
      y: component.position.y + velocity.y * deltaTime,
      z: component.position.z + velocity.z * deltaTime
    };
    
    // Einfacher Boden-Kollisionscheck
    if (updatedComponent.position.y < 0) {
      updatedComponent.position.y = 0;
      velocity.y = -velocity.y * elasticity;
    }
    
    // Speichere die aktualisierte Geschwindigkeit
    updatedComponent.properties = {
      ...updatedComponent.properties,
      velocity,
      lastUpdated: new Date().toISOString()
    };
    
    return updatedComponent;
  });
  
  // Komponenten im Twin aktualisieren
  return {
    ...twin,
    components: twin.components.map(c => {
      const updatedComponent = updatedComponents.find(uc => uc.id === c.id);
      return updatedComponent || c;
    })
  };
}

function simulateThermal(
  twin: DigitalTwin, 
  components: DigitalTwinComponent[], 
  deltaTime: number, 
  parameters: Record<string, any>
): DigitalTwin {
  // Thermische Simulation (z.B. Temperaturverteilung)
  const ambientTemperature = parameters.ambientTemperature || 22; // °C
  const heatGenerationRate = parameters.heatGenerationRate || 0.5; // °C pro Sekunde
  const coolingRate = parameters.coolingRate || 0.1; // Faktor pro Sekunde
  
  // Aktualisierte Komponenten
  const updatedComponents = components.map(component => {
    const updatedComponent = {...component};
    
    // Initialisiere Temperatur, falls nicht vorhanden
    let temperature = component.properties.temperature || ambientTemperature;
    
    // Berechne Wärmeerzeugung basierend auf Aktivitätsniveau
    const activity = component.properties.activityLevel || 0; // 0 bis 1
    const heatGenerated = activity * heatGenerationRate * deltaTime;
    
    // Berechne Abkühlung basierend auf Temperaturdifferenz zur Umgebung
    const cooling = (temperature - ambientTemperature) * coolingRate * deltaTime;
    
    // Aktualisiere Temperatur
    temperature = temperature + heatGenerated - cooling;
    
    // Speichere die aktualisierte Temperatur
    updatedComponent.properties = {
      ...updatedComponent.properties,
      temperature,
      lastUpdated: new Date().toISOString()
    };
    
    return updatedComponent;
  });
  
  // Komponenten im Twin aktualisieren
  return {
    ...twin,
    components: twin.components.map(c => {
      const updatedComponent = updatedComponents.find(uc => uc.id === c.id);
      return updatedComponent || c;
    })
  };
}

function simulateFailure(
  twin: DigitalTwin, 
  components: DigitalTwinComponent[], 
  deltaTime: number, 
  parameters: Record<string, any>
): DigitalTwin {
  // Ausfallsimulation (z.B. progressive Verschlechterung, plötzlicher Ausfall)
  const failureRate = parameters.failureRate || 0.01; // Wahrscheinlichkeit pro Sekunde
  const wearRate = parameters.wearRate || 0.005; // Abnutzung pro Sekunde
  
  // Aktualisierte Komponenten
  const updatedComponents = components.map(component => {
    const updatedComponent = {...component};
    
    // Initialisiere Gesundheitszustand, falls nicht vorhanden
    let health = component.properties.health ?? 100; // 0 bis 100
    
    // Berechne normale Abnutzung
    health -= wearRate * deltaTime;
    
    // Prüfe auf zufälligen Ausfall
    if (Math.random() < failureRate * deltaTime) {
      health -= Math.random() * 10; // Plötzlicher Gesundheitsverlust
    }
    
    // Begrenze den Gesundheitszustand auf 0-100
    health = Math.max(0, Math.min(100, health));
    
    // Aktualisiere den Status basierend auf dem Gesundheitszustand
    let status = 'OK';
    if (health < 20) {
      status = 'CRITICAL';
    } else if (health < 50) {
      status = 'WARNING';
    } else if (health < 80) {
      status = 'DEGRADED';
    }
    
    // Speichere die aktualisierten Werte
    updatedComponent.properties = {
      ...updatedComponent.properties,
      health,
      status,
      lastUpdated: new Date().toISOString()
    };
    
    return updatedComponent;
  });
  
  // Komponenten im Twin aktualisieren
  return {
    ...twin,
    components: twin.components.map(c => {
      const updatedComponent = updatedComponents.find(uc => uc.id === c.id);
      return updatedComponent || c;
    })
  };
}

function simulateCustom(
  twin: DigitalTwin, 
  components: DigitalTwinComponent[], 
  deltaTime: number, 
  parameters: Record<string, any>
): DigitalTwin {
  // Benutzerdefinierte Simulation
  // Hier kann beliebige Logik implementiert werden
  
  try {
    // Führe benutzerdefinierten Code aus, falls vorhanden
    if (parameters.customLogic && typeof parameters.customLogic === 'string') {
      // ACHTUNG: Ausführen von dynamischem Code kann Sicherheitsrisiken bergen
      // In einer Produktionsanwendung sollte dies mit Vorsicht implementiert werden
      const simulationFunction = new Function(
        'twin', 'components', 'deltaTime', 'params',
        parameters.customLogic
      );
      
      return simulationFunction(twin, components, deltaTime, parameters);
    }
    
    // Fallback, wenn keine benutzerdefinierte Logik vorhanden ist
    return {
      ...twin,
      components: twin.components
    };
  } catch (error) {
    console.error('Error in custom simulation:', error);
    // Bei Fehler, gib den ursprünglichen Twin zurück
    return twin;
  }
}

export default SimulationEngine;
