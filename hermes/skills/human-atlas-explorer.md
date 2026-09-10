---
name: human-atlas-explorer
description: Expert skill for querying, navigating, and inspecting 3D anatomical structures in the Human Atlas explorer using BodyParts3D 4.0 reference anatomy.
version: 1.0.0
author: Antigravity / Hermes Agent
---

# Human Atlas Explorer Skill

Use this skill when interacting with the **Human Atlas** 3D interactive viewer or answering questions about human anatomy based on the **BodyParts3D 4.0** dataset.

## System Capabilities

The Human Atlas models **2,234 individual anatomical meshes** grouped into **3,432 named clinical concepts** across **15 anatomical systems**:

| System | Key Structures | Description |
| :--- | :--- | :--- |
| **cardiac** | Heart, chambers, valves, coronary vessels | Muscular pump with four chambers; drives pulmonary and systemic circuits |
| **skeletal** | Skull, vertebrae, ribs, pelvis, limbs | Structural bone framework, protection, and mineral storage |
| **muscular** | Skeletal muscles, tendons, diaphragm | Force generation, articulation, stability, and thermogenesis |
| **arterial** | Aorta, carotid, femoral, pulmonary arteries | High-pressure oxygenated supply conduits (pulmonary carries deox) |
| **venous** | Venae cavae, jugular, portal, pulmonary veins | Return conduits with valves; pulmonary veins return oxygenated blood |
| **nervous** | Brain, spinal cord, cranial nerves, peripheral nerves | Electrical signal transduction, motor/sensory coordination |
| **respiratory** | Trachea, bronchi, lungs, bronchioles | Air conduction, gas exchange across alveolar-capillary barrier |
| **digestive** | Esophagus, stomach, intestines, liver, pancreas | Breakdown, nutrient absorption, bile/enzyme secretion, elimination |
| **urinary** | Kidneys, ureters, bladder, urethra | Blood ultrafiltration, fluid/electrolyte regulation, waste excretion |
| **lymphatic** | Spleen, lymph nodes, lymphatic ducts | Tissue fluid reclamation, immune surveillance and leukocyte transit |
| **endocrine** | Pituitary, thyroid, adrenal glands, islets | Hormone production and bloodstream signaling |
| **reproductive** | Testes, prostate, seminal vesicles, ductus | Gamete production, hormone synthesis, reproduction |
| **integumentary**| Body surface, cutaneous reference | Outer barrier, thermoregulation, tactile sensation |
| **connective**  | Cartilage, ligaments, fascia, fibrocartilage | Articular stabilization, tensile load distribution |
| **sensory**     | Eye, inner ear, olfactory bulbs | Specialized receptor organs for vision, audition, and balance |

---

## Tool Interface

When the Human Atlas browser application is running with `document.modelContext` enabled, or via the `atlas-mcp-server`, the following tools are available:

### 1. `find_anatomy`
Search for anatomical structures by Latin/English name or BodyParts3D concept identifier:
```json
{
  "query": "heart"
}
```
**Response Format**:
```json
[
  { "id": "FMA7088", "name": "Heart", "pieces": 1 }
]
```

### 2. `inspect_anatomical_structure`
Focus camera and highlight a specific concept in the 3D canvas:
```json
{
  "id": "FMA7088"
}
```

---

## Clinical & Anatomical Reasoning Best Practices

1. **System Interactions**:
   - Always trace vascular supplies: For an organ inspection (e.g. `Kidney`), relate to both `arterial` (renal artery) and `urinary` functional systems.
   - For thoracic structures, consider the boundaries (rib cage, diaphragm, pleural cavities).
2. **Exploded vs. Assembled Context**:
   - When inspecting deep organs (e.g. `Pituitary gland` or `Pancreas`), note whether surrounding structures need to be hidden or exploded to improve visibility.
