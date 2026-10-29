import React, { useState, useEffect } from 'react';
import { CategoryType, DollState } from '../types/doll';
import {
  SKIN_PALETTES,
  HAIR_PALETTES,
  EYE_PALETTES,
  LIP_PALETTES,
  BLUSH_PALETTES,
  CLOTHING_PALETTES,
} from '../data/items';
import { ColorSwatchPicker } from './ColorSwatchPicker';
import { sound } from '../utils/audio';

interface ItemSelectorPanelProps {
  category: CategoryType;
  state: DollState;
  onChange: (updates: Partial<DollState>) => void;
}

export const ItemSelectorPanel: React.FC<ItemSelectorPanelProps> = ({
  category,
  state,
  onChange,
}) => {
  const [subTab, setSubTab] = useState<string>('default');

  useEffect(() => {
    setSubTab('default');
  }, [category]);

  const update = (patch: Partial<DollState>) => {
    sound.playPop();
    onChange(patch);
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto pr-1">
      {/* ==================================================== */}
      {/* 1. MAKEUP CATEGORY */}
      {/* ==================================================== */}
      {category === 'makeup' && (
        <div className="space-y-4">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: 'skin', label: '膚色' },
              { id: 'eyes', label: '眼型與瞳色' },
              { id: 'brows', label: '眉毛' },
              { id: 'blush', label: '腮紅' },
              { id: 'lips', label: '嘴型與唇彩' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  sound.playClick();
                  setSubTab(tab.id);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  (subTab === tab.id || (subTab === 'default' && tab.id === 'skin'))
                    ? 'bg-[#FF4D6D] text-white shadow-xs'
                    : 'bg-white/70 text-[#72525A] hover:bg-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {(subTab === 'skin' || subTab === 'default') && (
            <ColorSwatchPicker
              label="角色膚色"
              currentColor={state.skinColor}
              palettes={SKIN_PALETTES}
              onChangeColor={(color) => update({ skinColor: color })}
            />
          )}

          {subTab === 'eyes' && (
            <div>
              <ColorSwatchPicker
                label="瞳孔與虹膜顏色"
                currentColor={state.eyeColor}
                palettes={EYE_PALETTES}
                onChangeColor={(color) => update({ eyeColor: color })}
              />

              <div className="text-xs font-bold text-[#72525A] mb-2 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#FF758F]" />
                眼型樣式
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'sparkle', name: '水汪汪星眸', icon: '✨👀' },
                  { id: 'soft', name: '溫柔笑瞇眼', icon: '😊' },
                  { id: 'cat', name: '傲嬌貓咪眼', icon: '😼' },
                  { id: 'wink', name: '俏皮單眼眨', icon: '😉' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => update({ eyeShape: item.id })}
                    className={`p-3 rounded-2xl border text-center transition cursor-pointer ${
                      state.eyeShape === item.id
                        ? 'border-[#FF4D6D] bg-[#FFF0F3] text-[#FF4D6D] font-bold shadow-xs'
                        : 'border-[#FFCCD5]/50 bg-white/70 hover:bg-white text-[#72525A]'
                    }`}
                  >
                    <div className="text-2xl mb-1">{item.icon}</div>
                    <div className="text-xs">{item.name}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {subTab === 'brows' && (
            <div className="space-y-2">
              <div className="text-xs font-bold text-[#72525A] mb-2 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#FF758F]" />
                眉毛樣式
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'soft', name: '溫柔自然眉' },
                  { id: 'straight', name: '韓系一字眉' },
                  { id: 'arched', name: '俏皮弧度眉' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => update({ eyebrows: item.id })}
                    className={`p-3 rounded-2xl border text-center transition cursor-pointer text-xs ${
                      state.eyebrows === item.id
                        ? 'border-[#FF4D6D] bg-[#FFF0F3] text-[#FF4D6D] font-bold shadow-xs'
                        : 'border-[#FFCCD5]/50 bg-white/70 hover:bg-white text-[#72525A]'
                    }`}
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {subTab === 'blush' && (
            <div>
              <ColorSwatchPicker
                label="腮紅色調"
                currentColor={state.blushColor}
                palettes={BLUSH_PALETTES}
                onChangeColor={(color) => update({ blushColor: color })}
              />

              <div className="text-xs font-bold text-[#72525A] mb-2 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#FF758F]" />
                腮紅樣式
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'apple', name: '圓圓蘋果肌', icon: '🍎' },
                  { id: 'hearts', name: '軟萌雙愛心', icon: '💖' },
                  { id: 'stripes', name: '動漫害羞斜線', icon: '///' },
                  { id: 'across', name: '微醺曬傷鼻橋', icon: '🍷' },
                  { id: 'none', name: '無腮紅', icon: '❌' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => update({ blush: item.id })}
                    className={`p-3 rounded-2xl border text-center transition cursor-pointer ${
                      state.blush === item.id
                        ? 'border-[#FF4D6D] bg-[#FFF0F3] text-[#FF4D6D] font-bold shadow-xs'
                        : 'border-[#FFCCD5]/50 bg-white/70 hover:bg-white text-[#72525A]'
                    }`}
                  >
                    <div className="text-2xl mb-1">{item.icon}</div>
                    <div className="text-xs">{item.name}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {subTab === 'lips' && (
            <div>
              <ColorSwatchPicker
                label="唇膏唇彩顏色"
                currentColor={state.lipColor}
                palettes={LIP_PALETTES}
                onChangeColor={(color) => update({ lipColor: color })}
              />

              <div className="text-xs font-bold text-[#72525A] mb-2 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#FF758F]" />
                嘴型表情
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'smile', name: '淺淺微笑', icon: '☺️' },
                  { id: 'open', name: '開朗燦笑', icon: '😄' },
                  { id: 'cat', name: '貓咪嘴 :3', icon: '😽' },
                  { id: 'pout', name: '嘟嘟嘴啾', icon: '😚' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => update({ lips: item.id })}
                    className={`p-3 rounded-2xl border text-center transition cursor-pointer ${
                      state.lips === item.id
                        ? 'border-[#FF4D6D] bg-[#FFF0F3] text-[#FF4D6D] font-bold shadow-xs'
                        : 'border-[#FFCCD5]/50 bg-white/70 hover:bg-white text-[#72525A]'
                    }`}
                  >
                    <div className="text-2xl mb-1">{item.icon}</div>
                    <div className="text-xs">{item.name}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================================================== */}
      {/* 2. HAIR CATEGORY */}
      {/* ==================================================== */}
      {category === 'hair' && (
        <div className="space-y-4">
          <ColorSwatchPicker
            label="自訂秀髮髮色"
            currentColor={state.hairColor}
            palettes={HAIR_PALETTES}
            onChangeColor={(color) => update({ hairColor: color })}
          />

          <div>
            <div className="text-xs font-bold text-[#72525A] mb-2 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#FF758F]" />
              前髮 / 瀏海
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'hime', name: '日系姬髮平瀏海' },
                { id: 'airy', name: '空氣感透氣瀏海' },
                { id: 'side', name: '側分斜瀏海' },
                { id: 'bob', name: '內彎妹妹頭' },
                { id: 'center', name: '氣質中分波浪' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => update({ bangs: item.id })}
                  className={`p-2.5 rounded-2xl border text-center transition cursor-pointer text-xs ${
                    state.bangs === item.id
                      ? 'border-[#FF4D6D] bg-[#FFF0F3] text-[#FF4D6D] font-bold shadow-xs'
                      : 'border-[#FFCCD5]/50 bg-white/70 hover:bg-white text-[#72525A]'
                  }`}
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="text-xs font-bold text-[#72525A] mb-2 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#FF758F]" />
              後髮造型
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'twintails', name: '萌系雙馬尾', icon: '👧' },
                { id: 'long_wave', name: '浪漫微捲長髮', icon: '👩‍🦱' },
                { id: 'short_bob', name: '俏麗波波短髮', icon: '👱‍♀️' },
                { id: 'high_pony', name: '元氣高單馬尾', icon: '🐴' },
                { id: 'space_buns', name: '雙球丸子頭', icon: '🥟' },
                { id: 'straight_long', name: '垂直黑長直髮', icon: '🧝‍♀️' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => update({ backHair: item.id })}
                  className={`p-3 rounded-2xl border text-center transition cursor-pointer ${
                    state.backHair === item.id
                      ? 'border-[#FF4D6D] bg-[#FFF0F3] text-[#FF4D6D] font-bold shadow-xs'
                      : 'border-[#FFCCD5]/50 bg-white/70 hover:bg-white text-[#72525A]'
                  }`}
                >
                  <div className="text-2xl mb-1">{item.icon}</div>
                  <div className="text-xs">{item.name}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* 3. CLOTHES & DRESS CATEGORY */}
      {/* ==================================================== */}
      {category === 'clothes' && (
        <div className="space-y-4">
          {/* Mode Switch: Split or Full Dress */}
          <div className="bg-[#FFE5EC] p-1 rounded-2xl flex gap-1">
            <button
              onClick={() => update({ outfitType: 'split' })}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                state.outfitType === 'split'
                  ? 'bg-white text-[#FF4D6D] shadow-xs'
                  : 'text-[#8E636F]'
              }`}
            >
              👚 上衣短裙分開搭配
            </button>
            <button
              onClick={() => {
                update({
                  outfitType: 'dress',
                  dress: state.dress === 'none' ? 'sailor_frill' : state.dress,
                });
              }}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                state.outfitType === 'dress'
                  ? 'bg-white text-[#FF4D6D] shadow-xs'
                  : 'text-[#8E636F]'
              }`}
            >
              👗 連身洋裝套裝
            </button>
          </div>

          {state.outfitType === 'split' ? (
            <div>
              <ColorSwatchPicker
                label="上衣色系"
                currentColor={state.topColor}
                palettes={CLOTHING_PALETTES}
                onChangeColor={(color) => update({ topColor: color })}
              />

              <div className="text-xs font-bold text-[#72525A] mb-2 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#FF758F]" />
                上衣款式
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'sailor', name: '水手制服領衫', icon: '⚓' },
                  { id: 'off_shoulder', name: '一字領荷葉露肩', icon: '🌸' },
                  { id: 'sweater', name: '軟萌麻花粗針織', icon: '🧶' },
                  { id: 'crop_hoodie', name: '潮流短版連帽衫', icon: '🧢' },
                  { id: 'cardigan', name: '溫柔排扣小外套', icon: '🥼' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => update({ top: item.id })}
                    className={`p-3 rounded-2xl border text-center transition cursor-pointer ${
                      state.top === item.id
                        ? 'border-[#FF4D6D] bg-[#FFF0F3] text-[#FF4D6D] font-bold shadow-xs'
                        : 'border-[#FFCCD5]/50 bg-white/70 hover:bg-white text-[#72525A]'
                    }`}
                  >
                    <div className="text-2xl mb-1">{item.icon}</div>
                    <div className="text-xs">{item.name}</div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <ColorSwatchPicker
                label="洋裝套裝顏色"
                currentColor={state.dressColor}
                palettes={CLOTHING_PALETTES}
                onChangeColor={(color) => update({ dressColor: color })}
              />

              <div className="text-xs font-bold text-[#72525A] mb-2 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#FF758F]" />
                連身洋裝
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'sailor_frill', name: '夢幻水手荷葉洋裝', icon: '⚓' },
                  { id: 'maid_dress', name: '蕾絲圍裙女僕裝', icon: '🎀' },
                  { id: 'strawberry_sundress', name: '田園草莓泡泡洋裝', icon: '🍓' },
                  { id: 'gothic_dress', name: '古典哥德束腰長裙', icon: '🥀' },
                  { id: 'yukata', name: '櫻花祭典和風浴衣', icon: '👘' },
                  { id: 'cozy_sweater', name: '慵懶兔兔長版毛衣', icon: '🧶' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => update({ dress: item.id })}
                    className={`p-3 rounded-2xl border text-center transition cursor-pointer ${
                      state.dress === item.id
                        ? 'border-[#FF4D6D] bg-[#FFF0F3] text-[#FF4D6D] font-bold shadow-xs'
                        : 'border-[#FFCCD5]/50 bg-white/70 hover:bg-white text-[#72525A]'
                    }`}
                  >
                    <div className="text-2xl mb-1">{item.icon}</div>
                    <div className="text-xs">{item.name}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================================================== */}
      {/* 4. BOTTOMS CATEGORY */}
      {/* ==================================================== */}
      {category === 'bottoms' && (
        <div className="space-y-4">
          {state.outfitType === 'dress' && (
            <div className="bg-[#FFF4E5] p-3 rounded-2xl text-xs text-[#B76E00] border border-[#FFE2B3]">
              💡 目前穿著「連身洋裝」，若要穿裙子/褲子，將自動切換為分開穿搭模式。
            </div>
          )}

          <ColorSwatchPicker
            label="裙子/褲子色系"
            currentColor={state.bottomColor}
            palettes={CLOTHING_PALETTES}
            onChangeColor={(color) => update({ bottomColor: color })}
          />

          <div className="text-xs font-bold text-[#72525A] mb-2 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#FF758F]" />
            裙裝 / 褲裝款式
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'pleated_skirt', name: '經典學院百褶裙', icon: '👗' },
              { id: 'ruffle_skirt', name: '雙層荷葉蛋糕裙', icon: '🧁' },
              { id: 'denim_shorts', name: '俏麗反折牛仔短褲', icon: '🩳' },
              { id: 'cargo_pants', name: '粉彩街頭工裝長褲', icon: '👖' },
              { id: 'plaid_skirt', name: '英倫格紋百褶裙', icon: '🪄' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => update({ outfitType: 'split', bottom: item.id })}
                className={`p-3 rounded-2xl border text-center transition cursor-pointer ${
                  state.outfitType === 'split' && state.bottom === item.id
                    ? 'border-[#FF4D6D] bg-[#FFF0F3] text-[#FF4D6D] font-bold shadow-xs'
                    : 'border-[#FFCCD5]/50 bg-white/70 hover:bg-white text-[#72525A]'
                }`}
              >
                <div className="text-2xl mb-1">{item.icon}</div>
                <div className="text-xs">{item.name}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* 5. SHOES & SOCKS CATEGORY */}
      {/* ==================================================== */}
      {category === 'shoes' && (
        <div className="space-y-4">
          <ColorSwatchPicker
            label="鞋子色系"
            currentColor={state.shoesColor}
            palettes={CLOTHING_PALETTES}
            onChangeColor={(color) => update({ shoesColor: color })}
          />

          <div>
            <div className="text-xs font-bold text-[#72525A] mb-2 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#FF758F]" />
              鞋子款式
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'mary_janes', name: '亮面瑪莉珍鞋', icon: '👞' },
                { id: 'chunky_loafers', name: '古典黑色樂福鞋', icon: '🥾' },
                { id: 'sneakers', name: '粉彩厚底運動球鞋', icon: '👟' },
                { id: 'bear_slippers', name: '和風木屐 / 舒適拖鞋', icon: '🩴' },
                { id: 'boots', name: '維多利亞繫帶短靴', icon: '👢' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => update({ shoes: item.id })}
                  className={`p-3 rounded-2xl border text-center transition cursor-pointer ${
                    state.shoes === item.id
                      ? 'border-[#FF4D6D] bg-[#FFF0F3] text-[#FF4D6D] font-bold shadow-xs'
                      : 'border-[#FFCCD5]/50 bg-white/70 hover:bg-white text-[#72525A]'
                  }`}
                >
                  <div className="text-2xl mb-1">{item.icon}</div>
                  <div className="text-xs">{item.name}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <ColorSwatchPicker
              label="襪子色系"
              currentColor={state.socksColor}
              palettes={CLOTHING_PALETTES}
              onChangeColor={(color) => update({ socksColor: color })}
            />

            <div className="text-xs font-bold text-[#72525A] mb-2 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#FF758F]" />
              襪子搭配
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'frill_ankle', name: '蕾絲花邊短襪', icon: '🧦' },
                { id: 'knee_high', name: '運動及膝條紋襪', icon: '✨' },
                { id: 'thigh_high', name: '經典過膝長筒襪', icon: '💫' },
                { id: 'star_tights', name: '星芒透膚絲襪', icon: '⭐' },
                { id: 'none', name: '裸足 / 不穿襪', icon: '❌' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => update({ socks: item.id })}
                  className={`p-2.5 rounded-2xl border text-center transition cursor-pointer ${
                    state.socks === item.id
                      ? 'border-[#FF4D6D] bg-[#FFF0F3] text-[#FF4D6D] font-bold shadow-xs'
                      : 'border-[#FFCCD5]/50 bg-white/70 hover:bg-white text-[#72525A]'
                  }`}
                >
                  <div className="text-xl mb-0.5">{item.icon}</div>
                  <div className="text-xs">{item.name}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* 6. EARRINGS CATEGORY */}
      {/* ==================================================== */}
      {category === 'earrings' && (
        <div className="space-y-4">
          <ColorSwatchPicker
            label="耳飾金屬/珠寶顏色"
            currentColor={state.earringsColor}
            palettes={[
              { name: '璀璨金黃', value: '#FFD166' },
              { name: '月光銀白', value: '#E8E8EE' },
              { name: '玫瑰亮金', value: '#F4A261' },
              { name: '甜心玫粉', value: '#FF4D6D' },
              { name: '冷酷黑曜', value: '#222222' },
            ]}
            onChangeColor={(color) => update({ earringsColor: color })}
          />

          <div className="text-xs font-bold text-[#72525A] mb-2 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#FF758F]" />
            耳環樣式
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'star', name: '璀璨星芒垂墜', icon: '⭐' },
              { id: 'pearl', name: '溫潤珍珠耳墜', icon: '⚪' },
              { id: 'strawberry', name: '甜滋滋小草莓', icon: '🍓' },
              { id: 'hoop', name: '時尚金屬大圈圈', icon: '⭕' },
              { id: 'heart', name: '愛心寶石耳釘', icon: '💖' },
              { id: 'cross', name: '哥德十字吊飾', icon: '✝️' },
              { id: 'none', name: '不戴耳環', icon: '❌' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => update({ earrings: item.id })}
                className={`p-3 rounded-2xl border text-center transition cursor-pointer ${
                  state.earrings === item.id
                    ? 'border-[#FF4D6D] bg-[#FFF0F3] text-[#FF4D6D] font-bold shadow-xs'
                    : 'border-[#FFCCD5]/50 bg-white/70 hover:bg-white text-[#72525A]'
                }`}
              >
                <div className="text-2xl mb-1">{item.icon}</div>
                <div className="text-xs">{item.name}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* 7. ACCESSORIES CATEGORY */}
      {/* ==================================================== */}
      {category === 'accessories' && (
        <div className="space-y-4">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: 'head', label: '頭飾髮夾' },
              { id: 'face', label: '眼鏡面飾' },
              { id: 'neck', label: '項鍊頸飾' },
              { id: 'hand', label: '手持物/抱偶' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  sound.playClick();
                  setSubTab(tab.id);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  (subTab === tab.id || (subTab === 'default' && tab.id === 'head'))
                    ? 'bg-[#FF4D6D] text-white shadow-xs'
                    : 'bg-white/70 text-[#72525A] hover:bg-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {(subTab === 'head' || subTab === 'default') && (
            <div>
              <ColorSwatchPicker
                label="頭飾主色"
                currentColor={state.headwearColor}
                palettes={CLOTHING_PALETTES}
                onChangeColor={(color) => update({ headwearColor: color })}
              />

              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'big_bow', name: '軟萌大蝴蝶結', icon: '🎀' },
                  { id: 'cat_ears', name: '毛絨貓耳髮箍', icon: '🐱' },
                  { id: 'bear_ears', name: '圓滾小熊耳朵', icon: '🐻' },
                  { id: 'maid_frill', name: '荷葉女僕頭巾', icon: '🤍' },
                  { id: 'beret', name: '文藝毛呢貝雷帽', icon: '🎨' },
                  { id: 'star_pins', name: '星星彩色髮夾組', icon: '⭐' },
                  { id: 'halo', name: '發光天使光環', icon: '😇' },
                  { id: 'none', name: '不戴頭飾', icon: '❌' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => update({ headwear: item.id })}
                    className={`p-3 rounded-2xl border text-center transition cursor-pointer ${
                      state.headwear === item.id
                        ? 'border-[#FF4D6D] bg-[#FFF0F3] text-[#FF4D6D] font-bold shadow-xs'
                        : 'border-[#FFCCD5]/50 bg-white/70 hover:bg-white text-[#72525A]'
                    }`}
                  >
                    <div className="text-2xl mb-1">{item.icon}</div>
                    <div className="text-xs">{item.name}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {subTab === 'face' && (
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'round_glasses', name: '復古金絲圓框眼鏡', icon: '👓' },
                { id: 'heart_sunglasses', name: '千禧粉紅愛心墨鏡', icon: '🕶️' },
                { id: 'none', name: '不戴眼鏡', icon: '❌' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => update({ glasses: item.id })}
                  className={`p-3 rounded-2xl border text-center transition cursor-pointer ${
                    state.glasses === item.id
                      ? 'border-[#FF4D6D] bg-[#FFF0F3] text-[#FF4D6D] font-bold shadow-xs'
                      : 'border-[#FFCCD5]/50 bg-white/70 hover:bg-white text-[#72525A]'
                  }`}
                >
                  <div className="text-2xl mb-1">{item.icon}</div>
                  <div className="text-xs">{item.name}</div>
                </button>
              ))}
            </div>
          )}

          {subTab === 'neck' && (
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'choker', name: '愛心寶石黑絲絨頸圈', icon: '🖤' },
                { id: 'pearl', name: '典雅單串珍珠項鍊', icon: '⚪' },
                { id: 'star_pendant', name: '金燦星芒細吊墜', icon: '🌟' },
                { id: 'none', name: '不戴項鍊', icon: '❌' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => update({ necklace: item.id })}
                  className={`p-3 rounded-2xl border text-center transition cursor-pointer ${
                    state.necklace === item.id
                      ? 'border-[#FF4D6D] bg-[#FFF0F3] text-[#FF4D6D] font-bold shadow-xs'
                      : 'border-[#FFCCD5]/50 bg-white/70 hover:bg-white text-[#72525A]'
                  }`}
                >
                  <div className="text-2xl mb-1">{item.icon}</div>
                  <div className="text-xs">{item.name}</div>
                </button>
              ))}
            </div>
          )}

          {subTab === 'hand' && (
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'bunny_plush', name: '軟萌兔兔布偶', icon: '🐰' },
                { id: 'boba', name: '黑糖珍珠厚鮮奶', icon: '🧋' },
                { id: 'wand', name: '夢幻星芒魔法杖', icon: '🪄' },
                { id: 'camera', name: '粉彩拍立得相機', icon: '📷' },
                { id: 'none', name: '雙手放空', icon: '❌' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => update({ handheld: item.id })}
                  className={`p-3 rounded-2xl border text-center transition cursor-pointer ${
                    state.handheld === item.id
                      ? 'border-[#FF4D6D] bg-[#FFF0F3] text-[#FF4D6D] font-bold shadow-xs'
                      : 'border-[#FFCCD5]/50 bg-white/70 hover:bg-white text-[#72525A]'
                  }`}
                >
                  <div className="text-2xl mb-1">{item.icon}</div>
                  <div className="text-xs">{item.name}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ==================================================== */}
      {/* 8. BACKGROUND CATEGORY */}
      {/* ==================================================== */}
      {category === 'background' && (
        <div className="space-y-4">
          <div className="text-xs font-bold text-[#72525A] mb-2 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#FF758F]" />
            場景背板選擇
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {[
              { id: 'bedroom', name: '夢幻粉彩臥室', icon: '🛏️', desc: '小燈串與掛畫' },
              { id: 'sakura', name: '櫻花落瓣公園', icon: '🌸', desc: '唯美春日微風' },
              { id: 'cafe', name: '甜蜜馬卡龍咖啡', icon: '☕', desc: '遮陽棚與窗景' },
              { id: 'stars', name: '璀璨星空幻夜', icon: '🌙', desc: '浪漫星河銀月' },
              { id: 'photobooth', name: '韓系拍貼機網美框', icon: '🎞️', desc: '萌系貼圖邊框' },
              { id: 'transparent', name: '純透明底 (貼圖模式)', icon: '🏁', desc: '方便自製大頭貼' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => update({ background: item.id })}
                className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
                  state.background === item.id
                    ? 'border-[#FF4D6D] bg-[#FFF0F3] text-[#FF4D6D] font-bold shadow-xs'
                    : 'border-[#FFCCD5]/50 bg-white/70 hover:bg-white text-[#72525A]'
                }`}
              >
                <div className="text-2xl mb-1">{item.icon}</div>
                <div className="text-xs font-bold">{item.name}</div>
                <div className="text-[10px] text-[#9A7A85]">{item.desc}</div>
              </button>
            ))}
          </div>

          <div className="mt-4 p-3 bg-white/80 rounded-2xl border border-[#FFCCD5]/50 space-y-3">
            <div className="text-xs font-bold text-[#72525A]">特效與動態設定</div>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-xs text-[#72525A]">✨ 懸浮閃亮星光特效</span>
              <input
                type="checkbox"
                checked={state.showSparkles}
                onChange={(e) => update({ showSparkles: e.target.checked })}
                className="w-4 h-4 accent-[#FF4D6D] rounded"
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-xs text-[#72525A]">😉 角色週期性可愛眨眼</span>
              <input
                type="checkbox"
                checked={state.enableBlink}
                onChange={(e) => update({ enableBlink: e.target.checked })}
                className="w-4 h-4 accent-[#FF4D6D] rounded"
              />
            </label>
          </div>
        </div>
      )}
    </div>
  );
};
