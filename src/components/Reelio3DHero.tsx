import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

export type Scene3DTheme = 'neon' | 'amber' | 'cyber';
export type CameraPreset = 'cinematic' | 'front' | 'top' | 'orbit';

interface Reelio3DHeroProps {
  theme?: Scene3DTheme;
  cameraPreset?: CameraPreset;
  autoRotate?: boolean;
  onSceneReady?: () => void;
}

export const Reelio3DHero: React.FC<Reelio3DHeroProps> = ({
  theme = 'neon',
  cameraPreset = 'cinematic',
  autoRotate = true,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  // References for animation and interactive mouse controls
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const mainGroupRef = useRef<THREE.Group | null>(null);
  const ringsGroupRef = useRef<THREE.Group | null>(null);
  const eqGroupRef = useRef<THREE.Group | null>(null);
  const orbitingTokensRef = useRef<THREE.Group | null>(null);
  const audioBarsRef = useRef<THREE.Mesh[]>([]);

  // Mouse & interaction state
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0, isDragging: false, lastX: 0, lastY: 0 });
  const manualRotRef = useRef({ x: 0, y: 0, velX: 0, velY: 0 });
  const presetTargetRef = useRef<{ x: number; y: number; z: number }>({ x: 1.8, y: 1.2, z: 4.8 });

  // Update camera preset coordinates
  useEffect(() => {
    if (cameraPreset === 'cinematic') {
      presetTargetRef.current = { x: 1.6, y: 0.9, z: 4.6 };
    } else if (cameraPreset === 'front') {
      presetTargetRef.current = { x: 0, y: 0, z: 4.8 };
    } else if (cameraPreset === 'top') {
      presetTargetRef.current = { x: 0.8, y: 3.5, z: 3.8 };
    } else if (cameraPreset === 'orbit') {
      presetTargetRef.current = { x: 2.2, y: 1.4, z: 5.0 };
    }
  }, [cameraPreset]);

  // Update theme colors dynamically
  useEffect(() => {
    if (!mainGroupRef.current) return;

    let primaryHex = 0xff007f; // neon pink
    let secondaryHex = 0x8b5cf6; // violet
    let accentHex = 0x06b6d4; // cyan

    if (theme === 'amber') {
      primaryHex = 0xf59e0b; // amber
      secondaryHex = 0xf97316; // orange
      accentHex = 0xfacc15; // yellow
    } else if (theme === 'cyber') {
      primaryHex = 0x06b6d4; // cyan
      secondaryHex = 0x3b82f6; // blue
      accentHex = 0x10b981; // emerald
    }

    // Traverse and update emissive or custom colored materials
    mainGroupRef.current.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (mesh.userData.role === 'playGlyph') {
          const mat = mesh.material as THREE.MeshStandardMaterial;
          mat.color.setHex(primaryHex);
          mat.emissive.setHex(primaryHex);
        } else if (mesh.userData.role === 'outerRing') {
          const mat = mesh.material as THREE.MeshPhysicalMaterial;
          mat.emissive.setHex(secondaryHex);
        } else if (mesh.userData.role === 'neonAura') {
          const mat = mesh.material as THREE.MeshBasicMaterial;
          mat.color.setHex(accentHex);
        }
      }
    });

    audioBarsRef.current.forEach((bar, idx) => {
      const mat = bar.material as THREE.MeshStandardMaterial;
      const t = idx / audioBarsRef.current.length;
      mat.color.setHex(t > 0.5 ? primaryHex : secondaryHex);
      mat.emissive.setHex(t > 0.5 ? primaryHex : secondaryHex);
    });
  }, [theme]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // 1. Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Soft dark background matching Reelio dark glass palette
    scene.fog = new THREE.FogExp2(0x07080f, 0.08);

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(1.6, 0.9, 4.6);
    cameraRef.current = camera;

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    container.appendChild(renderer.domElement);

    // 4. Studio Environment Lighting (RoomEnvironment PMREM)
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();
    const envTexture = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTexture;
    pmremGenerator.dispose();

    // 5. Studio 3-Point Lighting Rig
    const keyLight = new THREE.DirectionalLight(0xfff5ea, 3.2);
    keyLight.position.set(4, 5, 4);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    const hemiLight = new THREE.HemisphereLight(0x9066ff, 0x05060b, 1.8);
    scene.add(hemiLight);

    const rimLight = new THREE.PointLight(0xff007f, 4.0, 15);
    rimLight.position.set(-3.5, 2.5, -2);
    scene.add(rimLight);

    const cyanAccentLight = new THREE.PointLight(0x06b6d4, 3.5, 12);
    cyanAccentLight.position.set(2.5, -2.5, 2);
    scene.add(cyanAccentLight);

    // 6. Master Assembly: Reelio Holographic Film Reel & Play Engine (Composite THREE.Group)
    const masterGroup = new THREE.Group();
    scene.add(masterGroup);
    mainGroupRef.current = masterGroup;

    // --- Component A: Brushed Metal Outer Film Reel Housing ---
    const reelGroup = new THREE.Group();
    masterGroup.add(reelGroup);

    // Outer Rim (Torus with luxury metallic PBR)
    const outerRimGeo = new THREE.TorusGeometry(1.4, 0.08, 32, 100);
    const brushedMetalMat = new THREE.MeshPhysicalMaterial({
      color: 0x242735,
      metalness: 0.92,
      roughness: 0.18,
      clearcoat: 0.8,
      clearcoatRoughness: 0.15,
      reflectivity: 0.9,
    });
    const outerRim = new THREE.Mesh(outerRimGeo, brushedMetalMat);
    outerRim.castShadow = true;
    reelGroup.add(outerRim);

    // Inner Concentric Spoke Flange Ring
    const innerRimGeo = new THREE.TorusGeometry(0.75, 0.05, 24, 80);
    const roseGoldMat = new THREE.MeshPhysicalMaterial({
      color: 0x9333ea,
      emissive: 0x4c1d95,
      emissiveIntensity: 0.4,
      metalness: 0.85,
      roughness: 0.25,
      clearcoat: 0.5,
    });
    innerRimGeo.userData = { role: 'outerRing' };
    const innerRim = new THREE.Mesh(innerRimGeo, roseGoldMat);
    innerRim.userData = { role: 'outerRing' };
    reelGroup.add(innerRim);

    // Procedural Spokes for the Reel (6 radial spokes)
    const spokeGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.65, 16);
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      const spoke = new THREE.Mesh(spokeGeo, brushedMetalMat);
      spoke.position.set(Math.cos(angle) * 1.05, Math.sin(angle) * 1.05, 0);
      spoke.rotation.z = angle + Math.PI / 2;
      reelGroup.add(spoke);
    }

    // Circular Film Perforation Apertures around the Outer Flange (12 dots)
    const perfGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.2, 16);
    const perfMat = new THREE.MeshStandardMaterial({
      color: 0x050711,
      metalness: 0.5,
      roughness: 0.7,
    });
    for (let i = 0; i < 12; i++) {
      const angle = (i * Math.PI * 2) / 12;
      const perf = new THREE.Mesh(perfGeo, perfMat);
      perf.position.set(Math.cos(angle) * 1.25, Math.sin(angle) * 1.25, 0);
      perf.rotation.x = Math.PI / 2;
      reelGroup.add(perf);
    }

    // --- Component B: Central Optical Crystal Glass Lens ---
    const glassLensGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.16, 48);
    const opticalGlassMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.94,
      opacity: 1,
      transparent: true,
      ior: 1.55,
      roughness: 0.08,
      metalness: 0.05,
      thickness: 1.2,
      clearcoat: 1.0,
      attenuationColor: new THREE.Color(0xd8b4fe),
      attenuationDistance: 0.8,
    });
    const glassLens = new THREE.Mesh(glassLensGeo, opticalGlassMat);
    glassLens.rotation.x = Math.PI / 2;
    masterGroup.add(glassLens);

    // --- Component C: Central Glowing 3D Play Glyph ---
    // Extruded 3D equilateral triangle for the Play symbol
    const playShape = new THREE.Shape();
    const playSize = 0.28;
    playShape.moveTo(-playSize * 0.6, -playSize * 0.8);
    playShape.lineTo(-playSize * 0.6, playSize * 0.8);
    playShape.lineTo(playSize * 0.9, 0);
    playShape.closePath();

    const playExtrudeSettings = {
      depth: 0.1,
      bevelEnabled: true,
      bevelSegments: 4,
      steps: 1,
      bevelSize: 0.03,
      bevelThickness: 0.03,
    };
    const playGeo = new THREE.ExtrudeGeometry(playShape, playExtrudeSettings);
    playGeo.center();

    const playMat = new THREE.MeshStandardMaterial({
      color: 0xff007f,
      emissive: 0xff007f,
      emissiveIntensity: 1.4,
      metalness: 0.3,
      roughness: 0.2,
    });
    const playMesh = new THREE.Mesh(playGeo, playMat);
    playMesh.position.z = 0.08;
    playMesh.userData = { role: 'playGlyph' };
    masterGroup.add(playMesh);

    // Glowing Neon Aura Ring behind the Play button
    const auraGeo = new THREE.RingGeometry(0.38, 0.44, 48);
    const auraMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
    });
    const auraMesh = new THREE.Mesh(auraGeo, auraMat);
    auraMesh.position.z = -0.02;
    auraMesh.userData = { role: 'neonAura' };
    masterGroup.add(auraMesh);

    // --- Component D: Dynamic 3D Audio Equalizer Ring ---
    const eqGroup = new THREE.Group();
    masterGroup.add(eqGroup);
    eqGroupRef.current = eqGroup;

    const barGeo = new THREE.BoxGeometry(0.04, 0.25, 0.04);
    const audioBars: THREE.Mesh[] = [];
    const numBars = 36;
    for (let i = 0; i < numBars; i++) {
      const angle = (i * Math.PI * 2) / numBars;
      const barMat = new THREE.MeshStandardMaterial({
        color: i % 2 === 0 ? 0xff007f : 0x8b5cf6,
        emissive: i % 2 === 0 ? 0xff007f : 0x8b5cf6,
        emissiveIntensity: 0.9,
        roughness: 0.3,
      });
      const bar = new THREE.Mesh(barGeo, barMat);
      bar.position.set(Math.cos(angle) * 1.6, Math.sin(angle) * 1.6, 0);
      bar.rotation.z = angle - Math.PI / 2;
      bar.userData = { baseScaleY: 0.4 + Math.random() * 0.8, phase: Math.random() * Math.PI * 2 };
      eqGroup.add(bar);
      audioBars.push(bar);
    }
    audioBarsRef.current = audioBars;

    // --- Component E: Orbiting Concentric Hologram Rings ---
    const ringsGroup = new THREE.Group();
    masterGroup.add(ringsGroup);
    ringsGroupRef.current = ringsGroup;

    const orbitRing1Geo = new THREE.TorusGeometry(2.0, 0.02, 16, 100);
    const ringMat1 = new THREE.MeshBasicMaterial({
      color: 0xa855f7,
      transparent: true,
      opacity: 0.6,
    });
    const orbitRing1 = new THREE.Mesh(orbitRing1Geo, ringMat1);
    orbitRing1.rotation.x = Math.PI / 3;
    ringsGroup.add(orbitRing1);

    const orbitRing2Geo = new THREE.TorusGeometry(2.35, 0.015, 16, 100);
    const ringMat2 = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      transparent: true,
      opacity: 0.5,
    });
    const orbitRing2 = new THREE.Mesh(orbitRing2Geo, ringMat2);
    orbitRing2.rotation.y = Math.PI / 4;
    ringsGroup.add(orbitRing2);

    // --- Component F: Orbiting 3D Social Media Tokens & Prisms ---
    const orbitingGroup = new THREE.Group();
    masterGroup.add(orbitingGroup);
    orbitingTokensRef.current = orbitingGroup;

    // Token 1: 3D Faceted Heart Diamond
    const heartGeo = new THREE.OctahedronGeometry(0.18, 0);
    const heartMat = new THREE.MeshStandardMaterial({
      color: 0xff1493,
      emissive: 0xff1493,
      emissiveIntensity: 0.8,
      roughness: 0.1,
      metalness: 0.9,
    });
    const heartMesh = new THREE.Mesh(heartGeo, heartMat);
    heartMesh.position.set(2.0, 0.6, 0.4);
    orbitingGroup.add(heartMesh);

    // Token 2: 3D Camera Lens Cylinder
    const cameraTokenGeo = new THREE.CylinderGeometry(0.16, 0.16, 0.12, 24);
    const cameraTokenMat = new THREE.MeshStandardMaterial({
      color: 0x3b82f6,
      emissive: 0x1d4ed8,
      emissiveIntensity: 0.7,
      roughness: 0.2,
      metalness: 0.8,
    });
    const cameraToken = new THREE.Mesh(cameraTokenGeo, cameraTokenMat);
    cameraToken.position.set(-1.9, -0.8, 0.5);
    cameraToken.rotation.x = Math.PI / 3;
    orbitingGroup.add(cameraToken);

    // Token 3: 3D Audio Note Capsule / Disc
    const noteGeo = new THREE.TorusGeometry(0.14, 0.04, 16, 32);
    const noteMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xb45309,
      emissiveIntensity: 0.8,
      roughness: 0.2,
      metalness: 0.8,
    });
    const noteToken = new THREE.Mesh(noteGeo, noteMat);
    noteToken.position.set(0.5, -2.1, -0.3);
    orbitingGroup.add(noteToken);

    // Token 4: Sparkle Icosahedron
    const sparkleGeo = new THREE.IcosahedronGeometry(0.15, 0);
    const sparkleMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      emissive: 0x059669,
      emissiveIntensity: 0.8,
      roughness: 0.1,
      metalness: 0.9,
    });
    const sparkleMesh = new THREE.Mesh(sparkleGeo, sparkleMat);
    sparkleMesh.position.set(-1.2, 1.8, -0.2);
    orbitingGroup.add(sparkleMesh);

    // --- Component G: Ambient Starfield / Cyberpunk Nebula Particles ---
    const starCount = 650;
    const starGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    const c1 = new THREE.Color(0xff007f);
    const c2 = new THREE.Color(0x8b5cf6);
    const c3 = new THREE.Color(0x06b6d4);

    for (let i = 0; i < starCount; i++) {
      const idx = i * 3;
      starPositions[idx] = (Math.random() - 0.5) * 16;
      starPositions[idx + 1] = (Math.random() - 0.5) * 12;
      starPositions[idx + 2] = (Math.random() - 0.5) * 12 - 2;

      const pick = Math.random();
      const chosenColor = pick < 0.4 ? c1 : pick < 0.7 ? c2 : c3;
      starColors[idx] = chosenColor.r;
      starColors[idx + 1] = chosenColor.g;
      starColors[idx + 2] = chosenColor.b;
    }
    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

    const starMaterial = new THREE.PointsMaterial({
      size: 0.06,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });
    const starField = new THREE.Points(starGeometry, starMaterial);
    scene.add(starField);

    // --- Contact Shadow Plane at base ---
    const shadowGeo = new THREE.PlaneGeometry(5, 5);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.45,
      depthWrite: false,
    });
    const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -2.2;
    scene.add(shadowPlane);

    // 7. Event listeners for interactive mouse & touch drag
    const handlePointerDown = (e: PointerEvent) => {
      mouseRef.current.isDragging = true;
      mouseRef.current.lastX = e.clientX;
      mouseRef.current.lastY = e.clientY;
    };

    const handlePointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mouseRef.current.targetX = nx;
      mouseRef.current.targetY = ny;

      if (mouseRef.current.isDragging) {
        const dx = e.clientX - mouseRef.current.lastX;
        const dy = e.clientY - mouseRef.current.lastY;
        manualRotRef.current.velY += dx * 0.005;
        manualRotRef.current.velX += dy * 0.005;
        mouseRef.current.lastX = e.clientX;
        mouseRef.current.lastY = e.clientY;
      }
    };

    const handlePointerUp = () => {
      mouseRef.current.isDragging = false;
    };

    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    // Resize handler
    const handleResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // 8. Animation Loop with smooth damping
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Smooth mouse position damping
      mouseRef.current.x = THREE.MathUtils.damp(mouseRef.current.x, mouseRef.current.targetX, 4.0, delta);
      mouseRef.current.y = THREE.MathUtils.damp(mouseRef.current.y, mouseRef.current.targetY, 4.0, delta);

      // Camera position damping towards target preset
      if (cameraRef.current) {
        const target = presetTargetRef.current;
        const lookTarget = new THREE.Vector3(0, 0, 0);

        // Subtly incorporate mouse parallax
        const camTargetX = target.x + mouseRef.current.x * 0.45;
        const camTargetY = target.y + mouseRef.current.y * 0.35;

        cameraRef.current.position.x = THREE.MathUtils.damp(cameraRef.current.position.x, camTargetX, 3.5, delta);
        cameraRef.current.position.y = THREE.MathUtils.damp(cameraRef.current.position.y, camTargetY, 3.5, delta);
        cameraRef.current.position.z = THREE.MathUtils.damp(cameraRef.current.position.z, target.z, 3.5, delta);
        cameraRef.current.lookAt(lookTarget);
      }

      // Apply drag inertia and decay
      manualRotRef.current.x += manualRotRef.current.velX;
      manualRotRef.current.y += manualRotRef.current.velY;
      manualRotRef.current.velX *= 0.92;
      manualRotRef.current.velY *= 0.92;

      // Auto-rotation of the main 3D assembly
      if (masterGroup) {
        const autoSpinSpeed = autoRotate ? 0.35 : 0.05;
        masterGroup.rotation.y = manualRotRef.current.y + elapsed * autoSpinSpeed;
        masterGroup.rotation.x = THREE.MathUtils.damp(
          masterGroup.rotation.x,
          manualRotRef.current.x + mouseRef.current.y * 0.2,
          4.0,
          delta
        );

        // Subtle floating bob
        masterGroup.position.y = Math.sin(elapsed * 1.5) * 0.08;
      }

      // Rotate internal film reel components at varying gear speeds
      if (reelGroup) {
        reelGroup.rotation.z = -elapsed * 0.6;
      }

      // Animate rings in opposing directions
      if (ringsGroup) {
        ringsGroup.rotation.x = Math.sin(elapsed * 0.4) * 0.4;
        ringsGroup.rotation.z = elapsed * 0.2;
      }

      // Animate dynamic 3D audio equalizer bars
      audioBars.forEach((bar) => {
        const phase = bar.userData.phase || 0;
        const base = bar.userData.baseScaleY || 0.5;
        const pulse = Math.abs(Math.sin(elapsed * 4.5 + phase));
        const scaleY = base + pulse * 1.2;
        bar.scale.y = scaleY;
      });

      // Animate orbiting social media tokens
      if (orbitingGroup) {
        orbitingGroup.rotation.y = -elapsed * 0.5;
        orbitingGroup.children.forEach((child, i) => {
          child.rotation.x += delta * (1.0 + i * 0.3);
          child.rotation.y += delta * (0.8 + i * 0.2);
        });
      }

      // Rotate starfield very slowly
      starField.rotation.y = elapsed * 0.02;

      renderer.render(scene, camera);
    };

    animate();

    // 9. Cleanup on unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('resize', handleResize);

      // Recursive disposal
      scene.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh) {
          const mesh = obj as THREE.Mesh;
          mesh.geometry?.dispose();
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((m) => m.dispose());
          } else {
            mesh.material?.dispose();
          }
        }
      });

      envTexture.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 w-full h-full overflow-hidden cursor-grab active:cursor-grabbing select-none"
      style={{ touchAction: 'none' }}
    />
  );
};
