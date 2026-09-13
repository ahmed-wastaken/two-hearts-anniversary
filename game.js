const canvas=document.getElementById("game"),ctx=canvas.getContext("2d");
ctx.imageSmoothingEnabled=false;

const W=1280,H=720, G=0.62, SPEED=3.4, JUMP=-11.5;
const keys={left:false,right:false,jump:false};
let active="boy", won=false, time=0;
let lever=false, girlPlate=false, boyDoor=false, middlePlate=false, finalDoor=false;

const img={};
["boy_idle","boy_run1","boy_run2","girl_idle","girl_run1","girl_run2"].forEach(n=>{
  const i=new Image(); i.src="assets/"+n+".png"; img[n]=i;
});

const boy={x:105,y:480,w:38,h:76,vx:0,vy:0,onGround:false,frame:0};
const girl={x:1135,y:480,w:38,h:76,vx:0,vy:0,onGround:false,frame:0};

const platforms=[
  // left room
  {x:40,y:560,w:265,h:34},
  {x:390,y:560,w:170,h:34},
  // right room
  {x:720,y:560,w:170,h:34},
  {x:975,y:560,w:265,h:34},
  // upper central / route
  {x:390,y:425,w:170,h:28},
  {x:720,y:425,w:170,h:28},
  {x:560,y:315,w:160,h:28},
  // center floor
  {x:500,y:610,w:280,h:34},
  // small ledges
  {x:295,y:500,w:95,h:22},
  {x:890,y:500,w:85,h:22}
];

const lava=[
  {x:305,y:560,w:85,h:34},
  {x:890,y:560,w:85,h:34}
];

const gates={
  girl:{x:705,y:425,w:30,h:135},
  boy:{x:360,y:425,w:30,h:135},
  final:{x:625,y:315,w:30,h:295}
};

const plates={
  girl:{x:835,y:536,w:48,h:10},
  middle:{x:616,y:596,w:48,h:10}
};
const leverObj={x:530,y:522,w:42,h:38};

const particles=[];
function particle(x,y,dx,dy,color,life=40,size=3){particles.push({x,y,dx,dy,color,life,max:life,size})}
function text(t,x,y,size=18,align="center",fill="#fff"){ctx.font=`700 ${size}px system-ui`;ctx.textAlign=align;ctx.fillStyle=fill;ctx.fillText(t,x,y)}

function roundedRect(x,y,w,h,r,fill,stroke){
  ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fillStyle=fill;ctx.fill();
  if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=2;ctx.stroke();}
}

function drawBackground(){
  const sky=ctx.createLinearGradient(0,0,0,H);sky.addColorStop(0,"#72c9f4");sky.addColorStop(.58,"#bde9ff");sky.addColorStop(1,"#dff4df");ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);
  // clouds
  for(const c of [[150,90,90],[420,125,65],[830,90,95],[1080,145,80]]){ctx.fillStyle="#fff";for(let k=-1;k<=1;k++)ctx.beginPath(),ctx.arc(c[0]+k*c[2]*.42,c[1]+(k===0?-8:5),c[2]*.36,0,Math.PI*2),ctx.fill();}
  // sun
  ctx.fillStyle="#fff4b0";ctx.beginPath();ctx.arc(640,72,35,0,Math.PI*2);ctx.fill();
  ctx.fillStyle="#ffe47b";ctx.beginPath();ctx.arc(640,72,27,0,Math.PI*2);ctx.fill();
  // distant mountains
  ctx.fillStyle="#88b8c9";ctx.beginPath();ctx.moveTo(0,370);ctx.lineTo(180,215);ctx.lineTo(330,365);ctx.lineTo(490,180);ctx.lineTo(690,365);ctx.lineTo(850,205);ctx.lineTo(1020,365);ctx.lineTo(1160,225);ctx.lineTo(1280,350);ctx.lineTo(1280,610);ctx.lineTo(0,610);ctx.closePath();ctx.fill();
  ctx.fillStyle="#bfe0e2";ctx.beginPath();ctx.moveTo(0,390);ctx.lineTo(180,255);ctx.lineTo(330,365);ctx.lineTo(490,220);ctx.lineTo(690,365);ctx.lineTo(850,245);ctx.lineTo(1020,365);ctx.lineTo(1160,265);ctx.lineTo(1280,365);ctx.lineTo(1280,610);ctx.lineTo(0,610);ctx.closePath();ctx.fill();
  // lake
  ctx.fillStyle="#55b9d6";ctx.fillRect(0,470,W,170);
  for(let y=490;y<620;y+=26){ctx.strokeStyle="rgba(255,255,255,.22)";ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(30,y);ctx.lineTo(260,y);ctx.moveTo(760,y+9);ctx.lineTo(1220,y+9);ctx.stroke();}
  // trees
  for(const x of [25,210,1060,1240]){ctx.fillStyle="#7d5339";ctx.fillRect(x,150,24,410);ctx.fillStyle="#2d8f55";for(const [dx,dy,r] of [[0,0,80],[-35,55,55],[35,60,58]]){ctx.beginPath();ctx.arc(x+dx,170+dy,r,0,Math.PI*2);ctx.fill();}}
}

function drawPlatform(p){
  ctx.fillStyle="#b88961";ctx.fillRect(p.x,p.y,p.w,p.h);
  ctx.fillStyle="#e5c68e";ctx.fillRect(p.x,p.y,p.w,8);
  ctx.fillStyle="#79c653";ctx.fillRect(p.x,p.y-5,p.w,9);
  ctx.fillStyle="#4b9c48";ctx.fillRect(p.x,p.y-5,p.w,3);
  for(let x=p.x+12;x<p.x+p.w-4;x+=28){ctx.fillStyle="rgba(70,55,45,.32)";ctx.fillRect(x,p.y+15,12,5)}
}

function drawLava(v){
  ctx.fillStyle="#8d3b2b";ctx.fillRect(v.x,v.y,v.w,v.h);
  ctx.fillStyle="#ff5c22";ctx.fillRect(v.x,v.y+5,v.w,29);
  for(let x=v.x;x<v.x+v.w;x+=22){const off=Math.sin(time*.08+x)*3;ctx.fillStyle="#ffb52e";ctx.fillRect(x+4,v.y+10+off,12,3);ctx.fillStyle="#fff16c";ctx.fillRect(x+8,v.y+17+off,7,3)}
  ctx.fillStyle="#e8e2a1";ctx.fillRect(v.x-3,v.y-5,v.w+6,5);
}

function drawGate(g,open,label){
  if(open){
    ctx.fillStyle="rgba(120,220,170,.18)";ctx.fillRect(g.x,g.y,g.w,g.h);
    text("OPEN",g.x+g.w/2,g.y+25,10,"center","#fff");
  }else{
    ctx.fillStyle="#7d4b34";ctx.fillRect(g.x,g.y,g.w,g.h);
    for(let y=g.y+4;y<g.y+g.h;y+=20){ctx.fillStyle="#d9aa68";ctx.fillRect(g.x+4,y,g.w-8,7)}
    ctx.strokeStyle="#4a2b28";ctx.lineWidth=4;ctx.strokeRect(g.x,g.y,g.w,g.h);
    text("🔒",g.x+g.w/2,g.y+g.h/2+6,18);
  }
  if(label) text(label,g.x+g.w/2,g.y-10,11,"center","#fff");
}

function drawPlate(p,on){
  ctx.fillStyle=on?"#71e0ff":"#d6eef3";ctx.fillRect(p.x,p.y,p.w,p.h);
  ctx.fillStyle=on?"#1f91bd":"#7196a4";ctx.fillRect(p.x+4,p.y+3,p.w-8,5);
  if(on){for(let i=0;i<3;i++)particle(p.x+8+i*15,p.y,0,-1,"#fff",18,2)}
}

function drawLever(){
  ctx.fillStyle="#5e4634";ctx.fillRect(leverObj.x,leverObj.y+25,leverObj.w,8);
  ctx.save();ctx.translate(leverObj.x+22,leverObj.y+25);ctx.rotate(lever?-.65:.65);
  ctx.fillStyle="#5a3b2c";ctx.fillRect(-3,-28,6,30);ctx.fillStyle="#ef5845";ctx.beginPath();ctx.arc(0,-31,7,0,Math.PI*2);ctx.fill();ctx.restore();
  text(lever?"LEVER ✓":"LEVER",leverObj.x+21,leverObj.y+50,11);
}

function drawHeart(){
  const pulse=1+Math.sin(time*.07)*.06;
  ctx.save();ctx.translate(640,545);ctx.scale(pulse,pulse);
  ctx.fillStyle="#ff4f79";ctx.beginPath();ctx.moveTo(0,25);ctx.bezierCurveTo(-65,-15,-55,-55,-25,-55);ctx.bezierCurveTo(-5,-55,0,-40,0,-30);ctx.bezierCurveTo(0,-40,8,-55,28,-55);ctx.bezierCurveTo(58,-55,65,-15,0,25);ctx.fill();
  ctx.strokeStyle="#fff0f5";ctx.lineWidth=4;ctx.stroke();
  ctx.restore();
}

function drawPlayer(p,isBoy){
  const prefix=isBoy?"boy":"girl";
  let n=prefix+"_idle";
  if(Math.abs(p.vx)>.2)n=prefix+"_run"+(Math.floor(p.frame/8)%2+1);
  const im=img[n];
  if(!im.complete)return;
  const scale=isBoy?.52:.45;
  const dw=im.width*scale,dh=im.height*scale;
  ctx.save();
  ctx.translate(p.x+p.w/2,p.y+p.h);
  if(p.vx<0)ctx.scale(-1,1);
  ctx.drawImage(im,-dw/2,-dh,dw,dh);
  ctx.restore();
  if((isBoy?active==="boy":active==="girl")&&!won){
    ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(p.x+p.w/2,p.y-13,5,0,Math.PI*2);ctx.fill();
    ctx.fillStyle="#ff5b83";ctx.beginPath();ctx.arc(p.x+p.w/2,p.y-13,3,0,Math.PI*2);ctx.fill();
  }
}

function solidRects(){
  const arr=platforms.slice();
  if(!(!boyDoor)){} // gate collision handled separately
  if(!girlPlate){} 
  if(!lever) arr.push(gates.girl);
  if(!girlPlate) arr.push(gates.boy);
  if(!middlePlate) arr.push(gates.final);
  return arr;
}

function updatePlayer(p,isBoy){
  if(won)return;
  const controlled=(active===(isBoy?"boy":"girl"));
  if(controlled){
    p.vx=(keys.left?-SPEED:0)+(keys.right?SPEED:0);
    if(keys.jump && p.onGround){p.vy=JUMP;p.onGround=false;keys.jump=false}
  }else p.vx=0;
  p.vy+=G;p.x+=p.vx;p.y+=p.vy;
  p.onGround=false;
  const solids=solidRects();
  for(const s of solids){
    if(p.x+p.w>s.x&&p.x<s.x+s.w&&p.y+p.h>=s.y&&p.y+p.h<=s.y+18&&p.vy>=0){p.y=s.y-p.h;p.vy=0;p.onGround=true}
    else if(p.x+p.w>s.x&&p.x<s.x+s.w&&p.y<s.y+s.h&&p.y+p.h>s.y&&p.vy<0){p.y=s.y+s.h;p.vy=0}
  }
  // side boundaries
  p.x=Math.max(15,Math.min(W-15-p.w,p.x));
  if(p.y>H+80){p.x=isBoy?105:1135;p.y=480;p.vy=0}
  p.frame++;
}

function rectHit(p,r){return p.x+p.w>r.x&&p.x<r.x+r.w&&p.y+p.h>r.y&&p.y<r.y+r.h}
function updatePuzzle(){
  if(rectHit(boy,{x:leverObj.x-15,y:leverObj.y-35,w:70,h:75}))lever=true;
  if(lever && rectHit(girl,{x:plates.girl.x-8,y:plates.girl.y-16,w:plates.girl.w+16,h:32}))girlPlate=true;
  if(girlPlate)boyDoor=true;
  if(girlPlate && rectHit(boy,{x:plates.middle.x-8,y:plates.middle.y-18,w:plates.middle.w+16,h:40}))middlePlate=true;
  if(middlePlate)finalDoor=true;
  if(middlePlate && rectHit(girl,{x:625,y:265,w:70,h:80}) && Math.abs(girl.x-boy.x)<90){won=true;celebrate();}
}

function celebrate(){
  for(let i=0;i<90;i++)particle(640,540,(Math.random()-.5)*7,-Math.random()*7,"#ff5c8a",50+Math.random()*40,3+Math.random()*4);
}

function drawUI(){
  roundedRect(20,18,320,58,18,"rgba(14,39,61,.88)","rgba(255,255,255,.25)");
  const face=active==="boy"?"Boy":"Girl";
  text("CONTROLLING: "+face.toUpperCase(),42,43,16,"left","#fff");
  text(active==="boy"?"Get to the lever →":"Reach the pressure plate →",42,63,11,"left","#bfe9ff");
  roundedRect(935,18,325,58,18,"rgba(14,39,61,.88)","rgba(255,255,255,.25)");
  text(lever?"① Lever ✓":"① Boy → lever",952,43,13,"left",lever?"#9cffbd":"#fff");
  text(girlPlate?"② Girl plate ✓":"② Girl plate",1065,43,13,"left",girlPlate?"#9cffbd":"#fff");
  text(middlePlate?"③ Middle ✓":"③ Middle plate",952,63,13,"left",middlePlate?"#9cffbd":"#fff");
  text("♥",1235,64,18,"center","#ff7c9b");
}

function draw(){
  ctx.clearRect(0,0,W,H);drawBackground();
  // stone arches framing the rooms
  ctx.fillStyle="#d6c49e";ctx.fillRect(0,260,28,305);ctx.fillRect(1252,260,28,305);
  ctx.fillStyle="#b39b75";ctx.fillRect(0,260,28,15);ctx.fillRect(1252,260,28,15);
  // platforms
  platforms.forEach(drawPlatform);lava.forEach(drawLava);
  drawGate(gates.girl,lever,"GIRL GATE");
  drawGate(gates.boy,girlPlate,"BOY GATE");
  drawGate(gates.final,middlePlate,"FINAL GATE");
  drawLever();drawPlate(plates.girl,girlPlate);drawPlate(plates.middle,middlePlate);
  drawHeart();
  // flowers
  for(let x=45;x<1240;x+=47){const y=553+(x%3)*2;ctx.fillStyle=x%2?"#ff7395":"#ffd45b";ctx.fillRect(x,y,5,5);ctx.fillStyle="#4f9d4d";ctx.fillRect(x+2,y+5,2,8)}
  drawPlayer(boy,true);drawPlayer(girl,false);
  drawUI();
  if(won){
    ctx.fillStyle="rgba(8,23,36,.62)";ctx.fillRect(0,0,W,H);
    roundedRect(340,210,600,260,30,"rgba(255,251,235,.96)","#ff93aa");
    text("YOU FOUND EACH OTHER",640,280,30,"center","#b64263");
    text("♥",640,335,58,"center","#ff4f79");
    text("Some paths are meant to meet.",640,385,19,"center","#526779");
    text("Happy Anniversary ❤️",640,420,22,"center","#b64263");
    text("Press R to play again",640,447,13,"center","#526779");
  }
  // particles
  for(let i=particles.length-1;i>=0;i--){const q=particles[i];q.x+=q.dx;q.y+=q.dy;q.dy+=.12;q.life--;ctx.globalAlpha=Math.max(0,q.life/q.max);ctx.fillStyle=q.color;ctx.fillRect(q.x,q.y,q.size,q.size);if(q.life<=0)particles.splice(i,1)}
  ctx.globalAlpha=1;
}

function key(e,down){
  if(e.key==="ArrowLeft"||e.key.toLowerCase()==="a")keys.left=down;
  if(e.key==="ArrowRight"||e.key.toLowerCase()==="d")keys.right=down;
  if(e.key===" "||e.key==="ArrowUp"||e.key.toLowerCase()==="w"){if(down&&!e.repeat)keys.jump=true}
  if(down&&e.key==="Tab"){e.preventDefault();active=active==="boy"?"girl":"boy"}
  if(down&&e.key.toLowerCase()==="r"&&won)location.reload();
}
addEventListener("keydown",e=>key(e,true));addEventListener("keyup",e=>key(e,false));
document.querySelectorAll("#mobile button[data-key]").forEach(b=>{
  const k=b.dataset.key;
  const set=v=>{keys[k]=v;if(k==="jump"&&v)keys.jump=true};
  b.addEventListener("pointerdown",e=>{e.preventDefault();set(true)});
  b.addEventListener("pointerup",e=>{e.preventDefault();set(false)});
  b.addEventListener("pointercancel",()=>set(false));b.addEventListener("pointerleave",()=>set(false));
});
document.getElementById("switchBtn").addEventListener("pointerdown",()=>active=active==="boy"?"girl":"boy");

let last=0;function loop(ts){time=ts;updatePlayer(boy,true);updatePlayer(girl,false);updatePuzzle();draw();requestAnimationFrame(loop)}requestAnimationFrame(loop);
