import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

const canvas = document.getElementById("gearCanvas");
const wrap = document.getElementById("gearCanvasWrap");

if (!canvas || !wrap) {
  console.warn("Gear canvas not found.");
} else {
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(0, 0.9, 5.4);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: "high-performance"
  });
  renderer.setClearColor(0x000000, 0);

  const key = new THREE.DirectionalLight(0xffffff, 1.05);
  key.position.set(3, 4, 2);
  scene.add(key);

  const fill = new THREE.DirectionalLight(0x9fd8ff, 0.55);
  fill.position.set(-4, 2, 2);
  scene.add(fill);

  const amb = new THREE.AmbientLight(0xffffff, 0.40);
  scene.add(amb);

  function makeGear({ radius = 1.0, thickness = 0.22, teeth = 14, toothSize = 0.22 }) {
    const gear = new THREE.Group();

    const metal = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 0.18,
      roughness: 0.45
    });

    const accent = new THREE.MeshStandardMaterial({
      color: 0xe9eef8,
      metalness: 0.25,
      roughness: 0.38
    });

    const disk = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, thickness, 48), metal);
    disk.rotation.x = Math.PI / 2;
    gear.add(disk);

    const hole = new THREE.Mesh(
      new THREE.CylinderGeometry(radius * 0.36, radius * 0.36, thickness * 1.05, 40),
      accent
    );
    hole.rotation.x = Math.PI / 2;
    hole.position.z = 0.01;
    gear.add(hole);

    const toothGeo = new THREE.BoxGeometry(toothSize, toothSize * 0.6, thickness * 1.05);
    for (let i = 0; i < teeth; i++) {
      const a = (i / teeth) * Math.PI * 2;
      const t = new THREE.Mesh(toothGeo, accent);
      t.position.set(Math.cos(a) * (radius + toothSize * 0.55), Math.sin(a) * (radius + toothSize * 0.55), 0);
      t.rotation.z = a;
      gear.add(t);
    }

    return gear;
  }

  const rig = new THREE.Group();
  scene.add(rig);

  const gearA = makeGear({ radius: 1.0, teeth: 16, toothSize: 0.24 });
  const gearB = makeGear({ radius: 0.68, teeth: 12, toothSize: 0.20 });

  gearA.position.set(-0.5, 0.2, 0);
  gearB.position.set(0.8, -0.2, 0.05);

  rig.add(gearA, gearB);
  rig.rotation.set(0.18, -0.25, 0);

  function resize() {
    const w = wrap.clientWidth;
    const h = wrap.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.setSize(w, h, false);
  }
  window.addEventListener("resize", resize);
  resize();

  let running = true;
  const io = new IntersectionObserver((entries) => {
    running = entries[0]?.isIntersecting ?? true;
    if (running) requestAnimationFrame(tick);
  }, { threshold: 0.12 });
  io.observe(wrap);

  const clock = new THREE.Clock();

  function tick() {
    if (!running) return;

    const t = clock.getElapsedTime();
    rig.position.y = Math.sin(t * 1.2) * 0.06;
    gearA.rotation.z = t * 1.2;
    gearB.rotation.z = -t * 1.65;

    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}
