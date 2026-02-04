(() => {
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  const scoreEl = document.getElementById('score');
  const livesEl = document.getElementById('lives');
  const restartBtn = document.getElementById('restartBtn');

  const W = canvas.width = 600;
  const H = canvas.height = 400;

  let score = 0;
  let lives = 3;
  let running = true;

  const basket = { w: 80, h: 18, x: W/2 - 40, y: H - 36, speed: 6 };
  const fruits = [];
  let spawnInterval = 900; // ms
  let lastSpawn = 0;

  function rand(min, max){ return Math.random()*(max-min)+min }

  function spawnFruit(){
    const size = rand(12, 22);
    fruits.push({ x: rand(size, W-size), y: -size, r: size, vy: rand(1.6, 3.2) });
  }

  function update(dt){
    // spawn
    lastSpawn += dt;
    if(lastSpawn > spawnInterval){ spawnFruit(); lastSpawn = 0; }

    // update fruits
    for(let i = fruits.length-1; i>=0; i--){
      const f = fruits[i];
      f.y += f.vy * (dt/16);
      // collision with basket
      if(f.y + f.r >= basket.y && f.x > basket.x && f.x < basket.x + basket.w){
        score += 1;
        fruits.splice(i,1);
        scoreEl.textContent = 'Score: ' + score;
        // gradually increase difficulty
        if(score % 6 === 0 && spawnInterval>350) spawnInterval -= 70;
        continue;
      }
      // missed
      if(f.y - f.r > H){
        fruits.splice(i,1);
        lives -= 1;
        livesEl.textContent = 'Lives: ' + lives;
        if(lives <= 0){ running = false; }
      }
    }
  }

  function draw(){
    // clear
    ctx.clearRect(0,0,W,H);
    // draw basket
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(basket.x, basket.y, basket.w, basket.h);
    ctx.fillStyle = '#c69c6d';
    ctx.fillRect(basket.x+6, basket.y-8, basket.w-12, 8);

    // fruits
    for(const f of fruits){
      // apple body
      ctx.beginPath();
      ctx.fillStyle = '#e34b4b';
      ctx.arc(f.x, f.y, f.r, 0, Math.PI*2);
      ctx.fill();
      // leaf
      ctx.fillStyle = '#3aa23a';
      ctx.fillRect(f.x+f.r*0.5, f.y - f.r*0.8, 6, 3);
    }

    // game over
    if(!running){
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(0,0,W,H);
      ctx.fillStyle = '#fff';
      ctx.font = '28px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Game Over', W/2, H/2 - 10);
      ctx.font = '18px sans-serif';
      ctx.fillText('Score: ' + score, W/2, H/2 + 20);
    }
  }

  // input
  const keys = {};
  window.addEventListener('keydown', e => { keys[e.key] = true });
  window.addEventListener('keyup', e => { keys[e.key] = false });

  // touch / pointer drag
  let dragging = false;
  canvas.addEventListener('pointerdown', e => { dragging = true; moveBasketTo(e.clientX); });
  window.addEventListener('pointermove', e => { if(dragging) moveBasketTo(e.clientX); });
  window.addEventListener('pointerup', () => { dragging = false });

  function moveBasketTo(clientX){
    const rect = canvas.getBoundingClientRect();
    const x = (clientX - rect.left) * (W / rect.width);
    basket.x = Math.min(Math.max(0, x - basket.w/2), W - basket.w);
  }

  let last = performance.now();
  function loop(now){
    const dt = now - last; last = now;
    if(running){
      // keyboard movement
      if(keys['ArrowLeft'] || keys['a']) basket.x -= basket.speed * (dt/16);
      if(keys['ArrowRight'] || keys['d']) basket.x += basket.speed * (dt/16);
      basket.x = Math.min(Math.max(0, basket.x), W - basket.w);

      update(dt);
    }
    draw();
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  restartBtn.addEventListener('click', () => {
    score = 0; lives = 3; running = true; fruits.length = 0; spawnInterval = 900; lastSpawn = 0;
    scoreEl.textContent = 'Score: ' + score; livesEl.textContent = 'Lives: ' + lives;
  });

})();