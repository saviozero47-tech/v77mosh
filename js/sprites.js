// Renderizador Punk Zine 2D — Sprites, Integrantes com Cabeça Real, Palco, Cerveja, Ratos e Armas Brancas

export const IMAGES = {};

export function preloadAssets() {
  const list = {
    logo: 'assets/logo_trans.png',
    psayco: 'assets/head_psayco.png',
    julian: 'assets/head_julian.png',
    delleiw: 'assets/head_delleiw.png',
    misa: 'assets/head_misa.png',
  };
  return Promise.all(
    Object.entries(list).map(
      ([key, src]) =>
        new Promise((resolve) => {
          const img = new Image();
          img.onload = () => {
            IMAGES[key] = img;
            resolve();
          };
          img.onerror = () => resolve();
          img.src = src;
        })
    )
  );
}

// Desenha o emblema suástica (círculo branco + suástica preta) para a roupa/braçadeira dos nazis
function drawSwastikaBadge(ctx, cx, cy, r) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();

  ctx.rotate(Math.PI / 4);
  const arm = r * 0.66;
  ctx.strokeStyle = '#09090b';
  ctx.lineWidth = Math.max(1.3, r * 0.28);
  ctx.lineCap = 'square';
  ctx.beginPath();
  ctx.moveTo(-arm, 0);
  ctx.lineTo(arm, 0);
  ctx.moveTo(0, -arm);
  ctx.lineTo(0, arm);
  ctx.moveTo(arm, 0);
  ctx.lineTo(arm, arm * 0.85);
  ctx.moveTo(-arm, 0);
  ctx.lineTo(-arm, -arm * 0.85);
  ctx.moveTo(0, -arm);
  ctx.lineTo(arm * 0.85, -arm);
  ctx.moveTo(0, arm);
  ctx.lineTo(-arm * 0.85, arm);
  ctx.stroke();
  ctx.restore();
}

// Avatar SVG inline para a barra do Chefe Hitler no HUD do Bunker 77
export function getHitlerAvatarDataUrl(isCrying = false) {
  const tears = isCrying
    ? `<path d="M25 36 Q12 44 10 60" stroke="#38bdf8" stroke-width="5" fill="none" stroke-linecap="round"/>
       <path d="M45 36 Q58 44 60 60" stroke="#38bdf8" stroke-width="5" fill="none" stroke-linecap="round"/>
       <circle cx="14" cy="54" r="3" fill="#bae6fd"/><circle cx="56" cy="54" r="3" fill="#bae6fd"/>
       <ellipse cx="35" cy="54" rx="10" ry="7" fill="#991b1b" stroke="#09090b" stroke-width="2"/>`
    : `<rect x="27" y="51" width="16" height="5" rx="2" fill="#18181b"/>`;
  const eyes = isCrying
    ? `<path d="M22 33 L29 36 L22 39" stroke="#09090b" stroke-width="2.8" fill="none" stroke-linecap="round"/>
       <path d="M48 33 L41 36 L48 39" stroke="#09090b" stroke-width="2.8" fill="none" stroke-linecap="round"/>`
    : `<circle cx="26" cy="35" r="3.2" fill="#09090b"/><circle cx="44" cy="35" r="3.2" fill="#09090b"/>
       <line x1="20" y1="29" x2="31" y2="32" stroke="#09090b" stroke-width="2.5"/>
       <line x1="50" y1="29" x2="39" y2="32" stroke="#09090b" stroke-width="2.5"/>`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 70 70">
    <rect width="70" height="70" rx="8" fill="#1c1917"/>
    <circle cx="35" cy="38" r="24" fill="#f3c9ad" stroke="#09090b" stroke-width="3"/>
    <path d="M11 35 Q12 10 38 12 Q57 12 59 32 Q46 18 22 28 Z" fill="#111116" stroke="#09090b" stroke-width="2"/>
    ${eyes}
    ${tears}
    <rect x="29" y="42" width="12" height="7" rx="1" fill="#09090b"/>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// Desenha um rosto estilizado (Válvuletes, Válvulovers, Alternativo Nyx, Skinhead, Nazi, Hitler ou Rato de Terno)
export function drawPunkHead(ctx, x, y, r, visual, facing = 1, expression = 'angry', time = 0) {
  visual = visual || { skin: '#e7b89c', hairStyle: 'bald', hairColor: '#111' };
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(facing, 1);

  // Rato Burocrata da Fase Final ("Ratos saindo do esgoto")
  if (visual.isRatSuit) {
    // Orelhas de rato
    ctx.fillStyle = '#71717a';
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.arc(-r * 0.68, -r * 0.72, r * 0.46, 0, Math.PI * 2);
    ctx.arc(r * 0.25, -r * 0.85, r * 0.42, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#fca5a5';
    ctx.beginPath();
    ctx.arc(-r * 0.68, -r * 0.72, r * 0.22, 0, Math.PI * 2);
    ctx.fill();

    // Cabeça + focinho pontudo
    ctx.fillStyle = '#9ca3af';
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.95, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(r * 0.55, -r * 0.35);
    ctx.lineTo(r * 1.48, r * 0.08);
    ctx.lineTo(r * 0.48, r * 0.45);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Narizinho escuro
    ctx.fillStyle = '#18181b';
    ctx.beginPath();
    ctx.arc(r * 1.45, r * 0.08, r * 0.16, 0, Math.PI * 2);
    ctx.fill();

    // Olho vermelho malicioso + sobrancelha
    ctx.fillStyle = '#ff0000';
    ctx.beginPath();
    ctx.arc(r * 0.28, -r * 0.16, r * 0.18, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.42);
    ctx.lineTo(r * 0.56, -r * 0.22);
    ctx.stroke();

    // Dentinhos de rato
    ctx.fillStyle = '#facc15';
    ctx.fillRect(r * 0.58, r * 0.25, r * 0.16, r * 0.24);
    ctx.fillRect(r * 0.78, r * 0.25, r * 0.16, r * 0.2);

    ctx.restore();
    return;
  }

  // Cabelo traseiro (spikyBob / altWolf)
  if (visual.hairStyle === 'spikyBob') {
    ctx.fillStyle = visual.hairColor;
    ctx.beginPath();
    ctx.arc(0, -2, r * 1.16, Math.PI * 0.6, Math.PI * 2.4);
    ctx.fill();
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 2.5;
    ctx.stroke();
  } else if (visual.hairStyle === 'altWolf') {
    // Wolf-cut alternativo volumoso atrás (preto + mechas vermelho sangue!)
    ctx.fillStyle = visual.hairColor;
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(-r * 1.15, -r * 0.2);
    ctx.lineTo(-r * 1.38, r * 0.85);
    ctx.lineTo(-r * 0.82, r * 0.65);
    ctx.lineTo(-r * 0.95, r * 1.18);
    ctx.lineTo(-r * 0.25, r * 0.72);
    ctx.lineTo(r * 0.45, r * 0.95);
    ctx.lineTo(r * 0.9, -r * 0.4);
    ctx.arc(0, -r * 0.2, r * 1.18, 0, Math.PI, true);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Mechas vermelhas alternativas nas pontas
    ctx.fillStyle = visual.hairAccent || '#e60000';
    ctx.beginPath();
    ctx.moveTo(-r * 1.22, r * 0.42);
    ctx.lineTo(-r * 1.38, r * 0.92);
    ctx.lineTo(-r * 0.85, r * 0.65);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-r * 0.85, r * 0.68);
    ctx.lineTo(-r * 0.95, r * 1.18);
    ctx.lineTo(-r * 0.42, r * 0.78);
    ctx.closePath();
    ctx.fill();
  }

  // Cabeça
  ctx.fillStyle = visual.skin;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#09090b';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Cabelos punk / alternativos frontais
  ctx.fillStyle = visual.hairColor;
  ctx.strokeStyle = '#09090b';
  ctx.lineWidth = 2;

  if (visual.hairStyle === 'mohawk') {
    ctx.beginPath();
    ctx.moveTo(-r * 0.55, -r * 0.72);
    ctx.lineTo(-r * 0.85, -r * 1.75);
    ctx.lineTo(-r * 0.15, -r * 1.1);
    ctx.lineTo(0, -r * 2.05);
    ctx.lineTo(r * 0.35, -r * 1.15);
    ctx.lineTo(r * 0.8, -r * 1.7);
    ctx.lineTo(r * 0.55, -r * 0.65);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else if (visual.hairStyle === 'liberty') {
    for (let i = -2; i <= 2; i++) {
      const ang = -Math.PI / 2 + i * 0.38;
      ctx.beginPath();
      ctx.moveTo(Math.cos(ang - 0.18) * r * 0.88, Math.sin(ang - 0.18) * r * 0.88);
      ctx.lineTo(Math.cos(ang) * r * 1.9, Math.sin(ang) * r * 1.9);
      ctx.lineTo(Math.cos(ang + 0.18) * r * 0.88, Math.sin(ang + 0.18) * r * 0.88);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
  } else if (visual.hairStyle === 'sideMohawk') {
    ctx.beginPath();
    ctx.moveTo(-r * 0.4, -r * 0.85);
    ctx.lineTo(r * 0.3, -r * 1.85);
    ctx.lineTo(r * 0.95, -r * 1.35);
    ctx.lineTo(r * 1.15, -r * 0.3);
    ctx.lineTo(r * 0.55, -r * 0.35);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else if (visual.hairStyle === 'spikyBob') {
    ctx.beginPath();
    ctx.moveTo(-r * 0.8, -r * 0.45);
    ctx.lineTo(-r * 0.1, -r * 0.95);
    ctx.lineTo(r * 0.95, -r * 0.45);
    ctx.lineTo(r * 0.55, -r * 0.1);
    ctx.lineTo(r * 0.15, -r * 0.38);
    ctx.lineTo(-r * 0.3, -r * 0.05);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else if (visual.hairStyle === 'altWolf') {
    // Franja desfiada gótica/alternativa com mecha vermelha
    ctx.fillStyle = visual.hairColor;
    ctx.beginPath();
    ctx.moveTo(-r * 1.05, -r * 0.25);
    ctx.lineTo(-r * 0.5, -r * 1.15);
    ctx.lineTo(r * 0.45, -r * 1.18);
    ctx.lineTo(r * 1.05, -r * 0.28);
    ctx.lineTo(r * 0.62, -r * 0.02);
    ctx.lineTo(r * 0.28, -r * 0.36);
    ctx.lineTo(-r * 0.08, r * 0.04);
    ctx.lineTo(-r * 0.42, -r * 0.36);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Mecha frontal vermelho sangue
    ctx.fillStyle = visual.hairAccent || '#e60000';
    ctx.beginPath();
    ctx.moveTo(r * 0.12, -r * 0.72);
    ctx.lineTo(r * 0.55, -r * 0.65);
    ctx.lineTo(r * 0.26, -r * 0.04);
    ctx.closePath();
    ctx.fill();
  } else if (visual.hairStyle === 'bald') {
    ctx.fillStyle = 'rgba(255,255,255,0.28)';
    ctx.beginPath();
    ctx.ellipse(-r * 0.2, -r * 0.45, r * 0.35, r * 0.18, -0.3, 0, Math.PI * 2);
    ctx.fill();
  } else if (visual.hairStyle === 'naziHelmet') {
    // Capacete cinza-chumbo pra amassar no martelo!
    ctx.fillStyle = '#4b5563';
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.arc(0, -r * 0.18, r * 1.08, Math.PI * 0.95, Math.PI * 2.08);
    ctx.lineTo(r * 1.18, r * 0.05);
    ctx.lineTo(-r * 1.18, r * 0.15);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.22)';
    ctx.beginPath();
    ctx.ellipse(-r * 0.25, -r * 0.58, r * 0.42, r * 0.16, -0.25, 0, Math.PI * 2);
    ctx.fill();
  } else if (visual.hairStyle === 'hitler') {
    // Cabelo lambido repartido de lado com franja diagonal característica
    ctx.fillStyle = visual.hairColor || '#111116';
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.arc(0, -r * 0.1, r * 1.04, Math.PI * 0.95, Math.PI * 2.05);
    ctx.lineTo(r * 0.92, -r * 0.28);
    ctx.quadraticCurveTo(r * 0.35, -r * 0.58, -r * 0.18, -r * 0.18);
    ctx.quadraticCurveTo(-r * 0.65, -r * 0.08, -r * 1.02, r * 0.06);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Brilho de brilhantina no topete
    ctx.fillStyle = 'rgba(255,255,255,0.24)';
    ctx.beginPath();
    ctx.ellipse(-r * 0.12, -r * 0.68, r * 0.44, r * 0.12, -0.18, 0, Math.PI * 2);
    ctx.fill();
  }

  // Olhos & Sobrancelha brava (com delineado gótico se alt)
  if (visual.gothEyes) {
    ctx.fillStyle = '#18181b';
    ctx.beginPath();
    ctx.ellipse(r * 0.28, -r * 0.08, r * 0.28, r * 0.2, -0.1, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = visual.gothEyes ? '#ff0000' : '#09090b';
  if (expression === 'ko') {
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(r * 0.05, -r * 0.25);
    ctx.lineTo(r * 0.45, r * 0.05);
    ctx.moveTo(r * 0.45, -r * 0.25);
    ctx.lineTo(r * 0.05, r * 0.05);
    ctx.stroke();
  } else if (expression === 'cry') {
    // Bochecha vermelha de desespero
    ctx.fillStyle = 'rgba(239, 68, 68, 0.38)';
    ctx.beginPath();
    ctx.ellipse(r * 0.18, r * 0.14, r * 0.24, r * 0.14, 0, 0, Math.PI * 2);
    ctx.fill();

    // Fontes de lágrimas azuis jorrando dos olhos (estilo anime/arcade!)
    const wave = Math.sin(time * 28) * r * 0.14;
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = Math.max(3, r * 0.22);
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(r * 0.25, -r * 0.12);
    ctx.quadraticCurveTo(r * 0.95, -r * 0.26 + wave, r * 1.48, r * 0.48 + wave);
    ctx.moveTo(r * 0.02, -r * 0.1);
    ctx.quadraticCurveTo(-r * 0.68, -r * 0.2 - wave, -r * 1.15, r * 0.52 - wave);
    ctx.stroke();

    // Gotículas brilhantes nas pontas das lágrimas
    ctx.fillStyle = '#bae6fd';
    const dropPhase = (time * 9) % 1;
    ctx.beginPath();
    ctx.arc(r * (0.45 + dropPhase * 1.05), r * (-0.15 + dropPhase * dropPhase * 0.8), r * 0.16, 0, Math.PI * 2);
    ctx.arc(r * (-0.18 - dropPhase * 0.95), r * (-0.12 + dropPhase * dropPhase * 0.85), r * 0.14, 0, Math.PI * 2);
    ctx.fill();

    // Olho espremido chorando (><)
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.moveTo(r * 0.08, -r * 0.24);
    ctx.lineTo(r * 0.38, -r * 0.12);
    ctx.lineTo(r * 0.08, 0);
    ctx.stroke();
  } else if (expression === 'panic') {
    // Olhos arregalados de pavor + gota de suor!
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(r * 0.26, -r * 0.12, r * 0.24, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 1.8;
    ctx.stroke();
    ctx.fillStyle = '#09090b';
    ctx.beginPath();
    ctx.arc(r * 0.3, -r * 0.12, r * 0.09, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.ellipse(-r * 0.45, -r * 0.05, r * 0.1, r * 0.18, 0.2, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.fillRect(r * 0.17, -r * 0.16, r * 0.2, r * 0.2);
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.moveTo(r * 0.02, -r * 0.36);
    ctx.lineTo(r * 0.52, -r * 0.18);
    ctx.stroke();
  }

  // Boca gritando no mosh / pânico / chorando
  ctx.fillStyle = expression === 'hit' || expression === 'panic' || expression === 'cry' ? '#dc2626' : '#18181b';
  ctx.beginPath();
  if (expression === 'cry') {
    const sobW = r * (0.34 + Math.sin(time * 32) * 0.05);
    const sobH = r * (0.32 + Math.cos(time * 28) * 0.06);
    ctx.ellipse(r * 0.26, r * 0.52, sobW, sobH, 0, 0, Math.PI * 2);
  } else if (expression === 'shout' || expression === 'hit' || expression === 'panic') {
    ctx.ellipse(r * 0.26, r * 0.46, r * 0.27, expression === 'panic' ? r * 0.26 : r * 0.21, 0, 0, Math.PI * 2);
  } else {
    ctx.rect(r * 0.08, r * 0.36, r * 0.42, r * 0.16);
  }
  ctx.fill();

  // Piercing labial alternativo pro Nyx!
  if (visual.gothEyes) {
    ctx.fillStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.arc(r * 0.14, r * 0.56, r * 0.09, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = '#f4f1ea';
  if (expression === 'cry') {
    ctx.fillRect(r * 0.1, r * 0.34, r * 0.32, r * 0.09);
  } else {
    ctx.fillRect(r * 0.14, r * 0.37, r * 0.26, r * 0.07);
  }

  // Bigodinho característico nos nazistas e no Hitler (estilo escova de dente)
  if (visual.isNazi || visual.hasMustache || visual.isHitler) {
    ctx.fillStyle = '#09090b';
    ctx.fillRect(r * 0.16, r * 0.12, r * 0.26, r * 0.19);
    // Pequeno contorno sutil pra destacar mesmo com a boca aberta
    ctx.strokeStyle = 'rgba(255,255,255,0.18)';
    ctx.lineWidth = 0.8;
    ctx.strokeRect(r * 0.16, r * 0.12, r * 0.26, r * 0.19);
  }

  ctx.restore();
}

// Desenha uma garrafa de cerveja gelada para recuperar vida!
export function drawBeerBottle(ctx, x, y, z, time) {
  ctx.save();
  ctx.translate(x, y);

  // Sombra
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  ctx.beginPath();
  ctx.ellipse(0, 5, 22, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  // Halo verde/dourado de cura piscando
  ctx.strokeStyle = '#22c55e';
  ctx.lineWidth = 3;
  ctx.globalAlpha = 0.55 + Math.sin(time * 9) * 0.35;
  ctx.beginPath();
  ctx.ellipse(0, 4, 28 + Math.sin(time * 6) * 4, 11, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.globalAlpha = 1;

  const bob = Math.sin(time * 7) * 5;
  ctx.translate(0, -18 - z + bob);
  ctx.rotate(Math.sin(time * 4) * 0.12);

  // Corpo âmbar da garrafa
  ctx.fillStyle = '#b45309';
  ctx.strokeStyle = '#09090b';
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.roundRect(-9, -6, 18, 26, 5);
  ctx.fill();
  ctx.stroke();

  // Gargalo
  ctx.fillStyle = '#92400e';
  ctx.fillRect(-4.5, -20, 9, 15);
  ctx.strokeRect(-4.5, -20, 9, 15);

  // Tampinha dourada + espuma
  ctx.fillStyle = '#facc15';
  ctx.fillRect(-5.5, -23, 11, 4);
  ctx.strokeRect(-5.5, -23, 11, 4);

  // Rótulo "77"
  ctx.fillStyle = '#f4f1ea';
  ctx.fillRect(-7, 1, 14, 11);
  ctx.fillStyle = '#cc0000';
  ctx.font = '900 8px "Anton", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('77', 0, 9.5);

  // Brilho no vidro
  ctx.fillStyle = 'rgba(255,255,255,0.45)';
  ctx.fillRect(-6, -4, 3, 18);

  // Legenda flutuante
  ctx.rotate(-Math.sin(time * 4) * 0.12);
  ctx.font = '800 12px "JetBrains Mono", monospace';
  ctx.fillStyle = '#000';
  ctx.fillText('🍺 CERVEJA +40 HP', 1, -29);
  ctx.fillStyle = '#4ade80';
  ctx.fillText('🍺 CERVEJA +40 HP', 0, -30);

  ctx.restore();
}

// Desenha uma arma branca na mão ou no chão
export function drawWeaponShape(ctx, weaponId, scale = 1) {
  ctx.save();
  ctx.scale(scale, scale);
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  if (weaponId === 'faca') {
    ctx.fillStyle = '#18181b';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.fillRect(-10, -4, 14, 8);
    ctx.strokeRect(-10, -4, 14, 8);
    ctx.fillStyle = '#facc15';
    ctx.fillRect(3, -8, 4, 16);
    ctx.fillStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.moveTo(7, -5);
    ctx.lineTo(34, -2);
    ctx.lineTo(39, 3);
    ctx.lineTo(7, 5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#cc0000';
    ctx.beginPath();
    ctx.moveTo(26, -2.5);
    ctx.lineTo(39, 3);
    ctx.lineTo(24, 3.5);
    ctx.closePath();
    ctx.fill();
  } else if (weaponId === 'martelo') {
    ctx.fillStyle = '#92400e';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.fillRect(-6, -4, 38, 8);
    ctx.strokeRect(-6, -4, 38, 8);
    ctx.fillStyle = '#64748b';
    ctx.fillRect(26, -16, 16, 32);
    ctx.strokeRect(26, -16, 16, 32);
    ctx.fillStyle = '#facc15';
    ctx.fillRect(28, -14, 4, 28);
  } else if (weaponId === 'foice') {
    ctx.fillStyle = '#451a03';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2.2;
    ctx.fillRect(-14, -4, 56, 8);
    ctx.strokeRect(-14, -4, 56, 8);
    ctx.fillStyle = '#f1f5f9';
    ctx.beginPath();
    ctx.moveTo(38, -4);
    ctx.quadraticCurveTo(54, -22, 20, -34);
    ctx.quadraticCurveTo(36, -18, 30, -4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = '#ff0000';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(32, -5);
    ctx.quadraticCurveTo(39, -18, 22, -31);
    ctx.stroke();
  } else if (weaponId === 'garrafa') {
    ctx.fillStyle = '#15803d';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-6, -4);
    ctx.lineTo(10, -4);
    ctx.lineTo(15, -9);
    ctx.lineTo(29, -8);
    ctx.lineTo(24, -2);
    ctx.lineTo(31, 3);
    ctx.lineTo(22, 9);
    ctx.lineTo(14, 8);
    ctx.lineTo(10, 4);
    ctx.lineTo(-6, 4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else if (weaponId === 'flamethrower') {
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 2.2;
    ctx.fillStyle = '#334155';
    ctx.fillRect(-10, -6, 36, 11);
    ctx.strokeRect(-10, -6, 36, 11);
    ctx.fillStyle = '#ea580c';
    ctx.beginPath();
    ctx.roundRect(-4, 4, 24, 11, 4);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#facc15';
    ctx.fillRect(4, 6, 8, 7);
    ctx.fillStyle = '#64748b';
    ctx.fillRect(26, -4, 18, 7);
    ctx.strokeRect(26, -4, 18, 7);
    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.arc(47, -0.5, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(46.5, -0.5, 2.2, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

// Desenha um lutador completo (Jogador, Inimigo Punk, Rato de Terno ou Integrante da Banda)
export function drawFighter(ctx, f, time) {
  ctx.save();

  const shadowScale = Math.max(0.45, 1 - f.z / 220);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.48)';
  ctx.beginPath();
  ctx.ellipse(f.x, f.y, 26 * shadowScale, 10 * shadowScale, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.translate(f.x, f.y - f.z);

  if (f.state === 'knockdown' || f.state === 'ko') {
    ctx.translate(0, -16);
    ctx.rotate(f.facing * -1.42);
    ctx.translate(0, 16);
  } else if (f.hurtTimer > 0) {
    ctx.rotate(-f.facing * 0.22);
  } else if (f.dashTimer > 0) {
    ctx.rotate(f.facing * 0.28);
  }

  if (f.invulnTimer > 0 && Math.floor(time * 20) % 2 === 0 && !f.isBoss) {
    ctx.globalAlpha = 0.55;
  }

  const s = f.scale || 1;
  ctx.scale(f.facing * s, s);

  const walking = Math.abs(f.vx) > 15 || Math.abs(f.vy) > 15;
  const walkCycle = walking ? Math.sin(time * 15 + f.animSeed) : 0;
  const bounce = f.moshHop ? Math.abs(Math.sin(time * 13 + f.animSeed)) * 6 : Math.abs(walkCycle) * 3;
  const isAttacking = f.attackTimer > 0;
  const atkProgress = isAttacking ? 1 - f.attackTimer / (f.attackDuration || 0.24) : 0;

  let jacket = '#18181b';
  let shirt = '#cc0000';
  let pants = '#1f2937';
  let boots = '#09090b';
  let skin = '#e7b89c';
  let spikes = true;

  if (f.bandId) {
    if (f.bandId === 'psayco') {
      jacket = '#266185';
      shirt = '#1e3a5f';
      pants = '#111827';
      boots = '#09090b';
      spikes = false;
    } else if (f.bandId === 'julian') {
      jacket = '#d8a586';
      shirt = '#d8a586';
      pants = '#18181b';
      boots = '#09090b';
      spikes = false;
    } else if (f.bandId === 'delleiw') {
      jacket = '#111116';
      shirt = '#2e1065';
      pants = '#0f172a';
      boots = '#09090b';
    } else if (f.bandId === 'misa') {
      jacket = '#14532d';
      shirt = '#09090b';
      pants = '#18181b';
      boots = '#09090b';
    }
  } else if (f.visual) {
    jacket = f.visual.jacket;
    shirt = f.visual.shirt;
    pants = f.visual.pants;
    boots = f.visual.boots;
    skin = f.visual.skin;
    spikes = f.visual.spikes;
  }

  if (f.specialAnimTimer > 0) {
    ctx.save();
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, -45, 52 + Math.sin(time * 30) * 8, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  // === PERNAS & COTURNOS ===
  const legSwing = f.z > 6 ? 0.55 : walkCycle * 0.55;
  ctx.strokeStyle = '#09090b';
  ctx.lineWidth = 2.5;

  ctx.save();
  ctx.translate(-7, -34 - bounce);
  ctx.rotate(-legSwing);
  ctx.fillStyle = pants;
  ctx.fillRect(-6, 0, 12, 24);
  ctx.strokeRect(-6, 0, 12, 24);
  ctx.fillStyle = boots;
  ctx.fillRect(-6, 22, 17, 11);
  ctx.strokeRect(-6, 22, 17, 11);
  ctx.restore();

  ctx.save();
  ctx.translate(7, -34 - bounce);
  if (f.z > 10 && isAttacking) {
    ctx.rotate(-1.35);
  } else {
    ctx.rotate(legSwing);
  }
  ctx.fillStyle = pants;
  ctx.fillRect(-6, 0, 12, 24);
  ctx.strokeRect(-6, 0, 12, 24);
  ctx.fillStyle = boots;
  ctx.fillRect(-6, 22, 18, 11);
  ctx.strokeRect(-6, 22, 18, 11);
  ctx.restore();

  // === TRONCO ===
  ctx.save();
  const isHitlerCrying = f.isHitler && f.state !== 'ko' && (f.cryingTimer > 0 || f.hurtTimer > 0);
  const trembleX = isHitlerCrying ? Math.sin(time * 62) * 2.6 : 0;
  ctx.translate(trembleX, -36 - bounce);
  ctx.fillStyle = jacket;
  ctx.beginPath();
  ctx.roundRect(-18, -36, 36, 38, 6);
  ctx.fill();
  ctx.stroke();

  if (f.visual?.isRatSuit) {
    // Camisa branca + Gravata vermelha de político corrupto!
    ctx.fillStyle = '#f4f1ea';
    ctx.beginPath();
    ctx.moveTo(-7, -35);
    ctx.lineTo(7, -35);
    ctx.lineTo(0, -10);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#cc0000';
    ctx.beginPath();
    ctx.moveTo(-3, -34);
    ctx.lineTo(3, -34);
    ctx.lineTo(4, -12);
    ctx.lineTo(0, -6);
    ctx.lineTo(-4, -12);
    ctx.closePath();
    ctx.fill();
  } else if (f.isHitler) {
    // Farda militar do Hitler: camisa cáqui, gravata preta, cinto cruzado e emblema suástica no peito
    ctx.fillStyle = '#e7dec8';
    ctx.beginPath();
    ctx.moveTo(-7, -35);
    ctx.lineTo(7, -35);
    ctx.lineTo(0, -15);
    ctx.closePath();
    ctx.fill();
    // Gravata preta
    ctx.fillStyle = '#09090b';
    ctx.beginPath();
    ctx.moveTo(-2.5, -34);
    ctx.lineTo(2.5, -34);
    ctx.lineTo(3.5, -16);
    ctx.lineTo(0, -11);
    ctx.lineTo(-3.5, -16);
    ctx.closePath();
    ctx.fill();
    // Alça diagonal militar (Sam Browne) + Cinto
    ctx.strokeStyle = '#1c1917';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-14, -35);
    ctx.lineTo(14, -6);
    ctx.stroke();
    ctx.fillStyle = '#1c1917';
    ctx.fillRect(-18, -9, 36, 6);
    ctx.fillStyle = '#eab308';
    ctx.fillRect(-3, -9, 6, 6);
    // Faixa vermelha com suástica bem visível no uniforme
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(-17, -29, 16, 14);
    drawSwastikaBadge(ctx, -9, -22, 6);
  } else if (f.bandId === 'psayco') {
    ctx.fillStyle = '#1b4764';
    ctx.fillRect(-18, -10, 36, 7);
    ctx.fillRect(-4, -10, 8, 18);
  } else if (f.bandId === 'julian') {
    ctx.strokeStyle = '#1f2937';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(-10, -26);
    ctx.lineTo(6, -24);
    ctx.stroke();
  } else {
    ctx.fillStyle = shirt;
    ctx.fillRect(-8, -34, 16, 34);
    // Detalhe de uniforme nazista (cinto + faixa vermelha com suástica na roupa!)
    if (f.isNazi || f.visual?.isNazi) {
      ctx.fillStyle = '#1c1917';
      ctx.fillRect(-18, -9, 36, 5);
      ctx.fillStyle = '#9ca3af';
      ctx.fillRect(-3, -9, 6, 5);
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(-16, -28, 15, 13);
      drawSwastikaBadge(ctx, -8.5, -21.5, 5.4);
    }
    // Choker de correntes do Nyx
    if (f.visual?.choker) {
      ctx.fillStyle = '#09090b';
      ctx.fillRect(-10, -38, 20, 5);
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(-6, -37, 3, 3);
      ctx.fillRect(0, -37, 3, 3);
      ctx.fillRect(5, -37, 3, 3);
    }
    if (spikes) {
      ctx.fillStyle = '#e2e8f0';
      for (let i = -15; i <= 15; i += 30) {
        ctx.beginPath();
        ctx.moveTo(i - 4, -34);
        ctx.lineTo(i, -44);
        ctx.lineTo(i + 4, -34);
        ctx.closePath();
        ctx.fill();
      }
    }
  }

  // Instrumentos da banda
  if (f.bandId === 'julian' || f.bandId === 'delleiw') {
    ctx.save();
    const strum = isAttacking ? -0.9 + atkProgress * 2.2 : Math.sin(time * 12) * 0.08;
    ctx.translate(2, -16);
    ctx.rotate(strum - 0.35);
    ctx.fillStyle = f.bandId === 'julian' ? '#18181b' : '#f4f1ea';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(-6, 0, 15, 11, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#78350f';
    ctx.fillRect(6, -3, f.bandId === 'delleiw' ? 38 : 30, 6);
    ctx.strokeRect(6, -3, f.bandId === 'delleiw' ? 38 : 30, 6);
    ctx.restore();
  }

  // === BRAÇO DE ATAQUE & ARMA / MALETA ===
  const isFlamethrower = f.weapon && f.weapon.id === 'flamethrower';
  ctx.save();
  ctx.translate(10, -26);
  let armAngle = 0.25 + walkCycle * 0.3;
  if (isHitlerCrying) {
    armAngle = -2.1 + Math.sin(time * 32 + f.animSeed) * 0.55;
  } else if (f.isPanicked && f.state !== 'ko') {
    armAngle = -2.05 + Math.sin(time * 24 + f.animSeed) * 0.45;
  } else if (isFlamethrower) {
    armAngle = isAttacking ? -0.04 + Math.sin(time * 35) * 0.04 : 0.08;
  } else if (isAttacking) {
    armAngle = -1.3 + Math.sin(atkProgress * Math.PI) * 2.1;
  } else if (f.dashTimer > 0) {
    armAngle = -0.35;
  }
  ctx.rotate(armAngle);

  ctx.fillStyle = f.bandId === 'julian' ? '#d8a586' : jacket;
  ctx.strokeStyle = '#09090b';
  ctx.lineWidth = 2.2;
  ctx.fillRect(-5, -5, 24, 11);
  ctx.strokeRect(-5, -5, 24, 11);

  // Braçadeira vermelha com suástica no braço de todos os nazistas e do Hitler!
  if (f.isNazi || f.isHitler || f.visual?.isNazi) {
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(-1, -5, 11, 11);
    drawSwastikaBadge(ctx, 4.5, 0.5, 4.5);
  }

  ctx.fillStyle = f.visual?.isRatSuit ? '#9ca3af' : skin;
  ctx.beginPath();
  ctx.arc(21, 0, 6.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  if (f.weapon) {
    ctx.save();
    ctx.translate(22, 0);
    ctx.rotate(isFlamethrower ? 0 : isAttacking ? 0.55 : -0.45);
    drawWeaponShape(ctx, f.weapon.id, 1.05);
    ctx.restore();
  } else if (f.visual?.isRatSuit) {
    // Maleta preta cheia de dinheiro sujo!
    ctx.fillStyle = '#27272a';
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 1.6;
    ctx.fillRect(16, -2, 22, 16);
    ctx.strokeRect(16, -2, 22, 16);
    ctx.fillStyle = '#22c55e';
    ctx.font = '800 9px monospace';
    ctx.fillText('$', 24, 10);
  } else if (f.bandId === 'psayco') {
    ctx.fillStyle = '#334155';
    ctx.fillRect(20, -2, 12, 5);
    ctx.fillStyle = '#94a3b8';
    ctx.beginPath();
    ctx.arc(34, 0, 5.5, 0, Math.PI * 2);
    ctx.fill();
  } else if (f.bandId === 'misa') {
    ctx.fillStyle = '#fde68a';
    ctx.fillRect(20, -2, 24, 4);
    ctx.strokeRect(20, -2, 24, 4);
  }
  ctx.restore();

  // === CABEÇA ===
  const headY = -54 + (f.headbang ? Math.sin(time * 16 + f.animSeed) * 4 : 0);
  if (f.bandId && IMAGES[f.bandId]) {
    ctx.save();
    ctx.translate(0, headY);
    const headSize = f.isBoss ? 54 : 46;
    ctx.drawImage(IMAGES[f.bandId], -headSize / 2, -headSize / 2, headSize, headSize);
    ctx.restore();
  } else {
    const expr =
      f.state === 'ko'
        ? 'ko'
        : isHitlerCrying
          ? 'cry'
          : f.hurtTimer > 0
            ? 'hit'
            : f.isPanicked
              ? 'panic'
              : isAttacking
                ? 'shout'
                : 'angry';
    drawPunkHead(ctx, 0, headY, f.isHitler ? 21 : 19, f.visual, 1, expr, time);
  }

  // Arco de golpe
  if (!isFlamethrower && isAttacking && atkProgress > 0.15 && atkProgress < 0.78) {
    ctx.save();
    ctx.strokeStyle = f.weapon ? f.weapon.color : '#facc15';
    ctx.lineWidth = f.weapon ? 7 : 5;
    ctx.globalAlpha = 0.85;
    ctx.beginPath();
    if (f.weapon && f.weapon.spin) {
      ctx.arc(0, -22, 68, 0, Math.PI * 1.75);
    } else {
      ctx.arc(16, -24, f.weapon ? 52 : 34, -1.1, 0.9);
    }
    ctx.stroke();
    ctx.restore();
  }

  ctx.restore(); // tronco

  // Barra de HP de inimigos comuns / ratos
  if (f.isEnemy && !f.isBoss && f.hp < f.maxHp && f.hp > 0) {
    ctx.save();
    ctx.scale(f.facing / s, 1 / s);
    ctx.fillStyle = '#000';
    ctx.fillRect(-24, -112, 48, 7);
    ctx.fillStyle = f.visual?.isRatSuit ? '#facc15' : f.isNazi ? '#f97316' : '#dd0000';
    ctx.fillRect(-23, -111, 46 * (f.hp / f.maxHp), 5);
    ctx.restore();
  }

  // Etiqueta acima de Rato Burocrata
  if (f.visual?.isRatSuit && f.hp > 0) {
    ctx.save();
    ctx.scale(f.facing / s, 1 / s);
    ctx.font = '800 11px "Anton", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#000';
    ctx.fillText('RATO DA PEC', 1, -118);
    ctx.fillStyle = '#facc15';
    ctx.fillText('RATO DA PEC', 0, -119);
    ctx.restore();
  }

  // Nome e status chorando acima do Chefe Hitler no Bunker 77
  if (f.isHitler && f.hp > 0) {
    ctx.save();
    ctx.scale(f.facing / s, 1 / s);
    ctx.font = '900 15px "Anton", sans-serif';
    ctx.textAlign = 'center';
    const label = isHitlerCrying ? '😭 ADOLF HITLER (CHORANDO!) 😭' : '💀 ADOLF HITLER • CHEFE DO BUNKER 💀';
    ctx.fillStyle = '#000';
    ctx.fillText(label, 1, -142);
    ctx.fillStyle = isHitlerCrying ? '#38bdf8' : '#facc15';
    ctx.fillText(label, 0, -143);
    ctx.restore();
  }

  // Nome acima dos integrantes da banda
  if (f.bandId && !f.isPlayer && f.hp > 0) {
    ctx.save();
    ctx.scale(f.facing / s, 1 / s);
    ctx.font = '800 14px "Anton", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#000';
    ctx.fillText(f.name, 1, -135);
    ctx.fillStyle = f.isBoss ? '#facc15' : '#f4f1ea';
    ctx.fillText(f.name, 0, -136);
    ctx.restore();
  }

  ctx.restore();
}

export function drawDrumKit(ctx, x, y, bassEnergy, destroyed = false) {
  ctx.save();
  ctx.translate(x, y);
  if (destroyed) {
    ctx.rotate(0.28);
    ctx.globalAlpha = 0.65;
  }

  const thump = 1 + bassEnergy * 0.14;

  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-64, 15);
  ctx.lineTo(-64, -56);
  ctx.moveTo(64, 15);
  ctx.lineTo(64, -52);
  ctx.stroke();

  ctx.fillStyle = '#facc15';
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(-64, -56, 26, 7, -0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.ellipse(64, -52, 28, 7, 0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#cc0000';
  ctx.fillRect(-40, -34, 28, 22);
  ctx.strokeRect(-40, -34, 28, 22);
  ctx.fillRect(12, -34, 28, 22);
  ctx.strokeRect(12, -34, 28, 22);

  ctx.save();
  ctx.scale(thump, thump);
  ctx.fillStyle = '#18181b';
  ctx.beginPath();
  ctx.arc(0, -2, 34, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 4;
  ctx.stroke();

  ctx.fillStyle = '#f4f1ea';
  ctx.font = '900 26px "Black Ops One", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('77', 0, 0);
  ctx.restore();

  ctx.restore();
}

export function drawVenue(ctx, W, H, stage, audioInfo, time, moshActive, drumsBroken) {
  const pal = stage.palette;
  const bass = audioInfo.bass || 0;

  ctx.fillStyle = pal.wall;
  ctx.fillRect(0, 0, W, 255);

  ctx.strokeStyle = 'rgba(255,255,255,0.035)';
  ctx.lineWidth = 1;
  for (let y = 20; y < 250; y += 26) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }

  ctx.save();
  ctx.fillStyle = '#09090d';
  ctx.strokeStyle = pal.accent;
  ctx.lineWidth = 4;
  ctx.fillRect(W / 2 - 210, 20, 420, 215);
  ctx.strokeRect(W / 2 - 210, 20, 420, 215);
  if (IMAGES.logo) {
    const pulse = 1 + bass * 0.08;
    ctx.translate(W / 2, 128);
    ctx.scale(pulse, pulse);
    ctx.globalAlpha = 0.85 + bass * 0.15;
    ctx.drawImage(IMAGES.logo, -100, -100, 200, 200);
  }
  ctx.restore();

  ctx.save();
  ctx.font = '900 28px "Permanent Marker", cursive';
  ctx.fillStyle = 'rgba(220, 0, 0, 0.38)';
  ctx.rotate(-0.08);
  ctx.fillText('VÁLVULA 77', 58, 118);
  ctx.fillStyle = 'rgba(250, 204, 21, 0.25)';
  ctx.fillText('BLUMENAU UNDERGROUND', 44, 165);
  ctx.restore();

  ctx.save();
  ctx.font = '900 26px "Permanent Marker", cursive';
  ctx.fillStyle = 'rgba(220, 0, 0, 0.34)';
  ctx.translate(W - 290, 125);
  ctx.rotate(0.06);
  ctx.fillText('@VALVULA77', 0, 0);
  ctx.fillStyle = 'rgba(34, 197, 94, 0.26)';
  ctx.fillText('MOSH DE ARMA BRANCA', -35, 42);
  ctx.restore();

  const drawAmpStack = (ax, ay) => {
    const bump = bass * 8;
    ctx.save();
    ctx.translate(ax, ay);
    ctx.fillStyle = '#111116';
    ctx.strokeStyle = '#3f3f46';
    ctx.lineWidth = 3;
    ctx.fillRect(-54, -120, 108, 120);
    ctx.strokeRect(-54, -120, 108, 120);
    const spPos = [[-24, -88], [24, -88], [-24, -32], [24, -32]];
    for (const [sx, sy] of spPos) {
      ctx.fillStyle = '#1e1e26';
      ctx.beginPath();
      ctx.arc(sx, sy, 21 + bump * 0.25, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#09090b';
      ctx.beginPath();
      ctx.arc(sx, sy, 9 + bump * 0.2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#27272a';
    ctx.fillRect(-52, -148, 104, 26);
    ctx.strokeRect(-52, -148, 104, 26);
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(34, -138, 8, 8);
    ctx.restore();
  };

  drawAmpStack(145, 258);
  drawAmpStack(W - 145, 258);

  const stageGrad = ctx.createLinearGradient(0, 250, 0, 365);
  stageGrad.addColorStop(0, '#1e1414');
  stageGrad.addColorStop(1, pal.stage);
  ctx.fillStyle = stageGrad;
  ctx.fillRect(0, 250, W, 112);

  ctx.strokeStyle = 'rgba(0,0,0,0.38)';
  ctx.lineWidth = 2;
  for (let y = 268; y < 360; y += 22) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }

  drawDrumKit(ctx, W / 2 + 15, 296, bass, drumsBroken);

  ctx.fillStyle = '#0a0a0e';
  ctx.fillRect(0, 360, W, 24);
  ctx.fillStyle = moshActive ? '#ff0000' : pal.accent;
  for (let x = 0; x < W; x += 48) {
    ctx.fillRect(x, 362, 24, 6);
  }

  for (const sx of [55, W - 125]) {
    ctx.fillStyle = '#272730';
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 2;
    ctx.fillRect(sx, 355, 70, 36);
    ctx.strokeRect(sx, 355, 70, 36);
    ctx.fillStyle = '#facc15';
    ctx.font = '800 11px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('▲ PALCO ▲', sx + 35, 377);
  }

  for (const mx of [320, W / 2, W - 320]) {
    ctx.fillStyle = '#18181f';
    ctx.strokeStyle = '#3f3f4a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(mx - 28, 362);
    ctx.lineTo(mx - 20, 344);
    ctx.lineTo(mx + 20, 344);
    ctx.lineTo(mx + 28, 362);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  const floorGrad = ctx.createLinearGradient(0, 384, 0, H);
  floorGrad.addColorStop(0, '#131010');
  floorGrad.addColorStop(0.5, pal.floor);
  floorGrad.addColorStop(1, '#09090d');
  ctx.fillStyle = floorGrad;
  ctx.fillRect(0, 384, W, H - 384);

  ctx.save();
  ctx.translate(W / 2, 545);
  ctx.strokeStyle = moshActive
    ? `rgba(255, 0, 0, ${0.48 + bass * 0.45})`
    : 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = moshActive ? 6 : 3;
  ctx.setLineDash([20, 14]);
  ctx.beginPath();
  ctx.ellipse(0, 0, 330 + bass * 25, 108 + bass * 10, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();

  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  const beamSwing = Math.sin(time * (moshActive ? 5.2 : 1.8)) * 180;
  const beamAlpha = moshActive ? 0.22 + bass * 0.22 : 0.09 + bass * 0.08;

  const drawBeam = (ox, tx, color) => {
    const g = ctx.createLinearGradient(ox, 0, tx, H * 0.8);
    g.addColorStop(0, color);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.globalAlpha = beamAlpha;
    ctx.beginPath();
    ctx.moveTo(ox - 18, 0);
    ctx.lineTo(ox + 18, 0);
    ctx.lineTo(tx + 135, H * 0.85);
    ctx.lineTo(tx - 135, H * 0.85);
    ctx.closePath();
    ctx.fill();
  };

  drawBeam(220, W * 0.35 + beamSwing, pal.spot1);
  drawBeam(W - 220, W * 0.65 - beamSwing, pal.spot2);
  if (moshActive && audioInfo.peak) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.09)';
    ctx.fillRect(0, 0, W, H);
  }
  ctx.restore();
}

// Desenha a Sala Secreta do Easter Egg (Bunker V77: meia-luz atmosférica com visibilidade clara!)
export function drawSecretRoomVenue(ctx, W, H, time, audioInfo) {
  const bass = audioInfo.bass || 0;

  const wallGrad = ctx.createLinearGradient(0, 0, 0, 240);
  wallGrad.addColorStop(0, '#121017');
  wallGrad.addColorStop(1, '#231d27');
  ctx.fillStyle = wallGrad;
  ctx.fillRect(0, 0, W, 240);

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
  ctx.lineWidth = 1.5;
  for (let y = 28; y < 240; y += 34) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }
  ctx.fillStyle = '#2d2424';
  ctx.fillRect(0, 42, W, 12);
  ctx.strokeStyle = '#09090b';
  ctx.strokeRect(0, 42, W, 12);

  for (const dx of [150, W - 150]) {
    ctx.save();
    ctx.translate(dx, 240);
    ctx.fillStyle = '#1b1b22';
    ctx.strokeStyle = '#3f3f46';
    ctx.lineWidth = 3;
    ctx.fillRect(-52, -138, 104, 138);
    ctx.strokeRect(-52, -138, 104, 138);
    ctx.fillStyle = '#09090b';
    ctx.fillRect(-30, -118, 60, 34);
    ctx.strokeStyle = '#52525b';
    ctx.lineWidth = 2;
    for (let gx = -20; gx <= 20; gx += 10) {
      ctx.beginPath();
      ctx.moveTo(gx, -118);
      ctx.lineTo(gx, -84);
      ctx.stroke();
    }
    const blink = 0.55 + Math.sin(time * 9 + dx) * 0.35;
    ctx.fillStyle = `rgba(239, 68, 68, ${blink})`;
    ctx.beginPath();
    ctx.arc(0, -152, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  ctx.save();
  ctx.textAlign = 'center';
  ctx.font = '900 34px "Permanent Marker", cursive';
  ctx.fillStyle = 'rgba(250, 204, 21, 0.42)';
  ctx.fillText('CAPACETE DE NAZISTA É MARTELO!', W / 2, 112);
  ctx.font = '900 24px "Permanent Marker", cursive';
  ctx.fillStyle = 'rgba(239, 68, 68, 0.48)';
  ctx.fillText('SALA SECRETA • BUNKER 77', W / 2, 152);
  if (IMAGES.logo) {
    ctx.globalAlpha = 0.26 + bass * 0.14;
    ctx.drawImage(IMAGES.logo, W / 2 - 48, 158, 96, 78);
  }
  ctx.restore();

  ctx.fillStyle = '#0c0a0f';
  ctx.fillRect(0, 236, W, 10);
  ctx.fillStyle = '#f97316';
  for (let x = 0; x < W; x += 56) {
    ctx.fillRect(x, 238, 28, 5);
  }

  const floorGrad = ctx.createLinearGradient(0, 246, 0, H);
  floorGrad.addColorStop(0, '#231e28');
  floorGrad.addColorStop(0.5, '#28222d');
  floorGrad.addColorStop(1, '#1a161f');
  ctx.fillStyle = floorGrad;
  ctx.fillRect(0, 246, W, H - 246);

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
  ctx.lineWidth = 1.5;
  for (let y = 290; y < H; y += 64) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }
  for (let x = 120; x < W; x += 160) {
    ctx.beginPath();
    ctx.moveTo(x, 246);
    ctx.lineTo(x + (x - W / 2) * 0.25, H);
    ctx.stroke();
  }

  ctx.save();
  ctx.translate(W / 2, 478);
  ctx.strokeStyle = `rgba(249, 115, 22, ${0.26 + bass * 0.25})`;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.ellipse(0, 0, 245 + bass * 18, 92 + bass * 8, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.font = '900 96px "Black Ops One", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = `rgba(250, 204, 21, ${0.14 + bass * 0.14})`;
  ctx.fillText('77', 0, 6);
  ctx.restore();

  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  const lampXs = [290, W / 2, W - 290];
  lampXs.forEach((lx, idx) => {
    const sway = Math.sin(time * 2.3 + idx * 1.4) * 28;
    const cone = ctx.createRadialGradient(lx + sway, 380, 20, lx + sway, 460, 340);
    cone.addColorStop(0, idx === 1 ? 'rgba(250, 204, 21, 0.20)' : 'rgba(249, 115, 22, 0.17)');
    cone.addColorStop(0.6, 'rgba(225, 29, 72, 0.07)');
    cone.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = cone;
    ctx.fillRect(0, 120, W, H - 120);
  });
  ctx.restore();

  lampXs.forEach((lx, idx) => {
    const sway = Math.sin(time * 2.3 + idx * 1.4) * 10;
    ctx.strokeStyle = '#52525b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(lx, 0);
    ctx.lineTo(lx + sway, 58);
    ctx.stroke();
    ctx.fillStyle = '#27272a';
    ctx.beginPath();
    ctx.moveTo(lx + sway - 18, 66);
    ctx.lineTo(lx + sway + 18, 66);
    ctx.lineTo(lx + sway + 8, 54);
    ctx.lineTo(lx + sway - 8, 54);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(lx + sway, 68, 5, 0, Math.PI * 2);
    ctx.fill();
  });

  const vig = ctx.createRadialGradient(W / 2, H * 0.54, W * 0.34, W / 2, H * 0.54, W * 0.72);
  vig.addColorStop(0, 'rgba(0, 0, 0, 0)');
  vig.addColorStop(1, 'rgba(0, 0, 0, 0.42)');
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, W, H);
}
