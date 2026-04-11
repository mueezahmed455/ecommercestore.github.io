const fs = require('fs');
const path = require('path');

// 1. Repair and beautify login.html securely
const loginPath = path.join(__dirname, 'login.html');
let loginHtml = fs.readFileSync(loginPath, 'utf8');

// Wipe the split-layout completely
const badStart = loginHtml.indexOf('<main class="auth-split-layout"');
const badEnd = loginHtml.indexOf('</main>') + 7;

if (badStart !== -1 && badEnd !== -1) {
  let beautifulLogin = `<main class="auth-container" style="background: url('assets/dragon-hero.png') center/cover no-repeat; position:relative; z-index:1;">
    <div style="position:absolute; inset:0; background:linear-gradient(135deg, rgba(3,4,9,0.95), rgba(3,4,9,0.7)); z-index:-1;"></div>
    
    <div class="auth-card glass" style="width:100%; max-width:440px; margin: 0 auto; box-shadow:0 0 50px rgba(0,225,255,0.1); border:1px solid rgba(0,225,255,0.2); backdrop-filter:blur(32px); z-index:10;">
      <!-- Logo -->
      <div class="auth-header">
        <a href="index.html" class="logo" aria-label="Dragon-Tech Home">
          <img src="assets/dragon-logo.png" alt="" class="logo-icon" width="32" height="32" aria-hidden="true">
          <span class="logo-text">Dragon</span><span class="logo-accent">-Tech</span>
        </a>
      </div>

      <!-- Tab Switcher -->
      <div class="auth-tabs" role="tablist" aria-label="Authentication mode">
        <button class="auth-tab active" data-tab="login" role="tab" aria-selected="true" aria-controls="loginForm" id="loginTab" data-i18n="signInTab">
          Sign In
        </button>
        <button class="auth-tab" data-tab="signup" role="tab" aria-selected="false" aria-controls="signupForm" id="signupTab" data-i18n="createAccountTab">
          Create Account
        </button>
      </div>

      <!-- Login Form -->
      <form id="loginForm" class="auth-form active" role="tabpanel" aria-labelledby="loginTab" novalidate>
        <h2 class="auth-title" data-i18n="loginTitle">Welcome Back</h2>

        <div class="form-group">
          <label for="loginEmail" class="form-label" data-i18n="emailLabel">Email Address</label>
          <input type="email" id="loginEmail" name="email" class="form-input" data-i18n-placeholder="emailPlaceholder" placeholder="you@example.com" autocomplete="email" required>
          <span class="form-error" id="loginEmailError" role="alert"></span>
        </div>

        <div class="form-group">
          <label for="loginPassword" class="form-label" data-i18n="passwordLabel">Password</label>
          <div class="password-wrapper">
            <input type="password" id="loginPassword" name="password" class="form-input" data-i18n-placeholder="loginPasswordPlaceholder" placeholder="Enter your password" autocomplete="current-password" required>
          </div>
          <span class="form-error" id="loginPasswordError" role="alert"></span>
        </div>

        <button type="submit" class="btn btn-primary btn-block" id="loginSubmit" data-i18n="signInButton">
          Sign In
        </button>
        <p class="auth-message" id="loginMessage" role="status"></p>
      </form>

      <!-- Signup Form -->
      <form id="signupForm" class="auth-form" role="tabpanel" aria-labelledby="signupTab" novalidate>
        <h2 class="auth-title" data-i18n="signupTitle">Create Account</h2>

        <div class="form-group">
          <label for="signupName" class="form-label" data-i18n="nameLabel">Full Name</label>
          <input type="text" id="signupName" name="name" class="form-input" placeholder="John Doe" autocomplete="name" required>
          <span class="form-error" id="signupNameError" role="alert"></span>
        </div>

        <div class="form-group">
          <label for="signupEmail" class="form-label" data-i18n="emailLabel">Email Address</label>
          <input type="email" id="signupEmail" name="email" class="form-input" placeholder="you@example.com" autocomplete="email" required>
          <span class="form-error" id="signupEmailError" role="alert"></span>
        </div>

        <div class="form-group">
          <label for="signupPassword" class="form-label" data-i18n="passwordLabel">Password</label>
          <input type="password" id="signupPassword" name="password" class="form-input" placeholder="Create a password" autocomplete="new-password" required>
          <span class="form-error" id="signupPasswordError" role="alert"></span>
        </div>

        <div class="form-group">
          <label for="signupConfirm" class="form-label" data-i18n="confirmPasswordLabel">Confirm Password</label>
          <input type="password" id="signupConfirm" name="confirm" class="form-input" placeholder="Confirm your password" autocomplete="new-password" required>
          <span class="form-error" id="signupConfirmError" role="alert"></span>
        </div>

        <button type="submit" class="btn btn-primary btn-block" id="signupSubmit" data-i18n="createAccountButton">
          Create Account
        </button>
        <p class="auth-message" id="signupMessage" role="status"></p>
      </form>
    </div>
  </main>`;
  
  loginHtml = loginHtml.substring(0, badStart) + beautifulLogin + loginHtml.substring(badEnd);
  // remove the extra closing tags we left behind
  loginHtml = loginHtml.replace(/<\/div>\s*<\/div>\s*<\/main>\s*<style>.*?<\/style>/s, '');
  fs.writeFileSync(loginPath, loginHtml);
}

// 2. Inject CSV Export Button into Admin Panel
const adminPath = path.join(__dirname, 'admin.html');
if (fs.existsSync(adminPath)) {
  let adminHtml = fs.readFileSync(adminPath, 'utf8');
  let exportInject = `</div>
        <div class="export-actions" style="margin-top:1.5rem; display:flex; justify-content:center; gap:10px;">
          <button id="exportOrdersCsvBtn" class="btn btn-primary" style="display:flex; align-items:center; gap:8px;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Export Orders to CSV
          </button>
          <button id="exportUsersCsvBtn" class="btn btn-ghost" style="display:flex; align-items:center; gap:8px;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            Export Users to CSV
          </button>
        </div>`;
  // Inject right after the stat-cards grid closes
  adminHtml = adminHtml.replace(/(<div class="stat-info">\s*<span class="stat-label">Conversion Rate<\/span>.*?<\/div>\s*<\/div>\s*)<\/div>/s, '$1' + exportInject);
  fs.writeFileSync(adminPath, adminHtml);
}

// 3. Implement CSV Logic into admin.js
const adminJsPath = path.join(__dirname, 'js', 'admin.js');
if (fs.existsSync(adminJsPath)) {
  let adminJs = fs.readFileSync(adminJsPath, 'utf8');
  
  if(!adminJs.includes('exportDataToCSV')) {
    let csvLogic = `// --- CSV Export Logic ---
  async function exportDataToCSV(collectionName) {
    if (!window.db || !window.db.firestore) {
      if(window.showToast) window.showToast('Database not ready', 'error');
      return;
    }
    try {
      const fbFirestore = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
      const ref = fbFirestore.collection(window.db.firestore, collectionName);
      const snapshot = await fbFirestore.getDocs(ref);
      
      if (snapshot.empty) {
        if(window.showToast) window.showToast('No data to export', 'info');
        return;
      }

      let csv = [];
      let headersConfigured = false;
      let headers = [];

      snapshot.forEach(doc => {
        const data = doc.data();
        if (!headersConfigured) {
          headers = Object.keys(data).filter(k => typeof data[k] !== 'object');
          headers.unshift('id'); 
          csv.push(headers.join(','));
          headersConfigured = true;
        }

        let row = [doc.id];
        headers.slice(1).forEach(header => {
          let val = data[header];
          if (val === undefined || val === null) val = '';
          val = String(val).replace(/"/g, '""');
          row.push('"' + val + '"');
        });
        csv.push(row.join(','));
      });

      const blob = new Blob([csv.join('\\n')], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', collectionName + '_export_' + new Date().getTime() + '.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      if(window.showToast) window.showToast('Downloaded ' + collectionName + '.csv', 'success');

    } catch (e) {
      console.error('CSV Export Error:', e);
      if(window.showToast) window.showToast('Error exporting data', 'error');
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    let btnOrders = document.getElementById('exportOrdersCsvBtn');
    let btnUsers = document.getElementById('exportUsersCsvBtn');
    if(btnOrders) btnOrders.addEventListener('click', () => exportDataToCSV('orders'));
    if(btnUsers) btnUsers.addEventListener('click', () => exportDataToCSV('users'));
  });
`;
    // append to bottom of file
    fs.appendFileSync(adminJsPath, '\\n' + csvLogic);
  }
}

console.log("UI layout repaired and CSV injection completed.");
