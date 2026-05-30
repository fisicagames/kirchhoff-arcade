import type { MNAResistor, MNAVoltageSource } from './types';

/** Gaussian elimination with partial pivoting. Returns null if singular. */
export function solveLinearSystem(A: number[][], Z: number[]): number[] | null {
  const n = A.length;
  const M = A.map((row, i) => [...row, Z[i]]);

  for (let i = 0; i < n; i++) {
    let maxEl = Math.abs(M[i][i]);
    let maxRow = i;
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(M[k][i]) > maxEl) { maxEl = Math.abs(M[k][i]); maxRow = k; }
    }
    [M[maxRow], M[i]] = [M[i], M[maxRow]];
    if (Math.abs(M[i][i]) < 1e-12) return null;

    for (let k = i + 1; k < n; k++) {
      const c = -M[k][i] / M[i][i];
      for (let j = i; j <= n; j++) M[k][j] += c * M[i][j];
    }
  }

  const x = new Array<number>(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    x[i] = M[i][n] / M[i][i];
    for (let k = i - 1; k >= 0; k--) M[k][n] -= M[k][i] * x[i];
  }
  return x;
}

/** Build and solve the Modified Nodal Analysis system. */
export function buildAndSolveMNA(
  numNodes: number,
  resistors: MNAResistor[],
  vSources: MNAVoltageSource[],
): number[] | null {
  const Mv   = vSources.length;
  const size = numNodes + Mv;
  const A    = Array.from({ length: size }, () => Array<number>(size).fill(0));
  const Z    = Array<number>(size).fill(0);

  // Weak ground to prevent floating nodes
  for (let i = 0; i < numNodes; i++) A[i][i] = 1e-9;

  for (const r of resistors) {
    const g = 1 / (r.value || 0.001);
    A[r.nodeA][r.nodeA] += g;  A[r.nodeB][r.nodeB] += g;
    A[r.nodeA][r.nodeB] -= g;  A[r.nodeB][r.nodeA] -= g;
  }

  for (let k = 0; k < Mv; k++) {
    const vs   = vSources[k];
    const vIdx = numNodes + k;
    A[vs.nodePlus][vIdx]  += 1;  A[vs.nodeMinus][vIdx] -= 1;
    A[vIdx][vs.nodePlus]  += 1;  A[vIdx][vs.nodeMinus] -= 1;
    A[vIdx][vIdx] -= 0.01;        // small internal resistance
    Z[vIdx] = vs.value;
  }

  return solveLinearSystem(A, Z);
}
