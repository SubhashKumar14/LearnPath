const auth = {
  currentUser: null,
  apiBase: '/api',
  async init(){
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');
    if (token && userData){
      try { this.currentUser = JSON.parse(userData); this.updateUI(); await this.validateToken(); } catch { this.logout(); }
    }
    this.setupEventListeners();
  },
  setupEventListeners(){
    document.getElementById('login-form').addEventListener('submit', e=>this.handleLogin(e));
    document.getElementById('register-form').addEventListener('submit', e=>this.handleRegister(e));
    document.getElementById('profile-form')?.addEventListener('submit', e=>this.handleProfileUpdate?.(e));
  },
  async handleLogin(e){
    e.preventDefault();
    const email = document.getElementById('login-email').value; 
    const password = document.getElementById('login-password').value;
    try {
      const r = await fetch(`${this.apiBase}/auth/login`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({email,password}) });
      const d = await r.json();
      if (r.ok){ 
        localStorage.setItem('authToken', d.token); 
        localStorage.setItem('userData', JSON.stringify(d.user)); 
        this.currentUser = d.user; 
        this.updateUI(); 
        utils.showAlert('Welcome back!','success'); 
        utils.showPage('home'); 
      }
      else utils.showAlert(d.error,'danger');
    } catch { utils.showAlert('Login failed.','danger'); }
  },
  async handleRegister(e){
    e.preventDefault();
    const username = document.getElementById('register-username').value; 
    const email = document.getElementById('register-email').value; 
    const password = document.getElementById('register-password').value;
    try {
      const r = await fetch(`${this.apiBase}/auth/register`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({username,email,password})});
      const d = await r.json();
      if (r.ok){ 
        utils.showAlert('Account created! Please login.','success'); 
        utils.showPage('login'); 
        document.getElementById('login-email').value = email; 
      }
      else utils.showAlert(d.error,'danger');
    } catch { utils.showAlert('Registration failed.','danger'); }
  },
  updateUI(){
    const authButtons = document.getElementById('auth-buttons');
    const userMenu = document.getElementById('user-menu');
    const progressNav = document.getElementById('progress-nav');
    const userNameEl = document.getElementById('user-name');
    const userAvatarEl = document.getElementById('user-avatar');
    if (this.currentUser){
      authButtons.classList.add('d-none');
      userMenu.classList.remove('d-none');
      progressNav.classList.remove('d-none');
      userNameEl.textContent = this.currentUser.username; 
      userAvatarEl.textContent = utils.getUserInitials(this.currentUser.username);
    } else { 
      authButtons.classList.remove('d-none'); 
      userMenu.classList.add('d-none'); 
      progressNav.classList.add('d-none'); 
    }
  },
  logout(){ 
    localStorage.removeItem('authToken'); 
    localStorage.removeItem('userData'); 
    this.currentUser=null; 
    this.updateUI(); 
    utils.showAlert('Logged out','info'); 
    utils.showPage('home'); 
  },
  async validateToken(){ 
    const token = localStorage.getItem('authToken'); 
    if(!token) return false; 
    try { 
      const r = await fetch(`${this.apiBase}/auth/profile`, { headers:{ Authorization:`Bearer ${token}` } }); 
      if(!r.ok) this.logout(); 
      return r.ok; 
    } catch { 
      this.logout(); 
      return false; 
    } 
  }
};