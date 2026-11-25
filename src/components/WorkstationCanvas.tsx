import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { createStarfield } from '../three/starfieldBuilder';
import { createWorkstation } from '../three/workstationBuilder';

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

export const WorkstationCanvas: React.FC = () => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [contextLost, setContextLost] = useState(false);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const isSoftwareGl = detectSoftwareWebGL();
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let prefersReducedMotion = reducedMotionQuery.matches;

    const onMotionChange = (e: MediaQueryListEvent) => {
      prefersReducedMotion = e.matches;
    };
    reducedMotionQuery.addEventListener('change', onMotionChange);

    // Initialize Renderer
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        powerPreference: 'high-performance',
      });
    } catch {
      setContextLost(true);
      return () => {
        reducedMotionQuery.removeEventListener('change', onMotionChange);
      };
    }

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;
    const pixelRatio = isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2);

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
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

    // Scene & Cosmic Fog
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050611);
    scene.fog = new THREE.FogExp2(0x050611, 0.036);

    // Studio Environment Map (RoomEnvironment)
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const roomEnv = new RoomEnvironment();
    const envTarget = pmremGenerator.fromScene(roomEnv, 0.04);
    scene.environment = envTarget.texture;
    roomEnv.dispose();
    pmremGenerator.dispose();

    // Camera
    const camera = new THREE.PerspectiveCamera(39, width / height, 0.1, 80);

    // Three-Point Studio + Cosmic Accent Lighting
    const hemiLight = new THREE.HemisphereLight(0xb4c6fc, 0x1a1030, 0.72);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff4ea, 2.15);
    keyLight.position.set(3.2, 5.8, 4.4);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.camera.near = 1;
    keyLight.shadow.camera.far = 16;
    const d = 3.8;
    keyLight.shadow.camera.left = -d;
    keyLight.shadow.camera.right = d;
    keyLight.shadow.camera.top = d;
    keyLight.shadow.camera.bottom = -d;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xa855f7, 1.45);
    rimLight.position.set(-4.2, 3.2, -3.5);
    scene.add(rimLight);

    const fillLight = new THREE.DirectionalLight(0x38bdf8, 0.55);
    fillLight.position.set(4.5, 2.2, 2.6);
    scene.add(fillLight);

    // Build Starfield & Workstation
    const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();
    const starfield = createStarfield(1150);
    scene.add(starfield.group);

    const workstation = createWorkstation(maxAnisotropy, isSoftwareGl);
    scene.add(workstation.group);

    // Subtle OrbitControls (drag to inspect desk, zoom disabled to preserve layout)
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.055;
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.minPolarAngle = Math.PI / 4.2;
    controls.maxPolarAngle = Math.PI / 2.08;
    controls.minAzimuthAngle = -Math.PI / 4.5;
    controls.maxAzimuthAngle = Math.PI / 4.5;

    // Post-Processing (GPU only)
    let composer: EffectComposer | null = null;
    let bloomPass: UnrealBloomPass | null = null;
    if (!isSoftwareGl) {
      composer = new EffectComposer(renderer);
      const renderPass = new RenderPass(scene, camera);
      composer.addPass(renderPass);

      bloomPass = new UnrealBloomPass(
        new THREE.Vector2(width, height),
        0.42, // strength
        0.35, // radius
        0.84 // threshold
      );
      composer.addPass(bloomPass);
    }

    // Responsive Framing: Center-left on desktop via setViewOffset, centered on tablet/mobile
    let baseWorkstationRotY = 0.14;
    const applyResponsiveFraming = (w: number, h: number) => {
      const aspect = w / Math.max(h, 1);
      camera.aspect = aspect;

      if (w >= 1024) {
        // Desktop: Shift frustum so workstation sits cleanly in center-left below intro,
        // leaving the right-side social column completely unobstructed.
        workstation.group.position.set(0, -0.58, 0);
        const scale = w < 1280 ? 0.88 : 0.94;
        workstation.group.scale.setScalar(scale);
        baseWorkstationRotY = 0.15;

        camera.fov = 38;
        camera.position.set(0.32, 1.5, 5.85);
        controls.target.set(0, 0.08, 0);
        camera.setViewOffset(w, h, Math.round(w * 0.15), -Math.round(h * 0.07), w, h);
      } else if (w >= 640) {
        // Tablet
        camera.clearViewOffset();
        workstation.group.position.set(0, -0.45, 0);
        workstation.group.scale.setScalar(0.86);
        baseWorkstationRotY = 0.12;

        camera.fov = 40;
        camera.position.set(0.15, 1.35, 5.45);
        controls.target.set(0, -0.02, 0);
      } else {
        // Mobile
        camera.clearViewOffset();
        workstation.group.position.set(0, -0.34, 0);
        workstation.group.scale.setScalar(0.76);
        baseWorkstationRotY = 0.1;

        camera.fov = 44;
        camera.position.set(0.15, 1.35, 5.85);
        controls.target.set(0, 0.02, 0);
      }

      camera.updateProjectionMatrix();
      controls.update();
    };

    applyResponsiveFraming(width, height);

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // Pointer Parallax State
    let targetPointerX = 0;
    let targetPointerY = 0;
    let smoothPointerX = 0;
    let smoothPointerY = 0;

    const handlePointerMove = (e: PointerEvent) => {
      if (prefersReducedMotion) return;
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      targetPointerX = THREE.MathUtils.clamp(nx, -1, 1);
      targetPointerY = THREE.MathUtils.clamp(ny, -1, 1);
    };
    window.addEventListener('pointermove', handlePointerMove, { passive: true });

    // Resize Handling
    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth || window.innerWidth;
      const newH = container.clientHeight || window.innerHeight;
      const pr = isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2);

      renderer.setPixelRatio(pr);
      renderer.setSize(newW, newH);
      if (composer) {
        composer.setSize(newW, newH);
      }
      if (bloomPass) {
        bloomPass.resolution.set(newW, newH);
      }
      applyResponsiveFraming(newW, newH);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);
    window.addEventListener('resize', handleResize);

    // Animation Loop (with software WebGL pacing via afterDraw)
    const clock = new THREE.Clock();
    let frameId = 0;
    let disposed = false;

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

      // Smooth pointer parallax damped into workstation orientation
      if (prefersReducedMotion) {
        smoothPointerX = 0;
        smoothPointerY = 0;
      } else {
        smoothPointerX = THREE.MathUtils.damp(smoothPointerX, targetPointerX, 3.8, delta);
        smoothPointerY = THREE.MathUtils.damp(smoothPointerY, targetPointerY, 3.8, delta);
      }

      workstation.group.rotation.y = baseWorkstationRotY + smoothPointerX * 0.065;
      workstation.group.rotation.x = smoothPointerY * 0.028;

      starfield.update(elapsed, prefersReducedMotion);
      workstation.update(elapsed, delta, prefersReducedMotion);

      controls.update();

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

      reducedMotionQuery.removeEventListener('change', onMotionChange);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('resize', handleResize);
      resizeObserver.disconnect();

      renderer.domElement.removeEventListener('webglcontextlost', handleContextLost);
      renderer.domElement.removeEventListener('webglcontextrestored', handleContextRestored);

      controls.dispose();
      starfield.dispose();
      workstation.dispose();
      envTarget.dispose();
      composer?.dispose();
      renderer.dispose();

      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="relative w-full h-full">
      <div
        ref={mountRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        aria-label="Interactive 3D Developer Workstation Scene"
      />
      {contextLost && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-[#050611] text-purple-200/80 text-sm"
          role="status"
        >
          3D viewport paused — cosmic workspace active.
        </div>
      )}
    </div>
  );
};
