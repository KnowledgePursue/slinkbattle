const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let players = {};
let myId = null;
let dir = 0;

fetch('/config').then(res => res.json()).then(cfg => {
  document.getElementById('title').innerText = cfg.serverName;
});

const socket = new WebSocket(`ws://${location.host}`);
socket.onmessage = ({ data }) => {
  const msg = JSON.parse(data);
  if (msg.type === 'state') players = msg.players;
  if (msg.type === 'error') alert(msg.message);
};

document.addEventListener('mousemove', e => {
  const angle = Math.atan2(e.clientY - canvas.height / 2, e.clientX - canvas.width / 2);
  dir = angle;
  socket.send(JSON.stringify({ type: 'move', direction: angle }));
});

function drawPlayer(p) {
  ctx.beginPath();
  ctx.arc(p.x - cam.x + canvas.width/2, p.y - cam.y + canvas.height/2, 10, 0, Math.PI * 2);
  ctx.fillStyle = 'lime';
  ctx.fill();
}

const cam = { x: 0, y: 0 };

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (players[myId]) {
    cam.x = players[myId].x;
    cam.y = players[myId].y;
  }
  for (const id in players) drawPlayer(players[id]);
  requestAnimationFrame(animate);
}
animate();