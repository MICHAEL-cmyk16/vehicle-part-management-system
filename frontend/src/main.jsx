import React, {useEffect, useMemo, useRef, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {BrowserRouter, useNavigate, useLocation} from 'react-router-dom';
import {LayoutDashboard, CarFront, Cog, QrCode, Wrench, BookOpen, Box, History, CalendarClock, LogOut, Search, Bell, Menu, X, ArrowRight, ShieldCheck, UserRound, Activity, ScanLine, Database, ChevronRight} from 'lucide-react';
import './styles.css';

const API='http://localhost:5000/api';

function App(){
  const [user,setUser]=useState(()=>JSON.parse(localStorage.getItem('vpm_user')||'null'));
  if(!user) return <Login onLogin={u=>{localStorage.setItem('vpm_user',JSON.stringify(u));setUser(u)}}/>;
  return <Shell user={user} onLogout={()=>{localStorage.removeItem('vpm_user');setUser(null)}}/>;
}

function Login({onLogin}){
  const [email,setEmail]=useState('admin@autopart.local');
  const [password,setPassword]=useState('admin123');
  const [error,setError]=useState('');
  const [loading,setLoading]=useState(false);
  async function submit(e){
    e.preventDefault();setLoading(true);setError('');
    try{const r=await fetch(API+'/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password})});const d=await r.json();if(!r.ok)throw new Error(d.message);onLogin(d)}
    catch(e){setError(e.message)} finally{setLoading(false)}
  }
  return <div className="login-page">
    <div className="login-glow"></div>
    <div className="login-brand">
      <div className="brand-mark">A</div><span>AUTO<span className="accent">CORE</span></span>
    </div>
    <div className="login-card">
      <div className="eyebrow"><ShieldCheck size={16}/> DIGITAL VEHICLE INTELLIGENCE</div>
      <h1>Vehicle Part<br/><span>Management System</span></h1>
      <p className="muted">Identify parts. Access repair intelligence. Preserve every service record.</p>
      <form onSubmit={submit}>
        <label>Email<input value={email} onChange={e=>setEmail(e.target.value)} /></label>
        <label>Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} /></label>
        {error&&<div className="error">{error}</div>}
        <button className="primary full" disabled={loading}>{loading?'Authenticating...':'Enter Command Center'} <ArrowRight size={18}/></button>
      </form>
      <div className="demo-box"><b>Demo access</b><br/>Admin: admin@autopart.local / admin123<br/>Mechanic: mechanic@autopart.local / mechanic123<br/>Owner: owner@autopart.local / owner123</div>
    </div>
    <div className="login-foot">QR IDENTIFICATION • DIGITAL SERVICE HISTORY • CAD REFERENCES</div>
  </div>
}

function Shell({user,onLogout}){
  const [mobile,setMobile]=useState(false);
  const nav=[
    ['Dashboard','/',LayoutDashboard],
    ['Vehicles','/vehicles',CarFront],
    ['Parts','/parts',Cog],
    ['QR Scanner','/scanner',QrCode],
    ['Repair History','/repairs',History],
    ['CAD Studio','/cad',Box],
    ['Maintenance','/maintenance',CalendarClock]
  ];
  return <div className="app">
    <aside className={mobile?'sidebar open':'sidebar'}>
      <div className="side-brand"><div className="brand-mark small">A</div><div><b>AUTO<span className="accent">CORE</span></b><small>PART INTELLIGENCE</small></div><button className="icon-btn mobile-close" onClick={()=>setMobile(false)}><X/></button></div>
      <div className="role-pill"><Activity size={14}/> {user.role} MODE</div>
      <nav>{nav.map(([name,path,Icon])=><NavItem key={path} name={name} path={path} Icon={Icon} close={()=>setMobile(false)}/>)}</nav>
      <div className="side-bottom"><div className="db-status"><span></span> Database online</div><button className="logout" onClick={onLogout}><LogOut size={16}/> Sign out</button></div>
    </aside>
    <main className="main">
      <header className="topbar"><button className="icon-btn menu-btn" onClick={()=>setMobile(true)}><Menu/></button><div className="crumb">AUTOMOTIVE / <b>CONTROL CENTER</b></div><div className="top-actions"><div className="search-mini"><Search size={16}/><input placeholder="Search vehicle, part..." /></div><button className="icon-btn"><Bell size={18}/></button><div className="avatar">{user.name[0]}</div></div></header>
      <div className="page"><Routes user={user}/></div>
    </main>
  </div>
}

function NavItem({name,path,Icon,close}){
  const loc=useLocation(); const nav=useNavigate(); const active=loc.pathname===path;
  return <button className={'nav-item '+(active?'active':'')} onClick={()=>{nav(path);close()}}><Icon size={18}/>{name}<ChevronRight className="nav-arrow" size={15}/></button>
}

function Routes({user}){
  const loc=useLocation();
  if(loc.pathname==='/vehicles')return <Vehicles/>;
  if(loc.pathname==='/parts')return <Parts/>;
  if(loc.pathname==='/scanner')return <Scanner/>;
  if(loc.pathname==='/repairs')return <Repairs/>;
  if(loc.pathname==='/cad')return <CAD/>;
  if(loc.pathname==='/maintenance')return <Maintenance user={user}/>;
  return <Dashboard user={user}/>;
}

function PageHead({kicker,title,desc,action}){return <div className="page-head"><div><div className="kicker">{kicker}</div><h2>{title}</h2><p>{desc}</p></div>{action}</div>}

function Dashboard(){
  const [stats,setStats]=useState({vehicles:0,parts:0,repairs:0,mechanics:0});
  const [vehicles,setVehicles]=useState([]);
  useEffect(()=>{fetch(API+'/dashboard').then(r=>r.json()).then(setStats);fetch(API+'/vehicles').then(r=>r.json()).then(setVehicles)},[]);
  return <><PageHead kicker="COMMAND CENTER" title="Vehicle Part Intelligence" desc="A single operational view of vehicles, parts, repairs and technical references." action={<button className="primary"><QrCode size={17}/> Scan a part</button>}/>
    <div className="hero-panel">
      <div><div className="eyebrow"><span className="live-dot"></span> SYSTEM OPERATIONAL</div><h3>From QR scan to<br/><span>digital repair intelligence.</span></h3><p>Every critical vehicle part gets a unique digital identity connected to its service history, manual and CAD reference.</p></div>
      <div className="hero-art"><div className="ring r1"></div><div className="ring r2"></div><div className="car-silhouette">AUTO</div><div className="scan-line"></div></div>
    </div>
    <div className="stats-grid">
      <Stat icon={CarFront} label="Registered Vehicles" value={stats.vehicles} meta="+3 this month"/>
      <Stat icon={Cog} label="Tracked Parts" value={stats.parts} meta="5 sample assemblies"/>
      <Stat icon={History} label="Repair Reports" value={stats.repairs} meta="Digital history"/>
      <Stat icon={Wrench} label="Mechanics" value={stats.mechanics} meta="Active users"/>
    </div>
    <div className="two-col">
      <section className="panel"><PanelTitle title="Vehicle Fleet" link="/vehicles"/>{vehicles.slice(0,3).map(v=><div className="vehicle-row" key={v.vehicle_id}><img src={v.image_url}/><div><b>{v.brand} {v.model}</b><small>{v.registration_no} · {v.year}</small></div><span className="status">ACTIVE</span></div>)}</section>
      <section className="panel"><PanelTitle title="Core workflow"/><Workflow n="01" icon={ScanLine} title="SCAN" text="Read unique part QR"/><Workflow n="02" icon={Database} title="IDENTIFY" text="Retrieve DBMS record"/><Workflow n="03" icon={Wrench} title="REPAIR" text="Use manual, CAD & history"/></section>
    </div>
  </>
}
function Stat({icon:Icon,label,value,meta}){return <div className="stat-card"><div className="stat-icon"><Icon/></div><div><small>{label}</small><strong>{value}</strong><span>{meta}</span></div></div>}
function PanelTitle({title,link}){const nav=useNavigate();return <div className="panel-title"><h3>{title}</h3>{link&&<button onClick={()=>nav(link)}>View all <ArrowRight size={15}/></button>}</div>}
function Workflow({n,icon:Icon,title,text}){return <div className="workflow"><span>{n}</span><Icon/><div><b>{title}</b><small>{text}</small></div></div>}

function Vehicles(){
  const [rows,setRows]=useState([]);
  useEffect(()=>{fetch(API+'/vehicles').then(r=>r.json()).then(setRows)},[]);
  return <><PageHead kicker="FLEET" title="Vehicle Registry" desc="Connected vehicles and their digital identities." action={<button className="primary"><CarFront size={17}/> Add vehicle</button>}/><div className="vehicle-grid">{rows.map(v=><div className="vehicle-card" key={v.vehicle_id}><img src={v.image_url}/><div className="vehicle-overlay"></div><div className="vehicle-info"><span className="tag">{v.year}</span><h3>{v.brand} {v.model}</h3><p>{v.registration_no} · {v.color}</p><div className="vehicle-meta"><span>VIN {v.vin?.slice(-8)}</span><span>{v.owner_name||'Unassigned'}</span></div></div></div>)}</div></>
}

function Parts(){
  const [rows,setRows]=useState([]); const [selected,setSelected]=useState(null);
  useEffect(()=>{fetch(API+'/parts').then(r=>r.json()).then(setRows)},[]);
  return <><PageHead kicker="COMPONENT LIBRARY" title="Tracked Parts" desc="Every part is connected to a QR identity, technical reference and repair history."/><div className="parts-grid">{rows.map(p=><div className="part-card" key={p.part_id} onClick={()=>setSelected(p)}><div className="part-top"><span className="part-cat">{p.category}</span><QrCode size={19}/></div><div className="part-visual"><div className="part-shape"></div></div><h3>{p.part_name}</h3><p>{p.part_number}</p><div className="part-foot"><span>{p.brand} {p.model}</span><ArrowRight size={16}/></div></div>)}</div>{selected&&<PartModal id={selected.part_id} onClose={()=>setSelected(null)}/>}</>
}

function PartModal({id,onClose}){
  const [data,setData]=useState(null);
  useEffect(()=>{fetch(API+'/parts/'+id).then(r=>r.json()).then(setData)},[id]);
  if(!data)return <div className="modal-back"><div className="modal">Loading...</div></div>;
  return <div className="modal-back" onClick={onClose}><div className="modal large" onClick={e=>e.stopPropagation()}><button className="modal-close" onClick={onClose}><X/></button><div className="modal-kicker">{data.category} / {data.part_number}</div><h2>{data.part_name}</h2><p>{data.description}</p><div className="modal-grid"><div className="info-box"><QrCode/><b>{data.qr_value}</b><small>Unique QR identity</small></div><div className="info-box"><BookOpen/><b>{data.manuals.length} Manual</b><small>Technical documentation</small></div><div className="info-box"><Box/><b>{data.cad.length} CAD Reference</b><small>3D / exploded views</small></div></div><h3 className="section-label">Recent repair history</h3>{data.history.map(h=><div className="history-line" key={h.report_id}><div className="date">{new Date(h.repair_date).toLocaleDateString()}</div><div><b>{h.problem}</b><p>{h.action_taken}</p><small>{h.mechanic_name} · ₹{h.cost}</small></div></div>)}</div></div>
}

function Scanner(){
  const [value,setValue]=useState('PART-TNX-BRK-001'); const [data,setData]=useState(null); const [msg,setMsg]=useState('');
  const scanRef=useRef(null);
  async function lookup(v=value){setMsg('');try{const r=await fetch(API+'/parts/qr/'+encodeURIComponent(v));const d=await r.json();if(!r.ok)throw Error(d.message);setData(d)}catch(e){setData(null);setMsg(e.message)}}
  useEffect(()=>{let scanner; if(scanRef.current){import('html5-qrcode').then(({Html5Qrcode})=>{scanner=new Html5Qrcode('reader');scanner.start({facingMode:'environment'},{fps:10,qrbox:{width:230,height:230}},text=>{setValue(text);lookup(text);scanner.stop().catch(()=>{})},()=>{}).catch(()=>{})})}return()=>{scanner?.stop().catch(()=>{})}},[]);
  return <><PageHead kicker="FIELD TOOL" title="QR Part Scanner" desc="Scan a component identity or enter a QR value manually."/><div className="scanner-layout"><div className="scanner-box"><div id="reader" ref={scanRef}></div><div className="scan-corner"></div><p>Point the camera at a registered part QR code.</p></div><div className="lookup-panel"><div className="eyebrow"><QrCode size={16}/> MANUAL LOOKUP</div><input value={value} onChange={e=>setValue(e.target.value)} placeholder="PART-TNX-BRK-001"/><button className="primary full" onClick={()=>lookup()}>Identify part <ArrowRight size={17}/></button>{msg&&<div className="error">{msg}</div>}{data&&<div className="scan-result"><span className="status">IDENTIFIED</span><h3>{data.part_name}</h3><p>{data.part_number} · {data.category}</p><div className="result-row"><span>Vehicle</span><b>{data.brand} {data.model}</b></div><div className="result-row"><span>Position</span><b>{data.position_label||'Assembly'}</b></div><button className="secondary" onClick={()=>window.location.hash='cad'}>Open technical references <ArrowRight size={15}/></button></div>}</div></div></>
}

function Repairs(){
  const [parts,setParts]=useState([]);
  const [selected,setSelected]=useState(null);
  useEffect(()=>{fetch(API+'/parts').then(r=>r.json()).then(setParts)},[]);
  return <><PageHead kicker="SERVICE INTELLIGENCE" title="Repair History" desc="Digital records preserve what was repaired, when, why and by whom."/><div className="repair-list">{parts.map(p=><RepairItem key={p.part_id} p={p} onClick={()=>setSelected(p.part_id)}/>)}</div>{selected&&<PartModal id={selected} onClose={()=>setSelected(null)}/>}</>
}
function RepairItem({p,onClick}){return <div className="repair-card"><div className="repair-icon"><Wrench/></div><div><span className="kicker">{p.part_number}</span><h3>{p.part_name}</h3><p>{p.brand} {p.model} · {p.registration_no}</p></div><button className="secondary" onClick={onClick}>View history <ArrowRight size={15}/></button></div>}

function CAD(){
  const [type,setType]=useState('brake'); const nav=useNavigate();
  return <><PageHead kicker="TECHNICAL LAB" title="CAD Studio" desc="Interactive demonstration references for critical automotive assemblies." action={<div className="tabs">{[['brake','Brake'],['engine','Engine'],['suspension','Suspension']].map(([v,t])=><button className={type===v?'tab active':'tab'} onClick={()=>setType(v)} key={v}>{t}</button>)}</div>}/><div className="cad-layout"><div className="cad-view"><div className="cad-grid"></div><CADModel type={type}/><div className="cad-hud"><span>3D REFERENCE</span><b>ORBIT · ZOOM · INSPECT</b></div></div><div className="cad-info"><div className="eyebrow"><Box size={16}/> CAD REFERENCE</div><h3>{type==='brake'?'Front Brake Assembly':type==='engine'?'Oil Filter Assembly':'Front Suspension Strut'}</h3><p>Demonstration 3D model for the vehicle part management workflow. Replace with your actual CAD/GLB/OBJ files when available.</p><div className="spec-list"><div><span>MODEL TYPE</span><b>3D Assembly</b></div><div><span>REFERENCE</span><b>VPM-CAD-00{type==='brake'?1:type==='engine'?2:3}</b></div><div><span>STATUS</span><b className="accent">VERIFIED</b></div></div><button className="primary full"><Box size={17}/> Open exploded view</button></div></div></>
}
function CADModel({type}){
  return <div className="fake-cad"><div className={'cad-object '+type}><div className="cad-ring"></div><div className="cad-core"></div><div className="cad-arm a"></div><div className="cad-arm b"></div><div className="cad-label">3D</div></div></div>
}

function Maintenance({user}){
  const [rows,setRows]=useState([]);
  useEffect(()=>{fetch(API+'/maintenance/'+(user.user_id||3)).then(r=>r.json()).then(setRows)},[user.user_id]);
  return <><PageHead kicker="LIFECYCLE" title="Maintenance Schedule" desc="Upcoming maintenance events connected to each vehicle."/><div className="maintenance-grid">{rows.map(r=><div className="maint-card" key={r.maintenance_id}><div className="maint-date"><span>{new Date(r.due_date).toLocaleString('en',{month:'short'})}</span><b>{new Date(r.due_date).getDate()}</b></div><div><span className="status">{r.status}</span><h3>{r.title}</h3><p>{r.brand} {r.model} · {r.registration_no}</p></div><CalendarClock/></div>)}</div></>
}

createRoot(document.getElementById('root')).render(<BrowserRouter><App/></BrowserRouter>);
