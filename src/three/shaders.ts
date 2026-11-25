import * as THREE from 'three';

/**
 * Custom GLSL Fresnel Glass & Iridescence ShaderMaterial
 * Used on floating architectural shards and crystal social badges.
 */
export function createFresnelGlassMaterial(options?: {
  baseColor?: number;
  fresnelColor?: number;
  accentColor?: number;
  opacity?: number;
}): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uHover: { value: 0 },
      uBaseColor: { value: new THREE.Color(options?.baseColor ?? 0x0b0e20) },
      uFresnelColor: { value: new THREE.Color(options?.fresnelColor ?? 0xa855f7) },
      uAccentColor: { value: new THREE.Color(options?.accentColor ?? 0x22d3ee) },
      uOpacity: { value: options?.opacity ?? 0.84 },
    },
    vertexShader: /* glsl */ `
      uniform float uTime;
      uniform float uHover;

      varying vec3 vNormal;
      varying vec3 vWorldPos;
      varying vec2 vUv;

      void main() {
        vUv = uv;
        vec3 pos = position;
        // Subtle organic breath on hover
        float ripple = sin(pos.y * 4.0 + uTime * 2.4) * 0.012 * uHover;
        pos += normal * ripple;

        vec4 worldPosition = modelMatrix * vec4(pos, 1.0);
        vWorldPos = worldPosition.xyz;
        vNormal = normalize(mat3(modelMatrix) * normal);

        gl_Position = projectionMatrix * viewMatrix * worldPosition;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform float uHover;
      uniform vec3 uBaseColor;
      uniform vec3 uFresnelColor;
      uniform vec3 uAccentColor;
      uniform float uOpacity;

      varying vec3 vNormal;
      varying vec3 vWorldPos;
      varying vec2 vUv;

      void main() {
        vec3 viewDir = normalize(cameraPosition - vWorldPos);
        float ndotv = clamp(abs(dot(viewDir, normalize(vNormal))), 0.0, 1.0);
        float fresnel = pow(1.0 - ndotv, 2.35);

        // Animated spectral rim gradient between violet and cyan
        float wave = 0.5 + 0.5 * sin(vWorldPos.y * 1.4 - uTime * 0.9 + vWorldPos.x * 0.8);
        vec3 rimColor = mix(uFresnelColor, uAccentColor, wave * 0.65);

        // Subtle crystalline facet shimmer
        float scan = smoothstep(0.45, 0.98, sin(vWorldPos.y * 6.0 + uTime * 1.5) * 0.5 + 0.5) * 0.08;

        vec3 finalColor = mix(uBaseColor, rimColor, fresnel * (0.88 + uHover * 0.45));
        finalColor += rimColor * (scan + uHover * 0.25);

        float alpha = clamp(uOpacity * (0.38 + fresnel * 0.72 + uHover * 0.16), 0.12, 0.98);
        gl_FragColor = vec4(finalColor, alpha);
      }
    `,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
}

/**
 * Custom GLSL Procedural Energy Distortion Core Shader
 * Used as the centerpiece artifact in Experience 04 (Contact).
 */
export function createEnergyCoreMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uPrimaryColor: { value: new THREE.Color(0x9333ea) },
      uSecondaryColor: { value: new THREE.Color(0x22d3ee) },
      uCoreColor: { value: new THREE.Color(0xf5f3ff) },
    },
    vertexShader: /* glsl */ `
      uniform float uTime;

      varying vec3 vNormal;
      varying vec3 vWorldPos;
      varying float vNoise;

      // Lightweight trigonometric 3D harmonic field
      float harmonicField(vec3 p, float t) {
        return sin(p.x * 3.1 + t * 1.3) * cos(p.y * 2.9 - t * 1.1) * sin(p.z * 3.3 + t * 0.9)
             + 0.45 * sin(p.y * 6.2 + t * 2.1 + p.x * 2.0);
      }

      void main() {
        float n = harmonicField(position, uTime);
        vNoise = n;

        vec3 displaced = position + normal * (n * 0.085);
        vec4 worldPos = modelMatrix * vec4(displaced, 1.0);
        vWorldPos = worldPos.xyz;
        vNormal = normalize(mat3(modelMatrix) * normal);

        gl_Position = projectionMatrix * viewMatrix * worldPos;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform vec3 uPrimaryColor;
      uniform vec3 uSecondaryColor;
      uniform vec3 uCoreColor;

      varying vec3 vNormal;
      varying vec3 vWorldPos;
      varying float vNoise;

      void main() {
        vec3 viewDir = normalize(cameraPosition - vWorldPos);
        float ndotv = clamp(dot(viewDir, normalize(vNormal)), 0.0, 1.0);
        float fresnel = pow(1.0 - ndotv, 2.2);

        float energyBand = smoothstep(-0.35, 0.75, vNoise);
        vec3 bodyCol = mix(vec3(0.05, 0.04, 0.14), uPrimaryColor, energyBand * 0.85);
        vec3 rimCol = mix(uPrimaryColor, uSecondaryColor, 0.5 + 0.5 * sin(uTime * 0.8 + vNoise * 2.0));

        vec3 col = bodyCol + rimCol * fresnel * 1.65;
        col += uCoreColor * pow(fresnel, 4.0) * 0.65;

        gl_FragColor = vec4(col, 1.0);
      }
    `,
  });
}

/**
 * Custom GLSL Volumetric Light Beam Shader
 * Creates soft depth-faded atmospheric shafts in the 3D universe.
 */
export function createVolumetricBeamMaterial(colorHex = 0x8b5cf6, opacity = 0.11): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(colorHex) },
      uOpacity: { value: opacity },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vWorldPos;

      void main() {
        vUv = uv;
        vec4 worldPos = modelMatrix * vec4(position, 1.0);
        vWorldPos = worldPos.xyz;
        vNormal = normalize(mat3(modelMatrix) * normal);
        gl_Position = projectionMatrix * viewMatrix * worldPos;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform vec3 uColor;
      uniform float uOpacity;

      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vWorldPos;

      void main() {
        vec3 viewDir = normalize(cameraPosition - vWorldPos);
        float edgeFade = pow(abs(dot(viewDir, normalize(vNormal))), 1.8);
        float verticalFade = smoothstep(0.0, 0.25, vUv.y) * smoothstep(1.0, 0.12, vUv.y);
        float shimmer = 0.82 + 0.18 * sin(uTime * 0.9 + vUv.y * 6.0);

        float alpha = edgeFade * verticalFade * uOpacity * shimmer;
        gl_FragColor = vec4(uColor, alpha);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
  });
}

/**
 * Custom GLSL Deep Cosmic Nebula Sky Sphere Shader
 * Provides subtle gradient atmosphere & drifting dark-violet nebula wisps.
 */
export function createNebulaBackdropMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uScrollProgress: { value: 0 },
    },
    vertexShader: /* glsl */ `
      varying vec3 vDir;
      void main() {
        vDir = normalize(position);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform float uScrollProgress;
      varying vec3 vDir;

      float waveNoise(vec3 p) {
        return sin(p.x * 2.5 + uTime * 0.08) * cos(p.y * 3.1 - uTime * 0.06) * sin(p.z * 2.2);
      }

      void main() {
        vec3 d = normalize(vDir);
        float horizon = smoothstep(-0.6, 0.65, d.y);

        vec3 abyss = vec3(0.012, 0.015, 0.045);
        vec3 deepIndigo = vec3(0.032, 0.024, 0.092);
        vec3 violetMist = vec3(0.11, 0.045, 0.22);
        vec3 cyanHint = vec3(0.025, 0.095, 0.16);

        float n1 = smoothstep(-0.2, 0.8, waveNoise(d * 1.4));
        float n2 = smoothstep(-0.1, 0.9, waveNoise(d * 2.3 + vec3(1.4, -0.7, 0.9)));

        vec3 col = mix(abyss, deepIndigo, horizon * 0.75);
        col += violetMist * n1 * (0.28 + 0.14 * sin(uScrollProgress * 6.2831));
        col += cyanHint * n2 * 0.18;

        gl_FragColor = vec4(col, 1.0);
      }
    `,
    side: THREE.BackSide,
    depthWrite: false,
  });
}

/**
 * Subtle Radial Chromatic Aberration Post-Processing Shader
 * Reacts softly to scroll travel velocity for an editorial WebGL cinema feel.
 */
export const ChromaticAberrationShader = {
  uniforms: {
    tDiffuse: { value: null },
    uAmount: { value: 0.0012 },
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float uAmount;
    varying vec2 vUv;

    void main() {
      vec2 dir = vUv - vec2(0.5);
      float dist = length(dir);
      vec2 offset = dir * uAmount * dist;

      float r = texture2D(tDiffuse, vUv - offset).r;
      float g = texture2D(tDiffuse, vUv).g;
      float b = texture2D(tDiffuse, vUv + offset).b;
      float a = texture2D(tDiffuse, vUv).a;

      gl_FragColor = vec4(r, g, b, a);
    }
  `,
};
