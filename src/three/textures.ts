import * as THREE from 'three';

export interface MonitorTextureHandle {
  texture: THREE.CanvasTexture;
  updateCursor: (visible: boolean) => void;
}

export function createWoodDeskTextures(maxAnisotropy: number): {
  map: THREE.CanvasTexture;
  roughnessMap: THREE.CanvasTexture;
} {
  const width = 512;
  const height = 512;

  const colorCanvas = document.createElement('canvas');
  colorCanvas.width = width;
  colorCanvas.height = height;
  const cCtx = colorCanvas.getContext('2d')!;

  const roughCanvas = document.createElement('canvas');
  roughCanvas.width = width;
  roughCanvas.height = height;
  const rCtx = roughCanvas.getContext('2d')!;

  // Rich dark smoked walnut / espresso base
  cCtx.fillStyle = '#1b161b';
  cCtx.fillRect(0, 0, width, height);

  rCtx.fillStyle = '#787878';
  rCtx.fillRect(0, 0, width, height);

  // Subtle plank bands & longitudinal wood grain streaks
  for (let y = 0; y < height; y += 2) {
    const wave = Math.sin(y * 0.045) * 0.5 + Math.cos(y * 0.13) * 0.5;
    const tone = Math.floor(24 + wave * 9 + (Math.random() - 0.5) * 5);
    cCtx.fillStyle = `rgb(${tone + 6}, ${tone}, ${tone + 5})`;
    cCtx.fillRect(0, y, width, 2);

    const roughVal = Math.floor(110 + wave * 28 + (Math.random() - 0.5) * 16);
    rCtx.fillStyle = `rgb(${roughVal}, ${roughVal}, ${roughVal})`;
    rCtx.fillRect(0, y, width, 2);
  }

  // Fine organic wood fibers
  for (let i = 0; i < 420; i++) {
    const y = Math.random() * height;
    const x = Math.random() * width;
    const len = 40 + Math.random() * 190;
    const alpha = 0.05 + Math.random() * 0.1;
    cCtx.fillStyle = Math.random() > 0.45 ? `rgba(58, 42, 48, ${alpha})` : `rgba(12, 9, 14, ${alpha})`;
    cCtx.fillRect(x, y, len, 1 + Math.random() * 1.4);

    const rShade = Math.random() > 0.5 ? 'rgba(165,165,165,0.12)' : 'rgba(70,70,70,0.12)';
    rCtx.fillStyle = rShade;
    rCtx.fillRect(x, y, len, 1.2);
  }

  // Subtle plank seams
  for (let p = 1; p < 4; p++) {
    const py = Math.floor((height / 4) * p);
    cCtx.fillStyle = 'rgba(8, 6, 10, 0.45)';
    cCtx.fillRect(0, py, width, 2);
    rCtx.fillStyle = 'rgba(200, 200, 200, 0.3)';
    rCtx.fillRect(0, py, width, 2);
  }

  const map = new THREE.CanvasTexture(colorCanvas);
  map.colorSpace = THREE.SRGBColorSpace;
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(2, 1);
  map.anisotropy = maxAnisotropy;

  const roughnessMap = new THREE.CanvasTexture(roughCanvas);
  roughnessMap.wrapS = THREE.RepeatWrapping;
  roughnessMap.wrapT = THREE.RepeatWrapping;
  roughnessMap.repeat.set(2, 1);
  roughnessMap.anisotropy = maxAnisotropy;

  return { map, roughnessMap };
}

export function createDeskMatTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const width = 512;
  const height = 256;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#0f101a';
  ctx.fillRect(0, 0, width, height);

  // Fine cloth micro-weave
  ctx.fillStyle = 'rgba(168, 85, 247, 0.03)';
  for (let y = 0; y < height; y += 4) {
    ctx.fillRect(0, y, width, 1);
  }
  for (let x = 0; x < width; x += 4) {
    ctx.fillRect(x, 0, 1, height);
  }

  // Subtle geometric topo / accent line motif on desk mat
  ctx.strokeStyle = 'rgba(139, 92, 246, 0.14)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(24, height - 28);
  ctx.bezierCurveTo(140, height - 76, 220, height - 18, 350, height - 62);
  ctx.stroke();

  // Stitched purple-tinted edge border
  ctx.strokeStyle = 'rgba(139, 92, 246, 0.42)';
  ctx.lineWidth = 3;
  ctx.setLineDash([6, 4]);
  ctx.strokeRect(6, 6, width - 12, height - 12);
  ctx.setLineDash([]);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAnisotropy;
  return tex;
}

export function createMonitorEditorTexture(maxAnisotropy: number): MonitorTextureHandle {
  const width = 1024;
  const height = 512;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // Editor palette
  const bgMain = '#0b0e19';
  const bgSidebar = '#0e1120';
  const bgActivity = '#090b15';
  const bgTabActive = '#13172a';
  const bgTerminal = '#080a13';
  const borderCol = '#1f2540';

  // Background fill
  ctx.fillStyle = bgMain;
  ctx.fillRect(0, 0, width, height);

  // Top Title Bar
  ctx.fillStyle = '#090b14';
  ctx.fillRect(0, 0, width, 30);
  ctx.fillStyle = borderCol;
  ctx.fillRect(0, 30, width, 1);

  // Window control dots
  const dotColors = ['#ef4444', '#f59e0b', '#10b981'];
  dotColors.forEach((col, i) => {
    ctx.beginPath();
    ctx.arc(18 + i * 16, 15, 4.5, 0, Math.PI * 2);
    ctx.fillStyle = col;
    ctx.fill();
  });

  // Search / Command bar in title bar
  ctx.fillStyle = '#14182b';
  ctx.beginPath();
  ctx.roundRect(width / 2 - 140, 6, 280, 18, 5);
  ctx.fill();
  ctx.strokeStyle = '#262d4d';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = '#9ca3c9';
  ctx.font = '11px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('tharvesh-portfolio — Workstation.tsx', width / 2, 19);
  ctx.textAlign = 'left';

  // Activity Bar (far left)
  const actW = 42;
  ctx.fillStyle = bgActivity;
  ctx.fillRect(0, 31, actW, height - 31);
  ctx.fillStyle = borderCol;
  ctx.fillRect(actW, 31, 1, height - 31);

  // Activity icons (simple crisp vector primitives)
  ctx.strokeStyle = '#c084fc';
  ctx.lineWidth = 1.8;
  ctx.strokeRect(12, 48, 16, 18);
  ctx.fillStyle = '#a855f7';
  ctx.fillRect(0, 44, 2.5, 26);

  ctx.strokeStyle = '#576085';
  ctx.beginPath();
  ctx.arc(19, 96, 7, 0, Math.PI * 2);
  ctx.moveTo(24, 101);
  ctx.lineTo(29, 106);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(16, 136, 3, 0, Math.PI * 2);
  ctx.arc(25, 145, 3, 0, Math.PI * 2);
  ctx.moveTo(18, 138);
  ctx.lineTo(23, 143);
  ctx.stroke();

  // File Explorer Sidebar
  const sideX = actW + 1;
  const sideW = 188;
  ctx.fillStyle = bgSidebar;
  ctx.fillRect(sideX, 31, sideW, height - 31);
  ctx.fillStyle = borderCol;
  ctx.fillRect(sideX + sideW, 31, 1, height - 31);

  ctx.fillStyle = '#7982a9';
  ctx.font = '600 10px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('EXPLORER', sideX + 14, 52);

  const treeItems = [
    { label: '▾  THARVESH-3D', indent: 0, color: '#cbd5f5', active: false },
    { label: '▾  src', indent: 1, color: '#94a3b8', active: false },
    { label: '▸  components', indent: 2, color: '#94a3b8', active: false },
    { label: '▾  three', indent: 2, color: '#cbd5f5', active: false },
    { label: 'TS Workstation.tsx', indent: 3, color: '#e9d5ff', active: true },
    { label: 'TS starfield.ts', indent: 3, color: '#94a3b8', active: false },
    { label: 'TS textures.ts', indent: 3, color: '#94a3b8', active: false },
    { label: 'GL glow.frag', indent: 3, color: '#67e8f9', active: false },
    { label: '▸  data', indent: 2, color: '#94a3b8', active: false },
    { label: '{} package.json', indent: 1, color: '#94a3b8', active: false },
    { label: '{} tsconfig.json', indent: 1, color: '#94a3b8', active: false },
  ];

  treeItems.forEach((item, idx) => {
    const iy = 72 + idx * 22;
    if (item.active) {
      ctx.fillStyle = 'rgba(168, 85, 247, 0.16)';
      ctx.fillRect(sideX, iy - 14, sideW, 20);
      ctx.fillStyle = '#a855f7';
      ctx.fillRect(sideX, iy - 14, 2.5, 20);
    }
    ctx.fillStyle = item.color;
    ctx.font = '11.5px "JetBrains Mono", monospace';
    ctx.fillText(item.label, sideX + 12 + item.indent * 12, iy);
  });

  // Editor Tabs Bar
  const edX = sideX + sideW + 1;
  const edW = width - edX;
  ctx.fillStyle = '#090b15';
  ctx.fillRect(edX, 31, edW, 30);
  ctx.fillStyle = borderCol;
  ctx.fillRect(edX, 61, edW, 1);

  // Active tab
  ctx.fillStyle = bgTabActive;
  ctx.fillRect(edX, 31, 172, 30);
  ctx.fillStyle = '#a855f7';
  ctx.fillRect(edX, 31, 172, 2);
  ctx.fillStyle = '#f3e8ff';
  ctx.font = '11.5px "JetBrains Mono", monospace';
  ctx.fillText('TS  Workstation.tsx', edX + 16, 50);

  // Inactive tab
  ctx.fillStyle = '#6c759d';
  ctx.fillText('GL  starfield.glsl', edX + 188, 50);
  ctx.fillText('TS  socialLinks.ts', edX + 340, 50);

  // Code Area
  const codeTop = 74;
  const lineH = 19;
  const termTop = 362;

  // Active line highlight
  const activeLineIdx = 9;
  ctx.fillStyle = 'rgba(139, 92, 246, 0.08)';
  ctx.fillRect(edX, codeTop + activeLineIdx * lineH - 13, edW - 64, lineH);

  // Syntax-highlighted code lines (token arrays)
  type Tok = [string, string];
  const lines: Tok[][] = [
    [
      ['import ', '#c084fc'],
      ['* as THREE ', '#e2e8f0'],
      ['from ', '#c084fc'],
      ["'three'", '#6ee7b7'],
      [';', '#64748b'],
    ],
    [
      ['import ', '#c084fc'],
      ['{ UnrealBloomPass } ', '#67e8f9'],
      ['from ', '#c084fc'],
      ["'three/addons/postprocessing'", '#6ee7b7'],
      [';', '#64748b'],
    ],
    [],
    [
      ['export function ', '#c084fc'],
      ['createDeveloperRig', '#60a5fa'],
      ['(', '#cbd5e1'],
      ['scene', '#f9a8d4'],
      [': THREE.Scene) {', '#cbd5e1'],
    ],
    [
      ['  const ', '#c084fc'],
      ['workstation ', '#e2e8f0'],
      ['= ', '#38bdf8'],
      ['new ', '#c084fc'],
      ['THREE.Group();', '#67e8f9'],
    ],
    [
      ['  const ', '#c084fc'],
      ['rgbAccent ', '#e2e8f0'],
      ['= ', '#38bdf8'],
      ['new ', '#c084fc'],
      ['THREE.Color(', '#67e8f9'],
      ['0xa855f7', '#fbbf24'],
      [');', '#cbd5e1'],
    ],
    [
      ['  const ', '#c084fc'],
      ['bloom ', '#e2e8f0'],
      ['= ', '#38bdf8'],
      ['new ', '#c084fc'],
      ['UnrealBloomPass(res, ', '#67e8f9'],
      ['0.55', '#fbbf24'],
      [', ', '#cbd5e1'],
      ['0.42', '#fbbf24'],
      [', ', '#cbd5e1'],
      ['0.78', '#fbbf24'],
      [');', '#cbd5e1'],
    ],
    [],
    [
      ['  // Digitalize sparking ideas into 3D space', '#64748b'],
    ],
    [
      ['  workstation.', '#e2e8f0'],
      ['animateFans', '#60a5fa'],
      ['((fan, dt) => fan.rotation.z += dt * ', '#cbd5e1'],
      ['3.2', '#fbbf24'],
      [');', '#cbd5e1'],
    ],
    [
      ['  workstation.', '#e2e8f0'],
      ['pulseKeycaps', '#60a5fa'],
      ['(rgbAccent, ', '#cbd5e1'],
      ['0x22d3ee', '#fbbf24'],
      [');', '#cbd5e1'],
    ],
    [],
    [
      ['  scene.', '#e2e8f0'],
      ['add', '#60a5fa'],
      ['(workstation);', '#cbd5e1'],
    ],
    [
      ['  return ', '#c084fc'],
      ['{ workstation, bloom };', '#e2e8f0'],
    ],
    [['}', '#cbd5e1']],
  ];

  ctx.font = '12.5px "JetBrains Mono", monospace';
  let cursorEndX = edX + 54;
  let cursorEndY = codeTop + activeLineIdx * lineH;

  lines.forEach((tokens, idx) => {
    const ly = codeTop + idx * lineH;
    if (ly > termTop - 16) return;

    // Line number
    ctx.fillStyle = idx === activeLineIdx ? '#c084fc' : '#475073';
    ctx.textAlign = 'right';
    ctx.fillText(String(idx + 1), edX + 34, ly);
    ctx.textAlign = 'left';

    let cx = edX + 48;
    tokens.forEach(([text, color]) => {
      ctx.fillStyle = color;
      ctx.fillText(text, cx, ly);
      cx += ctx.measureText(text).width;
    });

    if (idx === activeLineIdx) {
      cursorEndX = cx + 2;
      cursorEndY = ly;
    }
  });

  // Minimap on right edge of editor
  const miniX = width - 66;
  ctx.fillStyle = 'rgba(255,255,255,0.02)';
  ctx.fillRect(miniX, 62, 66, termTop - 62);
  for (let m = 0; m < 26; m++) {
    const my = 72 + m * 8;
    const mw = 14 + ((m * 17) % 36);
    ctx.fillStyle = m % 4 === 0 ? 'rgba(168,85,247,0.4)' : m % 3 === 0 ? 'rgba(56,189,248,0.32)' : 'rgba(148,163,184,0.22)';
    ctx.fillRect(miniX + 8, my, mw, 3);
  }

  // Bottom Terminal Section
  ctx.fillStyle = bgTerminal;
  ctx.fillRect(edX, termTop, edW, height - termTop);
  ctx.fillStyle = borderCol;
  ctx.fillRect(edX, termTop, edW, 1);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '600 10.5px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('TERMINAL', edX + 16, termTop + 20);
  ctx.fillStyle = '#525b82';
  ctx.fillText('PROBLEMS  0', edX + 94, termTop + 20);
  ctx.fillText('OUTPUT', edX + 186, termTop + 20);

  ctx.fillStyle = '#a855f7';
  ctx.fillRect(edX + 16, termTop + 25, 52, 1.5);

  ctx.font = '12px "JetBrains Mono", monospace';
  ctx.fillStyle = '#a855f7';
  ctx.fillText('➜  tharvesh-portfolio', edX + 16, termTop + 50);
  ctx.fillStyle = '#67e8f9';
  ctx.fillText('git:(main)', edX + 178, termTop + 50);
  ctx.fillStyle = '#e2e8f0';
  ctx.fillText('npm run dev', edX + 266, termTop + 50);

  ctx.fillStyle = '#34d399';
  ctx.fillText('VITE v8.3.0', edX + 16, termTop + 73);
  ctx.fillStyle = '#94a3b8';
  ctx.fillText('ready in 138 ms  —  Three.js WebGL2 Studio Active', edX + 108, termTop + 73);

  ctx.fillStyle = '#c084fc';
  ctx.fillText('✓', edX + 16, termTop + 96);
  ctx.fillStyle = '#cbd5e1';
  ctx.fillText('Digitalizing sparking ideas at 60 FPS', edX + 34, termTop + 96);

  // Subtle status bar at very bottom
  ctx.fillStyle = '#181130';
  ctx.fillRect(0, height - 22, width, 22);
  ctx.fillStyle = '#c084fc';
  ctx.font = '10.5px "JetBrains Mono", monospace';
  ctx.fillText('main*', 14, height - 7);
  ctx.fillStyle = '#94a3b8';
  ctx.fillText('TypeScript React   ·   UTF-8   ·   Ln 10, Col 58', width - 310, height - 7);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = maxAnisotropy;

  let lastCursorState: boolean | null = null;
  const updateCursor = (visible: boolean) => {
    if (visible === lastCursorState) return;
    lastCursorState = visible;
    ctx.fillStyle = visible ? '#c084fc' : '#13172b';
    ctx.fillRect(cursorEndX, cursorEndY - 11, 7, 14);
    texture.needsUpdate = true;
  };

  updateCursor(true);

  return { texture, updateCursor };
}

export function createContactShadowTexture(): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, 'rgba(3, 2, 10, 0.85)');
  grad.addColorStop(0.5, 'rgba(5, 4, 15, 0.45)');
  grad.addColorStop(1, 'rgba(5, 4, 15, 0)');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
