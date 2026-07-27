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
      this.route = null;
      this.targetMarker = null;
      this.overlay = null;
      this.anchor = null;
      this.dragPoint = null;
      this.dragging = false;
      this.released = false;
      this.resolved = false;
      this.paused = false;
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
      this.paused = false;
      this.releaseElapsed = 0;
      this.bodies = [];
      this.visuals = [];
      this.app.stage.removeAllListeners();
      this.app.stage.removeChildren();
      this.physics = Engine.create();
      this.physics.gravity.scale = 0;
      Events.on(this.physics, "collisionStart", this.collisionHandler);

      this.drawPitch();
      this.route = new window.PIXI.Graphics();
      this.app.stage.addChild(this.route);
      this.guide = new window.PIXI.Graphics();
      this.app.stage.addChild(this.guide);
      if (this.scene.mode === "shot") this.buildShot();
      else if (this.scene.mode === "pass") this.buildPass();
      else this.buildDefence();
      this.drawAimRoute();
      this.drawInstructions();
      this.enableSling();
      this.syncVisuals();
    }

    drawPitch() {
      const { Graphics } = window.PIXI;
      const width = this.width, height = this.height;
      const horizon = height * .115;
      const stadium = new Graphics().rect(0, 0, width, horizon + 35).fill(0x08100b);
      for (let index = 0; index < 90; index++) {
        const x = (index * 47) % width, y = 8 + ((index * 29) % Math.max(30, horizon - 10));
        const colors = [0xd9e4dc, 0x9fc3b0, 0xd5a26f, 0x5d7565];
        stadium.circle(x, y, 1 + index % 2).fill({ color: colors[index % colors.length], alpha: .18 + index % 3 * .06 });
      }
      stadium.rect(0, horizon - 6, width, 22).fill(0x102019);
      stadium.rect(0, horizon + 2, width, 4).fill(0x6D9C79);
      this.app.stage.addChild(stadium);

      const pitch = new Graphics();
      const leftAt = y => {
        const t = Math.max(0, Math.min(1, (y - horizon) / (height - horizon)));
        return width * (.16 - .2 * t);
      };
      const rightAt = y => width - leftAt(y);
      pitch.poly([leftAt(horizon), horizon, rightAt(horizon), horizon, rightAt(height), height, leftAt(height), height]).fill(0x2d603c);
      const bands = 9;
      for (let index = 0; index < bands; index++) {
        const y1 = horizon + (height - horizon) * index / bands;
        const y2 = horizon + (height - horizon) * (index + 1) / bands;
        pitch.poly([leftAt(y1), y1, rightAt(y1), y1, rightAt(y2), y2, leftAt(y2), y2])
          .fill({ color: index % 2 ? 0x3e754c : 0x326842, alpha: .54 });
      }
      pitch.moveTo(leftAt(horizon), horizon).lineTo(leftAt(height), height)
        .moveTo(rightAt(horizon), horizon).lineTo(rightAt(height), height)
        .stroke({ width: 2, color: 0xe7eee8, alpha: .5 });
      [height * .37, height * .69].forEach(y => {
        pitch.moveTo(leftAt(y), y).lineTo(rightAt(y), y).stroke({ width: 2, color: 0xe7eee8, alpha: .42 });
      });
      const boxY = height * .2, boxBottom = height * .41;
      pitch.moveTo(width * .17, boxY).lineTo(width * .83, boxY)
        .lineTo(width * .91, boxBottom).lineTo(width * .09, boxBottom)
        .stroke({ width: 2, color: 0xe7eee8, alpha: .5 });
      pitch.moveTo(width * .32, boxY).lineTo(width * .28, height * .29)
        .lineTo(width * .72, height * .29).lineTo(width * .68, boxY)
        .stroke({ width: 1.5, color: 0xe7eee8, alpha: .4 });
      pitch.ellipse(width / 2, boxBottom, width * .16, height * .055)
        .stroke({ width: 1.5, color: 0xe7eee8, alpha: .35 });
      this.app.stage.addChild(pitch);
    }

    buildShot() {
      const width = this.width, height = this.height;
      const goalY = height * .245, goalLeft = width * .26, goalRight = width * .74;
      this.drawGoal(goalY, goalLeft, goalRight);
      this.ball = this.circleBody(width * .43, height * .705, this.ballRadius(), {
        label: "ball", restitution: .7, frictionAir: .014, isStatic: true
      }, 0xf4f0e4, 0x17241c);
      this.actor = this.playerBody(width * .39, height * .72, 0xf1f3ef, "actor", true, true, 13, 10);
      this.goalkeeper = this.playerBody(width * .5, height * .285, 0x38b578, "goalkeeper", true, false, 11, 1);
      this.addStaticPlayer(width * .58, height * .47, 0xd76f35, "defender", 4);
      this.addStaticPlayer(width * .72, height * .585, 0xd76f35, "defender", 6);
      this.addStaticPlayer(width * .58, height * .735, 0xd76f35, "defender", 8);
      this.sensorBody(width * .5, goalY + 2, goalRight - goalLeft - 18, 16, "goal");
      this.anchor = { x: this.ball.position.x, y: this.ball.position.y };
      this.target = { x: width * .66, y: goalY + 2 };
      this.scene.onMode?.("ŞUT · Topa dokun, geriye çek ve kaleye bırak");
    }

    buildPass() {
      const width = this.width, height = this.height;
      this.ball = this.circleBody(width * .42, height * .71, this.ballRadius(), {
        label: "ball", restitution: .58, frictionAir: .02, isStatic: true
      }, 0xf4f0e4, 0x17241c);
      this.actor = this.playerBody(width * .38, height * .73, 0xf1f3ef, "actor", true, true, 13, 10);
      const targetX = width * .67, targetY = height * .39;
      this.playerBody(targetX, targetY, 0xf1f3ef, "teammate", true, false, 11, 7);
      this.addStaticPlayer(width * .49, height * .48, 0xd76f35, "defender", 5);
      this.addStaticPlayer(width * .65, height * .58, 0xd76f35, "defender", 4);
      this.addStaticPlayer(width * .29, height * .42, 0xd76f35, "defender", 3);
      this.sensorBody(targetX, targetY, Math.max(48, width * .13), Math.max(44, height * .065), "pass-target", true);
      this.anchor = { x: this.ball.position.x, y: this.ball.position.y };
      this.target = { x: targetX, y: targetY };
      this.drawTarget(targetX, targetY, "HEDEF");
      this.scene.onMode?.("PAS · Topa dokun, geriye çek ve hedef bölgeye bırak");
    }

    buildDefence() {
      const { Body } = window.Matter;
      const width = this.width, height = this.height;
      this.actor = this.playerBody(width * .38, height * .69, 0xf1f3ef, "actor", false, true, 13, 10);
      this.ball = this.circleBody(width * .62, height * .39, this.ballRadius(), {
        label: "ball", restitution: .52, frictionAir: .005
      }, 0xf4f0e4, 0x17241c);
      this.playerBody(width * .66, height * .36, 0xd76f35, "opponent", true, false, 11, 9);
      this.addStaticPlayer(width * .54, height * .53, 0xd76f35, "screen", 6);
      this.sensorBody(width * .5, height * .84, width * .82, 18, "concede");
      this.anchor = { x: this.actor.position.x, y: this.actor.position.y };
      this.target = { x: this.ball.position.x, y: this.ball.position.y };
      Body.setVelocity(this.ball, { x: -.65, y: 2.35 });
      this.scene.onMode?.("MÜDAHALE · Oyuncuyu geriye çek ve topun yoluna bırak");
    }

    drawGoal(y, left, right) {
      const goal = new window.PIXI.Graphics();
      const depth = Math.max(24, this.height * .038);
      goal.moveTo(left, y).lineTo(left + 12, y - depth).lineTo(right - 12, y - depth).lineTo(right, y)
        .lineTo(left, y).stroke({ width: 3, color: 0xf1f3eb, alpha: .95 });
      for (let x = left + 10; x < right; x += Math.max(12, this.width * .035)) {
        goal.moveTo(x, y).lineTo(Math.max(left + 12, x - 4), y - depth)
          .stroke({ width: 1, color: 0xf1f3eb, alpha: .32 });
      }
      for (let row = 1; row < 4; row++) {
        const lineY = y - depth * row / 4;
        goal.moveTo(left + 12 * row / 4, lineY).lineTo(right - 12 * row / 4, lineY)
          .stroke({ width: 1, color: 0xf1f3eb, alpha: .28 });
      }
      this.app.stage.addChild(goal);
      this.staticRect(left, y, 9, 15, "post");
      this.staticRect(right, y, 9, 15, "post");
    }

    drawTarget(x, y, label) {
      const { Graphics, Text } = window.PIXI;
      const radius = Math.max(24, Math.min(this.width, this.height) * .065);
      const ring = new Graphics().circle(x, y, radius)
        .fill({ color: 0x8bff68, alpha: .07 })
        .stroke({ width: 2.5, color: 0x9cff73, alpha: .78 })
        .circle(x, y, radius * .47)
        .stroke({ width: 2, color: 0xe9ffe2, alpha: .82 });
      const text = new Text({
        text: label,
        style: { fontFamily: "Arial", fontSize: 8, fontWeight: "900", fill: 0xeaffe2, letterSpacing: 1.2 }
      });
      text.anchor.set(.5);
      text.x = x;
      text.y = y - radius - 14;
      this.app.stage.addChild(ring, text);
      this.targetMarker = ring;
    }

    drawAimRoute() {
      if (!this.route || !this.anchor || !this.target) return;
      const start = this.scene.mode === "defend" ? this.actor.position : this.ball.position;
      const bend = this.scene.mode === "shot" ? this.width * .08 : -this.width * .045;
      const midY = (start.y + this.target.y) / 2;
      this.route.clear()
        .moveTo(start.x, start.y)
        .bezierCurveTo(start.x + bend, midY + this.height * .07, this.target.x - bend, midY - this.height * .07, this.target.x, this.target.y)
        .stroke({ width: 7, color: 0xdfffd4, alpha: .22 })
        .moveTo(start.x, start.y)
        .bezierCurveTo(start.x + bend, midY + this.height * .07, this.target.x - bend, midY - this.height * .07, this.target.x, this.target.y)
        .stroke({ width: 2, color: 0xbfff9d, alpha: .52 });
      if (this.scene.mode === "shot") this.drawTarget(this.target.x, this.target.y, "");
    }

    drawInstructions() {
      const { Graphics, Text } = window.PIXI;
      const isDefend = this.scene.mode === "defend";
      const dragBody = isDefend ? this.actor : this.ball;
      const pulse = new Graphics().ellipse(dragBody.position.x, dragBody.position.y + 9, 34, 19)
        .stroke({ width: 3, color: 0xbfff9d, alpha: .82 })
        .ellipse(dragBody.position.x, dragBody.position.y + 9, 27, 14)
        .stroke({ width: 1.5, color: 0xe8ffe1, alpha: .54 });
      pulse.label = "pulse";
      const hint = new Text({
        text: "SEN",
        style: { fontFamily: "Arial", fontSize: 11, fontWeight: "900", fill: 0xc9ff9f, letterSpacing: 1.5 }
      });
      hint.anchor.set(.5);
      hint.x = dragBody.position.x;
      hint.y = dragBody.position.y - 43;
      hint.label = "hint";
      const pointerY = Math.min(this.height * .79, dragBody.position.y + 75);
      const pointer = new Graphics().circle(dragBody.position.x + 38, pointerY, 25)
        .fill({ color: 0x09120d, alpha: .5 })
        .stroke({ width: 2, color: 0xffffff, alpha: .72 })
        .moveTo(dragBody.position.x + 38, pointerY - 9)
        .lineTo(dragBody.position.x + 38, pointerY + 9)
        .moveTo(dragBody.position.x + 30, pointerY - 2)
        .lineTo(dragBody.position.x + 38, pointerY - 10)
        .lineTo(dragBody.position.x + 46, pointerY - 2)
        .stroke({ width: 2.5, color: 0xffffff, alpha: .86 });
      pointer.label = "gesture";
      this.app.stage.addChild(pulse, hint, pointer);
      this.pulse = pulse;
      this.hint = hint;
      this.gesture = pointer;
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
        .moveTo(this.dragPoint.x, this.dragPoint.y)
        .bezierCurveTo(this.anchor.x, this.anchor.y, (this.anchor.x + endX) / 2, (this.anchor.y + endY) / 2, endX, endY)
        .stroke({ width: 4, color: power > .72 ? 0xbfff76 : 0xe9eee8, alpha: .8 });
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
      const targetDistance = Math.hypot(targetDx, targetDy);
      const widthForce = this.scene.mode === "defend"
        ? Math.max(.016, Math.min(.045, targetDistance * .00006))
        : Math.max(.006, Math.min(.018, targetDistance * .000018));
      const force = widthForce * (.55 + Math.min(pull, 140) / 140 * .55);
      Body.setStatic(body, false);
      Body.applyForce(body, body.position, { x: direction.x * force, y: direction.y * force });
      this.released = true;
      this.releaseElapsed = 0;
      this.guide.clear();
      if (this.route) this.route.visible = false;
      if (this.targetMarker) this.targetMarker.visible = false;
      if (this.pulse) this.pulse.visible = false;
      if (this.hint) this.hint.visible = false;
      if (this.gesture) this.gesture.visible = false;
      this.scene.onMode?.(this.scene.mode === "shot" ? "ŞUT YOLDA…" : this.scene.mode === "pass" ? "PAS YOLDA…" : "MÜDAHALEYE GİDİYORSUN…");
    }

    tick(deltaMS) {
      if (!this.physics || this.destroyed || this.paused) return;
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
      const targetX = Math.max(this.width * .29, Math.min(this.width * .71, this.ball.position.x));
      const step = (targetX - this.goalkeeper.position.x) * reaction * Math.min(2, deltaMS / 16.67);
      Body.setPosition(this.goalkeeper, { x: this.goalkeeper.position.x + step, y: this.goalkeeper.position.y });
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
      const graphic = new window.PIXI.Graphics().circle(0, 0, radius)
        .fill(fill).stroke({ width: 1.5, color: stroke })
        .circle(-radius * .22, -radius * .2, radius * .25).fill(stroke)
        .moveTo(radius * .1, -radius * .62).lineTo(radius * .55, -radius * .15)
        .lineTo(radius * .35, radius * .42).stroke({ width: 1, color: stroke, alpha: .75 });
      graphic.label = `${body.label}-visual`;
      this.addBody(body, graphic);
      return body;
    }

    playerBody(x, y, color, label, isStatic = true, protagonist = false, radius = 13, shirtNumber = "") {
      const body = window.Matter.Bodies.circle(x, y, radius, {
        label, isStatic, restitution: .25, frictionAir: .045
      });
      const graphic = this.playerGraphic(color, protagonist, radius, shirtNumber, label === "goalkeeper");
      const perspective = .68 + Math.max(.15, Math.min(1, y / this.height)) * .48;
      graphic.scale.set(perspective);
      this.addBody(body, graphic);
      return body;
    }

    addStaticPlayer(x, y, color, label, shirtNumber = "") {
      return this.playerBody(x, y, color, label, true, false, 12, shirtNumber);
    }

    playerGraphic(color, protagonist, radius, shirtNumber, goalkeeper = false) {
      const { Container, Graphics, Text } = window.PIXI;
      const container = new Container();
      const skin = 0xb97854, shorts = protagonist ? 0x171c1a : goalkeeper ? 0x14734a : 0x20251f;
      container.addChild(new Graphics().ellipse(0, 17, 13, 5).fill({ color: 0x06100a, alpha: .35 }));
      container.addChild(new Graphics()
        .roundRect(-7, 7, 5, 13, 2).fill(shorts)
        .roundRect(2, 7, 5, 13, 2).fill(shorts)
        .roundRect(-8, 18, 6, 3, 1).fill(0xe9eee8)
        .roundRect(2, 18, 6, 3, 1).fill(0xe9eee8));
      container.addChild(new Graphics()
        .poly([-10,-9,10,-9,8,8,-8,8]).fill(color)
        .poly([-10,-7,-16,3,-12,6,-6,-2]).fill(color)
        .poly([10,-7,16,3,12,6,6,-2]).fill(color)
        .circle(-14,5,2.5).fill(skin)
        .circle(14,5,2.5).fill(skin)
        .circle(0,-15,5.5).fill(skin)
        .arc(0,-16,5.8,Math.PI,Math.PI*2).stroke({ width: 3, color: 0x211812 }));
      if (shirtNumber !== "") {
        const number = new Text({ text: String(shirtNumber), style: { fontFamily: "Arial", fontSize: 8, fontWeight: "900", fill: protagonist ? 0x172019 : 0xf3f3ed } });
        number.anchor.set(.5);
        number.y = -1;
        container.addChild(number);
      }
      if (protagonist) container.addChild(new Graphics().ellipse(0, 12, radius + 14, radius * .72)
        .stroke({ width: 2.5, color: 0xbfff8b, alpha: .84 }));
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

    togglePause() {
      if (this.resolved || this.destroyed) return false;
      this.paused = !this.paused;
      if (this.paused) {
        const { Container, Graphics, Text } = window.PIXI;
        const layer = new Container();
        layer.addChild(new Graphics().rect(0, 0, this.width, this.height).fill({ color: 0x07100a, alpha: .52 }));
        const label = new Text({
          text: "DURAKLATILDI",
          style: { fontFamily: "Arial", fontSize: Math.min(24, this.width * .055), fontWeight: "900", fill: 0xf1f4ef, letterSpacing: 2 }
        });
        label.anchor.set(.5);
        label.position.set(this.width / 2, this.height / 2);
        layer.addChild(label);
        this.app.stage.addChild(layer);
        this.pauseLayer = layer;
        this.scene.onMode?.("Devam etmek için oynat düğmesine dokun");
      } else {
        this.pauseLayer?.destroy({ children: true });
        this.pauseLayer = null;
        this.scene.onMode?.(this.scene.mode === "shot" ? "Topa dokun, geriye çek ve kaleye bırak" : this.scene.mode === "pass" ? "Topa dokun, geriye çek ve hedefe bırak" : "Oyuncuyu geriye çek ve topa bırak");
      }
      return this.paused;
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
