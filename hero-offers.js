/* =====================================================================
   ISIRI GLOBAL SPA — HERO PREMIUM ENHANCEMENTS (behavior)
   1) Hanging "Today's Best Seller" tag — entrance + smooth scroll-to-pricing
   2) Hero offer ticker — seamless loop + drag/swipe + pause on hover
   Purely additive: does not touch any existing script.js logic.
   ===================================================================== */
(function(){
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ============ ENTRANCE ANIMATIONS ============ */
  (function reveal(){
    const tag = document.getElementById('heroHangTag');
    const ticker = document.getElementById('heroTickerWrap');
    if(typeof gsap !== 'undefined'){
      if(tag){
        gsap.fromTo(tag, {opacity:0, y:-24}, {opacity:1, y:0, duration:1, ease:'power3.out', delay:1.1});
      }
      if(ticker){
        gsap.fromTo(ticker, {opacity:0, y:16}, {opacity:1, y:0, duration:0.9, ease:'power3.out', delay:1.3});
      }
    } else {
      if(tag) tag.style.opacity = 1;
      if(ticker) ticker.style.opacity = 1;
    }
  })();

  /* ============ HANGING TAG: SMOOTH SCROLL TO PRICING ============ */
  (function hangTagScroll(){
    const links = document.querySelectorAll('.hangtag-scroll-link');
    if(!links.length) return;
    links.forEach((link)=>{
      link.addEventListener('click', (e)=>{
        const targetSel = link.getAttribute('href');
        if(!targetSel || targetSel.charAt(0) !== '#') return;
        const target = document.querySelector(targetSel);
        if(!target) return;
        e.preventDefault();
        const header = document.getElementById('siteHeader');
        const headerOffset = header ? header.offsetHeight + 30 : 90;
        const top = target.getBoundingClientRect().top + window.pageYOffset - headerOffset;
        window.scrollTo({top, behavior: prefersReduced ? 'auto' : 'smooth'});
      });
    });
  })();

  /* ============ OFFER TICKER: SEAMLESS LOOP + DRAG/SWIPE ============ */
  (function heroTicker(){
    const wrap = document.getElementById('heroTickerWrap');
    const track = document.getElementById('heroTickerTrack');
    if(!wrap || !track) return;

    // duplicate the pill set once for a seamless loop
    track.innerHTML += track.innerHTML;

    let isDown = false, startX = 0, scrollLeft = 0, dragged = false;

    const pause = ()=>wrap.classList.add('paused');
    const resume = ()=>{ if(!isDown) wrap.classList.remove('paused'); };

    wrap.addEventListener('pointerdown', (e)=>{
      isDown = true; dragged = false;
      pause();
      startX = e.clientX;
      scrollLeft = wrap.scrollLeft;
      wrap.classList.add('dragging');
    });
    window.addEventListener('pointermove', (e)=>{
      if(!isDown) return;
      const dx = e.clientX - startX;
      if(Math.abs(dx) > 4) dragged = true;
      wrap.scrollLeft = scrollLeft - dx;
    });
    const endDrag = ()=>{
      if(!isDown) return;
      isDown = false;
      wrap.classList.remove('dragging');
      setTimeout(resume, 400);
    };
    window.addEventListener('pointerup', endDrag);
    window.addEventListener('pointercancel', endDrag);

    // prevent accidental click right after a drag
    track.addEventListener('click', (e)=>{
      if(dragged){ e.preventDefault(); e.stopPropagation(); }
    }, true);

    wrap.style.overflowX = 'auto';
    wrap.style.scrollbarWidth = 'none';
  })();

  /* ============ FLOATING GOLDEN PARTICLES AROUND HERO ============ */
  (function heroParticles(){
    const hero = document.getElementById('top');
    if(!hero || prefersReduced) return;
    const field = document.createElement('div');
    field.className = 'hero-gold-particles';
    field.setAttribute('aria-hidden', 'true');
    field.style.cssText = 'position:absolute;inset:0;z-index:2;pointer-events:none;overflow:hidden;';
    const count = window.innerWidth < 700 ? 10 : 18;
    for(let i=0;i<count;i++){
      const p = document.createElement('span');
      const size = 2 + Math.random()*4;
      const duration = 8 + Math.random()*8;
      p.style.cssText = `position:absolute;left:${Math.random()*100}%;top:${Math.random()*100}%;
        width:${size}px;height:${size}px;border-radius:50%;
        background:radial-gradient(circle, rgba(241,216,122,0.95), rgba(212,175,55,0.1));
        box-shadow:0 0 6px 1px rgba(212,175,55,0.6);
        animation:hero-particle-float ${duration}s ease-in-out ${Math.random()*duration}s infinite;`;
      field.appendChild(p);
    }
    hero.appendChild(field);

    if(!document.getElementById('heroParticleKeyframes')){
      const style = document.createElement('style');
      style.id = 'heroParticleKeyframes';
      style.textContent = `@keyframes hero-particle-float{
        0%,100%{transform:translateY(0) translateX(0);opacity:0.35;}
        50%{transform:translateY(-24px) translateX(10px);opacity:0.9;}
      }`;
      document.head.appendChild(style);
    }
  })();
})();
