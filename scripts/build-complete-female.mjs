import fs from 'node:fs';
import { gzipSync } from 'node:zlib';

const baseDir = new URL('../public/models/', import.meta.url);

console.log('Loading source datasets...');
const male = JSON.parse(fs.readFileSync(new URL('atlas.json', baseDir), 'utf8'));

// Use atlas-female-raw.json if available to prevent reading modified manifest
const rawFemaleFile = fs.existsSync(new URL('atlas-female-raw.json', baseDir)) ? 'atlas-female-raw.json' : 'atlas-female.json';
const hubmap = JSON.parse(fs.readFileSync(new URL(rawFemaleFile, baseDir), 'utf8'));

const maleChunks = male.chunks.map(c => fs.readFileSync(new URL(c.url.split('/').pop(), baseDir)));
const hubmapChunks = hubmap.chunks.map(c => fs.readFileSync(new URL(c.url.split('/').pop(), baseDir)));

const MALE_PART_IDS = new Set([
  'FJ3132', 'FJ3133', 'FJ3134', 'FJ3135', 'FJ3136', 'FJ3137',
  'FJ3138', 'FJ3139', 'FJ3140', 'FJ3141', 'FJ3142', 'FJ3143',
  'FJ3496', 'FJ3497', 'FJ3532', 'FJ3592', 'FJ3593', 'FJ3617',
  'FJ2056', 'FJ2208', 'FJ3426', 'FJ3533', 'FJ3618', 'FJ3637'
]);

const baseParts = male.parts.filter(p => !MALE_PART_IDS.has(p.id));
console.log(`Retained ${baseParts.length} complete non-genital parts from BodyParts3D.`);

const femaleAdditions = hubmap.parts.filter(p => {
  if (p.system === 'reproductive') return true;
  if (p.system === 'pregnancy') return true;
  if (p.id.includes('uterine_artery') || p.id.includes('uterine_vein')) return true;
  if (p.name.toLowerCase().includes('mammary') || p.name.toLowerCase().includes('nipple') || 
      p.id.includes('fat_L') || p.id.includes('fat_R') || p.id.includes('suspensory_ligaments')) return true;
  if (p.system === 'urinary' && (
    p.name.toLowerCase().includes('pyramid') || p.name.toLowerCase().includes('calyx') || 
    p.name.toLowerCase().includes('papilla') || p.name.toLowerCase().includes('pelvis') || 
    p.name.toLowerCase().includes('cortex')
  )) return true;
  return false;
});
console.log(`Selected ${femaleAdditions.length} female-specific parts from HuBMAP.`);

// Preload all female additions into standalone memory arrays
console.log('Preloading female mesh geometries into memory...');
const preloadedFemale = femaleAdditions.map(p => {
  const srcBuf = hubmapChunks[p.chunk];
  const pos = new Float32Array(p.vertexCount * 3);
  pos.set(new Float32Array(srcBuf.buffer, srcBuf.byteOffset + p.positions, p.vertexCount * 3));
  const norm = new Int16Array(p.vertexCount * 3);
  norm.set(new Int16Array(srcBuf.buffer, srcBuf.byteOffset + p.normals, p.vertexCount * 3));
  const ind = new Uint32Array(p.indexCount);
  ind.set(new Uint32Array(srcBuf.buffer, srcBuf.byteOffset + p.indices, p.indexCount));
  return { p, pos, norm, ind };
});
console.log(`Preloaded ${preloadedFemale.length} female meshes.`);

const PELVIS_OFFSET = [0.0, 0.080, 0.025];
const BREAST_OFFSET = [0.0, 0.050, 0.050];
const LEFT_KIDNEY_OFFSET = [-0.0154, 0.0832, 0.0797];
const RIGHT_KIDNEY_OFFSET = [0.0128, 0.0554, 0.0866];

function getOffsetForFemalePart(part) {
  const id = part.id;
  const name = part.name.toLowerCase();

  // Mammary / breast
  if (name.includes('mammary') || name.includes('nipple') || id.includes('fat_') || id.includes('suspensory_ligaments')) {
    return BREAST_OFFSET;
  }
  // All HuBMAP kidney microstructures (pyramids, calyces, papillae, cortex, pelvis)
  if (part.system === 'urinary') {
    if (id.includes('_L') || id.includes('_L_')) return LEFT_KIDNEY_OFFSET;
    if (id.includes('_R') || id.includes('_R_')) return RIGHT_KIDNEY_OFFSET;
  }
  // Pelvic reproductive, vascular, and pregnancy structures
  return PELVIS_OFFSET;
}

let chunks = [];
let segments = [];
let currentBytes = 0;
let totalTriangles = 0;

function flushChunk() {
  if (!currentBytes) return;
  const chunkIndex = chunks.length;
  const binName = `female-${chunkIndex}.bin`;
  const gzName = `female-${chunkIndex}.bin.gz`;
  const binUrl = `/models/${binName}`;
  const gzUrl = `/models/${gzName}`;

  const buffer = Buffer.concat(segments);
  fs.writeFileSync(new URL(binName, baseDir), buffer);

  const compressed = gzipSync(buffer, { level: 9 });
  fs.writeFileSync(new URL(gzName, baseDir), compressed);

  chunks.push({
    url: binUrl,
    bytes: buffer.length,
    gzip: gzUrl,
    gzipBytes: compressed.length
  });

  console.log(`Wrote ${binName} (${(buffer.length / 1024 / 1024).toFixed(2)} MB, gz: ${(compressed.length / 1024 / 1024).toFixed(2)} MB)`);
  segments = [];
  currentBytes = 0;
}

function appendTypedArray(typedArray) {
  const padding = (4 - (currentBytes % 4)) % 4;
  if (padding > 0) {
    segments.push(Buffer.alloc(padding));
    currentBytes += padding;
  }
  const offset = currentBytes;
  const buf = Buffer.from(typedArray.buffer, typedArray.byteOffset, typedArray.byteLength);
  segments.push(buf);
  currentBytes += buf.length;
  return offset;
}

const finalParts = [];

// Step 1: Base BodyParts3D parts
for (const p of baseParts) {
  const srcBuf = maleChunks[p.chunk];
  const pos = new Float32Array(srcBuf.buffer, srcBuf.byteOffset + p.positions, p.vertexCount * 3);
  const norm = new Int16Array(srcBuf.buffer, srcBuf.byteOffset + p.normals, p.vertexCount * 3);
  const ind = new Uint32Array(srcBuf.buffer, srcBuf.byteOffset + p.indices, p.indexCount);

  if (currentBytes > 4_000_000) flushChunk();

  const chunkIndex = chunks.length;
  const posOffset = appendTypedArray(pos);
  const normOffset = appendTypedArray(norm);
  const indOffset = appendTypedArray(ind);

  totalTriangles += p.indexCount / 3;

  finalParts.push({
    id: p.id,
    name: p.name,
    conceptId: p.conceptId,
    system: p.system,
    chunk: chunkIndex,
    positions: posOffset,
    normals: normOffset,
    indices: indOffset,
    vertexCount: p.vertexCount,
    indexCount: p.indexCount,
    bounds: p.bounds
  });
}

// Step 2: Female Additions
for (const item of preloadedFemale) {
  const p = item.p;
  const pos = item.pos;
  const norm = item.norm;
  const ind = item.ind;

  const offset = getOffsetForFemalePart(p);
  let min = [Infinity, Infinity, Infinity];
  let max = [-Infinity, -Infinity, -Infinity];

  for (let i = 0; i < p.vertexCount; i++) {
    pos[i * 3 + 0] += offset[0];
    pos[i * 3 + 1] += offset[1];
    pos[i * 3 + 2] += offset[2];

    for (let a = 0; a < 3; a++) {
      const val = pos[i * 3 + a];
      if (val < min[a]) min[a] = val;
      if (val > max[a]) max[a] = val;
    }
  }

  if (currentBytes > 4_000_000) flushChunk();

  const chunkIndex = chunks.length;
  const posOffset = appendTypedArray(pos);
  const normOffset = appendTypedArray(norm);
  const indOffset = appendTypedArray(ind);

  totalTriangles += p.indexCount / 3;

  let name = p.name;
  if (!name || name === '-') {
    if (p.id.includes('cervicovaginal')) name = 'Cervicovaginal junction';
    else if (p.id.includes('cornua')) name = 'Uterine horn (cornu)';
    else if (p.id.includes('basal_plate')) name = 'Placental basal plate';
    else if (p.id.includes('placenta_vessels')) name = 'Placental blood vessels';
    else name = p.id.replace('VH_F_', '').replace(/_/g, ' ');
  }

  finalParts.push({
    id: p.id,
    name,
    conceptId: p.conceptId && p.conceptId !== '-' ? p.conceptId : `HRA:${p.id}`,
    system: p.system,
    chunk: chunkIndex,
    positions: posOffset,
    normals: normOffset,
    indices: indOffset,
    vertexCount: p.vertexCount,
    indexCount: p.indexCount,
    bounds: [min, max]
  });
}

flushChunk();

const partIdSet = new Set(finalParts.map(p => p.id));
const conceptsMap = new Map();

for (const c of male.concepts) {
  const validElements = c.elements.filter(id => partIdSet.has(id));
  if (validElements.length > 0) {
    conceptsMap.set(c.id, {
      id: c.id,
      name: c.name,
      system: c.system,
      elements: validElements
    });
  }
}

for (const c of hubmap.concepts) {
  const validElements = c.elements.filter(id => partIdSet.has(id));
  if (validElements.length > 0) {
    if (conceptsMap.has(c.id)) {
      const existing = conceptsMap.get(c.id);
      const combined = Array.from(new Set([...existing.elements, ...validElements]));
      conceptsMap.set(c.id, { ...existing, elements: combined });
    } else {
      conceptsMap.set(c.id, {
        id: c.id,
        name: c.name,
        system: c.system || 'reproductive',
        elements: validElements
      });
    }
  }
}

const canonicalConcepts = [
  {
    id: 'FEMALE_UTERUS',
    name: 'uterus',
    system: 'reproductive',
    elements: finalParts.filter(p => p.id.includes('uterus') || p.id.includes('cervix') || p.id.includes('cornua')).map(p => p.id)
  },
  {
    id: 'FEMALE_OVARIES',
    name: 'ovaries',
    system: 'reproductive',
    elements: finalParts.filter(p => p.id.includes('ovary')).map(p => p.id)
  },
  {
    id: 'FEMALE_FALLOPIAN_TUBES',
    name: 'uterine tubes (fallopian tubes)',
    system: 'reproductive',
    elements: finalParts.filter(p => p.id.includes('uterine_tube') || p.id.includes('fallopian')).map(p => p.id)
  },
  {
    id: 'FEMALE_VAGINA',
    name: 'vagina',
    system: 'reproductive',
    elements: finalParts.filter(p => p.id.includes('vagina') || p.id.includes('cervicovaginal')).map(p => p.id)
  },
  {
    id: 'FEMALE_BREASTS',
    name: 'breasts (mammary glands)',
    system: 'integumentary',
    elements: finalParts.filter(p => p.name.toLowerCase().includes('mammary') || p.name.toLowerCase().includes('nipple') || p.id.includes('fat_')).map(p => p.id)
  }
];

for (const cc of canonicalConcepts) {
  if (cc.elements.length > 0) {
    conceptsMap.set(cc.id, cc);
  }
}

const finalConcepts = Array.from(conceptsMap.values());

const femaleAtlas = {
  version: '2.0-complete-female',
  sex: 'female',
  source: 'BodyParts3D + HuBMAP Human Reference Atlas (Female)',
  scope: 'Full and complete female body system with 15 anatomical systems, internal viscera, and female reproductive organs',
  parts: finalParts,
  concepts: finalConcepts,
  chunks,
  triangles: totalTriangles
};

fs.writeFileSync(new URL('atlas-female.json', baseDir), JSON.stringify(femaleAtlas, null, 2));

console.log('Successfully built complete female atlas!');
console.log(`- Total parts: ${finalParts.length}`);
console.log(`- Total concepts: ${finalConcepts.length}`);
console.log(`- Total triangles: ${totalTriangles.toLocaleString()}`);
console.log(`- Total chunks: ${chunks.length}`);
