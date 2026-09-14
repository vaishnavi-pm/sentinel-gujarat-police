/* =========================================================
   SENTINEL — prototype application state & logic
   Synthetic demo data only. No connection to real systems.
========================================================= */
const state = {
  screen: 'command',
  query: 'Find the vehicle near Ellisbridge around 8 PM',
  matchStatus: 'none', // none | pending | verified | rejected
  evidence: null,
  auditLog: [],
  federatedDone: false,
};

const CASE_ID = 'GJ-2026-0914-001';

const MATCH = {
  plate: 'GJ-01-AB-1234',
  confidence: 96,
  hits: [
    {cam:'CAM-001', loc:'Ellisbridge', time:'19:58:14', conf:96},
    {cam:'CAM-014', loc:'Ellisbridge', time:'20:03:41', conf:94},
    {cam:'CAM-031', loc:'Ashram Road', time:'20:11:07', conf:89},
    {cam:'CAM-063', loc:'Maninagar',   time:'20:24:32', conf:87},
  ]
};

const CAMERAS = [
  {id:'CAM-044', loc:'SG Highway',  status:'warn', note:'BLIND SPOT'},
  {id:'CAM-057', loc:'Kalupur',     status:'off',  note:'TAMPER ALERT'},
  {id:'CAM-031', loc:'Ashram Road', status:'ok',   note:'OPERATIONAL'},
  {id:'CAM-063', loc:'Maninagar',   status:'ok',   note:'OPERATIONAL'},
  {id:'CAM-001', loc:'Ellisbridge', status:'ok',   note:'OPERATIONAL'},
  {id:'CAM-014', loc:'Ellisbridge', status:'ok',   note:'OPERATIONAL'},
  {id:'CAM-089', loc:'Navrangpura', status:'warn', note:'LOW LIGHT DEGRADED'},
];

const NAV_ITEMS = [
  {id:'command', label:'COMMAND', icon:'&#9673;'},
  {id:'voice', label:'AI SEARCH', icon:'&#9670;', group:'search'},
  {id:'investigations', label:'INVESTIGATIONS', icon:'&#9632;'},
  {id:'camera', label:'CAMERA NETWORK', icon:'&#9678;'},
  {id:'evidence', label:'EVIDENCE', icon:'&#9632;'},
  {id:'audit', label:'AUDIT', icon:'&#9776;'},
  {id:'system', label:'SYSTEM', icon:'&#9881;'},
];

function fmtTime(d){
  return d.toTimeString().slice(0,8);
}

function logAudit(action, detailHtml){
  state.auditLog.push({time: fmtTime(new Date()), action, detail: detailHtml});
}

function toast(msg){
  const t = document.getElementById('toast');
  document.getElementById('toastText').textContent = msg;
  t.classList.add('show');
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(()=>t.classList.remove('show'), 3200);
}

async function sha256Hex(str){
  const enc = new TextEncoder().encode(str);
  const buf = await crypto.subtle.digest('SHA-256', enc);
  return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,'0')).join('');
}

function navigateTo(screen){
  state.screen = screen;
  render();
}

/* ---------------- RENDER: SHELL ---------------- */
function renderNav(){
  const nav = document.getElementById('nav');
  const searchScreens = ['voice','federated','match','journey','verify','rejected'];
  nav.innerHTML = NAV_ITEMS.map(item=>{
    const isActive = item.id === state.screen || (item.group==='search' && searchScreens.includes(state.screen));
    return `<div class="nav-item ${isActive?'active':''}" data-nav="${item.id}">
      <span class="nav-ic">${item.icon}</span>${item.label}<span class="nav-badge"></span>
    </div>`;
  }).join('');
  nav.querySelectorAll('[data-nav]').forEach(el=>{
    el.addEventListener('click', ()=>{
      const id = el.dataset.nav;
      if(id==='voice') navigateTo(state.federatedDone || state.matchStatus!=='none' ? 'match' : 'voice');
      else navigateTo(id);
    });
  });
}

const TITLES = {
  command:'Command Dashboard', voice:'AI Search — Query Understanding', federated:'Federated Search',
  match:'Vehicle Match', journey:'Cross-Camera Journey', verify:'Officer Verification',
  rejected:'Match Rejected', evidence:'Evidence Locker', audit:'Audit Trail',
  camera:'Camera Network Health', architecture:'System Architecture',
  investigations:'Investigations', system:'System'
};

function renderTopbar(){
  document.getElementById('screenTitle').textContent = TITLES[state.screen] || 'SENTINEL';
  document.getElementById('caseChip').textContent = CASE_ID;
}

function tickClock(){
  document.getElementById('clock').textContent = fmtTime(new Date());
}
setInterval(tickClock, 1000);

/* ---------------- RENDER: SCREENS ---------------- */

function screenCommand(){
  return `
  <div class="screen">
    <div class="eyebrow">GUJARAT POLICE · UNIFIED VIDEO INTELLIGENCE</div>
    <h1 class="hero">Officers don't need more footage.<br>They need answers from the footage they already have.</h1>
    <p class="lede">SENTINEL connects your existing, disconnected CCTV and VMS systems into one searchable, verifiable and auditable investigation layer — without replacing a single camera.</p>

    <div class="command-top">
      <div style="flex:1;">
        <div class="search-box">
          <span style="color:var(--text-faint); font-size:15px;">&#128269;</span>
          <input id="queryInput" type="text" value="${state.query}" placeholder="Describe what you're looking for...">
          <div class="mic-btn" id="micBtn" title="Voice query">&#127908;</div>
        </div>
        <div class="btn-row">
          <button class="btn btn-primary" id="runSearchBtn">Search</button>
          <button class="btn btn-ghost" id="viewInvestigationsBtn">View Case File</button>
        </div>
      </div>
      <div class="officer-card">
        <div class="label">OFFICER CONSOLE</div>
        <div class="row"><span>Officer</span><span>Demo Officer 047</span></div>
        <div class="row"><span>Case</span><span>${CASE_ID}</span></div>
        <div class="row"><span>Jurisdiction</span><span>Ahmedabad City</span></div>
        <div class="sys-ok"><span>&#9679;</span> SYSTEM OPERATIONAL</div>
      </div>
    </div>

    <div class="stat-row">
      <div class="stat"><div class="num">80,000+</div><div class="cap">Cameras in ecosystem (demo)</div></div>
      <div class="stat"><div class="num">6</div><div class="cap">VMS platforms federated</div></div>
      <div class="stat"><div class="num">${state.auditLog.length}</div><div class="cap">Actions logged this session</div></div>
      <div class="stat"><div class="num">${state.matchStatus==='verified'?'1':'0'}</div><div class="cap">Evidence items sealed</div></div>
    </div>

    <div class="disclaimer-strip" style="margin-top:30px;">
      <span class="ic">&#9888;</span>
      All footage, plates, and camera data on this platform are synthetic demo data generated for the Gujarat Police Innovation Challenge. No connection to live Gujarat Police infrastructure.
    </div>
  </div>`;
}

function screenVoice(){
  return `
  <div class="screen">
    <div class="section-head">VOICE QUERY</div>
    <div class="voice-panel">
      <div class="eyebrow" style="justify-content:center; display:block;">LISTENING</div>
      <div class="waveform" id="waveform"></div>
      <div class="gj-text">"Ellisbridge પાસે રાત્રે 8 વાગ્યે આવેલી ગાડી શોધો"</div>
      <div class="gj-translit">"Find the vehicle that came near Ellisbridge at 8 PM"</div>
    </div>

    <div class="section-head" style="margin-top:34px; text-align:center;">SENTINEL UNDERSTANDS</div>
    <div class="parse-grid">
      <div class="parse-cell"><div class="k">LOCATION</div><div class="v">Ellisbridge</div></div>
      <div class="parse-cell"><div class="k">TIME WINDOW</div><div class="v">20:00 &plusmn; 1 hour</div></div>
      <div class="parse-cell"><div class="k">OBJECT CLASS</div><div class="v">Vehicle</div></div>
      <div class="parse-cell"><div class="k">PLATE</div><div class="v">Any</div></div>
    </div>

    <div style="text-align:center; margin-top:28px;">
      <button class="btn btn-primary" id="toFederatedBtn">Search Across Camera Network &rarr;</button>
    </div>
  </div>`;
}

function screenFederated(){
  return `
  <div class="screen">
    <div class="section-head">FEDERATED SEARCH</div>
    <div class="vms-row">
      <div class="vms-chip"><span class="ck">&#10003;</span> VMS-A</div>
      <div class="vms-chip"><span class="ck">&#10003;</span> VMS-B</div>
      <div class="vms-chip"><span class="ck">&#10003;</span> VMS-C</div>
      <div class="vms-chip"><span class="ck">&#10003;</span> Legacy VMS</div>
      <div class="vms-chip" style="color:var(--text-faint);">6 camera nodes searched</div>
    </div>

    <div class="progress-list" id="progressList">
      ${['Understanding query','Resolving location','Searching VMS-A','Searching VMS-B','Searching VMS-C','Ranking matches']
        .map((t,i)=>`<div class="progress-item" data-i="${i}"><span class="ic"></span>${t}</div>`).join('')}
    </div>

    <div class="callout">We don't replace the existing cameras. We connect them.</div>

    <div style="margin-top:26px;" id="federatedContinue"></div>
  </div>`;
}

function thumbSVGCar(seed){
  return `<svg viewBox="0 0 46 20" xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="8" width="38" height="8" rx="2" fill="#cdd6df" opacity="0.55"/>
    <rect x="12" y="3" width="20" height="8" rx="2" fill="#cdd6df" opacity="0.4"/>
    <circle cx="12" cy="17" r="3" fill="#0A0D12" stroke="#cdd6df" stroke-width="1" opacity="0.6"/>
    <circle cx="34" cy="17" r="3" fill="#0A0D12" stroke="#cdd6df" stroke-width="1" opacity="0.6"/>
  </svg>`;
}

function screenMatch(){
  const hits = MATCH.hits.map(h=>`
    <div class="thumb">
      <div class="thumb-frame">
        <div class="thumb-ts">${h.time}</div>
        <div class="thumb-rec"><span class="rd"></span>REC</div>
        <div class="thumb-car">${thumbSVGCar()}</div>
      </div>
      <div class="thumb-meta">
        <div class="cam">${h.cam}</div>
        <div class="loc">${h.loc}</div>
        <div class="conf">${h.conf}% match confidence</div>
      </div>
    </div>`).join('');

  return `
  <div class="screen">
    <div class="section-head">POTENTIAL VEHICLE MATCH</div>
    <div class="match-hero">
      <div class="plate">${MATCH.plate}</div>
      <div class="conf-block">
        <div class="conf-num" id="confNum">0%</div>
        <div class="conf-label">AI match confidence</div>
        <div class="conf-bar"><div class="conf-fill" id="confFill"></div></div>
      </div>
      <div class="ai-flag">
        <span class="badge-warn">&#9888; AI-ASSISTED MATCH</span>
        <span style="font-size:11px; color:var(--text-faint);">Requires officer verification</span>
      </div>
    </div>

    <div class="section-head">SYNTHETIC CCTV DETECTIONS</div>
    <div class="thumb-grid">${hits}</div>

    <div class="disclaimer-strip">
      <span class="ic">&#9888;</span>
      AI-generated results are decision-support outputs and require authorized officer verification. This is a candidate match, not a confirmed identification.
    </div>

    <div class="btn-row">
      <button class="btn btn-primary" id="toJourneyBtn">View Cross-Camera Journey &rarr;</button>
      <button class="btn btn-ghost" id="skipToVerifyBtn">Skip to Verification</button>
    </div>
  </div>`;
}

function screenJourney(){
  const stops = ['Ellisbridge','Ellisbridge','Ashram Road','Maninagar'];
  const nodesSVG = MATCH.hits.map((h,i)=>{
    const y = 40 + i*90;
    return `
      <circle cx="60" cy="${y}" r="7" fill="#0F141B" stroke="#33B0A6" stroke-width="2"/>
      ${i < MATCH.hits.length-1 ? `<line x1="60" y1="${y+7}" x2="60" y2="${y+83}" stroke="#212A36" stroke-width="2" stroke-dasharray="3,4"/>` : ''}
      <text x="82" y="${y+4}" fill="#E7ECF2" font-size="13" font-weight="600" font-family="ui-monospace,monospace">${h.cam}</text>
      <text x="82" y="${y+20}" fill="#8B97A6" font-size="11">${h.loc} &middot; ${h.time}</text>
    `;
  }).join('');

  return `
  <div class="screen">
    <div class="section-head">ONE VEHICLE &rarr; MULTIPLE CAMERAS &rarr; CONTINUOUS JOURNEY</div>
    <div class="journey-wrap">
      <div class="journey-map">
        <svg width="100%" height="360" viewBox="0 0 400 360">${nodesSVG}</svg>
      </div>
      <div class="journey-list">
        <div class="section-head">MATCH CONFIDENCE BY NODE</div>
        ${MATCH.hits.map(h=>`
          <div class="jrow">
            <div><div class="jcam">${h.cam}</div><div class="jloc">${h.loc}</div></div>
            <div class="jconf">${h.conf}%</div>
          </div>`).join('')}
        <div class="callout" style="margin-top:20px;">Vehicle GJ-01-AB-1234 tracked across 4 independent camera nodes over 26 minutes.</div>
      </div>
    </div>
    <div class="btn-row">
      <button class="btn btn-primary" id="toVerifyBtn">Proceed to Officer Verification &rarr;</button>
    </div>
  </div>`;
}

function screenVerify(){
  return `
  <div class="screen verify-panel">
    <div class="section-head" style="text-align:center;">AI RESULT</div>
    <div class="verify-card">
      <div class="kv-row"><span>Result type</span><span>Potential vehicle match</span></div>
      <div class="kv-row"><span>Vehicle</span><span>${MATCH.plate}</span></div>
      <div class="kv-row"><span>Confidence</span><span>${MATCH.confidence}%</span></div>
      <div class="kv-row"><span>Camera</span><span>CAM-001</span></div>
      <div class="kv-row"><span>Time</span><span>19:58:14</span></div>
      <div class="kv-row"><span>Location</span><span>Ellisbridge</span></div>
      <div class="verify-actions">
        <button class="btn btn-danger" id="rejectBtn">&#10007; Reject Match</button>
        <button class="btn btn-teal" id="verifyBtn">&#10003; Verify Match</button>
      </div>
    </div>
    <div class="verify-banner">AI assists. Officer decides.</div>
  </div>`;
}

function screenRejected(){
  return `
  <div class="screen">
    <div class="state-result">
      <div class="state-icon no">&#10007;</div>
      <h2>Match Rejected</h2>
      <p>Officer 047 rejected the candidate match for ${MATCH.plate}. The candidate has been removed from active consideration and the rejection has been logged to the audit trail.</p>
      <div class="btn-row" style="justify-content:center; margin-top:26px;">
        <button class="btn btn-primary" id="searchAgainBtn">Search Again</button>
        <button class="btn btn-ghost" id="toAuditFromRejectBtn">View Audit Trail</button>
      </div>
    </div>
  </div>`;
}

function screenEvidence(){
  if(state.matchStatus !== 'verified' || !state.evidence){
    return `
    <div class="screen">
      <div class="empty-state">
        <div class="glyph">&#128274;</div>
        <h3>No evidence sealed yet</h3>
        <p>Evidence is created automatically once an officer verifies an AI-assisted match. Run a search and verify a match to seal your first evidence record.</p>
        <button class="btn btn-primary" id="startSearchFromEmptyBtn">Start a Search</button>
      </div>
    </div>`;
  }
  const ev = state.evidence;
  return `
  <div class="screen">
    <div class="evidence-card">
      <div class="seal-badge">&#128274; EVIDENCE SEALED</div>
      <div class="kv-row"><span>Case</span><span>${CASE_ID}</span></div>
      <div class="kv-row"><span>Evidence type</span><span>Verified vehicle detection</span></div>
      <div class="kv-row"><span>Vehicle</span><span>${MATCH.plate}</span></div>
      <div class="kv-row"><span>Camera</span><span>CAM-001</span></div>
      <div class="kv-row"><span>Time</span><span>19:58:14</span></div>
      <div class="kv-row"><span>Location</span><span>Ellisbridge</span></div>
      <div class="kv-row"><span>AI confidence</span><span>${MATCH.confidence}%</span></div>
      <div class="kv-row"><span>Verified by</span><span>Officer 047</span></div>

      <div class="hash-block">
        <div class="k">SHA-256 EVIDENCE HASH</div>
        <div class="v">${ev.hash}</div>
      </div>

      <div class="evidence-actions">
        <button class="btn btn-primary" id="exportManifestBtn">Export Evidence Manifest</button>
        <button class="btn btn-ghost" id="viewAuditFromEvidenceBtn">View Audit Trail</button>
      </div>
    </div>
  </div>`;
}

function screenAudit(){
  const entries = state.auditLog.length ? state.auditLog.map(e=>`
    <div class="audit-entry">
      <div class="at">${e.time}</div>
      <div class="aaction">${e.action}</div>
      <div class="adetail">${e.detail}</div>
    </div>`).join('') : `<p style="color:var(--text-faint); font-size:13px;">No actions logged yet this session. Every search, match, verification and seal will appear here automatically.</p>`;
  return `
  <div class="screen">
    <div class="section-head">WHO SEARCHED &middot; WHAT THEY SEARCHED &middot; WHEN &middot; UNDER WHICH CASE</div>
    <div class="audit-list">${entries}</div>
  </div>`;
}

function screenCamera(){
  const ok = CAMERAS.filter(c=>c.status==='ok').length;
  const warn = CAMERAS.filter(c=>c.status==='warn').length;
  const off = CAMERAS.filter(c=>c.status==='off').length;
  const pillClass = {ok:'pill-ok', warn:'pill-warn', off:'pill-off'};
  const pillText = {ok:'OPERATIONAL', warn:'NEEDS ATTENTION', off:'TAMPER ALERT'};
  return `
  <div class="screen">
    <div class="eyebrow">80,000+ CAMERA ECOSYSTEM (DEMO SUBSET)</div>
    <div class="section-head">CAMERA HEALTH</div>
    <div class="cam-summary">
      <div class="cam-stat"><div class="n" style="color:var(--green)">${ok}</div><div class="l">Active</div></div>
      <div class="cam-stat"><div class="n" style="color:var(--amber)">${warn}</div><div class="l">Needs attention</div></div>
      <div class="cam-stat"><div class="n" style="color:var(--red)">${off}</div><div class="l">Offline / tamper</div></div>
    </div>
    <div class="cam-grid">
      ${CAMERAS.map(c=>`
        <div class="cam-card">
          <div><div class="cid">${c.id}</div><div class="cloc">${c.loc}</div></div>
          <span class="pill ${pillClass[c.status]}">${pillText[c.status]}</span>
        </div>`).join('')}
    </div>
    <div class="callout">Most systems assume cameras work. Sentinel verifies them.</div>
    <div class="synth-tag">&#9888; All figures are demo/synthetic and do not reflect live camera status.</div>
  </div>`;
}

function screenArchitecture(){
  return `
  <div class="screen">
    <div class="section-head" style="text-align:center;">SENTINEL AS AN INTELLIGENCE LAYER OVER EXISTING INFRASTRUCTURE</div>
    <div class="arch-flow">
      <div class="arch-node">EXISTING CCTV</div>
      <div class="arch-arrow">&#8595;</div>
      <div class="arch-node dim">RTSP / ONVIF / VMS ADAPTERS</div>
      <div class="arch-arrow">&#8595;</div>
      <div class="arch-node dim">FEDERATION &amp; NORMALIZATION</div>
      <div class="arch-arrow">&#8595;</div>
      <div class="arch-node dim">EDGE AI</div>
      <div class="arch-arrow">&#8595;</div>
      <div class="arch-node dim">METADATA + EMBEDDINGS</div>
      <div class="arch-arrow">&#8595;</div>
      <div class="arch-node" style="border-color:var(--gold); color:var(--gold);">SENTINEL INTELLIGENCE</div>
      <div class="arch-arrow">&#8595;</div>
      <div class="arch-branch">
        <div class="arch-node">SEARCH</div>
        <div class="arch-node">TRACKING</div>
        <div class="arch-node">HEALTH</div>
      </div>
      <div class="arch-arrow">&#8595;</div>
      <div class="arch-node dim">EVIDENCE + AUDIT</div>
      <div class="arch-arrow">&#8595;</div>
      <div class="arch-node">POLICE OFFICER</div>
    </div>
  </div>`;
}

function screenInvestigations(){
  const steps = [
    {t:'Query submitted', done: state.auditLog.some(a=>a.action==='SEARCH')},
    {t:'Federated search across 6 VMS nodes', done: state.federatedDone},
    {t:'AI candidate match generated', done: state.matchStatus!=='none'},
    {t:'Officer verification', done: state.matchStatus==='verified' || state.matchStatus==='rejected'},
    {t:'Evidence sealed', done: state.matchStatus==='verified'},
  ];
  let activeSet=false;
  return `
  <div class="screen">
    <div class="eyebrow">CASE FILE</div>
    <h1 class="hero" style="font-size:24px;">${CASE_ID}</h1>
    <p class="lede">Query: "${state.query}" &middot; Jurisdiction: Ahmedabad City &middot; Lead: Officer 047</p>

    <div class="case-summary">
      <div class="stat"><div class="num">${state.matchStatus==='none'?'—':MATCH.confidence+'%'}</div><div class="cap">Top match confidence</div></div>
      <div class="stat"><div class="num">${state.matchStatus==='verified'?'Sealed':state.matchStatus==='rejected'?'Rejected':'Pending'}</div><div class="cap">Evidence status</div></div>
      <div class="stat"><div class="num">${state.auditLog.length}</div><div class="cap">Logged actions</div></div>
    </div>

    <div class="section-head" style="margin-top:32px;">INVESTIGATION PROGRESS</div>
    <div class="step-track">
      ${steps.map((s,i)=>{
        let cls='';
        if(s.done) cls='complete';
        else if(!activeSet){ cls='active'; activeSet=true; }
        return `<div class="step-row ${cls}"><div class="sn">${s.done?'&#10003;':i+1}</div><div><div class="stitle">${s.t}</div></div></div>`;
      }).join('')}
    </div>
    <div class="btn-row">
      <button class="btn btn-primary" id="continueInvestigationBtn">Continue Investigation &rarr;</button>
      <button class="btn btn-ghost" id="toArchFromInvestBtn">View System Architecture</button>
    </div>
  </div>`;
}

function screenSystem(){
  return `
  <div class="screen">
    <div class="section-head">SYSTEM</div>
    <div class="panel" style="max-width:640px;">
      <div class="kv-row"><span>Platform</span><span>SENTINEL v1.0 (Prototype)</span></div>
      <div class="kv-row"><span>Deployment</span><span>Demo / Synthetic Data</span></div>
      <div class="kv-row"><span>Federated VMS nodes</span><span>6</span></div>
      <div class="kv-row"><span>Camera ecosystem (demo)</span><span>80,000+</span></div>
      <div class="kv-row"><span>Session actions logged</span><span>${state.auditLog.length}</span></div>
    </div>

    <div class="section-head" style="margin-top:26px;">RESPONSIBLE AI</div>
    <div class="disclaimer-strip" style="max-width:640px;">
      <span class="ic">&#9888;</span>
      AI-generated results are decision-support outputs and require authorized officer verification. SENTINEL never assigns guilt or confirms identity — it surfaces potential matches for human review.
    </div>

    <button class="btn btn-ghost" id="toArchBtn" style="margin-top:20px;">View System Architecture</button>

    <div class="final-banner">
      <p>"Sentinel doesn't replace Gujarat's cameras. It makes them searchable, intelligent, verifiable and accountable."</p>
    </div>
  </div>`;
}

/* ---------------- MASTER RENDER ---------------- */
function render(){
  renderNav();
  renderTopbar();
  const content = document.getElementById('content');
  let html = '';
  switch(state.screen){
    case 'command': html = screenCommand(); break;
    case 'voice': html = screenVoice(); break;
    case 'federated': html = screenFederated(); break;
    case 'match': html = screenMatch(); break;
    case 'journey': html = screenJourney(); break;
    case 'verify': html = screenVerify(); break;
    case 'rejected': html = screenRejected(); break;
    case 'evidence': html = screenEvidence(); break;
    case 'audit': html = screenAudit(); break;
    case 'camera': html = screenCamera(); break;
    case 'architecture': html = screenArchitecture(); break;
    case 'investigations': html = screenInvestigations(); break;
    case 'system': html = screenSystem(); break;
    default: html = screenCommand();
  }
  content.innerHTML = html;
  content.scrollTop = 0;
  attachHandlers();
  postRenderEffects();
}

/* ---------------- EFFECTS (per-screen JS after paint) ---------------- */
function postRenderEffects(){
  if(state.screen === 'voice'){
    const wf = document.getElementById('waveform');
    if(wf){
      let bars = '';
      for(let i=0;i<28;i++){
        bars += `<span style="animation-delay:${(i*0.045).toFixed(2)}s"></span>`;
      }
      wf.innerHTML = bars;
    }
  }
  if(state.screen === 'federated'){
    const items = document.querySelectorAll('.progress-item');
    items.forEach((el,i)=>{
      setTimeout(()=>{
        el.classList.add('done');
        el.querySelector('.ic').innerHTML = '&#10003;';
        if(i === items.length-1){
          state.federatedDone = true;
          logAudit('FEDERATED SEARCH', '6 camera nodes queried across VMS-A, VMS-B, VMS-C and Legacy VMS.');
          document.getElementById('federatedContinue').innerHTML =
            `<button class="btn btn-primary" id="toMatchBtn">View Vehicle Match &rarr;</button>`;
          document.getElementById('toMatchBtn').addEventListener('click', ()=>{
            state.matchStatus = 'pending';
            logAudit('AI MATCH', `Candidate <b>${MATCH.plate}</b> identified at <b>CAM-001</b> with <b>${MATCH.confidence}%</b> confidence.`);
            navigateTo('match');
          });
        }
      }, 260 + i*340);
    });
  }
  if(state.screen === 'match'){
    const fill = document.getElementById('confFill');
    const num = document.getElementById('confNum');
    if(fill){
      requestAnimationFrame(()=>{ fill.style.width = MATCH.confidence + '%'; });
      let n = 0;
      const iv = setInterval(()=>{
        n += 4;
        if(n >= MATCH.confidence){ n = MATCH.confidence; clearInterval(iv); }
        num.textContent = n + '%';
      }, 30);
    }
  }
}

/* ---------------- EVENT HANDLERS ---------------- */
function attachHandlers(){
  const $ = id => document.getElementById(id);

  if($('runSearchBtn')) $('runSearchBtn').addEventListener('click', ()=>{
    const q = $('queryInput').value.trim();
    state.query = q || state.query;
    logAudit('SEARCH', `Officer 047 submitted query: "${state.query}"`);
    navigateTo('voice');
  });
  if($('micBtn')) $('micBtn').addEventListener('click', ()=>navigateTo('voice'));
  if($('viewInvestigationsBtn')) $('viewInvestigationsBtn').addEventListener('click', ()=>navigateTo('investigations'));

  if($('toFederatedBtn')) $('toFederatedBtn').addEventListener('click', ()=>{
    if(!state.auditLog.some(a=>a.action==='SEARCH')){
      logAudit('SEARCH', `Officer 047 submitted query: "${state.query}"`);
    }
    navigateTo('federated');
  });

  if($('toJourneyBtn')) $('toJourneyBtn').addEventListener('click', ()=>navigateTo('journey'));
  if($('skipToVerifyBtn')) $('skipToVerifyBtn').addEventListener('click', ()=>navigateTo('verify'));
  if($('toVerifyBtn')) $('toVerifyBtn').addEventListener('click', ()=>navigateTo('verify'));

  if($('verifyBtn')) $('verifyBtn').addEventListener('click', async ()=>{
    state.matchStatus = 'verified';
    logAudit('HUMAN VERIFICATION', 'Officer 047 verified the candidate match.');
    const payload = JSON.stringify({
      case: CASE_ID, plate: MATCH.plate, camera:'CAM-001', time:'19:58:14',
      location:'Ellisbridge', confidence: MATCH.confidence, verifiedBy:'Officer 047',
      sealedAt: new Date().toISOString()
    });
    const hash = await sha256Hex(payload);
    state.evidence = { hash, payload };
    logAudit('EVIDENCE SEALED', `SHA-256 evidence hash generated: <b>${hash.slice(0,16)}...</b>`);
    toast('Evidence sealed and logged to audit trail');
    navigateTo('evidence');
  });

  if($('rejectBtn')) $('rejectBtn').addEventListener('click', ()=>{
    state.matchStatus = 'rejected';
    logAudit('MATCH REJECTED', `Officer 047 rejected candidate <b>${MATCH.plate}</b>. Candidate removed from active consideration.`);
    navigateTo('rejected');
  });

  if($('searchAgainBtn')) $('searchAgainBtn').addEventListener('click', ()=>{
    state.matchStatus = 'none';
    state.federatedDone = false;
    navigateTo('command');
  });
  if($('toAuditFromRejectBtn')) $('toAuditFromRejectBtn').addEventListener('click', ()=>navigateTo('audit'));
  if($('startSearchFromEmptyBtn')) $('startSearchFromEmptyBtn').addEventListener('click', ()=>navigateTo('command'));

  if($('exportManifestBtn')) $('exportManifestBtn').addEventListener('click', ()=>{
    if(!state.evidence) return;
    const manifest = {
      case: CASE_ID,
      evidence_type: 'Verified vehicle detection',
      vehicle: MATCH.plate,
      camera: 'CAM-001',
      time: '19:58:14',
      location: 'Ellisbridge',
      ai_confidence_percent: MATCH.confidence,
      verified_by: 'Officer 047',
      sha256: state.evidence.hash,
      note: 'AI-generated results are decision-support outputs and require authorized officer verification. Synthetic demo data.',
      exported_at: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(manifest, null, 2)], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `SENTINEL_Evidence_Manifest_${CASE_ID}.json`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
    logAudit('EXPORT', 'Evidence manifest exported as JSON.');
    toast('Evidence manifest downloaded');
  });
  if($('viewAuditFromEvidenceBtn')) $('viewAuditFromEvidenceBtn').addEventListener('click', ()=>navigateTo('audit'));

  if($('continueInvestigationBtn')) $('continueInvestigationBtn').addEventListener('click', ()=>{
    if(state.matchStatus==='none') navigateTo('command');
    else if(state.matchStatus==='pending') navigateTo('match');
    else if(state.matchStatus==='verified') navigateTo('evidence');
    else navigateTo('command');
  });
  if($('toArchFromInvestBtn')) $('toArchFromInvestBtn').addEventListener('click', ()=>navigateTo('architecture'));
  if($('toArchBtn')) $('toArchBtn').addEventListener('click', ()=>navigateTo('architecture'));
}

/* ---------------- INIT ---------------- */
tickClock();
render();
