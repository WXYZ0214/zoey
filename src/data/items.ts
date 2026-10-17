import { DollState } from '../types/doll';

export interface PaletteItem {
  name: string;
  value: string;
}

export const SKIN_PALETTES: PaletteItem[] = [
  { name: '粉嫩白皙', value: '#FFF0EA' },
  { name: '自然象牙', value: '#FFE8DF' },
  { name: '溫暖蜜桃', value: '#FCD7C7' },
  { name: '健康小麥', value: '#E8B699' },
  { name: '焦糖暖棕', value: '#C68E68' },
  { name: '夢幻粉紫', value: '#F3E5F5' },
  { name: '精靈薄荷', value: '#E0F2F1' },
];

export const HAIR_PALETTES: PaletteItem[] = [
  { name: '櫻花粉', value: '#FFB7C5' },
  { name: '奶茶淺金', value: '#F3E0BE' },
  { name: '焦糖暖棕', value: '#8D5B4C' },
  { name: '深巧黑咖', value: '#3A2B28' },
  { name: '烏木純黑', value: '#232025' },
  { name: '薰衣草紫', value: '#CDB4DB' },
  { name: '薄荷冰綠', value: '#B5EAD7' },
  { name: '天空蔚藍', value: '#A0C4FF' },
  { name: '胡蘿蔔橙', value: '#FF9F1C' },
  { name: '酒紅寶石', value: '#9E2A2B' },
  { name: '銀白月光', value: '#E8E8EE' },
];

export const EYE_PALETTES: PaletteItem[] = [
  { name: '寶石深藍', value: '#3A506B' },
  { name: '琥珀金棕', value: '#8A5A36' },
  { name: '翡翠墨綠', value: '#2D6A4F' },
  { name: '紫晶幻夜', value: '#7209B7' },
  { name: '甜莓玫粉', value: '#E63946' },
  { name: '晴空天藍', value: '#4EA8DE' },
  { name: '曜石深邃', value: '#2B2D42' },
  { name: '金黃燦爛', value: '#F4A261' },
];

export const LIP_PALETTES: PaletteItem[] = [
  { name: '草莓嫩紅', value: '#FF6B8B' },
  { name: '蜜桃奶橘', value: '#FF9E99' },
  { name: '櫻桃糖漿', value: '#D62246' },
  { name: '奶茶裸杏', value: '#E8927C' },
  { name: '桑葚漿果', value: '#9A031E' },
  { name: '粉玫瑰露', value: '#F7A8B8' },
];

export const BLUSH_PALETTES: PaletteItem[] = [
  { name: '初戀粉紅', value: '#FF758F' },
  { name: '暖心蜜橘', value: '#FF9F68' },
  { name: '微醺玫瑰', value: '#F48498' },
  { name: '淡紫迷幻', value: '#C77DFF' },
];

export const CLOTHING_PALETTES: PaletteItem[] = [
  { name: '棉花糖粉', value: '#FFC6D9' },
  { name: '天空粉藍', value: '#BEE1E6' },
  { name: '檸檬奶油', value: '#FFF1C5' },
  { name: '薄荷果凍', value: '#C7F9CC' },
  { name: '丁香淺紫', value: '#E2C2FF' },
  { name: '燕麥純白', value: '#FAF8F5' },
  { name: '午夜海軍藍', value: '#273469' },
  { name: '歌德炭黑', value: '#303036' },
  { name: '復古磚紅', value: '#A44238' },
  { name: '焦糖卡其', value: '#C49A6C' },
];

export const DEFAULT_DOLL_STATE: DollState = {
  skinColor: '#FFF0EA',
  eyeShape: 'sparkle',
  eyeColor: '#3A506B',
  eyebrows: 'soft',
  eyeshadow: 'shimmer',
  eyeshadowColor: '#FFC6D9',
  blush: 'apple',
  blushColor: '#FF758F',
  lips: 'smile',
  lipColor: '#FF6B8B',

  bangs: 'hime',
  backHair: 'twintails',
  hairColor: '#FFB7C5',

  outfitType: 'split',
  top: 'sailor',
  topColor: '#BEE1E6',
  bottom: 'pleated_skirt',
  bottomColor: '#273469',
  dress: 'none',
  dressColor: '#FFC6D9',

  socks: 'frill_ankle',
  socksColor: '#FAF8F5',
  shoes: 'mary_janes',
  shoesColor: '#303036',

  earrings: 'star',
  earringsColor: '#F4A261',
  headwear: 'big_bow',
  headwearColor: '#FFC6D9',
  glasses: 'none',
  necklace: 'choker',
  handheld: 'bunny_plush',

  background: 'bedroom',
  filter: 'none',
  showSparkles: true,
  enableBlink: true,
};

// Available categories with metadata
export const CATEGORIES = [
  { id: 'makeup', name: '妝容五官', icon: '💄', desc: '膚色、眼影、腮紅、唇膏、瞳孔' },
  { id: 'hair', name: '夢幻髮型', icon: '💇‍♀️', desc: '瀏海、後髮、雙馬尾與自訂髮色' },
  { id: 'clothes', name: '上衣套裝', icon: '👚', desc: '水手服、襯衫、毛衣與連身洋裝' },
  { id: 'bottoms', name: '下身裙褲', icon: '👗', desc: '百褶裙、蛋糕裙、短褲與工裝長褲' },
  { id: 'shoes', name: '精緻鞋襪', icon: '👠', desc: '瑪莉珍鞋、運動鞋、過膝襪、蕾絲短襪' },
  { id: 'earrings', name: '耳環耳飾', icon: '✨', desc: '草莓墜飾、星芒鑽石、愛心珍珠耳環' },
  { id: 'accessories', name: '飾品配件', icon: '🎀', desc: '大蝴蝶結、貓耳、眼鏡、項鍊與抱偶' },
  { id: 'background', name: '背景情境', icon: '🌸', desc: '夢幻臥室、櫻花公園、咖啡館、去背' },
] as const;
