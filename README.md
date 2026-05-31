# Kirchhoff Arcade ⚡

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.2-blue.svg)](https://www.typescriptlang.org/)
[![Canvas 2D](https://img.shields.io/badge/Canvas-2D-orange.svg)](https://developer.mozilla.org/docs/Web/API/Canvas_API)
[![Vite](https://img.shields.io/badge/Vite-6.2.3-yellow.svg)](https://vitejs.dev/)

A hyper-casual puzzle game that fuses Tetris-style stacking with real electric-circuit simulation, built on a custom MVC architecture using vanilla TypeScript and the HTML Canvas 2D API. Developed in 2026 as the tenth simulation of the SHIFT series, with AI-assisted code generation for the circuit-solver engine.

### [🎮 Play Now!](https://fisicagames.com.br)

---

## 📄 Table of Contents

* [About the Game](#-about-the-game)
* [Key Features](#-key-features)
* [How to Play](#-how-to-play)
* [Tech Stack](#-tech-stack)
* [Installation and Setup](#-installation-and-setup)
* [Architecture and Technical Highlights](#-architecture-and-technical-highlights)
* [License](#-license)
* [Author](#-author)

---

## 📖 About the Game

**Kirchhoff Arcade** is an interactive simulation that turns the principles of electric circuits into a falling-blocks puzzle. Pieces are real electronic components — voltage sources, resistors, LEDs, conductive wires, and insulating blocks — that drop onto a grid. When a piece locks into place, the game runs a full circuit analysis to determine whether a valid closed circuit was formed.

The project serves as an educational tool, visually demonstrating **Kirchhoff's Laws** and **Ohm's Law** in real time. Closing a circuit safely lights its LEDs and clears the components from the board; bad wiring — short circuits or over-current — burns components and leaves debris behind, teaching the consequences of incorrect connections through play.

---

## ✨ Key Features

* **Real Circuit Solver:** Every locked piece is evaluated by a custom **Modified Nodal Analysis (MNA)** engine that solves the linear system via Gaussian elimination with partial pivoting, faithfully reproducing voltages and currents across the board.
* **Non-Linear LED Model:** LEDs are solved iteratively with a 2 V forward-voltage drop and directional conduction, so reversed polarity genuinely prevents the LED from lighting.
* **Physics-Based Outcomes:** Components have real limits — LEDs light between 1–28 mA and burn above it, resistors tolerate up to 50 mA, and sources short-circuit above 1 A.
* **Component-Count Scoring:** Points scale with the number of active components in a closed circuit, rewarding richer, more complex circuits over trivial ones.
* **Skill Rank System:** The all-time high score grants skill titles, ranging from "Beginner" to "Kirchhoff".
* **Multiple Input Modes:** Keyboard, on-screen touch buttons, and direct touch/swipe gestures on the board (tap to rotate, drag to move, swipe down to drop).
* **Persistence:** The high score is automatically saved via `localStorage`.
* **Responsive and Multilingual:** Fully optimized for desktop and mobile browsers, with automatic language detection and native support for Portuguese and English.

---

## 🕹 How to Play

**Objective:** Connect the falling components to form closed electric circuits. To light an LED safely, use the correct polarity and a resistor to limit the current. The more components in a circuit, the higher the score.

#### Controls

💻 **On PC / Keyboard:**

* **[ ← ]** / **[ → ]** : Move the piece left or right.
* **[ ↑ ]** : Rotate the piece.
* **[ ↓ ]** : Speed up the fall (soft drop).
* **[ Space ]** / **[ Enter ]** : Instant drop (hard drop) / confirm circuit result.
* **[ R ]** : Restart the game.

📱 **On Mobile / Touch:**

* **On-screen buttons:** a directional pad (left, rotate, right, down) plus a large **DROP** button.
* **Gestures on the board:** tap to rotate, drag sideways to move, swipe down for a hard drop.

#### Tips

* Always place a resistor or LED in the current's path — never wire a source's (+) straight to its (−).
* Higher voltage needs a bigger resistor: when unsure, prefer the **470 Ω**.
* Closing a circuit next to burned debris or insulating blocks also clears them from the board.

---

## 🛠 Tech Stack

| Tool                                          | Version | Description                                                                 |
| --------------------------------------------- | ------- | --------------------------------------------------------------------------- |
| [TypeScript](https://www.typescriptlang.org/) | 5.8.2   | Core language, providing type safety and robust architecture.               |
| [Canvas 2D API](https://developer.mozilla.org/docs/Web/API/Canvas_API) | —       | Native browser 2D rendering for the board, pieces, and circuit illustrations. |
| [Vite.js](https://vitejs.dev/)                | 6.2.3   | Build tool for ES6 module compilation, tree-shaking, and optimization.      |
| [Node.js](https://nodejs.org/en)              | 26.1.0  | Development environment and runtime.                                         |
| [pnpm](https://pnpm.io/)                       | 10.33.4 | Fast, disk-efficient package manager.                                       |

Developed in a **Linux Arch (Kernel 7.0.9-arch1-1)** environment with **KDE Plasma**.

---

## 🚀 Installation and Setup

**Prerequisites:** Node.js (v20+), pnpm (v10+).

**Steps:**

1. Clone the repository.
2. Install dependencies:
   ```sh
   pnpm install
   ```
3. Start the development server:
   ```sh
   pnpm dev
   ```
4. Build for production (generates the `dist` folder):
   ```sh
   pnpm build
   ```

---

## 🏗 Architecture and Technical Highlights

The technological cornerstone of this project is its **custom MVC architecture written in TypeScript**, refined by the author across the SHIFT series. Unlike the 3D entries in the series, Kirchhoff Arcade is built entirely on **vanilla TypeScript and the Canvas 2D API**, with no game-engine dependency — keeping the production bundle extremely small and allowing the game to run natively in mobile browsers without full-screen APIs or third-party app installations.

The source is strictly organized using the **Model-View-Controller (MVC)** pattern across four folders under `src/`:

* **Core (`src/core/`):** Cross-cutting setup — canvas references, game constants, the responsive layout engine, the audio manager, and the `i18n` translation system.
* **Model (`src/model/`):** A render-agnostic layer housing the game state, piece templates and bag randomizer, grid operations, and the circuit engine. It includes the `mnaSolver` (Gaussian elimination) and the `circuitAnalyzer`, which performs a flood-fill to find connected components, maps grid cells to electrical nodes, and assembles the MNA system.
* **View (`src/view/`):** Pure rendering — the board renderer, next-piece preview, HUD, tutorial illustrations drawn on canvas, and overlay manager. No game logic lives here.
* **Controller (`src/controller/`):** The game loop and input handling, wiring keyboard, touch buttons, and board gestures into a single action dispatcher.

#### Circuit Engine

The heart of the game is the **Modified Nodal Analysis** solver. When a piece locks, the analyzer:

1. Flood-fills the grid to isolate each electrically connected component.
2. Unifies wires into shared nodes via depth-first search, mapping every junction to a node index.
3. Builds the MNA conductance matrix from resistors and voltage sources, then solves it with **Gaussian elimination using partial pivoting**.
4. Iterates (up to 10 passes) to resolve the **non-linear LED behavior** — each LED is modeled as a 2 V source once forward-biased, and dropped if the resulting current would be negative (reverse polarity).
5. Evaluates currents against each component's physical limits to decide whether the circuit lights up (scoring points and clearing the board) or burns out (leaving debris).

#### Responsive Layout

A dedicated layout module locks the game to a stable portrait aspect ratio. It measures the small-viewport height (`svh`) and recomputes a single CSS variable (`--game-w`) on resize, zoom, and orientation change — so the whole UI scales proportionally and always fits the visible viewport without scrollbars, even as the mobile address bar shows and hides.

#### AI-Assisted Code Generation

This simulation continues the AI-assisted workflow established in the SHIFT series. The Modified Nodal Analysis engine, the iterative LED solver, and the responsive layout system were developed through iterative prompts to **Claude Sonnet 4.6 (Anthropic)**, with the developer validating each function against textbook circuit cases.

---

## 📸 Screenshots

<!-- Add screenshots here when available, e.g.:
<p align="center">
  <img src="image/README/screenshot1.png" width="30%" alt="Kirchhoff Arcade screenshot 1" />
  <img src="image/README/screenshot2.png" width="30%" alt="Kirchhoff Arcade screenshot 2" />
</p>
-->

---

## 📜 License

### Source Code

The source code in this repository is licensed under the **MIT License** — see the [LICENSE](./LICENSE) file.

### Visual Assets

Original visual content created by the author is licensed under **Creative Commons Attribution 4.0 International (CC BY 4.0)**.

### Audio Assets

Music and sound effects in this project are sourced from [Pixabay](https://pixabay.com/) under the [Pixabay Content License](https://pixabay.com/service/license-summary/), which permits free use including for commercial purposes.

### Third-Party Libraries

* **Vite.js** — MIT License

**Copyright © 2026 Rafael João Ribeiro.**

---

## 👨‍🔬 Author

Developed by:
**Prof. Dr. Rafael João Ribeiro**
Federal Institute of Paraná (IFPR)
[www.fisicagames.com.br](https://www.fisicagames.com.br)

---

## 📊 Commit Types — Verb Cheat Sheet

This table summarizes the commit types used in the project, along with common verbs to start commit messages following best practices (imperative mood, present tense).

| Type         | Purpose                                                              | Common verbs (imperative)                   |
| ------------ | -------------------------------------------------------------------- | ------------------------------------------- |
| **feat**     | Introduce a new feature or functionality                             | add, implement, introduce, create           |
| **fix**      | Fix a bug or incorrect behavior                                      | fix, correct, resolve, prevent              |
| **perf**     | Improve performance (CPU, memory, bundle size)                      | optimize, improve, reduce, enhance          |
| **refactor** | Restructure code without changing external behavior                  | refactor, reorganize, simplify, restructure |
| **style**    | Adjust visual aspects (UI, colors, layout, fonts)                    | adjust, update, tweak, refine               |
| **docs**     | Documentation updates (README, comments, license)                    | add, update, improve, clarify               |
| **build**    | Build system, bundler (Vite), dependencies, configuration            | configure, update, adjust, setup            |
| **chore**    | Maintenance tasks, cleanup, assets, non-functional changes           | clean, remove, update, organize             |
| **balance**  | Gameplay tuning (score system, difficulty, progression)              | adjust, rebalance, tune, update             |
| **i18n**     | Translations and localization (PT/EN dictionaries, formatting)       | translate, add, update, fix                 |

### ✅ Examples

```text
feat(gestures): add tap-to-rotate and swipe-to-drop on the board
fix(circuit): correct LED reverse-polarity detection
perf(solver): reuse matrix buffers in Gaussian elimination
refactor(view): extract tutorial illustrations into legendView
style(hud): increase tutorial font size for readability
build(vite): split modular bundle into core/model/view/controller
chore(assets): add hard-drop trail sound effect
balance(score): adjust rank thresholds
i18n(en): refine English circuit-status messages
```
