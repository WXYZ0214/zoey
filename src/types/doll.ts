export type CategoryType = 
  | 'makeup'
  | 'hair'
  | 'clothes'
  | 'bottoms'
  | 'shoes'
  | 'earrings'
  | 'accessories'
  | 'background';

export interface ColorPalette {
  id: string;
  name: string;
  color: string;
}

export interface ItemOption {
  id: string;
  name: string;
  previewIcon?: string;
  category: CategoryType;
  subCategory?: string;
  isRemovable?: boolean;
}

export interface DollState {
  // Makeup & Face
  skinColor: string;
  eyeShape: string;
  eyeColor: string;
  eyebrows: string;
  eyeshadow: string;
  eyeshadowColor: string;
  blush: string;
  blushColor: string;
  lips: string;
  lipColor: string;

  // Hair
  bangs: string;
  backHair: string;
  hairColor: string;

  // Outfit
  outfitType: 'split' | 'dress'; // split: top + bottom, or single dress
  top: string;
  topColor: string;
  bottom: string;
  bottomColor: string;
  dress: string;
  dressColor: string;

  // Shoes & Socks
  socks: string;
  socksColor: string;
  shoes: string;
  shoesColor: string;

  // Accessories
  earrings: string;
  earringsColor: string;
  headwear: string;
  headwearColor: string;
  glasses: string;
  necklace: string;
  handheld: string;

  // Scene
  background: string;
  filter: string;
  showSparkles: boolean;
  enableBlink: boolean;
}
