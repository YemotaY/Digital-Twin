import { type FC, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, useGLTF, PerspectiveCamera, Grid } from '@react-three/drei';
import * as THREE from 'three';
import { type DigitalTwin, type DigitalTwinComponent } from '../../types/digitalTwin';

interface VisualizerProps {
  digitalTwin?: DigitalTwin;
  onSelectComponent?: (component: DigitalTwinComponent) => void;
}

export const Visualizer: FC<VisualizerProps> = ({ digitalTwin, onSelectComponent }) => {
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[10, 10, 10]} />
        <ambientLight intensity={0.5} />
        <directionalLight
          intensity={1}
          position={[10, 10, 10]}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <Grid infiniteGrid fadeDistance={50} />
        <OrbitControls />
        <Environment preset="warehouse" />
        <Scene digitalTwin={digitalTwin} onSelectComponent={onSelectComponent} />
      </Canvas>
    </div>
  );
};

interface SceneProps {
  digitalTwin?: DigitalTwin;
  onSelectComponent?: (component: DigitalTwinComponent) => void;
}

// Die eigentliche 3D-Szene
const Scene: FC<SceneProps> = ({ digitalTwin, onSelectComponent }) => {
  if (!digitalTwin) {
    return <DefaultScene />;
  }

  return (
    <group>
      <ModelLoader 
        modelPath={digitalTwin.modelPath || '/models/default.glb'} 
        position={digitalTwin.position ? 
          new THREE.Vector3(digitalTwin.position.x, digitalTwin.position.y, digitalTwin.position.z) : 
          new THREE.Vector3(0, 0, 0)
        }
        rotation={digitalTwin.rotation ? 
          new THREE.Euler(digitalTwin.rotation.x, digitalTwin.rotation.y, digitalTwin.rotation.z) : 
          new THREE.Euler(0, 0, 0)
        }
        scale={digitalTwin.scale ? 
          new THREE.Vector3(digitalTwin.scale.x, digitalTwin.scale.y, digitalTwin.scale.z) : 
          new THREE.Vector3(1, 1, 1)
        }
      />
      {digitalTwin.components.map(component => (
        <ComponentVisualizer 
          key={component.id} 
          component={component} 
          onSelect={() => onSelectComponent && onSelectComponent(component)} 
        />
      ))}
    </group>
  );
};

// Standard-Szene, wenn kein Digital Twin geladen ist
const DefaultScene: FC = () => {
  return (
    <group>
      <SpinningBox position={[0, 1, 0]} />
      <mesh position={[0, 0, 0]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#c9c9c9" />
      </mesh>
    </group>
  );
};

interface SpinningBoxProps {
  position: [number, number, number];
}

// Eine einfache rotierende Box als Beispielobjekt
const SpinningBox: FC<SpinningBoxProps> = ({ position }) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  
  useFrame(({ clock }) => {
    meshRef.current.rotation.x = Math.sin(clock.getElapsedTime()) / 2;
    meshRef.current.rotation.y = Math.sin(clock.getElapsedTime()) / 2;
  });
  
  return (
    <mesh ref={meshRef} position={position} castShadow>
      <boxGeometry args={[2, 2, 2]} />
      <meshStandardMaterial color="blue" metalness={0.1} roughness={0.5} />
    </mesh>
  );
};

interface ModelLoaderProps {
  modelPath: string;
  position: THREE.Vector3;
  rotation: THREE.Euler;
  scale: THREE.Vector3;
}

// Komponente zum Laden von 3D-Modellen
const ModelLoader: FC<ModelLoaderProps> = ({ modelPath, position, rotation, scale }) => {
  // Fallback für den Fall, dass das Modell nicht geladen werden kann
  const [error, setError] = useState(false);
  
  try {
    // Versuche, das Modell zu laden
    if (!error) {
      const { scene } = useGLTF(modelPath);
      return (
        <primitive 
          object={scene.clone()} 
          position={position} 
          rotation={rotation} 
          scale={scale}
          onError={() => setError(true)}
        />
      );
    }
  } catch (e) {
    // Fehler beim Laden des Modells
    console.error("Error loading model:", e);
    setError(true);
  }
  
  // Fallback-Box bei Fehler
  return (
    <mesh position={position} rotation={rotation} scale={scale} castShadow>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="red" />
    </mesh>
  );
};

interface ComponentVisualizerProps {
  component: DigitalTwinComponent;
  onSelect: () => void;
}

// Visualisierung einer Komponente des Digital Twins
const ComponentVisualizer: FC<ComponentVisualizerProps> = ({ component, onSelect }) => {
  const [hovered, setHovered] = useState(false);
  
  // Bestimme die Farbe basierend auf dem Komponententyp
  let color;
  switch (component.type) {
    case 'SENSOR':
      color = '#ffaa00';
      break;
    case 'ACTUATOR':
      color = '#00aaff';
      break;
    case 'STATIC':
      color = '#999999';
      break;
    case 'DYNAMIC':
      color = '#ff00aa';
      break;
    default:
      color = '#ffffff';
  }
  
  const position = component.position ? 
    new THREE.Vector3(component.position.x, component.position.y, component.position.z) : 
    new THREE.Vector3(0, 0, 0);
    
  const rotation = component.rotation ? 
    new THREE.Euler(component.rotation.x, component.rotation.y, component.rotation.z) : 
    new THREE.Euler(0, 0, 0);
    
  const scale = component.scale ? 
    new THREE.Vector3(component.scale.x, component.scale.y, component.scale.z) : 
    new THREE.Vector3(1, 1, 1);
  
  return (
    <mesh
      position={position}
      rotation={rotation}
      scale={scale}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={onSelect}
      castShadow
    >
      <sphereGeometry args={[0.5, 16, 16]} />
      <meshStandardMaterial 
        color={hovered ? '#ffffff' : color} 
        emissive={hovered ? color : 'black'}
        emissiveIntensity={hovered ? 0.5 : 0}
      />
    </mesh>
  );
};

export default Visualizer;
