import React, { useEffect, useState } from 'react';
import { DollState } from '../types/doll';

interface DollRendererProps {
  state: DollState;
  className?: string;
  id?: string;
}

// Helper: Convert #RRGGBB to { h: 0..360, s: 0..100, l: 0..100 }
function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const clean = hex.replace('#', '');
  if (clean.length !== 6) return { h: 345, s: 100, l: 85 };
  const r = parseInt(clean.substring(0, 2), 16) / 255;
  const g = parseInt(clean.substring(2, 4), 16) / 255;
  const b = parseInt(clean.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

// Compute CSS filter relative to a base color hex
function computeTintFilter(targetHex: string, defaultHex: string, baseHue = 345): string {
  if (!targetHex || targetHex.toUpperCase() === defaultHex.toUpperCase()) {
    return 'none';
  }
  const { h, s, l } = hexToHsl(targetHex);
  if (s < 10) {
    const b = Math.max(0.35, Math.min(1.25, l / 75));
    return `grayscale(1) brightness(${b.toFixed(2)}) contrast(1.08)`;
  }
  const hueDiff = (h - baseHue + 360) % 360;
  const satRatio = Math.max(0.5, Math.min(1.85, s / 65));
  const brightRatio = Math.max(0.5, Math.min(1.18, l / 78));
  return `hue-rotate(${hueDiff}deg) saturate(${satRatio.toFixed(2)}) brightness(${brightRatio.toFixed(2)})`;
}

export const DollRenderer: React.FC<DollRendererProps> = ({
  state,
  className = '',
  id = 'doll-canvas',
}) => {
  const [isBlinking, setIsBlinking] = useState(false);

  // Natural cute blinking cycle
  useEffect(() => {
    if (!state.enableBlink) {
      setIsBlinking(false);
      return;
    }

    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => {
        setIsBlinking(false);
      }, 160);
    }, 3800 + Math.random() * 2000);

    return () => clearInterval(blinkInterval);
  }, [state.enableBlink]);

  // Hair Filter (preset + custom fallback)
  const getHairFilter = (colorHex: string) => {
    switch (colorHex.toUpperCase()) {
      case '#FFB7C5':
        return 'none';
      case '#F3E0BE':
        return 'hue-rotate(50deg) saturate(1.4) brightness(1.08)';
      case '#FF9F1C':
        return 'hue-rotate(80deg) saturate(1.8) brightness(1.02)';
      case '#B5EAD7':
        return 'hue-rotate(220deg) saturate(1.3) brightness(1.05)';
      case '#A0C4FF':
        return 'hue-rotate(260deg) saturate(1.5) brightness(1.05)';
      case '#CDB4DB':
        return 'hue-rotate(300deg) saturate(1.2) brightness(1.02)';
      case '#8D5B4C':
        return 'hue-rotate(60deg) saturate(0.9) brightness(0.72) contrast(1.1)';
      case '#3A2B28':
        return 'hue-rotate(55deg) saturate(0.6) brightness(0.5) contrast(1.2)';
      case '#232025':
        return 'grayscale(1) brightness(0.38) contrast(1.3)';
      case '#E8E8EE':
        return 'grayscale(1) brightness(1.15) contrast(1.05)';
      case '#9E2A2B':
        return 'hue-rotate(15deg) saturate(2.0) brightness(0.7)';
      default:
        return computeTintFilter(colorHex, '#FFB7C5', 348);
    }
  };

  // Eye Filter (preset + custom fallback)
  const getEyeFilter = (colorHex: string) => {
    switch (colorHex.toUpperCase()) {
      case '#7209B7':
        return 'none';
      case '#3A506B':
        return 'hue-rotate(210deg) saturate(1.4)';
      case '#8A5A36':
        return 'hue-rotate(80deg) saturate(1.3) brightness(0.85)';
      case '#2D6A4F':
        return 'hue-rotate(160deg) saturate(1.5)';
      case '#E63946':
        return 'hue-rotate(320deg) saturate(1.8)';
      case '#4EA8DE':
        return 'hue-rotate(230deg) saturate(1.6) brightness(1.1)';
      case '#2B2D42':
        return 'grayscale(1) brightness(0.45)';
      case '#F4A261':
        return 'hue-rotate(95deg) saturate(2.0) brightness(1.1)';
      default:
        return computeTintFilter(colorHex, '#7209B7', 276);
    }
  };

  // Skin Tone Filter
  const getSkinFilter = (colorHex: string) => {
    switch (colorHex.toUpperCase()) {
      case '#FFF0EA':
        return 'none';
      case '#FFE8DF':
        return 'saturate(1.08) brightness(0.98)';
      case '#FCD7C7':
        return 'saturate(1.22) brightness(0.95)';
      case '#E8B699':
        return 'sepia(0.18) saturate(1.45) brightness(0.9)';
      case '#C68E68':
        return 'sepia(0.3) saturate(1.65) brightness(0.82) contrast(1.05)';
      case '#F3E5F5':
        return 'hue-rotate(285deg) saturate(0.85) brightness(1.02)';
      case '#E0F2F1':
        return 'hue-rotate(155deg) saturate(0.85) brightness(1.02)';
      default:
        return computeTintFilter(colorHex, '#FFF0EA', 18);
    }
  };

  const hairFilter = getHairFilter(state.hairColor);
  const eyeFilter = getEyeFilter(state.eyeColor);
  const skinFilter = getSkinFilter(state.skinColor);
  const blushFilter = computeTintFilter(state.blushColor, '#FF758F', 348);
  const lipFilter = computeTintFilter(state.lipColor, '#FF6B8B', 347);
  const topFilter = computeTintFilter(state.topColor, '#BEE1E6', 188);
  const bottomFilter = computeTintFilter(state.bottomColor, '#273469', 228);
  const dressFilter = computeTintFilter(state.dressColor, '#FFC6D9', 340);
  const socksFilter = computeTintFilter(state.socksColor, '#FAF8F5', 40);
  const shoesFilter = computeTintFilter(state.shoesColor, '#FFC6D9', 340);
  const headwearFilter = computeTintFilter(state.headwearColor, '#FFC6D9', 340);
  const earringsFilter = computeTintFilter(state.earringsColor, '#FFD166', 42);

  // Resolve Back Hair asset
  const backHairMap: Record<string, string> = {
    twintails: '/assets/chibi/hair_twintails.png',
    long_wave: '/assets/chibi/hair_long_wave.png',
    straight_long: '/assets/chibi/hair_straight_long.png',
    short_bob: '/assets/chibi/hair_short_bob.png',
    high_pony: '/assets/chibi/hair_high_pony.png',
    space_buns: '/assets/chibi/hair_space_buns.png',
  };

  // Resolve Bangs asset
  const bangsMap: Record<string, string> = {
    hime: '/assets/chibi/bangs_hime.png',
    airy: '/assets/chibi/bangs_airy.png',
    side: '/assets/chibi/bangs_side.png',
    bob: '/assets/chibi/bangs_bob.png',
    center: '/assets/chibi/bangs_center.png',
  };

  // Resolve Socks asset
  const socksMap: Record<string, string> = {
    frill_ankle: '/assets/chibi/socks_frill_ankle.png',
    knee_high: '/assets/chibi/socks_knee_high.png',
    thigh_high: '/assets/chibi/socks_thigh_high.png',
    star_tights: '/assets/chibi/socks_star_tights.png',
  };

  // Resolve Shoes asset
  const shoesMap: Record<string, string> = {
    mary_janes: '/assets/chibi/shoes_mary_janes.png',
    chunky_loafers: '/assets/chibi/shoes_black_loafers.png',
    sneakers: '/assets/chibi/shoes_sneakers.png',
    bear_slippers: '/assets/chibi/shoes_bear_slippers.png',
    boots: '/assets/chibi/shoes_boots.png',
  };

  // Resolve Split Tops asset
  const topMap: Record<string, string> = {
    sailor: '/assets/chibi/top_sailor.png',
    off_shoulder: '/assets/chibi/top_off_shoulder.png',
    sweater: '/assets/chibi/top_sweater.png',
    crop_hoodie: '/assets/chibi/top_crop_hoodie.png',
    cardigan: '/assets/chibi/top_cardigan.png',
  };

  // Resolve Split Bottoms asset
  const bottomMap: Record<string, string> = {
    pleated_skirt: '/assets/chibi/bottom_pleated_skirt.png',
    ruffle_skirt: '/assets/chibi/bottom_ruffle_skirt.png',
    denim_shorts: '/assets/chibi/bottom_denim_shorts.png',
    cargo_pants: '/assets/chibi/bottom_cargo_pants.png',
    plaid_skirt: '/assets/chibi/bottom_plaid_skirt.png',
  };

  // Resolve Full Dress asset
  const dressMap: Record<string, string> = {
    sailor_frill: '/assets/chibi/dress_sailor_frill.png',
    none: '/assets/chibi/dress_sailor_frill.png',
    maid_dress: '/assets/chibi/dress_maid.png',
    maid: '/assets/chibi/dress_maid.png',
    strawberry_sundress: '/assets/chibi/dress_strawberry.png',
    strawberry: '/assets/chibi/dress_strawberry.png',
    gothic_dress: '/assets/chibi/dress_gothic.png',
    gothic: '/assets/chibi/dress_gothic.png',
    yukata: '/assets/chibi/dress_yukata.png',
    cozy_sweater: '/assets/chibi/dress_cozy_sweater.png',
  };

  // Resolve Necklace asset
  const necklaceMap: Record<string, string> = {
    choker: '/assets/chibi/neck_choker.png',
    pearl: '/assets/chibi/neck_pearl.png',
    star_pendant: '/assets/chibi/neck_star_pendant.png',
  };

  // Resolve Earrings asset
  const earringsMap: Record<string, string> = {
    star: '/assets/chibi/earrings_star.png',
    pearl: '/assets/chibi/earrings_pearl.png',
    strawberry: '/assets/chibi/earrings_strawberry.png',
    hoop: '/assets/chibi/earrings_hoop.png',
    heart: '/assets/chibi/earrings_heart.png',
    cross: '/assets/chibi/earrings_cross.png',
  };

  // Resolve Blush asset
  const blushMap: Record<string, string> = {
    apple: '/assets/chibi/blush_apple.png',
    hearts: '/assets/chibi/blush_hearts.png',
    stripes: '/assets/chibi/blush_stripes.png',
    across: '/assets/chibi/blush_across.png',
  };

  // Resolve Lips asset
  const lipsMap: Record<string, string> = {
    smile: '/assets/chibi/lips_smile.png',
    open: '/assets/chibi/lips_open.png',
    cat: '/assets/chibi/lips_cat.png',
    pout: '/assets/chibi/lips_pout.png',
  };

  // Resolve Eyebrows asset
  const browsMap: Record<string, string> = {
    soft: '/assets/chibi/brows_soft.png',
    straight: '/assets/chibi/brows_straight.png',
    arched: '/assets/chibi/brows_arched.png',
  };

  // Resolve Headwear asset
  const headwearMap: Record<string, string> = {
    big_bow: '/assets/chibi/acc_ribbons.png',
    cat_ears: '/assets/chibi/acc_cat_ears.png',
    bear_ears: '/assets/chibi/acc_bear_ears.png',
    maid_frill: '/assets/chibi/acc_maid_frill.png',
    beret: '/assets/chibi/acc_beret.png',
    star_pins: '/assets/chibi/acc_star_pins.png',
    halo: '/assets/chibi/acc_halo.png',
  };

  // Resolve Glasses asset
  const glassesMap: Record<string, string> = {
    round_glasses: '/assets/chibi/acc_glasses.png',
    heart_sunglasses: '/assets/chibi/acc_heart_sunglasses.png',
  };

  // Resolve Handheld asset
  const handheldMap: Record<string, string> = {
    bunny_plush: '/assets/chibi/acc_bunny.png',
    boba: '/assets/chibi/hand_boba.png',
    wand: '/assets/chibi/hand_wand.png',
    camera: '/assets/chibi/hand_camera.png',
  };

  // Background style
  const getBgStyle = () => {
    switch (state.background) {
      case 'bedroom':
        return 'bg-gradient-to-b from-[#FFF0F5] to-[#FFE4E1]';
      case 'sakura':
        return 'bg-gradient-to-b from-[#E2F0D9] via-[#FFF0F5] to-[#FFDEE9]';
      case 'cafe':
        return 'bg-gradient-to-b from-[#FFF9EB] to-[#FFE5D9]';
      case 'stars':
        return 'bg-gradient-to-b from-[#1D1A31] via-[#32294A] to-[#583D72]';
      case 'photobooth':
        return 'bg-[#FDF0ED] border-8 border-dashed border-[#F8C8C0]';
      case 'transparent':
        return 'bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] bg-white';
      default:
        return 'bg-[#FFF0F5]';
    }
  };

  const backHairSrc = backHairMap[state.backHair] || backHairMap.twintails;
  const bangsSrc = bangsMap[state.bangs] || bangsMap.hime;
  const socksSrc = socksMap[state.socks];
  const shoesSrc = shoesMap[state.shoes] || shoesMap.mary_janes;
  const topSrc = topMap[state.top] || topMap.sailor;
  const bottomSrc = bottomMap[state.bottom] || bottomMap.pleated_skirt;
  const dressSrc = dressMap[state.dress] || dressMap.sailor_frill;
  const necklaceSrc = necklaceMap[state.necklace];
  const earringsSrc = earringsMap[state.earrings];
  const blushSrc = blushMap[state.blush];
  const lipsSrc = lipsMap[state.lips] || lipsMap.smile;
  const browsSrc = browsMap[state.eyebrows] || browsMap.soft;
  const headwearSrc = headwearMap[state.headwear];
  const glassesSrc = glassesMap[state.glasses];
  const handheldSrc = handheldMap[state.handheld];

  return (
    <div
      id={id}
      className={`relative overflow-hidden rounded-3xl select-none ${getBgStyle()} ${className}`}
      style={{ aspectRatio: '896/1200' }}
    >
      {/* ==================================================== */}
      {/* 1. BACKGROUND SCENE EFFECTS */}
      {/* ==================================================== */}
      {state.background === 'bedroom' && (
        <div className="absolute inset-0 pointer-events-none opacity-40">
          <div className="w-full h-full bg-[linear-gradient(to_right,#FFE4E1_1px,transparent_1px)] [background-size:24px_100%]" />
        </div>
      )}

      {state.background === 'cafe' && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="w-full h-14 bg-[repeating-linear-gradient(90deg,#FFCAD4,#FFCAD4_24px,#FFFFFF_24px,#FFFFFF_48px)] opacity-55 border-b-4 border-[#F4ACB7]" />
        </div>
      )}

      {state.background === 'stars' && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-6 right-8 text-4xl animate-pulse">🌙</div>
          <div className="absolute top-16 left-12 text-sm text-yellow-200 animate-ping">✨</div>
          <div className="absolute top-28 right-24 text-xs text-yellow-100 animate-ping delay-300">⭐</div>
          <div className="absolute top-44 left-20 text-sm text-yellow-200 animate-ping delay-700">✨</div>
        </div>
      )}

      {state.background === 'sakura' && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-4 right-10 text-3xl opacity-80 animate-bounce">🌸</div>
          <div className="absolute top-24 left-6 text-2xl opacity-70 animate-pulse">🌸</div>
          <div className="absolute top-52 right-8 text-xl opacity-60 animate-bounce delay-500">🌸</div>
        </div>
      )}

      {state.background === 'photobooth' && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-3 left-4 text-xl">🎀</div>
          <div className="absolute top-3 right-4 text-xl">💖</div>
          <div className="absolute bottom-3 left-4 text-xs font-extrabold text-[#FF4D6D] tracking-widest bg-white/80 px-2.5 py-0.5 rounded-full">
            KAWAII SNAP ★
          </div>
          <div className="absolute bottom-3 right-4 text-xl">🍓</div>
        </div>
      )}

      {/* ==================================================== */}
      {/* 2. LAYER STACK - ALL HIGH-DEF ILLUSTRATED ANIME PNGS */}
      {/* ==================================================== */}

      {/* Layer 10: Back Hair */}
      <img
        src={backHairSrc}
        alt="Back Hair"
        className="absolute inset-0 w-full h-full object-contain pointer-events-none z-10 transition-all duration-200"
        style={{ filter: hairFilter }}
      />

      {/* Layer 20: Base Doll Body (Face, Head Skin, Ears, Legs) */}
      <img
        src="/assets/chibi/body_base.png"
        alt="Doll Body"
        className="absolute inset-0 w-full h-full object-contain pointer-events-none z-20 transition-all duration-200"
        style={{ filter: skinFilter }}
      />

      {/* Layer 22: Socks */}
      {socksSrc && state.socks !== 'none' && (
        <img
          src={socksSrc}
          alt="Socks"
          className="absolute inset-0 w-full h-full object-contain pointer-events-none z-22 transition-all duration-200"
          style={{ filter: socksFilter }}
        />
      )}

      {/* Layer 25: Shoes */}
      <img
        src={shoesSrc}
        alt="Shoes"
        className="absolute inset-0 w-full h-full object-contain pointer-events-none z-25 transition-all duration-200"
        style={{ filter: shoesFilter }}
      />

      {/* Layer 28 & 30: Outfits (Split Top + Bottom OR Full Dress) */}
      {state.outfitType === 'split' ? (
        <>
          <img
            src={bottomSrc}
            alt="Bottoms"
            className="absolute inset-0 w-full h-full object-contain pointer-events-none z-28 transition-all duration-200"
            style={{ filter: bottomFilter }}
          />
          <img
            src={topSrc}
            alt="Top"
            className="absolute inset-0 w-full h-full object-contain pointer-events-none z-30 transition-all duration-200"
            style={{ filter: topFilter }}
          />
        </>
      ) : (
        <img
          src={dressSrc}
          alt="Dress"
          className="absolute inset-0 w-full h-full object-contain pointer-events-none z-30 transition-all duration-200"
          style={{ filter: dressFilter }}
        />
      )}

      {/* Layer 32: Necklace */}
      {necklaceSrc && state.necklace !== 'none' && (
        <img
          src={necklaceSrc}
          alt="Necklace"
          className="absolute inset-0 w-full h-full object-contain pointer-events-none z-32"
        />
      )}

      {/* Layer 35: Earrings */}
      {earringsSrc && state.earrings !== 'none' && (
        <img
          src={earringsSrc}
          alt="Earrings"
          className="absolute inset-0 w-full h-full object-contain pointer-events-none z-35 transition-all duration-200"
          style={{ filter: earringsFilter }}
        />
      )}

      {/* Layer 40: Blush */}
      {blushSrc && state.blush !== 'none' && (
        <img
          src={blushSrc}
          alt="Blush"
          className="absolute inset-0 w-full h-full object-contain pointer-events-none z-40 transition-all duration-200"
          style={{ filter: blushFilter }}
        />
      )}

      {/* Layer 41: Lips / Mouth */}
      <img
        src={lipsSrc}
        alt="Lips"
        className="absolute inset-0 w-full h-full object-contain pointer-events-none z-41 transition-all duration-200"
        style={{ filter: lipFilter }}
      />

      {/* Layer 42: Eyes */}
      {isBlinking || state.eyeShape === 'wink' ? (
        <img
          src="/assets/chibi/eyes_wink.png"
          alt="Eyes Wink"
          className="absolute inset-0 w-full h-full object-contain pointer-events-none z-42 transition-opacity duration-100"
          style={{ filter: eyeFilter }}
        />
      ) : state.eyeShape === 'soft' ? (
        <img
          src="/assets/chibi/eyes_smile.png"
          alt="Eyes Smile"
          className="absolute inset-0 w-full h-full object-contain pointer-events-none z-42"
        />
      ) : state.eyeShape === 'cat' ? (
        <img
          src="/assets/chibi/eyes_cat.png"
          alt="Eyes Cat"
          className="absolute inset-0 w-full h-full object-contain pointer-events-none z-42"
          style={{ filter: eyeFilter }}
        />
      ) : (
        <img
          src="/assets/chibi/eyes_sparkle.png"
          alt="Eyes Sparkle"
          className="absolute inset-0 w-full h-full object-contain pointer-events-none z-42"
          style={{ filter: eyeFilter }}
        />
      )}

      {/* Layer 44: Eyebrows */}
      <img
        src={browsSrc}
        alt="Eyebrows"
        className="absolute inset-0 w-full h-full object-contain pointer-events-none z-44 transition-all duration-200"
        style={{ filter: hairFilter }}
      />

      {/* Layer 50: Front Hair / Bangs */}
      <img
        src={bangsSrc}
        alt="Bangs"
        className="absolute inset-0 w-full h-full object-contain pointer-events-none z-50 transition-all duration-200"
        style={{ filter: hairFilter }}
      />

      {/* Layer 60: Headwear */}
      {headwearSrc && state.headwear !== 'none' && (
        <img
          src={headwearSrc}
          alt="Headwear"
          className="absolute inset-0 w-full h-full object-contain pointer-events-none z-60 transition-all duration-200"
          style={{ filter: headwearFilter }}
        />
      )}

      {/* Layer 70: Glasses */}
      {glassesSrc && state.glasses !== 'none' && (
        <img
          src={glassesSrc}
          alt="Glasses"
          className="absolute inset-0 w-full h-full object-contain pointer-events-none z-70"
        />
      )}

      {/* Layer 80: Handheld item */}
      {handheldSrc && state.handheld !== 'none' && (
        <img
          src={handheldSrc}
          alt="Handheld"
          className="absolute inset-0 w-full h-full object-contain pointer-events-none z-80"
        />
      )}

      {/* Layer 90: Foreground Floating Sparkles */}
      {state.showSparkles && (
        <div className="absolute inset-0 pointer-events-none z-90 animate-sparkle">
          <div className="absolute top-[18%] left-[10%] text-xl text-yellow-300 drop-shadow-md">✨</div>
          <div className="absolute top-[16%] right-[10%] text-xl text-yellow-300 drop-shadow-md">✨</div>
          <div className="absolute top-[48%] left-[8%] text-sm text-pink-300 drop-shadow-md">💖</div>
          <div className="absolute top-[46%] right-[8%] text-sm text-pink-300 drop-shadow-md">💖</div>
          <div className="absolute bottom-[28%] left-[14%] text-lg text-yellow-200 drop-shadow-md">⭐</div>
          <div className="absolute bottom-[26%] right-[14%] text-lg text-yellow-200 drop-shadow-md">⭐</div>
        </div>
      )}
    </div>
  );
};
