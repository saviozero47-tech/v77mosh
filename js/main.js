// Controlador Principal de Telas & UI — VÁLVULA 77: MOSH DE ARMA BRANCA
import { ALL_CHARACTERS, STAGES, DIFFICULTY_MODES, V77_SPOTIFY_URL } from './config.js';
import { audioEngine } from './audio.js';
import { preloadAssets, drawFighter, drawPunkHead, IMAGES } from './sprites.js';
import { MoshGameEngine } from './engine.js';
import {
  fetchLeaderboard,
  submitLeaderboardScore,
  getSavedPlayerName,
  setSavedPlayerName,
  qualifiesForTop3,
  renderTop3Into,
} from './leaderboard.js';

const screens = {
  boot: document.getElementById('screen-boot'),
  title: document.getElementById('screen-title'),
  select: document.getElementById('screen-select'),
  stages: document.getElementById('screen-stages'),
  game: document.getElementById('screen-game'),
};

let selectedChar = ALL_CHARACTERS[0];
let selectedStageIdx = 0;
let selectedDifficulty = (() => {
  try {
    const saved = localStorage.getItem('v77_difficulty');
    return saved && DIFFICULTY_MODES[saved] ? saved : 'punk';
  } catch {
    return 'punk';
  }
})();
let currentFilter = 'all';
let menuAnimId = null;
let previewTime = 0;

// Inicializa assets e ranking Top 3
async function refreshTitleLeaderboard() {
  const listEl = document.getElementById('title-lb-list');
  const badgeEl = document.getElementById('title-lb-mode');
  if (!listEl) return;
  const data = await fetchLeaderboard();
  renderTop3Into(listEl, badgeEl, data);
}

preloadAssets().then(() => {
  renderRoster();
  renderStages();
  updatePreview();
  refreshTitleLeaderboard();
});

function preloadSelectedStage() {
  const st = STAGES[selectedStageIdx];
  if (st) {
    audioEngine.preloadStageStems(st).catch(() => {});
  }
}

function showScreen(name) {
  Object.entries(screens).forEach(([k, el]) => {
    el.classList.toggle('active', k === name);
  });
  if (name === 'title') {
    refreshTitleLeaderboard();
  }
  if (name === 'select') {
    preloadSelectedStage();
  }
  if (name === 'title' || name === 'select' || name === 'stages') {
    startMenuVisualLoop();
  } else {
    stopMenuVisualLoop();
  }
}

// ===== BOOT -> TITLE (Dispara Santa Catareich "800 mil pra comprar fuzil" na hora!) =====
document.getElementById('btn-boot-start').addEventListener('click', () => {
  audioEngine.onTrackChange = (title) => {
    document.getElementById('deck-track-name').textContent = title;
  };
  audioEngine.startMenuMedley(0); // 0 = Santa Catareich 195.0s!
  setTimeout(preloadSelectedStage, 1400);
  showScreen('title');
});

// Controles do Cassette Deck na Tela Inicial
document.getElementById('btn-medley-prev').addEventListener('click', () => audioEngine.prevMenuTrack());
document.getElementById('btn-medley-next').addEventListener('click', () => audioEngine.nextMenuTrack());
document.getElementById('btn-medley-mute').addEventListener('click', () => {
  handleMuteToggle();
});

// Navegação Tela Inicial
document.getElementById('btn-goto-select').addEventListener('click', () => showScreen('select'));
document.getElementById('btn-goto-stages').addEventListener('click', () => showScreen('stages'));
document.getElementById('btn-select-back').addEventListener('click', () => showScreen('title'));
document.getElementById('btn-stages-back').addEventListener('click', () => showScreen('title'));

// Clicar em qualquer card de integrante na tela inicial já seleciona ele!
document.querySelectorAll('.band-card').forEach((card) => {
  card.addEventListener('click', () => {
    const id = card.dataset.member;
    const found = ALL_CHARACTERS.find((c) => c.id === id);
    if (found) {
      selectedChar = found;
      renderRoster();
      updatePreview();
      showScreen('select');
    }
  });
});

// Modal de Controles
const modalControls = document.getElementById('modal-controls');
document.getElementById('btn-show-controls').addEventListener('click', () => modalControls.classList.remove('hidden'));
document.getElementById('btn-close-controls').addEventListener('click', () => modalControls.classList.add('hidden'));
modalControls.addEventListener('click', (e) => {
  if (e.target === modalControls) modalControls.classList.add('hidden');
});

// ===== VISUALIZADOR DE ÁUDIO DA TELA INICIAL + PREVIEW ANIMADO =====
const menuCanvas = document.getElementById('menu-visualizer');
const menuCtx = menuCanvas.getContext('2d');
const heroLogoEl = document.querySelector('.hero-logo');
const previewCanvas = document.getElementById('preview-canvas');
const previewCtx = previewCanvas.getContext('2d');

function startMenuVisualLoop() {
  if (menuAnimId) return;
  const tick = () => {
    previewTime += 0.016;
    const info = audioEngine.updateAnalysis();

    // Pulsa a logo oficial no ritmo real do grave!
    if (heroLogoEl) {
      const s = 1 + info.bass * 0.12;
      heroLogoEl.style.transform = `scale(${s.toFixed(3)}) rotate(${(Math.sin(previewTime * 2) * 1.5).toFixed(2)}deg)`;
    }

    // Espectro punk no fundo da tela inicial
    menuCtx.clearRect(0, 0, menuCanvas.width, menuCanvas.height);
    if (info.bins) {
      const bars = 48;
      const bw = menuCanvas.width / bars;
      for (let i = 0; i < bars; i++) {
        const val = info.bins[i + 2] / 255;
        const bh = val * 220;
        menuCtx.fillStyle = i % 3 === 0 ? 'rgba(220, 0, 0, 0.38)' : 'rgba(250, 204, 21, 0.16)';
        menuCtx.fillRect(i * bw, menuCanvas.height - bh, bw - 4, bh);
      }
    }

    // Preview animado do lutador selecionado
    if (screens.select.classList.contains('active')) {
      drawCharPreviewFrame();
    }

    menuAnimId = requestAnimationFrame(tick);
  };
  menuAnimId = requestAnimationFrame(tick);
}

function stopMenuVisualLoop() {
  if (menuAnimId) cancelAnimationFrame(menuAnimId);
  menuAnimId = null;
}

function drawCharPreviewFrame() {
  previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
  const dummy = {
    x: 120,
    y: 196,
    z: 0,
    vx: 40,
    vy: 0,
    facing: 1,
    bandId: selectedChar.type === 'band' ? selectedChar.id : null,
    visual: selectedChar.visual || null,
    scale: 1.45,
    animSeed: 0,
    moshHop: true,
    headbang: true,
    attackTimer: Math.sin(previewTime * 3) > 0.75 ? 0.14 : 0,
    attackDuration: 0.22,
    hurtTimer: 0,
    invulnTimer: 0,
    dashTimer: 0,
    specialAnimTimer: 0,
    state: 'idle',
  };
  drawFighter(previewCtx, dummy, previewTime);
}

// ===== SELEÇÃO DE PERSONAGEM =====
const rosterGrid = document.getElementById('roster-grid');
const stageDropdown = document.getElementById('select-stage-dropdown');
const difficultyDropdown = document.getElementById('select-difficulty-dropdown');

STAGES.forEach((st, idx) => {
  const opt = document.createElement('option');
  opt.value = idx;
  opt.textContent = `${st.num}: ${st.name}`;
  stageDropdown.appendChild(opt);
});
stageDropdown.addEventListener('change', (e) => {
  selectedStageIdx = Number(e.target.value);
  preloadSelectedStage();
});

if (difficultyDropdown) {
  Object.values(DIFFICULTY_MODES).forEach((mode) => {
    const opt = document.createElement('option');
    opt.value = mode.id;
    opt.textContent = mode.label;
    opt.title = mode.description;
    difficultyDropdown.appendChild(opt);
  });
  difficultyDropdown.value = selectedDifficulty;
  difficultyDropdown.addEventListener('change', (e) => {
    const val = e.target.value;
    selectedDifficulty = DIFFICULTY_MODES[val] ? val : 'punk';
    try {
      localStorage.setItem('v77_difficulty', selectedDifficulty);
    } catch {}
  });
}

document.querySelectorAll('.tab-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    renderRoster();
  });
});

function renderRoster() {
  rosterGrid.innerHTML = '';
  const list = ALL_CHARACTERS.filter((c) => currentFilter === 'all' || c.type === currentFilter);

  list.forEach((c) => {
    const tile = document.createElement('div');
    tile.className = 'roster-tile' + (selectedChar.id === c.id ? ' selected' : '');

    const dot = document.createElement('span');
    dot.className = 'tile-type-dot' + (c.type === 'band' ? ' band' : '');
    dot.textContent = c.type === 'band' ? 'BANDA' : (c.badge || 'VÁLVULOVER');
    tile.appendChild(dot);

    const thumb = document.createElement('div');
    thumb.className = 'tile-thumb';
    if (c.type === 'band') {
      const img = document.createElement('img');
      img.src = c.head;
      img.alt = c.name;
      thumb.appendChild(img);
    } else {
      const cv = document.createElement('canvas');
      cv.width = 96;
      cv.height = 96;
      drawPunkHead(cv.getContext('2d'), 48, 56, 26, c.visual, 1, 'angry');
      thumb.appendChild(cv);
    }
    tile.appendChild(thumb);

    const nm = document.createElement('div');
    nm.className = 'tile-name';
    nm.textContent = c.name;
    tile.appendChild(nm);

    const sub = document.createElement('div');
    sub.className = 'tile-sub';
    sub.textContent = c.role.split('•')[1]?.trim() || c.role;
    tile.appendChild(sub);

    tile.addEventListener('click', () => {
      selectedChar = c;
      renderRoster();
      updatePreview();
    });

    rosterGrid.appendChild(tile);
  });
}

function updatePreview() {
  document.getElementById('preview-name').textContent = selectedChar.name;
  document.getElementById('preview-role').textContent = selectedChar.role;
  document.getElementById('preview-bio').textContent = selectedChar.bio;
  document.getElementById('preview-badge').textContent = selectedChar.badge || 'VÁLVULOVER';
  document.getElementById('stat-str').style.width = `${selectedChar.stats.str}%`;
  document.getElementById('stat-spd').style.width = `${selectedChar.stats.spd}%`;
  document.getElementById('stat-def').style.width = `${selectedChar.stats.def}%`;
  document.getElementById('preview-special').textContent = selectedChar.specialName;
}

// ===== SETLIST / SELEÇÃO DE FASES =====
function renderStages() {
  const grid = document.getElementById('stages-grid');
  grid.innerHTML = '';
  STAGES.forEach((st, idx) => {
    const card = document.createElement('div');
    card.className = 'stage-card';
    const diffLabel = st.difficulty ? st.difficulty.label : 'PADRÃO';
    const diffColor = st.difficulty ? st.difficulty.color : '#facc15';
    card.innerHTML = `
      <div class="stage-card-head">
        <span class="stage-num">${st.num}</span>
        <span class="stage-diff-tag" style="border-color: ${diffColor}; color: ${diffColor};">${diffLabel}</span>
        <span class="stage-boss-tag">CHEFE: ${st.mainBoss.toUpperCase()}</span>
      </div>
      <h3>${st.name}</h3>
      <p><strong>${st.subtitle}</strong></p>
      <p>${st.description}</p>
    `;
    card.addEventListener('click', () => {
      selectedStageIdx = idx;
      stageDropdown.value = idx;
      showScreen('select');
    });
    grid.appendChild(card);
  });
}

// ===== GAME ENGINE & HUD =====
const gameCanvas = document.getElementById('game-canvas');
const overlayPause = document.getElementById('overlay-pause');
const overlayVictory = document.getElementById('overlay-victory');
const overlayGameover = document.getElementById('overlay-gameover');
const bossHud = document.getElementById('boss-hud');

const engine = new MoshGameEngine(gameCanvas, {
  onHudUpdate: (data) => updateGameHud(data),
  onVictory: (res) => showVictory(res),
  onGameOver: (res) => showGameOver(res),
});

// EXPURGÁTORIO: tocar numa fissura trava o alvo da Válvula Preta (celular/touch)
gameCanvas.addEventListener(
  'pointerdown',
  (e) => {
    engine.setTargetLockAt(e.clientX, e.clientY, gameCanvas.getBoundingClientRect());
  },
  { passive: true }
);

// ===== CD VIRTUAL DO EXPURGÁTORIO =====
const CD_UNLOCK_KEY = 'v77_virtual_cd_unlocked';
const cdModal = document.getElementById('modal-vinyl');
const cdTitleBtn = document.getElementById('btn-cd-vinyl');
const secretBtn = document.getElementById('btn-secret-v77');
const spotifyLink = document.getElementById('vinyl-spotify-link');

if (spotifyLink) spotifyLink.href = V77_SPOTIFY_URL;

function isCdUnlocked() {
  try {
    return localStorage.getItem(CD_UNLOCK_KEY) === '1';
  } catch (_) {
    return false;
  }
}

function unlockCd() {
  try {
    localStorage.setItem(CD_UNLOCK_KEY, '1');
  } catch (_) {}
}

function refreshCdButton() {
  if (cdTitleBtn) cdTitleBtn.classList.toggle('hidden', !isCdUnlocked());
}

function openCdModal() {
  if (cdModal) cdModal.classList.remove('hidden');
}

function closeCdModal() {
  if (cdModal) cdModal.classList.add('hidden');
}

refreshCdButton();

function launchSelectedGame() {
  overlayPause.classList.add('hidden');
  overlayVictory.classList.add('hidden');
  overlayGameover.classList.add('hidden');
  bossHud.classList.add('hidden');
  closeCdModal();

  const stage = STAGES[selectedStageIdx];

  // Avatar do HUD
  const avatarImg = document.getElementById('hud-avatar-img');
  const avatarCv = document.getElementById('hud-avatar-canvas');
  if (selectedChar.type === 'band') {
    avatarImg.src = selectedChar.head;
    avatarImg.style.display = 'block';
    avatarCv.style.display = 'none';
  } else {
    avatarImg.style.display = 'none';
    avatarCv.style.display = 'block';
    const actx = avatarCv.getContext('2d');
    actx.clearRect(0, 0, 64, 64);
    drawPunkHead(actx, 32, 38, 18, selectedChar.visual, 1, 'angry');
  }

  document.getElementById('hud-player-name').textContent = selectedChar.name;
  document.getElementById('hud-song-label').textContent = `${stage.num} • ${stage.name}`;
  document.getElementById('pause-track-info').textContent = `Tocando: ${stage.name}`;

  showScreen('game');
  engine.startStage(selectedChar, stage, selectedDifficulty);
}

document.getElementById('btn-launch-game').addEventListener('click', launchSelectedGame);

function updateGameHud(d) {
  const p = d.player;
  const hpPct = Math.max(0, (p.hp / p.maxHp) * 100);
  document.getElementById('hud-hp-fill').style.width = `${hpPct}%`;
  document.getElementById('hud-hp-text').textContent = `${Math.ceil(p.hp)} / ${p.maxHp}`;

  document.getElementById('hud-mosh-fill').style.width = `${p.moshMeter}%`;
  document.getElementById('hud-mosh-text').textContent =
    p.moshMeter >= 100 ? '⚡ ESPECIAL PRONTO [ESPAÇO]! ⚡' : `ESPECIAL ${Math.floor(p.moshMeter)}%`;
  const tSpecBtn = document.querySelector('.t-special');
  if (tSpecBtn) tSpecBtn.classList.toggle('ready', p.moshMeter >= 100);

  const wTag = document.getElementById('hud-weapon-tag');
  if (p.weapon) {
    if (p.weapon.isSpecialWeapon) {
      wTag.textContent = `${p.weapon.icon} ${p.weapon.name} (∞)`;
      wTag.className = 'weapon-pill special';
    } else {
      const durStr = Number.isFinite(p.weapon.durability) && !d.easterEggActive ? p.weapon.durability : '∞';
      wTag.textContent = `${p.weapon.icon} ${p.weapon.name} (${durStr})`;
      wTag.className = 'weapon-pill';
    }
  } else {
    wTag.textContent = 'PUNHOS';
    wTag.className = 'weapon-pill';
  }

  const phasePill = document.getElementById('hud-phase-pill');
  const songLabel = document.getElementById('hud-song-label');
  const curStage = STAGES[selectedStageIdx];

  // Botão tátil secreto: só aparece depois da permanência dentro do círculo da bateria
  if (secretBtn) secretBtn.classList.toggle('hidden', !d.hellTriggerReady);

  if (d.hellMode) {
    const guardians = d.hellGuardiansAlive || 0;
    phasePill.textContent = `😈 FISSURAS ${d.hellPortalsSealed}/${d.hellPortalsTotal || 3} • 🛡 ${guardians} 😈`;
    phasePill.className = 'phase-pill mosh';
    if (songLabel) songLabel.textContent = d.hellPhaseLabel || 'FASE SECRETA — EXPURGÁTORIO';
  } else if (d.easterEggActive) {
    phasePill.textContent = `💀 BUNKER 77 • ${d.easterEggTimerDisplay}s 💀`;
    phasePill.className = 'phase-pill mosh';
    if (songLabel) songLabel.textContent = 'MATE O MÁXIMO DE NAZISTAS QUE CONSEGUIR!';
  } else {
    if (songLabel && curStage) songLabel.textContent = `${curStage.num} • ${curStage.name}`;
    if (audioEngine.stemsLoading) {
      phasePill.textContent = '⚡ SINCRONIZANDO OS AMPS...';
      phasePill.className = 'phase-pill calm';
    } else if (d.moshActive) {
      phasePill.textContent = '🔥 MOSH PIT ATIVADO! (2x) 🔥';
      phasePill.className = 'phase-pill mosh';
    } else {
      phasePill.textContent = '🎸 AQUECENDO O PIT...';
      phasePill.className = 'phase-pill calm';
    }
  }

  document.getElementById('hud-score').textContent = d.score;
  document.getElementById('hud-combo').textContent = `${d.combo}x`;
  document.getElementById('hud-ko').textContent = d.hellMode
    ? `FISSURAS ${d.hellPortalsSealed}/${d.hellPortalsTotal || 3}`
    : `${d.koCount}/${d.targetKOs}`;

  // Status dos 4 integrantes no palco
  const dotsWrap = document.getElementById('hud-band-status');
  if (dotsWrap.childElementCount !== d.bandFighters.length) {
    dotsWrap.innerHTML = '';
    d.bandFighters.forEach((b) => {
      const el = document.createElement('div');
      el.className = 'band-dot';
      el.id = `dot-${b.bandId}`;
      el.title = b.name;
      el.innerHTML = `<img src="${b.head}" alt="${b.name}" />`;
      dotsWrap.appendChild(el);
    });
  }
  d.bandFighters.forEach((b) => {
    const el = document.getElementById(`dot-${b.bandId}`);
    if (el) el.classList.toggle('ko', b.state === 'ko');
  });

  // Barra do Chefe
  if (d.mainBoss && d.mainBoss.state !== 'ko') {
    bossHud.classList.remove('hidden');
    const bossImg = document.getElementById('boss-hud-img');
    if (bossImg.dataset.lastSrc !== d.mainBoss.head) {
      bossImg.src = d.mainBoss.head;
      bossImg.dataset.lastSrc = d.mainBoss.head;
    }
    document.getElementById('boss-hud-name').textContent = `${d.mainBoss.name} — ${d.mainBoss.role.split('•')[0].trim().toUpperCase()}`;
    const bossSub = document.getElementById('boss-hud-sub');
    if (bossSub) {
      bossSub.textContent = (d.mainBoss.isHitler || d.mainBoss.isMussolini)
        ? d.mainBoss.cryingTimer > 0
          ? '😭 CHORANDO NO BUNKER 77!'
          : 'CHEFE DO BUNKER 77'
        : 'CHEFE NO PALCO';
    }
    document.getElementById('boss-hp-fill').style.width = `${Math.max(0, (d.mainBoss.hp / d.mainBoss.maxHp) * 100)}%`;
  } else {
    bossHud.classList.add('hidden');
  }
}

const pendingRunByOverlay = { victory: null, gameover: null };

async function handleRunLeaderboard(prefix, res) {
  const listEl = document.getElementById(`${prefix}-lb-list`);
  const badgeEl = document.getElementById(`${prefix}-lb-mode`);
  const statusEl = document.getElementById(`${prefix}-score-status`);
  const formEl = document.getElementById(`${prefix}-score-form`);
  const inputEl = document.getElementById(`${prefix}-name-input`);
  if (!listEl || !statusEl || !formEl || !inputEl) return;

  const stageName = res.isHell
    ? 'EXPURGÁTORIO'
    : (STAGES[res.stageId] || STAGES[selectedStageIdx] || {}).name || 'MOSH DE ARMA BRANCA';
  const runPayload = {
    characterName: selectedChar.name,
    stageName,
    score: Math.floor(Number(res.score) || 0),
    maxCombo: Math.floor(Number(res.maxCombo) || 0),
  };
  pendingRunByOverlay[prefix] = runPayload;

  formEl.classList.add('hidden');
  statusEl.classList.remove('is-top3');
  statusEl.textContent = 'Consultando Top 3...';

  const current = await fetchLeaderboard();
  renderTop3Into(listEl, badgeEl, current);

  if (qualifiesForTop3(runPayload.score, current.top3)) {
    statusEl.classList.add('is-top3');
    statusEl.textContent = '🏆 VOCÊ ENTROU NO TOP 3! Digite seu nome completo para salvar:';
    inputEl.value = getSavedPlayerName();
    formEl.classList.remove('hidden');
    setTimeout(() => inputEl.focus(), 60);
  } else if (current.top3.length >= 3) {
    const minScore = Number(current.top3[2].score || 0);
    statusEl.textContent = `Faça mais de ${minScore.toLocaleString('pt-BR')} pts para entrar no Top 3!`;
  } else {
    statusEl.textContent = 'Faça pontos no mosh para entrar no Top 3!';
  }
}

['victory', 'gameover'].forEach((prefix) => {
  const formEl = document.getElementById(`${prefix}-score-form`);
  const inputEl = document.getElementById(`${prefix}-name-input`);
  const listEl = document.getElementById(`${prefix}-lb-list`);
  const badgeEl = document.getElementById(`${prefix}-lb-mode`);
  const statusEl = document.getElementById(`${prefix}-score-status`);
  if (!formEl) return;

  formEl.addEventListener('submit', async (e) => {
    e.preventDefault();
    const runPayload = pendingRunByOverlay[prefix];
    if (!runPayload || runPayload.score <= 0) return;

    const btn = formEl.querySelector('button[type="submit"]');
    const typedName = setSavedPlayerName(inputEl.value) || 'Anônimo V77';

    if (btn) btn.disabled = true;
    statusEl.textContent = 'Salvando no Top 3...';

    const result = await submitLeaderboardScore({ ...runPayload, playerName: typedName });
    pendingRunByOverlay[prefix] = null;
    formEl.classList.add('hidden');
    if (btn) btn.disabled = false;

    renderTop3Into(listEl, badgeEl, result, result.id);
    if (result.inTop3) {
      statusEl.classList.add('is-top3');
      statusEl.textContent = `🏆 SALVO NO TOP 3! #${result.rank} LUGAR — ${typedName}! 🏆`;
    } else {
      statusEl.classList.remove('is-top3');
      statusEl.textContent = 'Alguém acabou de bater essa pontuação — tente novamente!';
    }
    refreshTitleLeaderboard();
  });
});

function showVictory(res) {
  const isFinal = res.stageId >= STAGES.length - 1;
  const nextStage = STAGES[(res.stageId + 1) % STAGES.length];
  if (nextStage && !res.isHell) {
    audioEngine.preloadStageStems(nextStage).catch(() => {});
  }

  const titleEl = document.getElementById('victory-title');
  const descEl = document.getElementById('victory-desc');
  const statsEl = document.getElementById('victory-stats');
  const nextBtn = document.getElementById('btn-next-stage');

  if (res.isHell) {
    unlockCd();
    refreshCdButton();
    titleEl.textContent = '😈 INFERNO EXPURGADO! 😈';
    descEl.textContent = 'Você selou as três fissuras do EXPURGÁTORIO e garantiu o CD Virtual da Válvula 77!';
    statsEl.innerHTML = `
      <div>SCORE<strong>${res.score}</strong></div>
      <div>MAX COMBO<strong>${res.maxCombo}x</strong></div>
      <div>FISSURAS SELADAS<strong>3/3</strong></div>
    `;
    nextBtn.textContent = '🔄 JOGAR SHOW DE NOVO';
    setTimeout(openCdModal, 420);
  } else {
    titleEl.textContent = isFinal ? '🤘 SHOW ZERADO! LENDA DO MOSH! 🤘' : '🔥 PALCO DESTRUÍDO! 🔥';
    descEl.textContent = isFinal
      ? 'Você sobreviveu a todas as músicas da Válvula 77 e derrubou a banda inteira!'
      : `Você dominou "${STAGES[res.stageId].name}"! Próxima faixa já tá engatilhada!`;
    statsEl.innerHTML = `
      <div>SCORE<strong>${res.score}</strong></div>
      <div>MAX COMBO<strong>${res.maxCombo}x</strong></div>
      <div>MÚSICOS K.O.<strong>${res.bandKoCount}/4</strong></div>
    `;
    nextBtn.textContent = isFinal ? '🔄 JOGAR SHOW DE NOVO' : '⚡ PRÓXIMA MÚSICA';
  }

  overlayVictory.classList.remove('hidden');
  handleRunLeaderboard('victory', res);
}

function showGameOver(res) {
  const quoteEl = document.getElementById('gameover-quote');
  if (quoteEl) quoteEl.textContent = res.quote || '"PORRAAAAAAA!!"';
  document.getElementById('gameover-stats').innerHTML = `
    <div>SCORE<strong>${res.score}</strong></div>
    <div>DERRUBADOS<strong>${res.koCount}</strong></div>
    <div>MAX COMBO<strong>${res.maxCombo}x</strong></div>
  `;
  overlayGameover.classList.remove('hidden');
  handleRunLeaderboard('gameover', res);
}

// Botões de Pause / Vitória / Game Over
function togglePause() {
  if (!engine.running || engine.ended) return;
  const next = !engine.paused;
  engine.setPaused(next);
  overlayPause.classList.toggle('hidden', !next);
}

let bunkerCheatBuffer = '';

window.addEventListener('keydown', (e) => {
  if (e.target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;

  if (e.code === 'Escape' || e.code === 'KeyP') {
    if (modalSettings && !modalSettings.classList.contains('hidden')) {
      closeSettingsModal();
      return;
    }
    if (modalControls && !modalControls.classList.contains('hidden')) {
      modalControls.classList.add('hidden');
      return;
    }
    if (cdModal && !cdModal.classList.contains('hidden')) {
      closeCdModal();
      return;
    }
    if (screens.game.classList.contains('active')) togglePause();
    return;
  }

  if (screens.game.classList.contains('active') && !e.repeat && e.key.length === 1) {
    bunkerCheatBuffer = (bunkerCheatBuffer + e.key.toLowerCase()).slice(-8);
    if (bunkerCheatBuffer === 'bunker77') {
      bunkerCheatBuffer = '';
      engine.triggerSecretRoomDebug();
    }
  }
});

document.getElementById('btn-game-pause').addEventListener('click', togglePause);
document.getElementById('btn-resume').addEventListener('click', togglePause);
document.getElementById('btn-game-mute').addEventListener('click', () => {
  handleMuteToggle();
});

// Bloqueia zoom por duplo-toque em mobile (iOS Safari ignora user-scalable=no)
document.addEventListener('dblclick', (e) => {
  e.preventDefault();
}, { passive: false });
let _lastTouchEnd = 0;
document.addEventListener('touchend', (e) => {
  const now = Date.now();
  if (now - _lastTouchEnd <= 300) {
    e.preventDefault();
  }
  _lastTouchEnd = now;
}, { passive: false });
document.addEventListener('gesturestart', (e) => e.preventDefault(), { passive: false });
document.addEventListener('gesturechange', (e) => e.preventDefault(), { passive: false });
document.addEventListener('gestureend', (e) => e.preventDefault(), { passive: false });

// Gatilho secreto no celular e acesso ao CD Virtual
if (secretBtn) {
  secretBtn.addEventListener('click', () => {
    secretBtn.classList.add('hidden');
    engine.triggerHellStageFromButton();
  });
}
if (cdTitleBtn) cdTitleBtn.addEventListener('click', openCdModal);
const closeVinylBtn = document.getElementById('btn-close-vinyl');
if (closeVinylBtn) closeVinylBtn.addEventListener('click', closeCdModal);
if (cdModal) {
  cdModal.addEventListener('click', (e) => {
    if (e.target === cdModal) closeCdModal();
  });
}

document.getElementById('btn-restart-stage').addEventListener('click', launchSelectedGame);
document.getElementById('btn-retry').addEventListener('click', launchSelectedGame);

document.getElementById('btn-next-stage').addEventListener('click', () => {
  selectedStageIdx = (selectedStageIdx + 1) % STAGES.length;
  stageDropdown.value = selectedStageIdx;
  launchSelectedGame();
});

function returnToTitle() {
  engine.stop();
  overlayPause.classList.add('hidden');
  overlayVictory.classList.add('hidden');
  overlayGameover.classList.add('hidden');
  closeCdModal();
  refreshCdButton();
  audioEngine.startMenuMedley(0);
  showScreen('title');
}

document.getElementById('btn-pause-menu').addEventListener('click', returnToTitle);
document.getElementById('btn-victory-menu').addEventListener('click', returnToTitle);
document.getElementById('btn-gameover-menu').addEventListener('click', returnToTitle);
document.getElementById('btn-gameover-select').addEventListener('click', () => {
  engine.stop();
  overlayGameover.classList.add('hidden');
  audioEngine.startMenuMedley(0);
  showScreen('select');
});

// ===== CONTROLES TOUCH (CELULAR / TABLET) =====
const touchControlsEl = document.getElementById('touch-controls');
const btnGameTouch = document.getElementById('btn-game-touch');
const joyEl = document.getElementById('touch-joystick');
const joyKnob = document.getElementById('joy-knob');

const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
let touchEnabled = isTouchDevice;

function syncTouchVisibility() {
  touchControlsEl.classList.toggle('hidden', !touchEnabled);
  const hint = document.querySelector('.hud-bottom-hint');
  if (hint) hint.style.display = touchEnabled ? 'none' : '';
}
syncTouchVisibility();

btnGameTouch.addEventListener('click', () => {
  touchEnabled = !touchEnabled;
  syncTouchVisibility();
  userSettings.touchControls = touchEnabled;
  if (settingTouchEl) settingTouchEl.checked = touchEnabled;
  saveSettings();
});

// Joystick analógico com suporte multi-touch (Pointer Events)
let joyPointerId = null;
const maxJoyDist = 44;

function updateJoystickFromEvent(e) {
  const rect = joyEl.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  let dx = e.clientX - cx;
  let dy = e.clientY - cy;
  const dist = Math.hypot(dx, dy);
  if (dist > maxJoyDist) {
    dx = (dx / dist) * maxJoyDist;
    dy = (dy / dist) * maxJoyDist;
  }
  joyKnob.style.transform = `translate(${dx}px, ${dy}px)`;
  const dead = 8;
  engine.setVirtualStick(
    Math.abs(dx) < dead ? 0 : dx / maxJoyDist,
    Math.abs(dy) < dead ? 0 : dy / maxJoyDist
  );
}

joyEl.addEventListener('pointerdown', (e) => {
  e.preventDefault();
  joyPointerId = e.pointerId;
  joyEl.setPointerCapture(e.pointerId);
  updateJoystickFromEvent(e);
});

joyEl.addEventListener('pointermove', (e) => {
  if (e.pointerId !== joyPointerId) return;
  e.preventDefault();
  updateJoystickFromEvent(e);
});

function releaseJoystick(e) {
  if (e.pointerId !== joyPointerId) return;
  joyPointerId = null;
  joyKnob.style.transform = 'translate(0px, 0px)';
  engine.setVirtualStick(0, 0);
}
joyEl.addEventListener('pointerup', releaseJoystick);
joyEl.addEventListener('pointercancel', releaseJoystick);

// Botões de ação touch (Soco, Pulo, Ombrada, Especial, Pegar Arma)
document.querySelectorAll('.t-btn').forEach((btn) => {
  const code = btn.dataset.key;
  btn.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    btn.classList.add('pressed');
    engine.triggerVirtualKey(code, true);
  });
  const release = (e) => {
    e.preventDefault();
    btn.classList.remove('pressed');
    engine.triggerVirtualKey(code, false);
  };
  btn.addEventListener('pointerup', release);
  btn.addEventListener('pointercancel', release);
  btn.addEventListener('pointerleave', release);
});

// ===== CONFIGURAÇÕES & REGULADOR DE VOLUME DO PLAYER =====
const SETTINGS_STORAGE_KEY = 'v77_settings';
const modalSettings = document.getElementById('modal-settings');
const deckVolumeSlider = document.getElementById('deck-volume-slider');
const settingMusicVol = document.getElementById('setting-music-vol');
const settingMusicVal = document.getElementById('setting-music-val');
const settingSfxVol = document.getElementById('setting-sfx-vol');
const settingSfxVal = document.getElementById('setting-sfx-val');
const settingCrtFx = document.getElementById('setting-crt-fx');
const settingScreenShake = document.getElementById('setting-screen-shake');
const settingTouchEl = document.getElementById('setting-touch');
const btnMedleyMute = document.getElementById('btn-medley-mute');
const btnGameMute = document.getElementById('btn-game-mute');

function getDefaultSettings() {
  return {
    musicVolume: 85,
    sfxVolume: 100,
    crtFx: true,
    screenShake: true,
    touchControls: isTouchDevice,
  };
}

function clampPct(val, fallback) {
  const n = Number(val);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(0, Math.min(100, Math.round(n)));
}

function loadSettings() {
  const defaults = getDefaultSettings();
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw);
    return {
      musicVolume: clampPct(parsed.musicVolume, defaults.musicVolume),
      sfxVolume: clampPct(parsed.sfxVolume, defaults.sfxVolume),
      crtFx: typeof parsed.crtFx === 'boolean' ? parsed.crtFx : defaults.crtFx,
      screenShake: typeof parsed.screenShake === 'boolean' ? parsed.screenShake : defaults.screenShake,
      touchControls: typeof parsed.touchControls === 'boolean' ? parsed.touchControls : defaults.touchControls,
    };
  } catch {
    return defaults;
  }
}

let userSettings = loadSettings();

function saveSettings() {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(userSettings));
  } catch {}
}

function syncMuteIcons() {
  const deckMuted = audioEngine.muted || userSettings.musicVolume === 0;
  const gameMuted = audioEngine.muted || (userSettings.musicVolume === 0 && userSettings.sfxVolume === 0);
  if (btnMedleyMute) btnMedleyMute.textContent = deckMuted ? '🔇' : '🔊';
  if (btnGameMute) btnGameMute.textContent = gameMuted ? '🔇' : '🔊';
}

function handleMuteToggle() {
  if (audioEngine.muted) {
    audioEngine.setMuted(false);
    if (userSettings.musicVolume === 0) {
      updateMusicVolume(85);
      return;
    }
  } else {
    audioEngine.setMuted(true);
  }
  syncMuteIcons();
}

function updateMusicVolume(pct) {
  const clamped = clampPct(pct, 85);
  userSettings.musicVolume = clamped;
  if (deckVolumeSlider) deckVolumeSlider.value = String(clamped);
  if (settingMusicVol) settingMusicVol.value = String(clamped);
  if (settingMusicVal) settingMusicVal.textContent = `${clamped}%`;
  if (clamped > 0 && audioEngine.muted) {
    audioEngine.setMuted(false);
  }
  audioEngine.setMusicVolume(clamped / 100);
  syncMuteIcons();
  saveSettings();
}

function updateSfxVolume(pct) {
  const clamped = clampPct(pct, 100);
  userSettings.sfxVolume = clamped;
  if (settingSfxVol) settingSfxVol.value = String(clamped);
  if (settingSfxVal) settingSfxVal.textContent = `${clamped}%`;
  if (clamped > 0 && audioEngine.muted) {
    audioEngine.setMuted(false);
  }
  audioEngine.setSfxVolume(clamped / 100);
  syncMuteIcons();
  saveSettings();
}

function applySettings() {
  if (deckVolumeSlider) deckVolumeSlider.value = String(userSettings.musicVolume);
  if (settingMusicVol) settingMusicVol.value = String(userSettings.musicVolume);
  if (settingMusicVal) settingMusicVal.textContent = `${userSettings.musicVolume}%`;
  if (settingSfxVol) settingSfxVol.value = String(userSettings.sfxVolume);
  if (settingSfxVal) settingSfxVal.textContent = `${userSettings.sfxVolume}%`;
  if (settingCrtFx) settingCrtFx.checked = userSettings.crtFx;
  if (settingScreenShake) settingScreenShake.checked = userSettings.screenShake;
  if (settingTouchEl) settingTouchEl.checked = userSettings.touchControls;

  audioEngine.setMusicVolume(userSettings.musicVolume / 100);
  audioEngine.setSfxVolume(userSettings.sfxVolume / 100);
  document.body.classList.toggle('no-crt', !userSettings.crtFx);
  engine.screenShakeEnabled = userSettings.screenShake;
  touchEnabled = userSettings.touchControls;
  syncTouchVisibility();
  syncMuteIcons();
}

function openSettingsModal() {
  if (modalSettings) modalSettings.classList.remove('hidden');
}

function closeSettingsModal() {
  if (modalSettings) modalSettings.classList.add('hidden');
}

document.getElementById('btn-open-settings')?.addEventListener('click', openSettingsModal);
document.getElementById('btn-pause-settings')?.addEventListener('click', openSettingsModal);
document.getElementById('btn-close-settings')?.addEventListener('click', closeSettingsModal);
document.getElementById('btn-done-settings')?.addEventListener('click', closeSettingsModal);
if (modalSettings) {
  modalSettings.addEventListener('click', (e) => {
    if (e.target === modalSettings) closeSettingsModal();
  });
}

deckVolumeSlider?.addEventListener('input', (e) => {
  updateMusicVolume(e.target.value);
});

settingMusicVol?.addEventListener('input', (e) => {
  updateMusicVolume(e.target.value);
});

settingSfxVol?.addEventListener('input', (e) => {
  updateSfxVolume(e.target.value);
});

settingSfxVol?.addEventListener('change', () => {
  if (userSettings.sfxVolume > 0) {
    audioEngine.init();
    audioEngine.playSFX('pickup');
  }
});

document.getElementById('btn-test-sfx')?.addEventListener('click', () => {
  audioEngine.init();
  audioEngine.playSFX('punch');
});

settingCrtFx?.addEventListener('change', (e) => {
  userSettings.crtFx = e.target.checked;
  document.body.classList.toggle('no-crt', !userSettings.crtFx);
  saveSettings();
});

settingScreenShake?.addEventListener('change', (e) => {
  userSettings.screenShake = e.target.checked;
  engine.screenShakeEnabled = userSettings.screenShake;
  saveSettings();
});

settingTouchEl?.addEventListener('change', (e) => {
  userSettings.touchControls = e.target.checked;
  touchEnabled = userSettings.touchControls;
  syncTouchVisibility();
  saveSettings();
});

document.getElementById('btn-reset-settings')?.addEventListener('click', () => {
  userSettings = getDefaultSettings();
  audioEngine.setMuted(false);
  applySettings();
  saveSettings();
});

applySettings();

