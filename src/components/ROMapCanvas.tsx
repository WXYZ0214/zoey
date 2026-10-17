import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  MapTile,
  PropObject,
  Monster,
  PlayerCharacter,
  DamageNumber,
} from '../types/ro';
import {
  gridToIso,
  isoToGrid,
  MAP_WIDTH,
  MAP_HEIGHT,
  TILE_WIDTH,
  TILE_HEIGHT,
} from '../data/roMapData';
import { roAudio } from '../utils/roAudio';

interface ROMapCanvasProps {
  tiles: MapTile[];
  propsList: PropObject[];
  monsters: Monster[];
  player: PlayerCharacter;
  onTileClick: (x: number, y: number) => void;
  onMonsterClick: (monster: Monster) => void;
  onPropClick: (prop: PropObject) => void;
  damageNumbers: DamageNumber[];
}

export const ROMapCanvas: React.FC<ROMapCanvasProps> = ({
  tiles,
  propsList,
  monsters,
  player,
  onTileClick,
  onMonsterClick,
  onPropClick,
  damageNumbers,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [hoverTile, setHoverTile] = useState<{ x: number; y: number } | null>(null);

  // Camera offset centered on player
  const [camera, setCamera] = useState({ x: 0, y: 0 });

  // Update camera to follow player smoothly
  useEffect(() => {
    const { screenX, screenY } = gridToIso(player.x, player.y);
    setCamera({
      x: screenX,
      y: screenY,
    });
  }, [player.x, player.y]);

  // Main Render Loop
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear background (Sky / Horizon)
    const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
    skyGrad.addColorStop(0, '#8EC5FC');
    skyGrad.addColorStop(1, '#E0C3FC');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, width, height);

    // Save context for camera transformation
    ctx.save();
    // Center of screen
    ctx.translate(width / 2 - camera.x, height / 2 - camera.y);

    // 1. Draw Grid Tiles (Back to Front: sorted by x + y)
    const sortedTiles = [...tiles].sort((a, b) => a.x + a.y - (b.x + b.y));

    sortedTiles.forEach((tile) => {
      const { screenX, screenY } = gridToIso(tile.x, tile.y, tile.height);
      const halfW = TILE_WIDTH / 2;
      const halfH = TILE_HEIGHT / 2;

      // Draw 3D Base / Cliff Side if elevated
      if (tile.height > 0) {
        const sideH = tile.height * 12;
        // Left side
        ctx.fillStyle = '#6E8B3D';
        if (tile.type === 'stone') ctx.fillStyle = '#6C757D';
        ctx.beginPath();
        ctx.moveTo(screenX - halfW, screenY);
        ctx.lineTo(screenX, screenY + halfH);
        ctx.lineTo(screenX, screenY + halfH + sideH);
        ctx.lineTo(screenX - halfW, screenY + sideH);
        ctx.closePath();
        ctx.fill();

        // Right side
        ctx.fillStyle = '#5A7232';
        if (tile.type === 'stone') ctx.fillStyle = '#495057';
        ctx.beginPath();
        ctx.moveTo(screenX, screenY + halfH);
        ctx.lineTo(screenX + halfW, screenY);
        ctx.lineTo(screenX + halfW, screenY + sideH);
        ctx.lineTo(screenX, screenY + halfH + sideH);
        ctx.closePath();
        ctx.fill();
      }

      // Draw Top Diamond Face
      ctx.beginPath();
      ctx.moveTo(screenX, screenY - halfH);
      ctx.lineTo(screenX + halfW, screenY);
      ctx.lineTo(screenX, screenY + halfH);
      ctx.lineTo(screenX - halfW, screenY);
      ctx.closePath();

      // Palette according to tile type
      switch (tile.type) {
        case 'grass':
          ctx.fillStyle = '#8CB344';
          break;
        case 'path':
          ctx.fillStyle = '#D4A373';
          break;
        case 'stone':
          ctx.fillStyle = '#A8B2B9';
          break;
        case 'water':
          ctx.fillStyle = '#4EA8DE';
          break;
        case 'wood':
          ctx.fillStyle = '#B07D62';
          break;
        case 'flower':
          ctx.fillStyle = '#A3C958';
          break;
        default:
          ctx.fillStyle = '#8CB344';
      }

      ctx.fill();

      // Subtle RO tile grid line
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Special tile details
      if (tile.type === 'water') {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.beginPath();
        ctx.arc(screenX - 8, screenY, 3, 0, Math.PI * 2);
        ctx.fill();
      } else if (tile.type === 'flower') {
        ctx.fillStyle = '#FF758F';
        ctx.beginPath();
        ctx.arc(screenX, screenY, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      // Hover tile indicator
      if (hoverTile && hoverTile.x === tile.x && hoverTile.y === tile.y) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.fill();
        ctx.strokeStyle = '#FFE066';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    });

    // 2. Collect All Entities & Props for Y-Sorting (Z-ordering depth)
    interface RenderEntity {
      depth: number;
      draw: () => void;
    }
    const entities: RenderEntity[] = [];

    // Add Props
    propsList.forEach((prop) => {
      const tile = tiles.find((t) => t.x === prop.x && t.y === prop.y);
      const heightOffset = tile ? tile.height : 0;
      const { screenX, screenY } = gridToIso(prop.x, prop.y, heightOffset);

      entities.push({
        depth: prop.x + prop.y,
        draw: () => {
          // Draw Shadow
          ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
          ctx.beginPath();
          ctx.ellipse(screenX, screenY + 4, 18, 9, 0, 0, Math.PI * 2);
          ctx.fill();

          // Draw Specific Prop
          if (prop.type === 'fountain') {
            // RO Center Fountain
            ctx.fillStyle = '#CED4DA';
            ctx.beginPath();
            ctx.ellipse(screenX, screenY - 10, 32, 16, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#4EA8DE';
            ctx.beginPath();
            ctx.ellipse(screenX, screenY - 10, 26, 12, 0, 0, Math.PI * 2);
            ctx.fill();
            // Fountain Pillar & Angel Statue
            ctx.fillStyle = '#E9ECEF';
            ctx.fillRect(screenX - 6, screenY - 45, 12, 35);
            ctx.beginPath();
            ctx.arc(screenX, screenY - 50, 10, 0, Math.PI * 2);
            ctx.fill();
            // Water spray effect
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            const time = Date.now() * 0.005;
            ctx.beginPath();
            ctx.arc(screenX + Math.sin(time) * 4, screenY - 60, 4, 0, Math.PI * 2);
            ctx.fill();
          } else if (prop.type === 'tree') {
            // RO Nature Tree
            // Trunk
            ctx.fillStyle = '#8B5A2B';
            ctx.fillRect(screenX - 5, screenY - 25, 10, 25);
            // Foliage layers
            ctx.fillStyle = '#2D6A4F';
            ctx.beginPath();
            ctx.arc(screenX, screenY - 40, 24, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#40916C';
            ctx.beginPath();
            ctx.arc(screenX - 4, screenY - 52, 18, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#74C69D';
            ctx.beginPath();
            ctx.arc(screenX + 4, screenY - 60, 12, 0, Math.PI * 2);
            ctx.fill();
          } else if (prop.type === 'portal') {
            // Blue RO Warp Portal
            const pulse = (Math.sin(Date.now() * 0.006) + 1) * 0.5;
            ctx.fillStyle = `rgba(0, 180, 255, ${0.4 + pulse * 0.4})`;
            ctx.beginPath();
            ctx.ellipse(screenX, screenY - 5, 24, 12, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 2;
            ctx.stroke();
            // Floating sparkles
            ctx.fillStyle = '#FFFFFF';
            ctx.fillText('🌀', screenX - 8, screenY - 18 - pulse * 10);
          } else if (prop.type === 'crystal') {
            // Floating Mana Crystal
            const floatY = Math.sin(Date.now() * 0.004) * 6;
            ctx.fillStyle = '#B5179E';
            ctx.beginPath();
            ctx.moveTo(screenX, screenY - 55 + floatY);
            ctx.lineTo(screenX + 14, screenY - 35 + floatY);
            ctx.lineTo(screenX, screenY - 15 + floatY);
            ctx.lineTo(screenX - 14, screenY - 35 + floatY);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = '#F72585';
            ctx.beginPath();
            ctx.moveTo(screenX, screenY - 55 + floatY);
            ctx.lineTo(screenX + 8, screenY - 35 + floatY);
            ctx.lineTo(screenX, screenY - 15 + floatY);
            ctx.closePath();
            ctx.fill();
          } else if (prop.type === 'lantern') {
            // Street Lantern
            ctx.strokeStyle = '#343A40';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(screenX, screenY);
            ctx.lineTo(screenX, screenY - 35);
            ctx.stroke();
            ctx.fillStyle = '#FFD166';
            ctx.beginPath();
            ctx.arc(screenX, screenY - 35, 7, 0, Math.PI * 2);
            ctx.fill();
          } else if (prop.type === 'bench') {
            // Wooden bench
            ctx.fillStyle = '#8D5B4C';
            ctx.fillRect(screenX - 16, screenY - 12, 32, 10);
          } else if (prop.type === 'tent') {
            // Kafra Service Tent
            ctx.fillStyle = '#E63946';
            ctx.beginPath();
            ctx.moveTo(screenX, screenY - 55);
            ctx.lineTo(screenX + 30, screenY - 15);
            ctx.lineTo(screenX - 30, screenY - 15);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(screenX - 15, screenY - 15, 30, 15);
            ctx.font = 'bold 11px sans-serif';
            ctx.fillStyle = '#495057';
            ctx.fillText('KAFRA', screenX - 18, screenY - 22);
          }

          // Prop Name Label on hover
          if (hoverTile && hoverTile.x === prop.x && hoverTile.y === prop.y) {
            ctx.font = 'bold 11px sans-serif';
            ctx.fillStyle = '#212529';
            ctx.fillText(prop.name, screenX - 35, screenY - 70);
          }
        },
      });
    });

    // Add Monsters
    monsters.forEach((mon) => {
      if (mon.isDead) return;
      const tile = tiles.find((t) => t.x === mon.x && t.y === mon.y);
      const heightOffset = tile ? tile.height : 0;
      const { screenX, screenY } = gridToIso(mon.x, mon.y, heightOffset);

      entities.push({
        depth: mon.x + mon.y,
        draw: () => {
          // Monster Shadow
          ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
          ctx.beginPath();
          ctx.ellipse(screenX, screenY + 2, 14, 7, 0, 0, Math.PI * 2);
          ctx.fill();

          // Cute Poring / Monster Bounce Animation
          const bounce = Math.abs(Math.sin(Date.now() * 0.007 + parseInt(mon.id.replace(/\D/g, '') || '0'))) * 8;

          if (mon.type === 'poring') {
            // RO Classic Pink Poring
            ctx.fillStyle = '#FF758F';
            ctx.beginPath();
            ctx.ellipse(screenX, screenY - 12 - bounce, 15, 13, 0, 0, Math.PI * 2);
            ctx.fill();
            // Eyes
            ctx.fillStyle = '#212529';
            ctx.beginPath();
            ctx.arc(screenX - 4, screenY - 14 - bounce, 2, 0, Math.PI * 2);
            ctx.arc(screenX + 4, screenY - 14 - bounce, 2, 0, Math.PI * 2);
            ctx.fill();
            // Highlight
            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.beginPath();
            ctx.arc(screenX - 6, screenY - 18 - bounce, 3, 0, Math.PI * 2);
            ctx.fill();
          } else if (mon.type === 'angeling') {
            // Holy Angeling with Wings & Halo
            ctx.fillStyle = '#FFB7C5';
            ctx.beginPath();
            ctx.ellipse(screenX, screenY - 14 - bounce, 18, 16, 0, 0, Math.PI * 2);
            ctx.fill();
            // Golden Halo
            ctx.strokeStyle = '#FFE066';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.ellipse(screenX, screenY - 34 - bounce, 12, 4, 0, 0, Math.PI * 2);
            ctx.stroke();
            // Wings
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.arc(screenX - 16, screenY - 18 - bounce, 7, 0, Math.PI * 2);
            ctx.arc(screenX + 16, screenY - 18 - bounce, 7, 0, Math.PI * 2);
            ctx.fill();
          } else if (mon.type === 'lunatic') {
            // Cute Lunatic Bunny
            ctx.fillStyle = '#F8F9FA';
            ctx.beginPath();
            ctx.ellipse(screenX, screenY - 14 - bounce, 14, 12, 0, 0, Math.PI * 2);
            ctx.fill();
            // Ears
            ctx.fillStyle = '#F8F9FA';
            ctx.fillRect(screenX - 8, screenY - 28 - bounce, 4, 15);
            ctx.fillRect(screenX + 4, screenY - 28 - bounce, 4, 15);
            // Leaf in mouth
            ctx.fillStyle = '#52B788';
            ctx.fillRect(screenX - 3, screenY - 10 - bounce, 7, 3);
          } else if (mon.type === 'fabre') {
            // Green Fabre
            ctx.fillStyle = '#74C69D';
            ctx.beginPath();
            ctx.ellipse(screenX, screenY - 8 - bounce * 0.4, 14, 9, 0, 0, Math.PI * 2);
            ctx.fill();
          }

          // HP Bar & Name
          const hpPercent = mon.hp / mon.maxHp;
          ctx.fillStyle = '#212529';
          ctx.fillRect(screenX - 18, screenY - 32 - bounce, 36, 5);
          ctx.fillStyle = hpPercent > 0.3 ? '#52B788' : '#E63946';
          ctx.fillRect(screenX - 17, screenY - 31 - bounce, 34 * hpPercent, 3);

          // Name & Level
          ctx.font = 'bold 10px sans-serif';
          ctx.fillStyle = '#212529';
          ctx.fillText(`Lv.${mon.level} ${mon.name}`, screenX - 25, screenY - 36 - bounce);
        },
      });
    });

    // Add Player Character (The Cute Chibi Hero!)
    const pTile = tiles.find((t) => t.x === player.x && t.y === player.y);
    const pHeightOffset = pTile ? pTile.height : 0;
    const { screenX: pX, screenY: pY } = gridToIso(player.x, player.y, pHeightOffset);

    entities.push({
      depth: player.x + player.y,
      draw: () => {
        // Player Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.ellipse(pX, pY + 2, 16, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        // Target Destination Marker if moving
        if (player.isMoving) {
          ctx.strokeStyle = '#00B4D8';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.ellipse(pX, pY + 2, 22, 11, 0, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Draw Player Sprite (Q-version RO Character)
        const walkBounce = player.isMoving ? Math.sin(Date.now() * 0.015) * 4 : 0;

        // Torso & Robe
        ctx.fillStyle = '#6A4C93';
        ctx.beginPath();
        ctx.arc(pX, pY - 20 - walkBounce, 14, 0, Math.PI * 2);
        ctx.fill();

        // White Collar & Dress frills
        ctx.fillStyle = '#F8F9FA';
        ctx.beginPath();
        ctx.arc(pX, pY - 14 - walkBounce, 12, 0, Math.PI);
        ctx.fill();

        // Head & Face
        ctx.fillStyle = '#FFE5D9';
        ctx.beginPath();
        ctx.arc(pX, pY - 38 - walkBounce, 15, 0, Math.PI * 2);
        ctx.fill();

        // Eyes
        ctx.fillStyle = '#495057';
        ctx.beginPath();
        ctx.arc(pX - 4, pY - 37 - walkBounce, 2.5, 0, Math.PI * 2);
        ctx.arc(pX + 4, pY - 37 - walkBounce, 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Cute Blush
        ctx.fillStyle = '#FF9AA2';
        ctx.beginPath();
        ctx.arc(pX - 8, pY - 33 - walkBounce, 3, 0, Math.PI * 2);
        ctx.arc(pX + 8, pY - 33 - walkBounce, 3, 0, Math.PI * 2);
        ctx.fill();

        // Twintails & Hair (Pastel Pink Kawaii Hair)
        ctx.fillStyle = '#FFB7C5';
        // Bangs
        ctx.beginPath();
        ctx.arc(pX, pY - 44 - walkBounce, 15, Math.PI, 0);
        ctx.fill();
        // Left Twintail
        ctx.beginPath();
        ctx.arc(pX - 16, pY - 38 - walkBounce, 8, 0, Math.PI * 2);
        ctx.fill();
        // Right Twintail
        ctx.beginPath();
        ctx.arc(pX + 16, pY - 38 - walkBounce, 8, 0, Math.PI * 2);
        ctx.fill();
        // Head Ribbon Bow
        ctx.fillStyle = '#A0C4FF';
        ctx.fillRect(pX - 6, pY - 52 - walkBounce, 12, 6);

        // Player Name Tag & Job
        ctx.font = 'bold 11px sans-serif';
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = '#212529';
        ctx.lineWidth = 3;
        const nameText = `${player.name} [Lv.${player.level} ${player.job}]`;
        const textWidth = ctx.measureText(nameText).width;
        ctx.strokeText(nameText, pX - textWidth / 2, pY - 60 - walkBounce);
        ctx.fillText(nameText, pX - textWidth / 2, pY - 60 - walkBounce);

        // HP & SP Bars above player
        ctx.fillStyle = '#212529';
        ctx.fillRect(pX - 20, pY - 73 - walkBounce, 40, 7);
        // HP Green
        const hpR = player.baseHp / player.maxHp;
        ctx.fillStyle = '#52B788';
        ctx.fillRect(pX - 19, pY - 72 - walkBounce, 38 * hpR, 2.5);
        // SP Blue
        const spR = player.baseSp / player.maxSp;
        ctx.fillStyle = '#4EA8DE';
        ctx.fillRect(pX - 19, pY - 69 - walkBounce, 38 * spR, 2.5);
      },
    });

    // Sort entities by depth and render
    entities.sort((a, b) => a.depth - b.depth);
    entities.forEach((e) => e.draw());

    // 3. Draw Floating Damage Numbers
    damageNumbers.forEach((dmg) => {
      ctx.font = dmg.isCrit ? 'bold 18px "Zen Maru Gothic", sans-serif' : 'bold 15px sans-serif';
      ctx.fillStyle = dmg.isCrit ? '#FFD166' : '#FF4D6D';
      ctx.strokeStyle = '#212529';
      ctx.lineWidth = 3;
      const text = `${dmg.damage}${dmg.isCrit ? '!! CRITICAL' : ''}`;
      ctx.strokeText(text, dmg.x, dmg.y);
      ctx.fillText(text, dmg.x, dmg.y);
    });

    ctx.restore();
  }, [tiles, propsList, monsters, player, camera, hoverTile, damageNumbers]);

  // Request Animation Frame loop
  useEffect(() => {
    let animId: number;
    const loop = () => {
      render();
      animId = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(animId);
  }, [render]);

  // Handle Mouse Click on Canvas
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Convert Screen to World Coords relative to camera
    const worldX = clickX - canvas.width / 2 + camera.x;
    const worldY = clickY - canvas.height / 2 + camera.y;

    // Check if clicked directly on monster
    for (const mon of monsters) {
      if (mon.isDead) continue;
      const { screenX, screenY } = gridToIso(mon.x, mon.y);
      const dist = Math.hypot(worldX - screenX, worldY - (screenY - 15));
      if (dist < 26) {
        onMonsterClick(mon);
        return;
      }
    }

    // Check if clicked on Prop
    for (const prop of propsList) {
      const { screenX, screenY } = gridToIso(prop.x, prop.y);
      const dist = Math.hypot(worldX - screenX, worldY - (screenY - 25));
      if (dist < 32) {
        onPropClick(prop);
        return;
      }
    }

    // Convert to Grid Tile
    const { x, y } = isoToGrid(worldX, worldY);
    if (x >= 0 && x < MAP_WIDTH && y >= 0 && y < MAP_HEIGHT) {
      roAudio.playClick();
      onTileClick(x, y);
    }
  };

  // Mouse Move for Hover Tile
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const worldX = mouseX - canvas.width / 2 + camera.x;
    const worldY = mouseY - canvas.height / 2 + camera.y;
    const { x, y } = isoToGrid(worldX, worldY);
    if (x >= 0 && x < MAP_WIDTH && y >= 0 && y < MAP_HEIGHT) {
      setHoverTile({ x, y });
    } else {
      setHoverTile(null);
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden rounded-3xl border-2 border-[#B5A1D6] shadow-xl bg-slate-900">
      <canvas
        ref={canvasRef}
        width={960}
        height={620}
        onClick={handleCanvasClick}
        onMouseMove={handleMouseMove}
        className="w-full h-full cursor-crosshair block"
      />
      {/* RO Mini Navigation Instructions */}
      <div className="absolute bottom-3 left-4 bg-black/60 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-full pointer-events-none flex items-center gap-2">
        <span>🎮 滑鼠點擊地面移動角色</span>
        <span>•</span>
        <span>🍮 點擊怪物攻擊 (波利/天使波利)</span>
        <span>•</span>
        <span>⛲ 點擊中央噴泉可補滿 HP/SP</span>
      </div>
    </div>
  );
};
