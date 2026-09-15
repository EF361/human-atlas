import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outDir = path.resolve(__dirname, '../public/images/anatomy');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const TARGETS = [
  { name: 'heart', wikiTitle: 'Heart', file: 'heart.png' },
  { name: 'brain', wikiTitle: 'Human_brain', file: 'brain.png' },
  { name: 'lungs', wikiTitle: 'Lung', file: 'lungs.png' },
  { name: 'liver', wikiTitle: 'Liver', file: 'liver.png' },
  { name: 'stomach', wikiTitle: 'Stomach', file: 'stomach.png' },
  { name: 'kidney', wikiTitle: 'Kidney', file: 'kidney.png' },
  { name: 'skeleton', wikiTitle: 'Human_skeleton', file: 'skeleton.png' },
  { name: 'skull', wikiTitle: 'Human_skull', file: 'skull.png' },
  { name: 'spine', wikiTitle: 'Vertebral_column', file: 'spine.png' },
  { name: 'femur', wikiTitle: 'Femur', file: 'femur.png' },
  { name: 'eye', wikiTitle: 'Human_eye', file: 'eye.png' },
  { name: 'ear', wikiTitle: 'Ear', file: 'ear.png' },
  { name: 'spleen', wikiTitle: 'Spleen', file: 'spleen.png' },
  { name: 'pancreas', wikiTitle: 'Pancreas', file: 'pancreas.png' },
  { name: 'bladder', wikiTitle: 'Urinary_bladder', file: 'bladder.png' },
  { name: 'aorta', wikiTitle: 'Aorta', file: 'aorta.png' },
  { name: 'muscle', wikiTitle: 'Muscular_system', file: 'muscular.png' }
];

async function downloadImage(url, dest) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'HumanAtlasBot/1.0 (https://cool-hubble.vercel.app)' }
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(dest, buffer);
}

async function run() {
  for (const item of TARGETS) {
    const dest = path.join(outDir, item.file);
    if (fs.existsSync(dest) && fs.statSync(dest).size > 1000) {
      console.log(`Already exists: ${item.file}`);
      continue;
    }

    try {
      console.log(`Fetching wiki summary for ${item.wikiTitle}...`);
      const apiRes = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(item.wikiTitle)}`, {
        headers: { 'User-Agent': 'HumanAtlasBot/1.0 (https://cool-hubble.vercel.app)' }
      });
      if (!apiRes.ok) {
        console.warn(`Could not fetch summary for ${item.wikiTitle}: ${apiRes.status}`);
        continue;
      }
      const data = await apiRes.json();
      const imgUrl = data.thumbnail?.source || data.originalimage?.source;
      if (!imgUrl) {
        console.warn(`No image found for ${item.wikiTitle}`);
        continue;
      }
      console.log(`Downloading ${item.file} from ${imgUrl}...`);
      await downloadImage(imgUrl, dest);
      console.log(`Saved ${item.file} (${fs.statSync(dest).size} bytes)`);
    } catch (err) {
      console.error(`Failed to download ${item.file}:`, err.message);
    }
  }
  console.log('Download complete!');
}

run();
