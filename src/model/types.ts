export type Direction = 'N' | 'E' | 'S' | 'W';
export type PieceType = 'source' | 'resistor' | 'led' | 'wire' | 'wire3' | 'block' | 'burned';
export type LedColor = 'red' | 'green' | 'yellow';

export interface Ports {
  N: 0 | 1;
  E: 0 | 1;
  S: 0 | 1;
  W: 0 | 1;
}

export interface DirectionDef {
  dx: number;
  dy: number;
  f: Direction;
  t: Direction;
}

export interface TemplateCell {
  x: number;
  y: number;
  ports: Partial<Ports>;
  t?: '+' | '-';
  idx?: number;
  type?: PieceType;
  color?: string;
}

export interface PieceTemplate {
  type: PieceType;
  value: number | LedColor | string;
  w: number;
  cells: TemplateCell[];
  color?: string;
}

export interface PieceCell {
  x: number;
  y: number;
  ports: Partial<Ports>;
  t?: '+' | '-';
  idx?: number;
  type?: PieceType;
  color?: string;
}

export interface Piece {
  type: PieceType;
  value: number | LedColor | string;
  color?: string;
  id: number;
  cells: PieceCell[];
  x: number;
  y: number;
}

export interface GridCell {
  type: PieceType;
  value?: number | LedColor | string | null;
  color?: string;
  ports: Partial<Ports>;
  t?: '+' | '-';
  idx?: number;
  pieceId?: number;
  pieceType?: PieceType;
  vertical?: boolean;
}

export interface AnimatingCell {
  x: number;
  y: number;
  cell: GridCell | null;
  timer: number;
  atype: 'burn' | 'lit';
  isActLit?: boolean;
}

/** Vertical "speed line" left behind by a hard drop, in canvas pixels. */
export interface DropTrail {
  px:    number;   // left edge (px)
  yTop:  number;   // streak start (px)
  yBot:  number;   // streak end   (px)
  rgb:   string;   // "r,g,b"
  timer: number;   // ms remaining
  life:  number;   // total ms
}

export interface BurnAction {
  type: 'burn';
  cell: { x: number; y: number };
  reasons: string[];
}

export interface LightAction {
  type: 'light';
  cells: [number, number][];
  litCount: number;
  litPieceIds: string[];
  reasons: string[];
  activeCount: number;
}

export type GameAction = BurnAction | LightAction;

export interface DrawCellOpts {
  lit?: boolean;
}

export interface MNAResistor {
  nodeA: number;
  nodeB: number;
  value: number;
  pieceId: string;
}

export interface MNAVoltageSource {
  nodePlus: number;
  nodeMinus: number;
  value: number;
  pieceId?: string;
  isLed?: boolean;
  ledIdx?: number;
}

export interface MNALed {
  nodePlus: number;
  nodeMinus: number;
  pieceId: string;
  isOn: boolean;
}

export interface CompCell {
  x: number;
  y: number;
  c: GridCell;
}
