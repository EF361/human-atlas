export default function handler(req, res) {
  const { query: rawQuery, id: rawId } = req.query;
  const q = ((rawQuery || rawId || 'heart') + '').toLowerCase().trim();

  const STATIC_MAP = {
    heart: '/images/anatomy/heart.png',
    fma7088: '/images/anatomy/heart.png',
    cardiac: '/images/anatomy/heart.png',
    brain: '/images/anatomy/brain.png',
    fma9688: '/images/anatomy/brain.png',
    cerebrum: '/images/anatomy/brain.png',
    lungs: '/images/anatomy/lungs.png',
    lung: '/images/anatomy/lungs.png',
    fma7195: '/images/anatomy/lungs.png',
    liver: '/images/anatomy/liver.png',
    stomach: '/images/anatomy/stomach.png',
    fma7197: '/images/anatomy/stomach.png',
    kidney: '/images/anatomy/kidney.png',
    kidneys: '/images/anatomy/kidney.png',
    fma7203: '/images/anatomy/kidney.png',
    skeleton: '/images/anatomy/skeleton.png',
    bone: '/images/anatomy/skeleton.png',
    bones: '/images/anatomy/skeleton.png',
    skull: '/images/anatomy/skull.png',
    spine: '/images/anatomy/spine.png',
    femur: '/images/anatomy/femur.png',
    eye: '/images/anatomy/eye.png',
    eyes: '/images/anatomy/eye.png',
    ear: '/images/anatomy/ear.png',
    ears: '/images/anatomy/ear.png',
    spleen: '/images/anatomy/spleen.png',
    pancreas: '/images/anatomy/pancreas.png',
    bladder: '/images/anatomy/bladder.png',
    aorta: '/images/anatomy/aorta.png',
    muscle: '/images/anatomy/muscular.png',
    muscles: '/images/anatomy/muscular.png',
    uterus: '/images/anatomy/uterus.png',
    ovary: '/images/anatomy/ovary.png',
    ovaries: '/images/anatomy/ovary.png',
    vagina: '/images/anatomy/uterus.png',
    cervix: '/images/anatomy/uterus.png',
    fallopian: '/images/anatomy/ovary.png',
    prostate: '/images/anatomy/prostate.png',
    testis: '/images/anatomy/testis.png',
    testicle: '/images/anatomy/testis.png',
    penis: '/images/anatomy/reproductive.png',
    reproductive: '/images/anatomy/reproductive.png',
    'heart interior': '/images/anatomy/heart-interior.png',
    'kidney interior': '/images/anatomy/kidney-interior.png',
    'renal medulla': '/images/anatomy/kidney-interior.png',
    'renal pyramid': '/images/anatomy/kidney-interior.png'
  };

  const match = Object.keys(STATIC_MAP).find(k => q.includes(k));
  if (match) {
    res.writeHead(307, { Location: STATIC_MAP[match] });
    return res.end();
  }

  const SYSTEM_COLORS = {
    skeletal: '#e2d9ba', muscular: '#a85b50', cardiac: '#b96760', sensory: '#b0c8ce',
    arterial: '#c05245', venous: '#527c9f', nervous: '#d8b565', respiratory: '#b98991',
    digestive: '#b8916b', urinary: '#b47961', lymphatic: '#879f7c', endocrine: '#c5a09a',
    reproductive: '#bda098', integumentary: '#ba9b7d', connective: '#aec3bb'
  };

  const title = (rawQuery || rawId || 'Anatomical Structure').toUpperCase();
  const color = '#38bdf8';

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 480" width="800" height="480">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0b101b" />
      <stop offset="100%" stop-color="#151e2d" />
    </linearGradient>
  </defs>
  <rect width="800" height="480" rx="20" fill="url(#bg)" stroke="#223348" stroke-width="2"/>
  <g transform="translate(60, 90)">
    <rect x="0" y="0" width="140" height="32" rx="16" fill="${color}" fill-opacity="0.15"/>
    <text x="70" y="21" fill="${color}" font-size="12" font-weight="700" text-anchor="middle" font-family="system-ui, sans-serif">HUMAN ATLAS 3D</text>
    <text x="0" y="80" fill="#ffffff" font-size="34" font-weight="800" font-family="system-ui, sans-serif">${title}</text>
    <text x="0" y="120" fill="#94a3b8" font-size="16" font-family="system-ui, sans-serif">BodyParts3D Anatomical Concept Model</text>
    <g transform="translate(0, 200)">
      <rect x="0" y="0" width="240" height="44" rx="8" fill="#1e293b" stroke="${color}" stroke-width="1.5"/>
      <text x="120" y="27" fill="#ffffff" font-size="14" font-weight="600" text-anchor="middle" font-family="system-ui, sans-serif">Open in 3D Anatomy Atlas →</text>
    </g>
  </g>
</svg>`;

  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
  res.status(200).send(svg);
}
