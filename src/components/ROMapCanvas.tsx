import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  MapTile,
  PropObject,
  Monster,
  PlayerCharacter,
  DamageNumber,
  MapZoneId,
  SkillEffect,
} from '../types/ro';
import { DollState } from '../types/doll';
import {
  gridToIso,
  isoToGrid,
  MAP_WIDTH,
  MAP_HEIGHT,
  TILE_WIDTH,
  TILE_HEIGHT,
  MAP_ZONES,
} from '../data/roMapData';
import { roAudio } from '../utils/roAudio';

interface ROMapCanvasProps {
  zoneId: MapZoneId;
  tiles: MapTile[];
  propsList: PropObject[];
  monsters: Monster[];
  player: PlayerCharacter;
  dollState: DollState;
  targetTile: { x: number; y: number } | null;
  skillEffects: SkillEffect[];
  onTileClick: (x: number, y: number) => void;
  onMonsterClick: (monster: Monster) => void;
  onPropClick: (prop: PropObject) => void;
  damageNumbers: DamageNumber[];
}

export const ROMapCanvas: React.FC<ROMapCanvasProps> = ({
  zoneId,
  tiles,
  propsList,
  monsters,
  player,
  dollState,
  targetTile,
  skillEffects,
  onTileClick,
  onMonsterClick,
  onPropClick,
  damageNumbers,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [hoverTile, setHoverTile] = useState<{ x: number; y: number } | null>(null);

  // Smoothly interpolated visual coordinates for player & camera
  const visualPosRef = useRef({ x: player.x, y: player.y });
  const cameraRef = useRef({ x: 0, y: 0 });

  const zoneInfo = MAP_ZONES[zoneId];

  // Helper to convert screen mouse event to scaled internal canvas coordinates
  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { canvasX: 0, canvasY: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      canvasX: (e.clientX - rect.left) * scaleX,
      canvasY: (e.clientY - rect.top) * scaleY,
    };
  };

  // Main Render Loop
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Smoothly interpolate visualPos toward logical player.x / player.y
    const lerpSpeed = 0.22;
    visualPosRef.current.x += (player.x - visualPosRef.current.x) * lerpSpeed;
    visualPosRef.current.y += (player.y - visualPosRef.current.y) * lerpSpeed;

    const { screenX: targetCamX, screenY: targetCamY } = gridToIso(
      visualPosRef.current.x,
      visualPosRef.current.y
    );
    cameraRef.current.x += (targetCamX - cameraRef.current.x) * 0.18;
    cameraRef.current.y += (targetCamY - cameraRef.current.y) * 0.18;

    const camX = cameraRef.current.x;
    const camY = cameraRef.current.y;

    // Clear background (Sky / Horizon per zone)
    const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
    skyGrad.addColorStop(0, zoneInfo.skyTop);
    skyGrad.addColorStop(1, zoneInfo.skyBottom);
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, width, height);

    // Save context for camera transformation
    ctx.save();
    ctx.translate(width / 2 - camX, height / 2 - camY);

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
        ctx.fillStyle = tile.type === 'stone' ? '#6C757D' : '#587236';
        ctx.beginPath();
        ctx.moveTo(screenX - halfW, screenY);
        ctx.lineTo(screenX, screenY + halfH);
        ctx.lineTo(screenX, screenY + halfH + sideH);
        ctx.lineTo(screenX - halfW, screenY + sideH);
        ctx.closePath();
        ctx.fill();

        // Right side
        ctx.fillStyle = tile.type === 'stone' ? '#495057' : '#455A29';
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

      // Palette according to tile type & zone
      switch (tile.type) {
        case 'grass':
          ctx.fillStyle = zoneInfo.grassColor;
          break;
        case 'path':
          ctx.fillStyle = zoneInfo.pathColor;
          break;
        case 'stone':
          ctx.fillStyle = zoneInfo.stoneColor;
          break;
        case 'water':
          ctx.fillStyle = zoneId === 'geffen_ruins' ? '#4361EE' : '#4EA8DE';
          break;
        case 'wood':
          ctx.fillStyle = '#B07D62';
          break;
        case 'flower':
          ctx.fillStyle = zoneInfo.flowerColor;
          break;
        default:
          ctx.fillStyle = zoneInfo.grassColor;
      }

      ctx.fill();

      // Subtle RO tile grid line
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Special tile details
      if (tile.type === 'water') {
        const wave = Math.sin(Date.now() * 0.004 + tile.x + tile.y) * 3;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.beginPath();
        ctx.arc(screenX - 6 + wave, screenY, 2.5, 0, Math.PI * 2);
        ctx.fill();
      } else if (tile.type === 'flower') {
        ctx.fillStyle = zoneId === 'geffen_ruins' ? '#F72585' : '#FF758F';
        ctx.beginPath();
        ctx.arc(screenX - 5, screenY - 2, 3, 0, Math.PI * 2);
        ctx.arc(screenX + 6, screenY + 3, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Target walk destination tile marker (RO green diamond cursor)
      if (targetTile && targetTile.x === tile.x && targetTile.y === tile.y) {
        ctx.fillStyle = 'rgba(82, 183, 136, 0.45)';
        ctx.fill();
        ctx.strokeStyle = '#52B788';
        ctx.lineWidth = 2.5;
        ctx.stroke();
      }

      // Hover tile indicator
      if (hoverTile && hoverTile.x === tile.x && hoverTile.y === tile.y) {
        ctx.fillStyle = tile.walkable
          ? 'rgba(255, 255, 255, 0.38)'
          : 'rgba(230, 57, 70, 0.35)';
        ctx.fill();
        ctx.strokeStyle = tile.walkable ? '#FFE066' : '#E63946';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    });

    // 1.5 Draw Ground Skill Magic Circles (Magnus Exorcismus, etc.)
    const now = Date.now();
    skillEffects.forEach((fx) => {
      const age = now - fx.createdAt;
      const t = tiles.find((tile) => tile.x === Math.round(fx.x) && tile.y === Math.round(fx.y));
      const hOff = t ? t.height : 0;
      const { screenX, screenY } = gridToIso(fx.x, fx.y, hOff);

      if (fx.type === 'magnus') {
        const radius = 65 + Math.sin(age * 0.015) * 6;
        ctx.save();
        ctx.strokeStyle = 'rgba(255, 224, 102, 0.85)';
        ctx.fillStyle = 'rgba(114, 239, 221, 0.22)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(screenX, screenY, radius, radius * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Inner holy cross
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(screenX - radius * 0.7, screenY);
        ctx.lineTo(screenX + radius * 0.7, screenY);
        ctx.moveTo(screenX, screenY - radius * 0.38);
        ctx.lineTo(screenX, screenY + radius * 0.38);
        ctx.stroke();
        ctx.restore();
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
          ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
          ctx.beginPath();
          ctx.ellipse(screenX, screenY + 4, 18, 9, 0, 0, Math.PI * 2);
          ctx.fill();

          if (prop.type === 'fountain') {
            ctx.fillStyle = '#CED4DA';
            ctx.beginPath();
            ctx.ellipse(screenX, screenY - 10, 32, 16, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#4EA8DE';
            ctx.beginPath();
            ctx.ellipse(screenX, screenY - 10, 26, 12, 0, 0, Math.PI * 2);
            ctx.fill();
            // Fountain Pillar & Angel Statue
            ctx.fillStyle = '#F8F9FA';
            ctx.fillRect(screenX - 6, screenY - 46, 12, 36);
            ctx.beginPath();
            ctx.arc(screenX, screenY - 52, 10, 0, Math.PI * 2);
            ctx.fill();
            // Golden Halo on statue
            ctx.strokeStyle = '#FFD166';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.ellipse(screenX, screenY - 64, 8, 3, 0, 0, Math.PI * 2);
            ctx.stroke();
            // Water spray effect
            ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
            const time = Date.now() * 0.006;
            ctx.beginPath();
            ctx.arc(screenX + Math.sin(time) * 6, screenY - 58, 3.5, 0, Math.PI * 2);
            ctx.arc(screenX - Math.cos(time) * 6, screenY - 54, 3, 0, Math.PI * 2);
            ctx.fill();
          } else if (prop.type === 'tree') {
            ctx.fillStyle = '#8B5A2B';
            ctx.fillRect(screenX - 5, screenY - 25, 10, 25);
            const foliage1 =
              zoneId === 'payon_sakura'
                ? '#FF8FA3'
                : zoneId === 'geffen_ruins'
                ? '#7209B7'
                : '#2D6A4F';
            const foliage2 =
              zoneId === 'payon_sakura'
                ? '#FFB7C5'
                : zoneId === 'geffen_ruins'
                ? '#9D4EDD'
                : '#40916C';
            const foliage3 =
              zoneId === 'payon_sakura'
                ? '#FFE5EC'
                : zoneId === 'geffen_ruins'
                ? '#C77DFF'
                : '#74C69D';

            ctx.fillStyle = foliage1;
            ctx.beginPath();
            ctx.arc(screenX, screenY - 40, 24, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = foliage2;
            ctx.beginPath();
            ctx.arc(screenX - 4, screenY - 52, 18, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = foliage3;
            ctx.beginPath();
            ctx.arc(screenX + 4, screenY - 60, 12, 0, Math.PI * 2);
            ctx.fill();
          } else if (prop.type === 'portal') {
            const pulse = (Math.sin(Date.now() * 0.006) + 1) * 0.5;
            ctx.fillStyle = `rgba(0, 180, 255, ${0.4 + pulse * 0.4})`;
            ctx.beginPath();
            ctx.ellipse(screenX, screenY - 5, 26, 13, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 2;
            ctx.stroke();
            // Outer magic ring
            ctx.strokeStyle = '#90E0EF';
            ctx.beginPath();
            ctx.ellipse(screenX, screenY - 5, 32, 16, 0, 0, Math.PI * 2);
            ctx.stroke();
            ctx.font = 'bold 14px sans-serif';
            ctx.fillStyle = '#FFFFFF';
            ctx.fillText('🌀', screenX - 8, screenY - 16 - pulse * 8);
          } else if (prop.type === 'crystal') {
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
            ctx.fillStyle = '#8D5B4C';
            ctx.fillRect(screenX - 16, screenY - 12, 32, 10);
          } else if (prop.type === 'tent') {
            ctx.fillStyle = '#E63946';
            ctx.beginPath();
            ctx.moveTo(screenX, screenY - 55);
            ctx.lineTo(screenX + 30, screenY - 15);
            ctx.lineTo(screenX - 30, screenY - 15);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(screenX - 15, screenY - 15, 30, 15);
            ctx.font = 'bold 10px sans-serif';
            ctx.fillStyle = '#FFFFFF';
            ctx.fillText('KAFRA', screenX - 17, screenY - 24);
          }

          // Prop Name Label on hover
          if (hoverTile && hoverTile.x === prop.x && hoverTile.y === prop.y) {
            ctx.font = 'bold 11px sans-serif';
            const w = ctx.measureText(prop.name).width;
            ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
            ctx.fillRect(screenX - w / 2 - 6, screenY - 82, w + 12, 18);
            ctx.fillStyle = '#FFE066';
            ctx.fillText(prop.name, screenX - w / 2, screenY - 69);
          }
        },
      });
    });

    // Add Monsters
    monsters.forEach((mon) => {
      if (mon.isDead) return;
      const tile = tiles.find((t) => t.x === Math.round(mon.x) && t.y === Math.round(mon.y));
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

          const bounce =
            Math.abs(Math.sin(Date.now() * 0.007 + parseInt(mon.id.replace(/\D/g, '') || '0'))) * 8;

          if (mon.type === 'poring' || mon.type === 'Marin') {
            ctx.fillStyle = mon.type === 'Marin' ? '#7209B7' : '#FF758F';
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
            // MVP Aura ring
            ctx.strokeStyle = 'rgba(255, 209, 102, 0.75)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.ellipse(screenX, screenY + 2, 24, 12, 0, 0, Math.PI * 2);
            ctx.stroke();

            // Wings
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.arc(screenX - 17, screenY - 18 - bounce, 8, 0, Math.PI * 2);
            ctx.arc(screenX + 17, screenY - 18 - bounce, 8, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#FFB7C5';
            ctx.beginPath();
            ctx.ellipse(screenX, screenY - 14 - bounce, 18, 16, 0, 0, Math.PI * 2);
            ctx.fill();
            // Eyes
            ctx.fillStyle = '#212529';
            ctx.beginPath();
            ctx.arc(screenX - 5, screenY - 15 - bounce, 2.2, 0, Math.PI * 2);
            ctx.arc(screenX + 5, screenY - 15 - bounce, 2.2, 0, Math.PI * 2);
            ctx.fill();
            // Golden Halo
            ctx.strokeStyle = '#FFE066';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.ellipse(screenX, screenY - 35 - bounce, 12, 4, 0, 0, Math.PI * 2);
            ctx.stroke();
          } else if (mon.type === 'lunatic') {
            ctx.fillStyle = '#F8F9FA';
            ctx.beginPath();
            ctx.ellipse(screenX, screenY - 14 - bounce, 14, 12, 0, 0, Math.PI * 2);
            ctx.fill();
            // Ears
            ctx.fillStyle = '#F8F9FA';
            ctx.fillRect(screenX - 8, screenY - 28 - bounce, 4, 15);
            ctx.fillRect(screenX + 4, screenY - 28 - bounce, 4, 15);
            // Red eyes
            ctx.fillStyle = '#E63946';
            ctx.beginPath();
            ctx.arc(screenX - 4, screenY - 15 - bounce, 2, 0, Math.PI * 2);
            ctx.arc(screenX + 4, screenY - 15 - bounce, 2, 0, Math.PI * 2);
            ctx.fill();
            // Leaf in mouth
            ctx.fillStyle = '#52B788';
            ctx.fillRect(screenX - 3, screenY - 10 - bounce, 7, 3);
          } else if (mon.type === 'deviruchi') {
            ctx.fillStyle = '#3C096C';
            ctx.beginPath();
            ctx.ellipse(screenX, screenY - 14 - bounce, 14, 13, 0, 0, Math.PI * 2);
            ctx.fill();
            // Little horns
            ctx.fillStyle = '#FF4D6D';
            ctx.beginPath();
            ctx.arc(screenX - 8, screenY - 26 - bounce, 3.5, 0, Math.PI * 2);
            ctx.arc(screenX + 8, screenY - 26 - bounce, 3.5, 0, Math.PI * 2);
            ctx.fill();
            // Glowing yellow eyes
            ctx.fillStyle = '#FFD166';
            ctx.beginPath();
            ctx.arc(screenX - 4, screenY - 15 - bounce, 2.2, 0, Math.PI * 2);
            ctx.arc(screenX + 4, screenY - 15 - bounce, 2.2, 0, Math.PI * 2);
            ctx.fill();
          } else {
            ctx.fillStyle = '#74C69D';
            ctx.beginPath();
            ctx.ellipse(screenX, screenY - 8 - bounce * 0.4, 14, 9, 0, 0, Math.PI * 2);
            ctx.fill();
          }

          // HP Bar & Name
          const hpPercent = Math.max(0, mon.hp / mon.maxHp);
          ctx.fillStyle = '#212529';
          ctx.fillRect(screenX - 20, screenY - 36 - bounce, 40, 5);
          ctx.fillStyle = hpPercent > 0.3 ? '#52B788' : '#E63946';
          ctx.fillRect(screenX - 19, screenY - 35 - bounce, 38 * hpPercent, 3);

          // Name & Level
          ctx.font = 'bold 10px sans-serif';
          const label = `${mon.isMvp ? '👑 ' : ''}Lv.${mon.level} ${mon.name}`;
          const tw = ctx.measureText(label).width;
          ctx.fillStyle = 'rgba(0,0,0,0.65)';
          ctx.fillRect(screenX - tw / 2 - 3, screenY - 50 - bounce, tw + 6, 12);
          ctx.fillStyle = mon.isMvp ? '#FFD166' : '#FFFFFF';
          ctx.fillText(label, screenX - tw / 2, screenY - 41 - bounce);
        },
      });
    });

    // Add Player Character (Synced with customized Paper Doll!)
    const pTile = tiles.find(
      (t) => t.x === Math.round(visualPosRef.current.x) && t.y === Math.round(visualPosRef.current.y)
    );
    const pHeightOffset = pTile ? pTile.height : 0;
    const { screenX: pX, screenY: pY } = gridToIso(
      visualPosRef.current.x,
      visualPosRef.current.y,
      pHeightOffset
    );

    entities.push({
      depth: visualPosRef.current.x + visualPosRef.current.y,
      draw: () => {
        // Player Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.32)';
        ctx.beginPath();
        ctx.ellipse(pX, pY + 2, 16, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        // Aura circle under player
        ctx.strokeStyle = player.isMoving ? '#00B4D8' : 'rgba(255, 183, 197, 0.7)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(pX, pY + 2, 20, 10, 0, 0, Math.PI * 2);
        ctx.stroke();

        const walkBounce = player.isMoving ? Math.abs(Math.sin(Date.now() * 0.016)) * 5 : 0;

        // Back Hair (Twintails / Long Hair / High Pony) using dollState.hairColor
        ctx.fillStyle = dollState.hairColor || '#FFB7C5';
        if (dollState.backHair === 'twintails') {
          ctx.beginPath();
          ctx.ellipse(pX - 16, pY - 34 - walkBounce, 7, 13, 0.2, 0, Math.PI * 2);
          ctx.ellipse(pX + 16, pY - 34 - walkBounce, 7, 13, -0.2, 0, Math.PI * 2);
          ctx.fill();
        } else if (dollState.backHair === 'space_buns') {
          ctx.beginPath();
          ctx.arc(pX - 13, pY - 50 - walkBounce, 7, 0, Math.PI * 2);
          ctx.arc(pX + 13, pY - 50 - walkBounce, 7, 0, Math.PI * 2);
          ctx.fill();
        } else if (dollState.backHair === 'high_pony') {
          ctx.beginPath();
          ctx.ellipse(pX + 12, pY - 46 - walkBounce, 8, 13, -0.4, 0, Math.PI * 2);
          ctx.fill();
        } else if (dollState.backHair === 'long_wave' || dollState.backHair === 'straight_long') {
          ctx.beginPath();
          ctx.ellipse(pX, pY - 28 - walkBounce, 16, 18, 0, 0, Math.PI * 2);
          ctx.fill();
        }

        // Legs & Shoes
        ctx.fillStyle = dollState.skinColor || '#FFF0EA';
        ctx.fillRect(pX - 6, pY - 10 - walkBounce * 0.5, 4, 9);
        ctx.fillRect(pX + 2, pY - 10 - walkBounce * 0.5, 4, 9);
        ctx.fillStyle = dollState.shoesColor || '#303036';
        ctx.fillRect(pX - 7, pY - 3 - walkBounce * 0.5, 5, 4);
        ctx.fillRect(pX + 2, pY - 3 - walkBounce * 0.5, 5, 4);

        // Outfit (Dress or Split Top + Skirt)
        const primaryClothColor =
          dollState.outfitType === 'dress'
            ? dollState.dressColor || '#FFC6D9'
            : dollState.topColor || '#BEE1E6';
        const secondaryClothColor =
          dollState.outfitType === 'dress'
            ? '#FFFFFF'
            : dollState.bottomColor || '#273469';

        // Skirt / Lower dress
        ctx.fillStyle = secondaryClothColor;
        ctx.beginPath();
        ctx.moveTo(pX - 14, pY - 9 - walkBounce);
        ctx.lineTo(pX + 14, pY - 9 - walkBounce);
        ctx.lineTo(pX + 10, pY - 22 - walkBounce);
        ctx.lineTo(pX - 10, pY - 22 - walkBounce);
        ctx.closePath();
        ctx.fill();

        // Top / Upper Bodice
        ctx.fillStyle = primaryClothColor;
        ctx.beginPath();
        ctx.arc(pX, pY - 21 - walkBounce, 11, 0, Math.PI * 2);
        ctx.fill();

        // Cute white collar/ribbon
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(pX, pY - 26 - walkBounce, 7, 0, Math.PI);
        ctx.fill();

        // Head & Face Skin (Synced with dollState.skinColor)
        ctx.fillStyle = dollState.skinColor || '#FFF0EA';
        ctx.beginPath();
        ctx.arc(pX, pY - 38 - walkBounce, 14, 0, Math.PI * 2);
        ctx.fill();

        // Eyes (Synced with dollState.eyeColor)
        ctx.fillStyle = dollState.eyeColor || '#7209B7';
        ctx.beginPath();
        ctx.arc(pX - 4.5, pY - 37 - walkBounce, 2.5, 0, Math.PI * 2);
        ctx.arc(pX + 4.5, pY - 37 - walkBounce, 2.5, 0, Math.PI * 2);
        ctx.fill();
        // Eye sparkle
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(pX - 5.2, pY - 38 - walkBounce, 1, 0, Math.PI * 2);
        ctx.arc(pX + 3.8, pY - 38 - walkBounce, 1, 0, Math.PI * 2);
        ctx.fill();

        // Blush (Synced with dollState.blushColor)
        if (dollState.blush !== 'none') {
          ctx.fillStyle = dollState.blushColor || '#FF758F';
          ctx.globalAlpha = 0.65;
          ctx.beginPath();
          ctx.arc(pX - 8, pY - 33 - walkBounce, 3, 0, Math.PI * 2);
          ctx.arc(pX + 8, pY - 33 - walkBounce, 3, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;
        }

        // Front Bangs (Synced with dollState.hairColor)
        ctx.fillStyle = dollState.hairColor || '#FFB7C5';
        ctx.beginPath();
        ctx.arc(pX, pY - 41 - walkBounce, 14.5, Math.PI, 0);
        ctx.fill();

        // Headwear (Synced with dollState.headwear)
        if (dollState.headwear === 'halo') {
          ctx.strokeStyle = '#FFE066';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.ellipse(pX, pY - 58 - walkBounce, 11, 3.5, 0, 0, Math.PI * 2);
          ctx.stroke();
        } else if (dollState.headwear === 'cat_ears') {
          ctx.fillStyle = dollState.headwearColor || '#FFC6D9';
          ctx.beginPath();
          ctx.moveTo(pX - 12, pY - 49 - walkBounce);
          ctx.lineTo(pX - 8, pY - 58 - walkBounce);
          ctx.lineTo(pX - 3, pY - 51 - walkBounce);
          ctx.moveTo(pX + 12, pY - 49 - walkBounce);
          ctx.lineTo(pX + 8, pY - 58 - walkBounce);
          ctx.lineTo(pX + 3, pY - 51 - walkBounce);
          ctx.fill();
        } else if (dollState.headwear === 'beret') {
          ctx.fillStyle = dollState.headwearColor || '#FFC6D9';
          ctx.beginPath();
          ctx.ellipse(pX + 2, pY - 52 - walkBounce, 13, 6, -0.15, 0, Math.PI * 2);
          ctx.fill();
        } else if (dollState.headwear !== 'none') {
          ctx.fillStyle = dollState.headwearColor || '#FFC6D9';
          ctx.fillRect(pX - 7, pY - 55 - walkBounce, 14, 6);
        }

        // Player Name Tag & Job
        ctx.font = 'bold 11px sans-serif';
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = '#212529';
        ctx.lineWidth = 3;
        const nameText = `${player.name} [Lv.${player.level} ${player.job}]`;
        const textWidth = ctx.measureText(nameText).width;
        ctx.strokeText(nameText, pX - textWidth / 2, pY - 64 - walkBounce);
        ctx.fillText(nameText, pX - textWidth / 2, pY - 64 - walkBounce);

        // HP & SP Bars above player
        ctx.fillStyle = '#212529';
        ctx.fillRect(pX - 20, pY - 77 - walkBounce, 40, 7);
        const hpR = Math.max(0, Math.min(1, player.baseHp / player.maxHp));
        ctx.fillStyle = '#52B788';
        ctx.fillRect(pX - 19, pY - 76 - walkBounce, 38 * hpR, 2.5);
        const spR = Math.max(0, Math.min(1, player.baseSp / player.maxSp));
        ctx.fillStyle = '#4EA8DE';
        ctx.fillRect(pX - 19, pY - 73 - walkBounce, 38 * spR, 2.5);
      },
    });

    // Sort entities by depth and render
    entities.sort((a, b) => a.depth - b.depth);
    entities.forEach((e) => e.draw());

    // 2.5 Draw Foreground Skill Effects (Heal, Holy Light, LevelUp)
    skillEffects.forEach((fx) => {
      const t = tiles.find((tile) => tile.x === Math.round(fx.x) && tile.y === Math.round(fx.y));
      const hOff = t ? t.height : 0;
      const { screenX, screenY } = gridToIso(fx.x, fx.y, hOff);

      if (fx.type === 'heal') {
        ctx.save();
        ctx.font = 'bold 20px sans-serif';
        ctx.fillStyle = '#52B788';
        ctx.fillText('✨➕✨', screenX - 28, screenY - 50);
        ctx.restore();
      } else if (fx.type === 'holylight') {
        ctx.save();
        ctx.strokeStyle = '#FFD166';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(screenX, screenY - 120);
        ctx.lineTo(screenX, screenY - 10);
        ctx.stroke();
        ctx.font = 'bold 22px sans-serif';
        ctx.fillText('✝️', screenX - 11, screenY - 22);
        ctx.restore();
      } else if (fx.type === 'levelup') {
        ctx.save();
        ctx.font = 'bold 22px sans-serif';
        ctx.fillStyle = '#FFD166';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.strokeText('👼 LEVEL UP!! 👼', screenX - 80, screenY - 85);
        ctx.fillText('👼 LEVEL UP!! 👼', screenX - 80, screenY - 85);
        ctx.restore();
      }
    });

    // 3. Draw Floating Damage / Heal Numbers
    damageNumbers.forEach((dmg) => {
      ctx.font = dmg.isCrit ? 'bold 18px sans-serif' : 'bold 15px sans-serif';
      ctx.fillStyle = dmg.isHeal
        ? '#52B788'
        : dmg.isPlayerHit
        ? '#FF4D6D'
        : dmg.isCrit
        ? '#FFD166'
        : '#FFFFFF';
      ctx.strokeStyle = '#212529';
      ctx.lineWidth = 3;
      const prefix = dmg.isHeal ? '+' : '';
      const suffix = dmg.isCrit ? ' CRITICAL!!' : '';
      const text = `${prefix}${dmg.damage}${suffix}`;
      ctx.strokeText(text, dmg.x, dmg.y);
      ctx.fillText(text, dmg.x, dmg.y);
    });

    ctx.restore();

    // ====================================================
    // 4. DRAW 2D MINIMAP OVERLAY (TOP-RIGHT CORNER)
    // ====================================================
    const mapSize = 110;
    const cell = mapSize / MAP_WIDTH;
    const padX = width - mapSize - 14;
    const padY = 14;

    ctx.save();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.78)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.lineWidth = 2;
    ctx.fillRect(padX - 4, padY - 4, mapSize + 8, mapSize + 24);
    ctx.strokeRect(padX - 4, padY - 4, mapSize + 8, mapSize + 24);

    tiles.forEach((t) => {
      if (!t.walkable) {
        ctx.fillStyle = t.type === 'water' ? '#4EA8DE' : '#334155';
      } else if (t.type === 'path') {
        ctx.fillStyle = '#D4A373';
      } else if (t.type === 'stone') {
        ctx.fillStyle = '#94A3B8';
      } else {
        ctx.fillStyle = '#52B788';
      }
      ctx.fillRect(padX + t.x * cell, padY + t.y * cell, cell + 0.5, cell + 0.5);
    });

    // Portals on minimap
    propsList
      .filter((p) => p.type === 'portal')
      .forEach((p) => {
        ctx.fillStyle = '#38BDF8';
        ctx.beginPath();
        ctx.arc(padX + (p.x + 0.5) * cell, padY + (p.y + 0.5) * cell, 3.5, 0, Math.PI * 2);
        ctx.fill();
      });

    // Monsters on minimap
    monsters.forEach((m) => {
      if (m.isDead) return;
      ctx.fillStyle = m.isMvp ? '#FFD166' : '#EF4444';
      ctx.beginPath();
      ctx.arc(
        padX + (m.x + 0.5) * cell,
        padY + (m.y + 0.5) * cell,
        m.isMvp ? 3.5 : 2.5,
        0,
        Math.PI * 2
      );
      ctx.fill();
    });

    // Player on minimap
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(
      padX + (visualPosRef.current.x + 0.5) * cell,
      padY + (visualPosRef.current.y + 0.5) * cell,
      3.5,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Coordinates readout under minimap
    ctx.font = 'bold 10px monospace';
    ctx.fillStyle = '#E2E8F0';
    ctx.fillText(
      `(${player.x}, ${player.y}) ${zoneInfo.name.slice(0, 6)}`,
      padX,
      padY + mapSize + 14
    );
    ctx.restore();
  }, [
    zoneId,
    zoneInfo,
    tiles,
    propsList,
    monsters,
    player,
    dollState,
    targetTile,
    skillEffects,
    hoverTile,
    damageNumbers,
  ]);

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

  // Handle Mouse Click on Canvas (with proper CSS-to-Canvas coordinate scaling!)
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const { canvasX, canvasY } = getCanvasCoords(e);

    // Convert Screen to World Coords relative to smooth camera
    const worldX = canvasX - canvas.width / 2 + cameraRef.current.x;
    const worldY = canvasY - canvas.height / 2 + cameraRef.current.y;

    // 1. Check if clicked directly on a living monster
    for (const mon of monsters) {
      if (mon.isDead) continue;
      const t = tiles.find((tile) => tile.x === Math.round(mon.x) && tile.y === Math.round(mon.y));
      const hOff = t ? t.height : 0;
      const { screenX, screenY } = gridToIso(mon.x, mon.y, hOff);
      const dist = Math.hypot(worldX - screenX, worldY - (screenY - 16));
      if (dist < 28) {
        onMonsterClick(mon);
        return;
      }
    }

    // 2. Check if clicked on an interactive Prop (Fountain, Portal, Crystal, Tent, Bench)
    for (const prop of propsList) {
      if (prop.type === 'tree' || prop.type === 'lantern') continue;
      const t = tiles.find((tile) => tile.x === prop.x && tile.y === prop.y);
      const hOff = t ? t.height : 0;
      const { screenX, screenY } = gridToIso(prop.x, prop.y, hOff);
      const dist = Math.hypot(worldX - screenX, worldY - (screenY - 22));
      if (dist < 34) {
        onPropClick(prop);
        return;
      }
    }

    // 3. Convert to Grid Tile & walk
    const { x, y } = isoToGrid(worldX, worldY);
    if (x >= 0 && x < MAP_WIDTH && y >= 0 && y < MAP_HEIGHT) {
      roAudio.playClick();
      onTileClick(x, y);
    }
  };

  // Mouse Move for Hover Tile (with proper CSS-to-Canvas coordinate scaling!)
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const { canvasX, canvasY } = getCanvasCoords(e);
    const worldX = canvasX - canvas.width / 2 + cameraRef.current.x;
    const worldY = canvasY - canvas.height / 2 + cameraRef.current.y;
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
      <div className="absolute bottom-3 left-4 bg-black/65 backdrop-blur-md text-white text-xs px-3.5 py-1.5 rounded-full pointer-events-none flex flex-wrap items-center gap-2">
        <span>🎮 點擊地面或按 WASD 尋路走位</span>
        <span>•</span>
        <span>⚔️ 點擊波利自動追擊</span>
        <span>•</span>
        <span>⛲ 點擊噴泉/傳送陣互動</span>
      </div>
    </div>
  );
};
