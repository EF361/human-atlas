import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const sysDir = path.resolve(__dirname, '../public/images/systems');
if (!fs.existsSync(sysDir)) fs.mkdirSync(sysDir, { recursive: true });

const SYSTEMS = [
  { id: 'skeletal', name: 'Skeletal System', color: '#e2d9ba', count: '633 pieces', icon: '🦴', desc: 'Bones and structural framework supporting the human body.' },
  { id: 'muscular', name: 'Muscular System', color: '#a85b50', count: '484 pieces', icon: '💪', desc: 'Skeletal muscles enabling locomotion and postural control.' },
  { id: 'cardiac', name: 'Cardiac System', color: '#b96760', count: '83 pieces', icon: '❤️', desc: 'The muscular heart pumping blood across systemic and pulmonary circuits.' },
  { id: 'sensory', name: 'Sensory Organs', color: '#b0c8ce', count: '28 pieces', icon: '👁️', desc: 'Visual, auditory, and sensory reception apparatus.' },
  { id: 'arterial', name: 'Arterial System', color: '#c05245', count: '246 pieces', icon: '🩸', desc: 'Oxygenated vascular blood delivery networks.' },
  { id: 'venous', name: 'Venous System', color: '#527c9f', count: '172 pieces', icon: '🔵', desc: 'Vessels returning deoxygenated blood to the heart.' },
  { id: 'nervous', name: 'Nervous System', color: '#d8b565', count: '171 pieces', icon: '🧠', desc: 'Cerebrum, spinal cord, cranial nerves, and peripheral signaling.' },
  { id: 'respiratory', name: 'Respiratory System', color: '#b98991', count: '57 pieces', icon: '🫁', desc: 'Trachea, bronchi, and lungs facilitating vital gas exchange.' },
  { id: 'digestive', name: 'Digestive System', color: '#b8916b', count: '78 pieces', icon: '🥪', desc: 'Gastrointestinal tract, liver, and pancreatic digestion.' },
  { id: 'urinary', name: 'Urinary System', color: '#b47961', count: '24 pieces', icon: '💧', desc: 'Kidneys, ureters, and bladder filtering metabolic fluids.' },
  { id: 'lymphatic', name: 'Lymphatic System', color: '#879f7c', count: '88 pieces', icon: '🛡️', desc: 'Lymph nodes, spleen, and lymphoid immunological defense.' },
  { id: 'endocrine', name: 'Endocrine System', color: '#c5a09a', count: '12 pieces', icon: '✨', desc: 'Hormone-producing glands regulating metabolism and growth.' },
  { id: 'reproductive', name: 'Reproductive System', color: '#bda098', count: '39 pieces', icon: '🧬', desc: 'Reference reproductive anatomy and hormone synthesis.' },
  { id: 'integumentary', name: 'Integumentary System', color: '#ba9b7d', count: '14 pieces', icon: '🛡️', desc: 'Protective skin barrier, dermis, and thermoregulation.' },
  { id: 'connective', name: 'Connective Tissue', color: '#aec3bb', count: '85 pieces', icon: '🔗', desc: 'Fascia, cartilage, and supportive joint ligaments.' }
];

for (const s of SYSTEMS) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 480" width="800" height="480">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f141c" />
      <stop offset="100%" stop-color="#18202c" />
    </linearGradient>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${s.color}" />
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0.8" />
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="16" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>
  <rect width="800" height="480" rx="24" fill="url(#bg)" stroke="#26354a" stroke-width="2"/>
  <circle cx="650" cy="240" r="160" fill="${s.color}" opacity="0.08" filter="url(#glow)"/>
  <circle cx="650" cy="240" r="110" fill="none" stroke="${s.color}" stroke-width="2" stroke-dasharray="6 6" opacity="0.4"/>
  <text x="650" y="270" font-size="90" text-anchor="middle" font-family="system-ui, sans-serif">${s.icon}</text>
  <g transform="translate(60, 80)">
    <rect x="0" y="0" width="130" height="32" rx="16" fill="${s.color}" fill-opacity="0.2"/>
    <text x="65" y="21" fill="${s.color}" font-size="13" font-weight="700" text-anchor="middle" font-family="system-ui, sans-serif" letter-spacing="1">HUMAN ATLAS</text>
    <text x="0" y="90" fill="#ffffff" font-size="40" font-weight="800" font-family="system-ui, sans-serif">${s.name}</text>
    <text x="0" y="130" fill="${s.color}" font-size="16" font-weight="600" font-family="system-ui, sans-serif">${s.count} · BodyParts3D Model</text>
    <text x="0" y="180" fill="#94a3b8" font-size="17" font-family="system-ui, sans-serif" width="460">
      <tspan x="0" dy="0">${s.desc}</tspan>
    </text>
    <g transform="translate(0, 260)">
      <rect x="0" y="0" width="220" height="44" rx="10" fill="#202c3d" stroke="${s.color}" stroke-width="1.5"/>
      <text x="110" y="27" fill="#ffffff" font-size="14" font-weight="600" text-anchor="middle" font-family="system-ui, sans-serif">🔍 Explore in 3D Atlas →</text>
    </g>
  </g>
</svg>`;
  fs.writeFileSync(path.join(sysDir, `${s.id}.svg`), svg);
}

console.log(`Generated ${SYSTEMS.length} system visual SVGs.`);
