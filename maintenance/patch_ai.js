const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, 'index.html');
let html = fs.readFileSync(htmlPath, 'utf8');

const regex = /send\.addEventListener\('click', \(\) => \{[\s\S]*?\}\);/;

const newLogic = `send.addEventListener('click', () => {
        if (!input.value.trim()) return;
        const msg = input.value;
        addChat(msg, true);
        input.value = '';
        
        setTimeout(() => {
          // AI Core Logic - Search Products
          let lowerMsg = msg.toLowerCase();
          let found = null;
          if (window.PRODUCTS) {
            found = window.PRODUCTS.filter(p => 
              p.name.toLowerCase().includes(lowerMsg) || 
              p.description.toLowerCase().includes(lowerMsg) || 
              p.category.toLowerCase().includes(lowerMsg)
            );
          }
          
          if(lowerMsg.includes('hello') || lowerMsg.includes('hi')) {
             addChat("Greetings! I'm the Dragon-AI Assistant. How can I upgrade your setup today?");
             return;
          }

          if (found && found.length > 0) {
             let item = found[0]; // recommend the best match
             let htmlReply = "I found the perfect match for you:<br><br>" +
             "<div style='background:rgba(0,0,0,0.3); border:1px solid var(--glass-border); padding:10px; border-radius:10px; text-align:center;'>" +
             "<img src='" + item.image + "' style='width:100px; height:100px; object-fit:contain; drop-shadow(0 0 10px rgba(255,255,255,0.1));'></div>" +
             "<strong>" + item.name + "</strong><br>" +
             "<span style='color:var(--neon-blue)'>$" + item.price.toFixed(2) + "</span><br><br>" +
             "<button onclick='window.cart.addToCart(\\"" + item.id + "\\")' style='background:var(--gradient-primary); border:none; padding:8px 16px; border-radius:20px; color:white; cursor:pointer;'>Add to Cart</button>";
             
             const d = document.createElement('div');
             d.style.cssText = 'align-self:flex-start; background:var(--bg-secondary); border: 1px solid var(--glass-border); color:var(--text-primary); padding:12px 16px; border-radius:0 16px 16px 16px; font-size:0.95rem; max-width:90%; position:relative; overflow:hidden; box-shadow: 0 5px 20px rgba(0,225,255,0.1);';
             d.innerHTML = htmlReply;
             feed.appendChild(d);
             feed.scrollTop = feed.scrollHeight;
          } else {
             addChat("I couldn't find exactly what you're looking for, but you can explore our 'Mystery Box' drops for a guaranteed premium tech surprise!");
             
             setTimeout(() => {
                const d = document.createElement('div');
                d.style.cssText = 'align-self:flex-start; background:var(--bg-secondary); border: 1px solid var(--neon-pink); color:white; padding:12px 16px; border-radius:0 16px 16px 16px; font-size:0.95rem; max-width:90%; max-width:85%; box-shadow: 0 0 15px rgba(255,16,122,0.2);';
                d.innerHTML = "<strong>Mystery Box Drop #042</strong><br><span style='color:#FF107A'>$49.00</span><br><br><button onclick='window.cart.addToCart(\\"mystery-box\\")' style='background:var(--neon-pink); color:white; border:none; padding:8px 16px; border-radius:20px; cursor:pointer;'>Claim Hoard</button>";
                feed.appendChild(d);
                feed.scrollTop = feed.scrollHeight;
             }, 800);
          }
        }, 600);
      });`;

html = html.replace(regex, newLogic);
fs.writeFileSync(htmlPath, html);
console.log("AI Patched!");
