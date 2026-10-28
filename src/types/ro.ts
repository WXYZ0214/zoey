export interface Point {
  x: number;
  y: number;
}

export interface IsometricCoord {
  isoX: number;
  isoY: number;
}

export type TileType =
  | 'grass'
  | 'path'
  | 'stone'
  | 'water'
  | 'wood'
  | 'flower';

export type MapZoneId = 'prontera_south' | 'payon_sakura' | 'geffen_ruins';

export interface MapZoneInfo {
  id: MapZoneId;
  name: string;
  subName: string;
  skyTop: string;
  skyBottom: string;
  grassColor: string;
  flowerColor: string;
  stoneColor: string;
  pathColor: string;
}

export interface MapTile {
  x: number;
  y: number;
  height: number;
  type: TileType;
  walkable: boolean;
}

export interface PropObject {
  id: string;
  x: number;
  y: number;
  type: 'tree' | 'fountain' | 'bench' | 'portal' | 'crystal' | 'signpost' | 'lantern' | 'tent';
  name: string;
  desc: string;
}

export interface Monster {
  id: string;
  name: string;
  x: number;
  y: number;
  spawnX: number;
  spawnY: number;
  type: 'poring' | 'lunatic' | 'fabre' | 'angeling' | 'Marin' | 'deviruchi';
  hp: number;
  maxHp: number;
  level: number;
  expReward: number;
  zenyReward: number;
  dropName: string;
  icon: string;
  isMvp?: boolean;
  isDead?: boolean;
}

export interface DamageNumber {
  id: string;
  x: number;
  y: number;
  damage: number;
  isCrit: boolean;
  isHeal?: boolean;
  isPlayerHit?: boolean;
  opacity: number;
}

export interface SkillEffect {
  id: string;
  type: 'heal' | 'holylight' | 'magnus' | 'levelup' | 'teleport';
  x: number;
  y: number;
  createdAt: number;
}

export interface ChatBubble {
  id: string;
  text: string;
  sender: 'player' | 'npc' | 'system';
  timestamp: number;
}

export interface LootItem {
  id: string;
  name: string;
  icon: string;
  count: number;
  desc: string;
}

export interface PlayerCharacter {
  name: string;
  job: string;
  level: number;
  baseHp: number;
  maxHp: number;
  baseSp: number;
  maxSp: number;
  exp: number;
  maxExp: number;
  zeny: number;
  x: number;
  y: number;
  facing: 'SW' | 'SE' | 'NW' | 'NE';
  isMoving: boolean;
  avatarUrl?: string;
}
