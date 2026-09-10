#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load atlas data
const atlasPath = resolve(__dirname, '../public/models/atlas.json');
let atlas;
try {
  atlas = JSON.parse(readFileSync(atlasPath, 'utf8'));
} catch (err) {
  process.stderr.write(`Failed to load atlas.json from ${atlasPath}: ${err.message}\n`);
  process.exit(1);
}

const SYSTEMS = [
  { id: 'skeletal', name: 'Skeleton', color: '#e2d9ba', description: 'Bones form the supporting framework of the body, protect organs, and provide attachment points for muscles.' },
  { id: 'muscular', name: 'Muscles', color: '#a85b50', description: 'Skeletal muscles generate movement by pulling on their attachments.' },
  { id: 'cardiac', name: 'Heart', color: '#b96760', description: 'The heart is a muscular pump with four chambers.' },
  { id: 'sensory', name: 'Sensory organs', color: '#b0c8ce', description: 'Specialized tissues detect stimuli and work with the nervous system to convey information.' },
  { id: 'arterial', name: 'Arteries', color: '#c05245', description: 'Arteries carry blood away from the heart to supply tissues.' },
  { id: 'venous', name: 'Veins', color: '#527c9f', description: 'Veins return blood toward the heart.' },
  { id: 'nervous', name: 'Nervous system', color: '#d8b565', description: 'Brain, spinal cord, and peripheral nerves carry and process signals.' },
  { id: 'respiratory', name: 'Respiratory', color: '#b98991', description: 'Airways conduct air to lungs for oxygen and carbon dioxide exchange.' },
  { id: 'digestive', name: 'Digestive', color: '#b8916b', description: 'Breaks down food, absorbs nutrients and water, and moves waste onward.' },
  { id: 'urinary', name: 'Urinary', color: '#b47961', description: 'Kidneys filter blood and regulate fluid, electrolyte, and acid-base balance.' },
  { id: 'lymphatic', name: 'Lymphatic', color: '#879f7c', description: 'Lymphatic vessels return excess tissue fluid to circulation.' },
  { id: 'endocrine', name: 'Endocrine', color: '#c5a09a', description: 'Endocrine organs release hormones into the blood to coordinate metabolism and growth.' },
  { id: 'reproductive', name: 'Reproductive', color: '#bda098', description: 'Male reproductive structures for gamete production and sex hormones.' },
  { id: 'integumentary', name: 'Body surface', color: '#ba9b7d', description: 'Integumentary system forms a protective barrier and thermoregulation.' },
  { id: 'connective', name: 'Connective tissue', color: '#aec3bb', description: 'Cartilage, ligaments, and fascia support and stabilize joints.' }
];

const TOOLS = [
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
    description: 'Get full clinical details, bounding coordinates, system classification, and component parts for an anatomical concept.',
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
    description: 'List all 15 anatomical systems available in the Human Atlas with descriptions.',
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
        serverInfo: { name: 'human-atlas-mcp-server', version: '1.0.0' }
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

    if (name === 'find_anatomy') {
      const q = (args?.query || '').toLowerCase().trim();
      if (!q) {
        return { jsonrpc: '2.0', id, error: { code: -32602, message: 'query parameter is required' } };
      }
      const matches = atlas.concepts
        .filter(c => c.name.toLowerCase().includes(q) || c.id.toLowerCase().includes(q))
        .slice(0, 30)
        .map(c => ({ id: c.id, name: c.name, pieces: c.elements.length }));

      return {
        jsonrpc: '2.0',
        id,
        result: { content: [{ type: 'text', text: JSON.stringify(matches, null, 2) }] }
      };
    }

    if (name === 'get_structure_details') {
      const conceptId = args?.id;
      const concept = atlas.concepts.find(c => c.id === conceptId);
      if (!concept) {
        return {
          jsonrpc: '2.0',
          id,
          result: { content: [{ type: 'text', text: `Concept ${conceptId} not found in Human Atlas.` }] }
        };
      }

      const parts = atlas.parts.filter(p => concept.elements.includes(p.id));
      const system = parts[0]?.system || 'unknown';

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
              pieces: parts.map(p => ({ id: p.id, name: p.name, bounds: p.bounds }))
            }, null, 2)
          }]
        }
      };
    }

    return { jsonrpc: '2.0', id, error: { code: -32601, message: `Tool not found: ${name}` } };
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
