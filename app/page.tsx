import {flushSync} from 'react-dom';
import {registerAtlasTools} from './agent-tools';
import {useEffect,useMemo,useRef,useState} from 'react';
import {Activity,ArrowUpRight,ChevronLeft,ChevronRight,Focus,Info,Layers3,Pause,RotateCcw,RotateCw,Search,X,Scissors,Split} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Badge} from '@/components/ui/badge';
import {Slider} from '@/components/ui/slider';
import {Switch} from '@/components/ui/switch';
import {Sheet,SheetContent,SheetTitle,SheetDescription} from '@/components/ui/sheet';
import {Combobox,ComboboxInput,ComboboxContent,ComboboxList,ComboboxItem,ComboboxEmpty} from '@/components/ui/combobox';
import AnatomyScene from './scene';
import {DEFAULT_VISIBLE,SYSTEMS,EXPLANATIONS,explanation,type Atlas,type Concept,type SceneState,type SystemId,type View,type AnatomySex} from './anatomy';
const initial:SceneState={explode:0,visible:DEFAULT_VISIBLE,selected:[],isolate:false,view:'three-quarter',rotate:false,reset:0,crossSection:0,crossSectionAxis:'coronal'};

export default function Home(){
 const detailTitle=useRef<HTMLHeadingElement>(null);
 const [sex,setSex]=useState<AnatomySex>(()=>{
  if(typeof window!=='undefined'){
   const p=new URLSearchParams(window.location.search);
   const s=p.get('sex')?.toLowerCase()||p.get('gender')?.toLowerCase();
   if(s==='female')return 'female';
  }
  return 'male';
 });
 const [atlas,setAtlas]=useState<Atlas|null>(null),[state,setState]=useState(initial),[progress,setProgress]=useState(0),[error,setError]=useState(''),[panel,setPanel]=useState<'layers'|'search'|null>(null),[details,setDetails]=useState(false),[about,setAbout]=useState(false),[query,setQuery]=useState(''),[chosen,setChosen]=useState<Concept|null>(null);

 useEffect(()=>{
  const abort=new AbortController();setProgress(0);setError('');setAtlas(null);setChosen(null);setDetails(false);
  setState(s=>({...initial,visible:DEFAULT_VISIBLE,reset:s.reset+1}));
  const modelUrl=sex==='female'?'/models/atlas-female.json':'/models/atlas.json';
  fetch(modelUrl,{signal:abort.signal}).then(r=>{if(!r.ok)throw new Error('The anatomy catalogue could not be loaded.');return r.json();}).then(data=>{
   const loadedAtlas=data as Atlas;setAtlas(loadedAtlas);
   try{
    if(typeof window!=='undefined'){
     const params=new URLSearchParams(window.location.search);
     const targetId=params.get('id')?.toLowerCase();
     const targetQuery=params.get('query')?.toLowerCase()||params.get('select')?.toLowerCase()||params.get('name')?.toLowerCase();
     const shouldIsolate=params.get('isolate')==='1'||params.get('isolate')==='true'||params.has('isolate');
     const shouldCross=params.get('slice')||params.get('crossSection');
     if(targetId||targetQuery){
      const found=loadedAtlas.concepts.find(c=>(targetId&&c.id.toLowerCase()===targetId)||(targetQuery&&(c.name.toLowerCase()===targetQuery||c.name.toLowerCase().includes(targetQuery))));
      if(found){setChosen(found);setState(s=>({...s,selected:found.elements,isolate:shouldIsolate,crossSection:shouldCross?0.5:0,rotate:false}));setDetails(true);}
     }
    }
   }catch{/* ignore url param errors */}
  }).catch(e=>{if(e.name!=='AbortError')setError(e.message);});
  return()=>abort.abort();
 },[sex]);

 useEffect(()=>{const key=(e:KeyboardEvent)=>{if(e.key==='/'&&!(e.target instanceof HTMLInputElement)&&!(e.target instanceof HTMLTextAreaElement)){e.preventDefault();setPanel('search');setDetails(false);}};window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key);},[]);
 const parts=useMemo(()=>new Map(atlas?.parts.map(p=>[p.id,p])),[atlas]);
 const counts=useMemo(()=>Object.fromEntries(SYSTEMS.map(s=>[s.id,atlas?.parts.filter(p=>p.system===s.id).length??0])),[atlas]);
 const activeSystems=SYSTEMS.filter(s=>counts[s.id]>0);
 const selectedParts=state.selected.map(id=>parts.get(id)).filter(p=>!!p),selected=selectedParts[0],system=SYSTEMS.find(s=>s.id===selected?.system);
 const visibleCount=atlas?.parts.filter(p=>state.isolate?state.selected.includes(p.id):state.visible.includes(p.system)||state.selected.includes(p.id)).length??0;
 const results=useMemo(()=>{
  if(!atlas)return[];const term=query.toLowerCase().trim();
  if(!term)return ['heart','brain','liver','kidney','uterus','ovary','prostate','stomach','spleen','pancreas','urinary bladder','trachea'].map(name=>atlas.concepts.find(c=>c.name.toLowerCase()===name)).filter((x):x is Concept=>!!x);
  return atlas.concepts.filter(c=>c.name.toLowerCase().includes(term)||c.id.toLowerCase().includes(term)).sort((a,b)=>a.name.length-b.name.length).slice(0,80);
 },[atlas,query]);
 const syncUrl=(id?:string,isolate?:boolean)=>{
  if(typeof window==='undefined')return;
  try{
   const url=new URL(window.location.href);
   if(id){url.searchParams.set('id',id);if(isolate)url.searchParams.set('isolate','true');else url.searchParams.delete('isolate');}
   else{url.searchParams.delete('id');url.searchParams.delete('query');url.searchParams.delete('select');url.searchParams.delete('name');url.searchParams.delete('isolate');url.searchParams.delete('slice');url.searchParams.delete('crossSection');}
   window.history.replaceState(null,'',url.toString());
  }catch{/* ignore url sync */}
 };
 const [history,setHistory]=useState<Array<{concept:Concept;isolate:boolean;crossSection:number}>>([]);
 const choose=(c:Concept,isDrilldown=false)=>{
  if(isDrilldown&&chosen&&chosen.id!==c.id){
   setHistory(h=>[...h,{concept:chosen,isolate:state.isolate,crossSection:state.crossSection??0}]);
  }else if(!isDrilldown){
   setHistory([]);
  }
  setChosen(c);setState(s=>({...s,selected:c.elements,isolate:false,rotate:false}));setDetails(true);setPanel(null);
  syncUrl(c.id,false);
 };
 useEffect(()=>{if(!atlas)return;return registerAtlasTools(atlas,c=>flushSync(()=>choose(c)));},[atlas]);
 const choosePart=(id:string)=>{
  const p=parts.get(id);if(!p)return;
  if(chosen&&chosen.id!==p.conceptId){
   setHistory(h=>[...h,{concept:chosen,isolate:state.isolate,crossSection:state.crossSection??0}]);
  }
  setChosen({id:p.conceptId,name:p.name,elements:[id]});setState(s=>({...s,selected:[id],isolate:false,rotate:false}));setDetails(true);setPanel(null);
  syncUrl(p.conceptId,false);
 };
 const goBack=()=>{
  if(history.length===0)return;
  const prev=history[history.length-1];
  setHistory(h=>h.slice(0,-1));
  setChosen(prev.concept);
  setState(s=>({...s,selected:prev.concept.elements,isolate:prev.isolate,crossSection:prev.crossSection,rotate:false}));
  setDetails(true);
  syncUrl(prev.concept.id,prev.isolate);
 };
 const toggle=(id:SystemId)=>{setDetails(false);setHistory([]);syncUrl();setState(s=>({...s,selected:[],isolate:false,visible:s.visible.includes(id)?s.visible.filter(x=>x!==id):[...s.visible,id]}));};
 const reset=()=>{setHistory([]);setState(s=>({...initial,visible:DEFAULT_VISIBLE,reset:s.reset+1}));setChosen(null);setDetails(false);setPanel(null);syncUrl();};
 const openPanel=(next:'layers'|'search')=>{setDetails(false);setPanel(p=>p===next?null:next);};

 const isHeart=chosen?.name.toLowerCase().includes('heart')||system?.id==='cardiac'||chosen?.name.toLowerCase().includes('ventricle')||chosen?.name.toLowerCase().includes('atrium');
 const isKidney=chosen?.name.toLowerCase().includes('kidney')||chosen?.name.toLowerCase().includes('renal')||system?.id==='urinary';

 return <main className="studio">
  {atlas&&<AnatomyScene atlas={atlas} state={{...state,inspectorOpen:details&&selectedParts.length>0}} onSelect={choosePart} onProgress={n=>{setProgress(n);if(n===100)setError('');}} onError={setError}/>}
  <div className="vignette"/>
   <header className="identity">
    <div className="eyebrow desktop-only"><span className="status-dot"/> INTERACTIVE ANATOMY</div>
    <div className="identity-brand">
     <h1>Human Atlas<Badge variant="outline" className="edition">3D</Badge></h1>
     <div className="sex-switcher" role="radiogroup" aria-label="Biological sex">
      <Button variant="ghost" size="sm" className={sex==='male'?'active':''} onClick={()=>setSex('male')}>
       Male ♂
      </Button>
      <Button variant="ghost" size="sm" className={sex==='female'?'active':''} onClick={()=>setSex('female')}>
       Female ♀
      </Button>
     </div>
    </div>
    <div className="identity-meta desktop-only">{atlas?atlas.parts.length.toLocaleString():sex==='female'?'2,341':'2,234'} modeled pieces <span>·</span> {sex==='female'?'Adult Female Anatomy':'Adult Male Anatomy'}</div>
   </header>
   <nav className="top-actions" aria-label="Explorer panels"><Button variant="ghost" className={`icon-button ${panel==='search'?'active':''}`} onClick={()=>openPanel('search')} aria-label="Search anatomy"><Search size={18}/><span className="desktop-only">Find a structure</span><kbd className="desktop-only">/</kbd></Button><Button variant="ghost" className="icon-button" aria-label="About this atlas" onClick={()=>{setDetails(false);setPanel(null);setAbout(true);}}><Info size={18}/></Button></nav>
   {panel&&<div className="mobile-backdrop mobile-only" onClick={()=>setPanel(null)} aria-hidden="true"/>}
   <section className={`layers-panel glass ${panel==='layers'?'mobile-open':''}`} aria-label="Anatomical layers">
    <div className="sheet-handle mobile-only" />
    <div className="panel-heading"><span>Systems</span><Button variant="ghost" className="mobile-only icon-button" onClick={()=>setPanel(null)} aria-label="Close systems"><X size={18}/></Button><Badge variant="secondary" className="desktop-only small-number">{activeSystems.length}</Badge></div>
    <div className="layer-presets">
     <Button variant="ghost" aria-pressed={activeSystems.every(x=>state.visible.includes(x.id))} onClick={()=>setState(s=>({...s,selected:[],isolate:false,visible:activeSystems.map(x=>x.id).filter(x=>x!=='pregnancy')}))}>All</Button>
     <Button variant="ghost" aria-pressed={state.visible.length===1&&state.visible[0]==='skeletal'} onClick={()=>setState(s=>({...s,selected:[],isolate:false,visible:['skeletal']}))}>Skeleton</Button>
     <Button variant="ghost" aria-pressed={['cardiac','respiratory','digestive','urinary','endocrine','reproductive'].every(id=>state.visible.includes(id as SystemId))} onClick={()=>setState(s=>({...s,selected:[],isolate:false,visible:['cardiac','respiratory','digestive','urinary','endocrine','reproductive']}))}>Organs</Button>
     <Button variant="ghost" aria-pressed={state.visible.length===1&&state.visible[0]==='reproductive'} onClick={()=>setState(s=>({...s,selected:[],isolate:false,visible:['reproductive']}))}>Reproductive</Button>
    </div>
    <div className="system-list">{activeSystems.map(s=><div className={`system-row ${state.visible.includes(s.id)?'enabled':''}`} key={s.id}><Button variant="ghost" className="system-name" title={`Show only ${s.name.toLowerCase()}`} onClick={()=>setState(v=>({...v,visible:[s.id],isolate:false,selected:[]}))}><span className="system-dot" style={{background:s.color}}/>{s.name}<span className="system-count">{counts[s.id]}</span></Button><Switch checked={state.visible.includes(s.id)} onCheckedChange={()=>toggle(s.id)} aria-label={`Show ${s.name.toLowerCase()}`} /></div>)}</div>
    <div className="panel-foot"><span>{visibleCount.toLocaleString()} pieces visible</span><Button variant="ghost" onClick={()=>setState(s=>({...s,visible:[],selected:[],isolate:false}))}>Hide all</Button></div>
   </section>
   {panel==='search'&&<section className="search-panel glass" aria-label="Find anatomy">
    <div className="sheet-handle mobile-only" />
    <div className="panel-heading"><span>Find a structure</span><Button variant="ghost" className="icon-button" onClick={()=>setPanel(null)} aria-label="Close search"><X size={18}/></Button></div>
    <div className="search-quick-tags" style={{display:'flex',gap:5,overflowX:'auto',padding:'8px 0 2px',scrollbarWidth:'none',WebkitOverflowScrolling:'touch'}}>
     {['Heart','Kidney','Uterus','Brain','Stomach','Femur','Ovaries','Lungs'].map(term => (
      <Button key={term} variant="ghost" size="sm" style={{fontSize:11,height:26,padding:'0 9px',borderRadius:13,background:'#edf0f2',color:'#475569',flexShrink:0,fontWeight:500}} onClick={() => {
        setQuery(term);
        const match = atlas?.concepts.find(c => c.name.toLowerCase() === term.toLowerCase() || c.name.toLowerCase().includes(term.toLowerCase()));
        if (match) choose(match);
      }}>
       {term}
      </Button>
     ))}
    </div>
    <Combobox<Concept> items={results} value={null} onValueChange={value=>{if(value)choose(value);}} inputValue={query} onInputValueChange={setQuery} itemToStringLabel={c=>c.name} filter={null} open onOpenChange={open=>{if(!open)setPanel(null);}}><ComboboxInput autoFocus placeholder="Heart, kidney, uterus, femur…" aria-label="Search named anatomical structures" showTrigger={false}/><ComboboxContent className="anatomy-search-results"><ComboboxEmpty>No structures match your search.</ComboboxEmpty><ComboboxList>{(c:Concept)=><ComboboxItem key={c.id} value={c}><span className="search-result-name">{c.name}</span><span className="small-number">{c.elements.length} {c.elements.length===1?'piece':'pieces'}</span></ComboboxItem>}</ComboboxList></ComboboxContent></Combobox><p className="search-note">{query?'Showing up to 80 matches. Refine your search to find smaller structures.':'Start with a major organ, or search every named structure.'}</p></section>}
   <nav className="view-controls glass" aria-label="Camera controls">{(['three-quarter','front','side','back'] as View[]).map((v,i)=><Button variant="ghost" key={v} className={state.view===v?'active':''} aria-pressed={state.view===v} disabled={state.explode>.8&&v!=='front'} onClick={()=>setState(s=>({...s,view:v,reset:s.reset+1,rotate:false}))} title={state.explode>.8&&v!=='front'?'View locked to front during exploded inventory':v==='back'?'Back (posterior) camera view':`${v} camera view`} aria-label={v==='back'?'Back (posterior) camera view':`${v} camera view`}><span>{['¾','F','S','B'][i]}</span></Button>)}<i/><Button variant="ghost" disabled={state.explode>=.4} aria-label={state.rotate?'Pause rotation':'Rotate body'} title={state.explode>=.4?'Rotation paused during exploded inventory':state.rotate?'Pause rotation':'Rotate body'} className={state.rotate?'active':''} onClick={()=>setState(s=>({...s,rotate:!s.rotate}))}>{state.rotate?<Pause size={17}/>:<RotateCw size={18}/>}</Button><Button variant="ghost" aria-label="Reset view, layers and selection" title="Reset view and layers" onClick={reset}><RotateCcw size={17}/></Button></nav>
   <div className="scene-caption"><span className="caption-line desktop-only"/><span>{state.isolate?(chosen?.name??'SELECTED STRUCTURE'):state.explode>.95?'ANATOMICAL INVENTORY':state.explode>.05?'SEPARATED STRUCTURES':sex==='female'?'ADULT FEMALE':'ADULT MALE'}</span><span className="caption-line desktop-only"/></div>
   <div className="bottom-dock glass">
    <Button variant="ghost" className="mobile-only dock-btn dock-layers" onClick={()=>openPanel('layers')} aria-label="Open system layers"><Layers3 size={18}/><span>Systems</span></Button>
    <div className="explode-control">
     <div className="explode-label"><label id="explode-label"><span className="desktop-only">Explode anatomy</span><span className="mobile-only">Explode</span></label><output>{Math.round(state.explode*100)}<span>%</span></output></div>
     <Slider aria-labelledby="explode-label" min={0} max={100} step={1} value={[state.explode*100]} onValueChange={v=>setState(s=>({...s,explode:(Array.isArray(v)?v[0]:v)/100,view:(Array.isArray(v)?v[0]:v)>80?'front':s.view,rotate:false}))}/>
     <div className="slider-endpoints desktop-only"><span>Assembled</span><span>Every piece</span></div>
    </div>
    <Button variant="ghost" className="dock-btn dock-slice" style={{padding:'6px 8px',display:'flex',flexDirection:'column',gap:3,fontSize:10,color:(state.crossSection??0)>0?'#0284c7':'#687683'}} onClick={()=>setState(s=>({...s,crossSection:(s.crossSection??0)>0?0:0.5}))} title="Cross-section inner slice">
     <Scissors size={17}/>
     <span>{(state.crossSection??0)>0?'Sliced':'Slice'}</span>
    </Button>
    <Button variant="ghost" className="dock-btn dock-reset" onClick={reset} aria-label="Assemble and reset"><RotateCcw size={17}/><span>Reset</span></Button>
   </div>
   <footer className="studio-footer desktop-only"><span>{state.explode>.8?'Drag to pan':'Drag to orbit'} <b>·</b> Pinch to zoom <b>·</b> Tap to inspect</span><Button variant="ghost" onClick={()=>{setDetails(false);setPanel(null);setAbout(true);}}>Source & credits <ArrowUpRight size={12}/></Button></footer>
  {progress<100&&!error&&<div className="loading glass" role="status"><Activity size={18}/><div><strong>Preparing the anatomy</strong><span>{progress}% · Loading {atlas?.parts.length.toLocaleString()??(sex==='female'?'2,341':'2,234')} pieces</span><div className="loading-track"><i style={{width:`${progress}%`}}/></div></div></div>}
  {error&&<div className="loading glass error" role="alert"><p>{error}</p><Button variant="ghost" onClick={()=>location.reload()}>Reload viewer</Button></div>}
  <Sheet open={details&&selectedParts.length>0} modal={false} disablePointerDismissal onOpenChange={(open)=>{setDetails(open);if(!open){setHistory([]);syncUrl();}}}><SheetContent initialFocus={detailTitle} className={`detail-sheet glass ${state.isolate?'is-isolated':''}`} showCloseButton={true}>
   <div className="sheet-handle mobile-only" />
   {history.length>0&&<Button variant="ghost" size="sm" onClick={goBack} className="detail-back-button" title={`Back to ${history[history.length-1].concept.name}`} aria-label={`Back to ${history[history.length-1].concept.name}`}><ChevronLeft size={16}/><span>Back to {history[history.length-1].concept.name}</span></Button>}
   <div className="detail-header"><div className="detail-accent" style={{background:system?.color}}/><div className="eyebrow">{system?.name??'ANATOMY'}</div><SheetTitle ref={detailTitle} tabIndex={-1} className="structure-title">{chosen?.name}</SheetTitle></div>
  <div className="detail-scroll" key={`${chosen?.id}-${state.isolate}`}>
   <SheetDescription className="structure-description">{chosen&&selected?(sex==='female'&&selected.system==='reproductive'&&!EXPLANATIONS[chosen.name.toLowerCase()]?'Female reproductive structures include the ovaries, uterine tubes, uterus, cervix, and vagina. Together they support oocyte development, fertilization, menstruation, and pregnancy.':explanation(chosen.name,selected.system)):''}</SheetDescription>
   {chosen&&!EXPLANATIONS[chosen.name.toLowerCase()]&&<span className="context-note">System overview · structure identified from source anatomy</span>}
   
   {(isHeart||isKidney)&&<div style={{marginTop:4,padding:'8px 10px',background:'#f8fafc',borderRadius:8,border:'1px solid #e2e8f0'}}>
    <div style={{fontSize:11,fontWeight:600,color:'#475569',marginBottom:6,display:'flex',alignItems:'center',gap:5}}><Split size={13}/> Internal Structures</div>
    <div className="internal-chips-scroll" style={{display:'flex',flexWrap:'nowrap',overflowX:'auto',WebkitOverflowScrolling:'touch',gap:5,paddingBottom:2}}>
     {isHeart&&['Mitral valve','Tricuspid valve','Aortic valve','Pulmonary valve','Left ventricle','Right ventricle','Papillary muscle'].map(term=><Button key={term} variant="outline" size="sm" style={{fontSize:10,height:26,padding:'0 8px',whiteSpace:'nowrap',flexShrink:0}} onClick={()=>{const t=atlas?.concepts.find(c=>c.name.toLowerCase().includes(term.toLowerCase()));if(t)choose(t,true);else{const p=atlas?.parts.find(x=>x.name.toLowerCase().includes(term.toLowerCase()));if(p)choosePart(p.id);}}}>{term}</Button>)}
     {isKidney&&['Renal pyramid','Renal pelvis','Calyx','Outer cortex','Renal papilla','Kidney capsule'].map(term=><Button key={term} variant="outline" size="sm" style={{fontSize:10,height:26,padding:'0 8px',whiteSpace:'nowrap',flexShrink:0}} onClick={()=>{const t=atlas?.concepts.find(c=>c.name.toLowerCase().includes(term.toLowerCase()));if(t)choose(t,true);else{const p=atlas?.parts.find(x=>x.name.toLowerCase().includes(term.toLowerCase()));if(p)choosePart(p.id);}}}>{term}</Button>)}
    </div>
   </div>}

   <div className="structure-meta"><span>Atlas reference<strong>{chosen?.id}</strong></span><span>Selected pieces<strong>{state.selected.length.toLocaleString()}</strong></span></div>
   {selectedParts.length>1&&<div className="member-list"><h3>Included structures</h3>{selectedParts.slice(0,50).map(p=><Button variant="ghost" key={p.id} onClick={()=>choosePart(p.id)}><span>{p.name}</span><ChevronRight size={14}/></Button>)}{selectedParts.length>50&&<p>And {selectedParts.length-50} more modeled pieces.</p>}</div>}
   <a className="source-link" href={sex==='female'?'https://doi.org/10.48539/HBM352.BTSQ.586':'https://lifesciencedb.jp/bp3d/'} target="_blank" rel="noreferrer">View anatomical source <ArrowUpRight size={14}/></a>
  </div>
  <div className="detail-actions">
   <Button className={`primary-action ${state.isolate?'active':''}`} onClick={()=>setState(s=>({...s,isolate:!s.isolate,explode:0}))}><Focus size={18}/>{state.isolate?'Show surrounding anatomy':'Isolate structure'}<ChevronRight size={16}/></Button>
   <Button className={`primary-action ${(state.crossSection??0)>0?'active':''}`} style={{marginTop:3,background:(state.crossSection??0)>0?'#1e293b':undefined}} onClick={()=>setState(s=>({...s,crossSection:(s.crossSection??0)>0?0:0.5,crossSectionAxis:s.crossSectionAxis??'coronal'}))}><Scissors size={16}/>{(state.crossSection??0)>0?'Close Cross-Section':'Slice Inside (Cross-Section)'}</Button>
   {(state.crossSection??0)>0&&<div style={{padding:'6px 2px',display:'flex',flexDirection:'column',gap:4}}>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',fontSize:10,color:'#64748b'}}>
     <span>Depth: {Math.round((state.crossSection??0)*100)}%</span>
     <div style={{display:'flex',gap:3}}>
      {(['coronal','sagittal','axial'] as const).map(ax=><button key={ax} style={{fontSize:9,padding:'2px 5px',borderRadius:3,border:'1px solid #cbd5e1',background:(state.crossSectionAxis??'coronal')===ax?'#263b48':'#ffffff',color:(state.crossSectionAxis??'coronal')===ax?'#ffffff':'#64748b'}} onClick={()=>setState(s=>({...s,crossSectionAxis:ax}))}>{ax.slice(0,3).toUpperCase()}</button>)}
     </div>
    </div>
    <Slider min={5} max={95} step={1} value={[(state.crossSection??0.5)*100]} onValueChange={v=>setState(s=>({...s,crossSection:(Array.isArray(v)?v[0]:v)/100}))}/>
   </div>}
   <Button variant="ghost" className="secondary-action" onClick={()=>{setHistory([]);setState(s=>({...s,selected:[],isolate:false,crossSection:0}));setDetails(false);syncUrl();}}>Clear selection</Button>
  </div></SheetContent></Sheet>
  <Sheet open={about} onOpenChange={setAbout}><SheetContent className="about-sheet glass"><div className="eyebrow">SOURCE & SCOPE</div><SheetTitle className="structure-title">A body, revealed.</SheetTitle><SheetDescription>Explore anatomy across two reference collections: Complete Adult Male (BodyParts3D) and Complete Adult Female (BodyParts3D + HuBMAP Human Reference Atlas).</SheetDescription><div className="about-copy">
   <p><strong>Male · BodyParts3D 4.0</strong><br/>2,234 individual meshes and 3,432 named concepts from an adult male reference anatomy, including complete skeletal, muscular, neurovascular, visceral, and male reproductive anatomy.</p>
   <p><strong>Female · Complete Reference Anatomy</strong><br/>2,341 modeled meshes representing a complete adult female body system: full skeleton (296 bones), full muscular system (402 muscles), cardiovascular, nervous, digestive with stomach, respiratory, urinary with deep renal microstructures, and complete female reproductive anatomy (ovaries, fallopian tubes, uterus, cervix, vagina, and mammary glands).</p>
   <p>Colors and system groupings are designed for interactive 3D exploration. Use the <strong>Slice (Cross-Section)</strong> tool to peer inside enclosed organs like the heart and kidneys.</p>
   <h3>Female reference collection</h3><p>Human Reference Atlas / HuBMAP (3D Reference Organ Set v1.5) & BodyParts3D. CC BY 4.0. Geometry adapted and aligned for this viewer.</p><a href="https://doi.org/10.48539/HBM352.BTSQ.586" target="_blank" rel="noreferrer">HuBMAP Reference Portal <ArrowUpRight size={14}/></a>
   <h3>Male reference collection</h3><p>BodyParts3D, © The Database Center for Life Science licensed under CC Attribution 4.0 International.</p><a href="https://dbarchive.biosciencedbc.jp/en/bodyparts3d/lic.html" target="_blank" rel="noreferrer">Dataset license <ArrowUpRight size={14}/></a><a href="https://dbarchive.biosciencedbc.jp/en/bodyparts3d/download.html" target="_blank" rel="noreferrer">BodyParts3D Archive <ArrowUpRight size={14}/></a>
  </div></SheetContent></Sheet>
 </main>;
}
