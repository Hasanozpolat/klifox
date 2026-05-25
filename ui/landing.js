App.UI.Landing = {
    render() {
        // Safe check for the view-landing container. It might not be in index.html yet!
        let target = document.getElementById('view-landing');
        if (!target) {
            target = document.createElement('section');
            target.id = 'view-landing';
            target.className = 'view-section landing-view';
            document.querySelector('.ecosystem-layout').appendChild(target);
        }
        
        // Hide all others
        document.querySelectorAll('.view-section').forEach(v => v.classList.remove('active'));
        target.classList.add('active'); // Take over screen
        
        const html = `
        <div class="lp-wrapper">
           <nav class="lp-nav">
              <div class="logo"><i class="fas fa-snowflake text-accent"></i> KliFox AI</div>
              <div class="links desktop-only">
                 <a href="#platform">Platform Özellikleri</a>
              </div>
              <button class="btn-demo" onclick="App.UI.Landing.startDemo()"><i class="fas fa-rocket"></i> Servis Talebi Oluştur</button>
           </nav>

           <header class="lp-hero">
              <div class="hero-glow"></div>
              <h1 style="max-width:1000px;">Otonom Servis<br><span class="text-gradient">Operasyonları Ağı.</span></h1>
              <p>Türkiye'nin ilk, kendi kendini yöneten yapay zeka işletim ekosistemi. İş atamaları, yönlendirmeler, teşvikler ve destek müdahaleleri tamamen algoritmik kontrol altında.</p>
              <div style="display:flex; gap:20px; margin-top:20px; z-index:2;">
                 <button class="btn-demo" style="padding:18px 40px; font-size:18px;" onclick="App.UI.Landing.startDemo()">Simülasyona Bağlan <i class="fas fa-arrow-right"></i></button>
              </div>
              
              <div style="display:flex; gap:40px; margin-top:80px; padding:20px 40px; background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.05); border-radius:24px; z-index:2;">
                  <div><div style="color:var(--text-muted); font-size:12px; margin-bottom:5px;">Sistem Durumu</div><div style="color:var(--success); font-weight:800;"><i class="fas fa-circle pulse-icon" style="font-size:10px;"></i> Node.js Hazır</div></div>
                  <div><div style="color:var(--text-muted); font-size:12px; margin-bottom:5px;">Aktif Eko-Sistem Ağı</div><div style="color:#fff; font-weight:800;">1.2M+ ₺ Hacim</div></div>
                  <div><div style="color:var(--text-muted); font-size:12px; margin-bottom:5px;">Model Mimarisi</div><div style="color:#c084fc; font-weight:800;">Predictive NLP</div></div>
              </div>
           </header>

           <section class="lp-section" id="platform">
              <h2><i class="fas fa-microchip text-accent"></i> Core AI Altyapısı</h2>
              <div class="lp-grid">
                 <div class="lp-card">
                    <i class="fas fa-route" style="font-size:36px; color:var(--accent); margin-bottom:20px;"></i>
                    <h3 style="color:#fff; font-size:22px;">Otonom Dispatch Motoru</h3>
                    <p style="color:#aaa; font-size:15px; margin-top:15px; line-height:1.6;">Lokasyon bazlı aciliyet ve güven skorlarını anlık hesaplayıp sahayı en verimli şekilde dağıtır. İnsan operatör gecikmesini sıfırlar.</p>
                 </div>
                 <div class="lp-card">
                    <i class="fas fa-chart-line" style="font-size:36px; color:var(--success); margin-bottom:20px;"></i>
                    <h3 style="color:#fff; font-size:22px;">Öngörücü Eko-Teşvikler</h3>
                    <p style="color:#aaa; font-size:15px; margin-top:15px; line-height:1.6;">Bölgesel çöküş ve 'overload' risklerini önceden saptar. Yoğun bölgelere otonom olarak 'Usta Teşvik Fonu' (+%25) atar.</p>
                 </div>
                 <div class="lp-card">
                    <i class="fas fa-brain" style="font-size:36px; color:#c084fc; margin-bottom:20px;"></i>
                    <h3 style="color:#fff; font-size:22px;">Duygu & Risk Analizi</h3>
                    <p style="color:#aaa; font-size:15px; margin-top:15px; line-height:1.6;">Müşteri panik kelimelerini (Su, Elektrik, Acil) anında tespit ederek VIP bypass uygular. Aşırı stresi canlı desteğe eskale eder.</p>
                 </div>
              </div>
           </section>
           <!-- Extra sections removed for MVP clarity -->

           <footer style="text-align:center; padding:50px; border-top:1px solid rgba(255,255,255,0.05); color:#666; font-size:14px;">
               KliFox AI Operations Network &copy; 2026. Made with Advanced Agentic Coding.
           </footer>
        </div>
        `;
        target.innerHTML = html;
        
        const dp = document.getElementById('view-admin');
        if(dp) dp.classList.remove('open');
    },

    startDemo() {
        const landing = document.getElementById('view-landing');
        if (landing) landing.classList.remove('active');
        App.UI.Onboarding.start();
    }
};
