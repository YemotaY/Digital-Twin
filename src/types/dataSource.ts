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
