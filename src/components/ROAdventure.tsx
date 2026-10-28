import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  PlayerCharacter,
  Monster,
  PropObject,
  DamageNumber,
  ChatBubble,
  MapTile,
  MapZoneId,
  SkillEffect,
  LootItem,
} from '../types/ro';
import { DollState } from '../types/doll';
import {
  generateROMazeMap,
  getZoneProps,
  getZoneMonsters,
  gridToIso,
  findGridPath,
  MAP_ZONES,
} from '../data/roMapData';
import { ROMapCanvas } from './ROMapCanvas';
import { DollRenderer } from './DollRenderer';
import { roAudio } from '../utils/roAudio';
import confetti from 'canvas-confetti';
import {
  Volume2,
  VolumeX,
  Sparkles,
  MessageSquare,
  Backpack,
  Heart,
  Zap,
  Compass,
  Crosshair,
} from 'lucide-react';

interface ROAdventureProps {
  dollState: DollState;
  onBackToDressUp: () => void;
}

export const ROAdventure: React.FC<ROAdventureProps> = ({
  dollState,
  onBackToDressUp,
}) => {
  const [zoneId, setZoneId] = useState<MapZoneId>('prontera_south');
  const [tiles, setTiles] = useState<MapTile[]>(() => generateROMazeMap('prontera_south'));
  const [propsList, setPropsList] = useState<PropObject[]>(() => getZoneProps('prontera_south'));
  const [monsters, setMonsters] = useState<Monster[]>(() => getZoneMonsters('prontera_south'));

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

  const [targetTile, setTargetTile] = useState<{ x: number; y: number } | null>(null);
  const [skillEffects, setSkillEffects] = useState<SkillEffect[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [damageNumbers, setDamageNumbers] = useState<DamageNumber[]>([]);
  const [rightTab, setRightTab] = useState<'chat' | 'loot'>('chat');
  const [lootBag, setLootBag] = useState<LootItem[]>([
    { id: 'jellopy', name: '傑勒比結晶 (Jellopy)', icon: '🍮', count: 12, desc: '波利掉落的晶瑩結晶' },
    { id: 'wing', name: '蒼蠅翅膀 (Fly Wing)', icon: '🦋', count: 5, desc: '瞬間移動至地圖隨機位置' },
  ]);
  const [chatLogs, setChatLogs] = useState<ChatBubble[]>([
    {
      id: '1',
      text: '歡迎來到 RO 仙境傳說 2.5D 等角冒險原野！角色造型已與您的紙娃娃同步✨',
      sender: 'system',
      timestamp: Date.now(),
    },
    {
      id: '2',
      text: '提示：點擊地面自動尋路，點擊波利追擊，或按 F1~F4 施放大主教技能！',
      sender: 'npc',
      timestamp: Date.now() + 100,
    },
  ]);
  const [chatInput, setChatInput] = useState('');

  // Pathfinding queue ref
  const pathQueueRef = useRef<Array<{ x: number; y: number }>>([]);
  const pendingActionRef = useRef<(() => void) | null>(null);

  // Add chat message
  const addChatLog = useCallback((text: string, sender: 'player' | 'npc' | 'system') => {
    setChatLogs((prev) => [
      ...prev.slice(-24),
      { id: Math.random().toString(), text, sender, timestamp: Date.now() },
    ]);
  }, []);

  // Spawn visual skill effect
  const triggerSkillEffect = useCallback(
    (type: SkillEffect['type'], x: number, y: number, duration = 950) => {
      const fx: SkillEffect = {
        id: Math.random().toString(),
        type,
        x,
        y,
        createdAt: Date.now(),
      };
      setSkillEffects((prev) => [...prev, fx]);
      setTimeout(() => {
        setSkillEffects((prev) => prev.filter((item) => item.id !== fx.id));
      }, duration);
    },
    []
  );

  // Add floating damage or heal number
  const spawnDamage = useCallback(
    (
      gridX: number,
      gridY: number,
      damage: number,
      isCrit = false,
      isHeal = false,
      isPlayerHit = false
    ) => {
      const tile = tiles.find((t) => t.x === Math.round(gridX) && t.y === Math.round(gridY));
      const hOff = tile ? tile.height : 0;
      const { screenX, screenY } = gridToIso(gridX, gridY, hOff);
      const newDmg: DamageNumber = {
        id: Math.random().toString(),
        x: screenX - 18 + (Math.random() * 20 - 10),
        y: screenY - 46 - Math.random() * 12,
        damage,
        isCrit,
        isHeal,
        isPlayerHit,
        opacity: 1,
      };
      setDamageNumbers((prev) => [...prev, newDmg]);
      setTimeout(() => {
        setDamageNumbers((prev) => prev.filter((d) => d.id !== newDmg.id));
      }, 950);
    },
    [tiles]
  );

  // Award EXP, Zeny & Loot when monster dies
  const rewardMonsterKill = useCallback(
    (mon: Monster) => {
      roAudio.playPoring();
      addChatLog(
        `🎉 討伐了 [${mon.name}]！獲得 +${mon.expReward} EXP、+${mon.zenyReward} Zeny 與「${mon.dropName}」！`,
        'system'
      );

      // Add drop to loot bag
      setLootBag((prev) => {
        const existing = prev.find((i) => i.name === mon.dropName);
        if (existing) {
          return prev.map((i) =>
            i.name === mon.dropName ? { ...i, count: i.count + 1 } : i
          );
        }
        return [
          ...prev,
          {
            id: Math.random().toString(),
            name: mon.dropName,
            icon: mon.icon,
            count: 1,
            desc: `擊敗 ${mon.name} 獲得的戰利品`,
          },
        ];
      });

      // Update EXP, Zeny, and check Level Up
      setPlayer((prev) => {
        const nextExp = prev.exp + mon.expReward;
        const nextZeny = prev.zeny + mon.zenyReward;
        if (nextExp >= prev.maxExp) {
          const nextLevel = prev.level + 1;
          const nextMaxHp = prev.maxHp + 350;
          const nextMaxSp = prev.maxSp + 120;
          roAudio.playLevelUp();
          confetti({ particleCount: 90, spread: 80, origin: { y: 0.5 } });
          triggerSkillEffect('levelup', prev.x, prev.y, 1600);
          addChatLog(
            `👼 【LEVEL UP!】恭喜升至 Lv.${nextLevel}！HP/SP 上限提升並完全恢復！`,
            'system'
          );
          return {
            ...prev,
            level: nextLevel,
            maxHp: nextMaxHp,
            baseHp: nextMaxHp,
            maxSp: nextMaxSp,
            baseSp: nextMaxSp,
            exp: nextExp - prev.maxExp,
            maxExp: Math.round(prev.maxExp * 1.2),
            zeny: nextZeny,
          };
        }
        return {
          ...prev,
          exp: nextExp,
          zeny: nextZeny,
        };
      });

      if (mon.isMvp) {
        roAudio.playLevelUp();
        confetti({ particleCount: 120, spread: 100 });
        addChatLog(`👑 恭喜擊敗地圖 MVP 首領【${mon.name}】！！`, 'system');
      }

      // Respawn monster after 7.5 seconds
      setTimeout(() => {
        setMonsters((prev) =>
          prev.map((m) =>
            m.id === mon.id
              ? { ...m, x: m.spawnX, y: m.spawnY, hp: m.maxHp, isDead: false }
              : m
          )
        );
      }, 7500);
    },
    [addChatLog, triggerSkillEffect]
  );

  // Switch Map Zone
  const switchZone = useCallback(
    (nextZone: MapZoneId) => {
      roAudio.playWarp();
      pathQueueRef.current = [];
      pendingActionRef.current = null;
      setTargetTile(null);
      setZoneId(nextZone);
      setTiles(generateROMazeMap(nextZone));
      setPropsList(getZoneProps(nextZone));
      setMonsters(getZoneMonsters(nextZone));
      setPlayer((prev) => ({
        ...prev,
        x: 11,
        y: 14,
        isMoving: false,
      }));
      addChatLog(
        `🌀 空間傳送完成！已抵達【${MAP_ZONES[nextZone].name}】(${MAP_ZONES[nextZone].subName})`,
        'system'
      );
    },
    [addChatLog]
  );

  // Step-by-step Walking Loop (runs every 140ms when pathQueue has steps)
  useEffect(() => {
    const interval = setInterval(() => {
      if (pathQueueRef.current.length === 0) {
        setPlayer((prev) => (prev.isMoving ? { ...prev, isMoving: false } : prev));
        setTargetTile(null);
        if (pendingActionRef.current) {
          const act = pendingActionRef.current;
          pendingActionRef.current = null;
          act();
        }
        return;
      }

      const nextStep = pathQueueRef.current.shift()!;
      setPlayer((prev) => {
        const dx = nextStep.x - prev.x;
        const dy = nextStep.y - prev.y;
        let facing = prev.facing;
        if (dx > 0 && dy >= 0) facing = 'SE';
        else if (dx <= 0 && dy > 0) facing = 'SW';
        else if (dx < 0 && dy <= 0) facing = 'NW';
        else if (dx >= 0 && dy < 0) facing = 'NE';

        return {
          ...prev,
          x: nextStep.x,
          y: nextStep.y,
          facing,
          isMoving: true,
        };
      });
    }, 145);

    return () => clearInterval(interval);
  }, []);

  // Monster Wandering AI every 2.8 seconds
  useEffect(() => {
    const aiTimer = setInterval(() => {
      setMonsters((prev) =>
        prev.map((mon) => {
          if (mon.isDead) return mon;
          // 45% chance to hop 1 tile near spawn
          if (Math.random() > 0.45) return mon;
          const dirs = [
            { dx: 1, dy: 0 },
            { dx: -1, dy: 0 },
            { dx: 0, dy: 1 },
            { dx: 0, dy: -1 },
          ];
          const d = dirs[Math.floor(Math.random() * dirs.length)];
          const nx = mon.x + d.dx;
          const ny = mon.y + d.dy;
          const distFromSpawn = Math.hypot(nx - mon.spawnX, ny - mon.spawnY);
          const tile = tiles.find((t) => t.x === nx && t.y === ny);
          if (tile && tile.walkable && distFromSpawn <= 2.5) {
            return { ...mon, x: nx, y: ny };
          }
          return mon;
        })
      );
    }, 2800);

    return () => clearInterval(aiTimer);
  }, [tiles]);

  // Execute direct attack on a monster
  const performAttackOnMonster = useCallback(
    (monId: string, skillBonus = 1.0, skillName?: string) => {
      setMonsters((prev) => {
        const target = prev.find((m) => m.id === monId);
        if (!target || target.isDead) return prev;

        const isCrit = Math.random() > 0.45 || skillBonus > 1.2;
        const baseDmg = isCrit
          ? Math.floor(Math.random() * 180 + 420)
          : Math.floor(Math.random() * 100 + 220);
        const dmg = Math.round(baseDmg * skillBonus);

        roAudio.playAttack(isCrit);
        spawnDamage(target.x, target.y, dmg, isCrit);

        if (skillName) {
          triggerSkillEffect('holylight', target.x, target.y, 650);
        }

        const nextHp = Math.max(0, target.hp - dmg);
        if (nextHp === 0) {
          setTimeout(() => rewardMonsterKill(target), 50);
        } else {
          // Monster light counter-attack
          const counterDmg = Math.max(15, monLevelDamage(target.level));
          setTimeout(() => {
            spawnDamage(player.x, player.y, counterDmg, false, false, true);
            setPlayer((p) => ({
              ...p,
              baseHp: Math.max(1, p.baseHp - counterDmg),
            }));
          }, 260);
        }

        return prev.map((m) =>
          m.id === monId ? { ...m, hp: nextHp, isDead: nextHp === 0 } : m
        );
      });
    },
    [player.x, player.y, rewardMonsterKill, spawnDamage, triggerSkillEffect]
  );

  // Click on Tile to Move Player smoothly via BFS Pathfinding
  const handleTileClick = useCallback(
    (targetX: number, targetY: number) => {
      const tile = tiles.find((t) => t.x === targetX && t.y === targetY);
      if (!tile || !tile.walkable) {
        addChatLog('⚠️ 此處為深水或峭壁障礙，無法通行！', 'system');
        return;
      }

      pendingActionRef.current = null;
      const path = findGridPath(tiles, player.x, player.y, targetX, targetY);
      if (path.length === 0 && (player.x !== targetX || player.y !== targetY)) {
        addChatLog('⚠️ 無法抵達該位置！', 'system');
        return;
      }
      setTargetTile({ x: targetX, y: targetY });
      pathQueueRef.current = path;
    },
    [addChatLog, player.x, player.y, tiles]
  );

  // Click Monster: walk into range if far, then attack!
  const handleMonsterClick = useCallback(
    (mon: Monster) => {
      if (mon.isDead) return;
      const dist = Math.hypot(player.x - mon.x, player.y - mon.y);
      if (dist <= 2.4) {
        performAttackOnMonster(mon.id);
      } else {
        // Walk up to monster and attack on arrival
        const path = findGridPath(tiles, player.x, player.y, mon.x, mon.y);
        if (path.length > 1) {
          pathQueueRef.current = path.slice(0, -1);
          setTargetTile(path[path.length - 2]);
          pendingActionRef.current = () => performAttackOnMonster(mon.id);
        } else {
          performAttackOnMonster(mon.id);
        }
      }
    },
    [performAttackOnMonster, player.x, player.y, tiles]
  );

  // Click on Prop (Fountain, Portal, Crystal, Tent, Bench)
  const executePropInteraction = useCallback(
    (prop: PropObject) => {
      if (prop.type === 'fountain') {
        roAudio.playLevelUp();
        triggerSkillEffect('heal', player.x, player.y, 900);
        spawnDamage(player.x, player.y, player.maxHp, false, true);
        setPlayer((prev) => ({
          ...prev,
          baseHp: prev.maxHp,
          baseSp: prev.maxSp,
        }));
        addChatLog('⛲ 飲用了大天使噴泉的清涼聖水，HP 與 SP 已 100% 完全恢復！', 'npc');
      } else if (prop.type === 'portal') {
        const order: MapZoneId[] = ['prontera_south', 'payon_sakura', 'geffen_ruins'];
        const nextIdx = (order.indexOf(zoneId) + 1) % order.length;
        switchZone(order[nextIdx]);
      } else if (prop.type === 'crystal') {
        roAudio.playLevelUp();
        triggerSkillEffect('holylight', prop.x, prop.y, 900);
        setPlayer((prev) => ({
          ...prev,
          exp: Math.min(prev.maxExp - 1, prev.exp + 250),
          baseSp: prev.maxSp,
        }));
        addChatLog('🔮 與浮空守護魔石共鳴！SP 全滿並獲得 +250 EXP 祝福！', 'system');
      } else if (prop.type === 'tent') {
        roAudio.playLevelUp();
        triggerSkillEffect('heal', player.x, player.y, 900);
        setPlayer((prev) => ({
          ...prev,
          baseHp: prev.maxHp,
          baseSp: prev.maxSp,
        }));
        addChatLog('👩‍💼 卡普拉服務人員：「歡迎光臨卡普拉服務站！已為您免費恢復所有體力與魔力💖」', 'npc');
      } else {
        roAudio.playClick();
        addChatLog(`🔍 調查了 [${prop.name}]：${prop.desc}`, 'system');
      }
    },
    [addChatLog, player.maxHp, player.x, player.y, spawnDamage, switchZone, triggerSkillEffect, zoneId]
  );

  const handlePropClick = useCallback(
    (prop: PropObject) => {
      const dist = Math.hypot(player.x - prop.x, player.y - prop.y);
      if (dist <= 2.5) {
        executePropInteraction(prop);
      } else {
        const path = findGridPath(tiles, player.x, player.y, prop.x, prop.y);
        if (path.length > 0) {
          pathQueueRef.current = path.length > 1 ? path.slice(0, -1) : path;
          setTargetTile({ x: prop.x, y: prop.y });
          pendingActionRef.current = () => executePropInteraction(prop);
        } else {
          executePropInteraction(prop);
        }
      }
    },
    [executePropInteraction, player.x, player.y, tiles]
  );

  // ====================================================
  // ACTIVE RO ARCH BISHOP SKILLS (F1 ~ F4)
  // ====================================================
  const castHeal = useCallback(() => {
    if (player.baseSp < 40) {
      addChatLog('⚠️ SP 不足，無法施放【治癒術 (Heal)】！請點擊噴泉回復。', 'system');
      return;
    }
    roAudio.playLevelUp();
    const healAmount = 1850;
    triggerSkillEffect('heal', player.x, player.y, 900);
    spawnDamage(player.x, player.y, healAmount, false, true);
    setPlayer((prev) => ({
      ...prev,
      baseHp: Math.min(prev.maxHp, prev.baseHp + healAmount),
      baseSp: prev.baseSp - 40,
    }));
    addChatLog(`✨ 施放【治癒術 Lv.10】！恢復了 ${healAmount} 點 HP！`, 'player');
  }, [addChatLog, player.baseSp, player.x, player.y, spawnDamage, triggerSkillEffect]);

  const castHolyLight = useCallback(() => {
    if (player.baseSp < 25) {
      addChatLog('⚠️ SP 不足，無法施放【神聖之光 (Holy Light)】！', 'system');
      return;
    }
    const living = monsters.filter((m) => !m.isDead);
    if (living.length === 0) {
      addChatLog('✨ 附近沒有可攻擊的魔物，等待魔物刷新中...', 'system');
      return;
    }
    // Find nearest living monster
    living.sort(
      (a, b) =>
        Math.hypot(a.x - player.x, a.y - player.y) -
        Math.hypot(b.x - player.x, b.y - player.y)
    );
    const nearest = living[0];
    setPlayer((prev) => ({ ...prev, baseSp: prev.baseSp - 25 }));
    addChatLog(`✝️ 對 [${nearest.name}] 詠唱【神聖之光 Holy Light】！`, 'player');
    performAttackOnMonster(nearest.id, 1.55, 'Holy Light');
  }, [addChatLog, monsters, performAttackOnMonster, player.baseSp, player.x, player.y]);

  const castMagnusExorcismus = useCallback(() => {
    if (player.baseSp < 80) {
      addChatLog('⚠️ SP 不足，無法施放【十字驅魔攻擊 (Magnus Exorcismus)】！', 'system');
      return;
    }
    setPlayer((prev) => ({ ...prev, baseSp: prev.baseSp - 80 }));
    roAudio.playAttack(true);
    triggerSkillEffect('magnus', player.x, player.y, 1300);
    addChatLog('🌟 展開大主教奧義【十字驅魔攻擊 Magnus Exorcismus】全場神聖打擊！', 'player');

    const living = monsters.filter(
      (m) => !m.isDead && Math.hypot(m.x - player.x, m.y - player.y) <= 7.5
    );
    if (living.length === 0) {
      addChatLog('💡 驅魔結界展開！但範圍 7 格內沒有魔物，請靠近魔物施放。', 'system');
      return;
    }
    living.forEach((m) => {
      performAttackOnMonster(m.id, 2.2, 'Magnus');
    });
  }, [addChatLog, monsters, performAttackOnMonster, player.baseSp, player.x, player.y, triggerSkillEffect]);

  const castTeleport = useCallback(() => {
    if (player.baseSp < 15) {
      addChatLog('⚠️ SP 不足，無法施放【瞬間移動 (Teleport)】！', 'system');
      return;
    }
    const walkableTiles = tiles.filter((t) => t.walkable);
    if (walkableTiles.length === 0) return;
    const randTile = walkableTiles[Math.floor(Math.random() * walkableTiles.length)];
    roAudio.playWarp();
    pathQueueRef.current = [];
    setTargetTile(null);
    setPlayer((prev) => ({
      ...prev,
      x: randTile.x,
      y: randTile.y,
      baseSp: prev.baseSp - 15,
      isMoving: false,
    }));
    triggerSkillEffect('holylight', randTile.x, randTile.y, 700);
    addChatLog(`🦋 施放【瞬間移動 Lv.1】！隨機飛往座標 (${randTile.x}, ${randTile.y})！`, 'player');
  }, [addChatLog, player.baseSp, tiles, triggerSkillEffect]);

  // Keyboard shortcuts: WASD / Arrows to walk, F1~F4 or 1~4 for skills
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT') return;

      if (e.key === 'F1' || e.key === '1') {
        e.preventDefault();
        castHeal();
      } else if (e.key === 'F2' || e.key === '2') {
        e.preventDefault();
        castHolyLight();
      } else if (e.key === 'F3' || e.key === '3') {
        e.preventDefault();
        castMagnusExorcismus();
      } else if (e.key === 'F4' || e.key === '4') {
        e.preventDefault();
        castTeleport();
      } else if (['w', 'W', 'ArrowUp'].includes(e.key)) {
        e.preventDefault();
        handleTileClick(player.x - 1, player.y - 1);
      } else if (['s', 'S', 'ArrowDown'].includes(e.key)) {
        e.preventDefault();
        handleTileClick(player.x + 1, player.y + 1);
      } else if (['a', 'A', 'ArrowLeft'].includes(e.key)) {
        e.preventDefault();
        handleTileClick(player.x - 1, player.y + 1);
      } else if (['d', 'D', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        handleTileClick(player.x + 1, player.y - 1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    castHeal,
    castHolyLight,
    castMagnusExorcismus,
    castTeleport,
    handleTileClick,
    player.x,
    player.y,
  ]);

  // Sound toggle
  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    roAudio.setEnabled(next);
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    addChatLog(`${player.name}: ${chatInput}`, 'player');
    setChatInput('');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-3 md:p-5 antialiased">
      {/* Top RO Status Header */}
      <header className="max-w-6xl mx-auto w-full mb-3 flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 border border-slate-700/80 px-4 py-2.5 rounded-2xl shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-xl shadow-xs">
            ⚔️
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-base md:text-lg font-black text-amber-300">
                RO 仙境傳說 — {MAP_ZONES[zoneId].name}
              </h1>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                2.5D 自動尋路 + 紙娃娃同步
              </span>
            </div>
            <p className="text-xs text-slate-400">{MAP_ZONES[zoneId].subName}</p>
          </div>
        </div>

        {/* Zone Quick Switcher & Return Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-slate-950/90 p-1 rounded-xl border border-slate-800 gap-1">
            {(
              [
                { id: 'prontera_south', label: '🌿 南門原野' },
                { id: 'payon_sakura', label: '🌸 斐揚櫻林' },
                { id: 'geffen_ruins', label: '🔮 吉芬遺跡' },
              ] as const
            ).map((z) => (
              <button
                key={z.id}
                onClick={() => switchZone(z.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  zoneId === z.id
                    ? 'bg-amber-500 text-slate-950 shadow-2xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {z.label}
              </button>
            ))}
          </div>

          <button
            onClick={toggleSound}
            title={soundEnabled ? '關閉音效' : '開啟音效'}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-amber-400" />
            ) : (
              <VolumeX className="w-4 h-4" />
            )}
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
        {/* Left: 2.5D Isometric Canvas + RO Skill Bar (8 cols) */}
        <section className="lg:col-span-8 flex flex-col gap-2.5">
          <div className="flex-1 min-h-[480px] lg:min-h-[540px]">
            <ROMapCanvas
              zoneId={zoneId}
              tiles={tiles}
              propsList={propsList}
              monsters={monsters}
              player={player}
              dollState={dollState}
              targetTile={targetTile}
              skillEffects={skillEffects}
              onTileClick={handleTileClick}
              onMonsterClick={handleMonsterClick}
              onPropClick={handlePropClick}
              damageNumbers={damageNumbers}
            />
          </div>

          {/* RO Classic F1~F4 Skill Hotbar */}
          <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-2.5 flex flex-wrap items-center justify-between gap-2 shadow-md">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300 px-2">
              <Sparkles className="w-4 h-4" />
              <span>大主教快捷技能列 (鍵盤 1~4)：</span>
            </div>

            <div className="flex flex-wrap items-center gap-2 flex-1 justify-end">
              <button
                onClick={castHeal}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/60 text-emerald-200 text-xs font-bold transition cursor-pointer active:scale-95"
              >
                <span className="bg-emerald-700 text-white px-1.5 py-0.5 rounded text-[10px]">
                  F1
                </span>
                <Heart className="w-3.5 h-3.5 text-emerald-400" />
                <span>治癒術 (+1850 HP)</span>
              </button>

              <button
                onClick={castHolyLight}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-950/80 hover:bg-amber-900 border border-amber-700/60 text-amber-200 text-xs font-bold transition cursor-pointer active:scale-95"
              >
                <span className="bg-amber-600 text-slate-950 px-1.5 py-0.5 rounded text-[10px] font-black">
                  F2
                </span>
                <Crosshair className="w-3.5 h-3.5 text-amber-400" />
                <span>神聖之光 (遠距單體)</span>
              </button>

              <button
                onClick={castMagnusExorcismus}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-700/60 text-purple-200 text-xs font-bold transition cursor-pointer active:scale-95"
              >
                <span className="bg-purple-600 text-white px-1.5 py-0.5 rounded text-[10px]">
                  F3
                </span>
                <Zap className="w-3.5 h-3.5 text-purple-400" />
                <span>十字驅魔 (範圍大招)</span>
              </button>

              <button
                onClick={castTeleport}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-sky-950/80 hover:bg-sky-900 border border-sky-700/60 text-sky-200 text-xs font-bold transition cursor-pointer active:scale-95"
              >
                <span className="bg-sky-600 text-white px-1.5 py-0.5 rounded text-[10px]">
                  F4
                </span>
                <Compass className="w-3.5 h-3.5 text-sky-400" />
                <span>瞬間移動 (飛越地形)</span>
              </button>
            </div>
          </div>
        </section>

        {/* Right: Character Card with Live Paper Doll Avatar + Chat/Loot (4 cols) */}
        <section className="lg:col-span-4 flex flex-col gap-3">
          {/* Player RO Character Status Window */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 shadow-lg">
            <div className="flex items-center gap-3 mb-3">
              {/* Live Mini Paper Doll Portrait */}
              <div className="w-16 h-20 rounded-2xl overflow-hidden border-2 border-pink-400/60 shadow-md shrink-0 bg-pink-50">
                <DollRenderer state={dollState} id="ro-mini-doll" className="w-full h-full" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-black text-white truncate">{player.name}</div>
                  <span className="text-xs font-black text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-700/50">
                    Lv. {player.level}
                  </span>
                </div>
                <div className="text-xs text-amber-400 font-bold mt-0.5">{player.job}</div>
                <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
                  <span>💰 {player.zeny.toLocaleString()} Zeny</span>
                  <span>📍 ({player.x}, {player.y})</span>
                </div>
              </div>
            </div>

            {/* HP Bar */}
            <div className="mb-2">
              <div className="flex justify-between text-[10px] font-bold text-slate-300 mb-0.5">
                <span>HP 生命值</span>
                <span>
                  {player.baseHp} / {player.maxHp}
                </span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-200"
                  style={{ width: `${Math.min(100, (player.baseHp / player.maxHp) * 100)}%` }}
                />
              </div>
            </div>

            {/* SP Bar */}
            <div className="mb-2">
              <div className="flex justify-between text-[10px] font-bold text-slate-300 mb-0.5">
                <span>SP 魔力值</span>
                <span>
                  {player.baseSp} / {player.maxSp}
                </span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800">
                <div
                  className="bg-gradient-to-r from-sky-500 to-indigo-400 h-full rounded-full transition-all duration-200"
                  style={{ width: `${Math.min(100, (player.baseSp / player.maxSp) * 100)}%` }}
                />
              </div>
            </div>

            {/* Base EXP Bar */}
            <div>
              <div className="flex justify-between text-[10px] font-bold text-amber-300 mb-0.5">
                <span>Base EXP 經驗值</span>
                <span>
                  {Math.floor((player.exp / player.maxExp) * 100)}% ({player.exp} / {player.maxExp})
                </span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                <div
                  className="bg-gradient-to-r from-amber-400 to-yellow-300 h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (player.exp / player.maxExp) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Chat & Loot Bag Tabbed Window */}
          <div className="flex-1 bg-slate-900/90 border border-slate-800 rounded-3xl p-4 shadow-lg flex flex-col justify-between min-h-[340px]">
            {/* Tab Switcher */}
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2 mb-2">
              <button
                onClick={() => setRightTab('chat')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  rightTab === 'chat'
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-slate-800/70 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>冒險紀錄頻道</span>
              </button>

              <button
                onClick={() => setRightTab('loot')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  rightTab === 'loot'
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-slate-800/70 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Backpack className="w-3.5 h-3.5" />
                <span>戰利品背包 ({lootBag.reduce((acc, i) => acc + i.count, 0)})</span>
              </button>
            </div>

            {rightTab === 'chat' ? (
              <>
                <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 text-xs font-mono max-h-[260px]">
                  {chatLogs.map((log) => (
                    <div
                      key={log.id}
                      className={`p-2 rounded-xl leading-relaxed ${
                        log.sender === 'system'
                          ? 'bg-amber-950/40 text-amber-300 border border-amber-900/40'
                          : log.sender === 'npc'
                          ? 'bg-sky-950/40 text-sky-300 border border-sky-900/40'
                          : 'bg-slate-800/70 text-slate-100'
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
                    placeholder="輸入冒險廣播訊息..."
                    className="flex-1 bg-slate-950 border border-slate-800 text-xs px-3 py-1.5 rounded-xl focus:outline-none focus:border-amber-400 text-slate-200"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition cursor-pointer"
                  >
                    發送
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[300px]">
                {lootBag.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-950/70 border border-slate-800"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">{item.icon}</span>
                      <div>
                        <div className="text-xs font-bold text-slate-200">{item.name}</div>
                        <div className="text-[10px] text-slate-400">{item.desc}</div>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 font-black text-xs border border-amber-500/30">
                      x{item.count}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

function monLevelDamage(level: number): number {
  return Math.floor(level * 8 + Math.random() * 25);
}
