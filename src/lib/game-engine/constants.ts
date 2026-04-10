import { BoardVariant } from '@/types/game';

const ADJACENCY_STANDARD: number[][] = [
  // Outer (0-7)
  [1, 7, 8],    // 0: A7
  [0, 2, 9],    // 1: D7
  [1, 3, 10],   // 2: G7
  [2, 4, 11],   // 3: G4
  [3, 5, 12],   // 4: G1
  [4, 6, 13],   // 5: D1
  [5, 7, 14],   // 6: A1
  [0, 6, 15],   // 7: A4

  // Mid (8-15)
  [0, 9, 15, 16], // 8: B6
  [1, 8, 10, 17], // 9: D6
  [2, 9, 11, 18], // 10: F6
  [3, 10, 12, 19], // 11: F4
  [4, 11, 13, 20], // 12: F2
  [5, 12, 14, 21], // 13: D2
  [6, 13, 15, 22], // 14: B2
  [7, 8, 14, 23],  // 15: B4

  // Inner (16-23)
  [8, 17, 23],  // 16: C5
  [9, 16, 18],  // 17: D5
  [10, 17, 19], // 18: E5
  [11, 18, 20], // 19: E4
  [12, 19, 21], // 20: E3
  [13, 20, 22], // 21: D3
  [14, 21, 23], // 22: C3
  [15, 16, 22]  // 23: C4
];

const MILLS_STANDARD: number[][] = [
  // Outer
  [0, 1, 2], [2, 3, 4], [4, 5, 6], [6, 7, 0],
  // Mid
  [8, 9, 10], [10, 11, 12], [12, 13, 14], [14, 15, 8],
  // Inner
  [16, 17, 18], [18, 19, 20], [20, 21, 22], [22, 23, 16],
  // Crosses
  [1, 9, 17], [3, 11, 19], [5, 13, 21], [7, 15, 23],
  // Diagonals
  [0, 8, 16], [2, 10, 18], [4, 12, 20], [6, 14, 22]
];

const COORDS_STANDARD: { x: number, y: number }[] = [
  // Outer (0-7)
  { x: 5, y: 5 }, { x: 50, y: 5 }, { x: 95, y: 5 },
  { x: 95, y: 50 }, { x: 95, y: 95 }, { x: 50, y: 95 },
  { x: 5, y: 95 }, { x: 5, y: 50 },
  // Mid (8-15)
  { x: 20, y: 20 }, { x: 50, y: 20 }, { x: 80, y: 20 },
  { x: 80, y: 50 }, { x: 80, y: 80 }, { x: 50, y: 80 },
  { x: 20, y: 80 }, { x: 20, y: 50 },
  // Inner (16-23)
  { x: 35, y: 35 }, { x: 50, y: 35 }, { x: 65, y: 35 },
  { x: 65, y: 50 }, { x: 65, y: 65 }, { x: 50, y: 65 },
  { x: 35, y: 65 }, { x: 35, y: 50 }
];

const EDGES_STANDARD: [number, number][] = [
  // Outer Square
  [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 0],
  // Mid Square
  [8, 9], [9, 10], [10, 11], [11, 12], [12, 13], [13, 14], [14, 15], [15, 8],
  // Inner Square
  [16, 17], [17, 18], [18, 19], [19, 20], [20, 21], [21, 22], [22, 23], [23, 16],
  // Crosses
  [1, 9], [9, 17], [5, 13], [13, 21], [7, 15], [15, 23], [3, 11], [11, 19],
  // Diagonals
  [0, 8], [8, 16], [2, 10], [10, 18], [4, 12], [12, 20], [6, 14], [14, 22]
];

export const BOARD_NOTATION = [
  'E1', 'E2', 'E3', 'E4', 'E5', 'E6', 'E7', 'E8',
  'A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8',
  'R1', 'R2', 'R3', 'R4', 'R5', 'R6', 'R7', 'R8',
  'C1'
];

// Sesotho Variant (25 nodes)
const ADJACENCY_SESOTHO: number[][] = [
  // Outer (0-7)
  [1, 7],    // 0
  [0, 2, 9], // 1
  [1, 3],    // 2
  [2, 4, 11], // 3
  [3, 5],    // 4
  [4, 6, 13], // 5
  [5, 7],    // 6
  [0, 6, 15], // 7

  // Mid (8-15)
  [9, 15], // 8
  [1, 8, 10, 17], // 9
  [9, 11], // 10
  [3, 10, 12, 19], // 11
  [11, 13], // 12
  [5, 12, 14, 21], // 13
  [13, 15], // 14
  [7, 8, 14, 23], // 15

  // Inner (16-23)
  [17, 23], // 16
  [9, 16, 18, 24], // 17
  [17, 19], // 18
  [11, 18, 20, 24], // 19
  [19, 21], // 20
  [13, 20, 22, 24], // 21
  [21, 23], // 22
  [15, 16, 22, 24], // 23

  // Center (24)
  [17, 19, 21, 23]
];

const MILLS_SESOTHO: number[][] = [
  // Outer
  [0, 1, 2], [2, 3, 4], [4, 5, 6], [6, 7, 0],
  // Mid
  [8, 9, 10], [10, 11, 12], [12, 13, 14], [14, 15, 8],
  // Inner
  [16, 17, 18], [18, 19, 20], [20, 21, 22], [22, 23, 16],
  // Crosses
  [1, 9, 17], [3, 11, 19], [5, 13, 21], [7, 15, 23],
  // Center Crosses
  [17, 24, 21], [23, 24, 19]
];

const COORDS_SESOTHO: { x: number, y: number }[] = [
  ...COORDS_STANDARD,
  { x: 50, y: 50 } // Center node
];

const EDGES_SESOTHO: [number, number][] = [
  // Outer Square
  [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 0],
  // Mid Square
  [8, 9], [9, 10], [10, 11], [11, 12], [12, 13], [13, 14], [14, 15], [15, 8],
  // Inner Square
  [16, 17], [17, 18], [18, 19], [19, 20], [20, 21], [21, 22], [22, 23], [23, 16],
  // Crosses
  [1, 9], [9, 17], [5, 13], [13, 21], [7, 15], [15, 23], [3, 11], [11, 19],
  // Center Cross
  [17, 24], [21, 24], [23, 24], [19, 24]
];

export const BOARD_CONFIGS = {
  standard: {
    nodes: 24,
    adjacency: ADJACENCY_STANDARD,
    mills: MILLS_STANDARD,
    coords: COORDS_STANDARD,
    edges: EDGES_STANDARD
  },
  sesotho: {
    nodes: 25,
    adjacency: ADJACENCY_SESOTHO,
    mills: MILLS_SESOTHO,
    coords: COORDS_SESOTHO,
    edges: EDGES_SESOTHO
  },
  '11men': {
    nodes: 24,
    adjacency: ADJACENCY_STANDARD,
    mills: MILLS_STANDARD,
    coords: COORDS_STANDARD,
    edges: EDGES_STANDARD
  },
  gonjilgonu: {
    nodes: 24,
    adjacency: ADJACENCY_STANDARD,
    mills: MILLS_STANDARD,
    coords: COORDS_STANDARD,
    edges: EDGES_STANDARD
  }
};
