import { useState } from 'react';
import { CategoryType, DollState } from './types/doll';
import { DEFAULT_DOLL_STATE } from './data/items';
import { DollRenderer } from './components/DollRenderer';
import { CategoryNav } from './components/CategoryNav';
import { ItemSelectorPanel } from './components/ItemSelectorPanel';
import { ActionControls } from './components/ActionControls';
import { Sparkles, Heart } from 'lucide-react';

export function App() {
  const [dollState, setDollState] = useState<DollState>(DEFAULT_DOLL_STATE);
  const [activeCategory, setActiveCategory] = useState<CategoryType>('clothes');

  const [isStyleModalOpen, setIsStyleModalOpen] = useState(false);

  const handleUpdate = (updates: Partial<DollState>) => {
    setDollState((prev) => ({ ...prev, ...updates }));
  };

  return (
    <div className="min-h-screen bg-radial from-[#FFF5F8] via-[#FFEBF1] to-[#FFDEE9] flex flex-col justify-between p-3 md:p-6 text-[#554048]">
      {/* ================= HEADER ================= */}
      <header className="max-w-6xl mx-auto w-full mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-3xl bg-gradient-to-tr from-[#FF758F] to-[#FFCCD5] flex items-center justify-center text-2xl shadow-md border-2 border-white">
            🎀
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-black bg-gradient-to-r from-[#FF4D6D] to-[#A239CA] bg-clip-text text-transparent">
                萌萌紙娃娃換裝秀
              </h1>
              <button
                onClick={() => setIsStyleModalOpen(true)}
                title="點擊查看 10 款美術風格庫與擴充進度"
                className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-[#FF4D6D] text-white tracking-wider hover:bg-[#E63946] transition cursor-pointer flex items-center gap-1 shadow-2xs"
              >
                <span>Style 01 日系粉彩</span>
                <span className="text-white/80 text-[9px]">▾ 風格庫</span>
              </button>
            </div>
            <p className="text-xs text-[#8E636F]">
              自由搭配衣服、鞋襪、耳環飾品與精緻日韓化妝 ✨
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsStyleModalOpen(true)}
            className="flex items-center gap-1.5 text-xs font-bold text-[#FF4D6D] bg-white/80 hover:bg-white px-3.5 py-2 rounded-2xl border border-[#FFCCD5]/80 shadow-2xs transition cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-[#FFB703]" />
            <span>查看 10 款美術風格庫</span>
          </button>
        </div>
      </header>

      {/* ================= MAIN STUDIO ================= */}
      <main className="max-w-6xl mx-auto w-full flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* LEFT COLUMN: Character Stage & Controls (5 cols) */}
        <section className="lg:col-span-5 flex flex-col gap-3">
          {/* Action Toolbar */}
          <ActionControls
            state={dollState}
            onUpdateState={(s) => setDollState(s)}
          />

          {/* Doll Display Card */}
          <div className="flex-1 bg-white/90 backdrop-blur-md rounded-3xl p-4 md:p-6 border-2 border-[#FFCCD5] shadow-lg flex flex-col items-center justify-center relative overflow-hidden group">
            {/* Cute Corner Accents */}
            <div className="absolute top-3 left-4 text-xs font-bold text-[#FF8FA3] flex items-center gap-1 opacity-80">
              <Heart className="w-3.5 h-3.5 fill-[#FF8FA3]" />
              <span>Chibi Model</span>
            </div>
            <div className="absolute top-3 right-4 text-[10px] text-[#A27B88] bg-[#FFF0F3] px-2 py-0.5 rounded-full font-bold">
              500 × 650 Vector
            </div>

            {/* The SVG Doll */}
            <div className="w-full max-w-[380px] aspect-[500/650] my-auto">
              <DollRenderer
                state={dollState}
                className="w-full h-full shadow-inner border border-black/5"
              />
            </div>
          </div>
        </section>

        {/* RIGHT COLUMN: Wardrobe & Salon (7 cols) */}
        <section className="lg:col-span-7 bg-white/90 backdrop-blur-md rounded-3xl p-4 md:p-6 border-2 border-[#FFCCD5] shadow-lg flex flex-col h-[650px] lg:h-auto">
          {/* Top Category Tabs */}
          <div className="mb-4">
            <CategoryNav
              activeCategory={activeCategory}
              onSelectCategory={setActiveCategory}
            />
          </div>

          {/* Item / Subcategory Selector Area */}
          <div className="flex-1 overflow-hidden">
            <ItemSelectorPanel
              category={activeCategory}
              state={dollState}
              onChange={handleUpdate}
            />
          </div>
        </section>
      </main>

      {/* ================= FOOTER ================= */}
      <footer className="max-w-6xl mx-auto w-full mt-4 text-center text-xs text-[#A27B88] flex flex-wrap items-center justify-between gap-2">
        <span>© 萌萌紙娃娃換裝秀 — 點擊各部位更換造型，長按色票自訂專屬色系</span>
        <div className="flex items-center gap-2">
          <span>支援耳飾、鞋襪、眉毛、眼妝、唇蜜換色</span>
          <span className="text-[#FF4D6D]">♥</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
