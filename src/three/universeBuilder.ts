import * as THREE from 'three';
import { SOCIAL_LINKS, type SocialIconId, type SocialLinkItem } from '../data/socialLinks';
import {
  createEnergyCoreMaterial,
  createFresnelGlassMaterial,
  createNebulaBackdropMaterial,
  createVolumetricBeamMaterial,
} from './shaders';

export interface CrystalBadgeNode {
  index: number;
  link: SocialLinkItem;
  group: THREE.Group;
  hitProxy: THREE.Mesh;
  crystalMat: THREE.ShaderMaterial;
  wireMat: THREE.LineBasicMaterial;
  basePos: THREE.Vector3;
  hoverAmount: number;
  phase: number;
}

export interface UniverseRig {
  group: THREE.Group;
  crystalBadges: CrystalBadgeNode[];
  hitProxies: THREE.Mesh[];
  update: (
    elapsed: number,
    delta: number,
    scrollProgress: number,
    hoveredIdx: number | null,
    pointerNdc: THREE.Vector2,
    reducedMotion: boolean
  ) => void;
  dispose: () => void;
}

function drawGlyphOnCanvas(ctx: CanvasRenderingContext2D, icon: SocialIconId, color: string) {
  ctx.save();
  ctx.translate(64, 64);
  ctx.scale(2.4, 2.4);
  ctx.translate(-12, -12);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 2.1;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  switch (icon) {
    case 'instagram': {
      ctx.beginPath();
      ctx.roundRect(3.2, 3.2, 17.6, 17.6, 5);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(12, 12, 4, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(17.3, 6.7, 1.25, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'youtube': {
      ctx.beginPath();
      ctx.roundRect(2.5, 5.2, 19, 13.6, 4);
      ctx.fill();
      ctx.fillStyle = '#070814';
      ctx.beginPath();
      ctx.moveTo(10, 8.8);
      ctx.lineTo(15.6, 12);
      ctx.lineTo(10, 15.2);
      ctx.closePath();
      ctx.fill();
      break;
    }
    case 'linkedin': {
      ctx.beginPath();
      ctx.roundRect(2.8, 2.8, 18.4, 18.4, 3.5);
      ctx.fill();
      ctx.fillStyle = '#070814';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('in', 12, 12.6);
      break;
    }
    case 'devto': {
      ctx.beginPath();
      ctx.roundRect(2.4, 4.8, 19.2, 14.4, 2.8);
      ctx.fill();
      ctx.fillStyle = '#070814';
      ctx.font = 'bold 7.6px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('DEV', 12, 12.4);
      break;
    }
    case 'medium': {
      ctx.beginPath();
      ctx.arc(6.6, 12, 4.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(14.5, 12, 2.3, 4.0, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(19.3, 12, 1.0, 3.4, 0, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'buymeacoffee': {
      ctx.beginPath();
      ctx.moveTo(6.4, 8.5);
      ctx.lineTo(16.2, 8.5);
      ctx.lineTo(15.2, 18.5);
      ctx.lineTo(7.4, 18.5);
      ctx.closePath();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(5.4, 8.5);
      ctx.lineTo(17.2, 8.5);
      ctx.moveTo(7.5, 6);
      ctx.lineTo(15, 6);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(16.5, 12.2, 2.2, -Math.PI / 2, Math.PI / 2);
      ctx.stroke();
      break;
    }
    case 'topmate': {
      ctx.beginPath();
      ctx.arc(12, 12, 8.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#070814';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('T', 12, 12.5);
      break;
    }
    case 'github': {
      ctx.beginPath();
      ctx.arc(12, 12, 8.5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.font = 'bold 7.2px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('</>', 12, 12.4);
      break;
    }
    case 'portfolio': {
      ctx.beginPath();
      ctx.arc(12, 12, 8.2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(12, 12, 3.8, 8.2, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(4.2, 9.5);
      ctx.lineTo(19.8, 9.5);
      ctx.moveTo(4.2, 14.5);
      ctx.lineTo(19.8, 14.5);
      ctx.stroke();
      break;
    }
    case 'devs': {
      ctx.beginPath();
      ctx.moveTo(8.5, 7.5);
      ctx.lineTo(4, 12);
      ctx.lineTo(8.5, 16.5);
      ctx.moveTo(15.5, 7.5);
      ctx.lineTo(20, 12);
      ctx.lineTo(15.5, 16.5);
      ctx.moveTo(13.5, 6.2);
      ctx.lineTo(10.5, 17.8);
      ctx.stroke();
      break;
    }
    case 'mail': {
      ctx.beginPath();
      ctx.roundRect(3.4, 5.6, 17.2, 12.8, 2.2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(4.4, 7.0);
      ctx.lineTo(12, 12.6);
      ctx.lineTo(19.6, 7.0);
      ctx.stroke();
      break;
    }
  }
  ctx.restore();
}

function createCrystalEmblemTexture(link: SocialLinkItem, maxAnisotropy: number): THREE.CanvasTexture {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.clearRect(0, 0, size, size);

  // Subtle dark crystal core disc
  const grad = ctx.createRadialGradient(64, 64, 8, 64, 64, 58);
  grad.addColorStop(0, 'rgba(24, 18, 48, 0.94)');
  grad.addColorStop(0.82, 'rgba(13, 12, 28, 0.88)');
  grad.addColorStop(1, 'rgba(168, 85, 247, 0.0)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(64, 64, 58, 0, Math.PI * 2);
  ctx.fill();

  // Crisp luminous icon glyph
  const glyphColor =
    link.icon === 'instagram'
      ? '#f472b6'
      : link.icon === 'youtube'
        ? '#f87171'
        : link.icon === 'linkedin'
          ? '#60a5fa'
          : link.icon === 'buymeacoffee'
            ? '#fbbf24'
            : link.icon === 'topmate'
              ? '#fb7185'
              : link.icon === 'devs' || link.icon === 'portfolio'
                ? '#67e8f9'
                : '#f5f3ff';

  drawGlyphOnCanvas(ctx, link.icon, glyphColor);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAnisotropy;
  return tex;
}

export function createUniverseEnvironment(
  maxAnisotropy: number,
  isMobile: boolean
): UniverseRig {
  const group = new THREE.Group();
  const disposables: { dispose: () => void }[] = [];
  const track = <T extends { dispose: () => void }>(item: T): T => {
    disposables.push(item);
    return item;
  };

  // =========================================================================
  // 1. COSMIC NEBULA SKY SPHERE
  // =========================================================================
  const skyGeo = track(new THREE.SphereGeometry(65, 32, 24));
  const skyMat = track(createNebulaBackdropMaterial());
  const skyMesh = new THREE.Mesh(skyGeo, skyMat);
  group.add(skyMesh);

  // =========================================================================
  // 2. FLOATING ARCHITECTURAL GLASS MONOLITHS & THRESHOLD RING (Z = +12 to -30)
  // =========================================================================
  const monolithGlassMat = track(
    createFresnelGlassMaterial({
      baseColor: 0x090b18,
      fresnelColor: 0x9333ea,
      accentColor: 0x22d3ee,
      opacity: 0.72,
    })
  );
  const darkObeliskMat = track(
    new THREE.MeshStandardMaterial({
      color: 0x0c0e1a,
      roughness: 0.25,
      metalness: 0.85,
    })
  );

  // Threshold Portal Ring at Experience 01 -> 02 transition (z = 9.2)
  const portalGroup = new THREE.Group();
  portalGroup.position.set(0, 0.85, 8.8);
  const portalOuterGeo = track(new THREE.TorusGeometry(3.2, 0.032, 16, 72));
  const portalOuter = new THREE.Mesh(portalOuterGeo, darkObeliskMat);
  portalGroup.add(portalOuter);

  const portalGlassGeo = track(new THREE.TorusGeometry(3.05, 0.065, 12, 72));
  const portalGlass = new THREE.Mesh(portalGlassGeo, monolithGlassMat);
  portalGroup.add(portalGlass);
  group.add(portalGroup);

  // Floating glass architectural slabs flanking the spatial corridor
  interface FloatingShard {
    mesh: THREE.Mesh;
    baseY: number;
    phase: number;
    rotSpeed: number;
  }
  const shards: FloatingShard[] = [];
  const slabGeo = track(new THREE.BoxGeometry(0.95, 3.2, 0.14));
  const smallCrystalGeo = track(new THREE.OctahedronGeometry(0.45, 0));

  const slabConfigs = [
    { x: -4.4, y: 1.4, z: 11.2, ry: 0.35, rz: 0.08 },
    { x: 4.5, y: 0.8, z: 9.8, ry: -0.4, rz: -0.06 },
    { x: -5.2, y: 1.1, z: 2.2, ry: 0.28, rz: 0.05 },
    { x: 5.4, y: 1.3, z: 1.5, ry: -0.32, rz: -0.09 },
    { x: -5.8, y: 0.6, z: -9.5, ry: 0.42, rz: 0.04 },
    { x: 5.8, y: 0.9, z: -10.2, ry: -0.38, rz: -0.05 },
    { x: -4.8, y: 0.7, z: -23.5, ry: 0.35, rz: 0.07 },
    { x: 4.8, y: 0.9, z: -24.2, ry: -0.35, rz: -0.07 },
  ];

  slabConfigs.forEach((cfg, i) => {
    const m = new THREE.Mesh(slabGeo, i % 2 === 0 ? monolithGlassMat : darkObeliskMat);
    m.position.set(cfg.x, cfg.y, cfg.z);
    m.rotation.set(0, cfg.ry, cfg.rz);
    group.add(m);
    shards.push({ mesh: m, baseY: cfg.y, phase: i * 0.9, rotSpeed: 0.08 });
  });

  // Translucent floating crystal accents around corridor
  for (let i = 0; i < 10; i++) {
    const c = new THREE.Mesh(smallCrystalGeo, monolithGlassMat);
    const side = i % 2 === 0 ? -1 : 1;
    const bx = side * (2.9 + (i % 3) * 1.1);
    const by = -0.6 + ((i * 0.7) % 2.8);
    const bz = 13.0 - i * 4.1;
    c.position.set(bx, by, bz);
    c.scale.setScalar(0.55 + (i % 3) * 0.25);
    group.add(c);
    shards.push({ mesh: c, baseY: by, phase: i * 1.15, rotSpeed: 0.32 });
  }

  // Subtle Volumetric Light Cones at Landmarks
  const beamVioletMat = track(createVolumetricBeamMaterial(0x9333ea, 0.09));
  const beamCyanMat = track(createVolumetricBeamMaterial(0x22d3ee, 0.06));
  const beamGeo = track(new THREE.CylinderGeometry(0.45, 3.4, 11, 24, 1, true));

  const deskBeam = new THREE.Mesh(beamGeo, beamVioletMat);
  deskBeam.position.set(-0.2, 4.1, -0.3);
  group.add(deskBeam);

  const connectBeam = new THREE.Mesh(beamGeo, beamCyanMat);
  connectBeam.position.set(0, 4.3, -13.5);
  group.add(connectBeam);

  const contactBeam = new THREE.Mesh(beamGeo, beamVioletMat);
  contactBeam.position.set(0, 4.2, -26.5);
  group.add(contactBeam);

  // =========================================================================
  // 3. EXPERIENCE 03 — 14 INTERACTIVE FACETED CRYSTAL SOCIAL BADGES (Z ≈ -13.5)
  // =========================================================================
  const crystalBadges: CrystalBadgeNode[] = [];
  const hitProxies: THREE.Mesh[] = [];

  const crystalShellGeo = track(new THREE.IcosahedronGeometry(0.44, 0));
  const crystalEdgeGeo = track(new THREE.EdgesGeometry(crystalShellGeo));
  const emblemPlaneGeo = track(new THREE.CircleGeometry(0.24, 24));
  const hitSphereGeo = track(new THREE.SphereGeometry(0.58, 12, 12));
  const hitInvisibleMat = track(
    new THREE.MeshBasicMaterial({
      visible: false,
    })
  );

  // Arrange 14 badges in a graceful 3D curved gallery arc
  const colsDesktop = 5;
  const colsMobile = 3;
  const cols = isMobile ? colsMobile : colsDesktop;

  SOCIAL_LINKS.forEach((link, idx) => {
    const row = Math.floor(idx / cols);
    const itemsInRow =
      row === Math.floor((SOCIAL_LINKS.length - 1) / cols)
        ? SOCIAL_LINKS.length - row * cols
        : cols;
    const colInRow = idx % cols;

    const spacingX = isMobile ? 1.15 : 1.48;
    const spacingY = isMobile ? 1.12 : 1.16;

    const x = (colInRow - (itemsInRow - 1) / 2) * spacingX;
    const totalRows = Math.ceil(SOCIAL_LINKS.length / cols);
    const y = ((totalRows - 1) / 2 - row) * spacingY + 0.15;
    // Gentle concave arc along Z so outer badges curve toward the camera
    const z = -13.6 + Math.abs(x) * 0.22;

    const badgeGroup = new THREE.Group();
    const basePos = new THREE.Vector3(x, y, z);
    badgeGroup.position.copy(basePos);

    const crystalMat = track(
      createFresnelGlassMaterial({
        baseColor: 0x0b0d1f,
        fresnelColor: link.icon === 'devs' || link.icon === 'portfolio' ? 0x22d3ee : 0xa855f7,
        accentColor: 0x38bdf8,
        opacity: 0.76,
      })
    );
    const crystalMesh = new THREE.Mesh(crystalShellGeo, crystalMat);
    badgeGroup.add(crystalMesh);

    const wireMat = track(
      new THREE.LineBasicMaterial({
        color: 0xd8b4fe,
        transparent: true,
        opacity: 0.42,
      })
    );
    const wire = new THREE.LineSegments(crystalEdgeGeo, wireMat);
    wire.scale.setScalar(1.015);
    badgeGroup.add(wire);

    const emblemTex = track(createCrystalEmblemTexture(link, maxAnisotropy));
    const emblemMat = track(
      new THREE.MeshBasicMaterial({
        map: emblemTex,
        transparent: true,
        depthWrite: false,
      })
    );
    const emblemFront = new THREE.Mesh(emblemPlaneGeo, emblemMat);
    emblemFront.position.z = 0.02;
    badgeGroup.add(emblemFront);

    // Invisible forgiving hit sphere for raycasting
    const hitProxy = new THREE.Mesh(hitSphereGeo, hitInvisibleMat);
    hitProxy.userData.socialIndex = idx;
    badgeGroup.add(hitProxy);
    hitProxies.push(hitProxy);

    group.add(badgeGroup);
    crystalBadges.push({
      index: idx,
      link,
      group: badgeGroup,
      hitProxy,
      crystalMat,
      wireMat,
      basePos,
      hoverAmount: 0,
      phase: idx * 0.65,
    });
  });

  // =========================================================================
  // 4. EXPERIENCE 04 — SINGULARITY ENERGY CORE (Z ≈ -26.5)
  // =========================================================================
  const coreGroup = new THREE.Group();
  coreGroup.position.set(0, 0.15, -26.5);

  const energyGeo = track(new THREE.IcosahedronGeometry(1.08, 4));
  const energyMat = track(createEnergyCoreMaterial());
  const energyMesh = new THREE.Mesh(energyGeo, energyMat);
  coreGroup.add(energyMesh);

  const gyroRing1Geo = track(new THREE.TorusGeometry(1.72, 0.025, 12, 64));
  const gyroRing1 = new THREE.Mesh(gyroRing1Geo, monolithGlassMat);
  gyroRing1.rotation.x = Math.PI / 3;
  coreGroup.add(gyroRing1);

  const gyroRing2Geo = track(new THREE.TorusGeometry(2.05, 0.018, 12, 64));
  const gyroRing2 = new THREE.Mesh(gyroRing2Geo, darkObeliskMat);
  gyroRing2.rotation.y = Math.PI / 4;
  coreGroup.add(gyroRing2);

  const coreWireGeo = track(new THREE.IcosahedronGeometry(1.42, 1));
  const coreWireEdges = track(new THREE.EdgesGeometry(coreWireGeo));
  const coreWireMat = track(
    new THREE.LineBasicMaterial({
      color: 0xa855f7,
      transparent: true,
      opacity: 0.35,
    })
  );
  const coreWire = new THREE.LineSegments(coreWireEdges, coreWireMat);
  coreGroup.add(coreWire);

  group.add(coreGroup);

  return {
    group,
    crystalBadges,
    hitProxies,
    update(
      elapsed: number,
      delta: number,
      scrollProgress: number,
      hoveredIdx: number | null,
      pointerNdc: THREE.Vector2,
      reducedMotion: boolean
    ) {
      const t = reducedMotion ? 0 : elapsed;

      // Update shared shaders
      skyMat.uniforms.uTime.value = t;
      skyMat.uniforms.uScrollProgress.value = scrollProgress;
      monolithGlassMat.uniforms.uTime.value = t;
      beamVioletMat.uniforms.uTime.value = t;
      beamCyanMat.uniforms.uTime.value = t;
      energyMat.uniforms.uTime.value = t;

      // Portal slow rotation
      portalGroup.rotation.z = t * 0.09;

      // Architectural shards float
      for (let i = 0; i < shards.length; i++) {
        const s = shards[i];
        s.mesh.position.y = s.baseY + Math.sin(t * 0.7 + s.phase) * 0.14;
        if (s.rotSpeed > 0.1) {
          s.mesh.rotation.y += delta * s.rotSpeed * (reducedMotion ? 0 : 1);
          s.mesh.rotation.x = Math.sin(t * 0.4 + s.phase) * 0.18;
        }
      }

      // Interactive 14 Crystal Badges
      for (let i = 0; i < crystalBadges.length; i++) {
        const node = crystalBadges[i];
        const isHovered = hoveredIdx === node.index;

        node.hoverAmount = THREE.MathUtils.damp(node.hoverAmount, isHovered ? 1 : 0, 8, delta);
        node.crystalMat.uniforms.uTime.value = t;
        node.crystalMat.uniforms.uHover.value = node.hoverAmount;
        node.wireMat.opacity = 0.36 + node.hoverAmount * 0.58;

        // Float gently
        node.group.position.y =
          node.basePos.y + Math.sin(t * 1.15 + node.phase) * 0.055 + node.hoverAmount * 0.06;

        // Scale smoothly on hover
        const targetScale = 1 + node.hoverAmount * 0.18;
        node.group.scale.setScalar(targetScale);

        // Rotate subtly toward pointer on hover, otherwise gentle idle sway
        const targetRotY = isHovered
          ? pointerNdc.x * 0.42
          : Math.sin(t * 0.55 + node.phase) * 0.22;
        const targetRotX = isHovered
          ? -pointerNdc.y * 0.34
          : Math.cos(t * 0.45 + node.phase) * 0.12;

        node.group.rotation.y = THREE.MathUtils.damp(node.group.rotation.y, targetRotY, 7, delta);
        node.group.rotation.x = THREE.MathUtils.damp(node.group.rotation.x, targetRotX, 7, delta);
      }

      // Singularity Core Animation (Experience 04)
      if (!reducedMotion) {
        energyMesh.rotation.y = t * 0.25;
        energyMesh.rotation.x = Math.sin(t * 0.3) * 0.2;
        gyroRing1.rotation.z = t * 0.38;
        gyroRing1.rotation.y = t * 0.18;
        gyroRing2.rotation.x = -t * 0.28;
        gyroRing2.rotation.z = -t * 0.2;
        coreWire.rotation.y = -t * 0.16;
      }
    },
    dispose() {
      disposables.forEach((d) => d.dispose());
    },
  };
}
