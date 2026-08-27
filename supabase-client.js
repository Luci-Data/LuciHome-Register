/* ==========================================================================
   LuciHome — shared Supabase client + auth guard
   Included by every workspace page (agenciesdemo.html, agentdemo.html, ...)
   Requires the supabase-js CDN script to be loaded BEFORE this file.
   ========================================================================== */

const SUPABASE_URL = 'https://bmfxoqpcykwftyctnsdc.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_G4p1eXVVYkcSVXogwWXdTQ_Dy4DebyO';
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Same list used on the public search page (index.html) — keep both in sync
// if you add a country to one, add it to the other too.
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

/**
 * Call at the top of every protected workspace page.
 * Redirects to auth.html if there's no session, or if the logged-in
 * account's type doesn't match the page (e.g. an Agent trying to open
 * the Agency workspace). Returns { user, profile } on success.
 */
async function requireAuth(expectedAccountType){
  const { data: { session } } = await supabaseClient.auth.getSession();
  if(!session){
    window.location.href = 'auth.html';
    return null;
  }

  const { data: profile, error } = await supabaseClient
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single();

  if(error || !profile){
    window.location.href = 'auth.html';
    return null;
  }

  if(expectedAccountType && profile.account_type !== expectedAccountType){
    // Logged in, but this isn't their workspace — send them to auth,
    // which will route them to the correct one.
    window.location.href = 'auth.html';
    return null;
  }

  return { user: session.user, profile };
}

async function signOut(){
  await supabaseClient.auth.signOut();
  window.location.href = 'auth.html';
}