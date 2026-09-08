# The Link Reaction — 3D Interactive Scientific Visualization

A cinematic, rubric-aligned 3D interactive educational visualization of **The Link Reaction** (oxidative decarboxylation of pyruvate) in aerobic cellular respiration.

Designed to fulfill all six criteria of senior biology curricula (A-Level / AP / IB Biology):
1. **Biological Understanding**: Explicit mitochondrial matrix localization, irreversible thermodynamics, and balanced reaction stoichiometry.
2. **Scientific Accuracy**: Multi-enzyme Pyruvate Dehydrogenase Complex ($E_1, E_2, E_3$ with cofactors TPP, lipoamide, FAD), substrate channeling, and clear distinction that NADH is an electron carrier (not ATP).
3. **Key Components & Details**: Pyruvate, CoA, $\text{NAD}^+$, Acetyl-CoA, $\text{CO}_2$, $\text{NADH}$, $\text{H}^+$, Mitochondrial Pyruvate Carrier (MPC translocase), and outer membrane Porins.
4. **Explanation & Connections**: Standardized **WHERE / WHAT / HOW / WHY** 4-pack on every stage, linking Glycolysis $\rightarrow$ Link Reaction $\rightarrow$ Krebs Cycle $\rightarrow$ Oxidative Phosphorylation.
5. **Communication & Organisation**: 8-stage continuous journey with interactive timeline scrubber and an instant non-WebGL **Flat Mode** grading sheet.
6. **Creativity & Quality**: WebGL Three.js 3D models, smooth camera choreography, carbon atom tracking beads ($C_3 \rightarrow C_2 + C_1 \rightarrow C_2\text{-CoA}$), and OrbitControls drag inspection.

---

## 🧪 Central Chemical Reaction

$$\text{pyruvate} + \text{CoA-SH} + \text{NAD}^+ \longrightarrow \text{acetyl-CoA} + \text{CO}_2 + \text{NADH} + \text{H}^+$$

- **Standard Free Energy ($\Delta G^\circ{'}$)**: $-33.4\text{ kJ/mol}$ (Thermodynamically Irreversible)
- **Per-Glucose Yield ($\times 2$ Cycles)**: $2\times\text{ Acetyl-CoA} + 2\times\text{ CO}_2 + 2\times\text{ NADH} + 2\times\text{ H}^+$
- **Direct ATP Synthesis**: $0\text{ ATP}$ (energy conserved in NADH and high-energy thioester bond)

---

## 🚀 How to Run Locally

This project uses modern vanilla HTML5, CSS, and Three.js via ES Modules (CDN import maps), requiring **zero build steps or package installations**.

1. Clone this repository:
   ```bash
   git clone https://github.com/LaSserafim/the-link-reaction.git
   cd the-link-reaction
   ```

2. Start any local static web server:
   ```bash
   python3 -m http.server 8000
   ```

3. Open your browser to:
   ```
   http://localhost:8000
   ```

---

## 🗂️ Project Structure

- `index.html` — Semantic HTML5 markup, glassmorphic HUD, stage cards, molecule modals, and Flat Mode fallback.
- `styles.css` — Cinematic dark biological lab design system, responsive layout (desktop, tablet, mobile bottom-sheet), and glassmorphism.
- `app.js` — Educational database (Stages 00–07), Core & Deeper content, state management, and carbon tracker.
- `scene3d.js` — Procedural 3D WebGL engine via Three.js with camera choreography, PDC complex, and floating labels.

---

## 📜 License

MIT License. Designed for education and scientific communication.
