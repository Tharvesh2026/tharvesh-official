import * as THREE from 'three';
import {
  createContactShadowTexture,
  createDeskMatTexture,
  createMonitorEditorTexture,
  createWoodDeskTextures,
  type MonitorTextureHandle,
} from './textures';

export interface WorkstationRig {
  group: THREE.Group;
  update: (elapsed: number, delta: number, reducedMotion: boolean) => void;
  dispose: () => void;
}

// Pre-allocated color helpers for zero-GC animation loop
const _rgbColorA = new THREE.Color();
const _rgbColorB = new THREE.Color();
const _keyColor = new THREE.Color();

function createRgbFan(
  radius: number,
  shroudMat: THREE.Material,
  bladeMat: THREE.Material,
  ringMat: THREE.MeshStandardMaterial
): { fanGroup: THREE.Group; rotor: THREE.Group } {
  const fanGroup = new THREE.Group();

  // Outer cylindrical housing frame
  const housingGeo = new THREE.TorusGeometry(radius, radius * 0.11, 12, 32);
  const housing = new THREE.Mesh(housingGeo, shroudMat);
  fanGroup.add(housing);

  // Inner luminous RGB diffuser ring
  const ringGeo = new THREE.TorusGeometry(radius * 0.88, radius * 0.055, 10, 32);
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.position.z = 0.012;
  fanGroup.add(ring);

  // Rotating fan rotor (hub + 7 pitched blades)
  const rotor = new THREE.Group();
  const hubGeo = new THREE.CylinderGeometry(radius * 0.24, radius * 0.24, radius * 0.14, 20);
  hubGeo.rotateX(Math.PI / 2);
  const hub = new THREE.Mesh(hubGeo, shroudMat);
  rotor.add(hub);

  const hubCapGeo = new THREE.CircleGeometry(radius * 0.16, 20);
  const hubCap = new THREE.Mesh(hubCapGeo, ringMat);
  hubCap.position.z = radius * 0.075;
  rotor.add(hubCap);

  const bladeCount = 7;
  const bladeGeo = new THREE.BoxGeometry(radius * 0.62, radius * 0.19, radius * 0.025);
  for (let i = 0; i < bladeCount; i++) {
    const angle = (i / bladeCount) * Math.PI * 2;
    const bladePivot = new THREE.Group();
    bladePivot.rotation.z = angle;

    const blade = new THREE.Mesh(bladeGeo, bladeMat);
    blade.position.x = radius * 0.48;
    blade.rotation.x = 0.42; // Aerodynamic pitch
    bladePivot.add(blade);
    rotor.add(bladePivot);
  }

  fanGroup.add(rotor);
  return { fanGroup, rotor };
}

function createStudioSpeaker(
  cabinetMat: THREE.Material,
  baffleMat: THREE.Material,
  coneMat: THREE.Material,
  trimMat: THREE.Material,
  ledMat: THREE.MeshStandardMaterial
): THREE.Group {
  const speaker = new THREE.Group();

  const w = 0.23;
  const h = 0.36;
  const d = 0.25;

  // Main acoustic enclosure
  const bodyGeo = new THREE.BoxGeometry(w, h, d);
  const body = new THREE.Mesh(bodyGeo, cabinetMat);
  body.position.y = h / 2 + 0.012;
  body.castShadow = true;
  body.receiveShadow = true;
  speaker.add(body);

  // Front acoustic baffle
  const baffleGeo = new THREE.BoxGeometry(w * 0.92, h * 0.92, 0.015);
  const baffle = new THREE.Mesh(baffleGeo, baffleMat);
  baffle.position.set(0, h / 2 + 0.012, d / 2 + 0.004);
  speaker.add(baffle);

  // Woofer trim ring + cone + dust cap
  const wooferRingGeo = new THREE.TorusGeometry(0.068, 0.007, 10, 28);
  const wooferRing = new THREE.Mesh(wooferRingGeo, trimMat);
  wooferRing.position.set(0, 0.125, d / 2 + 0.012);
  speaker.add(wooferRing);

  const wooferConeGeo = new THREE.CylinderGeometry(0.064, 0.022, 0.022, 24);
  wooferConeGeo.rotateX(Math.PI / 2);
  const wooferCone = new THREE.Mesh(wooferConeGeo, coneMat);
  wooferCone.position.set(0, 0.125, d / 2 + 0.004);
  speaker.add(wooferCone);

  const dustCapGeo = new THREE.SphereGeometry(0.021, 16, 12);
  dustCapGeo.scale(1, 1, 0.5);
  const dustCap = new THREE.Mesh(dustCapGeo, trimMat);
  dustCap.position.set(0, 0.125, d / 2 + 0.014);
  speaker.add(dustCap);

  // Tweeter dome
  const tweeterRingGeo = new THREE.TorusGeometry(0.03, 0.004, 8, 24);
  const tweeterRing = new THREE.Mesh(tweeterRingGeo, trimMat);
  tweeterRing.position.set(0, 0.275, d / 2 + 0.012);
  speaker.add(tweeterRing);

  const tweeterDomeGeo = new THREE.SphereGeometry(0.022, 16, 12);
  tweeterDomeGeo.scale(1, 1, 0.55);
  const tweeterDome = new THREE.Mesh(tweeterDomeGeo, coneMat);
  tweeterDome.position.set(0, 0.275, d / 2 + 0.011);
  speaker.add(tweeterDome);

  // Subtle isolation pad + glowing under-accent strip
  const padGeo = new THREE.BoxGeometry(w * 0.94, 0.012, d * 0.94);
  const pad = new THREE.Mesh(padGeo, baffleMat);
  pad.position.y = 0.006;
  speaker.add(pad);

  const ledGeo = new THREE.BoxGeometry(w * 0.86, 0.005, 0.008);
  const led = new THREE.Mesh(ledGeo, ledMat);
  led.position.set(0, 0.014, d / 2 + 0.004);
  speaker.add(led);

  return speaker;
}

export function createWorkstation(
  maxAnisotropy: number,
  isSoftwareGl: boolean
): WorkstationRig {
  const group = new THREE.Group();
  const disposables: { dispose: () => void }[] = [];
  const track = <T extends { dispose: () => void }>(item: T): T => {
    disposables.push(item);
    return item;
  };

  // --- Shared PBR Materials ---
  const { map: woodMap, roughnessMap: woodRoughMap } = createWoodDeskTextures(maxAnisotropy);
  track(woodMap);
  track(woodRoughMap);

  const deskWoodMat = track(
    new THREE.MeshStandardMaterial({
      map: woodMap,
      roughnessMap: woodRoughMap,
      roughness: 0.58,
      metalness: 0.08,
    })
  );

  const darkMetalMat = track(
    new THREE.MeshStandardMaterial({
      color: 0x161822,
      roughness: 0.36,
      metalness: 0.82,
    })
  );

  const brushedAlumMat = track(
    new THREE.MeshStandardMaterial({
      color: 0x3b4054,
      roughness: 0.26,
      metalness: 0.88,
    })
  );

  const matteChassisMat = track(
    new THREE.MeshStandardMaterial({
      color: 0x11131b,
      roughness: 0.52,
      metalness: 0.45,
    })
  );

  const mattePlasticMat = track(
    new THREE.MeshStandardMaterial({
      color: 0x1b1d29,
      roughness: 0.68,
      metalness: 0.12,
    })
  );

  const meshGrilleMat = track(
    new THREE.MeshStandardMaterial({
      color: 0x0b0c14,
      roughness: 0.78,
      metalness: 0.35,
    })
  );

  const fanBladeMat = track(
    new THREE.MeshStandardMaterial({
      color: 0xc4b5fd,
      roughness: 0.25,
      metalness: 0.1,
      transparent: true,
      opacity: 0.88,
    })
  );

  // Dynamic RGB emissive materials
  const rgbPurpleMat = track(
    new THREE.MeshStandardMaterial({
      color: 0xa855f7,
      emissive: 0xa855f7,
      emissiveIntensity: 2.1,
      roughness: 0.2,
    })
  );

  const rgbCyanMat = track(
    new THREE.MeshStandardMaterial({
      color: 0x22d3ee,
      emissive: 0x22d3ee,
      emissiveIntensity: 1.9,
      roughness: 0.2,
    })
  );

  const rgbStripMat = track(
    new THREE.MeshStandardMaterial({
      color: 0x9333ea,
      emissive: 0x9333ea,
      emissiveIntensity: 1.8,
      roughness: 0.25,
    })
  );

  const glassMat = track(
    new THREE.MeshPhysicalMaterial({
      color: 0x9fa8da,
      metalness: 0.05,
      roughness: 0.08,
      transmission: isSoftwareGl ? 0 : 0.86,
      transparent: true,
      opacity: isSoftwareGl ? 0.24 : 0.96,
      ior: 1.52,
      thickness: 0.04,
      clearcoat: 1.0,
      clearcoatRoughness: 0.06,
      depthWrite: false,
    })
  );

  // =========================================================================
  // 1. LARGE DARK WOODEN COMPUTER DESK (Top surface at Y = 0)
  // =========================================================================
  const deskGroup = new THREE.Group();
  const deskW = 4.65;
  const deskD = 2.08;
  const deskH = 0.095;

  const deskGeo = track(new THREE.BoxGeometry(deskW, deskH, deskD));
  const deskTop = new THREE.Mesh(deskGeo, deskWoodMat);
  deskTop.position.set(0, -deskH / 2, 0);
  deskTop.receiveShadow = true;
  deskTop.castShadow = true;
  deskGroup.add(deskTop);

  // Chamfered dark metallic front edge trim
  const frontTrimGeo = track(new THREE.BoxGeometry(deskW + 0.01, 0.022, 0.022));
  const frontTrim = new THREE.Mesh(frontTrimGeo, darkMetalMat);
  frontTrim.position.set(0, -0.015, deskD / 2 + 0.005);
  deskGroup.add(frontTrim);

  // Rear RGB ambient light bar under/behind desk
  const rearLedGeo = track(new THREE.BoxGeometry(deskW - 0.6, 0.018, 0.018));
  const rearLed = new THREE.Mesh(rearLedGeo, rgbStripMat);
  rearLed.position.set(0, -0.045, -deskD / 2 - 0.01);
  deskGroup.add(rearLed);

  // Powder-coated steel T-frame legs
  const legXPositions = [-2.02, 2.02];
  const legH = 1.25;
  const colGeo = track(new THREE.BoxGeometry(0.085, legH, 0.085));
  const footGeo = track(new THREE.BoxGeometry(0.095, 0.055, 1.56));
  const topBracketGeo = track(new THREE.BoxGeometry(0.11, 0.04, 1.48));

  legXPositions.forEach((lx) => {
    const colFront = new THREE.Mesh(colGeo, darkMetalMat);
    colFront.position.set(lx, -deskH - legH / 2, 0.25);
    colFront.castShadow = true;
    deskGroup.add(colFront);

    const colBack = new THREE.Mesh(colGeo, darkMetalMat);
    colBack.position.set(lx, -deskH - legH / 2, -0.45);
    colBack.castShadow = true;
    deskGroup.add(colBack);

    const topBracket = new THREE.Mesh(topBracketGeo, darkMetalMat);
    topBracket.position.set(lx, -deskH - 0.02, -0.1);
    deskGroup.add(topBracket);

    const foot = new THREE.Mesh(footGeo, darkMetalMat);
    foot.position.set(lx, -deskH - legH + 0.027, -0.1);
    deskGroup.add(foot);
  });

  // Structural rear modesty / cable beam
  const beamGeo = track(new THREE.BoxGeometry(4.04, 0.11, 0.05));
  const beam = new THREE.Mesh(beamGeo, darkMetalMat);
  beam.position.set(0, -deskH - 0.18, -0.58);
  deskGroup.add(beam);

  group.add(deskGroup);

  // =========================================================================
  // 2. CONTACT SHADOW GROUNDING PLANES & DESK MAT
  // =========================================================================
  const contactTex = track(createContactShadowTexture());
  const contactMat = track(
    new THREE.MeshBasicMaterial({
      map: contactTex,
      transparent: true,
      opacity: 0.65,
      depthWrite: false,
    })
  );

  const addContactShadow = (x: number, z: number, sx: number, sz: number) => {
    const planeGeo = track(new THREE.PlaneGeometry(sx, sz));
    planeGeo.rotateX(-Math.PI / 2);
    const shadow = new THREE.Mesh(planeGeo, contactMat);
    shadow.position.set(x, 0.002, z);
    group.add(shadow);
  };

  // Extended Desk Mat
  const matTex = track(createDeskMatTexture(maxAnisotropy));
  const deskMatMaterial = track(
    new THREE.MeshStandardMaterial({
      map: matTex,
      roughness: 0.88,
      metalness: 0.02,
    })
  );
  const deskMatGeo = track(new THREE.BoxGeometry(2.26, 0.008, 0.94));
  const deskMatMesh = new THREE.Mesh(deskMatGeo, deskMatMaterial);
  deskMatMesh.position.set(-0.36, 0.005, 0.34);
  deskMatMesh.receiveShadow = true;
  group.add(deskMatMesh);

  // =========================================================================
  // 3. WIDESCREEN MONITOR + STAND + LIVE CODE EDITOR SCREEN
  // =========================================================================
  const monitorAssembly = new THREE.Group();
  monitorAssembly.position.set(-0.36, 0, -0.54);

  // Brushed aluminum base plate
  const basePlateGeo = track(new THREE.BoxGeometry(0.68, 0.018, 0.34));
  const basePlate = new THREE.Mesh(basePlateGeo, brushedAlumMat);
  basePlate.position.set(0, 0.009, 0.05);
  basePlate.castShadow = true;
  basePlate.receiveShadow = true;
  monitorAssembly.add(basePlate);

  // Vertical angled stand arm
  const armGeo = track(new THREE.BoxGeometry(0.11, 0.72, 0.055));
  const arm = new THREE.Mesh(armGeo, brushedAlumMat);
  arm.position.set(0, 0.36, -0.09);
  arm.rotation.x = -0.14;
  arm.castShadow = true;
  monitorAssembly.add(arm);

  // VESA hinge housing
  const vesaGeo = track(new THREE.BoxGeometry(0.24, 0.2, 0.06));
  const vesa = new THREE.Mesh(vesaGeo, darkMetalMat);
  vesa.position.set(0, 0.76, -0.06);
  monitorAssembly.add(vesa);

  // Monitor Display Chassis
  const monGroup = new THREE.Group();
  monGroup.position.set(0, 0.79, 0.01);
  monGroup.rotation.x = -0.03;

  const monW = 2.28;
  const monH = 1.06;
  const monD = 0.05;

  // Rear housing
  const monBackGeo = track(new THREE.BoxGeometry(monW, monH, monD));
  const monBack = new THREE.Mesh(monBackGeo, matteChassisMat);
  monBack.castShadow = true;
  monBack.receiveShadow = true;
  monGroup.add(monBack);

  // Rear subtle purple/cyan RGB bias light ring on back of monitor
  const biasGeo = track(new THREE.BoxGeometry(monW * 0.72, 0.025, 0.015));
  const biasBar = new THREE.Mesh(biasGeo, rgbPurpleMat);
  biasBar.position.set(0, 0.18, -monD / 2 - 0.006);
  monGroup.add(biasBar);

  // Thin outer bezel frame (4 strips)
  const bezelT = 0.028;
  const bezelBottom = 0.044;
  const bezelD = 0.018;

  const topBezGeo = track(new THREE.BoxGeometry(monW, bezelT, bezelD));
  const topBez = new THREE.Mesh(topBezGeo, matteChassisMat);
  topBez.position.set(0, monH / 2 - bezelT / 2, monD / 2 + bezelD / 2);
  monGroup.add(topBez);

  const botBezGeo = track(new THREE.BoxGeometry(monW, bezelBottom, bezelD));
  const botBez = new THREE.Mesh(botBezGeo, matteChassisMat);
  botBez.position.set(0, -monH / 2 + bezelBottom / 2, monD / 2 + bezelD / 2);
  monGroup.add(botBez);

  const sideBezGeo = track(new THREE.BoxGeometry(bezelT, monH, bezelD));
  const leftBez = new THREE.Mesh(sideBezGeo, matteChassisMat);
  leftBez.position.set(-monW / 2 + bezelT / 2, 0, monD / 2 + bezelD / 2);
  monGroup.add(leftBez);

  const rightBez = new THREE.Mesh(sideBezGeo, matteChassisMat);
  rightBez.position.set(monW / 2 - bezelT / 2, 0, monD / 2 + bezelD / 2);
  monGroup.add(rightBez);

  // Tiny monitor power LED on bottom right bezel
  const monPowerGeo = track(new THREE.BoxGeometry(0.024, 0.006, 0.006));
  const monPower = new THREE.Mesh(monPowerGeo, rgbCyanMat);
  monPower.position.set(monW / 2 - 0.12, -monH / 2 + 0.02, monD / 2 + bezelD + 0.002);
  monGroup.add(monPower);

  // Live IDE Screen Plane
  const monitorHandle: MonitorTextureHandle = createMonitorEditorTexture(maxAnisotropy);
  track(monitorHandle.texture);

  const screenW = monW - bezelT * 2;
  const screenH = monH - bezelT - bezelBottom;
  const screenMat = track(
    new THREE.MeshStandardMaterial({
      map: monitorHandle.texture,
      emissiveMap: monitorHandle.texture,
      emissive: new THREE.Color(0xffffff),
      emissiveIntensity: 0.78,
      roughness: 0.24,
      metalness: 0.05,
    })
  );
  const screenGeo = track(new THREE.PlaneGeometry(screenW, screenH));
  const screenMesh = new THREE.Mesh(screenGeo, screenMat);
  screenMesh.position.set(0, (bezelBottom - bezelT) / 2, monD / 2 + 0.003);
  monGroup.add(screenMesh);

  monitorAssembly.add(monGroup);
  group.add(monitorAssembly);
  addContactShadow(-0.36, -0.49, 0.85, 0.45);

  // =========================================================================
  // 4. DESKTOP PC CABINET WITH TEMPERED GLASS & 2+ RGB COOLING FANS
  // =========================================================================
  const pcGroup = new THREE.Group();
  pcGroup.position.set(1.52, 0, -0.22);
  pcGroup.rotation.y = -0.34; // Angled so front + glass side panel are both showcased

  const pcW = 0.56;
  const pcH = 1.14;
  const pcD = 1.06;
  const footH = 0.045;

  // 4 machined chassis feet
  const pcFootGeo = track(new THREE.CylinderGeometry(0.036, 0.04, footH, 16));
  [
    [-pcW / 2 + 0.07, -pcD / 2 + 0.08],
    [pcW / 2 - 0.07, -pcD / 2 + 0.08],
    [-pcW / 2 + 0.07, pcD / 2 - 0.08],
    [pcW / 2 - 0.07, pcD / 2 - 0.08],
  ].forEach(([fx, fz]) => {
    const f = new THREE.Mesh(pcFootGeo, brushedAlumMat);
    f.position.set(fx, footH / 2, fz);
    pcGroup.add(f);
  });

  const bodyBaseY = footH;

  // Bottom tray & PSU shroud
  const bottomPlateGeo = track(new THREE.BoxGeometry(pcW, 0.03, pcD));
  const bottomPlate = new THREE.Mesh(bottomPlateGeo, matteChassisMat);
  bottomPlate.position.set(0, bodyBaseY + 0.015, 0);
  bottomPlate.castShadow = true;
  pcGroup.add(bottomPlate);

  const psuShroudGeo = track(new THREE.BoxGeometry(pcW - 0.05, 0.24, pcD - 0.14));
  const psuShroud = new THREE.Mesh(psuShroudGeo, darkMetalMat);
  psuShroud.position.set(0.01, bodyBaseY + 0.15, -0.04);
  pcGroup.add(psuShroud);

  // Illuminated edge accent on PSU shroud
  const shroudLedGeo = track(new THREE.BoxGeometry(0.008, 0.012, pcD - 0.26));
  const shroudLed = new THREE.Mesh(shroudLedGeo, rgbPurpleMat);
  shroudLed.position.set(-pcW / 2 + 0.036, bodyBaseY + 0.265, -0.04);
  pcGroup.add(shroudLed);

  // Right solid steel panel
  const rightPanelGeo = track(new THREE.BoxGeometry(0.028, pcH, pcD));
  const rightPanel = new THREE.Mesh(rightPanelGeo, matteChassisMat);
  rightPanel.position.set(pcW / 2 - 0.014, bodyBaseY + pcH / 2, 0);
  rightPanel.castShadow = true;
  pcGroup.add(rightPanel);

  // Rear structural panel
  const rearPanelGeo = track(new THREE.BoxGeometry(pcW, pcH, 0.03));
  const rearPanel = new THREE.Mesh(rearPanelGeo, matteChassisMat);
  rearPanel.position.set(0, bodyBaseY + pcH / 2, -pcD / 2 + 0.015);
  rearPanel.castShadow = true;
  pcGroup.add(rearPanel);

  // Top panel + magnetic mesh filter + power button
  const topPanelGeo = track(new THREE.BoxGeometry(pcW, 0.035, pcD));
  const topPanel = new THREE.Mesh(topPanelGeo, matteChassisMat);
  topPanel.position.set(0, bodyBaseY + pcH - 0.017, 0);
  topPanel.castShadow = true;
  pcGroup.add(topPanel);

  const topMeshGeo = track(new THREE.BoxGeometry(pcW * 0.64, 0.008, pcD * 0.68));
  const topMesh = new THREE.Mesh(topMeshGeo, meshGrilleMat);
  topMesh.position.set(-0.02, bodyBaseY + pcH + 0.002, -0.04);
  pcGroup.add(topMesh);

  const pwrBtnGeo = track(new THREE.CylinderGeometry(0.018, 0.018, 0.01, 16));
  const pwrBtn = new THREE.Mesh(pwrBtnGeo, rgbCyanMat);
  pwrBtn.position.set(-pcW / 2 + 0.09, bodyBaseY + pcH + 0.002, pcD / 2 - 0.1);
  pcGroup.add(pwrBtn);

  // Front chamfered mesh intake bezel + vertical RGB trim strips
  const frontFrameLGeo = track(new THREE.BoxGeometry(0.055, pcH, 0.055));
  const frontFrameL = new THREE.Mesh(frontFrameLGeo, matteChassisMat);
  frontFrameL.position.set(-pcW / 2 + 0.027, bodyBaseY + pcH / 2, pcD / 2 - 0.027);
  pcGroup.add(frontFrameL);

  const frontFrameR = new THREE.Mesh(frontFrameLGeo, matteChassisMat);
  frontFrameR.position.set(pcW / 2 - 0.027, bodyBaseY + pcH / 2, pcD / 2 - 0.027);
  pcGroup.add(frontFrameR);

  const frontMeshGeo = track(new THREE.BoxGeometry(pcW - 0.11, pcH - 0.08, 0.02));
  const frontMesh = new THREE.Mesh(frontMeshGeo, meshGrilleMat);
  frontMesh.position.set(0, bodyBaseY + pcH / 2, pcD / 2 - 0.018);
  pcGroup.add(frontMesh);

  // Front subtle glowing vertical accent strip
  const frontStripGeo = track(new THREE.BoxGeometry(0.01, pcH - 0.14, 0.012));
  const frontStrip = new THREE.Mesh(frontStripGeo, rgbPurpleMat);
  frontStrip.position.set(-pcW / 2 + 0.058, bodyBaseY + pcH / 2, pcD / 2 + 0.002);
  pcGroup.add(frontStrip);

  // --- Interior PC Hardware (visible through tempered glass) ---
  // Motherboard tray & PCB
  const moboGeo = track(new THREE.BoxGeometry(0.024, 0.68, 0.58));
  const mobo = new THREE.Mesh(moboGeo, meshGrilleMat);
  mobo.position.set(pcW / 2 - 0.09, bodyBaseY + 0.64, -0.14);
  pcGroup.add(mobo);

  // Metallic VRM heatsink blocks
  const vrmGeo = track(new THREE.BoxGeometry(0.045, 0.22, 0.09));
  const vrm = new THREE.Mesh(vrmGeo, brushedAlumMat);
  vrm.position.set(pcW / 2 - 0.11, bodyBaseY + 0.78, -0.35);
  pcGroup.add(vrm);

  // CPU AIO Pump Block with infinity RGB ring
  const pumpBodyGeo = track(new THREE.CylinderGeometry(0.085, 0.085, 0.065, 24));
  pumpBodyGeo.rotateZ(Math.PI / 2);
  const pumpBody = new THREE.Mesh(pumpBodyGeo, darkMetalMat);
  pumpBody.position.set(pcW / 2 - 0.14, bodyBaseY + 0.72, -0.15);
  pcGroup.add(pumpBody);

  const pumpRingGeo = track(new THREE.TorusGeometry(0.066, 0.01, 10, 28));
  pumpRingGeo.rotateY(Math.PI / 2);
  const pumpRing = new THREE.Mesh(pumpRingGeo, rgbCyanMat);
  pumpRing.position.set(pcW / 2 - 0.175, bodyBaseY + 0.72, -0.15);
  pcGroup.add(pumpRing);

  // Coolant Tubes curving cleanly from CPU block to top radiator
  const tubeCurve1 = new THREE.CatmullRomCurve3([
    new THREE.Vector3(pcW / 2 - 0.15, bodyBaseY + 0.77, -0.11),
    new THREE.Vector3(pcW / 2 - 0.24, bodyBaseY + 0.92, 0.06),
    new THREE.Vector3(pcW / 2 - 0.22, bodyBaseY + 1.04, 0.22),
  ]);
  const tubeGeo1 = track(new THREE.TubeGeometry(tubeCurve1, 20, 0.014, 8, false));
  const tube1 = new THREE.Mesh(tubeGeo1, mattePlasticMat);
  pcGroup.add(tube1);

  const tubeCurve2 = new THREE.CatmullRomCurve3([
    new THREE.Vector3(pcW / 2 - 0.15, bodyBaseY + 0.68, -0.09),
    new THREE.Vector3(pcW / 2 - 0.26, bodyBaseY + 0.86, 0.12),
    new THREE.Vector3(pcW / 2 - 0.22, bodyBaseY + 1.04, 0.28),
  ]);
  const tubeGeo2 = track(new THREE.TubeGeometry(tubeCurve2, 20, 0.014, 8, false));
  const tube2 = new THREE.Mesh(tubeGeo2, mattePlasticMat);
  pcGroup.add(tube2);

  // 2 Illuminated RGB RAM Modules
  const ramGeo = track(new THREE.BoxGeometry(0.045, 0.19, 0.014));
  const ramLedGeo = track(new THREE.BoxGeometry(0.012, 0.185, 0.015));
  [0.02, 0.055].forEach((rz, idx) => {
    const ram = new THREE.Mesh(ramGeo, darkMetalMat);
    ram.position.set(pcW / 2 - 0.12, bodyBaseY + 0.73, rz);
    pcGroup.add(ram);

    const ramLed = new THREE.Mesh(ramLedGeo, idx === 0 ? rgbPurpleMat : rgbCyanMat);
    ramLed.position.set(pcW / 2 - 0.145, bodyBaseY + 0.73, rz);
    pcGroup.add(ramLed);
  });

  // Dedicated Graphics Card with glowing edge strip
  const gpuGeo = track(new THREE.BoxGeometry(0.24, 0.085, 0.56));
  const gpu = new THREE.Mesh(gpuGeo, darkMetalMat);
  gpu.position.set(pcW / 2 - 0.21, bodyBaseY + 0.48, -0.09);
  pcGroup.add(gpu);

  const gpuBackplateGeo = track(new THREE.BoxGeometry(0.23, 0.01, 0.55));
  const gpuBackplate = new THREE.Mesh(gpuBackplateGeo, brushedAlumMat);
  gpuBackplate.position.set(pcW / 2 - 0.21, bodyBaseY + 0.528, -0.09);
  pcGroup.add(gpuBackplate);

  const gpuStripGeo = track(new THREE.BoxGeometry(0.012, 0.016, 0.44));
  const gpuStrip = new THREE.Mesh(gpuStripGeo, rgbPurpleMat);
  gpuStrip.position.set(pcW / 2 - 0.332, bodyBaseY + 0.495, -0.09);
  pcGroup.add(gpuStrip);

  // --- TWO PROMINENT ANIMATED RGB COOLING FANS ---
  // Mounted prominently inside the glass-side view (front-side stacked twin 140mm RGB fans + 1 rear exhaust fan)
  const fanRotors: { rotor: THREE.Group; speed: number }[] = [];

  // Two large stacked RGB fans facing outward through the tempered glass / front-side bracket
  const frontSideFanPositions = [bodyBaseY + 0.44, bodyBaseY + 0.84];
  frontSideFanPositions.forEach((fy, idx) => {
    const { fanGroup, rotor } = createRgbFan(
      0.165,
      mattePlasticMat,
      fanBladeMat,
      idx === 0 ? rgbPurpleMat : rgbCyanMat
    );
    fanGroup.position.set(0.06, fy, 0.34);
    fanGroup.rotation.y = -Math.PI / 2.6; // Angled nicely toward both front & camera
    pcGroup.add(fanGroup);
    fanRotors.push({ rotor, speed: idx === 0 ? 3.2 : -3.4 });
  });

  // Rear RGB exhaust fan visible at the back-left of the interior
  const { fanGroup: rearFan, rotor: rearRotor } = createRgbFan(
    0.135,
    mattePlasticMat,
    fanBladeMat,
    rgbPurpleMat
  );
  rearFan.position.set(-0.08, bodyBaseY + 0.82, -pcD / 2 + 0.06);
  pcGroup.add(rearFan);
  fanRotors.push({ rotor: rearRotor, speed: 2.9 });

  // Track generated fan geometries for disposal
  fanRotors.forEach(({ rotor }) => {
    rotor.parent?.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        track(obj.geometry);
      }
    });
  });

  // Tempered Glass Left Side Panel (with corner thumbscrews)
  const glassGeo = track(new THREE.BoxGeometry(0.016, pcH - 0.07, pcD - 0.08));
  const glassPanel = new THREE.Mesh(glassGeo, glassMat);
  glassPanel.position.set(-pcW / 2 + 0.015, bodyBaseY + pcH / 2, 0);
  glassPanel.renderOrder = 6;
  pcGroup.add(glassPanel);

  // Glass border trim + 4 brushed thumbscrews
  const screwGeo = track(new THREE.CylinderGeometry(0.016, 0.016, 0.022, 12));
  screwGeo.rotateZ(Math.PI / 2);
  [
    [bodyBaseY + 0.07, -pcD / 2 + 0.08],
    [bodyBaseY + 0.07, pcD / 2 - 0.08],
    [bodyBaseY + pcH - 0.07, -pcD / 2 + 0.08],
    [bodyBaseY + pcH - 0.07, pcD / 2 - 0.08],
  ].forEach(([sy, sz]) => {
    const screw = new THREE.Mesh(screwGeo, brushedAlumMat);
    screw.position.set(-pcW / 2 + 0.012, sy, sz);
    pcGroup.add(screw);
  });

  group.add(pcGroup);
  addContactShadow(1.52, -0.22, 0.95, 1.32);

  // =========================================================================
  // 5. MECHANICAL KEYBOARD WITH COLORFUL RGB KEYS (InstancedMesh)
  // =========================================================================
  const kbGroup = new THREE.Group();
  kbGroup.position.set(-0.42, 0.01, 0.36);
  kbGroup.rotation.x = 0.065;

  const kbW = 1.06;
  const kbH = 0.036;
  const kbD = 0.38;

  // Anodized aluminum housing
  const kbCaseGeo = track(new THREE.BoxGeometry(kbW, kbH, kbD));
  const kbCase = new THREE.Mesh(kbCaseGeo, darkMetalMat);
  kbCase.position.y = kbH / 2;
  kbCase.castShadow = true;
  kbCase.receiveShadow = true;
  kbGroup.add(kbCase);

  // Glowing RGB diffuser rim under keycaps
  const kbDiffuserGeo = track(new THREE.BoxGeometry(kbW - 0.03, 0.01, kbD - 0.03));
  const kbDiffuser = new THREE.Mesh(kbDiffuserGeo, rgbPurpleMat);
  kbDiffuser.position.y = kbH + 0.002;
  kbGroup.add(kbDiffuser);

  // Instanced Keycaps (5 rows × 14 cols ≈ 66 keys)
  const keycapGeo = track(new THREE.BoxGeometry(0.056, 0.022, 0.054));
  const keycapMat = track(
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.38,
      metalness: 0.12,
      emissive: 0x3b1e6d,
      emissiveIntensity: 0.55,
    })
  );

  interface KeySpec {
    x: number;
    z: number;
    sx: number;
    phase: number;
  }
  const keySpecs: KeySpec[] = [];
  const rows = 5;
  const cols = 15;
  const pitchX = 0.066;
  const pitchZ = 0.066;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      // Realistic bottom row with wide spacebar
      if (r === 4 && c >= 4 && c <= 9) {
        if (c === 4) {
          keySpecs.push({
            x: (6.5 - (cols - 1) / 2) * pitchX,
            z: (r - (rows - 1) / 2) * pitchZ,
            sx: 5.7,
            phase: 0.45,
          });
        }
        continue;
      }
      const x = (c - (cols - 1) / 2) * pitchX;
      const z = (r - (rows - 1) / 2) * pitchZ;
      keySpecs.push({
        x,
        z,
        sx: 1,
        phase: c / cols + r * 0.09,
      });
    }
  }

  const keyInstanced = new THREE.InstancedMesh(keycapGeo, keycapMat, keySpecs.length);
  keyInstanced.castShadow = true;
  const dummy = new THREE.Object3D();

  keySpecs.forEach((spec, idx) => {
    dummy.position.set(spec.x, kbH + 0.015, spec.z);
    dummy.scale.set(spec.sx, 1, 1);
    dummy.updateMatrix();
    keyInstanced.setMatrixAt(idx, dummy.matrix);

    // Initial vibrant purple-magenta-cyan gradient across keys
    const hue = 0.72 + spec.phase * 0.24;
    _keyColor.setHSL(hue % 1, 0.85, 0.62);
    keyInstanced.setColorAt(idx, _keyColor);
  });
  keyInstanced.instanceMatrix.needsUpdate = true;
  if (keyInstanced.instanceColor) keyInstanced.instanceColor.needsUpdate = true;
  kbGroup.add(keyInstanced);

  // Coiled Aviator Cable behind keyboard
  const cablePoints: THREE.Vector3[] = [];
  cablePoints.push(new THREE.Vector3(-0.32, 0.018, -kbD / 2));
  for (let i = 0; i <= 28; i++) {
    const t = i / 28;
    const angle = t * Math.PI * 10;
    cablePoints.push(
      new THREE.Vector3(
        -0.32 + t * 0.24,
        0.016 + Math.sin(angle) * 0.013,
        -kbD / 2 - 0.06 + Math.cos(angle) * 0.013
      )
    );
  }
  cablePoints.push(new THREE.Vector3(-0.08, 0.012, -kbD / 2 - 0.16));
  cablePoints.push(new THREE.Vector3(-0.08, 0.01, -kbD / 2 - 0.42));

  const cableCurve = new THREE.CatmullRomCurve3(cablePoints);
  const cableGeo = track(new THREE.TubeGeometry(cableCurve, 48, 0.007, 8, false));
  const cableMat = track(
    new THREE.MeshStandardMaterial({
      color: 0x7e22ce,
      roughness: 0.45,
      metalness: 0.25,
    })
  );
  const cableMesh = new THREE.Mesh(cableGeo, cableMat);
  kbGroup.add(cableMesh);

  group.add(kbGroup);

  // =========================================================================
  // 6. ERGONOMIC GAMING MOUSE
  // =========================================================================
  const mouseGroup = new THREE.Group();
  mouseGroup.position.set(0.42, 0.01, 0.39);
  mouseGroup.rotation.y = 0.08;

  // Sculpted shell using scaled/beveled geometry
  const mouseBaseGeo = track(new THREE.CapsuleGeometry(0.068, 0.11, 8, 16));
  mouseBaseGeo.rotateX(Math.PI / 2);
  mouseBaseGeo.scale(1.05, 0.56, 1.0);
  const mouseShell = new THREE.Mesh(mouseBaseGeo, matteChassisMat);
  mouseShell.position.y = 0.032;
  mouseShell.castShadow = true;
  mouseGroup.add(mouseShell);

  // Split click button groove accent
  const mouseSplitGeo = track(new THREE.BoxGeometry(0.006, 0.008, 0.09));
  const mouseSplit = new THREE.Mesh(mouseSplitGeo, meshGrilleMat);
  mouseSplit.position.set(0, 0.066, -0.055);
  mouseGroup.add(mouseSplit);

  // Glowing RGB scroll wheel
  const scrollGeo = track(new THREE.CylinderGeometry(0.014, 0.014, 0.016, 16));
  scrollGeo.rotateZ(Math.PI / 2);
  const scrollWheel = new THREE.Mesh(scrollGeo, rgbCyanMat);
  scrollWheel.position.set(0, 0.062, -0.058);
  mouseGroup.add(scrollWheel);

  // Rear RGB under-arc
  const mouseRgbGeo = track(new THREE.TorusGeometry(0.062, 0.005, 8, 20, Math.PI));
  mouseRgbGeo.rotateX(Math.PI / 2);
  const mouseRgb = new THREE.Mesh(mouseRgbGeo, rgbPurpleMat);
  mouseRgb.position.set(0, 0.012, 0.04);
  mouseGroup.add(mouseRgb);

  group.add(mouseGroup);

  // =========================================================================
  // 7. TWO DESKTOP STUDIO SPEAKERS
  // =========================================================================
  const leftSpeaker = createStudioSpeaker(
    matteChassisMat,
    mattePlasticMat,
    meshGrilleMat,
    brushedAlumMat,
    rgbPurpleMat
  );
  leftSpeaker.position.set(-1.76, 0, -0.34);
  leftSpeaker.rotation.y = 0.34;
  group.add(leftSpeaker);
  addContactShadow(-1.76, -0.34, 0.34, 0.34);

  const rightSpeaker = createStudioSpeaker(
    matteChassisMat,
    mattePlasticMat,
    meshGrilleMat,
    brushedAlumMat,
    rgbCyanMat
  );
  rightSpeaker.position.set(0.86, 0, -0.44);
  rightSpeaker.rotation.y = -0.32;
  group.add(rightSpeaker);
  addContactShadow(0.86, -0.44, 0.34, 0.34);

  // Track speaker geometries for disposal
  [leftSpeaker, rightSpeaker].forEach((spk) => {
    spk.traverse((obj) => {
      if (obj instanceof THREE.Mesh) track(obj.geometry);
    });
  });

  // =========================================================================
  // 8. DECORATIVE DESK DETAILS (Coffee Mug & Low-Poly Crystal Accent)
  // =========================================================================
  // Ceramic Matte Coffee Mug
  const mugGroup = new THREE.Group();
  mugGroup.position.set(-1.26, 0, 0.34);

  const mugBodyGeo = track(new THREE.CylinderGeometry(0.068, 0.062, 0.145, 22));
  const mugBody = new THREE.Mesh(mugBodyGeo, mattePlasticMat);
  mugBody.position.y = 0.073;
  mugBody.castShadow = true;
  mugGroup.add(mugBody);

  const mugHandleGeo = track(new THREE.TorusGeometry(0.042, 0.011, 10, 18, Math.PI));
  mugHandleGeo.rotateZ(-Math.PI / 2);
  const mugHandle = new THREE.Mesh(mugHandleGeo, mattePlasticMat);
  mugHandle.position.set(0.062, 0.075, 0);
  mugGroup.add(mugHandle);

  const coffeeMat = track(
    new THREE.MeshStandardMaterial({
      color: 0x2a1810,
      roughness: 0.15,
      metalness: 0.05,
    })
  );
  const coffeeGeo = track(new THREE.CircleGeometry(0.058, 20));
  coffeeGeo.rotateX(-Math.PI / 2);
  const coffeeSurface = new THREE.Mesh(coffeeGeo, coffeeMat);
  coffeeSurface.position.y = 0.146;
  mugGroup.add(coffeeSurface);

  group.add(mugGroup);
  addContactShadow(-1.26, 0.34, 0.22, 0.22);

  // Small Low-Poly Glowing Crystal Ornament on Desk (ties into faceted theme)
  const crystalGroup = new THREE.Group();
  crystalGroup.position.set(-1.38, 0, -0.1);

  const plinthGeo = track(new THREE.CylinderGeometry(0.08, 0.09, 0.024, 6));
  const plinth = new THREE.Mesh(plinthGeo, brushedAlumMat);
  plinth.position.y = 0.012;
  crystalGroup.add(plinth);

  const crystalMat = track(
    new THREE.MeshPhysicalMaterial({
      color: 0xc084fc,
      emissive: 0x7e22ce,
      emissiveIntensity: 0.65,
      roughness: 0.14,
      metalness: 0.15,
      flatShading: true,
    })
  );
  const crystalGeo = track(new THREE.OctahedronGeometry(0.072, 0));
  crystalGeo.scale(0.85, 1.45, 0.85);
  const crystalMesh = new THREE.Mesh(crystalGeo, crystalMat);
  crystalMesh.position.y = 0.13;
  crystalMesh.castShadow = true;
  crystalGroup.add(crystalMesh);
  group.add(crystalGroup);
  addContactShadow(-1.38, -0.1, 0.24, 0.24);

  // =========================================================================
  // 9. LOCALIZED WORKSTATION RGB POINT LIGHTS
  // =========================================================================
  const pcInteriorLight = new THREE.PointLight(0xa855f7, 1.9, 2.4, 1.8);
  pcInteriorLight.position.set(1.38, 0.68, -0.16);
  group.add(pcInteriorLight);

  const monitorGlowLight = new THREE.PointLight(0x8b5cf6, 1.4, 3.2, 1.8);
  monitorGlowLight.position.set(-0.36, 0.72, 0.15);
  group.add(monitorGlowLight);

  const deskRearLight = new THREE.PointLight(0x9333ea, 1.6, 4.2, 1.8);
  deskRearLight.position.set(0.2, 0.25, -1.25);
  group.add(deskRearLight);

  let cursorTimer = 0;
  let cursorVisible = true;
  let keyRgbTimer = 0;

  return {
    group,
    update(elapsed: number, delta: number, reducedMotion: boolean) {
      if (reducedMotion) {
        monitorHandle.updateCursor(true);
        return;
      }

      // 1. Rotate PC RGB cooling fans smoothly
      for (let i = 0; i < fanRotors.length; i++) {
        fanRotors[i].rotor.rotation.z += delta * fanRotors[i].speed;
      }

      // 2. Gentle RGB color breathing between violet, magenta, and cyan
      const phase = elapsed * 0.55;
      const mixA = 0.5 + 0.5 * Math.sin(phase);
      const mixB = 0.5 + 0.5 * Math.cos(phase * 0.85);

      _rgbColorA.setHex(0xa855f7).lerp(_rgbColorB.setHex(0xd946ef), mixA * 0.45);
      rgbPurpleMat.emissive.copy(_rgbColorA);
      rgbPurpleMat.color.copy(_rgbColorA);

      _rgbColorA.setHex(0x22d3ee).lerp(_rgbColorB.setHex(0x8b5cf6), mixB * 0.65);
      rgbCyanMat.emissive.copy(_rgbColorA);
      rgbCyanMat.color.copy(_rgbColorA);

      rgbStripMat.emissiveIntensity = 1.5 + 0.45 * Math.sin(phase * 1.2);
      pcInteriorLight.color.copy(rgbPurpleMat.emissive);
      pcInteriorLight.intensity = 1.7 + 0.35 * Math.sin(phase * 1.4);

      // 3. Subtle levitation rotation on the desk crystal
      crystalMesh.rotation.y = elapsed * 0.45;
      crystalMesh.position.y = 0.13 + Math.sin(elapsed * 1.6) * 0.008;

      // 4. Blinking code editor cursor (~1.8 Hz)
      cursorTimer += delta;
      if (cursorTimer >= 0.55) {
        cursorTimer = 0;
        cursorVisible = !cursorVisible;
        monitorHandle.updateCursor(cursorVisible);
      }

      // 5. Smooth keyboard RGB wave (~24fps update to save GPU upload overhead)
      keyRgbTimer += delta;
      if (keyRgbTimer >= 0.042 && keyInstanced.instanceColor) {
        keyRgbTimer = 0;
        for (let i = 0; i < keySpecs.length; i++) {
          const hue = (0.72 + keySpecs[i].phase * 0.28 + elapsed * 0.06) % 1;
          _keyColor.setHSL(hue, 0.88, 0.6);
          keyInstanced.setColorAt(i, _keyColor);
        }
        keyInstanced.instanceColor.needsUpdate = true;
      }
    },
    dispose() {
      disposables.forEach((d) => d.dispose());
    },
  };
}
