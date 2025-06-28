require('dotenv').config();
const WebSocket = require('ws');
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const wss = new WebSocket.Server({ server: http });

const PORT = process.env.PORT || 8080;
const TICK_RATE = parseInt(process.env.TICK_RATE) || 20;
const MAX_PLAYERS = parseInt(process.env.MAX_PLAYERS) || 20;

const players = {};

function randomPos(max) {
  return Math.floor(Math.random() * max);
}

wss.on('connection', ws => {
  if (Object.keys(players).length >= MAX_PLAYERS) {
    ws.send(JSON.stringify({ type: 'error', message: 'Servidor cheio.' }));
    ws.close();
    return;
  }

  const id = Math.random().toString(36).substr(2, 9);
  players[id] = {
    id,
    x: randomPos(process.env.MAP_WIDTH),
    y: randomPos(process.env.MAP_HEIGHT),
    direction: 0,
    length: parseInt(process.env.SNAKE_INITIAL_LENGTH)
  };
  ws.id = id;

  ws.on('message', msg => {
    try {
      const data = JSON.parse(msg);
      if (data.type === 'move') {
        if (players[id]) players[id].direction = data.direction;
      }
    } catch {}
  });

  ws.on('close', () => {
    delete players[id];
  });
});

setInterval(() => {
  for (const id in players) {
    const p = players[id];
    const speed = parseFloat(process.env.SNAKE_SPEED);
    p.x += Math.cos(p.direction) * speed;
    p.y += Math.sin(p.direction) * speed;
  }
  const snapshot = JSON.stringify({ type: 'state', players });
  wss.clients.forEach(ws => {
    if (ws.readyState === WebSocket.OPEN) ws.send(snapshot);
  });
}, 1000 / TICK_RATE);

app.use(express.static('public'));
app.get('/config', (req, res) => {
  res.json({
    serverName: process.env.SERVER_NAME,
    theme: process.env.THEME,
    showGrid: process.env.SHOW_GRID === 'true',
    leaderboard: process.env.LEADERBOARD_ENABLED === 'true'
  });
});

http.listen(PORT, () => console.log(`Servidor SlinkBattle rodando na porta ${PORT}`));