import React, { useEffect, useState } from 'react';
import { DollState } from '../types/doll';

interface DollRendererProps {
  state: DollState;
  className?: string;
  id?: string;
}

export const DollRenderer: React.FC<DollRendererProps> = ({ state, className = '', id = 'doll-canvas' }) => {
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

  // CSS Filter calculation for Hair Dye
  const getHairFilter = (colorHex: string) => {
    switch (colorHex.toUpperCase()) {
      case '#FFB7C5': // Sakura Pink (Original)
        return 'none';
      case '#F3E0BE': // Milk Tea Blonde
        return 'hue-rotate(50deg) saturate(1.4) brightness(1.08)';
      case '#FF9F1C': // Honey Ginger / Orange
        return 'hue-rotate(80deg) saturate(1.8) brightness(1.02)';
      case '#B5EAD7': // Mint Green
        return 'hue-rotate(220deg) saturate(1.3) brightness(1.05)';
      case '#A0C4FF': // Sky Blue
        return 'hue-rotate(260deg) saturate(1.5) brightness(1.05)';
      case '#CDB4DB': // Lavender Purple
        return 'hue-rotate(300deg) saturate(1.2) brightness(1.02)';
      case '#8D5B4C': // Caramel Brown
        return 'hue-rotate(60deg) saturate(0.9) brightness(0.72) contrast(1.1)';
      case '#3A2B28': // Dark Chocolate
        return 'hue-rotate(55deg) saturate(0.6) brightness(0.5) contrast(1.2)';
      case '#232025': // Raven Black
        return 'grayscale(1) brightness(0.38) contrast(1.3)';
      case '#E8E8EE': // Silver Moon White
        return 'grayscale(1) brightness(1.15) contrast(1.05)';
      case '#9E2A2B': // Wine Ruby Red
        return 'hue-rotate(15deg) saturate(2.0) brightness(0.7)';
      default:
        return 'none';
    }
  };

  // CSS Filter calculation for Eye Contacts Color
  const getEyeFilter = (colorHex: string) => {
    switch (colorHex.toUpperCase()) {
      case '#3A506B': // Deep Blue
        return 'hue-rotate(210deg) saturate(1.4)';
      case '#7209B7': // Amethyst Violet (Original)
        return 'none';
      case '#8A5A36': // Amber Brown
        return 'hue-rotate(80deg) saturate(1.3) brightness(0.85)';
      case '#2D6A4F': // Emerald Green
        return 'hue-rotate(160deg) saturate(1.5)';
      case '#E63946': // Ruby Red
        return 'hue-rotate(320deg) saturate(1.8)';
      case '#4EA8DE': // Sky Aqua
        return 'hue-rotate(230deg) saturate(1.6) brightness(1.1)';
      case '#2B2D42': // Obsidian Dark
        return 'grayscale(1) brightness(0.4)';
      case '#F4A261': // Golden Yellow
        return 'hue-rotate(95deg) saturate(2.0) brightness(1.1)';
      default:
        return 'none';
    }
  };

  const hairFilter = getHairFilter(state.hairColor);
  const eyeFilter = getEyeFilter(state.eyeColor);

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

      {/* ==================================================== */}
      {/* 2. LAYER STACK - ALL HIGH-DEF ILLUSTRATED ANIME PNGS */}
      {/* ==================================================== */}

      {/* Layer 10: Back Hair (Twintails / Long Wave) */}
      {state.backHair === 'twintails' && (
        <img
          src="/assets/chibi/hair_twintails.png"
          alt="Back Hair"
          className="absolute inset-0 w-full h-full object-contain pointer-events-none z-10 transition-all duration-200"
          style={{ filter: hairFilter }}
        />
      )}
      {state.backHair === 'long_wave' && (
        <img
          src="/assets/chibi/hair_long_wave.png"
          alt="Back Hair Long"
          className="absolute inset-0 w-full h-full object-contain pointer-events-none z-10 transition-all duration-200"
          style={{ filter: hairFilter }}
        />
      )}

      {/* Layer 20: Base Doll Body (Face, Head Skin, Ears, Legs) */}
      <img
        src="/assets/chibi/body_base.png"
        alt="Doll Body"
        className="absolute inset-0 w-full h-full object-contain pointer-events-none z-20"
      />

      {/* Layer 25: Shoes & Socks */}
      {state.shoes === 'mary_janes' && (
        <img
          src="/assets/chibi/shoes_mary_janes.png"
          alt="Shoes"
          className="absolute inset-0 w-full h-full object-contain pointer-events-none z-25"
        />
      )}
      {state.shoes === 'chunky_loafers' && (
        <img
          src="/assets/chibi/shoes_black_loafers.png"
          alt="Shoes Loafers"
          className="absolute inset-0 w-full h-full object-contain pointer-events-none z-25"
        />
      )}
      {state.shoes === 'sneakers' && (
        <img
          src="/assets/chibi/shoes_strawberry.png"
          alt="Shoes Sneakers"
          className="absolute inset-0 w-full h-full object-contain pointer-events-none z-25"
        />
      )}

      {/* Layer 30: Dresses / Outfits */}
      {(state.dress === 'maid_dress' || (state.outfitType === 'dress' && state.dress === 'maid')) && (
        <img
          src="/assets/chibi/dress_maid.png"
          alt="Dress Maid"
          className="absolute inset-0 w-full h-full object-contain pointer-events-none z-30"
        />
      )}
      {(state.dress === 'strawberry_sundress' || state.dress === 'strawberry') && (
        <img
          src="/assets/chibi/dress_strawberry.png"
          alt="Dress Strawberry"
          className="absolute inset-0 w-full h-full object-contain pointer-events-none z-30"
        />
      )}
      {(state.dress === 'gothic_dress' || state.dress === 'gothic') && (
        <img
          src="/assets/chibi/dress_gothic.png"
          alt="Dress Gothic"
          className="absolute inset-0 w-full h-full object-contain pointer-events-none z-30"
        />
      )}
      {(state.dress === 'cozy_sweater' || state.top === 'sweater') && (
        <img
          src="/assets/chibi/dress_cozy_sweater.png"
          alt="Dress Sweater"
          className="absolute inset-0 w-full h-full object-contain pointer-events-none z-30"
        />
      )}
      {/* Default Sailor Frill Dress */}
      {(state.dress === 'sailor_frill' || state.dress === 'none' || state.top === 'sailor' || (!['maid_dress', 'maid', 'strawberry_sundress', 'strawberry', 'gothic_dress', 'gothic', 'cozy_sweater', 'sweater'].includes(state.dress) && !['sweater'].includes(state.top))) && (
        <img
          src="/assets/chibi/dress_sailor_frill.png"
          alt="Dress Sailor"
          className="absolute inset-0 w-full h-full object-contain pointer-events-none z-30"
        />
      )}

      {/* Layer 35: Earrings */}
      {state.earrings !== 'none' && (
        <img
          src="/assets/chibi/acc_earrings_star.png"
          alt="Earrings"
          className="absolute inset-0 w-full h-full object-contain pointer-events-none z-35"
        />
      )}

      {/* Layer 40: Facial Expressions & Dynamic Eyes/Blush Overlay */}
      {isBlinking || state.eyeShape === 'wink' ? (
        <img
          src="/assets/chibi/eyes_wink.png"
          alt="Eyes Wink"
          className="absolute inset-0 w-full h-full object-contain pointer-events-none z-40 transition-opacity duration-100"
          style={{ filter: eyeFilter }}
        />
      ) : state.eyeShape === 'soft' ? (
        <img
          src="/assets/chibi/eyes_smile.png"
          alt="Eyes Smile"
          className="absolute inset-0 w-full h-full object-contain pointer-events-none z-40"
        />
      ) : (
        /* Dynamic Star Eyes with Eye Color Filter */
        <img
          src="/assets/chibi/eyes_sparkle.png"
          alt="Eyes Sparkle"
          className="absolute inset-0 w-full h-full object-contain pointer-events-none z-40"
          style={{ filter: eyeFilter }}
        />
      )}

      {/* Heart Blush overlay */}
      {state.blush === 'hearts' && (
        <img
          src="/assets/chibi/blush_hearts.png"
          alt="Heart Blush"
          className="absolute inset-0 w-full h-full object-contain pointer-events-none z-42"
        />
      )}

      {/* Layer 50: Front Hair / Bangs (Frames Face) */}
      <img
        src="/assets/chibi/hair_bangs.png"
        alt="Bangs"
        className="absolute inset-0 w-full h-full object-contain pointer-events-none z-50 transition-all duration-200"
        style={{ filter: hairFilter }}
      />

      {/* Layer 60: Headwear / Ribbons */}
      {state.headwear === 'big_bow' && (
        <img
          src="/assets/chibi/acc_ribbons.png"
          alt="Head Bows"
          className="absolute inset-0 w-full h-full object-contain pointer-events-none z-60"
        />
      )}
      {state.headwear === 'cat_ears' && (
        <img
          src="/assets/chibi/acc_cat_ears.png"
          alt="Cat Ears"
          className="absolute inset-0 w-full h-full object-contain pointer-events-none z-60"
        />
      )}
      {state.headwear === 'beret' && (
        <img
          src="/assets/chibi/acc_beret.png"
          alt="Beret"
          className="absolute inset-0 w-full h-full object-contain pointer-events-none z-60"
        />
      )}

      {/* Layer 70: Glasses */}
      {state.glasses === 'round_glasses' && (
        <img
          src="/assets/chibi/acc_glasses.png"
          alt="Glasses"
          className="absolute inset-0 w-full h-full object-contain pointer-events-none z-70"
        />
      )}

      {/* Layer 80: Handheld item (Bunny plush) */}
      {state.handheld === 'bunny_plush' && (
        <img
          src="/assets/chibi/acc_bunny.png"
          alt="Bunny Plushie"
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
