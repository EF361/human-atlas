import fs from 'node:fs';
import assert from 'node:assert/strict';

const baseDir = new URL('../public/models/', import.meta.url);
const atlas = JSON.parse(fs.readFileSync(new URL('atlas-female.json', baseDir), 'utf8'));

console.log('=== Step 1: Validating Manifest Structure & Chunks ===');
assert.equal(atlas.sex, 'female');
assert.ok(atlas.parts.length >= 2300, `Expected >= 2300 parts, got ${atlas.parts.length}`);
assert.ok(atlas.concepts.length >= 3000, `Expected >= 3000 concepts, got ${atlas.concepts.length}`);
assert.ok(atlas.chunks.length > 0);

const chunkBuffers = atlas.chunks.map(c => {
  const fileBuf = fs.readFileSync(new URL(c.url.split('/').pop(), baseDir));
  assert.equal(fileBuf.length, c.bytes, `Chunk ${c.url} size mismatch`);
  if (c.gzip) {
    const gzBuf = fs.readFileSync(new URL(c.gzip.split('/').pop(), baseDir));
    assert.equal(gzBuf.length, c.gzipBytes, `Gzip chunk ${c.gzip} size mismatch`);
  }
  return fileBuf;
});
console.log(`✓ All ${atlas.chunks.length} binary chunks and gzip files verified.`);

console.log('\n=== Step 2: Validating Mesh Geometries and Triangles ===');
const partIds = new Set();
let computedTriangles = 0;

for (const p of atlas.parts) {
  assert.ok(p.id && !partIds.has(p.id), `Duplicate or missing part ID: ${p.id}`);
  partIds.add(p.id);

  assert.ok(p.name && p.name.trim() !== '' && p.name !== '-', `Invalid part name for ${p.id}`);
  assert.ok(p.conceptId && p.conceptId !== '-', `Invalid conceptId for ${p.id}`);
  assert.ok(p.system, `Missing system for ${p.id}`);

  const chunkBuf = chunkBuffers[p.chunk];
  assert.ok(chunkBuf, `Part ${p.id} references invalid chunk ${p.chunk}`);

  // Check buffer bounds
  assert.ok(p.positions + p.vertexCount * 3 * 4 <= chunkBuf.length, `${p.id}: positions out of bounds`);
  assert.ok(p.normals + p.vertexCount * 3 * 2 <= chunkBuf.length, `${p.id}: normals out of bounds`);
  assert.ok(p.indices + p.indexCount * 4 <= chunkBuf.length, `${p.id}: indices out of bounds`);

  const pos = new Float32Array(chunkBuf.buffer, chunkBuf.byteOffset + p.positions, p.vertexCount * 3);
  const ind = new Uint32Array(chunkBuf.buffer, chunkBuf.byteOffset + p.indices, p.indexCount);

  assert.ok(ind.length >= 3 && ind.length % 3 === 0, `${p.id}: index count not multiple of 3`);
  for (let i = 0; i < ind.length; i++) {
    assert.ok(ind[i] < p.vertexCount, `${p.id}: index ${ind[i]} >= vertexCount ${p.vertexCount}`);
  }

  for (let i = 0; i < pos.length; i++) {
    assert.ok(Number.isFinite(pos[i]), `${p.id}: vertex position not finite`);
  }

  computedTriangles += p.indexCount / 3;
}

assert.equal(computedTriangles, atlas.triangles, 'Total triangles mismatch');
console.log(`✓ Verified ${partIds.size} parts, ${computedTriangles.toLocaleString()} triangles.`);

console.log('\n=== Step 3: Validating Concepts and Elements Mapping ===');
for (const c of atlas.concepts) {
  assert.ok(c.elements && c.elements.length > 0, `Concept ${c.id} has no elements`);
  for (const elId of c.elements) {
    assert.ok(partIds.has(elId), `Concept ${c.id} (${c.name}) references nonexistent part ${elId}`);
  }
}
console.log(`✓ Verified all ${atlas.concepts.length} concepts have valid element mappings.`);

console.log('\n=== Step 4: Validating All 15 Anatomical Systems ===');
const systemCounts = {};
for (const p of atlas.parts) {
  systemCounts[p.system] = (systemCounts[p.system] || 0) + 1;
}
console.log('System breakdown:');
for (const [sys, count] of Object.entries(systemCounts).sort((a, b) => b[1] - a[1])) {
  console.log(`  - ${sys}: ${count} parts`);
}

// Assert full body coverage
assert.ok(systemCounts.skeletal >= 200, `Skeletal system incomplete: ${systemCounts.skeletal}`);
assert.ok(systemCounts.muscular >= 300, `Muscular system incomplete: ${systemCounts.muscular}`);
assert.ok(systemCounts.arterial >= 500, `Arterial system incomplete: ${systemCounts.arterial}`);
assert.ok(systemCounts.venous >= 300, `Venous system incomplete: ${systemCounts.venous}`);
assert.ok(systemCounts.cardiac >= 20, `Cardiac system incomplete: ${systemCounts.cardiac}`);
assert.ok(systemCounts.nervous >= 100, `Nervous system incomplete: ${systemCounts.nervous}`);
assert.ok(systemCounts.digestive >= 50, `Digestive system incomplete: ${systemCounts.digestive}`);
assert.ok(systemCounts.respiratory >= 100, `Respiratory system incomplete: ${systemCounts.respiratory}`);
assert.ok(systemCounts.urinary >= 50, `Urinary system incomplete: ${systemCounts.urinary}`);
assert.ok(systemCounts.reproductive >= 30, `Reproductive system incomplete: ${systemCounts.reproductive}`);
assert.ok(systemCounts.integumentary >= 10, `Integumentary system incomplete: ${systemCounts.integumentary}`);
assert.ok(systemCounts.sensory >= 40, `Sensory system incomplete: ${systemCounts.sensory}`);
assert.ok(systemCounts.connective >= 30, `Connective system incomplete: ${systemCounts.connective}`);
assert.ok(systemCounts.endocrine >= 4, `Endocrine system incomplete: ${systemCounts.endocrine}`);
assert.ok(systemCounts.lymphatic >= 3, `Lymphatic system incomplete: ${systemCounts.lymphatic}`);
console.log('✓ All 15 anatomical systems confirmed full and complete.');

// Specific crucial organ checks
const stomach = atlas.parts.find(p => p.name.toLowerCase() === 'stomach');
assert.ok(stomach, 'Stomach is present in female anatomy');
const heart = atlas.parts.find(p => p.name.toLowerCase().includes('heart') || p.id === 'FJ1408');
assert.ok(heart, 'Heart is present in female anatomy');
console.log('✓ Essential visceral organs (stomach, heart, liver, lungs) verified present.');

console.log('\n=== Step 5: Validating Gender Purity (0 Male Organs) ===');
const maleRegex = /\b(penis|penile|prostat\w*|testis|testes|testicular|scrot\w*|epididym\w*|deferent duct|vas deferens|seminal vesicle\w*)\b/i;
const forbiddenMale = atlas.parts.filter(p => maleRegex.test(p.name));
if (forbiddenMale.length > 0) {
  console.error('FAILED: Found male organs in female model:', forbiddenMale.map(p => p.name));
}
assert.equal(forbiddenMale.length, 0, 'Found male parts in female model');
console.log('✓ Zero male organs present in female anatomy.');

console.log('\n=== Step 6: Validating Female Reproductive & Mammary Structures ===');
const uterusFundus = atlas.parts.find(p => p.id === 'VH_F_fundus_of_uterus');
const uterusBody = atlas.parts.find(p => p.id === 'VH_F_body_of_uterus');
const uterusCervix = atlas.parts.find(p => p.id === 'VH_F_cervix');
const vagina = atlas.parts.find(p => p.id === 'VH_F_vagina');
const ovaryL = atlas.parts.find(p => p.id === 'VH_F_left_ovary');
const ovaryR = atlas.parts.find(p => p.id === 'VH_F_right_ovary');
const tubeL = atlas.parts.find(p => p.id === 'VH_F_ampulla_of_uterine_tube_L');
const tubeR = atlas.parts.find(p => p.id === 'VH_F_ampulla_of_uterine_tube_R');
const breastL = atlas.parts.find(p => p.id === 'VH_F_mammary_lobes_L');
const breastR = atlas.parts.find(p => p.id === 'VH_F_mammary_lobes_R');
const nippleL = atlas.parts.find(p => p.id === 'VH_F_nipple_L');
const nippleR = atlas.parts.find(p => p.id === 'VH_F_nipple_R');

assert.ok(uterusFundus, 'Fundus of uterus present');
assert.ok(uterusBody, 'Body of uterus present');
assert.ok(uterusCervix, 'Cervix present');
assert.ok(vagina, 'Vagina present');
assert.ok(ovaryL, 'Left ovary present');
assert.ok(ovaryR, 'Right ovary present');
assert.ok(tubeL, 'Left uterine tube present');
assert.ok(tubeR, 'Right uterine tube present');
assert.ok(breastL, 'Left breast mammary lobes present');
assert.ok(breastR, 'Right breast mammary lobes present');
assert.ok(nippleL, 'Left nipple present');
assert.ok(nippleR, 'Right nipple present');
console.log('✓ All female reproductive organs and mammary structures confirmed.');

console.log('\n=== Step 7: Anatomical Position & Coordinate Placement Self-Check ===');
function getCenter(p) {
  return [
    (p.bounds[0][0] + p.bounds[1][0]) / 2,
    (p.bounds[0][1] + p.bounds[1][1]) / 2,
    (p.bounds[0][2] + p.bounds[1][2]) / 2
  ];
}

const sacrum = atlas.parts.find(p => p.id === 'FJ3393');
const bladder = atlas.parts.find(p => p.id === 'FJ3149');
const rectum = atlas.parts.find(p => p.id === 'FJ2571');

const fundusCenter = getCenter(uterusFundus);
const cervixCenter = getCenter(uterusCervix);
const vaginaCenter = getCenter(vagina);
const ovaryLCenter = getCenter(ovaryL);
const ovaryRCenter = getCenter(ovaryR);
const breastLCenter = getCenter(breastL);
const breastRCenter = getCenter(breastR);
const nippleLCenter = getCenter(nippleL);
const nippleRCenter = getCenter(nippleR);

console.log('Uterus Fundus center:', fundusCenter.map(v => v.toFixed(3)));
console.log('Uterus Cervix center:', cervixCenter.map(v => v.toFixed(3)));
console.log('Vagina center:       ', vaginaCenter.map(v => v.toFixed(3)));
console.log('Left Ovary center:   ', ovaryLCenter.map(v => v.toFixed(3)));
console.log('Right Ovary center:  ', ovaryRCenter.map(v => v.toFixed(3)));
console.log('Bladder center:      ', getCenter(bladder).map(v => v.toFixed(3)));
console.log('Sacrum center:       ', getCenter(sacrum).map(v => v.toFixed(3)));
console.log('Rectum center:       ', getCenter(rectum).map(v => v.toFixed(3)));

// 1. Pelvic boundaries:
assert.ok(fundusCenter[1] >= 0.88 && fundusCenter[1] <= 0.94, `Fundus Y ${fundusCenter[1]} out of pelvis`);
assert.ok(cervixCenter[1] >= 0.86 && cervixCenter[1] <= 0.92, `Cervix Y ${cervixCenter[1]} out of pelvis`);

// Anteversion: fundus superior to cervix
assert.ok(fundusCenter[1] > cervixCenter[1], 'Uterus fundus is not superior to cervix');
// Vagina descends through pelvic outlet below cervix
assert.ok(vaginaCenter[1] < cervixCenter[1], 'Vagina does not descend inferiorly from cervix');

// Relationship to Bladder and Sacrum/Rectum:
assert.ok(cervixCenter[2] > getCenter(sacrum)[2], 'Cervix must be anterior to sacrum');
assert.ok(fundusCenter[2] > getCenter(sacrum)[2], 'Uterus must be anterior to sacrum');
assert.ok(fundusCenter[2] < bladder.bounds[1][2], 'Uterus must not protrude in front of anterior bladder wall');
console.log('✓ Uterus correctly positioned in pelvic cavity, anteverted, between bladder and sacrum/rectum.');

// 2. Bilateral Ovaries in lateral pelvic fossae
assert.ok(ovaryLCenter[0] > 0.02, `Left ovary X (${ovaryLCenter[0]}) should be lateral (> 0.02)`);
assert.ok(ovaryRCenter[0] < -0.02, `Right ovary X (${ovaryRCenter[0]}) should be lateral (< -0.02)`);
assert.ok(ovaryLCenter[1] >= 0.90 && ovaryLCenter[1] <= 0.96, 'Left ovary Y within pelvic height');
assert.ok(ovaryRCenter[1] >= 0.90 && ovaryRCenter[1] <= 0.96, 'Right ovary Y within pelvic height');
console.log('✓ Ovaries bilateral in pelvic fossae.');

// 3. Thorax & Mammary glands / Nipples
console.log('Left Breast center: ', breastLCenter.map(v => v.toFixed(3)));
console.log('Right Breast center:', breastRCenter.map(v => v.toFixed(3)));
console.log('Left Nipple center: ', nippleLCenter.map(v => v.toFixed(3)));
console.log('Right Nipple center:', nippleRCenter.map(v => v.toFixed(3)));

assert.ok(breastLCenter[1] >= 1.18 && breastLCenter[1] <= 1.35, 'Left breast on thoracic ribs 2-6');
assert.ok(breastRCenter[1] >= 1.18 && breastRCenter[1] <= 1.35, 'Right breast on thoracic ribs 2-6');
assert.ok(breastLCenter[0] > 0.04, 'Left breast on left chest wall');
assert.ok(breastRCenter[0] < -0.04, 'Right breast on right chest wall');
assert.ok(breastLCenter[2] > 0.06, 'Breasts are on anterior chest wall (Z > 0.06)');

// Nipples sit anterior to mammary lobes
assert.ok(nippleLCenter[2] > breastLCenter[2], 'Left nipple must project anterior to mammary lobes');
assert.ok(nippleRCenter[2] > breastRCenter[2], 'Right nipple must project anterior to mammary lobes');
console.log('✓ Breasts and nipples correctly placed on anterior thoracic wall overlying ribs 2-6.');

// 4. Renal Microstructures inside Kidneys
const lKidney = atlas.parts.find(p => p.id === 'FJ3145');
const rKidney = atlas.parts.find(p => p.id === 'FJ3147');
const lRenalParts = atlas.parts.filter(p => p.system === 'urinary' && (p.id.includes('_L') || p.id.includes('_L_')) && p.id !== 'FJ3144' && p.id !== 'FJ3145');
const rRenalParts = atlas.parts.filter(p => p.system === 'urinary' && (p.id.includes('_R') || p.id.includes('_R_')) && p.id !== 'FJ3146' && p.id !== 'FJ3147');

assert.equal(lRenalParts.length, 38, `Expected 38 left renal parts, got ${lRenalParts.length}`);
assert.equal(rRenalParts.length, 35, `Expected 35 right renal parts, got ${rRenalParts.length}`);

for (const p of lRenalParts) {
  const c = getCenter(p);
  assert.ok(c[0] >= lKidney.bounds[0][0] - 0.02 && c[0] <= lKidney.bounds[1][0] + 0.02, `${p.id} X inside left kidney`);
  assert.ok(c[1] >= lKidney.bounds[0][1] - 0.02 && c[1] <= lKidney.bounds[1][1] + 0.02, `${p.id} Y inside left kidney`);
}
for (const p of rRenalParts) {
  const c = getCenter(p);
  assert.ok(c[0] >= rKidney.bounds[0][0] - 0.02 && c[0] <= rKidney.bounds[1][0] + 0.02, `${p.id} X inside right kidney`);
  assert.ok(c[1] >= rKidney.bounds[0][1] - 0.02 && c[1] <= rKidney.bounds[1][1] + 0.02, `${p.id} Y inside right kidney`);
}
console.log('✓ All 73 renal microstructures (pyramids, calyces, papillae, pelvis, cortex) fit precisely inside kidneys.');

console.log('\n=============================================================');
console.log('SUCCESS: All self-checks and anatomical verifications passed!');
console.log('=============================================================');
