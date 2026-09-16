export type SystemId = 'skeletal'|'muscular'|'arterial'|'venous'|'nervous'|'digestive'|'respiratory'|'urinary'|'reproductive'|'lymphatic'|'endocrine'|'integumentary'|'connective'|'sensory'|'cardiac';
export const SYSTEMS: {id:SystemId;name:string;color:string;description:string}[] = [
 {id:'skeletal',name:'Skeleton',color:'#e2d9ba',description:'Bones form the supporting framework of the body, protect organs, and provide attachment points for muscles. Their internal tissue also stores minerals and produces blood cells.'},
 {id:'muscular',name:'Muscles',color:'#a85b50',description:'Skeletal muscles generate movement by pulling on their attachments. Together with tendons, they move joints, stabilize posture, and produce heat.'},
 {id:'cardiac',name:'Heart',color:'#b96760',description:'The heart is a muscular pump with four chambers. Its valves direct blood forward through the pulmonary and systemic circuits.'},
 {id:'sensory',name:'Sensory organs',color:'#b0c8ce',description:'These structures contribute to special senses, including sight, hearing, and balance. Their specialized tissues detect stimuli and work with the nervous system to convey information.'},
 {id:'arterial',name:'Arteries',color:'#c05245',description:'The heart drives blood through the circulation. Arteries carry blood away from the heart to supply tissues or, in the pulmonary circuit, to the lungs.'},
 {id:'venous',name:'Veins',color:'#527c9f',description:'Veins return blood toward the heart. Superficial and deep networks collect blood from the tissues; the pulmonary veins bring oxygenated blood back from the lungs.'},
 {id:'nervous',name:'Nervous system',color:'#d8b565',description:'The brain, spinal cord, and peripheral nerves carry and process signals. They support sensation, movement, coordination, and automatic regulation of body functions.'},
 {id:'respiratory',name:'Respiratory',color:'#b98991',description:'The airways conduct air to the lungs, where oxygen and carbon dioxide move between air and blood. Breathing depends on pressure changes produced by respiratory muscles.'},
 {id:'digestive',name:'Digestive',color:'#b8916b',description:'The digestive tract breaks down food, absorbs nutrients and water, and moves waste onward. Accessory organs contribute bile and digestive enzymes.'},
 {id:'urinary',name:'Urinary',color:'#b47961',description:'The kidneys filter blood and regulate fluid, electrolyte, and acid–base balance. Urine travels through the ureters to the bladder and exits through the urethra.'},
 {id:'lymphatic',name:'Lymphatic',color:'#879f7c',description:'Lymphatic vessels return excess tissue fluid to the circulation. Lymph nodes and other lymphoid organs support immune surveillance and responses.'},
 {id:'endocrine',name:'Endocrine',color:'#c5a09a',description:'Endocrine organs release hormones into the blood to coordinate processes such as metabolism, growth, stress responses, and reproduction.'},
 {id:'reproductive',name:'Reproductive',color:'#bda098',description:'The male reproductive structures represented here contribute to sperm production, maturation, transport, and the production of sex hormones.'},
 {id:'integumentary',name:'Body surface',color:'#ba9b7d',description:'The body surface provides an outer anatomical reference. The integumentary system forms a protective barrier and contributes to sensation and temperature regulation.'},
 {id:'connective',name:'Connective tissue',color:'#aec3bb',description:'Cartilage, ligaments, and other connective tissues support, connect, and separate structures. Their roles include stabilizing joints and distributing mechanical loads.'},
];
export interface Part {id:string;name:string;conceptId:string;system:SystemId;chunk:number;positions:number;normals:number;indices:number;vertexCount:number;indexCount:number;bounds:[number[],number[]]}
export interface Concept {id:string;name:string;elements:string[]}
export interface Atlas {version:string;sex?:'male';source?:string;scope?:string;parts:Part[];concepts:Concept[];chunks:{url:string;bytes:number;gzip?:string;gzipBytes?:number}[];triangles:number}
export type View = 'three-quarter'|'front'|'back'|'side';
export interface SceneState {inspectorOpen?:boolean;explode:number;visible:SystemId[];selected:string[];isolate:boolean;view:View;rotate:boolean;reset:number}
export const DEFAULT_VISIBLE:SystemId[] = ['cardiac','sensory','skeletal','muscular','arterial','venous','nervous','respiratory','digestive','urinary','lymphatic','endocrine','reproductive','connective'];
export const EXPLANATIONS:Record<string,string> = {
 'heart':'A muscular pump in the chest. Its right side sends blood to the lungs; its left side sends blood through the systemic circulation.',
 'liver':'A large organ beneath the right side of the diaphragm. It processes absorbed nutrients, produces bile, and synthesizes many proteins carried in the blood.',
 'brain':'The central organ of the nervous system. Its interconnected regions support perception, movement, memory, language, and the regulation of bodily functions.',
 'stomach':'A muscular chamber between the esophagus and small intestine. It stores and mixes food with acid and enzymes before releasing it into the duodenum.',
 'spleen':'A lymphoid organ in the upper left abdomen. It filters blood, removes aging blood cells, and participates in immune responses.',
 'pancreas':'An abdominal organ with digestive and endocrine roles. It supplies enzymes to the small intestine and releases hormones including insulin and glucagon.',
 'urinary bladder':'A muscular reservoir in the pelvis that stores urine arriving from the kidneys through the ureters.',
 'trachea':'The main airway connecting the larynx to the bronchi. Its cartilage supports keep the airway open during breathing.',
 'diaphragm':'A broad muscle separating the chest and abdomen. When it contracts, it increases chest volume and helps draw air into the lungs.',
};
export function explanation(name:string,system:SystemId){return EXPLANATIONS[name.toLowerCase()] ?? SYSTEMS.find(s=>s.id===system)?.description ?? '';}

export function getPartColor(p: Part): string {
 const name = p.name.toLowerCase();
 // Heart valves -> pearly fibrous ivory/white
 if (name.includes('valve') || name.includes('cusp') || name.includes('leaflet')) return '#f1f5f9';
 // Epicardial fat / coronary sulcus adipose
 if (name.includes('fat') || name.includes('sulcus') || name.includes('adipose')) return '#d97706';
 // Pulmonary trunk / Pulmonary arteries / Vena cava / Cardiac veins / Sinuses -> deoxygenated venous blue
 if (name.includes('pulmonary trunk') || name.includes('pulmonary artery') || name.includes('vena cava') || name.includes('cardiac vein') || name.includes('coronary sinus') || name.includes('marginal vein') || p.system === 'venous') return '#2563eb';
 // Aorta / Coronary arteries / Arterial system -> oxygenated bright red
 if (name.includes('aorta') || name.includes('coronary artery') || name.includes('interventricular branch') || name.includes('conus artery') || p.system === 'arterial') return '#dc2626';
 // Heart muscle, ventricles, atria, papillary muscles, myocardium -> deep crimson red
 if (p.system === 'cardiac' || name.includes('ventricle') || name.includes('atrium') || name.includes('papillary') || name.includes('myocardium')) return '#991b1b';
 // Digestive organs
 if (p.system === 'digestive') {
  if (name.includes('liver')) return '#78350f';
  if (name.includes('gallbladder')) return '#15803d';
  if (name.includes('stomach')) return '#b8916b';
  if (name.includes('pancreas')) return '#fde047';
  if (name.includes('esophagus')) return '#f43f5e';
  return '#b8916b';
 }
 // Urinary organs
 if (p.system === 'urinary') {
  if (name.includes('kidney')) return '#9a3412';
  if (name.includes('bladder')) return '#eab308';
  return '#b47961';
 }
 // Lymphatic
 if (p.system === 'lymphatic') {
  if (name.includes('spleen')) return '#581c87';
  return '#879f7c';
 }
 // Respiratory
 if (p.system === 'respiratory') {
  if (name.includes('trachea') || name.includes('bronch') || name.includes('cartilage')) return '#cbd5e1';
  return '#f472b6';
 }
 // Nervous system
 if (p.system === 'nervous') {
  if (name.includes('brain') || name.includes('cerebr') || name.includes('cerebell')) return '#fed7aa';
  return '#eab308';
 }
 // Skeletal system
 if (p.system === 'skeletal') {
  if (name.includes('cartilage')) return '#bae6fd';
  return '#e2d9ba';
 }
 // Muscular system
 if (p.system === 'muscular') {
  if (name.includes('tendon') || name.includes('aponeurosis')) return '#f1f5f9';
  return '#a85b50';
 }
 // Connective
 if (p.system === 'connective') return '#aec3bb';
 // Sensory
 if (p.system === 'sensory') {
  if (name.includes('cornea') || name.includes('lens')) return '#e0f2fe';
  return '#b0c8ce';
 }
 return SYSTEMS.find(s => s.id === p.system)?.color ?? '#aebbb8';
}
