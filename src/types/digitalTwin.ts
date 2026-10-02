/**
 * Grundlegende Typdefinitionen für das Digital Twin Baukasten System
 */

/**
 * Grundlegende Eigenschaften eines Digital Twins
 */
export interface DigitalTwin {
  id: string;
  name: string;
  description?: string;
  modelPath?: string;
  type: DigitalTwinType;
  properties: Record<string, any>;
  components: DigitalTwinComponent[];
  position?: Vector3;
  rotation?: Vector3;
  scale?: Vector3;
}

/**
 * Verschiedene Arten von Digital Twins
 */
export const DigitalTwinType = {
  INDUSTRIAL: 'INDUSTRIAL',
  BUILDING: 'BUILDING',
  PRODUCT: 'PRODUCT',
  CUSTOM: 'CUSTOM',
} as const;

export type DigitalTwinType = typeof DigitalTwinType[keyof typeof DigitalTwinType];

/**
 * Eine Komponente eines Digital Twins
 */
export interface DigitalTwinComponent {
  id: string;
  name: string;
  type: ComponentType;
  properties: Record<string, any>;
  position?: Vector3;
  rotation?: Vector3;
  scale?: Vector3;
}

/**
 * Verschiedene Arten von Komponenten
 */
export const ComponentType = {
  SENSOR: 'SENSOR',
  ACTUATOR: 'ACTUATOR',
  STATIC: 'STATIC',
  DYNAMIC: 'DYNAMIC',
} as const;

export type ComponentType = typeof ComponentType[keyof typeof ComponentType];

/**
 * 3D-Vektordarstellung
 */
export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

/**
 * Arten von Datenquellen
 */
export const DataSourceType = {
  API: 'API',
  WEBSOCKET: 'WEBSOCKET',
  MQTT: 'MQTT',
  DATABASE: 'DATABASE',
  FILE: 'FILE',
  MOCK: 'MOCK',
} as const;

export type DataSourceType = typeof DataSourceType[keyof typeof DataSourceType];

/**
 * Datenquelle für einen Digital Twin
 */
export interface DataSource {
  id: string;
  name: string;
  type: DataSourceType;
  endpoint: string;
  updateInterval?: number;
  credentials?: {
    username?: string;
    apiKey?: string;
    token?: string;
  };
}

/**
 * Simulation für einen Digital Twin
 */
export interface Simulation {
  id: string;
  name: string;
  type: SimulationType;
  parameters: Record<string, any>;
  target: {
    twinId: string;
    componentIds?: string[];
  };
  duration?: number; // in Millisekunden
  status: SimulationStatus;
}

/**
 * Arten von Simulationen
 */
export const SimulationType = {
  BEHAVIOR: 'BEHAVIOR',
  PHYSICAL: 'PHYSICAL',
  THERMAL: 'THERMAL',
  FAILURE: 'FAILURE',
  CUSTOM: 'CUSTOM',
} as const;

export type SimulationType = typeof SimulationType[keyof typeof SimulationType];

/**
 * Status einer Simulation
 */
export const SimulationStatus = {
  IDLE: 'IDLE',
  RUNNING: 'RUNNING',
  PAUSED: 'PAUSED',
  COMPLETED: 'COMPLETED',
  ERROR: 'ERROR',
} as const;

export type SimulationStatus = typeof SimulationStatus[keyof typeof SimulationStatus];

/**
 * Ein 3D-Asset
 */
export interface Asset {
  id: string;
  name: string;
  type: AssetType;
  path: string;
  thumbnail?: string;
  tags?: string[];
  properties?: Record<string, any>;
}

/**
 * Arten von Assets
 */
export const AssetType = {
  MODEL: 'MODEL',
  TEXTURE: 'TEXTURE',
  MATERIAL: 'MATERIAL',
  ANIMATION: 'ANIMATION',
  ENVIRONMENT: 'ENVIRONMENT',
} as const;

export type AssetType = typeof AssetType[keyof typeof AssetType];
