(() => {
  class Match2DEngine {
    constructor(host, scene) {
      this.host = host;
      this.scene = scene;
      this.app = null;
      this.route = null;
      this.activePlayer = null;
      this.ball = null;
      this.previewIndex = 0;
      this.elapsed = 0;
      this.resizeObserver = null;
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
      this.app.canvas.setAttribute("role", "img");
      this.host.replaceChildren(this.app.canvas);
      this.build();
      this.app.ticker.add(ticker => this.tick(ticker.deltaTime));
      this.resizeObserver = new ResizeObserver(() => this.build());
      this.resizeObserver.observe(this.host);
    }

    build() {
      if (!this.app || !this.app.renderer.width || !this.app.renderer.height) return;
      const { Graphics, Container, Text } = window.PIXI;
      const width = this.app.renderer.width / this.app.renderer.resolution;
      const height = this.app.renderer.height / this.app.renderer.resolution;
      this.app.stage.removeChildren();

      const pitch = new Graphics()
        .roundRect(0, 0, width, height, 18)
        .fill({ color: 0x274f35 });
      for (let index = 0; index < 8; index++) {
        pitch.rect(index * width / 8, 0, width / 8, height)
          .fill({ color: index % 2 ? 0x2b573a : 0x315f40, alpha: 0.58 });
      }
      pitch.roundRect(12, 12, width - 24, height - 24, 11)
        .stroke({ width: 1.2, color: 0xdce8df, alpha: 0.48 });
      pitch.moveTo(width / 2, 12).lineTo(width / 2, height - 12)
        .stroke({ width: 1, color: 0xdce8df, alpha: 0.4 });
      pitch.circle(width / 2, height / 2, Math.min(38, height * 0.21))
        .stroke({ width: 1, color: 0xdce8df, alpha: 0.4 });
      pitch.rect(12, height * 0.25, width * 0.15, height * 0.5)
        .stroke({ width: 1, color: 0xdce8df, alpha: 0.36 });
      pitch.rect(width * 0.85, height * 0.25, width * 0.15 - 12, height * 0.5)
        .stroke({ width: 1, color: 0xdce8df, alpha: 0.36 });
      this.app.stage.addChild(pitch);

      this.route = new Graphics();
      this.app.stage.addChild(this.route);

      const teams = new Container();
      const homePositions = [[.12,.5],[.25,.18],[.24,.42],[.24,.72],[.38,.26],[.39,.58],[.52,.18],[.55,.72]];
      const awayPositions = [[.88,.5],[.77,.19],[.78,.45],[.76,.76],[.64,.28],[.65,.61],[.52,.38],[.52,.82]];
      homePositions.forEach((position,index) => teams.addChild(this.player(position,width,height,0xdce8df,index===5)));
      awayPositions.forEach(position => teams.addChild(this.player(position,width,height,0xc8956a,false)));

      const activeY = [.32,.5,.68][this.scene.momentIndex % 3];
      this.activePlayer = this.player([.47,activeY],width,height,0x9fc3b0,true,true);
      this.activePlayer.eventMode = "static";
      this.activePlayer.cursor = "pointer";
      this.activePlayer.on("pointertap", () => this.preview((this.previewIndex + 1) % this.scene.choices.length));
      teams.addChild(this.activePlayer);
      this.app.stage.addChild(teams);

      this.ball = new Graphics().circle(0,0,4).fill(0xf3eee1).stroke({width:1,color:0x1a271f});
      this.ball.x = width * .51;
      this.ball.y = height * activeY + 7;
      this.app.stage.addChild(this.ball);

      const badge = new Text({
        text: "SEN",
        style: { fontFamily: "Arial", fontSize: 8, fontWeight: "800", fill: 0x102017, letterSpacing: 1 }
      });
      badge.anchor.set(.5);
      badge.x = this.activePlayer.x;
      badge.y = this.activePlayer.y - 18;
      const badgeBack = new Graphics().roundRect(badge.x-18,badge.y-8,36,16,7).fill(0x9fc3b0);
      this.app.stage.addChild(badgeBack,badge);
      this.preview(this.previewIndex);
    }

    player(position, width, height, color, highlighted = false, protagonist = false) {
      const player = new window.PIXI.Container();
      const shadow = new window.PIXI.Graphics().ellipse(0,7,9,4).fill({color:0x07100a,alpha:.25});
      const ring = new window.PIXI.Graphics();
      if (highlighted) ring.circle(0,0,11).stroke({width:2,color:protagonist?0x9fc3b0:0xffffff,alpha:.65});
      const body = new window.PIXI.Graphics().circle(0,0,protagonist?7:6).fill(color).stroke({width:1.5,color:0x102017,alpha:.8});
      player.addChild(shadow,ring,body);
      player.x = width * position[0];
      player.y = height * position[1];
      return player;
    }

    preview(index) {
      if (!this.route || !this.activePlayer) return;
      this.previewIndex = index;
      const choice = this.scene.choices[index];
      const width = this.app.renderer.width / this.app.renderer.resolution;
      const height = this.app.renderer.height / this.app.renderer.resolution;
      const targets = [[.78,.22],[.82,.5],[.7,.78]];
      const target = targets[index % targets.length];
      const x1 = this.activePlayer.x + 7;
      const y1 = this.activePlayer.y;
      const x2 = width * target[0];
      const y2 = height * target[1];
      const color = choice.risk >= 60 ? 0xc8956a : choice.risk >= 45 ? 0xe2cf9e : 0x9fc3b0;
      this.route.clear()
        .moveTo(x1,y1)
        .bezierCurveTo(x1+45,y1-22,x2-42,y2+18,x2,y2)
        .stroke({width:3,color,alpha:.88})
        .poly([x2,y2,x2-11,y2-5,x2-8,y2+8])
        .fill(color);
      this.scene.onPreview?.(index);
    }

    tick(delta) {
      if (!this.activePlayer || !this.ball) return;
      this.elapsed += delta * .055;
      const pulse = 1 + Math.sin(this.elapsed * 2.2) * .055;
      this.activePlayer.scale.set(pulse);
      this.ball.y += Math.sin(this.elapsed * 2.8) * .025;
    }

    destroy() {
      this.resizeObserver?.disconnect();
      if (this.app) this.app.destroy(true,{children:true});
      this.app = null;
    }
  }

  window.Match2DEngine = Match2DEngine;
})();
