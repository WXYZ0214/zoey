import { MapTile, PropObject, Monster } from '../types/ro';

export const MAP_WIDTH = 22;
export const MAP_HEIGHT = 22;

export const TILE_WIDTH = 64;
export const TILE_HEIGHT = 32;

// Isometric coordinate conversions
export function gridToIso(x: number, y: number, height = 0): { screenX: number; screenY: number } {
  const screenX = (x - y) * (TILE_WIDTH / 2);
  const screenY = (x + y) * (TILE_HEIGHT / 2) - height * 12;
  return { screenX, screenY };
}

export function isoToGrid(screenX: number, screenY: number): { x: number; y: number } {
  const halfW = TILE_WIDTH / 2;
  const halfH = TILE_HEIGHT / 2;
  const x = Math.floor((screenX / halfW + screenY / halfH) / 2);
  const y = Math.floor((screenY / halfH - screenX / halfW) / 2);
  return { x, y };
}

// Generate the customized RO map tiles
export function generateROMazeMap(): MapTile[] {
  const tiles: MapTile[] = [];

  for (let y = 0; y < MAP_HEIGHT; y++) {
    for (let x = 0; x < MAP_WIDTH; x++) {
      let type: MapTile['type'] = 'grass';
      let height = 0;
      let walkable = true;

      // Center Plaza (Cobblestone)
      const distFromCenter = Math.hypot(x - 11, y - 11);
      if (distFromCenter < 3.2) {
        type = 'stone';
        height = 1;
      } else if (distFromCenter < 4.2) {
        type = 'wood';
      }

      // Main Roads (Cross intersecting at plaza)
      if (Math.abs(x - 11) <= 1 || Math.abs(y - 11) <= 1) {
        type = 'path';
      }

      // Water pond in North-East (x: 15-20, y: 2-6)
      if (x >= 15 && x <= 19 && y >= 2 && y <= 6) {
        type = 'water';
        walkable = false;
        height = -0.5;
      }

      // Wooden bridge over water
      if (y === 4 && x >= 15 && x <= 19) {
        type = 'wood';
        walkable = true;
        height = 0.5;
      }

      // Cliff / Plateau in South-West (x: 1-5, y: 15-20)
      if (x >= 1 && x <= 5 && y >= 15 && y <= 20) {
        type = 'stone';
        height = 2;
        // Stairs to plateau
        if (x === 5 && (y === 17 || y === 18)) {
          height = 1;
          type = 'path';
        }
      }

      // Flower patches
      if ((x === 6 && y === 6) || (x === 16 && y === 16) || (x === 7 && y === 14) || (x === 13 && y === 7)) {
        type = 'flower';
      }

      // Borders
      if (x === 0 || y === 0 || x === MAP_WIDTH - 1 || y === MAP_HEIGHT - 1) {
        walkable = false;
      }

      tiles.push({ x, y, height, type, walkable });
    }
  }

  return tiles;
}

export const INITIAL_PROPS: PropObject[] = [
  // Center fountain
  { id: 'fountain_1', x: 11, y: 11, type: 'fountain', name: '大天使噴泉 (Angel Fountain)', desc: '噴灑著能恢復體力的清涼聖水。' },
  // Portal to next zone
  { id: 'portal_south', x: 11, y: 20, type: 'portal', name: '南門傳送之陣 (South Gate Portal)', desc: '通往波利島嶼與冒險者原野。' },
  // Trees
  { id: 'tree_1', x: 4, y: 4, type: 'tree', name: '古老神木', desc: '微風輕輕吹拂樹葉。' },
  { id: 'tree_2', x: 7, y: 3, type: 'tree', name: '古老神木', desc: '微風輕輕吹拂樹葉。' },
  { id: 'tree_3', x: 14, y: 9, type: 'tree', name: '古老神木', desc: '微風輕輕吹拂樹葉。' },
  { id: 'tree_4', x: 8, y: 17, type: 'tree', name: '古老神木', desc: '微風輕輕吹拂樹葉。' },
  { id: 'tree_5', x: 18, y: 14, type: 'tree', name: '古老神木', desc: '微風輕輕吹拂樹葉。' },
  // Plateau magic crystal
  { id: 'crystal_1', x: 3, y: 17, type: 'crystal', name: '浮空守護魔石 (Mana Crystal)', desc: '散發著神秘微光的古代符文魔石。' },
  // Street Lanterns
  { id: 'lantern_1', x: 9, y: 9, type: 'lantern', name: '復古路燈', desc: '溫暖的黃色光暈。' },
  { id: 'lantern_2', x: 13, y: 9, type: 'lantern', name: '復古路燈', desc: '溫暖的黃色光暈。' },
  { id: 'lantern_3', x: 9, y: 13, type: 'lantern', name: '復古路燈', desc: '溫暖的黃色光暈。' },
  { id: 'lantern_4', x: 13, y: 13, type: 'lantern', name: '復古路燈', desc: '溫暖的黃色光暈。' },
  // Bench
  { id: 'bench_1', x: 13, y: 12, type: 'bench', name: '木製長椅', desc: '讓疲憊的冒險者休憩恢復 SP。' },
  // Guild Tent
  { id: 'tent_1', x: 16, y: 17, type: 'tent', name: '卡普拉服務站 (Kafra Station)', desc: '提供倉庫存取與手推車租借。' },
];

export const INITIAL_MONSTERS: Monster[] = [
  { id: 'm1', name: '波利 (Poring)', type: 'poring', x: 6, y: 9, hp: 50, maxHp: 50, level: 1, icon: '🍮' },
  { id: 'm2', name: '波利 (Poring)', type: 'poring', x: 16, y: 7, hp: 50, maxHp: 50, level: 1, icon: '🍮' },
  { id: 'm3', name: '瘋兔 (Lunatic)', type: 'lunatic', x: 7, y: 16, hp: 75, maxHp: 75, level: 3, icon: '🐰' },
  { id: 'm4', name: '綠棉蟲 (Fabre)', type: 'fabre', x: 14, y: 15, hp: 60, maxHp: 60, level: 2, icon: '🐛' },
  { id: 'm5', name: '天使波利 (Angeling)', type: 'angeling', x: 3, y: 18, hp: 500, maxHp: 500, level: 25, icon: '👼' },
];
