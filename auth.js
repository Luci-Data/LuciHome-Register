/* ==========================================================================
   LuciHome — Auth logic (Sign in / Create account) via Supabase
   ========================================================================== */

// ---------------------------------------------------------------------------
// Supabase project credentials
// ---------------------------------------------------------------------------
const SUPABASE_URL = 'https://bmfxoqpcykwftyctnsdc.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_G4p1eXVVYkcSVXogwWXdTQ_Dy4DebyO';

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// After login/register, each account type goes to its own workspace.
// private_seller / private_buyer workspaces don't exist yet — update these
// once those pages are built.
const WORKSPACE_BY_TYPE = {
  agency: 'agenciesdemo.html',
  agent: 'agentdemo.html',
  architect: 'architectsdemo.html',
  developer: 'developersdemo.html',
  brand_supplier: 'brandssuppliersdemo.html',
  private_seller: 'coming-soon.html',
  private_buyer: 'coming-soon.html',
};

// Account types that are always registered companies: org name + registration
// number are required, and the account is verified automatically.
const ORG_REQUIRED_TYPES = ['agency', 'developer', 'brand_supplier'];

// Account types that are solo professionals but MAY operate under a company
// (agent or architect with their own firm) or as an independent PFA.
const SOLO_OR_COMPANY_TYPES = ['agent', 'architect'];

// Pure individual accounts: no company fields at all.
const INDIVIDUAL_TYPES = ['private_seller', 'private_buyer'];

let selectedAccountType = null;
let selectedSoloMode = null; // 'yes' (has company) | 'no' (PFA / independent)

/* ---------------------------------------------------------------------- */
/* TABS                                                                     */
/* ---------------------------------------------------------------------- */
function switchAuthTab(tab){
  document.getElementById('tabLogin').classList.toggle('active', tab==='login');
  document.getElementById('tabRegister').classList.toggle('active', tab==='register');
  document.getElementById('loginForm').classList.toggle('visible', tab==='login');
  document.getElementById('registerForm').classList.toggle('visible', tab==='register');
  hideMsg();
}

/* ---------------------------------------------------------------------- */
/* ACCOUNT TYPE PICKER                                                      */
/* ---------------------------------------------------------------------- */
document.getElementById('accountTypeGrid').addEventListener('click', (e)=>{
  const opt = e.target.closest('.account-type-opt');
  if(!opt) return;
  document.querySelectorAll('#accountTypeGrid .account-type-opt').forEach(o=>o.classList.remove('selected'));
  opt.classList.add('selected');
  selectedAccountType = opt.dataset.type;
  selectedSoloMode = null;
  updateConditionalFields();
});

document.getElementById('soloCompanyToggle').addEventListener('click', (e)=>{
  const opt = e.target.closest('.account-type-opt');
  if(!opt) return;
  document.querySelectorAll('#soloCompanyToggle .account-type-opt').forEach(o=>o.classList.remove('selected'));
  opt.classList.add('selected');
  selectedSoloMode = opt.dataset.solo;
  updateConditionalFields();
});

function updateConditionalFields(){
  const isOrgRequired = ORG_REQUIRED_TYPES.includes(selectedAccountType);
  const isSoloOrCompany = SOLO_OR_COMPANY_TYPES.includes(selectedAccountType);

  // Company name + registration number (mandatory) — Agency / Developer / Brand & Supplier
  document.getElementById('orgNameField').style.display = isOrgRequired ? 'block' : 'none';
  document.getElementById('regOrgName').required = isOrgRequired;
  document.getElementById('orgRegNumberField').style.display = isOrgRequired ? 'block' : 'none';
  document.getElementById('regOrgNumber').required = isOrgRequired;

  // Solo-vs-company toggle — Agent / Architect
  document.getElementById('soloCompanyToggle').style.display = isSoloOrCompany ? 'block' : 'none';

  // Registration number for solo professionals who chose "has a company"
  const showSoloRegNumber = isSoloOrCompany && selectedSoloMode === 'yes';
  document.getElementById('soloRegNumberField').style.display = showSoloRegNumber ? 'block' : 'none';
  document.getElementById('regSoloNumber').required = showSoloRegNumber;

  // Agency-linking suggestion — only for Agent
  document.getElementById('agencyLinking').classList.toggle('visible', selectedAccountType === 'agent');
}

/* ---------------------------------------------------------------------- */
/* MESSAGES                                                                  */
/* ---------------------------------------------------------------------- */
function showMsg(text, type){
  const el = document.getElementById('authMsg');
  el.textContent = text;
  el.className = 'auth-msg ' + type;
}
function hideMsg(){
  document.getElementById('authMsg').className = 'auth-msg';
}

/* ---------------------------------------------------------------------- */
/* LOGIN                                                                    */
/* ---------------------------------------------------------------------- */
async function handleLogin(e){
  e.preventDefault();
  hideMsg();
  const btn = document.getElementById('loginBtn');
  btn.disabled = true; btn.textContent = 'Signing in...';

  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;

  const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });

  if(error){
    showMsg(error.message, 'error');
    btn.disabled = false; btn.textContent = 'Sign in';
    return false;
  }

  const { data: profile, error: profileError } = await supabaseClient
    .from('profiles')
    .select('account_type')
    .eq('id', data.user.id)
    .single();

  if(profileError || !profile){
    showMsg('Account found but no profile exists yet. Please contact support.', 'error');
    btn.disabled = false; btn.textContent = 'Sign in';
    return false;
  }

  window.location.href = WORKSPACE_BY_TYPE[profile.account_type] || 'agentdemo.html';
  return false;
}

/* ---------------------------------------------------------------------- */
/* FORGOT PASSWORD                                                          */
/* ---------------------------------------------------------------------- */
async function handleForgotPassword(e){
  e.preventDefault();
  const email = document.getElementById('loginEmail').value.trim();
  if(!email){
    showMsg('Enter your email above first, then click "Reset it here" again.', 'error');
    return;
  }
  const { error } = await supabaseClient.auth.resetPasswordForEmail(email);
  if(error){ showMsg(error.message, 'error'); }
  else{ showMsg('We sent you an email with reset instructions.', 'success'); }
}

/* ---------------------------------------------------------------------- */
/* REGISTER                                                                 */
/* ---------------------------------------------------------------------- */
async function handleRegister(e){
  e.preventDefault();
  hideMsg();

  if(!selectedAccountType){
    showMsg('Please choose an account type above.', 'error');
    return false;
  }
  if(SOLO_OR_COMPANY_TYPES.includes(selectedAccountType) && !selectedSoloMode){
    showMsg('Please tell us whether you operate under a registered company.', 'error');
    return false;
  }

  const btn = document.getElementById('registerBtn');
  btn.disabled = true; btn.textContent = 'Creating account...';

  const fullName = document.getElementById('regName').value.trim();
  const market = document.getElementById('regMarket').value.trim();
  const languages = document.getElementById('regLanguages').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const password = document.getElementById('regPassword').value;
  const agencyLinkName = document.getElementById('agencyLinkName').value.trim();

  const orgName = document.getElementById('regOrgName').value.trim();
  const orgRegNumber = document.getElementById('regOrgNumber').value.trim();
  const soloRegNumber = document.getElementById('regSoloNumber').value.trim();

  // 1) Supabase Auth account
  const { data: signUpData, error: signUpError } = await supabaseClient.auth.signUp({ email, password });
  if(signUpError){
    showMsg(signUpError.message, 'error');
    btn.disabled = false; btn.textContent = 'Create account';
    return false;
  }
  const userId = signUpData.user.id;
  const initials = fullName.split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase();

  // 2) If this account type is always a company, create the organization first
  let organizationId = null;
  if(ORG_REQUIRED_TYPES.includes(selectedAccountType)){
    const { data: org, error: orgError } = await supabaseClient
      .from('organizations')
      .insert({
        type: selectedAccountType,
        name: orgName,
        market,
        owner_id: userId,
        company_registration_number: orgRegNumber,
        verified: !!orgRegNumber, // verified as soon as a registration number is on file
      })
      .select()
      .single();
    if(orgError){
      showMsg('Account created, but the company record failed: ' + orgError.message, 'error');
      btn.disabled = false; btn.textContent = 'Create account';
      return false;
    }
    organizationId = org.id;
  }

  // 3) Verification for solo professionals (agent / architect) with their own company
  const soloHasCompany = SOLO_OR_COMPANY_TYPES.includes(selectedAccountType) && selectedSoloMode === 'yes';

  // 4) Create the profile — the person's own account always exists,
  //    independent of any organization.
  const { error: profileError } = await supabaseClient.from('profiles').insert({
    id: userId,
    full_name: fullName,
    initials,
    account_type: selectedAccountType,
    market,
    languages,
    organization_id: organizationId,
    company_registration_number: soloHasCompany ? soloRegNumber : null,
    verified: ORG_REQUIRED_TYPES.includes(selectedAccountType)
      ? true
      : (soloHasCompany ? !!soloRegNumber : false),
  });

  if(profileError){
    showMsg('Account created, but the profile failed: ' + profileError.message, 'error');
    btn.disabled = false; btn.textContent = 'Create account';
    return false;
  }

  // 5) Optional agency link request for solo agents (handled properly once
  //    the agency Team/invitations module is connected)
  if(selectedAccountType === 'agent' && agencyLinkName){
    console.log('Agency link request:', agencyLinkName, '— to implement with the Team module.');
  }

  showMsg('Account created! Check your email to confirm, then sign in.', 'success');
  btn.disabled = false; btn.textContent = 'Create account';

  setTimeout(()=>{ switchAuthTab('login'); }, 1800);
  return false;
}
