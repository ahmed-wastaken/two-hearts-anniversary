/*
  TWO HEARTS — Anniversary Puzzle
  A single-file playable Phaser prototype with procedural pixel-art graphics.
  Change these two values for your final gift:
*/
const ANNIVERSARY_MESSAGE = "Happy Anniversary ❤️";
const ANNIVERSARY_DESTINATION_URL = ""; // e.g. "https://example.com"

const W = 480, H = 270;
const TILE = 16;
const WORLD_W = 2400;
const WORLD_H = 270;

const PALETTE = {
  sky: 0x18182c, sky2: 0x24213d, navy: 0x151526,
  burgundy: 0x733d54, rose: 0xc87582, peach: 0xe5a58f,
  cream: 0xf5dfc8, gold: 0xe4bd72, green: 0x63775e,
  darkGreen: 0x34443e, brown: 0x513b3d, stone: 0x68606b,
  water: 0x475d78, white: 0xfff5eb
};

class BootScene extends Phaser.Scene {
  constructor(){ super("Boot"); }
  create(){
    this.makeTextures();
    this.scene.start("Game");
  }

  makeTextures(){
    // Tiny procedural pixel sprites. All shapes are generated at integer pixels
    // and scaled with nearest-neighbor filtering for crisp pixel art.
    const g = this.make.graphics({x:0,y:0,add:false});

    const sprite = (key, draw, sw=16, sh=24) => {
      g.clear(); draw(g); g.generateTexture(key, sw, sh); g.clear();
    };

    sprite("boy", g=>{
      g.fillStyle(0x2a2230); g.fillRect(5,0,7,2);
      g.fillStyle(0x3a2831); g.fillRect(4,2,9,6);
      g.fillStyle(0xd49b7e); g.fillRect(5,4,7,6);
      g.fillStyle(0x2a2230); g.fillRect(5,5,2,1); g.fillRect(10,5,2,1);
      g.fillStyle(0xf1dcc8); g.fillRect(4,9,9,7);
      g.fillStyle(0x8a485a); g.fillRect(7,9,3,4);
      g.fillStyle(0x302b38); g.fillRect(5,16,4,6); g.fillRect(10,16,4,6);
      g.fillStyle(0x211e2a); g.fillRect(4,22,5,2); g.fillRect(10,22,5,2);
    },16,24);

    sprite("girl", g=>{
      g.fillStyle(0x33242e); g.fillRect(3,1,11,7);
      g.fillStyle(0x3f2935); g.fillRect(2,5,13,9);
      g.fillStyle(0xd49b7e); g.fillRect(5,4,7,6);
      g.fillStyle(0x2a2230); g.fillRect(5,5,2,1); g.fillRect(10,5,2,1);
      g.fillStyle(0xf1d0cf); g.fillRect(4,10,9,6);
      g.fillStyle(0xc87582); g.fillRect(7,10,3,4);
      g.fillStyle(0x51313c); g.fillRect(4,16,9,5);
      g.fillStyle(0x302530); g.fillRect(5,21,4,2); g.fillRect(10,21,4,2);
    },16,24);

    sprite("block", g=>{
      g.fillStyle(PALETTE.brown); g.fillRect(1,1,14,14);
      g.fillStyle(PALETTE.cream); g.fillRect(3,3,10,2);
      g.fillStyle(0x3e3034); g.fillRect(3,12,10,2);
      g.fillStyle(PALETTE.gold); g.fillRect(5,6,6,5);
    },16,16);

    sprite("flower", g=>{
      g.fillStyle(PALETTE.green); g.fillRect(7,8,2,8);
      g.fillStyle(PALETTE.rose); g.fillRect(4,4,4,4); g.fillRect(9,4,4,4);
      g.fillRect(6,2,4,4); g.fillRect(6,7,4,4);
      g.fillStyle(PALETTE.gold); g.fillRect(7,6,2,2);
    },16,16);

    g.destroy();
  }
}

class GameScene extends Phaser.Scene {
  constructor(){ super("Game"); }

  create(){
    this.cameras.main.setBackgroundColor(PALETTE.sky);
    this.physics.world.setBounds(0,0,WORLD_W,WORLD_H);
    this.active = "boy";
    this.boy = null; this.girl = null;
    this.boySpawn = {x:72,y:210};
    this.girlSpawn = {x:2328,y:210};
    this.checkpoint = {x:72,y:210};
    this.reunion = false;
    this.finished = false;
    this.buildWorld();
    this.buildCharacters();
    this.buildUI();
    this.setupInput();
    this.setupCamera();
    this.showHint("Two hearts. One journey.", 2200);
  }

  addPlatform(x,y,w,h, color=PALETTE.brown){
    const r = this.add.rectangle(x+w/2,y+h/2,w,h,color).setOrigin(.5);
    this.physics.add.existing(r,true);
    return r;
  }

  addPlate(x,y,color){
    const plate = this.add.rectangle(x,y,22,5,0x8d6470).setStrokeStyle(1,0xd8b6a6);
    plate.activated=false; plate.kind=color;
    return plate;
  }

  buildWorld(){
    // Layered background
    this.bgFar = this.add.graphics();
    this.bgFar.fillStyle(PALETTE.sky); this.bgFar.fillRect(0,0,WORLD_W,H);
    this.bgFar.fillStyle(PALETTE.sky2);
    for(let x=0;x<WORLD_W;x+=120){
      const h=28+((x/120)%3)*13;
      this.bgFar.fillTriangle(x,190,x+60,190-h,x+120,190);
    }

    // Moon + stars
    this.bgFar.fillStyle(0xf1dfc5);
    this.bgFar.fillCircle(2050,55,22);
    this.bgFar.fillStyle(PALETTE.sky);
    this.bgFar.fillCircle(2060,48,18);
    for(let i=0;i<100;i++){
      const x=(i*83)%WORLD_W, y=15+((i*47)%105);
      this.add.rectangle(x,y,1,1, i%4===0?PALETTE.gold:0xb9a7bd);
    }

    // Distant trees
    this.mid = this.add.graphics();
    for(let x=0;x<WORLD_W;x+=70){
      const yy=170-((x*7)%18);
      this.mid.fillStyle(0x2a3040);
      this.mid.fillRect(x+30,yy,5,40);
      this.mid.fillCircle(x+32,yy,18);
      this.mid.fillCircle(x+17,yy+7,13);
      this.mid.fillCircle(x+47,yy+8,14);
    }

    // Ground
    this.addPlatform(0,226,WORLD_W,44,PALETTE.darkGreen);
    for(let x=0;x<WORLD_W;x+=8){
      if((x/8)%3!==0) this.add.rectangle(x,222,2,4,PALETTE.green);
    }

    // Sections / landmarks
    this.drawLanterns();
    this.drawFlowers();
    this.drawBridge();
    this.drawFinalGarden();

    // Solid platforms for puzzle routes
    this.addPlatform(40,210,70,16);
    this.addPlatform(150,185,75,16);
    this.addPlatform(270,205,75,16);
    this.addPlatform(390,165,80,16);

    this.addPlatform(520,210,100,16);
    this.addPlatform(650,180,80,16);
    this.addPlatform(780,210,80,16);

    this.addPlatform(900,190,100,16);
    this.addPlatform(1030,150,90,16);
    this.addPlatform(1150,205,80,16);

    this.addPlatform(1280,205,110,16);
    this.addPlatform(1430,165,90,16);
    this.addPlatform(1550,205,90,16);

    this.addPlatform(1710,205,100,16);
    this.addPlatform(1850,175,90,16);
    this.addPlatform(1980,205,90,16);
    this.addPlatform(2110,170,90,16);
    this.addPlatform(2240,205,120,16);

    // Pressure plates and doors
    this.plate1 = this.addPlate(600,205,"rose");
    this.door1 = this.addPlatform(735,145,14,81,PALETTE.burgundy);

    this.plate2 = this.addPlate(1090,145,"gold");
    this.door2 = this.addPlatform(1235,125,14,101,PALETTE.gold);

    this.plate3 = this.addPlate(1480,160,"rose");
    this.plate4 = this.addPlate(1880,170,"gold");
    this.door3 = this.addPlatform(2055,125,14,101,PALETTE.rose);

    // Movable blocks
    this.blocks = this.physics.add.group({immovable:false,allowGravity:true});
    this.makeBlock(570,188);
    this.makeBlock(970,168);
    this.makeBlock(1450,143);
    this.makeBlock(1850,153);

    // Character-specific mechanisms
    this.roseGate = this.add.rectangle(850,190,10,36,PALETTE.burgundy);
    this.moonGate = this.add.rectangle(1395,165,10,61,PALETTE.water);

    // Final activation points
    this.finalLeft = this.add.circle(2180,200,10,PALETTE.burgundy).setStrokeStyle(2,PALETTE.cream);
    this.finalRight = this.add.circle(2210,200,10,PALETTE.gold).setStrokeStyle(2,PALETTE.cream);
    this.finalLeft.active=false; this.finalRight.active=false;

    this.physics.add.staticGroup(); // keeps physics setup predictable
  }

  makeBlock(x,y){
    const b=this.physics.add.image(x,y,"block");
    b.setCollideWorldBounds(true);
    b.setBounce(0);
    b.setDragX(700);
    b.body.setMaxVelocity(110,400);
    this.blocks.add(b);
    return b;
  }

  drawLanterns(){
    for(let x=330;x<2100;x+=210){
      this.add.rectangle(x,170,2,40,PALETTE.brown);
      this.add.rectangle(x-5,166,12,9,PALETTE.gold);
      this.add.rectangle(x-3,168,8,5,PALETTE.peach);
    }
  }

  drawFlowers(){
    for(let x=80;x<2320;x+=47){
      if(x>540&&x<640) continue;
      const y=214-((x*13)%12);
      this.add.image(x,y,"flower").setScale(.65);
    }
  }

  drawBridge(){
    for(let x=1120;x<1280;x+=18){
      this.add.rectangle(x,218,14,7,PALETTE.brown);
    }
    this.add.rectangle(1200,205,120,4,PALETTE.burgundy);
  }

  drawFinalGarden(){
    // Arch / gazebo-like reunion landmark
    const g=this.add.graphics();
    g.lineStyle(6,PALETTE.burgundy);
    g.strokeCircle(2195,140,75);
    g.lineStyle(2,PALETTE.gold);
    g.strokeCircle(2195,140,68);
    for(let a=0;a<Math.PI*2;a+=Math.PI/6){
      const x=2195+Math.cos(a)*68, y=140+Math.sin(a)*68;
      this.add.image(x,y,"flower").setScale(.7);
    }
    this.heartGlow = this.add.graphics();
    this.heartGlow.setAlpha(.1);
    this.drawHeart(this.heartGlow,2195,140,30,PALETTE.rose);
  }

  drawHeart(g,x,y,s,color){
    g.fillStyle(color);
    const pts=[];
    for(let t=0;t<=Math.PI*2;t+=.08){
      const X=16*Math.pow(Math.sin(t),3);
      const Y=-(13*Math.cos(t)-5*Math.cos(2*t)-2*Math.cos(3*t)-Math.cos(4*t));
      pts.push({x:x+X*s/16,y:y+Y*s/16});
    }
    g.beginPath(); g.moveTo(pts[0].x,pts[0].y);
    pts.slice(1).forEach(p=>g.lineTo(p.x,p.y));
    g.closePath(); g.fillPath();
  }

  buildCharacters(){
    this.boy=this.physics.add.sprite(this.boySpawn.x,this.boySpawn.y,"boy");
    this.girl=this.physics.add.sprite(this.girlSpawn.x,this.girlSpawn.y,"girl");
    for(const p of [this.boy,this.girl]){
      p.setCollideWorldBounds(true);
      p.body.setSize(10,22).setOffset(3,2);
      p.setGravityY(500);
      p.setDepth(10);
    }

    this.platforms=this.physics.add.staticGroup();
    // Re-create collision geometry matching visible platforms.
    const rects=[
      [40,210,70,16],[150,185,75,16],[270,205,75,16],[390,165,80,16],
      [520,210,100,16],[650,180,80,16],[780,210,80,16],[900,190,100,16],
      [1030,150,90,16],[1150,205,80,16],[1280,205,110,16],[1430,165,90,16],
      [1550,205,90,16],[1710,205,100,16],[1850,175,90,16],[1980,205,90,16],
      [2110,170,90,16],[2240,205,120,16],[0,226,WORLD_W,44]
    ];
    rects.forEach(a=>this.addPlatformCollision(a[0],a[1],a[2],a[3]));
    // Doors are also colliders; their visibility is toggled by puzzle state.
    this.doorBodies=[
      this.addPlatformCollision(735,145,14,81),
      this.addPlatformCollision(1235,125,14,101),
      this.addPlatformCollision(2055,125,14,101)
    ];

    this.physics.add.collider(this.boy,this.platforms);
    this.physics.add.collider(this.girl,this.platforms);
    this.physics.add.collider(this.boy,this.blocks,this.pushBlock,null,this);
    this.physics.add.collider(this.girl,this.blocks,this.pushBlock,null,this);
  }

  addPlatformCollision(x,y,w,h){
    const r=this.physics.add.staticImage(x+w/2,y+h/2,null);
    r.setSize(w,h);
    this.platforms.add(r);
    return r;
  }

  pushBlock(char,block){
    if(Math.abs(char.body.velocity.x)>5){
      block.setVelocityX(char.body.velocity.x*0.75);
    }
  }

  setupCamera(){
    this.cameras.main.setBounds(0,0,WORLD_W,H);
    this.cameras.main.startFollow(this[this.active],true,.08,.08);
    this.cameras.main.setZoom(Math.max(1,Math.min(window.innerWidth/W,window.innerHeight/H)));
    this.scale.on("resize",()=>this.cameras.main.setZoom(Math.max(1,Math.min(window.innerWidth/W,window.innerHeight/H))));
  }

  setupInput(){
    this.keys=this.input.keyboard.addKeys({
      left:"A",right:"D",jump:"SPACE",switch:"TAB",up:"W"
    });
    this.cursors=this.input.keyboard.createCursorKeys();
    this.keys.switch.on("down",()=>this.switchCharacter());

    this.input.on("pointerdown",(p)=>{
      if(p.x>this.scale.gameSize.width*.72 && p.y>this.scale.gameSize.height*.68) this.doJump();
      else if(p.x<this.scale.gameSize.width*.25 && p.y>this.scale.gameSize.height*.68) this.moveTouch(-1);
      else if(p.x<this.scale.gameSize.width*.55 && p.y>this.scale.gameSize.height*.68) this.moveTouch(1);
    });
    this.touch={dir:0};
  }

  buildUI(){
    const s=this.add.container(0,0).setScrollFactor(0).setDepth(100);
    this.ui=s;
    this.uiLabel=this.add.text(14,12,"BOY  •  WASD / ARROWS  •  TAB TO SWITCH",{
      fontFamily:"monospace",fontSize:"8px",color:"#f5dfc8"
    }).setScrollFactor(0);
    s.add(this.uiLabel);

    this.switchBtn=this.add.rectangle(W-55,H-30,72,24,0x513b4b,.92)
      .setStrokeStyle(1,PALETTE.cream).setInteractive().setScrollFactor(0);
    this.switchText=this.add.text(W-55,H-30,"SWITCH",{
      fontFamily:"monospace",fontSize:"8px",color:"#fff5eb"
    }).setOrigin(.5).setScrollFactor(0);
    this.switchBtn.on("pointerdown",()=>this.switchCharacter());
    s.add([this.switchBtn,this.switchText]);

    this.jumpBtn=this.add.rectangle(W-112,H-30,54,24,0x513b4b,.72)
      .setStrokeStyle(1,PALETTE.cream).setInteractive().setScrollFactor(0);
    this.add.text(W-112,H-30,"JUMP",{fontFamily:"monospace",fontSize:"8px",color:"#fff5eb"})
      .setOrigin(.5).setScrollFactor(0);
    this.jumpBtn.on("pointerdown",()=>this.doJump());
    s.add(this.jumpBtn);

    this.hint=this.add.text(W/2,20,"",{fontFamily:"monospace",fontSize:"9px",color:"#f5dfc8",align:"center"})
      .setOrigin(.5).setScrollFactor(0).setAlpha(0);
    s.add(this.hint);

    // Fade overlay
    this.fade=this.add.rectangle(W/2,H/2,W,H,PALETTE.navy,0).setScrollFactor(0);
    s.add(this.fade);
  }

  showHint(text,duration=1800){
    this.hint.setText(text).setAlpha(0);
    this.tweens.add({targets:this.hint,alpha:1,duration:220,yoyo:true,hold:duration});
  }

  switchCharacter(){
    if(this.reunion) return;
    this.active=this.active==="boy"?"girl":"boy";
    const p=this[this.active];
    this.cameras.main.startFollow(p,true,.08,.08);
    this.uiLabel.setText(this.active.toUpperCase()+"  •  "+(this.active==="boy"?"WASD / ARROWS":"WASD / ARROWS")+"  •  TAB TO SWITCH");
  }

  moveTouch(dir){ this.touch.dir=dir; setTimeout(()=>this.touch.dir=0,180); }

  doJump(){
    const p=this[this.active];
    if(p.body.blocked.down || p.body.touching.down) p.setVelocityY(-190);
  }

  update(){
    if(this.reunion) return;
    const p=this[this.active];
    let dir=0;
    if(this.cursors.left.isDown||this.keys.left.isDown) dir=-1;
    if(this.cursors.right.isDown||this.keys.right.isDown) dir=1;
    if(this.touch.dir) dir=this.touch.dir;

    p.setVelocityX(dir*92);
    if(dir!==0) p.flipX=dir<0;

    if((Phaser.Input.Keyboard.JustDown(this.cursors.up)||Phaser.Input.Keyboard.JustDown(this.keys.jump)) && (p.body.blocked.down||p.body.touching.down)){
      p.setVelocityY(-190);
    }

    this.solvePuzzles();
    this.animateCharacters();
    this.checkpointLogic();
  }

  animateCharacters(){
    for(const p of [this.boy,this.girl]){
      if(Math.abs(p.body.velocity.x)>8 && (p.body.blocked.down||p.body.touching.down)){
        p.setScale(1,0.96+Math.sin(this.time.now/70)*0.02);
      } else p.setScale(1);
    }
  }

  isOn(plate, char){
    return Math.abs(char.x-plate.x)<17 && Math.abs(char.y-plate.y)<20 && (char.body.blocked.down||char.body.touching.down);
  }

  solvePuzzles(){
    // Plate 1: boy can leave a door open for girl.
    const a=this.isOn(this.plate1,this.boy)||this.isOn(this.plate1,this.girl);
    this.setDoor(0,!a);
    // Character-specific gates: boy opens rose, girl opens moon.
    const rose=(this.active==="boy" && Math.abs(this.boy.x-820)<90);
    const moon=(this.active==="girl" && Math.abs(this.girl.x-1360)<90);
    this.roseGate.setVisible(!rose);
    this.moonGate.setVisible(!moon);

    const b=this.isOn(this.plate2,this.girl)||this.isOn(this.plate2,this.boy);
    this.setDoor(1,!b);

    const c=this.isOn(this.plate3,this.boy)||this.isOn(this.plate3,this.girl);
    this.plate3.fillColor=c?PALETTE.gold:0x8d6470;

    const d=this.isOn(this.plate4,this.girl)||this.isOn(this.plate4,this.boy);
    this.setDoor(2,!d);

    // Final: both must arrive at the two glowing points.
    this.finalLeft.active=this.distance(this.boy,this.finalLeft)<18;
    this.finalRight.active=this.distance(this.girl,this.finalRight)<18;
    this.finalLeft.setFillStyle(this.finalLeft.active?PALETTE.gold:PALETTE.burgundy);
    this.finalRight.setFillStyle(this.finalRight.active?PALETTE.rose:PALETTE.gold);

    if(this.finalLeft.active && this.finalRight.active && !this.reunion) this.startReunion();
  }

  setDoor(index,closed){
    const visual=[this.door1,this.door2,this.door3][index];
    const body=this.doorBodies[index];
    visual.setVisible(closed);
    body.body.enable=closed;
  }

  distance(a,b){ return Phaser.Math.Distance.Between(a.x,a.y,b.x,b.y); }

  checkpointLogic(){
    const x=Math.max(this.boy.x,this.girl.x);
    if(x>900) this.checkpoint={x:900,y:190};
    if(x>1500) this.checkpoint={x:1500,y:190};
  }

  startReunion(){
    this.reunion=true;
    this.physics.world.pause();
    this.tweens.add({targets:[this.boy,this.girl],x:2195,duration:1800,ease:"Sine.easeInOut"});
    this.tweens.add({targets:[this.boy,this.girl],y:190,duration:500,delay:1300});
    this.cameras.main.stopFollow();
    this.time.delayedCall(1700,()=>this.reunionHeart());
  }

  reunionHeart(){
    this.tweens.add({targets:this.heartGlow,alpha:.85,duration:800,yoyo:true,repeat:2});
    for(let i=0;i<28;i++){
      const p=this.add.text(2195+(Math.random()-.5)*80,190+(Math.random()-.5)*35,"♥",{
        fontFamily:"monospace",fontSize:(6+Math.random()*7)+"px",color:i%2?"#c87582":"#e4bd72"
      }).setDepth(30);
      this.tweens.add({targets:p,y:p.y-40-Math.random()*35,alpha:0,duration:1000+Math.random()*800,delay:Math.random()*300});
    }
    this.time.delayedCall(2500,()=>this.finishScene());
  }

  finishScene(){
    if(this.finished) return;
    this.finished=true;
    this.fade.setFillStyle(PALETTE.navy,0);
    this.tweens.add({
      targets:this.fade,alpha:1,duration:900,onComplete:()=>{
        this.showFinalCard();
      }
    });
  }

  showFinalCard(){
    this.ui.removeAll(true);
    const g=this.add.graphics().setScrollFactor(0).setDepth(200);
    g.fillStyle(PALETTE.navy); g.fillRect(0,0,W,H);
    g.fillStyle(PALETTE.burgundy); g.fillCircle(W/2,H/2-20,45);
    const heart=this.add.graphics().setScrollFactor(0).setDepth(201);
    this.drawHeart(heart,W/2,H/2-20,35,PALETTE.rose);
    this.add.text(W/2,H/2+38,ANNIVERSARY_MESSAGE,{
      fontFamily:"monospace",fontSize:"15px",color:"#f5dfc8",align:"center"
    }).setOrigin(.5).setScrollFactor(0).setDepth(202);

    const btn=this.add.rectangle(W/2,H/2+75,115,25,PALETTE.gold).setScrollFactor(0).setDepth(202).setInteractive();
    this.add.text(W/2,H/2+75,"CONTINUE  ♥",{
      fontFamily:"monospace",fontSize:"9px",color:"#30232b"
    }).setOrigin(.5).setScrollFactor(0).setDepth(203);
    btn.on("pointerdown",()=>{
      if(ANNIVERSARY_DESTINATION_URL) window.location.href=ANNIVERSARY_DESTINATION_URL;
    });
    if(!ANNIVERSARY_DESTINATION_URL){
      this.add.text(W/2,H/2+96,"Set ANNIVERSARY_DESTINATION_URL in game.js",{
        fontFamily:"monospace",fontSize:"6px",color:"#b9a7bd"
      }).setOrigin(.5).setScrollFactor(0).setDepth(203);
    }
  }
}

const config = {
  type: Phaser.AUTO,
  parent: "game",
  width: W,
  height: H,
  pixelArt: true,
  antialias: false,
  backgroundColor: "#18182c",
  physics: {
    default: "arcade",
    arcade: { gravity: {y:0}, debug:false }
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: W,
    height: H
  },
  render: {
    pixelArt: true,
    antialias: false,
    roundPixels: true
  },
  scene: [BootScene,GameScene]
};

new Phaser.Game(config);
