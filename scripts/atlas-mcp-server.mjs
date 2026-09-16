#!/usr/bin/env node
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Base URLs for Human Atlas app and assets
const BASE_URL = 'https://cool-hubble.vercel.app';
const ALIAS_URL = 'https://human.ainibot.com';

// Candidate paths for atlas data
const candidatePaths = [
  resolve(__dirname, 'atlas.json'),
  resolve(__dirname, 'public/models/atlas.json'),
  resolve(__dirname, '../public/models/atlas.json'),
  '/opt/data/scripts/atlas-mcp/public/models/atlas.json',
  '/root/.hermes/scripts/atlas-mcp/public/models/atlas.json'
];
let atlas;
for (const p of candidatePaths) {
  if (existsSync(p)) {
    try {
      atlas = JSON.parse(readFileSync(p, 'utf8'));
      break;
    } catch {}
  }
}
if (!atlas) {
  process.stderr.write(`Failed to load atlas.json from candidate paths: ${candidatePaths.join(', ')}\n`);
  process.exit(1);
}

const femaleCandidatePaths = [
  resolve(__dirname, 'atlas-female.json'),
  resolve(__dirname, 'public/models/atlas-female.json'),
  resolve(__dirname, '../public/models/atlas-female.json'),
  '/opt/data/scripts/atlas-mcp/public/models/atlas-female.json',
  '/root/.hermes/scripts/atlas-mcp/public/models/atlas-female.json'
];
let atlasFemale = null;
for (const p of femaleCandidatePaths) {
  if (existsSync(p)) {
    try {
      atlasFemale = JSON.parse(readFileSync(p, 'utf8'));
      break;
    } catch {}
  }
}

const SYSTEMS = [
  { id: 'skeletal', name: 'Skeleton', color: '#e2d9ba', imageUrl: `${BASE_URL}/images/systems/skeletal.svg`, description: 'Bones form the supporting framework of the body, protect organs, and provide attachment points for muscles.' },
  { id: 'muscular', name: 'Muscles', color: '#a85b50', imageUrl: `${BASE_URL}/images/systems/muscular.svg`, description: 'Skeletal muscles generate movement by pulling on their attachments.' },
  { id: 'cardiac', name: 'Heart', color: '#b96760', imageUrl: `${BASE_URL}/images/systems/cardiac.svg`, description: 'The heart is a muscular pump with four chambers.' },
  { id: 'sensory', name: 'Sensory organs', color: '#b0c8ce', imageUrl: `${BASE_URL}/images/systems/sensory.svg`, description: 'Specialized tissues detect stimuli and work with the nervous system to convey information.' },
  { id: 'arterial', name: 'Arteries', color: '#c05245', imageUrl: `${BASE_URL}/images/systems/arterial.svg`, description: 'Arteries carry blood away from the heart to supply tissues.' },
  { id: 'venous', name: 'Veins', color: '#527c9f', imageUrl: `${BASE_URL}/images/systems/venous.svg`, description: 'Veins return blood toward the heart.' },
  { id: 'nervous', name: 'Nervous system', color: '#d8b565', imageUrl: `${BASE_URL}/images/systems/nervous.svg`, description: 'Brain, spinal cord, and peripheral nerves carry and process signals.' },
  { id: 'respiratory', name: 'Respiratory', color: '#b98991', imageUrl: `${BASE_URL}/images/systems/respiratory.svg`, description: 'Airways conduct air to lungs for oxygen and carbon dioxide exchange.' },
  { id: 'digestive', name: 'Digestive', color: '#b8916b', imageUrl: `${BASE_URL}/images/systems/digestive.svg`, description: 'Breaks down food, absorbs nutrients and water, and moves waste onward.' },
  { id: 'urinary', name: 'Urinary', color: '#b47961', imageUrl: `${BASE_URL}/images/systems/urinary.svg`, description: 'Kidneys filter blood and regulate fluid, electrolyte, and acid-base balance.' },
  { id: 'lymphatic', name: 'Lymphatic', color: '#879f7c', imageUrl: `${BASE_URL}/images/systems/lymphatic.svg`, description: 'Lymphatic vessels return excess tissue fluid to circulation.' },
  { id: 'endocrine', name: 'Endocrine', color: '#c5a09a', imageUrl: `${BASE_URL}/images/systems/endocrine.svg`, description: 'Endocrine organs release hormones into the blood to coordinate metabolism and growth.' },
  { id: 'reproductive', name: 'Reproductive', color: '#bda098', imageUrl: `${BASE_URL}/images/systems/reproductive.svg`, description: 'Male reproductive structures for gamete production and sex hormones.' },
  { id: 'integumentary', name: 'Body surface', color: '#ba9b7d', imageUrl: `${BASE_URL}/images/systems/integumentary.svg`, description: 'Integumentary system forms a protective barrier and thermoregulation.' },
  { id: 'connective', name: 'Connective tissue', color: '#aec3bb', imageUrl: `${BASE_URL}/images/systems/connective.svg`, description: 'Cartilage, ligaments, and fascia support and stabilize joints.' }
];

const STATIC_ANATOMY_IMAGES = {
  heart: '/images/anatomy/heart.png',
  cardiac: '/images/anatomy/heart.png',
  fma7088: '/images/anatomy/heart.png',
  'heart interior': '/images/anatomy/heart-interior.png',
  brain: '/images/anatomy/brain.png',
  fma9688: '/images/anatomy/brain.png',
  cerebrum: '/images/anatomy/brain.png',
  lungs: '/images/anatomy/lungs.png',
  lung: '/images/anatomy/lungs.png',
  fma7195: '/images/anatomy/lungs.png',
  liver: '/images/anatomy/liver.png',
  fma7197: '/images/anatomy/liver.png',
  stomach: '/images/anatomy/stomach.png',
  fma7203: '/images/anatomy/stomach.png',
  kidney: '/images/anatomy/kidney.png',
  kidneys: '/images/anatomy/kidney.png',
  'kidney interior': '/images/anatomy/kidney-interior.png',
  'renal medulla': '/images/anatomy/kidney-interior.png',
  'renal pyramid': '/images/anatomy/kidney-interior.png',
  uterus: '/images/anatomy/uterus.png',
  ovary: '/images/anatomy/ovary.png',
  ovaries: '/images/anatomy/ovary.png',
  vagina: '/images/anatomy/uterus.png',
  cervix: '/images/anatomy/uterus.png',
  prostate: '/images/anatomy/prostate.png',
  testis: '/images/anatomy/testis.png',
  testicle: '/images/anatomy/testis.png',
  penis: '/images/anatomy/reproductive.png',
  reproductive: '/images/anatomy/reproductive.png',
  skeleton: '/images/anatomy/skeleton.png',
  skull: '/images/anatomy/skull.png',
  spine: '/images/anatomy/spine.png',
  femur: '/images/anatomy/femur.png',
  eye: '/images/anatomy/eye.png',
  ear: '/images/anatomy/ear.png',
  spleen: '/images/anatomy/spleen.png',
  pancreas: '/images/anatomy/pancreas.png',
  bladder: '/images/anatomy/bladder.png',
  aorta: '/images/anatomy/aorta.png',
  muscle: '/images/systems/muscular.svg',
  muscles: '/images/systems/muscular.svg'
};

function resolveVisual(nameOrId, conceptId) {
  const norm = (nameOrId || '').toLowerCase().trim();
  for (const [k, path] of Object.entries(STATIC_ANATOMY_IMAGES)) {
    if (norm.includes(k) || (conceptId && conceptId.toLowerCase() === k)) {
      return `${BASE_URL}${path}`;
    }
  }
  return `${BASE_URL}/api/image?query=${encodeURIComponent(norm || conceptId || 'anatomy')}`;
}

const TOOLS = [
  {
    name: 'get_structure_visual',
    description: 'Get an anatomical illustration / image URL and 3D viewer interactive link for any organ, bone, or structure in the Human Atlas. Always call this tool when the user asks to "show", "display", or "see an image of" human anatomy.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Name of the organ or structure (e.g. "heart", "brain", "femur", "lungs", "liver") or FMA concept ID' }
      },
      required: ['query']
    }
  },
  {
    name: 'find_anatomy',
    description: 'Search for anatomical structures by name, partial keyword, or BodyParts3D concept identifier.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Anatomical name (e.g. "heart", "femur", "aorta") or ID' }
      },
      required: ['query']
    }
  },
  {
    name: 'get_structure_details',
    description: 'Get full clinical details, bounding coordinates, system classification, visual image URL, and component parts for an anatomical concept.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'BodyParts3D concept identifier (e.g. "FMA7088")' }
      },
      required: ['id']
    }
  },
  {
    name: 'list_systems',
    description: 'List all 15 anatomical systems available in the Human Atlas with descriptions, colors, and preview illustrations.',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  }
];

function handleRequest(req) {
  const { id, method, params } = req;

  if (method === 'initialize') {
    return {
      jsonrpc: '2.0',
      id,
      result: {
        protocolVersion: '2024-11-05',
        capabilities: { tools: {} },
        serverInfo: { name: 'human-atlas-mcp-server', version: '1.1.0' }
      }
    };
  }

  if (method === 'tools/list') {
    return { jsonrpc: '2.0', id, result: { tools: TOOLS } };
  }

  if (method === 'tools/call') {
    const { name, arguments: args } = params;

    if (name === 'list_systems') {
      return {
        jsonrpc: '2.0',
        id,
        result: { content: [{ type: 'text', text: JSON.stringify(SYSTEMS, null, 2) }] }
      };
    }

    if (name === 'get_structure_visual') {
      const q = (args?.query || '').toLowerCase().trim();
      if (!q) {
        return { jsonrpc: '2.0', id, error: { code: -32602, message: 'query parameter is required' } };
      }

      // Find concept in male atlas, then female atlas
      let concept = atlas.concepts.find(c => c.name.toLowerCase() === q || c.id.toLowerCase() === q)
        || atlas.concepts.find(c => c.name.toLowerCase().includes(q));
      let isFemale = false;
      if (!concept && atlasFemale) {
        concept = atlasFemale.concepts.find(c => c.name.toLowerCase() === q || c.id.toLowerCase() === q)
          || atlasFemale.concepts.find(c => c.name.toLowerCase().includes(q));
        if (concept) isFemale = true;
      }

      const activeAtlas = isFemale ? atlasFemale : atlas;
      const structureName = concept ? concept.name : q;
      const conceptId = concept ? concept.id : 'CUSTOM';
      const pieceCount = concept ? concept.elements.length : 1;
      const parts = concept ? activeAtlas.parts.filter(p => concept.elements.includes(p.id)) : [];
      const system = parts[0]?.system || 'general';

      const imageUrl = resolveVisual(structureName, conceptId);
      const isSlice = q.includes('interior') || q.includes('inside') || q.includes('cross section') || q.includes('slice');
      let viewerUrl = `${BASE_URL}/?id=${encodeURIComponent(conceptId)}&isolate=true`;
      if (isFemale) viewerUrl += '&sex=female';
      if (isSlice) viewerUrl += '&slice=1';

      const displayName = structureName.charAt(0).toUpperCase() + structureName.slice(1);
      const markdown = `![${displayName}](${imageUrl})\n\n[🔍 **Explore ${displayName} in 3D Interactive Atlas**](${viewerUrl})`;

      const result = {
        name: displayName,
        id: conceptId,
        system,
        sex: isFemale ? 'female' : 'male',
        pieceCount,
        imageUrl,
        viewerUrl,
        markdown,
        description: `3D model of ${displayName} containing ${pieceCount} anatomical parts in the ${system} system (${isFemale ? 'HuBMAP HRA Female' : 'BodyParts3D Male'}).`
      };

      return {
        jsonrpc: '2.0',
        id,
        result: { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] }
      };
    }

    if (name === 'find_anatomy') {
      const q = (args?.query || '').toLowerCase().trim();
      if (!q) {
        return { jsonrpc: '2.0', id, error: { code: -32602, message: 'query parameter is required' } };
      }
      const matches = atlas.concepts
        .filter(c => c.name.toLowerCase().includes(q) || c.id.toLowerCase().includes(q))
        .slice(0, 20)
        .map(c => ({
          id: c.id,
          name: c.name,
          sex: 'male',
          pieces: c.elements.length,
          imageUrl: resolveVisual(c.name, c.id),
          viewerUrl: `${BASE_URL}/?id=${c.id}&isolate=true`
        }));

      if (atlasFemale) {
        const femaleMatches = atlasFemale.concepts
          .filter(c => c.name.toLowerCase().includes(q) || c.id.toLowerCase().includes(q))
          .slice(0, 15)
          .map(c => ({
            id: c.id,
            name: c.name,
            sex: 'female',
            pieces: c.elements.length,
            imageUrl: resolveVisual(c.name, c.id),
            viewerUrl: `${BASE_URL}/?id=${c.id}&sex=female&isolate=true`
          }));
        for (const fm of femaleMatches) {
          if (!matches.some(m => m.id === fm.id || m.name.toLowerCase() === fm.name.toLowerCase())) {
            matches.push(fm);
          }
        }
      }

      return {
        jsonrpc: '2.0',
        id,
        result: { content: [{ type: 'text', text: JSON.stringify(matches, null, 2) }] }
      };
    }

    if (name === 'get_structure_details') {
      const conceptId = args?.id;
      let concept = atlas.concepts.find(c => c.id === conceptId);
      let isFemale = false;
      if (!concept && atlasFemale) {
        concept = atlasFemale.concepts.find(c => c.id === conceptId);
        if (concept) isFemale = true;
      }
      if (!concept) {
        return {
          jsonrpc: '2.0',
          id,
          result: { content: [{ type: 'text', text: `Concept ${conceptId} not found in Human Atlas.` }] }
        };
      }

      const activeAtlas = isFemale ? atlasFemale : atlas;
      const parts = activeAtlas.parts.filter(p => concept.elements.includes(p.id));
      const system = parts[0]?.system || 'unknown';
      const imageUrl = resolveVisual(concept.name, concept.id);
      const viewerUrl = `${BASE_URL}/?id=${concept.id}&isolate=true${isFemale ? '&sex=female' : ''}`;

      return {
        jsonrpc: '2.0',
        id,
        result: {
          content: [{
            type: 'text',
            text: JSON.stringify({
              id: concept.id,
              name: concept.name,
              system,
              pieceCount: concept.elements.length,
              imageUrl,
              viewerUrl,
              markdownImage: `![${concept.name}](${imageUrl})`,
              pieces: parts.map(p => ({ id: p.id, name: p.name, bounds: p.bounds }))
            }, null, 2)
          }]
        }
      };
    }

    return { jsonrpc: '2.0', id, error: { code: -32601, message: `Tool not found: ${name}` } };
  }

  if (method === 'ping') {
    return { jsonrpc: '2.0', id, result: {} };
  }

  if (method && method.startsWith('notifications/')) {
    return null;
  }

  if (id === undefined) {
    return null;
  }

  return { jsonrpc: '2.0', id, error: { code: -32601, message: `Method not supported: ${method}` } };
}

// Read line-delimited JSON-RPC from stdin
let buffer = '';
process.stdin.on('data', chunk => {
  buffer += chunk.toString();
  const lines = buffer.split('\n');
  buffer = lines.pop();

  for (const line of lines) {
    if (!line.trim()) continue;
    try {
      const req = JSON.parse(line);
      const res = handleRequest(req);
      if (res) {
        process.stdout.write(JSON.stringify(res) + '\n');
      }
    } catch (err) {
      process.stderr.write(`JSON parse error: ${err.message}\n`);
    }
  }
});
