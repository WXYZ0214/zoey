import React from 'react';
import { CATEGORIES } from '../data/items';
import { CategoryType } from '../types/doll';
import { sound } from '../utils/audio';

interface CategoryNavProps {
  activeCategory: CategoryType;
  onSelectCategory: (cat: CategoryType) => void;
}

export const CategoryNav: React.FC<CategoryNavProps> = ({
  activeCategory,
  onSelectCategory,
}) => {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none px-1">
      {CATEGORIES.map((cat) => {
        const isActive = activeCategory === cat.id;
        return (
          <button
            key={cat.id}
            onClick={() => {
              sound.playClick();
              onSelectCategory(cat.id as CategoryType);
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-sm whitespace-nowrap transition-all duration-200 cursor-pointer shadow-xs ${
              isActive
                ? 'bg-gradient-to-r from-[#FF8FA3] to-[#FF4D6D] text-white shadow-md scale-105 ring-2 ring-[#FFCCD5]'
                : 'bg-white/80 hover:bg-white text-[#6B4B3E] hover:text-[#FF4D6D] border border-[#FFCCD5]/50 hover:shadow-xs'
            }`}
          >
            <span className="text-lg">{cat.icon}</span>
            <span>{cat.name}</span>
          </button>
        );
      })}
    </div>
  );
};
