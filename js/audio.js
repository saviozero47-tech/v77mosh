// Motor de Áudio Válvula 77 — Stems Sincronizadas Sample-Accurate (Web Audio API) + Medleys + Falas Game Over
import { MENU_MEDLEY, HELL_STAGE_CONFIG } from './config.js';

const STEM_NAMES = ['vocal', 'guitar', 'bass', 'drums'];
const STEM_FILES = {
  vocal: 'vocals.mp3',
  guitar: 'guitar.mp3',
  bass: 'bass.mp3',
  drums: 'drums.mp3',
};

const IS_MOBILE =
  typeof navigator !== 'undefined' &&
  (/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) ||
    (typeof window !== 'undefined' && 'ontouchstart' in window && (navigator.maxTouchPoints || 0) > 1));

class V77AudioEngine {
  constructor() {
    this.ctx = null;
    this.analyser = null;
    this.masterGain = null;
    this.sfxGain = null;
    this.menuGain = null;
    this.voiceGain = null;
    this.freqData = null;
    this.musicVolume = 0.85;
    this.sfxVolume = 1.0;

    // Player de Menu / Sala Secreta (faixa única)
    this.menuAudio = new Audio();
    this.menuAudio.preload = 'auto';
    this.menuAudio.playsInline = true;
    this.menuAudio.setAttribute('playsinline', '');
    this.menuAudio.setAttribute('webkit-playsinline', '');
    this.menuSource = null;
    this._cleanupMenuListeners = null;
    this._menuPlayToken = 0;

    // 4 Canais sample-accurate de Stems via AudioBufferSourceNode para o Palco Ao Vivo!
    this.stemGains = {};
    this.stemMuted = { vocal: false, guitar: false, bass: false, drums: false };
    this.usingStems = false;
    this.stemsLoading = false;
    this.onStemsLoadingChange = null;

    this._stemPackCache = new Map(); // slug -> { slug, baseTime, duration, buffers }
    this._stemLoadPromises = new Map(); // slug -> Promise<pack>
    this._activeStemSources = {};
    this._activePack = null;
    this._stemLoadToken = 0;
    this._stemPlaying = false;
    this._stemCtxStartTime = 0;
    this._stemStartOffsetBuf = 0;
    this._stemLoopStartBuf = 0;
    this._stemLoopEndBuf = 0;
    this._pausedSongTime = 0;
    this._pendingStartSec = 0;
    this._isPaused = false;

    // Cache e source para falas de Game Over via Web Audio (nunca bloqueado no iOS/Android!)
    this._voiceBufferCache = new Map();
    this._activeVoiceSource = null;
    this.voiceAudio = new Audio();
    this.voiceAudio.preload = 'auto';
    this.voiceAudio.playsInline = true;

    this.muted = false;
    this.mode = 'idle'; // 'menu' | 'stage' | 'secret' | 'hell' | 'stopped' | 'idle'
    this.medleyIndex = 0;
    this.onTrackChange = null;

    this.bassEnergy = 0;
    this.midEnergy = 0;
    this.overallEnergy = 0;
    this.peakDetected = false;
    this._prevBass = 0;
    this._stageMoshWindows = [];
    this._stageLoopStart = 0;

    this.menuAudio.addEventListener('timeupdate', () => this._handleMenuTimeUpdate());
    this._pendingMenuResume = false;
    this._pendingStemResume = false;
    this.menuAudio.addEventListener('playing', () => { this._pendingMenuResume = false; });
    this.menuAudio.addEventListener('ended', () => {
      if (this.mode === 'menu') {
        this.nextMenuTrack();
      } else if (this.mode === 'secret') {
        this.menuAudio.currentTime = this._secretStart || 12.0;
        this.menuAudio.playbackRate = 1.16;
        const _p = this.menuAudio.play(); if (_p && _p.catch) _p.catch(() => { this._pendingMenuResume = true; });
      } else if (this.mode === 'hell') {
        // Toca até o fim sem corte prematuro; se o jogador ainda não selou os portais,
        // volta para o clímax (2:05) e mantém o pico do inferno até a vitória.
        this.menuAudio.currentTime = 125.0;
        this.menuAudio.playbackRate = 1.0;
        const _p2 = this.menuAudio.play(); if (_p2 && _p2.catch) _p2.catch(() => { this._pendingMenuResume = true; });
      } else if (this.mode === 'stage' && !this.usingStems) {
        this.menuAudio.currentTime = this._stageLoopStart || 0;
        const _p3 = this.menuAudio.play(); if (_p3 && _p3.catch) _p3.catch(() => { this._pendingMenuResume = true; });
      }
    });

    this._bindMobileLifecycle();
  }

  _bindMobileLifecycle() {
    if (typeof window === 'undefined') return;

    const tryWakeAudio = () => {
      if (!this.ctx) return;
      if (!this._isPaused && this.mode !== 'idle' && this.mode !== 'stopped') {
        this._ensureContextRunning();
        this._retryPendingPlayback();
      }
    };

    window.addEventListener('pointerdown', tryWakeAudio, { passive: true });
    window.addEventListener('touchstart', tryWakeAudio, { passive: true });
    window.addEventListener('touchend', tryWakeAudio, { passive: true });
    window.addEventListener('click', tryWakeAudio, { passive: true });
    window.addEventListener('keydown', tryWakeAudio, { passive: true });

    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
          tryWakeAudio();
        }
      });
    }
  }

  _ensureContextRunning() {
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended' || this.ctx.state === 'interrupted') {
      this.ctx
        .resume()
        .then(() => {
          if (this.ctx && this.ctx.state === 'running') {
            this._retryPendingPlayback();
          }
        })
        .catch(() => {});
    }
  }

  _retryPendingPlayback() {
    if (this._isPaused || this.muted) return;
    if (this.ctx && this.ctx.state !== 'running') {
      this._ensureContextRunning();
    }
    if (this.mode === 'stage' && this.usingStems) {
      if (this._pendingStemResume && this._activePack && !this._stemPlaying && this.ctx && this.ctx.state === 'running') {
        this._startStemNodes(this._activePack, this._pausedSongTime ?? this._stageLoopStart);
      }
      return;
    }
    if (
      (this.mode === 'menu' || this.mode === 'secret' || this.mode === 'stage' || this.mode === 'hell') &&
      this.menuAudio.getAttribute('src') &&
      (this._pendingMenuResume || this.menuAudio.paused)
    ) {
      const p = this.menuAudio.play();
      if (p && typeof p.catch === 'function') {
        p.catch(() => { this._pendingMenuResume = true; });
      }
    }
  }

  _setStemsLoading(val) {
    if (this.stemsLoading === val) return;
    this.stemsLoading = val;
    if (this.onStemsLoadingChange) {
      this.onStemsLoadingChange(val);
    }
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      try {
        this.ctx = new AudioCtx({ latencyHint: 'interactive' });
      } catch (_) {
        this.ctx = new AudioCtx();
      }

      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.72;
      this.freqData = new Uint8Array(this.analyser.frequencyBinCount);

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.muted ? 0 : this.musicVolume;
      this.analyser.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);

      // Canal de efeitos sonoros (SFX) independente da música
      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = this.muted ? 0 : this.sfxVolume;
      this.sfxGain.connect(this.ctx.destination);

      // Canal de voz dedicado (toca mesmo com a música do palco parada)
      this.voiceGain = this.ctx.createGain();
      this.voiceGain.gain.value = this.muted ? 0 : this.sfxVolume;
      this.voiceGain.connect(this.ctx.destination);

      // Liga player do menu com controle de ganho suave durante seeks
      this.menuGain = this.ctx.createGain();
      this.menuGain.gain.value = 1.0;
      this.menuSource = this.ctx.createMediaElementSource(this.menuAudio);
      this.menuSource.connect(this.menuGain);
      this.menuGain.connect(this.analyser);

      // Cria os 4 subcanais de ganho das stems (vocal, guitar, bass, drums)
      for (const key of STEM_NAMES) {
        const gain = this.ctx.createGain();
        gain.gain.value = 1.0;
        gain.connect(this.analyser);
        this.stemGains[key] = gain;
      }

      this.ctx.addEventListener('statechange', () => {
        if (this.ctx && this.ctx.state === 'running') {
          this._retryPendingPlayback();
        }
      });
    }
    this._ensureContextRunning();
  }

  _applyVolumes() {
    if (this.masterGain) {
      this.masterGain.gain.value = this.muted ? 0 : this.musicVolume;
    }
    if (this.sfxGain) {
      this.sfxGain.gain.value = this.muted ? 0 : this.sfxVolume;
    }
    if (this.voiceGain) {
      this.voiceGain.gain.value = this.muted ? 0 : this.sfxVolume;
    }
    this.menuAudio.muted = this.muted;
    this.voiceAudio.muted = this.muted;
    this.voiceAudio.volume = this.muted ? 0 : this.sfxVolume;
  }

  setMusicVolume(val) {
    this.musicVolume = Math.max(0, Math.min(1, Number(val) || 0));
    this._applyVolumes();
  }

  setSfxVolume(val) {
    this.sfxVolume = Math.max(0, Math.min(1, Number(val) || 0));
    this._applyVolumes();
  }

  setMuted(muted) {
    this.muted = Boolean(muted);
    this._applyVolumes();
    if (!this.muted) {
      this._retryPendingPlayback();
    }
    return this.muted;
  }

  toggleMute() {
    return this.setMuted(!this.muted);
  }

  _stopMenuAudio() {
    this._menuPlayToken++;
    this._pendingMenuResume = false;
    if (this._cleanupMenuListeners) {
      this._cleanupMenuListeners();
    }
    if (this.menuGain && this.ctx) {
      const now = this.ctx.currentTime;
      this.menuGain.gain.cancelScheduledValues(now);
      this.menuGain.gain.setValueAtTime(0.0, now);
    }
    try {
      this.menuAudio.pause();
    } catch (_) {}
    try {
      this.menuAudio.playbackRate = 1.0;
    } catch (_) {}
  }

  _stopStemNodes() {
    const now = this.ctx ? this.ctx.currentTime : 0;
    for (const key of STEM_NAMES) {
      if (this.ctx && this.stemGains[key]) {
        this.stemGains[key].gain.cancelScheduledValues(now);
        this.stemGains[key].gain.setValueAtTime(0.0, now);
      }
      const src = this._activeStemSources[key];
      if (src) {
        try {
          src.stop(0);
        } catch (_) {}
        try {
          src.disconnect();
        } catch (_) {}
        this._activeStemSources[key] = null;
      }
    }
    this._stemPlaying = false;
  }

  stopAllStageMusic() {
    this.mode = 'stopped';
    this._isPaused = false;
    this._stemLoadToken++;
    this._setStemsLoading(false);
    this._stopMenuAudio();
    this._stopStemNodes();
  }

  stopVoiceClip() {
    if (this._activeVoiceSource) {
      try {
        this._activeVoiceSource.stop(0);
      } catch (_) {}
      try {
        this._activeVoiceSource.disconnect();
      } catch (_) {}
      this._activeVoiceSource = null;
    }
    this.voiceAudio.pause();
    try {
      this.voiceAudio.currentTime = 0;
    } catch (_) {}
  }

  async playVoiceClip(src) {
    if (!src || this.muted || this.sfxVolume <= 0) return;
    this.stopVoiceClip();

    if (this.ctx) {
      this._ensureContextRunning();
      try {
        let buf = this._voiceBufferCache.get(src);
        if (!buf) {
          const encodedSrc = src.split('/').map(encodeURIComponent).join('/');
          const res = await fetch(encodedSrc);
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const ab = await res.arrayBuffer();
          buf = await this._decodeBuffer(ab);
          this._voiceBufferCache.set(src, buf);
        }
        if (this.muted) return;
        this.stopVoiceClip();
        const node = this.ctx.createBufferSource();
        node.buffer = buf;
        node.connect(this.voiceGain);
        node.start(0);
        this._activeVoiceSource = node;
        return;
      } catch (_) {
        // Fallback para HTMLAudio caso falhe fetch/decode
      }
    }

    this.voiceAudio.src = src;
    this.voiceAudio.volume = this.sfxVolume;
    this.voiceAudio.play().catch(() => {});
  }

  _decodeBuffer(arrayBuffer) {
    return new Promise((resolve, reject) => {
      let settled = false;
      const onSuccess = (buf) => {
        if (!settled) {
          settled = true;
          resolve(buf);
        }
      };
      const onError = (err) => {
        if (!settled) {
          settled = true;
          reject(err || new Error('decodeAudioData failed'));
        }
      };
      try {
        const maybePromise = this.ctx.decodeAudioData(arrayBuffer, onSuccess, onError);
        if (maybePromise && typeof maybePromise.then === 'function') {
          maybePromise.then(onSuccess, onError);
        }
      } catch (err) {
        onError(err);
      }
    });
  }

  _sliceAudioBuffer(fullBuf, startSec) {
    const sr = fullBuf.sampleRate;
    const startSample = Math.min(fullBuf.length - 1, Math.max(0, Math.floor(startSec * sr)));
    if (startSample <= 0) return fullBuf;

    const frameCount = fullBuf.length - startSample;
    const channels = fullBuf.numberOfChannels;
    const sliced = this.ctx.createBuffer(channels, frameCount, sr);
    for (let ch = 0; ch < channels; ch++) {
      const srcData = fullBuf.getChannelData(ch).subarray(startSample, startSample + frameCount);
      sliced.getChannelData(ch).set(srcData);
    }
    return sliced;
  }

  // Pré-carrega e decodifica as 4 stems da fase em background (sem travar RAM no celular)
  preloadStageStems(stage) {
    if (!stage || !stage.stemSlug || !this.ctx) return Promise.resolve(null);
    const slug = stage.stemSlug;

    if (this._stemPackCache.has(slug)) {
      return Promise.resolve(this._stemPackCache.get(slug));
    }
    if (this._stemLoadPromises.has(slug)) {
      return this._stemLoadPromises.get(slug);
    }

    // Para faixas longas que começam no meio (ex: Santa Catareich aos 145s),
    // corta em memória o trecho inicial não usado para economizar >50% de RAM no celular!
    const trimSec = (stage.songStart || 0) > 5 ? Math.max(0, (stage.songStart || 0) - 2) : 0;

    const loadPromise = (async () => {
      // 1. Baixa os 4 arquivos em paralelo
      const rawArrays = await Promise.all(
        STEM_NAMES.map(async (key) => {
          const url = `stems/${slug}/${STEM_FILES[key]}`;
          const res = await fetch(url);
          if (!res.ok) throw new Error(`Falha ao carregar stem ${url}: ${res.status}`);
          return res.arrayBuffer();
        })
      );

      // 2. No celular, mantém apenas 1 pacote decodificado em cache por vez (evita estourar limite de RAM do iOS/Android)
      if (IS_MOBILE) {
        for (const cachedKey of Array.from(this._stemPackCache.keys())) {
          if (cachedKey !== slug && (!this._activePack || this._activePack.slug !== cachedKey)) {
            this._stemPackCache.delete(cachedKey);
          }
        }
      }

      // 3. Decodifica sequencialmente para evitar pico quádruplo de memória PCM no celular
      const buffers = {};
      let minDuration = Infinity;
      for (let i = 0; i < STEM_NAMES.length; i++) {
        const key = STEM_NAMES[i];
        const ab = rawArrays[i];
        rawArrays[i] = null;
        const fullBuf = await this._decodeBuffer(ab);
        const finalBuf = trimSec > 0 ? this._sliceAudioBuffer(fullBuf, trimSec) : fullBuf;
        buffers[key] = finalBuf;
        if (finalBuf.duration < minDuration) {
          minDuration = finalBuf.duration;
        }
      }

      const pack = {
        slug,
        baseTime: trimSec,
        duration: minDuration,
        buffers,
      };
      this._stemPackCache.set(slug, pack);
      return pack;
    })();

    const wrapped = loadPromise.finally(() => {
      this._stemLoadPromises.delete(slug);
    });
    this._stemLoadPromises.set(slug, wrapped);
    return wrapped;
  }

  _startStemNodes(pack, songTimeSec) {
    if (!this.ctx || !pack) return;
    this._stopMenuAudio();
    this._stopStemNodes();
    this._ensureContextRunning();

    if (this.ctx.state !== 'running') {
      this._activePack = pack;
      this._pausedSongTime = songTimeSec || 0;
      this._pendingStemResume = true;
      this._stemPlaying = false;
      return;
    }

    if (IS_MOBILE) {
      for (const cachedKey of Array.from(this._stemPackCache.keys())) {
        if (cachedKey !== pack.slug) {
          this._stemPackCache.delete(cachedKey);
        }
      }
    }

    const minBufDur = pack.duration;
    const baseTime = pack.baseTime;
    const loopStartBuf = Math.max(0, Math.min(minBufDur - 0.05, (this._stageLoopStart || 0) - baseTime));
    const startOffsetBuf = Math.max(0, Math.min(minBufDur - 0.05, (songTimeSec || 0) - baseTime));

    // Agenda as 4 stems no MESMO sample exato do clock de hardware do Web Audio!
    const now = this.ctx.currentTime;
    const startWhen = now + 0.035;

    for (const key of STEM_NAMES) {
      const gain = this.stemGains[key];
      const targetGain = this.stemMuted[key] ? 0.0 : 1.0;
      gain.gain.cancelScheduledValues(now);
      gain.gain.setValueAtTime(targetGain, now);

      const src = this.ctx.createBufferSource();
      src.buffer = pack.buffers[key];
      src.loop = true;
      src.loopStart = loopStartBuf;
      src.loopEnd = minBufDur;
      src.connect(gain);
      src.start(startWhen, startOffsetBuf);
      this._activeStemSources[key] = src;
    }

    this._activePack = pack;
    this._stemCtxStartTime = startWhen;
    this._stemStartOffsetBuf = startOffsetBuf;
    this._stemLoopStartBuf = loopStartBuf;
    this._stemLoopEndBuf = minBufDur;
    this._pausedSongTime = songTimeSec || 0;
    this._pendingStemResume = false;
    this._stemPlaying = true;
  }

  startMenuMedley(index = 0) {
    this.init();
    this.stopVoiceClip();
    this._stemLoadToken++;
    this._setStemsLoading(false);
    this._stopStemNodes();
    this.usingStems = false;
    this._isPaused = false;
    this.mode = 'menu';
    this.menuAudio.playbackRate = 1.0;
    this.medleyIndex = ((index % MENU_MEDLEY.length) + MENU_MEDLEY.length) % MENU_MEDLEY.length;
    const item = MENU_MEDLEY[this.medleyIndex];
    this._playMenuAt(item.src, item.start, 1.0);
    if (this.onTrackChange) this.onTrackChange(item.title);
  }

  nextMenuTrack() {
    this.startMenuMedley(this.medleyIndex + 1);
  }

  prevMenuTrack() {
    this.startMenuMedley(this.medleyIndex - 1);
  }

  startStageTrack(stage) {
    this.init();
    this.stopVoiceClip();
    this._stopMenuAudio();
    this._stopStemNodes();

    this.mode = 'stage';
    this._isPaused = false;
    this._stageMoshWindows = stage.moshWindows || [];
    this._stageLoopStart = stage.songStart || 0;
    const startSec = stage.songStart || 0;
    this._pendingStartSec = startSec;
    this._pausedSongTime = startSec;
    this.unmuteAllStems();

    const token = ++this._stemLoadToken;

    if (stage.stemSlug) {
      this.usingStems = true;
      const cached = this._stemPackCache.get(stage.stemSlug);
      if (cached) {
        this._setStemsLoading(false);
        this._startStemNodes(cached, startSec);
      } else {
        this._setStemsLoading(true);
        this.preloadStageStems(stage)
          .then((pack) => {
            if (token !== this._stemLoadToken || this.mode !== 'stage') return;
            this._setStemsLoading(false);
            if (!pack) return;
            this._activePack = pack;
            if (this._isPaused) {
              this._pausedSongTime = startSec;
            } else {
              this._startStemNodes(pack, startSec);
            }
          })
          .catch(() => {
            if (token !== this._stemLoadToken || this.mode !== 'stage') return;
            this._setStemsLoading(false);
            // Fallback seguro para faixa única se algum arquivo falhar na rede
            this.usingStems = false;
            if (!this._isPaused) {
              this._playMenuAt(stage.songSrc, startSec, 1.0);
            }
          });
      }
    } else {
      this._setStemsLoading(false);
      this.usingStems = false;
      this._playMenuAt(stage.songSrc, startSec, 1.0);
    }

    if (this.onTrackChange) this.onTrackChange(`${stage.num} — ${stage.name}`);
  }

  // Silencia o instrumento exato quando o integrante da banda cai no palco!
  muteStem(stemKey) {
    if (!this.ctx || !this.stemGains[stemKey]) return;
    this.stemMuted[stemKey] = true;
    const now = this.ctx.currentTime;
    const g = this.stemGains[stemKey].gain;
    g.cancelScheduledValues(now);
    g.setValueAtTime(g.value, now);
    g.linearRampToValueAtTime(0.0, now + 0.08);
  }

  unmuteAllStems() {
    for (const key of STEM_NAMES) {
      this.stemMuted[key] = false;
      if (this.ctx && this.stemGains[key]) {
        const now = this.ctx.currentTime;
        this.stemGains[key].gain.cancelScheduledValues(now);
        this.stemGains[key].gain.setValueAtTime(1.0, now);
      }
    }
  }

  _playMenuAt(src, startSec, rate = 1.0) {
    if (this._cleanupMenuListeners) {
      this._cleanupMenuListeners();
    }
    this._stopStemNodes();

    const playToken = ++this._menuPlayToken;
    const isValidMenuPlayback = () =>
      playToken === this._menuPlayToken &&
      (this.mode === 'menu' ||
        this.mode === 'secret' ||
        this.mode === 'hell' ||
        (this.mode === 'stage' && !this.usingStems));

    const encodedSrc = src.split('/').map(encodeURIComponent).join('/');
    const sameFile = this.menuAudio.dataset.rawSrc === src && !!this.menuAudio.getAttribute('src');
    this.menuAudio.dataset.rawSrc = src;

    const unmuteMenuSmooth = () => {
      if (!isValidMenuPlayback()) return;
      if (this.menuGain && this.ctx) {
        const now = this.ctx.currentTime;
        this.menuGain.gain.cancelScheduledValues(now);
        this.menuGain.gain.setValueAtTime(this.menuGain.gain.value, now);
        this.menuGain.gain.linearRampToValueAtTime(1.0, now + 0.03);
      }
    };

    const applySeekAndRate = () => {
      if (!isValidMenuPlayback()) return;
      try {
        if (Math.abs((this.menuAudio.currentTime || 0) - startSec) > 0.35) {
          this.menuAudio.currentTime = startSec;
        }
      } catch (_) {}
      try {
        this.menuAudio.playbackRate = rate;
      } catch (_) {}
    };

    if (sameFile && this.menuAudio.readyState >= 1) {
      applySeekAndRate();
      unmuteMenuSmooth();
      if (!this._isPaused && isValidMenuPlayback()) {
        const p = this.menuAudio.play();
        if (p && typeof p.catch === 'function') p.catch(() => { this._pendingMenuResume = true; });
      }
      return;
    }

    // Silencia momentaneamente o menuGain enquanto busca a posição inicial (ex: 195s no celular)
    if (this.menuGain && this.ctx && startSec > 0.5) {
      const now = this.ctx.currentTime;
      this.menuGain.gain.cancelScheduledValues(now);
      this.menuGain.gain.setValueAtTime(0.0, now);
    } else {
      unmuteMenuSmooth();
    }

    this.menuAudio.src = encodedSrc;
    this.menuAudio.load();

    let seekApplied = false;
    const onMeta = () => {
      if (!isValidMenuPlayback()) {
        cleanup();
        return;
      }
      applySeekAndRate();
    };
    const onCanPlay = () => {
      if (!isValidMenuPlayback()) {
        cleanup();
        return;
      }
      if (!seekApplied) {
        seekApplied = true;
        applySeekAndRate();
        unmuteMenuSmooth();
      }
      if (!this._isPaused && this.menuAudio.paused) {
        const p = this.menuAudio.play();
        if (p && typeof p.catch === 'function') p.catch(() => { this._pendingMenuResume = true; });
      }
      cleanup();
    };
    const safetyTimer = setTimeout(() => {
      if (isValidMenuPlayback()) {
        unmuteMenuSmooth();
      }
    }, 1800);

    const cleanup = () => {
      clearTimeout(safetyTimer);
      this.menuAudio.removeEventListener('loadedmetadata', onMeta);
      this.menuAudio.removeEventListener('canplay', onCanPlay);
      if (this._cleanupMenuListeners === cleanup) {
        this._cleanupMenuListeners = null;
      }
    };
    this._cleanupMenuListeners = cleanup;

    this.menuAudio.addEventListener('loadedmetadata', onMeta);
    this.menuAudio.addEventListener('canplay', onCanPlay);

    try {
      this.menuAudio.playbackRate = rate;
    } catch (_) {}
    if (!this._isPaused && isValidMenuPlayback()) {
      // Dispara play dentro do gesto de toque para desbloquear HTMLMediaElement no iOS Safari
      const p = this.menuAudio.play();
      if (p && typeof p.catch === 'function') p.catch(() => { this._pendingMenuResume = true; });
    }
  }

  startSecretRoomTrack() {
    this.init();
    this.stopVoiceClip();
    this._stemLoadToken++;
    this._setStemsLoading(false);
    this._stopStemNodes();
    this.usingStems = false;
    this.mode = 'secret';
    this._isPaused = false;
    this._secretStart = 0;
    this._secretEnd = 0;
    this._secretLoopFading = false;
    this._playMenuAt('MUSICAS SHOW/Capacete de Nazista é Martelo.mp3', 0, 1.16);
    if (this.onTrackChange) this.onTrackChange('SALA SECRETA 77 — CAPACETE DE NAZISTA É MARTELO (TURBO)');
  }

  // Fase Secreta EXPURGÁTORIO — faixa completa, do 0:00 ao fim, sem cortes
  startHellStageTrack() {
    this.init();
    this.stopVoiceClip();
    this._stemLoadToken++;
    this._setStemsLoading(false);
    this._stopStemNodes();
    this._stopMenuAudio();
    this.usingStems = false;
    this.mode = 'hell';
    this._isPaused = false;
    this._stageMoshWindows = HELL_STAGE_CONFIG.phases
      .filter((phase) => phase.id > 0)
      .map((phase) => [phase.start, phase.end === 999 ? 999 : phase.end]);
    this._stageLoopStart = 0;
    this._playMenuAt(HELL_STAGE_CONFIG.songSrc, 0, 1.0);
    if (this.onTrackChange) this.onTrackChange('FASE SECRETA — EXPURGÁTORIO (INFERNO)');
  }

  exitSecretRoomTrack(stage, resumeTime = 0) {
    this.init();
    this._stopMenuAudio();
    this._stopStemNodes();
    this.mode = 'stage';
    this._isPaused = false;
    this._stageMoshWindows = stage.moshWindows || [];
    this._stageLoopStart = stage.songStart || 0;
    const targetSec = resumeTime || stage.songStart || 0;
    this._pendingStartSec = targetSec;
    this._pausedSongTime = targetSec;

    const token = ++this._stemLoadToken;

    if (stage.stemSlug) {
      this.usingStems = true;
      const cached = this._stemPackCache.get(stage.stemSlug);
      if (cached) {
        this._setStemsLoading(false);
        this._startStemNodes(cached, targetSec);
      } else {
        this._setStemsLoading(true);
        this.preloadStageStems(stage)
          .then((pack) => {
            if (token !== this._stemLoadToken || this.mode !== 'stage') return;
            this._setStemsLoading(false);
            if (pack && !this._isPaused) {
              this._startStemNodes(pack, targetSec);
            }
          })
          .catch(() => {
            if (token !== this._stemLoadToken || this.mode !== 'stage') return;
            this._setStemsLoading(false);
            this.usingStems = false;
            if (!this._isPaused) {
              this._playMenuAt(stage.songSrc, targetSec, 1.0);
            }
          });
      }
    } else {
      this.usingStems = false;
      this._playMenuAt(stage.songSrc, targetSec, 1.0);
    }

    if (this.onTrackChange) this.onTrackChange(`${stage.num} — ${stage.name}`);
  }

  _handleMenuTimeUpdate() {
    if (this.mode === 'menu') {
      const item = MENU_MEDLEY[this.medleyIndex];
      if (item && this.menuAudio.currentTime >= item.end) {
        this.nextMenuTrack();
      }
    } else if (this.mode === 'secret') {
      this._handleSecretLoop();
    }
  }

  _handleSecretLoop() {
    const audio = this.menuAudio;
    const dur = audio.duration;
    if (!Number.isFinite(dur) || dur <= 0) return;

    const fadeWindow = 0.18;
    const loopAt = Math.max(0, dur - fadeWindow);
    const current = audio.currentTime || 0;

    if (!this._secretLoopFading && current >= loopAt) {
      this._secretLoopFading = true;
      if (this.menuGain && this.ctx) {
        const now = this.ctx.currentTime;
        this.menuGain.gain.cancelScheduledValues(now);
        this.menuGain.gain.setValueAtTime(Math.max(0.001, this.menuGain.gain.value), now);
        this.menuGain.gain.linearRampToValueAtTime(0.001, now + Math.max(0.05, dur - current));
      }
    }

    if (current >= dur - 0.04) {
      this._secretLoopFading = false;
      try {
        audio.currentTime = 0;
        audio.playbackRate = 1.16;
      } catch (_) {}
      if (this.menuGain && this.ctx) {
        const now = this.ctx.currentTime;
        this.menuGain.gain.cancelScheduledValues(now);
        this.menuGain.gain.setValueAtTime(0.001, now);
        this.menuGain.gain.linearRampToValueAtTime(1.0, now + 0.06);
      }
      if (!this._isPaused) {
        audio.play().catch(() => {});
      }
    }
  }

  pauseMusic() {
    this._isPaused = true;
    if (this.mode === 'stage' && this.usingStems) {
      if (this._stemPlaying) {
        this._pausedSongTime = this.getCurrentTime();
        this._stopStemNodes();
      }
    } else {
      this.menuAudio.pause();
    }
  }

  resumeMusic() {
    this._isPaused = false;
    this._ensureContextRunning();
    if (this.mode === 'stage' && this.usingStems) {
      if (this._activePack && !this._stemPlaying) {
        this._startStemNodes(this._activePack, this._pausedSongTime ?? this._stageLoopStart);
      }
    } else if (this.mode === 'menu' || this.mode === 'secret' || this.mode === 'stage' || this.mode === 'hell') {
      if (this.mode === 'secret' && this.menuGain && this.ctx) {
        const now = this.ctx.currentTime;
        this.menuGain.gain.cancelScheduledValues(now);
        this.menuGain.gain.setValueAtTime(1.0, now);
        this._secretLoopFading = false;
      }
      { const _pr = this.menuAudio.play(); if (_pr && _pr.catch) _pr.catch(() => { this._pendingMenuResume = true; }); }
    }
  }

  getCurrentTime() {
    if (this.mode === 'stage' && this.usingStems) {
      if (this._isPaused || !this._stemPlaying || !this._activePack || !this.ctx) {
        return this._pausedSongTime ?? this._pendingStartSec ?? this._stageLoopStart ?? 0;
      }
      // Compensa a latência real de saída do alto-falante/Bluetooth no celular
      const hwLatency = (this.ctx.baseLatency || 0) + (this.ctx.outputLatency || 0);
      const elapsed = Math.max(0, this.ctx.currentTime - this._stemCtxStartTime - hwLatency);
      const rawBufPos = this._stemStartOffsetBuf + elapsed;
      let bufPos;
      if (rawBufPos < this._stemLoopEndBuf) {
        bufPos = rawBufPos;
      } else {
        const span = Math.max(0.01, this._stemLoopEndBuf - this._stemLoopStartBuf);
        bufPos = this._stemLoopStartBuf + ((rawBufPos - this._stemLoopEndBuf) % span);
      }
      return this._activePack.baseTime + bufPos;
    }
    return this.menuAudio.currentTime || 0;
  }

  // Atualiza espectro em tempo real (sem re-seeks destrutivos — as 4 stems já estão cravadas no clock do Web Audio!)
  updateAnalysis() {
    if (!this.analyser || !this.freqData) {
      return { bass: 0, mid: 0, overall: 0, peak: false, isAggressive: false, bins: null };
    }
    this.analyser.getByteFrequencyData(this.freqData);

    let bassSum = 0;
    for (let i = 1; i <= 10; i++) bassSum += this.freqData[i];
    this.bassEnergy = bassSum / (10 * 255);

    let midSum = 0;
    for (let i = 11; i <= 42; i++) midSum += this.freqData[i];
    this.midEnergy = midSum / (32 * 255);

    let allSum = 0;
    for (let i = 0; i < this.freqData.length; i++) allSum += this.freqData[i];
    this.overallEnergy = allSum / (this.freqData.length * 255);

    this.peakDetected = this.bassEnergy > 0.62 && this.bassEnergy - this._prevBass > 0.08;
    this._prevBass = this.bassEnergy;

    const t = this.getCurrentTime();
    let inWindow = false;
    for (const [a, b] of this._stageMoshWindows) {
      if (t >= a && t <= b) {
        inWindow = true;
        break;
      }
    }
    const isAggressive =
      this.mode === 'hell' ||
      this.mode === 'secret' ||
      inWindow ||
      (this.overallEnergy > 0.44 && this.bassEnergy > 0.58);

    return {
      bass: this.bassEnergy,
      mid: this.midEnergy,
      overall: this.overallEnergy,
      peak: this.peakDetected,
      isAggressive,
      bins: this.freqData,
    };
  }

  // Efeitos sonoros sintetizados
  playSFX(type) {
    if (this.muted || this.sfxVolume <= 0 || !this.ctx) return;
    this._ensureContextRunning();
    const now = this.ctx.currentTime;
    const sfxOut = this.sfxGain || this.ctx.destination;

    if (type === 'punch' || type === 'slam') {
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = type === 'slam' ? 'sawtooth' : 'triangle';
      osc.frequency.setValueAtTime(type === 'slam' ? 140 : 190, now);
      osc.frequency.exponentialRampToValueAtTime(32, now + (type === 'slam' ? 0.18 : 0.1));
      g.gain.setValueAtTime(type === 'slam' ? 0.45 : 0.32, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + (type === 'slam' ? 0.2 : 0.11));
      osc.connect(g);
      g.connect(sfxOut);
      osc.start(now);
      osc.stop(now + 0.21);
    } else if (type === 'blade' || type === 'scythe') {
      const bufSize = Math.floor(this.ctx.sampleRate * 0.14);
      const buf = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < bufSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufSize * 0.35));
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buf;
      const filt = this.ctx.createBiquadFilter();
      filt.type = 'bandpass';
      filt.frequency.value = type === 'scythe' ? 1600 : 2800;
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.36, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
      noise.connect(filt);
      filt.connect(g);
      g.connect(sfxOut);
      noise.start(now);
    } else if (type === 'hammer') {
      const osc = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'square';
      osc2.type = 'triangle';
      osc.frequency.setValueAtTime(420, now);
      osc.frequency.exponentialRampToValueAtTime(95, now + 0.22);
      osc2.frequency.setValueAtTime(110, now);
      osc2.frequency.exponentialRampToValueAtTime(28, now + 0.25);
      g.gain.setValueAtTime(0.42, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.26);
      osc.connect(g);
      osc2.connect(g);
      g.connect(sfxOut);
      osc.start(now);
      osc2.start(now);
      osc.stop(now + 0.27);
      osc2.stop(now + 0.27);
    } else if (type === 'pickup') {
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(340, now);
      osc.frequency.setValueAtTime(520, now + 0.05);
      osc.frequency.setValueAtTime(780, now + 0.1);
      g.gain.setValueAtTime(0.2, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc.connect(g);
      g.connect(sfxOut);
      osc.start(now);
      osc.stop(now + 0.19);
    } else if (type === 'beer') {
      // Estouro da tampinha + trinado de cura!
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(480, now);
      osc.frequency.exponentialRampToValueAtTime(960, now + 0.07);
      osc.frequency.setValueAtTime(660, now + 0.09);
      osc.frequency.exponentialRampToValueAtTime(1180, now + 0.24);
      g.gain.setValueAtTime(0.32, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
      osc.connect(g);
      g.connect(sfxOut);
      osc.start(now);
      osc.stop(now + 0.29);
    } else if (type === 'special') {
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(90, now);
      osc.frequency.linearRampToValueAtTime(620, now + 0.16);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.45);
      g.gain.setValueAtTime(0.42, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.48);
      osc.connect(g);
      g.connect(sfxOut);
      osc.start(now);
      osc.stop(now + 0.5);
    } else if (type === 'hurt') {
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.linearRampToValueAtTime(60, now + 0.15);
      g.gain.setValueAtTime(0.3, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
      osc.connect(g);
      g.connect(sfxOut);
      osc.start(now);
      osc.stop(now + 0.17);
    } else if (type === 'flame') {
      // Sopro quente e grave de lança-chamas!
      const bufSize = Math.floor(this.ctx.sampleRate * 0.13);
      const buf = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < bufSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.sin((i / bufSize) * Math.PI);
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buf;
      const filt = this.ctx.createBiquadFilter();
      filt.type = 'lowpass';
      filt.frequency.setValueAtTime(680, now);
      filt.frequency.exponentialRampToValueAtTime(220, now + 0.13);
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.32, now);
      g.gain.exponentialRampToValueAtTime(0.01, now + 0.13);
      noise.connect(filt);
      filt.connect(g);
      g.connect(sfxOut);
      noise.start(now);
    } else if (type === 'secretEnter' || type === 'secretExit') {
      const osc = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc2.type = 'square';
      if (type === 'secretEnter') {
        osc.frequency.setValueAtTime(520, now);
        osc.frequency.exponentialRampToValueAtTime(77, now + 0.65);
        osc2.frequency.setValueAtTime(260, now);
        osc2.frequency.exponentialRampToValueAtTime(55, now + 0.65);
      } else {
        osc.frequency.setValueAtTime(110, now);
        osc.frequency.exponentialRampToValueAtTime(660, now + 0.55);
        osc2.frequency.setValueAtTime(165, now);
        osc2.frequency.exponentialRampToValueAtTime(880, now + 0.55);
      }
      g.gain.setValueAtTime(0.38, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.68);
      osc.connect(g);
      osc2.connect(g);
      g.connect(sfxOut);
      osc.start(now);
      osc2.start(now);
      osc.stop(now + 0.7);
      osc2.stop(now + 0.7);
    } else if (type === 'cry') {
      // Choro cômico / berreiro choramingado ("buááá!") do Hitler covarde
      const osc = this.ctx.createOscillator();
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      const g = this.ctx.createGain();

      osc.type = 'sawtooth';
      const baseFreq = 540 + Math.random() * 140;
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.linearRampToValueAtTime(baseFreq * 1.15, now + 0.06);
      osc.frequency.exponentialRampToValueAtTime(240 + Math.random() * 50, now + 0.34);

      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(24 + Math.random() * 8, now);
      lfoGain.gain.setValueAtTime(38, now);
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);

      const filt = this.ctx.createBiquadFilter();
      filt.type = 'bandpass';
      filt.frequency.setValueAtTime(1100, now);
      filt.Q.value = 2.2;

      g.gain.setValueAtTime(0.01, now);
      g.gain.linearRampToValueAtTime(0.32, now + 0.03);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.36);

      osc.connect(filt);
      filt.connect(g);
      g.connect(sfxOut);

      lfo.start(now);
      osc.start(now);
      lfo.stop(now + 0.37);
      osc.stop(now + 0.37);
    } else if (type === 'hitlerEnter') {
      // Alarme dramático de chefe covarde entrando no Bunker 77
      const osc = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc2.type = 'square';
      osc.frequency.setValueAtTime(130, now);
      osc.frequency.setValueAtTime(123, now + 0.16);
      osc.frequency.exponentialRampToValueAtTime(55, now + 0.55);
      osc2.frequency.setValueAtTime(260, now);
      osc2.frequency.setValueAtTime(246, now + 0.16);
      osc2.frequency.exponentialRampToValueAtTime(110, now + 0.55);
      g.gain.setValueAtTime(0.36, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.58);
      osc.connect(g);
      osc2.connect(g);
      g.connect(sfxOut);
      osc.start(now);
      osc2.start(now);
      osc.stop(now + 0.6);
      osc2.stop(now + 0.6);
    } else if (type === 'machinegun') {
      // Rajada seca e metálica da Metralhadora V77
      const bufSize = Math.floor(this.ctx.sampleRate * 0.07);
      const buf = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < bufSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufSize * 0.28));
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buf;
      const filt = this.ctx.createBiquadFilter();
      filt.type = 'highpass';
      filt.frequency.value = 900;
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.22, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
      noise.connect(filt);
      filt.connect(g);
      g.connect(sfxOut);
      noise.start(now);
    } else if (type === 'valveThrow') {
      // Metal pesado girando + estouro de vapor infernal
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(760, now);
      osc.frequency.exponentialRampToValueAtTime(70, now + 0.34);
      g.gain.setValueAtTime(0.3, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.36);
      osc.connect(g);
      g.connect(sfxOut);
      osc.start(now);
      osc.stop(now + 0.37);

      const bufSize = Math.floor(this.ctx.sampleRate * 0.3);
      const buf = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < bufSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufSize * 0.24));
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buf;
      const lp = this.ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.setValueAtTime(2400, now);
      lp.frequency.exponentialRampToValueAtTime(180, now + 0.3);
      const ng = this.ctx.createGain();
      ng.gain.setValueAtTime(0.34, now);
      ng.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      noise.connect(lp);
      lp.connect(ng);
      ng.connect(sfxOut);
      noise.start(now);
    } else if (type === 'hellEnter') {
      // Trovão / sub-grave dramático de descida ao inferno
      const osc = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'sine';
      osc2.type = 'sawtooth';
      osc.frequency.setValueAtTime(120, now);
      osc.frequency.exponentialRampToValueAtTime(28, now + 0.9);
      osc2.frequency.setValueAtTime(68, now);
      osc2.frequency.exponentialRampToValueAtTime(22, now + 0.85);
      g.gain.setValueAtTime(0.5, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.95);
      osc.connect(g);
      osc2.connect(g);
      g.connect(sfxOut);
      osc.start(now);
      osc2.start(now);
      osc.stop(now + 0.96);
      osc2.stop(now + 0.96);
    }
  }
}

export const audioEngine = new V77AudioEngine();
