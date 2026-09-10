/**
 * THE LINK REACTION — 3D Three.js Visualization Engine
 * Procedural biological structures, multi-enzyme PDC, molecular simulations,
 * camera choreography, interactive labels, and orbit controls.
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { openMoleculeModal } from './app.js';

// =============================================================================
// GLOBAL 3D STATE & VARIABLES
// =============================================================================

let scene, camera, renderer, controls;
let container, labelsContainer;
let clock = new THREE.Clock();

// Target Camera & Controls coordinates for smooth interpolation
const cameraTarget = {
  pos: new THREE.Vector3(0, 15, 45),
  lookAt: new THREE.Vector3(0, 0, 0)
};

// 3D Object Groups
let rootGroup;
let mitochondrionGroup;
let pdcGroup;
let pyruvateGroup;
let coaGroup;
let nadGroup;
let co2Group;
let acetylCoaGroup;
let pathwayContextGroup;
let particlesGroup;

// Registered 3D Labels for screen projection
const registeredLabels = [];
let forceAllLabels = false;
let currentStageIndex = 0;

// Camera configurations per stage
const CAMERA_PRESETS = [
  // 00: Arrival (Wide shot of floating mitochondrion)
  { pos: new THREE.Vector3(0, 14, 46), lookAt: new THREE.Vector3(0, 0, 0), focusName: "Mitochondrion Exterior" },
  // 01: Matrix Entry (Dolly into membrane cross-section & MPC transporter)
  { pos: new THREE.Vector3(0, 4, 19), lookAt: new THREE.Vector3(0, 1, 2), focusName: "Inner Membrane & MPC Carrier" },
  // 02: PDC Reveal (Dramatic view of the multi-enzyme complex)
  { pos: new THREE.Vector3(0, 3, 14), lookAt: new THREE.Vector3(0, 0, 0), focusName: "Pyruvate Dehydrogenase Complex" },
  // 03: Decarboxylation (Macro on E1 active site: CO2 leaves)
  { pos: new THREE.Vector3(-3.2, 1.6, 6.5), lookAt: new THREE.Vector3(-1.2, 0.4, 0), focusName: "E1 Active Site & Decarboxylation" },
  // 04: Oxidation (Macro on electron transfer: NAD+ -> NADH)
  { pos: new THREE.Vector3(0.5, 2.2, 7.5), lookAt: new THREE.Vector3(0, 0.5, 0), focusName: "E2/E3 Interface & NAD⁺ Reduction" },
  // 05: Acetyl-CoA Formation (Macro on CoA docking & thioester bond)
  { pos: new THREE.Vector3(3.2, 1.6, 6.5), lookAt: new THREE.Vector3(1.2, 0.4, 0), focusName: "E2 Core & Acetyl-CoA Formation" },
  // 06: Complete Equation (Pull back: Reactants left, Products right)
  { pos: new THREE.Vector3(0, 4.5, 19), lookAt: new THREE.Vector3(0, 0, 0), focusName: "Complete Reaction Stoichiometry" },
  // 07: Respiration Context (High-angle wide shot of respiration pathway)
  { pos: new THREE.Vector3(0, 18, 38), lookAt: new THREE.Vector3(0, 0, 0), focusName: "Whole Cellular Respiration Map" }
];

// =============================================================================
// INITIALIZE SCENE & RENDERER
// =============================================================================

export function init3DScene() {
  container = document.getElementById('canvas-container');
  labelsContainer = document.getElementById('labels-overlay');
  if (!container) return;

  // 1. Scene
  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x05070c, 0.018);

  // 2. Camera
  const aspect = window.innerWidth / window.innerHeight;
  camera = new THREE.PerspectiveCamera(48, aspect, 0.1, 500);
  camera.position.copy(CAMERA_PRESETS[0].pos);

  // 3. Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  container.appendChild(renderer.domElement);

  // 4. Orbit Controls (Allow user to orbit without advancing stages)
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.enableZoom = true;
  controls.minDistance = 3;
  controls.maxDistance = 65;
  controls.target.copy(CAMERA_PRESETS[0].lookAt);

  // 5. Lighting Setup
  setupLighting();

  // 6. Build Procedural Biological Geometry
  buildAllModels();

  // 7. Event Listeners
  window.addEventListener('resize', onWindowResize);

  // 8. Start Animation Loop
  animate();
}

function setupLighting() {
  // Ambient deep biological glow
  const ambient = new THREE.AmbientLight(0x0f172a, 1.8);
  scene.add(ambient);

  // Key directional light (warm metabolic glow)
  const keyLight = new THREE.DirectionalLight(0xffedd5, 2.4);
  keyLight.position.set(15, 25, 20);
  scene.add(keyLight);

  // Rim light (electric cyan from mitochondrial inner boundary)
  const rimLight = new THREE.DirectionalLight(0x38bdf8, 3.2);
  rimLight.position.set(-20, -10, -15);
  scene.add(rimLight);

  // Matrix center point light
  const matrixLight = new THREE.PointLight(0x10b981, 1.8, 30);
  matrixLight.position.set(0, 0, 0);
  scene.add(matrixLight);
}

// =============================================================================
// PROCEDURAL BIOLOGICAL GEOMETRY BUILDERS
// =============================================================================

function buildAllModels() {
  rootGroup = new THREE.Group();
  scene.add(rootGroup);

  // 1. Floating Ambient Biological Particles
  buildBackgroundParticles();

  // 2. Mitochondrion Cutaway (Outer membrane, inner membrane, matrix, MPC)
  buildMitochondrion();

  // 3. Pyruvate Dehydrogenase Complex (PDC) multi-enzyme core
  buildPDC();

  // 4. Molecular Entities
  buildPyruvate();
  buildCoA();
  buildNAD();
  buildCO2();
  buildAcetylCoA();

  // 5. Pathway Context Visualizer
  buildPathwayContext();

  // Initial stage layout
  update3DStage(0);
}

/**
 * 1. Ambient Background Particles (Mitochondrial Matrix Solutes)
 */
function buildBackgroundParticles() {
  particlesGroup = new THREE.Group();
  const count = 350;
  const geom = new THREE.BufferGeometry();
  const pos = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  for (let i = 0; i < count * 3; i += 3) {
    pos[i] = (Math.random() - 0.5) * 80;
    pos[i + 1] = (Math.random() - 0.5) * 60;
    pos[i + 2] = (Math.random() - 0.5) * 80;

    // Soft cyan & green bio colors
    colors[i] = 0.1 + Math.random() * 0.2;
    colors[i + 1] = 0.5 + Math.random() * 0.4;
    colors[i + 2] = 0.7 + Math.random() * 0.3;
  }

  geom.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geom.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const mat = new THREE.PointsMaterial({
    size: 0.35,
    vertexColors: true,
    transparent: true,
    opacity: 0.45,
    blending: THREE.AdditiveBlending
  });

  const pSystem = new THREE.Points(geom, mat);
  particlesGroup.add(pSystem);
  scene.add(particlesGroup);
}

/**
 * 2. Mitochondrion Cutaway with Outer Membrane, Inner Membrane Cristae & MPC Transporter
 */
function buildMitochondrion() {
  mitochondrionGroup = new THREE.Group();

  // Outer Membrane: Translucent elongated ellipsoid cutaway
  const outerMat = new THREE.MeshPhysicalMaterial({
    color: 0x1e3a5f,
    roughness: 0.3,
    transmission: 0.82,
    thickness: 1.5,
    transparent: true,
    opacity: 0.35,
    wireframe: false,
    side: THREE.DoubleSide
  });
  const outerGeom = new THREE.CapsuleGeometry(9.5, 18, 24, 32);
  const outerMesh = new THREE.Mesh(outerGeom, outerMat);
  outerMesh.rotation.z = Math.PI / 2;
  mitochondrionGroup.add(outerMesh);

  // Inner Membrane with Cristae folds
  const innerMat = new THREE.MeshPhysicalMaterial({
    color: 0x0ea5e9,
    roughness: 0.4,
    transmission: 0.65,
    transparent: true,
    opacity: 0.45,
    side: THREE.DoubleSide
  });
  const innerGeom = new THREE.CapsuleGeometry(7.8, 14, 24, 32);
  const innerMesh = new THREE.Mesh(innerGeom, innerMat);
  innerMesh.rotation.z = Math.PI / 2;
  mitochondrionGroup.add(innerMesh);

  // Cristae Inward Invaginations (Folds)
  const foldMat = new THREE.MeshStandardMaterial({
    color: 0x0284c7,
    roughness: 0.5,
    transparent: true,
    opacity: 0.55,
    side: THREE.DoubleSide
  });
  for (let i = -5; i <= 5; i += 2.5) {
    const foldGeom = new THREE.CylinderGeometry(5.2, 5.2, 0.35, 24, 1, true, 0, Math.PI * 1.5);
    const fold = new THREE.Mesh(foldGeom, foldMat);
    fold.position.set(i, 0, 0);
    fold.rotation.z = Math.PI / 2;
    mitochondrionGroup.add(fold);
  }

  // Mitochondrial Pyruvate Carrier (MPC Transporter on Inner Membrane)
  const mpcGroup = new THREE.Group();
  const mpcCylGeom = new THREE.CylinderGeometry(0.8, 0.8, 2.2, 16);
  const mpcMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    metalness: 0.3,
    roughness: 0.3,
    emissive: 0xd97706,
    emissiveIntensity: 0.3
  });
  const mpcMesh = new THREE.Mesh(mpcCylGeom, mpcMat);
  mpcMesh.position.set(-2, 7.8, 0);
  mpcGroup.add(mpcMesh);

  // Inner channel pore
  const poreGeom = new THREE.CylinderGeometry(0.35, 0.35, 2.3, 16);
  const poreMat = new THREE.MeshBasicMaterial({ color: 0x05070c });
  const poreMesh = new THREE.Mesh(poreGeom, poreMat);
  poreMesh.position.set(-2, 7.8, 0);
  mpcGroup.add(poreMesh);

  mitochondrionGroup.add(mpcGroup);

  // Register 3D anatomical labels
  registerLabel("OUTER MEMBRANE", outerMesh, "pin-membrane", [0, 9.8, 0], [0, 1]);
  registerLabel("INTERMEMBRANE SPACE", outerMesh, "pin-membrane", [4, 8.6, 0], [1]);
  registerLabel("INNER MEMBRANE (CRISTAE)", innerMesh, "pin-membrane", [0, 7.2, 0], [1, 7]);
  registerLabel("MITOCHONDRIAL MATRIX", innerMesh, "pin-membrane", [0, 0, 0], [1, 2, 7]);
  registerLabel("MPC CARRIER (Pyruvate Translocase)", mpcMesh, "pin-pyruvate", [-2, 9.2, 0], [1]);

  rootGroup.add(mitochondrionGroup);
}

/**
 * 3. Pyruvate Dehydrogenase Complex (PDC) Giant Multienzyme Assembly
 */
function buildPDC() {
  pdcGroup = new THREE.Group();

  // Central E2 Core (Dihydrolipoyl Transacetylase Core: Emerald & Gold)
  const e2Mat = new THREE.MeshStandardMaterial({
    color: 0x10b981,
    roughness: 0.3,
    metalness: 0.2,
    emissive: 0x065f46,
    emissiveIntensity: 0.4
  });

  const coreCount = 24;
  for (let i = 0; i < coreCount; i++) {
    const phi = Math.acos(-1 + (2 * i) / coreCount);
    const theta = Math.sqrt(coreCount * Math.PI) * phi;
    const r = 2.0;

    const x = r * Math.sin(phi) * Math.cos(theta);
    const y = r * Math.sin(phi) * Math.sin(theta);
    const z = r * Math.cos(phi);

    const sphereGeom = new THREE.SphereGeometry(0.55, 16, 16);
    const sphere = new THREE.Mesh(sphereGeom, e2Mat);
    sphere.position.set(x, y, z);
    pdcGroup.add(sphere);
  }

  // Outer E1 Subunits (Pyruvate Dehydrogenase: Ruby/Magenta with TPP active site)
  const e1Mat = new THREE.MeshStandardMaterial({
    color: 0xec4899,
    roughness: 0.35,
    metalness: 0.2,
    emissive: 0x9d174d,
    emissiveIntensity: 0.45
  });
  const e1Count = 18;
  for (let i = 0; i < e1Count; i++) {
    const phi = Math.acos(-1 + (2 * i) / e1Count);
    const theta = Math.sqrt(e1Count * Math.PI) * phi;
    const r = 3.6;

    const x = r * Math.sin(phi) * Math.cos(theta);
    const y = r * Math.sin(phi) * Math.sin(theta);
    const z = r * Math.cos(phi);

    const geom = new THREE.DodecahedronGeometry(0.65);
    const mesh = new THREE.Mesh(geom, e1Mat);
    mesh.position.set(x, y, z);
    pdcGroup.add(mesh);
  }

  // Outer E3 Subunits (Dihydrolipoyl Dehydrogenase: Sapphire Blue with FAD)
  const e3Mat = new THREE.MeshStandardMaterial({
    color: 0x3b82f6,
    roughness: 0.35,
    metalness: 0.2,
    emissive: 0x1d4ed8,
    emissiveIntensity: 0.4
  });
  const e3Count = 12;
  for (let i = 0; i < e3Count; i++) {
    const phi = Math.acos(-1 + (2 * i) / e3Count);
    const theta = Math.sqrt(e3Count * Math.PI) * phi;
    const r = 3.8;

    const x = r * Math.sin(phi) * Math.cos(theta);
    const y = r * Math.sin(phi) * Math.sin(theta);
    const z = r * Math.cos(phi);

    const geom = new THREE.OctahedronGeometry(0.6);
    const mesh = new THREE.Mesh(geom, e3Mat);
    mesh.position.set(x, y, z);
    pdcGroup.add(mesh);
  }

  // Swinging Lipoamide Arms (Flexible prosthetic chains on E2)
  const armMat = new THREE.LineBasicMaterial({ color: 0xfacc15, linewidth: 2 });
  for (let i = 0; i < 6; i++) {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(Math.sin(i) * 1.8, Math.cos(i) * 1.8, 1.2),
      new THREE.Vector3(Math.sin(i) * 3.2, Math.cos(i) * 3.2, 0.4)
    ]);
    const points = curve.getPoints(20);
    const armGeom = new THREE.BufferGeometry().setFromPoints(points);
    const armLine = new THREE.Line(armGeom, armMat);
    pdcGroup.add(armLine);
  }

  // Register PDC Labels
  registerLabel("PDC COMPLEX (Pyruvate Dehydrogenase Complex)", pdcGroup, "pin-pdc", [0, 4.8, 0], [2, 6]);
  registerLabel("E1: Pyruvate Dehydrogenase (TPP)", pdcGroup, "pin-pdc", [-2.6, 2.8, 1.5], [2, 3]);
  registerLabel("E2: Lipoamide Core (Transacetylase)", pdcGroup, "pin-pdc", [0, 0.5, 2.2], [2, 5]);
  registerLabel("E3: Dihydrolipoyl Dehydrogenase (FAD)", pdcGroup, "pin-pdc", [2.6, 2.8, 1.5], [2, 4]);

  rootGroup.add(pdcGroup);
}

/**
 * 4. Pyruvate Molecule (3-Carbon Skeleton)
 */
function buildPyruvate() {
  pyruvateGroup = new THREE.Group();

  // Atom materials
  const matCarbon = new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.3, emissive: 0xc2410c, emissiveIntensity: 0.3 });
  const matOxygen = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.3, emissive: 0xb91c1c, emissiveIntensity: 0.3 });
  const matHydrogen = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.2 });
  const matBond = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.5 });

  // Carbon 1 (Carboxyl carbon)
  const c1 = new THREE.Mesh(new THREE.SphereGeometry(0.38, 20, 20), matCarbon);
  c1.position.set(-1.0, 0, 0);
  pyruvateGroup.add(c1);

  // O1 & O2 on C1
  const o1 = new THREE.Mesh(new THREE.SphereGeometry(0.32, 16, 16), matOxygen);
  o1.position.set(-1.6, 0.6, 0);
  pyruvateGroup.add(o1);

  const o2 = new THREE.Mesh(new THREE.SphereGeometry(0.32, 16, 16), matOxygen);
  o2.position.set(-1.6, -0.6, 0);
  pyruvateGroup.add(o2);

  // Carbon 2 (Carbonyl central carbon)
  const c2 = new THREE.Mesh(new THREE.SphereGeometry(0.38, 20, 20), matCarbon);
  c2.position.set(0, 0, 0);
  pyruvateGroup.add(c2);

  // O3 (Carbonyl oxygen)
  const o3 = new THREE.Mesh(new THREE.SphereGeometry(0.32, 16, 16), matOxygen);
  o3.position.set(0, 0.8, 0);
  pyruvateGroup.add(o3);

  // Carbon 3 (Methyl terminal carbon)
  const c3 = new THREE.Mesh(new THREE.SphereGeometry(0.38, 20, 20), matCarbon);
  c3.position.set(1.0, 0, 0);
  pyruvateGroup.add(c3);

  // Hydrogens on C3
  const h1 = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 12), matHydrogen);
  h1.position.set(1.5, 0.4, 0.4);
  pyruvateGroup.add(h1);

  const h2 = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 12), matHydrogen);
  h2.position.set(1.5, -0.4, 0.4);
  pyruvateGroup.add(h2);

  const h3 = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 12), matHydrogen);
  h3.position.set(1.2, 0, -0.6);
  pyruvateGroup.add(h3);

  // Bonds
  createBond(c1.position, c2.position, matBond, pyruvateGroup);
  createBond(c2.position, c3.position, matBond, pyruvateGroup);
  createBond(c1.position, o1.position, matBond, pyruvateGroup);
  createBond(c1.position, o2.position, matBond, pyruvateGroup);
  createBond(c2.position, o3.position, matBond, pyruvateGroup);

  pyruvateGroup.position.set(0, 12, 28); // Starts outside mitochondrion in Stage 00

  // Register Pyruvate Label
  registerLabel("PYRUVATE (3C)", pyruvateGroup, "pin-pyruvate", [0, 1.2, 0], [0, 1, 2, 3, 6], "pyruvate");

  rootGroup.add(pyruvateGroup);
}

/**
 * 5. Coenzyme A (CoA-SH)
 */
function buildCoA() {
  coaGroup = new THREE.Group();

  // Nucleotide / pantothenate body (chain of spheres)
  const coaBodyMat = new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.4, emissive: 0x064e3b, emissiveIntensity: 0.25 });
  for (let i = 0; i < 5; i++) {
    const s = new THREE.Mesh(new THREE.SphereGeometry(0.3, 14, 14), coaBodyMat);
    s.position.set(i * 0.45, Math.sin(i * 0.9) * 0.2, 0);
    coaGroup.add(s);
  }

  // Reactive Thiol Sulfur atom (-SH business end: glowing golden yellow)
  const sulfurMat = new THREE.MeshStandardMaterial({
    color: 0xfbbf24,
    roughness: 0.2,
    metalness: 0.4,
    emissive: 0xd97706,
    emissiveIntensity: 0.8
  });
  const sulfur = new THREE.Mesh(new THREE.SphereGeometry(0.42, 18, 18), sulfurMat);
  sulfur.position.set(2.4, 0.1, 0);
  coaGroup.add(sulfur);

  // Thiol Hydrogen
  const thiolH = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 12), new THREE.MeshStandardMaterial({ color: 0xffffff }));
  thiolH.position.set(2.85, 0.2, 0);
  coaGroup.add(thiolH);

  coaGroup.position.set(12, -8, -5); // Inactive offstage initially
  registerLabel("COENZYME A (CoA-SH)", coaGroup, "pin-coa", [1.2, 0.9, 0], [5, 6], "coa");

  rootGroup.add(coaGroup);
}

/**
 * 6. NAD⁺ / NADH Electron Carrier
 */
function buildNAD() {
  nadGroup = new THREE.Group();

  const nadMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    roughness: 0.3,
    metalness: 0.3,
    emissive: 0x0284c7,
    emissiveIntensity: 0.5
  });

  // Nicotinamide ring & Adenine ring representations
  const ring1 = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.15, 12, 16), nadMat);
  ring1.position.set(-0.7, 0, 0);
  nadGroup.add(ring1);

  const ring2 = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.15, 12, 16), nadMat);
  ring2.position.set(0.7, 0, 0);
  nadGroup.add(ring2);

  const bridgeMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.5 });
  const bridge = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.8, 12), bridgeMat);
  bridge.rotation.z = Math.PI / 2;
  nadGroup.add(bridge);

  // Electron Cloud Halo (Intensifies upon reduction to NADH)
  const glowMat = new THREE.MeshBasicMaterial({
    color: 0x818cf8,
    transparent: true,
    opacity: 0.25,
    wireframe: true
  });
  const glowHalo = new THREE.Mesh(new THREE.SphereGeometry(1.2, 16, 16), glowMat);
  glowHalo.name = "nadhGlowHalo";
  nadGroup.add(glowHalo);

  nadGroup.position.set(-10, -8, -5);
  registerLabel("NAD⁺ / NADH (Electron Carrier)", nadGroup, "pin-nad", [0, 1.2, 0], [4, 6], "nad");

  rootGroup.add(nadGroup);
}

/**
 * 7. CO₂ Gaseous Waste Molecule (Leaves during Stage 03)
 */
function buildCO2() {
  co2Group = new THREE.Group();

  const matCarbon = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.3 });
  const matOxygen = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.3, emissive: 0xb91c1c, emissiveIntensity: 0.3 });
  const matBond = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.5 });

  const c = new THREE.Mesh(new THREE.SphereGeometry(0.36, 18, 18), matCarbon);
  co2Group.add(c);

  const o1 = new THREE.Mesh(new THREE.SphereGeometry(0.32, 16, 16), matOxygen);
  o1.position.set(-0.7, 0, 0);
  co2Group.add(o1);

  const o2 = new THREE.Mesh(new THREE.SphereGeometry(0.32, 16, 16), matOxygen);
  o2.position.set(0.7, 0, 0);
  co2Group.add(o2);

  createBond(c.position, o1.position, matBond, co2Group);
  createBond(c.position, o2.position, matBond, co2Group);

  co2Group.position.set(0, -20, 0); // Hidden until Stage 03
  registerLabel("CARBON DIOXIDE (CO₂ - 1C)", co2Group, "pin-pyruvate", [0, 0.8, 0], [3, 6], "co2");

  rootGroup.add(co2Group);
}

/**
 * 8. Acetyl-CoA Molecule (Activated 2C Product)
 */
function buildAcetylCoA() {
  acetylCoaGroup = new THREE.Group();

  // 2-Carbon Acetyl fragment (Golden Amber)
  const matAcetylC = new THREE.MeshStandardMaterial({
    color: 0xfbbf24,
    roughness: 0.2,
    emissive: 0xb45309,
    emissiveIntensity: 0.5
  });
  const c1 = new THREE.Mesh(new THREE.SphereGeometry(0.36, 16, 16), matAcetylC);
  c1.position.set(-0.8, 0, 0);
  acetylCoaGroup.add(c1);

  const c2 = new THREE.Mesh(new THREE.SphereGeometry(0.36, 16, 16), matAcetylC);
  c2.position.set(0, 0, 0);
  acetylCoaGroup.add(c2);

  // Oxygen on acetyl
  const o = new THREE.Mesh(new THREE.SphereGeometry(0.3, 14, 14), new THREE.MeshStandardMaterial({ color: 0xef4444 }));
  o.position.set(0, 0.7, 0);
  acetylCoaGroup.add(o);

  // High energy Thioester bond (-S-)
  const matSulfur = new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0xd97706, emissiveIntensity: 0.8 });
  const s = new THREE.Mesh(new THREE.SphereGeometry(0.42, 18, 18), matSulfur);
  s.position.set(0.85, 0, 0);
  acetylCoaGroup.add(s);

  // CoA body representation
  const matCoA = new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.4 });
  for (let i = 1; i <= 3; i++) {
    const b = new THREE.Mesh(new THREE.SphereGeometry(0.28, 12, 12), matCoA);
    b.position.set(0.85 + i * 0.45, Math.sin(i) * 0.2, 0);
    acetylCoaGroup.add(b);
  }

  acetylCoaGroup.position.set(0, -25, 0); // Hidden until stage 05
  registerLabel("ACETYL-CoA (2C Thioester)", acetylCoaGroup, "pin-coa", [0.4, 1.2, 0], [5, 6, 7], "acetyl_coa");

  rootGroup.add(acetylCoaGroup);
}

/**
 * 9. Respiration Pathway Context Visualizer (Stage 07)
 */
function buildPathwayContext() {
  pathwayContextGroup = new THREE.Group();

  // 4 Pathway Rings connected in 3D space
  const steps = [
    { name: "1. GLYCOLYSIS (Cytosol)", pos: new THREE.Vector3(-14, 8, 0), color: 0x38bdf8 },
    { name: "2. LINK REACTION (Matrix)", pos: new THREE.Vector3(0, 0, 0), color: 0xf97316 },
    { name: "3. KREBS CYCLE (Matrix)", pos: new THREE.Vector3(12, -4, 0), color: 0x10b981 },
    { name: "4. OXIDATIVE PHOSPHORYLATION (Cristae)", pos: new THREE.Vector3(0, -12, 0), color: 0xec4899 }
  ];

  steps.forEach((st, i) => {
    const ringMat = new THREE.MeshBasicMaterial({ color: st.color, wireframe: true, transparent: true, opacity: 0.6 });
    const ring = new THREE.Mesh(new THREE.TorusGeometry(2.4, 0.15, 12, 32), ringMat);
    ring.position.copy(st.pos);
    pathwayContextGroup.add(ring);

    if (i < steps.length - 1) {
      // Connective flow line
      const lineMat = new THREE.LineDashedMaterial({ color: 0xffffff, dashSize: 0.8, gapSize: 0.4 });
      const lineGeom = new THREE.BufferGeometry().setFromPoints([st.pos, steps[i + 1].pos]);
      const line = new THREE.Line(lineGeom, lineMat);
      line.computeLineDistances();
      pathwayContextGroup.add(line);
    }
  });

  pathwayContextGroup.visible = false;
  rootGroup.add(pathwayContextGroup);
}

function createBond(p1, p2, material, group) {
  const dir = new THREE.Vector3().subVectors(p2, p1);
  const len = dir.length();
  const geom = new THREE.CylinderGeometry(0.08, 0.08, len, 8);
  const mesh = new THREE.Mesh(geom, material);
  mesh.position.copy(p1).addScaledVector(dir, 0.5);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
  group.add(mesh);
}

// =============================================================================
// SCREEN-SPACE 3D LABELS SYSTEM
// =============================================================================

function registerLabel(text, object3D, pinClass, offset = [0, 0, 0], activeStages = [0, 1, 2, 3, 4, 5, 6, 7], molKey = null) {
  if (!labelsContainer) return;

  const el = document.createElement('div');
  el.className = `world-label ${pinClass}`;
  el.textContent = text;

  if (molKey) {
    el.setAttribute('title', `Click to inspect ${text}`);
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      openMoleculeModal(molKey);
    });
  }

  labelsContainer.appendChild(el);

  registeredLabels.push({
    element: el,
    target: object3D,
    offset: new THREE.Vector3(...offset),
    activeStages: activeStages
  });
}

export function toggleAll3DLabels(showAll) {
  forceAllLabels = showAll;
  updateLabelsProjection();
}

function updateLabelsProjection() {
  if (!camera || !labelsContainer) return;

  const widthHalf = window.innerWidth / 2;
  const heightHalf = window.innerHeight / 2;
  const tempV = new THREE.Vector3();

  registeredLabels.forEach(item => {
    const isStageActive = item.activeStages.includes(currentStageIndex);
    const shouldShow = forceAllLabels || isStageActive;

    if (!shouldShow || !item.target.visible) {
      item.element.style.display = 'none';
      return;
    }

    item.target.getWorldPosition(tempV);
    tempV.add(item.offset);
    tempV.project(camera);

    // Behind camera check
    if (tempV.z > 1) {
      item.element.style.display = 'none';
      return;
    }

    const x = (tempV.x * widthHalf) + widthHalf;
    const y = -(tempV.y * heightHalf) + heightHalf;

    item.element.style.display = 'flex';
    item.element.style.left = `${x}px`;
    item.element.style.top = `${y}px`;

    if (forceAllLabels) {
      item.element.classList.add('force-visible');
    } else {
      item.element.classList.remove('force-visible');
    }
  });
}

// =============================================================================
// STAGE TRANSITIONS & CHOREOGRAPHY (00 - 07)
// =============================================================================

export function update3DStage(stageIndex) {
  currentStageIndex = stageIndex;
  const preset = CAMERA_PRESETS[stageIndex];
  if (!preset) return;

  cameraTarget.pos.copy(preset.pos);
  cameraTarget.lookAt.copy(preset.lookAt);

  // Animate & position molecular objects based on current stage
  switch (stageIndex) {
    case 0: // 00: Arrival (Pyruvate outside mitochondrion)
      mitochondrionGroup.visible = true;
      mitochondrionGroup.scale.set(1, 1, 1);
      pdcGroup.visible = true;
      pathwayContextGroup.visible = false;

      pyruvateGroup.position.set(0, 11.5, 12);
      pyruvateGroup.visible = true;

      coaGroup.position.set(15, -15, 0);
      nadGroup.position.set(-15, -15, 0);
      co2Group.position.set(0, -25, 0);
      acetylCoaGroup.position.set(0, -25, 0);
      break;

    case 1: // 01: Entry (Pyruvate transits through MPC transporter)
      mitochondrionGroup.visible = true;
      pdcGroup.visible = true;
      pathwayContextGroup.visible = false;

      pyruvateGroup.position.set(-2, 7.8, 0); // Positioned directly inside MPC carrier
      pyruvateGroup.visible = true;

      coaGroup.position.set(15, -15, 0);
      nadGroup.position.set(-15, -15, 0);
      co2Group.position.set(0, -25, 0);
      acetylCoaGroup.position.set(0, -25, 0);
      break;

    case 2: // 02: Meeting PDC (Pyruvate approaches E1 active site)
      mitochondrionGroup.visible = true;
      pdcGroup.visible = true;
      pathwayContextGroup.visible = false;

      pyruvateGroup.position.set(-2.2, 1.8, 2.8); // Docking at E1
      pyruvateGroup.visible = true;

      coaGroup.position.set(8, -4, 2);
      nadGroup.position.set(-8, -4, 2);
      co2Group.position.set(0, -25, 0);
      acetylCoaGroup.position.set(0, -25, 0);
      break;

    case 3: // 03: Decarboxylation (Pyruvate C1 cleaved off, CO2 detaches & floats away)
      mitochondrionGroup.visible = true;
      pdcGroup.visible = true;
      pathwayContextGroup.visible = false;

      pyruvateGroup.position.set(-1.8, 1.2, 1.8);
      pyruvateGroup.visible = true;

      // CO2 detaches and rises away
      co2Group.position.set(-1.2, 3.4, 2.4);
      co2Group.visible = true;

      coaGroup.position.set(8, -4, 2);
      nadGroup.position.set(-8, -4, 2);
      acetylCoaGroup.position.set(0, -25, 0);
      break;

    case 4: // 04: Oxidation (NAD+ enters, receives electrons, becomes glowing NADH)
      mitochondrionGroup.visible = true;
      pdcGroup.visible = true;
      pathwayContextGroup.visible = false;

      pyruvateGroup.position.set(-1.0, 0.8, 1.5);
      co2Group.position.set(-1.0, 6.0, 2.5); // Diffused further out

      // NAD+ arrives at E3
      nadGroup.position.set(0, 1.4, 3.2);
      nadGroup.visible = true;

      const halo = nadGroup.getObjectByName("nadhGlowHalo");
      if (halo) halo.scale.set(1.4, 1.4, 1.4);

      coaGroup.position.set(8, -4, 2);
      acetylCoaGroup.position.set(0, -25, 0);
      break;

    case 5: // 05: Acetyl-CoA Formation (CoA attacks 2C group via thiol)
      mitochondrionGroup.visible = true;
      pdcGroup.visible = true;
      pathwayContextGroup.visible = false;

      pyruvateGroup.visible = false; // Consumed

      // Acetyl-CoA assembled
      acetylCoaGroup.position.set(1.6, 1.2, 2.2);
      acetylCoaGroup.visible = true;

      coaGroup.position.set(0, -25, 0); // Consumed
      nadGroup.position.set(-4.5, 4.0, 2.0); // Shuttling away
      co2Group.position.set(-2.0, 8.0, 2.5);
      break;

    case 6: // 06: Complete Equation Composition (Reactants on Left, Products on Right)
      mitochondrionGroup.visible = true;
      pdcGroup.visible = true;
      pathwayContextGroup.visible = false;

      // REACTANTS (Left side)
      pyruvateGroup.position.set(-6.5, 1.8, 0);
      pyruvateGroup.visible = true;

      coaGroup.position.set(-6.5, -0.8, 0);
      coaGroup.visible = true;

      nadGroup.position.set(-6.5, -3.2, 0);
      nadGroup.visible = true;

      // PRODUCTS (Right side)
      acetylCoaGroup.position.set(6.5, 1.8, 0);
      acetylCoaGroup.visible = true;

      co2Group.position.set(6.5, -0.8, 0);
      co2Group.visible = true;
      break;

    case 7: // 07: Respiration Context (High-level pathway network overview)
      mitochondrionGroup.visible = true;
      mitochondrionGroup.scale.set(0.7, 0.7, 0.7);
      pdcGroup.visible = false;
      pathwayContextGroup.visible = true;

      pyruvateGroup.visible = false;
      coaGroup.visible = false;
      nadGroup.visible = false;
      co2Group.visible = false;
      acetylCoaGroup.visible = false;
      break;
  }
}

export function get3DCameraFocusName(stageIndex) {
  return CAMERA_PRESETS[stageIndex]?.focusName || "Mitochondrial Matrix";
}

// =============================================================================
// ANIMATION LOOP & SMOOTH INTERPOLATION
// =============================================================================

function animate() {
  requestAnimationFrame(animate);

  const delta = clock.getDelta();
  const time = clock.getElapsedTime();

  // Smooth camera interpolation towards target
  camera.position.lerp(cameraTarget.pos, 0.045);
  controls.target.lerp(cameraTarget.lookAt, 0.045);
  controls.update();

  // Slow biological drift of molecules and PDC
  if (pdcGroup && pdcGroup.visible) {
    pdcGroup.rotation.y = time * 0.08;
    pdcGroup.rotation.x = Math.sin(time * 0.05) * 0.05;
  }

  if (particlesGroup) {
    particlesGroup.rotation.y = time * 0.015;
  }

  // Floating bobbing motion for free molecules
  if (pyruvateGroup && pyruvateGroup.visible) {
    pyruvateGroup.position.y += Math.sin(time * 2.0) * 0.003;
    pyruvateGroup.rotation.y = time * 0.25;
  }

  if (co2Group && co2Group.visible && currentStageIndex === 3) {
    co2Group.position.y += Math.sin(time * 1.5) * 0.004;
  }

  if (acetylCoaGroup && acetylCoaGroup.visible) {
    acetylCoaGroup.position.y += Math.sin(time * 1.8) * 0.003;
    acetylCoaGroup.rotation.y = time * 0.2;
  }

  // Update screen-space positions of labels
  updateLabelsProjection();

  // Render WebGL
  renderer.render(scene, camera);
}

function onWindowResize() {
  if (!camera || !renderer) return;
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
}
