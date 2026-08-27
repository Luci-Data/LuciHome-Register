/* ==========================================================================
   LuciHome — Public Search Page logic
   No login required: reads only PUBLISHED listings and PROFESSIONAL
   profiles/organizations, thanks to the public-read RLS policies.
   ========================================================================== */

const SUPABASE_URL = 'https://bmfxoqpcykwftyctnsdc.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_G4p1eXVVYkcSVXogwWXdTQ_Dy4DebyO';
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// A working list of 60+ countries. Extend anytime — this is a plain array,
// not a database enum, so adding a country never needs a schema change.
const COUNTRIES = [
  ['RO','Romania'],['FR','France'],['ES','Spain'],['IT','Italy'],['PT','Portugal'],
  ['DE','Germany'],['GB','United Kingdom'],['US','United States'],['CA','Canada'],
  ['NL','Netherlands'],['BE','Belgium'],['CH','Switzerland'],['AT','Austria'],
  ['GR','Greece'],['TR','Turkey'],['PL','Poland'],['CZ','Czech Republic'],
  ['HU','Hungary'],['BG','Bulgaria'],['HR','Croatia'],['RS','Serbia'],
  ['UA','Ukraine'],['MD','Moldova'],['IE','Ireland'],['SE','Sweden'],
  ['NO','Norway'],['DK','Denmark'],['FI','Finland'],['IS','Iceland'],
  ['SK','Slovakia'],['SI','Slovenia'],['AL','Albania'],['MK','North Macedonia'],
  ['ME','Montenegro'],['CY','Cyprus'],['MT','Malta'],['LU','Luxembourg'],
  ['EE','Estonia'],['LV','Latvia'],['LT','Lithuania'],
  ['AE','United Arab Emirates'],['SA','Saudi Arabia'],['QA','Qatar'],
  ['IL','Israel'],['EG','Egypt'],['MA','Morocco'],['TN','Tunisia'],
  ['ZA','South Africa'],['NG','Nigeria'],['KE','Kenya'],
  ['CN','China'],['JP','Japan'],['KR','South Korea'],['IN','India'],
  ['TH','Thailand'],['VN','Vietnam'],['ID','Indonesia'],['SG','Singapore'],
  ['MY','Malaysia'],['PH','Philippines'],
  ['AU','Australia'],['NZ','New Zealand'],
  ['MX','Mexico'],['BR','Brazil'],['AR','Argentina'],['CL','Chile'],['CO','Colombia'],
];

let currentCategory = 'property';

/* ---------------------------------------------------------------------- */
/* INIT                                                                     */
/* ---------------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  populateCountryDropdown();
  bindCategoryTabs();
  loadProperties();
});

function populateCountryDropdown(){
  const sel = document.getElementById('fCountry');
  COUNTRIES
    .slice()
    .sort((a,b)=>a[1].localeCompare(b[1]))
    .forEach(([code,name])=>{
      const opt = document.createElement('option');
      opt.value = code;
      opt.textContent = name;
      sel.appendChild(opt);
    });
}

/* ---------------------------------------------------------------------- */
/* CATEGORY TABS                                                            */
/* ---------------------------------------------------------------------- */
function bindCategoryTabs(){
  document.getElementById('categoryTabs').addEventListener('click', (e)=>{
    const tab = e.target.closest('.cat-tab');
    if(!tab) return;
    document.querySelectorAll('.cat-tab').forEach(t=>t.classList.remove('active'));
    tab.classList.add('active');
    currentCategory = tab.dataset.cat;

    document.getElementById('propertyFilters').style.display =
      currentCategory === 'property' ? 'flex' : 'none';

    if(currentCategory === 'property') loadProperties();
    else loadProfessionals(currentCategory);
  });
}

/* ---------------------------------------------------------------------- */
/* PROPERTIES                                                               */
/* ---------------------------------------------------------------------- */
async function loadProperties(){
  const grid = document.getElementById('resultsGrid');
  const header = document.getElementById('resultsHeader');
  grid.innerHTML = '';
  header.textContent = 'Loading...';

  const country = document.getElementById('fCountry').value;
  const city = document.getElementById('fCity').value.trim();
  const transaction = document.getElementById('fTransaction').value;
  const type = document.getElementById('fType').value;
  const minPrice = document.getElementById('fMinPrice').value;
  const maxPrice = document.getElementById('fMaxPrice').value;
  const keyword = document.getElementById('fKeyword').value.trim();

  let query = supabaseClient
    .from('listings')
    .select('*, property_details!inner(*)')
    .eq('kind', 'property')
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(60);

  if(country) query = query.eq('country', country);
  if(city) query = query.ilike('city', `%${city}%`);
  if(minPrice) query = query.gte('price', minPrice);
  if(maxPrice) query = query.lte('price', maxPrice);
  if(keyword) query = query.or(`title.ilike.%${keyword}%,description.ilike.%${keyword}%`);
  if(transaction) query = query.eq('property_details.transaction_type', transaction);
  if(type) query = query.eq('property_details.property_type', type);

  const { data, error } = await query;

  if(error){
    header.textContent = '';
    grid.innerHTML = `<div class="empty-state">Something went wrong loading properties.<br><small>${error.message}</small></div>`;
    return;
  }

  if(!data || data.length === 0){
    header.textContent = '';
    grid.innerHTML = '<div class="empty-state">No properties match your search. Try widening your filters.</div>';
    return;
  }

  header.textContent = `${data.length} propert${data.length===1?'y':'ies'} found`;
  grid.innerHTML = data.map(renderPropertyCard).join('');
}

function renderPropertyCard(listing){
  const d = listing.property_details;
  const priceFormatted = formatPrice(listing.price, listing.currency);
  const countryName = (COUNTRIES.find(c=>c[0]===listing.country) || [null,listing.country])[1];
  const badgeClass = d.transaction_type === 'rent' ? 'badge-tag rent' : 'badge-tag';
  const badgeText = d.transaction_type === 'rent' ? 'For Rent' : 'For Sale';

  return `
    <div class="card" onclick="alert('Property detail page — coming next.')">
      <img class="card-img" src="${listing.cover_image_url || 'https://placehold.co/640x420?text=No+Photo'}" alt="${escapeHtml(listing.title)}">
      <div class="card-body">
        <span class="${badgeClass}">${badgeText}</span>
        <div class="card-price">${priceFormatted}${d.transaction_type==='rent' ? ' / mo' : ''}</div>
        <div class="card-title">${escapeHtml(listing.title)}</div>
        <div class="card-location">${escapeHtml(listing.city || '')}, ${escapeHtml(countryName)}</div>
        <div class="card-badges">
          ${d.bedrooms ? `<span>${d.bedrooms} bed</span>` : ''}
          ${d.bathrooms ? `<span>${d.bathrooms} bath</span>` : ''}
          ${d.area_sqm ? `<span>${d.area_sqm} m²</span>` : ''}
        </div>
      </div>
    </div>
  `;
}

/* ---------------------------------------------------------------------- */
/* PROFESSIONALS (Developers / Architects & Designers / Agents)            */
/* ---------------------------------------------------------------------- */
async function loadProfessionals(category){
  const grid = document.getElementById('resultsGrid');
  const header = document.getElementById('resultsHeader');
  grid.innerHTML = '';
  header.textContent = 'Loading...';

  let data, error;

  if(category === 'developer'){
    ({ data, error } = await supabaseClient
      .from('organizations')
      .select('id, name, logo_url, market, verified')
      .eq('type', 'developer')
      .order('created_at', { ascending: false }));
  } else {
    // 'architect' or 'agent'
    ({ data, error } = await supabaseClient
      .from('profiles')
      .select('id, full_name, avatar_url, market, verified')
      .eq('account_type', category)
      .order('created_at', { ascending: false }));
  }

  if(error){
    header.textContent = '';
    grid.innerHTML = `<div class="empty-state">Something went wrong loading this directory.<br><small>${error.message}</small></div>`;
    return;
  }

  if(!data || data.length === 0){
    header.textContent = '';
    grid.innerHTML = '<div class="empty-state">No profiles here yet — check back soon.</div>';
    return;
  }

  header.textContent = `${data.length} found`;
  grid.innerHTML = data.map(renderProfessionalCard).join('');
}

function renderProfessionalCard(p){
  const name = p.name || p.full_name || 'Unnamed';
  const initials = name.split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase();
  const avatarUrl = p.logo_url || p.avatar_url;

  return `
    <div class="pro-card">
      <div class="pro-avatar">${avatarUrl ? `<img src="${avatarUrl}" alt="${escapeHtml(name)}">` : initials}</div>
      <div class="pro-name">${escapeHtml(name)}</div>
      <div class="pro-market">${escapeHtml(p.market || 'Market not specified')}</div>
      ${p.verified ? '<span class="pro-verified">✓ Verified</span>' : ''}
    </div>
  `;
}

/* ---------------------------------------------------------------------- */
/* HELPERS                                                                  */
/* ---------------------------------------------------------------------- */
function formatPrice(price, currency){
  if(price == null) return 'Price on request';
  const symbol = currency === 'USD' ? '$' : currency === 'GBP' ? '£' : '€';
  return symbol + Number(price).toLocaleString('en-US');
}
function escapeHtml(str){
  if(!str) return '';
  return str.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}