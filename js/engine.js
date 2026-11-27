// Motor Principal 2.5D Beat 'em Up — VÁLVULA 77: MOSH DE ARMA BRANCA
import { BAND_MEMBERS, WEAPONS, FAN_DEATH_QUOTES, HELL_STAGE_CONFIG } from './config.js';
import { audioEngine } from './audio.js';
import {
  drawFighter,
  drawVenue,
  drawHellVenue,
  drawPortal,
  drawProjectile,
  drawSecretRoomVenue,
  drawWeaponShape,
  drawBeerBottle,
  getHitlerAvatarDataUrl,
  getMussoliniAvatarDataUrl,
} from './sprites.js';

const W = 1280;
const H = 720;

const STAGE_MIN_Y = 266;
const STAGE_MAX_Y = 354;
const PIT_MIN_Y = 398;
const PIT_MAX_Y = 678;
const SECRET_MIN_Y = 258;
const SECRET_MAX_Y = 678;

const SECRET_FLAMETHROWER_KILLS = 7;
const SECRET_HITLER_KILLS = 14;
const SECRET_MUSSOLINI_KILLS = 21;

const SECRET_NAZI_STYLES = [
  { skin: '#e7b89c', hairStyle: 'naziHelmet', hairColor: '#4b5563', jacket: '#3f3f46', shirt: '#18181b', pants: '#1f2937', boots: '#09090b', spikes: false, isNazi: true, hasMustache: true },
  { skin: '#d6a588', hairStyle: 'naziHelmet', hairColor: '#374151', jacket: '#364135', shirt: '#1c1917', pants: '#18181b', boots: '#09090b', spikes: false, isNazi: true, hasMustache: true },
  { skin: '#ecc2a8', hairStyle: 'bald', hairColor: '#111', jacket: '#44403c', shirt: '#292524', pants: '#0f172a', boots: '#111', spikes: false, isNazi: true, hasMustache: true },
];

const HITLER_VISUAL = {
  skin: '#f3c9ad',
  hairStyle: 'hitler',
  hairColor: '#111116',
  jacket: '#6b6541',
  shirt: '#e7dec8',
  pants: '#363b24',
  boots: '#09090b',
  spikes: false,
  isNazi: true,
  isHitler: true,
  hasMustache: true,
};

const HITLER_CRY_HAMMER = [
  'BUÁÁÁ! MEU BIGODE NÃO!',
  'AI MINHA CABEÇA! O MARTELO DÓI!',
  'NÃO ME BATE! EU SOU UM COVARDE!',
  'MEU BUNKER NÃO! BUÁÁÁÁÁ!',
  'SNIF... PÁRA COM ESSE MARTELO!',
  'AI! AI! MEU REICH TÁ ACABANDO!',
];

const HITLER_CRY_FLAME = [
  'TÁ QUENTEEEEE! SOCORRO!',
  'BUÁÁÁ! TÁ QUEIMANDO MEU BIGODE!',
  'PÁRA COM ESSE LANÇA-CHAMAS! BUÁÁÁ!',
  'AI! FOGO! FOGO! SOCORROOOOO!',
  'TÔ ASSANDO! BUÁÁÁÁÁ!',
];

const MUSSOLINI_VISUAL = {
  skin: '#d8a47a',
  hairStyle: 'mussolini',
  hairColor: '#1a1410',
  jacket: '#141414',
  shirt: '#1c1c1c',
  pants: '#222222',
  boots: '#09090b',
  spikes: false,
  isNazi: true,
  isMussolini: true,
  hasMustache: false,
};

const MUSSOLINI_CRY_HAMMER = [
  'MAMMA MIA! MEU QUEIXO!',
  'BASTA! PAREM COM ESSE MARTELO!',
  'BUÁÁÁ! EU SÓ QUERIA UM IMPÉRIO!',
  'AI! MEU BIGODE! MINHA DIGNIDADE!',
  'SNIF... O DUCE NÃO AGUENTA MAIS!',
  'NÃO NO BUNKER! BUÁÁÁÁÁ!',
];

const MUSSOLINI_CRY_FLAME = [
  'TÁ QUENTEEEEE! MAMMA MIA!',
  'BUÁÁÁ! TÁ QUEIMANDO MEU BIGODÃO!',
  'BASTA COM ESSE LANÇA-CHAMAS!',
  'AI! FOGO! O DUCE TÁ ASSANDO!',
  'SOCORRO! EU ME RENDO! BUÁÁÁ!',
];

const PUNK_ENEMY_STYLES = [
  { skin: '#e6b89c', hairStyle: 'mohawk', hairColor: '#22c55e', jacket: '#18181b', shirt: '#facc15', pants: '#1f2937', boots: '#09090b', spikes: true },
  { skin: '#c68b67', hairStyle: 'liberty', hairColor: '#cc0000', jacket: '#27272a', shirt: '#f4f1ea', pants: '#111827', boots: '#09090b', spikes: true },
  { skin: '#f0c4a8', hairStyle: 'spikyBob', hairColor: '#a855f7', jacket: '#1e1b4b', shirt: '#cc0000', pants: '#18181b', boots: '#7f1d1d', spikes: true },
  { skin: '#d9a484', hairStyle: 'sideMohawk', hairColor: '#38bdf8', jacket: '#09090b', shirt: '#a855f7', pants: '#27272a', boots: '#09090b', spikes: true },
];

const RAT_SUIT_VISUAL = {
  isRatSuit: true,
  skin: '#9ca3af',
  hairStyle: 'rat',
  hairColor: '#52525b',
  jacket: '#18181b',
  shirt: '#f4f1ea',
  pants: '#111116',
  boots: '#09090b',
  spikes: false,
};

const DEMON_STYLES = [
  { isDemon: true, skin: '#571010', hairStyle: 'bald', hairColor: '#1a0505', jacket: '#1a0505', shirt: '#7f1d1d', pants: '#120303', boots: '#09090b', spikes: false },
  { isDemon: true, skin: '#3f0a0a', hairStyle: 'bald', hairColor: '#1a0505', jacket: '#2a0808', shirt: '#b91c1c', pants: '#180404', boots: '#09090b', spikes: false },
  { isDemon: true, skin: '#6b1010', hairStyle: 'bald', hairColor: '#1a0505', jacket: '#111116', shirt: '#dc2626', pants: '#180404', boots: '#09090b', spikes: false },
];

const HELL_DRUM_X = W / 2 + 15;
const HELL_DRUM_Y = 296;
const HELL_TRIGGER_RADIUS = 58;
const HELL_TRIGGER_DWELL = 1.5; // segundos parado dentro do círculo da bateria
const HELL_VALVE_COOLDOWN = 0.45;

const STEM_LABELS = {
  vocal: 'VOCAL SILENCIADO!',
  guitar: 'GUITARRA SILENCIADA!',
  bass: 'BAIXO SILENCIADO!',
  drums: 'BATERIA SILENCIADA!',
};

let fanQuoteIdx = 0;

export class MoshGameEngine {
  constructor(canvas, callbacks) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.cb = callbacks;

    // Câmera responsiva: o mundo continua em 1280x720, mas o canvas
    // preenche a tela (cover) e acompanha o jogador em telas estreitas.
    this.camera = {
      x: W / 2,
      y: H / 2,
      scale: 1,
      viewW: W,
      viewH: H,
      cssW: W,
      cssH: H,
      dpr: 1,
    };
    this._onViewportResize = () => this._resizeCanvas();
    window.addEventListener('resize', this._onViewportResize);
    window.addEventListener('orientationchange', this._onViewportResize);

    this.keys = {};
    this.justPressed = {};
    this.virtualStick = { x: 0, y: 0 };
    this._bindInput();

    this.running = false;
    this.paused = false;
    this.rafId = null;
    this.lastTs = 0;

    this.time = 0;
    this.hitstop = 0;
    this.shake = 0;
    this.moshActive = false;
    this.prevMoshActive = false;
    this.bannerText = '';
    this.bannerSub = '';
    this.bannerTimer = 0;
    this.bannerColor = '#ff0000';

    this.stage = null;
    this.player = null;
    this.enemies = [];
    this.bandFighters = [];
    this.weaponsOnFloor = [];
    this.beersOnFloor = [];
    this.particles = [];
    this.shockwaves = [];
    this.floatingTexts = [];

    this.score = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.comboTimer = 0;
    this.koCount = 0;
    this.bandKoCount = 0;
    this.spawnTimer = 0;
    this.weaponDropTimer = 4.5;
    this.beerCooldown = 4.0;
    this.ratWaveTimer = 5.5;
    this.ratBannerShown = false;
    this.ended = false;
    this._lastMoshDmg = 0;

    // Estado do Easter Egg Secreto (Sala 77)
    this.easterEggActive = false;
    this.secretHoldTimer = 0;
    this.secretCountdown = 0;
    this.secretSpawnTimer = 0;
    this.secretKills = 0;
    this.secretFlamethrowerDropped = false;
    this.secretHitlerSpawned = false;
    this.secretHitlerDefeated = false;
    this.secretMussoliniSpawned = false;
    this.secretMussoliniDefeated = false;
    this.secretFlashTimer = 0;
    this.flameSfxTimer = 0;
    this.flameTickTimer = 0;
    this._savedStageState = null;

    // Estado da Fase Secreta EXPURGÁTORIO
    this.hellMode = false;
    this.hellCheatBuffer = '';
    this.hellDwellTimer = 0;
    this.hellTriggerReady = false;
    this.hellTime = 0;
    this.hellPhase = -1;
    this.hellPhaseLabel = '';
    this.hellWaveTimer = 0;
    this.hellPortalTimer = 0;
    this.hellVictory = false;
    this.portals = [];
    this.projectiles = [];
    this.mgFireTimer = 0;
    this.valveCooldown = 0;
    this.lockedPortal = null;
    this.lockedTimer = 0;
    this.lockedPortal = null;
    this.lockedTimer = 0;
  }

  _bindInput() {
    window.addEventListener('keydown', (e) => {
      if (e.target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;
      const code = e.code;
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(code)) {
        if (this.running && !this.paused) e.preventDefault();
      }
      if (!this.keys[code]) this.justPressed[code] = true;
      this.keys[code] = true;

      // Código secreto V77 (teclado) — exige estar no círculo da bateria com a foice
      if (!e.repeat && e.key && e.key.length === 1) {
        this.hellCheatBuffer = (this.hellCheatBuffer + e.key.toLowerCase()).slice(-3);
        if (this.hellCheatBuffer === 'v77') {
          this.hellCheatBuffer = '';
          this.triggerHellStageFromCode();
        }
      }
    });
    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });
  }

  setVirtualStick(vx, vy) {
    this.virtualStick.x = vx;
    this.virtualStick.y = vy;
  }

  triggerVirtualKey(code, pressed) {
    if (pressed) {
      if (!this.keys[code]) this.justPressed[code] = true;
      this.keys[code] = true;
    } else {
      this.keys[code] = false;
    }
  }

  // Ajusta o backing store do canvas ao tamanho real da tela.
  // Usamos "cover": nunca aparece faixa preta e o mundo nunca fica distorcido.
  _resizeCanvas() {
    const rect = this.canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const bw = Math.max(1, Math.round(rect.width * dpr));
    const bh = Math.max(1, Math.round(rect.height * dpr));
    if (this.canvas.width !== bw || this.canvas.height !== bh) {
      this.canvas.width = bw;
      this.canvas.height = bh;
    }

    const cam = this.camera;
    cam.cssW = rect.width;
    cam.cssH = rect.height;
    cam.dpr = dpr;
    cam.scale = Math.max(rect.width / W, rect.height / H);
    cam.viewW = rect.width / cam.scale;
    cam.viewH = rect.height / cam.scale;
    this._clampCameraPosition();
  }

  _cameraTarget() {
    const cam = this.camera;
    const p = this.player;
    if (!p) return { x: W / 2, y: H / 2 };

    const halfW = cam.viewW / 2;
    const halfH = cam.viewH / 2;
    return {
      x: Math.max(halfW, Math.min(W - halfW, p.x)),
      y: Math.max(halfH, Math.min(H - halfH, p.y - 60)),
    };
  }

  _clampCameraPosition() {
    const cam = this.camera;
    const target = this._cameraTarget();
    cam.x = Math.max(0, Math.min(W, target.x));
    cam.y = Math.max(0, Math.min(H, target.y));
  }

  _snapCamera() {
    const target = this._cameraTarget();
    this.camera.x = target.x;
    this.camera.y = target.y;
  }

  _updateCamera(dt) {
    const cam = this.camera;
    const target = this._cameraTarget();
    const k = 1 - Math.exp(-dt * 9);
    cam.x += (target.x - cam.x) * k;
    cam.y += (target.y - cam.y) * k;
  }

  // Toque na fissura (celular) fixa o alvo da Válvula Preta por alguns segundos
  setTargetLockAt(clientX, clientY, rect) {
    if (!this.hellMode || this.ended || !rect || !rect.width || !rect.height) return false;
    const cam = this.camera;
    // Converte a coordenada da tela para a coordenada do mundo já com a câmera aplicada.
    const x = (clientX - rect.left - rect.width / 2) / cam.scale + cam.x;
    const y = (clientY - rect.top - rect.height / 2) / cam.scale + cam.y;
    for (const portal of this.portals) {
      if (portal.sealed) continue;
      if (Math.hypot(x - portal.x, y - portal.y) < 88) {
        this.lockedPortal = portal;
        this.lockedTimer = HELL_STAGE_CONFIG.targetLockDuration;
        return true;
      }
    }
    return false;
  }

  triggerSecretRoomDebug() {
    if (!this.running || this.paused || this.ended || this.easterEggActive) return;
    this._triggerSecretRoom();
  }

  _hellTriggerSpot() {
    const p = this.player;
    if (!p || !p.onStage || !p.weapon || p.weapon.id !== 'foice') return false;
    return Math.hypot(p.x - HELL_DRUM_X, p.y - HELL_DRUM_Y) <= HELL_TRIGGER_RADIUS;
  }

  _hellCanEnter() {
    return !!(
      this.running &&
      !this.paused &&
      !this.ended &&
      !this.easterEggActive &&
      !this.hellMode &&
      this.stage &&
      this.stage.id === 3 &&
      this.hellTriggerReady &&
      this._hellTriggerSpot()
    );
  }

  // Chamado pelo código de teclado v77 e pelo botão tátil V77 🔥
  triggerHellStageFromCode() {
    if (!this._hellCanEnter()) return false;
    this._triggerHellStage();
    return true;
  }

  triggerHellStageFromButton() {
    return this.triggerHellStageFromCode();
  }

  // No EXPURGÁTORIO a banda só toca: nunca é alvo de ataques do jogador
  _getAttackTargets() {
    if (this.hellMode || this.easterEggActive) return this.enemies;
    return [...this.enemies, ...this.bandFighters];
  }

  startStage(charData, stageData) {
    this.stop();
    this.stage = stageData;
    this.running = true;
    this.paused = false;
    this.ended = false;
    this.time = 0;
    this.hitstop = 0;
    this.shake = 0;
    this.moshActive = false;
    this.prevMoshActive = false;

    this.score = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.comboTimer = 0;
    this.koCount = 0;
    this.bandKoCount = 0;
    this.spawnTimer = 0.8;
    this.weaponDropTimer = 3.5;
    this.beerCooldown = 3.0;
    this.ratWaveTimer = 5.0;
    this.ratBannerShown = false;
    this._lastMoshDmg = 0;

    this.easterEggActive = false;
    this.secretHoldTimer = 0;
    this.secretCountdown = 0;
    this.secretSpawnTimer = 0;
    this.secretKills = 0;
    this.secretFlamethrowerDropped = false;
    this.secretHitlerSpawned = false;
    this.secretHitlerDefeated = false;
    this.secretMussoliniSpawned = false;
    this.secretMussoliniDefeated = false;
    this.secretFlashTimer = 0;
    this.flameSfxTimer = 0;
    this.flameTickTimer = 0;
    this._savedStageState = null;

    this.hellMode = false;
    this.hellCheatBuffer = '';
    this.hellDwellTimer = 0;
    this.hellTriggerReady = false;
    this.hellTime = 0;
    this.hellPhase = -1;
    this.hellPhaseLabel = '';
    this.hellWaveTimer = 0;
    this.hellPortalTimer = 0;
    this.hellVictory = false;
    this.portals = [];
    this.projectiles = [];
    this.mgFireTimer = 0;
    this.valveCooldown = 0;
    this.lockedPortal = null;
    this.lockedTimer = 0;

    this.enemies = [];
    this.weaponsOnFloor = [];
    this.beersOnFloor = [];
    this.particles = [];
    this.shockwaves = [];
    this.floatingTexts = [];

    this.player = {
      isPlayer: true,
      name: charData.name,
      bandId: charData.type === 'band' ? charData.id : null,
      visual: charData.visual || null,
      specialName: charData.specialName,
      rageReason: charData.rageReason || 'FÚRIA NO MOSH PIT!',
      deathQuote: charData.deathQuote || null,
      deathAudio: charData.deathAudio || null,
      weaponBonus: charData.weaponBonus || 1,
      x: 240,
      y: 540,
      z: 0,
      vx: 0,
      vy: 0,
      vz: 0,
      facing: 1,
      hp: charData.hp,
      maxHp: charData.hp,
      speed: charData.speed,
      damage: charData.damage,
      moshMeter: 0,
      wasMoshFull: false,
      weapon: null,
      state: 'idle',
      attackTimer: 0,
      attackDuration: 0.22,
      attackCooldown: 0,
      comboStep: 0,
      dashTimer: 0,
      dashCooldown: 0,
      hurtTimer: 0,
      invulnTimer: 0,
      specialAnimTimer: 0,
      scale: 1.08,
      animSeed: 0,
      onStage: false,
      hitIds: new Set(),
    };

    const stageSlots = {
      delleiw: { x: 290, y: 325 },
      psayco: { x: W / 2 - 125, y: 344 },
      julian: { x: W - 290, y: 325 },
      misa: { x: W / 2 + 15, y: 292 },
    };

    this.bandFighters = BAND_MEMBERS.map((m, idx) => {
      const isMainBoss = m.id === stageData.mainBoss;
      const slot = stageSlots[m.id];
      return {
        id: `band_${m.id}`,
        bandId: m.id,
        stemKey: m.stemKey,
        name: m.name,
        role: m.role,
        head: m.head,
        isEnemy: true,
        isBand: true,
        isBoss: isMainBoss,
        x: slot.x,
        y: slot.y,
        homeX: slot.x,
        homeY: slot.y,
        z: 0,
        vx: 0,
        vy: 0,
        vz: 0,
        facing: slot.x > W / 2 ? -1 : 1,
        hp: isMainBoss ? 520 + stageData.id * 140 : 180,
        maxHp: isMainBoss ? 520 + stageData.id * 140 : 180,
        speed: isMainBoss ? 195 : 145,
        damage: isMainBoss ? 16 : 11,
        state: 'playing',
        aggro: false,
        attackTimer: 0,
        attackDuration: 0.3,
        attackCooldown: 1.2 + idx * 0.3,
        specialCooldown: 4.5,
        hurtTimer: 0,
        invulnTimer: 0,
        knockdownTimer: 0,
        specialAnimTimer: 0,
        scale: isMainBoss ? 1.22 : 1.06,
        animSeed: idx * 1.7,
        headbang: true,
        moshHop: false,
      };
    });

    for (let i = 0; i < 6; i++) {
      this._spawnCrowdEnemy(280 + i * 155, 440 + (i % 3) * 75);
    }

    this._spawnWeapon(W / 2 + 120, 560, stageData.weaponPool[0]);

    // Enquadra a câmera já no primeiro frame (importante após girar o celular).
    this._resizeCanvas();
    this._snapCamera();

    this._showBanner(`${stageData.num}: ${stageData.name}`, stageData.subtitle, '#facc15', 2.6);
    audioEngine.startStageTrack(stageData);

    this.lastTs = performance.now();
    this.rafId = requestAnimationFrame((ts) => this._loop(ts));
  }

  stop() {
    this.running = false;
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.rafId = null;
  }

  setPaused(val) {
    this.paused = val;
    if (val) audioEngine.pauseMusic();
    else audioEngine.resumeMusic();
  }

  _showBanner(text, sub = '', color = '#ff0000', duration = 2.2) {
    this.bannerText = text;
    this.bannerSub = sub;
    this.bannerColor = color;
    this.bannerTimer = duration;
  }

  _spawnCrowdEnemy(x, y, forceRat = false) {
    let vis;
    if (forceRat) {
      vis = RAT_SUIT_VISUAL;
    } else {
      const styleIdx = Math.floor(Math.random() * PUNK_ENEMY_STYLES.length);
      vis = PUNK_ENEMY_STYLES[styleIdx];
    }

    const fromLeft = Math.random() < 0.5;
    const sx = x ?? (fromLeft ? -35 : W + 35);
    const sy = y ?? (PIT_MIN_Y + 20 + Math.random() * (PIT_MAX_Y - PIT_MIN_Y - 40));

    const baseHp = 46 + this.stage.id * 10;
    const baseDamage = forceRat ? 15 : 8 + this.stage.id * 2;

    const enemy = {
      id: `npc_${Math.random().toString(36).slice(2)}`,
      isEnemy: true,
      isBand: false,
      isBoss: false,
      isNazi: !!vis.isNazi,
      isRatSuit: !!vis.isRatSuit,
      visual: vis,
      x: sx,
      y: sy,
      z: 0,
      vx: 0,
      vy: 0,
      vz: 0,
      facing: sx < W / 2 ? 1 : -1,
      hp: forceRat ? Math.round(baseHp * 1.55) : baseHp,
      maxHp: forceRat ? Math.round(baseHp * 1.55) : baseHp,
      speed: forceRat ? 132 : 115 + Math.random() * 55,
      baseDamage,
      damage: baseDamage,
      state: 'idle',
      attackTimer: 0,
      attackDuration: 0.25,
      attackCooldown: 0.8 + Math.random() * 1.4,
      hurtTimer: 0,
      invulnTimer: 0,
      knockdownTimer: 0,
      stunTimer: 0,
      dashTimer: 0,
      scale: forceRat ? 1.12 : 0.96 + Math.random() * 0.14,
      animSeed: Math.random() * 10,
      headbang: true,
      moshHop: false,
      orbitAngle: Math.random() * Math.PI * 2,
      thrownByPlayer: false,
    };
    enemy.damage = this._rollMoshEnemyDamage(enemy);
    this.enemies.push(enemy);
  }

  _spawnDemon(x, y, tier = 1) {
    const vis = DEMON_STYLES[Math.floor(Math.random() * DEMON_STYLES.length)];
    const sx = x ?? (Math.random() < 0.5 ? -35 : W + 35);
    const sy = y ?? PIT_MIN_Y + 20 + Math.random() * (PIT_MAX_Y - PIT_MIN_Y - 40);
    const phaseCfg = HELL_STAGE_CONFIG.phases[Math.min(tier, HELL_STAGE_CONFIG.phases.length - 1)];
    const hp = Math.round((phaseCfg.demonHp || 66) * (0.85 + Math.random() * 0.3));
    const dmg = Math.min(34, 9 + tier * 3 + Math.floor(Math.random() * 5));

    this.enemies.push({
      id: `demon_${Math.random().toString(36).slice(2)}`,
      isEnemy: true,
      isBand: false,
      isBoss: false,
      isDemon: true,
      isNazi: false,
      isRatSuit: false,
      visual: vis,
      x: sx,
      y: sy,
      z: 0,
      vx: 0,
      vy: 0,
      vz: 0,
      facing: sx < W / 2 ? 1 : -1,
      hp,
      maxHp: hp,
      speed: (phaseCfg.demonSpeed || 128) * (0.9 + Math.random() * 0.25),
      baseDamage: dmg,
      damage: dmg,
      state: 'idle',
      attackTimer: 0,
      attackDuration: 0.24,
      attackCooldown: 0.6 + Math.random() * 0.9,
      hurtTimer: 0,
      invulnTimer: 0,
      knockdownTimer: 0,
      stunTimer: 0,
      dashTimer: 0,
      scale: 0.95 + Math.random() * 0.16,
      animSeed: Math.random() * 10,
      headbang: true,
      moshHop: true,
      orbitAngle: Math.random() * Math.PI * 2,
      thrownByPlayer: false,
    });
  }

  _rollMoshEnemyDamage(e) {
    const base = e.baseDamage || e.damage || 8;
    const min = Math.max(3, base - 3);
    const max = base + 3;
    const candidates = [];
    for (let d = min; d <= max; d++) {
      if (d % 5 !== 0) candidates.push(d);
    }
    const currentHp = this.player ? this.player.hp : 0;
    const nonRoundHpPool = candidates.filter(
      (d) => d !== this._lastMoshDmg && currentHp - d > 0 && (currentHp - d) % 10 !== 0
    );
    const nonRepeatPool = candidates.filter((d) => d !== this._lastMoshDmg);
    const pool =
      nonRoundHpPool.length > 0 ? nonRoundHpPool : nonRepeatPool.length > 0 ? nonRepeatPool : candidates;
    const picked = pool[Math.floor(Math.random() * pool.length)];
    this._lastMoshDmg = picked;
    return picked;
  }

  _spawnWeapon(x, y, forceId = null) {
    const pool = this.stage.weaponPool;
    const wid = forceId || pool[Math.floor(Math.random() * pool.length)];
    const def = WEAPONS[wid];
    if (!def) return;
    this.weaponsOnFloor.push({
      ...def,
      x: x ?? 200 + Math.random() * (W - 400),
      y: y ?? PIT_MIN_Y + 35 + Math.random() * (PIT_MAX_Y - PIT_MIN_Y - 70),
      z: 220,
      vz: 0,
      life: 24,
    });
  }

  _spawnBeer() {
    this.beersOnFloor.push({
      x: 220 + Math.random() * (W - 440),
      y: PIT_MIN_Y + 45 + Math.random() * (PIT_MAX_Y - PIT_MIN_Y - 90),
      z: 210,
      vz: 0,
      life: 18,
    });
    this._addFloatText(W / 2, 430, '🍺 CERVEJA GELADA NO CHÃO! 🍺', '#4ade80', 20);
  }

  _spawnSecretNazi(x, y) {
    const vis = SECRET_NAZI_STYLES[Math.floor(Math.random() * SECRET_NAZI_STYLES.length)];
    let sx = x;
    let sy = y;
    if (sx == null || sy == null) {
      const roll = Math.random();
      if (roll < 0.35) {
        sx = -30;
        sy = SECRET_MIN_Y + 30 + Math.random() * (SECRET_MAX_Y - SECRET_MIN_Y - 60);
      } else if (roll < 0.7) {
        sx = W + 30;
        sy = SECRET_MIN_Y + 30 + Math.random() * (SECRET_MAX_Y - SECRET_MIN_Y - 60);
      } else {
        sx = Math.random() < 0.5 ? 150 + (Math.random() - 0.5) * 40 : W - 150 + (Math.random() - 0.5) * 40;
        sy = SECRET_MIN_Y + 4;
      }
    }

    const goRight = sx < W / 2;
    const initRoamX = goRight
      ? W * 0.55 + Math.random() * (W * 0.37)
      : W * 0.08 + Math.random() * (W * 0.37);
    const initRoamY = SECRET_MIN_Y + 36 + Math.random() * (SECRET_MAX_Y - SECRET_MIN_Y - 72);

    this.enemies.push({
      id: `nazi_${Math.random().toString(36).slice(2)}`,
      isEnemy: true,
      isBand: false,
      isBoss: false,
      isNazi: true,
      isWeakNazi: true,
      isPanicked: true,
      visual: vis,
      x: sx,
      y: sy,
      z: 0,
      vx: 0,
      vy: 0,
      vz: 0,
      facing: sx < W / 2 ? 1 : -1,
      hp: 1,
      maxHp: 1,
      speed: 170 + Math.random() * 85,
      damage: 0,
      state: 'idle',
      attackTimer: 0,
      attackDuration: 0.25,
      attackCooldown: 999,
      hurtTimer: 0,
      invulnTimer: 0,
      knockdownTimer: 0,
      stunTimer: 0,
      dashTimer: 0,
      scale: 0.9 + Math.random() * 0.12,
      animSeed: Math.random() * 12,
      headbang: false,
      moshHop: true,
      orbitAngle: Math.random() * 6.28,
      roamX: initRoamX,
      roamY: initRoamY,
      roamTimer: 3.2 + Math.random() * 2.2,
      thrownByPlayer: false,
    });
  }

  _getSecretTimerDisplay() {
    if (this.secretHoldTimer > 0) return 77;
    return Math.max(0, Math.floor(this.secretCountdown));
  }

  _triggerSecretRoom() {
    const p = this.player;
    this._savedStageState = {
      enemies: this.enemies,
      weaponsOnFloor: this.weaponsOnFloor,
      beersOnFloor: this.beersOnFloor,
      songTime: audioEngine.getCurrentTime(),
    };

    this.easterEggActive = true;
    this.secretHoldTimer = 1.0; // Espera 1s exibindo 77 estático antes de iniciar a contagem regressiva!
    this.secretCountdown = 77.0;
    this.secretSpawnTimer = 0.15;
    this.secretKills = 0;
    this.secretFlamethrowerDropped = false;
    this.secretHitlerSpawned = false;
    this.secretHitlerDefeated = false;
    this.secretMussoliniSpawned = false;
    this.secretMussoliniDefeated = false;
    this.secretFlashTimer = 0.65;
    this.flameSfxTimer = 0;
    this.flameTickTimer = 0;

    this.enemies = [];
    this.weaponsOnFloor = [];
    this.beersOnFloor = [];
    this.shockwaves = [];

    p.onStage = false;
    p.x = W / 2 - 140;
    p.y = 475;
    p.z = 160;
    p.vz = 40;
    p.vx = 0;
    p.vy = 0;
    p.facing = 1;
    p.hurtTimer = 0;
    p.invulnTimer = 1.6;
    // Inicialmente no Bunker 77 o jogador tem APENAS o martelo!
    p.weapon = { ...WEAPONS.martelo, durability: Infinity };

    for (let i = 0; i < 14; i++) {
      const nx = 120 + Math.random() * (W - 240);
      const ny = SECRET_MIN_Y + 30 + Math.random() * (SECRET_MAX_Y - SECRET_MIN_Y - 60);
      if (Math.hypot(nx - p.x, ny - p.y) > 95) {
        this._spawnSecretNazi(nx, ny);
      }
    }

    this.shake = 18;
    audioEngine.playSFX('secretEnter');
    audioEngine.startSecretRoomTrack();
    this._showBanner(
      'BUNKER 77 • CAPACETE DE NAZISTA É MARTELO!',
      `🔨 ESMAGUE ${SECRET_FLAMETHROWER_KILLS} NAZIS NO MARTELO PRA DROPAR O LANÇA-CHAMAS! 🔨`,
      '#facc15',
      4.2
    );
  }

  _dropSecretFlamethrower() {
    if (this.secretFlamethrowerDropped) return;
    this.secretFlamethrowerDropped = true;
    const p = this.player;
    const dropX = Math.max(150, Math.min(W - 150, p.x + p.facing * 125));
    const dropY = Math.max(SECRET_MIN_Y + 55, Math.min(SECRET_MAX_Y - 55, p.y));

    this.weaponsOnFloor.push({
      ...WEAPONS.flamethrower,
      durability: Infinity,
      x: dropX,
      y: dropY,
      z: 240,
      vz: 40,
      life: 9999,
    });

    this.shake = Math.max(this.shake, 14);
    this.shockwaves.push({ x: dropX, y: dropY, r: 20, speed: 520, color: '#f97316', alpha: 1 });
    this._spawnParticles(dropX, dropY - 25, '#f97316', 24);
    this._addFloatText(dropX, dropY - 96, '🔥 LANÇA-CHAMAS NO CHÃO! [E] 🔥', '#f97316', 22);
    audioEngine.playSFX('special');
    this._showBanner(
      '🔥 O LANÇA-CHAMAS DROPOU NO CHÃO! 🔥',
      'PEGUE COM [E] PRA INCINERAR OS NAZIS OU ALTERNAR COM O MARTELO!',
      '#f97316',
      3.6
    );
  }

  _spawnHitlerBoss() {
    if (this.secretHitlerSpawned) return;
    this.secretHitlerSpawned = true;
    const p = this.player;
    const spawnX = p.x < W / 2 ? W - 135 : 135;
    const spawnY = (SECRET_MIN_Y + SECRET_MAX_Y) / 2;

    this.enemies.push({
      id: 'boss_hitler',
      name: 'ADOLF HITLER',
      role: 'O COVARDE DO BUNKER 77',
      head: getHitlerAvatarDataUrl(false),
      isEnemy: true,
      isBand: false,
      isBoss: true,
      isNazi: true,
      isHitler: true,
      isWeakNazi: false,
      isPanicked: false,
      cryingTimer: 0,
      cryTextCooldown: 0,
      crySfxCooldown: 0,
      tearParticleTimer: 0,
      visual: HITLER_VISUAL,
      x: spawnX,
      y: spawnY,
      z: 190,
      vx: 0,
      vy: 0,
      vz: 45,
      facing: p.x >= spawnX ? 1 : -1,
      hp: 600,
      maxHp: 600,
      speed: 175,
      damage: 8,
      state: 'idle',
      attackTimer: 0,
      attackDuration: 0.24,
      attackCooldown: 1.5,
      hurtTimer: 0,
      invulnTimer: 0.45,
      knockdownTimer: 0,
      stunTimer: 0,
      dashTimer: 0,
      thrownByPlayer: false,
      scale: 1.24,
      animSeed: Math.random() * 10,
      orbitAngle: Math.random() * Math.PI * 2,
      roamX: W / 2,
      roamY: spawnY,
      roamTimer: 2.0,
    });

    this.shake = 22;
    this.shockwaves.push({ x: spawnX, y: spawnY, r: 22, speed: 620, color: '#ef4444', alpha: 1 });
    this._spawnParticles(spawnX, spawnY - 40, '#dc2626', 28);
    audioEngine.playSFX('hitlerEnter');
    this._showBanner(
      '💀 CHEFE DO BUNKER: HITLER APARECEU! 💀',
      '🔨 FAÇA O COVARDE CHORAR NO MARTELO E NO LANÇA-CHAMAS! 🔥',
      '#ef4444',
      4.4
    );
  }

  _spawnMussoliniBoss() {
    if (this.secretMussoliniSpawned) return;
    this.secretMussoliniSpawned = true;
    const p = this.player;
    const spawnX = p.x < W / 2 ? W - 135 : 135;
    const spawnY = (SECRET_MIN_Y + SECRET_MAX_Y) / 2;

    this.enemies.push({
      id: 'boss_mussolini',
      name: 'BENITO MUSSOLINI',
      role: 'O FASCISTA DO BUNKER 77',
      head: getMussoliniAvatarDataUrl(false),
      isEnemy: true,
      isBand: false,
      isBoss: true,
      isNazi: true,
      isMussolini: true,
      isWeakNazi: false,
      isPanicked: false,
      cryingTimer: 0,
      cryTextCooldown: 0,
      crySfxCooldown: 0,
      tearParticleTimer: 0,
      visual: MUSSOLINI_VISUAL,
      x: spawnX,
      y: spawnY,
      z: 190,
      vx: 0,
      vy: 0,
      vz: 45,
      facing: p.x >= spawnX ? 1 : -1,
      hp: 600,
      maxHp: 600,
      speed: 175,
      damage: 8,
      state: 'idle',
      attackTimer: 0,
      attackDuration: 0.24,
      attackCooldown: 1.5,
      hurtTimer: 0,
      invulnTimer: 0.45,
      knockdownTimer: 0,
      stunTimer: 0,
      dashTimer: 0,
      thrownByPlayer: false,
      scale: 1.24,
      animSeed: Math.random() * 10,
      orbitAngle: Math.random() * Math.PI * 2,
      roamX: W / 2,
      roamY: spawnY,
      roamTimer: 2.0,
    });

    this.shake = 22;
    this.shockwaves.push({ x: spawnX, y: spawnY, r: 22, speed: 620, color: '#ef4444', alpha: 1 });
    this._spawnParticles(spawnX, spawnY - 40, '#dc2626', 28);
    audioEngine.playSFX('hitlerEnter');
    this._showBanner(
      '💀 CHEFE DO BUNKER: MUSSOLINI APARECEU! 💀',
      '🔨 FAÇA O DUCE CHORAR NO MARTELO E NO LANÇA-CHAMAS! 🔥',
      '#ef4444',
      4.4
    );
  }

  _exitSecretRoom() {
    const p = this.player;
    this.easterEggActive = false;
    this.secretFlashTimer = 0.7;

    const saved = this._savedStageState;
    this._savedStageState = null;

    this.enemies = saved ? saved.enemies : [];
    this.weaponsOnFloor = saved ? saved.weaponsOnFloor : [];
    this.beersOnFloor = saved ? saved.beersOnFloor : [];
    this.shockwaves = [];

    p.hp = p.maxHp;
    p.onStage = true;
    p.x = W / 2;
    p.y = 315;
    p.z = 250;
    p.vz = 60;
    p.vx = 0;
    p.vy = 0;
    p.hurtTimer = 0;
    p.invulnTimer = 2.4;
    p.weapon = { ...WEAPONS.flamethrower, durability: Infinity };

    this.shake = 16;
    this.shockwaves.push({ x: p.x, y: p.y, r: 24, speed: 560, color: '#f97316', alpha: 1 });
    this._spawnParticles(p.x, p.y - 40, '#f97316', 24);

    audioEngine.playSFX('secretExit');
    audioEngine.exitSecretRoomTrack(this.stage, saved ? saved.songTime : 0);
    const title = this.secretMussoliniDefeated
      ? `🏆 BUNKER 77 ZERADO! HITLER E MUSSOLINI CAÍRAM + ${this.secretKills} NAZIS! 🏆`
      : `🔥 SALA 77 CONCLUÍDA! ${this.secretKills} NAZIS DESTRUÍDOS! 🔥`;
    this._showBanner(
      title,
      'HP 100% + ARMA ESPECIAL: LANÇA-CHAMAS LIBERADO NO SHOW!',
      '#f97316',
      3.8
    );
  }

  // ===== FASE SECRETA: EXPURGÁTORIO =====

  _triggerHellStage() {
    const p = this.player;
    this.hellMode = true;
    this.hellTriggerReady = false;
    this.hellDwellTimer = 0;
    this.hellCheatBuffer = '';
    this.hellTime = 0;
    this.hellPhase = -1;
    this.hellPhaseLabel = '';
    this.hellWaveTimer = 0;
    this.hellPortalTimer = 0;
    this.hellVictory = false;
    this.ended = false;
    this.portals = [];
    this.projectiles = [];
    this.mgFireTimer = 0;
    this.valveCooldown = 0;
    this.lockedPortal = null;
    this.lockedTimer = 0;

    // O show começa VAZIO: apenas a banda tocando a intro (0:00 - 0:28)
    this.enemies = [];
    this.weaponsOnFloor = [];
    this.beersOnFloor = [];
    this.shockwaves = [];
    this.particles = [];
    this.floatingTexts = [];

    p.maxHp = 777;
    p.hp = 777;
    p.onStage = false;
    p.x = W / 2;
    p.y = 520;
    p.z = 90;
    p.vz = 30;
    p.vx = 0;
    p.vy = 0;
    p.facing = 1;
    p.state = 'idle';
    p.hurtTimer = 0;
    p.invulnTimer = 1.8;
    p.moshMeter = 0;
    p.wasMoshFull = false;
    p.weapon = { ...WEAPONS.metralhadora, durability: Infinity };

    // Banda de preto com detalhes vermelhos (Psayco de sobretudo preto)
    for (const b of this.bandFighters) {
      b.hellMode = true;
      b.aggro = false;
      b.state = 'playing';
      b.hurtTimer = 0;
      b.invulnTimer = 0;
      b.attackTimer = 0;
      b.attackCooldown = 999;
      b.specialCooldown = 999;
      b.knockdownTimer = 0;
      b.specialAnimTimer = 0;
      b.headbang = true;
      b.moshHop = false;
      b.x = b.homeX;
      b.y = b.homeY;
      b.z = 0;
      b.vx = 0;
      b.vy = 0;
      b.vz = 0;
      if (b.bandId !== 'misa') {
        b.roamX = b.x + (Math.random() - 0.5) * 140;
        b.roamY = b.y + (Math.random() - 0.5) * 40;
        b.roamTimer = 2.0 + Math.random() * 3;
        b.idleTimer = Math.random() * 1.2;
        b.didRest = false;
        b.wanderSpeed = 0.75 + Math.random() * 0.5;
      }
    }

    // As duas armas ficam no chão para alternar com [E] / botão ARMA
    this.weaponsOnFloor.push({ ...WEAPONS.valvula, durability: Infinity, x: p.x + 105, y: p.y - 8, z: 150, vz: 20, life: 9999 });
    this.weaponsOnFloor.push({ ...WEAPONS.metralhadora, durability: Infinity, x: p.x - 105, y: p.y - 8, z: 150, vz: 20, life: 9999 });

    this.shake = 24;
    this.shockwaves.push({ x: p.x, y: p.y, r: 20, speed: 620, color: '#ff2a00', alpha: 1 });
    this._spawnParticles(p.x, p.y - 50, '#ef4444', 30);
    audioEngine.playSFX('hellEnter');
    audioEngine.startHellStageTrack();
    this._showBanner(
      '😈 FASE SECRETA: EXPURGÁTORIO 😈',
      '777 HP • METRALHADORA + VÁLVULA PRETA • SOBREVIVA AO INFERNO!',
      '#ff2a00',
      4.5
    );
  }

  _updateHellTrigger(dt) {
    const inSpot = this._hellTriggerSpot();
    this.hellDwellTimer = inSpot ? this.hellDwellTimer + dt : 0;
    this.hellTriggerReady = inSpot && this.hellDwellTimer >= HELL_TRIGGER_DWELL;
  }

  _updateHellPhase(t) {
    const phases = HELL_STAGE_CONFIG.phases;
    let idx = 0;
    for (let i = phases.length - 1; i >= 0; i--) {
      if (t >= phases[i].start) {
        idx = i;
        break;
      }
    }
    if (idx === this.hellPhase) return;
    this.hellPhase = idx;
    this.hellPhaseLabel = phases[idx].label;
    this._showBanner(`😈 EXPURGÁTORIO — FASE ${idx + 1}/4`, phases[idx].label, '#ff2a00', 2.8);
    this.shake = Math.max(this.shake, 12);
    if (idx === 3) this._openHellPortals();
  }

  _openHellPortals() {
    if (this.portals.length > 0) return;
    for (const pos of HELL_STAGE_CONFIG.portalPositions) {
      const portal = {
        x: pos.x,
        y: pos.y,
        sealed: false,
        guardianIds: [],
        guardiansAlive: 0,
        openFor: 0,
        fireTimer:
          HELL_STAGE_CONFIG.fireIntervalMin +
          Math.random() * (HELL_STAGE_CONFIG.fireIntervalMax - HELL_STAGE_CONFIG.fireIntervalMin),
        telegraph: 0,
        aimX: 0,
        aimY: 0,
      };
      this.portals.push(portal);
      this._spawnPortalGuardians(portal, HELL_STAGE_CONFIG.guardianPerPortal);
      this.shockwaves.push({ x: pos.x, y: pos.y, r: 10, speed: 380, color: '#ff2a00', alpha: 1 });
      this._spawnParticles(pos.x, pos.y - 20, '#ef4444', 18);
    }
    audioEngine.playSFX('hellEnter');
    this._showBanner('🛡 GUARDIÕES DAS FISSURAS!', 'DERRUBE OS DEMÔNIOS PARA ABRIR O PORTAL!', '#f97316', 3.2);
  }

  _spawnPortalGuardians(portal, count) {
    for (let i = 0; i < count; i++) {
      const side = i % 2 === 0 ? -1 : 1;
      const gx = Math.max(60, Math.min(W - 60, portal.x + side * (82 + Math.random() * 34)));
      const gy = Math.max(
        PIT_MIN_Y + 20,
        Math.min(PIT_MAX_Y - 20, portal.y - 24 + (Math.random() - 0.5) * 44)
      );
      this._spawnDemon(gx, gy, 3);
      const g = this.enemies[this.enemies.length - 1];
      g.isPortalGuardian = true;
      g.guardianOf = portal;
      g.maxHp = Math.round(g.maxHp * HELL_STAGE_CONFIG.guardianHpMult);
      g.hp = g.maxHp;
      g.speed *= HELL_STAGE_CONFIG.guardianSpeedMult;
      portal.guardianIds.push(g.id);
    }
    portal.guardiansAlive = portal.guardianIds.filter((id) =>
      this.enemies.some((e) => e.id === id && e.state !== 'ko')
    ).length;
  }

  _onGuardianDown(guardian) {
    const portal = guardian.guardianOf;
    if (!portal || portal.sealed) return;
    portal.guardiansAlive = Math.max(0, portal.guardiansAlive - 1);
    if (portal.guardiansAlive > 0) {
      this._addFloatText(guardian.x, guardian.y - 92, `🛡 -1 GUARDIÃO (${portal.guardiansAlive})`, '#f97316', 17);
      return;
    }
    portal.openFor = HELL_STAGE_CONFIG.portalOpenWindow;
    portal.fireTimer = Math.max(portal.fireTimer, 1.2);
    this._addFloatText(portal.x, portal.y - 80, '⚔️ FISSURA ABERTA!', '#4ade80', 21);
    this._showBanner('⚔️ FISSURA ABERTA!', 'SELAGEM LIBERADA — ARREMESSE A VÁLVULA!', '#4ade80', 2.2);
    this._spawnParticles(portal.x, portal.y - 20, '#4ade80', 18);
  }

  _fireHellOrb(portal) {
    const dx = portal.aimX - portal.x;
    const dy = portal.aimY - (portal.y - 26);
    const dist = Math.hypot(dx, dy) || 1;
    this.projectiles.push({
      kind: 'hellfire',
      x: portal.x,
      y: portal.y - 26,
      vx: (dx / dist) * HELL_STAGE_CONFIG.fireSpeed,
      vy: (dy / dist) * HELL_STAGE_CONFIG.fireSpeed,
      damage: HELL_STAGE_CONFIG.fireDamage,
      life: 3.2,
      portal,
    });
    this._spawnParticles(portal.x, portal.y - 26, '#ef4444', 10);
    audioEngine.playSFX('flame');
  }

  _updateHellWaves(dt) {
    const cfg = HELL_STAGE_CONFIG.phases[Math.max(0, this.hellPhase)];
    const alive = this.enemies.filter((e) => e.state !== 'ko').length;
    this.hellWaveTimer -= dt;
    if (this.hellWaveTimer <= 0 && cfg.spawnEvery > 0 && alive < cfg.maxEnemies && !this.hellVictory) {
      this.hellWaveTimer = cfg.spawnEvery;
      this._spawnDemon(null, null, this.hellPhase);
      if (this.hellPhase >= 2 && Math.random() < 0.35) this._spawnDemon(null, null, this.hellPhase);
      if (this.hellPhase >= 3 && Math.random() < 0.4) this._spawnDemon(null, null, 3);
    }

    // Janela de vulnerabilidade: se o jogador demorar, a fissura refaz um guardião
    for (const portal of this.portals) {
      if (portal.sealed || portal.guardiansAlive > 0 || portal.openFor <= 0) continue;
      portal.openFor -= dt;
      if (portal.openFor <= 0) {
        portal.openFor = 0;
        this._spawnPortalGuardians(portal, HELL_STAGE_CONFIG.guardianRespawnCount);
        this._addFloatText(portal.x, portal.y - 74, '🛡 A FISSURA SE REFIZ!', '#f97316', 19);
        this._showBanner('🛡 A FISSURA SE REFIZ!', 'UM GUARDIÃO VOLTOU — LIMPE DE NOVO!', '#f97316', 2.2);
      }
    }

    // As fissuras jorram demônios sem parar no pico da música
    const openPortals = this.portals.filter((pt) => !pt.sealed);
    this.hellPortalTimer -= dt;
    if (this.hellPortalTimer <= 0 && openPortals.length > 0 && !this.hellVictory) {
      this.hellPortalTimer = HELL_STAGE_CONFIG.portalSpawnEvery;
      const portal = openPortals[Math.floor(Math.random() * openPortals.length)];
      this._spawnDemon(portal.x + (Math.random() - 0.5) * 50, portal.y - 12, 3);
      this._spawnParticles(portal.x, portal.y - 20, '#f97316', 8);
    }

    // Fogo telegrafado: cada fissura aberta mira no jogador e dispara
    for (const portal of this.portals) {
      if (portal.sealed || this.hellVictory) continue;
      if (portal.telegraph > 0) {
        portal.telegraph -= dt;
        if (portal.telegraph <= 0) {
          portal.telegraph = 0;
          this._fireHellOrb(portal);
        }
        continue;
      }
      portal.fireTimer -= dt;
      if (portal.fireTimer <= 0) {
        portal.fireTimer =
          HELL_STAGE_CONFIG.fireIntervalMin +
          Math.random() * (HELL_STAGE_CONFIG.fireIntervalMax - HELL_STAGE_CONFIG.fireIntervalMin);
        portal.telegraph = HELL_STAGE_CONFIG.fireTelegraph;
        portal.aimX = this.player.x;
        portal.aimY = this.player.y - 45;
      }
    }

    // O travamento do alvo expira sozinho (retoque no celular renova)
    if (this.lockedTimer > 0) {
      this.lockedTimer -= dt;
      if (this.lockedTimer <= 0 || (this.lockedPortal && this.lockedPortal.sealed)) {
        this.lockedPortal = null;
        this.lockedTimer = 0;
      }
    }

    if (this.beerCooldown > 0) this.beerCooldown -= dt;
    if (
      this.player.hp > 0 &&
      this.player.hp / this.player.maxHp <= 0.35 &&
      this.beersOnFloor.length === 0 &&
      this.beerCooldown <= 0
    ) {
      this._spawnBeer();
      this.beerCooldown = 9;
    }
  }

  _updateProjectiles(dt) {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const pr = this.projectiles[i];
      pr.life -= dt;
      pr.x += pr.vx * dt;
      pr.y += pr.vy * dt;
      if (pr.kind === 'valve') {
        pr.rot = (pr.rot || 0) + dt * 18;
        pr.vy += 140 * dt;
      }

      let consumed = false;
      if (pr.kind === 'valve') {
        for (const portal of this.portals) {
          if (portal.sealed) continue;
          if (Math.hypot(pr.x - portal.x, pr.y - portal.y) < 58) {
            if (portal.guardiansAlive > 0 || portal.openFor <= 0) {
              this._addFloatText(portal.x, portal.y - 62, '🛡 PROTEGIDA!', '#f97316', 18);
              this._spawnParticles(pr.x, pr.y, '#f97316', 6);
              this._explodeValve(pr.x, pr.y, false);
            } else {
              this._sealPortal(portal);
              this._explodeValve(pr.x, pr.y, true);
            }
            consumed = true;
            break;
          }
        }
        // A válvula derruba as bolas de fogo no caminho
        if (!consumed) {
          for (const other of this.projectiles) {
            if (other.kind !== 'hellfire' || other.life <= 0) continue;
            if (Math.hypot(pr.x - other.x, pr.y - other.y) < 34) {
              other.life = 0;
              this._spawnParticles(other.x, other.y, '#facc15', 10);
            }
          }
        }
      }
      if (!consumed && pr.kind !== 'hellfire') {
        for (const e of this.enemies) {
          if (e.state === 'ko') continue;
          const radius = pr.kind === 'valve' ? 46 : 26;
          if (Math.hypot(pr.x - e.x, pr.y - (e.y - 45)) < radius) {
            if (pr.kind === 'valve') {
              // A Válvula Preta atravessa a horda, arrebentando demônios no caminho
              if (!pr.hitIds.has(e.id)) {
                pr.hitIds.add(e.id);
                this._damageTarget(e, Math.round(pr.damage * 0.55), Math.sign(pr.vx) * 360, true, 0.3, true);
                this._spawnParticles(pr.x, pr.y, '#f97316', 6);
              }
            } else {
              this._damageTarget(e, pr.damage, Math.sign(pr.vx) * pr.knockback, false, 0, true);
              this._spawnParticles(pr.x, pr.y, '#f97316', 3);
              consumed = true;
              break;
            }
          }
        }
      }

      if (
        !consumed &&
        pr.kind === 'hellfire' &&
        this.player.hp > 0 &&
        this.player.z < 60 &&
        Math.hypot(pr.x - this.player.x, pr.y - (this.player.y - 45)) < 26
      ) {
        this._hurtPlayer(pr.damage, Math.sign(pr.vx || 1) * 220);
        this._spawnParticles(pr.x, pr.y, '#f97316', 12);
        consumed = true;
      }

      if (consumed || pr.life <= 0 || pr.x < -80 || pr.x > W + 80 || pr.y < 110 || pr.y > H + 80) {
        if (!consumed && pr.kind === 'valve' && pr.life <= 0) this._explodeValve(pr.x, pr.y, false);
        this.projectiles.splice(i, 1);
      }
    }
  }

  _explodeValve(x, y, sealedPortal) {
    this.shake = Math.max(this.shake, 16);
    this.shockwaves.push({ x, y, r: 18, speed: 560, color: '#ef4444', alpha: 1 });
    this.shockwaves.push({ x, y, r: 8, speed: 380, color: '#facc15', alpha: 1 });
    this._spawnParticles(x, y, '#f97316', 26);
    this._spawnParticles(x, y, '#dc2626', 18);

    // Congela o estado do escudo ANTES de explodir: matar guardiões não sela no mesmo impacto
    const shieldedAtBlast = new Set(
      this.portals.filter((pt) => !pt.sealed && (pt.guardiansAlive > 0 || pt.openFor <= 0))
    );

    for (const e of [...this.enemies]) {
      if (e.state === 'ko') continue;
      if (Math.hypot(e.x - x, e.y - 45 - y) < 155) {
        const dir = e.x >= x ? 1 : -1;
        this._damageTarget(e, WEAPONS.valvula.damage, dir * WEAPONS.valvula.knockback, true, 0.5, true);
      }
    }
    // A explosão sela fissuras já abertas; se derrubou guardiões, o selo fica pro próximo tiro
    for (const portal of this.portals) {
      if (portal.sealed || shieldedAtBlast.has(portal)) continue;
      if (Math.hypot(portal.x - x, portal.y - y) < 110) this._sealPortal(portal);
    }
    for (const pr of this.projectiles) {
      if (pr.kind === 'hellfire' && Math.hypot(pr.x - x, pr.y - y) < 155) pr.life = 0;
    }
    if (!sealedPortal) audioEngine.playSFX('valveThrow');
  }

  _sealPortal(portal) {
    if (portal.sealed) return;
    portal.sealed = true;
    portal.openFor = 0;
    portal.telegraph = 0;
    portal.guardiansAlive = 0;
    for (const e of this.enemies) {
      if (e.isPortalGuardian && e.guardianOf === portal && e.state !== 'ko') {
        e.hp = 0;
        e.state = 'ko';
        e.knockdownTimer = 0.2;
        e._guardianCounted = true;
      }
    }
    if (this.lockedPortal === portal) {
      this.lockedPortal = null;
      this.lockedTimer = 0;
    }
    this.score += 3000;
    const sealedCount = this.portals.filter((pt) => pt.sealed).length;
    this._addFloatText(portal.x, portal.y - 62, 'FISSURA SELADA! +3000', '#4ade80', 22);
    this._showBanner(`🔥 FISSURA SELADA! ${sealedCount}/3 🔥`, 'FALTA POUCO PRA EXPURGAR O INFERNO!', '#4ade80', 2.2);
    this.shockwaves.push({ x: portal.x, y: portal.y, r: 16, speed: 520, color: '#22c55e', alpha: 1 });
    if (this.portals.length >= HELL_STAGE_CONFIG.portalCount && this.portals.every((pt) => pt.sealed)) {
      this._hellVictory();
    }
  }

  _hellVictory() {
    if (this.hellVictory) return;
    this.hellVictory = true;
    this.ended = true;
    this.shake = 26;
    for (const e of this.enemies) {
      if (e.state !== 'ko') this._damageTarget(e, 99999, Math.sign(e.x - W / 2) * 700, true, 0, true);
    }
    for (const portal of this.portals) {
      this.shockwaves.push({ x: portal.x, y: portal.y, r: 20, speed: 760, color: '#facc15', alpha: 1 });
      this._spawnParticles(portal.x, portal.y - 30, '#fef08a', 26);
    }
    audioEngine.playSFX('special');
    audioEngine.stopAllStageMusic();
    this._showBanner(
      '🏆 INFERNO EXPURGADO! CD VIRTUAL DESBLOQUEADO! 🏆',
      'A VÁLVULA 77 SOBREVIVEU AO EXPURGÁTORIO!',
      '#facc15',
      5.0
    );
    setTimeout(() => {
      if (this.cb.onVictory) {
        this.cb.onVictory({
          score: this.score,
          koCount: this.koCount,
          maxCombo: this.maxCombo,
          bandKoCount: this.bandKoCount,
          stageId: 3,
          isHell: true,
        });
      }
    }, 1500);
  }

  _updateMachinegun(dt) {
    const p = this.player;
    p.attackTimer = 0.12;
    p.attackDuration = 0.18;
    this.mgFireTimer -= dt;
    if (this.mgFireTimer > 0) return;
    this.mgFireTimer = 0.085;
    const spread = (Math.random() - 0.5) * 0.11;
    const y = p.y - 58 - p.z + (Math.random() - 0.5) * 10;
    this.projectiles.push({
      kind: 'bullet',
      x: p.x + p.facing * 52,
      y,
      vx: p.facing * 980 * Math.cos(spread),
      vy: 980 * Math.sin(spread),
      damage: Math.round(p.weapon.damage * p.weaponBonus * (this.moshActive ? 1.2 : 1)),
      knockback: p.weapon.knockback,
      life: 1.1,
    });
    this._spawnParticles(p.x + p.facing * 58, y, '#fef08a', 2);
    audioEngine.playSFX('machinegun');
  }

  _throwValve() {
    const p = this.player;
    p.attackTimer = 0.28;
    p.attackDuration = 0.32;
    p.attackCooldown = HELL_VALVE_COOLDOWN;
    p.comboStep = (p.comboStep + 1) % 3;

    let vx = p.facing * 720;
    let vy = -140;

    // Alvo travado por toque tem prioridade; senão o auto-aim só atua no cone da frente
    let best = this.lockedPortal && !this.lockedPortal.sealed ? this.lockedPortal : null;
    if (!best) {
      const ox = p.x + p.facing * 38;
      const oy = p.y - 58 - p.z;
      let bestDist = Infinity;
      for (const pt of this.portals) {
        if (pt.sealed) continue;
        const dx = pt.x - ox;
        const dy = (pt.y - 26 - oy) * 0.35; // comprime o desnível 2.5D
        const dist = Math.hypot(dx, dy) || 1;
        const forward = dx * p.facing;
        if (forward <= 0 || forward / dist < HELL_STAGE_CONFIG.aimConeCos) continue;
        const d = Math.abs(pt.x - p.x) + Math.abs(pt.y - p.y) * 0.35;
        if (d < bestDist) {
          bestDist = d;
          best = pt;
        }
      }
    }
    if (best) {
      const dx = best.x - p.x;
      const dy = best.y - 26 - (p.y - 60 - p.z);
      const dist = Math.hypot(dx, dy) || 1;
      vx = (dx / dist) * 760;
      vy = (dy / dist) * 760;
      p.facing = dx >= 0 ? 1 : -1;
    }
    this.projectiles.push({
      kind: 'valve',
      x: p.x + p.facing * 38,
      y: p.y - 58 - p.z,
      vx,
      vy,
      damage: WEAPONS.valvula.damage,
      knockback: WEAPONS.valvula.knockback,
      rot: 0,
      life: 2.2,
      hitIds: new Set(),
    });
    audioEngine.playSFX('valveThrow');
    this._spawnParticles(p.x + p.facing * 40, p.y - 58 - p.z, '#f97316', 8);
  }

  _loop(ts) {
    if (!this.running) return;
    const rawDt = (ts - this.lastTs) / 1000;
    this.lastTs = ts;
    const dt = Math.min(rawDt, 0.05);

    if (!this.paused) {
      this._update(dt);
    }
    this._render();
    if (this.hitstop <= 0) {
      this.justPressed = {};
    }

    this.rafId = requestAnimationFrame((t) => this._loop(t));
  }

  _update(dt) {
    this.time += dt;
    const audioInfo = audioEngine.updateAnalysis();
    this._lastAudio = audioInfo;

    if (!this.hellMode && !this.easterEggActive) this._updateHellTrigger(dt);

    if (this.secretFlashTimer > 0) {
      this.secretFlashTimer = Math.max(0, this.secretFlashTimer - dt);
    }

    if (this.hellMode) {
      this.moshActive = true;
      this.prevMoshActive = true;
      this.hellTime = audioEngine.getCurrentTime();
      this._updateHellPhase(this.hellTime);
    } else if (this.easterEggActive) {
      this.moshActive = true;
      this.prevMoshActive = true;
      if (this.secretHoldTimer > 0) {
        this.secretHoldTimer -= dt;
      } else {
        this.secretCountdown -= dt;
        if (this.secretCountdown <= 0) {
          this._exitSecretRoom();
          return;
        }
      }
    } else {
      // Detecta transição Calmo <-> MOSH AGRESSIVO
      this.moshActive = audioInfo.isAggressive;
      if (this.moshActive && !this.prevMoshActive && !this.ended) {
        this._showBanner('🔥 MOSH PIT ATIVADO! QUEBRA TUDO! 🔥', 'COMBOS E ESPECIAL EM DOBRO (2x)', '#ff0000', 2.2);
        this.shake = Math.max(this.shake, 12);
        if (this.weaponsOnFloor.length < 3) this._spawnWeapon();
        for (const e of this.enemies) {
          if (e.state !== 'ko' && e.z === 0) e.vz = 260 + Math.random() * 120;
        }
      }
      this.prevMoshActive = this.moshActive;
    }

    if (audioInfo.peak && this.moshActive) {
      this.shake = Math.max(this.shake, 4.5);
    }

    if (this.bannerTimer > 0) this.bannerTimer -= dt;
    if (this.shake > 0) this.shake = Math.max(0, this.shake - dt * 32);
    if (this.comboTimer > 0) {
      this.comboTimer -= dt;
      if (this.comboTimer <= 0) this.combo = 0;
    }

    if (this.hitstop > 0) {
      this.hitstop -= dt;
      return;
    }

    this._updatePlayer(dt);

    if (this.hellMode) {
      this._updateHellWaves(dt);
    } else if (this.easterEggActive) {
      const aliveNazis = this.enemies.filter((e) => e.state !== 'ko').length;
      this.secretSpawnTimer -= dt;
      if (this.secretSpawnTimer <= 0 && aliveNazis < 20) {
        this._spawnSecretNazi();
        if (aliveNazis < 12) this._spawnSecretNazi();
        this.secretSpawnTimer = 0.24;
      }
    } else {
      // Spawner de público no mosh
      const aliveCrowd = this.enemies.filter((e) => e.state !== 'ko').length;
      const maxCrowd = this.moshActive ? 10 : 6;
      this.spawnTimer -= dt;
      if (this.spawnTimer <= 0 && aliveCrowd < maxCrowd && !this.ended) {
        this._spawnCrowdEnemy();
        this.spawnTimer = this.moshActive ? 1.5 : 2.8;
      }

      // FASE FINAL (Santa Catareich): Invasão de "Ratos Saindo do Esgoto"!
      if (this.stage.hasSewerRats && !this.ended) {
        this.ratWaveTimer -= dt;
        if (this.ratWaveTimer <= 0) {
          this.ratWaveTimer = 14.0;
          const aliveRats = this.enemies.filter((e) => e.isRatSuit && e.state !== 'ko').length;
          if (aliveRats < 4) {
            if (!this.ratBannerShown) {
              this.ratBannerShown = true;
              this._showBanner('🐀 RATOS ESTÃO SAINDO DO ESGOTO! 🐀', 'BUROCRATAS DA PEC INVADIRAM O SHOW!', '#facc15', 3.0);
            } else {
              this._showBanner('🐀 MAIS RATOS SAINDO DO ESGOTO! 🐀', 'MANDA TUDO PRO CHÃO!', '#ff0000', 2.2);
            }
            this.shake = Math.max(this.shake, 11);
            this._spawnCrowdEnemy(-35, 455, true);
            this._spawnCrowdEnemy(W + 35, 585, true);
          }
        }
      }

      // Drop de armas brancas
      this.weaponDropTimer -= dt;
      if (this.weaponDropTimer <= 0 && this.weaponsOnFloor.length < 3 && !this.ended) {
        this._spawnWeapon();
        this.weaponDropTimer = this.moshActive ? 6.5 : 10.5;
      }

      // Spawn de GARRAFA DE CERVEJA (somente quando a vida estiver muito baixa <= 40%!)
      if (this.beerCooldown > 0) this.beerCooldown -= dt;
      if (
        !this.ended &&
        this.player.hp > 0 &&
        this.player.hp / this.player.maxHp <= 0.40 &&
        this.beersOnFloor.length === 0 &&
        this.beerCooldown <= 0
      ) {
        this._spawnBeer();
        this.beerCooldown = 11.0;
      }
    }

    // Atualiza Armas no chão
    for (let i = this.weaponsOnFloor.length - 1; i >= 0; i--) {
      const w = this.weaponsOnFloor[i];
      if (w.z > 0) {
        w.vz -= 1200 * dt;
        w.z = Math.max(0, w.z + w.vz * dt);
      }
      if (!this.easterEggActive) {
        w.life -= dt;
        if (w.life <= 0) this.weaponsOnFloor.splice(i, 1);
      }
    }

    // Atualiza Cervejas no chão + coleta automática por proximidade!
    for (let i = this.beersOnFloor.length - 1; i >= 0; i--) {
      const b = this.beersOnFloor[i];
      if (b.z > 0) {
        b.vz -= 1200 * dt;
        b.z = Math.max(0, b.z + b.vz * dt);
      }
      b.life -= dt;
      if (b.z < 20 && this.player.hp > 0) {
        const d = Math.hypot(b.x - this.player.x, (b.y - this.player.y) * 1.4);
        if (d < 54) {
          this._drinkBeer(i);
          continue;
        }
      }
      if (b.life <= 0) this.beersOnFloor.splice(i, 1);
    }

    this._updateEnemies(dt);
    if (this.hellMode) this._updateProjectiles(dt);
    if (this.hellMode) {
      this._updateHellBand(dt, audioInfo);
    } else if (!this.easterEggActive) {
      this._updateBandFighters(dt, audioInfo);
    }

    // Partículas, ondas e textos
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += p.gravity * dt;
      p.life -= dt;
      if (p.life <= 0) this.particles.splice(i, 1);
    }

    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const sw = this.shockwaves[i];
      sw.r += sw.speed * dt;
      sw.alpha -= dt * 1.9;
      if (sw.alpha <= 0) this.shockwaves.splice(i, 1);
    }

    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y -= 48 * dt;
      ft.life -= dt;
      if (ft.life <= 0) this.floatingTexts.splice(i, 1);
    }

    this._updateCamera(dt);

    if (!this.easterEggActive) {
      this._checkEndConditions();
    }

    if (this.cb.onHudUpdate) {
      const bandBoss = this.bandFighters.find((b) => b.isBoss);
      const hitlerBoss = this.easterEggActive ? this.enemies.find((e) => e.isHitler && e.state !== 'ko') : null;
      const mussoliniBoss = this.easterEggActive ? this.enemies.find((e) => e.isMussolini && e.state !== 'ko') : null;
      const secretBoss = hitlerBoss || mussoliniBoss;
      const activeBoss = this.hellMode
        ? null
        : this.easterEggActive
          ? secretBoss
          : bandBoss &&
            (bandBoss.aggro || bandBoss.hp < bandBoss.maxHp || this.koCount >= this.stage.targetKOs)
          ? bandBoss
          : null;
      this.cb.onHudUpdate({
        player: this.player,
        score: this.score,
        combo: this.combo,
        koCount: this.koCount,
        targetKOs: this.stage.targetKOs,
        moshActive: this.moshActive,
        easterEggActive: this.easterEggActive,
        easterEggTimerDisplay: this.easterEggActive ? this._getSecretTimerDisplay() : null,
        hellMode: this.hellMode,
        hellTriggerReady: this.hellTriggerReady,
        hellDwellTimer: this.hellDwellTimer,
        hellPhase: this.hellPhase,
        hellPhaseLabel: this.hellPhaseLabel,
        hellPortalsSealed: this.portals.filter((pt) => pt.sealed).length,
        hellPortalsTotal: this.portals.length,
        hellGuardiansAlive: this.portals.reduce(
          (n, pt) => n + (pt.sealed ? 0 : pt.guardiansAlive),
          0
        ),
        bandFighters: this.bandFighters,
        mainBoss: activeBoss,
      });
    }
  }

  _drinkBeer(index) {
    const b = this.beersOnFloor.splice(index, 1)[0];
    const p = this.player;
    const heal = Math.min(40, p.maxHp - p.hp);
    p.hp = Math.min(p.maxHp, p.hp + 40);
    audioEngine.playSFX('beer');
    this._spawnParticles(b.x, b.y - 20, '#facc15', 14);
    this._spawnParticles(b.x, b.y - 20, '#4ade80', 10);
    this._addFloatText(p.x, p.y - 105, `+${Math.max(heal, 1)} HP 🍺`, '#4ade80', 22);
  }

  _updatePlayer(dt) {
    const p = this.player;
    if (p.hp <= 0) return;

    if (p.attackTimer > 0) p.attackTimer -= dt;
    if (p.attackCooldown > 0) p.attackCooldown -= dt;
    if (p.dashTimer > 0) p.dashTimer -= dt;
    if (p.dashCooldown > 0) p.dashCooldown -= dt;
    if (p.hurtTimer > 0) p.hurtTimer -= dt;
    if (p.invulnTimer > 0) p.invulnTimer -= dt;
    if (p.specialAnimTimer > 0) p.specialAnimTimer -= dt;

    // Movimento 8 direções (Teclado + Joystick Touch)
    let mx = this.virtualStick.x;
    let my = this.virtualStick.y;
    if (this.keys['KeyA'] || this.keys['ArrowLeft']) mx -= 1;
    if (this.keys['KeyD'] || this.keys['ArrowRight']) mx += 1;
    if (this.keys['KeyW'] || this.keys['ArrowUp']) my -= 1;
    if (this.keys['KeyS'] || this.keys['ArrowDown']) my += 1;

    const mag = Math.hypot(mx, my);
    if (mag > 1) {
      mx /= mag;
      my /= mag;
    }

    if (p.dashTimer > 0) {
      p.vx = p.facing * 590;
      p.vy = my * 130;
      this._checkDashCollisions();
    } else if (p.hurtTimer <= 0) {
      const spd = p.speed * (this.moshActive ? 1.1 : 1.0);
      p.vx = mx * spd;
      p.vy = my * spd * 0.72;
      // Armas de tiro contínuo mantêm attackTimer ativo enquanto o botão está
      // pressionado; sem isso o facing ficaria travado e não daria para virar.
      const tiroContinuo =
        p.weapon &&
        (p.weapon.id === 'metralhadora' || p.weapon.id === 'flamethrower');
      if (mx !== 0 && (p.attackTimer <= 0 || tiroContinuo)) {
        p.facing = mx > 0 ? 1 : -1;
      }
    } else {
      p.vx *= 0.88;
      p.vy *= 0.88;
    }

    p.x += p.vx * dt;
    p.y += p.vy * dt;

    if (this.easterEggActive) {
      p.onStage = false;
      p.y = Math.max(SECRET_MIN_Y, Math.min(SECRET_MAX_Y, p.y));
      p.x = Math.max(48, Math.min(W - 48, p.x));
    } else {
      const nearStairs = p.x < 140 || p.x > W - 140;
      if (!p.onStage) {
        if (p.y < PIT_MIN_Y) {
          if (nearStairs || p.z > 22) {
            p.onStage = true;
            p.y = Math.min(STAGE_MAX_Y, p.y);
            this._addFloatText(p.x, p.y - 90, 'INVADIU O PALCO!', '#facc15', 22);
          } else {
            p.y = PIT_MIN_Y;
          }
        }
        p.y = Math.min(PIT_MAX_Y, p.y);
      } else {
        if (p.y > STAGE_MAX_Y) {
          p.onStage = false;
          p.y = PIT_MIN_Y + 4;
          if (p.z === 0) p.vz = 180;
        }
        p.y = Math.max(STAGE_MIN_Y, p.y);
      }

      p.x = Math.max(42, Math.min(W - 42, p.x));
    }

    // Pulo (K ou X — mantido conforme escolha do jogador!)
    if ((this.justPressed['KeyK'] || this.justPressed['KeyX']) && p.z === 0 && p.hurtTimer <= 0) {
      p.vz = 560;
    }

    if (p.z > 0 || p.vz > 0) {
      p.z += p.vz * dt;
      p.vz -= 1550 * dt;
      if (p.z <= 0) {
        p.z = 0;
        p.vz = 0;
      }
    }

    // Pegar cerveja ou arma branca (E)
    if (this.justPressed['KeyE']) {
      if (!this._tryPickupBeer()) {
        this._tryPickupWeapon();
      }
    }

    // EXPURGÁTORIO: Metralhadora contínua (J/Z) ou arremesso da Válvula Preta (J/Z)
    if (this.hellMode && p.weapon && p.weapon.id === 'metralhadora') {
      if ((this.keys['KeyJ'] || this.keys['KeyZ']) && p.hurtTimer <= 0) {
        this._updateMachinegun(dt);
      }
    } else if (this.hellMode && p.weapon && p.weapon.id === 'valvula') {
      if ((this.justPressed['KeyJ'] || this.justPressed['KeyZ']) && p.attackCooldown <= 0 && p.hurtTimer <= 0) {
        this._throwValve();
      }
    } else if (p.weapon && p.weapon.id === 'flamethrower') {
      if ((this.keys['KeyJ'] || this.keys['KeyZ'] || this.justPressed['KeyJ'] || this.justPressed['KeyZ']) && p.hurtTimer <= 0) {
        this._updateFlamethrowerStream(dt);
      }
    } else if ((this.justPressed['KeyJ'] || this.justPressed['KeyZ']) && p.attackCooldown <= 0 && p.hurtTimer <= 0) {
      this._performPlayerAttack();
    }

    // Ombrada de Mosh / Dash (L ou C)
    if ((this.justPressed['KeyL'] || this.justPressed['KeyC']) && p.dashCooldown <= 0 && p.hurtTimer <= 0) {
      p.dashTimer = 0.24;
      p.dashCooldown = 0.72;
      p.hitIds.clear();
      audioEngine.playSFX('slam');
      this._spawnParticles(p.x, p.y - 30, '#facc15', 8);
    }

    // Especial Caótico (Espaço ou U — mantido!)
    if ((this.justPressed['Space'] || this.justPressed['KeyU']) && p.moshMeter >= 100 && p.hurtTimer <= 0) {
      this._performPlayerSpecial();
    }
  }

  _tryPickupBeer() {
    const p = this.player;
    for (let i = 0; i < this.beersOnFloor.length; i++) {
      const b = this.beersOnFloor[i];
      if (b.z > 45) continue;
      if (Math.hypot(b.x - p.x, (b.y - p.y) * 1.4) < 88) {
        this._drinkBeer(i);
        return true;
      }
    }
    return false;
  }

  _tryPickupWeapon() {
    const p = this.player;
    let bestIdx = -1;
    let bestDist = 92;
    for (let i = 0; i < this.weaponsOnFloor.length; i++) {
      const w = this.weaponsOnFloor[i];
      if (w.z > 40) continue;
      const d = Math.hypot(w.x - p.x, (w.y - p.y) * 1.4);
      if (d < bestDist) {
        bestDist = d;
        bestIdx = i;
      }
    }
    if (bestIdx >= 0) {
      const picked = this.weaponsOnFloor.splice(bestIdx, 1)[0];
      if (p.weapon) {
        this.weaponsOnFloor.push({
          ...p.weapon,
          x: p.x - p.facing * 18,
          y: p.y + 4,
          z: 24,
          vz: 90,
          life: this.easterEggActive || p.weapon.isSpecialWeapon ? 9999 : 24,
        });
      }
      p.weapon = { ...picked };
      audioEngine.playSFX('pickup');
      this._addFloatText(p.x, p.y - 95, `${picked.icon} ${picked.name}!`, picked.color, 20);
    }
  }

  _updateFlamethrowerStream(dt) {
    const p = this.player;
    p.attackDuration = 0.2;
    p.attackTimer = 0.14;

    const nozzleX = p.x + p.facing * 64;
    const nozzleY = p.y - 58 - p.z;
    const flameColors = ['#fef08a', '#facc15', '#f97316', '#ea580c', '#ef4444', '#27272a'];

    for (let i = 0; i < 4; i++) {
      const spread = (Math.random() - 0.5) * 0.52;
      const spd = 460 + Math.random() * 290;
      const isSmoke = Math.random() < 0.18;
      this.particles.push({
        x: nozzleX + (Math.random() - 0.5) * 8,
        y: nozzleY + (Math.random() - 0.5) * 8,
        vx: p.facing * Math.cos(spread) * spd,
        vy: Math.sin(spread) * spd * 0.65 - (isSmoke ? 55 : 15),
        gravity: isSmoke ? -190 : -95,
        size: isSmoke ? 9 + Math.random() * 7 : 6 + Math.random() * 9,
        color: isSmoke ? '#27272a' : flameColors[Math.floor(Math.random() * 5)],
        life: 0.2 + Math.random() * 0.18,
      });
    }

    this.flameSfxTimer -= dt;
    if (this.flameSfxTimer <= 0) {
      audioEngine.playSFX('flame');
      this.flameSfxTimer = 0.095;
    }

    this.flameTickTimer -= dt;
    if (this.flameTickTimer <= 0) {
      this.flameTickTimer = 0.075;
      const range = p.weapon.range || 250;
      const targets = this._getAttackTargets();
      for (const t of targets) {
        if (t.state === 'ko' || t.invulnTimer > 0) continue;
        const dx = t.x - p.x;
        const dy = Math.abs(t.y - p.y);
        if (dx * p.facing > -12 && Math.abs(dx) <= range && dy <= 68) {
          const isHeavyFlame = !t.isBoss || t.hp <= 45;
          this._damageTarget(t, 45, p.facing * 240, isHeavyFlame, 0, true);
          if (!t.isWeakNazi) {
            t.invulnTimer = Math.max(t.invulnTimer, 0.14);
          }
        }
      }
    }
  }

  _performPlayerAttack() {
    const p = this.player;
    const w = p.weapon;
    const speedMul = w ? w.speedMul : 1.0;
    p.attackDuration = 0.22 / speedMul;
    p.attackTimer = p.attackDuration;
    p.attackCooldown = 0.24 / speedMul;
    p.comboStep = (p.comboStep + 1) % 3;

    const range = w ? w.range : p.z > 10 ? 92 : 76;
    const baseDmg = w ? Math.round(w.damage * p.weaponBonus) : p.damage + (p.comboStep === 2 ? 7 : 0);
    const dmg = Math.round(baseDmg * (this.moshActive ? 1.25 : 1.0));
    const kb = w ? w.knockback : p.comboStep === 2 || p.z > 10 ? 440 : 210;
    const isSpin = w && w.spin;

    if (w) {
      audioEngine.playSFX(w.id === 'martelo' ? 'hammer' : w.id === 'foice' ? 'scythe' : 'blade');
    } else {
      audioEngine.playSFX('punch');
    }

    const targets = this._getAttackTargets();
    let hitAny = false;

    for (const t of targets) {
      if (t.state === 'ko' || t.invulnTimer > 0) continue;
      const dx = t.x - p.x;
      const dy = Math.abs(t.y - p.y);
      const inFront = isSpin ? Math.abs(dx) <= range : dx * p.facing > -22 && Math.abs(dx) <= range;

      if (inFront && dy <= (isSpin ? 72 : 52)) {
        const dir = dx >= 0 ? 1 : -1;
        this._damageTarget(t, dmg, dir * kb, p.comboStep === 2 || p.z > 10 || (w && w.knockback >= 360), w?.stun || 0);
        hitAny = true;
      }
    }

    if (hitAny && w && !this.easterEggActive && Number.isFinite(w.durability)) {
      w.durability -= 1;
      if (w.durability <= 0) {
        this._addFloatText(p.x, p.y - 80, `${w.name} QUEBROU!`, '#9ca3af', 16);
        p.weapon = null;
      }
    }
  }

  _checkDashCollisions() {
    const p = this.player;
    const targets = this._getAttackTargets();
    for (const t of targets) {
      if (t.state === 'ko' || p.hitIds.has(t.id)) continue;
      const dist = Math.hypot(t.x - p.x, (t.y - p.y) * 1.5);
      if (dist < 62) {
        p.hitIds.add(t.id);
        this._damageTarget(t, Math.round(p.damage * 1.15), p.facing * 560, true, 0.35);
        this._addFloatText(t.x, t.y - 95, 'OMBRADA!', '#facc15', 18);
      }
    }
  }

  _performPlayerSpecial() {
    const p = this.player;
    p.moshMeter = 0;
    p.wasMoshFull = false;
    p.specialAnimTimer = 0.55;
    p.invulnTimer = 0.85;
    this.shake = 18;
    this.hitstop = 0.08;
    audioEngine.playSFX('special');

    this._showBanner(`⚡ ${p.specialName}! ⚡`, p.rageReason.toUpperCase(), '#facc15', 1.8);
    this.shockwaves.push({ x: p.x, y: p.y - 30, r: 25, speed: 680, color: '#facc15', alpha: 1 });
    this.shockwaves.push({ x: p.x, y: p.y - 30, r: 10, speed: 460, color: '#ff0000', alpha: 1 });

    const targets = this._getAttackTargets();
    for (const t of targets) {
      if (t.state === 'ko') continue;
      const dist = Math.hypot(t.x - p.x, (t.y - p.y) * 1.35);
      if (dist < 290) {
        const dir = t.x >= p.x ? 1 : -1;
        // O dano do próprio especial não deve recarregar a barra (evita especial em cadeia)
        this._damageTarget(t, Math.round(p.damage * 3.1), dir * 650, true, 0.8, false, false);
      }
    }
  }

  _damageTarget(t, dmg, knockVx, heavy, stunSec = 0, isFlame = false, chargeMeter = true) {
    // EXPURGÁTORIO: os músicos são intocáveis — apenas tocam
    if (this.hellMode && t.isBand) return;

    t.hp = Math.max(0, t.hp - dmg);
    t.hurtTimer = 0.22;
    t.vx = knockVx;
    t.facing = knockVx > 0 ? -1 : 1;

    if (t.isBand) {
      t.aggro = true;
      t.state = 'aggro';
    }

    if (heavy || t.hp <= 0) {
      t.vz = isFlame ? 180 : 260;
      t.state = t.hp <= 0 ? 'ko' : 'knockdown';
      t.knockdownTimer = t.isWeakNazi ? 0.25 : (t.isHitler || t.isMussolini) ? 0.42 : 0.85;
      t.thrownByPlayer = !isFlame;
    } else if (stunSec > 0) {
      t.stunTimer = stunSec;
    }

    if (!isFlame) {
      this.hitstop = heavy ? 0.045 : 0.02;
    }
    this.shake = Math.max(this.shake, isFlame ? 3.5 : heavy ? 9 : 4);
    this._spawnParticles(
      t.x,
      t.y - 50,
      isFlame ? '#f97316' : heavy ? '#ff0000' : '#facc15',
      isFlame ? 11 : heavy ? 14 : 7
    );

    this.combo += 1;
    if (this.combo > this.maxCombo) this.maxCombo = this.combo;
    this.comboTimer = 2.6;
    const moshMult = this.moshActive ? 2 : 1;
    const p = this.player;

    if (t.isWeakNazi && t.hp <= 0) {
      this.secretKills += 1;
      const bonusPts = 77 + this.combo * 5;
      this.score += bonusPts;
      if (chargeMeter) {
        p.moshMeter = Math.min(100, p.moshMeter + 4);
        if (p.moshMeter >= 100 && !p.wasMoshFull) {
          p.wasMoshFull = true;
          if (this.secretHoldTimer <= 0 && this.secretCountdown < 73.8) {
            this._showBanner(`💢 FÚRIA 100% — APERTE ESPAÇO! 💢`, p.rageReason.toUpperCase(), '#facc15', 2.4);
          }
        }
      }
      const tag = isFlame ? `🔥 +${bonusPts}` : `🔨 +${bonusPts}`;
      this._addFloatText(t.x, t.y - 86, tag, isFlame ? '#f97316' : '#facc15', 21);

      // Progressão do Bunker 77:
      // 1) Depois de matar alguns nazis no martelo, dropa o lança-chamas no chão!
      if (!this.secretFlamethrowerDropped && this.secretKills >= SECRET_FLAMETHROWER_KILLS) {
        this._dropSecretFlamethrower();
      }
      // 2) Progressão de chefes: Hitler primeiro, depois Mussolini
      if (!this.secretHitlerSpawned && this.secretKills >= SECRET_HITLER_KILLS) {
        this._spawnHitlerBoss();
      } else if (this.secretHitlerDefeated && !this.secretMussoliniSpawned && this.secretKills >= SECRET_MUSSOLINI_KILLS) {
        this._spawnMussoliniBoss();
      }
      return;
    }

    // Reação cômica dos chefes chorando enquanto levam martelada e lança-chamas!
    if (t.isHitler || t.isMussolini) {
      t.cryingTimer = 2.8;
      t.isPanicked = true;
      t.head = t.isHitler ? getHitlerAvatarDataUrl(true) : getMussoliniAvatarDataUrl(true);

      // Jato de partículas de lágrimas azuis voando!
      for (let k = 0; k < (isFlame ? 6 : 10); k++) {
        const ang = -Math.PI * 0.85 + Math.random() * Math.PI * 0.7;
        const spd = 110 + Math.random() * 190;
        this.particles.push({
          x: t.x + (Math.random() - 0.5) * 18,
          y: t.y - 95 + (Math.random() - 0.5) * 12,
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd - 65,
          gravity: 640,
          size: 4 + Math.random() * 4.5,
          color: Math.random() < 0.55 ? '#38bdf8' : '#bae6fd',
          life: 0.45 + Math.random() * 0.35,
        });
      }

      if ((t.crySfxCooldown ?? 0) <= 0) {
        audioEngine.playSFX('cry');
        t.crySfxCooldown = isFlame ? 0.36 : 0.24;
      }

      if ((t.cryTextCooldown ?? 0) <= 0 && t.hp > 0) {
        const lines = isFlame
          ? (t.isHitler ? HITLER_CRY_FLAME : MUSSOLINI_CRY_FLAME)
          : (t.isHitler ? HITLER_CRY_HAMMER : MUSSOLINI_CRY_HAMMER);
        const line = lines[Math.floor(Math.random() * lines.length)];
        this._addFloatText(t.x, t.y - 135, `😭 ${line}`, '#38bdf8', 19);
        t.cryTextCooldown = 0.88;
      }
    }

    this._addFloatText(t.x, t.y - 82, `-${dmg}`, heavy ? '#ff0000' : '#fff', heavy ? 22 : 16);
    this.score += dmg * 5 * moshMult + this.combo * 10;

    // Enche barra de especial e dispara o MOTIVO DA RAIVA quando chega em 100%!
    // O multiplicador do mosh continua valendo para pontuação, mas não para a carga.
    if (chargeMeter) {
      p.moshMeter = Math.min(100, p.moshMeter + (heavy ? 5 : 3));
      if (p.moshMeter >= 100 && !p.wasMoshFull) {
        p.wasMoshFull = true;
        this._showBanner(`💢 FÚRIA 100% — APERTE ESPAÇO! 💢`, p.rageReason.toUpperCase(), '#facc15', 2.8);
      }
    }

    if (t.hp <= 0) {
      if (t.isPortalGuardian && !t._guardianCounted) {
        t._guardianCounted = true;
        this._onGuardianDown(t);
      }
      if (t.isHitler) {
        this.secretHitlerDefeated = true;
        this.secretKills += 1;
        this.score += 7777;
        this.shake = 24;
        audioEngine.playSFX('cry');
        audioEngine.playSFX('special');
        this.shockwaves.push({ x: t.x, y: t.y - 30, r: 20, speed: 580, color: '#38bdf8', alpha: 1 });
        this.shockwaves.push({ x: t.x, y: t.y - 30, r: 10, speed: 420, color: '#facc15', alpha: 1 });
        this._spawnParticles(t.x, t.y - 60, '#38bdf8', 32);
        this._spawnParticles(t.x, t.y - 60, '#facc15', 22);
        this._addFloatText(t.x, t.y - 130, '😭 BUÁÁÁÁÁ! +7777 PTS! 💀', '#facc15', 26);
        this._showBanner(
          '🏆 HITLER ESMAGADO! AGORA VEM O MUSSOLINI! 🏆',
          'O COVARDE CAIU! PREPARE-SE PARA O SEGUNDO CHEFE!',
          '#facc15',
          4.0
        );
        if (!this.secretMussoliniSpawned && this.secretKills >= SECRET_MUSSOLINI_KILLS) {
          this._spawnMussoliniBoss();
        }
      } else if (t.isMussolini) {
        this.secretMussoliniDefeated = true;
        this.secretKills += 1;
        this.score += 7777;
        this.shake = 24;
        audioEngine.playSFX('cry');
        audioEngine.playSFX('special');
        this.shockwaves.push({ x: t.x, y: t.y - 30, r: 20, speed: 580, color: '#38bdf8', alpha: 1 });
        this.shockwaves.push({ x: t.x, y: t.y - 30, r: 10, speed: 420, color: '#facc15', alpha: 1 });
        this._spawnParticles(t.x, t.y - 60, '#38bdf8', 32);
        this._spawnParticles(t.x, t.y - 60, '#facc15', 22);
        this._addFloatText(t.x, t.y - 130, '😭 BUÁÁÁÁÁ! +7777 PTS! 💀', '#facc15', 26);
        this._showBanner(
          '🏆 MUSSOLINI ESMAGADO NO BUNKER 77! +7777 PTS! 🏆',
          'O DUCE CHOROU ATÉ O FIM! CERVEJAS LIBERADAS!',
          '#facc15',
          4.2
        );
        // Dropa cervejas comemorativas no chão do bunker
        for (const ox of [-55, 55]) {
          this.beersOnFloor.push({
            x: Math.max(90, Math.min(W - 90, t.x + ox)),
            y: Math.max(SECRET_MIN_Y + 40, Math.min(SECRET_MAX_Y - 40, t.y)),
            z: 90,
            vz: 160,
            life: 30,
          });
        }
      } else if (t.isBand) {
        this.bandKoCount += 1;
        this.score += t.isBoss ? 1500 : 600;

        if (t.stemKey) {
          audioEngine.muteStem(t.stemKey);
        }
        const stemMsg = STEM_LABELS[t.stemKey] || 'INSTRUMENTO SILENCIADO!';
        this._showBanner(`🔇 ${stemMsg} (${t.name} K.O.)`, 'OS OUTROS INSTRUMENTOS CONTINUAM TOCANDO!', '#22c55e', 2.6);
        this.shockwaves.push({ x: t.x, y: t.y - 30, r: 15, speed: 420, color: '#22c55e', alpha: 1 });
      } else {
        this.koCount += 1;
        this.score += (t.isRatSuit ? 300 : 150) * moshMult;
      }
    }
  }

  _updateEnemies(dt) {
    const p = this.player;

    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i];
      if (e.hurtTimer > 0) e.hurtTimer -= dt;
      if (e.invulnTimer > 0) e.invulnTimer -= dt;
      if (e.attackTimer > 0) e.attackTimer -= dt;
      if (e.attackCooldown > 0) e.attackCooldown -= dt;
      if (e.stunTimer > 0) e.stunTimer -= dt;
      if (e.dashTimer > 0) e.dashTimer -= dt;
      if (e.isHitler || e.isMussolini) {
        if (e.cryingTimer > 0) e.cryingTimer = Math.max(0, e.cryingTimer - dt);
        if (e.cryTextCooldown > 0) e.cryTextCooldown -= dt;
        if (e.crySfxCooldown > 0) e.crySfxCooldown -= dt;
        if (e.cryingTimer > 0 && e.state !== 'ko') {
          e.tearParticleTimer = (e.tearParticleTimer ?? 0) - dt;
          if (e.tearParticleTimer <= 0) {
            e.tearParticleTimer = 0.085;
            for (const dir of [-1, 1]) {
              this.particles.push({
                x: e.x + dir * 10,
                y: e.y - 98 - e.z,
                vx: dir * (70 + Math.random() * 80) + e.vx * 0.25,
                vy: -75 - Math.random() * 55,
                gravity: 600,
                size: 3.5 + Math.random() * 3,
                color: Math.random() < 0.6 ? '#38bdf8' : '#bae6fd',
                life: 0.38 + Math.random() * 0.2,
              });
            }
          }
        } else if (e.state !== 'ko' && e.isPanicked) {
          e.isPanicked = false;
          e.head = e.isHitler ? getHitlerAvatarDataUrl(false) : getMussoliniAvatarDataUrl(false);
        }
      }

      if (e.z > 0 || e.vz > 0) {
        e.z += e.vz * dt;
        e.vz -= 1450 * dt;
        if (e.z <= 0) {
          e.z = 0;
          e.vz = 0;
          e.thrownByPlayer = false;
        }
      }

      if (e.thrownByPlayer && Math.abs(e.vx) > 220) {
        for (const other of this.enemies) {
          if (other === e || other.state === 'ko' || other.hurtTimer > 0) continue;
          if (Math.hypot(other.x - e.x, (other.y - e.y) * 1.4) < 46) {
            this._damageTarget(other, 14, Math.sign(e.vx) * 320, true);
            this._addFloatText(other.x, other.y - 105, 'DOMINÓ!', '#facc15', 18);
          }
        }
      }

      if (e.state === 'ko') {
        e.x += e.vx * dt;
        e.vx *= 0.9;
        e.knockdownTimer -= dt;
        const removeThreshold = e.isWeakNazi ? -0.35 : (e.isHitler || e.isMussolini) ? -1.8 : -1.0;
        if (e.knockdownTimer <= removeThreshold) {
          this.enemies.splice(i, 1);
        }
        continue;
      }

      if (e.state === 'knockdown') {
        e.x += e.vx * dt;
        e.vx *= 0.9;
        e.knockdownTimer -= dt;
        if (e.knockdownTimer <= 0 && e.z === 0) {
          e.state = 'idle';
          e.invulnTimer = (e.isHitler || e.isMussolini) ? 0.16 : 0.3;
        }
        e.x = Math.max(30, Math.min(W - 30, e.x));
        continue;
      }

      if (e.hurtTimer > 0 || e.stunTimer > 0) {
        e.x += e.vx * dt;
        e.vx *= 0.86;
        e.x = Math.max(30, Math.min(W - 30, e.x));
        continue;
      }

      // IA dos Chefes no Bunker 77: fogem chorando quando tomam dano e tentam dar chilique fraco quando tomam fôlego!
      if (e.isHitler || e.isMussolini) {
        const awayX = e.x - p.x;
        const awayY = e.y - p.y;
        const dist = Math.hypot(awayX, awayY) || 1;

        if (e.cryingTimer > 0) {
          // Modo covarde chorão: corre desesperado fugindo do martelo/lança-chamas!
          const toCenterX = W / 2 - e.x;
          const toCenterY = (SECRET_MIN_Y + SECRET_MAX_Y) / 2 - e.y;
          let perpX = -awayY / dist;
          let perpY = awayX / dist;
          if (perpX * toCenterX + perpY * toCenterY < 0) {
            perpX = -perpX;
            perpY = -perpY;
          }
          const nearWall = e.x < 140 || e.x > W - 140 || e.y < SECRET_MIN_Y + 50 || e.y > SECRET_MAX_Y - 50;
          const awayWeight = nearWall ? 0.25 : 0.78;
          const jukeWeight = nearWall ? 1.25 : 0.65;
          let tvx = ((awayX / dist) * awayWeight + perpX * jukeWeight) * e.speed * 1.12;
          let tvy = ((awayY / dist) * awayWeight + perpY * jukeWeight) * e.speed * 0.85;

          if (e.x < 96) tvx += 240;
          if (e.x > W - 96) tvx -= 240;
          if (e.y < SECRET_MIN_Y + 38) tvy += 160;
          if (e.y > SECRET_MAX_Y - 38) tvy -= 160;

          e.vx = e.vx * 0.78 + tvx * 0.22;
          e.vy = e.vy * 0.78 + tvy * 0.22;
          if (e.z === 0 && Math.random() < dt * 2.2) {
            e.vz = 185 + Math.random() * 65;
          }
          e.facing = Math.abs(e.vx) > 8 ? (e.vx >= 0 ? 1 : -1) : awayX >= 0 ? 1 : -1;
        } else {
          // Quando recupera o fôlego, tenta avançar dando chilique, mas leva martelada e volta a chorar!
          const toPx = p.x - e.x;
          const toPy = p.y - e.y;
          if (dist > 64) {
            e.vx = (toPx / dist) * e.speed * 0.92;
            e.vy = (toPy / dist) * e.speed * 0.72;
          } else {
            e.vx *= 0.7;
            e.vy *= 0.7;
          }
          e.facing = toPx >= 0 ? 1 : -1;
          if (dist < 68 && Math.abs(p.y - e.y) < 38 && e.attackCooldown <= 0) {
            e.attackTimer = e.attackDuration;
            e.attackCooldown = 1.65;
            this._hurtPlayer(e.damage, e.facing * 180);
            this._addFloatText(e.x, e.y - 125, 'CHILIQUE!', '#ef4444', 16);
          }
        }

        e.x = Math.max(52, Math.min(W - 52, e.x + e.vx * dt));
        e.y = Math.max(SECRET_MIN_Y + 12, Math.min(SECRET_MAX_Y - 12, e.y + e.vy * dt));
        continue;
      }

      if (e.isWeakNazi) {
        e.roamTimer = (e.roamTimer ?? 0) - dt;
        const distToRoam = Math.hypot((e.roamX ?? W / 2) - e.x, (e.roamY ?? 470) - e.y);

        // Escolhe novos destinos cruzando o bunker inteiro para não ficarem presos nos cantos
        if (e.roamX == null || e.roamTimer <= 0 || distToRoam < 52) {
          const crossSide = Math.random() < 0.72;
          e.roamX = crossSide
            ? (e.x < W / 2 ? W * 0.55 + Math.random() * (W * 0.37) : W * 0.08 + Math.random() * (W * 0.37))
            : 95 + Math.random() * (W - 190);
          e.roamY = SECRET_MIN_Y + 36 + Math.random() * (SECRET_MAX_Y - SECRET_MIN_Y - 72);
          e.roamTimer = 3.2 + Math.random() * 2.2;
        }

        const rdx = e.roamX - e.x;
        const rdy = e.roamY - e.y;
        const rDist = Math.hypot(rdx, rdy) || 1;
        e.orbitAngle += dt * (2.4 + (e.animSeed % 1.8));

        let tvx = (rdx / rDist) * e.speed * 1.18 + Math.cos(e.orbitAngle) * 50;
        let tvy = (rdy / rDist) * e.speed * 0.9 + Math.sin(e.orbitAngle * 1.3) * 42;

        // Só desvia do jogador quando ele chega perto, escapando em curva para o lado aberto da sala!
        const awayX = e.x - p.x;
        const awayY = e.y - p.y;
        const awayDist = Math.hypot(awayX, awayY) || 1;
        const panicRadius = 215;
        if (awayDist < panicRadius) {
          const urgency = 1 - awayDist / panicRadius;
          const toCenterX = W / 2 - e.x;
          const toCenterY = (SECRET_MIN_Y + SECRET_MAX_Y) / 2 - e.y;
          let perpX = -awayY / awayDist;
          let perpY = awayX / awayDist;
          if (perpX * toCenterX + perpY * toCenterY < 0) {
            perpX = -perpX;
            perpY = -perpY;
          }

          const nearWall = e.x < 135 || e.x > W - 135 || e.y < SECRET_MIN_Y + 45 || e.y > SECRET_MAX_Y - 45;
          const awayWeight = nearWall ? 0.28 : 0.72;
          const jukeWeight = nearWall ? 1.25 : 0.68;

          tvx += ((awayX / awayDist) * awayWeight + perpX * jukeWeight) * e.speed * (0.95 + urgency * 0.75);
          tvy += ((awayY / awayDist) * awayWeight + perpY * jukeWeight) * e.speed * (0.75 + urgency * 0.6);

          if (nearWall) {
            e.roamX = e.x < W / 2 ? W * 0.55 + Math.random() * 420 : W * 0.45 - Math.random() * 420;
            e.roamY = SECRET_MIN_Y + 48 + Math.random() * (SECRET_MAX_Y - SECRET_MIN_Y - 96);
            e.roamTimer = 3.2 + Math.random() * 1.8;
          }
        }

        // Separação entre nazis para espalhar pela sala inteira
        for (const other of this.enemies) {
          if (other === e || other.state === 'ko') continue;
          const sdx = e.x - other.x;
          const sdy = e.y - other.y;
          const sDist = Math.hypot(sdx, sdy);
          if (sDist > 0 && sDist < 58) {
            const push = ((58 - sDist) / 58) * 135;
            tvx += (sdx / sDist) * push;
            tvy += (sdy / sDist) * push * 0.8;
          }
        }

        // Empurra suavemente para longe das paredes laterais e cantos
        if (e.x < 92) tvx += ((92 - e.x) / 92) * 260 + 95;
        if (e.x > W - 92) tvx -= ((e.x - (W - 92)) / 92) * 260 + 95;
        if (e.y < SECRET_MIN_Y + 32) tvy += 150;
        if (e.y > SECRET_MAX_Y - 32) tvy -= 150;

        e.vx = e.vx * 0.8 + tvx * 0.2;
        e.vy = e.vy * 0.8 + tvy * 0.2;

        if (e.z === 0 && Math.random() < dt * 1.1) {
          e.vz = 175 + Math.random() * 80;
        }

        e.facing = Math.abs(e.vx) > 8 ? (e.vx >= 0 ? 1 : -1) : awayX >= 0 ? 1 : -1;
        e.x = Math.max(48, Math.min(W - 48, e.x + e.vx * dt));
        e.y = Math.max(SECRET_MIN_Y + 10, Math.min(SECRET_MAX_Y - 10, e.y + e.vy * dt));
        continue;
      }

      e.moshHop = this.moshActive && !e.isRatSuit;
      // No EXPURGÁTORIO os demônios sobem ao palco para perseguir o jogador
      const canClimb = this.hellMode && e.isDemon;
      const dx = p.x - e.x;
      const dy = (p.onStage && !canClimb ? PIT_MIN_Y + 25 : p.y) - e.y;
      const dist = Math.hypot(dx, dy);

      if (this.moshActive || e.isRatSuit) {
        if (e.z === 0 && !e.isRatSuit && Math.random() < dt * (canClimb && p.onStage ? 2.6 : 1.35)) {
          e.vz = canClimb && p.onStage ? 300 + Math.random() * 130 : 260 + Math.random() * 140;
        }
        const spd = e.speed * (this.moshActive ? 1.35 : 1.05);
        if (dist > 56) {
          e.vx = (dx / dist) * spd;
          e.vy = (dy / dist) * spd * 0.72;
        } else {
          e.vx *= 0.7;
          e.vy *= 0.7;
        }
      } else {
        e.orbitAngle += dt * 1.4;
        const tx = p.x + Math.cos(e.orbitAngle) * 140;
        const ty = Math.max(PIT_MIN_Y + 20, Math.min(PIT_MAX_Y - 20, p.y + Math.sin(e.orbitAngle) * 65));
        const odx = tx - e.x;
        const ody = ty - e.y;
        const od = Math.hypot(odx, ody) || 1;
        e.vx = (odx / od) * e.speed * 0.72;
        e.vy = (ody / od) * e.speed * 0.55;
      }

      e.facing = dx >= 0 ? 1 : -1;
      e.x = Math.max(36, Math.min(W - 36, e.x + e.vx * dt));
      e.y = Math.max(canClimb ? STAGE_MIN_Y : PIT_MIN_Y + 6, Math.min(PIT_MAX_Y - 6, e.y + e.vy * dt));

      // Guardiões ficam presos à vizinhança da fissura que defendem
      if (e.isPortalGuardian && e.guardianOf && !e.guardianOf.sealed) {
        const gx = e.x - e.guardianOf.x;
        const gy = e.y - e.guardianOf.y;
        const gd = Math.hypot(gx, gy);
        if (gd > HELL_STAGE_CONFIG.guardianLeash) {
          const pull = e.speed * dt * 1.6;
          e.x -= (gx / gd) * pull;
          e.y -= (gy / gd) * pull;
        }
        e.x = Math.max(36, Math.min(W - 36, e.x));
        e.y = Math.max(PIT_MIN_Y + 6, Math.min(PIT_MAX_Y - 6, e.y));
      }

      if ((!p.onStage || canClimb) && dist < 62 && Math.abs(p.y - e.y) < 34 && e.attackCooldown <= 0) {
        e.attackTimer = e.attackDuration;
        e.attackCooldown = this.moshActive ? 1.35 + Math.random() * 0.5 : 2.0 + Math.random() * 0.6;
        const variedDmg = this._rollMoshEnemyDamage(e);
        e.damage = variedDmg;
        this._hurtPlayer(variedDmg, e.facing * 210);
      }
    }
  }

  // EXPURGÁTORIO: os músicos seguem tocando e se movimentam pelo palco,
  // mas não atacam, não levam dano e o baterista permanece na bateria.
  _updateHellBand(dt, audioInfo) {
    for (const b of this.bandFighters) {
      if (b.bandId === 'misa') {
        b.vx = 0;
        b.vy = 0;
        b.moshHop = false;
        continue;
      }

      if (b.z > 0 || b.vz > 0) {
        b.z += b.vz * dt;
        b.vz -= 1450 * dt;
        if (b.z <= 0) {
          b.z = 0;
          b.vz = 0;
        }
      }

      // Pausas aleatórias: o músico fica tocando no lugar por 1 a 3 segundos
      b.idleTimer = Math.max(0, (b.idleTimer ?? 0) - dt);
      if (b.idleTimer > 0) {
        b.vx = 0;
        b.vy = 0;
        b.moshHop = this.moshActive;
        continue;
      }

      b.roamTimer = (b.roamTimer ?? 0) - dt;
      let dx = (b.roamX ?? b.homeX) - b.x;
      let dy = (b.roamY ?? b.homeY) - b.y;
      const arrived = Math.hypot(dx, dy) < 22;
      if (b.roamTimer <= 0 || arrived) {
        // Às vezes para; nunca duas pausas seguidas sem andar antes
        if (arrived) b.didRest = false;
        if ((arrived || Math.random() < 0.25) && !b.didRest) {
          b.idleTimer = 0.7 + Math.random() * 1.6;
          b.didRest = true;
        }
        for (let attempt = 0; attempt < 6; attempt++) {
          const tx = Math.max(95, Math.min(W - 95, b.x + (Math.random() - 0.5) * 220));
          const ty = Math.max(
            STAGE_MIN_Y + 18,
            Math.min(STAGE_MAX_Y - 10, b.y + (Math.random() - 0.5) * 60)
          );
          const occupied = this.bandFighters.some(
            (o) => o !== b && Math.hypot(tx - o.x, ty - o.y) < 86
          );
          const nearDrum = Math.abs(tx - (W / 2 + 15)) < 120 && ty < 330;
          if (!occupied && !nearDrum) {
            b.roamX = tx;
            b.roamY = ty;
            break;
          }
          if (attempt === 5) {
            b.roamX = Math.max(95, Math.min(W - 95, b.homeX + (Math.random() - 0.5) * 120));
            b.roamY = b.homeY;
          }
        }
        b.roamTimer = 2.5 + Math.random() * 3.0;
        dx = b.roamX - b.x;
        dy = b.roamY - b.y;
      }

      const dist = Math.hypot(dx, dy) || 1;
      const speed = (this.moshActive ? 38 : 26) * (b.wanderSpeed ?? 1);
      b.vx = (dx / dist) * speed;
      b.vy = (dy / dist) * speed * 0.55;
      b.facing = Math.abs(b.vx) > 4 ? (b.vx > 0 ? 1 : -1) : b.facing;

      b.x += b.vx * dt;
      b.y += b.vy * dt;

      // Separação forte: nunca dois integrantes no mesmo ponto (e longe da bateria)
      for (const other of this.bandFighters) {
        if (other === b) continue;
        const sx = b.x - other.x;
        const sy = b.y - other.y;
        const sd = Math.hypot(sx, sy);
        if (sd < 0.001) {
          b.x += (Math.random() - 0.5) * 8;
        } else if (sd < 66) {
          const push = (66 - sd) * 0.35;
          b.x += (sx / sd) * push;
          b.y += (sy / sd) * push * 0.5;
        }
      }
      b.x = Math.max(75, Math.min(W - 75, b.x));
      b.y = Math.max(STAGE_MIN_Y + 8, Math.min(STAGE_MAX_Y - 4, b.y));

      b.moshHop = this.moshActive;
      if (audioInfo.peak && b.z === 0 && Math.random() < 0.18) {
        b.vz = 120 + Math.random() * 70;
      }
    }
  }

  _updateBandFighters(dt, audioInfo) {
    const p = this.player;
    const bossMustEngage = this.koCount >= this.stage.targetKOs;

    for (const b of this.bandFighters) {
      if (b.hurtTimer > 0) b.hurtTimer -= dt;
      if (b.invulnTimer > 0) b.invulnTimer -= dt;
      if (b.attackTimer > 0) b.attackTimer -= dt;
      if (b.attackCooldown > 0) b.attackCooldown -= dt;
      if (b.specialCooldown > 0) b.specialCooldown -= dt;
      if (b.specialAnimTimer > 0) b.specialAnimTimer -= dt;

      if (b.z > 0 || b.vz > 0) {
        b.z += b.vz * dt;
        b.vz -= 1450 * dt;
        if (b.z <= 0) {
          b.z = 0;
          b.vz = 0;
        }
      }

      if (b.state === 'ko') {
        b.x += b.vx * dt;
        b.vx *= 0.88;
        continue;
      }

      if (b.state === 'knockdown') {
        b.x += b.vx * dt;
        b.vx *= 0.88;
        b.knockdownTimer -= dt;
        if (b.knockdownTimer <= 0 && b.z === 0) {
          b.state = 'aggro';
          b.invulnTimer = 0.4;
        }
        b.x = Math.max(60, Math.min(W - 60, b.x));
        continue;
      }

      if (b.hurtTimer > 0) {
        b.x += b.vx * dt;
        b.vx *= 0.86;
        b.x = Math.max(60, Math.min(W - 60, b.x));
        continue;
      }

      if (b.isBoss && (bossMustEngage || p.onStage)) {
        if (!b.aggro) {
          b.aggro = true;
          b.state = 'aggro';
          this._showBanner(`⚡ CHEFE ATIVADO: ${b.name}! ⚡`, b.role.toUpperCase(), '#facc15', 2.4);
        }
      }

      if (!b.aggro) {
        b.moshHop = this.moshActive;
        b.vx = 0;
        b.vy = 0;
        if (audioInfo.peak && b.z === 0 && Math.random() < 0.35) {
          b.vz = 150;
        }
        if (p.onStage && Math.hypot(p.x - b.x, p.y - b.y) < 110) {
          b.aggro = true;
          b.state = 'aggro';
        }
        continue;
      }

      const dx = p.x - b.x;
      const dy = p.y - b.y;
      const dist = Math.hypot(dx, dy) || 1;
      b.facing = dx >= 0 ? 1 : -1;

      const minY = STAGE_MIN_Y;
      const maxY = b.isBoss && bossMustEngage ? PIT_MAX_Y - 30 : STAGE_MAX_Y;

      if (dist > 72) {
        b.vx = (dx / dist) * b.speed;
        b.vy = (dy / dist) * b.speed * 0.75;
      } else {
        b.vx *= 0.65;
        b.vy *= 0.65;
      }

      b.x = Math.max(55, Math.min(W - 55, b.x + b.vx * dt));
      b.y = Math.max(minY, Math.min(maxY, b.y + b.vy * dt));

      if (dist < 84 && Math.abs(p.y - b.y) < 42 && b.attackCooldown <= 0) {
        b.attackTimer = b.attackDuration;
        b.attackCooldown = b.isBoss ? 1.05 : 1.5;
        audioEngine.playSFX('slam');
        this._hurtPlayer(b.damage, b.facing * 320);
      }

      if (b.isBoss && b.specialCooldown <= 0 && dist < 340) {
        b.specialCooldown = 5.2;
        b.specialAnimTimer = 0.5;
        this._triggerBandSpecial(b);
      }
    }
  }

  _triggerBandSpecial(b) {
    const p = this.player;
    audioEngine.playSFX('special');
    this.shake = 10;

    let label = 'ATAQUE DE PALCO!';
    let col = '#ff0000';
    let radius = 210;

    if (b.bandId === 'psayco') {
      label = 'PSAYCO: GRITO SÔNICO!';
      col = '#ff0000';
      radius = 250;
    } else if (b.bandId === 'julian') {
      label = 'JULIAN: GUITAR SPIN!';
      col = '#facc15';
      radius = 220;
    } else if (b.bandId === 'delleiw') {
      label = 'DELLEIW: GRAVE SÍSMICO!';
      col = '#a855f7';
      radius = 240;
    } else if (b.bandId === 'misa') {
      label = 'MISA: FÚRIA DO BUMBO DUPLO!';
      col = '#22c55e';
      radius = 260;
      b.vz = 320;
    }

    this._addFloatText(b.x, b.y - 125, label, col, 20);
    this.shockwaves.push({ x: b.x, y: b.y - 30, r: 20, speed: 520, color: col, alpha: 1 });

    const dist = Math.hypot(p.x - b.x, (p.y - b.y) * 1.3);
    if (dist < radius && p.z < 45) {
      const dir = p.x >= b.x ? 1 : -1;
      this._hurtPlayer(b.damage + 6, dir * 420);
    }
  }

  _hurtPlayer(dmg, knockVx) {
    const p = this.player;
    if (p.invulnTimer > 0 || p.hp <= 0) return;

    p.hp = Math.max(0, p.hp - dmg);
    p.hurtTimer = 0.18;
    p.invulnTimer = 0.9;
    p.vx = knockVx;
    this.combo = 0;
    this.shake = 10;
    audioEngine.playSFX('hurt');
    this._spawnParticles(p.x, p.y - 45, '#ff0000', 10);
    this._addFloatText(p.x, p.y - 90, `-${dmg}`, '#ff0000', 20);

    // EASTER EGG SECRETO V77:
    // 1) APENAS na fase "Capacete de Nazista é Martelo" (stage.id === 1)
    // 2) APENAS com um martelo nas mãos (weapon.id === 'martelo')
    // 3) Encostado / travado no canto superior ESQUERDO do palco (onStage, x <= 85, y <= STAGE_MIN_Y + 24)
    // 4) O HP parou EXATAMENTE em 77!
    if (
      !this.easterEggActive &&
      this.stage &&
      this.stage.id === 1 &&
      p.weapon &&
      p.weapon.id === 'martelo' &&
      p.onStage &&
      p.x <= 85 &&
      p.y <= STAGE_MIN_Y + 24 &&
      p.hp === 77
    ) {
      this._triggerSecretRoom();
    }
  }

  _checkEndConditions() {
    if (this.ended) return;

    if (this.player.hp <= 0) {
      this.ended = true;
      this.player.state = 'ko';

      // PARA A MÚSICA DO PALCO IMEDIATAMENTE E DISPARA A FALA DE EFEITO EM ÁUDIO REAL!
      audioEngine.stopAllStageMusic();

      let quote;
      let audioSrc;
      if (this.player.deathQuote && this.player.deathAudio) {
        quote = this.player.deathQuote;
        audioSrc = this.player.deathAudio;
      } else {
        const pick = FAN_DEATH_QUOTES[fanQuoteIdx % FAN_DEATH_QUOTES.length];
        fanQuoteIdx++;
        quote = pick.quote;
        audioSrc = pick.audio;
      }

      audioEngine.playVoiceClip(audioSrc);
      this._showBanner(quote, 'GAME OVER', '#ff0000', 2.4);

      setTimeout(() => {
        if (this.cb.onGameOver) {
          this.cb.onGameOver({
            score: this.score,
            koCount: this.koCount,
            maxCombo: this.maxCombo,
            bandKoCount: this.bandKoCount,
            quote,
          });
        }
      }, 950);
      return;
    }

    // No EXPURGÁTORIO a vitória só vem ao selar as 3 fissuras
    if (this.hellMode) return;

    const mainBoss = this.bandFighters.find((b) => b.isBoss);
    const allBandDown = this.bandFighters.every((b) => b.state === 'ko');
    if ((mainBoss && mainBoss.state === 'ko' && this.koCount >= this.stage.targetKOs) || allBandDown) {
      this.ended = true;
      this.score += 1000;
      setTimeout(() => {
        if (this.cb.onVictory) {
          this.cb.onVictory({
            score: this.score,
            koCount: this.koCount,
            maxCombo: this.maxCombo,
            bandKoCount: this.bandKoCount,
            stageId: this.stage.id,
            isHell: false,
          });
        }
      }, 1100);
    }
  }

  _spawnParticles(x, y, color, count = 10) {
    for (let i = 0; i < count; i++) {
      const ang = Math.random() * Math.PI * 2;
      const spd = 80 + Math.random() * 260;
      this.particles.push({
        x,
        y,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd - 90,
        gravity: 680,
        size: 3 + Math.random() * 5,
        color,
        life: 0.35 + Math.random() * 0.3,
      });
    }
  }

  _addFloatText(x, y, text, color = '#fff', size = 18) {
    this.floatingTexts.push({ x, y, text, color, size, life: 0.95 });
  }

  _render() {
    const ctx = this.ctx;
    const audioInfo = this._lastAudio || { bass: 0, mid: 0, overall: 0, peak: false };
    const cam = this.camera;

    // Transform da câmera: coordenadas do mundo (W x H) -> pixels da tela.
    ctx.setTransform(cam.dpr, 0, 0, cam.dpr, 0, 0);
    ctx.clearRect(0, 0, cam.cssW, cam.cssH);
    ctx.save();
    ctx.translate(cam.cssW / 2, cam.cssH / 2);
    ctx.scale(cam.scale, cam.scale);
    ctx.translate(-cam.x, -cam.y);

    if (this.shake > 0) {
      ctx.translate((Math.random() - 0.5) * this.shake * 1.6, (Math.random() - 0.5) * this.shake * 1.6);
    }

    if (this.hellMode) {
      drawHellVenue(ctx, W, H, this.stage, audioInfo, this.time, true, this.hellPhase, this.portals);
    } else if (this.easterEggActive) {
      drawSecretRoomVenue(ctx, W, H, this.time, audioInfo);
    } else {
      const misa = this.bandFighters.find((b) => b.bandId === 'misa');
      const drumsBroken = misa && misa.state === 'ko';
      drawVenue(ctx, W, H, this.stage, audioInfo, this.time, this.moshActive, drumsBroken);
    }

    // Armas no chão
    for (const w of this.weaponsOnFloor) {
      ctx.save();
      ctx.translate(w.x, w.y);
      ctx.fillStyle = 'rgba(0,0,0,0.45)';
      ctx.beginPath();
      ctx.ellipse(0, 4, 24, 8, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = w.color;
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.5 + Math.sin(this.time * 8) * 0.35;
      ctx.beginPath();
      ctx.ellipse(0, 4, 30, 11, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;

      const hover = Math.sin(this.time * 6) * 4;
      ctx.translate(-12, -14 - w.z + hover);
      drawWeaponShape(ctx, w.id, 1.05);

      ctx.font = '800 11px "JetBrains Mono", monospace';
      ctx.fillStyle = '#facc15';
      ctx.textAlign = 'center';
      ctx.fillText('[E] ' + w.name, 14, -20);
      ctx.restore();
    }

    // Garrafas de Cerveja (Vida baixa!)
    for (const b of this.beersOnFloor) {
      drawBeerBottle(ctx, b.x, b.y, b.z, this.time);
    }

    // Fissuras do Inferno (portais)
    if (this.hellMode) {
      for (const portal of this.portals) {
        drawPortal(ctx, portal, this.time, portal.sealed, this.lockedPortal === portal);
      }
    }

    // Ondas de choque
    for (const sw of this.shockwaves) {
      ctx.save();
      ctx.strokeStyle = sw.color;
      ctx.globalAlpha = Math.max(0, sw.alpha);
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.ellipse(sw.x, sw.y, sw.r, sw.r * 0.45, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // Painter's Algorithm 2.5D
    const allFighters = (
      this.easterEggActive
        ? [...this.enemies, this.player]
        : [...this.bandFighters, ...this.enemies, this.player]
    ).filter(Boolean);
    allFighters.sort((a, b) => a.y - b.y);
    for (const f of allFighters) {
      drawFighter(ctx, f, this.time);
    }

    // Partículas
    for (const p of this.particles) {
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
    }

    // Projéteis (Metralhadora V77 e Válvula Preta)
    if (this.hellMode) {
      for (const pr of this.projectiles) {
        drawProjectile(ctx, pr, this.time);
      }
    }

    // Textos flutuantes
    for (const ft of this.floatingTexts) {
      ctx.save();
      ctx.globalAlpha = Math.min(1, ft.life * 1.6);
      ctx.font = `900 ${ft.size}px "Anton", sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillStyle = '#000';
      ctx.fillText(ft.text, ft.x + 2, ft.y + 2);
      ctx.fillStyle = ft.color;
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    }

    // Gatilho secreto da bateria permanece invisível (discreto): sem círculo de progresso na tela.

    // Cronômetro Gigante de 77s da Sala Secreta!
    if (this.easterEggActive) {
      const secDisp = this._getSecretTimerDisplay();
      const isHolding77 = this.secretHoldTimer > 0;
      const urgent = secDisp <= 10;
      const pulse = isHolding77 ? 1 + Math.sin(this.time * 14) * 0.08 : urgent ? 1 + Math.sin(this.time * 18) * 0.07 : 1;
      const hasAliveHitler = this.enemies.some((e) => e.isHitler && e.state !== 'ko');
      const hasAliveMussolini = this.enemies.some((e) => e.isMussolini && e.state !== 'ko');
      const hasAliveBoss = hasAliveHitler || hasAliveMussolini;

      let subObjective = `NAZIS MASSACRADOS: ${this.secretKills}`;
      if (!this.secretFlamethrowerDropped) {
        const left = Math.max(0, SECRET_FLAMETHROWER_KILLS - this.secretKills);
        subObjective = `NAZIS: ${this.secretKills} • 🔥 LANÇA-CHAMAS EM ${left}`;
      } else if (!this.secretHitlerSpawned) {
        const left = Math.max(0, SECRET_HITLER_KILLS - this.secretKills);
        subObjective = `NAZIS: ${this.secretKills} • 💀 HITLER EM ${left}`;
      } else if (hasAliveHitler) {
        subObjective = `NAZIS: ${this.secretKills} • 😭 AMASSE O HITLER!`;
      } else if (!this.secretMussoliniSpawned) {
        const left = Math.max(0, SECRET_MUSSOLINI_KILLS - this.secretKills);
        subObjective = `NAZIS: ${this.secretKills} • 💀 MUSSOLINI EM ${left}`;
      } else if (hasAliveMussolini) {
        subObjective = `NAZIS: ${this.secretKills} • 😭 AMASSE O MUSSOLINI!`;
      } else {
        subObjective = `NAZIS: ${this.secretKills} • 🏆 CHEFES CAÍDOS!`;
      }

      ctx.save();
      ctx.translate(cam.x, hasAliveBoss ? 202 : 134);
      ctx.scale(pulse, pulse);
      ctx.fillStyle = 'rgba(9, 9, 13, 0.84)';
      ctx.strokeStyle = isHolding77 ? '#facc15' : urgent ? '#ef4444' : '#f97316';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(-175, -34, 350, 68, 10);
      ctx.fill();
      ctx.stroke();

      ctx.font = '900 44px "Black Ops One", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#000';
      ctx.fillText(`${secDisp}`, -106, 16);
      ctx.fillStyle = isHolding77 ? '#facc15' : urgent ? '#ef4444' : '#f97316';
      ctx.fillText(`${secDisp}`, -108, 14);

      ctx.textAlign = 'left';
      ctx.font = '900 15px "Anton", sans-serif';
      ctx.fillStyle = '#f4f1ea';
      ctx.fillText('BUNKER SECRETO V77', -52, -6);
      ctx.font = '800 11px "JetBrains Mono", monospace';
      ctx.fillStyle = '#facc15';
      ctx.fillText(subObjective, -52, 16);
      ctx.restore();
    }

    // Banner gigante de transição / motivo de raiva / ratos do esgoto!
    if (this.bannerTimer > 0) {
      ctx.save();
      ctx.globalAlpha = Math.min(1, this.bannerTimer * 1.5);
      const hasSub = !!this.bannerSub;
      const boxH = hasSub ? 96 : 74;
      const left = cam.x - cam.viewW / 2;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.84)';
      ctx.fillRect(left, 162, cam.viewW, boxH);
      ctx.fillStyle = this.bannerColor;
      ctx.fillRect(left, 162, cam.viewW, 5);
      ctx.fillRect(left, 162 + boxH - 5, cam.viewW, 5);

      ctx.font = '900 36px "Black Ops One", cursive';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#000';
      ctx.fillText(this.bannerText, cam.x + 3, 208, cam.viewW - 24);
      ctx.fillStyle = this.bannerColor;
      ctx.fillText(this.bannerText, cam.x, 205, cam.viewW - 24);

      if (hasSub) {
        ctx.font = '800 18px "JetBrains Mono", monospace';
        ctx.fillStyle = '#f4f1ea';
        ctx.fillText(this.bannerSub, cam.x, 238, cam.viewW - 24);
      }
      ctx.restore();
    }

    // Alerta de subir no palco
    const mainBoss = this.bandFighters.find((b) => b.isBoss);
    if (
      !this.hellMode &&
      !this.easterEggActive &&
      this.koCount >= this.stage.targetKOs &&
      mainBoss &&
      mainBoss.state !== 'ko' &&
      !this.player.onStage &&
      mainBoss.y < 370
    ) {
      if (Math.floor(this.time * 4) % 2 === 0) {
        ctx.save();
        ctx.font = '900 24px "Anton", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#facc15';
        ctx.fillText(`▲ SUBA NO PALCO E DERRUBE ${mainBoss.name}! ▲`, cam.x, 420);
        ctx.restore();
      }
    }

    if (this.secretFlashTimer > 0) {
      ctx.fillStyle = `rgba(250, 204, 21, ${Math.min(0.65, this.secretFlashTimer)})`;
      ctx.fillRect(0, 0, W, H);
    }

    ctx.restore();
  }
}
