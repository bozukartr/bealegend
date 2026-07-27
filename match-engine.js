(() => {
  class Match2DEngine {
    constructor(host, scene) {
      this.host = host;
      this.scene = scene;
      this.app = null;
      this.route = null;
      this.interactions = null;
      this.activePlayer = null;
      this.ball = null;
      this.previewIndex = 0;
      this.selectedIndex = null;
      this.elapsed = 0;
      this.locked = false;
      this.dragging = false;
      this.animation = null;
      this.resizeObserver = null;
      this.timers = [];
    }

    async init() {
      if (!window.PIXI) throw new Error("PixiJS yüklenemedi");
      this.app = new window.PIXI.Application();
      await this.app.init({
        resizeTo: this.host,
        preference: "webgl",
        preferWebGLVersion: 2,
        antialias: true,
        autoDensity: true,
        resolution: Math.min(window.devicePixelRatio || 1, 2),
        backgroundAlpha: 0,
        powerPreference: "high-performance"
      });
      this.app.canvas.setAttribute("aria-label", "İnteraktif maç taktik sahası");
      this.app.canvas.setAttribute("role", "application");
      this.host.replaceChildren(this.app.canvas);
      this.build();
      this.app.ticker.add(ticker => this.tick(ticker.deltaMS));
      if(typeof ResizeObserver!=="undefined"){
        this.resizeObserver=new ResizeObserver(()=>{if(!this.locked)this.build()});
        this.resizeObserver.observe(this.host);
      }
    }

    build() {
      if (!this.app || !this.app.renderer.width || !this.app.renderer.height) return;
      const { Graphics, Container, Text } = window.PIXI;
      this.width = this.app.renderer.width / this.app.renderer.resolution;
      this.height = this.app.renderer.height / this.app.renderer.resolution;
      const width = this.width, height = this.height;
      this.app.stage.removeAllListeners();
      this.app.stage.removeChildren();

      const pitch = new Graphics().roundRect(0,0,width,height,18).fill(0x274f35);
      for (let index=0;index<8;index++) {
        pitch.rect(index*width/8,0,width/8,height).fill({color:index%2?0x2b573a:0x315f40,alpha:.58});
      }
      pitch.roundRect(12,12,width-24,height-24,11).stroke({width:1.2,color:0xdce8df,alpha:.48});
      pitch.moveTo(width/2,12).lineTo(width/2,height-12).stroke({width:1,color:0xdce8df,alpha:.4});
      pitch.circle(width/2,height/2,Math.min(38,height*.21)).stroke({width:1,color:0xdce8df,alpha:.4});
      pitch.rect(12,height*.25,width*.15,height*.5).stroke({width:1,color:0xdce8df,alpha:.36});
      pitch.rect(width*.85,height*.25,width*.15-12,height*.5).stroke({width:1,color:0xdce8df,alpha:.36});
      this.app.stage.addChild(pitch);

      this.route = new Graphics();
      this.app.stage.addChild(this.route);

      const teams = new Container();
      const homePositions = [[.12,.5],[.25,.18],[.24,.42],[.24,.72],[.38,.26],[.39,.58],[.52,.18],[.55,.72]];
      const awayPositions = [[.88,.5],[.77,.19],[.78,.45],[.76,.76],[.64,.28],[.65,.61],[.52,.38],[.52,.82]];
      homePositions.forEach((position,index)=>teams.addChild(this.player(position,0xdce8df,index===5)));
      awayPositions.forEach(position=>teams.addChild(this.player(position,0xc8956a,false)));

      const activeY=[.32,.5,.68][this.scene.momentIndex%3];
      this.activePlayer=this.player([.47,activeY],0x9fc3b0,true,true);
      teams.addChild(this.activePlayer);
      this.app.stage.addChild(teams);

      this.ball=new Graphics().circle(0,0,4).fill(0xf3eee1).stroke({width:1,color:0x1a271f});
      this.ball.x=width*.51;
      this.ball.y=height*activeY+7;
      this.app.stage.addChild(this.ball);

      const badge=new Text({text:"SEN",style:{fontFamily:"Arial",fontSize:8,fontWeight:"800",fill:0x102017,letterSpacing:1}});
      badge.anchor.set(.5);
      badge.x=this.activePlayer.x;
      badge.y=this.activePlayer.y-18;
      const badgeBack=new Graphics().roundRect(badge.x-18,badge.y-8,36,16,7).fill(0x9fc3b0);
      this.app.stage.addChild(badgeBack,badge);

      this.interactions=new Container();
      this.app.stage.addChild(this.interactions);
      this.preview(this.previewIndex);
      if (this.selectedIndex !== null) this.setTactic(this.selectedIndex);
    }

    player(position, color, highlighted=false, protagonist=false) {
      const player=new window.PIXI.Container();
      const shadow=new window.PIXI.Graphics().ellipse(0,7,9,4).fill({color:0x07100a,alpha:.25});
      const ring=new window.PIXI.Graphics();
      if(highlighted)ring.circle(0,0,11).stroke({width:2,color:protagonist?0x9fc3b0:0xffffff,alpha:.65});
      const body=new window.PIXI.Graphics().circle(0,0,protagonist?7:6).fill(color).stroke({width:1.5,color:0x102017,alpha:.8});
      player.addChild(shadow,ring,body);
      player.x=this.width*position[0];
      player.y=this.height*position[1];
      return player;
    }

    preview(index) {
      if(!this.route||!this.activePlayer||this.locked)return;
      this.previewIndex=index;
      const choice=this.scene.choices[index];
      const targets=[[.78,.22],[.82,.5],[.7,.78]],target=targets[index%targets.length];
      const x1=this.activePlayer.x+7,y1=this.activePlayer.y,x2=this.width*target[0],y2=this.height*target[1];
      const color=choice.risk>=60?0xc8956a:choice.risk>=45?0xe2cf9e:0x9fc3b0;
      this.route.clear().moveTo(x1,y1).bezierCurveTo(x1+45,y1-22,x2-42,y2+18,x2,y2)
        .stroke({width:3,color,alpha:.88}).poly([x2,y2,x2-11,y2-5,x2-8,y2+8]).fill(color);
      this.scene.onPreview?.(index);
    }

    setTactic(index) {
      if(this.locked)return;
      this.selectedIndex=index;
      this.preview(index);
      this.interactions.removeChildren();
      this.app.stage.removeAllListeners();
      this.dragging=false;
      const choice=this.scene.choices[index];
      if(choice.kind==="assist")this.enablePass();
      else if(choice.kind==="goal")this.enableShot();
      else this.enableDefence();
    }

    enablePass() {
      this.scene.onMode?.("Pas vereceğin takım arkadaşına dokun");
      [[.7,.2],[.76,.5],[.68,.78]].forEach((position,index)=>{
        const target=this.target(position,index===1?0xe2cf9e:0x9fc3b0);
        target.on("pointertap",()=>this.execute({x:target.x,y:target.y},index===1?"pass":"through"));
        this.interactions.addChild(target);
      });
    }

    enableShot() {
      const { Graphics, Rectangle }=window.PIXI;
      this.scene.onMode?.("Topun üzerinden kaleye doğru sürükle");
      const guide=new Graphics();
      this.interactions.addChild(guide);
      this.app.stage.eventMode="static";
      this.app.stage.hitArea=new Rectangle(0,0,this.width,this.height);
      this.app.stage.on("pointerdown",event=>{
        if(this.locked)return;
        const point=this.app.stage.toLocal(event.global);
        if(Math.hypot(point.x-this.ball.x,point.y-this.ball.y)>52)return;
        this.dragging=true;
      });
      this.app.stage.on("pointermove",event=>{
        if(!this.dragging||this.locked)return;
        const point=this.app.stage.toLocal(event.global);
        const x=Math.max(this.ball.x+20,Math.min(this.width-15,point.x));
        const y=Math.max(18,Math.min(this.height-18,point.y));
        guide.clear().moveTo(this.ball.x,this.ball.y).lineTo(x,y).stroke({width:3,color:0xe2cf9e,alpha:.95});
        guide.circle(x,y,7).stroke({width:2,color:0xe2cf9e,alpha:.9});
      });
      const release=event=>{
        if(!this.dragging||this.locked)return;
        this.dragging=false;
        const point=this.app.stage.toLocal(event.global);
        if(point.x-this.ball.x<24){guide.clear();this.scene.onMode?.("Daha güçlü bir yön için sağa doğru sürükle");return}
        this.execute({x:this.width*.96,y:Math.max(24,Math.min(this.height-24,point.y))},"shot");
      };
      this.app.stage.on("pointerup",release);
      this.app.stage.on("pointerupoutside",release);
    }

    enableDefence() {
      this.scene.onMode?.("Müdahale edeceğin bölgeye dokun");
      [[.62,.28],[.7,.5],[.64,.72]].forEach((position,index)=>{
        const target=this.target(position,index===1?0xe2cf9e:0xc8956a);
        target.on("pointertap",()=>this.execute({x:target.x,y:target.y},"defend"));
        this.interactions.addChild(target);
      });
    }

    target(position,color) {
      const target=new window.PIXI.Graphics().circle(0,0,15).fill({color,alpha:.13}).stroke({width:2,color,alpha:.85});
      target.circle(0,0,3).fill(color);
      target.x=this.width*position[0];
      target.y=this.height*position[1];
      target.eventMode="static";
      target.cursor="pointer";
      return target;
    }

    execute(target, action) {
      if(this.locked||this.selectedIndex===null)return;
      this.locked=true;
      this.interactions.removeChildren();
      this.app.stage.removeAllListeners();
      this.scene.onMode?.("Pozisyon oynanıyor…");
      const outcome=this.scene.onResolve?.(this.selectedIndex);
      if(!outcome){this.locked=false;return}
      this.animateAction(target,action,outcome);
    }

    animateAction(target,action,outcome) {
      const ballStart={x:this.ball.x,y:this.ball.y};
      const playerStart={x:this.activePlayer.x,y:this.activePlayer.y};
      let final={...target};
      if(action==="shot"&&outcome.outcome==="miss")final={x:this.width+12,y:target.y<this.height/2?8:this.height-8};
      if(action==="defend"&&outcome.outcome==="conceded")final={x:8,y:this.height*.5};
      if(action!=="shot"&&!outcome.success)final={x:(ballStart.x+target.x)*.56,y:(ballStart.y+target.y)*.56};
      this.animation={
        elapsed:0,
        duration:action==="shot"?620:520,
        update:progress=>{
          const eased=1-Math.pow(1-progress,3);
          this.activePlayer.x=playerStart.x+(target.x-playerStart.x)*Math.min(eased*.28,.2);
          this.activePlayer.y=playerStart.y+(target.y-playerStart.y)*Math.min(eased*.28,.2);
          this.ball.x=ballStart.x+(final.x-ballStart.x)*eased;
          this.ball.y=ballStart.y+(final.y-ballStart.y)*eased-Math.sin(progress*Math.PI)*(action==="shot"?18:9);
        },
        complete:()=>this.showOutcome(outcome)
      };
    }

    showOutcome(outcome) {
      const { Container, Graphics, Text }=window.PIXI;
      const labels={goal:"GOL!",assist:"ASİST!",defend:"MÜDAHALE!",success:"BAŞARILI",miss:"KAÇTI",conceded:"GOL YEDİN"};
      const positive=outcome.success&&outcome.outcome!=="conceded";
      const card=new Container();
      const back=new Graphics().roundRect(-58,-20,116,40,13).fill(positive?0x9fc3b0:0xc8956a);
      const text=new Text({text:labels[outcome.outcome]||"DEVAM",style:{fontFamily:"Arial",fontSize:14,fontWeight:"900",fill:0x102017,letterSpacing:1}});
      text.anchor.set(.5);
      card.addChild(back,text);
      card.x=this.width/2;
      card.y=this.height/2;
      card.scale.set(.7);
      this.app.stage.addChild(card);
      this.animation={
        elapsed:0,
        duration:260,
        update:progress=>{card.scale.set(.7+progress*.3);card.alpha=Math.min(1,progress*2)},
        complete:()=>{
          const timer=setTimeout(()=>this.scene.onComplete?.(),520);
          this.timers.push(timer);
        }
      };
    }

    tick(deltaMS) {
      if(!this.activePlayer||!this.ball)return;
      this.elapsed+=deltaMS*.001;
      if(this.animation){
        this.animation.elapsed+=deltaMS;
        const progress=Math.min(1,this.animation.elapsed/this.animation.duration);
        this.animation.update(progress);
        if(progress>=1){const complete=this.animation.complete;this.animation=null;complete?.()}
        return;
      }
      if(!this.locked){
        const pulse=1+Math.sin(this.elapsed*4)*.055;
        this.activePlayer.scale.set(pulse);
      }
    }

    destroy() {
      this.timers.forEach(clearTimeout);
      this.resizeObserver?.disconnect();
      if(this.app)this.app.destroy(true,{children:true});
      this.app=null;
    }
  }

  window.Match2DEngine=Match2DEngine;
})();
