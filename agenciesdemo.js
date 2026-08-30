/* ==========================================================================
   LuciHome — Agency Workspace Demo
   Interaction layer for the agency manager view: team management, agency-wide
   listing approval, a shared CRM pipeline, a multi-agent deal room, referrals,
   the professional network, agency brand/profile and analytics. Reuses the
   same dependency-free SVG chart engine, quick-create menu, dropdowns, modal
   system and slide-over detail drawer pattern as the Agent Workspace demo.
   ========================================================================== */

let nextId = 1000;
const CHART_COLORS = ['#1A73E8','#12B5CB','#F29900','#D93025','#9334E6','#188038'];
const BRAND_COLORS = ['#1A73E8','#188038','#9334E6','#D93025','#F29900','#12B5CB','#202124'];

const state = {

  agents: [], // loaded from Supabase (memberships + invitations) at init()

  feed: [
    {id:1, icon:'ti-user-check', text:'<strong>Elena Radu</strong> submitted "Pipera Villa" for approval.', time:'22 min ago', read:false},
    {id:2, icon:'ti-user-plus', text:'New unassigned lead came in from the agency profile page.', time:'1 h ago', read:false},
    {id:3, icon:'ti-arrows-exchange', text:'New referral received from <strong>Paris Prestige Immobilier</strong>.', time:'2 h ago', read:false},
    {id:4, icon:'ti-signature', text:'<strong>Ana Maria Petrescu</strong> closed the Zorilor Penthouse deal.', time:'4 h ago', read:false},
    {id:5, icon:'ti-alert-triangle', text:'Transaction "Old Town Studio" has had no activity for 6 days.', time:'yesterday, 5:40 PM', read:false},
    {id:6, icon:'ti-home-2', text:'<strong>Mihai Stan</strong> published a new listing in Grigorescu.', time:'yesterday, 11:05 AM', read:true},
  ],

  attention: [
    {icon:'ti-clock', danger:false, text:'2 leads have not been responded to in over 48 hours.', sub:'Corina Dobre, Radu Barbu'},
    {icon:'ti-calendar-x', danger:false, text:'"Old Town Studio" listing expires in 3 days.', sub:'Assigned to Corina Dobre'},
    {icon:'ti-alert-triangle', danger:true, text:'"Old Town Studio" transaction is missing the energy certificate.', sub:'Stalled 6 days — no activity'},
  ],

  teamAgenda: [
    {time:'09:00', text:'Team stand-up — weekly pipeline review', sub:'All agents · 20 min', done:false},
    {time:'11:30', text:'Elena Radu — viewing, Herastrau Apartment', sub:'With the Rhodes family', done:false},
    {time:'14:00', text:'Deadline — Vlad Ionita listing approval', sub:'Pipera Villa submission', done:false},
    {time:'16:30', text:'Ana Maria Petrescu — closing call, Zorilor Penthouse', sub:'Scheduled Tuesday', done:true},
  ],

  resources: [
    {id:1, name:'Agency onboarding guide.pdf', icon:'ti-file-text'},
    {id:2, name:'Cross-border referral script.docx', icon:'ti-file-text'},
    {id:3, name:'Q2 2026 market report — Bucharest.pdf', icon:'ti-file-text'},
  ],

  weekTrend:{
    labels:['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
    views:[820,910,860,1040,1180,990,1250],
    leads:[4,6,5,8,7,5,9],
  },

  listings: [
    {id:1, title:'3-bedroom apartment with park view', city:'Herastrau, Bucharest', type:'Apartment', price:245000, beds:3, baths:2, size:98, status:'active', views:412, agentId:1, tags:['Park view','Furnished']},
    {id:2, title:'Penthouse with panoramic terrace', city:'Zorilor, Cluj-Napoca', type:'Penthouse', price:398000, beds:4, baths:3, size:165, status:'active', views:378, agentId:5, tags:['Terrace','Parking'], grad:'#12B5CB'},
    {id:3, title:'Villa with garden and pool', city:'Pipera, Bucharest', type:'House / Villa', price:520000, beds:5, baths:4, size:280, status:'pending', views:0, agentId:4, tags:['Pool','Pet friendly'], grad:'#9334E6'},
    {id:4, title:'Modern studio, historic center', city:'Old Town, Bucharest', type:'Studio', price:600, beds:1, baths:1, size:42, status:'offer', views:168, agentId:3, tags:['Furnished'], grad:'#80868B'},
    {id:5, title:'4-bedroom house in a quiet area', city:'Grigorescu, Cluj-Napoca', type:'House / Villa', price:310000, beds:4, baths:2, size:140, status:'active', views:214, agentId:2, tags:['Parking'], grad:'#80868B'},
    {id:6, title:'2-bedroom apartment, fully renovated', city:'Zorilor, Cluj-Napoca', type:'Apartment', price:172000, beds:2, baths:1, size:64, status:'active', views:196, agentId:2, tags:['Furnished','Park view'], grad:'#188038'},
    {id:7, title:'Investor duplex near the harbor', city:'Mamaia, Constanta', type:'Apartment', price:189000, beds:2, baths:1, size:58, status:'pending', views:0, agentId:4, tags:['Terrace'], grad:'#F29900'},
    {id:8, title:'Loft with private parking', city:'Pipera, Bucharest', type:'Apartment', price:215000, beds:2, baths:2, size:74, status:'active', views:151, agentId:6, tags:['Parking','Furnished'], grad:'#9334E6'},
    {id:9, title:'Seller-financed family home', city:'Grigorescu, Cluj-Napoca', type:'House / Villa', price:275000, beds:3, baths:2, size:120, status:'draft', views:0, agentId:5, tags:[], grad:'#80868B'},
  ],
  listingView:'grid',

  contacts: [
    {id:1, name:'Michael Turner', initials:'MT', budget:220000, type:'Buyer', stage:'contacted', agentId:1, notes:'Looking for a 3-bedroom in the Herastrau area, moving in 2 months.', activity:[{d:'Jul 8', t:'Lead came in from the Herastrau listing'},{d:'Jul 9', t:'First call — interested, will follow up with questions'}]},
    {id:2, name:'Elena Marsh', initials:'EM', budget:340000, type:'Seller', stage:'offer', agentId:1, notes:'Selling the Herastrau apartment, already has an interested buyer.', activity:[{d:'Jul 2', t:'Signed the sale mandate'},{d:'Jul 10', t:'Offer received from Michael T.'}]},
    {id:3, name:'Robert Constantin', initials:'RC', budget:180000, type:'Investor', stage:'new', agentId:null, notes:'Interested in long-term rental properties. Not yet assigned.', activity:[{d:'Jul 11', t:'New lead from the agency profile page'}]},
    {id:4, name:'Anna Popescu', initials:'AP', budget:150000, type:'Renter', stage:'viewing', agentId:3, notes:'Looking for a studio or one-bedroom downtown, flexible budget.', activity:[{d:'Jul 5', t:'Contacted by phone'},{d:'Jul 9', t:'Viewing scheduled for July 14'}]},
    {id:5, name:'Bogdan Ellis', initials:'BE', budget:410000, type:'Buyer', stage:'closed', agentId:5, notes:'Transaction completed — the Zorilor penthouse.', activity:[{d:'Jun 20', t:'Offer accepted'},{d:'Jun 30', t:'Transaction closed successfully'}]},
    {id:6, name:'Corina Vale', initials:'CV', budget:265000, type:'Buyer', stage:'new', agentId:null, notes:'Asked for more details about the Cluj penthouse. Not yet assigned.', activity:[{d:'Jul 10', t:'Message received via the platform'}]},
    {id:7, name:'Teodora Barbu', initials:'TB', budget:198000, type:'Buyer', stage:'contacted', agentId:2, notes:'Relocating to Cluj-Napoca for work, needs to move within 6 weeks.', activity:[{d:'Jul 6', t:'Lead assigned to Mihai Stan'}]},
    {id:8, name:'Sorin Enache', initials:'SE', budget:310000, type:'Investor', stage:'viewing', agentId:6, notes:'Looking at yield properties in Pipera and Baneasa.', activity:[{d:'Jul 4', t:'First viewing scheduled'}]},
    {id:9, name:'Larisa Ionescu', initials:'LI', budget:600, type:'Renter', stage:'new', agentId:null, notes:'Enquired about the Old Town studio for rent, no response yet.', activity:[{d:'Jul 12', t:'New lead — awaiting assignment'}]},
  ],
  stages: [
    {id:'new', label:'New Lead'},
    {id:'contacted', label:'Contacted'},
    {id:'viewing', label:'Viewing Scheduled'},
    {id:'offer', label:'Offer Made'},
    {id:'closed', label:'Closed'},
  ],
  selectedContactId:null,

  transactions: [
    {id:1, property:'3-bedroom apartment, Herastrau', buyer:'Michael Turner', seller:'Elena Marsh', agentId:1, stage:2, commission:7350, commissionStatus:'Pending', lastActivity:'1 day ago',
      docs:['Sale mandate.pdf','Land registry extract.pdf'], checklist:[{t:'Property title verification', done:true},{t:'Bank appraisal', done:true},{t:'Sign preliminary contract', done:false},{t:'File with notary', done:false}]},
    {id:2, property:'Zorilor Penthouse', buyer:'Bogdan Ellis', seller:'Constantin Popa', agentId:5, stage:4, commission:12300, commissionStatus:'Pending', lastActivity:'3 hours ago',
      docs:['Sale-purchase contract.pdf','Energy certificate.pdf','Land registry extract.pdf'], checklist:[{t:'Property title verification', done:true},{t:'Bank appraisal', done:true},{t:'Sign preliminary contract', done:true},{t:'File with notary', done:true},{t:'Property handover', done:false}]},
    {id:3, property:'Old Town Studio', buyer:'Teodora Barbu', seller:'Vlad Marin', agentId:3, stage:1, commission:2100, commissionStatus:'Projected', lastActivity:'6 days ago', stalled:true,
      docs:['Signed offer.pdf'], checklist:[{t:'Property title verification', done:false},{t:'Bank appraisal', done:false},{t:'Sign preliminary contract', done:false}]},
  ],
  archivedTx:[
    {id:99, property:'Grigorescu Family Home', buyer:'Sorin Enache', seller:'Ioana Popa', agentId:6, commission:3400, closedOn:'June 28, 2026'}
  ],
  txStages:['Offer','Accepted','Due Diligence','Contract','Closing','Completed'],
  currentTxId:1,
  archiveVisible:false,

  sentReferrals:[
    {id:1, client:'Corina Vale', market:'Paris, France', agent:'Sophie Laurent — Paris Prestige Immobilier', handlingAgent:'Elena Radu', pct:22, status:'pending'},
    {id:2, client:'Bogdan Ellis (past client)', market:'Dubai, UAE', agent:'Khalid Al-Farsi — Dubai Estates Partners', handlingAgent:'Ana Maria Petrescu', pct:20, status:'closed'},
  ],
  receivedReferrals:[
    {id:1, client:'Marc Dubois (French client)', market:'Bucharest, Romania', agent:'Sophie Laurent — Paris', pct:22, status:'pending', budget:280000, notes:'Looking for a 2-3 bedroom apartment, available to visit in August.', assignedTo:null},
    {id:2, client:'Fatima Al-Sayed', market:'Bucharest, Romania', agent:'Khalid Al-Farsi — Dubai', pct:20, status:'pending', budget:450000, notes:'Investor, interested in premium properties with rental yield.', assignedTo:'Radu Barbu'},
  ],
  partners:[
    {id:1, name:'Paris Prestige Immobilier', contact:'Sophie Laurent', market:'Paris, France', lang:'FR / EN', rating:4.9, deals:5},
    {id:2, name:'Dubai Estates Partners', contact:'Khalid Al-Farsi', market:'Dubai, UAE', lang:'AR / EN', rating:4.8, deals:3},
    {id:3, name:'Milano Casa Group', contact:'Marco Bianchi', market:'Milan, Italy', lang:'IT / EN', rating:4.7, deals:1},
    {id:4, name:'Barcelona Home Partners', contact:'Laura Fernandez', market:'Barcelona, Spain', lang:'ES / EN', rating:4.6, deals:0},
  ],

  directory:[
    {id:1, name:'Paris Prestige Immobilier', type:'Agency', market:'Paris, France', lang:'FR / EN', rating:4.9, connected:true},
    {id:2, name:'Dubai Estates Partners', type:'Agency', market:'Dubai, UAE', lang:'AR / EN', rating:4.8, connected:true},
    {id:3, name:'Ionescu & Partners Notary', type:'Notary', market:'Bucharest, Romania', lang:'RO / EN', rating:4.9, connected:false},
    {id:4, name:'Popescu Law Office', type:'Lawyer', market:'Bucharest, Romania', lang:'RO / FR', rating:4.7, connected:false},
    {id:5, name:'Skyline Development', type:'Developer', market:'Cluj-Napoca, Romania', lang:'RO / EN', rating:4.6, connected:false},
    {id:6, name:'BRD Partner Loans', type:'Bank', market:'Romania (national)', lang:'RO / EN', rating:4.5, connected:false},
    {id:7, name:'Milano Casa Group', type:'Agency', market:'Milan, Italy', lang:'IT / EN', rating:4.7, connected:true},
    {id:8, name:'Barcelona Home Partners', type:'Agency', market:'Barcelona, Spain', lang:'ES / EN', rating:4.6, connected:true},
    {id:9, name:'Sophie Laurent', type:'Agent', market:'Paris, France', lang:'FR / EN', rating:4.9, connected:true},
  ],

  devProjects:[
    {id:1, name:'Skyline Residences', location:'Cluj-Napoca, Grigorescu', desc:'Premium residential complex, 120 units — the developer is looking for authorized selling agencies in the local market.', applied:false},
    {id:2, name:'Herastrau Gardens Phase II', location:'Bucharest, Herastrau', desc:'Second phase of a luxury lakeside project — 3.5% sales commission.', applied:true},
    {id:3, name:'Riviera Bay Villas', location:'Constanta, Mamaia', desc:'Seaside vacation villas, ideal for international investor clients.', applied:false},
  ],

  marketGroups:[
    {id:1, name:'Dubai Agencies', members:214, joined:false, desc:'A network of active agencies in the Dubai market — sharing listings and leads.'},
    {id:2, name:'Paris Luxury Market', members:156, joined:true, desc:'A group dedicated to luxury properties in Paris and Île-de-France.'},
    {id:3, name:'Cluj Investors', members:98, joined:false, desc:'Investors and agencies focused on rental yields in Cluj-Napoca.'},
    {id:4, name:'Bucharest Rentals', members:187, joined:true, desc:'A community focused exclusively on the Bucharest rental market.'},
  ],

  buyerOrigin:[
    {label:'Romania', value:44}, {label:'France', value:22}, {label:'UAE', value:16}, {label:'Italy', value:11}, {label:'Other', value:7},
  ],

  brandColor:'#1A73E8',
  integrations:{},
  wizardStep:1,
  uploadedFiles:[],
};

/* ---------------------------------------------------------------------- */
/* NAVIGATION                                                              */
/* ---------------------------------------------------------------------- */
function showSection(id){
  document.querySelectorAll('.module-section').forEach(s=>s.classList.remove('visible'));
  document.querySelectorAll('.nav-item').forEach(t=>t.classList.remove('active'));
  const sec = document.getElementById('section-'+id);
  if(sec) sec.classList.add('visible');
  const nav = document.querySelector('.nav-item[data-section="'+id+'"]');
  if(nav) nav.classList.add('active');
  document.getElementById('sidebar').classList.remove('open');
  closeContactDrawer();
  window.scrollTo({top:0, behavior:'smooth'});
}

function switchTab(group, tabId){
  document.querySelectorAll('.tab-btn').forEach(b=>{
    if(b.dataset.tab && b.dataset.tab.indexOf(group+'-')===0){
      b.classList.toggle('active', b.dataset.tab===tabId);
    }
  });
  document.querySelectorAll('.tab-panel').forEach(p=>{
    if(p.id.indexOf(group+'-')===0){
      p.classList.toggle('visible', p.id===tabId);
    }
  });
}

document.getElementById('hamburgerBtn').addEventListener('click', ()=>{
  document.getElementById('sidebar').classList.toggle('open');
});

/* ---------------------------------------------------------------------- */
/* QUICK CREATE MENU                                                       */
/* ---------------------------------------------------------------------- */
function toggleQuickCreate(e){
  e.stopPropagation();
  document.getElementById('quickCreateMenu').classList.toggle('open');
}
function closeQuickCreate(){
  document.getElementById('quickCreateMenu').classList.remove('open');
}
document.addEventListener('click', closeQuickCreate);

/* ---------------------------------------------------------------------- */
/* DROPDOWNS                                                               */
/* ---------------------------------------------------------------------- */
function closeAllDropdowns(){
  document.querySelectorAll('.dropdown-panel').forEach(p=>p.classList.remove('open'));
}
document.getElementById('notifBtn').addEventListener('click', e=>{
  e.stopPropagation();
  const willOpen = !document.getElementById('notifPanel').classList.contains('open');
  closeAllDropdowns();
  if(willOpen) document.getElementById('notifPanel').classList.add('open');
});
document.getElementById('msgBtn').addEventListener('click', e=>{
  e.stopPropagation();
  const panel = document.getElementById('msgDropdown').querySelector('.dropdown-panel');
  const willOpen = !panel.classList.contains('open');
  closeAllDropdowns();
  if(willOpen) panel.classList.add('open');
});
document.getElementById('avatarBtn').addEventListener('click', e=>{
  e.stopPropagation();
  const willOpen = !document.getElementById('avatarPanel').classList.contains('open');
  closeAllDropdowns();
  if(willOpen) document.getElementById('avatarPanel').classList.add('open');
});
document.addEventListener('click', closeAllDropdowns);

function logoutDemo(){
  closeAllDropdowns();
  signOut(); // real Supabase sign-out, defined in supabase-client.js
}

/* ---------------------------------------------------------------------- */
/* TOASTS                                                                  */
/* ---------------------------------------------------------------------- */
function toast(type, title, msg){
  const stack = document.getElementById('toastStack');
  const el = document.createElement('div');
  const iconMap = {success:'ti-circle-check', info:'ti-info-circle', warning:'ti-alert-triangle', danger:'ti-alert-circle'};
  el.className = 'toast ' + (type==='success'?'success':type==='warning'?'warning':type==='danger'?'danger':'');
  el.innerHTML = `<i class="ti ${iconMap[type]||'ti-info-circle'}"></i><div><strong style="display:block;margin-bottom:2px">${title}</strong>${msg}</div>`;
  stack.appendChild(el);
  setTimeout(()=>{ el.classList.add('hide'); setTimeout(()=>el.remove(), 200); }, 4200);
}

/* ---------------------------------------------------------------------- */
/* MODALS                                                                  */
/* ---------------------------------------------------------------------- */
function openModal(id){
  document.getElementById(id).classList.add('open');
  if(id==='modal-add-listing') resetWizard();
  if(id==='modal-send-referral') populateReferralSelects();
  if(id==='modal-add-contact') populateAgentSelect('cAgent');
}
function closeModal(id){ document.getElementById(id).classList.remove('open'); }
document.querySelectorAll('.modal-overlay').forEach(ov=>{
  ov.addEventListener('click', e=>{ if(e.target===ov) ov.classList.remove('open'); });
});

function populateAgentSelect(selectId, includeUnassigned){
  const sel = document.getElementById(selectId);
  const activeAgents = state.agents.filter(a=>a.status==='active');
  sel.innerHTML = (includeUnassigned ? '<option value="">Unassigned</option>' : '') +
    activeAgents.map(a=>`<option value="${a.id}">${a.name} — ${a.role}</option>`).join('');
}

/* ---------------------------------------------------------------------- */
/* CHART ENGINE — dependency-free inline SVG                               */
/* ---------------------------------------------------------------------- */
function renderLineChart(containerId, series, labels){
  const w=600, h=220, padL=34, padR=16, padT=16, padB=26;
  const maxLen = Math.max(...series.map(s=>s.values.length));
  const stepX = maxLen>1 ? (w-padL-padR)/(maxLen-1) : 0;
  let svg = `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none">`;
  for(let i=0;i<=3;i++){
    const y = padT + i*(h-padT-padB)/3;
    svg += `<line x1="${padL}" y1="${y}" x2="${w-padR}" y2="${y}" stroke="#DADCE0" stroke-width="1"/>`;
  }
  series.forEach(s=>{
    const max = Math.max(...s.values, 1);
    const pts = s.values.map((v,i)=>[padL+i*stepX, h-padB-(v/max)*(h-padT-padB)]);
    const linePath = pts.map((p,i)=>(i===0?'M':'L')+p[0].toFixed(1)+','+p[1].toFixed(1)).join(' ');
    const areaPath = linePath+` L${pts[pts.length-1][0].toFixed(1)},${h-padB} L${pts[0][0].toFixed(1)},${h-padB} Z`;
    svg += `<path d="${areaPath}" fill="${s.color}" opacity="0.10"></path>`;
    svg += `<path d="${linePath}" fill="none" stroke="${s.color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></path>`;
    pts.forEach(p=>{ svg += `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="3.5" fill="${s.color}" stroke="#fff" stroke-width="1.5"></circle>`; });
  });
  if(labels){
    labels.forEach((lab,i)=>{
      const x = padL+i*stepX;
      svg += `<text x="${x}" y="${h-6}" text-anchor="middle" font-size="11" font-family="Roboto" fill="#80868B">${lab}</text>`;
    });
  }
  svg += `</svg>`;
  const legend = series.map(s=>`<div class="chart-legend-item"><span class="chart-legend-dot" style="background:${s.color}"></span>${s.name}</div>`).join('');
  document.getElementById(containerId).innerHTML = svg + `<div class="chart-legend">${legend}</div>`;
}

function renderBarChart(containerId, items, opts){
  opts = opts||{};
  const w=560, barH=26, gap=14, leftPad=opts.leftPad||150, rightPad=48;
  const max = opts.maxValue || Math.max(...items.map(i=>i.value), 1);
  const h = items.length*(barH+gap)+gap;
  let svg = `<svg viewBox="0 0 ${w} ${h}">`;
  items.forEach((item,i)=>{
    const y = gap + i*(barH+gap);
    const barMaxW = w-leftPad-rightPad;
    const barW = Math.max(3, (item.value/max)*barMaxW);
    const color = item.color || '#1A73E8';
    svg += `<text x="${leftPad-10}" y="${y+barH/2+4}" text-anchor="end" font-size="12" font-family="Roboto" fill="#5F6368">${item.label}</text>`;
    svg += `<rect x="${leftPad}" y="${y}" width="${barMaxW}" height="${barH}" rx="5" fill="#F1F3F4"></rect>`;
    svg += `<rect class="chart-bar" x="${leftPad}" y="${y}" width="${barW}" height="${barH}" rx="5" fill="${color}"></rect>`;
    svg += `<text x="${leftPad+barW+8}" y="${y+barH/2+4}" font-size="12" font-family="Roboto" font-weight="500" fill="#202124">${item.value}${opts.suffix||''}</text>`;
  });
  svg += `</svg>`;
  document.getElementById(containerId).innerHTML = svg;
}

function renderDonutChart(containerId, segments){
  const total = segments.reduce((a,s)=>a+s.value,0) || 1;
  const size=180, r=64, cx=90, cy=90, strokeW=24;
  let offset=0;
  let svg = `<svg viewBox="0 0 ${size} ${size}" style="max-width:200px;margin:0 auto">`;
  segments.forEach((seg,i)=>{
    const frac = seg.value/total;
    const circumference = 2*Math.PI*r;
    const dash = frac*circumference;
    const color = seg.color || CHART_COLORS[i%CHART_COLORS.length];
    svg += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${color}" stroke-width="${strokeW}" stroke-dasharray="${dash.toFixed(1)} ${(circumference-dash).toFixed(1)}" stroke-dashoffset="${(-offset).toFixed(1)}" transform="rotate(-90 ${cx} ${cy})"></circle>`;
    offset += dash;
  });
  svg += `<text x="${cx}" y="${cy-2}" text-anchor="middle" font-size="24" font-weight="700" font-family="Roboto" fill="#202124">${total}</text>`;
  svg += `<text x="${cx}" y="${cy+18}" text-anchor="middle" font-size="10.5" font-family="Roboto" fill="#80868B">total</text>`;
  svg += `</svg>`;
  const legend = segments.map((s,i)=>`<div class="chart-legend-item"><span class="chart-legend-dot" style="background:${s.color||CHART_COLORS[i%CHART_COLORS.length]}"></span>${s.label} · ${s.value}</div>`).join('');
  document.getElementById(containerId).innerHTML = svg + `<div class="chart-legend">${legend}</div>`;
}

function renderDashboardCharts(){
  renderLineChart('dashTrendChart', [
    {name:'Listing views (agency-wide)', color:'#1A73E8', values:state.weekTrend.views},
    {name:'New leads (×80 scale)', color:'#12B5CB', values:state.weekTrend.leads.map(v=>v*80)},
  ], state.weekTrend.labels);

  const segs = state.stages.map((s,i)=>({
    label:s.label,
    value: state.contacts.filter(c=>c.stage===s.id).length,
    color: CHART_COLORS[i%CHART_COLORS.length],
  }));
  renderDonutChart('dashFunnelDonut', segs);
}

function renderAnalyticsCharts(){
  const marketTotals = {};
  state.listings.forEach(l=>{ const city=l.city.split(',').pop().trim(); marketTotals[city]=(marketTotals[city]||0)+l.views; });
  const marketItems = Object.keys(marketTotals).map((k,i)=>({label:k, value:marketTotals[k], color:CHART_COLORS[i%CHART_COLORS.length]}));
  renderBarChart('marketPerfChart', marketItems, {leftPad:130});

  renderBarChart('leadFunnelChart', [
    {label:'New lead', value:38, color:CHART_COLORS[0]},
    {label:'Contacted', value:29, color:CHART_COLORS[0]},
    {label:'Viewing scheduled', value:19, color:CHART_COLORS[0]},
    {label:'Offer made', value:10, color:CHART_COLORS[0]},
    {label:'Closed', value:6, color:CHART_COLORS[0]},
  ], {leftPad:150});

  renderDonutChart('buyerOriginChart', state.buyerOrigin.map((b,i)=>({label:b.label, value:b.value, color:CHART_COLORS[i%CHART_COLORS.length]})));

  const top = [...state.listings].sort((a,b)=>b.views-a.views).slice(0,6)
    .map((l,i)=>({label:l.title.length>26?l.title.slice(0,26)+'…':l.title, value:l.views, color:CHART_COLORS[i%CHART_COLORS.length]}));
  renderBarChart('listingViewsChart', top, {leftPad:190});
}

function renderAgentPerfTable(){
  const body = document.getElementById('agentPerfBody');
  const maxRevenue = Math.max(...state.agents.map(a=>a.revenue), 1);
  body.innerHTML = state.agents.filter(a=>a.status==='active').map(a=>{
    const score = Math.round((a.revenue/maxRevenue)*100);
    const color = score>70?'var(--success)':score>40?'var(--warning)':'var(--danger)';
    return `<tr>
      <td class="strong">${a.name}<div class="ms" style="margin-top:2px">${a.role} · ${a.market}</div></td>
      <td>${a.listings}</td>
      <td>${a.leads}</td>
      <td>${a.closed}</td>
      <td class="strong">€${a.revenue.toLocaleString('en-US')}</td>
      <td><span class="score-bar"><span class="score-fill" style="width:${score}%;background:${color}"></span></span>${score}</td>
    </tr>`;
  }).join('');
}

/* ---------------------------------------------------------------------- */
/* DASHBOARD — feed, attention list, leaderboard                          */
/* ---------------------------------------------------------------------- */
function renderFeed(){
  const list = document.getElementById('feedList');
  list.innerHTML = state.feed.map(f=>`
    <div class="feed-item ${f.read?'':'unread'}" onclick="markFeedRead(${f.id})">
      <div class="fi-icon"><i class="ti ${f.icon}"></i></div>
      <div class="fi-text"><p>${f.text}</p><span>${f.time}</span></div>
    </div>`).join('');
  updateNotifCount();
}
function markFeedRead(id){
  const item = state.feed.find(f=>f.id===id);
  if(item) item.read = true;
  renderFeed();
}
function markAllFeedRead(){
  state.feed.forEach(f=>f.read=true);
  renderFeed();
  toast('success','Updated','All agency activity has been marked as read.');
}
function updateNotifCount(){
  const unread = state.feed.filter(f=>!f.read).length;
  document.getElementById('notifCount').textContent = unread;
  document.getElementById('notifCount').style.display = unread>0 ? 'flex' : 'none';
  const notifHeader = document.querySelector('#notifPanel .dropdown-header');
  if(notifHeader) notifHeader.innerHTML = `<strong>Notifications</strong>${unread} unread`;
  renderNotifList();
}
function renderNotifList(){
  const list = document.getElementById('notifList');
  list.innerHTML = state.feed.slice(0,5).map(f=>`
    <div class="notif-item ${f.read?'':'unread'}" onclick="markFeedRead(${f.id});showSection('dashboard')">
      <div class="notif-icon"><i class="ti ${f.icon}"></i></div>
      <div class="notif-text"><p>${f.text}</p><span>${f.time}</span></div>
    </div>`).join('');
}
document.getElementById('markAllReadBtn').addEventListener('click', markAllFeedRead);

function renderAttentionList(){
  const list = document.getElementById('attentionList');
  list.innerHTML = state.attention.map(a=>`
    <div class="attention-row">
      <div class="attention-icon ${a.danger?'danger':''}"><i class="ti ${a.icon}"></i></div>
      <div class="attention-text"><p>${a.text}</p><span>${a.sub}</span></div>
    </div>`).join('');
}

function renderLeaderboard(){
  const list = document.getElementById('leaderboardList');
  const ranked = [...state.agents].filter(a=>a.status==='active').sort((a,b)=>b.revenue-a.revenue).slice(0,6);
  list.innerHTML = ranked.map((a,i)=>`
    <div class="leaderboard-row">
      <div class="lb-rank">${i+1}</div>
      <div style="flex:1;min-width:0">
        <p class="lb-name">${a.name}</p>
        <p class="lb-sub">${a.closed} closed · ${a.market}</p>
      </div>
      <div class="lb-value"><p class="v">€${(a.revenue/1000).toFixed(1)}k</p><p class="l">revenue</p></div>
    </div>`).join('');
}

/* ---------------------------------------------------------------------- */
/* TEAM                                                                    */
/* ---------------------------------------------------------------------- */
const roleBadge = {'Manager':'badge-info', 'Senior Agent':'badge-active', 'Agent':'badge-neutral', 'Junior Agent':'badge-pending'};

function renderAgents(){
  const q = (document.getElementById('agentSearch').value||'').toLowerCase();
  const roleFilter = document.getElementById('agentRoleFilter').value;
  let items = state.agents.filter(a=>{
    const matchQ = a.name.toLowerCase().includes(q) || a.market.toLowerCase().includes(q);
    const matchRole = roleFilter==='all' || a.role===roleFilter;
    return matchQ && matchRole;
  });
  document.getElementById('agentsGrid').innerHTML = items.map(a=>`
    <div class="card hoverable" style="cursor:pointer" onclick="openAgentDetail(${a.id})">
      <div class="flex flex-gap" style="align-items:center;margin-bottom:10px">
        <div class="avatar-circle">${a.initials}</div>
        <div style="flex:1;min-width:0">
          <p class="mt" style="margin-bottom:2px">${a.name}</p>
          <span class="badge ${roleBadge[a.role]}">${a.role}</span>
        </div>
      </div>
      <p class="ms" style="margin-bottom:10px"><i class="ti ti-map-pin" style="margin-right:4px"></i>${a.market} ${a.status==='invited'?' · <span style="color:var(--warning)">Invitation pending</span>':''}</p>
      <div class="grid grid-3" style="gap:8px">
        <div class="mini-stat" style="padding:8px"><p class="v" style="font-size:15px">${a.listings}</p><p class="l">Listings</p></div>
        <div class="mini-stat" style="padding:8px"><p class="v" style="font-size:15px">${a.leads}</p><p class="l">Leads</p></div>
        <div class="mini-stat" style="padding:8px"><p class="v" style="font-size:15px">${a.closed}</p><p class="l">Closed</p></div>
      </div>
    </div>`).join('') || `<div class="empty-state" style="grid-column:1/-1"><i class="ti ti-users"></i><p>No agents match your filters.</p></div>`;
}

function openAgentDetail(id){
  const a = state.agents.find(x=>x.id===id);
  if(!a) return;
  document.getElementById('agentDetailName').textContent = a.name;
  document.getElementById('agentDetailBody').innerHTML = `
    <div class="flex flex-gap" style="align-items:center;margin-bottom:14px">
      <div class="avatar-circle lg">${a.initials}</div>
      <div>
        <p class="mt" style="font-size:16px;margin-bottom:4px">${a.name}</p>
        <span class="badge ${roleBadge[a.role]}">${a.role}</span>
        <span class="badge badge-neutral" style="margin-left:6px"><i class="ti ti-map-pin"></i>${a.market}</span>
      </div>
    </div>
    <p class="ms" style="margin-bottom:16px">${a.bio}</p>
    <div class="grid grid-2" style="margin-bottom:14px">
      <div class="mini-stat"><p class="v">${a.listings}</p><p class="l">Listings</p></div>
      <div class="mini-stat"><p class="v">${a.leads}</p><p class="l">Active leads</p></div>
      <div class="mini-stat"><p class="v">${a.closed}</p><p class="l">Deals closed</p></div>
      <div class="mini-stat"><p class="v">${a.responseTime}</p><p class="l">Avg. response time</p></div>
    </div>
    <div class="field"><label class="field-label">Commission split</label><select class="select"><option>70 / 30 (agent / agency)</option><option>80 / 20 (agent / agency)</option><option>Custom per deal</option></select></div>
  `;
  const suspendBtn = document.getElementById('agentSuspendBtn');
  if(a.dbType === 'owner'){
    suspendBtn.style.display = 'none';
  } else if(a.dbType === 'invitation'){
    suspendBtn.style.display = '';
    suspendBtn.innerHTML = '<i class="ti ti-x"></i>Cancel invitation';
  } else {
    suspendBtn.style.display = '';
    const isSuspended = a.status === 'suspended';
    suspendBtn.innerHTML = isSuspended ? '<i class="ti ti-user-check"></i>Reactivate agent' : '<i class="ti ti-user-off"></i>Suspend agent';
  }
  suspendBtn.dataset.agentId = id;
  openModal('modal-agent-detail');
}
async function toggleSuspendAgent(){
  const id = Number(document.getElementById('agentSuspendBtn').dataset.agentId);
  const a = state.agents.find(x=>x.id===id);
  if(!a) return;
  closeModal('modal-agent-detail');

  if(a.dbType === 'invitation'){
    const { error } = await supabaseClient.from('invitations').delete().eq('id', a.dbId);
    if(error){ toast('warning','Could not cancel invitation', error.message); return; }
    await loadAgentsFromDB(); renderAgents(); updateSidebarCounts(); updateHeaderStats();
    toast('success','Invitation canceled', `The invitation to ${a.name} has been canceled.`);
    return;
  }

  const newStatus = a.status === 'suspended' ? 'active' : 'suspended';
  const { error } = await supabaseClient.from('memberships').update({ status: newStatus }).eq('id', a.dbId);
  if(error){ toast('warning','Could not update agent', error.message); return; }
  await loadAgentsFromDB(); renderAgents(); updateSidebarCounts(); updateHeaderStats();
  toast(newStatus==='active'?'success':'warning', newStatus==='active'?'Agent reactivated':'Agent suspended', newStatus==='active'
    ? `${a.name} has regained access to the workspace.`
    : `${a.name} has been suspended.`);
}

function renderTeamAgenda(){
  const list = document.getElementById('teamAgendaList');
  list.innerHTML = state.teamAgenda.map((a,i)=>`
    <div class="agenda-item ${a.done?'done':''}">
      <div class="agenda-time">${a.time}</div>
      <div class="agenda-text"><p>${a.text}</p><span>${a.sub}</span></div>
      <input type="checkbox" ${a.done?'checked':''} onchange="toggleTeamAgenda(${i})" style="accent-color:var(--accent);width:16px;height:16px;cursor:pointer">
    </div>`).join('');
}
function toggleTeamAgenda(i){
  state.teamAgenda[i].done = !state.teamAgenda[i].done;
  renderTeamAgenda();
}

function renderResources(){
  document.getElementById('resourcesList').innerHTML = state.resources.map(r=>`
    <div class="feed-item" style="border:none;padding:8px 0;cursor:default">
      <div class="fi-icon"><i class="ti ${r.icon}"></i></div>
      <div class="fi-text"><p>${r.name}</p><span>Visible to all agents</span></div>
    </div>`).join('');
}
function uploadResource(){
  const name = 'New resource — ' + new Date().toLocaleDateString('en-US') + '.pdf';
  state.resources.unshift({id:nextId++, name, icon:'ti-file-text'});
  renderResources();
  toast('success','Uploaded','The resource has been added to the shared library.');
}

/* ---------------------------------------------------------------------- */
/* LISTINGS                                                                */
/* ---------------------------------------------------------------------- */
const statusLabel = {pending:'Pending approval', draft:'Draft', active:'Active', offer:'Under offer', sold:'Sold / Rented'};
const statusBadge = {pending:'badge-pending', draft:'badge-neutral', active:'badge-active', offer:'badge-pending', sold:'badge-sold'};
const typeIcon = {'Apartment':'ti-building-skyscraper','House / Villa':'ti-home','Penthouse':'ti-building-castle','Studio':'ti-home-2','Land':'ti-map-2'};

/* ---------------------------------------------------------------------- */
/* SUPABASE INTEGRATION — mapping between the demo's shape and the DB      */
/* ---------------------------------------------------------------------- */
let currentProfile = null;
let currentOrgId = null;

// Demo "type" strings <-> DB property_type enum. A couple of demo types
// (Penthouse, Studio) fold into the closest DB value for now.
const TYPE_TO_DB = {
  'Apartment':'apartment', 'Penthouse':'apartment', 'Studio':'apartment',
  'House / Villa':'house', 'Land':'land',
};
const TYPE_FROM_DB = {
  apartment:'Apartment', house:'House / Villa', villa:'House / Villa',
  land:'Land', commercial:'Apartment', office:'Apartment', other:'Apartment',
};

// DB listings.status is only draft | published | archived (it only controls
// public visibility). The demo's richer statuses (pending/offer/sold) are
// internal agency workflow we haven't built yet (that comes with the
// Transactions module) — for now we fold them down to these three.
function dbStatusToDemoStatus(dbStatus){
  if(dbStatus === 'published') return 'active';
  if(dbStatus === 'archived') return 'sold';
  return 'pending'; // 'draft' rows are shown as pending approval
}

function mapDbRowToDemoListing(row){
  const d = row.property_details;
  return {
    id: nextId++,
    dbId: row.id,
    title: row.title,
    city: row.city || '',
    country: row.country,
    type: TYPE_FROM_DB[d.property_type] || 'Apartment',
    transactionType: d.transaction_type,
    price: Number(row.price) || 0,
    beds: d.bedrooms || 0,
    baths: d.bathrooms || 1,
    size: d.area_sqm || 0,
    status: dbStatusToDemoStatus(row.status),
    views: row.views || 0,
    agentId: null, // team-level assignment isn't wired to real accounts yet
    tags: [],
  };
}

async function loadListingsFromDB(){
  if(!currentOrgId) return;
  const { data, error } = await supabaseClient
    .from('listings')
    .select('*, property_details!inner(*)')
    .eq('organization_id', currentOrgId)
    .order('created_at', { ascending: false });

  if(error){
    toast('warning', 'Could not load listings', error.message);
    return;
  }
  state.listings = (data || []).map(mapDbRowToDemoListing);
}

async function insertListingToDB({ title, country, city, transactionType, dbType, price, beds, size, publish }){
  const { data: listing, error: listingError } = await supabaseClient
    .from('listings')
    .insert({
      kind: 'property',
      owner_profile_id: currentProfile.id,
      organization_id: currentOrgId,
      title, country, city, price,
      currency: 'EUR',
      status: publish ? 'published' : 'draft',
    })
    .select()
    .single();

  if(listingError){ toast('warning', 'Could not save listing', listingError.message); return null; }

  const { error: detailsError } = await supabaseClient
    .from('property_details')
    .insert({
      listing_id: listing.id,
      property_type: dbType,
      transaction_type: transactionType,
      bedrooms: beds,
      bathrooms: 1,
      area_sqm: size,
    });

  if(detailsError){ toast('warning', 'Listing saved, but details failed', detailsError.message); return null; }

  return listing.id;
}

/* ---------------------------------------------------------------------- */
/* TEAM / AGENTS — real memberships + pending invitations                  */
/* ---------------------------------------------------------------------- */
const ROLE_TO_DB = {'Manager':'manager','Senior Agent':'senior_agent','Agent':'agent','Junior Agent':'junior_agent'};
const ROLE_FROM_DB = {manager:'Manager', senior_agent:'Senior Agent', agent:'Agent', junior_agent:'Junior Agent', owner:'Manager', member:'Agent'};

async function loadAgentsFromDB(){
  if(!currentOrgId) return;

  const [{ data: allMembers, error: mErr }, { data: invites, error: iErr }] = await Promise.all([
    supabaseClient.from('memberships').select('*, profiles(*)').eq('organization_id', currentOrgId),
    supabaseClient.from('invitations').select('*').eq('organization_id', currentOrgId).eq('status', 'pending'),
  ]);
  if(mErr) toast('warning', 'Could not load team', mErr.message);
  if(iErr) toast('warning', 'Could not load invitations', iErr.message);

  const memberAgents = (allMembers || []).map(m => {
    const p = m.profiles;
    return {
      id: nextId++, dbId: m.id, dbType: 'membership',
      name: p ? p.full_name : 'Unknown', initials: p ? p.initials : '—',
      role: ROLE_FROM_DB[m.role] || 'Agent',
      market: (p && p.market) || '—',
      listings: 0, leads: 0, closed: 0, revenue: 0, responseTime: '—',
      status: m.status === 'suspended' ? 'suspended' : 'active',
      bio: '',
    };
  });

  const invitedAgents = (invites || []).map(inv => ({
    id: nextId++, dbId: inv.id, dbType: 'invitation',
    name: inv.email, initials: '—',
    role: ROLE_FROM_DB[inv.role] || 'Agent',
    market: '—',
    listings: 0, leads: 0, closed: 0, revenue: 0, responseTime: '—',
    status: 'invited', bio: 'Invitation sent, awaiting registration.',
  }));

  const ownerAgent = {
    id: nextId++, dbId: null, dbType: 'owner',
    name: currentProfile.full_name, initials: currentProfile.initials || '—',
    role: 'Manager', market: currentProfile.market || '—',
    listings: 0, leads: 0, closed: 0, revenue: 0, responseTime: '—',
    status: 'active', bio: 'Agency owner — oversees the full team and pipeline.',
  };

  state.agents = [ownerAgent, ...memberAgents, ...invitedAgents];
}

function agentName(id){ const a = state.agents.find(x=>x.id===id); return a ? a.name : 'Unassigned'; }
function agentInitials(id){ const a = state.agents.find(x=>x.id===id); return a ? a.initials : '—'; }

function populateListingAgentFilter(){
  const sel = document.getElementById('listingAgentFilter');
  sel.innerHTML = '<option value="all">All agents</option>' + state.agents.map(a=>`<option value="${a.id}">${a.name}</option>`).join('');
}

function renderApprovalList(){
  const pending = state.listings.filter(l=>l.status==='pending');
  const box = document.getElementById('approvalList');
  if(pending.length===0){
    box.innerHTML = `<div class="note-box" style="margin-bottom:20px"><i class="ti ti-circle-check"></i> Nothing waiting for approval right now.</div>`;
    return;
  }
  box.innerHTML = pending.map(l=>`
    <div class="card" style="margin-bottom:12px">
      <div class="flex-between" style="flex-wrap:wrap;gap:10px">
        <div>
          <p class="mt">${l.title}</p>
          <p class="ms">${l.city} · submitted by <strong>${agentName(l.agentId)}</strong> (Junior Agent)</p>
        </div>
        <div class="flex flex-gap">
          <button class="btn-secondary btn-sm" onclick="requestListingChanges(${l.id})"><i class="ti ti-message-2"></i>Request changes</button>
          <button class="btn-primary btn-sm" onclick="approveListing(${l.id})"><i class="ti ti-check"></i>Approve &amp; publish</button>
        </div>
      </div>
    </div>`).join('');
}
async function approveListing(id){
  const l = state.listings.find(x=>x.id===id);
  if(!l) return;
  const { error } = await supabaseClient.from('listings').update({ status:'published' }).eq('id', l.dbId);
  if(error){ toast('warning','Could not publish listing', error.message); return; }
  await loadListingsFromDB();
  renderApprovalList(); renderListings(); updateSidebarCounts();
  toast('success','Listing published', `"${l.title}" is now live on LuciHome.`);
}
function requestListingChanges(id){
  const l = state.listings.find(x=>x.id===id);
  toast('info','Changes requested', `${agentName(l.agentId)} has been notified to update "${l.title}".`);
}

function renderListings(){
  const q = (document.getElementById('listingSearch').value||'').toLowerCase();
  const agentFilter = document.getElementById('listingAgentFilter').value;
  const statusFilter = document.getElementById('listingStatusFilter').value;
  let items = state.listings.filter(l=>{
    const matchQ = l.title.toLowerCase().includes(q) || l.city.toLowerCase().includes(q);
    const matchAgent = agentFilter==='all' || String(l.agentId)===agentFilter;
    const matchStatus = statusFilter==='all' || l.status===statusFilter;
    return matchQ && matchAgent && matchStatus;
  });
  const grid = document.getElementById('listingsGrid');
  grid.className = state.listingView==='grid' ? 'grid grid-3' : 'grid grid-2';
  if(items.length===0){
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><i class="ti ti-home-off"></i><p>No listings match your filters.</p></div>`;
    return;
  }
  grid.innerHTML = items.map(l=>`
    <div class="card listing-card">
      <div class="listing-photo" style="${l.grad?`background:linear-gradient(135deg,${l.grad},#20212433)`:''}">
        <i class="ti ${typeIcon[l.type]||'ti-home'}"></i>
        <span class="badge ${statusBadge[l.status]} ph-badge">${statusLabel[l.status]}</span>
        <span class="ph-views"><i class="ti ti-eye"></i>${l.views}</span>
      </div>
      <div class="listing-body">
        <p class="listing-price">${l.price>2000? '€'+l.price.toLocaleString('en-US') : '€'+l.price+' / mo'}</p>
        <p class="listing-addr"><i class="ti ti-map-pin"></i>${l.city}</p>
        <div class="listing-specs">
          <span><i class="ti ti-bed"></i>${l.beds}</span>
          <span><i class="ti ti-bath"></i>${l.baths||1}</span>
          <span><i class="ti ti-ruler-2"></i>${l.size} m²</span>
        </div>
        <p class="ms" style="margin-bottom:12px"><i class="ti ti-user" style="margin-right:4px"></i>${agentName(l.agentId)}</p>
        <div class="listing-actions">
          <button class="btn-secondary btn-sm" style="flex:1" onclick="toast('info','Preview','Opens the public listing page (demo).')"><i class="ti ti-eye"></i>Preview</button>
          <button class="btn-secondary btn-sm" style="flex:1" onclick="reassignListing(${l.id})"><i class="ti ti-arrows-exchange"></i>Reassign</button>
        </div>
      </div>
    </div>`).join('');
}
function reassignListing(id){
  const l = state.listings.find(x=>x.id===id);
  const others = state.agents.filter(a=>a.status==='active' && a.id!==l.agentId);
  const next = others[Math.floor(Math.random()*others.length)];
  l.agentId = next.id;
  renderListings();
  toast('success','Listing reassigned', `"${l.title}" is now assigned to ${next.name}. The client has been notified.`);
}
function setListingView(v){
  state.listingView = v;
  document.getElementById('gridViewBtn').classList.toggle('active', v==='grid');
  document.getElementById('listViewBtn').classList.toggle('active', v==='list');
  renderListings();
}

/* ---------------------------------------------------------------------- */
/* ADD LISTING WIZARD                                                      */
/* ---------------------------------------------------------------------- */
function resetWizard(){
  state.wizardStep = 1;
  state.uploadedFiles = [];
  ['wTitle','wSize','wCity','wZone','wPrice','wBeds','wDesc'].forEach(id=>{ const el=document.getElementById(id); if(el) el.value=''; });
  document.getElementById('uploadedFilesList').innerHTML='';
  populateAgentSelect('wAgent');
  const countrySel = document.getElementById('wCountry');
  if(countrySel && countrySel.options.length===0){
    countrySel.innerHTML = COUNTRIES.map(([code,name])=>`<option value="${code}">${name}</option>`).join('');
  }
  renderWizardStep();
}
function renderWizardStep(){
  for(let i=1;i<=5;i++){ document.getElementById('wizardStep'+i).style.display = (i===state.wizardStep)?'block':'none'; }
  const dots = document.getElementById('wizardDots');
  dots.innerHTML = [1,2,3,4,5].map(i=>`<span class="wdot ${i===state.wizardStep?'active':i<state.wizardStep?'done':''}"></span>`).join('');
  document.getElementById('wizardBackBtn').style.display = state.wizardStep>1 ? 'inline-flex' : 'none';
  document.getElementById('wizardNextBtn').innerHTML = state.wizardStep<5 ? 'Continue' : '<i class="ti ti-send"></i>Submit listing';
}
function wizardNav(dir){
  if(dir>0 && state.wizardStep===5){ submitListing(); return; }
  state.wizardStep = Math.min(5, Math.max(1, state.wizardStep+dir));
  renderWizardStep();
}
function simulateUpload(){
  const n = state.uploadedFiles.length+1;
  state.uploadedFiles.push('photo-'+n+'.jpg');
  document.getElementById('uploadedFilesList').innerHTML = state.uploadedFiles.map(f=>`
    <div class="feed-item" style="border:none;padding:6px 0;cursor:default"><div class="fi-icon"><i class="ti ti-photo"></i></div><div class="fi-text"><p>${f}</p><span>Uploaded</span></div></div>`).join('');
}
function wizardGenerateDesc(){
  const title = document.getElementById('wTitle').value || 'this property';
  const city = document.getElementById('wCity').value || 'the city';
  document.getElementById('wDesc').value = `Discover ${title.toLowerCase()} located in ${city}. This property combines comfort and style, with premium finishes and a layout designed for modern living. Contact the assigned agent today to schedule a viewing.`;
  toast('success','Description generated','The AI description is ready — feel free to edit it.');
}
async function submitListing(){
  const title = document.getElementById('wTitle').value.trim();
  const agentId = Number(document.getElementById('wAgent').value);
  if(!title){ toast('warning','Missing title','Please enter a listing title before submitting.'); return; }
  const agent = state.agents.find(a=>a.id===agentId);
  const needsApproval = agent && agent.role==='Junior Agent';

  const demoType = document.getElementById('wType').value;
  const dbId = await insertListingToDB({
    title,
    country: document.getElementById('wCountry').value,
    city: document.getElementById('wCity').value || 'Bucharest',
    transactionType: document.getElementById('wTransactionType').value,
    dbType: TYPE_TO_DB[demoType] || 'apartment',
    price: Number(document.getElementById('wPrice').value)||0,
    beds: Number(document.getElementById('wBeds').value)||0,
    size: Number(document.getElementById('wSize').value)||0,
    publish: !needsApproval,
  });

  if(!dbId) return; // insertListingToDB already showed an error toast

  await loadListingsFromDB();
  closeModal('modal-add-listing');
  renderListings(); renderApprovalList(); updateSidebarCounts();
  toast('success', needsApproval?'Submitted for approval':'Listing published', needsApproval
    ? `The listing has been sent to you for review before publishing.`
    : `"${title}" is now live on LuciHome.`);
}

/* ---------------------------------------------------------------------- */
/* CRM — kanban pipeline                                                  */
/* ---------------------------------------------------------------------- */
function populateCrmAgentFilter(){
  const sel = document.getElementById('crmAgentFilter');
  sel.innerHTML = '<option value="all">All agents</option><option value="unassigned">Unassigned</option>' + state.agents.map(a=>`<option value="${a.id}">${a.name}</option>`).join('');
}
function renderKanban(){
  const q = (document.getElementById('crmSearch').value||'').toLowerCase();
  const agentFilter = document.getElementById('crmAgentFilter').value;
  const board = document.getElementById('kanbanBoard');
  board.innerHTML = state.stages.map(stage=>{
    const cards = state.contacts.filter(c=>{
      const matchStage = c.stage===stage.id;
      const matchQ = c.name.toLowerCase().includes(q) || c.type.toLowerCase().includes(q);
      const matchAgent = agentFilter==='all' || (agentFilter==='unassigned' ? !c.agentId : String(c.agentId)===agentFilter);
      return matchStage && matchQ && matchAgent;
    });
    return `<div class="kcol" data-stage="${stage.id}" ondragover="event.preventDefault();this.classList.add('dragover')" ondragleave="this.classList.remove('dragover')" ondrop="dropCard(event,'${stage.id}')">
      <div class="kcol-head"><span>${stage.label}</span><span class="kcol-count">${cards.length}</span></div>
      ${cards.map(c=>`
        <div class="kcard" draggable="true" ondragstart="dragCard(event,${c.id})" onclick="openContactDrawer(${c.id})">
          <p class="kname"><span class="kavatar">${c.initials}</span>${c.name}</p>
          <p class="kmeta">€${c.budget.toLocaleString('en-US')} · ${c.type}</p>
          <p class="kmeta">${c.agentId ? '<i class="ti ti-user"></i> '+agentName(c.agentId) : '<span style="color:var(--warning)"><i class="ti ti-alert-circle"></i> Unassigned</span>'}</p>
        </div>`).join('')}
    </div>`;
  }).join('');
  document.getElementById('crmUnassignedCount').textContent = state.contacts.filter(c=>!c.agentId).length;
  document.getElementById('crmOver24Count').textContent = 2;
  document.getElementById('crmClosedCount').textContent = state.contacts.filter(c=>c.stage==='closed').length;
}
let draggedId = null;
function dragCard(e,id){ draggedId = id; e.target.classList.add('dragging'); }
function dropCard(e, stageId){
  e.currentTarget.classList.remove('dragover');
  const contact = state.contacts.find(c=>c.id===draggedId);
  if(contact){ contact.stage = stageId; }
  document.querySelectorAll('.kcard.dragging').forEach(el=>el.classList.remove('dragging'));
  renderKanban(); renderDashboardCharts();
  toast('success','Moved', `${contact.name} moved to "${state.stages.find(s=>s.id===stageId).label}".`);
}

function openContactDrawer(id){
  state.selectedContactId = id;
  const c = state.contacts.find(x=>x.id===id);
  document.getElementById('cdName').textContent = c.name;
  document.getElementById('cdBody').innerHTML = `
    <div class="flex flex-gap" style="align-items:center;margin-bottom:16px">
      <div class="avatar-circle lg">${c.initials}</div>
      <div>
        <p class="mt" style="font-size:16px;margin-bottom:4px">${c.name}</p>
        <span class="badge badge-neutral">${c.type}</span>
      </div>
    </div>
    <div class="grid grid-2" style="margin-bottom:16px">
      <div class="mini-stat"><p class="v">€${c.budget.toLocaleString('en-US')}</p><p class="l">Budget</p></div>
      <div class="mini-stat"><p class="v">${state.stages.find(s=>s.id===c.stage).label}</p><p class="l">Stage</p></div>
    </div>
    <div class="field"><label class="field-label">Assigned agent</label>
      <select class="select" id="cdAgentSelect">
        <option value="">Unassigned</option>
        ${state.agents.filter(a=>a.status==='active').map(a=>`<option value="${a.id}" ${a.id===c.agentId?'selected':''}>${a.name}</option>`).join('')}
      </select>
    </div>
    <div class="field"><label class="field-label">Notes</label><textarea class="textarea" id="cdNotes">${c.notes}</textarea></div>
    <p class="field-label" style="margin-top:6px">Activity history</p>
    ${c.activity.map(a=>`<div class="feed-item" style="border:none;padding:6px 0;cursor:default"><div class="fi-icon"><i class="ti ti-clock"></i></div><div class="fi-text"><p>${a.t}</p><span>${a.d}</span></div></div>`).join('')}
  `;
  document.getElementById('contactDrawer').classList.add('open');
  document.getElementById('contactDrawerBackdrop').classList.add('open');
}
function closeContactDrawer(){
  document.getElementById('contactDrawer').classList.remove('open');
  document.getElementById('contactDrawerBackdrop').classList.remove('open');
}
function saveContactDetail(){
  const c = state.contacts.find(x=>x.id===state.selectedContactId);
  if(!c) return;
  const agentId = document.getElementById('cdAgentSelect').value;
  const wasUnassigned = !c.agentId;
  c.agentId = agentId ? Number(agentId) : null;
  c.notes = document.getElementById('cdNotes').value;
  closeContactDrawer();
  renderKanban();
  toast('success','Saved', wasUnassigned && c.agentId ? `${c.name} has been assigned to ${agentName(c.agentId)}.` : `Changes to ${c.name} have been saved.`);
}
function addContact(){
  const name = document.getElementById('cName').value.trim();
  if(!name){ toast('warning','Missing name','Please enter the client\'s full name.'); return; }
  const agentId = document.getElementById('cAgent').value;
  state.contacts.push({
    id: nextId++, name, initials: name.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase(),
    budget: Number(document.getElementById('cBudget').value)||0, type: document.getElementById('cType').value,
    stage:'new', agentId: agentId?Number(agentId):null, notes: document.getElementById('cNotes').value, activity:[{d:'Today', t:'Lead added manually by the agency manager'}],
  });
  closeModal('modal-add-contact');
  ['cName','cEmail','cPhone','cBudget','cNotes'].forEach(id=>document.getElementById(id).value='');
  renderKanban(); updateSidebarCounts();
  toast('success','Lead added', `${name} has been added to the CRM.`);
}

/* ---------------------------------------------------------------------- */
/* TRANSACTIONS — multi-agent deal room                                   */
/* ---------------------------------------------------------------------- */
function renderTx(){
  const list = document.getElementById('txList');
  list.innerHTML = state.transactions.map(t=>`
    <div class="list-row ${t.id===state.currentTxId?'selected':''}" onclick="selectTx(${t.id})">
      <div class="avatar-circle">${agentInitials(t.agentId)}</div>
      <div style="flex:1;min-width:0">
        <p class="lr-title">${t.property} ${t.stalled?'<span class="badge badge-danger" style="margin-left:6px">Stalled</span>':''}</p>
        <p class="lr-sub">${agentName(t.agentId)} · ${state.txStages[t.stage]}</p>
      </div>
    </div>`).join('');
  renderDealRoom();
}
function selectTx(id){ state.currentTxId = id; renderTx(); }
function renderDealRoom(){
  const t = state.transactions.find(x=>x.id===state.currentTxId);
  const box = document.getElementById('dealRoom');
  if(!t){ box.innerHTML = `<div class="detail-empty"><i class="ti ti-file-invoice"></i><p>Select a transaction</p></div>`; return; }
  box.innerHTML = `
    <div class="flex-between" style="margin-bottom:6px">
      <p class="mt" style="font-size:17px">${t.property}</p>
      ${t.stalled?'<span class="badge badge-danger"><i class="ti ti-alert-triangle"></i>No activity in 6 days</span>':''}
    </div>
    <p class="ms" style="margin-bottom:18px">Handled by <strong>${agentName(t.agentId)}</strong> · Buyer: ${t.buyer} · Seller: ${t.seller}</p>

    <div class="stepper">
      ${state.txStages.map((s,i)=>`<div class="step ${i<t.stage?'done':i===t.stage?'current':''}"><div class="sline"></div><div class="sdot">${i<t.stage?'<i class="ti ti-check"></i>':i+1}</div><div class="slabel">${s}</div></div>`).join('')}
    </div>

    <div class="grid grid-2" style="margin-bottom:20px">
      <div class="mini-stat"><p class="v">€${t.commission.toLocaleString('en-US')}</p><p class="l">Commission (${t.commissionStatus})</p></div>
      <div class="mini-stat"><p class="v">${t.lastActivity}</p><p class="l">Last activity</p></div>
    </div>

    <p class="field-label">Checklist</p>
    ${t.checklist.map((c,i)=>`<div class="chk-row ${c.done?'done':''}"><input type="checkbox" ${c.done?'checked':''} onchange="toggleChecklist(${t.id},${i})" id="chk${i}"><label for="chk${i}">${c.t}</label></div>`).join('')}

    <p class="field-label" style="margin-top:16px">Documents</p>
    ${t.docs.map(d=>`<div class="feed-item" style="border:none;padding:6px 0;cursor:default"><div class="fi-icon"><i class="ti ti-file-text"></i></div><div class="fi-text"><p>${d}</p><span>Uploaded</span></div></div>`).join('')}
    <button class="btn-secondary btn-sm" style="margin-top:8px" onclick="toast('info','Document vault','Manager-level upload is available from the deal room (demo).')"><i class="ti ti-cloud-upload"></i>Upload agency document</button>
  `;
}
function toggleChecklist(txId, idx){
  const t = state.transactions.find(x=>x.id===txId);
  t.checklist[idx].done = !t.checklist[idx].done;
  t.lastActivity = 'just now';
  t.stalled = false;
  renderDealRoom(); renderTx();
}
function toggleArchive(){
  state.archiveVisible = !state.archiveVisible;
  const box = document.getElementById('txArchive');
  box.style.display = state.archiveVisible ? 'block' : 'none';
  document.getElementById('archiveBtnLabel').textContent = state.archiveVisible ? 'Hide archive' : 'Closed deals archive';
  if(state.archiveVisible){
    box.innerHTML = `<div class="section-label" style="margin-top:0">Closed deals</div>` + state.archivedTx.map(a=>`
      <div class="list-row">
        <div class="avatar-circle">${agentInitials(a.agentId)}</div>
        <div style="flex:1;min-width:0"><p class="lr-title">${a.property}</p><p class="lr-sub">${agentName(a.agentId)} · Closed ${a.closedOn} · €${a.commission.toLocaleString('en-US')}</p></div>
      </div>`).join('');
  }
}

/* ---------------------------------------------------------------------- */
/* REFERRALS                                                               */
/* ---------------------------------------------------------------------- */
function populateReferralSelects(){
  const clientSel = document.getElementById('rClient');
  clientSel.innerHTML = state.contacts.map(c=>`<option value="${c.id}">${c.name}</option>`).join('');
  populateAgentSelect('rAgentHandling');
}
function renderReferrals(){
  document.getElementById('refSentCount').textContent = state.sentReferrals.length;
  document.getElementById('refReceivedCount').textContent = state.receivedReferrals.length;
  document.getElementById('refProgressCount').textContent = state.sentReferrals.filter(r=>r.status==='pending').length + state.receivedReferrals.filter(r=>r.status==='pending').length;
  document.getElementById('refClosedCount').textContent = state.sentReferrals.filter(r=>r.status==='closed').length;

  document.getElementById('sentReferralsList').innerHTML = state.sentReferrals.map(r=>`
    <div class="card">
      <div class="flex-between"><p class="mt">${r.client}</p><span class="badge ${r.status==='closed'?'badge-active':'badge-pending'}">${r.status}</span></div>
      <p class="ms">To ${r.market}</p>
      <p class="ms">Partner: ${r.agent}</p>
      <p class="ms">Handled by: ${r.handlingAgent} · Commission: ${r.pct}%</p>
    </div>`).join('') || `<div class="empty-state"><i class="ti ti-send"></i><p>No referrals sent yet.</p></div>`;

  document.getElementById('receivedReferralsList').innerHTML = state.receivedReferrals.map(r=>`
    <div class="card">
      <div class="flex-between"><p class="mt">${r.client}</p><span class="badge badge-pending">${r.status}</span></div>
      <p class="ms">From ${r.agent} · Market: ${r.market}</p>
      <p class="ms">Budget: €${r.budget.toLocaleString('en-US')} · Commission: ${r.pct}%</p>
      <p class="ms" style="margin-bottom:10px">${r.notes}</p>
      ${r.assignedTo ? `<span class="badge badge-active"><i class="ti ti-user-check"></i>Assigned to ${r.assignedTo}</span>` : `
      <div class="field" style="margin-bottom:0">
        <label class="field-label">Assign to agent</label>
        <select class="select" onchange="assignReceivedReferral(${r.id}, this.value)">
          <option value="">Choose an agent...</option>
          ${state.agents.filter(a=>a.status==='active').map(a=>`<option value="${a.name}">${a.name}</option>`).join('')}
        </select>
      </div>`}
    </div>`).join('');

  document.getElementById('partnersList').innerHTML = state.partners.map(p=>`
    <div class="card pro-card">
      <div class="pro-head">
        <div class="avatar-circle">${p.name.split(' ').map(n=>n[0]).join('').slice(0,2)}</div>
        <div><p class="n">${p.name}</p><p class="r">${p.market}</p></div>
      </div>
      <p class="ms">Contact: ${p.contact} · ${p.lang}</p>
      <p class="ms"><span class="stars">★</span> ${p.rating} · ${p.deals} active deals</p>
      <button class="btn-secondary btn-sm btn-block" onclick="toast('info','Quick referral','Opens the send-referral form pre-filled with this partner (demo).');openModal('modal-send-referral')"><i class="ti ti-send"></i>Send referral</button>
    </div>`).join('');
}
function assignReceivedReferral(id, agentName){
  if(!agentName) return;
  const r = state.receivedReferrals.find(x=>x.id===id);
  r.assignedTo = agentName;
  renderReferrals();
  toast('success','Referral assigned', `${r.client} has been assigned to ${agentName}.`);
}
function sendReferral(){
  const clientSel = document.getElementById('rClient');
  const client = clientSel.options[clientSel.selectedIndex]?.text || 'Client';
  const agentSel = document.getElementById('rAgentHandling');
  const handlingAgent = agentSel.options[agentSel.selectedIndex]?.text?.split(' — ')[0] || 'Unassigned';
  state.sentReferrals.unshift({
    id: nextId++, client, market: document.getElementById('rMarket').value, agent: document.getElementById('rAgent').value,
    handlingAgent, pct: Number(document.getElementById('rPct').value), status:'pending',
  });
  closeModal('modal-send-referral');
  renderReferrals();
  toast('success','Referral sent', `The referral for ${client} has been sent.`);
}

/* ---------------------------------------------------------------------- */
/* NETWORK                                                                 */
/* ---------------------------------------------------------------------- */
function renderDirectory(){
  const q = (document.getElementById('dirSearch').value||'').toLowerCase();
  const type = document.getElementById('dirType').value;
  const items = state.directory.filter(d=>{
    const matchQ = d.name.toLowerCase().includes(q);
    const matchType = type==='all' || d.type===type;
    return matchQ && matchType;
  });
  document.getElementById('directoryGrid').innerHTML = items.map(d=>`
    <div class="card pro-card">
      <div class="pro-head">
        <div class="avatar-circle">${d.name.split(' ').map(n=>n[0]).join('').slice(0,2)}</div>
        <div><p class="n">${d.name}</p><p class="r">${d.type} · ${d.market}</p></div>
      </div>
      <p class="ms">${d.lang} · <span class="stars">★</span> ${d.rating}</p>
      <button class="btn-secondary btn-sm btn-block" onclick="toggleConnect(this,${d.id})">${d.connected?'Connected <i class="ti ti-check"></i>':'Connect'}</button>
    </div>`).join('') || `<div class="empty-state" style="grid-column:1/-1"><i class="ti ti-network"></i><p>No professionals match your search.</p></div>`;
}
function toggleConnect(btn, id){
  const d = state.directory.find(x=>x.id===id);
  d.connected = !d.connected;
  btn.innerHTML = d.connected ? 'Connected <i class="ti ti-check"></i>' : 'Connect';
  toast(d.connected?'success':'info', d.connected?'Connected':'Disconnected', `${d.name} ${d.connected?'has been added to':'has been removed from'} your professional network.`);
}
function renderMyNetworkGrid(){
  const connected = state.directory.filter(d=>d.connected && d.type==='Agency');
  document.getElementById('myNetworkGrid').innerHTML = connected.map(d=>{
    const dealCount = state.sentReferrals.concat(state.receivedReferrals).filter(r=>r.agent && r.agent.includes(d.name)).length;
    return `<div class="card pro-card">
      <div class="pro-head">
        <div class="avatar-circle">${d.name.split(' ').map(n=>n[0]).join('').slice(0,2)}</div>
        <div><p class="n">${d.name}</p><p class="r">${d.market}</p></div>
      </div>
      <p class="ms">${dealCount} active referral${dealCount===1?'':'s'} in progress</p>
    </div>`;
  }).join('');
}
function renderDevProjects(){
  document.getElementById('devProjectsGrid').innerHTML = state.devProjects.map(p=>`
    <div class="card">
      <p class="mt">${p.name}</p>
      <p class="ms"><i class="ti ti-map-pin" style="margin-right:4px"></i>${p.location}</p>
      <p class="ms" style="margin-bottom:12px">${p.desc}</p>
      <button class="btn-${p.applied?'secondary':'primary'} btn-sm" onclick="toggleApplyProject(${p.id})">${p.applied?'Applied <i class="ti ti-check"></i>':'Apply as selling agency'}</button>
    </div>`).join('');
}
function toggleApplyProject(id){
  const p = state.devProjects.find(x=>x.id===id);
  p.applied = !p.applied;
  renderDevProjects();
  toast(p.applied?'success':'info', p.applied?'Application sent':'Application withdrawn', `${p.name}${p.applied?' developer has been notified.':' application has been withdrawn.'}`);
}
function renderMarketGroups(){
  document.getElementById('marketGroupsGrid').innerHTML = state.marketGroups.map(g=>`
    <div class="card">
      <p class="mt">${g.name}</p>
      <p class="ms" style="margin-bottom:10px">${g.desc}</p>
      <p class="ms" style="margin-bottom:12px"><i class="ti ti-users" style="margin-right:4px"></i>${g.members} members</p>
      <button class="btn-${g.joined?'secondary':'primary'} btn-sm btn-block" onclick="toggleJoinGroup(${g.id})">${g.joined?'Joined <i class="ti ti-check"></i>':'Join group'}</button>
    </div>`).join('');
}
function toggleJoinGroup(id){
  const g = state.marketGroups.find(x=>x.id===id);
  g.joined = !g.joined;
  if(g.joined) g.members++; else g.members--;
  renderMarketGroups();
  toast(g.joined?'success':'info', g.joined?'Joined':'Left group', `Your agency has ${g.joined?'joined':'left'} "${g.name}".`);
}

/* ---------------------------------------------------------------------- */
/* BRAND & PROFILE                                                        */
/* ---------------------------------------------------------------------- */
let profileEditing = false;
function toggleProfileEdit(){
  profileEditing = !profileEditing;
  document.getElementById('profBio').contentEditable = profileEditing;
  document.getElementById('profBio').style.outline = profileEditing ? '1px dashed var(--border-strong)' : 'none';
  document.getElementById('profBio').style.padding = profileEditing ? '8px' : '0';
  document.getElementById('profEditFields').querySelectorAll('input').forEach(i=>i.disabled = !profileEditing);
  const btn = document.getElementById('editProfileBtn');
  btn.innerHTML = profileEditing ? '<i class="ti ti-check"></i>Save changes' : '<i class="ti ti-edit"></i>Edit profile';
  if(!profileEditing) toast('success','Profile updated','Your agency profile changes have been saved.');
}
function renderPublicRoster(){
  document.getElementById('publicRosterList').innerHTML = state.agents.filter(a=>a.status==='active').map(a=>`
    <div class="card" style="padding:14px">
      <div class="flex flex-gap" style="align-items:center">
        <div class="avatar-circle">${a.initials}</div>
        <div><p class="mt" style="margin-bottom:2px;font-size:13.5px">${a.name}</p><p class="ms">${a.role}</p></div>
      </div>
    </div>`).join('');
}
function renderColorSwatches(){
  document.getElementById('colorSwatches').innerHTML = BRAND_COLORS.map(c=>`
    <div class="color-swatch ${c===state.brandColor?'selected':''}" style="background:${c}" onclick="selectBrandColor('${c}')"></div>`).join('');
}
function selectBrandColor(c){
  state.brandColor = c;
  renderColorSwatches();
  toast('success','Brand color updated', 'Applied to your profile header and listing cards.');
}
function copyEmbed(){
  toast('success','Copied','The embed code has been copied to your clipboard (demo).');
}

/* ---------------------------------------------------------------------- */
/* ANALYTICS — export                                                      */
/* ---------------------------------------------------------------------- */
function exportReport(){
  const lines = [
    'LuciHome — Agency Performance Report',
    'Agency: Bucharest Prime Realty',
    'Generated: ' + new Date().toLocaleDateString('en-US'),
    '',
    'Active agents: ' + state.agents.filter(a=>a.status==='active').length,
    'Active listings: ' + state.listings.filter(l=>l.status==='active').length,
    'Open transactions: ' + state.transactions.length,
    'Commission earned: €41,300',
    'Commission pending: €22,600',
    'Commission projected: €96,000',
    '',
    'Agent leaderboard (by revenue):',
    ...[...state.agents].filter(a=>a.status==='active').sort((a,b)=>b.revenue-a.revenue).map(a=>`  - ${a.name}: €${a.revenue.toLocaleString('en-US')} (${a.closed} closed)`),
  ];
  downloadFile('lucihome-agency-report.txt', lines.join('\n'));
  toast('success','Report exported','The file lucihome-agency-report.txt has been downloaded.');
}
function exportAccountData(){
  const data = {
    agency:{name:'Bucharest Prime Realty', contact:'office@lucihome.com'},
    agents: state.agents,
    listings: state.listings,
    contacts: state.contacts,
    transactions: state.transactions,
  };
  downloadFile('lucihome-agency-data.json', JSON.stringify(data, null, 2));
  toast('success','Export complete','Your agency data has been downloaded as JSON.');
}
function downloadFile(filename, content){
  const blob = new Blob([content], {type:'text/plain'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/* ---------------------------------------------------------------------- */
/* SETTINGS & TEAM MODALS                                                  */
/* ---------------------------------------------------------------------- */
function toggleIntegration(btn){
  const connected = btn.classList.toggle('connected');
  btn.innerHTML = connected ? 'Connected <i class="ti ti-check"></i>' : 'Connect';
  toast(connected?'success':'info', connected?'Integration active':'Integration disabled', `${btn.dataset.name} is now ${connected?'connected':'disconnected'}.`);
}
async function inviteAgent(){
  const email = document.getElementById('iEmail').value.trim();
  const role = document.getElementById('iRole').value;
  if(!email){ toast('warning','Missing details','Please enter the agent\'s email.'); return; }

  const { error } = await supabaseClient.from('invitations').insert({
    organization_id: currentOrgId,
    email,
    role: ROLE_TO_DB[role] || 'agent',
    invited_by: currentProfile.id,
  });

  if(error){
    toast('warning','Could not send invitation', error.message);
    return;
  }

  closeModal('modal-invite-agent');
  ['iName','iEmail','iMarket'].forEach(id=>document.getElementById(id).value='');
  await loadAgentsFromDB();
  renderAgents(); updateSidebarCounts();
  toast('success','Invitation recorded', `${email} will be linked to your agency automatically once they create a LuciHome account with this email.`);
}

/* ---------------------------------------------------------------------- */
/* SIDEBAR COUNTS                                                          */
/* ---------------------------------------------------------------------- */
function updateSidebarCounts(){
  document.querySelector('.nav-item[data-section="team"] .nbadge').textContent = state.agents.filter(a=>a.status==='active').length;
  const activeListings = state.listings.filter(l=>l.status==='active'||l.status==='offer'||l.status==='pending').length;
  document.querySelector('.nav-item[data-section="listings"] .nbadge').textContent = activeListings;
  const activeLeads = state.contacts.filter(c=>c.stage!=='closed').length;
  document.querySelector('.nav-item[data-section="crm"] .nbadge').textContent = activeLeads;
  document.querySelector('.nav-item[data-section="transactions"] .nbadge').textContent = state.transactions.length;
}

/* ---------------------------------------------------------------------- */
/* HEADER / GREETING STATS — replace static demo numbers with real ones    */
/* ---------------------------------------------------------------------- */
let currentOrg = null;

function updateHeaderStats(){
  const activeAgents = state.agents.filter(a=>a.status==='active').length;
  const pendingInvites = state.agents.filter(a=>a.status==='invited').length;
  const firstName = (currentProfile.full_name||'').split(' ')[0] || 'there';
  const orgName = currentOrg ? currentOrg.name : '';

  document.getElementById('greetingTitle').textContent = `Good morning, ${firstName}`;
  document.getElementById('greetingSub').textContent =
    `Here's how ${orgName} is doing today — across ${activeAgents} active agent${activeAgents===1?'':'s'}.`;

  document.getElementById('statActiveAgents').textContent = activeAgents;
  document.getElementById('statActiveListings').textContent = state.listings.length;

  document.getElementById('statTeamActiveAgents').textContent = activeAgents;
  document.getElementById('statPendingInvites').textContent = pendingInvites;
  document.getElementById('statSeatsUsed').textContent = `${activeAgents} / 20`;
  document.getElementById('statSeatMeterText').textContent = `${activeAgents} of 20 included seats used.`;
  const fill = document.getElementById('seatMeterFill');
  if(fill) fill.style.width = Math.min(100, (activeAgents/20)*100) + '%';

  document.getElementById('topbarUserName').textContent = currentProfile.full_name;
  document.getElementById('topbarUserRole').textContent = orgName ? `Agency Manager · ${orgName}` : 'Agency Manager';
}

/* ---------------------------------------------------------------------- */
/* INIT                                                                    */
/* ---------------------------------------------------------------------- */
async function init(){
  const auth = await requireAuth('agency');
  if(!auth) return; // requireAuth already redirected to auth.html
  currentProfile = auth.profile;
  currentOrgId = auth.profile.organization_id;

  const { data: org } = await supabaseClient.from('organizations').select('*').eq('id', currentOrgId).single();
  currentOrg = org;

  await loadListingsFromDB();
  await loadAgentsFromDB();
  updateHeaderStats();

  renderFeed();
  renderAttentionList();
  renderLeaderboard();
  renderDashboardCharts();

  populateListingAgentFilter();
  renderApprovalList();
  renderListings();

  renderAgents();
  renderTeamAgenda();
  renderResources();

  populateCrmAgentFilter();
  renderKanban();

  renderTx();
  renderReferrals();
  renderDirectory();
  renderMyNetworkGrid();
  renderDevProjects();
  renderMarketGroups();

  renderPublicRoster();
  renderColorSwatches();

  renderAgentPerfTable();
  renderAnalyticsCharts();

  updateSidebarCounts();

  document.getElementById('globalSearch').addEventListener('keydown', e=>{
    if(e.key==='Enter' && e.target.value.trim()){
      showSection('listings');
      document.getElementById('listingSearch').value = e.target.value;
      renderListings();
      toast('info','Search','Listings have been filtered based on your search.');
    }
  });
}
document.addEventListener('DOMContentLoaded', init);
