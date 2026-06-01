/**
 * Internationalisation (i18n) for Kirchhoff Arcade.
 *
 * - Detects the browser language on first load: anything starting with "pt"
 *   → Portuguese, otherwise English. The choice is persisted in localStorage
 *   and can be toggled at any time via the menu button.
 * - `t(key, vars)` looks up a string in the active language (falling back to
 *   PT), with simple `{var}` interpolation.
 * - `fmtNum(n, decimals)` formats decimals with a comma in PT and a dot in EN.
 * - `applyI18n()` fills every element carrying `data-i18n` (text) or
 *   `data-i18n-html` (rich markup) — so adding new translatable copy is just a
 *   matter of tagging the element and adding the key below.
 *
 * NEXT STEP: review/refine the `en` dictionary — every key already exists with
 * a baseline translation; edits live in one place.
 */

export type Lang = 'pt' | 'en';

const STORAGE_KEY = 'kirchhoffLang';

let lang: Lang = detectLang();

function detectLang(): Lang {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === 'pt' || saved === 'en') return saved;
  const nav = (navigator.language || 'pt').toLowerCase();
  return nav.startsWith('pt') ? 'pt' : 'en';
}

export function getLang(): Lang { return lang; }

export function setLang(next: Lang): void {
  lang = next;
  localStorage.setItem(STORAGE_KEY, next);
}

export function toggleLang(): Lang {
  setLang(lang === 'pt' ? 'en' : 'pt');
  return lang;
}

/** Translate a key, with optional `{var}` interpolation. Falls back to PT, then the key. */
export function t(key: string, vars?: Record<string, string | number>): string {
  let s = DICT[lang][key] ?? DICT.pt[key] ?? key;
  if (vars) for (const k in vars) s = s.split(`{${k}}`).join(String(vars[k]));
  return s;
}

/** Decimal number with locale separator: comma in PT, dot in EN. */
export function fmtNum(n: number, decimals = 1): string {
  const s = n.toFixed(decimals);
  return lang === 'pt' ? s.replace('.', ',') : s;
}

/** Apply all `data-i18n` / `data-i18n-html` attributes in the DOM. */
export function applyI18n(): void {
  document.documentElement.lang = lang === 'pt' ? 'pt-BR' : 'en';

  document.querySelectorAll<HTMLElement>('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (key) el.textContent = t(key);
  });
  document.querySelectorAll<HTMLElement>('[data-i18n-html]').forEach(el => {
    const key = el.dataset.i18nHtml;
    if (key) el.innerHTML = t(key);
  });

  // The toggle button always offers the OTHER language.
  const eng = document.getElementById('btnEnglish');
  if (eng) eng.textContent = lang === 'pt' ? 'ENGLISH' : 'PORTUGUÊS';
}

// ════════════════════════════════════════════════════════════════
//  DICTIONARY — add/adjust translations here.
// ════════════════════════════════════════════════════════════════

const DICT: Record<Lang, Record<string, string>> = {
  pt: {
    // ── Header / stats ──
    'stat.points':   'Pontos',
    'stat.level':    'Nível',
    'stat.circuits': 'Circ.',
    'stat.record':   'Recorde',
    'next.label':    'Próxima',

    // ── Action buttons ──
    'btn.restart':  'REINICIAR',
    'btn.pause':    'PAUSA',
    'btn.resume':   'RETOMAR',
    'btn.tutorial': 'TUTORIAL',
    'btn.sound':    'SOM',
    'btn.soundOff': 'SOM OFF',

    // ── Menu top bar ──
    'menu.music': 'Música:',

    // ── Menu page 1 ──
    'menu.objective':
      '<b>Objetivo:</b> conecte os componentes que caem para formar ' +
      '<b class="hl">circuitos elétricos!</b> Para acender um LED, use a ' +
      'polaridade correta e um <b class="hl">resistor</b> para limitar a ' +
      'corrente. Quanto mais componentes houver no circuito, ' +
      '<b class="hl">maior será a pontuação!</b>',
    'menu.bestLabel': 'Melhor resultado:',
    'menu.pts':       'pts',

    // ── Ranks ──
    'rank.master':    'Kirchhoff ⚡',
    'rank.engineer':  'Engenheiro ⚡',
    'rank.technician':'Técnico ⚡',
    'rank.apprentice':'Estudante ⚡',
    'rank.beginner':  'Iniciante ⚡',

    // ── Tutorial: page 2 ──
    'tut.p2.h':     'Como Funciona',
    'tut.p2.intro': 'A energia só circula em um <b>circuito fechado</b>: um caminho contínuo que sai do polo <b>(+)</b> da fonte e volta ao polo <b>(−)</b>. Monte esse caminho com as peças que caem.',
    'tut.p2.capOk': '✓ Circuito completo',
    'tut.p2.subOk': 'Fonte → resistor → LED → volta à fonte',
    'tut.p2.note':  'Neste exemplo a corrente passa pelo <b>resistor</b> (que a limita) e acende o <b class="ok">LED</b> com segurança. Cada circuito fechado vale pontos!',

    // ── Tutorial: page 3 ──
    'tut.p3.h':    'Fontes e Fios',
    'tut.p3.p1':   'As <b>fontes ideais</b>, baterias sem resistência interna, empurram a corrente. Quanto maior a tensão, mais "força" — e mais cuidado é preciso.',
    'tut.p3.p2':   'Cada fonte tem um polo <b style="color:#e63946">(+)</b> e um <b style="color:#457b9d">(−)</b>. A corrente sai do (+) e precisa retornar ao (−).',
    'tut.p3.p3':   'O <b>fio</b> conduz a corrente livremente para fechar o caminho. O <b>bloco</b> é isolante: não conduz, serve só para preencher espaços.',
    'tut.lbl.wire':  'Fio',
    'tut.lbl.block': 'Bloco',

    // ── Tutorial: page 4 ──
    'tut.p4.h':  'LEDs e Resistores',
    'tut.p4.p1': 'O <b>LED</b> é a lâmpada do jogo que aparece a partir do nível 5. Ele acende quando recebe entre <b class="ok">1 e 28 mA</b>. Pouca corrente: não acende. Corrente demais: <b class="no">queima!</b>',
    'tut.p4.p2': 'O <b>resistor</b> é o protetor: ele <b>limita a corrente</b> para o LED não queimar. Valores maiores (Ω) limitam mais.',
    'tut.p4.p3': 'O próprio <b>resistor</b> também tem limite: acima de <b class="no">50 mA</b> ele <b>queima</b>.',
    'tut.lbl.red':    'Vermelho',
    'tut.lbl.green':  'Verde',

    // ── Tutorial: page 5 ──
    'tut.p5.h':     '⚡ Curto-circuito',
    'tut.p5.p1':    'Ligar o <b style="color:#e63946">(+)</b> direto no <b style="color:#457b9d">(−)</b> só com fios, <b>sem nada que limite a corrente</b>, cria um <b class="no">curto-circuito</b>.',
    'tut.p5.cap':   '✗ Curto-circuito',
    'tut.p5.sub':   'Corrente enorme — a fonte queima!',
    'tut.p5.p2':    'Sem resistência, a corrente dispara (mais de <b>1 A</b>) e a fonte é destruída, deixando <b class="no">lixo</b> no tabuleiro. Sempre coloque um resistor ou um LED no caminho!',

    // ── Tutorial: page 6 ──
    'tut.p6.h':      'Erros Comuns com LED',
    'tut.p6.cap1':   '✗ LED sem resistor',
    'tut.p6.sub1':   '9 V direto no LED → mais de 28 mA → queima',
    'tut.p6.p1':     'Ligar o LED <b>direto na fonte</b>, sem um resistor limitando, deixa passar corrente demais e ele <b class="no">queima</b>.',
    'tut.p6.cap2':   '✗ Polaridade invertida',
    'tut.p6.sub2':   '(−) ligado onde deveria ser (+)',
    'tut.p6.p2':     'O LED só funciona em <b>um sentido</b>. Se o lado (+) e o (−) estiverem trocados, ele <b class="no">não acende</b> — gire a peça para corrigir.',

    // ── Tutorial: page 7 ──
    'tut.p7.h':    'Dicas de Combinações',
    'tut.p7.p1':   'Use a <b>Lei de Ohm</b> para escolher o resistor certo: <b style="font-family:var(--font-mono)">I = V / R</b> (corrente = tensão / resistência).',
    'tut.p7.ok1':  '✓&nbsp; 3 V / 100 Ω → acende',
    'tut.p7.ok2':  '✓&nbsp; 5 V / 220 Ω → acende',
    'tut.p7.ok3':  '✓&nbsp; 9 V / 470 Ω → acende',
    'tut.p7.no1':  '✗&nbsp; 9 V / 100 Ω → resistor queima',
    'tut.p7.no2':  '✗&nbsp; LED direto no 5 V → LED queima',
    'tut.p7.tip':  'Dica: tensão alta pede resistor maior. Na dúvida, prefira o <b>470 Ω</b>.',

    // ── Tutorial: page 8 ──
    'tut.p8.h':       'Controles',
    'tut.p8.move':    'Mover a peça',
    'tut.p8.rotate':  'Girar a peça',
    'tut.p8.down':    'Acelerar a queda',
    'tut.p8.dropKey': 'ESPAÇO<br/>ou ENTER',
    'tut.p8.drop':    'Queda imediata (hard drop)',
    'tut.p8.restart': 'Reiniciar a partida',
    'tut.p8.mobile':  'No celular, use os <b>botões na tela</b> ou <b>toque/arraste</b> direto no tabuleiro.',
    'tut.p8.gl':      'Boa sorte!',

    // ── Tutorial: page 9 (ranks) ──
    'tut.p9.h':  'Ranks de Pontuação',
    'tut.p9.p1': 'Seu <b>recorde</b> define seu título. Forme circuitos com mais componentes para pontuar mais e subir de nível!',
    'tut.p9.r1': '&lt; 1000 → <b>Iniciante ⚡</b>',
    'tut.p9.r2': '1000 → <b>Estudante ⚡</b>',
    'tut.p9.r3': '2000 → <b>Técnico ⚡</b>',
    'tut.p9.r4': '3000 → <b>Engenheiro ⚡</b>',
    'tut.p9.r5': '4000+ → <b>Kirchhoff ⚡</b>',

    // ── Tutorial footer ──
    'tut.prev':     '◄ Anterior',
    'tut.next':     'Próxima ►',
    'tut.start':    'Iniciar',
    'tut.continue': 'Continuar',

    // ── Game over ──
    'over.title':   'CURTO-CIRCUITO!',
    'over.desc':    'O tabuleiro encheu de componentes.',
    'over.score':   'Pontuação:',
    'over.record':  'Recorde:',
    'over.again':   '<b style="color:var(--acc-hi)">ENTER</b>, <b style="color:var(--acc-hi)">R</b> ou <b style="color:var(--acc-hi)">REINICIAR</b> para jogar novamente',

    // ── Circuit status overlay ──
    'status.closed':   'Circuito Fechado!',
    'status.burned':   'Circuito Queimou!',
    'status.continue': 'DROP para continuar',

    // ── Touch buttons ──
    'touch.left':   'Esquerda',
    'touch.rotate': 'Girar',
    'touch.right':  'Direita',
    'touch.down':   'Descer',
    'touch.dropKey':'ESPAÇO / ENTER',

    // ── Next piece descriptions ──
    'piece.led.red':    'LED Vermelho',
    'piece.led.green':  'LED Verde',
    'piece.led.yellow': 'LED Amarelo',
    'piece.led.detail': 'Queda 2 V · máx 28 mA',
    'piece.resistor':       'Resistor {v} Ω',
    'piece.resistor.detail':'Corrente máx 50 mA',
    'piece.source':        'Fonte {v} V',
    'piece.source.detail': 'Curto-circuito 1 A',
    'piece.wire':          'Fio Condutor',
    'piece.wire.detail':   'Conduz energia',
    'piece.block':         'Bloco',
    'piece.block.detail':  'Isolante (não conduz)',

    // ── Circuit reasons ──
    'reason.ledBurn':      'Corrente no LED ({i} mA) excedeu 28 mA',
    'reason.ledLit':       'LED acendeu com {i} mA',
    'reason.sourceShort':  'Curto! Fonte com {i} A',
    'reason.sourceActive': 'Fonte {v} V — {i} mA',
    'reason.resBurn':      'Corrente no Resistor {v} Ω ({i} mA) excedeu 50 mA',
    'reason.resActive':    'Resistor {v} Ω — {volt} V e {i} mA',
  },

  en: {
    // ── Header / stats ──
    'stat.points':   'Score',
    'stat.level':    'Level',
    'stat.circuits': 'Circ.',
    'stat.record':   'Record',
    'next.label':    'Next',

    // ── Action buttons ──
    'btn.restart':  'RESTART',
    'btn.pause':    'PAUSE',
    'btn.resume':   'RESUME',
    'btn.tutorial': 'TUTORIAL',
    'btn.sound':    'SOUND',
    'btn.soundOff': 'SOUND OFF',

    // ── Menu top bar ──
    'menu.music': 'Music:',

    // ── Menu page 1 ──
    'menu.objective':
      '<b>Goal:</b> connect the falling components to build ' +
      '<b class="hl">electric circuits!</b> To light an LED, use the correct ' +
      'polarity and a <b class="hl">resistor</b> to limit the current. The ' +
      'more components in the circuit, <b class="hl">the higher your score!</b>',
    'menu.bestLabel': 'Best result:',
    'menu.pts':       'pts',

    // ── Ranks ──
    'rank.master':    'Kirchhoff ⚡',
    'rank.engineer':  'Engineer ⚡',
    'rank.technician':'Technician ⚡',
    'rank.apprentice':'Student ⚡',
    'rank.beginner':  'Beginner ⚡',

    // ── Tutorial: page 2 ──
    'tut.p2.h':     'How It Works',
    'tut.p2.intro': 'Energy only flows in a <b>closed circuit</b>: a continuous path that leaves the source\'s <b>(+)</b> pole and returns to the <b>(−)</b> pole. Build that path with the falling pieces.',
    'tut.p2.capOk': '✓ Complete circuit',
    'tut.p2.subOk': 'Source → resistor → LED → back to source',
    'tut.p2.note':  'Here the current flows through the <b>resistor</b> (which limits it) and safely lights the <b class="ok">LED</b>. Every closed circuit scores points!',

    // ── Tutorial: page 3 ──
    'tut.p3.h':    'Sources and Wires',
    'tut.p3.p1':   '<b>Ideal sources</b>, batteries with no internal resistance, push the current. The higher the voltage, the more "force" — and the more care you need.',
    'tut.p3.p2':   'Each source has a <b style="color:#e63946">(+)</b> pole and a <b style="color:#457b9d">(−)</b> pole. Current leaves (+) and must return to (−).',
    'tut.p3.p3':   'The <b>wire</b> carries current freely to close the path. The <b>block</b> is an insulator: it does not conduct, it only fills gaps.',
    'tut.lbl.wire':  'Wire',
    'tut.lbl.block': 'Block',

    // ── Tutorial: page 4 ──
    'tut.p4.h':  'LEDs and Resistors',
    'tut.p4.p1': 'The <b>LED</b> is the game\'s lamp, which appears from level 5 onward. It lights up with a current between <b class="ok">1 and 28 mA</b>. Too little: it stays off. Too much: <b class="no">it burns out!</b>',
    'tut.p4.p2': 'The <b>resistor</b> is the protector: it <b>limits the current</b> so the LED won\'t burn out. Larger values (Ω) limit more.',
    'tut.p4.p3': 'The <b>resistor</b> itself has a limit too: above <b class="no">50 mA</b> it <b>burns out</b>.',
    'tut.lbl.red':    'Red',
    'tut.lbl.green':  'Green',

    // ── Tutorial: page 5 ──
    'tut.p5.h':     '⚡ Short Circuit',
    'tut.p5.p1':    'Connecting <b style="color:#e63946">(+)</b> straight to <b style="color:#457b9d">(−)</b> with only wires, <b>with nothing to limit the current</b>, creates a <b class="no">short circuit</b>.',
    'tut.p5.cap':   '✗ Short circuit',
    'tut.p5.sub':   'Huge current — the source burns out!',
    'tut.p5.p2':    'With no resistance the current spikes (over <b>1 A</b>) and the source is destroyed, leaving <b class="no">debris</b> on the board. Always put a resistor or an LED in the path!',

    // ── Tutorial: page 6 ──
    'tut.p6.h':      'Common LED Mistakes',
    'tut.p6.cap1':   '✗ LED without a resistor',
    'tut.p6.sub1':   '9 V straight to the LED → over 28 mA → burns out',
    'tut.p6.p1':     'Wiring the LED <b>straight to the source</b>, with no resistor limiting it, lets too much current through and it <b class="no">burns out</b>.',
    'tut.p6.cap2':   '✗ Reversed polarity',
    'tut.p6.sub2':   '(−) connected where (+) should be',
    'tut.p6.p2':     'The LED only works in <b>one direction</b>. If (+) and (−) are swapped it <b class="no">won\'t light</b> — rotate the piece to fix it.',

    // ── Tutorial: page 7 ──
    'tut.p7.h':    'Circuit Pairing Tips',
    'tut.p7.p1':   'Use <b>Ohm\'s Law</b> to pick the right resistor: <b style="font-family:var(--font-mono)">I = V / R</b> (current = voltage / resistance).',
    'tut.p7.ok1':  '✓&nbsp; 3 V / 100 Ω → lights up',
    'tut.p7.ok2':  '✓&nbsp; 5 V / 220 Ω → lights up',
    'tut.p7.ok3':  '✓&nbsp; 9 V / 470 Ω → lights up',
    'tut.p7.no1':  '✗&nbsp; 9 V / 100 Ω → resistor burns out',
    'tut.p7.no2':  '✗&nbsp; LED straight to 5 V → LED burns out',
    'tut.p7.tip':  'Tip: higher voltage needs a bigger resistor. When unsure, go with <b>470 Ω</b>.',

    // ── Tutorial: page 8 ──
    'tut.p8.h':       'Controls',
    'tut.p8.move':    'Move the piece',
    'tut.p8.rotate':  'Rotate the piece',
    'tut.p8.down':    'Speed up the fall',
    'tut.p8.dropKey': 'SPACE<br/>or ENTER',
    'tut.p8.drop':    'Instant drop (hard drop)',
    'tut.p8.restart': 'Restart the game',
    'tut.p8.mobile':  'On mobile, use the <b>on-screen buttons</b> or <b>tap/drag</b> directly on the board.',
    'tut.p8.gl':      'Good luck!',

    // ── Tutorial: page 9 (ranks) ──
    'tut.p9.h':  'Score Ranks',
    'tut.p9.p1': 'Your <b>high score</b> sets your title. Build circuits with more components to score higher and rank up!',
    'tut.p9.r1': '&lt; 1000 → <b>Beginner ⚡</b>',
    'tut.p9.r2': '1000 → <b>Student ⚡</b>',
    'tut.p9.r3': '2000 → <b>Technician ⚡</b>',
    'tut.p9.r4': '3000 → <b>Engineer ⚡</b>',
    'tut.p9.r5': '4000+ → <b>Kirchhoff ⚡</b>',

    // ── Tutorial footer ──
    'tut.prev':     '◄ Previous',
    'tut.next':     'Next ►',
    'tut.start':    'Start',
    'tut.continue': 'Continue',

    // ── Game over ──
    'over.title':   'SHORT CIRCUIT!',
    'over.desc':    'The board filled up with components.',
    'over.score':   'Score:',
    'over.record':  'Record:',
    'over.again':   '<b style="color:var(--acc-hi)">ENTER</b>, <b style="color:var(--acc-hi)">R</b> or <b style="color:var(--acc-hi)">RESTART</b> to play again',

    // ── Circuit status overlay ──
    'status.closed':   'Circuit Closed!',
    'status.burned':   'Circuit Burned Out!',
    'status.continue': 'DROP to continue',

    // ── Touch buttons ──
    'touch.left':   'Left',
    'touch.rotate': 'Rotate',
    'touch.right':  'Right',
    'touch.down':   'Down',
    'touch.dropKey':'SPACE / ENTER',

    // ── Next piece descriptions ──
    'piece.led.red':    'Red LED',
    'piece.led.green':  'Green LED',
    'piece.led.yellow': 'Yellow LED',
    'piece.led.detail': '2 V drop · max 28 mA',
    'piece.resistor':       '{v} Ω Resistor',
    'piece.resistor.detail':'Max current 50 mA',
    'piece.source':        '{v} V Source',
    'piece.source.detail': 'Short circuit 1 A',
    'piece.wire':          'Wire',
    'piece.wire.detail':   'Carries energy',
    'piece.block':         'Block',
    'piece.block.detail':  'Insulator (no current)',

    // ── Circuit reasons ──
    'reason.ledBurn':      'LED current ({i} mA) exceeded 28 mA',
    'reason.ledLit':       'LED lit up with {i} mA',
    'reason.sourceShort':  'Short! Source at {i} A',
    'reason.sourceActive': '{v} V source — {i} mA',
    'reason.resBurn':      '{v} Ω resistor current ({i} mA) exceeded 50 mA',
    'reason.resActive':    '{v} Ω resistor — {volt} V and {i} mA',
  },
};
