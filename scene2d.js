/**
 * THE LINK REACTION — 2D / Semi-2D Biological Illustration & Animation Engine
 * High-fidelity SVG vector scenes, step-triggered biological animations,
 * semi-2D layered depth, persistent default labels, and replay controls.
 */

import { openMoleculeModal } from './app.js';

let container = null;
let currentStage = 0;
let forceAllLabels = false;

// =============================================================================
// INITIALIZE 2D SCENE CONTAINER
// =============================================================================

export function init2DScene(targetElement) {
  container = targetElement || document.getElementById('scene-2d-viewport');
  if (!container) return;
  render2DStage(0);
}

// =============================================================================
// RENDER STAGE (00 - 07)
// =============================================================================

export function render2DStage(stageIndex) {
  currentStage = stageIndex;
  if (!container) return;

  // Clear previous scene with a clean cross-fade
  container.classList.remove('scene-fade-in');
  void container.offsetWidth; // Trigger reflow for animation
  container.classList.add('scene-fade-in');

  let sceneHTML = '';
  switch (stageIndex) {
    case 0:
      sceneHTML = getScene00Arrival();
      break;
    case 1:
      sceneHTML = getScene01Entry();
      break;
    case 2:
      sceneHTML = getScene02Enzyme();
      break;
    case 3:
      sceneHTML = getScene03Decarboxylation();
      break;
    case 4:
      sceneHTML = getScene04Oxidation();
      break;
    case 5:
      sceneHTML = getScene05AcetylCoA();
      break;
    case 6:
      sceneHTML = getScene06CompleteEquation();
      break;
    case 7:
      sceneHTML = getScene07RespirationContext();
      break;
    default:
      sceneHTML = getScene00Arrival();
  }

  container.innerHTML = sceneHTML;
  bindInteractiveElements();
  applyLabelsVisibility();
}

export function replayCurrentStageAnimation() {
  render2DStage(currentStage);
}

export function toggleAll2DLabels(showAll) {
  forceAllLabels = showAll;
  applyLabelsVisibility();
}

function applyLabelsVisibility() {
  if (!container) return;
  const labels = container.querySelectorAll('.label-tag');
  labels.forEach(lbl => {
    if (forceAllLabels) {
      lbl.classList.add('force-visible');
    } else {
      lbl.classList.remove('force-visible');
    }
  });
}

function bindInteractiveElements() {
  if (!container) return;
  const clickableMolecules = container.querySelectorAll('[data-mol]');
  clickableMolecules.forEach(el => {
    el.style.cursor = 'pointer';
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      const molKey = el.getAttribute('data-mol');
      if (molKey) openMoleculeModal(molKey);
    });
  });
}

export function getStageFocusName(stageIndex) {
  const names = [
    "Mitochondrial Anatomy & Exterior",
    "Membrane Cutaway & MPC Symporter",
    "Pyruvate Dehydrogenase Complex (PDC)",
    "E1 Subunit: Decarboxylation (-CO₂)",
    "E2/E3 Interface: Redox & NAD⁺ Reduction",
    "E2 Core: Thioester Bond & Acetyl-CoA",
    "Balanced Reaction Spatial Assembly",
    "Cellular Respiration Pathway Map"
  ];
  return names[stageIndex] || "Mitochondrial Matrix";
}

// =============================================================================
// SCENE 00: ARRIVAL (Mitochondrion Cross-Section & Cytosolic Pyruvate)
// =============================================================================

function getScene00Arrival() {
  return `
    <div class="scene-2d-canvas" id="scene-00">
      <svg viewBox="0 0 800 520" class="scene-svg" aria-label="Mitochondrion cross-section and cytosolic pyruvate">
        <defs>
          <radialGradient id="grad-matrix" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#0e2338" stop-opacity="0.95"/>
            <stop offset="70%" stop-color="#071322" stop-opacity="0.98"/>
            <stop offset="100%" stop-color="#040a14" stop-opacity="1"/>
          </radialGradient>
          <linearGradient id="grad-outer-mem" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#38bdf8"/>
            <stop offset="100%" stop-color="#0284c7"/>
          </linearGradient>
          <linearGradient id="grad-inner-mem" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#06b6d4"/>
            <stop offset="100%" stop-color="#0891b2"/>
          </linearGradient>
          <filter id="glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="blur"/>
            <feComposite in="SourceGraphic" in2="blur" operator="over"/>
          </filter>
          <filter id="glow-orange" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="8" result="blur"/>
            <feComposite in="SourceGraphic" in2="blur" operator="over"/>
          </filter>
        </defs>

        <!-- Cytosol Background & Ambient Particles -->
        <rect width="100%" height="100%" fill="none" />
        <g class="ambient-dots" opacity="0.3">
          <circle cx="80" cy="90" r="2" fill="#38bdf8"/>
          <circle cx="140" cy="420" r="2.5" fill="#10b981"/>
          <circle cx="720" cy="110" r="2" fill="#f97316"/>
          <circle cx="680" cy="400" r="2" fill="#38bdf8"/>
        </g>

        <!-- Outer Membrane Capsule -->
        <path d="M 220 140 C 320 80, 520 80, 620 140 C 720 200, 720 320, 620 380 C 520 440, 320 440, 220 380 C 120 320, 120 200, 220 140 Z"
              fill="url(#grad-matrix)" stroke="url(#grad-outer-mem)" stroke-width="4" filter="url(#glow-cyan)"/>

        <!-- Outer Membrane Porins (VDAC) -->
        <g class="porin-nodes" fill="#38bdf8">
          <ellipse cx="300" cy="100" rx="9" ry="4" transform="rotate(-15 300 100)"/>
          <ellipse cx="540" cy="100" rx="9" ry="4" transform="rotate(15 540 100)"/>
          <ellipse cx="670" cy="240" rx="4" ry="9"/>
          <ellipse cx="540" cy="420" rx="9" ry="4" transform="rotate(-15 540 420)"/>
          <ellipse cx="300" cy="420" rx="9" ry="4" transform="rotate(15 300 420)"/>
          <ellipse cx="170" cy="240" rx="4" ry="9"/>
        </g>

        <!-- Inner Membrane & Cristae Inward Invaginations -->
        <path d="M 235 160 
                 C 290 120, 380 120, 410 160 
                 C 420 190, 370 210, 350 240
                 C 330 270, 380 290, 390 320
                 C 400 350, 340 370, 300 350
                 C 270 330, 250 280, 235 260
                 C 220 240, 200 200, 235 160 Z"
              fill="#062235" stroke="url(#grad-inner-mem)" stroke-width="3" opacity="0.9"/>

        <!-- Second Crista Fold (Right Side) -->
        <path d="M 605 160 
                 C 550 120, 460 120, 440 170
                 C 430 200, 480 220, 500 250
                 C 520 280, 470 300, 460 330
                 C 450 360, 520 380, 560 350
                 C 590 320, 620 220, 605 160 Z"
              fill="#062235" stroke="url(#grad-inner-mem)" stroke-width="3" opacity="0.9"/>

        <!-- Matrix Granules & Ribosomes (Anatomical Detail) -->
        <g fill="#10b981" opacity="0.4">
          <circle cx="420" cy="240" r="3.5"/>
          <circle cx="435" cy="270" r="3"/>
          <circle cx="400" cy="290" r="4"/>
          <circle cx="450" cy="220" r="3.5"/>
          <circle cx="380" cy="210" r="3"/>
        </g>

        <!-- Mitochondrial DNA loop representation -->
        <path d="M 405 235 Q 435 215 445 245 T 415 275 T 395 245 Z" fill="none" stroke="#facc15" stroke-width="1.8" opacity="0.5" stroke-dasharray="3,2"/>

        <!-- Pyruvate Molecule Drifting in Cytosol (Animated Float) -->
        <g class="mol-pyruvate-float" data-mol="pyruvate" filter="url(#glow-orange)">
          <!-- 3 Carbon Chain -->
          <line x1="80" y1="180" x2="115" y2="180" stroke="#fdba74" stroke-width="4"/>
          <line x1="115" y1="180" x2="150" y2="180" stroke="#fdba74" stroke-width="4"/>
          
          <!-- C1 (Carboxyl) -->
          <circle cx="80" cy="180" r="14" fill="#f97316"/>
          <text x="80" y="184" text-anchor="middle" fill="#fff" font-size="11" font-weight="700">C₁</text>
          <circle cx="65" cy="155" r="9" fill="#ef4444"/>
          <text x="65" y="158" text-anchor="middle" fill="#fff" font-size="9" font-weight="700">O</text>
          <circle cx="65" cy="205" r="9" fill="#ef4444"/>
          <text x="65" y="208" text-anchor="middle" fill="#fff" font-size="8" font-weight="700">O⁻</text>
          
          <!-- C2 (Carbonyl) -->
          <circle cx="115" cy="180" r="14" fill="#f97316"/>
          <text x="115" y="184" text-anchor="middle" fill="#fff" font-size="11" font-weight="700">C₂</text>
          <circle cx="115" cy="150" r="9" fill="#ef4444"/>
          <text x="115" y="153" text-anchor="middle" fill="#fff" font-size="9" font-weight="700">O</text>
          
          <!-- C3 (Methyl) -->
          <circle cx="150" cy="180" r="14" fill="#f97316"/>
          <text x="150" y="184" text-anchor="middle" fill="#fff" font-size="11" font-weight="700">C₃</text>
          <circle cx="172" cy="180" r="7" fill="#f1f5f9"/>
          <text x="172" y="183" text-anchor="middle" fill="#0f172a" font-size="8" font-weight="700">H₃</text>
        </g>

        <!-- Animate pyruvate drift toward outer membrane -->
        <path d="M 120 215 C 160 235, 200 240, 240 235" fill="none" stroke="#f97316" stroke-width="2" stroke-dasharray="4,4" opacity="0.6"/>
        <polygon points="245,235 237,231 237,239" fill="#f97316" opacity="0.8"/>

        <!-- Persistent Default Labels (Section §8 Requirement) -->
        <g class="scene-labels">
          <g class="label-tag pin-pyruvate" transform="translate(115, 120)" data-mol="pyruvate">
            <rect x="-65" y="-12" width="130" height="24" rx="4" fill="rgba(12,18,30,0.85)" stroke="#f97316" stroke-width="1.2"/>
            <text x="0" y="4" text-anchor="middle" fill="#fed7aa" font-size="11" font-weight="700">PYRUVATE (3C)</text>
          </g>

          <g class="label-tag pin-membrane" transform="translate(300, 70)">
            <rect x="-65" y="-12" width="130" height="24" rx="4" fill="rgba(12,18,30,0.85)" stroke="#38bdf8" stroke-width="1.2"/>
            <text x="0" y="4" text-anchor="middle" fill="#7dd3fc" font-size="10" font-weight="700">OUTER MEMBRANE</text>
          </g>

          <g class="label-tag pin-membrane" transform="translate(680, 205)">
            <rect x="-55" y="-12" width="110" height="24" rx="4" fill="rgba(12,18,30,0.85)" stroke="#38bdf8" stroke-width="1.2"/>
            <text x="0" y="4" text-anchor="middle" fill="#7dd3fc" font-size="10" font-weight="700">PORIN (VDAC)</text>
          </g>

          <g class="label-tag pin-membrane" transform="translate(235, 390)">
            <rect x="-70" y="-12" width="140" height="24" rx="4" fill="rgba(12,18,30,0.85)" stroke="#06b6d4" stroke-width="1.2"/>
            <text x="0" y="4" text-anchor="middle" fill="#67e8f9" font-size="10" font-weight="700">INNER MEMBRANE (CRISTAE)</text>
          </g>

          <g class="label-tag pin-matrix" transform="translate(420, 265)">
            <rect x="-75" y="-12" width="150" height="24" rx="4" fill="rgba(12,18,30,0.85)" stroke="#10b981" stroke-width="1.2"/>
            <text x="0" y="4" text-anchor="middle" fill="#6ee7b7" font-size="10" font-weight="700">MITOCHONDRIAL MATRIX</text>
          </g>
        </g>
      </svg>
    </div>
  `;
}

// =============================================================================
// SCENE 01: MATRIX ENTRY (Layered Cutaway & MPC Transporter)
// =============================================================================

function getScene01Entry() {
  return `
    <div class="scene-2d-canvas" id="scene-01">
      <svg viewBox="0 0 800 520" class="scene-svg" aria-label="Pyruvate entry through outer membrane porin and inner membrane MPC carrier">
        <defs>
          <linearGradient id="grad-cyto-bg" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#070c18"/>
            <stop offset="100%" stop-color="#050812"/>
          </linearGradient>
          <linearGradient id="grad-ims-bg" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#08182b"/>
            <stop offset="100%" stop-color="#0a2038"/>
          </linearGradient>
          <linearGradient id="grad-matrix-bg" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#062d38"/>
            <stop offset="100%" stop-color="#031a22"/>
          </linearGradient>
          <linearGradient id="grad-mpc" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#f59e0b"/>
            <stop offset="50%" stop-color="#d97706"/>
            <stop offset="100%" stop-color="#b45309"/>
          </linearGradient>
        </defs>

        <!-- 4 Distinct Compartment Bands (Layered 2D Cutaway) -->
        <!-- 1. Cytoplasm (Top) -->
        <rect x="0" y="0" width="800" height="110" fill="url(#grad-cyto-bg)"/>
        
        <!-- Outer Membrane Band -->
        <rect x="0" y="110" width="800" height="35" fill="#1e3a5f" stroke="#38bdf8" stroke-width="2"/>
        <!-- Lipid Bilayer Texture Representation -->
        <g stroke="#60a5fa" stroke-width="1.5" opacity="0.4">
          <line x1="0" y1="120" x2="800" y2="120" stroke-dasharray="6,4"/>
          <line x1="0" y1="135" x2="800" y2="135" stroke-dasharray="6,4"/>
        </g>
        <!-- Outer Membrane Porin Channel -->
        <g class="porin-channel" data-mol="porin">
          <rect x="360" y="105" width="80" height="45" rx="8" fill="#0284c7" stroke="#38bdf8" stroke-width="2"/>
          <rect x="385" y="105" width="30" height="45" fill="#0c1e34" opacity="0.9"/>
          <text x="400" y="132" text-anchor="middle" fill="#e0f2fe" font-size="9" font-weight="700">PORE</text>
        </g>

        <!-- 2. Intermembrane Space (Middle Band) -->
        <rect x="0" y="145" width="800" height="135" fill="url(#grad-ims-bg)"/>
        <!-- High H+ Concentration in IMS (Proton Motive Force) -->
        <g fill="#38bdf8" opacity="0.75" font-size="10" font-weight="700">
          <text x="120" y="210">H⁺</text>
          <text x="220" y="180">H⁺</text>
          <text x="560" y="220">H⁺</text>
          <text x="680" y="190">H⁺</text>
        </g>

        <!-- Inner Membrane Band -->
        <rect x="0" y="280" width="800" height="45" fill="#0f3b4c" stroke="#06b6d4" stroke-width="2.5"/>
        <g stroke="#22d3ee" stroke-width="1.5" opacity="0.4">
          <line x1="0" y1="292" x2="800" y2="292" stroke-dasharray="6,4"/>
          <line x1="0" y1="312" x2="800" y2="312" stroke-dasharray="6,4"/>
        </g>

        <!-- Mitochondrial Pyruvate Carrier (MPC Symporter Heterodimer) -->
        <g class="mpc-transporter" data-mol="mpc">
          <rect x="350" y="270" width="100" height="65" rx="10" fill="url(#grad-mpc)" stroke="#fef08a" stroke-width="2"/>
          <!-- Central Transport Channel -->
          <rect x="385" y="270" width="30" height="65" fill="#061820" opacity="0.85"/>
          <text x="400" y="306" text-anchor="middle" fill="#fef3c7" font-size="10" font-weight="700">MPC</text>
          <!-- H+ Symport Vector -->
          <path d="M 430 260 L 430 345" stroke="#38bdf8" stroke-width="2.5" stroke-dasharray="3,3"/>
          <polygon points="430,350 426,342 434,342" fill="#38bdf8"/>
          <text x="445" y="306" fill="#38bdf8" font-size="10" font-weight="700">+ H⁺</text>
        </g>

        <!-- 3. Mitochondrial Matrix (Bottom Chamber) -->
        <rect x="0" y="325" width="800" height="195" fill="url(#grad-matrix-bg)"/>

        <!-- Animated Transit Path for Pyruvate -->
        <path d="M 400 60 L 400 130 L 400 240 L 400 420" 
              fill="none" stroke="#f97316" stroke-width="3" stroke-dasharray="6,4" class="anim-transit-line"/>
        
        <!-- Pyruvate Molecule in Transit through MPC into Matrix -->
        <g class="anim-pyruvate-transit" data-mol="pyruvate">
          <circle cx="400" cy="380" r="16" fill="#f97316" stroke="#fff" stroke-width="2"/>
          <text x="400" y="384" text-anchor="middle" fill="#fff" font-size="11" font-weight="700">3C</text>
        </g>

        <!-- Labels on Every Compartment & Transporter -->
        <g class="scene-labels">
          <g class="label-tag pin-membrane" transform="translate(110, 55)">
            <rect x="-65" y="-12" width="130" height="24" rx="4" fill="rgba(12,18,30,0.88)" stroke="#64748b" stroke-width="1.2"/>
            <text x="0" y="4" text-anchor="middle" fill="#e2e8f0" font-size="10" font-weight="700">CYTOSOL (pH ~7.2)</text>
          </g>

          <g class="label-tag pin-membrane" transform="translate(560, 128)" data-mol="porin">
            <rect x="-95" y="-12" width="190" height="24" rx="4" fill="rgba(12,18,30,0.88)" stroke="#38bdf8" stroke-width="1.2"/>
            <text x="0" y="4" text-anchor="middle" fill="#7dd3fc" font-size="10" font-weight="700">OUTER MEMBRANE PORIN (VDAC)</text>
          </g>

          <g class="label-tag pin-membrane" transform="translate(130, 200)">
            <rect x="-80" y="-12" width="160" height="24" rx="4" fill="rgba(12,18,30,0.88)" stroke="#0284c7" stroke-width="1.2"/>
            <text x="0" y="4" text-anchor="middle" fill="#bae6fd" font-size="10" font-weight="700">INTERMEMBRANE SPACE</text>
          </g>

          <g class="label-tag pin-pyruvate" transform="translate(550, 300)" data-mol="mpc">
            <rect x="-105" y="-12" width="210" height="24" rx="4" fill="rgba(12,18,30,0.88)" stroke="#f59e0b" stroke-width="1.2"/>
            <text x="0" y="4" text-anchor="middle" fill="#fde68a" font-size="10" font-weight="700">MPC: PYRUVATE/H⁺ SYMPORTER</text>
          </g>

          <g class="label-tag pin-matrix" transform="translate(130, 410)">
            <rect x="-85" y="-12" width="170" height="24" rx="4" fill="rgba(12,18,30,0.88)" stroke="#10b981" stroke-width="1.2"/>
            <text x="0" y="4" text-anchor="middle" fill="#a7f3d0" font-size="10" font-weight="700">MITOCHONDRIAL MATRIX (pH ~8.0)</text>
          </g>
        </g>
      </svg>
    </div>
  `;
}

// =============================================================================
// SCENE 02: MEETING THE ENZYME (PDC Multi-Enzyme Architecture)
// =============================================================================

function getScene02Enzyme() {
  return `
    <div class="scene-2d-canvas" id="scene-02">
      <svg viewBox="0 0 800 520" class="scene-svg" aria-label="Pyruvate Dehydrogenase Complex structure: E1, E2, E3 subunits">
        <defs>
          <radialGradient id="grad-pdc-core" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#10b981" stop-opacity="0.9"/>
            <stop offset="100%" stop-color="#047857" stop-opacity="0.95"/>
          </radialGradient>
          <linearGradient id="grad-e1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#ec4899"/>
            <stop offset="100%" stop-color="#be185d"/>
          </linearGradient>
          <linearGradient id="grad-e3" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#3b82f6"/>
            <stop offset="100%" stop-color="#1d4ed8"/>
          </linearGradient>
        </defs>

        <!-- Matrix Background Atmosphere -->
        <rect width="100%" height="100%" fill="#061320"/>

        <!-- PDC Assembly Illustration (Sized prominently as a molecular machine) -->
        <g class="pdc-machine-assembly" transform="translate(380, 250)">
          
          <!-- Outer Structural Orbit Halo -->
          <circle cx="0" cy="0" r="160" fill="none" stroke="rgba(255,255,255,0.08)" stroke-dasharray="4,4"/>

          <!-- E2 Transacetylase Dodecahedral Core (Emerald & Gold) -->
          <polygon points="0,-75 65,-38 65,38 0,75 -65,38 -65,-38" fill="url(#grad-pdc-core)" stroke="#facc15" stroke-width="2.5" opacity="0.9"/>
          
          <!-- E2 Inner Nodes -->
          <circle cx="0" cy="0" r="28" fill="#065f46" stroke="#facc15" stroke-width="1.5"/>
          <text x="0" y="5" text-anchor="middle" fill="#fef08a" font-size="12" font-weight="800">E2 CORE</text>
          <text x="0" y="20" text-anchor="middle" fill="#d1fae5" font-size="8">Lipoamide Arm</text>

          <!-- Swinging Lipoamide Arms (Animated 14 Ångström flexible tether) -->
          <g class="anim-lipoamide-swing">
            <path d="M 0 -28 C 30 -60, -20 -95, -70 -85" fill="none" stroke="#facc15" stroke-width="3" stroke-linecap="round"/>
            <circle cx="-70" cy="-85" r="5" fill="#fbbf24"/>
            <text x="-75" y="-95" fill="#fef08a" font-size="9" font-weight="700">Lipoamide (–S–S–)</text>
          </g>

          <!-- E1 Subunits (Pyruvate Dehydrogenase: Ruby/Magenta with TPP cofactor) -->
          <!-- Top Left E1 -->
          <g transform="translate(-105, -70)" class="e1-node" data-mol="pdc">
            <rect x="-38" y="-38" width="76" height="76" rx="14" fill="url(#grad-e1)" stroke="#fbcfe8" stroke-width="2"/>
            <text x="0" y="-5" text-anchor="middle" fill="#fff" font-size="13" font-weight="800">E1</text>
            <text x="0" y="10" text-anchor="middle" fill="#fce7f3" font-size="9" font-weight="700">TPP</text>
            <text x="0" y="24" text-anchor="middle" fill="#fbcfe8" font-size="7.5">Decarboxylase</text>
          </g>

          <!-- Bottom Left E1 -->
          <g transform="translate(-105, 70)" class="e1-node">
            <rect x="-38" y="-38" width="76" height="76" rx="14" fill="url(#grad-e1)" stroke="#fbcfe8" stroke-width="2"/>
            <text x="0" y="-5" text-anchor="middle" fill="#fff" font-size="13" font-weight="800">E1</text>
            <text x="0" y="10" text-anchor="middle" fill="#fce7f3" font-size="9" font-weight="700">TPP</text>
            <text x="0" y="24" text-anchor="middle" fill="#fbcfe8" font-size="7.5">Decarboxylase</text>
          </g>

          <!-- E3 Subunits (Dihydrolipoyl Dehydrogenase: Sapphire Blue with FAD cofactor) -->
          <!-- Top Right E3 -->
          <g transform="translate(105, -70)" class="e3-node" data-mol="pdc">
            <circle cx="0" cy="0" r="38" fill="url(#grad-e3)" stroke="#bfdbfe" stroke-width="2"/>
            <text x="0" y="-5" text-anchor="middle" fill="#fff" font-size="13" font-weight="800">E3</text>
            <text x="0" y="10" text-anchor="middle" fill="#dbeafe" font-size="9" font-weight="700">FAD</text>
            <text x="0" y="24" text-anchor="middle" fill="#bfdbfe" font-size="7.5">Dehydrogenase</text>
          </g>

          <!-- Bottom Right E3 -->
          <g transform="translate(105, 70)" class="e3-node">
            <circle cx="0" cy="0" r="38" fill="url(#grad-e3)" stroke="#bfdbfe" stroke-width="2"/>
            <text x="0" y="-5" text-anchor="middle" fill="#fff" font-size="13" font-weight="800">E3</text>
            <text x="0" y="10" text-anchor="middle" fill="#dbeafe" font-size="9" font-weight="700">FAD</text>
            <text x="0" y="24" text-anchor="middle" fill="#bfdbfe" font-size="7.5">Dehydrogenase</text>
          </g>

          <!-- Substrate Channeling Arrows -->
          <path d="M -70 -70 C -40 -30, 40 -30, 70 -70" fill="none" stroke="#facc15" stroke-width="2" stroke-dasharray="3,3"/>
        </g>

        <!-- Docking Pyruvate approaching E1 -->
        <g transform="translate(150, 180)" class="anim-pyruvate-dock" data-mol="pyruvate">
          <rect x="-35" y="-18" width="70" height="36" rx="18" fill="#f97316" stroke="#fed7aa" stroke-width="1.8"/>
          <text x="0" y="5" text-anchor="middle" fill="#fff" font-size="11" font-weight="700">Pyruvate (3C)</text>
          <path d="M 40 0 L 80 0" stroke="#f97316" stroke-width="2" stroke-dasharray="3,2"/>
          <polygon points="85,0 77,-4 77,4" fill="#f97316"/>
        </g>

        <!-- Persistent Labels -->
        <g class="scene-labels">
          <g class="label-tag pin-pdc" transform="translate(380, 50)" data-mol="pdc">
            <rect x="-135" y="-12" width="270" height="24" rx="4" fill="rgba(12,18,30,0.88)" stroke="#ec4899" stroke-width="1.2"/>
            <text x="0" y="4" text-anchor="middle" fill="#fbcfe8" font-size="10.5" font-weight="700">PYRUVATE DEHYDROGENASE COMPLEX (PDC)</text>
          </g>

          <g class="label-tag pin-pdc" transform="translate(195, 110)">
            <rect x="-95" y="-12" width="190" height="24" rx="4" fill="rgba(12,18,30,0.88)" stroke="#ec4899" stroke-width="1.2"/>
            <text x="0" y="4" text-anchor="middle" fill="#f472b6" font-size="9.5" font-weight="700">E1: DECARBOXYLASE (TPP)</text>
          </g>

          <g class="label-tag pin-coa" transform="translate(380, 420)">
            <rect x="-110" y="-12" width="220" height="24" rx="4" fill="rgba(12,18,30,0.88)" stroke="#10b981" stroke-width="1.2"/>
            <text x="0" y="4" text-anchor="middle" fill="#6ee7b7" font-size="9.5" font-weight="700">E2: TRANSACETYLASE (LIPOAMIDE)</text>
          </g>

          <g class="label-tag pin-nad" transform="translate(565, 110)">
            <rect x="-95" y="-12" width="190" height="24" rx="4" fill="rgba(12,18,30,0.88)" stroke="#3b82f6" stroke-width="1.2"/>
            <text x="0" y="4" text-anchor="middle" fill="#93c5fd" font-size="9.5" font-weight="700">E3: DEHYDROGENASE (FAD)</text>
          </g>
        </g>
      </svg>
    </div>
  `;
}

// =============================================================================
// SCENE 03: DECARBOXYLATION (Pyruvate 3C -> 2C + CO2 Detaches)
// =============================================================================

function getScene03Decarboxylation() {
  return `
    <div class="scene-2d-canvas" id="scene-03">
      <svg viewBox="0 0 800 520" class="scene-svg" aria-label="Decarboxylation of pyruvate releasing carbon dioxide">
        <defs>
          <filter id="glow-co2" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur"/>
            <feComposite in="SourceGraphic" in2="blur" operator="over"/>
          </filter>
        </defs>

        <rect width="100%" height="100%" fill="#07121e"/>

        <!-- E1 Active Pocket Surface -->
        <path d="M 50 380 Q 250 420 400 370 T 750 390 L 750 520 L 50 520 Z" fill="#2d0b1a" stroke="#ec4899" stroke-width="3"/>
        <text x="400" y="450" text-anchor="middle" fill="#fbcfe8" font-size="14" font-weight="700">E1 (Pyruvate Dehydrogenase) Active Site Pocket</text>
        <text x="400" y="475" text-anchor="middle" fill="#f472b6" font-size="11">Cofactor: Thiamine Pyrophosphate (TPP) Carbanion</text>

        <!-- Live Carbon Counter Banner (Section §6 & §11 Requirement) -->
        <g transform="translate(400, 70)">
          <rect x="-170" y="-18" width="340" height="36" rx="18" fill="rgba(15,23,42,0.9)" stroke="#38bdf8" stroke-width="1.5"/>
          <text x="0" y="5" text-anchor="middle" fill="#e2e8f0" font-size="13" font-weight="700">
            CARBON TRACKER: <tspan fill="#f97316">3C</tspan> &rarr; <tspan fill="#fbbf24">2C</tspan> + <tspan fill="#94a3b8">CO₂ (Leaves)</tspan>
          </text>
        </g>

        <!-- Reaction Stage: Pyruvate Docks, C1-C2 Bond Cleaves -->
        <!-- Remaining 2-Carbon Fragment (Attached to TPP) -->
        <g class="acetyl-fragment" transform="translate(320, 280)">
          <line x1="0" y1="0" x2="65" y2="0" stroke="#fbbf24" stroke-width="5"/>
          <!-- C2 -->
          <circle cx="0" cy="0" r="18" fill="#f97316" stroke="#fff" stroke-width="2"/>
          <text x="0" y="5" text-anchor="middle" fill="#fff" font-size="12" font-weight="800">C₂</text>
          <!-- Oxygen on C2 -->
          <circle cx="0" cy="-34" r="11" fill="#ef4444"/>
          <text x="0" y="-30" text-anchor="middle" fill="#fff" font-size="10" font-weight="700">O</text>
          <line x1="0" y1="-18" x2="0" y2="-23" stroke="#cbd5e1" stroke-width="3"/>
          
          <!-- C3 (Methyl) -->
          <circle cx="65" cy="0" r="18" fill="#f97316" stroke="#fff" stroke-width="2"/>
          <text x="65" y="5" text-anchor="middle" fill="#fff" font-size="12" font-weight="800">C₃</text>
          <circle cx="95" cy="0" r="9" fill="#f1f5f9"/>
          <text x="95" y="4" text-anchor="middle" fill="#0f172a" font-size="9" font-weight="800">H₃</text>

          <!-- Bound to TPP representation -->
          <path d="M 0 18 L 0 55" stroke="#ec4899" stroke-width="3" stroke-dasharray="4,2"/>
          <rect x="-30" y="55" width="60" height="22" rx="4" fill="#831843" stroke="#ec4899" stroke-width="1"/>
          <text x="0" y="70" text-anchor="middle" fill="#fce7f3" font-size="9" font-weight="700">TPP Covalent Bond</text>
        </g>

        <!-- Cleaved CO2 Molecule (Animated detachment & floating away) -->
        <g class="anim-co2-escape" data-mol="co2" filter="url(#glow-co2)">
          <!-- C1 Carbon -->
          <circle cx="210" cy="180" r="16" fill="#94a3b8" stroke="#cbd5e1" stroke-width="2"/>
          <text x="210" y="185" text-anchor="middle" fill="#0f172a" font-size="11" font-weight="800">C₁</text>
          <!-- Two Double-Bonded Oxygens -->
          <circle cx="170" cy="180" r="13" fill="#ef4444"/>
          <text x="170" y="184" text-anchor="middle" fill="#fff" font-size="10" font-weight="700">O</text>
          <line x1="183" y1="177" x2="194" y2="177" stroke="#cbd5e1" stroke-width="2"/>
          <line x1="183" y1="183" x2="194" y2="183" stroke="#cbd5e1" stroke-width="2"/>

          <circle cx="250" cy="180" r="13" fill="#ef4444"/>
          <text x="250" y="184" text-anchor="middle" fill="#fff" font-size="10" font-weight="700">O</text>
          <line x1="226" y1="177" x2="237" y2="177" stroke="#cbd5e1" stroke-width="2"/>
          <line x1="226" y1="183" x2="237" y2="183" stroke="#cbd5e1" stroke-width="2"/>
          
          <!-- Escape Vector Arrow -->
          <path d="M 210 155 Q 190 120 170 85" fill="none" stroke="#94a3b8" stroke-width="2" stroke-dasharray="4,3"/>
          <polygon points="166,80 174,86 168,91" fill="#94a3b8"/>
        </g>

        <!-- Persistent Default Labels -->
        <g class="scene-labels">
          <g class="label-tag pin-pyruvate" transform="translate(210, 230)" data-mol="co2">
            <rect x="-85" y="-12" width="170" height="24" rx="4" fill="rgba(12,18,30,0.88)" stroke="#94a3b8" stroke-width="1.2"/>
            <text x="0" y="4" text-anchor="middle" fill="#e2e8f0" font-size="10" font-weight="700">CARBON DIOXIDE (CO₂ - 1C)</text>
          </g>

          <g class="label-tag pin-pyruvate" transform="translate(420, 215)">
            <rect x="-105" y="-12" width="210" height="24" rx="4" fill="rgba(12,18,30,0.88)" stroke="#fbbf24" stroke-width="1.2"/>
            <text x="0" y="4" text-anchor="middle" fill="#fef08a" font-size="10" font-weight="700">2C HYDROXYETHYL FRAGMENT</text>
          </g>

          <g class="label-tag pin-pdc" transform="translate(580, 340)">
            <rect x="-80" y="-12" width="160" height="24" rx="4" fill="rgba(12,18,30,0.88)" stroke="#ec4899" stroke-width="1.2"/>
            <text x="0" y="4" text-anchor="middle" fill="#fbcfe8" font-size="10" font-weight="700">E1 DECARBOXYLATION BEAT</text>
          </g>
        </g>
      </svg>
    </div>
  `;
}

// =============================================================================
// SCENE 04: OXIDATION (Electron Transfer to NAD+ -> NADH)
// =============================================================================

function getScene04Oxidation() {
  return `
    <div class="scene-2d-canvas" id="scene-04">
      <svg viewBox="0 0 800 520" class="scene-svg" aria-label="Oxidation beat: electron transfer reducing NAD+ to NADH">
        <defs>
          <filter id="glow-nadh" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="8" result="blur"/>
            <feComposite in="SourceGraphic" in2="blur" operator="over"/>
          </filter>
        </defs>

        <rect width="100%" height="100%" fill="#07101e"/>

        <!-- Enzyme Boundary: E2/E3 Subunit Interface -->
        <path d="M 0 320 Q 400 360 800 320 L 800 520 L 0 520 Z" fill="#0b1b30" stroke="#3b82f6" stroke-width="2"/>
        <text x="400" y="450" text-anchor="middle" fill="#93c5fd" font-size="13" font-weight="700">E3 Subunit (Dihydrolipoyl Dehydrogenase) Redox Hub</text>
        <text x="400" y="475" text-anchor="middle" fill="#60a5fa" font-size="11">Cofactor Relay: Lipoamide &rarr; FAD / FADH₂ &rarr; NAD⁺</text>

        <!-- Animated High-Energy Electron Stream -->
        <g class="anim-electron-pulse">
          <path d="M 240 240 Q 340 160 440 230" fill="none" stroke="#38bdf8" stroke-width="3" stroke-dasharray="6,4"/>
          <!-- Electron Particles -->
          <circle cx="300" cy="195" r="5" fill="#fff" filter="url(#glow-nadh)"/>
          <text x="300" y="180" text-anchor="middle" fill="#38bdf8" font-size="11" font-weight="800">2e⁻ + H⁺</text>
        </g>

        <!-- 2-Carbon Fragment being Oxidized -->
        <g transform="translate(180, 240)">
          <rect x="-45" y="-30" width="90" height="60" rx="12" fill="#1e293b" stroke="#f59e0b" stroke-width="2"/>
          <text x="0" y="-5" text-anchor="middle" fill="#fde68a" font-size="11" font-weight="700">2C ACETYL</text>
          <text x="0" y="14" text-anchor="middle" fill="#f97316" font-size="9.5" font-weight="700">Oxidized State</text>
        </g>

        <!-- NAD+ Receiving Electrons & Transforming to NADH -->
        <g class="anim-nadh-transform" transform="translate(520, 240)" data-mol="nadh" filter="url(#glow-nadh)">
          <!-- NADH Molecule Body (Nicotinamide + Dinucleotide) -->
          <rect x="-70" y="-45" width="140" height="90" rx="16" fill="#1e1b4b" stroke="#818cf8" stroke-width="2.5"/>
          
          <circle cx="-30" cy="-10" r="16" fill="#312e81" stroke="#818cf8" stroke-width="1.5"/>
          <text x="-30" y="-6" text-anchor="middle" fill="#c7d2fe" font-size="9" font-weight="700">Ring</text>
          
          <circle cx="30" cy="-10" r="16" fill="#312e81" stroke="#818cf8" stroke-width="1.5"/>
          <text x="30" y="-6" text-anchor="middle" fill="#c7d2fe" font-size="9" font-weight="700">ADP</text>
          
          <line x1="-14" y1="-10" x2="14" y2="-10" stroke="#818cf8" stroke-width="3"/>

          <!-- High-Energy Glow Badge -->
          <rect x="-55" y="18" width="110" height="20" rx="10" fill="#4338ca"/>
          <text x="0" y="32" text-anchor="middle" fill="#fff" font-size="11" font-weight="800">NADH + H⁺</text>
        </g>

        <!-- Syllabus Warning Badge: NADH != ATP (§16 Rule) -->
        <g transform="translate(400, 75)">
          <rect x="-180" y="-18" width="360" height="36" rx="8" fill="rgba(56,189,248,0.12)" stroke="#38bdf8" stroke-width="1.5"/>
          <text x="0" y="5" text-anchor="middle" fill="#bae6fd" font-size="11" font-weight="700">
            ⚠️ NADH is an Electron Carrier &bull; 0 ATP is Produced Directly
          </text>
        </g>

        <!-- Persistent Labels -->
        <g class="scene-labels">
          <g class="label-tag pin-pyruvate" transform="translate(180, 165)">
            <rect x="-85" y="-12" width="170" height="24" rx="4" fill="rgba(12,18,30,0.88)" stroke="#f59e0b" stroke-width="1.2"/>
            <text x="0" y="4" text-anchor="middle" fill="#fde68a" font-size="10" font-weight="700">OXIDIZED 2C FRAGMENT</text>
          </g>

          <g class="label-tag pin-nad" transform="translate(520, 150)" data-mol="nad">
            <rect x="-95" y="-12" width="190" height="24" rx="4" fill="rgba(12,18,30,0.88)" stroke="#818cf8" stroke-width="1.2"/>
            <text x="0" y="4" text-anchor="middle" fill="#c7d2fe" font-size="10" font-weight="700">NAD⁺ REDUCED &rarr; NADH + H⁺</text>
          </g>

          <g class="label-tag pin-nad" transform="translate(340, 130)">
            <rect x="-75" y="-12" width="150" height="24" rx="4" fill="rgba(12,18,30,0.88)" stroke="#38bdf8" stroke-width="1.2"/>
            <text x="0" y="4" text-anchor="middle" fill="#7dd3fc" font-size="9.5" font-weight="700">2e⁻ TRANSFER RELAY</text>
          </g>
        </g>
      </svg>
    </div>
  `;
}

// =============================================================================
// SCENE 05: ACETYL-CoA FORMATION (Thioester Bond & Product Release)
// =============================================================================

function getScene05AcetylCoA() {
  return `
    <div class="scene-2d-canvas" id="scene-05">
      <svg viewBox="0 0 800 520" class="scene-svg" aria-label="Attachment of Coenzyme A forming Acetyl-CoA with high-energy thioester bond">
        <defs>
          <filter id="glow-gold" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="8" result="blur"/>
            <feComposite in="SourceGraphic" in2="blur" operator="over"/>
          </filter>
        </defs>

        <rect width="100%" height="100%" fill="#07131a"/>

        <!-- E2 Transacetylase Core Floor -->
        <path d="M 0 350 Q 400 390 800 350 L 800 520 L 0 520 Z" fill="#062e24" stroke="#10b981" stroke-width="2.5"/>
        <text x="400" y="450" text-anchor="middle" fill="#6ee7b7" font-size="13" font-weight="700">E2 (Dihydrolipoyl Transacetylase) Catalytic Core</text>
        <text x="400" y="475" text-anchor="middle" fill="#a7f3d0" font-size="11">Transesterification: Acetyldihydrolipoamide + CoA-SH &rarr; Acetyl-CoA</text>

        <!-- Completed Acetyl-CoA Molecule (Highlighted as reaction completion) -->
        <g class="anim-acetyl-coa-assembly" transform="translate(380, 220)" data-mol="acetyl_coa" filter="url(#glow-gold)">
          
          <!-- Outer Highlight Pulse Frame -->
          <rect x="-190" y="-55" width="380" height="110" rx="20" fill="rgba(16,185,129,0.12)" stroke="#facc15" stroke-width="2.5"/>

          <!-- 2C Acetyl Group (Golden Amber) -->
          <g transform="translate(-110, 0)">
            <circle cx="-24" cy="0" r="16" fill="#f59e0b" stroke="#fff" stroke-width="2"/>
            <text x="-24" y="4" text-anchor="middle" fill="#fff" font-size="10" font-weight="800">CH₃</text>
            
            <circle cx="20" cy="0" r="16" fill="#f59e0b" stroke="#fff" stroke-width="2"/>
            <text x="20" y="4" text-anchor="middle" fill="#fff" font-size="11" font-weight="800">C</text>
            <line x1="-8" y1="0" x2="4" y2="0" stroke="#fde68a" stroke-width="4"/>
            
            <!-- Carbonyl Oxygen -->
            <circle cx="20" cy="-30" r="11" fill="#ef4444"/>
            <text x="20" y="-26" text-anchor="middle" fill="#fff" font-size="9" font-weight="700">O</text>
            <line x1="20" y1="-16" x2="20" y2="-19" stroke="#cbd5e1" stroke-width="3"/>
          </g>

          <!-- High-Energy Thioester Bond (-S-) -->
          <g transform="translate(-40, 0)">
            <circle cx="0" cy="0" r="18" fill="#fbbf24" stroke="#d97706" stroke-width="2"/>
            <text x="0" y="5" text-anchor="middle" fill="#78350f" font-size="12" font-weight="900">S</text>
            <line x1="-50" y1="0" x2="-18" y2="0" stroke="#f59e0b" stroke-width="4"/>
            <!-- Energy Sparks around Thioester Bond -->
            <path d="M -10 -22 L 0 -14 L 10 -22" fill="none" stroke="#fef08a" stroke-width="2"/>
          </g>

          <!-- Coenzyme A Carrier Body (Emerald Green Chain) -->
          <g transform="translate(60, 0)">
            <line x1="-82" y1="0" x2="0" y2="0" stroke="#10b981" stroke-width="4"/>
            <rect x="0" y="-24" width="105" height="48" rx="10" fill="#047857" stroke="#34d399" stroke-width="2"/>
            <text x="52" y="-4" text-anchor="middle" fill="#fff" font-size="12" font-weight="800">CoA</text>
            <text x="52" y="12" text-anchor="middle" fill="#a7f3d0" font-size="8.5">Pantothenate+ADP</text>
          </g>
        </g>

        <!-- Thioester Free Energy Badge -->
        <g transform="translate(380, 80)">
          <rect x="-170" y="-18" width="340" height="36" rx="18" fill="rgba(15,23,42,0.9)" stroke="#fbbf24" stroke-width="1.5"/>
          <text x="0" y="5" text-anchor="middle" fill="#fef3c7" font-size="11.5" font-weight="700">
            HIGH-ENERGY THIOESTER BOND: &Delta;G°' = -31.5 kJ/mol
          </text>
        </g>

        <!-- Persistent Labels -->
        <g class="scene-labels">
          <g class="label-tag pin-coa" transform="translate(230, 140)">
            <rect x="-70" y="-12" width="140" height="24" rx="4" fill="rgba(12,18,30,0.88)" stroke="#f59e0b" stroke-width="1.2"/>
            <text x="0" y="4" text-anchor="middle" fill="#fef08a" font-size="10" font-weight="700">2C ACETYL GROUP</text>
          </g>

          <g class="label-tag pin-coa" transform="translate(340, 310)">
            <rect x="-75" y="-12" width="150" height="24" rx="4" fill="rgba(12,18,30,0.88)" stroke="#fbbf24" stroke-width="1.2"/>
            <text x="0" y="4" text-anchor="middle" fill="#fef08a" font-size="10" font-weight="700">THIOESTER BOND (-S-)</text>
          </g>

          <g class="label-tag pin-coa" transform="translate(500, 140)" data-mol="coa">
            <rect x="-75" y="-12" width="150" height="24" rx="4" fill="rgba(12,18,30,0.88)" stroke="#10b981" stroke-width="1.2"/>
            <text x="0" y="4" text-anchor="middle" fill="#a7f3d0" font-size="10" font-weight="700">COENZYME A MOIETY</text>
          </g>
        </g>
      </svg>
    </div>
  `;
}

// =============================================================================
// SCENE 06: THE COMPLETE EQUATION (Spatial 2D Reactants vs Products Layout)
// =============================================================================

function getScene06CompleteEquation() {
  return `
    <div class="scene-2d-canvas" id="scene-06">
      <svg viewBox="0 0 800 520" class="scene-svg" aria-label="Balanced chemical equation layout: reactants, PDC enzyme, products">
        <rect width="100%" height="100%" fill="#070f1a"/>

        <!-- Central PDC Enzyme Machine Icon -->
        <g class="central-pdc" transform="translate(400, 260)" data-mol="pdc">
          <circle cx="0" cy="0" r="48" fill="#1e1b4b" stroke="#ec4899" stroke-width="3"/>
          <circle cx="0" cy="0" r="30" fill="#0f172a" stroke="#facc15" stroke-width="1.5"/>
          <text x="0" y="-3" text-anchor="middle" fill="#fbcfe8" font-size="11" font-weight="800">PDC</text>
          <text x="0" y="11" text-anchor="middle" fill="#f472b6" font-size="8" font-weight="700">E1•E2•E3</text>
          
          <!-- Conversion Flow Arrow through PDC -->
          <path d="M -80 0 L -55 0" stroke="#38bdf8" stroke-width="3"/>
          <polygon points="-52,0 -60,-4 -60,4" fill="#38bdf8"/>

          <path d="M 55 0 L 80 0" stroke="#10b981" stroke-width="3"/>
          <polygon points="85,0 77,-4 77,4" fill="#10b981"/>
        </g>

        <!-- LEFT SIDE: REACTANTS -->
        <g class="reactants-column" transform="translate(160, 260)">
          <!-- Section Title -->
          <text x="0" y="-140" text-anchor="middle" fill="#fed7aa" font-size="14" font-weight="800">REACTANTS (Inputs)</text>
          
          <!-- 1. Pyruvate Card -->
          <g transform="translate(0, -90)" data-mol="pyruvate">
            <rect x="-105" y="-24" width="210" height="48" rx="10" fill="rgba(249,115,22,0.15)" stroke="#f97316" stroke-width="1.5"/>
            <circle cx="-75" cy="0" r="12" fill="#f97316"/>
            <text x="-75" y="4" text-anchor="middle" fill="#fff" font-size="10" font-weight="800" class="stoich-factor">1&times;</text>
            <text x="10" y="4" text-anchor="middle" fill="#fed7aa" font-size="12" font-weight="700">Pyruvate (3C)</text>
          </g>

          <text x="0" y="-46" text-anchor="middle" fill="#64748b" font-size="18" font-weight="700">+</text>

          <!-- 2. CoA-SH Card -->
          <g transform="translate(0, -15)" data-mol="coa">
            <rect x="-105" y="-24" width="210" height="48" rx="10" fill="rgba(16,185,129,0.15)" stroke="#10b981" stroke-width="1.5"/>
            <circle cx="-75" cy="0" r="12" fill="#10b981"/>
            <text x="-75" y="4" text-anchor="middle" fill="#fff" font-size="10" font-weight="800" class="stoich-factor">1&times;</text>
            <text x="10" y="4" text-anchor="middle" fill="#a7f3d0" font-size="12" font-weight="700">Coenzyme A (CoA-SH)</text>
          </g>

          <text x="0" y="29" text-anchor="middle" fill="#64748b" font-size="18" font-weight="700">+</text>

          <!-- 3. NAD+ Card -->
          <g transform="translate(0, 60)" data-mol="nad">
            <rect x="-105" y="-24" width="210" height="48" rx="10" fill="rgba(56,189,248,0.15)" stroke="#38bdf8" stroke-width="1.5"/>
            <circle cx="-75" cy="0" r="12" fill="#0284c7"/>
            <text x="-75" y="4" text-anchor="middle" fill="#fff" font-size="10" font-weight="800" class="stoich-factor">1&times;</text>
            <text x="10" y="4" text-anchor="middle" fill="#bae6fd" font-size="12" font-weight="700">NAD⁺ (Carrier)</text>
          </g>
        </g>

        <!-- RIGHT SIDE: PRODUCTS -->
        <g class="products-column" transform="translate(640, 260)">
          <!-- Section Title -->
          <text x="0" y="-140" text-anchor="middle" fill="#a7f3d0" font-size="14" font-weight="800">PRODUCTS (Outputs)</text>

          <!-- 1. Acetyl-CoA Card -->
          <g transform="translate(0, -95)" data-mol="acetyl_coa">
            <rect x="-105" y="-22" width="210" height="44" rx="10" fill="rgba(251,191,36,0.15)" stroke="#fbbf24" stroke-width="1.5"/>
            <circle cx="-75" cy="0" r="12" fill="#d97706"/>
            <text x="-75" y="4" text-anchor="middle" fill="#fff" font-size="10" font-weight="800" class="stoich-factor">1&times;</text>
            <text x="10" y="4" text-anchor="middle" fill="#fef08a" font-size="11.5" font-weight="700">Acetyl-CoA (2C)</text>
          </g>

          <!-- 2. CO2 Card -->
          <g transform="translate(0, -42)" data-mol="co2">
            <rect x="-105" y="-18" width="210" height="36" rx="8" fill="rgba(148,163,184,0.12)" stroke="#94a3b8" stroke-width="1.2"/>
            <circle cx="-75" cy="0" r="11" fill="#64748b"/>
            <text x="-75" y="4" text-anchor="middle" fill="#fff" font-size="9.5" font-weight="800" class="stoich-factor">1&times;</text>
            <text x="10" y="4" text-anchor="middle" fill="#cbd5e1" font-size="11" font-weight="700">CO₂ (1C Gas leaves)</text>
          </g>

          <!-- 3. NADH Card -->
          <g transform="translate(0, 10)" data-mol="nadh">
            <rect x="-105" y="-18" width="210" height="36" rx="8" fill="rgba(129,140,248,0.15)" stroke="#818cf8" stroke-width="1.2"/>
            <circle cx="-75" cy="0" r="11" fill="#4f46e5"/>
            <text x="-75" y="4" text-anchor="middle" fill="#fff" font-size="9.5" font-weight="800" class="stoich-factor">1&times;</text>
            <text x="10" y="4" text-anchor="middle" fill="#c7d2fe" font-size="11" font-weight="700">NADH (To ETC)</text>
          </g>

          <!-- 4. H+ Proton Card -->
          <g transform="translate(0, 60)" data-mol="h_plus">
            <rect x="-105" y="-18" width="210" height="36" rx="8" fill="rgba(56,189,248,0.1)" stroke="#38bdf8" stroke-width="1"/>
            <circle cx="-75" cy="0" r="11" fill="#0369a1"/>
            <text x="-75" y="4" text-anchor="middle" fill="#fff" font-size="9.5" font-weight="800" class="stoich-factor">1&times;</text>
            <text x="10" y="4" text-anchor="middle" fill="#bae6fd" font-size="11" font-weight="700">H⁺ (Matrix Pool)</text>
          </g>
        </g>

        <!-- Top Header Reaction Banner -->
        <g transform="translate(400, 45)">
          <rect x="-240" y="-18" width="480" height="36" rx="18" fill="rgba(15,23,42,0.92)" stroke="rgba(255,255,255,0.15)" stroke-width="1"/>
          <text x="0" y="5" text-anchor="middle" fill="#fff" font-size="12" font-weight="700">
            pyruvate + CoA + NAD⁺ &rarr; acetyl-CoA + CO₂ + NADH + H⁺
          </text>
        </g>

        <!-- Irreversible Exergonic Thermodynamic Note -->
        <g transform="translate(400, 470)">
          <text x="0" y="0" text-anchor="middle" fill="#94a3b8" font-size="11">
            Standard Free Energy: <tspan fill="#38bdf8" font-weight="700">&Delta;G°' = -33.4 kJ/mol</tspan> &bull; Thermodynamically Irreversible in Vivo
          </text>
        </g>
      </svg>
    </div>
  `;
}

// =============================================================================
// SCENE 07: RESPIRATION CONTEXT (Master Pathway Map)
// =============================================================================

function getScene07RespirationContext() {
  return `
    <div class="scene-2d-canvas" id="scene-07">
      <svg viewBox="0 0 800 520" class="scene-svg" aria-label="Four stages of aerobic cellular respiration with Link Reaction highlighted">
        <rect width="100%" height="100%" fill="#060c18"/>

        <!-- Header Title -->
        <text x="400" y="45" text-anchor="middle" fill="#fff" font-size="16" font-weight="800">
          THE FOUR STAGES OF CELLULAR RESPIRATION
        </text>
        <text x="400" y="68" text-anchor="middle" fill="#94a3b8" font-size="11.5">
          Spatial Compartmentalization across Cytosol, Matrix, and Cristae
        </text>

        <!-- 4 Step Flow Architecture -->
        <!-- Step 1: Glycolysis -->
        <g transform="translate(110, 230)">
          <rect x="-85" y="-100" width="170" height="200" rx="14" fill="#0c1626" stroke="#38bdf8" stroke-width="1.8"/>
          <circle cx="0" cy="-65" r="20" fill="#0284c7"/>
          <text x="0" y="-59" text-anchor="middle" fill="#fff" font-size="14" font-weight="800">1</text>
          
          <text x="0" y="-30" text-anchor="middle" fill="#fff" font-size="13" font-weight="700">GLYCOLYSIS</text>
          <text x="0" y="-12" text-anchor="middle" fill="#38bdf8" font-size="10" font-weight="600">Cytoplasm (Cytosol)</text>
          
          <line x1="-65" y1="5" x2="65" y2="5" stroke="rgba(255,255,255,0.1)"/>
          
          <text x="0" y="26" text-anchor="middle" fill="#cbd5e1" font-size="10">Glucose (6C)</text>
          <text x="0" y="42" text-anchor="middle" fill="#cbd5e1" font-size="10">&darr;</text>
          <text x="0" y="58" text-anchor="middle" fill="#fed7aa" font-size="10" font-weight="700">2 Pyruvate (3C)</text>
          <text x="0" y="80" text-anchor="middle" fill="#a7f3d0" font-size="10.5" font-weight="700">+ 2 ATP (net)</text>
        </g>

        <!-- Flow Arrow 1 -> 2 -->
        <g transform="translate(210, 230)">
          <line x1="-10" y1="0" x2="10" y2="0" stroke="#f97316" stroke-width="3"/>
          <polygon points="15,0 7,-4 7,4" fill="#f97316"/>
        </g>

        <!-- Step 2: The Link Reaction (CURRENT FOCUS - HIGHLIGHTED) -->
        <g transform="translate(305, 230)">
          <!-- Glowing Aura Frame -->
          <rect x="-90" y="-115" width="180" height="230" rx="16" fill="#181309" stroke="#f97316" stroke-width="3" filter="url(#glow-cyan)"/>
          
          <circle cx="0" cy="-75" r="22" fill="#ea580c"/>
          <text x="0" y="-69" text-anchor="middle" fill="#fff" font-size="15" font-weight="800">2</text>
          
          <text x="0" y="-38" text-anchor="middle" fill="#fff" font-size="13" font-weight="800">LINK REACTION</text>
          <text x="0" y="-20" text-anchor="middle" fill="#fed7aa" font-size="10" font-weight="700">Mitochondrial Matrix</text>
          
          <line x1="-70" y1="-5" x2="70" y2="-5" stroke="rgba(249,115,22,0.4)"/>
          
          <text x="0" y="15" text-anchor="middle" fill="#fed7aa" font-size="10">2 Pyruvate (3C)</text>
          <text x="0" y="32" text-anchor="middle" fill="#fed7aa" font-size="10">&darr;</text>
          <text x="0" y="48" text-anchor="middle" fill="#fef08a" font-size="10.5" font-weight="700">2 Acetyl-CoA (2C)</text>
          <text x="0" y="68" text-anchor="middle" fill="#cbd5e1" font-size="9.5">+ 2 CO₂ + 2 NADH</text>
          <text x="0" y="92" text-anchor="middle" fill="#f87171" font-size="10" font-weight="800">0 ATP Produced</text>
        </g>

        <!-- Flow Arrow 2 -> 3 -->
        <g transform="translate(410, 230)">
          <line x1="-10" y1="0" x2="10" y2="0" stroke="#10b981" stroke-width="3"/>
          <polygon points="15,0 7,-4 7,4" fill="#10b981"/>
        </g>

        <!-- Step 3: Krebs Cycle -->
        <g transform="translate(505, 230)">
          <rect x="-85" y="-100" width="170" height="200" rx="14" fill="#0c1d1a" stroke="#10b981" stroke-width="1.8"/>
          <circle cx="0" cy="-65" r="20" fill="#059669"/>
          <text x="0" y="-59" text-anchor="middle" fill="#fff" font-size="14" font-weight="800">3</text>
          
          <text x="0" y="-30" text-anchor="middle" fill="#fff" font-size="13" font-weight="700">KREBS CYCLE</text>
          <text x="0" y="-12" text-anchor="middle" fill="#6ee7b7" font-size="10" font-weight="600">Mitochondrial Matrix</text>
          
          <line x1="-65" y1="5" x2="65" y2="5" stroke="rgba(255,255,255,0.1)"/>
          
          <text x="0" y="26" text-anchor="middle" fill="#cbd5e1" font-size="10">2 Acetyl-CoA (2C)</text>
          <text x="0" y="42" text-anchor="middle" fill="#cbd5e1" font-size="10">&darr;</text>
          <text x="0" y="58" text-anchor="middle" fill="#cbd5e1" font-size="10">4 CO₂ + 6 NADH</text>
          <text x="0" y="80" text-anchor="middle" fill="#a7f3d0" font-size="10.5" font-weight="700">+ 2 FADH₂ + 2 ATP</text>
        </g>

        <!-- Flow Arrow 3 -> 4 -->
        <g transform="translate(605, 230)">
          <line x1="-10" y1="0" x2="10" y2="0" stroke="#ec4899" stroke-width="3"/>
          <polygon points="15,0 7,-4 7,4" fill="#ec4899"/>
        </g>

        <!-- Step 4: Oxidative Phosphorylation -->
        <g transform="translate(700, 230)">
          <rect x="-85" y="-100" width="170" height="200" rx="14" fill="#1e1124" stroke="#ec4899" stroke-width="1.8"/>
          <circle cx="0" cy="-65" r="20" fill="#be185d"/>
          <text x="0" y="-59" text-anchor="middle" fill="#fff" font-size="14" font-weight="800">4</text>
          
          <text x="0" y="-30" text-anchor="middle" fill="#fff" font-size="12" font-weight="700">OXIDATIVE PHOS.</text>
          <text x="0" y="-12" text-anchor="middle" fill="#f472b6" font-size="9.5" font-weight="600">Inner Membrane (Cristae)</text>
          
          <line x1="-65" y1="5" x2="65" y2="5" stroke="rgba(255,255,255,0.1)"/>
          
          <text x="0" y="26" text-anchor="middle" fill="#cbd5e1" font-size="10">10 NADH + 2 FADH₂</text>
          <text x="0" y="42" text-anchor="middle" fill="#cbd5e1" font-size="10">&darr;</text>
          <text x="0" y="58" text-anchor="middle" fill="#cbd5e1" font-size="10">Electron Transport</text>
          <text x="0" y="80" text-anchor="middle" fill="#fbcfe8" font-size="11" font-weight="800">~26-28 ATP Yield</text>
        </g>

        <!-- Summary Tally Footer -->
        <g transform="translate(400, 475)">
          <rect x="-260" y="-16" width="520" height="32" rx="16" fill="rgba(15,23,42,0.95)" stroke="rgba(255,255,255,0.12)"/>
          <text x="0" y="5" text-anchor="middle" fill="#e2e8f0" font-size="11" font-weight="600">
            Total Respiration Yield per Glucose: <tspan fill="#facc15" font-weight="800">~30-32 ATP</tspan> &bull; 6 CO₂ &bull; 6 H₂O
          </text>
        </g>
      </svg>
    </div>
  `;
}
