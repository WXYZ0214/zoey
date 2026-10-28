import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
import os

src_path = r'C:\Users\adi\.gemini\antigravity\brain\872f7ac1-4e3b-4856-b081-35af089a90cc\style_01_pastel_chibi_1792211860162.jpg'
out_dir = r'c:\Users\adi\Desktop\zoey\public\assets\chibi'
os.makedirs(out_dir, exist_ok=True)

img_bgr = cv2.imread(src_path)
h, w = img_bgr.shape[:2] # 1200 x 896
img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)

# 1. Clean Background Removal (Exact distance from lavender background)
bg_bgr = np.array([250, 216, 226], dtype=np.float32)
dist = np.linalg.norm(img_bgr.astype(np.float32) - bg_bgr, axis=2)

mask = np.zeros((h, w), dtype=np.uint8)
mask[dist > 25] = 255

# Keep largest connected component (the character)
num_labels, labels, stats, _ = cv2.connectedComponentsWithStats(mask)
largest_label = 1 + np.argmax(stats[1:, cv2.CC_STAT_AREA])
mask = np.where(labels == largest_label, 255, 0).astype(np.uint8)

# Close tiny internal pinholes (3x3) without closing the gap between legs
kernel_small = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel_small)

alpha = cv2.GaussianBlur(mask, (3, 3), 0)
arr = np.dstack([img_rgb, alpha])
Image.fromarray(arr).save(os.path.join(out_dir, 'doll_clean.png'))

hsv = cv2.cvtColor(img_rgb, cv2.COLOR_RGB2HSV)
H, S, V = hsv[:, :, 0], hsv[:, :, 1], hsv[:, :, 2]
A = arr[:, :, 3]

def blank():
    return np.zeros((h, w, 4), dtype=np.uint8)

def save_layer(rgba, name):
    Image.fromarray(rgba).save(os.path.join(out_dir, name))
    print(f"Saved {name}")

def shift_hsv(rgba, h_shift=0, s_mult=1.0, v_mult=1.0):
    res = rgba.copy()
    rgb = res[:, :, :3]
    hsv_img = cv2.cvtColor(rgb, cv2.COLOR_RGB2HSV).astype(np.float32)
    hsv_img[:, :, 0] = (hsv_img[:, :, 0] + h_shift) % 180
    hsv_img[:, :, 1] = np.clip(hsv_img[:, :, 1] * s_mult, 0, 255)
    hsv_img[:, :, 2] = np.clip(hsv_img[:, :, 2] * v_mult, 0, 255)
    res[:, :, :3] = cv2.cvtColor(hsv_img.astype(np.uint8), cv2.COLOR_HSV2RGB)
    return res

# ==============================================================
# 2. RIBBONS (Head Bows with Star Charms)
# ==============================================================
ribbons = blank()
is_ribbon_col = ((arr[:, :, 2].astype(int) > arr[:, :, 0].astype(int) - 15) & (arr[:, :, 1] > 175) & (A > 80)) | ((H >= 15) & (H <= 38) & (S > 35) & (V > 195) & (A > 80))
ribbons[90:260, 240:370] = np.where(is_ribbon_col[90:260, 240:370, None], arr[90:260, 240:370], 0)
ribbons[90:260, 520:655] = np.where(is_ribbon_col[90:260, 520:655, None], arr[90:260, 520:655], 0)
save_layer(ribbons, 'acc_ribbons.png')

# ==============================================================
# 3. BACK HAIR STYLES (6 styles)
# ==============================================================
hair_color_cond = (arr[:, :, 0] > 185) & (arr[:, :, 1] > 145) & (arr[:, :, 2] > 165) & (A > 80)
hair_outline_cond = (V < 140) & (A > 80)
is_hair_px = (hair_color_cond | hair_outline_cond) & (ribbons[:, :, 3] < 50)

# 3a. Twintails (Original)
twintails = blank()
twintails[95:580, 100:332] = np.where(is_hair_px[95:580, 100:332, None], arr[95:580, 100:332], 0)
twintails[95:580, 564:795] = np.where(is_hair_px[95:580, 564:795, None], arr[95:580, 564:795], 0)
save_layer(twintails, 'hair_twintails.png')

# 3b. Long Wave (Twintails + lush wavy hair behind back)
long_wave = blank()
lw_pil = Image.fromarray(long_wave)
draw_lw = ImageDraw.Draw(lw_pil)
draw_lw.rounded_rectangle([245, 220, 650, 610], radius=80, fill=(252, 206, 222, 255), outline=(98, 59, 104, 255), width=5)
lw_combined = Image.alpha_composite(lw_pil, Image.fromarray(twintails))
lw_combined.save(os.path.join(out_dir, 'hair_long_wave.png'))

# 3c. Straight Long Hair (Sleek straight hime back hair without side twintails)
straight_long = blank()
sl_pil = Image.fromarray(straight_long)
draw_sl = ImageDraw.Draw(sl_pil)
draw_sl.polygon([(295, 190), (250, 630), (646, 630), (601, 190)], fill=(252, 206, 222, 255), outline=(98, 59, 104, 255), width=5)
for xl in [285, 315, 345, 550, 580, 610]:
    draw_sl.line([(xl, 250), (xl - 10 if xl < 448 else xl + 10, 625)], fill=(236, 175, 198, 255), width=3)
sl_pil.save(os.path.join(out_dir, 'hair_straight_long.png'))

# 3d. Short Bob (No outer twintails, neat chin-length bob)
short_bob = blank()
sb_pil = Image.fromarray(short_bob)
draw_sb = ImageDraw.Draw(sb_pil)
draw_sb.ellipse([272, 160, 624, 435], fill=(252, 206, 222, 255), outline=(98, 59, 104, 255), width=5)
sb_pil.save(os.path.join(out_dir, 'hair_short_bob.png'))

# 3e. High Ponytail (Single bouncy ponytail on right)
high_pony = blank()
hp_pil = Image.fromarray(high_pony)
right_tail = Image.fromarray(twintails[:, 550:])
hp_pil.paste(right_tail, (535, -25), right_tail)
hp_pil.save(os.path.join(out_dir, 'hair_high_pony.png'))

# 3f. Space Buns (Double round odango buns)
space_buns = blank()
buns_pil = Image.fromarray(space_buns)
draw_buns = ImageDraw.Draw(buns_pil)
draw_buns.ellipse([220, 90, 345, 215], fill=(252, 206, 222, 255), outline=(98, 59, 104, 255), width=5)
draw_buns.arc([238, 108, 325, 195], start=200, end=330, fill=(255, 238, 245, 255), width=6)
draw_buns.ellipse([550, 90, 675, 215], fill=(252, 206, 222, 255), outline=(98, 59, 104, 255), width=5)
draw_buns.arc([570, 108, 657, 195], start=210, end=340, fill=(255, 238, 245, 255), width=6)
buns_pil.save(os.path.join(out_dir, 'hair_space_buns.png'))

# ==============================================================
# 4. FRONT HAIR / BANGS (5 styles)
# ==============================================================
# Extract crown & bangs & side locks from original illustration
bangs_hime = blank()
head_box = np.zeros((h, w), dtype=bool)
head_box[80:445, 285:612] = True
# Face skin is R>240, G>215, B>205 and R > B + 12 (peach skin vs pink hair where B >= G)
is_peach_skin = (arr[:, :, 0] > 235) & (arr[:, :, 1] > 205) & (arr[:, :, 2] > 195) & (arr[:, :, 0].astype(int) - arr[:, :, 2].astype(int) > 14) & ( np.arange(h)[:, None] > 240 )
# Eyes & mouth area inside face
in_face_features = np.zeros((h, w), dtype=bool)
in_face_features[295:428, 352:544] = True

bangs_mask = head_box & (~is_peach_skin) & (~in_face_features) & (A > 80) & (ribbons[:, :, 3] < 50)
bangs_hime = np.where(bangs_mask[:, :, None], arr, 0)
save_layer(bangs_hime, 'hair_bangs.png')
save_layer(bangs_hime, 'bangs_hime.png')

# 4b. Bob bangs (Trim side curls shorter at y=392)
bangs_bob = bangs_hime.copy()
bangs_bob[392:, :] = 0
save_layer(bangs_bob, 'bangs_bob.png')

# 4c. Airy bangs (Soften center fringe wisps)
bangs_airy = bangs_hime.copy()
for xg in range(385, 515, 20):
    bangs_airy[240:300, xg:xg+7, 3] = (bangs_airy[240:300, xg:xg+7, 3] * 0.35).astype(np.uint8)
save_layer(bangs_airy, 'bangs_airy.png')

# 4d. Side swept bangs
bangs_side = bangs_hime.copy()
bangs_side[245:300, 365:425, 3] = 0
save_layer(bangs_side, 'bangs_side.png')

# 4e. Center part bangs
bangs_center = bangs_hime.copy()
bangs_center[230:300, 434:462, 3] = 0
save_layer(bangs_center, 'bangs_center.png')

# ==============================================================
# 5. FULL DRESSES (Complete y=420..868)
# ==============================================================
is_mint = (H >= 55) & (H <= 100) & (S > 25)
is_lavender = (H >= 120) & (H <= 155) & (S > 20)
is_white = (S < 48) & (V > 205) & (A > 80)
is_outline = (V < 120) & (A > 80)
is_hands = (H >= 3) & (H <= 25) & (S >= 18) & (S <= 110) & (V > 180)

dress_area = np.zeros((h, w), dtype=bool)
dress_area[430:868, 180:715] = True
is_dress = dress_area & (is_mint | is_lavender | is_white | is_hands | is_outline) & (A > 80)

mask_u8 = np.where(is_dress, 255, 0).astype(np.uint8)
kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (11, 11))
mask_u8 = cv2.morphologyEx(mask_u8, cv2.MORPH_CLOSE, kernel)
mask_u8[:545, :330] = 0
mask_u8[:545, 565:] = 0

num_l, l_map, stats_d, cents = cv2.connectedComponentsWithStats(mask_u8)
valid_l = 0
for l in range(1, num_l):
    cx, cy = cents[l]
    if 350 < cx < 550 and 500 < cy < 750:
        valid_l = l
        break

dress_mask_final = np.where(l_map == valid_l, 255, 0).astype(np.uint8)
dress_alpha = cv2.GaussianBlur(dress_mask_final, (3, 3), 0)
dress_sailor_frill = np.dstack([arr[:, :, :3], dress_alpha])
save_layer(dress_sailor_frill, 'dress_sailor_frill.png')

# Dress Variations
save_layer(shift_hsv(dress_sailor_frill, h_shift=55, s_mult=1.15, v_mult=1.02), 'dress_strawberry.png')
save_layer(shift_hsv(dress_sailor_frill, h_shift=5, s_mult=1.35, v_mult=0.45), 'dress_gothic.png')
save_layer(shift_hsv(dress_sailor_frill, h_shift=160, s_mult=0.65, v_mult=1.02), 'dress_cozy_sweater.png')
save_layer(shift_hsv(dress_sailor_frill, h_shift=95, s_mult=1.25, v_mult=0.98), 'dress_yukata.png')

gray_d = cv2.cvtColor(dress_sailor_frill[:, :, :3], cv2.COLOR_RGB2GRAY)
maid_rgb = np.where((gray_d > 212)[:, :, None], np.array([255, 255, 255], dtype=np.uint8), (gray_d[:, :, None] * 0.28).astype(np.uint8))
save_layer(np.dstack([maid_rgb, dress_alpha]), 'dress_maid.png')

# ==============================================================
# 6. SPLIT TOPS (5) & BOTTOMS (5)
# ==============================================================
in_arms_hands = np.zeros((h, w), dtype=bool)
in_arms_hands[430:742, 335:560] = True
in_upper_bodice = np.zeros((h, w), dtype=bool)
in_upper_bodice[430:620, 280:615] = True
top_mask = in_arms_hands | in_upper_bodice
top_sailor = np.where(top_mask[:, :, None], dress_sailor_frill, 0)
save_layer(top_sailor, 'top_sailor.png')
save_layer(shift_hsv(top_sailor, h_shift=45, s_mult=1.1, v_mult=1.03), 'top_off_shoulder.png')
save_layer(shift_hsv(top_sailor, h_shift=160, s_mult=0.7, v_mult=1.02), 'top_sweater.png')
save_layer(shift_hsv(top_sailor, h_shift=115, s_mult=1.2, v_mult=0.95), 'top_crop_hoodie.png')
save_layer(shift_hsv(top_sailor, h_shift=25, s_mult=0.9, v_mult=1.0), 'top_cardigan.png')

bottom_mask = np.zeros((h, w), dtype=bool)
bottom_mask[595:868, 180:715] = True
bottom_ruffle = np.where(bottom_mask[:, :, None], dress_sailor_frill, 0)
save_layer(bottom_ruffle, 'bottom_ruffle_skirt.png')

bottom_pleated = shift_hsv(bottom_ruffle, h_shift=20, s_mult=1.3, v_mult=0.75)
bottom_pleated[805:, :] = 0
save_layer(bottom_pleated, 'bottom_pleated_skirt.png')

bottom_plaid = shift_hsv(bottom_ruffle, h_shift=50, s_mult=1.4, v_mult=0.85)
for x_p in range(230, 670, 28):
    bottom_plaid[600:855, x_p:x_p+3, :3] = (bottom_plaid[600:855, x_p:x_p+3, :3] * 0.72).astype(np.uint8)
save_layer(bottom_plaid, 'bottom_plaid_skirt.png')

denim_shorts = blank()
ds_pil = Image.fromarray(denim_shorts)
d_ds = ImageDraw.Draw(ds_pil)
d_ds.polygon([(365, 600), (531, 600), (535, 785), (455, 785), (448, 730), (441, 785), (361, 785)], fill=(120, 162, 210, 255), outline=(65, 85, 115, 255), width=4)
d_ds.rectangle([359, 765, 443, 786], fill=(215, 230, 248, 255), outline=(65, 85, 115, 255), width=3)
d_ds.rectangle([453, 765, 537, 786], fill=(215, 230, 248, 255), outline=(65, 85, 115, 255), width=3)
ds_pil.save(os.path.join(out_dir, 'bottom_denim_shorts.png'))

cargo_pants = blank()
cp_pil = Image.fromarray(cargo_pants)
d_cp = ImageDraw.Draw(cp_pil)
d_cp.polygon([(365, 600), (531, 600), (545, 1025), (456, 1025), (448, 740), (440, 1025), (351, 1025)], fill=(235, 215, 230, 255), outline=(98, 59, 104, 255), width=4)
d_cp.rounded_rectangle([345, 800, 385, 875], radius=6, fill=(220, 195, 215, 255), outline=(98, 59, 104, 255), width=3)
d_cp.rounded_rectangle([511, 800, 551, 875], radius=6, fill=(220, 195, 215, 255), outline=(98, 59, 104, 255), width=3)
cp_pil.save(os.path.join(out_dir, 'bottom_cargo_pants.png'))

# ==============================================================
# 7. BODY BASE (100% Original Head/Neck/Legs + Clean Face Skin)
# ==============================================================
body_layer = blank()
# Head & Neck from original (y=150..475, x=285..612)
body_layer[150:475, 285:612] = arr[150:475, 285:612]
# Bare Legs from original (y=855..1005, x=340..555)
body_layer[855:1005, 340:555] = arr[855:1005, 340:555]

# Extend upper thighs (y=755..862) so shorts/pleated skirts have seamless thighs!
body_pil = Image.fromarray(body_layer)
draw_b = ImageDraw.Draw(body_pil)
skin_col = (254, 233, 224, 255)
line_col = (98, 59, 104, 255)
draw_b.polygon([(377, 755), (441, 755), (441, 862), (377, 862)], fill=skin_col)
draw_b.line([(377, 755), (377, 862)], fill=line_col, width=4)
draw_b.line([(441, 755), (441, 862)], fill=line_col, width=4)
draw_b.polygon([(455, 755), (519, 755), (519, 862), (455, 862)], fill=skin_col)
draw_b.line([(455, 755), (455, 862)], fill=line_col, width=4)
draw_b.line([(519, 755), (519, 862)], fill=line_col, width=4)

# Cleanly erase baked-in eyes, blush, and mouth on the face skin so all expressions swap cleanly!
# Left eye (354..418, 298..365), Right eye (480..542, 298..365)
draw_b.rounded_rectangle([354, 298, 418, 365], radius=12, fill=(254, 234, 226, 255))
draw_b.rounded_rectangle([480, 298, 542, 365], radius=12, fill=(254, 234, 226, 255))
# Left blush (362..408, 365..390), Right blush (490..536, 365..390)
draw_b.rounded_rectangle([362, 365, 408, 390], radius=8, fill=(254, 231, 223, 255))
draw_b.rounded_rectangle([490, 365, 536, 390], radius=8, fill=(254, 231, 223, 255))
# Mouth (434..462, 386..404)
draw_b.rounded_rectangle([434, 386, 462, 404], radius=6, fill=(254, 232, 224, 255))

body_pil.save(os.path.join(out_dir, 'body_base.png'))
print("Saved perfected body_base.png")

# ==============================================================
# 8. EYES (4 styles) & BLUSH (4) & LIPS (4)
# ==============================================================
eyes_sparkle = blank()
eye_boxes = np.zeros((h, w), dtype=bool)
eye_boxes[296:366, 352:419] = True
eye_boxes[296:366, 479:545] = True
is_eye_px = (arr[:, :, 1] < 220) | ((arr[:, :, 0] > 246) & (arr[:, :, 1] > 246) & (arr[:, :, 2] > 246))
eyes_sparkle[eye_boxes] = np.where(is_eye_px[eye_boxes, None], arr[eye_boxes], 0)
save_layer(eyes_sparkle, 'eyes_sparkle.png')

# Wink
eyes_wink = eyes_sparkle.copy()
eyes_wink[:, 460:] = 0
wink_pil = Image.fromarray(eyes_wink)
draw_w = ImageDraw.Draw(wink_pil)
draw_w.arc([482, 318, 540, 352], start=190, end=350, fill=(75, 42, 65, 255), width=6)
draw_w.line([536, 326, 548, 316], fill=(75, 42, 65, 255), width=4)
draw_w.line([538, 333, 550, 330], fill=(75, 42, 65, 255), width=4)
wink_pil.save(os.path.join(out_dir, 'eyes_wink.png'))

# Cat Eyes
eyes_cat = eyes_sparkle.copy()
cat_pil = Image.fromarray(eyes_cat)
draw_c = ImageDraw.Draw(cat_pil)
draw_c.polygon([(350, 312), (338, 298), (366, 306)], fill=(65, 35, 55, 255))
draw_c.polygon([(546, 312), (558, 298), (530, 306)], fill=(65, 35, 55, 255))
draw_c.ellipse([383, 320, 391, 350], fill=(55, 28, 65, 255))
draw_c.ellipse([507, 320, 515, 350], fill=(55, 28, 65, 255))
cat_pil.save(os.path.join(out_dir, 'eyes_cat.png'))

# Original Mouth Smile
mouth_orig = blank()
mouth_box = np.zeros((h, w), dtype=bool)
mouth_box[385:405, 434:462] = True
mouth_orig[mouth_box] = np.where((arr[mouth_box, 1:2] < 210), arr[mouth_box], 0)
save_layer(mouth_orig, 'lips_smile.png')

# ==============================================================
# 9. SOCKS & SHOES (Clean from restored arr)
# ==============================================================
socks_ankle = blank()
socks_ankle[982:1055, 340:555] = np.where((A[982:1055, 340:555, None] > 80), arr[982:1055, 340:555], 0)
save_layer(socks_ankle, 'socks_frill_ankle.png')

shoes_mj = blank()
shoes_mj[1028:1138, 335:560] = np.where((A[1028:1138, 335:560, None] > 80), arr[1028:1138, 335:560], 0)
save_layer(shoes_mj, 'shoes_mary_janes.png')

gray_s = cv2.cvtColor(shoes_mj[:, :, :3], cv2.COLOR_RGB2GRAY)
loaf_rgb = np.where((gray_s > 220)[:, :, None], np.array([255, 255, 255], dtype=np.uint8), (gray_s[:, :, None] * 0.32).astype(np.uint8))
save_layer(np.dstack([loaf_rgb, shoes_mj[:, :, 3]]), 'shoes_black_loafers.png')
save_layer(shift_hsv(shoes_mj, h_shift=55, s_mult=1.3, v_mult=1.05), 'shoes_strawberry.png')

print("ALL FIXED AND GENERATED!")
