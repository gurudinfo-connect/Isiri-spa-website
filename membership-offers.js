/* =====================================================================
   ISIRI GLOBAL SPA — MEMBERSHIP + SPECIAL OFFERS interactions
   Relies on gsap + ScrollTrigger already loaded/registered in script.js
   ===================================================================== */
(function(){
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ============ MEMBERSHIP CARDS: FADE UP / SCALE / STAGGER ============ */
  (function membershipReveal(){
    const grid = document.querySelector('.membership-grid');
    if(!grid || typeof gsap === 'undefined') return;
    const cards = gsap.utils.toArray('.membership-card', grid);
    if(!cards.length) return;
    gsap.set(cards, {opacity:0, y:50, scale:0.9});
    ScrollTrigger.create({
      trigger:grid, start:'top 82%', once:true,
      onEnter:()=>{
        gsap.to(cards, {
          opacity:1, y:0, scale:(i,el)=>el.classList.contains('featured') ? 1.03 : 1,
          duration:0.95, ease:'power3.out', stagger:0.16
        });
        runCounters();
      }
    });
  })();

  /* ============ ANIMATED PRICE COUNTERS ============ */
  function runCounters(){
    document.querySelectorAll('.m-price .counter').forEach(el=>{
      const target = parseInt(el.dataset.target, 10) || 0;
      if(prefersReduced){ el.textContent = target.toLocaleString('en-IN'); return; }
      const obj = {val:0};
      gsap.to(obj, {
        val:target, duration:1.6, ease:'power2.out',
        onUpdate:()=>{ el.textContent = Math.round(obj.val).toLocaleString('en-IN'); }
      });
    });
  }

  /* ============ FLOATING PARTICLES (membership background) ============ */
  (function spawnParticles(){
    const field = document.getElementById('moParticles');
    if(!field || prefersReduced) return;
    const count = window.innerWidth < 700 ? 10 : 20;
    for(let i=0;i<count;i++){
      const p = document.createElement('span');
      p.className = 'mo-particle';
      const size = 3 + Math.random()*6;
      p.style.width = size+'px';
      p.style.height = size+'px';
      p.style.left = Math.random()*100+'%';
      p.style.setProperty('--drift', (Math.random()*60-30)+'px');
      const duration = 9 + Math.random()*10;
      p.style.animationDuration = duration+'s';
      p.style.animationDelay = (Math.random()*duration)+'s';
      field.appendChild(p);
    }
  })();

  /* ============ SPARKLES (offers background) ============ */
  (function spawnSparkles(){
    const field = document.getElementById('offersSparkles');
    if(!field || prefersReduced) return;
    const count = window.innerWidth < 700 ? 14 : 26;
    for(let i=0;i<count;i++){
      const s = document.createElement('span');
      s.className = 'of-spark';
      s.style.left = Math.random()*100+'%';
      s.style.top = Math.random()*100+'%';
      s.style.animationDelay = (Math.random()*3.6)+'s';
      s.style.animationDuration = (2.6 + Math.random()*2.4)+'s';
      field.appendChild(s);
    }
  })();

  /* ============ INFINITE OFFERS CAROUSEL: DRAG / SWIPE ============ */
  (function offersCarousel(){
    const wrap = document.getElementById('offersCarouselWrap');
    const track = document.getElementById('offersTrack');
    if(!wrap || !track) return;

    // duplicate the card set once for a seamless loop
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

    // prevent accidental link click right after a drag
    track.addEventListener('click', (e)=>{
      if(dragged){ e.preventDefault(); e.stopPropagation(); }
    }, true);

    // native touch swipe already works via pointer events + overflow-x scroll;
    // ensure horizontal scroll is enabled for the wrap as a fallback
    wrap.style.overflowX = 'auto';
    wrap.style.scrollbarWidth = 'none';
  })();

  /* ============ CARD SCROLL REVEAL: OFFER CARDS ============ */
  (function offersReveal(){
    if(typeof gsap === 'undefined') return;
    const wrap = document.getElementById('offersCarouselWrap');
    if(!wrap) return;
    gsap.from(wrap, {
      opacity:0, y:34, duration:1, ease:'power3.out',
      scrollTrigger:{trigger:wrap, start:'top 90%'}
    });
  })();

  /* ============ STICKY "BECOME A MEMBER" CTA ============ */
  (function stickyCta(){
    const cta = document.getElementById('stickyCta');
    const membership = document.getElementById('membership');
    if(!cta || !membership) return;

    if(typeof ScrollTrigger !== 'undefined'){
      ScrollTrigger.create({
        trigger:membership,
        start:'bottom top',
        end:'bottom top',
        onEnter:()=>cta.classList.add('show'),
        onLeaveBack:()=>cta.classList.remove('show')
      });
      // hide again once footer/booking area is reached, so it doesn't cover the booking form
      const bookingSection = document.getElementById('booking');
      if(bookingSection){
        ScrollTrigger.create({
          trigger:bookingSection,
          start:'top bottom',
          end:'bottom top',
          onEnter:()=>cta.classList.remove('show'),
          onLeaveBack:()=>{
            if(membership.getBoundingClientRect().bottom < 0) cta.classList.add('show');
          }
        });
      }
    } else {
      window.addEventListener('scroll', ()=>{
        const r = membership.getBoundingClientRect();
        if(r.bottom < 0) cta.classList.add('show'); else cta.classList.remove('show');
      });
    }
  })();

})();
