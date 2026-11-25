import * as THREE from 'three';

export interface StarfieldRig {
  group: THREE.Group;
  update: (elapsed: number, scrollVelocity: number, reducedMotion: boolean) => void;
  setPixelRatio: (pixelRatio: number) => void;
  dispose: () => void;
}

export function createStarfield(starCount = 1500): StarfieldRig {
  const group = new THREE.Group();

  const positions = new Float32Array(starCount * 3);
  const colors = new Float32Array(starCount * 3);
  const sizes = new Float32Array(starCount);
  const phases = new Float32Array(starCount);
  const speeds = new Float32Array(starCount);

  const palette = [
    new THREE.Color('#ffffff'),
    new THREE.Color('#ede9fe'),
    new THREE.Color('#c084fc'),
    new THREE.Color('#e879f9'),
    new THREE.Color('#67e8f9'),
    new THREE.Color('#a5b4fc'),
  ];

  // Spread across the entire 3D journey corridor (z = +24 down to z = -42)
  for (let i = 0; i < starCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 44;
    positions[i * 3 + 1] = (Math.random() - 0.45) * 26;
    positions[i * 3 + 2] = 24 - Math.random() * 68;

    const r = Math.random();
    let col: THREE.Color;
    if (r < 0.46) col = palette[0];
    else if (r < 0.64) col = palette[1];
    else if (r < 0.78) col = palette[2];
    else if (r < 0.87) col = palette[3];
    else if (r < 0.94) col = palette[4];
    else col = palette[5];

    colors[i * 3] = col.r;
    colors[i * 3 + 1] = col.g;
    colors[i * 3 + 2] = col.b;

    const isAccent = Math.random() > 0.92;
    sizes[i] = isAccent ? 3.8 + Math.random() * 3.0 : 1.1 + Math.random() * 1.9;
    phases[i] = Math.random() * Math.PI * 2;
    speeds[i] = 0.65 + Math.random() * 1.75;
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
      uVelocity: { value: 0 },
    },
    vertexShader: /* glsl */ `
      attribute vec3 aColor;
      attribute float aSize;
      attribute float aPhase;
      attribute float aSpeed;

      uniform float uTime;
      uniform float uPixelRatio;
      uniform float uVelocity;

      varying vec3 vColor;
      varying float vAlpha;

      void main() {
        vColor = aColor;

        vec3 pos = position;
        pos.x += sin(uTime * 0.08 * aSpeed + aPhase) * 0.16;
        pos.y += cos(uTime * 0.06 * aSpeed + aPhase * 1.3) * 0.12;
        pos.z += uVelocity * 0.35;

        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
        gl_Position = projectionMatrix * mvPosition;

        float twinkle = 0.52 + 0.48 * sin(uTime * aSpeed + aPhase);
        vAlpha = twinkle;

        float dist = max(-mvPosition.z, 1.0);
        gl_PointSize = aSize * uPixelRatio * (18.0 / dist) * (0.85 + 0.25 * twinkle);
      }
    `,
    fragmentShader: /* glsl */ `
      varying vec3 vColor;
      varying float vAlpha;

      void main() {
        vec2 uv = gl_PointCoord - vec2(0.5);
        float d = length(uv);
        if (d > 0.5) discard;

        float core = smoothstep(0.5, 0.03, d);
        float glow = pow(core, 2.25);
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

  return {
    group,
    update(elapsed: number, scrollVelocity: number, reducedMotion: boolean) {
      material.uniforms.uTime.value = reducedMotion ? 0 : elapsed;
      material.uniforms.uVelocity.value = reducedMotion ? 0 : scrollVelocity;
    },
    setPixelRatio(pixelRatio: number) {
      material.uniforms.uPixelRatio.value = pixelRatio;
    },
    dispose() {
      geometry.dispose();
      material.dispose();
    },
  };
}
