import { MapTile, PropObject, Monster, MapZoneId, MapZoneInfo } from '../types/ro';

export const MAP_WIDTH = 22;
export const MAP_HEIGHT = 22;

export const TILE_WIDTH = 64;
export const TILE_HEIGHT = 32;

export const MAP_ZONES: Record<MapZoneId, MapZoneInfo> = {
  prontera_south: {
    id: 'prontera_south',
    name: '普隆德拉南門原野',
    subName: 'Prontera South Field (prt_fild08)',
    skyTop: '#8EC5FC',
    skyBottom: '#E0C3FC',
    grassColor: '#8CB344',
    flowerColor: '#A3C958',
    stoneColor: '#A8B2B9',
    pathColor: '#D4A373',
  },
  payon_sakura: {
    id: 'payon_sakura',
    name: '斐揚櫻花神木林',
    subName: 'Payon Sakura Woods (pay_fild04)',
    skyTop: '#FFDEE9',
    skyBottom: '#B5FFFC',
    grassColor: '#98C9A3',
    flowerColor: '#FFB7C5',
    stoneColor: '#C9ADA7',
    pathColor: '#E6CCB2',
  },
  geffen_ruins: {
    id: 'geffen_ruins',
    name: '吉芬魔導浮空遺跡',
    subName: 'Geffen Magic Ruins (gef_fild07)',
    skyTop: '#240046',
    skyBottom: '#5A189A',
    grassColor: '#5E60CE',
    flowerColor: '#7400B8',
    stoneColor: '#7251B5',
    pathColor: '#9D4EDD',
  },
};

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

// Generate the customized RO map tiles per zone
export function generateROMazeMap(zoneId: MapZoneId = 'prontera_south'): MapTile[] {
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

      // Water pond in North-East (x: 15-19, y: 2-6)
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
        if (x === 5 && (y === 17 || y === 18)) {
          height = 1;
          type = 'path';
        }
      }

      // Zone-specific flower / magic rune patches
      if (
        (x === 6 && y === 6) ||
        (x === 16 && y === 16) ||
        (x === 7 && y === 14) ||
        (x === 13 && y === 7) ||
        (zoneId === 'payon_sakura' && (x + y) % 5 === 0 && walkable)
      ) {
        if (type === 'grass') type = 'flower';
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

export function getZoneProps(zoneId: MapZoneId): PropObject[] {
  const portalName =
    zoneId === 'prontera_south'
      ? '傳送之陣 → 斐揚櫻花林'
      : zoneId === 'payon_sakura'
      ? '傳送之陣 → 吉芬魔導遺跡'
      : '傳送之陣 → 普隆德拉南門';

  const treeName =
    zoneId === 'payon_sakura'
      ? '千年櫻花神木'
      : zoneId === 'geffen_ruins'
      ? '魔力結晶柱'
      : '古老神木';

  return [
    {
      id: 'fountain_1',
      x: 11,
      y: 11,
      type: 'fountain',
      name: '大天使聖水噴泉 (Angel Fountain)',
      desc: '點擊飲用清涼聖水，瞬間回滿 100% HP 與 SP！',
    },
    {
      id: 'portal_south',
      x: 11,
      y: 20,
      type: 'portal',
      name: portalName,
      desc: '點擊進入空間傳送門，切換至下一個 RO 冒險原野地圖！',
    },
    {
      id: 'portal_north',
      x: 11,
      y: 2,
      type: 'portal',
      name: portalName,
      desc: '北側傳送陣，可傳送往其他冒險區域。',
    },
    { id: 'tree_1', x: 4, y: 4, type: 'tree', name: treeName, desc: '散發著大自然氣息的林木。' },
    { id: 'tree_2', x: 7, y: 3, type: 'tree', name: treeName, desc: '散發著大自然氣息的林木。' },
    { id: 'tree_3', x: 14, y: 9, type: 'tree', name: treeName, desc: '散發著大自然氣息的林木。' },
    { id: 'tree_4', x: 8, y: 17, type: 'tree', name: treeName, desc: '散發著大自然氣息的林木。' },
    { id: 'tree_5', x: 18, y: 14, type: 'tree', name: treeName, desc: '散發著大自然氣息的林木。' },
    {
      id: 'crystal_1',
      x: 3,
      y: 17,
      type: 'crystal',
      name: '浮空守護魔石 (Mana Crystal)',
      desc: '點擊共鳴可獲得神聖祝福，額外獎勵 +250 EXP！',
    },
    { id: 'lantern_1', x: 9, y: 9, type: 'lantern', name: '普隆德拉路燈', desc: '溫暖的黃色光暈。' },
    { id: 'lantern_2', x: 13, y: 9, type: 'lantern', name: '普隆德拉路燈', desc: '溫暖的黃色光暈。' },
    { id: 'lantern_3', x: 9, y: 13, type: 'lantern', name: '普隆德拉路燈', desc: '溫暖的黃色光暈。' },
    { id: 'lantern_4', x: 13, y: 13, type: 'lantern', name: '普隆德拉路燈', desc: '溫暖的黃色光暈。' },
    {
      id: 'bench_1',
      x: 13,
      y: 12,
      type: 'bench',
      name: '冒險者木長椅',
      desc: '坐下小憩片刻，恢復冒險精神。',
    },
    {
      id: 'tent_1',
      x: 16,
      y: 17,
      type: 'tent',
      name: '卡普拉服務站 (Kafra Station)',
      desc: '卡普拉姊姊為您提供免費生命回復與重生點儲存服務！',
    },
  ];
}

export function getZoneMonsters(zoneId: MapZoneId): Monster[] {
  if (zoneId === 'payon_sakura') {
    return [
      {
        id: 'm1',
        name: '櫻花波利 (Sakura Poring)',
        type: 'poring',
        x: 6,
        y: 8,
        spawnX: 6,
        spawnY: 8,
        hp: 120,
        maxHp: 120,
        level: 5,
        expReward: 450,
        zenyReward: 320,
        dropName: '櫻花糯米糰子',
        icon: '🌸',
      },
      {
        id: 'm2',
        name: '冰波利 (Marin)',
        type: 'Marin',
        x: 15,
        y: 8,
        spawnX: 15,
        spawnY: 8,
        hp: 160,
        maxHp: 160,
        level: 8,
        expReward: 680,
        zenyReward: 500,
        dropName: '冰晶草莓露',
        icon: '💧',
      },
      {
        id: 'm3',
        name: '幸運瘋兔 (Eclipse)',
        type: 'lunatic',
        x: 7,
        y: 15,
        spawnX: 7,
        spawnY: 15,
        hp: 200,
        maxHp: 200,
        level: 12,
        expReward: 950,
        zenyReward: 800,
        dropName: '四葉幸運草',
        icon: '🐰',
      },
      {
        id: 'm4',
        name: '翠綠棉蟲 (Creamy Fabre)',
        type: 'fabre',
        x: 14,
        y: 15,
        spawnX: 14,
        spawnY: 15,
        hp: 140,
        maxHp: 140,
        level: 7,
        expReward: 520,
        zenyReward: 410,
        dropName: '柔軟絲綢絨毛',
        icon: '🐛',
      },
      {
        id: 'm5',
        name: 'MVP 天使波利王 (Arch Angeling)',
        type: 'angeling',
        x: 3,
        y: 18,
        spawnX: 3,
        spawnY: 18,
        hp: 950,
        maxHp: 950,
        level: 45,
        expReward: 4500,
        zenyReward: 6800,
        dropName: '大天使聖光羽翼',
        icon: '👼',
        isMvp: true,
      },
    ];
  }

  if (zoneId === 'geffen_ruins') {
    return [
      {
        id: 'm1',
        name: '暗影小惡魔 (Deviruchi)',
        type: 'deviruchi',
        x: 6,
        y: 9,
        spawnX: 6,
        spawnY: 9,
        hp: 280,
        maxHp: 280,
        level: 18,
        expReward: 1400,
        zenyReward: 1200,
        dropName: '小惡魔角髮箍',
        icon: '😈',
      },
      {
        id: 'm2',
        name: '魔導冰波利 (Arcane Marin)',
        type: 'Marin',
        x: 16,
        y: 7,
        spawnX: 16,
        spawnY: 7,
        hp: 240,
        maxHp: 240,
        level: 15,
        expReward: 1150,
        zenyReward: 950,
        dropName: '藍色魔力礦石',
        icon: '🔮',
      },
      {
        id: 'm3',
        name: '月光瘋兔 (Moon Lunatic)',
        type: 'lunatic',
        x: 7,
        y: 16,
        spawnX: 7,
        spawnY: 16,
        hp: 260,
        maxHp: 260,
        level: 16,
        expReward: 1250,
        zenyReward: 1050,
        dropName: '星塵胡蘿蔔',
        icon: '🌙',
      },
      {
        id: 'm4',
        name: '小惡魔侍從 (Mini Demon)',
        type: 'deviruchi',
        x: 14,
        y: 15,
        spawnX: 14,
        spawnY: 15,
        hp: 310,
        maxHp: 310,
        level: 20,
        expReward: 1600,
        zenyReward: 1400,
        dropName: '闇黑契約書頁',
        icon: '🦇',
      },
      {
        id: 'm5',
        name: 'MVP 墮落天使波利 (Ghostring & Angeling)',
        type: 'angeling',
        x: 3,
        y: 18,
        spawnX: 3,
        spawnY: 18,
        hp: 1500,
        maxHp: 1500,
        level: 65,
        expReward: 8000,
        zenyReward: 12000,
        dropName: '傳說天使波利卡片',
        icon: '👑',
        isMvp: true,
      },
    ];
  }

  // Default: prontera_south
  return [
    {
      id: 'm1',
      name: '波利 (Poring)',
      type: 'poring',
      x: 6,
      y: 9,
      spawnX: 6,
      spawnY: 9,
      hp: 80,
      maxHp: 80,
      level: 1,
      expReward: 250,
      zenyReward: 150,
      dropName: '傑勒比結晶 (Jellopy)',
      icon: '🍮',
    },
    {
      id: 'm2',
      name: '波利 (Poring)',
      type: 'poring',
      x: 16,
      y: 7,
      spawnX: 16,
      spawnY: 7,
      hp: 80,
      maxHp: 80,
      level: 1,
      expReward: 250,
      zenyReward: 150,
      dropName: '香甜蘋果汁',
      icon: '🍮',
    },
    {
      id: 'm3',
      name: '瘋兔 (Lunatic)',
      type: 'lunatic',
      x: 7,
      y: 16,
      spawnX: 7,
      spawnY: 16,
      hp: 110,
      maxHp: 110,
      level: 3,
      expReward: 380,
      zenyReward: 240,
      dropName: '紅蘿蔔與幸運草',
      icon: '🐰',
    },
    {
      id: 'm4',
      name: '綠棉蟲 (Fabre)',
      type: 'fabre',
      x: 14,
      y: 15,
      spawnX: 14,
      spawnY: 15,
      hp: 95,
      maxHp: 95,
      level: 2,
      expReward: 310,
      zenyReward: 190,
      dropName: '綠ハーブ (綠色藥草)',
      icon: '🐛',
    },
    {
      id: 'm5',
      name: 'MVP 天使波利 (Angeling)',
      type: 'angeling',
      x: 3,
      y: 18,
      spawnX: 3,
      spawnY: 18,
      hp: 650,
      maxHp: 650,
      level: 25,
      expReward: 2800,
      zenyReward: 4500,
      dropName: '天使之翅耳飾 (Angel Wing)',
      icon: '👼',
      isMvp: true,
    },
  ];
}

export const INITIAL_PROPS: PropObject[] = getZoneProps('prontera_south');
export const INITIAL_MONSTERS: Monster[] = getZoneMonsters('prontera_south');

// BFS Grid Pathfinding
export function findGridPath(
  tiles: MapTile[],
  startX: number,
  startY: number,
  goalX: number,
  goalY: number
): Array<{ x: number; y: number }> {
  const sX = Math.round(startX);
  const sY = Math.round(startY);
  const gX = Math.round(goalX);
  const gY = Math.round(goalY);

  if (sX === gX && sY === gY) return [];

  const walkableSet = new Set<string>();
  for (const t of tiles) {
    if (t.walkable) {
      walkableSet.add(`${t.x},${t.y}`);
    }
  }

  if (!walkableSet.has(`${gX},${gY}`)) {
    return [];
  }

  const queue: Array<{ x: number; y: number; path: Array<{ x: number; y: number }> }> = [
    { x: sX, y: sY, path: [] },
  ];
  const visited = new Set<string>([`${sX},${sY}`]);

  const dirs = [
    { dx: 1, dy: 0 },
    { dx: -1, dy: 0 },
    { dx: 0, dy: 1 },
    { dx: 0, dy: -1 },
    { dx: 1, dy: 1 },
    { dx: -1, dy: -1 },
    { dx: 1, dy: -1 },
    { dx: -1, dy: 1 },
  ];

  while (queue.length > 0) {
    const curr = queue.shift()!;
    if (curr.x === gX && curr.y === gY) {
      return curr.path;
    }

    for (const { dx, dy } of dirs) {
      const nx = curr.x + dx;
      const ny = curr.y + dy;
      const key = `${nx},${ny}`;
      if (!visited.has(key) && walkableSet.has(key)) {
        visited.add(key);
        queue.push({
          x: nx,
          y: ny,
          path: [...curr.path, { x: nx, y: ny }],
        });
      }
    }
  }

  return [];
}
