/**
 * THE LINK REACTION — 2D / Semi-2D Application Controller
 * Manages the Bottom Process Bar, 8-stage narrative progression,
 * Core/Deeper tiers, carbon tracker, and flat summary grading fallback.
 */

import { init2DScene, render2DStage, replayCurrentStageAnimation, toggleAll2DLabels, getStageFocusName } from './scene2d.js';

// =============================================================================
// 1. COMPREHENSIVE EDUCATIONAL DATABASE (STAGES 00 - 07)
// =============================================================================

export const STAGES_DATA = [
  {
    id: 0,
    number: "00 / 07",
    shortName: "Arrival",
    iconLabel: "Mito",
    title: "Arrival at the Mitochondrion",
    conceptHeadline: "The molecular bridge between glycolysis and the Krebs cycle.",
    compartment: "Cytosol / Outer Membrane",
    nature: "Preparatory",
    where: "Cytoplasm bordering the mitochondrial outer membrane.",
    what: "Pyruvate (3C), formed by cytosolic glycolysis, drifts toward the powerhouse of the cell.",
    how: "Small polar metabolites pass through large, non-selective outer membrane porin channels.",
    why: "Glycolysis yields only 2 net ATP in the cytoplasm. Accessing the ~30 ATP of aerobic respiration requires entering the mitochondrial matrix.",
    coreText: `
      Aerobic cellular respiration requires pyruvate to migrate from the <strong>cytosol</strong> into the <strong>mitochondrial matrix</strong>. 
      The Link Reaction serves as the mandatory, irreversible metabolic gateway linking anaerobic glycolysis to the oxygen-consuming aerobic pathways (Krebs Cycle &amp; Oxidative Phosphorylation).
    `,
    moleculesInFocus: ["pyruvate", "porin"],
    carbonState: {
      status: "3C (Pyruvate)",
      beads: ["active", "active", "active"]
    },
    deeper: {
      enzymology: "Glycolysis ends in the cytoplasm with 2 pyruvate molecules per glucose. Porin channels (voltage-dependent anion channels, VDAC) in the outer membrane allow passive diffusion of small molecules under 5,000 Daltons into the intermembrane space.",
      mechanism: "Pyruvate is an alpha-keto acid (CH₃-CO-COO⁻) with a net negative charge at physiological pH (7.2–7.4), allowing it to traverse the outer membrane aqueous pore.",
      regulation: "If cellular oxygen is depleted, pyruvate cannot proceed through the link reaction; instead, it is diverted to lactate dehydrogenase in animals (fermentation) to regenerate NAD⁺.",
      simplificationNote: "The outer membrane is permeable to small molecules, but the inner membrane is an impermeable barrier that requires specific carrier proteins."
    }
  },
  {
    id: 1,
    number: "01 / 07",
    shortName: "Matrix Entry",
    iconLabel: "Entry",
    title: "Entry into the Matrix",
    conceptHeadline: "Crossing the impermeable inner membrane into the reaction chamber.",
    compartment: "Inner Membrane & Matrix",
    nature: "Active Transport",
    where: "Across the inner mitochondrial membrane into the mitochondrial matrix.",
    what: "Pyruvate moves through the intermembrane space and crosses into the matrix via a specific transport protein.",
    how: "The Mitochondrial Pyruvate Carrier (MPC) transports pyruvate via proton-coupled symport down the proton motive force.",
    why: "The inner mitochondrial membrane maintains the chemiosmotic gradient. Pyruvate cannot diffuse freely; it must be specifically imported into the matrix where the link enzymes reside.",
    coreText: `
      Unlike the porous outer membrane, the <strong>inner mitochondrial membrane</strong> is strictly impermeable to charged ions and metabolites. 
      Pyruvate utilizes the <strong>Mitochondrial Pyruvate Carrier (MPC)</strong> to enter the matrix. 
      This is not passive leakage—it relies directly on the proton motive force created by aerobic respiration.
    `,
    moleculesInFocus: ["pyruvate", "mpc"],
    carbonState: {
      status: "3C (Entering Matrix)",
      beads: ["active", "active", "active"]
    },
    deeper: {
      enzymology: "The MPC is an obligate heterodimer of MPC1 and MPC2 proteins located in the inner membrane. It operates as a pyruvate⁻ / H⁺ symporter.",
      mechanism: "The electron transport chain pumps H⁺ ions into the intermembrane space, creating a membrane potential (~-180 mV) and pH gradient (pH ~8.0 in matrix vs 7.2 in IMS). Pyruvate import is energetically coupled to this electrochemical gradient.",
      regulation: "MPC activity is a key regulatory bottleneck. In cancer cells (Warburg effect), MPC is frequently downregulated, trapping pyruvate in the cytosol to drive aerobic glycolysis.",
      simplificationNote: "Many general textbooks omit the MPC and simply state 'pyruvate enters via active transport'."
    }
  },
  {
    id: 2,
    number: "02 / 07",
    shortName: "PDC Complex",
    iconLabel: "PDC",
    title: "Meeting the Pyruvate Dehydrogenase Complex",
    conceptHeadline: "A colossal macromolecular machine coordinating three coupled enzymes.",
    compartment: "Mitochondrial Matrix",
    nature: "Enzyme Assembly",
    where: "Soluble mitochondrial matrix, surrounded by high concentrations of metabolic enzymes.",
    what: "Pyruvate encounters the Pyruvate Dehydrogenase Complex (PDC), a multi-enzyme assembly larger than a ribosome.",
    how: "The PDC coordinates three distinct catalytic subunits (E1, E2, E3) and 5 coenzymes via substrate channeling on a flexible lipoamide arm.",
    why: "Multi-enzyme complexes dramatically increase reaction velocity, prevent toxic or reactive intermediates from leaking into solution, and prevent side reactions.",
    coreText: `
      The link reaction is not catalysed by a single simple enzyme, but by the <strong>Pyruvate Dehydrogenase Complex (PDC)</strong>. 
      In mammalian cells, this behemoth has a molecular mass of over 9 million Daltons. 
      Substrates are channeled directly between active sites without ever diffusing into the bulk matrix.
    `,
    moleculesInFocus: ["pdc", "pyruvate"],
    carbonState: {
      status: "3C (Docked at E1)",
      beads: ["active", "active", "active"]
    },
    deeper: {
      enzymology: "The PDC contains 3 core catalytic enzymes: E1 (pyruvate dehydrogenase, 24-30 copies), E2 (dihydrolipoyl transacetylase, 24-60 copies forming the structural dodecahedral core), and E3 (dihydrolipoyl dehydrogenase, 12 copies).",
      mechanism: "Five vital coenzymes cooperate in PDC catalysis: Thiamine Pyrophosphate (TPP, on E1), Lipoamide (on E2), Coenzyme A (free substrate), Flavin Adenine Dinucleotide (FAD, on E3), and NAD⁺ (free substrate).",
      regulation: "PDC is tightly controlled. Inactivated by Pyruvate Dehydrogenase Kinase (PDK) which phosphorylates E1 in response to high energy states (high ATP, NADH, Acetyl-CoA). Activated by Pyruvate Dehydrogenase Phosphatase (PDP) in response to high ADP, pyruvate, and Ca²⁺.",
      simplificationNote: "Core syllabus models present PDC as a single black box; in reality, its three distinct subunits perform distinct consecutive chemical reactions."
    }
  },
  {
    id: 3,
    number: "03 / 07",
    shortName: "Decarboxylation",
    iconLabel: "–CO₂",
    title: "Decarboxylation: Carbon Leaves",
    conceptHeadline: "The loss of the first carbon atom in cellular respiration as CO₂.",
    compartment: "PDC Subunit E1 Active Site",
    nature: "Decarboxylation",
    where: "Active site of enzyme subunit E1 (Pyruvate Dehydrogenase) in the matrix.",
    what: "Pyruvate (3C) loses its carboxyl group (-COO⁻), releasing one molecule of gaseous carbon dioxide (CO₂).",
    how: "The carbanion of the cofactor Thiamine Pyrophosphate (TPP) on E1 attacks the C2 carbonyl of pyruvate, displacing CO₂ and forming a 2-carbon hydroxyethyl-TPP intermediate.",
    why: "Decarboxylation eliminates a carbon atom, transforming a 3-carbon glycolytic product into a 2-carbon acetyl fragment that fits the entry requirement of the Krebs cycle.",
    coreText: `
      This is the first chemical transformation: <strong>Decarboxylation</strong>. 
      The carboxyl group of pyruvate is cleaved off and diffuses away as <strong>carbon dioxide (CO₂)</strong>. 
      The carbon backbone is permanently reduced from <strong>3 carbons to 2 carbons</strong>. 
      This is where the first CO₂ of cellular respiration originates—not solely in the Krebs cycle.
    `,
    moleculesInFocus: ["pyruvate", "co2"],
    carbonState: {
      status: "2C Fragment + 1C CO₂ (Detached)",
      beads: ["detached", "active", "active"]
    },
    deeper: {
      enzymology: "Enzyme E1 uses Thiamine Pyrophosphate (TPP), derived from Vitamin B1 (thiamine). The thiazolium ring of TPP forms a carbanion (ylide) that attacks the carbonyl carbon of pyruvate.",
      mechanism: "CO₂ gas is released, leaving a resonance-stabilized 2-carbon hydroxyethyl-TPP carbanion covalently bound to E1.",
      regulation: "Severe thiamine deficiency (Beriberi or Wernicke-Korsakoff syndrome) inhibits E1, crippling aerobic glucose metabolism and causing devastating neurological symptoms.",
      simplificationNote: "The 2-carbon fragment does not float free as acetate; it remains tightly bound to TPP on E1 until the lipoamide arm of E2 arrives."
    }
  },
  {
    id: 4,
    number: "04 / 07",
    shortName: "Oxidation",
    iconLabel: "Redox",
    title: "Oxidation: Transfer of Electrons to NAD⁺",
    conceptHeadline: "Harvesting high-energy electrons to reduce NAD⁺ into NADH.",
    compartment: "PDC Subunit E2 & E3 Active Sites",
    nature: "Redox Reaction",
    where: "Enzyme subunit E2 and E3 active sites within the PDC in the mitochondrial matrix.",
    what: "The 2-carbon hydroxyethyl fragment is oxidized to an acetyl group; NAD⁺ is reduced to NADH + H⁺.",
    how: "The disulfide bond of lipoamide on E2 oxidizes the 2-carbon fragment; electrons are subsequently transferred through FAD on E3 to reduce NAD⁺ into NADH + H⁺.",
    why: "NADH is a high-energy electron carrier. It carries these harvested electrons directly to Complex I of the Electron Transport Chain, which drives bulk ATP synthesis.",
    coreText: `
      This is the <strong>oxidation</strong> beat of oxidative decarboxylation. 
      The 2-carbon fragment loses electrons and protons, which are accepted by the electron carrier <strong>NAD⁺</strong>, reducing it to <strong>NADH + H⁺</strong>. 
      <strong>Crucial syllabus rule:</strong> NADH is an electron carrier, <em>not</em> ATP. No ATP is directly synthesized during the link reaction.
    `,
    moleculesInFocus: ["nad", "nadh", "h_plus"],
    carbonState: {
      status: "2C (Oxidized Acetyl) + NADH",
      beads: ["detached", "active", "active"]
    },
    deeper: {
      enzymology: "Subunit E2 utilizes lipoamide (lipoic acid covalently bound to a lysine residue). This 14 Ångström flexible swinging arm visits E1, oxidizes hydroxyethyl-TPP to an acetyl group, and becomes reduced to dihydrolipoamide.",
      mechanism: "Subunit E3 (dihydrolipoyl dehydrogenase) re-oxidizes dihydrolipoamide back to oxidized lipoamide. Electrons pass from lipoamide → E3 disulfide → FAD → FADH₂ → NAD⁺, yielding NADH and a free proton (H⁺).",
      regulation: "High matrix [NADH]/[NAD⁺] ratio strongly inhibits E3 via competitive product inhibition, signaling that downstream electron transport is saturated.",
      simplificationNote: "In introductory syllabi, oxidation and CoA attachment are shown as separate sequential beats for clarity. In biochemical reality, the oxidation happens simultaneously when lipoamide's disulfide bond is reduced as it accepts the acetyl group on E2."
    }
  },
  {
    id: 5,
    number: "05 / 07",
    shortName: "Acetyl-CoA",
    iconLabel: "CoA",
    title: "Formation of Acetyl-CoA",
    conceptHeadline: "Coupling the 2-carbon acetyl group to Coenzyme A via a high-energy thioester bond.",
    compartment: "PDC Subunit E2 Active Site",
    nature: "Thioester Synthesis",
    where: "Catalytic core of subunit E2 (Dihydrolipoyl Transacetylase) in the mitochondrial matrix.",
    what: "The 2-carbon acetyl fragment is transferred to the reactive thiol group (-SH) of Coenzyme A, forming Acetyl-CoA.",
    how: "Transesterification transfers the acetyl group from the acetyldihydrolipoamide arm to the sulfur atom of Coenzyme A (CoA-SH).",
    why: "The thioester bond in Acetyl-CoA has a very high free energy of hydrolysis (-31.5 kJ/mol), activating the 2-carbon acetate so it can spontaneously condense with 4-carbon oxaloacetate in the first step of the Krebs cycle.",
    coreText: `
      The final chemical step produces <strong>Acetyl-CoA</strong>. 
      Coenzyme A binds to the 2-carbon acetyl group through a high-energy <strong>carbon-sulfur thioester bond</strong>. 
      Acetyl-CoA now detaches from the PDC, primed to enter the Krebs cycle. 
      The Link Reaction is officially complete.
    `,
    moleculesInFocus: ["coa", "acetyl_coa"],
    carbonState: {
      status: "2C-S-CoA (Acetyl-CoA Formed)",
      beads: ["detached", "acetyl", "acetyl"]
    },
    deeper: {
      enzymology: "Coenzyme A consists of a 3'-phosphoadenosine diphosphate linked to pantothenate (vitamin B5) and beta-mercaptoethylamine. The reactive business end is the terminal sulfhydryl / thiol group (-SH).",
      mechanism: "Transesterification on E2: Acetyldihydrolipoamide + CoA-SH ⇌ Acetyl-CoA + Dihydrolipoamide. The acetyl group is transferred to sulfur, preserving the chemical energy released by the earlier oxidation of pyruvate.",
      regulation: "Acetyl-CoA exerts potent product inhibition on subunit E2. It also acts as an allosteric activator of pyruvate carboxylase.",
      simplificationNote: "Because sulfur does not form effective pi-bonds with carbon, thioesters lack the resonance stabilization of oxygen esters. This gives the thioester bond its high chemical transfer potential."
    }
  },
  {
    id: 6,
    number: "06 / 07",
    shortName: "Complete Equation",
    iconLabel: "Eq.",
    title: "The Balanced Equation & Stoichiometry",
    conceptHeadline: "Resolving per-pyruvate versus per-glucose yields.",
    compartment: "Mitochondrial Matrix Chamber",
    nature: "Quantitative Yield",
    where: "The entire mitochondrial matrix reaction space.",
    what: "Spatial assembly of all reactants (pyruvate, CoA, NAD⁺) and products (acetyl-CoA, CO₂, NADH, H⁺).",
    how: "One molecule of glucose (6C) splits in glycolysis to yield 2 molecules of pyruvate (3C). Therefore, the Link Reaction occurs twice per glucose.",
    why: "Exam questions frequently test students on whether stoichiometric yields are calculated per single pyruvate molecule or per original glucose molecule.",
    coreText: `
      Here is the complete balanced Link Reaction: 
      <br><strong>pyruvate + CoA + NAD⁺ &rarr; acetyl-CoA + CO₂ + NADH + H⁺</strong>
      <br><br>
      Because each glucose yields <strong>2 pyruvates</strong> during glycolysis, the Link Reaction operates <strong>twice per glucose</strong>:
      <br><strong>2 Pyruvate &rarr; 2 Acetyl-CoA + 2 CO₂ + 2 NADH + 2 H⁺</strong>. 
      Remember: <strong>0 ATP is made directly</strong>.
    `,
    moleculesInFocus: ["pyruvate", "coa", "nad", "acetyl_coa", "co2", "nadh"],
    carbonState: {
      status: "Complete Equation Balance",
      beads: ["detached", "acetyl", "acetyl"]
    },
    deeper: {
      enzymology: "Standard free energy change: ΔG°' = -33.4 kJ/mol. The large negative free energy and loss of volatile CO₂ gas makes this reaction physiologically irreversible in vivo. Animals cannot convert acetyl-CoA into pyruvate or glucose.",
      mechanism: "Carbon balance: 3C (Pyruvate) = 2C (Acetyl-CoA) + 1C (CO₂). Redox balance: NAD⁺ + 2e⁻ + 2H⁺ → NADH + H⁺. Energy balance: 0 ATP directly, but the 2 NADH generated will yield ~5 ATP via oxidative phosphorylation.",
      regulation: "PDC is the central commitment point in animal metabolism: once pyruvate passes this gate, the carbons are destined either for complete oxidation in the Krebs cycle or for fatty acid synthesis.",
      simplificationNote: "Always check whether an exam question specifies 'per pyruvate' (1 Acetyl-CoA, 1 CO₂, 1 NADH) or 'per glucose' (2 Acetyl-CoA, 2 CO₂, 2 NADH)."
    }
  },
  {
    id: 7,
    number: "07 / 07",
    shortName: "Respiration Map",
    iconLabel: "Map",
    title: "Where This Sits in Respiration",
    conceptHeadline: "The master metabolic map connecting all four stages of cellular respiration.",
    compartment: "Whole Mitochondrion & Cytosol",
    nature: "Metabolic Integration",
    where: "From the cytoplasm, through the matrix, to the inner mitochondrial cristae.",
    what: "Contextual map showing Glycolysis (cytosol) &rarr; Link Reaction (matrix) &rarr; Krebs Cycle (matrix) &rarr; Oxidative Phosphorylation (inner membrane).",
    how: "The products of the link reaction feed directly into downstream systems: Acetyl-CoA enters the Krebs cycle, and NADH feeds electrons into Complex I of the ETC.",
    why: "Understanding the spatial compartmentalization of respiration is essential to understanding how eukaryotic cells achieve high metabolic efficiency and ATP yield.",
    coreText: `
      The Link Reaction is the central linchpin of cellular respiration:
      <br>1. <strong>Glycolysis (Cytosol):</strong> Glucose &rarr; 2 Pyruvate + 2 ATP + 2 NADH.
      <br>2. <strong>Link Reaction (Matrix):</strong> 2 Pyruvate &rarr; 2 Acetyl-CoA + 2 CO₂ + 2 NADH.
      <br>3. <strong>Krebs Cycle (Matrix):</strong> 2 Acetyl-CoA &rarr; 4 CO₂ + 6 NADH + 2 FADH₂ + 2 ATP.
      <br>4. <strong>Oxidative Phosphorylation (Cristae):</strong> 10 NADH + 2 FADH₂ drive ~26-28 ATP synthesis.
    `,
    moleculesInFocus: ["acetyl_coa", "nadh"],
    carbonState: {
      status: "Respiration Network Context",
      beads: ["detached", "acetyl", "acetyl"]
    },
    deeper: {
      enzymology: "The link reaction and Krebs cycle share the same compartment (matrix) which prevents dilution of Acetyl-CoA and maintains high local substrate concentrations for Citrate Synthase.",
      mechanism: "CO₂ produced by the link reaction (and Krebs cycle) is non-polar and diffuses freely out of the mitochondrion, into the capillaries, to be exhaled by the lungs.",
      regulation: "If oxygen is unavailable, the electron transport chain halts, NADH and FADH₂ accumulate, matrix NAD⁺ is depleted, and both the Krebs cycle and Link Reaction shut down completely.",
      simplificationNote: "Although taught as distinct chapters in textbooks, in a living cell these four stages operate simultaneously and in direct physical proximity."
    }
  }
];

// =============================================================================
// 2. MOLECULE INSPECTOR DATABASE
// =============================================================================

export const MOLECULES_DATA = {
  pyruvate: {
    name: "Pyruvate (Pyruvic Acid)",
    formula: "C₃H₃O₃⁻ • 87.05 g/mol",
    category: "Substrate Metabolite",
    carbons: 3,
    diagram: `  O     O
  ||    ||
  C  -  C  -  CH₃
  |
  O⁻`,
    role: "The 3-carbon carboxylate end-product of glycolysis. Formed in the cytoplasm, it must cross both mitochondrial membranes into the matrix to enter aerobic respiration.",
    fate: "Decarboxylated by E1 of the PDC to release CO₂ and leave a 2-carbon hydroxyethyl group attached to TPP.",
    alert: "Glycolysis produces 2 pyruvate molecules per glucose. Hence, 2 link reactions occur for every glucose molecule consumed."
  },
  coa: {
    name: "Coenzyme A (CoA-SH)",
    formula: "C₂₁H₃₆N₇O₁₆P₃S • 767.53 g/mol",
    category: "Carrier Coenzyme",
    carbons: 0,
    diagram: `ADP-3'P -- Pantothenate -- Cysteamine -- SH (Thiol)`,
    role: "A universal carrier of acyl groups in all living organisms. Derived from pantothenic acid (Vitamin B5).",
    fate: "Its terminal thiol (-SH) accepts the 2-carbon acetyl fragment from the PDC lipoamide arm, forming an energy-rich thioester bond in Acetyl-CoA.",
    alert: "The thioester bond has a high negative standard free energy of hydrolysis (ΔG°' = -31.5 kJ/mol), which provides the driving force for the subsequent Krebs cycle."
  },
  nad: {
    name: "NAD⁺ (Nicotinamide Adenine Dinucleotide)",
    formula: "C₂₁H₂₇N₇O₁₄P₂ • 663.43 g/mol",
    category: "Oxidized Electron Carrier",
    carbons: 0,
    diagram: `Nicotinamide+ - Ribose - Pyrophosphate - Adenosine`,
    role: "The primary oxidized coenzyme electron acceptor of catabolic metabolism. Derived from niacin (Vitamin B3).",
    fate: "Accepts 2 electrons and 1 proton (hydride ion :H⁻) from subunit E3 of the PDC, becoming reduced to NADH, while releasing 1 proton (H⁺) into the matrix.",
    alert: "NAD⁺ is strictly an electron shuttle, NOT ATP. It must be regenerated by the electron transport chain or fermentation."
  },
  nadh: {
    name: "NADH (Reduced Carrier)",
    formula: "C₂₁H₂₉N₇O₁₄P₂ • 665.44 g/mol",
    category: "Reduced Electron Carrier",
    carbons: 0,
    diagram: `Nicotinamide-H (Reduced) -- Dinucleotide Backbone`,
    role: "Carries 2 high-energy electrons extracted from the oxidation of the 2-carbon fragment.",
    fate: "Diffuses to the inner mitochondrial membrane where it donates its electrons to Complex I of the Electron Transport Chain, powering proton pumping.",
    alert: "CRITICAL SYLLABUS RULE: No ATP is generated directly in the link reaction! Each NADH produced will yield ~2.5 ATP downstream in oxidative phosphorylation."
  },
  acetyl_coa: {
    name: "Acetyl-Coenzyme A",
    formula: "C₂₃H₃₈N₇O₁₇P₃S • 809.57 g/mol",
    category: "Activated Product",
    carbons: 2,
    diagram: `       O
       ||
CH₃ - C - S - CoA`,
    role: "The primary output of the link reaction. Represents the activated 2-carbon unit ready for combustion in the Krebs cycle.",
    fate: "Leaves the PDC and enters the Krebs cycle, where its acetyl group condenses with 4-carbon oxaloacetate to form 6-carbon citrate.",
    alert: "Irreversible formation: In mammals, Acetyl-CoA cannot be converted back to pyruvate or carbohydrates because the PDC reaction is thermodynamically irreversible."
  },
  co2: {
    name: "Carbon Dioxide (CO₂)",
    formula: "CO₂ • 44.01 g/mol",
    category: "Gaseous Waste Product",
    carbons: 1,
    diagram: `O = C = O`,
    role: "The first molecule of carbon dioxide released during cellular respiration.",
    fate: "As a small non-polar gas, CO₂ diffuses freely through the mitochondrial membranes, into the cytoplasm, and into the bloodstream to be expired.",
    alert: "A common exam misconception is that all CO₂ comes from the Krebs cycle. In fact, 2 of the 6 CO₂ molecules produced per glucose originate right here in the Link Reaction!"
  },
  h_plus: {
    name: "Proton (H⁺)",
    formula: "H⁺ • 1.008 g/mol",
    category: "Hydronium Ion",
    carbons: 0,
    diagram: `[ H⁺ ]`,
    role: "Co-product released into the mitochondrial matrix alongside NADH during the reduction of NAD⁺.",
    fate: "Enters the matrix proton pool and can be utilized by downstream metabolic reactions.",
    alert: "The reaction stoichiometry is: NAD⁺ + 2e⁻ + 2H⁺ → NADH + H⁺."
  },
  pdc: {
    name: "Pyruvate Dehydrogenase Complex (PDC)",
    formula: "Multi-enzyme Complex (~9.5 MDa)",
    category: "Macromolecular Enzyme Complex",
    carbons: 0,
    diagram: `[ E1: TPP ] <---> [ E2: Lipoamide Core ] <---> [ E3: FAD ]`,
    role: "Giant multi-enzyme machine in the matrix coordinating 3 enzymes (E1, E2, E3) and 5 cofactors (TPP, lipoamide, CoA, FAD, NAD⁺).",
    fate: "Catalyzes oxidative decarboxylation via substrate channeling along the flexible swinging lipoyllysyl arm of E2.",
    alert: "Multi-enzyme organization ensures that reactive intermediates never escape into the bulk solution."
  },
  mpc: {
    name: "Mitochondrial Pyruvate Carrier (MPC)",
    formula: "MPC1 / MPC2 Heterodimer",
    category: "Inner Membrane Transporter",
    carbons: 0,
    diagram: `Outer |--- Inner Membrane Transporter ---| Matrix (H⁺ Symport)`,
    role: "Facilitates proton-coupled pyruvate transport across the otherwise impermeable inner mitochondrial membrane.",
    fate: "Couples pyruvate entry to the proton gradient established by the electron transport chain.",
    alert: "Without the MPC, cytosolic pyruvate cannot reach the matrix PDC."
  },
  porin: {
    name: "Outer Membrane Porin (VDAC)",
    formula: "Beta-barrel Protein Pore",
    category: "Outer Membrane Channel",
    carbons: 0,
    diagram: `Cytosol |--- 16-stranded Beta-barrel ---| Intermembrane Space`,
    role: "Provides large, non-selective aqueous channels across the outer mitochondrial membrane.",
    fate: "Allows free passive diffusion of pyruvate and other small metabolites under 5 kDa.",
    alert: "Explains why the outer membrane is permeable while the inner membrane requires specific carriers."
  }
};

// =============================================================================
// 3. APPLICATION STATE
// =============================================================================

export const state = {
  currentStage: 0,
  showAllLabels: false,
  perGlucoseMode: false,
  flatMode: false,
  isDeeperOpen: false
};

// =============================================================================
// 4. UI INITIALIZATION & EVENT LISTENERS
// =============================================================================

document.addEventListener('DOMContentLoaded', () => {
  initBottomProcessBar();
  bindUIEvents();
  renderStage(state.currentStage);
  populateFlatSummary();
  init2DScene();
});

function bindUIEvents() {
  // Navigation Buttons on Card
  const btnPrev = document.getElementById('btn-prev-stage');
  const btnNext = document.getElementById('btn-next-stage');
  
  btnPrev?.addEventListener('click', () => {
    if (state.currentStage > 0) goToStage(state.currentStage - 1);
  });

  btnNext?.addEventListener('click', () => {
    if (state.currentStage < STAGES_DATA.length - 1) goToStage(state.currentStage + 1);
  });

  // Arrow buttons on bottom process bar
  const btnBarPrev = document.getElementById('btn-process-prev');
  const btnBarNext = document.getElementById('btn-process-next');
  btnBarPrev?.addEventListener('click', () => {
    if (state.currentStage > 0) goToStage(state.currentStage - 1);
  });
  btnBarNext?.addEventListener('click', () => {
    if (state.currentStage < STAGES_DATA.length - 1) goToStage(state.currentStage + 1);
  });

  // Replay animation button
  const btnReplay = document.getElementById('btn-replay-scene');
  btnReplay?.addEventListener('click', () => {
    replayCurrentStageAnimation();
  });

  // Keyboard navigation (Arrow keys Left / Right)
  window.addEventListener('keydown', (e) => {
    if (state.flatMode) {
      if (e.key === 'Escape') toggleFlatMode(false);
      return;
    }
    
    // If modal open, escape closes it
    const molModal = document.getElementById('molecule-modal-backdrop');
    if (molModal && !molModal.hidden) {
      if (e.key === 'Escape') closeMoleculeModal();
      return;
    }

    if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === 'PageDown') {
      if (state.currentStage < STAGES_DATA.length - 1) goToStage(state.currentStage + 1);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'PageUp') {
      if (state.currentStage > 0) goToStage(state.currentStage - 1);
    } else if (e.key === 'l' || e.key === 'L') {
      toggleLabels();
    } else if (e.key === 'f' || e.key === 'F') {
      toggleFlatMode(true);
    } else if (e.key === 'r' || e.key === 'R') {
      replayCurrentStageAnimation();
    }
  });

  // Touch swipe support for mobile
  let touchStartX = 0;
  let touchEndX = 0;
  window.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  window.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  }, { passive: true });

  function handleSwipe() {
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 50) {
      if (diff > 0 && state.currentStage < STAGES_DATA.length - 1) {
        goToStage(state.currentStage + 1); // Swipe left = next
      } else if (diff < 0 && state.currentStage > 0) {
        goToStage(state.currentStage - 1); // Swipe right = prev
      }
    }
  }

  // Toggle "Show All Labels" (§8)
  const btnToggleLabels = document.getElementById('btn-toggle-labels');
  btnToggleLabels?.addEventListener('click', toggleLabels);

  // Toggle "Per Glucose (x2)" (§5)
  const btnToggleGlucose = document.getElementById('btn-toggle-glucose');
  btnToggleGlucose?.addEventListener('click', toggleGlucoseYield);

  // Toggle "Flat Summary" Fallback (§13)
  const btnOpenFlat = document.getElementById('btn-open-flatmode');
  const btnCloseFlat = document.getElementById('btn-close-flatmode');
  btnOpenFlat?.addEventListener('click', () => toggleFlatMode(true));
  btnCloseFlat?.addEventListener('click', () => toggleFlatMode(false));

  // Deeper Accordion Toggle
  const btnDeeper = document.getElementById('btn-deeper-toggle');
  btnDeeper?.addEventListener('click', toggleDeeperAccordion);

  // Close Molecule Modal
  const btnCloseMol = document.getElementById('btn-close-mol-modal');
  const modalBackdrop = document.getElementById('molecule-modal-backdrop');
  btnCloseMol?.addEventListener('click', closeMoleculeModal);
  modalBackdrop?.addEventListener('click', (e) => {
    if (e.target === modalBackdrop) closeMoleculeModal();
  });
}

// =============================================================================
// 5. BOTTOM PROCESS BAR INITIALIZATION & COORDINATION (Section §3)
// =============================================================================

function initBottomProcessBar() {
  const container = document.getElementById('process-nodes-container');
  if (!container) return;
  container.innerHTML = '';

  STAGES_DATA.forEach((stage, idx) => {
    const nodeBtn = document.createElement('button');
    nodeBtn.className = `process-node ${idx === 0 ? 'active' : ''}`;
    nodeBtn.setAttribute('data-stage', idx);
    nodeBtn.setAttribute('title', `Jump to ${stage.number}: ${stage.title}`);

    nodeBtn.innerHTML = `
      <div class="node-icon-circle">${stage.iconLabel || stage.number.split(' ')[0]}</div>
      <div class="node-label-group">
        <span class="node-step-num">${stage.number.split(' ')[0]}</span>
        <span class="node-step-name">${stage.shortName}</span>
      </div>
    `;

    nodeBtn.addEventListener('click', () => goToStage(idx));
    container.appendChild(nodeBtn);
  });
}

export function goToStage(stageIndex) {
  if (stageIndex < 0 || stageIndex >= STAGES_DATA.length) return;
  state.currentStage = stageIndex;
  renderStage(stageIndex);
  render2DStage(stageIndex);
}

function renderStage(stageIndex) {
  const stage = STAGES_DATA[stageIndex];
  if (!stage) return;

  // 1. Update Card Headers & Badges
  setText('stage-number-tag', `STAGE ${stage.number}`);
  setText('badge-compartment', stage.compartment);
  setText('badge-nature', stage.nature);
  setText('stage-title', stage.title);
  setText('stage-concept', stage.conceptHeadline);

  // 2. Educational UX 4-Pack (Where / What / How / Why)
  setText('anchor-where', stage.where);
  setText('anchor-what', stage.what);
  setText('anchor-how', stage.how);
  setText('anchor-why', stage.why);

  // 3. Core Text
  const coreEl = document.getElementById('stage-core-text');
  if (coreEl) coreEl.innerHTML = `<p>${stage.coreText}</p>`;

  // 4. Molecules in Focus Chips
  const molContainer = document.getElementById('stage-molecules-list');
  if (molContainer) {
    molContainer.innerHTML = '';
    stage.moleculesInFocus.forEach(molKey => {
      const molData = MOLECULES_DATA[molKey];
      if (!molData) return;
      const chip = document.createElement('button');
      chip.className = 'mol-chip';
      chip.textContent = molData.name;
      chip.addEventListener('click', () => openMoleculeModal(molKey));
      molContainer.appendChild(chip);
    });
  }

  // 5. Deeper Accordion Content
  const deeperBody = document.getElementById('deeper-body-text');
  if (deeperBody && stage.deeper) {
    deeperBody.innerHTML = `
      <h5>Enzymology &amp; Coenzymes</h5>
      <p>${stage.deeper.enzymology}</p>
      
      <h5>Chemical Mechanism</h5>
      <p>${stage.deeper.mechanism}</p>
      
      <h5>Metabolic Regulation</h5>
      <p>${stage.deeper.regulation}</p>
      
      <div class="deeper-note">
        <strong>Pedagogical Mechanism Note:</strong> ${stage.deeper.simplificationNote}
      </div>
    `;
  }

  // 6. Navigation Buttons on Card and Process Bar
  const btnPrev = document.getElementById('btn-prev-stage');
  const btnNext = document.getElementById('btn-next-stage');
  const btnBarPrev = document.getElementById('btn-process-prev');
  const btnBarNext = document.getElementById('btn-process-next');
  
  const isFirst = (stageIndex === 0);
  const isLast = (stageIndex === STAGES_DATA.length - 1);

  if (btnPrev) btnPrev.disabled = isFirst;
  if (btnNext) btnNext.disabled = isLast;
  if (btnBarPrev) btnBarPrev.disabled = isFirst;
  if (btnBarNext) btnBarNext.disabled = isLast;

  // 7. Update Bottom Process Bar Nodes & Progress Fill Line
  const allNodes = document.querySelectorAll('.process-node');
  allNodes.forEach((node, idx) => {
    node.classList.remove('active', 'completed');
    if (idx === stageIndex) {
      node.classList.add('active');
    } else if (idx < stageIndex) {
      node.classList.add('completed');
    }
  });

  const progressFill = document.getElementById('process-track-fill');
  if (progressFill) {
    const pct = (stageIndex / (STAGES_DATA.length - 1)) * 100;
    progressFill.style.width = `${pct}%`;
  }

  // 8. Update Carbon Tracker
  updateCarbonTracker(stage.carbonState);

  // 9. Update Focus Pill in Scene Header
  setText('stage-focus-name', getStageFocusName(stageIndex));
}

// =============================================================================
// 6. CARBON TRACKER LOGIC
// =============================================================================

function updateCarbonTracker(carbonState) {
  if (!carbonState) return;
  setText('carbon-status', carbonState.status);

  const b1 = document.getElementById('c-bead-1');
  const b2 = document.getElementById('c-bead-2');
  const b3 = document.getElementById('c-bead-3');
  
  const beads = [b1, b2, b3];
  carbonState.beads.forEach((stateName, idx) => {
    if (beads[idx]) {
      beads[idx].className = `c-bead ${stateName}`;
    }
  });
}

// =============================================================================
// 7. TOGGLES: ALL LABELS & PER-GLUCOSE STOICHIOMETRY
// =============================================================================

function toggleLabels() {
  state.showAllLabels = !state.showAllLabels;
  const btn = document.getElementById('btn-toggle-labels');
  const statusText = document.getElementById('lbl-status-text');
  
  if (btn) btn.setAttribute('aria-pressed', state.showAllLabels.toString());
  if (statusText) statusText.textContent = state.showAllLabels ? 'All On' : 'Default';
  
  toggleAll2DLabels(state.showAllLabels);
}

function toggleGlucoseYield() {
  state.perGlucoseMode = !state.perGlucoseMode;
  const btn = document.getElementById('btn-toggle-glucose');
  const yieldText = document.getElementById('yield-mode-text');
  const badge = document.getElementById('stoichiometry-badge');
  const eqChem = document.getElementById('hud-equation');
  
  if (btn) btn.setAttribute('aria-pressed', state.perGlucoseMode.toString());
  
  const stoichFactors = document.querySelectorAll('.stoich-factor');
  
  if (state.perGlucoseMode) {
    if (yieldText) yieldText.textContent = 'Per Glucose (2×)';
    if (badge) badge.textContent = '2× GLUCOSE CYCLE';
    if (eqChem) {
      eqChem.innerHTML = `
        <span class="m-react">2 pyruvate</span> + <span class="m-react">2 CoA</span> + <span class="m-react">2 NAD⁺</span>
        <span class="eq-arrow">&rarr;</span>
        <span class="m-prod">2 acetyl-CoA</span> + <span class="m-prod">2 CO₂</span> + <span class="m-prod">2 NADH</span> + <span class="m-prod">2 H⁺</span>
      `;
    }
    stoichFactors.forEach(el => { el.textContent = '2×'; });
  } else {
    if (yieldText) yieldText.textContent = 'Per Pyruvate (1×)';
    if (badge) badge.textContent = '1× PYRUVATE';
    if (eqChem) {
      eqChem.innerHTML = `
        <span class="m-react">pyruvate</span> + <span class="m-react">CoA</span> + <span class="m-react">NAD⁺</span>
        <span class="eq-arrow">&rarr;</span>
        <span class="m-prod">acetyl-CoA</span> + <span class="m-prod">CO₂</span> + <span class="m-prod">NADH</span> + <span class="m-prod">H⁺</span>
      `;
    }
    stoichFactors.forEach(el => { el.textContent = '1×'; });
  }
}

function toggleDeeperAccordion() {
  state.isDeeperOpen = !state.isDeeperOpen;
  const btn = document.getElementById('btn-deeper-toggle');
  const content = document.getElementById('deeper-content');
  
  if (btn) btn.setAttribute('aria-expanded', state.isDeeperOpen.toString());
  if (content) content.hidden = !state.isDeeperOpen;
}

// =============================================================================
// 8. MOLECULE INSPECTOR MODAL
// =============================================================================

export function openMoleculeModal(molKey) {
  const mol = MOLECULES_DATA[molKey];
  if (!mol) return;

  setText('modal-mol-name', mol.name);
  setText('modal-mol-formula', mol.formula);
  setText('modal-mol-cat', mol.category);
  setText('modal-mol-carbons', mol.carbons.toString());
  setText('modal-mol-role', mol.role);
  setText('modal-mol-fate', mol.fate);

  const diag = document.getElementById('modal-mol-diagram');
  if (diag) diag.textContent = mol.diagram;

  const alertBox = document.getElementById('modal-mol-alert');
  if (alertBox) {
    alertBox.innerHTML = `<strong>Key Syllabus Note:</strong> ${mol.alert}`;
  }

  const backdrop = document.getElementById('molecule-modal-backdrop');
  if (backdrop) backdrop.hidden = false;
}

function closeMoleculeModal() {
  const backdrop = document.getElementById('molecule-modal-backdrop');
  if (backdrop) backdrop.hidden = true;
}

// =============================================================================
// 9. FLAT SUMMARY / OVERVIEW GENERATOR (§13)
// =============================================================================

function toggleFlatMode(open) {
  state.flatMode = open;
  const container = document.getElementById('flat-mode-container');
  if (container) container.hidden = !open;
  document.body.style.overflow = open ? 'auto' : 'hidden';
}

function populateFlatSummary() {
  const list = document.getElementById('flat-stages-list-container');
  if (!list) return;

  list.innerHTML = '';
  STAGES_DATA.forEach(s => {
    const card = document.createElement('article');
    card.className = 'flat-stage-card';
    card.innerHTML = `
      <div class="flat-stage-head">
        <span class="flat-stage-num">STAGE ${s.number}</span>
        <span class="badge badge-compartment">${s.compartment}</span>
      </div>
      <h4 class="flat-stage-title">${s.title}</h4>
      <p style="font-size: 13px; color: #94a3b8; margin: 4px 0 10px;">${s.conceptHeadline}</p>
      
      <div class="flat-anchors-grid">
        <div class="flat-anchor">
          <h5>📍 WHERE</h5>
          <p>${s.where}</p>
        </div>
        <div class="flat-anchor">
          <h5>⚡ WHAT</h5>
          <p>${s.what}</p>
        </div>
        <div class="flat-anchor">
          <h5>🔬 HOW</h5>
          <p>${s.how}</p>
        </div>
        <div class="flat-anchor">
          <h5>🔗 WHY &amp; CONNECTIONS</h5>
          <p>${s.why}</p>
        </div>
      </div>

      <div class="flat-stage-core">
        ${s.coreText}
      </div>

      <div class="flat-stage-deeper">
        <strong style="color: #38bdf8;">Enzymology &amp; Mechanistic Detail (Deeper Tier):</strong><br>
        ${s.deeper.enzymology}<br><br>
        <strong>Coupled Mechanism:</strong> ${s.deeper.mechanism}<br>
        <strong>Regulation:</strong> ${s.deeper.regulation}<br>
        <span style="color: #f59e0b; font-size: 11.5px; display: inline-block; margin-top: 6px;">
          <strong>Pedagogical Simplification Note:</strong> ${s.deeper.simplificationNote}
        </span>
      </div>
    `;
    list.appendChild(card);
  });
}

function setText(id, txt) {
  const el = document.getElementById(id);
  if (el) el.textContent = txt;
}
