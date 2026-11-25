import gsap from 'gsap';
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { cosmicAudio } from '../audio/ambientAudio';
import type { SocialLinkItem } from '../data/socialLinks';
import { ChromaticAberrationShader } from '../three/shaders';
import { createStarfield } from '../three/starfieldBuilder';
import { createUniverseEnvironment } from '../three/universeBuilder';
import { createWorkstation } from '../three/workstationBuilder';

export interface HoveredCrystalInfo {
  link: SocialLinkItem;
  screenX: number;
  screenY: number;
}

interface WorkstationCanvasProps {
  scrollProgressRef: React.MutableRefObject<number>;
  scrollVelocityRef: React.MutableRefObject<number>;
  onLoadProgress?: (progress: number, ready: boolean) => void;
  onHoverCrystal?: (info: HoveredCrystalInfo | null) => void;
}

function detectSoftwareWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param) ?? '');
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return true;
  }
}

function triggerAnchorNavigation(link: SocialLinkItem): void {
  const a = document.createElement('a');
  a.href = link.url;
  if (!link.isEmail) {
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
  }
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// Pre-allocated math objects for zero-GC render loop
const _projVec = new THREE.Vector3();
const _lookTarget = new THREE.Vector3();

export const WorkstationCanvas: React.FC<WorkstationCanvasProps> = ({
  scrollProgressRef,
  scrollVelocityRef,
  onLoadProgress,
  onHoverCrystal,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [contextLost, setContextLost] = useState(false);

  const callbacksRef = useRef({ onLoadProgress, onHoverCrystal });
  callbacksRef.current = { onLoadProgress, onHoverCrystal };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const isSoftwareGl = detectSoftwareWebGL();
    const isMobile = window.innerWidth < 768;
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let prefersReducedMotion = reducedMotionQuery.matches;

    const onMotionChange = (e: MediaQueryListEvent) => {
      prefersReducedMotion = e.matches;
    };
    reducedMotionQuery.addEventListener('change', onMotionChange);

    callbacksRef.current.onLoadProgress?.(18, false);

    // 1. Initialize WebGLRenderer
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        powerPreference: 'high-performance',
      });
    } catch {
      setContextLost(true);
      callbacksRef.current.onLoadProgress?.(100, true);
      return () => {
        reducedMotionQuery.removeEventListener('change', onMotionChange);
      };
    }

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;
    const pixelRatio = isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2);

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    container.appendChild(renderer.domElement);

    const handleContextLost = (e: Event) => {
      e.preventDefault();
      setContextLost(true);
    };
    const handleContextRestored = () => {
      setContextLost(false);
    };
    renderer.domElement.addEventListener('webglcontextlost', handleContextLost);
    renderer.domElement.addEventListener('webglcontextrestored', handleContextRestored);

    // 2. Scene, Fog & Studio Environment
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x03040c);
    scene.fog = new THREE.FogExp2(0x03040c, 0.024);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const roomEnv = new RoomEnvironment();
    const envTarget = pmremGenerator.fromScene(roomEnv, 0.04);
    scene.environment = envTarget.texture;
    roomEnv.dispose();
    pmremGenerator.dispose();

    callbacksRef.current.onLoadProgress?.(45, false);

    // 3. Camera
    const camera = new THREE.PerspectiveCamera(isMobile ? 48 : 40, width / height, 0.1, 110);

    // 4. Lighting Rig
    const hemiLight = new THREE.HemisphereLight(0xb4c6fc, 0x160c2b, 0.7);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff5ec, 1.5);
    keyLight.position.set(3.4, 5.8, 4.8);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.camera.near = 1;
    keyLight.shadow.camera.far = 18;
    const d = 4.2;
    keyLight.shadow.camera.left = -d;
    keyLight.shadow.camera.right = d;
    keyLight.shadow.camera.top = d;
    keyLight.shadow.camera.bottom = -d;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xa855f7, 1.45);
    rimLight.position.set(-4.5, 3.6, -4.0);
    scene.add(rimLight);

    const fillLight = new THREE.DirectionalLight(0x22d3ee, 0.6);
    fillLight.position.set(4.5, 2.0, 2.5);
    scene.add(fillLight);

    // 5. Build 3D World Objects (Starfield + Universe Landmarks + Central Workstation)
    const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();
    const starfield = createStarfield(isMobile ? 650 : 1550);
    scene.add(starfield.group);

    const universe = createUniverseEnvironment(maxAnisotropy, isMobile);
    scene.add(universe.group);

    callbacksRef.current.onLoadProgress?.(72, false);

    const workstation = createWorkstation(maxAnisotropy, isSoftwareGl);
    workstation.group.position.set(0, -0.58, 0);
    workstation.group.rotation.y = 0.16;
    scene.add(workstation.group);

    // 6. Post-Processing Pipeline: RenderPass -> UnrealBloomPass -> ChromaticAberration -> OutputPass
    let composer: EffectComposer | null = null;
    let bloomPass: UnrealBloomPass | null = null;
    let chromaPass: ShaderPass | null = null;

    if (!isSoftwareGl) {
      composer = new EffectComposer(renderer);
      composer.setPixelRatio(pixelRatio);
      composer.setSize(width, height);

      composer.addPass(new RenderPass(scene, camera));

      bloomPass = new UnrealBloomPass(
        new THREE.Vector2(width, height),
        0.5,
        0.46,
        0.74
      );
      composer.addPass(bloomPass);

      chromaPass = new ShaderPass(ChromaticAberrationShader);
      chromaPass.uniforms.uAmount.value = 0.0009;
      composer.addPass(chromaPass);

      composer.addPass(new OutputPass());
    }

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // 7. Closed-Loop GSAP Camera Choreography (0.00 -> 0.25 -> 0.50 -> 0.75 -> 1.00 == 0.00)
    const introState = {
      px: 0,
      py: 1.35,
      pz: 13.7,
      lx: 0,
      ly: 0.65,
      lz: 2.0,
      keyIntensity: 1.4,
    };

    const camRig = {
      ...introState,
      introOffsetZ: prefersReducedMotion ? 0 : 5.8,
    };

    const zWorkspace = isMobile ? 6.2 : 4.55;
    const zConnect = isMobile ? -5.8 : -7.1;
    const zContact = isMobile ? -19.2 : -20.5;

    // Intro reveal glide after load
    const introTween = prefersReducedMotion
      ? null
      : gsap.to(camRig, {
          introOffsetZ: 0,
          duration: 2.0,
          ease: 'power3.out',
        });

    // Closed-loop timeline paused and scrubbed via shortest-path wrapped Lenis progress
    const loopTimeline = gsap.timeline({ paused: true });

    // t=0.00 (Intro) -> t=1.00 (Workspace) [progress 0.00 -> 0.25]
    loopTimeline.set(camRig, introState, 0);
    loopTimeline.to(
      camRig,
      {
        px: isMobile ? 0.15 : 0.68,
        py: isMobile ? 1.48 : 1.28,
        pz: zWorkspace,
        lx: isMobile ? 0 : -0.1,
        ly: 0.22,
        lz: -0.22,
        keyIntensity: 2.25,
        duration: 1,
        ease: 'power2.inOut',
      },
      0
    );

    // t=1.00 (Workspace) -> t=2.00 (Connect Crystals) [progress 0.25 -> 0.50]
    loopTimeline.to(
      camRig,
      {
        px: 0,
        py: 0.45,
        pz: zConnect,
        lx: 0,
        ly: 0.15,
        lz: -13.6,
        keyIntensity: 1.65,
        duration: 1,
        ease: 'power2.inOut',
      },
      1
    );

    // t=2.00 (Connect) -> t=3.00 (Contact Singularity) [progress 0.50 -> 0.75]
    loopTimeline.to(
      camRig,
      {
        px: 0,
        py: 0.28,
        pz: zContact,
        lx: 0,
        ly: 0.15,
        lz: -26.5,
        keyIntensity: 1.85,
        duration: 1,
        ease: 'power2.inOut',
      },
      2
    );

    // t=3.00 (Contact) -> t=3.50 (Aerial Cosmic Flyover) -> t=4.00 (Seamless return to Intro) [progress 0.75 -> 1.00]
    loopTimeline.to(
      camRig,
      {
        px: isMobile ? -5.8 : -8.6,
        py: isMobile ? 4.8 : 5.2,
        pz: -4.0,
        lx: 0,
        ly: 0.2,
        lz: -2.0,
        keyIntensity: 1.55,
        duration: 0.5,
        ease: 'sine.inOut',
      },
      3
    );
    loopTimeline.to(
      camRig,
      {
        ...introState,
        duration: 0.5,
        ease: 'sine.inOut',
      },
      3.5
    );

    // 8. Raycasting & Pointer Parallax State
    const pointerNdc = new THREE.Vector2(0, 0);
    let targetParX = 0;
    let targetParY = 0;
    let smoothParX = 0;
    let smoothParY = 0;

    const raycaster = new THREE.Raycaster();
    let hoveredCrystalIdx: number | null = null;
    let lastRaycastTime = 0;

    const handlePointerMove = (e: PointerEvent) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = -(e.clientY / window.innerHeight) * 2 + 1;
      pointerNdc.set(nx, ny);

      if (!prefersReducedMotion) {
        targetParX = THREE.MathUtils.clamp(nx, -1, 1);
        targetParY = THREE.MathUtils.clamp(ny, -1, 1);
      }

      const now = performance.now();
      if (now - lastRaycastTime < 28) return;
      lastRaycastTime = now;

      raycaster.setFromCamera(pointerNdc, camera);
      const hits = raycaster.intersectObjects(universe.hitProxies, false);

      if (hits.length > 0 && hits[0].distance < 22) {
        const idx = hits[0].object.userData.socialIndex as number;
        if (idx !== hoveredCrystalIdx) {
          hoveredCrystalIdx = idx;
          cosmicAudio.playCrystalChime(idx);
        }
        const badge = universe.crystalBadges[idx];
        _projVec.copy(badge.group.position);
        _projVec.y += 0.62;
        _projVec.project(camera);

        const screenX = ((_projVec.x + 1) / 2) * window.innerWidth;
        const screenY = ((-_projVec.y + 1) / 2) * window.innerHeight;
        callbacksRef.current.onHoverCrystal?.({
          link: badge.link,
          screenX,
          screenY,
        });
      } else if (hoveredCrystalIdx !== null) {
        hoveredCrystalIdx = null;
        callbacksRef.current.onHoverCrystal?.(null);
      }
    };

    const handleCanvasClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest('a, button, [role="button"]')) return;

      if (hoveredCrystalIdx !== null) {
        const badge = universe.crystalBadges[hoveredCrystalIdx];
        if (badge) {
          cosmicAudio.playCrystalChime(hoveredCrystalIdx + 2);
          triggerAnchorNavigation(badge.link);
        }
      }
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('click', handleCanvasClick);

    // 9. Resize Handling
    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth || window.innerWidth;
      const newH = container.clientHeight || window.innerHeight;
      const pr = isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2);

      camera.aspect = newW / Math.max(newH, 1);
      camera.fov = newW < 768 ? 48 : 40;
      camera.updateProjectionMatrix();

      renderer.setPixelRatio(pr);
      renderer.setSize(newW, newH);
      starfield.setPixelRatio(pr);

      if (composer) {
        composer.setPixelRatio(pr);
        composer.setSize(newW, newH);
      }
      if (bloomPass) {
        bloomPass.resolution.set(newW, newH);
      }
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);
    window.addEventListener('resize', handleResize);

    const readyTimer = window.setTimeout(() => {
      callbacksRef.current.onLoadProgress?.(100, true);
    }, 550);

    // 10. Render Loop with Circular Progress Wrapping
    const clock = new THREE.Clock();
    let frameId = 0;
    let disposed = false;
    let smoothProgress = scrollProgressRef.current;
    let smoothVelocity = 0;

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      if (!gl || typeof gl.fenceSync !== 'function') {
        frameId = window.setTimeout(cb, 80);
        return;
      }
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        if (disposed) {
          if (sync) gl.deleteSync(sync);
          return;
        }
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    function tick() {
      if (disposed) return;

      const delta = Math.min(clock.getDelta(), 0.1);
      const elapsed = clock.getElapsedTime();

      // Circular shortest-path progress interpolation so 1.0 <-> 0.0 never rewinds
      const targetProgress = ((scrollProgressRef.current % 1) + 1) % 1;
      if (prefersReducedMotion) {
        smoothProgress = targetProgress;
      } else {
        let diff = targetProgress - smoothProgress;
        if (diff > 0.5) diff -= 1;
        if (diff < -0.5) diff += 1;
        const alpha = 1 - Math.exp(-10 * delta);
        smoothProgress = (((smoothProgress + diff * alpha) % 1) + 1) % 1;
      }
      loopTimeline.progress(smoothProgress);

      const rawVel = THREE.MathUtils.clamp(scrollVelocityRef.current * 0.12, -10, 10);
      smoothVelocity = THREE.MathUtils.damp(smoothVelocity, rawVel, 7, delta);

      // Mouse parallax damping
      if (prefersReducedMotion) {
        smoothParX = 0;
        smoothParY = 0;
      } else {
        smoothParX = THREE.MathUtils.damp(smoothParX, targetParX, 4.2, delta);
        smoothParY = THREE.MathUtils.damp(smoothParY, targetParY, 4.2, delta);
      }

      camera.position.set(
        camRig.px + smoothParX * 0.42,
        camRig.py + smoothParY * 0.24,
        camRig.pz + camRig.introOffsetZ
      );
      _lookTarget.set(camRig.lx + smoothParX * 0.14, camRig.ly + smoothParY * 0.08, camRig.lz);
      camera.lookAt(_lookTarget);

      keyLight.intensity = camRig.keyIntensity;

      // Update 3D world modules
      starfield.update(elapsed, smoothVelocity, prefersReducedMotion);
      universe.update(elapsed, delta, smoothProgress, hoveredCrystalIdx, pointerNdc, prefersReducedMotion);
      workstation.update(elapsed, delta, prefersReducedMotion);

      if (hoveredCrystalIdx !== null) {
        const badge = universe.crystalBadges[hoveredCrystalIdx];
        if (badge) {
          _projVec.copy(badge.group.position);
          _projVec.y += 0.62;
          _projVec.project(camera);
          callbacksRef.current.onHoverCrystal?.({
            link: badge.link,
            screenX: ((_projVec.x + 1) / 2) * window.innerWidth,
            screenY: ((-_projVec.y + 1) / 2) * window.innerHeight,
          });
        }
      }

      if (chromaPass && !prefersReducedMotion) {
        chromaPass.uniforms.uAmount.value = 0.0008 + Math.min(Math.abs(smoothVelocity) * 0.00028, 0.0024);
      }

      if (composer && !isSoftwareGl) {
        composer.render();
      } else {
        renderer.render(scene, camera);
      }

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    }

    tick();

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      clearTimeout(readyTimer);

      introTween?.kill();
      loopTimeline.kill();

      reducedMotionQuery.removeEventListener('change', onMotionChange);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('click', handleCanvasClick);
      window.removeEventListener('resize', handleResize);
      resizeObserver.disconnect();

      renderer.domElement.removeEventListener('webglcontextlost', handleContextLost);
      renderer.domElement.removeEventListener('webglcontextrestored', handleContextRestored);

      starfield.dispose();
      universe.dispose();
      workstation.dispose();
      envTarget.dispose();
      composer?.dispose();
      renderer.dispose();

      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [scrollProgressRef, scrollVelocityRef]);

  return (
    <div className="relative w-full h-full">
      <div
        ref={mountRef}
        className="w-full h-full"
        aria-label="Interactive 3D Digital Universe by Tharvesh"
      />
      {contextLost && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center bg-[#03040c] text-purple-200/85 px-6 text-center"
          role="status"
        >
          <p className="font-display text-lg font-semibold text-white">
            3D WebGL Environment Unavailable
          </p>
          <p className="mt-2 max-w-md text-sm text-purple-200/70">
            All portfolio chapters and social destinations remain accessible below.
          </p>
        </div>
      )}
    </div>
  );
};
