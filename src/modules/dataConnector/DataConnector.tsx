import { useState, useEffect, useCallback, useRef } from 'react';
import axios, { type AxiosRequestConfig } from 'axios';
import { io, type Socket } from 'socket.io-client';
import { type DataSource, DataSourceType } from '../../types/dataSource';

interface UseDataConnectorOptions {
  pollingInterval?: number;
  onError?: (error: Error) => void;
  onDataReceived?: (data: any) => void;
  transform?: (data: any) => any;
}

/**
 * Hook zum Verbinden mit verschiedenen Datenquellen
 */
export const useDataConnector = (
  dataSource: DataSource,
  options: UseDataConnectorOptions = {}
) => {
  const {
    pollingInterval = 5000,
    onError,
    onDataReceived,
    transform = (data) => data,
  } = options;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
    // Refs to avoid unnecessary re-renders
  const intervalRef = useRef<number | undefined>(undefined);
  const lastUpdateRef = useRef<number>(0);
  const dataSourceRef = useRef<DataSource>(dataSource);
  
  // Update dataSource ref when it changes
  useEffect(() => {
    dataSourceRef.current = dataSource;
  }, [dataSource]);

  // Memoize the transform function to prevent unnecessary re-renders
  const memoizedTransform = useCallback(
    (inputData: any) => transform(inputData),
    [transform]
  );
  // Funktion zum Abrufen von API-Daten
  const fetchApiData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const config: AxiosRequestConfig = {
        headers: {},
      };
        // Füge Authentifizierungsdaten hinzu, wenn vorhanden
      if (dataSourceRef.current.credentials && config.headers) {
        if (dataSourceRef.current.credentials.apiKey) {
          config.headers['X-API-Key'] = dataSourceRef.current.credentials.apiKey;
        }
        
        if (dataSourceRef.current.credentials.token) {
          config.headers['Authorization'] = `Bearer ${dataSourceRef.current.credentials.token}`;
        }
        
        if (dataSourceRef.current.credentials.username) {
          // Basic Auth mithilfe von Base64
          const base64Credentials = btoa(`${dataSourceRef.current.credentials.username}:${dataSourceRef.current.credentials.token || ''}`);
          config.headers['Authorization'] = `Basic ${base64Credentials}`;
        }
      }
      
      const response = await axios.get(dataSourceRef.current.endpoint, config);
      const transformedData = memoizedTransform(response.data);
      
      setData(transformedData);
      onDataReceived?.(transformedData);
      
      return transformedData;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      setError(error);
      onError?.(error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [memoizedTransform, onDataReceived, onError]);
  // Funktion zum Verbinden mit WebSocket
  const connectWebSocket = useCallback(() => {
    try {
      setLoading(true);
      setError(null);
      
      const socketOptions: any = {};
      
      // Füge Authentifizierungsdaten hinzu, wenn vorhanden
      if (dataSourceRef.current.credentials) {
        socketOptions.auth = dataSourceRef.current.credentials;
      }
      
      const newSocket = io(dataSourceRef.current.endpoint, socketOptions);
      
      newSocket.on('connect', () => {
        console.log(`Connected to WebSocket at ${dataSourceRef.current.endpoint}`);
        setLoading(false);
      });
      
      newSocket.on('data', (receivedData) => {
        const transformedData = memoizedTransform(receivedData);
        setData(transformedData);
        onDataReceived?.(transformedData);
      });
      
      newSocket.on('error', (err) => {
        const error = new Error(err.message || 'WebSocket error occurred');
        setError(error);
        onError?.(error);
      });
      
      newSocket.on('disconnect', () => {
        console.log(`Disconnected from WebSocket at ${dataSourceRef.current.endpoint}`);
      });
      
      setSocket(newSocket);
      
      return () => {
        newSocket.disconnect();
      };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      setError(error);
      onError?.(error);
      setLoading(false);
      return () => {};
    }
  }, [memoizedTransform, onDataReceived, onError]);
  // Funktion zum Generieren von Mock-Daten
  const generateMockData = useCallback(() => {
    try {
      // Throttle updates to prevent excessive re-renders
      const now = Date.now();
      if (now - lastUpdateRef.current < 1000) { // Minimum 1 second between updates
        return () => {};
      }
      lastUpdateRef.current = now;
      
      setLoading(true);
      setError(null);
      
      // Simulierte Verzögerung
      setTimeout(() => {
        const mockData = {
          timestamp: new Date().toISOString(),
          values: {
            temperature: Math.round((Math.random() * 100) * 10) / 10, // Round to 1 decimal
            humidity: Math.round((Math.random() * 100) * 10) / 10,
            pressure: Math.round((900 + Math.random() * 200) * 10) / 10,
            status: Math.random() > 0.8 ? 'WARNING' : 'OK',
          },
          metadata: {
            source: 'mock-generator',
            dataSourceId: dataSourceRef.current.id,
          },
        };
        
        const transformedData = memoizedTransform(mockData);
        setData(transformedData);
        onDataReceived?.(transformedData);
        setLoading(false);
      }, 100); // Reduced delay
      
      return () => {};
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      setError(error);
      onError?.(error);
      setLoading(false);
      return () => {};
    }
  }, [memoizedTransform, onDataReceived, onError]);    // Verbindung zur Datenquelle herstellen basierend auf dem Typ
  useEffect(() => {
    let cleanup = () => {};
    
    switch (dataSource.type) {
      case DataSourceType.API:
        // Starte Polling
        fetchApiData();
        intervalRef.current = setInterval(fetchApiData, 
          dataSource.updateInterval || pollingInterval);
        cleanup = () => {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = undefined;
          }
        };
        break;
        
      case DataSourceType.WEBSOCKET:
        // Verbinde mit WebSocket
        cleanup = connectWebSocket();
        break;
        
      case DataSourceType.MQTT:
        // MQTT-Implementierung hier einfügen (erfordert zusätzliche Bibliothek)
        setError(new Error('MQTT connection not implemented yet'));
        break;
        
      case DataSourceType.DATABASE:
        // Datenbankverbindung hier implementieren
        setError(new Error('Database connection not implemented yet'));
        break;
        
      case DataSourceType.FILE:
        // Dateiverbindung hier implementieren
        setError(new Error('File connection not implemented yet'));
        break;
        
      case DataSourceType.MOCK:
        // Generiere regelmäßig Mock-Daten mit reduzierter Frequenz
        generateMockData();
        intervalRef.current = setInterval(generateMockData, 
          Math.max(dataSource.updateInterval || pollingInterval, 3000)); // Minimum 3 seconds
        cleanup = () => {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = undefined;
          }
        };
        break;
        
      default:
        setError(new Error(`Unsupported data source type: ${dataSource.type}`));
    }
    
    // Cleanup bei Unmount oder bei Änderung der Datenquelle
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = undefined;
      }
      if (socket) {
        socket.disconnect();
      }
      cleanup();
    };
  }, [
    dataSource.type,
    dataSource.updateInterval,
    pollingInterval, 
    fetchApiData,
    connectWebSocket, 
    generateMockData,
  ]);

  return {
    data,
    loading,
    error,
    refetch: fetchApiData,
  };
};

export interface DataConnectorProps<T = any> {
  dataSource: DataSource;
  children: (props: {
    data: T | null;
    loading: boolean;
    error: Error | null;
    refetch: () => Promise<T | null>;
  }) => React.ReactNode;
  pollingInterval?: number;
  onError?: (error: Error) => void;
  transform?: (data: any) => T;
}

/**
 * Komponente zum Verbinden mit Datenquellen
 */
export function DataConnector<T = any>({
  dataSource,
  children,
  pollingInterval,
  onError,
  transform,
}: DataConnectorProps<T>) {
  const { data, loading, error, refetch } = useDataConnector(dataSource, {
    pollingInterval,
    onError,
    transform,
  });

  return <>{children({ data, loading, error, refetch })}</>;
}

export default DataConnector;
