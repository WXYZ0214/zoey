import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  RotateCcw,
  Camera,
  Volume2,
  VolumeX,
  Share2,
  Check,
} from 'lucide-react';
import { sound } from '../utils/audio';
import {
  SKIN_PALETTES,
  HAIR_PALETTES,
  EYE_PALETTES,
  LIP_PALETTES,
  BLUSH_PALETTES,
  CLOTHING_PALETTES,
  DEFAULT_DOLL_STATE,
} from '../data/items';
import { DollState } from '../types/doll';

interface ActionControlsProps {
  state: DollState;
  onUpdateState: (newState: DollState) => void;
}

export const ActionControls: React.FC<ActionControlsProps> = ({
  state,
  onUpdateState,
}) => {
  const [soundOn, setSoundOn] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [copied, setCopied] = useState(false);

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    sound.setEnabled(next);
    if (next) sound.playPop();
  };

  // Random Blind Box Dress-up
  const handleRandomize = () => {
    sound.playMagic();
    confetti({
      particleCount: 45,
      spread: 60,
      origin: { y: 0.65 },
      colors: ['#FFB7C5', '#FF758F', '#FFE082', '#A0C4FF', '#B5EAD7'],
    });

    const rand = <T,>(arr: readonly T[] | T[]): T => arr[Math.floor(Math.random() * arr.length)];

    const bangsList = ['hime', 'airy', 'side', 'bob', 'center'];
    const backHairList = ['twintails', 'long_wave', 'short_bob', 'high_pony', 'space_buns', 'straight_long'];
    const topsList = ['sailor', 'off_shoulder', 'sweater', 'crop_hoodie', 'cardigan'];
    const bottomsList = ['pleated_skirt', 'ruffle_skirt', 'denim_shorts', 'cargo_pants', 'plaid_skirt'];
    const dressesList = ['maid_dress', 'strawberry_sundress', 'gothic_dress', 'yukata'];
    const socksList = ['frill_ankle', 'knee_high', 'thigh_high', 'star_tights', 'none'];
    const shoesList = ['mary_janes', 'chunky_loafers', 'sneakers', 'bear_slippers', 'boots'];
    const earringsList = ['star', 'pearl', 'strawberry', 'hoop', 'heart', 'cross', 'none'];
    const headwearList = ['big_bow', 'cat_ears', 'bear_ears', 'maid_frill', 'beret', 'star_pins', 'halo', 'none'];
    const glassesList = ['round_glasses', 'heart_sunglasses', 'none', 'none'];
    const necklacesList = ['choker', 'pearl', 'star_pendant', 'none'];
    const handheldList = ['bunny_plush', 'boba', 'wand', 'camera', 'none'];
    const bgList = ['bedroom', 'sakura', 'cafe', 'stars', 'photobooth'];
    const lipsList = ['smile', 'open', 'cat', 'pout'];
    const blushList = ['apple', 'hearts', 'stripes', 'across'];

    const isDress = Math.random() > 0.6;

    const randomState: DollState = {
      ...state,
      skinColor: rand(SKIN_PALETTES).value,
      hairColor: rand(HAIR_PALETTES).value,
      eyeColor: rand(EYE_PALETTES).value,
      lipColor: rand(LIP_PALETTES).value,
      blushColor: rand(BLUSH_PALETTES).value,
      topColor: rand(CLOTHING_PALETTES).value,
      bottomColor: rand(CLOTHING_PALETTES).value,
      dressColor: rand(CLOTHING_PALETTES).value,
      shoesColor: rand(CLOTHING_PALETTES).value,
      headwearColor: rand(CLOTHING_PALETTES).value,
      earringsColor: rand(['#FFD166', '#E8E8EE', '#F4A261', '#FF4D6D', '#222222']),

      bangs: rand(bangsList),
      backHair: rand(backHairList),
      outfitType: isDress ? 'dress' : 'split',
      top: rand(topsList),
      bottom: rand(bottomsList),
      dress: rand(dressesList),
      socks: rand(socksList),
      shoes: rand(shoesList),
      earrings: rand(earringsList),
      headwear: rand(headwearList),
      glasses: rand(glassesList),
      necklace: rand(necklacesList),
      handheld: rand(handheldList),
      background: rand(bgList),
      lips: rand(lipsList),
      blush: rand(blushList),
    };

    onUpdateState(randomState);
  };

  // Reset to default
  const handleReset = () => {
    sound.playReset();
    onUpdateState(DEFAULT_DOLL_STATE);
  };

  // HD PNG Export
  const handleSnapshot = async () => {
    try {
      setIsExporting(true);
      sound.playCamera();

      // Trigger festive confetti
      confetti({
        particleCount: 80,
        spread: 90,
        origin: { y: 0.5 },
      });

      const container = document.getElementById('doll-canvas');
      if (!container) {
        setIsExporting(false);
        return;
      }

      const { toPng } = await import('html-to-image');
      const dataUrl = await toPng(container, {
        pixelRatio: 2,
        quality: 1.0,
      });

      const downloadLink = document.createElement('a');
      downloadLink.href = dataUrl;
      downloadLink.download = `chibi-kawaii-doll-${Date.now()}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      setIsExporting(false);
    } catch (err) {
      console.error(err);
      setIsExporting(false);
    }
  };

  // Copy shareable state to clipboard
  const handleShare = () => {
    sound.playPop();
    const json = JSON.stringify(state);
    navigator.clipboard.writeText(json);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 bg-white/80 backdrop-blur-md p-3 rounded-3xl border border-[#FFCCD5]/70 shadow-sm">
      <div className="flex items-center gap-2">
        {/* Surprise Blind Box */}
        <button
          onClick={handleRandomize}
          className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-gradient-to-r from-[#FF9AA2] to-[#FF758F] text-white font-bold text-xs shadow-sm hover:opacity-95 hover:scale-105 active:scale-95 transition cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          <span>驚喜盲盒穿搭</span>
        </button>

        {/* Reset */}
        <button
          onClick={handleReset}
          title="重設角色外觀"
          className="p-2 rounded-2xl bg-white hover:bg-[#FFF0F3] text-[#72525A] hover:text-[#FF4D6D] border border-[#FFCCD5]/50 transition cursor-pointer shadow-2xs"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Sound Toggle */}
        <button
          onClick={toggleSound}
          title={soundOn ? '關閉音效' : '開啟音效'}
          className={`p-2 rounded-2xl border transition cursor-pointer shadow-2xs ${
            soundOn
              ? 'bg-[#FFF0F3] text-[#FF4D6D] border-[#FFCCD5]'
              : 'bg-white text-gray-400 border-gray-200'
          }`}
        >
          {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>
      </div>

      <div className="flex items-center gap-2">
        {/* Share code */}
        <button
          onClick={handleShare}
          title="複製搭配代碼"
          className="flex items-center gap-1 px-3 py-2 rounded-2xl bg-white hover:bg-[#FFF0F3] text-[#72525A] border border-[#FFCCD5]/50 text-xs font-bold transition cursor-pointer shadow-2xs"
        >
          {copied ? <Check className="w-4 h-4 text-green-500" /> : <Share2 className="w-4 h-4" />}
          <span>{copied ? '已複製！' : '分享搭配'}</span>
        </button>

        {/* HD Photo Export */}
        <button
          onClick={handleSnapshot}
          disabled={isExporting}
          className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-gradient-to-r from-[#FF4D6D] to-[#E63946] text-white font-bold text-xs shadow-md hover:scale-105 active:scale-95 transition cursor-pointer disabled:opacity-50"
        >
          <Camera className="w-4 h-4" />
          <span>{isExporting ? '生成相片中...' : '拍照存檔 (HD)'}</span>
        </button>
      </div>
    </div>
  );
};
