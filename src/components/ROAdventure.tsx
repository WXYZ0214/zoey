import React, { useState, useEffect, useRef } from 'react';
import {
  PlayerCharacter,
  Monster,
  PropObject,
  DamageNumber,
  ChatBubble,
  MapTile,
} from '../types/ro';
import {
  generateROMazeMap,
  INITIAL_PROPS,
  INITIAL_MONSTERS,
  gridToIso,
} from '../data/roMapData';
import { ROMapCanvas } from './ROMapCanvas';
import { roAudio } from '../utils/roAudio';
import confetti from 'canvas-confetti';
import {
  Sword,
  Shield,
  Volume2,
  VolumeX,
  Compass,
  Zap,
  Sparkles,
  MapPin,
  MessageSquare,
  RotateCcw,
} from 'lucide-react';

interface ROAdventureProps {
  onBackToDressUp: () => void;
}

export const ROAdventure: React.FC<ROAdventureProps> = ({ onBackToDressUp }) => {
  const [tiles] = useState<MapTile[]>(() => generateROMazeMap());
  const [propsList] = useState<PropObject[]>(INITIAL_PROPS);
  const [monsters, setMonsters] = useState<Monster[]>(INITIAL_MONSTERS);

  // Player Character State
  const [player, setPlayer] = useState<PlayerCharacter>({
    name: '佐伊 (Zoey)',
    job: '大主教 (Arch Bishop)',
    level: 99,
    baseHp: 8400,
    maxHp: 8400,
    baseSp: 2600,
    maxSp: 2600,
    exp: 4500,
    maxExp: 10000,
    zeny: 1250000,
    x: 11,
    y: 13,
    facing: 'SE',
    isMoving: false,
  });

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [damageNumbers, setDamageNumbers] = useState<DamageNumber[]>([]);
  const [chatLogs, setChatLogs] = useState<ChatBubble[]>([
    { id: '1', text: '歡迎來到自創 RO 夢想原野冒險地圖！', sender: 'system', timestamp: Date.now() },
    { id: '2', text: '你可以點擊地面移動，點擊波利攻擊，或點擊噴泉回復體力。', sender: 'npc', timestamp: Date.now() + 100 },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [selectedEntity, setSelectedEntity] = useState<string | null>(null);

  // Sound toggle
  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    roAudio.setEnabled(next);
  };

  // Add floating damage number
  const spawnDamage = (gridX: number, gridY: number, damage: number, isCrit = false) => {
    const { screenX, screenY } = gridToIso(gridX, gridY);
    const newDmg: DamageNumber = {
      id: Math.random().toString(),
      x: screenX - 15 + (Math.random() * 20 - 10),
      y: screenY - 40,
      damage,
      isCrit,
      opacity: 1,
    };
    setDamageNumbers((prev) => [...prev, newDmg]);
    setTimeout(() => {
      setDamageNumbers((prev) => prev.filter((d) => d.id !== newDmg.id));
    }, 900);
  };

  // Click on Tile to Move Player smoothly
  const handleTileClick = (targetX: number, targetY: number) => {
    // Check if target is walkable
    const tile = tiles.find((t) => t.x === targetX && t.y === targetY);
    if (!tile || !tile.walkable) {
      addChatLog('此處地勢險峻或為深水區，無法通行！', 'system');
      return;
    }

    setPlayer((prev) => ({
      ...prev,
      x: targetX,
      y: targetY,
      isMoving: true,
    }));

    setTimeout(() => {
      setPlayer((prev) => ({ ...prev, isMoving: false }));
    }, 350);
  };

  // Click Monster to Attack
  const handleMonsterClick = (mon: Monster) => {
    const isCrit = Math.random() > 0.6;
    const dmg = isCrit ? Math.floor(Math.random() * 200 + 450) : Math.floor(Math.random() * 100 + 200);

    roAudio.playAttack(isCrit);
    spawnDamage(mon.x, mon.y, dmg, isCrit);

    // If within range, player attacks
    setMonsters((prev) =>
      prev.map((m) => {
        if (m.id === mon.id) {
          const nextHp = Math.max(0, m.hp - dmg);
          if (nextHp === 0) {
            roAudio.playPoring();
            addChatLog(`擊敗了 ${m.name}！獲得 ${m.level * 150} EXP 與卡普拉點數！`, 'system');
            // Trigger confetti if MVP Angeling defeated
            if (m.type === 'angeling') {
              roAudio.playLevelUp();
              confetti({ particleCount: 100, spread: 80 });
              addChatLog('🌟 恭喜擊敗 MVP 天使波利 (Angeling)！獲得「天使之翅」飾品！', 'system');
            }
            return { ...m, hp: 0, isDead: true };
          }
          return { ...m, hp: nextHp };
        }
        return m;
      })
    );

    // Respawn monster after 8 seconds
    if (mon.hp - dmg <= 0) {
      setTimeout(() => {
        setMonsters((prev) =>
          prev.map((m) => (m.id === mon.id ? { ...m, hp: m.maxHp, isDead: false } : m))
        );
      }, 8000);
    }
  };

  // Click on Prop (Fountain, Portal, Crystal, etc.)
  const handlePropClick = (prop: PropObject) => {
    setSelectedEntity(prop.name);
    if (prop.type === 'fountain') {
      roAudio.playLevelUp();
      setPlayer((prev) => ({
        ...prev,
        baseHp: prev.maxHp,
        baseSp: prev.maxSp,
      }));
      addChatLog('⛲ 飲用了大天使噴泉的聖水，HP 與 SP 已全部回滿！', 'npc');
    } else if (prop.type === 'portal') {
      roAudio.playWarp();
      addChatLog('🌀 觸發了傳送之陣！正在同步前往新原野...', 'system');
    } else {
      roAudio.playClick();
      addChatLog(`🔍 調查了 [${prop.name}]：${prop.desc}`, 'system');
    }
  };

  // Add chat message
  const addChatLog = (text: string, sender: 'player' | 'npc' | 'system') => {
    setChatLogs((prev) => [
      ...prev.slice(-15),
      { id: Math.random().toString(), text, sender, timestamp: Date.now() },
    ]);
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    addChatLog(chatInput, 'player');
    setChatInput('');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-3 md:p-6 antialiased">
      {/* Top RO Status Header */}
      <header className="max-w-6xl mx-auto w-full mb-3 flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 border border-slate-700/80 px-4 py-3 rounded-2xl shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-xl shadow-xs">
            ⚔️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg md:text-xl font-black text-amber-300">
                RO 仙境傳說 — 自創 2.5D 等角冒險原野
              </h1>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                Isometric 45°
              </span>
            </div>
            <p className="text-xs text-slate-400">
              經典點擊走位 • 噴泉回復 • 波利討伐 • 怪物即時刷新
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleSound}
            title={soundEnabled ? '關閉音效' : '開啟音效'}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            onClick={onBackToDressUp}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold text-xs shadow-md hover:opacity-95 transition cursor-pointer"
          >
            <span>🎀 返回紙娃娃換裝室</span>
          </button>
        </div>
      </header>

      {/* Main Canvas & UI Panel */}
      <main className="max-w-6xl mx-auto w-full flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        {/* Left: 2.5D Isometric Canvas (8 cols) */}
        <section className="lg:col-span-8 flex flex-col h-[560px] lg:h-[620px]">
          <ROMapCanvas
            tiles={tiles}
            propsList={propsList}
            monsters={monsters}
            player={player}
            onTileClick={handleTileClick}
            onMonsterClick={handleMonsterClick}
            onPropClick={handlePropClick}
            damageNumbers={damageNumbers}
          />
        </section>

        {/* Right: Character Card, Minimap & Chat Logs (4 cols) */}
        <section className="lg:col-span-4 flex flex-col gap-3">
          {/* Player RO Character Status Window */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-pink-500/20 border border-pink-400/40 flex items-center justify-center text-sm">
                  👧
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-200">{player.name}</div>
                  <div className="text-[11px] text-amber-400 font-semibold">{player.job}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-black text-emerald-400">Lv. {player.level}</div>
                <div className="text-[10px] text-slate-400">Zeny: {player.zeny.toLocaleString()}z</div>
              </div>
            </div>

            {/* HP Bar */}
            <div className="mb-1.5">
              <div className="flex justify-between text-[10px] font-bold text-slate-300 mb-0.5">
                <span>HP</span>
                <span>{player.baseHp} / {player.maxHp}</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-200"
                  style={{ width: `${(player.baseHp / player.maxHp) * 100}%` }}
                />
              </div>
            </div>

            {/* SP Bar */}
            <div>
              <div className="flex justify-between text-[10px] font-bold text-slate-300 mb-0.5">
                <span>SP</span>
                <span>{player.baseSp} / {player.maxSp}</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                <div
                  className="bg-sky-500 h-full rounded-full transition-all duration-200"
                  style={{ width: `${(player.baseSp / player.maxSp) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Chat & Combat Log Window */}
          <div className="flex-1 bg-slate-900/90 border border-slate-800 rounded-3xl p-4 shadow-lg flex flex-col justify-between h-[340px]">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300 mb-2 border-b border-slate-800 pb-2">
              <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
              <span>RO 冒險者頻道訊息</span>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 text-xs font-mono">
              {chatLogs.map((log) => (
                <div
                  key={log.id}
                  className={`p-1.5 rounded-lg ${
                    log.sender === 'system'
                      ? 'bg-amber-950/40 text-amber-300 border border-amber-900/40'
                      : log.sender === 'npc'
                      ? 'bg-sky-950/40 text-sky-300 border border-sky-900/40'
                      : 'bg-slate-800/60 text-slate-200'
                  }`}
                >
                  {log.text}
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendChat} className="mt-2 flex gap-1.5">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="輸入訊息廣播..."
                className="flex-1 bg-slate-950 border border-slate-800 text-xs px-3 py-1.5 rounded-xl focus:outline-none focus:border-amber-400 text-slate-200"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                發送
              </button>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
};
