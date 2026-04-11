const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, 'css', 'main.css');
let css = fs.readFileSync(cssPath, 'utf8');

// 1. Upgrade Root Colors & Fonts
css = css.replace(/:root\s*\{[\s\S]*?\/\*\s*Border/m, `:root {
  /* Ultra Premium Color Palette */
  --bg-primary: #030409;
  --bg-secondary: #0A0C16;
  --bg-tertiary: #111529;
  --text-primary: #F1F5F9;
  --text-secondary: #94A3B8;
  --text-muted: #475569;

  /* Neon accents */
  --neon-blue: #00E1FF;
  --neon-purple: #B026FF;
  --neon-pink: #FF107A;
  --neon-green: #00FF88;
  --neon-orange: #FF6600;

  /* Gradients */
  --gradient-primary: linear-gradient(135deg, #00E1FF, #B026FF);
  --gradient-glow: linear-gradient(135deg, #00E1FF, #FF107A);
  --gradient-warm: linear-gradient(135deg, #FF6600, #FF107A);
  --gradient-cool: linear-gradient(135deg, #00E1FF, #0077FF);

  /* Glass - Softer, crystal look */
  --glass-bg: rgba(255, 255, 255, 0.02);
  --glass-border: rgba(255, 255, 255, 0.08);
  --glass-blur: 32px;

  /* Spacing */
  --spacing-xs: 0.5rem;
  --spacing-sm: 1rem;
  --spacing-md: 1.5rem;
  --spacing-lg: 2rem;
  --spacing-xl: 3rem;
  --spacing-2xl: 5rem;

  /* Advanced Typography */
  --font-family: 'Inter', -apple-system, sans-serif;
  --font-heading: 'Orbitron', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
  --font-size-base: 16px;
  --font-size-sm: 0.875rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;

  /* Borders`);

// 2. Headings and Base Typography Update
if (!css.includes('font-family: var(--font-heading)')) {
  css = css.replace(/body\s*\{/, "h1, h2, h3, h4, .logo-text, .pricing {\n  font-family: var(--font-heading);\n  letter-spacing: 0.05em;\n}\n\nbody {");
}

// 3. Add premium box scaling and glowing hover effects on cards
// Look for .product-card hover
css = css.replace(/\.product-card:hover\s*\{[\s\S]*?\}/, `.product-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.6), 0 0 25px rgba(0, 225, 255, 0.15);
  border-color: rgba(0, 225, 255, 0.3);
}`);

// Add smoother transitions to product card base
css = css.replace(/\.product-card\s*\{([^\}]*)\}/, `.product-card {$1  transition: transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.4s ease, border-color 0.4s ease;\n}`);

// Add glowing outline to inputs when focused
css = css.replace(/\.form-input:focus, \.form-textarea:focus\s*\{([^\}]*)\}/, `.form-input:focus, .form-textarea:focus {$1  box-shadow: 0 0 0 2px rgba(0, 225, 255, 0.2), 0 0 15px rgba(0, 225, 255, 0.1);\n}`);

// Add sleek button transition (pulse/shimmer)
if(!css.includes('@keyframes shimmer')) {
  css += `\n
@keyframes shimmer {
  0% { transform: translateX(-100%) skewX(-15deg); }
  100% { transform: translateX(200%) skewX(-15deg); }
}
.btn-primary {
  position: relative;
  overflow: hidden;
}
.btn-primary::after {
  content: '';
  position: absolute;
  top: 0; left: -100px; width: 50px; height: 100%;
  background: rgba(255, 255, 255, 0.4);
  transform: skewX(-15deg);
  animation: shimmer 3s infinite reverse;
}
.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 225, 255, 0.3);
}
`;
}

// Ensure body uses the right standard text
css = css.replace(/font-family:\s*var\(--font-family\);/, 'font-family: var(--font-family);\n  letter-spacing: -0.01em;');

fs.writeFileSync(cssPath, css);
console.log("CSS upgraded beautifully!");
