/* Add your Supabase project values here locally. Never add a service-role key. */
const SUPABASE_URL = window.TASKFLOW_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = window.TASKFLOW_SUPABASE_ANON_KEY || '';
const authConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY && window.supabase);
const authStateKey = 'taskflow-auth-demo';

function authMarkup() {
  return `<div class="auth-screen" id="auth-screen"><div class="auth-card"><div class="auth-brand"><span class="auth-brand-mark">✦</span><span>TaskFlow <b style="color:#6c63ff">AI</b></span></div><h1>Welcome back.</h1><p>Your personal admin, ready when you are.</p><div class="auth-tabs"><button class="auth-tab active" data-auth-mode="signin">Sign in</button><button class="auth-tab" data-auth-mode="signup">Create account</button></div><form id="auth-form"><label class="auth-field">Email<input id="auth-email" type="email" autocomplete="email" required placeholder="you@example.com"></label><label class="auth-field">Password<input id="auth-password" type="password" autocomplete="current-password" required minlength="6" placeholder="At least 6 characters"></label><button class="auth-submit" type="submit" id="auth-submit">Sign in</button><p class="auth-message" id="auth-message" role="status"></p></form>${authConfigured ? '' : '<p class="demo-note">Demo mode is active. Add your Supabase URL and anon key in <code>auth-config.js</code> to enable private accounts and synced data.</p>'}</div></div>`;
}

function installAuth() {
  document.body.insertAdjacentHTML('afterbegin', authMarkup());
  const screen = document.querySelector('#auth-screen');
  const form = document.querySelector('#auth-form');
  let mode = 'signin';
  document.querySelectorAll('.auth-tab').forEach((tab) => tab.addEventListener('click', () => {
    document.querySelector('.auth-tab.active').classList.remove('active'); tab.classList.add('active'); mode = tab.dataset.authMode;
    document.querySelector('#auth-submit').textContent = mode === 'signin' ? 'Sign in' : 'Create account';
    document.querySelector('#auth-message').textContent = '';
  }));
  if (!authConfigured && localStorage.getItem(authStateKey) === 'demo') screen.remove();
  form.addEventListener('submit', async (event) => {
    event.preventDefault(); const message = document.querySelector('#auth-message'); message.className = 'auth-message';
    if (!authConfigured) { localStorage.setItem(authStateKey, 'demo'); screen.remove(); showToast('Demo workspace ready.'); return; }
    const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const credentials = { email: document.querySelector('#auth-email').value, password: document.querySelector('#auth-password').value };
    const result = mode === 'signin' ? await client.auth.signInWithPassword(credentials) : await client.auth.signUp(credentials);
    if (result.error) { message.className = 'auth-message error'; message.textContent = result.error.message; return; }
    message.className = 'auth-message success'; message.textContent = mode === 'signin' ? 'Signed in.' : 'Check your email to confirm your account.';
    if (mode === 'signin') screen.remove();
  });
}

installAuth();
