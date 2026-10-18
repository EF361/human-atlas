# Human Atlas ![React](https://img.shields.io/badge/React-18.2.0-blue) ![Three.js](https://img.shields.io/badge/Three.js-0.153.0-lightblue) ![shadcn/ui](https://img.shields.io/badge/shadcn/ui-v0.8.0-green) ![License](https://img.shields.io/badge/License-MIT-yellowgreen) ![Demo](https://img.shields.io/badge/Demo-Live-blue)

## Executive Summary
**Human Atlas** is an interactive 3D anatomy visualization tool that helps educators, researchers, and medical professionals explore human anatomy in unprecedented detail. Built with React, Three.js, and shadcn/ui, it offers an intuitive, immersive interface for learning and analysis.

---

## Key Features
- **3D Anatomy Modeling:** Explore high-fidelity, interactive 3D models of human anatomy with precise detail.
- **Dynamic Interactivity:** Rotate, zoom, and filter anatomical structures with real-time responsiveness powered by Three.js.
- **Searchable Layers:** Quickly navigate organs, tissues, and systems with categorized filtering and search functionality.
- **UI Modernity:** Leverages the robust component library of `shadcn/ui` for stylish and fluid interfaces.
- **Annotation Capabilities:** Add comments or notes to specific anatomical structures during walkthroughs.
- **Deployment Ready:** Designed with optimal performance for modern browser environments and ready for web deployment.
- **Beginner-Friendly Examples:** Straightforward usage examples and tutorials guide new users through key features.

---

## Architecture & Workflow
```mermaid
graph TD
    A[User Interaction (Browser)] --> B[React Frontend]
    B --> C[shadcn/ui Components]
    B --> D[Three.js Engine]
    D --> E[3D Models Data Handling]
    E --> F[Server-side Asset Management]
    F --> G[Cloud Storage/Database]
```
**Explanation:**  
1. Users interact with the app through the **React Frontend**.  
2. Interface components are powered by **shadcn/ui**.  
3. The **Three.js Engine** manages rendering and interactivity for the 3D anatomy models.  
4. 3D model data is fetched from the backend, stored in cloud storage, and sent to the rendering layer.

---

## Tech Stack & Tools Breakdown
- **Core Frameworks:** React (frontend) + Three.js (3D modeling & rendering).  
- **UI Library:** shadcn/ui for modern and accessible UI components.  
- **Storage & Infrastructure:** Cloud-based dynamic assets management for scalability.  
- **Development Tools:** Vite.js (React build tool), ESLint, and Prettier for code quality and standardization.  

---

## Quickstart / Installation
Follow these instructions to launch the project locally.

1. Clone the repository:
   ```bash
   git clone https://github.com/EF361/human-atlas.git
   cd human-atlas
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Access the application:  
   Open your browser and visit `http://localhost:3000`.

---

## Usage Examples
### Interacting with 3D Anatomy Models
```javascript
import { AnatomyViewer } from './components/AnatomyViewer';

export default function App() {
  return (
    <div style={{ height: '100vh' }}>
      <AnatomyViewer modelId="human-brain" />
    </div>
  );
}
```

### Adding Annotations
```javascript
import { AnnotationTool } from './components/AnnotationTool';

function Example() {
  return (
    <AnnotationTool 
      targetStructure="heart-aorta" 
      note="Supplies blood from the heart to the body."
    />
  );
}
```

---

## Demo & Documentation
- **Live Demo:** [Try it now](https://human-atlas-demo.com)  
- **Complete Documentation:** [Explore detailed guides](https://docs.human-atlas.io)  

Explore and contribute to **Human Atlas** today—revolutionize how we understand human anatomy! Made with ❤️ by **Alicia Goh (EF361)**.