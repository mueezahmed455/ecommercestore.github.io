const fs = require('fs');
const path = require('path');

// --- 1. Upgrade login.html to a split-screen premium UI ---
const loginPath = path.join(__dirname, 'login.html');
let loginHtml = fs.readFileSync(loginPath, 'utf8');

// We will convert `<main class="auth-container">` into a split layout
const splitUI = `
  <main class="auth-split-layout" style="display:flex; min-height:100vh; overflow:hidden;">
    <!-- Left Hero Art Section -->
    <div class="auth-hero" style="flex:1; background: url('assets/dragon-hero.png') center/cover no-repeat; position:relative; min-width:50%; display:flex; flex-direction:column; justify-content:center; padding:5rem;">
       <div style="position:absolute; inset:0; background:linear-gradient(135deg, rgba(3,4,9,0.95) 0%, rgba(3,4,9,0.4) 100%);"></div>
       <div style="position:relative; z-index:1; max-width:500px;">
          <h1 style="font-family:var(--font-heading); font-size:4rem; line-height:1.1; margin-bottom:1.5rem;"><span class="gradient-text">Enter the</span><br>Dragon's Den.</h1>
          <p style="font-size:1.25rem; color:var(--text-secondary); line-height:1.6; margin-bottom:2rem;">Log in to track your premium shipments, manage your rewards tier, and gain exclusive access to limited 8K cyber tech drops.</p>
          <div style="display:flex; gap:1.5rem; color:var(--text-muted); font-size:0.9rem;">
             <span><strong style="color:var(--neon-blue);">250K+</strong> Active Users</span>
             <span><strong style="color:var(--neon-pink);">4.9/5</strong> Rating</span>
          </div>
       </div>
    </div>
    
    <!-- Right Form Section -->
    <div class="auth-container-right" style="flex:1; display:flex; align-items:center; justify-content:center; padding:3rem; background:var(--bg-primary); position:relative;">
      <div class="auth-card glass" style="width:100%; max-width:480px; box-shadow: 0 0 50px rgba(0,225,255,0.05); padding:3rem; border-radius:24px;">
`;

// Replace `<main class="auth-container">` -> the splitUI
// And cap it off at the end
loginHtml = loginHtml.replace(/<main class="auth-container">\s*<div class="auth-card glass">/, splitUI);
loginHtml = loginHtml.replace(/<\/main>/, '  </div>\n    </div>\n  </main>\n\n  <style>\n  @media(max-width: 900px) {\n    .auth-hero { display:none !important; }\n    .auth-container-right { padding: 1.5rem !important; }\n  }\n  </style>');

fs.writeFileSync(loginPath, loginHtml);
console.log("login.html upgraded to premium split layout.");

// --- 2. Add secure Admin Panel Logic handling into js/auth.js ---
const authPath = path.join(__dirname, 'js', 'auth.js');
let authJs = fs.readFileSync(authPath, 'utf8');

// Replace standard login redirect with role-based routing
const oldLoginLogic = /await fbAuth\.signInWithEmailAndPassword\(window\.db\.auth,\s*email,\s*password\);\s*showToast\('Welcome back!',\s*'success'\);\s*window\.location\.href\s*=\s*'dashboard\.html';/;

const newLoginLogic = `var userCred = await fbAuth.signInWithEmailAndPassword(window.db.auth, email, password);
      
      // Admin Panel Access Logic
      try {
        var fbFirestore = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
        var userDocRef = fbFirestore.doc(window.db.firestore, 'users', userCred.user.uid);
        var userDocSnap = await fbFirestore.getDoc(userDocRef);
        
        if (userDocSnap.exists() && userDocSnap.data().role === 'admin') {
           showToast('Admin access verified.', 'success');
           window.location.href = 'admin.html';
           return;
        }
      } catch(e) {
        console.warn('Role verification issue:', e);
      }
      
      showToast('Welcome back!', 'success');
      window.location.href = 'dashboard.html';`;

authJs = authJs.replace(oldLoginLogic, newLoginLogic);

// Optional: Give them a way to login specifically bypassing dashboard if email is admin.
// Wait, Firestore checking is the only 100% secure way.

fs.writeFileSync(authPath, authJs);
console.log("auth.js upgraded with Admin Panel routing logic.");
