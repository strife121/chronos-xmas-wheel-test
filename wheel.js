
/* =========================
   WHEEL — JS (таймер, скролл, блокировка)
   ========================= */

const SECTORS_COUNT = 9;
const SECTOR_IDS = ['s1','s2','s3','s4','s5','s6','s7','s8','s9'];
const SECTOR_LABELS = {
  s1:'Бесплатно Chronos Plus на месяц',
  s2:'Бесплатно 5 вопросов ИИ-астрологу ',
  s3:'Бесплатно месяц доступа к ИИ-астрологу',
  s4:'Бесплатную консультацию',
  s5:'52% скидку на Индивидуальный план развития',
  s6:'30% скидку на Звездный аватар',
  s7:'Звездный аватар в подарок при оплате астрогруппы',
  s8:'Бесплатную диагностику',
  s9:'45% скидка на консультацию «Кто я?»'
};
const SECTOR_PROBABILITY = [5,9,3,0,25,25,8,0,25];
const SECTOR_LINKS = {
  s1:'https://sbsite.pro//ChronosPlusPromo_1',
  s2:'https://sbsite.pro//chronos_io_bot_5_1?utm_source=webinar&utm_medium=wheel&utm_campaign=291025&utm_content=halloween25&utm_term=ai5q',
  s3:'https://sbsite.pro//chronos_io_bot_30_1?utm_source=webinar&utm_medium=wheel&utm_campaign=291025&utm_content=halloween25&utm_term=ai30',
  s4:'https://chronos.mg/',
  s5:'https://p.chronos.mg/offer-ipr?utm_source=webinar&utm_medium=wheel&utm_campaign=291025&utm_content=halloween25&utm_term=ipr52',
  s6:'https://p.chronos.mg/offer-avatar?utm_source=webinar&utm_medium=wheel&utm_campaign=291025&utm_content=halloween25&utm_term=avatar30',
  s7:'https://p.chronos.mg/astrogroup_freeavatar?utm_source=webinar&utm_medium=wheel&utm_campaign=291025&utm_content=halloween25&utm_term=astrogroup_freeavatar',
  s8:'https://chronos.mg/',
  s9:'https://p.chronos.mg/ktoya45?utm_source=webinar&utm_medium=wheel&utm_campaign=291025&utm_content=halloween25&utm_term=ktoya45'
};
const spinSettings = { minTurns:5, maxTurns:7, duration:6000 };
const TARGET_DEG = 180, WINDING='cw';
let ORDER_OFFSET=4, BASE_SHIFT=90, NUDGE=8;
const rotor=document.getElementById('rotor'),
      wheelObj=document.getElementById('wheelObject'),
      winBanner=document.getElementById('winBanner'),
      resultRich=document.getElementById('resultRich'),
      resBig=document.getElementById('resBig'),
      resSub=document.getElementById('resSub'),
      countdown=document.getElementById('countdown'),
      countdownTimer=document.getElementById('countdown-timer'),
      timerNotice=document.getElementById('timerNotice'),
      spinBtn=document.getElementById('spinBtn'),
      ctaText=document.getElementById('ctaText');
let spinning=false,clicked=false,currentRotation=0;
var redeemUrl=null;
let lastPrizeId=null,lastPrizeLabel=null,lastPrizeLink=null;
spinBtn.dataset.state='spin';
const slice=360/SECTORS_COUNT,norm=d=>((d%360)+360)%360,randInt=(a,b)=>Math.floor(Math.random()*(b-a+1))+a;
function weightedRandomIndex(){const total=SECTOR_PROBABILITY.reduce((a,b)=>a+b,0);let r=Math.random()*total,c=0;for(let i=0;i<SECTOR_PROBABILITY.length;i++){c+=SECTOR_PROBABILITY[i];if(r<=c)return i;}return SECTOR_PROBABILITY.length-1;}
function tryGetSVGDocument(){try{return wheelObj.contentDocument||wheelObj.getSVGDocument?.()||null}catch(e){return null}}
function highlightSectorInSVG(id){const d=tryGetSVGDocument();if(!d)return;const el=d.getElementById(id);if(!el)return;if(!el.dataset._origFill)el.dataset._origFill=el.getAttribute('fill')||'';el.setAttribute('fill','#FFD343');}
function removeAllHighlights(){const d=tryGetSVGDocument();if(!d)return;SECTOR_IDS.forEach(i=>{const el=d.getElementById(i);if(el&&el.dataset._origFill!==undefined)el.setAttribute('fill',el.dataset._origFill)})}
const TIMER_KEY='chronos_wheel_timer_deadline_v1';
function saveTimerDeadline(ts){try{localStorage.setItem(TIMER_KEY,String(ts))}catch(e){}}
function loadTimerDeadline(){try{return Number(localStorage.getItem(TIMER_KEY))||null}catch(e){return null}}
function clearTimerDeadline(){try{localStorage.removeItem(TIMER_KEY)}catch(e){}}
function formatResultById(id){const t=(SECTOR_LABELS[id]||'').trim();if(!t){resBig.textContent='';resSub.textContent='';return;}
const mPct=t.match(/^(\d{1,3})%\s*скидк[ауыи]\b/i);if(mPct){resBig.textContent=`${mPct[1]}% СКИДКУ`;resSub.textContent=t.replace(mPct[0],'').trim();return;}
const mFree=t.match(/^бесплатн(ую|ый|ая|ое|о)\b/i);if(mFree){resBig.textContent=(mFree[1].toLowerCase()==='ую')?'БЕСПЛАТНУЮ':'БЕСПЛАТНО';resSub.textContent=t.replace(mFree[0],'').trim();return;}
const mGift=t.match(/^(.*?\bв подарок\b)(.*)$/i);if(mGift){resBig.textContent=mGift[1].trim().toUpperCase();resSub.textContent=mGift[2].trim();return;}
resBig.textContent=t;resSub.textContent='';}
function startCountdown(s=900){if(!countdown||!countdownTimer)return;countdown.hidden=false;countdown.classList.add('show');timerNotice.hidden=true;clearInterval(window.countdownInterval);
function f(t){return`${String(Math.floor(t/60)).padStart(2,'0')}:${String(t%60).padStart(2,'0')}`;}
countdownTimer.textContent=f(s);window.countdownInterval=setInterval(()=>{s--;countdownTimer.textContent=f(s);if(s<=0){clearInterval(window.countdownInterval);clearTimerDeadline();countdown.hidden=true;timerNotice.hidden=false;timerNotice.classList.add('show');}},1000);}
(function(){const d=loadTimerDeadline();if(!d)return;const l=Math.max(0,Math.floor((d-Date.now())/1000));if(l>0)startCountdown(l);else clearTimerDeadline();})();
function scrollToResult(){const t=document.querySelector('#countdown')||document.querySelector('#gift')||document.querySelector('#resultRich')||document.querySelector('#spinBtn');if(!t)return;setTimeout(()=>t.scrollIntoView({behavior:'smooth',block:'center'}),300);}
function getDisplayedSectorId(a){let b=0,m=1e9;for(let i=0;i<SECTORS_COUNT;i++){const c=(i+0.5)*slice+BASE_SHIFT+a,d=Math.abs(norm(c)-TARGET_DEG);if(d<m){m=d;b=i;}}const v=b,l=(v-ORDER_OFFSET+SECTORS_COUNT)%SECTORS_COUNT;return SECTOR_IDS[l];}

function setRedeemMode(url, id, label){
  redeemUrl      = url;
  lastPrizeId    = id;
  lastPrizeLabel = label;
  lastPrizeLink  = url;

  if (ctaText)
    ctaText.src = 'https://cdn.jsdelivr.net/gh/strife121/chronosWheel@main/getgift.svg';

  spinBtn.style.display = 'inline-flex';
  spinBtn.disabled = false;
  spinBtn.dataset.state = 'redeem';

  // ВАЖНО: никаких spinBtn.onclick тут не задаём!
}

spinBtn.addEventListener('click', (e)=>{
  // Режим «забрать подарок»
  if (spinBtn.dataset.state === 'redeem' && redeemUrl){
    e.preventDefault();
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'wheel_redeem',
      prize_id:   lastPrizeId,
      prize_label:lastPrizeLabel,
      prize_link: lastPrizeLink
    });
    window.open(redeemUrl, '_blank');
    return;
  }

  // Режим «крутить»
  if (clicked || spinning) return;
  clicked = true; spinning = true;
  spinBtn.style.display = 'none';
  removeAllHighlights();

  // выбор сектора
  const chosenIndex = weightedRandomIndex();
  const autoCenter  = (chosenIndex + 0.5) * slice + BASE_SHIFT;
  const delta       = norm(TARGET_DEG - norm(autoCenter + currentRotation) + NUDGE);

  const turns = randInt(spinSettings.minTurns, spinSettings.maxTurns);
  const start = currentRotation;
  const end   = start + turns*360 + delta;

  const t0 = performance.now(), dur = spinSettings.duration;
  const frame = now => {
    const p = Math.min((now - t0) / dur, 1);
    const a = start + (end - start) * (1 - Math.pow(1 - p, 3));
    rotor.style.transform = `scale(var(--wheel-safe-scale)) rotate(${a}deg)`;
    if (p < 1){ requestAnimationFrame(frame); return; }

    currentRotation = norm(end);
    const id    = getDisplayedSectorId(currentRotation);
    const label = SECTOR_LABELS[id] || id;
    const link  = SECTOR_LINKS[id]  || 'https://chronos.mg/';

    formatResultById(id);
    try{ highlightSectorInSVG(id); }catch{}

    if (winBanner){ winBanner.hidden = false; winBanner.classList.add('show'); }
    resultRich.hidden = false;

    setRedeemMode(link, id, label);

    // аналитика результата
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'wheel_spin',
      prize_id: id,
      prize_label: label,
      prize_link: link,
      final_rotation: currentRotation
    });

    // таймер 15 мин
    const deadline = Date.now() + 900_000;
    saveTimerDeadline(deadline);
    startCountdown(900);

    // автоскролл к результату
    scrollToResult();

    spinning = false;
  };
  requestAnimationFrame(frame);
});


/* ---------- ONE-SPIN LOCK (восстановление + форс-скролл) ---------- */
(function(){
 const TEST_MODE=false,KEY='chronos_wheel_lock_v1',COOKIE='chronos_wheel_lock_v1';
 function setC(n,v,d){try{const e=new Date;e.setTime(e.getTime()+864e5*d);document.cookie=`${n}=${encodeURIComponent(v)}; expires=${e.toUTCString()}; path=/; SameSite=Lax`;}catch(e){}}
 function getC(n){try{const m=document.cookie.match(new RegExp('(?:^|; )'+n.replace(/([.$?*|{}()[\]\\/+^])/g,'\\$1')+'=([^;]*)'));return m?decodeURIComponent(m[1]):null}catch(e){return null}}
 function save(p){try{localStorage.setItem(KEY,JSON.stringify(p))}catch(e){}try{setC(COOKIE,JSON.stringify(p),365)}catch(e){}}
 function load(){try{const r=localStorage.getItem(KEY);if(r)return JSON.parse(r)}catch(e){}try{const c=getC(COOKIE);if(c)return JSON.parse(c)}catch(e){}return null}
 function restoreUI(p){if(!p)return;
  window.lastPrizeId=p.id;window.lastPrizeLabel=p.label;window.lastPrizeLink=p.link;window.redeemUrl=p.link;
  const a=Number(p.angle)||0;if(rotor)rotor.style.transform=`scale(var(--wheel-safe-scale)) rotate(${a}deg)`;currentRotation=a;
  if(resultRich){resultRich.hidden=false;resultRich.classList.add('is-active');}
  if(winBanner){winBanner.hidden=false;winBanner.classList.add('show');}
  formatResultById(p.id);
  if(ctaText)ctaText.src='https://cdn.jsdelivr.net/gh/strife121/chronosWheel@main/getgift.svg';
  setRedeemMode(p.link,p.id,p.label);
  window.clicked=true;
  scrollToResult(); // ← форс-скролл после восстановления
 }
 const ex=!TEST_MODE&&load();if(ex)restoreUI(ex);
 window.dataLayer=window.dataLayer||[];
 if(!window.__wheelLockHooked){window.__wheelLockHooked=true;const o=window.dataLayer.push;
  window.dataLayer.push=function(){for(const a of arguments){try{if(a&&a.event==='wheel_spin'){const p={id:a.prize_id,label:a.prize_label,link:a.prize_link,angle:Number(a.final_rotation)||0,ts:Date.now()};if(!TEST_MODE)save(p)}}catch(e){}}
  return o.apply(this,arguments)};}
})();



/* ==== QA helpers: сброс результата / UI (CodePen safe) ===== */
(function(global){
  const KEY    = 'chronos_wheel_lock_v1';
  const COOKIE = 'chronos_wheel_lock_v1';
  const TIMER_KEY = 'chronos_wheel_timer_deadline_v1';

  function setCookie(name, value, days){
    try{
      const d = new Date();
      d.setTime(d.getTime() + (days*24*60*60*1000));
      document.cookie = `${name}=${encodeURIComponent(value)}; expires=${d.toUTCString()}; path=/; SameSite=Lax`;
    }catch(e){}
  }

  function clearTimer(){
    try{ clearInterval(global.countdownInterval); }catch(e){}
    try{ localStorage.removeItem(TIMER_KEY); }catch(e){}
    const countdown   = document.getElementById('countdown');
    const timerNotice = document.getElementById('timerNotice');
    if (countdown){ countdown.hidden = true; countdown.classList.remove('show'); }
    if (timerNotice){ timerNotice.hidden = true; timerNotice.classList.remove('show'); }
  }

  function resetUIOnly(){
    const rotor      = document.getElementById('rotor');
    const resultRich = document.getElementById('resultRich');
    const winBanner  = document.getElementById('winBanner');
    const ctaText    = document.getElementById('ctaText');
    const spinBtn    = document.getElementById('spinBtn');
    const wheelObj   = document.getElementById('wheelObject');

    clearTimer();

    if (resultRich){
      resultRich.hidden = true;
      resultRich.classList.remove('is-active');
      const resBig = document.getElementById('resBig');
      const resSub = document.getElementById('resSub');
      if (resBig) resBig.textContent = '';
      if (resSub) resSub.textContent = '';
    }

    if (winBanner){
      winBanner.hidden = true;
      winBanner.classList.remove('show');
    }

    if (ctaText){
      ctaText.src = 'https://cdn.jsdelivr.net/gh/strife121/chronosWheel@main/spinwill.svg';
    }

    if (spinBtn){
      spinBtn.style.display = 'inline-flex';
      spinBtn.disabled = false;
      spinBtn.dataset.state = 'spin';
      spinBtn.onclick = null;
    }

    if (rotor){
      rotor.style.transform = 'scale(var(--wheel-safe-scale)) rotate(0deg)';
    }

    try{
      const doc = (function(){
        try { return wheelObj.contentDocument || (wheelObj.getSVGDocument && wheelObj.getSVGDocument()) || null; }
        catch(e){ return null; }
      })();
      if (doc){
        (global.SECTOR_IDS || []).forEach(id=>{
          const el = doc.getElementById(id);
          if (el && el.dataset._origFill !== undefined){
            el.setAttribute('fill', el.dataset._origFill);
          }
        });
      }
    }catch(e){}

    global.clicked = false;
    global.spinning = false;
    global.currentRotation = 0;
    global.redeemUrl = null;
    global.lastPrizeId = null;
    global.lastPrizeLabel = null;
    global.lastPrizeLink = null;

    console.info('✅ UI reset done');
  }

  function hardResetAll(){
    try{ localStorage.removeItem(KEY); }catch(e){}
    setCookie(COOKIE, '', -1);
    try{ localStorage.removeItem(TIMER_KEY); }catch(e){}
    resetUIOnly();
    console.info('???? full reset done (storage + UI)');
  }

  // Привязываем к глобальному объекту
  global.wheelQA = {
    resetAll: hardResetAll,
    resetUI: resetUIOnly
  };

  console.info('???? wheelQA ready → используйте wheelQA.resetAll() или wheelQA.resetUI()');
})(window);

