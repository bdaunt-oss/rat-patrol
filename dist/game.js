'use strict';
const canvas=document.querySelector('#game'),ctx=canvas.getContext('2d');
const ui=Object.fromEntries(['time','score','status','overlay','title','message','kicker','start','pause','hint'].map(id=>[id,document.getElementById(id)]));
const W=800,H=560,M=56,keys=new Set();
let coins=[],powerups=[],coinCount=0,coinTimer=0,powerTimer=0,powerIndex=0,buffs={shield:0,speed:0,rapid:0};
let upgrades={speed:false,fire:false,damage:false};
const shop=document.getElementById('shop');
const celebration=document.getElementById('celebration');
function clearCelebration(){celebration.hidden=true;ui.overlay.className='';}
const offers=[{id:'speed',cost:5,name:'QUICK STEP',detail:'+10% movement speed'},{id:'fire',cost:10,name:'FAST HANDS',detail:'25% shorter shot cooldown'},{id:'damage',cost:15,name:'HEAVY HITTER',detail:'Double damage to the Rat King'}];
function renderShop(){document.getElementById('wallet').textContent=`YOUR WALLET: ${coinCount} COINS`;for(const o of offers){const b=document.getElementById('buy-'+o.id);b.disabled=upgrades[o.id]||coinCount<o.cost;b.innerHTML=`<strong>${o.cost} COINS · ${o.name}</strong><span>${o.detail}</span><em>${upgrades[o.id]?'OWNED':coinCount<o.cost?'NEED '+(o.cost-coinCount)+' MORE COINS':'BUY UPGRADE'}</em>`;}}
function buyUpgrade(id){const o=offers.find(o=>o.id===id);if(state!=='transition'||!o||upgrades[id]||coinCount<o.cost)return false;coinCount-=o.cost;upgrades[id]=true;renderShop();updateHud();ui.status.textContent='SHOP · STAGE CLEARED';return true;}
for(const o of offers)document.getElementById('buy-'+o.id).onclick=()=>buyUpgrade(o.id);
let stage=1,boss=null,hazards=[],bossShot=2,totalTime=0;
const stageNames=['59 St–Columbus Circle','Central Park','Rockefeller Center'];
let state='ready',player,bullets=[],enemies=[],particles=[],elapsed=0,kills=0,spawn=0,shot=0,last=0;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function reset(){clearCelebration();shop.hidden=true;upgrades={speed:false,fire:false,damage:false};stage=1;boss=null;hazards=[];totalTime=0;player={x:W/2,y:H/2,r:17};coins=[];powerups=[];coinCount=0;coinTimer=7;powerTimer=14;powerIndex=0;buffs={shield:0,speed:0,rapid:0};coins=[];bullets=[];enemies=[];particles=[];elapsed=0;kills=0;spawn=.7;shot=0;keys.clear();state='playing';ui.overlay.hidden=true;ui.pause.textContent='PAUSE [P]';ui.hint.textContent='Collect gold coins. Walk over glowing power-ups.';canvas.focus();updateHud();}
function updateHud(){document.querySelector('.eyebrow').textContent=`STAGE ${stage} · ${stageNames[stage-1].toUpperCase()}`;document.querySelector('.round small').textContent=stage===3?'FINAL STAGE · RAT KING':'SURVIVE 60 SECONDS';document.querySelector('.tag').textContent=stageNames[stage-1].toUpperCase();document.querySelector('.hud small').textContent=stage===3?'BOSS HEALTH':'TIME LEFT';ui.time.innerHTML=stage===3?`${boss?boss.hp:0}<span> / 40</span>`:`${Math.ceil(Math.max(0,60-elapsed))}<span>s</span>`;ui.score.textContent=String(coinCount).padStart(2,'0');ui.status.textContent=state==='playing'?'HOLD YOUR GROUND':state==='paused'?'TAKE A BREATHER':'NEXT STOP: SURVIVAL';}
function end(win){celebration.hidden=!win;ui.overlay.className=win?'victory':'';shop.hidden=true;state=win?'won':'lost';keys.clear();ui.overlay.hidden=false;ui.kicker.textContent=win?'HONORARY HERO OF NEW YORK':'THE RATS GOT THE UPPER PAW';ui.title.textContent=win?'The keys to the city. Yours.':'Rats. Foiled again.';ui.message.textContent=`${coinCount} coins · ${kills} rats cleared · ${Math.floor(totalTime)} seconds survived${win?'':'. Keep moving and try again.'}`;if(win)ui.message.textContent=`The Rat King is defeated. From Columbus Circle to the Rockefeller tree, you saved the city. Thank you, hero! ${coinCount} coins · ${kills} rats cleared · ${Math.floor(totalTime)}s`;ui.start.innerHTML=win?'TAKE ANOTHER VICTORY LAP <span>↗</span>':'PLAY AGAIN <span>↗</span>';ui.status.textContent=win?'ALL 3 STAGES CLEARED':'TRY ANOTHER ROUND';}
function pause(){if(state==='playing'){state='paused';keys.clear();ui.overlay.hidden=false;ui.kicker.textContent='COFFEE BREAK';ui.title.textContent='Taking a breather.';ui.message.textContent='Press P or resume when you’re ready.';ui.start.innerHTML='RESUME <span>↗</span>';ui.pause.textContent='RESUME [P]';}else if(state==='paused'){state='playing';ui.overlay.hidden=true;ui.pause.textContent='PAUSE [P]';canvas.focus();}updateHud();}
ui.start.onclick=()=>state==='paused'?pause():state==='transition'?beginStage(stage+1):reset();ui.pause.onclick=pause;
window.addEventListener('keydown',e=>{const k=e.key.toLowerCase();if(['arrowup','arrowdown','arrowleft','arrowright','w','a','s','d',' '].includes(k))e.preventDefault();if(k==='p'&&!e.repeat)pause();if(k==='enter'&&!e.repeat){if(state==='paused')pause();else if(state==='transition')beginStage(stage+1);else if(state!=='playing')reset();}if(state==='playing')keys.add(k);});
window.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));window.addEventListener('blur',()=>{keys.clear();if(state==='playing')pause();});document.addEventListener('visibilitychange',()=>{if(document.hidden&&state==='playing')pause();});
function spawnEnemy(){const side=Math.floor(Math.random()*4),t=M+16+Math.random()*((side%2?H:W)-2*(M+16));let x,y;if(side===0){x=t;y=M+12;}else if(side===1){x=W-M-12;y=t;}else if(side===2){x=t;y=H-M-12;}else{x=M+12;y=t;}if(Math.hypot(x-player.x,y-player.y)<110){spawn=.1;return;}enemies.push({x,y,r:12,speed:48+elapsed*.65+(stage-1)*9+Math.random()*10});}
function nextStage(){state='transition';keys.clear();ui.overlay.hidden=false;ui.kicker.textContent=`STAGE ${stage} CLEARED`;ui.title.textContent='Upgrade before the next stop?';shop.hidden=false;renderShop();ui.message.textContent=stage===1?'Survive 60 seconds in the park. Your coins carry over.':'Defeat the Rat King at the Rockefeller Center tree. Dodge red snowballs; keep shooting!';ui.start.innerHTML='CONTINUE <span>↗</span>';ui.status.textContent='STAGE CLEARED';}
function beginStage(number){clearCelebration();shop.hidden=true;stage=number;elapsed=0;enemies=[];bullets=[];particles=[];coins=[];powerups=[];hazards=[];buffs={shield:0,speed:0,rapid:0};coinTimer=7;powerTimer=14;spawn=1;shot=0;bossShot=2;boss=stage===3?{x:400,y:150,r:38,hp:40}:null;player.x=400;player.y=stage===3?420:280;keys.clear();state='playing';ui.overlay.hidden=true;ui.pause.textContent='PAUSE [P]';canvas.focus();updateHud();}
const powers={shield:{name:'SHIELD',color:'#64d8f0',icon:'S'},speed:{name:'SPEED',color:'#88ed99',icon:'»'},rapid:{name:'RAPID FIRE',color:'#eea4ff',icon:'R'}};
function pickupSpot(){
 // Pick from reachable edge positions on the opposite side of the arena.
 const candidates=[];for(let i=0;i<12;i++){const horizontal=Math.random()<.5;const p=horizontal?{x:90+Math.random()*620,y:Math.random()<.5?90:470}:{x:Math.random()<.5?90:710,y:90+Math.random()*380};candidates.push(p);}
 return candidates.sort((a,b)=>Math.hypot(b.x-player.x,b.y-player.y)-Math.hypot(a.x-player.x,a.y-player.y))[0];
}
function step(dt){
 elapsed+=dt;totalTime+=dt;if(stage<3&&elapsed>=60){elapsed=60;nextStage();return;}
 for(const type of Object.keys(buffs))buffs[type]=Math.max(0,buffs[type]-dt);
 let dx=Number(keys.has('d'))-Number(keys.has('a')),dy=Number(keys.has('s'))-Number(keys.has('w')),n=Math.hypot(dx,dy)||1;
 const speed=(buffs.speed>0?265:185)*(upgrades.speed?1.1:1);
 player.x=clamp(player.x+dx/n*speed*dt,M+player.r,W-M-player.r);player.y=clamp(player.y+dy/n*speed*dt,M+player.r,H-M-player.r);
 shot-=dt;let sx=Number(keys.has('arrowright'))-Number(keys.has('arrowleft')),sy=Number(keys.has('arrowdown'))-Number(keys.has('arrowup'));
 if((sx||sy)&&shot<=0){n=Math.hypot(sx,sy);bullets.push({x:player.x+sx/n*24,y:player.y+sy/n*24,dx:sx/n,dy:sy/n});shot=(buffs.rapid>0?.065:.16)*(upgrades.fire?.75:1);}
 spawn-=dt;if(spawn<=0){spawnEnemy();spawn=stage===3?2.5:Math.max(.28,1.05-elapsed*.012-(stage-1)*.12);}
 coinTimer-=dt;if(coinTimer<=0){if(coins.length<3)coins.push({...pickupSpot(),life:7});coinTimer=7+Math.random()*3;}
 powerTimer-=dt;if(powerTimer<=0){powerups.push({...pickupSpot(),type:['shield','speed','rapid'][powerIndex++%3],life:6});powerTimer=17+Math.random()*4;}
 for(const p of powerups){p.life-=dt;if(Math.hypot(p.x-player.x,p.y-player.y)<player.r+15){buffs[p.type]=8;p.life=0;}}
 powerups=powerups.filter(p=>p.life>0);
 coins=coins.filter(c=>{c.life=(c.life??7)-dt;if(c.life<=0)return false;if(Math.hypot(c.x-player.x,c.y-player.y)<player.r+10){coinCount++;return false;}return true;});
 for(const b of bullets){b.x+=b.dx*440*dt;b.y+=b.dy*440*dt;}
 for(const e of enemies){dx=player.x-e.x;dy=player.y-e.y;n=Math.hypot(dx,dy)||1;e.x+=dx/n*e.speed*dt;e.y+=dy/n*e.speed*dt;}
 if(boss){
  const angle=Math.atan2(player.y-boss.y,player.x-boss.x);const pace=elapsed%6<1.4?115:48;
  boss.x=clamp(boss.x+Math.cos(angle)*pace*dt,M+boss.r,W-M-boss.r);boss.y=clamp(boss.y+Math.sin(angle)*pace*dt,M+boss.r,H-M-boss.r);
  bossShot-=dt;if(bossShot<=0){for(let i=0;i<8;i++){const a=i*Math.PI/4+elapsed*.2;hazards.push({x:boss.x,y:boss.y,dx:Math.cos(a),dy:Math.sin(a)});}bossShot=boss.hp<20?1.6:2.4;}
  for(const b of bullets)if(!b.dead&&Math.hypot(b.x-boss.x,b.y-boss.y)<boss.r+4){b.dead=true;boss.hp-=upgrades.damage?2:1;}
  if(boss.hp<=0){coinCount+=25;boss=null;hazards=[];end(true);updateHud();ui.status.textContent='ALL 3 STAGES CLEARED';return;}
  if(Math.hypot(player.x-boss.x,player.y-boss.y)<player.r+boss.r-5&&buffs.shield<=0){end(false);return;}
 }
 for(const h of hazards){h.x+=h.dx*125*dt;h.y+=h.dy*125*dt;if(Math.hypot(h.x-player.x,h.y-player.y)<player.r+6){h.dead=true;if(buffs.shield<=0){end(false);return;}}}
 hazards=hazards.filter(h=>!h.dead&&h.x>M&&h.x<W-M&&h.y>M&&h.y<H-M);
 for(const b of bullets)for(const e of enemies)if(!b.dead&&!e.dead&&Math.hypot(b.x-e.x,b.y-e.y)<e.r+4){e.dead=b.dead=true;kills++;if(Math.random()<.12&&coins.length<3)coins.push({x:e.x,y:e.y,life:5});for(let j=0;j<6;j++)particles.push({x:e.x,y:e.y,dx:(Math.random()-.5)*120,dy:(Math.random()-.5)*120,life:.3});}
 bullets=bullets.filter(b=>!b.dead&&b.x>M&&b.x<W-M&&b.y>M&&b.y<H-M);enemies=enemies.filter(e=>!e.dead);
 for(const e of enemies)if(Math.hypot(e.x-player.x,e.y-player.y)<e.r+player.r-3){if(buffs.shield>0){e.dead=true;particles.push({x:e.x,y:e.y,dx:0,dy:0,life:.3});}else{end(false);break;}}
 enemies=enemies.filter(e=>!e.dead);
 for(const p of particles){p.x+=p.dx*dt;p.y+=p.dy*dt;p.life-=dt;}particles=particles.filter(p=>p.life>0);
 const active=Object.entries(buffs).filter(([,v])=>v>0).map(([k,v])=>`${powers[k].name} ${Math.ceil(v)}s`);
 const owned=offers.filter(o=>upgrades[o.id]).map(o=>o.name);ui.hint.textContent=active.length||owned.length?[...active,...owned].join(' · '):'Collect coins · S shield / » speed / R rapid fire · each lasts 8s';updateHud();
}
function rect(x,y,w,h,c){ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),w,h);}
function ellipse(x,y,rx,ry,c){ctx.fillStyle=c;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fill();}
function student(x,y){ctx.save();ctx.translate(Math.round(x),Math.round(y));ctx.scale(1.65,1.65);x=0;y=0;ellipse(x,y+15,15,5,'#20202d44');rect(x-8,y+6,6,10,'#25384b');rect(x+3,y+6,6,10,'#25384b');rect(x-10,y-15,20,23,'#422934');rect(x-13,y-6,5,14,'#422934');rect(x+8,y-6,5,14,'#422934');rect(x-10,y-3,20,14,'#860038');rect(x-13,y,4,8,'#f0c598');rect(x-6,y-14,12,12,'#f0c598');rect(x-8,y-19,16,7,'#422934');rect(x-8,y-14,4,9,'#422934');rect(x+6,y-14,3,9,'#422934');rect(x+7,y-12,5,3,'#e4a6c1');rect(x-5,y-11,2,2,'#33242c');rect(x+3,y-11,2,2,'#33242c');rect(x-4,y-1,8,3,'#fff4e8');rect(x-4,y+2,3,6,'#fff4e8');rect(x-1,y+2,4,2,'#fff4e8');rect(x+10,y,9,5,'#96c9ce');rect(x+11,y+5,3,4,'#e9e4d5');ctx.restore();}
function rat(e){const x=Math.round(e.x),y=Math.round(e.y),a=Math.atan2(player.y-y,player.x-x);ctx.save();ctx.translate(x,y);ctx.rotate(a);const wiggle=Math.sin(elapsed*18+x)*3;ctx.strokeStyle='#9a4964';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-8,0);ctx.quadraticCurveTo(-24,12+wiggle,-24,-3+wiggle);ctx.stroke();ellipse(0,3,13,8,'#25233133');ellipse(0,0,13,8,'#28212f');ellipse(-3,-3,7,5,'#443446');ellipse(7,-6,4,4,'#db819b');ellipse(7,6,4,4,'#db819b');ellipse(12,0,6,5,'#443446');rect(16,-2,3,4,'#e3a6af');rect(10,-4,2,2,'#1c1e28');rect(10,3,2,2,'#1c1e28');rect(-5,-9,5,3,'#c092a0');rect(-5,6,5,3,'#c092a0');ctx.restore();}
function label(text,x,y,size,color){ctx.fillStyle=color;ctx.font=`bold ${size}px monospace`;ctx.textAlign='center';ctx.fillText(text,x,y);}
function subway(){
 rect(0,0,W,H,'#131c24');
 // Tracks frame a closed platform arena; all station details are decorative.
 for(let x=0;x<W;x+=32){rect(x,4,9,42,'#3d454b');rect(x,H-45,9,40,'#3d454b');}for(const y of [13,35,H-35,H-13])rect(0,y,W,4,'#879197');
 rect(40,44,720,472,'#b9c9c7');
 for(let y=52;y<510;y+=32)for(let x=48;x<752;x+=32){rect(x,y,30,30,((x-48+y-52)/32)%2?'#c2d0cd':'#bacac7');rect(x+2,y+28,25,1,'#afc0bd');}
 rect(40,44,720,10,'#f5ce55');rect(40,506,720,10,'#f5ce55');for(let x=45;x<754;x+=10){rect(x,47,2,2,'#9c8039');rect(x,509,2,2,'#9c8039');}
 rect(0,48,39,464,'#e0e1ce');rect(761,48,39,464,'#e0e1ce');for(let y=48;y<512;y+=20){rect(0,y,39,2,'#b5bbb2');rect(761,y,39,2,'#b5bbb2');}
 for(const x of [15,775])for(const y of [90,260,430]){rect(x-8,y,16,58,'#245948');rect(x-10,y+3,20,4,'#38705d');label('59',x,y+33,10,'#eaf2e5');}
 rect(211,0,378,43,'#10171c');label('59 St–Columbus Circle',405,18,18,'#fffaf0');label('STAGE 1  /  UPTOWN & THE BRONX',405,34,9,'#acb9bb');ellipse(231,21,14,14,'#da3f40');label('1',231,27,18,'#fff');
 rect(300,H-39,200,30,'#151e24');label('59 STREET',400,H-19,15,'#f3f1df');
 // Small tile mosaics and platform drains.
 label('59',110,100,19,'#536d69');label('59',690,470,19,'#536d69');for(const [x,y] of [[90,470],[710,90]]){rect(x-14,y-7,28,14,'#819894');for(let j=-10;j<=10;j+=5)rect(x+j,y-5,2,10,'#546d68');}
}
function park(){
 rect(0,0,W,H,'#244c3a');rect(40,44,720,472,'#a9c88d');
 for(let y=56;y<510;y+=22)for(let x=48;x<752;x+=28){rect(x,y,3,3,'#8daf74');}
 rect(56,240,688,80,'#ddc7a0');rect(358,56,84,448,'#ddc7a0');
 ellipse(190,140,68,36,'#7ab6be');ellipse(190,140,55,26,'#91cbd0');
 for(const x of [20,780])for(let y=70;y<530;y+=90){rect(x-4,y,8,32,'#634939');ellipse(x,y-4,28,28,'#366b40');ellipse(x-9,y-12,20,20,'#528547');}
 for(const y of [16,536])for(let x=75;x<750;x+=110){ellipse(x,y,27,20,'#427b46');rect(x-5,y-9,10,20,'#547e43');}
 for(const x of [85,680]){rect(x,340,35,9,'#71523c');rect(x,352,35,6,'#71523c');rect(x+3,357,4,9,'#303d35');rect(x+28,357,4,9,'#303d35');}
 rect(240,4,320,34,'#19392e');label('CENTRAL PARK',400,25,20,'#f1efd6');label('STAGE 2 / A WALK IN THE PARK?',400,545,12,'#d6e8c6');
}
function rockefeller(){
 rect(0,0,W,H,'#182638');rect(40,44,720,472,'#d4e1e4');
 for(let y=54;y<510;y+=32)for(let x=48;x<750;x+=32)rect(x,y,30,30,(x+y)%64?'#dce7e9':'#cfdee2');
 // Tree and surrounding towers sit outside the playable plaza.
 for(const x of [10,680]){rect(x,0,110,45,'#455269');for(let xx=x+8;xx<x+100;xx+=18)for(let yy=6;yy<40;yy+=12)rect(xx,yy,5,5,'#e8cf90');}
 rect(388,36,24,38,'#79523b');ctx.fillStyle='#245d47';ctx.beginPath();ctx.moveTo(400,0);ctx.lineTo(470,69);ctx.lineTo(330,69);ctx.closePath();ctx.fill();
 for(let i=0;i<30;i++){const x=350+(i*37)%100,y=22+(i*13)%42;ellipse(x,y,2.5,2.5,['#ffdc6f','#ef8794','#92d4f2'][i%3]);}label('★',400,15,24,'#ffe99d');
 rect(38,77,724,6,'#b79365');for(let x=40;x<760;x+=26){rect(x,80,3,12,'#b79365');}
 for(let y=100;y<500;y+=80)for(const x of [22,778]){ellipse(x,y,13,13,'#2e6d50');ellipse(x,y,4,4,'#d65265');}
 label('ROCKEFELLER CENTER',400,537,19,'#f3e6c9');label('STAGE 3 / THE RAT KING',400,554,10,'#f0b6be');
 for(let i=0;i<32;i++){const x=(i*137)%800,y=(i*73+elapsed*12)%560;rect(x,y,2,2,'#fff9');}
}
function city(){if(stage===1)subway();else if(stage===2)park();else rockefeller();}
function drawBoss(){ctx.save();ctx.translate(boss.x,boss.y);ctx.scale(2.7,2.7);rat({x:0,y:0});ctx.restore();label('♛',boss.x,boss.y-35,29,'#d9901f');rect(boss.x-43,boss.y-52,86,7,'#442638');rect(boss.x-42,boss.y-51,84*boss.hp/40,5,'#d94862');}
function drawCoin(c){if(c.life<2&&Math.floor(elapsed*8)%2)return;const bob=Math.sin(elapsed*4+c.x)*2;ellipse(c.x,c.y+3,11,5,'#59644e44');ellipse(c.x,c.y+bob,10,10,'#90601c');ellipse(c.x,c.y-1+bob,8,8,'#ffdc55');label('$',c.x,c.y+4+bob,12,'#9b641d');}
function drawPower(p){if(p.life<2&&Math.floor(elapsed*8)%2)return;const d=powers[p.type];ellipse(p.x,p.y,22+Math.sin(elapsed*5)*2,22+Math.sin(elapsed*5)*2,d.color+'33');rect(p.x-14,p.y-14,28,28,'#152431');ctx.strokeStyle=d.color;ctx.lineWidth=2;ctx.strokeRect(p.x-14,p.y-14,28,28);label(d.icon,p.x,p.y+6,19,d.color);label(d.name,p.x,p.y+28,8,'#213730');}
function draw(){city();for(const c of coins)drawCoin(c);for(const p of powerups)drawPower(p);if(player){for(const b of bullets){rect(b.x-4,b.y-4,8,8,'#fff4a355');rect(b.x-2,b.y-2,5,5,'#fff9cf');}for(const e of enemies)rat(e);if(boss)drawBoss();for(const h of hazards){ellipse(h.x,h.y,7,7,'#9b2342');ellipse(h.x-2,h.y-2,2,2,'#ffe5e6');}if(buffs.shield>0){ctx.strokeStyle='#138cbd';ctx.lineWidth=4;ctx.beginPath();ctx.arc(player.x,player.y,32,0,Math.PI*2);ctx.stroke();}student(player.x,player.y);for(const p of particles)rect(p.x,p.y,4,4,'#ae5072');}else student(400,280);}
function frame(t){const dt=Math.min((t-last)/1000,.033);last=t;if(state==='playing')step(dt);draw();requestAnimationFrame(frame);}requestAnimationFrame(frame);

const practiceButton=document.getElementById('practice');
practiceButton.onclick=()=>{reset();beginStage(3);};
