import cv2
import numpy as np
from PIL import Image
import os

doll = Image.open('c:/Users/adi/Desktop/zoey/public/assets/chibi/doll_clean.png').convert('RGBA')
arr = np.array(doll)

hsv = cv2.cvtColor(arr[:, :, :3], cv2.COLOR_RGB2HSV)
H, S, V = hsv[:, :, 0], hsv[:, :, 1], hsv[:, :, 2]

is_mint = (H >= 55) & (H <= 100) & (S > 30)
is_lavender = (H >= 120) & (H <= 155) & (S > 25)
is_white = (S < 45) & (V > 210) & (arr[:, :, 3] > 100)
is_outline = (V < 110) & (arr[:, :, 3] > 100)
is_hands = (H >= 3) & (H <= 25) & (S >= 20) & (S <= 100) & (V > 180)

dress_area = np.zeros((1200, 896), dtype=bool)
dress_area[420:805, 180:715] = True

is_dress = dress_area & (is_mint | is_lavender | is_white | is_hands | is_outline) & (arr[:, :, 3] > 100)

mask_u8 = np.where(is_dress, 255, 0).astype(np.uint8)
kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (11, 11))
mask_u8 = cv2.morphologyEx(mask_u8, cv2.MORPH_CLOSE, kernel)

# Remove the hair horns outside the dress sleeves
mask_u8[:540, :330] = 0
mask_u8[:540, 565:] = 0

num_labels, labels, stats, centroids = cv2.connectedComponentsWithStats(mask_u8)
valid_label = 0
for l in range(1, num_labels):
    cx, cy = centroids[l]
    if 350 < cx < 550 and 500 < cy < 700:
        valid_label = l
        break

mask_final = np.where(labels == valid_label, 255, 0).astype(np.uint8)
alpha_smooth = cv2.GaussianBlur(mask_final, (3, 3), 0)

out = np.dstack([arr[:, :, 0], arr[:, :, 1], arr[:, :, 2], alpha_smooth])
Image.fromarray(out).save('c:/Users/adi/Desktop/zoey/public/assets/chibi/dress_sailor_frill.png')

# Now re-generate all dress colorways from this 100% clean dress
out_dir = 'c:/Users/adi/Desktop/zoey/public/assets/chibi'
# 1. Strawberry Sundress
hsv_clean = cv2.cvtColor(cv2.cvtColor(out, cv2.COLOR_RGBA2BGR), cv2.COLOR_BGR2HSV)
hsv_pink = hsv_clean.copy()
hsv_pink[:, :, 0] = (hsv_pink[:, :, 0] + 55) % 180
bgr_pink = cv2.cvtColor(hsv_pink, cv2.COLOR_HSV2BGR)
rgba_pink = np.dstack([bgr_pink[:, :, 2], bgr_pink[:, :, 1], bgr_pink[:, :, 0], out[:, :, 3]])
Image.fromarray(rgba_pink).save(os.path.join(out_dir, 'dress_strawberry.png'))

# 2. Gothic Lolita
hsv_goth = hsv_clean.copy()
hsv_goth[:, :, 2] = (hsv_goth[:, :, 2] * 0.42).astype(np.uint8)
hsv_goth[:, :, 1] = (hsv_goth[:, :, 1] * 1.3).clip(0, 255).astype(np.uint8)
bgr_goth = cv2.cvtColor(hsv_goth, cv2.COLOR_HSV2BGR)
rgba_goth = np.dstack([bgr_goth[:, :, 2], bgr_goth[:, :, 1], bgr_goth[:, :, 0], out[:, :, 3]])
Image.fromarray(rgba_goth).save(os.path.join(out_dir, 'dress_gothic.png'))

# 3. Sweet Maid
gray = cv2.cvtColor(out[:, :, :3], cv2.COLOR_RGB2GRAY)
is_light = gray > 215
maid_rgb = np.where(is_light[:, :, None], np.array([255, 255, 255], dtype=np.uint8), (gray[:, :, None] * 0.3).astype(np.uint8))
rgba_maid = np.dstack([maid_rgb[:, :, 0], maid_rgb[:, :, 1], maid_rgb[:, :, 2], out[:, :, 3]])
Image.fromarray(rgba_maid).save(os.path.join(out_dir, 'dress_maid.png'))

# 4. Cozy Sweater
hsv_sw = hsv_clean.copy()
hsv_sw[:, :, 0] = (hsv_sw[:, :, 0] + 160) % 180
hsv_sw[:, :, 1] = (hsv_sw[:, :, 1] * 0.6).astype(np.uint8)
bgr_sw = cv2.cvtColor(hsv_sw, cv2.COLOR_HSV2BGR)
rgba_sw = np.dstack([bgr_sw[:, :, 2], bgr_sw[:, :, 1], bgr_sw[:, :, 0], out[:, :, 3]])
Image.fromarray(rgba_sw).save(os.path.join(out_dir, 'dress_cozy_sweater.png'))

print("PERFECT CLEAN DRESSES GENERATED!")
