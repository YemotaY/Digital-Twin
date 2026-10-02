import { useState, useEffect } from 'react';
import { type Asset, AssetType } from '../../types/digitalTwin';

// Beispiel-Assets für die initiale Bibliothek
const defaultAssets: Asset[] = [
  {
    id: 'asset-1',
    name: 'Industrial Robot',
    type: AssetType.MODEL,
    path: '/models/industrial-robot.glb',
    thumbnail: '/thumbnails/industrial-robot.jpg',
    tags: ['robot', 'industrial', 'arm'],
    properties: {
      polygons: 12500,
      author: 'DigitalTwin Team',
      version: '1.0',
      description: 'Industrial robotic arm with 6 degrees of freedom'
    }
  },
  {
    id: 'asset-2',
    name: 'Factory Building',
    type: AssetType.MODEL,
    path: '/models/factory-building.glb',
    thumbnail: '/thumbnails/factory-building.jpg',
    tags: ['building', 'factory', 'industrial'],
    properties: {
      polygons: 45000,
      author: 'DigitalTwin Team',
      version: '1.0',
      description: 'Complete factory building with interior details'
    }
  },
  {
    id: 'asset-3',
    name: 'Conveyor Belt',
    type: AssetType.MODEL,
    path: '/models/conveyor-belt.glb',
    thumbnail: '/thumbnails/conveyor-belt.jpg',
    tags: ['conveyor', 'industrial', 'transport'],
    properties: {
      polygons: 8500,
      author: 'DigitalTwin Team',
      version: '1.0',
      description: 'Animated conveyor belt for industrial scenes'
    }
  },
  {
    id: 'asset-4',
    name: 'Metal Material',
    type: AssetType.MATERIAL,
    path: '/materials/metal.json',
    thumbnail: '/thumbnails/metal-material.jpg',
    tags: ['material', 'metal', 'pbr'],
    properties: {
      author: 'DigitalTwin Team',
      version: '1.0',
      description: 'PBR metal material with various options'
    }
  },
  {
    id: 'asset-5',
    name: 'Concrete Material',
    type: AssetType.MATERIAL,
    path: '/materials/concrete.json',
    thumbnail: '/thumbnails/concrete-material.jpg',
    tags: ['material', 'concrete', 'pbr'],
    properties: {
      author: 'DigitalTwin Team',
      version: '1.0',
      description: 'PBR concrete material with normal and displacement maps'
    }
  },
  {
    id: 'asset-6',
    name: 'Factory Floor Texture',
    type: AssetType.TEXTURE,
    path: '/textures/factory-floor.jpg',
    thumbnail: '/thumbnails/factory-floor-texture.jpg',
    tags: ['texture', 'floor', 'industrial'],
    properties: {
      resolution: '2048x2048',
      author: 'DigitalTwin Team',
      version: '1.0',
      description: 'High resolution factory floor texture'
    }
  },
  {
    id: 'asset-7',
    name: 'Robot Animation Pack',
    type: AssetType.ANIMATION,
    path: '/animations/robot-animations.json',
    thumbnail: '/thumbnails/robot-animation.jpg',
    tags: ['animation', 'robot', 'industrial'],
    properties: {
      duration: 10,
      author: 'DigitalTwin Team',
      version: '1.0',
      description: 'Animation pack for industrial robots'
    }
  },
  {
    id: 'asset-8',
    name: 'Factory Environment',
    type: AssetType.ENVIRONMENT,
    path: '/environments/factory.hdr',
    thumbnail: '/thumbnails/factory-environment.jpg',
    tags: ['environment', 'hdri', 'industrial'],
    properties: {
      resolution: '4096x2048',
      author: 'DigitalTwin Team',
      version: '1.0',
      description: 'HDR environment map for factory scene lighting'
    }
  },
  {
    id: 'asset-9',
    name: 'Office Building',
    type: AssetType.MODEL,
    path: '/models/office-building.glb',
    thumbnail: '/thumbnails/office-building.jpg',
    tags: ['building', 'office', 'architecture'],
    properties: {
      polygons: 65000,
      author: 'DigitalTwin Team',
      version: '1.0',
      description: 'Modern office building with detailed interior'
    }
  },
  {
    id: 'asset-10',
    name: 'Sensor Pack',
    type: AssetType.MODEL,
    path: '/models/sensors.glb',
    thumbnail: '/thumbnails/sensors.jpg',
    tags: ['sensor', 'iot', 'device'],
    properties: {
      polygons: 5000,
      author: 'DigitalTwin Team',
      version: '1.0',
      description: 'Collection of various IoT sensors and devices'
    }
  }
];

interface AssetLibraryProps {
  initialAssets?: Asset[];
  onAssetSelect?: (asset: Asset) => void;
  onAssetUpload?: (asset: Asset) => void;
}

export const AssetLibrary: React.FC<AssetLibraryProps> = ({ 
  initialAssets = defaultAssets,
  onAssetSelect,
  onAssetUpload
}) => {
  const [assets, setAssets] = useState<Asset[]>(initialAssets);
  const [filteredAssets, setFilteredAssets] = useState<Asset[]>(initialAssets);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedType, setSelectedType] = useState<AssetType | 'ALL'>('ALL');
  
  // Filtern der Assets basierend auf Suchbegriff und ausgewähltem Typ
  useEffect(() => {
    let filtered = assets;
    
    // Filter nach Typ
    if (selectedType !== 'ALL') {
      filtered = filtered.filter(asset => asset.type === selectedType);
    }
    
    // Filter nach Suchbegriff
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(asset => (
        asset.name.toLowerCase().includes(term) ||
        asset.tags?.some(tag => tag.toLowerCase().includes(term)) ||
        asset.properties?.description?.toLowerCase().includes(term)
      ));
    }
    
    setFilteredAssets(filtered);
  }, [assets, searchTerm, selectedType]);
  
  // Asset hochladen
  const handleAssetUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    // In einer realen Anwendung würde hier die Datei zum Server hochgeladen werden
    // Hier erstellen wir einfach ein neues Asset-Objekt für die Demo
    const file = files[0];
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    let assetType: AssetType;
    
    // Bestimme den Asset-Typ basierend auf der Dateiendung
    switch (fileExtension) {
      case 'glb':
      case 'gltf':
      case 'obj':
      case 'fbx':
      case '3ds':
        assetType = AssetType.MODEL;
        break;
      case 'jpg':
      case 'png':
      case 'webp':
      case 'tga':
      case 'tif':
      case 'tiff':
        assetType = AssetType.TEXTURE;
        break;
      case 'json':
        assetType = AssetType.MATERIAL;
        break;
      case 'hdr':
      case 'exr':
        assetType = AssetType.ENVIRONMENT;
        break;
      default:
        assetType = AssetType.MODEL;
    }
    
    // Erstelle ein neues Asset
    const newAsset: Asset = {
      id: `asset-${Date.now()}`,
      name: file.name.replace(/\.[^/.]+$/, ""), // Entferne Dateiendung
      type: assetType,
      path: URL.createObjectURL(file), // Temporäre URL für die Vorschau
      tags: [],
      properties: {
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        uploadDate: new Date().toISOString(),
      }
    };
    
    // Füge das neue Asset hinzu
    setAssets(prevAssets => [...prevAssets, newAsset]);
    
    // Callback aufrufen, falls vorhanden
    onAssetUpload?.(newAsset);
  };
  
  return (
    <div className="asset-library">
      <div className="asset-library-header">
        <h2>Asset Bibliothek</h2>
        <div className="asset-library-controls">
          <input
            type="text"
            placeholder="Assets suchen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          
          <select 
            value={selectedType} 
            onChange={(e) => setSelectedType(e.target.value as AssetType | 'ALL')}
          >
            <option value="ALL">Alle Typen</option>
            {Object.values(AssetType).map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          
          <label className="upload-button">
            Asset hochladen
            <input 
              type="file" 
              accept=".glb,.gltf,.obj,.fbx,.3ds,.jpg,.png,.webp,.tga,.tiff,.json,.hdr,.exr" 
              onChange={handleAssetUpload} 
              style={{ display: 'none' }} 
            />
          </label>
        </div>
      </div>
      
      <div className="asset-grid">
        {filteredAssets.length === 0 ? (
          <div className="no-assets">Keine Assets gefunden.</div>
        ) : (
          filteredAssets.map(asset => (
            <AssetCard 
              key={asset.id} 
              asset={asset} 
              onClick={() => onAssetSelect && onAssetSelect(asset)} 
            />
          ))
        )}
      </div>
    </div>
  );
};

interface AssetCardProps {
  asset: Asset;
  onClick: () => void;
}

// Komponente für die Darstellung eines einzelnen Assets
const AssetCard: React.FC<AssetCardProps> = ({ asset, onClick }) => {
  return (
    <div className="asset-card" onClick={onClick}>
      <div className="asset-thumbnail">
        {asset.thumbnail ? (
          <img src={asset.thumbnail} alt={asset.name} />
        ) : (
          <div className="asset-icon">{getAssetTypeIcon(asset.type)}</div>
        )}
      </div>
      
      <div className="asset-info">
        <h3>{asset.name}</h3>
        <span className="asset-type">{asset.type}</span>
        
        {asset.tags && asset.tags.length > 0 && (
          <div className="asset-tags">
            {asset.tags.map(tag => (
              <span key={tag} className="asset-tag">{tag}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Hilfsfunktion für Asset-Typ-Icons
function getAssetTypeIcon(type: AssetType): string {
  switch (type) {
    case AssetType.MODEL:
      return '🧊'; // Würfel-Emoji für 3D-Modelle
    case AssetType.TEXTURE:
      return '🖼️'; // Bild-Emoji für Texturen
    case AssetType.MATERIAL:
      return '🎨'; // Farbpalette-Emoji für Materialien
    case AssetType.ANIMATION:
      return '🎬'; // Film-Klappe-Emoji für Animationen
    case AssetType.ENVIRONMENT:
      return '🌐'; // Globus-Emoji für Umgebungen
    default:
      return '📁'; // Ordner-Emoji für unbekannte Typen
  }
}

export default AssetLibrary;
