import React from 'react';
import { X, Sparkles, CheckCircle2, Clock } from 'lucide-react';
import { sound } from '../utils/audio';

interface StyleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface ArtStyleItem {
  id: string;
  number: number;
  name: string;
  enName: string;
  desc: string;
  previewImg?: string;
  isReady: boolean;
  badge: string;
}

export const ALL_STYLES: ArtStyleItem[] = [
  {
    id: 'pastel_chibi',
    number: 1,
    name: '日系粉彩 Q 版',
    enName: 'Pastel Chibi Kawaii',
    desc: '2.5頭身圓潤可愛、星光水汪汪大眼、粉彩水彩夢幻色調，零件換裝換色最協調。',
    previewImg: '/preview_styles/style_01_pastel_chibi_1792211860162.jpg',
    isReady: true,
    badge: '目前啟用中',
  },
  {
    id: 'kfashion_webtoon',
    number: 2,
    name: '韓系時尚網漫風',
    enName: 'K-Fashion Webtoon',
    desc: '修長流行比例、都會日常潮流服飾（西裝外套、高腰寬褲）、水光透明感立體裸妝。',
    previewImg: '/preview_styles/style_02_kfashion_webtoon_1792211876273.jpg',
    isReady: false,
    badge: '後續即將加入',
  },
  {
    id: 'y2k_pixel_art',
    number: 3,
    name: 'Y2K 像素復古風',
    enName: 'Retro 90s Pixel Art',
    desc: '千禧年代電子寵物與復古電腦視窗美學、顆粒感點陣繪製、工裝褲與頭戴耳機。',
    previewImg: '/preview_styles/style_03_y2k_pixel_art_1792211891734.jpg',
    isReady: false,
    badge: '後續即將加入',
  },
  {
    id: 'storybook_watercolor',
    number: 4,
    name: '水彩童話繪本風',
    enName: 'Cozy Storybook Watercolor',
    desc: '色鉛筆與水彩洗水筆觸、溫暖歐洲繪本感、森林系圍裙洋裝與野餐花籃。',
    previewImg: '/preview_styles/style_04_storybook_watercolor_1792211911249.jpg',
    isReady: false,
    badge: '後續即將加入',
  },
  {
    id: 'gothic_lolita',
    number: 5,
    name: '哥德甜美蘿莉塔',
    enName: 'Sweet & Gothic Lolita',
    desc: '繁複宮廷蕾絲軟帽、束腰蓬蓬洋裝、古典洋傘與陶瓷洋娃娃般精緻細節。',
    previewImg: '/preview_styles/style_05_gothic_lolita_1792211929271.jpg',
    isReady: false,
    badge: '後續即將加入',
  },
  {
    id: 'retro_cartoon',
    number: 6,
    name: '90年代美式復古卡通',
    enName: '90s Retro Cartoon / Pop Chic',
    desc: '飽和大膽鮮豔色塊、粗線條美式活力風格、搞怪俏皮街頭穿搭。',
    isReady: false,
    badge: '規劃中',
  },
  {
    id: 'shoujo_manga',
    number: 7,
    name: '經典少女漫畫風',
    enName: 'Classic Shoujo Manga',
    desc: '如星河般璀璨的大眼、飄逸浪漫的柔順髮絲、夢幻纖細古典線條。',
    isReady: false,
    badge: '規劃中',
  },
  {
    id: 'minimal_pop',
    number: 8,
    name: '極簡現代色塊風',
    enName: 'Minimalist Flat Pop',
    desc: '洗練簡約幾何線條、摩登對比撞色、都會時尚海報感。',
    isReady: false,
    badge: '規劃中',
  },
  {
    id: 'cyberpunk',
    number: 9,
    name: '賽博龐克酷甜風',
    enName: 'Cyberpunk Techwear Girl',
    desc: '霓虹發光漸層、機能風口袋織帶、科技感耳機面罩與未來感酷妹。',
    isReady: false,
    badge: '規劃中',
  },
  {
    id: 'clay_3d',
    number: 10,
    name: '3D 立體黏土 Q 萌風',
    enName: 'Cute 3D Toy / Claymation',
    desc: '圓滾滾黏土公仔、柔和棚拍光影、宛如可實體收藏的潮流玩具盲盒。',
    isReady: false,
    badge: '規劃中',
  },
];

export const StyleModal: React.FC<StyleModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white/95 rounded-3xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl border-2 border-[#FFCCD5] overflow-hidden">
        {/* Header */}
        <div className="p-4 md:p-5 border-b border-[#FFCCD5]/50 flex items-center justify-between bg-gradient-to-r from-[#FFF0F5] to-[#FFE5EC]">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🎨</span>
            <div>
              <h2 className="text-lg font-black text-[#554048] flex items-center gap-2">
                10 款角色美術風格庫
                <span className="text-xs bg-[#FF4D6D] text-white px-2 py-0.5 rounded-full font-bold">
                  擴充路線圖
                </span>
              </h2>
              <p className="text-xs text-[#8E636F]">
                目前已啟用「第 1 款：日系粉彩 Q 版」，其餘風格將陸續整合換裝系統！
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-2 rounded-full hover:bg-white/80 text-[#8E636F] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="p-4 md:p-6 overflow-y-auto space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ALL_STYLES.map((style) => (
              <div
                key={style.id}
                className={`rounded-2xl border p-3.5 transition flex flex-col justify-between ${
                  style.isReady
                    ? 'border-[#FF4D6D] bg-[#FFF5F8] ring-2 ring-[#FF8FA3]/40 shadow-xs'
                    : 'border-[#FFCCD5]/60 bg-white hover:border-[#FF8FA3]'
                }`}
              >
                <div>
                  {/* Style Preview Image if available */}
                  {style.previewImg && (
                    <div className="w-full h-36 rounded-xl overflow-hidden mb-3 bg-[#FFF0F3] relative group">
                      <img
                        src={style.previewImg}
                        alt={style.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                      <span className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-xs text-white text-[10px] px-2 py-0.5 rounded-md font-bold">
                        概念預覽圖
                      </span>
                    </div>
                  )}

                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-[#FF758F] text-white text-[11px] font-black flex items-center justify-center shrink-0">
                          {style.number}
                        </span>
                        <h3 className="font-bold text-sm text-[#554048]">
                          {style.name}
                        </h3>
                      </div>
                      <div className="text-[10px] text-[#A27B88] font-semibold mt-0.5 ml-6.5">
                        {style.enName}
                      </div>
                    </div>

                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0 flex items-center gap-1 ${
                        style.isReady
                          ? 'bg-[#2A9D8F] text-white shadow-xs'
                          : style.previewImg
                          ? 'bg-[#FF9AA2] text-white'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {style.isReady ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" />
                          {style.badge}
                        </>
                      ) : (
                        <>
                          <Clock className="w-3 h-3" />
                          {style.badge}
                        </>
                      )}
                    </span>
                  </div>

                  <p className="text-xs text-[#72525A] mt-2 leading-relaxed">
                    {style.desc}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-black/5 flex items-center justify-between">
                  {style.isReady ? (
                    <span className="text-xs text-[#2A9D8F] font-bold flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      正在遊戲中遊玩
                    </span>
                  ) : (
                    <span className="text-[11px] text-[#A27B88]">
                      {style.previewImg ? '概念圖已繪製，排程補入換裝' : '排程繪製概念圖與換裝骨架'}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#FFF0F3] border-t border-[#FFCCD5]/50 text-center text-xs text-[#8E636F]">
          💡 點擊任一風格即可隨時查看概念設計；我們已預留多風格切換架構，隨時可一鍵擴充！
        </div>
      </div>
    </div>
  );
};
