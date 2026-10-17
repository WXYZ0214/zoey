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
  targetX?: number;
  targetY?: number;
  type: 'poring' | 'lunatic' | 'fabre' | 'angeling';
  hp: number;
  maxHp: number;
  level: number;
  icon: string;
  isDead?: boolean;
}

export interface DamageNumber {
  id: string;
  x: number;
  y: number;
  damage: number;
  isCrit: boolean;
  opacity: number;
}

export interface ChatBubble {
  id: string;
  text: string;
  sender: 'player' | 'npc' | 'system';
  timestamp: number;
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
