function ready(fn){ document.addEventListener('DOMContentLoaded', fn); }

// Set CSS vars for header/footer (used elsewhere)
function setChromeHeights(){
  const head = document.querySelector('.header');
  const foot = document.querySelector('.footer');
  const headH = head ? head.offsetHeight : 0;
  const footH = foot ? foot.offsetHeight : 0;
  document.documentElement.style.setProperty('--head-h', headH + 'px');
  document.documentElement.style.setProperty('--footer-h', footH + 'px');
}
window.addEventListener('load', setChromeHeights);
window.addEventListener('resize', setChromeHeights);
ready(setChromeHeights);
setChromeHeights();

// Prefetch internal pages
ready(()=>{
  ['about.html','services.html','projects.html','contacts.html','privacy.html','cookies.html'].forEach(href => {
    const l=document.createElement('link'); l.rel='prefetch'; l.href=href; document.head.appendChild(l);
  });
});

// Page fade
ready(()=>{
  const main=document.querySelector('main');
  if(main){ main.classList.add('fade-enter'); requestAnimationFrame(()=> main.classList.add('fade-enter-active')); }
  document.querySelectorAll('a[href$=".html"]').forEach(a=>{
    a.addEventListener('click', e=>{
      const url=a.getAttribute('href'); if(!url || a.classList.contains('no-fade')) return;
      e.preventDefault(); if(main){ main.classList.add('fade-exit'); main.classList.add('fade-exit-active'); }
      setTimeout(()=>{ window.location.href=url; }, 160);
    });
  });
});

// MENU — single source of truth
ready(()=>{
  const burger = document.getElementById('burger');
  const backdrop = document.getElementById('backdrop');
  const panel = document.getElementById('panel');
  if(!burger || !backdrop || !panel) return;

  function lockScroll(on){
    document.body.classList.toggle('menu-open', !!on);
    document.body.style.overflow = on ? 'hidden' : '';
  }

  function positionPanel(){
    const head = document.querySelector('.header');
    const foot = document.querySelector('.footer');
    const headH = head ? head.offsetHeight : 0;
    const footH = foot ? foot.offsetHeight : 0;
    const vh = window.innerHeight;
    const available = Math.max(80, vh - headH - footH); // full band between header and footer
    panel.style.top = headH + 'px';
    panel.style.bottom = 'auto';
    panel.style.height = available + 'px'; // touch footer top
    panel.style.right = '1.2rem';
  }

  function openMenu(){
    burger.classList.add('open');
    backdrop.classList.add('open');
    panel.classList.add('open');
    positionPanel();
    lockScroll(true);
  }

  function closeMenu(){
    burger.classList.remove('open');
    backdrop.classList.remove('open');
    panel.classList.remove('open');
    lockScroll(false);
  }

  // Toggle
  burger.addEventListener('click', ()=>{
    if(panel.classList.contains('open')) closeMenu(); else openMenu();
  });
  // Close on backdrop and link click
  backdrop.addEventListener('click', closeMenu);
  panel.querySelectorAll('a').forEach(a=> a.addEventListener('click', closeMenu));
  // Close on Esc
  window.addEventListener('keydown', (e)=>{ if(e.key==='Escape') closeMenu(); });
  // Reposition on resize and font load
  window.addEventListener('resize', ()=>{ if(panel.classList.contains('open')) positionPanel(); });
  if(document.fonts && document.fonts.ready){ document.fonts.ready.then(()=>{ if(panel.classList.contains('open')) positionPanel(); }); }
});

// SERVICES accordion — robust height + hanging indent
ready(()=>{
  const items=[...document.querySelectorAll('.ac-item')];
  function setHeight(it){
    const panel=it.querySelector('.ac-panel');
    const content=it.querySelector('.ac-content');
    if(!panel || !content) return;
    if(it.classList.contains('open')){
      panel.style.height = content.scrollHeight + 'px';
    } else {
      panel.style.height = '0px';
    }
  }
  function setIndent(it){
    const panel = it.querySelector('.ac-panel');
    const title = it.querySelector('.ac-title') || it.querySelector('.ac-btn');
    if(panel && title){
      const w = title.getBoundingClientRect().width;
      panel.style.setProperty('--indent', Math.ceil(w)+'px');
    }
  }
  function measureAll(){ items.forEach(it=>{ setIndent(it); setHeight(it); }); }

  items.forEach(it=>{
    const btn=it.querySelector('.ac-btn');
    btn && btn.addEventListener('click', ()=>{
      items.forEach(o=>{ if(o!==it){ o.classList.remove('open'); setHeight(o); } });
      it.classList.toggle('open');
      setHeight(it);
    });
    const panel=it.querySelector('.ac-panel');
    panel && panel.addEventListener('transitionend', ()=> setHeight(it));
  });

  if(document.fonts && document.fonts.ready){ document.fonts.ready.then(measureAll); }
  window.addEventListener('load', measureAll);
  window.addEventListener('resize', measureAll);
  measureAll();
});


// v8: Simple gallery swap for project pages
ready(()=>{
  const main = document.querySelector('.detail-image');
  if(!main) return;
  document.querySelectorAll('.thumb-mini').forEach(t=>{
    t.addEventListener('click', ()=>{
      const src = t.getAttribute('data-src') || t.getAttribute('src');
      if(src && main.getAttribute('src') !== src){
        main.setAttribute('src', src);
      }
    });
  });
});


// v11: Carousel for project detail pages (patched: portrait/landscape height sync)
ready(()=>{
  document.querySelectorAll('.carousel').forEach(car => {
    const imgEl = car.querySelector('img');
    const sources = JSON.parse(car.getAttribute('data-images') || '[]');
    let idx = 0;
    let lastLandscapeH = null; // altezza di riferimento dettata da una landscape

    function setCarHeight(px){
      if(px && px > 0){ car.style.setProperty('--car-h', px + 'px'); }
    }

    function updateFit(){
      if(!imgEl.naturalWidth || !imgEl.naturalHeight) return;
      const isPortrait = imgEl.naturalHeight > imgEl.naturalWidth;

      // Se landscape: detta l'altezza del carosello
      if(!isPortrait){
        // assicuriamoci che l'immagine stia in "height:auto" nel CSS (vedi .carousel > img)
        // e prendiamo l'altezza reale di rendering come riferimento
        requestAnimationFrame(()=>{
          const h = imgEl.clientHeight;
          if(h > 0){
            lastLandscapeH = h;
            setCarHeight(h);
            imgEl.classList.remove('fit-height');
          }
        });
      } else {
        // Se portrait: adatta all'altezza dell'ultima landscape conosciuta
        if(lastLandscapeH){ setCarHeight(lastLandscapeH); }
        imgEl.classList.add('fit-height'); // il CSS usa height: var(--car-h)
      }
    }

    function show(i){
      if(!sources.length) return;
      idx = (i + sources.length) % sources.length;
      imgEl.src = sources[idx];
    }

    // Bind frecce
    car.querySelector('.prev')?.addEventListener('click', ()=> show(idx - 1));
    car.querySelector('.next')?.addEventListener('click', ()=> show(idx + 1));

    // Aggiorna quando l'immagine corrente finisce di caricarsi
    imgEl.addEventListener('load', updateFit);

    // Init: se hai già <img src="..."> nell'HTML lo lasciamo,
    // se preferisci forzare la prima del dataset, scommenta la riga sotto:
    if(sources.length){ imgEl.src = sources[0]; }

    // Ricalcolo su resize: se l'attuale è landscape, ridefinisce l'altezza di riferimento
    window.addEventListener('resize', ()=>{
      if(!imgEl.complete) return;
      const isPortrait = imgEl.naturalHeight > imgEl.naturalWidth;
      if(!isPortrait){
        requestAnimationFrame(()=>{
          const h = imgEl.clientHeight;
          if(h > 0){
            lastLandscapeH = h;
            setCarHeight(h);
            imgEl.classList.remove('fit-height');
          }
        });
      } else if(lastLandscapeH){
        setCarHeight(lastLandscapeH);
        imgEl.classList.add('fit-height');
      }
    });
  });
});
	
// v16: Services UX — keyboard toggle + aria-expanded update
ready(()=>{
  const items = Array.from(document.querySelectorAll('.ac-item'));
  items.forEach(it=>{
    const btn = it.querySelector('.ac-btn');
    const panel = it.querySelector('.ac-panel');
    if(!btn || !panel) return;

    function setAria(){
      btn.setAttribute('aria-expanded', it.classList.contains('open') ? 'true' : 'false');
    }
    // Update ARIA now and after toggle
    setAria();
    btn.addEventListener('click', ()=>{ setAria(); });
    btn.addEventListener('keydown', (e)=>{
      if(e.key === 'Enter' || e.key === ' '){
        e.preventDefault(); btn.click();
      }
    });
  });
});
