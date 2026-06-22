import { SceneManager } from "@drone-swarm/renderer";
import "./test.css";

const canvas = document.getElementById('canvas') as HTMLCanvasElement;
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const scene = new SceneManager(canvas);

window.addEventListener('resize', () => {
  scene.resize(window.innerWidth, window.innerHeight);
});

function loop() {
  scene.render();
  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
