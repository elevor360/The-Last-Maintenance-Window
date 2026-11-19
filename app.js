'use strict';
const $=id=>document.getElementById(id);
const KEY='elevor360d-maintenance-window-v1';
let storageOK=true;
let state={page:0,started:false,size:21,theme:'sepia',marks:[]};
try{const old=JSON.parse(localStorage.getItem(KEY)||'null');if(old&&typeof old==='object'){state.page=Number.isInteger(old.page)?Math.min(49,Math.max(0,old.page)):0;state.started=old.started===true;state.size=Number.isFinite(old.size)?Math.min(29,Math.max(17,old.size)):21;state.theme=['sepia','night','light'].includes(old.theme)?old.theme:'sepia';state.marks=Array.isArray(old.marks)?[...new Set(old.marks.filter(n=>Number.isInteger(n)&&n>=0&&n<50))]:[];}}catch(e){storageOK=false;}
let toastTimer,installPrompt;
const illustration={2:['control-room','Mara and Ivo examine a signal in Kestrel’s control room.'],13:['expedition','The expedition approaches the old lander across the lunar surface.'],33:['dawn','The temporary antenna stands ready on Kestrel’s ridge.'],49:['dawn','Ordinary machines keep an extraordinary place alive.']};
function tell(message){$('toast').textContent=message;$('toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').hidden=true,3500);}
function save(){try{localStorage.setItem(KEY,JSON.stringify(state));}catch(e){storageOK=false;}document.querySelector('.reader-note').textContent=storageOK?'Your place is saved on this device.':'Storage is unavailable. Keep this tab open to retain your place.';}
function applySettings(){document.body.dataset.theme=state.theme;document.documentElement.style.setProperty('--reader-size',state.size+'px');$('theme').textContent={sepia:'Sepia',night:'Night',light:'Light'}[state.theme];$('smaller').disabled=state.size<=17;$('larger').disabled=state.size>=29;}
function buildContents(){const ol=$('chapterList');ol.replaceChildren();BOOK.forEach((p,i)=>{if(i===0||p.chapter!==BOOK[i-1].chapter){const li=document.createElement('li');const b=document.createElement('button');b.textContent=p.chapterTitle+' · p. '+(i+1);b.onclick=()=>{closeContents();showPage(i);};li.append(b);ol.append(li);}});buildMarks();}
function buildMarks(){const wrap=$('savedMarks');wrap.replaceChildren();const title=document.createElement('p');title.textContent=state.marks.length?'Your bookmarks':'No bookmarks yet. Use Bookmark to save a page.';wrap.append(title);state.marks.slice().sort((a,b)=>a-b).forEach(i=>{const b=document.createElement('button');b.textContent='Page '+(i+1)+' · '+BOOK[i].chapterTitle;b.onclick=()=>{closeContents();showPage(i);};wrap.append(b);});}
function closeContents(){$('contents').hidden=true;$('contentsButton').setAttribute('aria-expanded','false');}
function showPage(i,focus=true){continuousReading=false;stopNarration();state.page=Math.max(0,Math.min(49,i));state.started=true;save();setupPageAudio();$('coverScreen').hidden=true;$('reader').hidden=false;const data=BOOK[state.page];const article=$('page');article.replaceChildren();const kicker=document.createElement('p');kicker.className='chapter-kicker';kicker.textContent='CHAPTER '+data.chapter+' / '+(state.page%5===0?'THE LAST MAINTENANCE WINDOW':'CONTINUED');article.append(kicker);const h=document.createElement('h2');h.id='pageHeading';h.textContent=data.chapterTitle;article.append(h);if(illustration[state.page]){const [file,caption]=illustration[state.page];const fig=document.createElement('figure');const img=document.createElement('img');img.src='assets/'+file+'.webp';img.alt=caption;img.width=1400;img.height=933;const cap=document.createElement('figcaption');cap.textContent=caption;fig.append(img,cap);article.append(fig);}data.paragraphs.forEach(text=>{const p=document.createElement('p');p.textContent=text;if(text==='THE END')p.className='ending';article.append(p);});$('previous').disabled=state.page===0;$('next').disabled=state.page===49;$('pageNumber').value=state.page+1;$('progress').value=state.page+1;$('pageMeta').textContent='PAGE '+(state.page+1)+' OF 50 · CHAPTER '+data.chapter+' OF 10';const marked=state.marks.includes(state.page);$('bookmark').setAttribute('aria-pressed',String(marked));$('bookmark').textContent=marked?'Bookmarked':'Bookmark';document.title='Page '+(state.page+1)+' · The Last Maintenance Window';if(focus){article.focus({preventScroll:true});article.scrollIntoView({block:'start',behavior:'instant'});}}
// Page audio: add recordings to audio/page-01.mp3 through page-50.mp3.
const pageAudio=$('pageAudio');
const audioPlay=$('audioPlay'),audioRestart=$('audioRestart'),audioStatus=$('audioStatus');
const audioSeek=$('audioSeek'),audioTime=$('audioTime');
const bundledAudioPages=0;
let audioPage=0, audioAvailable=false, audioChecking=false, autoPageTurn=true, continuousReading=false, audioRequestId=0;
const audioFile=n=>'audio/page-'+String(n).padStart(2,'0')+'.mp3';
const formatTime=n=>Number.isFinite(n)?Math.floor(n/60)+':'+String(Math.floor(n%60)).padStart(2,'0'):'0:00';
function refreshAudioUI(){
 const duration=pageAudio.duration||0;
 audioSeek.value=duration?String(Math.round(100*pageAudio.currentTime/duration)):'0';
 audioTime.textContent=formatTime(pageAudio.currentTime)+' / '+formatTime(duration);
 audioPlay.textContent=pageAudio.paused?'▶ Play narration':'❚❚ Pause narration';
 audioRestart.disabled=!audioAvailable;
}
function stopNarration(){
 audioRequestId++;
 if(!pageAudio)return;
 pageAudio.pause();pageAudio.removeAttribute('src');pageAudio.load();
 audioAvailable=false;audioChecking=false;
}
function setupPageAudio(){
 audioPage=state.page+1;
 audioAvailable=audioPage<=bundledAudioPages;
 audioChecking=false;
 audioStatus.textContent=audioAvailable?'Recording available':'Press Play to check for this page’s recording.';
 audioPlay.disabled=false;
 audioRestart.disabled=!audioAvailable;
 audioSeek.value='0';audioTime.textContent='0:00 / 0:00';
 audioPlay.textContent='▶ Play narration';
 $('autoTurn').checked=autoPageTurn;updateAutoTurnLabel();
}
async function startNarration(){
 const page=audioPage, requestId=++audioRequestId;
 if(!audioAvailable){
  if(audioChecking)return;
  audioChecking=true;audioPlay.disabled=true;audioStatus.textContent='Looking for this page’s recording…';
  try{
   const response=await fetch(audioFile(page),{cache:'no-store'});
   if(page!==audioPage||requestId!==audioRequestId)return;
   if(!response.ok||!response.headers.get('content-type')?.includes('audio')&&!response.headers.get('content-type')?.includes('octet-stream')){
    // Some GitHub Pages deployments return audio/mpeg; reject HTML fallback pages.
    throw new Error('Not uploaded');
   }
   audioAvailable=true;
  }catch(e){
   if(page===audioPage&&requestId===audioRequestId){audioStatus.textContent='No recording yet — you can still read this page.';continuousReading=false;}
   return;
  }finally{if(page===audioPage&&requestId===audioRequestId){audioChecking=false;audioPlay.disabled=false;audioRestart.disabled=!audioAvailable;}}
 }
 if(page!==audioPage||requestId!==audioRequestId)return;
 if(!pageAudio.getAttribute('src'))pageAudio.src=audioFile(page);
 try{await pageAudio.play();audioStatus.textContent='Playing page '+page;}
 catch(e){audioStatus.textContent='Unable to play recording. Check the MP3 file.';}
 refreshAudioUI();
}
audioPlay.onclick=()=>{if(!pageAudio.paused){pageAudio.pause();continuousReading=false;audioStatus.textContent='Paused';refreshAudioUI();}else{continuousReading=true;startNarration();}};
function updateAutoTurnLabel(){const label=$('autoTurn').parentElement.querySelector('strong');if(label)label.textContent='Auto Page Turn: '+(autoPageTurn?'ON':'OFF');}
$('autoTurn').onchange=e=>{autoPageTurn=e.target.checked;updateAutoTurnLabel();if(!autoPageTurn)continuousReading=false;};
$('readToMe').onclick=()=>{autoPageTurn=true;$('autoTurn').checked=true;updateAutoTurnLabel();continuousReading=true;if(pageAudio.paused)startNarration();else{audioStatus.textContent='Continuous reading enabled — next page will play automatically.';}};
audioRestart.onclick=()=>{if(!audioAvailable)return;continuousReading=true;pageAudio.currentTime=0;startNarration();};
pageAudio.addEventListener('timeupdate',refreshAudioUI);
pageAudio.addEventListener('loadedmetadata',refreshAudioUI);
pageAudio.addEventListener('ended',()=>{
 audioStatus.textContent='Finished page '+audioPage;refreshAudioUI();
 if(!autoPageTurn||!continuousReading||state.page>=BOOK.length-1){continuousReading=false;return;}
 // Move only when narration ends naturally; stop at the first missing recording.
 const next=state.page+1;
 showPage(next);
 continuousReading=true;
 startNarration();
});
pageAudio.addEventListener('error',()=>{if(pageAudio.getAttribute('src'))audioStatus.textContent='Recording unavailable. Check the MP3 filename.';});
audioSeek.oninput=()=>{if(Number.isFinite(pageAudio.duration)&&pageAudio.duration>0){pageAudio.currentTime=pageAudio.duration*Number(audioSeek.value)/100;refreshAudioUI();}};


$('begin').onclick=()=>showPage(0);
$('continue').hidden=!state.started;$('continue').textContent='Continue · page '+(state.page+1);$('continue').onclick=()=>showPage(state.page);
$('homeLink').onclick=e=>{e.preventDefault();continuousReading=false;stopNarration();$('reader').hidden=true;$('coverScreen').hidden=false;closeContents();$('continue').hidden=!state.started;$('continue').textContent='Continue · page '+(state.page+1);document.title='The Last Maintenance Window · Elevor360D';window.scrollTo(0,0);};
$('previous').onclick=()=>showPage(state.page-1);$('next').onclick=()=>showPage(state.page+1);
function jumpToPage(){const n=Number($('pageNumber').value);if(Number.isInteger(n)&&n>=1&&n<=50)showPage(n-1);else{$('pageNumber').value=state.page+1;tell('Choose a page from 1 to 50');}}
$('goPage').onclick=jumpToPage;
$('pageNumber').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();jumpToPage();}});
$('pageNumber').onchange=e=>{const n=Number(e.target.value);if(Number.isInteger(n)&&n>=1&&n<=50)showPage(n-1);else e.target.value=state.page+1;};
$('contentsButton').onclick=()=>{const open=$('contents').hidden;$('contents').hidden=!open;$('contentsButton').setAttribute('aria-expanded',String(open));};
$('bookmark').onclick=()=>{const i=state.marks.indexOf(state.page);if(i>=0)state.marks.splice(i,1);else state.marks.push(state.page);save();buildMarks();showPage(state.page,false);tell(i>=0?'Bookmark removed':'Page bookmarked');};
$('smaller').onclick=()=>{state.size=Math.max(17,state.size-2);applySettings();save();};$('larger').onclick=()=>{state.size=Math.min(29,state.size+2);applySettings();save();};$('theme').onclick=()=>{state.theme=['sepia','night','light'][(['sepia','night','light'].indexOf(state.theme)+1)%3];applySettings();save();};
document.addEventListener('keydown',e=>{if($('reader').hidden||!$('contents').hidden||$('installHelp').open||/INPUT|BUTTON|TEXTAREA|SELECT/.test(document.activeElement.tagName))return;if(e.key==='ArrowRight'&&state.page<49){e.preventDefault();showPage(state.page+1);}if(e.key==='ArrowLeft'&&state.page>0){e.preventDefault();showPage(state.page-1);}});
const standalone=()=>window.matchMedia('(display-mode: standalone)').matches||window.navigator.standalone===true;
function installVisibility(){$('install').hidden=standalone();}
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installPrompt=e;installVisibility();});window.addEventListener('appinstalled',()=>{installPrompt=null;$('install').hidden=true;tell('Book installed');});window.matchMedia('(display-mode: standalone)').addEventListener('change',installVisibility);
$('install').onclick=async()=>{if(installPrompt){const prompt=installPrompt;installPrompt=null;await prompt.prompt();await prompt.userChoice;}else{$('installHelp').showModal();}};
applySettings();buildContents();installVisibility();save();
// All book assets are cached together. Success is shown only after the cache is complete.
if('serviceWorker' in navigator&&location.protocol!=='file:'){
 navigator.serviceWorker.addEventListener('message',e=>{if(e.data?.type==='BOOK_CACHED')$('offlineStatus').textContent='✓ Available offline · your reading stays on this device';});
 navigator.serviceWorker.register('sw.js').then(async()=>{const ready=await navigator.serviceWorker.ready;const worker=ready.active;if(worker)worker.postMessage({type:'CACHE_STATUS'});}).catch(()=>{$('offlineStatus').textContent='Offline setup did not finish. Reopen online to try again.';});
}else{$('offlineStatus').textContent=location.protocol==='file:'?'Website hosting is needed for installation and offline reading.':'Read online in this browser. Offline installation is unavailable.';}
