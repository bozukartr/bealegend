const SAVE_KEY = "bealegend-career-v1";

const CLUBS = [
  { id:"marmara", name:"Marmara United", short:"MAR", city:"İstanbul", color:"#eaff57", dark:"#171d17", level:74, dev:82, salary:18500, text:"Elit tesis, sert rekabet ve yüksek medya baskısı." },
  { id:"baskent", name:"Başkent 1923", short:"BAS", city:"Ankara", color:"#ff6846", dark:"#201813", level:69, dev:75, salary:14250, text:"Dengeli kadro, sabırlı teknik ekip ve gerçek forma şansı." },
  { id:"ege", name:"Ege Atletik", short:"EGE", city:"İzmir", color:"#70e7ff", dark:"#101d22", level:65, dev:91, salary:11250, text:"Genç oyuncu fabrikası; düşük baskı, hızlı gelişim." },
  { id:"bosphorus", name:"Bosphorus FC", short:"BOS", city:"İstanbul", color:"#8e7dff", dark:"#17142a", level:76, dev:73, salary:21000, text:"Yıldızlarla dolu, şampiyonluk isteyen kulüp." },
  { id:"toros", name:"Toros Gücü", short:"TOR", city:"Adana", color:"#ffcf55", dark:"#241d0d", level:67, dev:70, salary:12800, text:"Fiziksel futbol ve ateşli taraftar." },
  { id:"karadeniz", name:"Karadeniz Rovers", short:"KAR", city:"Trabzon", color:"#ff5f7d", dark:"#271117", level:71, dev:77, salary:15750, text:"Tutkulu şehir, yoğun tempo ve aidiyet." },
  { id:"anadolu", name:"Anadolu Yıldızı", short:"ANY", city:"Eskişehir", color:"#e65cff", dark:"#231127", level:63, dev:88, salary:10400, text:"Genç kadro, cesur futbol ve güçlü akademi." },
  { id:"akdeniz", name:"Akdeniz Spor", short:"AKD", city:"Antalya", color:"#56ffad", dark:"#10241b", level:66, dev:72, salary:12100, text:"Teknik futbol, rahat şehir ve dengeli beklenti." },
  { id:"golden", name:"Golden Horn", short:"GLD", city:"İstanbul", color:"#ffc857", dark:"#261d0e", level:79, dev:78, salary:24800, text:"Büyük bütçe, yıldız baskısı ve Avrupa hedefi." },
  { id:"kapadokya", name:"Kapadokya FK", short:"KAP", city:"Kayseri", color:"#ff835c", dark:"#27150f", level:64, dev:69, salary:10900, text:"Disiplinli yapı ve fizik gücüne dayalı oyun." },
  { id:"trakya", name:"Trakya Birlik", short:"TRK", city:"Edirne", color:"#83a7ff", dark:"#11182a", level:62, dev:84, salary:9800, text:"Düşük baskı ve genç oyunculara uzun süre." },
  { id:"mezopotamya", name:"Mezopotamya 21", short:"MEZ", city:"Diyarbakır", color:"#ff6e9f", dark:"#29111c", level:68, dev:76, salary:13400, text:"Yoğun taraftar desteği ve yüksek mücadele." }
];

const POSITIONS = { ST:"Santrafor", LW:"Sol Kanat", RW:"Sağ Kanat", CAM:"10 Numara", CM:"Merkez", DM:"Ön Libero", LB:"Sol Bek", RB:"Sağ Bek", CB:"Stoper", GK:"Kaleci" };
const ARCHETYPES = {
  finisher:{ name:"Bitirici", text:"Ceza sahasında soğukkanlı, doğrudan ve ölümcül.", boosts:["shooting","pace","composure"] },
  creator:{ name:"Oyun Kurucu", text:"Dar alanda çözüm üretir, oyunun temposunu belirler.", boosts:["passing","technique","vision"] },
  engine:{ name:"Dinamo", text:"Bitmeyen enerji, iki yönlü oyun ve yüksek pres.", boosts:["stamina","pace","decisions"] },
  rock:{ name:"Duvar", text:"Temaslı oyunda güvenilir, sakin ve pozisyonuna sadık.", boosts:["defending","strength","composure"] }
};
const TRAINING = {
  finishing:{ name:"Bitiricilik", caption:"Şut, soğukkanlılık", icon:"◎", energy:18, morale:1, gains:{shooting:.65,composure:.3} },
  technique:{ name:"Teknik", caption:"Kontrol, pas, oyun görüşü", icon:"◇", energy:15, morale:2, gains:{technique:.5,passing:.35,vision:.2} },
  physical:{ name:"Fizik", caption:"Hız, güç, dayanıklılık", icon:"↗", energy:24, morale:-1, gains:{pace:.35,strength:.4,stamina:.45} },
  tactical:{ name:"Taktik", caption:"Karar, görüş, savunma", icon:"⌘", energy:12, morale:0, gains:{decisions:.45,vision:.4,defending:.25} },
  speed:{ name:"Sürat", caption:"Patlayıcılık, çeviklik", icon:"»", energy:22, morale:0, gains:{pace:.72,stamina:.18} },
  strength:{ name:"Kuvvet", caption:"Temas, denge, dayanıklılık", icon:"⬡", energy:25, morale:-1, gains:{strength:.68,stamina:.24} },
  setpiece:{ name:"Duran top", caption:"Şut, pas, soğukkanlılık", icon:"◎", energy:14, morale:2, gains:{shooting:.36,passing:.28,composure:.32} },
  analysis:{ name:"Video analiz", caption:"Görüş, karar, taktik", icon:"▣", energy:7, morale:0, gains:{vision:.42,decisions:.55} },
  recovery:{ name:"Aktif dinlenme", caption:"Enerji, moral ve form", icon:"◌", energy:-30, morale:4, gains:{} }
};
const SHOP_ITEMS = {
  recovery:{ name:"Recovery içeceği", category:"PERFORMANS", icon:"◌", price:280, repeatable:true, consumable:true, effect:"+18 enerji · -4 stres", effects:{energy:18,stress:-4} },
  protein:{ name:"Protein paketi", category:"PERFORMANS", icon:"△", price:420, repeatable:true, consumable:true, effect:"+9 kondisyon · +5 enerji", effects:{fitness:9,energy:5} },
  cryo:{ name:"Kriyo seansı", category:"PERFORMANS", icon:"❄", price:1250, repeatable:true, consumable:true, effect:"+16 enerji · +5 kondisyon", effects:{energy:16,fitness:5} },
  boots:{ name:"Pro krampon", category:"EKİPMAN", icon:"↗", price:5400, effect:"+1 şut · +1 teknik", effects:{shooting:1,technique:1} },
  eliteboots:{ name:"Elite krampon", category:"EKİPMAN", icon:"✦", price:16800, reputation:24, effect:"+2 hız · +1 teknik", effects:{pace:2,technique:1} },
  gps:{ name:"GPS performans yeleği", category:"EKİPMAN", icon:"⌖", price:8900, effect:"Antrenmanda ek güven", effects:{} },
  guards:{ name:"Karbon tekmelik", category:"EKİPMAN", icon:"⬢", price:3800, effect:"+1 savunma · +1 güç", effects:{defending:1,strength:1} },
  headphones:{ name:"ANC kulaklık", category:"SAĞLIK", icon:"♫", price:3200, effect:"Stres -8 · moral +3", effects:{stress:-8,morale:3} },
  sleepkit:{ name:"Uyku optimizasyon seti", category:"SAĞLIK", icon:"☾", price:7600, effect:"Her gün +4 enerji", effects:{} },
  nutritionist:{ name:"Beslenme uzmanı", category:"SAĞLIK", icon:"＋", price:24000, reputation:18, effect:"Her gün +1 kondisyon", effects:{} },
  homegym:{ name:"Ev spor salonu", category:"SAĞLIK", icon:"⬡", price:48000, reputation:28, effect:"Fizik çalışmalarında %10 bonus", effects:{} },
  console:{ name:"Oyun konsolu", category:"YAŞAM", icon:"◇", price:18500, effect:"Oyun gecesinde ekstra moral", effects:{} },
  sneakers:{ name:"Limitli sneaker", category:"YAŞAM", icon:"≈", price:9800, effect:"+2 moral · +1 itibar", effects:{morale:2,reputation:1} },
  suit:{ name:"Özel dikim takım", category:"YAŞAM", icon:"♢", price:28500, reputation:20, effect:"+3 itibar · +2 moral", effects:{reputation:3,morale:2} },
  watch:{ name:"Prestij saat", category:"LÜKS", icon:"⌁", price:62000, reputation:30, effect:"+4 itibar · +3 moral", effects:{reputation:4,morale:3} },
  car:{ name:"Sportif otomobil", category:"LÜKS", icon:"➜", price:185000, reputation:45, effect:"+9 itibar · +6 moral", effects:{reputation:9,morale:6} },
  penthouse:{ name:"Şehir rezidansı", category:"LÜKS", icon:"▥", price:420000, reputation:65, effect:"+14 itibar · aile bağı bonusu", effects:{reputation:14,family:5} }
};
const SHOP_CATEGORIES=["TÜMÜ","PERFORMANS","EKİPMAN","SAĞLIK","YAŞAM","LÜKS"];
const SOCIAL_ACTIVITIES = {
  family:{name:"Aileyle akşam",icon:"⌂",detail:"Aile +8 · Moral +5",energy:-8,morale:5,family:8,friends:0,stress:-4},
  friends:{name:"Arkadaşlarla buluş",icon:"♧",detail:"Arkadaş +9 · Moral +7",energy:-14,morale:7,family:0,friends:9,stress:-5},
  gaming:{name:"Evde oyun gecesi",icon:"◇",detail:"Düşük enerji · Stres azalır",energy:-4,morale:3,family:0,friends:2,stress:-7},
  dinner:{name:"Takım yemeği",icon:"☼",detail:"Güven +2 · Moral +4",energy:-9,morale:4,family:0,friends:5,stress:-3,trust:2},
  cinema:{name:"Sinema gecesi",icon:"▣",detail:"Moral +4 · Stres -6",energy:-6,morale:4,family:0,friends:2,stress:-6},
  charity:{name:"Sosyal sorumluluk",icon:"♡",detail:"İtibar +3 · Moral +3",energy:-10,morale:3,family:1,friends:1,stress:-2,reputation:3},
  alone:{name:"Kendine zaman ayır",icon:"☾",detail:"Stres -10 · Enerji +4",energy:4,morale:2,family:0,friends:0,stress:-10},
  sponsor:{name:"Sponsor etkinliği",icon:"✦",detail:"İtibar +4 · Stres +3",energy:-12,morale:1,family:0,friends:1,stress:3,reputation:4,requires:25}
};
const BRIEFINGS=[
  {title:"Geçişlerde merkez boşalıyor",text:"Topu kazandıktan sonraki ilk pasında risk almak hücum oyuncuları için daha yüksek ödül sağlayabilir.",tempo:"Yüksek",risk:"Orta"},
  {title:"Savunma çizgisi ağır kalıyor",text:"Koşunu erken başlat. Özellikle ters kanattan ceza sahasına girişler rakibin dengesini bozuyor.",tempo:"Orta",risk:"Yüksek"},
  {title:"Ön alan presi kırılgan",text:"İlk baskıyı tek pasla aşabilirsen geniş alanda sayısal üstünlük yakalama ihtimali artıyor.",tempo:"Yüksek",risk:"Yüksek"},
  {title:"Duran toplarda adam paylaşımı zayıf",text:"Arka direğe hareketlenmek ve ikinci topu takip etmek bu maçın gizli fırsatı olabilir.",tempo:"Dengeli",risk:"Düşük"},
  {title:"Bekler hücuma erken çıkıyor",text:"Top kaybı anında çizgi arkasına koşu, rakibin geniş savunma boşluğunu cezalandırabilir.",tempo:"Yüksek",risk:"Orta"},
  {title:"Merkezde fizik üstünlüğü kuruyorlar",text:"Temastan kaçın, oyunu çabuk yön değiştirerek kur ve topu kanatlara erken aktar.",tempo:"Dengeli",risk:"Orta"}
];
const DAILY_GOALS = {
  training:{icon:"↗",title:"Profesyonel çalışma",text:"Bugün bir antrenman tamamla",reward:"20 XP · Güven +1",xp:20,trust:1},
  social:{icon:"♡",title:"Zihinsel denge",text:"Bir sosyal yaşam planı yap",reward:"20 XP · Moral +2",xp:20,morale:2},
  recovery:{icon:"◌",title:"Vücuduna yatırım",text:"Aktif toparlanma tamamla",reward:"20 XP · Form +1",xp:20,form:1},
  match:{icon:"●",title:"Sahne senin",text:"Bugünkü maçı tamamla",reward:"30 XP · İtibar +1",xp:30,reputation:1}
};

let state = null;
let tab = "today";
let creationStep = 1;
let draft = { name:"", age:17, position:"ST", foot:"Sağ", archetype:"finisher", clubId:"baskent" };
let match = null;
let sheet = null;
let toast = "";
let shopCategory = "TÜMÜ";
let matchEngine = null;
let pixiPromise = null;
let engineMountToken = 0;

const clamp = (n,min=0,max=100) => Math.max(min,Math.min(max,n));
const club = id => CLUBS.find(c=>c.id===id) || CLUBS[0];
const esc = value => String(value).replace(/[&<>"']/g, m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
const uid = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;
const money = n => `₺${Math.round(n).toLocaleString("tr-TR")}`;
const dateFormatter = new Intl.DateTimeFormat("tr-TR",{day:"2-digit",month:"long",year:"numeric",timeZone:"UTC"});
const gameDate = () => new Date(`${state.currentDate}T00:00:00Z`);
const dateLabel = () => dateFormatter.format(gameDate()).replace(/^./,letter=>letter.toLocaleUpperCase("tr-TR"));
const seasonLabel = date => {
  const year=date.getUTCFullYear(),month=date.getUTCMonth();
  return month>=6?`${year}/${String(year+1).slice(-2)}`:`${year-1}/${String(year).slice(-2)}`;
};
const addCalendarDay = () => {
  const date=gameDate();date.setUTCDate(date.getUTCDate()+1);
  state.currentDate=date.toISOString().slice(0,10);state.date=dateLabel();state.season=seasonLabel(date);
};
const goalTypeForDay = day => ["training","social","recovery"][(Math.max(1,day)-1)%3];
const ensureDailyGoal = () => {
  if(!state.dailyGoal||state.dailyGoal.day!==state.day)state.dailyGoal={day:state.day,type:state.daysToMatch===0?"match":goalTypeForDay(state.day),completed:false};
};
const levelInfo = () => {
  const level=Math.floor(state.xp/100)+1,progress=state.xp%100;
  return {level,progress,next:100};
};
const weekDays = () => {
  const today=gameDate(),weekday=new Intl.DateTimeFormat("tr-TR",{weekday:"short",timeZone:"UTC"});
  return Array.from({length:7},(_,index)=>{
    const date=new Date(today);date.setUTCDate(today.getUTCDate()+index);
    return {index,label:weekday.format(date).replace(".","").slice(0,3).toLocaleUpperCase("tr-TR"),number:date.getUTCDate(),match:index===state.daysToMatch};
  });
};
const haptic = pattern => {if(typeof navigator!=="undefined"&&navigator.vibrate)navigator.vibrate(pattern||12)};
const loadPixi = () => {
  if(window.PIXI)return Promise.resolve(window.PIXI);
  if(pixiPromise)return pixiPromise;
  pixiPromise=new Promise((resolve,reject)=>{
    const script=document.createElement("script");script.src="vendor/pixi.min.js";script.async=true;
    script.onload=()=>resolve(window.PIXI);script.onerror=()=>reject(new Error("PixiJS yüklenemedi"));
    document.head.appendChild(script);
  });
  return pixiPromise;
};
function destroyMatchEngine(){
  engineMountToken++;
  if(matchEngine){matchEngine.destroy();matchEngine=null}
}
async function mountMatchEngine(){
  const host=document.querySelector("#match-engine");
  if(!host||!match||match.completed)return;
  const token=++engineMountToken,moment=match.moments[match.index];
  try{
    await loadPixi();
    if(token!==engineMountToken||!document.querySelector("#match-engine"))return;
    matchEngine=new window.Match2DEngine(host,{
      momentIndex:match.index,
      choices:moment.choices,
      onPreview:index=>document.querySelectorAll("[data-tactic]").forEach((button,buttonIndex)=>button.classList.toggle("previewing",buttonIndex===index)),
      onMode:message=>{const prompt=document.querySelector(".interaction-prompt");if(prompt)prompt.textContent=message},
      onResolve:index=>resolveChoice(index),
      onComplete:()=>{if(match)match.resolving=false;render()}
    });
    await matchEngine.init();
    document.querySelectorAll("[data-tactic]").forEach((button,index)=>{
      button.addEventListener("pointerenter",()=>matchEngine?.preview(index));
      button.addEventListener("focus",()=>matchEngine?.preview(index));
      button.addEventListener("touchstart",()=>matchEngine?.preview(index),{passive:true});
    });
  }catch(error){
    matchEngine=null;
    if(token===engineMountToken)host.innerHTML=`<div class="engine-error"><b>2D saha başlatılamadı</b><span>Kararını aşağıdaki panelden verebilirsin.</span></div>`;
  }
}

function overall(a,pos){
  const avg = keys => keys.reduce((s,k)=>s+a[k],0)/keys.length;
  if(["ST","LW","RW"].includes(pos)) return Math.round(avg(["pace","shooting","technique","composure"]));
  if(["CAM","CM"].includes(pos)) return Math.round(avg(["passing","technique","vision","decisions","stamina"]));
  return Math.round(avg(["defending","strength","decisions","stamina"]));
}

function createCareer(){
  const a={pace:58,shooting:55,passing:57,technique:58,defending:48,strength:54,stamina:59,vision:55,decisions:52,composure:51};
  ARCHETYPES[draft.archetype].boosts.forEach(k=>a[k]+=7);
  if(["CB","DM","LB","RB","GK"].includes(draft.position)){a.defending+=8;a.shooting-=5}
  if(["ST","LW","RW"].includes(draft.position)){a.shooting+=5;a.defending-=4}
  const c=club(draft.clubId), gen=overall(a,draft.position);
  state={version:5,player:{name:draft.name.trim(),age:draft.age,position:draft.position,foot:draft.foot,archetype:draft.archetype,number:Math.floor(Math.random()*40)+11,overall:gen,potential:clamp(gen+24,72,94),attributes:a},clubId:c.id,currentDate:"2026-08-18",date:"18 Ağustos 2026",season:"2026/27",day:1,energy:86,morale:72,form:65,fitness:91,coachTrust:48,reputation:12,xp:0,professionalStreak:0,dailyGoal:{day:1,type:"training",completed:false},trainedToday:false,actionsLeft:2,dayActions:{training:false,social:false,recovery:false},social:{family:72,friends:64,partner:0,stress:28},finances:{balance:12500,totalSpent:0,nextPayDay:7},inventory:{},daysToMatch:3,appearances:0,starts:0,goals:0,assists:0,averageRating:0,lastRating:null,contract:{salary:c.salary,yearsLeft:3,role:"Gelecek vaat eden oyuncu"},offer:null,logs:[{id:uid(),type:"club",title:`${c.name} kariyerin başladı`,detail:"Teknik ekip senden sabır, disiplin ve istikrarlı gelişim bekliyor.",date:"Bugün"}]};
  save(); render();
}

function save(){ if(state) localStorage.setItem(SAVE_KEY,JSON.stringify(state)); }
function squad(){ return state.coachTrust>=74&&state.form>=62?"İlk 11":state.coachTrust>=51?"Rotasyon":"Yedek"; }
function migrate(){
  if(!state)return;
  if(state.actionsLeft===undefined)state.actionsLeft=2;
  if(!state.dayActions)state.dayActions={training:false,social:false};
  if(!state.social)state.social={family:72,friends:64,partner:0,stress:28};
  if(!state.finances)state.finances={balance:12500,totalSpent:0,nextPayDay:Math.max(7,state.day+6)};
  if(!state.inventory)state.inventory={};
  if(!state.currentDate){
    const migrated=new Date("2026-08-18T00:00:00Z");migrated.setUTCDate(migrated.getUTCDate()+Math.max(0,(state.day||1)-1));
    state.currentDate=migrated.toISOString().slice(0,10);
  }
  if(state.professionalStreak===undefined)state.professionalStreak=0;
  if(state.dayActions.recovery===undefined)state.dayActions.recovery=false;
  ensureDailyGoal();state.date=dateLabel();state.season=seasonLabel(gameDate());state.version=5;
}
function mark(id,small=false){const c=club(id);return `<div class="club-mark ${small?"small":""}" style="--club:${c.color};--club-dark:${c.dark}" title="${c.name}">${c.short[0]}</div>`}
function meter(label,value,tone="lime"){return `<div class="meter"><div><span>${label}</span><b>${Math.round(value)}</b></div><i><em class="${tone}" style="width:${clamp(value)}%"></em></i></div>`}
function heading(kicker,title,text){return `<section class="page-heading"><span>${kicker}</span><h1>${title}</h1><p>${text}</p></section>`}

function renderCreation(){
  const content = creationStep===1 ? `
    <header><span>KİMLİK</span><h2>Hikâyenin kahramanı</h2><p>İlk profesyonel sözleşmene sadece birkaç gün kaldı.</p></header>
    <label class="field"><span>Futbolcu adı</span><input id="player-name" maxlength="28" placeholder="Ad Soyad" value="${esc(draft.name)}"></label>
    <div class="field-row"><label class="field"><span>Yaş</span><select id="player-age">${[16,17,18,19,20].map(n=>`<option ${n===draft.age?"selected":""}>${n}</option>`).join("")}</select></label><label class="field"><span>Baskın ayak</span><select id="player-foot"><option ${draft.foot==="Sağ"?"selected":""}>Sağ</option><option ${draft.foot==="Sol"?"selected":""}>Sol</option></select></label></div>
    <label class="field"><span>Pozisyon</span><div class="position-grid">${Object.entries(POSITIONS).map(([id,name])=>`<button type="button" data-position="${id}" class="${draft.position===id?"selected":""}"><b>${id}</b><small>${name}</small></button>`).join("")}</div></label>` :
  creationStep===2 ? `<header><span>OYUN KİMLİĞİ</span><h2>Nasıl hatırlanacaksın?</h2><p>Oyun tarzın başlangıç özelliklerini ve gelişim yolunu belirler.</p></header><div class="choice-list">${Object.entries(ARCHETYPES).map(([id,a])=>`<button type="button" data-archetype="${id}" class="${draft.archetype===id?"selected":""}"><i></i><span><b>${a.name}</b><small>${a.text}</small></span><em>+21</em></button>`).join("")}</div>` :
  `<header><span>İLK SÖZLEŞME</span><h2>Doğru başlangıcı seç</h2><p>Her kulüp farklı bir kariyer riski ve gelişim fırsatı sunar.</p></header><div class="choice-list club-choices">${CLUBS.slice(0,3).map(c=>`<button type="button" data-club="${c.id}" class="${draft.clubId===c.id?"selected":""}">${mark(c.id,true)}<span><b>${c.name}</b><small>${c.city} · Gelişim ${c.dev}</small><p>${c.text}</p></span><em>${money(c.salary)}</em></button>`).join("")}</div>`;
  document.querySelector("#app").innerHTML=`<main class="creation-shell"><section class="brand"><span>PLAYER CAREER</span><h1>BE A<br><em>LEGEND</em></h1><p>Kader verilmez. Her gün yeniden kazanılır.</p></section><section class="creation-card"><div class="step-head"><div><span>KARİYER OLUŞTUR</span><b>${creationStep}/3</b></div><i><em style="width:${creationStep*33.34}%"></em></i></div><div class="form-step">${content}</div><footer>${creationStep>1?`<button class="button ghost" data-action="back">Geri</button>`:""}<button class="button primary" data-action="${creationStep===3?"create":"next"}" ${creationStep===1&&!draft.name.trim()?"disabled":""}>${creationStep===3?"Kariyeri başlat":"Devam et"} <span>→</span></button></footer></section></main>`;
}

function topbar(){return `<header class="topbar"><div class="mini-brand">BAL<span>.</span></div><div class="date"><span>${state.season} SEZONU</span><b>${dateLabel()}</b></div><button class="wallet-pill" data-sheet="shop"><span>CÜZDAN</span><b>${money(state.finances.balance)}</b></button>${mark(state.clubId,true)}</header>`}
const NAV=[["today","⌂","Bugün"],["career","▥","Kariyer"],["social","♡","Sosyal"],["player","◉","Oyuncu"]];
function nav(mobile=false){return `<nav class="${mobile?"bottom-nav":"rail-nav"}">${NAV.map(([id,icon,label])=>`<button data-tab="${id}" class="${tab===id?"active":""}"><i>${icon}</i><span>${label}</span>${id==="today"&&state.daysToMatch===0?"<em></em>":""}</button>`).join("")}</nav>`}

function renderToday(){
  const c=club(state.clubId), opponent=CLUBS.find(x=>x.id!==c.id), ready=state.daysToMatch===0;
  const firstName=esc(state.player.name.split(" ")[0]),goal=DAILY_GOALS[state.dailyGoal.type],level=levelInfo();
  return `<div class="day-screen">
    ${toast?`<div class="game-toast"><i>✓</i><span>${toast}</span></div>`:""}
    <section class="day-hud">
      <div class="hud-identity"><span>GÜN ${state.day} · ${ready?"MAÇ GÜNÜ":"GÜNLÜK PLAN"}</span><h1>${ready?"Hazır mısın,":"Bugün senin,"}<br><em>${firstName}?</em></h1><small>#${state.player.number} · ${state.player.position} · ${c.short}</small></div>
      <div class="hud-ratings">
        <button class="overall-chip" data-sheet="progression"><span>OVERALL</span><b>${state.player.overall}</b><small>SV ${level.level} · DETAY →</small></button>
        <aside class="action-chip"><span>AKSİYON</span><b>${ready?"!":state.actionsLeft}</b><small>${ready?"MAÇ":"/ 2"}</small></aside>
      </div>
    </section>
    <section class="vitals">${meter("Enerji",state.energy)}${meter("Moral",state.morale,"cyan")}${meter("Form",state.form,"orange")}</section>
    <section class="week-strip">${weekDays().map(day=>`<div class="${day.index===0?"today":""} ${day.match?"match":""}"><span>${day.label}</span><b>${day.number}</b><i>${day.match?"●":""}</i></div>`).join("")}</section>
    ${ready?`<section class="match-mission"><div class="mission-label"><i></i><span>ANA GÖREV</span><em>${squad()}</em></div><div class="mini-fixture"><aside>${mark(c.id,true)}<b>${c.short}</b></aside><strong>20:45</strong><aside>${mark(opponent.id,true)}<b>${opponent.short}</b></aside></div><p>Üç kritik anda vereceğin kararlar maç puanını ve teknik direktör güvenini belirleyecek.</p></section>`:
    `<section class="day-actions">
      <button data-sheet="training" class="${state.dayActions.training?"completed":""}" ${state.actionsLeft===0&&!state.dayActions.training?"disabled":""}><i>↗</i><span><b>Antrenman</b><small>${state.dayActions.training?"Tamamlandı":"Gelişim + güven"}</small></span><em>${state.dayActions.training?"✓":"1 AP"}</em></button>
      <button data-sheet="social" class="${state.dayActions.social?"completed":""}" ${state.actionsLeft===0&&!state.dayActions.social?"disabled":""}><i>♡</i><span><b>Sosyal yaşam</b><small>${state.dayActions.social?"Tamamlandı":"Moral + ilişkiler"}</small></span><em>${state.dayActions.social?"✓":"1 AP"}</em></button>
      <button data-sheet="recovery" class="${state.dayActions.recovery?"completed":""}" ${state.actionsLeft===0||state.dayActions.recovery?"disabled":""}><i>◌</i><span><b>Toparlanma</b><small>${state.dayActions.recovery?"Tamamlandı":"Enerji + stres"}</small></span><em>${state.dayActions.recovery?"✓":"1 AP"}</em></button>
      <button data-sheet="briefing"><i>⌘</i><span><b>Maç brifingi</b><small>${state.daysToMatch} gün kaldı</small></span><em>ÜCRETSİZ</em></button>
    </section>`}
    <section class="day-brief">
      <div class="goal-brief"><span>${state.dailyGoal.completed?"GÜNLÜK HEDEF TAMAM":"GÜNLÜK HEDEF"}</span><b>${state.dailyGoal.completed?"+"+goal.reward:goal.text}</b></div>
      <div><span>SERİ · KADRO</span><b>${state.professionalStreak} gün · ${squad()}</b></div>
      <button data-sheet="progression" aria-label="Gelişimi aç">${state.dailyGoal.completed?"✓":"→"}</button>
    </section>
    <div class="day-cta-space"></div>
    <section class="day-cta"><button class="button primary" data-action="${ready?"open-match":"advance"}">${ready?"MAÇA ÇIK":"GÜNÜ BİTİR"}<span>${ready?"→":"＋1 GÜN"}</span></button></section>
  </div>`;
}

function renderTraining(){
  return `<div class="stack">${heading("ANTRENMAN MERKEZİ",'Bugünün <em>işi.</em>',"Yükü doğru yönet. Düşük enerji, gelişimi ve maç performansını sınırlar.")}
  <section class="panel readiness"><aside><span>HAZIRLIK</span><b>${Math.round((state.energy+state.fitness+state.form)/3)}</b><small>/100</small></aside><div>${meter("Enerji",state.energy)}${meter("Maç kondisyonu",state.fitness,"cyan")}${meter("Form",state.form,"orange")}</div></section>
  ${state.trainedToday?`<div class="status"><i>✓</i><div><b>Günlük çalışma tamamlandı</b><p>Yeni bir çalışma için sonraki güne geçmelisin.</p></div></div>`:""}
  <section class="actions">${Object.entries(TRAINING).map(([id,t])=>`<button data-training="${id}" ${state.trainedToday?"disabled":""}><i>${t.icon}</i><span><b>${t.name}</b><small>${t.caption}</small></span><em class="${id==="recovery"?"positive":""}">${id==="recovery"?"+30":"-"+t.energy} EN</em><strong>→</strong></button>`).join("")}</section>
  <section class="coach"><i>TD</i><div><span>TEKNİK DİREKTÖR NOTU</span><p>“Formayı antrenmanda kazanırsın. Güven seviyen şu an <b>${Math.round(state.coachTrust)}</b>; ${state.coachTrust>=70?"seni ilk 11 için ciddi biçimde düşünüyorum.":"istikrar göstermeye devam et."}”</p></div></section></div>`;
}

function renderSocial(){
  const s=state.social;
  return `<div class="social-screen">${heading("SOSYAL YAŞAM",'Saha dışında <em>sen.</em>',"İlişkiler moralini, stresini ve sahadaki karar kaliteni etkiler.")}
    <button class="lifestyle-wallet" data-sheet="shop"><div><span>YAŞAM TARZI</span><b>${money(state.finances.balance)}</b><small>${Object.keys(state.inventory).length} farklı eşya · Maaşa ${Math.max(0,state.finances.nextPayDay-state.day)} gün</small></div><em>MAĞAZA →</em></button>
    <section class="social-summary"><div><span>MENTAL DENGE</span><b>${Math.round((state.morale+100-s.stress)/2)}</b><small>/100</small></div><aside>${meter("Aile",s.family,"cyan")}${meter("Arkadaşlar",s.friends)}${meter("Stres",s.stress,"orange")}</aside></section>
    <section class="relationship-list">
      <article><i>⌂</i><div><b>Aile</b><span>Son görüşme: ${state.dayActions.social?"bugün":"4 gün önce"}</span></div><em>${Math.round(s.family)}</em></article>
      <article><i>♧</i><div><b>Arkadaş çevresi</b><span>Çevren seni dışarı çağırıyor</span></div><em>${Math.round(s.friends)}</em></article>
      <article class="locked"><i>♡</i><div><b>Partner</b><span>Kariyer ilerledikçe açılır</span></div><em>—</em></article>
    </section>
    <button class="button primary wide social-quick" data-sheet="social" ${state.actionsLeft===0||state.dayActions.social?"disabled":""}>Bugün sosyal plan yap <span>1 AP</span></button>
  </div>`;
}

function renderSheet(){
  if(!sheet)return "";
  let title="",subtitle="",content="";
  if(sheet==="training"){
    title="Antrenman seç";subtitle="Bir çalışma seç, sonucu gör ve güne otomatik dön.";
    content=`<div class="sheet-options">${Object.entries(TRAINING).filter(([id])=>id!=="recovery").map(([id,t])=>`<button data-training="${id}" ${state.dayActions.training?"disabled":""}><i>${t.icon}</i><span><b>${t.name}</b><small>${t.caption}</small></span><em>-${t.energy} EN</em></button>`).join("")}</div>`;
  }else if(sheet==="social"){
    title="Sosyal plan";subtitle="Saha dışındaki seçimin moral ve ilişkilerini değiştirir.";
    content=`<div class="sheet-options">${Object.entries(SOCIAL_ACTIVITIES).map(([id,a])=>{const locked=a.requires&&state.reputation<a.requires;return `<button data-social="${id}" ${locked?"disabled":""}><i>${a.icon}</i><span><b>${a.name}</b><small>${locked?`İtibar ${a.requires} gerekli`:a.detail}</small></span><em>${a.energy>0?"+":""}${a.energy} EN</em></button>`}).join("")}</div>`;
  }else if(sheet==="recovery"){
    title="Toparlanma";subtitle="Günün bir aksiyonunu vücuduna ve zihnine ayır.";
    const consumables=Object.entries(SHOP_ITEMS).filter(([id,item])=>item.consumable&&state.inventory[id]);
    content=`<div class="recovery-focus"><i>◌</i><b>Aktif toparlanma</b><p>+30 enerji · -10 stres · +4 moral</p><button class="button primary wide" data-action="recover" ${state.actionsLeft<=0?"disabled":""}>Toparlanmayı başlat <span>1 AP</span></button>${consumables.map(([id,item])=>`<button class="button secondary wide recovery-item" data-use-item="${id}">${item.name} kullan <span>x${state.inventory[id]}</span></button>`).join("")}</div>`;
  }else if(sheet==="shop"){
    title="Mağaza";subtitle=`Bakiye ${money(state.finances.balance)} · Alışveriş aksiyon puanı harcamaz.`;
    const products=Object.entries(SHOP_ITEMS).filter(([,item])=>shopCategory==="TÜMÜ"||item.category===shopCategory);
    content=`<div class="shop-filters">${SHOP_CATEGORIES.map(category=>`<button data-shop-category="${category}" class="${shopCategory===category?"active":""}">${category}</button>`).join("")}</div><div class="shop-list">${products.map(([id,item])=>{const owned=state.inventory[id]||0, sold=!item.repeatable&&owned, locked=item.reputation&&state.reputation<item.reputation, unavailable=sold||locked||state.finances.balance<item.price;return `<button data-buy="${id}" ${unavailable?"disabled":""}><i>${item.icon}</i><span><small>${item.category}</small><b>${item.name}</b><p>${locked?`İtibar ${item.reputation} gerekli`:item.effect}</p></span><em>${sold?"ALINDI":money(item.price)}</em>${item.repeatable&&owned?`<strong>x${owned}</strong>`:""}</button>`}).join("")}</div>`;
  }else if(sheet==="progression"){
    const level=levelInfo(),attributes=Object.entries(state.player.attributes).sort((a,b)=>b[1]-a[1]).slice(0,3);
    title="Oyuncu gelişimi";subtitle="Overall, seviye ve profesyonel formunun tek görünümü.";
    content=`<div class="progression-sheet"><section class="progression-hero"><div><span>OVERALL</span><b>${state.player.overall}</b><small>POTANSİYEL ${state.player.potential}</small></div><aside><span>SEVİYE ${level.level}</span><b>${level.progress} / ${level.next} XP</b><i><em style="width:${level.progress}%"></em></i><p>${state.professionalStreak} günlük profesyonel seri</p></aside></section><section class="progression-stats"><div><span>FORM</span><b>${Math.round(state.form)}</b></div><div><span>TD GÜVENİ</span><b>${Math.round(state.coachTrust)}</b></div><div><span>İTİBAR</span><b>${Math.round(state.reputation)}</b></div></section><section class="top-attributes"><span>EN GÜÇLÜ ÖZELLİKLER</span>${attributes.map(([key,value])=>`<div><b>${key.toLocaleUpperCase("tr-TR")}</b><em>${Math.round(value)}</em><i><small style="width:${value}%"></small></i></div>`).join("")}</section></div>`;
  }else{
    const briefing=BRIEFINGS[(state.day+state.daysToMatch)%BRIEFINGS.length];
    title="Maç brifingi";subtitle=`${state.daysToMatch} gün sonra oynanacak maç için teknik ekip raporu.`;
    content=`<div class="briefing-card"><span>RAKİP PLANI</span><h3>${briefing.title}</h3><p>${briefing.text}</p><div><b>Tempo</b><em>${briefing.tempo}</em><b>Risk</b><em>${briefing.risk}</em></div></div>`;
  }
  return `<div class="sheet-backdrop" data-action="close-sheet"></div><section class="action-sheet"><header><div><span>GÜNLÜK AKSİYON</span><h2>${title}</h2><p>${subtitle}</p></div><button data-action="close-sheet" aria-label="Kapat">×</button></header>${content}</section>`;
}

function matchMoments(defensive){
  const atk=[
    [11,"Ön direkte boşluk","Kanattan gelen sert top savunmanın önünden geçiyor. Tek dokunuşluk bir fırsat doğdu.",[["Ön direkte bitir","Refleks ve şut","shooting","composure",59,"goal"],["Topu arkaya aşır","Görüş ve teknik","vision","technique",55,"assist"],["Penaltı noktasına çıkar","Düşük riskli pas","passing","decisions",41,"assist"]]],
    [18,"Savunma çizgisi bozuldu","Topu sol iç koridorda aldın. Önünde bir stoper, sağında koşu yapan takım arkadaşın var.",[["Ara pası","Yüksek görüş, orta risk","vision","passing",58,"assist"],["İçeri kat et","Tekniğine güven","technique","pace",64,"goal"],["Topu sakla","Güvenli, takım odaklı","strength","decisions",38,"assist"]]],
    [37,"İkinci top önünde","Rakip ceza sahası dışında topu uzaklaştıramadı. Şut yolu açık fakat takım arkadaşların da hareketli.",[["Uzaktan vur","Şut ve soğukkanlılık","shooting","composure",63,"goal"],["Kanada aktar","Pas ve görüş","passing","vision",44,"assist"],["Teması al","Güç ve karar","strength","decisions",52,"goal"]]],
    [54,"Ceza sahasında yarım metre","Orta sekti ve top önüne düştü. Kaleci açıyı kapatıyor, savunma yaklaşıyor.",[["Köşeye sert vur","Şut gücü ve teknik","shooting","technique",57,"goal"],["Kaleciyi bekle","Soğukkanlı ama riskli","composure","decisions",66,"goal"],["Geriden gelene bırak","Akıllı ve düşük risk","vision","passing",42,"assist"]]],
    [71,"Kaleciyle karşı karşıya","Savunma arkasına sarktın. Kaleci hızla çıkıyor, arkadan baskı yaklaşıyor.",[["Aşırtma dene","Teknik ve soğukkanlılık","technique","composure",68,"goal"],["Kaleciyi geç","Hız ve teknik","pace","technique",64,"goal"],["Yanındakine bırak","Garantici asist","vision","passing",45,"assist"]]],
    [86,"Son bölüm, skor dengede","Rakip yoruldu. Çizgide boşluk var fakat top kaybı kontra atağa dönüşebilir.",[["Boşluğa patla","Enerji ve hız testi","pace","stamina",61,"goal"],["Duvar pası","Takım oyunu","passing","decisions",49,"assist"],["Tempoyu düşür","Skoru ve topu koru","decisions","composure",34,"assist"]]]
  ];
  const def=[
    [9,"Erken baskı altında","Rakip forvet sırtı dönük top aldı. Orta saha henüz yerleşmedi ve temas mesafesindesin.",[["Sert karşıla","Güç ve savunma","strength","defending",55,"defend"],["Pas kanalını kapat","Karar ve görüş","decisions","vision",43,"defend"],["Geri çekil","Hız ve pozisyon","pace","decisions",38,"defend"]]],
    [21,"Rakip geçişe çıktı","Forvet hızla üzerine geliyor. Arkanda geniş alan, yanında kademe var.",[["Öne çık","Topu erken kazan","defending","decisions",61,"defend"],["Geciktir","Alanı daralt","decisions","pace",43,"defend"],["Teması kur","Fiziksel müdahale","strength","defending",55,"defend"]]],
    [42,"Ceza yayı karıştı","Seken top iki rakibin arasında kaldı. Bir anlık tereddüt şut fırsatı yaratabilir.",[["Topa hamle yap","Savunma ve hız","defending","pace",58,"defend"],["Alanı süpür","Karar ve görüş","decisions","vision",46,"defend"],["Rakibi perdele","Güç ve soğukkanlılık","strength","composure",49,"defend"]]],
    [59,"Tehlikeli yan top","Top arka direğe süzülüyor. Rakibin koşusu güçlü, kaleci kararsız.",[["Topa saldır","Güçlü ve kararlı","strength","defending",54,"defend"],["Adamı takip et","Pozisyon disiplini","decisions","stamina",42,"defend"],["Topu indir ve çık","Riskli kontra","technique","vision",68,"assist"]]],
    [74,"Çizgide ikiye bir","Rakip kanatta sayısal üstünlük kurdu. Ortayı engellemek ile koşuyu takip etmek arasında karar vermelisin.",[["Top sahibine bas","Hız ve savunma","pace","defending",61,"defend"],["Koşuyu devral","Karar ve dayanıklılık","decisions","stamina",45,"defend"],["Ortayı blokla","Savunma ve soğukkanlılık","defending","composure",50,"defend"]]],
    [87,"Son savunma","Ceza yayı üzerinde şut açısı doğdu. Müdahalen sonucu belirleyebilir.",[["Şut kanalını kapat","Güvenli savunma","defending","composure",46,"defend"],["Kayarak müdahale","Yüksek risk, büyük ödül","defending","decisions",69,"defend"],["Şuta zorla","Ayakta kal","pace","stamina",51,"defend"]]]
  ];
  const pool=[...(defensive?def:atk)], selected=[];
  while(selected.length<3)selected.push(pool.splice(Math.floor(Math.random()*pool.length),1)[0]);
  return selected.sort((a,b)=>a[0]-b[0]).map(x=>({minute:x[0],title:x[1],description:x[2],choices:x[3].map((c,i)=>({id:i,label:c[0],detail:c[1],primary:c[2],secondary:c[3],risk:c[4],kind:c[5]}))}));
}

function startMatch(){
  const rivals=CLUBS.filter(c=>c.id!==state.clubId), opponent=rivals[Math.floor(Math.random()*rivals.length)];
  match={opponentId:opponent.id,scoreFor:0,scoreAgainst:Math.random()>.58?1:0,rating:6.2,index:0,moments:matchMoments(["CB","DM","LB","RB","GK"].includes(state.player.position)),events:[],goals:0,assists:0,completed:false};
  render();
}

function resolveChoice(choiceIndex){
  if(!match||match.resolving)return null;
  match.resolving=true;
  const moment=match.moments[match.index], c=moment.choices[choiceIndex], a=state.player.attributes;
  const skill=a[c.primary]*.62+a[c.secondary]*.28+state.energy*.12+state.form*.08+state.morale*.05, roll=Math.random()*100, success=roll+skill*.5>c.risk+29;
  let event,outcome="success";
  if(success){
    match.rating+=.65;
    if(c.kind==="goal"&&Math.random()>.38){match.scoreFor++;match.goals++;match.rating+=.55;outcome="goal";event=`${moment.minute}' GOL! Kararın kusursuz sonuç verdi.`}
    else if(c.kind==="assist"&&Math.random()>.38){match.scoreFor++;match.assists++;match.rating+=.35;outcome="assist";event=`${moment.minute}' Asist! Hücum senin kararınla sonuçlandı.`}
    else {outcome=c.kind==="defend"?"defend":"success";event=`${moment.minute}' Doğru karar; pozisyonu takımın lehine çevirdin.`}
  } else {
    match.rating-=c.risk>60?.38:.22;outcome="miss";
    if(c.kind==="defend"&&Math.random()>.5){match.scoreAgainst++;match.rating-=.35;outcome="conceded";event=`${moment.minute}' Müdahale geç kaldı ve rakip cezayı kesti.`}
    else event=`${moment.minute}' Fikir doğruydu ama uygulama başarısız.`;
  }
  match.rating=clamp(Number(match.rating.toFixed(1)),4,10);match.events.push(event);match.index++;match.completed=match.index>=match.moments.length;if(match.completed&&Math.random()>.55)match.scoreAgainst++;
  return {success,outcome,event,kind:c.kind,minute:moment.minute};
}
function selectTactic(choiceIndex){
  if(!match||match.resolving)return;
  if(matchEngine){matchEngine.setTactic(choiceIndex);haptic(8);return}
  const outcome=resolveChoice(choiceIndex);if(outcome){match.resolving=false;render()}
}

function finishMatch(){
  const appearances=state.appearances+1, avg=(state.averageRating*state.appearances+match.rating)/appearances, c=club(state.clubId), o=club(match.opponentId), won=match.scoreFor>match.scoreAgainst;
  Object.assign(state,{energy:clamp(state.energy-32),fitness:clamp(state.fitness-9),morale:clamp(state.morale+(won?6:match.scoreFor===match.scoreAgainst?1:-4)),form:clamp(state.form+(match.rating>=7?5:match.rating<6?-4:1)),coachTrust:clamp(state.coachTrust+(match.rating>=7?4:match.rating<6?-2:1)),reputation:clamp(state.reputation+Math.max(1,match.rating-5)),appearances,goals:state.goals+match.goals,assists:state.assists+match.assists,averageRating:Number(avg.toFixed(2)),lastRating:match.rating,daysToMatch:5,trainedToday:true,actionsLeft:0});
  state.logs.unshift({id:uid(),type:"match",title:`${c.short} ${match.scoreFor}–${match.scoreAgainst} ${o.short}`,detail:`${match.rating.toFixed(1)} puan · ${match.goals} gol · ${match.assists} asist`,date:"Bugün"});
  const goalReward=completeDailyGoal("match");haptic([18,35,24]);
  if(!state.offer&&appearances>=3&&avg>=7&&Math.random()>.55){const targets=CLUBS.filter(x=>x.id!==c.id&&x.level>=c.level),t=targets[Math.floor(Math.random()*targets.length)];if(t)state.offer={clubId:t.id,salary:Math.round(t.salary*(1.15+state.reputation/100)),years:4,role:t.level>c.level?"Rotasyon oyuncusu":"İlk 11 oyuncusu"}}
  match=null;tab="today";toast=`Maç tamamlandı · ${state.lastRating.toFixed(1)} puan${goalReward}`;save();render();
}

function renderMatch(){
  if(state.daysToMatch>0&&!match)return `<div class="stack">${heading("MAÇ MERKEZİ",`Sıradaki sınav <em>${state.daysToMatch} gün sonra.</em>`,"Hazırlığını tamamla. Maç günü geldiğinde kritik anları sen yöneteceksin.")}<section class="locked-match">${mark(state.clubId)}<span>HAZIRLANIYOR</span><b>${club(state.clubId).name}</b><p>Enerji ${Math.round(state.energy)} · Form ${Math.round(state.form)} · ${squad()}</p></section></div>`;
  if(!match)return `<div class="match-command"><section><span>MAÇ GÜNÜ · 20:45</span><h1>Hazırsın.<br><em>Sahne senin.</em></h1><p>Üç kritik pozisyon. Her rota özelliklerin, enerjin ve seçtiğin risk üzerinden çözülecek.</p><div class="match-command-stats"><div><small>KADRO</small><b>${squad()}</b></div><div><small>ENERJİ</small><b>${Math.round(state.energy)}</b></div><div><small>FORM</small><b>${Math.round(state.form)}</b></div></div><button class="button primary wide" data-action="start-match">MAÇI BAŞLAT <span>→</span></button></section></div>`;
  const c=club(state.clubId),o=club(match.opponentId);
  if(match.completed)return `<div class="compact-result"><section class="result"><span>MAÇ SONU</span><div><aside>${mark(c.id)}<b>${c.short}</b></aside><strong>${match.scoreFor}<i>–</i>${match.scoreAgainst}</strong><aside>${mark(o.id)}<b>${o.short}</b></aside></div><small>MAÇ PUANI</small><em>${match.rating.toFixed(1)}</em></section><section class="match-stats"><div><span>Gol</span><b>${match.goals}</b></div><div><span>Asist</span><b>${match.assists}</b></div><div><span>Kritik karar</span><b>3</b></div></section><section class="event-log">${match.events.map(e=>`<p>${e}</p>`).join("")}</section><button class="button primary wide" data-action="finish-match">SOYUNMA ODASINA DÖN <span>→</span></button></div>`;
  const m=match.moments[match.index];
  return `<div class="match-live"><section class="match-scorebar"><div>${mark(c.id,true)}<b>${c.short}</b></div><strong>${match.scoreFor}<i>–</i>${match.scoreAgainst}</strong><div>${mark(o.id,true)}<b>${o.short}</b></div><em>CANLI</em></section><section class="match-stage"><div id="match-engine"><div class="engine-status"><i></i><span>WEBGL SAHA HAZIRLANIYOR</span></div></div><div class="stage-hud"><span>${m.minute}'</span><b>${match.rating.toFixed(1)}<small>PUAN</small></b></div><div class="interaction-prompt">Önce aşağıdan taktiğini seç</div></section><section class="match-decision"><header><span>KRİTİK AN ${match.index+1}/3</span><em>Taktik seç → sahada uygula</em></header><h2>${m.title}</h2><p>${m.description}</p><div class="decision-grid">${m.choices.map((choice,index)=>`<button data-tactic="${index}"><i>0${index+1}</i><span><b>${choice.label}</b><small>${choice.detail}</small></span><em style="--risk:${choice.risk}%"><small>RİSK ${choice.risk}</small><i><b></b></i></em></button>`).join("")}</div></section></div>`;
}

function renderCareer(){
  const c=club(state.clubId), offer=state.offer?club(state.offer.clubId):null;
  return `<div class="stack">${heading("KARİYER",'İzini <em>bırak.</em>',"Performansın, güvenin ve sözleşmen kariyer yolunu birlikte şekillendirir.")}
  ${offer?`<section class="panel offer"><span>RESMİ TRANSFER TEKLİFİ</span><div class="offer-club">${mark(offer.id)}<div><b>${offer.name}</b><small>${offer.city} · ${state.offer.role}</small></div></div><div class="terms"><div><span>Aylık maaş</span><b>${money(state.offer.salary)}</b></div><div><span>Süre</span><b>${state.offer.years} yıl</b></div></div><footer><button class="button ghost" data-offer="reject">Reddet</button><button class="button primary" data-offer="accept">Kabul et</button></footer></section>`:""}
  <section class="panel contract"><div class="contract-head">${mark(c.id)}<div><span>MEVCUT SÖZLEŞME</span><h2>${c.name}</h2><p>${state.contract.role}</p></div></div><div class="terms"><div><span>Aylık</span><b>${money(state.contract.salary)}</b></div><div><span>Kalan süre</span><b>${state.contract.yearsLeft} yıl</b></div><div><span>Kadro</span><b>${squad()}</b></div><div><span>İtibar</span><b>${Math.round(state.reputation)}/100</b></div></div></section>
  <section class="panel"><div class="section-title"><div><span>SEZON İSTATİSTİKLERİ</span><h2>${state.season}</h2></div></div><div class="stats"><div><b>${state.appearances}</b><span>Maç</span></div><div><b>${state.goals}</b><span>Gol</span></div><div><b>${state.assists}</b><span>Asist</span></div><div><b>${state.averageRating||"–"}</b><span>Ort. puan</span></div></div></section>
  <section class="panel trust"><div><span>TEKNİK DİREKTÖR GÜVENİ</span><b>${Math.round(state.coachTrust)}<small>/100</small></b></div>${meter(squad(),state.coachTrust)}<p>Antrenman disiplini ve maç kararları güveni doğrudan etkiler.</p></section></div>`;
}

function renderPlayer(){
  const a=state.player.attributes, rows={Hız:a.pace,Şut:a.shooting,Pas:a.passing,Teknik:a.technique,Savunma:a.defending,Fizik:a.strength,Dayanıklılık:a.stamina,"Oyun görüşü":a.vision,Karar:a.decisions,Soğukkanlılık:a.composure};
  return `<div class="stack"><section class="profile"><div class="shirt"><span>${esc(state.player.name.split(" ").at(-1).toUpperCase())}</span><b>${state.player.number}</b><i>${state.player.position}</i></div><div><span>OYUNCU PROFİLİ</span><h1>${esc(state.player.name)}</h1><p>${state.player.age} yaş · ${POSITIONS[state.player.position]} · ${state.player.foot} ayak</p><aside><b>${state.player.overall}</b><span>GENEL<br>POT. ${state.player.potential}</span></aside></div></section><section class="panel"><div class="section-title"><div><span>OYUNCU ÖZELLİKLERİ</span><h2>${ARCHETYPES[state.player.archetype].name}</h2></div><b>${state.xp} XP</b></div><div class="attributes">${Object.entries(rows).map(([k,v])=>`<div><span>${k}</span><b class="${v>=70?"elite":""}">${Math.round(v)}</b><i><em style="width:${v}%"></em></i></div>`).join("")}</div></section><section class="panel save-card"><div><span>OTOMATİK KAYIT</span><b>Kariyer güvende</b><p>Her kararın bu cihazda anında saklanır.</p></div><i>✓</i></section><button class="danger" data-action="reset">Yeni kariyer başlat</button></div>`;
}

function render(){
  destroyMatchEngine();
  if(!state){renderCreation();return}
  migrate();
  const c=club(state.clubId);document.documentElement.style.setProperty("--accent","#6D9C79");
  const screen=tab==="today"?renderToday():tab==="match"?renderMatch():tab==="career"?renderCareer():tab==="social"?renderSocial():renderPlayer();
  document.querySelector("#app").innerHTML=`<main class="game-shell ${tab==="match"?"match-mode":""}"><aside class="rail"><h1>BE A<br><em>LEGEND</em></h1><p>Futbolcu kariyer simülasyonu</p><div class="rail-player">${mark(c.id)}<span><b>${esc(state.player.name)}</b><small>${c.name}</small></span></div>${nav()}<small>FAZ 4 · PLAYER EXPERIENCE</small></aside><section class="phone">${topbar()}<div class="content">${screen}</div>${nav(true)}${renderSheet()}</section></main>`;
  if(tab==="match"&&match&&!match.completed)queueMicrotask(mountMatchEngine);
}

function train(id){
  if(state.dayActions.training||state.actionsLeft<=0)return;const t=TRAINING[id],c=club(state.clubId),a=state.player.attributes;
  const homeBonus=state.inventory.homegym&&["physical","speed","strength"].includes(id)?1.1:1;
  Object.entries(t.gains).forEach(([k,g])=>a[k]=clamp(Number((a[k]+g*c.dev/75*homeBonus).toFixed(2))));
  state.energy=clamp(state.energy-t.energy);state.morale=clamp(state.morale+t.morale);state.fitness=clamp(state.fitness-t.energy*.08);state.coachTrust=clamp(state.coachTrust+1.6+(state.inventory.gps?.4:0));state.xp+=14;state.trainedToday=true;state.dayActions.training=true;state.actionsLeft--;state.player.overall=overall(a,state.player.position);state.logs.unshift({id:uid(),type:"training",title:`${t.name} tamamlandı`,detail:"Teknik ekip çalışma disiplininden memnun.",date:"Bugün"});const goalReward=completeDailyGoal("training");haptic();sheet=null;tab="today";toast=`${t.name} tamamlandı · +14 XP${goalReward}`;save();render();
}
function applyEffects(effects={}){
  const a=state.player.attributes;
  Object.entries(effects).forEach(([key,value])=>{
    if(key==="stress"||key==="family"||key==="friends")state.social[key]=clamp(state.social[key]+value);
    else if(key==="reputation")state.reputation=clamp(state.reputation+value);
    else if(key==="trust")state.coachTrust=clamp(state.coachTrust+value);
    else if(key in a)a[key]=clamp(a[key]+value);
    else if(key in state)state[key]=clamp(state[key]+value);
  });
  state.player.overall=overall(a,state.player.position);
}
function completeDailyGoal(type){
  if(!state.dailyGoal||state.dailyGoal.completed||state.dailyGoal.type!==type)return "";
  const goal=DAILY_GOALS[type];state.dailyGoal.completed=true;state.professionalStreak++;state.xp+=goal.xp;
  applyEffects({trust:goal.trust||0,morale:goal.morale||0,form:goal.form||0,reputation:goal.reputation||0});
  state.logs.unshift({id:uid(),type:"goal",title:`Hedef tamamlandı: ${goal.title}`,detail:goal.reward,date:"Bugün"});
  return ` · Hedef tamam +${goal.xp} XP`;
}
function socialAction(id){
  if(state.dayActions.social||state.actionsLeft<=0)return;
  const activity=SOCIAL_ACTIVITIES[id];if(!activity||(activity.requires&&state.reputation<activity.requires))return;
  const effects={energy:activity.energy,morale:activity.morale,family:activity.family,friends:activity.friends,stress:activity.stress,trust:activity.trust||0,reputation:activity.reputation||0};
  if(id==="gaming"&&state.inventory.console){effects.morale+=3;effects.stress-=3}
  if(id==="family"&&state.inventory.penthouse)effects.family+=3;
  applyEffects(effects);state.dayActions.social=true;state.actionsLeft--;state.logs.unshift({id:uid(),type:"social",title:activity.name,detail:`Moral ${effects.morale>=0?"+":""}${effects.morale} · Stres ${effects.stress}`,date:"Bugün"});const goalReward=completeDailyGoal("social");haptic();sheet=null;tab="today";toast=`${activity.name} · Moral +${effects.morale}${goalReward}`;save();render();
}
function buyItem(id){
  const item=SHOP_ITEMS[id];if(!item||state.finances.balance<item.price||(!item.repeatable&&state.inventory[id])||(item.reputation&&state.reputation<item.reputation))return;
  state.finances.balance-=item.price;state.finances.totalSpent+=item.price;state.inventory[id]=(state.inventory[id]||0)+1;
  if(!item.consumable)applyEffects(item.effects);
  state.logs.unshift({id:uid(),type:"shopping",title:`${item.name} satın alındı`,detail:`${money(item.price)} · ${item.effect}`,date:"Bugün"});
  toast=`${item.name} satın alındı`;save();render();
}
function useItem(id){
  const item=SHOP_ITEMS[id];if(!item?.consumable||!state.inventory[id])return;
  state.inventory[id]--;if(!state.inventory[id])delete state.inventory[id];
  applyEffects(item.effects);sheet=null;tab="today";toast=`${item.name} kullanıldı · ${item.effect}`;save();render();
}
function recover(){
  if(state.actionsLeft<=0||state.dayActions.recovery)return;
  state.energy=clamp(state.energy+30);state.morale=clamp(state.morale+4);state.fitness=clamp(state.fitness+4);state.social.stress=clamp(state.social.stress-10);state.actionsLeft--;state.dayActions.recovery=true;state.logs.unshift({id:uid(),type:"training",title:"Aktif toparlanma tamamlandı",detail:"Enerji +30 · Stres -10",date:"Bugün"});const goalReward=completeDailyGoal("recovery");haptic();sheet=null;tab="today";toast=`Vücudun ve zihnin toparlandı${goalReward}`;save();render();
}
function advance(){if(state.daysToMatch===0)return;if(!state.dailyGoal.completed)state.professionalStreak=0;state.day++;addCalendarDay();state.energy=clamp(state.energy+(state.trainedToday?13:20)+(state.inventory.sleepkit?4:0));state.morale=clamp(state.morale+(state.energy<35?-2:1));state.fitness=clamp(state.fitness+2+(state.inventory.nutritionist?1:0));state.social.stress=clamp(state.social.stress+2);state.trainedToday=false;state.actionsLeft=2;state.dayActions={training:false,social:false,recovery:false};state.daysToMatch=Math.max(0,state.daysToMatch-1);ensureDailyGoal();let pay="";if(state.day>=state.finances.nextPayDay){const income=Math.round(state.contract.salary/4),expense=1850;state.finances.balance+=income-expense;state.finances.nextPayDay+=7;state.logs.unshift({id:uid(),type:"finance",title:"Haftalık hesap özeti",detail:`Maaş +${money(income)} · Yaşam gideri -${money(expense)}`,date:"Bugün"});pay=` · Hesaba ${money(income-expense)} geçti`}haptic();toast=`Yeni gün başladı · 2 aksiyon hazır${pay}`;save();render()}
function offerDecision(accept){const o=state.offer,c=club(o.clubId);if(accept){state.clubId=c.id;state.coachTrust=45;state.morale=clamp(state.morale+8);state.contract={salary:o.salary,yearsLeft:o.years,role:o.role};state.logs.unshift({id:uid(),type:"club",title:`${c.name} transferi tamamlandı`,detail:"Yeni bir şehir, yeni beklentiler ve yepyeni bir forma mücadelesi.",date:"Bugün"})}else{state.morale=clamp(state.morale+2);state.logs.unshift({id:uid(),type:"club",title:`${c.name} teklifi reddedildi`,detail:"Mevcut kulübünde gelişmeye devam etme kararı aldın.",date:"Bugün"})}state.offer=null;save();render()}

document.addEventListener("input",e=>{if(e.target.id==="player-name"){draft.name=e.target.value;const b=document.querySelector('[data-action="next"]');if(b)b.disabled=!draft.name.trim()}});
document.addEventListener("change",e=>{if(e.target.id==="player-age")draft.age=Number(e.target.value);if(e.target.id==="player-foot")draft.foot=e.target.value});
document.addEventListener("click",e=>{
  if(e.target.closest('[data-action="close-sheet"]')){sheet=null;render();return}
  const b=e.target.closest("button");if(!b)return;
  if(b.dataset.position){draft.position=b.dataset.position;renderCreation()}
  else if(b.dataset.archetype){draft.archetype=b.dataset.archetype;renderCreation()}
  else if(b.dataset.club){draft.clubId=b.dataset.club;renderCreation()}
  else if(b.dataset.tab){tab=b.dataset.tab;sheet=null;render()}
  else if(b.dataset.sheet){sheet=b.dataset.sheet;render()}
  else if(b.dataset.training)train(b.dataset.training);
  else if(b.dataset.social)socialAction(b.dataset.social);
  else if(b.dataset.shopCategory){shopCategory=b.dataset.shopCategory;render()}
  else if(b.dataset.buy)buyItem(b.dataset.buy);
  else if(b.dataset.useItem)useItem(b.dataset.useItem);
  else if(b.dataset.tactic!==undefined)selectTactic(Number(b.dataset.tactic));
  else if(b.dataset.offer)offerDecision(b.dataset.offer==="accept");
  else if(b.dataset.action==="next"){creationStep++;renderCreation()}
  else if(b.dataset.action==="back"){creationStep--;renderCreation()}
  else if(b.dataset.action==="create")createCareer();
  else if(b.dataset.action==="advance")advance();
  else if(b.dataset.action==="recover")recover();
  else if(b.dataset.action==="open-match"){tab="match";toast="";render()}
  else if(b.dataset.action==="start-match")startMatch();
  else if(b.dataset.action==="finish-match")finishMatch();
  else if(b.dataset.action==="reset"&&confirm("Mevcut kariyer silinsin mi?")){localStorage.removeItem(SAVE_KEY);state=null;tab="today";creationStep=1;render()}
});

try{state=JSON.parse(localStorage.getItem(SAVE_KEY))}catch{localStorage.removeItem(SAVE_KEY)}
render();
