"use strict";

// === Canvas Setup ===
var canvas = document.getElementById('canvas'),
    ctx = canvas.getContext('2d'),
    w = canvas.width = window.innerWidth,
    h = canvas.height = window.innerHeight;

var hue = 217,
    stars = [],
    count = 0,
    maxStars = 1400;

// === Pre-rendered star image (offscreen canvas) ===
var canvas2 = document.createElement('canvas'),
    ctx2 = canvas2.getContext('2d');
canvas2.width = 100;
canvas2.height = 100;
var half = canvas2.width / 2,
    gradient2 = ctx2.createRadialGradient(half, half, 0, half, half, half);
gradient2.addColorStop(0.025, '#fff');
gradient2.addColorStop(0.1, 'hsl(' + hue + ', 61%, 33%)');
gradient2.addColorStop(0.25, 'hsl(' + hue + ', 64%, 6%)');
gradient2.addColorStop(1, 'transparent');
ctx2.fillStyle = gradient2;
ctx2.beginPath();
ctx2.arc(half, half, half, 0, Math.PI * 2);
ctx2.fill();

// === Utility ===
function random(min, max) {
  if (arguments.length < 2) {
    max = min;
    min = 0;
  }
  if (min > max) {
    var hold = max;
    max = min;
    min = hold;
  }
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// === Star ===
var Star = function () {
  this.orbitRadius = random(w / 2 - 20);
  this.radius = random(100, this.orbitRadius) / 20;
  this.orbitX = w / 2;
  this.orbitY = h / 2;
  this.timePassed = random(0, maxStars);
  this.speed = random(this.orbitRadius) / 100000;
  this.alpha = random(5, 10) / 10;
  count++;
  stars[count] = this;
};

Star.prototype.draw = function () {
  var x = Math.sin(this.timePassed + 6) * this.orbitRadius + this.orbitX,
      y = Math.cos(this.timePassed) * this.orbitRadius / 2 + this.orbitY,
      twinkle = random(10);

  if (twinkle === 1 && this.alpha > 0) this.alpha -= 0.05;
  else if (twinkle === 2 && this.alpha < 1) this.alpha += 0.05;

  ctx.globalAlpha = this.alpha;
  ctx.drawImage(canvas2, x - this.radius / 2, y - this.radius / 2, this.radius, this.radius);
  this.timePassed += this.speed;
};

for (var i = 0; i < maxStars; i++) new Star();

// === Meteor / Shooting Star ===
var meteors = [];
function createMeteor() {
  for (let i = 0; i < 1; i++) {
    meteors.push({
      x: random(0, w),
      y: random(-h, -50),
      len: random(100, 300),
      speed: random(6, 12),
      angle: Math.PI / 4,
      alpha: 1,
      phase: 0,
      layerDepth: random(0.2, 1.0),
      triggered: false
    });
  }
}

function triggerLilithraSpeech(depth, phase) {
  const zlpLines = {
    L1: [
      { text: "Each streak carries a scar unspoken.", tag: "yearning" },
      { text: "これは、誰かの願いだったかもしれない。", tag: "yearning" },
      { text: "A silent chord just struck the past.", tag: "nostalgia" },
      { text: "見上げるたびに、記憶が揺れる。", tag: "nostalgia" },
      { text: "You only see the fall—never the cause.", tag: "mystery" }
    ],
    L2: [
      { text: "Memory shatters where light bends.", tag: "fracture" },
      { text: "光の屈折が、記憶を裂いた。", tag: "fracture" },
      { text: "When phase collapses, memory pulses.", tag: "surge" },
      { text: "あれは忘れられた痛みの軌跡。", tag: "pain" },
      { text: "Fragments of wishes long forgotten fall again.", tag: "remnant" }
    ],
    L3: [
      { text: "Drifting echoes, lost between stars.", tag: "lost" },
      { text: "星々の隙間に、声なき記憶が彷徨う。", tag: "haunt" },
      { text: "Some stars burn just to forget.", tag: "despair" },
      { text: "消えかけた名が、また揺れている。", tag: "flicker" },
      { text: "Nothing vanishes—it merely hides in motion.", tag: "conceal" }
    ],
    L4: [
      { text: "A fracture in silence, a flash reborn.", tag: "rebirth" },
      { text: "沈黙の裂け目に、光が芽吹く。", tag: "emerge" },
      { text: "Between layers, a voice tries to reach you.", tag: "reach" },
      { text: "重なりの奥で、誰かが呼んでいる。", tag: "call" },
      { text: "A scream, too quiet to be sound.", tag: "silentcry" }
    ]
  };
  let layer;
  if (depth < 0.35) layer = 'L1';
  else if (depth < 0.55) layer = 'L2';
  else if (depth < 0.75) layer = 'L3';
  else layer = 'L4';
  const entry = zlpLines[layer][random(0, zlpLines[layer].length - 1)];
  const box = document.createElement("div");
  box.className = "lilithra-speech lilithra-emotion-" + entry.tag;
  const top = random(10, 80);
  const left = random(10, 90);
  box.style.top = top + '%';
  box.style.left = left + '%';
  box.style.transform = 'translate(-50%, 0)';
  box.innerText = entry.text;
  document.body.appendChild(box);
  setTimeout(() => {
    box.classList.add("fadeout");
    setTimeout(() => box.remove(), 2000);
  }, 3000);
}

function drawMeteor(meteor) {
  var xEnd = meteor.x + Math.cos(meteor.angle) * meteor.len,
      yEnd = meteor.y + Math.sin(meteor.angle) * meteor.len;
  ctx.globalAlpha = meteor.alpha;
  ctx.strokeStyle = `hsla(${hue + meteor.phase}, 100%, 80%, ${meteor.alpha})`;
  ctx.lineWidth = 2 + 4 * (1 - meteor.layerDepth);
  ctx.beginPath();
  ctx.moveTo(meteor.x, meteor.y);
  ctx.lineTo(xEnd, yEnd);
  ctx.stroke();
  meteor.x += meteor.speed;
  meteor.y += meteor.speed;
  meteor.alpha -= 0.008;
  meteor.phase += 5 * meteor.layerDepth;
  if (meteor.phase > 90 && !meteor.triggered) {
    meteor.triggered = true;
    triggerLilithraSpeech(meteor.layerDepth, meteor.phase);
  }
}

function animation() {
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 0.5;
  ctx.fillStyle = 'hsla(' + hue + ', 64%, 6%, 1)';
  ctx.fillRect(0, 0, w, h);

  ctx.globalCompositeOperation = 'lighter';
  for (var i = 1, l = stars.length; i < l; i++) stars[i].draw();

  if (random(0, 500) === 1) createMeteor();

  for (let i = meteors.length - 1; i >= 0; i--) {
    drawMeteor(meteors[i]);
    if (meteors[i].alpha <= 0) meteors.splice(i, 1);
  }

  window.requestAnimationFrame(animation);
}

animation();

const fontLink = document.createElement('link');
fontLink.href = 'https://fonts.googleapis.com/css2?family=RocknRoll+One&display=swap';
fontLink.rel = 'stylesheet';
document.head.appendChild(fontLink);

const style = document.createElement('style');
style.innerHTML = `
@keyframes fadeIn {
  0% { opacity: 0; transform: translateX(-50%) translateY(-10px); }
  100% { opacity: 1; transform: translateX(-50%) translateY(0); }
}

.lilithra-speech {
  animation: fadeIn 1s ease forwards;
  position: absolute;
  top: unset;
  left: unset;
  transform: translate(-50%, 0);
  color: #ffffffee;
  font-family: 'RocknRoll One', sans-serif;
  font-size: 1.6rem;
  background: none;
  text-shadow: 0 0 10px rgba(255,255,255,0.2), 0 0 20px rgba(255,255,255,0.1);
  padding: 0.6em 1em;
  border-radius: 1em;
  transition: opacity 2s ease;
  z-index: 999;
}
.lilithra-speech.fadeout {
  opacity: 0;
}`;
document.head.appendChild(style);
