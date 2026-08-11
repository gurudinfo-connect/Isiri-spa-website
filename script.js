const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isTouch = window.matchMedia('(hover:none), (pointer:coarse)').matches;
const isSmall = window.innerWidth < 780;

/* ============ PRELOADER + INTRO (flower bloom, then reveal hero) ============ */
(function preloaderFlower(){
  const preloader = document.getElementById('preloader');
  let finished = false;

  function finish(){
    if(finished) return;
    finished = true;
    gsap.to(preloader, {opacity:0, duration:0.7, ease:'power1.out', onComplete:()=>{preloader.style.display='none';}});
    playHeroIntro();
  }

  // bloom + text sequence finishes choreographing itself in CSS (~2.2s);
  // hold briefly on the fully-opened flower, then open into the hero section.
  const holdMs = reduceMotion ? 550 : 2450;
  setTimeout(finish, holdMs);
})();

function playHeroIntro(){
  const tl = gsap.timeline({defaults:{ease:'power3.out'}});
  tl.to('.rating-badge', {opacity:1, y:0, duration:0.01})
    .from('.rating-badge', {opacity:0, y:16, duration:0.7}, 0)
    // heading: opacity 0->1, translateY 50px->0, duration 1.2s
    .to('h1.hero-title .line span', {y:'0%', duration:1.2, stagger:0.14}, 0.1)
    .fromTo('h1.hero-title', {opacity:0}, {opacity:1, duration:1.2}, 0.1)
    // subtitle: delay 0.3s
    .fromTo('.hero-sub', {opacity:0, y:16}, {opacity:1, y:0, duration:0.8}, 0.3)
    // buttons: delay 0.6s, scale 0.9 -> 1
    .fromTo('.hero-cta-row', {opacity:0, y:16, scale:0.9}, {opacity:1, y:0, scale:1, duration:0.8}, 0.6);
}

/* ============ HERO BACKGROUND MOUSE PARALLAX (desktop only) ============ */
if(!isTouch && !reduceMotion){
  const heroBg = document.getElementById('heroBgImage');
  if(heroBg){
    window.addEventListener('mousemove', e=>{
      const px = (e.clientX / window.innerWidth - 0.5) * 2;
      const py = (e.clientY / window.innerHeight - 0.5) * 2;
      gsap.to(heroBg, {
        x: px * 0.02 * window.innerWidth,
        y: py * 0.02 * window.innerHeight,
        duration: 1.2, ease: 'power2.out'
      });
    });
  }
}

/* ============ CUSTOM CURSOR ============ */
if(!isTouch){
  const dot = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
  let mx=0,my=0, rx=0, ry=0;
  window.addEventListener('mousemove', e=>{mx=e.clientX;my=e.clientY;dot.style.left=mx+'px';dot.style.top=my+'px';});
  function loop(){ rx += (mx-rx)*0.16; ry += (my-ry)*0.16; ring.style.left=rx+'px'; ring.style.top=ry+'px'; requestAnimationFrame(loop);}
  loop();
  document.querySelectorAll('a, button, [data-tilt], .gallery-item').forEach(el=>{
    el.addEventListener('mouseenter', ()=>ring.classList.add('big'));
    el.addEventListener('mouseleave', ()=>ring.classList.remove('big'));
  });
}

/* ============ MAGNETIC BUTTONS ============ */
if(!isTouch){
  document.querySelectorAll('[data-magnetic]').forEach(el=>{
    el.addEventListener('mousemove', e=>{
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width/2) * 0.35;
      const y = (e.clientY - r.top - r.height/2) * 0.35;
      gsap.to(el, {x, y, duration:0.4, ease:'power2.out'});
    });
    el.addEventListener('mouseleave', ()=>{gsap.to(el, {x:0, y:0, duration:0.5, ease:'elastic.out(1,0.4)'});});
  });
}

/* ============ NAV: SCROLL STATE + MOBILE MENU ============ */
const headerEl = document.getElementById('siteHeader');
window.addEventListener('scroll', ()=>{
  headerEl.classList.toggle('scrolled', window.scrollY > 40);
}, {passive:true});

const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
hamburger.addEventListener('click', ()=>{
  mobileMenu.classList.toggle('open');
  hamburger.classList.toggle('open');
});
mobileMenu.querySelectorAll('a').forEach(a=>a.addEventListener('click', ()=>mobileMenu.classList.remove('open')));

/* Cards intentionally no longer tilt or lift on hover — they stay fixed in place;
   only their border/shadow respond (see .service-card:hover, .why-card:hover, .therapist-card:hover in styles.css) */

/* ============ POPULAR TIMES BARS ============ */
gsap.registerPlugin(ScrollTrigger);
(function rhythmBarsIntro(){
  const bars = gsap.utils.toArray('.rhythm-bar');
  if(!bars.length) return;
  ScrollTrigger.create({
    trigger:'.rhythm-grid', start:'top 85%', once:true,
    onEnter:()=>{
      gsap.fromTo(bars,
        {height:'0%', opacity:0, scaleX:0.6, transformOrigin:'bottom center'},
        {
          height:(i,el)=>el.dataset.h+'%',
          opacity:1, scaleX:1,
          duration:1.3,
          ease:'elastic.out(1,0.55)',
          stagger:{each:0.11, from:'start'}
        }
      );
    }
  });
})();

/* ============ SCROLL REVEALS ============ */
document.querySelectorAll('.reveal').forEach(el=>{
  gsap.to(el, {
    opacity:1, y:0, duration:1, ease:'power3.out',
    scrollTrigger:{trigger:el, start:'top 85%'}
  });
});

/* gallery parallax-ish stagger */
gsap.utils.toArray('.gallery-item').forEach((item,i)=>{
  gsap.from(item, {opacity:0, y:40, duration:0.8, delay:(i%4)*0.06, ease:'power2.out', scrollTrigger:{trigger:item, start:'top 92%'}});
});

/* ============ STAGGERED CARD REVEALS (services, why-us, pricing, therapists, FAQ) ============ */
(function staggerCardGrids(){
  const grids = [
    {grid:'.service-grid',   card:'.service-card',   y:44, stagger:0.1},
    {grid:'.why-grid',       card:'.why-card',        y:36, stagger:0.09},
    {grid:'.price-grid',     card:'.price-card',      y:36, stagger:0.12},
    {grid:'.therapist-grid', card:'.therapist-card',  y:40, stagger:0.1},
    {grid:'.faq-list',       card:'.faq-item',        y:24, stagger:0.08}
  ];
  grids.forEach(({grid, card, y, stagger})=>{
    const container = document.querySelector(grid);
    if(!container) return;
    const cards = gsap.utils.toArray(card, container);
    if(!cards.length) return;
    gsap.from(cards, {
      opacity:0, y, duration:0.85, ease:'power3.out', stagger,
      scrollTrigger:{trigger:container, start:'top 88%'}
    });
  });
})();

/* ============ RHYTHM SECTION IMAGE: SUBTLE SCALE-IN ============ */
gsap.utils.toArray('.rhythm-visual').forEach(el=>{
  gsap.from(el, {
    opacity:0, scale:0.92, duration:1, ease:'power3.out',
    scrollTrigger:{trigger:el, start:'top 85%'}
  });
});

/* ============ NAV LINK UNDERLINE + LOGO MICRO-INTERACTIONS ============ */
if(!isTouch){
  document.querySelectorAll('.nav-links a').forEach(link=>{
    link.addEventListener('mouseenter', ()=>gsap.to(link, {y:-2, duration:0.25, ease:'power2.out'}));
    link.addEventListener('mouseleave', ()=>gsap.to(link, {y:0, duration:0.3, ease:'power2.out'}));
  });
}

/* ============ SECTION EYEBROWS: LETTER-DRAW LINE ============ */
gsap.utils.toArray('.eyebrow').forEach(el=>{
  gsap.from(el, {
    opacity:0, x:-14, duration:0.7, ease:'power2.out',
    scrollTrigger:{trigger:el, start:'top 92%'}
  });
});

/* ============ THREE.JS: "THE SPACE" AMBIENT SCENE ============ */
(function spaceScene(){
  const canvas = document.getElementById('space-canvas');
  if(!canvas || !window.THREE) { if(canvas) canvas.style.display='none'; return; }
  const renderer = new THREE.WebGLRenderer({canvas, alpha:true, antialias:!isSmall});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, isSmall ? 1.25 : 1.5));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 50);
  camera.position.set(0,0,6);

  function resize(){
    const w = canvas.parentElement.clientWidth, h = canvas.parentElement.clientHeight;
    renderer.setSize(w,h);
    camera.aspect = w/h; camera.updateProjectionMatrix();
  }
  resize();
  new ResizeObserver(resize).observe(canvas.parentElement);

  // rising incense-smoke particle ribbon
  const c = document.createElement('canvas'); c.width=c.height=64;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(32,32,0,32,32,32);
  g.addColorStop(0,'rgba(230,199,107,0.55)'); g.addColorStop(1,'rgba(230,199,107,0)');
  ctx.fillStyle=g; ctx.fillRect(0,0,64,64);
  const smokeTex = new THREE.CanvasTexture(c);

  const N = isSmall ? 70 : 140;
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(N*3);
  const life = new Float32Array(N);
  for(let i=0;i<N;i++){
    pos[i*3]=(Math.random()-0.5)*0.6;
    pos[i*3+1]=Math.random()*4 - 2;
    pos[i*3+2]=(Math.random()-0.5)*0.6;
    life[i]=Math.random();
  }
  geo.setAttribute('position', new THREE.BufferAttribute(pos,3));
  const mat = new THREE.PointsMaterial({map:smokeTex, size:0.5, transparent:true, depthWrite:false, blending:THREE.AdditiveBlending, opacity:0.5});
  const smoke = new THREE.Points(geo, mat);
  scene.add(smoke);

  const clock = new THREE.Clock();
  let rot = 0;
  function animate(){
    requestAnimationFrame(animate);
    const dt = Math.min(clock.getDelta(), 0.05);
    const posAttr = geo.attributes.position;
    for(let i=0;i<N;i++){
      let y = posAttr.getY(i) + dt*0.35;
      let x = posAttr.getX(i) + Math.sin((y+i)*1.6)*0.0025;
      if(y>2.2){ y=-2.2; x=(Math.random()-0.5)*0.4; }
      posAttr.setY(i,y); posAttr.setX(i,x);
    }
    posAttr.needsUpdate = true;
    rot += dt*0.06;
    smoke.rotation.y = rot;
    renderer.render(scene, camera);
  }
  if(!reduceMotion){ animate(); } else { renderer.render(scene, camera); }
})();

/* ============ CANVAS 2D: FOOTER LOTUS POND ============ */
(function pond(){
  const canvas = document.getElementById('pond-canvas');
  const ctx = canvas.getContext('2d');
  let w,h;
  function resize(){ w=canvas.width=canvas.parentElement.clientWidth; h=canvas.height=canvas.parentElement.clientHeight; }
  resize();
  window.addEventListener('resize', resize);

  const ripples = [];
  function spawnRipple(){
    ripples.push({x:Math.random()*w, y:h*0.55 + Math.random()*h*0.4, r:0, max: 60+Math.random()*90, alpha:0.35});
  }
  for(let i=0;i<4;i++) spawnRipple();
  if(!reduceMotion) setInterval(spawnRipple, 2200);

  const particles = Array.from({length: isSmall?18:36}, ()=>({
    x:Math.random()*w, y: h*0.4 + Math.random()*h*0.5, s:0.6+Math.random()*1.4, sp:0.05+Math.random()*0.08
  }));

  function draw(){
    ctx.clearRect(0,0,w,h);
    ctx.strokeStyle = 'rgba(212,175,55,0.35)';
    for(let i=ripples.length-1;i>=0;i--){
      const r = ripples[i];
      r.r += 0.4; r.alpha -= 0.0028;
      if(r.alpha<=0){ ripples.splice(i,1); continue; }
      ctx.globalAlpha = Math.max(r.alpha,0);
      ctx.beginPath(); ctx.ellipse(r.x, r.y, r.r, r.r*0.32, 0, 0, Math.PI*2); ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.fillStyle = 'rgba(230,199,107,0.5)';
    particles.forEach(p=>{
      p.y -= p.sp; if(p.y < h*0.35){ p.y = h*0.85; p.x = Math.random()*w; }
      ctx.beginPath(); ctx.arc(p.x,p.y,p.s,0,Math.PI*2); ctx.fill();
    });
    if(!reduceMotion) requestAnimationFrame(draw);
  }
  draw();
})();

/* ============ GOOGLE REVIEWS: AUTO-SCROLLING MARQUEE ============ */
(function googleReviewsMarquee(){
  const track = document.getElementById('greviewsGrid');
  if(!track) return;
  // duplicate the card set once so the CSS -50% translate loop is seamless
  const originalCards = Array.from(track.children);
  originalCards.forEach(card=>{
    const clone = card.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    track.appendChild(clone);
  });
  if(reduceMotion){ track.style.animation = 'none'; }
  // pause on touch tap as well as hover, for touch devices
  if(isTouch){
    let paused = false;
    track.addEventListener('touchstart', ()=>{
      paused = !paused;
      track.style.animationPlayState = paused ? 'paused' : 'running';
    }, {passive:true});
  }
})();

/* ============ COUNTERS (numbers section) ============ */
(function counters(){
  const nums = document.querySelectorAll('.number-value');
  if(!nums.length) return;
  function formatNum(n){ return n >= 1000 ? n.toLocaleString('en-IN') : String(n); }
  function animateCount(el){
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    const duration = 1600;
    const start = performance.now();
    function tick(now){
      const p = Math.min((now-start)/duration, 1);
      const eased = 1 - Math.pow(1-p, 3);
      el.textContent = formatNum(Math.round(target*eased)) + suffix;
      if(p < 1) requestAnimationFrame(tick);
    }
    if(reduceMotion){ el.textContent = formatNum(target)+suffix; return; }
    requestAnimationFrame(tick);
  }
  ScrollTrigger.create({
    trigger:'.numbers-grid', start:'top 85%', once:true,
    onEnter:()=>{ nums.forEach(animateCount); }
  });
})();

/* ============ FAQ ACCORDION ============ */
(function faqAccordion(){
  const items = document.querySelectorAll('.faq-item');
  if(!items.length) return;
  items.forEach(item=>{
    const btn = item.querySelector('.faq-q');
    btn.addEventListener('click', ()=>{
      const isOpen = item.classList.contains('open');
      items.forEach(i=>{ i.classList.remove('open'); i.querySelector('.faq-q').setAttribute('aria-expanded','false'); });
      if(!isOpen){ item.classList.add('open'); btn.setAttribute('aria-expanded','true'); }
    });
  });
})();

/* ============ BOOKING FORM -> WHATSAPP HANDOFF ============ */
(function bookingForm(){
  const form = document.getElementById('bookingForm');
  if(!form) return;
  form.addEventListener('submit', e=>{
    e.preventDefault();
    const name = form.name.value.trim();
    const phone = form.phone.value.trim();
    const email = form.email.value.trim();
    const treatment = form.treatment.value;
    const date = form.date.value;
    const time = form.time.value;
    const message = form.message.value.trim();

    let text = `Hi Isiri Global Spa, I'd like to book an appointment.\n\nName: ${name}\nPhone: ${phone}`;
    if(email) text += `\nEmail: ${email}`;
    text += `\nTreatment: ${treatment}`;
    if(date) text += `\nDate: ${date}`;
    if(time) text += `\nTime: ${time}`;
    if(message) text += `\nMessage: ${message}`;

    const url = `https://wa.me/919980508222?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener');
  });
})();
