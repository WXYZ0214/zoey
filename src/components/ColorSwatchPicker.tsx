import React from 'react';
import { PaletteItem } from '../data/items';
import { sound } from '../utils/audio';

interface ColorSwatchPickerProps {
  label: string;
  currentColor: string;
  palettes: PaletteItem[];
  onChangeColor: (color: string) => void;
}

export const ColorSwatchPicker: React.FC<ColorSwatchPickerProps> = ({
  label,
  currentColor,
  palettes,
  onChangeColor,
}) => {
  return (
    <div className="bg-white/70 backdrop-blur-xs p-3.5 rounded-2xl border border-[#FFCCD5]/60 mb-3 shadow-xs">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold text-[#72525A] flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#FF758F]" />
          {label}
        </span>
        <div className="flex items-center gap-2">
          {/* Custom Native Color Input */}
          <label className="text-[11px] text-[#A27B88] flex items-center gap-1 cursor-pointer bg-[#FFF0F3] px-2 py-0.5 rounded-full hover:bg-[#FFE3E8] transition">
            自訂顏色
            <input
              type="color"
              value={currentColor}
              onChange={(e) => {
                sound.playPop();
                onChangeColor(e.target.value);
              }}
              className="w-4 h-4 opacity-0 absolute cursor-pointer"
            />
          </label>
          <span
            className="w-4 h-4 rounded-full border border-black/10 shadow-xs"
            style={{ backgroundColor: currentColor }}
          />
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {palettes.map((item) => {
          const isSelected = currentColor.toLowerCase() === item.value.toLowerCase();
          return (
            <button
              key={item.value}
              title={item.name}
              onClick={() => {
                sound.playPop();
                onChangeColor(item.value);
              }}
              style={{ backgroundColor: item.value }}
              className={`w-7 h-7 rounded-full shrink-0 border-2 transition-all duration-150 cursor-pointer shadow-xs relative ${
                isSelected
                  ? 'border-[#FF4D6D] scale-110 ring-2 ring-[#FF8FA3]/50'
                  : 'border-white hover:scale-105'
              }`}
            >
              {isSelected && (
                <span className="absolute inset-0 flex items-center justify-center text-[10px] text-white drop-shadow-md">
                  ✓
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
