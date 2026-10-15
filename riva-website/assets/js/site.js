/* Riva Resorts, shared site script. Each feature checks its elements exist, so this file works on every page. */
(function(){
  var root=document.documentElement;
  var $=function(s,c){return (c||document).querySelector(s)};
  var $$=function(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s))};
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGsap=typeof gsap!=='undefined'&&typeof ScrollTrigger!=='undefined';
  var WA='919048322999';

  /* ---------- text splitting ---------- */
  $$('.split').forEach(function(el){
    var out=el.innerHTML.replace(/<em>(.*?)<\/em>/g,function(m,inner){return inner.split(/\s+/).map(function(w){return '\u0000'+w+'\u0001'}).join(' ')});
    el.innerHTML=out.split(/\s+/).map(function(t){
      var em=t.indexOf('\u0000')===0;t=t.replace(/[\u0000\u0001]/g,'');
      return '<span class="w"><span class="wi">'+(em?'<em>'+t+'</em>':t)+'</span></span>';
    }).join(' ');
  });
  $$('.intro-text').forEach(function(el){
    el.innerHTML=el.textContent.trim().split(/\s+/).map(function(w){return '<span class="word">'+w+'</span>'}).join(' ');
  });

  /* ---------- forms: dates + WhatsApp ---------- */
  var d=new Date();d.setMinutes(d.getMinutes()-d.getTimezoneOffset());var today=d.toISOString().slice(0,10);
  function fmt(v){return new Date(v+'T00:00:00').toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}
  $$('form[data-wa]').forEach(function(form){
    var a=$('[data-in]',form),b=$('[data-out]',form),one=$('[data-date]',form),err=$('.form-error',form);
    if(a&&b){a.min=today;b.min=today;a.addEventListener('change',function(){b.min=a.value||today;if(b.value&&b.value<=a.value)b.value=''})}
    if(one)one.min=today;
    function labelFor(el){if(el.dataset.label)return el.dataset.label;var l=el.id&&form.querySelector('label[for="'+el.id+'"]');return l?l.textContent.replace(/\(optional\)/i,'').trim():el.name}
    form.addEventListener('submit',function(e){
      e.preventDefault();
      var fail=function(msg,el){err.textContent=msg;err.classList.add('on');if(el)el.focus()};
      err.textContent='';err.classList.remove('on');
      var nameEl=form.elements.name;
      if(nameEl&&!nameEl.value.trim())return fail('Add your name so we know who to reply to.',nameEl);
      if(a&&b){
        if(!a.value||!b.value)return fail('Choose your check-in and check-out dates.',a.value?b:a);
        if(b.value<=a.value)return fail('Check-out needs to be after check-in.',b);
      }
      if(one&&!one.value)return fail('Choose a date for your event.',one);
      var lines=[form.dataset.intro||"Hi Riva Resorts, I'd like to check availability.",''];
      var seen={};
      Array.prototype.forEach.call(form.elements,function(el){
        if(!el.name||el.type==='submit'||el.type==='button'||seen[el.name])return;
        var v;
        if(el.type==='checkbox'){seen[el.name]=1;v=$$('input[name="'+el.name+'"]:checked',form).map(function(c){return c.value}).join(', ');if(!v)return;lines.push((el.closest('fieldset')?el.closest('fieldset').querySelector('legend').textContent:el.name)+': '+v);return}
        v=(el.value||'').trim();if(!v)return;
        if(el.type==='date')v=fmt(v);
        lines.push(labelFor(el)+': '+v);
      });
      window.open('https://wa.me/'+WA+'?text='+encodeURIComponent(lines.join('\n')),'_blank','noopener');
    });
  });
  $$('[data-room]').forEach(function(a){a.addEventListener('click',function(){var r=$('#f-room');if(r)r.value=a.dataset.room})});
  try{var qp=new URLSearchParams(location.search),qr=qp.get('room');if(qr){$$('select[name="room"]').forEach(function(s){Array.prototype.forEach.call(s.options,function(o){if(o.value===qr||o.text===qr)s.value=o.value})})}}catch(e){}
  $$('[data-occasion]').forEach(function(a){a.addEventListener('click',function(){var r=$('#g-occ');if(r)r.value=a.dataset.occasion})});
  $$('.yr').forEach(function(y){y.textContent=new Date().getFullYear()});

  /* ---------- mobile menu ---------- */
  var menuBtn=$('.menu-btn');
  function setMenu(open){root.classList.toggle('menu-open',open);menuBtn.setAttribute('aria-expanded',open);menuBtn.setAttribute('aria-label',open?'Close menu':'Open menu');if(window.__lenis){open?window.__lenis.stop():window.__lenis.start()}}
  if(menuBtn){menuBtn.addEventListener('click',function(){setMenu(!root.classList.contains('menu-open'))});$$('.mobile-menu a').forEach(function(a){a.addEventListener('click',function(){setMenu(false)})})}

  /* ---------- header + WhatsApp button (single scroll source, 12px dead zone) ---------- */
  var header=$('.header'),waBtn=$('.wa-float'),hasHero=!!$('.hero,.page-hero');
  var anchor=0,hidden=false;
  function onScroll(y){
    header.classList.toggle('scrolled',y>60);
    if(waBtn)waBtn.classList.toggle('away',hasHero?y<window.innerHeight*.7:y<200);
    if(root.classList.contains('menu-open')||y<500){if(hidden){hidden=false;header.classList.remove('hide')}anchor=y;return}
    if(!hidden&&y>anchor+12){hidden=true;header.classList.add('hide');anchor=y}
    else if(hidden&&y<anchor-12){hidden=false;header.classList.remove('hide');anchor=y}
    else if((hidden&&y>anchor)||(!hidden&&y<anchor)){anchor=y}
  }
  if(waBtn)waBtn.classList.add('away');
  var nativeScroll=function(){onScroll(window.scrollY)};
  window.addEventListener('scroll',nativeScroll,{passive:true});

  /* ---------- hero slideshow (own scope) ---------- */
  (function(){
  var slides=$$('.hero-media .slide'),snav=$('.slide-nav');
  if(slides.length>1&&snav){
    var DUR=7000,si=0,timer=null;
    snav.style.setProperty('--dur',DUR/1000+'s');
    slides.forEach(function(sl,k){var b=document.createElement('button');b.type='button';b.innerHTML='<i></i>'+sl.dataset.label;b.setAttribute('aria-label','Show photo: '+sl.dataset.label);b.addEventListener('click',function(){show(k,true)});snav.appendChild(b)});
    var btns=$$('button',snav);
    var show=function(k,user){
      si=(k+slides.length)%slides.length;
      slides.forEach(function(sl,n){sl.classList.toggle('on',n===si);var im=$('img',sl);if(n===si){im.style.animation='none';void im.offsetWidth;im.style.animation=''}});
      btns.forEach(function(b,n){b.setAttribute('aria-current',n===si);var i=$('i',b);i.style.display='none';void i.offsetWidth;i.style.display=''});
      if(timer)clearTimeout(timer);
      if(!reduce)timer=setTimeout(function(){show(si+1)},DUR);
    };
    document.addEventListener('visibilitychange',function(){if(document.hidden){clearTimeout(timer);snav.classList.add('paused')}else{snav.classList.remove('paused');if(!reduce){clearTimeout(timer);timer=setTimeout(function(){show(si+1)},DUR)}}});
    var introDelay=(document.querySelector('.loader')&&!location.hash&&!reduce)?3400:0;
    setTimeout(function(){show(0)},introDelay);
  }
  })();

  /* ---------- seasons tabs ---------- */
  var tabs=$$('[role="tab"]');
  function selectTab(t){
    tabs.forEach(function(x){var on=x===t;x.setAttribute('aria-selected',on);x.tabIndex=on?0:-1;var p=document.getElementById(x.getAttribute('aria-controls'));p.hidden=!on;
      if(on&&hasGsap&&!reduce){gsap.fromTo(p.children,{y:30,opacity:0},{y:0,opacity:1,duration:.8,stagger:.08,ease:'expo.out'})}});
  }
  tabs.forEach(function(t,i){
    t.addEventListener('click',function(){selectTab(t)});
    t.addEventListener('keydown',function(e){var k=e.key==='ArrowRight'?1:e.key==='ArrowLeft'?-1:0;if(k){var n=tabs[(i+k+tabs.length)%tabs.length];n.focus();selectTab(n)}});
  });

  /* ---------- experience accordion ---------- */
  var panels=$$('.panel');
  function openPanel(p){panels.forEach(function(x){var on=x===p;x.classList.toggle('active',on);x.setAttribute('aria-expanded',on)})}
  panels.forEach(function(p){
    p.addEventListener('click',function(){openPanel(p)});
    p.addEventListener('focus',function(){openPanel(p)});
    p.addEventListener('keydown',function(e){if(e.target===p&&(e.key==='Enter'||e.key===' ')){e.preventDefault();openPanel(p)}});
    p.addEventListener('mouseenter',function(){if(window.matchMedia('(hover:hover)').matches)openPanel(p)});
  });

  /* ---------- stay carousel: arrows, drag, progress ---------- */
  var car=$('.car');
  if(car){
    var bar=$('.car-progress i'),btns=$$('.car-ctrl button');
    var step=function(){var c=$('.s-card',car);return c.getBoundingClientRect().width+22};
    var update=function(){var max=car.scrollWidth-car.clientWidth;var p=max>0?car.scrollLeft/max:1;
      if(bar)bar.style.width=(car.clientWidth/car.scrollWidth*100+p*(100-car.clientWidth/car.scrollWidth*100))+'%';
      if(btns.length){btns[0].disabled=car.scrollLeft<4;btns[1].disabled=car.scrollLeft>max-4}};
    btns.forEach(function(b){b.addEventListener('click',function(){car.scrollBy({left:step()*Number(b.dataset.dir),behavior:'smooth'})})});
    car.addEventListener('scroll',update,{passive:true});window.addEventListener('resize',update);update();
    var down=false,sx=0,sl=0,moved=false;
    car.addEventListener('pointerdown',function(e){if(e.pointerType!=='mouse')return;down=true;moved=false;sx=e.clientX;sl=car.scrollLeft});
    window.addEventListener('pointermove',function(e){if(!down)return;var dx=e.clientX-sx;if(Math.abs(dx)>5){moved=true;car.classList.add('dragging')}car.scrollLeft=sl-dx});
    window.addEventListener('pointerup',function(){if(!down)return;down=false;car.classList.remove('dragging');
      if(moved){var s=step();car.scrollTo({left:Math.round(car.scrollLeft/s)*s,behavior:'smooth'})}});
    car.addEventListener('click',function(e){if(moved){e.preventDefault();e.stopPropagation();moved=false}},true);
  }

  /* ---------- room photo sliders ---------- */
  $$('[data-slider]').forEach(function(sl){
    var imgs=$$('.slides img',sl),th=$$('.thumbs button',sl),cnt=$('.count',sl),i=0;
    function go(n){i=(n+imgs.length)%imgs.length;imgs.forEach(function(im,k){im.classList.toggle('on',k===i)});th.forEach(function(t,k){t.setAttribute('aria-current',k===i)});if(cnt)cnt.textContent=(i+1)+' / '+imgs.length}
    $$('.prev',sl).forEach(function(b){b.addEventListener('click',function(){go(i-1)})});
    $$('.next',sl).forEach(function(b){b.addEventListener('click',function(){go(i+1)})});
    th.forEach(function(t,k){t.addEventListener('click',function(){go(k)})});
    var sx=null,box=$('.slides',sl);
    box.addEventListener('pointerdown',function(e){sx=e.clientX});
    box.addEventListener('pointerup',function(e){if(sx===null)return;var dx=e.clientX-sx;sx=null;if(Math.abs(dx)>40)go(dx<0?i+1:i-1)});
    sl.addEventListener('keydown',function(e){if(e.key==='ArrowRight')go(i+1);if(e.key==='ArrowLeft')go(i-1)});
    go(0);
  });

  /* ---------- gallery page: filters + full-screen viewer ---------- */
  var ggrid=$('.g-grid');
  if(ggrid){
    var gitems=$$('.g-item',ggrid),gbtns=$$('.filters button');
    gbtns.forEach(function(b){var f=b.dataset.filter;var n=f==='all'?gitems.filter(function(i){return !i.classList.contains('g-add')}).length:gitems.filter(function(i){return i.dataset.cat.split(' ').indexOf(f)>-1&&!i.classList.contains('g-add')}).length;var s=$('sup',b);if(s)s.textContent=n});
    var applyFilter=function(f){
      gitems.forEach(function(i){var on=f==='all'||i.dataset.cat.split(' ').indexOf(f)>-1;i.classList.toggle('out',!on)});
      if(window.ScrollTrigger)ScrollTrigger.refresh();
    };
    gbtns.forEach(function(b){b.addEventListener('click',function(){
      gbtns.forEach(function(x){x.setAttribute('aria-pressed',x===b)});
      var f=b.dataset.filter;
      if(typeof gsap!=='undefined'&&!reduce){
        gsap.to(ggrid,{opacity:0,y:20,duration:.25,ease:'power2.in',onComplete:function(){applyFilter(f);
          gsap.fromTo(ggrid,{opacity:0,y:20},{opacity:1,y:0,duration:.5,ease:'expo.out'});
          gsap.fromTo(gitems.filter(function(i){return !i.classList.contains('out')}),{opacity:0,y:30,scale:.97},{opacity:1,y:0,scale:1,duration:.8,stagger:.03,ease:'expo.out'});
        }});
      } else applyFilter(f);
    })});
    var glb=$('#glightbox'),gimg=$('#glb-img'),gcap=$('#glb-cap'),list=[],gi=0;
    var show=function(n){gi=(n+list.length)%list.length;var it=list[gi],im=$('img',it);gimg.src=im.src;gimg.alt=im.alt;gcap.textContent=(it.dataset.cap||im.alt)+'  ('+(gi+1)+' of '+list.length+')';
      if(typeof gsap!=='undefined'&&!reduce)gsap.fromTo(gimg,{opacity:0,scale:.97},{opacity:1,scale:1,duration:.5,ease:'expo.out'})};
    gitems.forEach(function(it){if(it.classList.contains('g-add'))return;it.addEventListener('click',function(){
      list=gitems.filter(function(i){return !i.classList.contains('out')&&!i.classList.contains('g-add')});
      if(glb.showModal)glb.showModal();if(window.__lenis)window.__lenis.stop();show(list.indexOf(it));
    })});
    var closeG=function(){glb.close()};
    glb.addEventListener('close',function(){if(window.__lenis)window.__lenis.start()});
    $('#glb-close').addEventListener('click',closeG);
    $('.lb-prev',glb).addEventListener('click',function(){show(gi-1)});
    $('.lb-next',glb).addEventListener('click',function(){show(gi+1)});
    glb.addEventListener('click',function(e){if(e.target===glb)closeG()});
    glb.addEventListener('keydown',function(e){if(e.key==='ArrowRight')show(gi+1);if(e.key==='ArrowLeft')show(gi-1)});
    var gsx=null;glb.addEventListener('pointerdown',function(e){gsx=e.clientX});
    glb.addEventListener('pointerup',function(e){if(gsx===null)return;var dx=e.clientX-gsx;gsx=null;if(Math.abs(dx)>50)show(dx<0?gi+1:gi-1)});
  }

  /* ---------- gallery lightbox ---------- */
  var lb=$('#lightbox');
  if(lb){var lbImg=$('#lb-img');
    $$('.shot').forEach(function(b){b.addEventListener('click',function(){var i=$('img',b);lbImg.src=i.src;lbImg.alt=i.alt;if(lb.showModal)lb.showModal()})});
    $('#lb-close').addEventListener('click',function(){lb.close()});
    lb.addEventListener('click',function(e){if(e.target===lb)lb.close()});
  }

  /* ---------- no-animation fallback ---------- */
  if(!hasGsap||reduce){
    root.classList.add('no-js-marquee');
    $$('.wi').forEach(function(w){w.style.transform='none'});
    $$('.intro-text .word').forEach(function(w){w.style.opacity=1});
    $$('.grow-frame').forEach(function(g){g.style.clipPath='none'});
    $$('.loader').forEach(function(l){l.style.display='none'});
    return;
  }
  gsap.registerPlugin(ScrollTrigger);
  var mm=gsap.matchMedia();

  /* ---------- smooth scroll ---------- */
  if(typeof Lenis!=='undefined'){
    var lenis=new Lenis({duration:1.15,smoothWheel:true});window.__lenis=lenis;
    window.removeEventListener('scroll',nativeScroll);
    lenis.on('scroll',function(e){ScrollTrigger.update();onScroll(e.scroll)});
    gsap.ticker.add(function(t){lenis.raf(t*1000)});gsap.ticker.lagSmoothing(0);
    $$('a[href*="#"]').forEach(function(a){
      a.addEventListener('click',function(e){
        if(a.pathname!==location.pathname||!a.hash)return;
        var t=document.querySelector(a.hash);if(!t)return;
        e.preventDefault();lenis.scrollTo(t,{offset:-20,duration:1.6});
      });
    });
    if(location.hash){var tgt=null;try{tgt=document.querySelector(location.hash)}catch(e){}
      if(tgt){var userMoved=false;['wheel','touchstart','keydown'].forEach(function(ev){window.addEventListener(ev,function(){userMoved=true},{once:true,passive:true})});
        var goHash=function(){if(!userMoved){ScrollTrigger.refresh();lenis.scrollTo(tgt,{immediate:true,offset:-20,force:true})}};
        window.addEventListener('load',function(){setTimeout(goHash,50);setTimeout(goHash,600);setTimeout(goHash,1500)})}}
  }

  /* ---------- page intro ---------- */
  var loader=$('.loader');
  var tl=gsap.timeline({defaults:{ease:'expo.out'}});
  if(loader&&!location.hash){
    if(window.__lenis)window.__lenis.stop();
    gsap.set(loader,{clipPath:'inset(0% 0% 0% 0%)'});
    tl.to('.loader .lsprig path',{scale:1,duration:.9,stagger:.12,ease:'back.out(2)'})
      .to('.loader .letters span',{yPercent:-105,duration:1,stagger:.07},'-=.6')
      .to('.loader small',{opacity:1,duration:.6},'-=.6')
      .to(loader,{clipPath:'inset(0% 0% 100% 0%)',duration:1.1,ease:'expo.inOut'},'+=.35')
      .set(loader,{display:'none'});
  } else if(loader){loader.style.display='none'}
  if($('.hero-media img'))tl.fromTo('.hero-media img',{scale:1.3},{scale:1,duration:2.4,ease:'power3.out'},loader?'-=.9':0);
  tl.to('.hero-title .wi',{y:0,duration:1.3,stagger:.08},loader&&!location.hash?'-=2.1':0.1)
    .from('.fade-up',{y:40,opacity:0,duration:1.2,stagger:.15},'-=1.1')
    .add(function(){if(window.__lenis)window.__lenis.start()});

  if($('.hero')){
    gsap.to('.hero-media img',{yPercent:12,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:true}});
    gsap.to('.hero .wrap',{yPercent:-25,opacity:0,ease:'none',scrollTrigger:{trigger:'.hero',start:'center center',end:'bottom top',scrub:true}});
  }
  if($('.page-hero')){
    gsap.to('.contours',{yPercent:18,ease:'none',scrollTrigger:{trigger:'.page-hero',start:'top top',end:'bottom top',scrub:true}});
    gsap.fromTo('.contours path',{strokeDasharray:2000,strokeDashoffset:2000},{strokeDashoffset:0,duration:3.2,stagger:.08,ease:'power2.out'});
    gsap.fromTo('.ph-photo img',{yPercent:-10},{yPercent:5,ease:'none',scrollTrigger:{trigger:'.page-hero',start:'top top',end:'bottom top',scrub:true}});
  }

  /* ---------- headings + generic reveals ---------- */
  $$('.split:not(.hero-title)').forEach(function(h){
    gsap.to($$('.wi',h),{y:0,duration:1.2,stagger:.06,ease:'expo.out',scrollTrigger:{trigger:h,start:'top 85%'}});
  });
  $$('.reveal').forEach(function(el){
    gsap.from(el,{y:50,opacity:0,duration:1.2,ease:'expo.out',scrollTrigger:{trigger:el,start:'top 88%'}});
  });

  /* ---------- marquee ---------- */
  if($('.marquee-track')){
    var mq=gsap.to('.marquee-track',{xPercent:-50,duration:38,ease:'none',repeat:-1});
    if(window.__lenis)window.__lenis.on('scroll',function(e){var v=gsap.utils.clamp(-6,6,e.velocity/6);gsap.to(mq,{timeScale:1+Math.abs(v),duration:.3,overwrite:true,onComplete:function(){gsap.to(mq,{timeScale:1,duration:1})}})});
  }

  /* ---------- word-by-word paragraph ---------- */
  $$('.intro-text').forEach(function(p){
    gsap.to($$('.word',p),{opacity:1,stagger:.1,ease:'none',scrollTrigger:{trigger:p,start:'top 80%',end:'bottom 45%',scrub:true}});
  });

  /* ---------- welcome visual ---------- */
  if($('.intro-visual')){
    gsap.fromTo('.intro-visual .main',{clipPath:'inset(100% 0% 0% 0%)'},{clipPath:'inset(0% 0% 0% 0%)',duration:1.6,ease:'expo.inOut',scrollTrigger:{trigger:'.intro-visual',start:'top 80%'}});
    gsap.fromTo('.intro-visual .main img',{yPercent:-14},{yPercent:0,ease:'none',scrollTrigger:{trigger:'.intro',start:'top bottom',end:'bottom top',scrub:true}});
    gsap.from('.intro-visual .float',{y:120,opacity:0,duration:1.4,ease:'expo.out',delay:.3,scrollTrigger:{trigger:'.intro-visual',start:'top 75%'}});
    gsap.to('.intro-visual .float',{yPercent:-18,ease:'none',scrollTrigger:{trigger:'.intro',start:'top bottom',end:'bottom top',scrub:true}});
    gsap.from('.intro-visual .badge',{scale:0,rotate:-90,duration:1.2,ease:'back.out(1.6)',delay:.6,scrollTrigger:{trigger:'.intro-visual',start:'top 75%'}});
    gsap.to('.intro-visual .badge',{rotate:20,ease:'none',scrollTrigger:{trigger:'.intro',start:'top bottom',end:'bottom top',scrub:true}});
    gsap.from('.intro-meta > div',{y:30,opacity:0,duration:1,stagger:.1,ease:'expo.out',scrollTrigger:{trigger:'.intro-meta',start:'top 88%'}});
  }

  /* ---------- growing image ---------- */
  if($('.grow-frame')){
    gsap.fromTo('.grow-frame',{clipPath:window.innerWidth>900?'inset(12% 22% 12% 22% round 400px 400px 24px 24px)':'inset(6% 8% 6% 8% round 200px 200px 20px 20px)'},{clipPath:'inset(0% 0% 0% 0% round 0px 0px 0px 0px)',ease:'none',scrollTrigger:{trigger:'.grow',start:'top 85%',end:'top 10%',scrub:true}});
    gsap.fromTo('.grow-frame img',{yPercent:-12},{yPercent:0,ease:'none',scrollTrigger:{trigger:'.grow',start:'top bottom',end:'bottom top',scrub:true}});
  }

  /* ---------- families strip ---------- */
  if($('.points')){
    gsap.from('.point',{y:90,opacity:0,duration:1.3,stagger:.14,ease:'expo.out',scrollTrigger:{trigger:'.points',start:'top 82%'}});
    gsap.from('.point .ic',{scale:0,rotate:-120,duration:1,stagger:.14,delay:.4,ease:'back.out(2)',scrollTrigger:{trigger:'.points',start:'top 82%'}});
  }

  /* ---------- stay carousel entrance ---------- */
  if(car){gsap.from('.s-card',{x:160,opacity:0,duration:1.4,stagger:.1,ease:'expo.out',scrollTrigger:{trigger:car,start:'top 85%'}})}

  /* ---------- experiences ---------- */
  if($('.acc')){gsap.from('.panel',{y:80,opacity:0,duration:1.2,stagger:.1,ease:'expo.out',scrollTrigger:{trigger:'.acc',start:'top 85%'}})}

  /* ---------- day at Riva ---------- */
  if($('.day')){
    mm.add('(min-width: 901px)',function(){
      var section=$('.day'),track=$('.day-track'),moments=$$('.moment');
      var clock=$('#clock'),clockLabel=$('#clock-label');
      var sky=['#E3EAE3','#EAF0E4','#F2F0DE','#E9EFE9','#F1DFB4','#C9874F','#14222B'];
      var ink=['#0F1B14','#0F1B14','#0F1B14','#0F1B14','#0F1B14','#FFFFFF','#FFFFFF'];
      var dist=function(){return track.scrollWidth-window.innerWidth};
      var st=gsap.timeline({scrollTrigger:{trigger:section,start:'top top',end:function(){return '+='+Math.max(dist()*3,moments.length*window.innerHeight*.8)},pin:'.day-pin',scrub:1.4,invalidateOnRefresh:true,
        onUpdate:function(self){var idx=Math.min(moments.length-1,Math.round(self.progress*(moments.length-1)));
          if(clock.dataset.i!=String(idx)){clock.dataset.i=idx;clock.textContent=moments[idx].dataset.time;clockLabel.textContent=moments[idx].dataset.label;gsap.fromTo(clock,{yPercent:30,opacity:0},{yPercent:0,opacity:1,duration:.5,ease:'expo.out'})}}}});
      st.to(track,{x:function(){return -dist()},ease:'none',duration:1},0);
      st.to('.sun',{left:'100%',ease:'none',duration:1},0);
      var col=gsap.timeline();for(var k=1;k<sky.length;k++){col.to(section,{backgroundColor:sky[k],color:ink[k],duration:1,ease:'none'})}
      st.add(col.duration(1),0);
      return function(){gsap.set(section,{clearProps:'backgroundColor,color'})};
    });
  }


  /* ---------- facilities bento ---------- */
  if($('.bento'))gsap.from('.tile',{y:60,opacity:0,duration:1.1,stagger:.08,ease:'expo.out',scrollTrigger:{trigger:'.bento',start:'top 82%'}});

  /* ---------- around Riva ---------- */
  if($('.around')){
    gsap.fromTo('.around-photo img',{yPercent:-15},{yPercent:0,ease:'none',scrollTrigger:{trigger:'.around',start:'top bottom',end:'bottom top',scrub:true}});
    gsap.fromTo('.around-photo',{clipPath:'inset(100% 0% 0% 0%)'},{clipPath:'inset(0% 0% 0% 0%)',duration:1.6,ease:'expo.inOut',scrollTrigger:{trigger:'.around-photo',start:'top 80%'}});
    gsap.from('.around-dist .lead',{scaleX:0,duration:1.2,stagger:.08,ease:'expo.out',scrollTrigger:{trigger:'.around-dist',start:'top 82%'}});
    gsap.from('.around-dist .place, .around-dist .km',{opacity:0,y:14,duration:.9,stagger:.04,ease:'expo.out',scrollTrigger:{trigger:'.around-dist',start:'top 82%'}});
  }

  /* ---------- gallery parallax columns ---------- */
  $$('.col').forEach(function(c){
    gsap.to(c,{yPercent:Number(c.dataset.speed),ease:'none',scrollTrigger:{trigger:'.cols',start:'top bottom',end:'bottom top',scrub:true}});
  });

  /* ---------- inner page pieces ---------- */
  $$('.band img').forEach(function(im){gsap.fromTo(im,{yPercent:-12},{yPercent:12,ease:'none',scrollTrigger:{trigger:im.parentNode,start:'top bottom',end:'bottom top',scrub:true}})});
  $$('.room').forEach(function(r){
    gsap.fromTo($('.slides',r),{clipPath:'inset(0% 0% 100% 0% round 28px)'},{clipPath:'inset(0% 0% 0% 0% round 28px)',duration:1.5,ease:'expo.inOut',scrollTrigger:{trigger:r,start:'top 75%'}});
    gsap.from($$('.room-info > *',r),{y:40,opacity:0,duration:1.1,stagger:.07,ease:'expo.out',scrollTrigger:{trigger:r,start:'top 70%'}});
  });
  $$('.xp').forEach(function(x){
    var a=$('.xp-media .a',x),b=$('.xp-media .b',x);
    if(a){gsap.fromTo(a,{clipPath:'inset(100% 0% 0% 0% round 999px 999px 28px 28px)'},{clipPath:'inset(0% 0% 0% 0% round 999px 999px 28px 28px)',duration:1.6,ease:'expo.inOut',scrollTrigger:{trigger:x,start:'top 75%'}});
      gsap.fromTo($('img',a),{yPercent:-12},{yPercent:0,ease:'none',scrollTrigger:{trigger:x,start:'top bottom',end:'bottom top',scrub:true}})}
    if(b){gsap.from(b,{y:120,opacity:0,duration:1.4,delay:.4,ease:'expo.out',scrollTrigger:{trigger:x,start:'top 70%'}});
      gsap.to(b,{yPercent:-14,ease:'none',scrollTrigger:{trigger:x,start:'top bottom',end:'bottom top',scrub:true}})}
    gsap.from($$('.xp-text > *',x),{y:40,opacity:0,duration:1.1,stagger:.07,ease:'expo.out',scrollTrigger:{trigger:x,start:'top 68%'}});
  });
  if($('.dark-grid'))gsap.from('.dark-grid figure',{y:80,opacity:0,scale:.96,duration:1.3,stagger:.1,ease:'expo.out',scrollTrigger:{trigger:'.dark-grid',start:'top 80%'}});
  if($('.occasions'))gsap.from('.occ',{y:80,opacity:0,duration:1.2,stagger:.1,ease:'expo.out',scrollTrigger:{trigger:'.occasions',start:'top 82%'}});
  if($('.steps'))gsap.from('.steps li',{y:60,opacity:0,duration:1.2,stagger:.15,ease:'expo.out',scrollTrigger:{trigger:'.steps',start:'top 82%'}});
  if($('.addons'))gsap.from('.addons li',{y:50,opacity:0,duration:1.1,stagger:.08,ease:'expo.out',scrollTrigger:{trigger:'.addons',start:'top 85%'}});
  $$('.hall-photo').forEach(function(h){gsap.fromTo(h,{clipPath:'inset(0% 100% 0% 0% round 28px)'},{clipPath:'inset(0% 0% 0% 0% round 28px)',duration:1.6,ease:'expo.inOut',scrollTrigger:{trigger:h,start:'top 80%'}})});
  if($('.g-grid')){gsap.set('.g-item',{opacity:0,y:50});ScrollTrigger.batch('.g-item',{start:'top 92%',onEnter:function(els){gsap.to(els,{opacity:1,y:0,duration:1,stagger:.06,ease:'expo.out',overwrite:true})}});}
  if($('.insta-band'))gsap.from('.insta-band',{y:60,opacity:0,duration:1.2,ease:'expo.out',scrollTrigger:{trigger:'.insta-band',start:'top 88%'}});
  if($('.c-cards'))gsap.from('.c-card',{y:60,opacity:0,duration:1.1,stagger:.08,ease:'expo.out',delay:.6});
  if($('.find'))gsap.from('.find li',{y:70,opacity:0,duration:1.2,stagger:.12,ease:'expo.out',scrollTrigger:{trigger:'.find',start:'top 82%'}});
  if($('.included'))gsap.from('.included li',{y:60,opacity:0,duration:1.1,stagger:.1,ease:'expo.out',scrollTrigger:{trigger:'.included',start:'top 82%'}});

  /* ---------- illustrated map: draws itself on scroll ---------- */
  $$('.ill-map').forEach(function(svg){
    var t=gsap.timeline({scrollTrigger:{trigger:svg,start:'top 75%'}});
    $$('.m-draw',svg).forEach(function(p){var L=p.getTotalLength();gsap.set(p,{strokeDasharray:L,strokeDashoffset:L})});
    gsap.set($$('.m-fade,.m-label,.m-pop',svg),{opacity:0});
    t.to($$('.coast',svg),{strokeDashoffset:0,duration:1.4,ease:'power2.inOut'})
     .to($$('.m-fade',svg),{opacity:1,duration:1,stagger:.1},'-=.8')
     .from($$('.mtn',svg),{scaleY:0,transformOrigin:'50% 100%',duration:.6,stagger:.015,ease:'back.out(2)'},'-=1')
     .to($$('.river',svg),{strokeDashoffset:0,duration:1.6,ease:'power2.inOut'},'-=.4')
     .to($$('.m-pop',svg),{opacity:1,duration:.5},'-=1.4')
     .to($$('.m-label',svg),{opacity:1,duration:.8},'-=1')
     .from($$('.pin',svg),{y:-60,opacity:0,duration:1,ease:'bounce.out'},'-=.8');
  });

  /* ---------- cross-section ---------- */
  $$('.profile').forEach(function(svg){
    var edge=$('.p-draw',svg),L=edge.getTotalLength();
    gsap.set(edge,{strokeDasharray:L,strokeDashoffset:L});
    gsap.set($$('.p-fill,.p-fade,.p-label,.p-pin',svg),{opacity:0});
    gsap.timeline({scrollTrigger:{trigger:svg,start:'top 80%'}})
      .to(edge,{strokeDashoffset:0,duration:2,ease:'power2.inOut'})
      .to($('.p-fill',svg),{opacity:1,duration:1},'-=1.2')
      .to($$('.p-fade',svg),{opacity:1,duration:.8},'-=.6')
      .to($$('.p-label',svg),{opacity:1,duration:.8},'-=.4')
      .fromTo($$('.p-pin',svg),{opacity:0,y:-30},{opacity:1,y:0,duration:.9,ease:'bounce.out'},'-=.6');
  });

  /* ---------- water flow ---------- */
  if($('.flow')){
    gsap.from('.flow-line',{scaleX:0,transformOrigin:'left',duration:2,ease:'power2.inOut',scrollTrigger:{trigger:'.flow',start:'top 78%'}});
    gsap.from('.node',{y:60,opacity:0,duration:1.1,stagger:.35,ease:'expo.out',scrollTrigger:{trigger:'.flow',start:'top 78%'}});
    gsap.from('.node .orb',{scale:.4,duration:1.1,stagger:.35,ease:'back.out(1.8)',scrollTrigger:{trigger:'.flow',start:'top 78%'}});
  }

  /* ---------- nearby photo ---------- */
  if($('.nearby-photo')){gsap.fromTo('.nearby-photo',{clipPath:'inset(100% 0% 0% 0%)'},{clipPath:'inset(0% 0% 0% 0%)',duration:1.6,ease:'expo.inOut',scrollTrigger:{trigger:'.nearby-photo',start:'top 80%'}})}

  /* ---------- enquiry + footer ---------- */
  if($('.book')){
    gsap.fromTo('.book-bg',{yPercent:-10},{yPercent:10,ease:'none',scrollTrigger:{trigger:'.book',start:'top bottom',end:'bottom top',scrub:true}});
    gsap.from('.book .form',{y:80,opacity:0,duration:1.3,ease:'expo.out',scrollTrigger:{trigger:'.book .form',start:'top 85%'}});
  }
  if($('.giant'))gsap.from('.giant span',{yPercent:100,duration:1.4,stagger:.08,ease:'expo.out',scrollTrigger:{trigger:'.giant',start:'top 92%'}});

  /* ---------- cursor + magnetic buttons (mouse only) ---------- */
  if(window.matchMedia('(hover:hover) and (pointer:fine)').matches){
    root.classList.add('has-cursor');
    var cur=$('.cursor'),cx=gsap.quickTo(cur,'x',{duration:.35,ease:'power3'}),cy=gsap.quickTo(cur,'y',{duration:.35,ease:'power3'});
    window.addEventListener('mousemove',function(e){cur.classList.add('on');cx(e.clientX);cy(e.clientY)});
    $$('.car,.shot,.g-item:not(.g-add)').forEach(function(el){el.addEventListener('mouseenter',function(){$('span',cur).textContent=el.classList.contains('car')?'Drag':'View';cur.classList.add('big')});el.addEventListener('mouseleave',function(){cur.classList.remove('big')})});
    $$('.magnetic').forEach(function(b){
      var bx=gsap.quickTo(b,'x',{duration:.5,ease:'power3'}),by=gsap.quickTo(b,'y',{duration:.5,ease:'power3'});
      b.addEventListener('mousemove',function(e){var r=b.getBoundingClientRect();bx((e.clientX-r.left-r.width/2)*.3);by((e.clientY-r.top-r.height/2)*.4)});
      b.addEventListener('mouseleave',function(){bx(0);by(0)});
    });
  }
  window.addEventListener('load',function(){ScrollTrigger.refresh()});
})();
