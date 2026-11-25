import * as THREE from 'three';

export interface StarfieldRig {
  group: THREE.Group;
  update: (elapsed: number, reducedMotion: boolean) => void;
  setPixelRatio: (pixelRatio: number) => void;
  dispose: () => void;
}

export function createStarfield(starCount = 1100): StarfieldRig {
  const group = new THREE.Group();

  const positions = new Float32Array(starCount * 3);
  const colors = new Float32Array(starCount * 3);
  const sizes = new Float32Array(starCount);
  const phases = new Float32Array(starCount);
  const speeds = new Float32Array(starCount);

  const palette = [
    new THREE.Color('#ffffff'), // pure crisp white
    new THREE.Color('#f4e8ff'), // pale lavender white
    new THREE.Color('#e879f9'), // soft pink-magenta
    new THREE.Color('#c084fc'), // glowing violet
    new THREE.Color('#f9a8d4'), // rose pink
    new THREE.Color('#a5b4fc'), // cool cosmic periwinkle
  ];

  for (let i = 0; i < starCount; i++) {
    // Spread across wide cosmic dome behind & around workstation
    const spreadX = (Math.random() - 0.5) * 38;
    const spreadY = (Math.random() - 0.42) * 24;
    const depthZ = -4 - Math.random() * 26;

    positions[i * 3] = spreadX;
    positions[i * 3 + 1] = spreadY;
    positions[i * 3 + 2] = depthZ;

    const r = Math.random();
    let col: THREE.Color;
    if (r < 0.48) col = palette[0];
    else if (r < 0.65) col = palette[1];
    else if (r < 0.78) col = palette[2];
    else if (r < 0.89) col = palette[3];
    else if (r < 0.96) col = palette[4];
    else col = palette[5];

    colors[i * 3] = col.r;
    colors[i * 3 + 1] = col.g;
    colors[i * 3 + 2] = col.b;

    // Mostly tiny stars with a few brighter focal particles
    const isBright = Math.random() > 0.93;
    sizes[i] = isBright ? 4.2 + Math.random() * 3.4 : 1.3 + Math.random() * 2.1;
    phases[i] = Math.random() * Math.PI * 2;
    speeds[i] = 0.6 + Math.random() * 1.9;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
  geometry.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));
  geometry.setAttribute('aSpeed', new THREE.BufferAttribute(speeds, 1));

  const material = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uPixelRatio: { value: Math.min(window.devicePixelRatio || 1, 2) },
    },
    vertexShader: /* glsl */ `
      attribute vec3 aColor;
      attribute float aSize;
      attribute float aPhase;
      attribute float aSpeed;

      uniform float uTime;
      uniform float uPixelRatio;

      varying vec3 vColor;
      varying float vAlpha;

      void main() {
        vColor = aColor;

        vec3 pos = position;
        // Subtle cosmic drift
        pos.x += sin(uTime * 0.08 * aSpeed + aPhase) * 0.14;
        pos.y += cos(uTime * 0.06 * aSpeed + aPhase * 1.3) * 0.10;

        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
        gl_Position = projectionMatrix * mvPosition;

        float twinkle = 0.55 + 0.45 * sin(uTime * aSpeed + aPhase);
        vAlpha = twinkle;

        gl_PointSize = aSize * uPixelRatio * (16.0 / max(-mvPosition.z, 1.0)) * (0.85 + 0.25 * twinkle);
      }
    `,
    fragmentShader: /* glsl */ `
      varying vec3 vColor;
      varying float vAlpha;

      void main() {
        vec2 uv = gl_PointCoord - vec2(0.5);
        float d = length(uv);
        if (d > 0.5) discard;

        // Soft glowing core with smooth falloff
        float core = smoothstep(0.5, 0.04, d);
        float glow = pow(core, 2.2);
        gl_FragColor = vec4(vColor, glow * vAlpha);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const stars = new THREE.Points(geometry, material);
  stars.frustumCulled = false;
  group.add(stars);

  // Foreground floating ambient dust motes around workstation
  const moteCount = 48;
  const motePos = new Float32Array(moteCount * 3);
  const moteCol = new Float32Array(moteCount * 3);
  const moteSize = new Float32Array(moteCount);
  const motePhase = new Float32Array(moteCount);
  const moteSpeed = new Float32Array(moteCount);

  for (let i = 0; i < moteCount; i++) {
    motePos[i * 3] = (Math.random() - 0.5) * 6.5;
    motePos[i * 3 + 1] = -0.3 + Math.random() * 2.6;
    motePos[i * 3 + 2] = -1.6 + Math.random() * 3.4;

    const c = Math.random() > 0.45 ? palette[3] : palette[2];
    moteCol[i * 3] = c.r;
    moteCol[i * 3 + 1] = c.g;
    moteCol[i * 3 + 2] = c.b;
    moteSize[i] = 2.0 + Math.random() * 2.2;
    motePhase[i] = Math.random() * Math.PI * 2;
    moteSpeed[i] = 0.5 + Math.random() * 0.9;
  }

  const moteGeo = new THREE.BufferGeometry();
  moteGeo.setAttribute('position', new THREE.BufferAttribute(motePos, 3));
  moteGeo.setAttribute('aColor', new THREE.BufferAttribute(moteCol, 3));
  moteGeo.setAttribute('aSize', new THREE.BufferAttribute(moteSize, 1));
  moteGeo.setAttribute('aPhase', new THREE.BufferAttribute(motePhase, 1));
  moteGeo.setAttribute('aSpeed', new THREE.BufferAttribute(moteSpeed, 1));

  const moteMat = material.clone();
  const motes = new THREE.Points(moteGeo, moteMat);
  motes.frustumCulled = false;
  group.add(motes);

  return {
    group,
    update(elapsed: number, reducedMotion: boolean) {
      const t = reducedMotion ? 0 : elapsed;
      material.uniforms.uTime.value = t;
      moteMat.uniforms.uTime.value = t * 1.15;
    },
    setPixelRatio(pixelRatio: number) {
      material.uniforms.uPixelRatio.value = pixelRatio;
      moteMat.uniforms.uPixelRatio.value = pixelRatio;
    },
    dispose() {
      geometry.dispose();
      material.dispose();
      moteGeo.dispose();
      moteMat.dispose();
    },
  };
}
