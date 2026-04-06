import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.152/build/three.module.js";
import { botReply } from "./chatbot.js";

const container = document.getElementById("three-canvas");

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000,
);

const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
container.appendChild(renderer.domElement);

const coreMat = new THREE.MeshBasicMaterial({
  color: 0x00e5ff,
  wireframe: true,
  transparent: true,
  opacity: 0.35,
});
const core = new THREE.Mesh(new THREE.IcosahedronGeometry(1.8, 1), coreMat);
scene.add(core);

const outerRing = new THREE.Mesh(
  new THREE.TorusGeometry(3.5, 0.015, 16, 100),
  new THREE.MeshBasicMaterial({ color: 0x00e5ff, transparent: true, opacity: 0.12 }),
);
outerRing.rotation.x = Math.PI / 3;
scene.add(outerRing);

const labels = ["EMBEDDED", "AI", "SECURITY", "FULLSTACK"];
const nodeColor = 0xff2d78;
const nodes = [];

const labelSprites = [];

function makeLabel(text) {
  const canvas = document.createElement("canvas");
  const size = 256;
  canvas.width = size;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");
  ctx.font = "bold 24px Inter, sans-serif";
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, size / 2, 32);

  const tex = new THREE.CanvasTexture(canvas);
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, opacity: 0.7 });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(2, 0.5, 1);
  return sprite;
}

labels.forEach((label, i) => {
  const node = new THREE.Mesh(
    new THREE.SphereGeometry(0.35, 32, 32),
    new THREE.MeshBasicMaterial({ color: nodeColor }),
  );

  const glowMat = new THREE.MeshBasicMaterial({
    color: nodeColor,
    transparent: true,
    opacity: 0.08,
  });
  const glow = new THREE.Mesh(new THREE.SphereGeometry(0.6, 16, 16), glowMat);
  node.add(glow);

  node.userData = { angle: (i * Math.PI) / 2, label, baseRadius: 3.5 };
  scene.add(node);
  nodes.push(node);

  const sprite = makeLabel(label);
  scene.add(sprite);
  labelSprites.push(sprite);
});

camera.position.z = 7;

const mouse = new THREE.Vector2();
let mouseTarget = new THREE.Vector2();

document.addEventListener("mousemove", (e) => {
  mouseTarget.x = (e.clientX / window.innerWidth - 0.5) * 0.5;
  mouseTarget.y = (e.clientY / window.innerHeight - 0.5) * 0.5;
});

function animate() {
  requestAnimationFrame(animate);

  mouse.x += (mouseTarget.x - mouse.x) * 0.05;
  mouse.y += (mouseTarget.y - mouse.y) * 0.05;

  core.rotation.x += 0.003;
  core.rotation.y += 0.005;
  outerRing.rotation.z += 0.002;

  camera.position.x = mouse.x * 1.5;
  camera.position.y = -mouse.y * 1.5;
  camera.lookAt(0, 0, 0);

  nodes.forEach((n, idx) => {
    n.userData.angle += 0.006;
    const r = n.userData.baseRadius;
    n.position.x = Math.cos(n.userData.angle) * r;
    n.position.y = Math.sin(n.userData.angle) * r * 0.6;
    n.position.z = Math.sin(n.userData.angle * 0.5) * 1.2;

    labelSprites[idx].position.set(
      n.position.x,
      n.position.y + 0.7,
      n.position.z,
    );
  });

  renderer.render(scene, camera);
}
animate();

const raycaster = new THREE.Raycaster();
const clickMouse = new THREE.Vector2();

window.addEventListener("click", (event) => {
  clickMouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  clickMouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(clickMouse, camera);
  const intersects = raycaster.intersectObjects(nodes);

  if (intersects.length > 0) {
    const topic = intersects[0].object.userData.label;
    botReply(topic);

    if (topic === "FULLSTACK") {
      document
        .getElementById("projects")
        .scrollIntoView({ behavior: "smooth" });
    }
  }
});

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
