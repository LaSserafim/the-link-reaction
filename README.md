# The Link Reaction — 2D Interactive Scientific Visualization

A cinematic, rubric-aligned 2D / semi-2D interactive educational visualization of **The Link Reaction** (oxidative decarboxylation of pyruvate) in aerobic cellular respiration, driven by a persistent **Bottom Process Bar**.

Designed to fulfill all six criteria of senior biology curricula (A-Level / AP / IB Biology):
1. **Biological Understanding**: Explicit mitochondrial matrix localization, irreversible thermodynamics ($\Delta G^\circ{'}=-33.4\text{ kJ/mol}$), and balanced reaction stoichiometry.
2. **Scientific Accuracy**: Multi-enzyme Pyruvate Dehydrogenase Complex (PDC) as a unified matrix enzyme machine coordinating decarboxylation, oxidation, and CoA attachment, and clear distinction that NADH is an electron carrier (not ATP).
3. **Key Components & Details**: Pyruvate ($C_3$), CoA-SH (reactive thiol), $\text{NAD}^+$, Acetyl-CoA, $\text{CO}_2$, $\text{NADH}$, $\text{H}^+$, Mitochondrial Pyruvate Carrier (MPC symporter), and outer membrane Porins.
4. **Explanation & Connections**: Standardized **WHERE / WHAT / HOW / WHY** 4-pack on every stage, linking Glycolysis $\rightarrow$ Link Reaction $\rightarrow$ Krebs Cycle $\rightarrow$ Oxidative Phosphorylation.
5. **Communication & Organisation**: 8-stage horizontal **Bottom Process Bar** with step thumbnails, progress fill, keyboard arrow controls, mobile swipe, and an instant non-interactive **Flat Summary** grading sheet.
6. **Creativity & Quality**: Custom 2D / semi-2D vector illustrations with step-triggered biological animations, local replay controls, carbon tracking beads ($C_3 \rightarrow C_2 + C_1 \rightarrow C_2\text{-CoA}$), and a $\times 2$ Per-Glucose stoichiometry toggle.

---

## 🧪 Central Chemical Reaction

$$\text{pyruvate} + \text{CoA-SH} + \text{NAD}^+ \longrightarrow \text{acetyl-CoA} + \text{CO}_2 + \text{NADH} + \text{H}^+$$

- **Standard Free Energy ($\Delta G^\circ{'}$)**: $-33.4\text{ kJ/mol}$ (Thermodynamically Irreversible)
- **Per-Glucose Yield ($\times 2$ Cycles)**: $2\times\text{ Acetyl-CoA} + 2\times\text{ CO}_2 + 2\times\text{ NADH} + 2\times\text{ H}^+$
- **Direct ATP Synthesis**: $0\text{ ATP}$ (energy conserved in NADH and high-energy thioester bond)

---

## 🚀 How to Run Locally

This project uses modern vanilla HTML5, CSS, and ES Modules, requiring **zero build steps or package installations**.

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

## 🧭 Navigation & Interaction

- **Bottom Process Bar**: Click any step node (`00 Arrival` to `07 Respiration Map`) or use arrow buttons to navigate.
- **Interactive Zoom & Pan**: Use the floating `+` / `−` / `Reset` toolbar, mouse scroll wheel, pointer drag, or touch pinch-to-zoom to inspect diagram details up close. Zoom resets smoothly on stage change.
- **Keyboard Shortcuts**: Left/Right Arrow keys jump between stages; `R` replays the active scene animation; `L` toggles all labels; `F` opens the Flat Summary.
- **Mobile Touch**: Swipe left or right on the illustration viewport to change stages, or pinch to zoom.
- **Molecule Inspector**: Click any molecule tag or diagram item (e.g. *Pyruvate*, *CoA*, *NAD⁺*, *CO₂*, *Acetyl-CoA*) to inspect formula and role.
- **+ GO DEEPER**: In-place accordion revealing PDC enzymology, allosteric regulation, and pedagogical simplification notes.
- **Flat Summary**: Click the blue button in the top bar to review a static, print/screenshot-ready overview of the entire curriculum.

---

## 🗂️ Project Structure

- `index.html` — Semantic HTML5 markup, glassmorphic HUD, stage cards, bottom process bar, and Flat Summary modal.
- `styles.css` — Cinematic biological design system, 2D vector styling, keyframe animations, glassmorphism, and responsive breakpoints.
- `app.js` — Application controller, educational database (Stages 00–07), state management, and carbon tracker.
- `scene2d.js` — Vector biological illustration engine generating SVG scenes and animations for all 8 stages.

---

## 📜 License

MIT License. Designed for education and scientific communication.
