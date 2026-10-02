# Digital Twin Baukasten System

Ein modulares Toolkit zur Erstellung von digitalen Zwillingen mit 3D-Visualisierung, Datenanbindung und Simulationsfunktionen für industrielle Anwendungen.

## Funktionen

- **3D-Visualisierung**: Interaktive 3D-Darstellung von Objekten, Gebäuden und Systemen
- **Datenanbindung**: Flexible Anbindung an verschiedene Datenquellen (APIs, Datenbanken, IoT-Geräte)
- **Simulationsengine**: Simulieren von Prozessen und Zuständen in Echtzeit
- **Modularer Aufbau**: Erweiterbare Komponenten für verschiedene Anwendungsfälle
- **Asset-Bibliothek**: Sammlung vorgefertigter 3D-Modelle und Komponenten
- **Robotik-Integration**: Support für robotische Systeme wie Förderbänder, Roboterarme und automatisierte Anlagen
- **Physik-Simulation**: Realistische Physik für bewegliche Objekte und Materialfluss

## Technologien

- React mit TypeScript
- Three.js für 3D-Rendering
- React Three Fiber und React Three Drei für React-Integration
- Material-UI für responsive Benutzeroberfläche
- Axios für API-Kommunikation
- Socket.io für Echtzeit-Datenübertragung
- Cannon.js/React-Three-Cannon für Physik-Simulation (geplant)
- MQTT für IoT-Geräte-Kommunikation (geplant)

## Installation

```bash
# Abhängigkeiten installieren
npm install

# Entwicklungsserver starten
npm run dev

# Für Produktion bauen
npm run build
```

## Projektstruktur

```
src/
├── components/      # UI-Komponenten
├── modules/         # Modulare Digital-Twin-Komponenten
│   ├── visualizer/  # 3D-Visualisierungsmodul
│   ├── dataConnector/ # Datenanbindungsmodul
│   ├── simulator/   # Simulationsmodul
│   ├── assetLibrary/ # Bibliothek für 3D-Assets
│   ├── robotics/    # Robotik-Module (geplant)
│   │   ├── ConveyorBelt/ # Förderband-Komponenten
│   │   ├── RobotArm/     # Roboterarm-Steuerung
│   │   └── AGV/          # Automatische Fahrzeuge
│   └── physics/     # Physik-Engine Integration (geplant)
├── types/          # TypeScript-Typdefinitionen
├── utils/          # Hilfsfunktionen
├── context/        # React Context für globalen State
└── assets/         # Statische Assets
```

## Beispiele

Das System beinhaltet Beispiele für verschiedene Digital-Twin-Anwendungen:

1. **Industrieanlagen-Twin**: Visualisierung und Überwachung von Industrieanlagen
2. **Gebäude-Twin**: Digitaler Zwilling für Smart Buildings
3. **Produkt-Twin**: Digital Twin für Produktentwicklung und -überwachung
4. **Automatisierte Fertigung**: Digital Twin für Produktionslinien mit Förderbändern und Robotik
5. **Logistik-Twin**: Simulation von Lager- und Transportprozessen

## Robotik-Features (In Entwicklung)

### Förderband-System
- **3D-Visualisierung**: Realistische Darstellung von Förderbändern verschiedener Typen
- **Geschwindigkeitssteuerung**: Dynamische Anpassung der Bandgeschwindigkeit
- **Produktverfolgung**: Tracking von Objekten entlang des Förderbands
- **Sensoren**: Integration von virtuellen Sensoren (Lichtschranken, Gewicht, etc.)
- **Störungsimulation**: Simulation von Bandstillständen und Wartungsbedarfen

### Roboterarm-Integration
- **Kinematik-Simulation**: 6-DOF Roboterarm-Bewegungen
- **Pick-and-Place-Operationen**: Automatische Objektmanipulation
- **Kollisionserkennung**: Sicherheitszonen und Kollisionsvermeidung
- **Pfadplanung**: Optimierte Bewegungsbahnen
- **Kraftrückkopplung**: Simulation von Kräften und Momenten

### AGV (Automated Guided Vehicles)
- **Navigationssystem**: Virtuelle Wegfindung und Pfadverfolgung
- **Ladezustände**: Battery-Management und Ladezyklen
- **Flottenverwaltung**: Koordination mehrerer Fahrzeuge
- **Hinderniserkennung**: Dynamische Routenanpassung

## Noch zu implementieren

### Kurzfristig (1-2 Sprints)
- [ ] **MQTT-Datenanbindung**: Integration für IoT-Geräte und Sensoren
- [ ] **Physik-Engine**: Integration von Cannon.js für realistische Objektphysik
- [ ] **Robotics-Basismodul**: Grundlegende Robotik-Komponenten und Interfaces
- [ ] **Förderband-Prototyp**: Erste funktionierende Förderband-Komponente
- [ ] **Datenbank-Connector**: Persistente Datenspeicherung und -abruf

### Mittelfristig (3-6 Sprints)
- [ ] **Erweiterte Robotik-Bibliothek**: Vollständige Roboterarm- und AGV-Systeme
- [ ] **Produktionslinien-Templates**: Vorgefertigte Fabrik-Layouts
- [ ] **OPC UA Integration**: Industriestandard-Kommunikation
- [ ] **Digital Twin Registry**: Verwaltung und Versionierung von Twin-Modellen
- [ ] **Advanced Analytics**: KI-basierte Anomalieerkennung und Predictive Maintenance
- [ ] **Multi-User Collaboration**: Echtzeit-Zusammenarbeit mehrerer Nutzer

### Langfristig (6+ Sprints)
- [ ] **AR/VR Integration**: Augmented und Virtual Reality Support
- [ ] **Edge Computing**: Deployment auf Edge-Geräten
- [ ] **Blockchain Integration**: Sichere Datenhistorie und Smart Contracts
- [ ] **Machine Learning Pipeline**: Automatisches Lernen aus Sensordaten
- [ ] **Cloud-Integration**: Azure/AWS Digital Twins Services
- [ ] **Mobile Apps**: Native iOS/Android Companion Apps

## Performance-Optimierungen

Das System wurde für optimale Performance entwickelt. Details zu den implementierten Optimierungen finden Sie in [PERFORMANCE_OPTIMIZATIONS.md](./PERFORMANCE_OPTIMIZATIONS.md).

### Aktuelle Optimierungen
- Throttling für Mock-Daten Updates
- React.memo für häufig re-rendernde Komponenten
- useMemo für teure Berechnungen
- Refs zur Vermeidung unnötiger useEffect-Triggers
- Präzisionssteuerung für numerische Werte

## Entwicklung

### Lokale Entwicklung starten
```bash
# Abhängigkeiten installieren
npm install

# Entwicklungsserver starten
npm run dev

# Linting
npm run lint
```

### Neue Robotik-Module hinzufügen
1. Erstellen Sie ein neues Verzeichnis unter `src/modules/robotics/`
2. Implementieren Sie die Komponente mit React Three Fiber
3. Definieren Sie entsprechende TypeScript-Interfaces in `src/types/`
4. Fügen Sie Tests und Dokumentation hinzu

### Beitragen
1. Fork des Repositories
2. Feature-Branch erstellen (`git checkout -b feature/conveyor-belt`)
3. Änderungen committen (`git commit -am 'Add conveyor belt system'`)
4. Branch pushen (`git push origin feature/conveyor-belt`)
5. Pull Request erstellen

## Roadmap

**Q2 2025**: Robotik-Grundlagen und Förderband-System
**Q3 2025**: Erweiterte Robotik und Physik-Integration  
**Q4 2025**: AI/ML Features und Cloud-Integration
**Q1 2026**: AR/VR und Mobile Apps

## Lizenz

MIT
