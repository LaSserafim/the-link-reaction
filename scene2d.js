/**
 * THE LINK REACTION — 2D / Semi-2D Biological Illustration & Animation Engine
 * Vector SVG scenes, step-triggered biological animations,
 * interactive Zoom & Pan controller, persistent default labels, and replay controls.
 * 
 * NOTE (Fix 1): Subunit-level PDC enzymology (E1/E2/E3, TPP, lipoamide, FAD)
 * has been removed per syllabus alignment. PDC is presented as a unified enzyme complex.
 */

let container = null;
let currentStage = 0;
let forceAllLabels = false;

// Zoom & Pan state (local to current stage, reset on transition)
const zoomState = {
  scale: 1.0,
  x: 0,
  y: 0,
  minScale: 0.65,
  maxScale: 2.8,
  isDragging: false,
  dragStartX: 0,
  dragStartY: 0
};

// =============================================================================
// INITIALIZE 2D SCENE CONTAINER & ZOOM CONTROLS
// =============================================================================

export function init2DScene(targetElement) {
  container = targetElement || document.getElementById('scene-2d-viewport');
  if (!container) return;

  setupZoomControls();
  render2DStage(0);
}

function setupZoomControls() {
  const btnZoomIn = document.getElementById('btn-zoom-in');
  const btnZoomOut = document.getElementById('btn-zoom-out');
  const btnZoomReset = document.getElementById('btn-zoom-reset');

  btnZoomIn?.addEventListener('click', () => adjustZoom(0.25));
  btnZoomOut?.addEventListener('click', () => adjustZoom(-0.25));
  btnZoomReset?.addEventListener('click', () => resetZoom());

  // Wheel zoom inside viewport (Desktop)
  container.addEventListener('wheel', (e) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.15 : -0.15;
    adjustZoom(delta);
  }, { passive: false });

  // Pointer / Mouse Drag to Pan
  container.addEventListener('pointerdown', (e) => {
    // Only drag if not clicking on an interactive molecule tag
    if (e.target.closest('[data-mol]') || e.target.closest('.label-tag')) return;
    zoomState.isDragging = true;
    zoomState.dragStartX = e.clientX - zoomState.x;
    zoomState.dragStartY = e.clientY - zoomState.y;
    container.style.cursor = 'grabbing';
    container.setPointerCapture(e.pointerId);
  });

  container.addEventListener('pointermove', (e) => {
    if (!zoomState.isDragging) return;
    zoomState.x = e.clientX - zoomState.dragStartX;
    zoomState.y = e.clientY - zoomState.dragStartY;
    
    // Constrain pan so illustration stays visible within viewport
    const maxPan = 350 * zoomState.scale;
    zoomState.x = Math.max(-maxPan, Math.min(maxPan, zoomState.x));
    zoomState.y = Math.max(-maxPan, Math.min(maxPan, zoomState.y));
    
    applyTransform();
  });

  const endDrag = (e) => {
    if (zoomState.isDragging) {
      zoomState.isDragging = false;
      container.style.cursor = zoomState.scale > 1.05 ? 'grab' : 'default';
      try { container.releasePointerCapture(e.pointerId); } catch (_) {}
    }
  };

  container.addEventListener('pointerup', endDrag);
  container.addEventListener('pointercancel', endDrag);

  // Touch Pinch-to-Zoom (Mobile)
  let initialPinchDist = 0;
  let initialPinchScale = 1.0;

  container.addEventListener('touchstart', (e) => {
    if (e.touches.length === 2) {
      initialPinchDist = getTouchDist(e.touches);
      initialPinchScale = zoomState.scale;
    }
  }, { passive: true });

  container.addEventListener('touchmove', (e) => {
    if (e.touches.length === 2 && initialPinchDist > 0) {
      const currentDist = getTouchDist(e.touches);
      const factor = currentDist / initialPinchDist;
      zoomState.scale = Math.min(zoomState.maxScale, Math.max(zoomState.minScale, initialPinchScale * factor));
      applyTransform();
      updateZoomReadout();
    }
  }, { passive: true });

  container.addEventListener('touchend', (e) => {
    if (e.touches.length < 2) initialPinchDist = 0;
  }, { passive: true });
}

function getTouchDist(touches) {
  const dx = touches[0].clientX - touches[1].clientX;
  const dy = touches[0].clientY - touches[1].clientY;
  return Math.sqrt(dx * dx + dy * dy);
}

function adjustZoom(delta) {
  zoomState.scale = Math.min(zoomState.maxScale, Math.max(zoomState.minScale, zoomState.scale + delta));
  applyTransform();
  updateZoomReadout();
}

export function resetZoom() {
  zoomState.scale = 1.0;
  zoomState.x = 0;
  zoomState.y = 0;
  applyTransform();
  updateZoomReadout();
}

function updateZoomReadout() {
  const textEl = document.getElementById('zoom-level-text');
  if (textEl) {
    textEl.textContent = `${Math.round(zoomState.scale * 100)}%`;
  }
  if (container) {
    container.style.cursor = zoomState.scale > 1.05 ? 'grab' : 'default';
  }
}

function applyTransform() {
  const wrapper = container?.querySelector('.scene-svg-wrapper');
  if (wrapper) {
    wrapper.style.transform = `translate(${zoomState.x}px, ${zoomState.y}px) scale(${zoomState.scale})`;
  }
}

// =============================================================================
// RENDER STAGE (00 - 07)
// =============================================================================

export function render2DStage(stageIndex) {
  currentStage = stageIndex;
  if (!container) return;

  // Reset zoom & pan on stage change (Section Fix 2 Requirement)
  resetZoom();

  // Clear previous scene with a clean cross-fade
  container.classList.remove('scene-fade-in');
  void container.offsetWidth; // Force reflow
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

  // Wrap in transform wrapper for smooth zooming & panning
  container.innerHTML = `<div class="scene-svg-wrapper" style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;transform-origin:center center;transition:transform 0.12s cubic-bezier(0.16, 1, 0.3, 1);">${sceneHTML}</div>`;
  
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
      if (molKey) {
        // Dispatch decoupled custom event (avoids circular module dependencies)
        document.dispatchEvent(new CustomEvent('inspect-molecule', { detail: molKey }));
      }
    });
  });
}

export function getStageFocusName(stageIndex) {
  const names = [
    "Mitochondrial Anatomy & Exterior",
    "Membrane Cutaway & MPC Carrier",
    "Pyruvate Dehydrogenase Complex (PDC)",
    "PDC Active Site: Decarboxylation (-CO₂)",
    "PDC Active Site: Oxidation & NAD⁺ Reduction",
    "PDC Active Site: Acetyl-CoA Formation",
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
    <svg viewBox="0 0 800 520" class="scene-svg" aria-label="Mitochondrion cross-section and cytosolic pyruvate">
      <defs>
        <radialGradient id="grad-matrix" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#0b1e33" stop-opacity="0.95"/>
          <stop offset="70%" stop-color="#051221" stop-opacity="0.98"/>
          <stop offset="100%" stop-color="#020812" stop-opacity="1"/>
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
        <filter id="glow-green" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" result="blur"/>
          <feComposite in="SourceGraphic" in2="blur" operator="over"/>
        </filter>
      </defs>

      <!-- Beat 1: Outer Membrane Capsule -->
      <path d="M 250 100 C 350 75, 570 75, 670 100 C 750 125, 750 395, 670 420 C 570 445, 350 445, 250 420 C 170 395, 170 125, 250 100 Z"
            fill="#071b2f" stroke="url(#grad-outer-mem)" stroke-width="3.5" filter="url(#glow-cyan)" class="anim-beat-1"/>

      <!-- Beat 2: Intermembrane Space Band -->
      <path d="M 245 106 C 345 82, 565 82, 665 106 C 740 130, 740 390, 665 414 C 565 438, 345 438, 245 414 C 175 390, 175 130, 245 106 Z"
            fill="rgba(14, 165, 233, 0.07)" stroke="rgba(56, 189, 248, 0.25)" stroke-width="1.5" stroke-dasharray="4,4" class="anim-beat-2"/>

      <!-- Beat 3: Continuous Inner Membrane with 4 Alternating Cristae Folds -->
      <path d="M 205 260 C 205 200, 220 155, 250 140 C 270 130, 295 128, 318 128 C 318 145, 318 200, 318 265 C 318 285, 342 285, 342 265 C 342 200, 342 145, 342 128 C 380 126, 440 126, 478 128 C 478 145, 478 210, 478 275 C 478 295, 502 295, 502 275 C 502 210, 502 145, 502 128 C 550 128, 620 135, 660 155 C 695 175, 705 220, 705 260 C 705 300, 695 345, 660 365 C 625 385, 600 392, 582 392 C 582 375, 582 300, 582 215 C 582 195, 558 195, 558 215 C 558 300, 558 375, 558 392 C 520 394, 460 394, 422 392 C 422 375, 422 290, 422 210 C 422 190, 398 190, 398 210 C 398 290, 398 375, 398 392 C 350 392, 290 388, 250 380 C 220 365, 205 320, 205 260 Z"
            fill="url(#grad-matrix)" stroke="url(#grad-inner-mem)" stroke-width="3" filter="url(#glow-cyan)" class="anim-beat-3"/>

      <!-- Beat 4: Matrix Granules & Callout Labels -->

      <g fill="#10b981" opacity="0.75" class="anim-beat-4" filter="url(#glow-green)">
        <circle cx="275" cy="245" r="3.5"/>
        <circle cx="370" cy="240" r="3.5"/>
        <circle cx="450" cy="260" r="4"/>
        <circle cx="535" cy="235" r="3.5"/>
        <circle cx="635" cy="225" r="3"/>
      </g>

      <g class="scene-labels anim-beat-4">
        <g class="label-tag pin-membrane" transform="translate(300, 68)" data-mol="outer_membrane">
          <line x1="0" y1="12" x2="0" y2="20" stroke="#38bdf8" stroke-width="1.2" stroke-dasharray="2,2"/>
          <circle cx="0" cy="20" r="3" fill="#38bdf8"/>
          <rect x="-65" y="-12" width="130" height="24" rx="4" fill="rgba(12,18,30,0.92)" stroke="#38bdf8" stroke-width="1.2"/>
          <text x="0" y="4" text-anchor="middle" fill="#7dd3fc" font-size="10" font-weight="700">OUTER MEMBRANE</text>
        </g>

        <g class="label-tag pin-ims" transform="translate(580, 68)" data-mol="ims">
          <line x1="0" y1="12" x2="0" y2="30" stroke="#38bdf8" stroke-width="1.2" stroke-dasharray="2,2"/>
          <circle cx="0" cy="30" r="3" fill="#38bdf8"/>
          <rect x="-85" y="-12" width="170" height="24" rx="4" fill="rgba(12,18,30,0.92)" stroke="#38bdf8" stroke-width="1.2"/>
          <text x="0" y="4" text-anchor="middle" fill="#7dd3fc" font-size="10" font-weight="700">INTERMEMBRANE SPACE</text>
        </g>

        <g class="label-tag pin-cristae" transform="translate(320, 468)" data-mol="cristae">
          <line x1="0" y1="-12" x2="90" y2="-158" stroke="#06b6d4" stroke-width="1.5" stroke-dasharray="2,2"/>
          <circle cx="90" cy="-158" r="3.5" fill="#06b6d4"/>
          <rect x="-85" y="-12" width="170" height="24" rx="4" fill="rgba(12,18,30,0.92)" stroke="#06b6d4" stroke-width="1.2"/>
          <text x="0" y="4" text-anchor="middle" fill="#67e8f9" font-size="10" font-weight="700">INNER MEMBRANE (CRISTAE)</text>
        </g>

        <g class="label-tag pin-matrix" transform="translate(560, 468)" data-mol="matrix">
          <line x1="0" y1="-12" x2="-40" y2="-188" stroke="#10b981" stroke-width="1.5" stroke-dasharray="2,2"/>
          <circle cx="-40" cy="-188" r="3.5" fill="#10b981"/>
          <rect x="-75" y="-12" width="150" height="24" rx="4" fill="rgba(12,18,30,0.92)" stroke="#10b981" stroke-width="1.2"/>
          <text x="0" y="4" text-anchor="middle" fill="#6ee7b7" font-size="10" font-weight="700">MITOCHONDRIAL MATRIX</text>
        </g>
      </g>

      <!-- Beat 5: Cytosolic Pyruvate Arrival & Vector -->
      <g class="anim-beat-5">
        <path d="M 125 240 C 145 248, 160 254, 168 258" fill="none" stroke="#f97316" stroke-width="2.5" stroke-dasharray="4,4" opacity="0.8"/>
        <polygon points="172,260 162,254 165,263" fill="#f97316"/>

        <g class="mol-pyruvate-float" data-mol="pyruvate" filter="url(#glow-orange)">
          <line x1="55" y1="210" x2="90" y2="210" stroke="#fdba74" stroke-width="4"/>
          <line x1="90" y1="210" x2="125" y2="210" stroke="#fdba74" stroke-width="4"/>
          
          <circle cx="55" cy="210" r="14" fill="#f97316"/>
          <text x="55" y="214" text-anchor="middle" fill="#fff" font-size="11" font-weight="700">C₁</text>
          <circle cx="40" cy="185" r="9" fill="#ef4444"/>
          <text x="40" y="188" text-anchor="middle" fill="#fff" font-size="9" font-weight="700">O</text>
          <circle cx="40" cy="235" r="9" fill="#ef4444"/>
          <text x="40" y="238" text-anchor="middle" fill="#fff" font-size="8" font-weight="700">O⁻</text>
          
          <circle cx="90" cy="210" r="14" fill="#f97316"/>
          <text x="90" y="214" text-anchor="middle" fill="#fff" font-size="11" font-weight="700">C₂</text>
          <circle cx="90" cy="180" r="9" fill="#ef4444"/>
          <text x="90" y="183" text-anchor="middle" fill="#fff" font-size="9" font-weight="700">O</text>
          
          <circle cx="125" cy="210" r="14" fill="#f97316"/>
          <text x="125" y="214" text-anchor="middle" fill="#fff" font-size="11" font-weight="700">C₃</text>
          <circle cx="147" cy="210" r="7" fill="#f1f5f9"/>
          <text x="147" y="213" text-anchor="middle" fill="#0f172a" font-size="8" font-weight="700">H₃</text>
        </g>

        <g class="label-tag pin-pyruvate" transform="translate(90, 145)" data-mol="pyruvate">
          <line x1="0" y1="12" x2="0" y2="35" stroke="#f97316" stroke-width="1.2" stroke-dasharray="2,2"/>
          <rect x="-65" y="-12" width="130" height="24" rx="4" fill="rgba(12,18,30,0.92)" stroke="#f97316" stroke-width="1.2"/>
          <text x="0" y="4" text-anchor="middle" fill="#fed7aa" font-size="11" font-weight="700">PYRUVATE (3C)</text>
        </g>
      </g>
    </svg>
  `;
}

// =============================================================================
// SCENE 01: MATRIX ENTRY (Layered Cutaway & MPC Transporter)
// =============================================================================

function getScene01Entry() {
  return `
    <svg viewBox="0 0 800 520" class="scene-svg" aria-label="Pyruvate entry across outer membrane and inner membrane MPC carrier">
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
      <g stroke="#60a5fa" stroke-width="1.5" opacity="0.4">
        <line x1="0" y1="120" x2="800" y2="120" stroke-dasharray="6,4"/>
        <line x1="0" y1="135" x2="800" y2="135" stroke-dasharray="6,4"/>
      </g>

      <!-- 2. Intermembrane Space (Middle Band) -->
      <rect x="0" y="145" width="800" height="135" fill="url(#grad-ims-bg)"/>
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

      <!-- Mitochondrial Pyruvate Carrier (MPC Transporter) -->
      <g class="mpc-transporter" data-mol="mpc">
        <rect x="350" y="270" width="100" height="65" rx="10" fill="url(#grad-mpc)" stroke="#fef08a" stroke-width="2"/>
        <rect x="385" y="270" width="30" height="65" fill="#061820" opacity="0.85"/>
        <text x="400" y="306" text-anchor="middle" fill="#fef3c7" font-size="10" font-weight="700">MPC</text>
        <path d="M 430 260 L 430 345" stroke="#38bdf8" stroke-width="2.5" stroke-dasharray="3,3"/>
        <polygon points="430,350 426,342 434,342" fill="#38bdf8"/>
        <text x="445" y="306" fill="#38bdf8" font-size="10" font-weight="700">+ H⁺</text>
      </g>

      <!-- 3. Mitochondrial Matrix (Bottom Chamber) -->
      <rect x="0" y="325" width="800" height="195" fill="url(#grad-matrix-bg)"/>

      <!-- Animated Transit Path for Pyruvate -->
      <path d="M 400 60 L 400 130 L 400 240 L 400 420" 
            fill="none" stroke="#f97316" stroke-width="3" stroke-dasharray="6,4" class="anim-transit-line"/>
      
      <g class="anim-pyruvate-transit" data-mol="pyruvate">
        <circle cx="400" cy="380" r="16" fill="#f97316" stroke="#fff" stroke-width="2"/>
        <text x="400" y="384" text-anchor="middle" fill="#fff" font-size="11" font-weight="700">3C</text>
      </g>

      <!-- Labels on Compartments & Transporter -->
      <g class="scene-labels">
        <g class="label-tag pin-membrane" transform="translate(110, 68)">
          <rect x="-65" y="-12" width="130" height="24" rx="4" fill="rgba(12,18,30,0.88)" stroke="#64748b" stroke-width="1.2"/>
          <text x="0" y="4" text-anchor="middle" fill="#e2e8f0" font-size="10" font-weight="700">CYTOSOL (pH ~7.2)</text>
        </g>

        <g class="label-tag pin-membrane" transform="translate(560, 128)" data-mol="outer_membrane">
          <rect x="-85" y="-12" width="170" height="24" rx="4" fill="rgba(12,18,30,0.88)" stroke="#38bdf8" stroke-width="1.2"/>
          <text x="0" y="4" text-anchor="middle" fill="#7dd3fc" font-size="10" font-weight="700">OUTER MEMBRANE</text>
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
  `;
}

// =============================================================================
// SCENE 02: MEETING THE ENZYME (Unified PDC Enzyme Complex - Fix 1 applied)
// =============================================================================

function getScene02Enzyme() {
  return `
    <svg viewBox="0 0 800 520" class="scene-svg" aria-label="Pyruvate Dehydrogenase Complex structure">
      <defs>
        <radialGradient id="grad-pdc-unified" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#ec4899" stop-opacity="0.95"/>
          <stop offset="50%" stop-color="#be185d" stop-opacity="0.9"/>
          <stop offset="100%" stop-color="#831843" stop-opacity="0.98"/>
        </radialGradient>
        <filter id="glow-pdc" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="8" result="blur"/>
          <feComposite in="SourceGraphic" in2="blur" operator="over"/>
        </filter>
      </defs>

      <rect width="100%" height="100%" fill="#061320"/>

      <!-- PDC Unified Macromolecular Complex (Clean syllabus-aligned representation) -->
      <g class="pdc-machine-assembly" transform="translate(380, 250)" data-mol="pdc" filter="url(#glow-pdc)">
        
        <!-- Outer Halo Ring -->
        <circle cx="0" cy="0" r="160" fill="none" stroke="rgba(236,72,153,0.25)" stroke-dasharray="6,4" stroke-width="2"/>
        <circle cx="0" cy="0" r="125" fill="rgba(236,72,153,0.06)"/>

        <!-- Multi-Enzyme Cluster Blobs (Unified Complex) -->
        <circle cx="-55" cy="-45" r="55" fill="url(#grad-pdc-unified)" stroke="#fbcfe8" stroke-width="2"/>
        <circle cx="55" cy="-45" r="55" fill="url(#grad-pdc-unified)" stroke="#fbcfe8" stroke-width="2"/>
        <circle cx="-55" cy="45" r="55" fill="url(#grad-pdc-unified)" stroke="#fbcfe8" stroke-width="2"/>
        <circle cx="55" cy="45" r="55" fill="url(#grad-pdc-unified)" stroke="#fbcfe8" stroke-width="2"/>
        
        <!-- Center Core Assembly -->
        <circle cx="0" cy="0" r="52" fill="#500724" stroke="#f472b6" stroke-width="2.5"/>
        <text x="0" y="-8" text-anchor="middle" fill="#fff" font-size="14" font-weight="900">PDC</text>
        <text x="0" y="10" text-anchor="middle" fill="#fbcfe8" font-size="9" font-weight="700">Enzyme Complex</text>
        <text x="0" y="24" text-anchor="middle" fill="#f472b6" font-size="8">Catalytic Machine</text>

        <!-- Substrate Channeling Pocket Indicators -->
        <circle cx="-95" cy="0" r="10" fill="#f97316" opacity="0.8"/>
        <text x="-95" y="4" text-anchor="middle" fill="#fff" font-size="8" font-weight="800">In</text>

        <circle cx="95" cy="0" r="10" fill="#10b981" opacity="0.8"/>
        <text x="95" y="4" text-anchor="middle" fill="#fff" font-size="8" font-weight="800">Out</text>
      </g>

      <!-- Approaching Pyruvate Molecule -->
      <g transform="translate(130, 250)" class="anim-pyruvate-dock" data-mol="pyruvate">
        <rect x="-42" y="-18" width="84" height="36" rx="18" fill="#f97316" stroke="#fed7aa" stroke-width="2"/>
        <text x="0" y="5" text-anchor="middle" fill="#fff" font-size="11" font-weight="800">Pyruvate (3C)</text>
        <path d="M 46 0 L 105 0" stroke="#f97316" stroke-width="2.5" stroke-dasharray="4,3"/>
        <polygon points="110,0 102,-4 102,4" fill="#f97316"/>
      </g>

      <!-- Persistent Labels -->
      <g class="scene-labels">
        <g class="label-tag pin-pdc" transform="translate(380, 72)" data-mol="pdc">
          <rect x="-140" y="-12" width="280" height="24" rx="4" fill="rgba(12,18,30,0.88)" stroke="#ec4899" stroke-width="1.2"/>
          <text x="0" y="4" text-anchor="middle" fill="#fbcfe8" font-size="10.5" font-weight="700">PYRUVATE DEHYDROGENASE COMPLEX (PDC)</text>
        </g>

        <g class="label-tag pin-pyruvate" transform="translate(130, 200)" data-mol="pyruvate">
          <rect x="-65" y="-12" width="130" height="24" rx="4" fill="rgba(12,18,30,0.88)" stroke="#f97316" stroke-width="1.2"/>
          <text x="0" y="4" text-anchor="middle" fill="#fed7aa" font-size="10" font-weight="700">SUBSTRATE (PYRUVATE)</text>
        </g>

        <g class="label-tag pin-matrix" transform="translate(380, 445)">
          <rect x="-115" y="-12" width="230" height="24" rx="4" fill="rgba(12,18,30,0.88)" stroke="#10b981" stroke-width="1.2"/>
          <text x="0" y="4" text-anchor="middle" fill="#a7f3d0" font-size="10" font-weight="700">SOLUBLE MITOCHONDRIAL MATRIX</text>
        </g>
      </g>
    </svg>
  `;
}

// =============================================================================
// SCENE 03: DECARBOXYLATION (Pyruvate 3C -> 2C + CO2 Detaches)
// =============================================================================

function getScene03Decarboxylation() {
  return `
    <svg viewBox="0 0 800 520" class="scene-svg" aria-label="Decarboxylation of pyruvate releasing carbon dioxide">
      <defs>
        <filter id="glow-co2" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="5" result="blur"/>
          <feComposite in="SourceGraphic" in2="blur" operator="over"/>
        </filter>
      </defs>

      <rect width="100%" height="100%" fill="#07121e"/>

      <!-- PDC Active Pocket Surface (Simplified per Fix 1) -->
      <path d="M 50 380 Q 250 420 400 370 T 750 390 L 750 520 L 50 520 Z" fill="#2d0b1a" stroke="#ec4899" stroke-width="3"/>
      <text x="400" y="450" text-anchor="middle" fill="#fbcfe8" font-size="14" font-weight="700">Pyruvate Dehydrogenase Complex (PDC) Active Site</text>
      <text x="400" y="475" text-anchor="middle" fill="#f472b6" font-size="11">Decarboxylation Beat: Pyruvate (3C) &rarr; 2-Carbon Fragment + CO₂</text>

      <!-- Live Carbon Counter Banner -->
      <g transform="translate(400, 70)">
        <rect x="-170" y="-18" width="340" height="36" rx="18" fill="rgba(15,23,42,0.92)" stroke="#38bdf8" stroke-width="1.5"/>
        <text x="0" y="5" text-anchor="middle" fill="#e2e8f0" font-size="13" font-weight="700">
          CARBON TRACKER: <tspan fill="#f97316">3C</tspan> &rarr; <tspan fill="#fbbf24">2C</tspan> + <tspan fill="#94a3b8">CO₂ (Leaves)</tspan>
        </text>
      </g>

      <!-- Remaining 2-Carbon Fragment -->
      <g class="acetyl-fragment" transform="translate(320, 280)">
        <line x1="0" y1="0" x2="65" y2="0" stroke="#fbbf24" stroke-width="5"/>
        
        <circle cx="0" cy="0" r="18" fill="#f97316" stroke="#fff" stroke-width="2"/>
        <text x="0" y="5" text-anchor="middle" fill="#fff" font-size="12" font-weight="800">C₂</text>
        <circle cx="0" cy="-34" r="11" fill="#ef4444"/>
        <text x="0" y="-30" text-anchor="middle" fill="#fff" font-size="10" font-weight="700">O</text>
        <line x1="0" y1="-18" x2="0" y2="-23" stroke="#cbd5e1" stroke-width="3"/>
        
        <circle cx="65" cy="0" r="18" fill="#f97316" stroke="#fff" stroke-width="2"/>
        <text x="65" y="5" text-anchor="middle" fill="#fff" font-size="12" font-weight="800">C₃</text>
        <circle cx="95" cy="0" r="9" fill="#f1f5f9"/>
        <text x="95" y="4" text-anchor="middle" fill="#0f172a" font-size="9" font-weight="800">H₃</text>

        <!-- Active Site Bond Anchor -->
        <path d="M 0 18 L 0 55" stroke="#ec4899" stroke-width="3" stroke-dasharray="4,2"/>
        <rect x="-35" y="55" width="70" height="22" rx="4" fill="#831843" stroke="#ec4899" stroke-width="1"/>
        <text x="0" y="70" text-anchor="middle" fill="#fce7f3" font-size="9" font-weight="700">Active Site Anchor</text>
      </g>

      <!-- Cleaved CO2 Molecule (Animated detachment & floating away) -->
      <g class="anim-co2-escape" data-mol="co2" filter="url(#glow-co2)">
        <circle cx="210" cy="180" r="16" fill="#94a3b8" stroke="#cbd5e1" stroke-width="2"/>
        <text x="210" y="185" text-anchor="middle" fill="#0f172a" font-size="11" font-weight="800">C₁</text>
        
        <circle cx="170" cy="180" r="13" fill="#ef4444"/>
        <text x="170" y="184" text-anchor="middle" fill="#fff" font-size="10" font-weight="700">O</text>
        <line x1="183" y1="177" x2="194" y2="177" stroke="#cbd5e1" stroke-width="2"/>
        <line x1="183" y1="183" x2="194" y2="183" stroke="#cbd5e1" stroke-width="2"/>

        <circle cx="250" cy="180" r="13" fill="#ef4444"/>
        <text x="250" y="184" text-anchor="middle" fill="#fff" font-size="10" font-weight="700">O</text>
        <line x1="226" y1="177" x2="237" y2="177" stroke="#cbd5e1" stroke-width="2"/>
        <line x1="226" y1="183" x2="237" y2="183" stroke="#cbd5e1" stroke-width="2"/>
        
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
          <rect x="-95" y="-12" width="190" height="24" rx="4" fill="rgba(12,18,30,0.88)" stroke="#fbbf24" stroke-width="1.2"/>
          <text x="0" y="4" text-anchor="middle" fill="#fef08a" font-size="10" font-weight="700">2-CARBON ACETYL FRAGMENT</text>
        </g>

        <g class="label-tag pin-pdc" transform="translate(580, 340)">
          <rect x="-80" y="-12" width="160" height="24" rx="4" fill="rgba(12,18,30,0.88)" stroke="#ec4899" stroke-width="1.2"/>
          <text x="0" y="4" text-anchor="middle" fill="#fbcfe8" font-size="10" font-weight="700">DECARBOXYLATION STEP</text>
        </g>
      </g>
    </svg>
  `;
}

// =============================================================================
// SCENE 04: OXIDATION (Electron Transfer to NAD+ -> NADH)
// =============================================================================

function getScene04Oxidation() {
  return `
    <svg viewBox="0 0 800 520" class="scene-svg" aria-label="Oxidation beat: electron transfer reducing NAD+ to NADH">
      <defs>
        <filter id="glow-nadh" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="8" result="blur"/>
          <feComposite in="SourceGraphic" in2="blur" operator="over"/>
        </filter>
      </defs>

      <rect width="100%" height="100%" fill="#07101e"/>

      <!-- PDC Active Enzyme Floor -->
      <path d="M 0 320 Q 400 360 800 320 L 800 520 L 0 520 Z" fill="#0b1b30" stroke="#3b82f6" stroke-width="2"/>
      <text x="400" y="450" text-anchor="middle" fill="#93c5fd" font-size="13" font-weight="700">Pyruvate Dehydrogenase Complex (PDC) Oxidation Center</text>
      <text x="400" y="475" text-anchor="middle" fill="#60a5fa" font-size="11">Redox Beat: 2-Carbon Fragment is Oxidized &bull; NAD⁺ is Reduced to NADH + H⁺</text>

      <!-- High-Energy Electron Stream -->
      <g class="anim-electron-pulse">
        <path d="M 240 240 Q 340 160 440 230" fill="none" stroke="#38bdf8" stroke-width="3" stroke-dasharray="6,4"/>
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
        <rect x="-70" y="-45" width="140" height="90" rx="16" fill="#1e1b4b" stroke="#818cf8" stroke-width="2.5"/>
        <circle cx="-30" cy="-10" r="16" fill="#312e81" stroke="#818cf8" stroke-width="1.5"/>
        <text x="-30" y="-6" text-anchor="middle" fill="#c7d2fe" font-size="9" font-weight="700">Ring</text>
        
        <circle cx="30" cy="-10" r="16" fill="#312e81" stroke="#818cf8" stroke-width="1.5"/>
        <text x="30" y="-6" text-anchor="middle" fill="#c7d2fe" font-size="9" font-weight="700">ADP</text>
        <line x1="-14" y1="-10" x2="14" y2="-10" stroke="#818cf8" stroke-width="3"/>

        <rect x="-55" y="18" width="110" height="20" rx="10" fill="#4338ca"/>
        <text x="0" y="32" text-anchor="middle" fill="#fff" font-size="11" font-weight="800">NADH + H⁺</text>
      </g>

      <!-- Syllabus Warning Badge: NADH != ATP -->
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
  `;
}

// =============================================================================
// SCENE 05: ACETYL-CoA FORMATION (Thioester Bond & Product Release)
// =============================================================================

function getScene05AcetylCoA() {
  return `
    <svg viewBox="0 0 800 520" class="scene-svg" aria-label="Attachment of Coenzyme A forming Acetyl-CoA with high-energy thioester bond">
      <defs>
        <filter id="glow-gold" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="8" result="blur"/>
          <feComposite in="SourceGraphic" in2="blur" operator="over"/>
        </filter>
      </defs>

      <rect width="100%" height="100%" fill="#07131a"/>

      <!-- PDC Active Floor (Simplified per Fix 1) -->
      <path d="M 0 350 Q 400 390 800 350 L 800 520 L 0 520 Z" fill="#062e24" stroke="#10b981" stroke-width="2.5"/>
      <text x="400" y="450" text-anchor="middle" fill="#6ee7b7" font-size="13" font-weight="700">Pyruvate Dehydrogenase Complex (PDC) Active Site</text>
      <text x="400" y="475" text-anchor="middle" fill="#a7f3d0" font-size="11">Coupling Beat: 2-Carbon Acetyl Group + CoA-SH &rarr; Acetyl-CoA</text>

      <!-- Completed Acetyl-CoA Molecule -->
      <g class="anim-acetyl-coa-assembly" transform="translate(380, 220)" data-mol="acetyl_coa" filter="url(#glow-gold)">
        
        <rect x="-190" y="-55" width="380" height="110" rx="20" fill="rgba(16,185,129,0.12)" stroke="#facc15" stroke-width="2.5"/>

        <!-- 2C Acetyl Group -->
        <g transform="translate(-110, 0)">
          <circle cx="-24" cy="0" r="16" fill="#f59e0b" stroke="#fff" stroke-width="2"/>
          <text x="-24" y="4" text-anchor="middle" fill="#fff" font-size="10" font-weight="800">CH₃</text>
          
          <circle cx="20" cy="0" r="16" fill="#f59e0b" stroke="#fff" stroke-width="2"/>
          <text x="20" y="4" text-anchor="middle" fill="#fff" font-size="11" font-weight="800">C</text>
          <line x1="-8" y1="0" x2="4" y2="0" stroke="#fde68a" stroke-width="4"/>
          
          <circle cx="20" cy="-30" r="11" fill="#ef4444"/>
          <text x="20" y="-26" text-anchor="middle" fill="#fff" font-size="9" font-weight="700">O</text>
          <line x1="20" y1="-16" x2="20" y2="-19" stroke="#cbd5e1" stroke-width="3"/>
        </g>

        <!-- High-Energy Thioester Bond (-S-) -->
        <g transform="translate(-40, 0)">
          <circle cx="0" cy="0" r="18" fill="#fbbf24" stroke="#d97706" stroke-width="2"/>
          <text x="0" y="5" text-anchor="middle" fill="#78350f" font-size="12" font-weight="900">S</text>
          <line x1="-50" y1="0" x2="-18" y2="0" stroke="#f59e0b" stroke-width="4"/>
          <path d="M -10 -22 L 0 -14 L 10 -22" fill="none" stroke="#fef08a" stroke-width="2"/>
        </g>

        <!-- Coenzyme A Carrier Body -->
        <g transform="translate(60, 0)">
          <line x1="-82" y1="0" x2="0" y2="0" stroke="#10b981" stroke-width="4"/>
          <rect x="0" y="-24" width="105" height="48" rx="10" fill="#047857" stroke="#34d399" stroke-width="2"/>
          <text x="52" y="-4" text-anchor="middle" fill="#fff" font-size="12" font-weight="800">CoA</text>
          <text x="52" y="12" text-anchor="middle" fill="#a7f3d0" font-size="8.5">Pantothenate+ADP</text>
        </g>
      </g>

      <!-- Thioester Free Energy Badge -->
      <g transform="translate(380, 80)">
        <rect x="-170" y="-18" width="340" height="36" rx="18" fill="rgba(15,23,42,0.92)" stroke="#fbbf24" stroke-width="1.5"/>
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
  `;
}

// =============================================================================
// SCENE 06: THE COMPLETE EQUATION (Spatial 2D Reactants vs Products Layout)
// =============================================================================

function getScene06CompleteEquation() {
  return `
    <svg viewBox="0 0 800 520" class="scene-svg" aria-label="Balanced chemical equation layout: reactants, PDC enzyme, products">
      <rect width="100%" height="100%" fill="#070f1a"/>

      <!-- Central PDC Enzyme Machine Icon -->
      <g class="central-pdc" transform="translate(400, 260)" data-mol="pdc">
        <circle cx="0" cy="0" r="48" fill="#1e1b4b" stroke="#ec4899" stroke-width="3"/>
        <circle cx="0" cy="0" r="30" fill="#0f172a" stroke="#facc15" stroke-width="1.5"/>
        <text x="0" y="-3" text-anchor="middle" fill="#fbcfe8" font-size="11" font-weight="800">PDC</text>
        <text x="0" y="11" text-anchor="middle" fill="#f472b6" font-size="8" font-weight="700">Complex</text>
        
        <path d="M -80 0 L -55 0" stroke="#38bdf8" stroke-width="3"/>
        <polygon points="-52,0 -60,-4 -60,4" fill="#38bdf8"/>

        <path d="M 55 0 L 80 0" stroke="#10b981" stroke-width="3"/>
        <polygon points="85,0 77,-4 77,4" fill="#10b981"/>
      </g>

      <!-- LEFT SIDE: REACTANTS -->
      <g class="reactants-column" transform="translate(160, 260)">
        <text x="0" y="-140" text-anchor="middle" fill="#fed7aa" font-size="14" font-weight="800">REACTANTS (Inputs)</text>
        
        <g transform="translate(0, -90)" data-mol="pyruvate">
          <rect x="-105" y="-24" width="210" height="48" rx="10" fill="rgba(249,115,22,0.15)" stroke="#f97316" stroke-width="1.5"/>
          <circle cx="-75" cy="0" r="12" fill="#f97316"/>
          <text x="-75" y="4" text-anchor="middle" fill="#fff" font-size="10" font-weight="800" class="stoich-factor">1&times;</text>
          <text x="10" y="4" text-anchor="middle" fill="#fed7aa" font-size="12" font-weight="700">Pyruvate (3C)</text>
        </g>

        <text x="0" y="-46" text-anchor="middle" fill="#64748b" font-size="18" font-weight="700">+</text>

        <g transform="translate(0, -15)" data-mol="coa">
          <rect x="-105" y="-24" width="210" height="48" rx="10" fill="rgba(16,185,129,0.15)" stroke="#10b981" stroke-width="1.5"/>
          <circle cx="-75" cy="0" r="12" fill="#10b981"/>
          <text x="-75" y="4" text-anchor="middle" fill="#fff" font-size="10" font-weight="800" class="stoich-factor">1&times;</text>
          <text x="10" y="4" text-anchor="middle" fill="#a7f3d0" font-size="12" font-weight="700">Coenzyme A (CoA-SH)</text>
        </g>

        <text x="0" y="29" text-anchor="middle" fill="#64748b" font-size="18" font-weight="700">+</text>

        <g transform="translate(0, 60)" data-mol="nad">
          <rect x="-105" y="-24" width="210" height="48" rx="10" fill="rgba(56,189,248,0.15)" stroke="#38bdf8" stroke-width="1.5"/>
          <circle cx="-75" cy="0" r="12" fill="#0284c7"/>
          <text x="-75" y="4" text-anchor="middle" fill="#fff" font-size="10" font-weight="800" class="stoich-factor">1&times;</text>
          <text x="10" y="4" text-anchor="middle" fill="#bae6fd" font-size="12" font-weight="700">NAD⁺ (Carrier)</text>
        </g>
      </g>

      <!-- RIGHT SIDE: PRODUCTS -->
      <g class="products-column" transform="translate(640, 260)">
        <text x="0" y="-140" text-anchor="middle" fill="#a7f3d0" font-size="14" font-weight="800">PRODUCTS (Outputs)</text>

        <g transform="translate(0, -95)" data-mol="acetyl_coa">
          <rect x="-105" y="-22" width="210" height="44" rx="10" fill="rgba(251,191,36,0.15)" stroke="#fbbf24" stroke-width="1.5"/>
          <circle cx="-75" cy="0" r="12" fill="#d97706"/>
          <text x="-75" y="4" text-anchor="middle" fill="#fff" font-size="10" font-weight="800" class="stoich-factor">1&times;</text>
          <text x="10" y="4" text-anchor="middle" fill="#fef08a" font-size="11.5" font-weight="700">Acetyl-CoA (2C)</text>
        </g>

        <g transform="translate(0, -42)" data-mol="co2">
          <rect x="-105" y="-18" width="210" height="36" rx="8" fill="rgba(148,163,184,0.12)" stroke="#94a3b8" stroke-width="1.2"/>
          <circle cx="-75" cy="0" r="11" fill="#64748b"/>
          <text x="-75" y="4" text-anchor="middle" fill="#fff" font-size="9.5" font-weight="800" class="stoich-factor">1&times;</text>
          <text x="10" y="4" text-anchor="middle" fill="#cbd5e1" font-size="11" font-weight="700">CO₂ (1C Gas leaves)</text>
        </g>

        <g transform="translate(0, 10)" data-mol="nadh">
          <rect x="-105" y="-18" width="210" height="36" rx="8" fill="rgba(129,140,248,0.15)" stroke="#818cf8" stroke-width="1.2"/>
          <circle cx="-75" cy="0" r="11" fill="#4f46e5"/>
          <text x="-75" y="4" text-anchor="middle" fill="#fff" font-size="9.5" font-weight="800" class="stoich-factor">1&times;</text>
          <text x="10" y="4" text-anchor="middle" fill="#c7d2fe" font-size="11" font-weight="700">NADH (To ETC)</text>
        </g>

        <g transform="translate(0, 60)" data-mol="h_plus">
          <rect x="-105" y="-18" width="210" height="36" rx="8" fill="rgba(56,189,248,0.1)" stroke="#38bdf8" stroke-width="1"/>
          <circle cx="-75" cy="0" r="11" fill="#0369a1"/>
          <text x="-75" y="4" text-anchor="middle" fill="#fff" font-size="9.5" font-weight="800" class="stoich-factor">1&times;</text>
          <text x="10" y="4" text-anchor="middle" fill="#bae6fd" font-size="11" font-weight="700">H⁺ (Matrix Pool)</text>
        </g>
      </g>

      <!-- Top Header Reaction Banner -->
      <g transform="translate(400, 62)">
        <rect x="-240" y="-18" width="480" height="36" rx="18" fill="rgba(15,23,42,0.92)" stroke="rgba(255,255,255,0.15)" stroke-width="1"/>
        <text x="0" y="5" text-anchor="middle" fill="#fff" font-size="12" font-weight="700">
          pyruvate + CoA + NAD⁺ &rarr; acetyl-CoA + CO₂ + NADH + H⁺
        </text>
      </g>

      <!-- Thermodynamic Note -->
      <g transform="translate(400, 470)">
        <text x="0" y="0" text-anchor="middle" fill="#94a3b8" font-size="11">
          Standard Free Energy: <tspan fill="#38bdf8" font-weight="700">&Delta;G°' = -33.4 kJ/mol</tspan> &bull; Thermodynamically Irreversible in Vivo
        </text>
      </g>
    </svg>
  `;
}

// =============================================================================
// SCENE 07: RESPIRATION CONTEXT (Master Pathway Map)
// =============================================================================

function getScene07RespirationContext() {
  return `
    <svg viewBox="0 0 800 520" class="scene-svg" aria-label="Four stages of aerobic cellular respiration with Link Reaction highlighted">
      <defs>
        <filter id="glow-highlight" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="6" result="blur"/>
          <feComposite in="SourceGraphic" in2="blur" operator="over"/>
        </filter>
      </defs>

      <rect width="100%" height="100%" fill="#060c18"/>

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

      <!-- Arrow 1 -> 2 -->
      <g transform="translate(210, 230)">
        <line x1="-10" y1="0" x2="10" y2="0" stroke="#f97316" stroke-width="3"/>
        <polygon points="15,0 7,-4 7,4" fill="#f97316"/>
      </g>

      <!-- Step 2: The Link Reaction (CURRENT FOCUS) -->
      <g transform="translate(305, 230)">
        <rect x="-90" y="-115" width="180" height="230" rx="16" fill="#181309" stroke="#f97316" stroke-width="3" filter="url(#glow-highlight)"/>
        
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

      <!-- Arrow 2 -> 3 -->
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

      <!-- Arrow 3 -> 4 -->
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

      <!-- Summary Footer -->
      <g transform="translate(400, 475)">
        <rect x="-260" y="-16" width="520" height="32" rx="16" fill="rgba(15,23,42,0.95)" stroke="rgba(255,255,255,0.12)"/>
        <text x="0" y="5" text-anchor="middle" fill="#e2e8f0" font-size="11" font-weight="600">
          Total Respiration Yield per Glucose: <tspan fill="#facc15" font-weight="800">~30-32 ATP</tspan> &bull; 6 CO₂ &bull; 6 H₂O
        </text>
      </g>
    </svg>
  `;
}
