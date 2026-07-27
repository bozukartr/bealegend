(() => {
  class Match2DEngine {
    constructor(host, scene) {
      this.host = host;
      this.scene = scene;
      this.app = null;
      this.physics = null;
      this.bodies = [];
      this.visuals = [];
      this.ball = null;
      this.actor = null;
      this.goalkeeper = null;
      this.guide = null;
      this.overlay = null;
      this.anchor = null;
      this.dragPoint = null;
      this.dragging = false;
      this.released = false;
      this.resolved = false;
      this.destroyed = false;
      this.elapsed = 0;
      this.releaseElapsed = 0;
      this.quality = 0;
      this.timers = [];
      this.resizeTimer = null;
      this.resizeObserver = null;
      this.tickHandler = ticker => this.tick(ticker.deltaMS);
      this.collisionHandler = event => this.onCollision(event);
    }

    async init() {
      if (!window.PIXI || !window.Matter) throw new Error("2D fizik motoru yüklenemedi");
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
      this.app.canvas.setAttribute("aria-label", "Tam ekran fizik tabanlı maç sekansı");
      this.app.canvas.setAttribute("role", "application");
      this.host.replaceChildren(this.app.canvas);
      this.build();
      this.app.ticker.add(this.tickHandler);
      if (typeof ResizeObserver !== "undefined") {
        this.resizeObserver = new ResizeObserver(() => {
          if (this.released || this.destroyed) return;
          clearTimeout(this.resizeTimer);
          this.resizeTimer = setTimeout(() => this.build(), 80);
        });
        this.resizeObserver.observe(this.host);
      }
    }

    build() {
      if (!this.app || this.destroyed || !this.app.screen.width || !this.app.screen.height) return;
      const { Engine, Composite, Events } = window.Matter;
      if (this.physics) {
        Events.off(this.physics, "collisionStart", this.collisionHandler);
        Composite.clear(this.physics.world, false, true);
        Engine.clear(this.physics);
      }
      this.width = this.app.screen.width;
      this.height = this.app.screen.height;
      this.released = false;
      this.resolved = false;
      this.dragging = false;
      this.releaseElapsed = 0;
      this.bodies = [];
      this.visuals = [];
      this.app.stage.removeAllListeners();
      this.app.stage.removeChildren();
      this.physics = Engine.create();
      this.physics.gravity.scale = 0;
      Events.on(this.physics, "collisionStart", this.collisionHandler);

      this.drawPitch();
      this.guide = new window.PIXI.Graphics();
      this.app.stage.addChild(this.guide);
      if (this.scene.mode === "shot") this.buildShot();
      else if (this.scene.mode === "pass") this.buildPass();
      else this.buildDefence();
      this.drawInstructions();
      this.enableSling();
      this.syncVisuals();
    }

    drawPitch() {
      const { Graphics, Text } = window.PIXI;
      const width = this.width, height = this.height;
      const pitch = new Graphics().rect(0, 0, width, height).fill(0x234d31);
      const stripeWidth = width / 10;
      for (let index = 0; index < 10; index++) {
        pitch.rect(index * stripeWidth, 0, stripeWidth, height)
          .fill({ color: index % 2 ? 0x2a5938 : 0x326342, alpha: .62 });
      }
      const inset = Math.max(16, Math.min(width, height) * .035);
      pitch.rect(inset, inset, width - inset * 2, height - inset * 2)
        .stroke({ width: 2, color: 0xe3eee5, alpha: .53 });
      pitch.moveTo(width / 2, inset).lineTo(width / 2, height - inset)
        .stroke({ width: 1.5, color: 0xe3eee5, alpha: .4 });
      pitch.circle(width / 2, height / 2, Math.min(width, height) * .12)
        .stroke({ width: 1.5, color: 0xe3eee5, alpha: .4 });
      pitch.circle(width / 2, height / 2, 3).fill({ color: 0xe3eee5, alpha: .5 });
      const boxW = width * .15, boxH = height * .5;
      pitch.rect(inset, (height - boxH) / 2, boxW, boxH)
        .stroke({ width: 1.5, color: 0xe3eee5, alpha: .42 });
      pitch.rect(width - inset - boxW, (height - boxH) / 2, boxW, boxH)
        .stroke({ width: 1.5, color: 0xe3eee5, alpha: .42 });
      this.app.stage.addChild(pitch);

      const live = new Text({
        text: "LIVE · PHYSICS 2D",
        style: { fontFamily: "Arial", fontSize: 9, fontWeight: "800", fill: 0xdce8df, letterSpacing: 1.5 }
      });
      live.x = inset + 10;
      live.y = height - inset - 23;
      live.alpha = .7;
      this.app.stage.addChild(live);
    }

    buildShot() {
      const width = this.width, height = this.height;
      const goalX = width - Math.max(24, width * .035);
      const goalTop = height * .3, goalBottom = height * .7;
      this.drawGoal(goalX, goalTop, goalBottom);
      this.ball = this.circleBody(width * .28, height * .58, this.ballRadius(), {
        label: "ball", restitution: .7, frictionAir: .014, isStatic: true
      }, 0xf4f0e4, 0x17241c);
      this.actor = this.playerBody(width * .22, height * .63, 0x9fc3b0, "actor", true, true);
      this.goalkeeper = this.playerBody(width * .86, height * .5, 0xe6b77f, "goalkeeper", true, false, 11);
      this.addStaticPlayer(width * .55, height * .42, 0xc8956a, "defender");
      this.addStaticPlayer(width * .66, height * .65, 0xc8956a, "defender");
      this.sensorBody(goalX - 10, height * .5, 18, goalBottom - goalTop - 12, "goal");
      this.anchor = { x: this.ball.position.x, y: this.ball.position.y };
      this.target = { x: goalX - 8, y: height * .5 };
      this.scene.onMode?.("ŞUT · Topa dokun, geriye çek ve kaleye bırak");
    }

    buildPass() {
      const width = this.width, height = this.height;
      this.ball = this.circleBody(width * .24, height * .63, this.ballRadius(), {
        label: "ball", restitution: .58, frictionAir: .02, isStatic: true
      }, 0xf4f0e4, 0x17241c);
      this.actor = this.playerBody(width * .19, height * .68, 0x9fc3b0, "actor", true, true);
      const targetX = width * .8, targetY = height * .34;
      this.playerBody(targetX, targetY, 0xdce8df, "teammate", true, false);
      this.addStaticPlayer(width * .5, height * .43, 0xc8956a, "defender");
      this.addStaticPlayer(width * .62, height * .58, 0xc8956a, "defender");
      this.addStaticPlayer(width * .69, height * .27, 0xc8956a, "defender");
      this.sensorBody(targetX, targetY, Math.max(52, width * .075), Math.max(52, height * .14), "pass-target", true);
      this.anchor = { x: this.ball.position.x, y: this.ball.position.y };
      this.target = { x: targetX, y: targetY };
      this.drawTarget(targetX, targetY, "PAS ALANI");
      this.scene.onMode?.("PAS · Topa dokun, geriye çek ve hedef bölgeye bırak");
    }

    buildDefence() {
      const { Body } = window.Matter;
      const width = this.width, height = this.height;
      this.actor = this.playerBody(width * .28, height * .68, 0x9fc3b0, "actor", false, true);
      this.ball = this.circleBody(width * .72, height * .34, this.ballRadius(), {
        label: "ball", restitution: .52, frictionAir: .005
      }, 0xf4f0e4, 0x17241c);
      this.playerBody(width * .76, height * .31, 0xc8956a, "opponent", true, false);
      this.addStaticPlayer(width * .48, height * .48, 0xc8956a, "screen");
      this.sensorBody(width * .08, height * .5, 18, height * .66, "concede");
      this.anchor = { x: this.actor.position.x, y: this.actor.position.y };
      this.target = { x: this.ball.position.x, y: this.ball.position.y };
      Body.setVelocity(this.ball, { x: -3.1, y: 1.05 });
      this.scene.onMode?.("MÜDAHALE · Oyuncuyu geriye çek ve topun yoluna bırak");
    }

    drawGoal(x, top, bottom) {
      const goal = new window.PIXI.Graphics();
      const depth = Math.max(20, this.width * .025);
      goal.moveTo(x, top).lineTo(x + depth, top + 8).lineTo(x + depth, bottom - 8).lineTo(x, bottom)
        .stroke({ width: 3, color: 0xf1f3eb, alpha: .9 });
      for (let y = top + 12; y < bottom; y += 16) {
        goal.moveTo(x, y).lineTo(x + depth, y).stroke({ width: 1, color: 0xf1f3eb, alpha: .25 });
      }
      this.app.stage.addChild(goal);
      this.staticRect(x, top, 7, 14, "post");
      this.staticRect(x, bottom, 7, 14, "post");
    }

    drawTarget(x, y, label) {
      const { Graphics, Text } = window.PIXI;
      const ring = new Graphics().circle(x, y, Math.max(29, Math.min(this.width, this.height) * .07))
        .fill({ color: 0x9fc3b0, alpha: .08 })
        .stroke({ width: 2, color: 0xbcd7c2, alpha: .66 });
      const text = new Text({
        text: label,
        style: { fontFamily: "Arial", fontSize: 8, fontWeight: "800", fill: 0xdce8df, letterSpacing: 1.2 }
      });
      text.anchor.set(.5);
      text.x = x;
      text.y = y + Math.max(38, Math.min(this.width, this.height) * .085);
      this.app.stage.addChild(ring, text);
    }

    drawInstructions() {
      const { Graphics, Text } = window.PIXI;
      const isDefend = this.scene.mode === "defend";
      const dragBody = isDefend ? this.actor : this.ball;
      const pulse = new Graphics().circle(dragBody.position.x, dragBody.position.y, 25)
        .stroke({ width: 2, color: 0xe8f2eb, alpha: .42 });
      pulse.label = "pulse";
      const hint = new Text({
        text: isDefend ? "OYUNCUYU ÇEK" : "TOPU GERİYE ÇEK",
        style: { fontFamily: "Arial", fontSize: 9, fontWeight: "900", fill: 0xffffff, letterSpacing: 1.4 }
      });
      hint.anchor.set(.5);
      hint.x = dragBody.position.x;
      hint.y = dragBody.position.y - 38;
      hint.label = "hint";
      this.app.stage.addChild(pulse, hint);
      this.pulse = pulse;
      this.hint = hint;
    }

    enableSling() {
      const { Rectangle } = window.PIXI;
      const stage = this.app.stage;
      stage.eventMode = "static";
      stage.hitArea = new Rectangle(0, 0, this.width, this.height);
      stage.on("pointerdown", event => {
        if (this.released || this.resolved) return;
        const body = this.scene.mode === "defend" ? this.actor : this.ball;
        const point = event.global;
        if (Math.hypot(point.x - body.position.x, point.y - body.position.y) > 56) return;
        this.anchor = { x: body.position.x, y: body.position.y };
        if (this.scene.mode === "defend") {
          this.target = { x: this.ball.position.x, y: this.ball.position.y };
          window.Matter.Body.setStatic(body, true);
        }
        this.dragging = true;
        this.dragPoint = { x: point.x, y: point.y };
        this.scene.onMode?.("Bıraktığında fizik devreye girecek");
      });
      stage.on("pointermove", event => {
        if (!this.dragging) return;
        const max = Math.min(150, Math.max(90, this.width * .16));
        const dx = event.global.x - this.anchor.x, dy = event.global.y - this.anchor.y;
        const length = Math.hypot(dx, dy) || 1;
        const scale = Math.min(1, max / length);
        this.dragPoint = { x: this.anchor.x + dx * scale, y: this.anchor.y + dy * scale };
        const body = this.scene.mode === "defend" ? this.actor : this.ball;
        window.Matter.Body.setPosition(body, this.dragPoint);
        this.syncVisuals();
        this.drawGuide();
      });
      const release = () => {
        if (!this.dragging) return;
        this.dragging = false;
        this.launch();
      };
      stage.on("pointerup", release);
      stage.on("pointerupoutside", release);
    }

    drawGuide() {
      if (!this.dragPoint || !this.guide) return;
      const dx = this.anchor.x - this.dragPoint.x, dy = this.anchor.y - this.dragPoint.y;
      const power = Math.min(1, Math.hypot(dx, dy) / 130);
      const endX = this.anchor.x + dx * (1.25 + power), endY = this.anchor.y + dy * (1.25 + power);
      this.guide.clear()
        .moveTo(this.anchor.x, this.anchor.y).lineTo(this.dragPoint.x, this.dragPoint.y)
        .stroke({ width: 4, color: 0xe9eee8, alpha: .85 })
        .moveTo(this.anchor.x, this.anchor.y).lineTo(endX, endY)
        .stroke({ width: 3, color: power > .72 ? 0xe6b77f : 0xb9d4c0, alpha: .75 });
      for (let index = 1; index <= 4; index++) {
        this.guide.circle(this.anchor.x + dx * index * .35, this.anchor.y + dy * index * .35, 2.5)
          .fill({ color: 0xffffff, alpha: .45 - index * .07 });
      }
    }

    launch() {
      const { Body } = window.Matter;
      if (!this.dragPoint || this.released) {
        this.scene.onMode?.("Daha güçlü bir hareket için nesneyi geriye çek");
        return;
      }
      const body = this.scene.mode === "defend" ? this.actor : this.ball;
      const dx = this.anchor.x - this.dragPoint.x, dy = this.anchor.y - this.dragPoint.y;
      const pull = Math.hypot(dx, dy);
      if (pull < 24) {
        Body.setPosition(body, this.anchor);
        if (this.scene.mode === "defend") Body.setStatic(body, false);
        this.dragPoint = null;
        this.guide.clear();
        this.scene.onMode?.("En az bir parmak boyu geriye çek");
        return;
      }
      const direction = { x: dx / pull, y: dy / pull };
      const targetDx = this.target.x - this.anchor.x, targetDy = this.target.y - this.anchor.y;
      const targetLength = Math.hypot(targetDx, targetDy) || 1;
      const alignment = Math.max(0, direction.x * targetDx / targetLength + direction.y * targetDy / targetLength);
      const powerQuality = 1 - Math.min(1, Math.abs(Math.min(pull, 140) - 105) / 100);
      const skillFactor = Math.min(1, (Number(this.scene.skill || 50) + Number(this.scene.energy || 70) * .22) / 105);
      this.quality = Math.max(0, Math.min(1, alignment * .55 + powerQuality * .25 + skillFactor * .2));
      const widthForce = this.scene.mode === "defend"
        ? Math.max(.016, Math.min(.045, this.width * .00004))
        : Math.max(.006, Math.min(.018, this.width * .000014));
      const force = widthForce * (.55 + Math.min(pull, 140) / 140 * .55);
      Body.setStatic(body, false);
      Body.applyForce(body, body.position, { x: direction.x * force, y: direction.y * force });
      this.released = true;
      this.releaseElapsed = 0;
      this.guide.clear();
      if (this.pulse) this.pulse.visible = false;
      if (this.hint) this.hint.visible = false;
      this.scene.onMode?.(this.scene.mode === "shot" ? "ŞUT YOLDA…" : this.scene.mode === "pass" ? "PAS YOLDA…" : "MÜDAHALEYE GİDİYORSUN…");
    }

    tick(deltaMS) {
      if (!this.physics || this.destroyed) return;
      this.elapsed += deltaMS;
      if (this.released && !this.resolved) this.releaseElapsed += deltaMS;
      if (this.scene.mode === "shot" && this.released && !this.resolved) this.moveGoalkeeper(deltaMS);
      window.Matter.Engine.update(this.physics, Math.min(deltaMS, 16.666));
      this.syncVisuals();
      if (this.pulse && this.pulse.visible) {
        const scale = 1 + Math.sin(this.elapsed / 260) * .12;
        this.pulse.scale.set(scale);
        this.pulse.alpha = .55 + Math.sin(this.elapsed / 260) * .18;
      }
      if (!this.released || this.resolved) return;
      const body = this.scene.mode === "defend" ? this.actor : this.ball;
      const outside = body.position.x < -35 || body.position.x > this.width + 35 ||
        body.position.y < -35 || body.position.y > this.height + 35;
      if (outside) this.resolve(false, this.scene.mode === "shot" ? "AUT" : "TOP KAYBI");
      else if (this.releaseElapsed > 4200 || (this.releaseElapsed > 1100 && body.speed < .12)) {
        this.resolve(false, this.scene.mode === "defend" ? "YETİŞEMEDİN" : "POZİSYON BİTTİ");
      }
    }

    moveGoalkeeper(deltaMS) {
      if (!this.goalkeeper || this.releaseElapsed < 160) return;
      const { Body } = window.Matter;
      const reaction = .055 + Math.max(0, 75 - Number(this.scene.skill || 50)) * .0006;
      const targetY = Math.max(this.height * .31, Math.min(this.height * .69, this.ball.position.y));
      const step = (targetY - this.goalkeeper.position.y) * reaction * Math.min(2, deltaMS / 16.67);
      Body.setPosition(this.goalkeeper, { x: this.goalkeeper.position.x, y: this.goalkeeper.position.y + step });
    }

    onCollision(event) {
      if (!this.released || this.resolved) return;
      for (const pair of event.pairs) {
        const labels = [pair.bodyA.label, pair.bodyB.label];
        if (!labels.includes("ball")) continue;
        if (labels.includes("goal")) return this.resolve(true, "GOOOL!");
        if (labels.includes("pass-target")) return this.resolve(true, "KUSURSUZ PAS");
        if (labels.includes("actor") && this.scene.mode === "defend") return this.resolve(true, "TOP SENDE");
        if (labels.includes("goalkeeper")) return this.resolve(false, "KALECİ ÇIKARDI");
        if (labels.includes("defender")) return this.resolve(false, "BLOKLANDI");
        if (labels.includes("concede")) return this.resolve(false, "GEÇ KALDIN");
      }
    }

    resolve(success, label) {
      if (this.resolved) return;
      this.resolved = true;
      const physicalQuality = success ? Math.max(.42, this.quality) : Math.min(.48, this.quality);
      const result = this.scene.onResolve?.({
        success,
        quality: physicalQuality,
        mode: this.scene.mode,
        speed: Number((this.ball?.speed || 0).toFixed(2))
      });
      this.showOutcome(label, success);
      this.scene.onMode?.(result?.event || label);
      const timer = setTimeout(() => {
        if (!this.destroyed) this.scene.onComplete?.();
      }, 1350);
      this.timers.push(timer);
    }

    showOutcome(label, success) {
      const { Container, Graphics, Text } = window.PIXI;
      const overlay = new Container();
      const back = new Graphics().roundRect(0, 0, Math.min(310, this.width * .72), 82, 20)
        .fill({ color: success ? 0x102017 : 0x251a15, alpha: .92 })
        .stroke({ width: 2, color: success ? 0x9fc3b0 : 0xc8956a, alpha: .75 });
      const title = new Text({
        text: label,
        style: { fontFamily: "Arial", fontSize: Math.min(25, this.width * .045), fontWeight: "900", fill: 0xf4f6f1, letterSpacing: 1 }
      });
      title.anchor.set(.5);
      title.x = back.width / 2;
      title.y = 33;
      const detail = new Text({
        text: `FİZİK KALİTESİ · ${Math.round(this.quality * 100)}`,
        style: { fontFamily: "Arial", fontSize: 8, fontWeight: "800", fill: success ? 0x9fc3b0 : 0xc8956a, letterSpacing: 1.2 }
      });
      detail.anchor.set(.5);
      detail.x = back.width / 2;
      detail.y = 61;
      overlay.addChild(back, title, detail);
      overlay.x = (this.width - back.width) / 2;
      overlay.y = (this.height - 82) / 2;
      overlay.alpha = 0;
      overlay.scale.set(.86);
      this.app.stage.addChild(overlay);
      this.overlay = overlay;
      let progress = 0;
      const animate = ticker => {
        if (!this.overlay || this.destroyed) {
          this.app?.ticker.remove(animate);
          return;
        }
        progress = Math.min(1, progress + ticker.deltaMS / 230);
        this.overlay.alpha = progress;
        this.overlay.scale.set(.86 + progress * .14);
        if (progress >= 1) this.app.ticker.remove(animate);
      };
      this.app.ticker.add(animate);
    }

    circleBody(x, y, radius, options, fill, stroke) {
      const body = window.Matter.Bodies.circle(x, y, radius, options);
      const graphic = new window.PIXI.Graphics().circle(0, 0, radius).fill(fill).stroke({ width: 1.5, color: stroke });
      graphic.label = `${body.label}-visual`;
      this.addBody(body, graphic);
      return body;
    }

    playerBody(x, y, color, label, isStatic = true, protagonist = false, radius = 13) {
      const body = window.Matter.Bodies.circle(x, y, radius, {
        label, isStatic, restitution: .25, frictionAir: .045
      });
      const graphic = this.playerGraphic(color, protagonist, radius);
      this.addBody(body, graphic);
      return body;
    }

    addStaticPlayer(x, y, color, label) {
      return this.playerBody(x, y, color, label, true, false, 12);
    }

    playerGraphic(color, protagonist, radius) {
      const { Container, Graphics, Text } = window.PIXI;
      const container = new Container();
      container.addChild(new Graphics().ellipse(0, radius * .7, radius * .82, radius * .38).fill({ color: 0x07100a, alpha: .3 }));
      if (protagonist) container.addChild(new Graphics().circle(0, 0, radius + 7).stroke({ width: 3, color: 0xc4dfca, alpha: .8 }));
      container.addChild(new Graphics().circle(0, 0, radius).fill(color).stroke({ width: 2, color: 0x102017, alpha: .9 }));
      if (protagonist) {
        const text = new Text({ text: "SEN", style: { fontFamily: "Arial", fontSize: 7, fontWeight: "900", fill: 0x102017 } });
        text.anchor.set(.5);
        container.addChild(text);
      }
      return container;
    }

    sensorBody(x, y, width, height, label, visible = false) {
      const body = window.Matter.Bodies.rectangle(x, y, width, height, { label, isStatic: true, isSensor: true });
      window.Matter.Composite.add(this.physics.world, body);
      this.bodies.push(body);
      if (visible) {
        const graphic = new window.PIXI.Graphics().roundRect(-width / 2, -height / 2, width, height, 16)
          .fill({ color: 0x9fc3b0, alpha: .035 });
        this.app.stage.addChild(graphic);
        this.visuals.push({ body, graphic });
      }
      return body;
    }

    staticRect(x, y, width, height, label) {
      const body = window.Matter.Bodies.rectangle(x, y, width, height, { label, isStatic: true, restitution: .55 });
      window.Matter.Composite.add(this.physics.world, body);
      this.bodies.push(body);
      return body;
    }

    addBody(body, graphic) {
      window.Matter.Composite.add(this.physics.world, body);
      this.bodies.push(body);
      this.visuals.push({ body, graphic });
      this.app.stage.addChild(graphic);
    }

    syncVisuals() {
      for (const { body, graphic } of this.visuals) {
        graphic.position.set(body.position.x, body.position.y);
        graphic.rotation = body.angle;
      }
    }

    ballRadius() {
      return Math.max(7, Math.min(11, Math.min(this.width, this.height) * .018));
    }

    destroy() {
      this.destroyed = true;
      clearTimeout(this.resizeTimer);
      this.timers.forEach(clearTimeout);
      this.resizeObserver?.disconnect();
      if (this.physics && window.Matter) {
        window.Matter.Events.off(this.physics, "collisionStart", this.collisionHandler);
        window.Matter.Composite.clear(this.physics.world, false, true);
        window.Matter.Engine.clear(this.physics);
      }
      if (this.app) {
        this.app.ticker.remove(this.tickHandler);
        this.app.stage.removeAllListeners();
        this.app.destroy(true, { children: true });
      }
      this.host?.replaceChildren();
      this.app = null;
      this.physics = null;
    }
  }

  window.Match2DEngine = Match2DEngine;
})();
