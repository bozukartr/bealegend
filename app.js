const SAVE_KEY = "bealegend-career-v1";

const CLUBS = [
  { id:"marmara", name:"Marmara United", short:"MAR", city:"İstanbul", color:"#eaff57", dark:"#171d17", level:74, dev:82, salary:18500, text:"Elit tesis, sert rekabet ve yüksek medya baskısı." },
  { id:"baskent", name:"Başkent 1923", short:"BAS", city:"Ankara", color:"#ff6846", dark:"#201813", level:69, dev:75, salary:14250, text:"Dengeli kadro, sabırlı teknik ekip ve gerçek forma şansı." },
  { id:"ege", name:"Ege Atletik", short:"EGE", city:"İzmir", color:"#70e7ff", dark:"#101d22", level:65, dev:91, salary:11250, text:"Genç oyuncu fabrikası; düşük baskı, hızlı gelişim." },
  { id:"bosphorus", name:"Bosphorus FC", short:"BOS", city:"İstanbul", color:"#8e7dff", dark:"#17142a", level:76, dev:73, salary:21000, text:"Yıldızlarla dolu, şampiyonluk isteyen kulüp." },
  { id:"toros", name:"Toros Gücü", short:"TOR", city:"Adana", color:"#ffcf55", dark:"#241d0d", level:67, dev:70, salary:12800, text:"Fiziksel futbol ve ateşli taraftar." },
  { id:"karadeniz", name:"Karadeniz Rovers", short:"KAR", city:"Trabzon", color:"#ff5f7d", dark:"#271117", level:71, dev:77, salary:15750, text:"Tutkulu şehir, yoğun tempo ve aidiyet." }
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
  recovery:{ name:"Aktif dinlenme", caption:"Enerji, moral ve form", icon:"◌", energy:-30, morale:4, gains:{} }
};

let state = null;
let tab = "today";
let creationStep = 1;
let draft = { name:"", age:17, position:"ST", foot:"Sağ", archetype:"finisher", clubId:"baskent" };
let match = null;
let sheet = null;
let toast = "";

const clamp = (n,min=0,max=100) => Math.max(min,Math.min(max,n));
const club = id => CLUBS.find(c=>c.id===id) || CLUBS[0];
const esc = value => String(value).replace(/[&<>"']/g, m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
const uid = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;
const money = n => `₺${Math.round(n).toLocaleString("tr-TR")}`;

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
  state={version:2,player:{name:draft.name.trim(),age:draft.age,position:draft.position,foot:draft.foot,archetype:draft.archetype,number:Math.floor(Math.random()*40)+11,overall:gen,potential:clamp(gen+24,72,94),attributes:a},clubId:c.id,date:"18 Ağustos 2026",season:"2026/27",day:1,energy:86,morale:72,form:65,fitness:91,coachTrust:48,reputation:12,xp:0,trainedToday:false,actionsLeft:2,dayActions:{training:false,social:false},social:{family:72,friends:64,partner:0,stress:28},daysToMatch:3,appearances:0,starts:0,goals:0,assists:0,averageRating:0,lastRating:null,contract:{salary:c.salary,yearsLeft:3,role:"Gelecek vaat eden oyuncu"},offer:null,logs:[{id:uid(),type:"club",title:`${c.name} kariyerin başladı`,detail:"Teknik ekip senden sabır, disiplin ve istikrarlı gelişim bekliyor.",date:"Bugün"}]};
  save(); render();
}

function save(){ if(state) localStorage.setItem(SAVE_KEY,JSON.stringify(state)); }
function squad(){ return state.coachTrust>=74&&state.form>=62?"İlk 11":state.coachTrust>=51?"Rotasyon":"Yedek"; }
function migrate(){
  if(!state)return;
  if(state.actionsLeft===undefined)state.actionsLeft=2;
  if(!state.dayActions)state.dayActions={training:false,social:false};
  if(!state.social)state.social={family:72,friends:64,partner:0,stress:28};
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

function topbar(){return `<header class="topbar"><div class="mini-brand">BAL<span>.</span></div><div class="date"><span>${state.season} SEZONU</span><b>${state.date}</b></div><button aria-label="Bildirimler" class="bell">⌁<i>2</i></button>${mark(state.clubId,true)}</header>`}
const NAV=[["today","⌂","Bugün"],["career","▥","Kariyer"],["social","♡","Sosyal"],["player","◉","Oyuncu"]];
function nav(mobile=false){return `<nav class="${mobile?"bottom-nav":"rail-nav"}">${NAV.map(([id,icon,label])=>`<button data-tab="${id}" class="${tab===id?"active":""}"><i>${icon}</i><span>${label}</span>${id==="today"&&state.daysToMatch===0?"<em></em>":""}</button>`).join("")}</nav>`}

function renderToday(){
  const c=club(state.clubId), opponent=CLUBS.find(x=>x.id!==c.id), ready=state.daysToMatch===0;
  const firstName=esc(state.player.name.split(" ")[0]);
  return `<div class="day-screen">
    ${toast?`<div class="game-toast"><i>✓</i><span>${toast}</span></div>`:""}
    <section class="day-hud">
      <div><span>GÜN ${state.day} · ${ready?"MAÇ GÜNÜ":"RUTİN"}</span><h1>${ready?"Hazır mısın,":"Bugün senin,"}<br><em>${firstName}?</em></h1></div>
      <aside><span>AKSİYON</span><b>${ready?"!":state.actionsLeft}</b><small>${ready?"MAÇ":"/ 2"}</small></aside>
    </section>
    <section class="vitals">${meter("Enerji",state.energy)}${meter("Moral",state.morale,"cyan")}${meter("Form",state.form,"orange")}</section>
    ${ready?`<section class="match-mission"><div class="mission-label"><i></i><span>ANA GÖREV</span><em>${squad()}</em></div><div class="mini-fixture"><aside>${mark(c.id,true)}<b>${c.short}</b></aside><strong>20:45</strong><aside>${mark(opponent.id,true)}<b>${opponent.short}</b></aside></div><p>Üç kritik anda vereceğin kararlar maç puanını ve teknik direktör güvenini belirleyecek.</p></section>`:
    `<section class="day-actions">
      <button data-sheet="training" class="${state.dayActions.training?"completed":""}" ${state.actionsLeft===0&&!state.dayActions.training?"disabled":""}><i>↗</i><span><b>Antrenman</b><small>${state.dayActions.training?"Tamamlandı":"Gelişim + güven"}</small></span><em>${state.dayActions.training?"✓":"1 AP"}</em></button>
      <button data-sheet="social" class="${state.dayActions.social?"completed":""}" ${state.actionsLeft===0&&!state.dayActions.social?"disabled":""}><i>♡</i><span><b>Sosyal yaşam</b><small>${state.dayActions.social?"Tamamlandı":"Moral + ilişkiler"}</small></span><em>${state.dayActions.social?"✓":"1 AP"}</em></button>
      <button data-sheet="recovery" ${state.actionsLeft===0?"disabled":""}><i>◌</i><span><b>Toparlanma</b><small>Enerji + stres</small></span><em>1 AP</em></button>
      <button data-sheet="briefing"><i>⌘</i><span><b>Maç brifingi</b><small>${state.daysToMatch} gün kaldı</small></span><em>ÜCRETSİZ</em></button>
    </section>`}
    <section class="day-brief">
      <div><span>SIRADAKİ HEDEF</span><b>${ready?"Sahaya çık":state.daysToMatch+" gün sonra maç"}</b></div>
      <div><span>KADRO ROLÜ</span><b>${squad()}</b></div>
      <button data-tab="career" aria-label="Kariyeri aç">→</button>
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
    content=`<div class="sheet-options"><button data-social="family"><i>⌂</i><span><b>Aileyle vakit geçir</b><small>Aile +8 · Moral +5</small></span><em>-8 EN</em></button><button data-social="friends"><i>♧</i><span><b>Arkadaşlarla buluş</b><small>Arkadaş +9 · Moral +7</small></span><em>-14 EN</em></button><button data-social="gaming"><i>◇</i><span><b>Evde oyun gecesi</b><small>Stres -7 · Moral +3</small></span><em>-4 EN</em></button></div>`;
  }else if(sheet==="recovery"){
    title="Toparlanma";subtitle="Günün bir aksiyonunu vücuduna ve zihnine ayır.";
    content=`<div class="recovery-focus"><i>◌</i><b>Aktif toparlanma</b><p>+30 enerji · -10 stres · +4 moral</p><button class="button primary wide" data-action="recover">Toparlanmayı başlat <span>1 AP</span></button></div>`;
  }else{
    title="Maç brifingi";subtitle=`${state.daysToMatch} gün sonra oynanacak maç için teknik ekip raporu.`;
    content=`<div class="briefing-card"><span>RAKİP PLANI</span><h3>Geçişlerde merkez boşalıyor</h3><p>Topu kazandıktan sonraki ilk pasında risk almak hücum oyuncuları için daha yüksek ödül sağlayabilir. Savunmacılar çizgiyi erken terk etmemeli.</p><div><b>Tempo</b><em>Yüksek</em><b>Risk</b><em>Orta</em></div></div>`;
  }
  return `<div class="sheet-backdrop" data-action="close-sheet"></div><section class="action-sheet"><header><div><span>GÜNLÜK AKSİYON</span><h2>${title}</h2><p>${subtitle}</p></div><button data-action="close-sheet" aria-label="Kapat">×</button></header>${content}</section>`;
}

function matchMoments(defensive){
  const atk=[
    [18,"Savunma çizgisi bozuldu","Topu sol iç koridorda aldın. Önünde bir stoper, sağında koşu yapan takım arkadaşın var.",[["Ara pası","Yüksek görüş, orta risk","vision","passing",58,"assist"],["İçeri kat et","Tekniğine güven","technique","pace",64,"goal"],["Topu sakla","Güvenli, takım odaklı","strength","decisions",38,"assist"]]],
    [54,"Ceza sahasında yarım metre","Orta sekti ve top önüne düştü. Kaleci açıyı kapatıyor, savunma yaklaşıyor.",[["Köşeye sert vur","Şut gücü ve teknik","shooting","technique",57,"goal"],["Kaleciyi bekle","Soğukkanlı ama riskli","composure","decisions",66,"goal"],["Geriden gelene bırak","Akıllı ve düşük risk","vision","passing",42,"assist"]]],
    [83,"Son bölüm, skor dengede","Rakip yoruldu. Çizgide boşluk var fakat top kaybı kontra atağa dönüşebilir.",[["Boşluğa patla","Enerji ve hız testi","pace","stamina",61,"goal"],["Duvar pası","Takım oyunu","passing","decisions",49,"assist"],["Tempoyu düşür","Skoru ve topu koru","decisions","composure",34,"assist"]]]
  ];
  const def=[
    [21,"Rakip geçişe çıktı","Forvet hızla üzerine geliyor. Arkanda geniş alan, yanında kademe var.",[["Öne çık","Topu erken kazan","defending","decisions",61,"defend"],["Geciktir","Alanı daralt","decisions","pace",43,"defend"],["Teması kur","Fiziksel müdahale","strength","defending",55,"defend"]]],
    [59,"Tehlikeli yan top","Top arka direğe süzülüyor. Rakibin koşusu güçlü, kaleci kararsız.",[["Topa saldır","Güçlü ve kararlı","strength","defending",54,"defend"],["Adamı takip et","Pozisyon disiplini","decisions","stamina",42,"defend"],["Topu indir ve çık","Riskli kontra","technique","vision",68,"assist"]]],
    [87,"Son savunma","Ceza yayı üzerinde şut açısı doğdu. Müdahalen sonucu belirleyebilir.",[["Şut kanalını kapat","Güvenli savunma","defending","composure",46,"defend"],["Kayarak müdahale","Yüksek risk, büyük ödül","defending","decisions",69,"defend"],["Şuta zorla","Ayakta kal","pace","stamina",51,"defend"]]]
  ];
  return (defensive?def:atk).map(x=>({minute:x[0],title:x[1],description:x[2],choices:x[3].map((c,i)=>({id:i,label:c[0],detail:c[1],primary:c[2],secondary:c[3],risk:c[4],kind:c[5]}))}));
}

function startMatch(){
  const rivals=CLUBS.filter(c=>c.id!==state.clubId), opponent=rivals[Math.floor(Math.random()*rivals.length)];
  match={opponentId:opponent.id,scoreFor:0,scoreAgainst:Math.random()>.58?1:0,rating:6.2,index:0,moments:matchMoments(["CB","DM","LB","RB","GK"].includes(state.player.position)),events:[],goals:0,assists:0,completed:false};
  render();
}

function choose(choiceIndex){
  const moment=match.moments[match.index], c=moment.choices[choiceIndex], a=state.player.attributes;
  const skill=a[c.primary]*.62+a[c.secondary]*.28+state.energy*.12+state.form*.08+state.morale*.05, roll=Math.random()*100, success=roll+skill*.5>c.risk+29;
  let event;
  if(success){
    match.rating+=.65;
    if(c.kind==="goal"&&Math.random()>.38){match.scoreFor++;match.goals++;match.rating+=.55;event=`${moment.minute}' GOL! Kararın kusursuz sonuç verdi.`}
    else if(c.kind==="assist"&&Math.random()>.38){match.scoreFor++;match.assists++;match.rating+=.35;event=`${moment.minute}' Asist! Hücum senin kararınla sonuçlandı.`}
    else event=`${moment.minute}' Doğru karar; pozisyonu takımın lehine çevirdin.`;
  } else {match.rating-=c.risk>60?.38:.22;if(c.kind==="defend"&&Math.random()>.5){match.scoreAgainst++;match.rating-=.35;event=`${moment.minute}' Müdahale geç kaldı ve rakip cezayı kesti.`}else event=`${moment.minute}' Fikir doğruydu ama uygulama başarısız.`}
  match.rating=clamp(Number(match.rating.toFixed(1)),4,10);match.events.push(event);match.index++;match.completed=match.index>=match.moments.length;if(match.completed&&Math.random()>.55)match.scoreAgainst++;render();
}

function finishMatch(){
  const appearances=state.appearances+1, avg=(state.averageRating*state.appearances+match.rating)/appearances, c=club(state.clubId), o=club(match.opponentId), won=match.scoreFor>match.scoreAgainst;
  Object.assign(state,{energy:clamp(state.energy-32),fitness:clamp(state.fitness-9),morale:clamp(state.morale+(won?6:match.scoreFor===match.scoreAgainst?1:-4)),form:clamp(state.form+(match.rating>=7?5:match.rating<6?-4:1)),coachTrust:clamp(state.coachTrust+(match.rating>=7?4:match.rating<6?-2:1)),reputation:clamp(state.reputation+Math.max(1,match.rating-5)),appearances,goals:state.goals+match.goals,assists:state.assists+match.assists,averageRating:Number(avg.toFixed(2)),lastRating:match.rating,daysToMatch:5,trainedToday:true,actionsLeft:0});
  state.logs.unshift({id:uid(),type:"match",title:`${c.short} ${match.scoreFor}–${match.scoreAgainst} ${o.short}`,detail:`${match.rating.toFixed(1)} puan · ${match.goals} gol · ${match.assists} asist`,date:"Bugün"});
  if(!state.offer&&appearances>=3&&avg>=7&&Math.random()>.55){const targets=CLUBS.filter(x=>x.id!==c.id&&x.level>=c.level),t=targets[Math.floor(Math.random()*targets.length)];if(t)state.offer={clubId:t.id,salary:Math.round(t.salary*(1.15+state.reputation/100)),years:4,role:t.level>c.level?"Rotasyon oyuncusu":"İlk 11 oyuncusu"}}
  match=null;tab="today";toast=`Maç tamamlandı · ${state.lastRating.toFixed(1)} puan`;save();render();
}

function renderMatch(){
  if(state.daysToMatch>0&&!match)return `<div class="stack">${heading("MAÇ MERKEZİ",`Sıradaki sınav <em>${state.daysToMatch} gün sonra.</em>`,"Hazırlığını tamamla. Maç günü geldiğinde kritik anları sen yöneteceksin.")}<section class="locked-match">${mark(state.clubId)}<span>HAZIRLANIYOR</span><b>${club(state.clubId).name}</b><p>Enerji ${Math.round(state.energy)} · Form ${Math.round(state.form)} · ${squad()}</p></section></div>`;
  if(!match)return `<div class="stack"><section class="match-day"><span>MAÇ GÜNÜ</span><h1>90 dakika.<br><em>Üç büyük karar.</em></h1><p>Seçimlerin özelliklerin, kondisyonun ve risk seviyesiyle hesaplanır.</p><button class="button primary wide" data-action="start-match">Sahaya çık <span>→</span></button></section><section class="selection"><div><span>KADRO DURUMU</span><b>${squad()}</b></div><div><span>TEKNİK DİREKTÖR GÜVENİ</span><b>%${Math.round(state.coachTrust)}</b></div></section></div>`;
  const c=club(state.clubId),o=club(match.opponentId);
  if(match.completed)return `<div class="stack"><section class="result"><span>MAÇ SONU</span><div><aside>${mark(c.id)}<b>${c.short}</b></aside><strong>${match.scoreFor}<i>–</i>${match.scoreAgainst}</strong><aside>${mark(o.id)}<b>${o.short}</b></aside></div><small>MAÇ PUANI</small><em>${match.rating.toFixed(1)}</em></section><section class="match-stats"><div><span>Gol</span><b>${match.goals}</b></div><div><span>Asist</span><b>${match.assists}</b></div><div><span>Kritik karar</span><b>3</b></div></section><section class="event-log">${match.events.map(e=>`<p>${e}</p>`).join("")}</section><button class="button primary wide" data-action="finish-match">Soyunma odasına dön <span>→</span></button></div>`;
  const m=match.moments[match.index];
  return `<div class="stack"><section class="scoreboard"><div>${mark(c.id,true)}<b>${c.short}</b></div><strong>${match.scoreFor} – ${match.scoreAgainst}</strong><div>${mark(o.id,true)}<b>${o.short}</b></div><span>${m.minute}'</span></section><div class="pitch"><span>SEN</span><b>●</b><i></i><i></i><i></i></div><section class="panel moment"><span>KRİTİK AN · ${match.index+1}/3</span><h2>${m.title}</h2><p>${m.description}</p><div class="actions choices">${m.choices.map((x,i)=>`<button data-choice="${i}"><span><b>${x.label}</b><small>${x.detail}</small></span><em>RİSK ${x.risk}</em><strong>→</strong></button>`).join("")}</div></section><div class="live-rating"><span>CANLI PUAN</span><b>${match.rating.toFixed(1)}</b></div></div>`;
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
  if(!state){renderCreation();return}
  migrate();
  const c=club(state.clubId);document.documentElement.style.setProperty("--accent",c.color);
  const screen=tab==="today"?renderToday():tab==="match"?renderMatch():tab==="career"?renderCareer():tab==="social"?renderSocial():renderPlayer();
  document.querySelector("#app").innerHTML=`<main class="game-shell"><aside class="rail"><h1>BE A<br><em>LEGEND</em></h1><p>Futbolcu kariyer simülasyonu</p><div class="rail-player">${mark(c.id)}<span><b>${esc(state.player.name)}</b><small>${c.name}</small></span></div>${nav()}<small>FAZ 2 · LIFE & CAREER</small></aside><section class="phone">${topbar()}<div class="content">${screen}</div>${nav(true)}${renderSheet()}</section></main>`;
}

function train(id){
  if(state.dayActions.training||state.actionsLeft<=0)return;const t=TRAINING[id],c=club(state.clubId),a=state.player.attributes;
  Object.entries(t.gains).forEach(([k,g])=>a[k]=clamp(Number((a[k]+g*c.dev/75).toFixed(2))));
  state.energy=clamp(state.energy-t.energy);state.morale=clamp(state.morale+t.morale);state.fitness=clamp(state.fitness-t.energy*.08);state.coachTrust=clamp(state.coachTrust+1.6);state.xp+=14;state.trainedToday=true;state.dayActions.training=true;state.actionsLeft--;state.player.overall=overall(a,state.player.position);state.logs.unshift({id:uid(),type:"training",title:`${t.name} tamamlandı`,detail:"Teknik ekip çalışma disiplininden memnun.",date:"Bugün"});sheet=null;tab="today";toast=`${t.name} tamamlandı · +14 XP`;save();render();
}
function socialAction(id){
  if(state.dayActions.social||state.actionsLeft<=0)return;
  const effects={
    family:{energy:-8,morale:5,family:8,friends:0,stress:-4,label:"Aileyle güzel bir akşam"},
    friends:{energy:-14,morale:7,family:0,friends:9,stress:-5,label:"Arkadaşlarla buluşma"},
    gaming:{energy:-4,morale:3,family:0,friends:2,stress:-7,label:"Evde oyun gecesi"}
  }[id];
  state.energy=clamp(state.energy+effects.energy);state.morale=clamp(state.morale+effects.morale);state.social.family=clamp(state.social.family+effects.family);state.social.friends=clamp(state.social.friends+effects.friends);state.social.stress=clamp(state.social.stress+effects.stress);state.dayActions.social=true;state.actionsLeft--;state.logs.unshift({id:uid(),type:"social",title:effects.label,detail:`Moral +${effects.morale} · Stres ${effects.stress}`,date:"Bugün"});sheet=null;tab="today";toast=`${effects.label} · Moral +${effects.morale}`;save();render();
}
function recover(){
  if(state.actionsLeft<=0)return;
  state.energy=clamp(state.energy+30);state.morale=clamp(state.morale+4);state.fitness=clamp(state.fitness+4);state.social.stress=clamp(state.social.stress-10);state.actionsLeft--;state.logs.unshift({id:uid(),type:"training",title:"Aktif toparlanma tamamlandı",detail:"Enerji +30 · Stres -10",date:"Bugün"});sheet=null;tab="today";toast="Vücudun ve zihnin toparlandı";save();render();
}
function advance(){if(state.daysToMatch===0)return;state.day++;state.date=`${17+state.day} Ağustos 2026`;state.energy=clamp(state.energy+(state.trainedToday?13:20));state.morale=clamp(state.morale+(state.energy<35?-2:1));state.fitness=clamp(state.fitness+2);state.social.stress=clamp(state.social.stress+2);state.trainedToday=false;state.actionsLeft=2;state.dayActions={training:false,social:false};state.daysToMatch=Math.max(0,state.daysToMatch-1);toast="Yeni gün başladı · 2 aksiyon hazır";save();render()}
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
  else if(b.dataset.choice!==undefined)choose(Number(b.dataset.choice));
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
