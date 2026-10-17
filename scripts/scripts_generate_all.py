import cv2
import numpy as np
from PIL import Image, ImageEnhance, ImageFilter, ImageDraw
import os

src_path = r'c:\Users\adi\Desktop\zoey\public\assets\chibi\doll_clean.png'
base_img = Image.open(src_path).convert('RGBA')
w, h = base_img.size

out_dir = r'c:\Users\adi\Desktop\zoey\public\assets\chibi'
os.makedirs(out_dir, exist_ok=True)

arr = np.array(base_img)
r, g, b, a = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2], arr[:, :, 3]

def blank_canvas():
    return np.zeros((h, w, 4), dtype=np.uint8)

def save_np(data, name):
    img = Image.fromarray(data)
    img.save(os.path.join(out_dir, name))
    print(f"Generated: {name}")
    return img

# -------------------------------------------------------------
# 1. ACC_RIBBONS (Head bows with stars)
# -------------------------------------------------------------
ribbons = blank_canvas()
# Mask ribbons based on color and position
ribbon_pos = ((arr[:, :, 2] > arr[:, :, 0] - 15) & (arr[:, :, 1] > 180) & (arr[:, :, 3] > 100))
ribbons[90:260, 240:370] = np.where(ribbon_pos[90:260, 240:370, None], arr[90:260, 240:370], 0)
ribbons[90:260, 520:650] = np.where(ribbon_pos[90:260, 520:650, None], arr[90:260, 520:650], 0)
save_np(ribbons, 'acc_ribbons.png')

# -------------------------------------------------------------
# 2. HAIR_TWINTAILS (Left & Right Fluffy Twintails)
# -------------------------------------------------------------
twintails = blank_canvas()
# Color of hair: high red and blue, pinkish (R > 220, G > 170, B > 190)
hair_color = (arr[:, :, 0] > 190) & (arr[:, :, 1] > 150) & (arr[:, :, 2] > 170) & (arr[:, :, 3] > 100)
# Left twintail
twintails[100:580, 100:330] = np.where(hair_color[100:580, 100:330, None], arr[100:580, 100:330], 0)
# Right twintail
twintails[100:580, 565:790] = np.where(hair_color[100:580, 565:790, None], arr[100:580, 565:790], 0)
# Clean ribbon overlap from twintails
twintails[ribbons[:, :, 3] > 50] = 0
save_np(twintails, 'hair_twintails.png')

# -------------------------------------------------------------
# 3. HAIR_BANGS (Front hair, bangs, side curls)
# -------------------------------------------------------------
bangs = blank_canvas()
bangs[80:450, 290:610] = np.where(hair_color[80:450, 290:610, None], arr[80:450, 290:610], 0)
# Exclude eye/face skin area that might have leaked
skin_color = (arr[:, :, 0] > 240) & (arr[:, :, 1] > 210) & (arr[:, :, 2] > 200) & (arr[:, :, 0] > arr[:, :, 2] + 25)
bangs[skin_color] = 0
# Don't delete hair strands covering forehead
save_np(bangs, 'hair_bangs.png')

# -------------------------------------------------------------
# 4. EYES (Sparkling Anime Purple Eyes)
# -------------------------------------------------------------
eyes_sparkle = blank_canvas()
eyes_area = np.zeros((h, w), dtype=bool)
eyes_area[250:375, 340:555] = True
is_eye_pixel = eyes_area & (arr[:, :, 3] > 100) & ((arr[:, :, 2] > arr[:, :, 0] + 5) | (arr[:, :, 0] < 120))
eyes_sparkle[eyes_area] = np.where(is_eye_pixel[eyes_area, None], arr[eyes_area], 0)
save_np(eyes_sparkle, 'eyes_sparkle.png')

# -------------------------------------------------------------
# 5. BLUSH (Cute Pink Gradient Blush)
# -------------------------------------------------------------
blush_soft = blank_canvas()
blush_area = np.zeros((h, w), dtype=bool)
blush_area[340:395, 340:555] = True
is_blush = blush_area & (arr[:, :, 0] > 240) & (arr[:, :, 1] < 205) & (arr[:, :, 3] > 100)
blush_soft[blush_area] = np.where(is_blush[blush_area, None], arr[blush_area], 0)
save_np(blush_soft, 'blush_soft.png')

# -------------------------------------------------------------
# 6. MOUTH (Sweet Smile)
# -------------------------------------------------------------
mouth_smile = blank_canvas()
mouth_area = np.zeros((h, w), dtype=bool)
mouth_area[380:415, 420:480] = True
is_mouth = mouth_area & (arr[:, :, 0] < 180) & (arr[:, :, 3] > 100)
mouth_smile[mouth_area] = np.where(is_mouth[mouth_area, None], arr[mouth_area], 0)
save_np(mouth_smile, 'mouth_smile.png')

# -------------------------------------------------------------
# 7. DRESS (Sailor Tiered Frill Dress)
# -------------------------------------------------------------
dress = blank_canvas()
dress_area = np.zeros((h, w), dtype=bool)
# Dress area excluding the pink twintails hanging behind
dress_area[420:860, 200:700] = True
# Exclude twintail hair strands
dress_area = dress_area & (~(twintails[:, :, 3] > 50))
dress[dress_area] = np.where(arr[dress_area, 3:4] > 50, arr[dress_area], 0)
save_np(dress, 'dress_sailor_frill.png')

# -------------------------------------------------------------
# 8. SHOES & SOCKS (Mary Janes with ribbon)
# -------------------------------------------------------------
shoes = blank_canvas()
shoes_area = np.zeros((h, w), dtype=bool)
shoes_area[850:1140, 320:570] = True
shoes[shoes_area] = np.where(arr[shoes_area, 3:4] > 50, arr[shoes_area], 0)
save_np(shoes, 'shoes_mary_janes.png')

# -------------------------------------------------------------
# 9. BASE BODY (Head, neck, face skin, arms, legs)
# -------------------------------------------------------------
body = blank_canvas()
# Everything from full doll except twintails, ribbons, dress, shoes
body_mask = (arr[:, :, 3] > 50) & (~(twintails[:, :, 3] > 50)) & (~(ribbons[:, :, 3] > 50)) & (~(dress[:, :, 3] > 50)) & (~(shoes[:, :, 3] > 50))
body[body_mask] = arr[body_mask]

# Also ensure chest/torso under dress has a cute modesty base (pastel camisole)
# and legs under dress have skin/shorts so any other outfit fits perfectly!
# Let's draw soft skin on legs up to y=750
skin_color_val = [255, 237, 232, 255]
# Fill leg skin between y=700 and y=860
leg_fill = Image.fromarray(body)
draw = ImageDraw.Draw(leg_fill)
# Left leg column: x=370~450
draw.rectangle([380, 720, 445, 870], fill=tuple(skin_color_val))
# Right leg column: x=455~520
draw.rectangle([455, 720, 520, 870], fill=tuple(skin_color_val))
# Torso base
draw.rectangle([340, 430, 560, 730], fill=(255, 245, 248, 255))
# Soft outline
draw.line([380, 720, 380, 870], fill=(180, 140, 150, 255), width=3)
draw.line([520, 720, 520, 870], fill=(180, 140, 150, 255), width=3)
leg_fill.save(os.path.join(out_dir, 'body_base.png'))
print("Generated: body_base.png")

# -------------------------------------------------------------
# 10. GENERATE OUTFIT & HAIR VARIATIONS WITH EXACT PALETTE & ART
# -------------------------------------------------------------

# Variation 1: Strawberry Sundress (Sweet pink & floral frills)
dress_pil = Image.fromarray(dress)
hsv_dress = cv2.cvtColor(cv2.cvtColor(dress, cv2.COLOR_RGBA2BGR), cv2.COLOR_BGR2HSV)
# Hue shift to strawberry pink/red (+50 deg in hue)
hsv_pink = hsv_dress.copy()
hsv_pink[:, :, 0] = (hsv_pink[:, :, 0] + 55) % 180
bgr_pink = cv2.cvtColor(hsv_pink, cv2.COLOR_HSV2BGR)
rgba_pink = np.dstack([bgr_pink[:, :, 2], bgr_pink[:, :, 1], bgr_pink[:, :, 0], dress[:, :, 3]])
save_np(rgba_pink, 'dress_strawberry.png')

# Variation 2: Gothic Lolita Velvet Dress (Deep rich midnight/wine)
rgba_gothic = dress.copy()
# Reduce brightness, boost contrast
gothic_rgb = cv2.cvtColor(rgba_gothic[:, :, :3], cv2.COLOR_RGB2HSV)
gothic_rgb[:, :, 2] = (gothic_rgb[:, :, 2] * 0.45).astype(np.uint8)
gothic_rgb_back = cv2.cvtColor(gothic_rgb, cv2.COLOR_HSV2RGB)
rgba_gothic[:, :, :3] = gothic_rgb_back
save_np(rgba_gothic, 'dress_gothic.png')

# Variation 3: Black & White Maid Dress
rgba_maid = dress.copy()
gray = cv2.cvtColor(rgba_maid[:, :, :3], cv2.COLOR_RGB2GRAY)
# Make mint parts black, white parts crisp white
maid_rgb = np.dstack([gray, gray, gray])
maid_rgb = np.where(gray[:, :, None] < 210, gray[:, :, None] * 0.35, 255).astype(np.uint8)
rgba_maid[:, :, :3] = maid_rgb
save_np(rgba_maid, 'dress_maid.png')

# Variation 4: Cozy Oversized Knit & Pleated Skirt
rgba_sweater = dress.copy()
# Shift to warm apricot cream
sweater_hsv = cv2.cvtColor(dress[:, :, :3], cv2.COLOR_RGB2HSV)
sweater_hsv[:, :, 0] = (sweater_hsv[:, :, 0] + 160) % 180
sweater_hsv[:, :, 1] = (sweater_hsv[:, :, 1] * 0.7).astype(np.uint8)
rgba_sweater[:, :, :3] = cv2.cvtColor(sweater_hsv, cv2.COLOR_HSV2RGB)
save_np(rgba_sweater, 'dress_cozy_sweater.png')

# Variation 5: Shoes variations (Black Lolita Loafers & Strawberry Sneakers)
shoes_black = shoes.copy()
shoes_gray = cv2.cvtColor(shoes[:, :, :3], cv2.COLOR_RGB2GRAY)
shoes_black[:, :, :3] = np.where(shoes_gray[:, :, None] < 220, shoes_gray[:, :, None] * 0.3, 255).astype(np.uint8)
save_np(shoes_black, 'shoes_black_loafers.png')

shoes_pink = shoes.copy()
shoes_hsv = cv2.cvtColor(shoes[:, :, :3], cv2.COLOR_RGB2HSV)
shoes_hsv[:, :, 0] = (shoes_hsv[:, :, 0] + 55) % 180
shoes_pink[:, :, :3] = cv2.cvtColor(shoes_hsv, cv2.COLOR_HSV2RGB)
save_np(shoes_pink, 'shoes_strawberry.png')

# Variation 6: Fluffy Cat Ears Headband
cat_ears = blank_canvas()
# Draw lovely anime cat ears at top of head (matching line art)
cat_ears_pil = Image.fromarray(cat_ears)
draw_cat = ImageDraw.Draw(cat_ears_pil)
# Left ear
draw_cat.polygon([(260, 160), (220, 50), (330, 100)], fill=(255, 215, 230, 255), outline=(130, 80, 100, 255), width=4)
draw_cat.polygon([(255, 140), (235, 75), (310, 110)], fill=(255, 175, 195, 255))
# Right ear
draw_cat.polygon([(640, 160), (680, 50), (570, 100)], fill=(255, 215, 230, 255), outline=(130, 80, 100, 255), width=4)
draw_cat.polygon([(645, 140), (665, 75), (590, 110)], fill=(255, 175, 195, 255))
cat_ears_pil.save(os.path.join(out_dir, 'acc_cat_ears.png'))
print("Generated: acc_cat_ears.png")

# Variation 7: Artist Beret
beret = blank_canvas()
beret_pil = Image.fromarray(beret)
draw_beret = ImageDraw.Draw(beret_pil)
draw_beret.ellipse([270, 45, 630, 165], fill=(160, 100, 90, 255), outline=(90, 50, 45, 255), width=4)
draw_beret.line([450, 55, 450, 30], fill=(90, 50, 45, 255), width=6)
beret_pil.save(os.path.join(out_dir, 'acc_beret.png'))
print("Generated: acc_beret.png")

# Variation 8: Gold Wire Round Glasses
glasses = blank_canvas()
glasses_pil = Image.fromarray(glasses)
draw_gl = ImageDraw.Draw(glasses_pil)
# Left lens
draw_gl.ellipse([360, 280, 440, 360], outline=(220, 170, 80, 255), width=5)
# Right lens
draw_gl.ellipse([460, 280, 540, 360], outline=(220, 170, 80, 255), width=5)
# Bridge
draw_gl.line([440, 320, 460, 320], fill=(220, 170, 80, 255), width=5)
# Glass reflections
draw_gl.line([380, 295, 400, 285], fill=(255, 255, 255, 180), width=4)
draw_gl.line([480, 295, 500, 285], fill=(255, 255, 255, 180), width=4)
glasses_pil.save(os.path.join(out_dir, 'acc_glasses.png'))
print("Generated: acc_glasses.png")

# Variation 9: Cuddly Bunny Plushie
bunny = blank_canvas()
bunny_pil = Image.fromarray(bunny)
draw_b = ImageDraw.Draw(bunny_pil)
# Body
draw_b.ellipse([270, 540, 390, 680], fill=(255, 255, 255, 255), outline=(130, 90, 100, 255), width=4)
# Head
draw_b.ellipse([280, 460, 380, 560], fill=(255, 255, 255, 255), outline=(130, 90, 100, 255), width=4)
# Left Ear
draw_b.ellipse([285, 370, 325, 480], fill=(255, 255, 255, 255), outline=(130, 90, 100, 255), width=4)
draw_b.ellipse([295, 395, 315, 460], fill=(255, 190, 205, 255))
# Right Ear
draw_b.ellipse([335, 370, 375, 480], fill=(255, 255, 255, 255), outline=(130, 90, 100, 255), width=4)
draw_b.ellipse([345, 395, 365, 460], fill=(255, 190, 205, 255))
# Eyes & Nose
draw_b.ellipse([310, 500, 322, 515], fill=(60, 40, 45, 255))
draw_b.ellipse([340, 500, 352, 515], fill=(60, 40, 45, 255))
draw_b.polygon([(326, 520), (336, 520), (331, 526)], fill=(255, 130, 150, 255))
draw_b.ellipse([295, 515, 315, 525], fill=(255, 200, 210, 200))
draw_b.ellipse([345, 515, 365, 525], fill=(255, 200, 210, 200))
# Bow
draw_b.polygon([(331, 560), (310, 550), (310, 570)], fill=(255, 120, 150, 255))
draw_b.polygon([(331, 560), (352, 550), (352, 570)], fill=(255, 120, 150, 255))
draw_b.ellipse([326, 555, 336, 565], fill=(255, 90, 120, 255))
bunny_pil.save(os.path.join(out_dir, 'acc_bunny.png'))
print("Generated: acc_bunny.png")

# Variation 10: Golden Star Earrings
earrings = blank_canvas()
ear_pil = Image.fromarray(earrings)
draw_e = ImageDraw.Draw(ear_pil)
# Left Earring (under hair lock)
draw_e.line([305, 340, 305, 375], fill=(255, 200, 80, 255), width=3)
draw_e.polygon([(305, 375), (312, 385), (324, 385), (314, 393), (318, 405), (305, 397), (292, 405), (296, 393), (286, 385), (298, 385)], fill=(255, 215, 80, 255), outline=(190, 140, 40, 255), width=2)
# Right Earring
draw_e.line([595, 340, 595, 375], fill=(255, 200, 80, 255), width=3)
draw_e.polygon([(595, 375), (602, 385), (614, 385), (604, 393), (608, 405), (595, 397), (582, 405), (586, 393), (576, 385), (588, 385)], fill=(255, 215, 80, 255), outline=(190, 140, 40, 255), width=2)
ear_pil.save(os.path.join(out_dir, 'acc_earrings_star.png'))
print("Generated: acc_earrings_star.png")

print("All assets generated successfully!")
