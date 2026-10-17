import cv2
import numpy as np
from PIL import Image
import os

out_dir = r'c:\Users\adi\Desktop\zoey\public\assets\chibi'

# Load the clean doll image to get pristine dress
doll = Image.open(os.path.join(out_dir, 'doll_clean.png')).convert('RGBA')
arr_doll = np.array(doll)

# Define exact polygon mask for dress + sleeves + collar + skirt + hands
# Coordinates for 896 x 1200:
pts = np.array([
    [400, 420], # center collar
    [448, 430], # neck center
    [500, 420],
    [540, 430],
    [585, 450], # right shoulder
    [645, 500], # right upper sleeve
    [645, 560],
    [585, 620], # right cuff
    [695, 650], # right skirt upper
    [690, 715], # right skirt hem
    [600, 710],
    [500, 715], # bottom hem center
    [400, 715],
    [300, 710],
    [205, 715], # left skirt hem
    [205, 650], # left skirt upper
    [310, 620], # left cuff
    [255, 560], # left upper sleeve
    [255, 500],
    [310, 450], # left shoulder
    [355, 430]
], dtype=np.int32)

mask_poly = np.zeros((1200, 896), dtype=np.uint8)
cv2.fillPoly(mask_poly, [pts], 255)

# Keep only pixels inside this dress polygon
arr_clean_dress = np.zeros_like(arr_doll)
for c in range(4):
    arr_clean_dress[:, :, c] = np.where(mask_poly == 255, arr_doll[:, :, c], 0)

pristine = Image.fromarray(arr_clean_dress)
pristine.save(os.path.join(out_dir, 'dress_sailor_frill.png'))

# Re-create variations
# 1. Strawberry Sundress
hsv = cv2.cvtColor(cv2.cvtColor(arr_clean_dress, cv2.COLOR_RGBA2BGR), cv2.COLOR_BGR2HSV)
hsv_pink = hsv.copy()
hsv_pink[:, :, 0] = (hsv_pink[:, :, 0] + 55) % 180
bgr_pink = cv2.cvtColor(hsv_pink, cv2.COLOR_HSV2BGR)
rgba_pink = np.dstack([bgr_pink[:, :, 2], bgr_pink[:, :, 1], bgr_pink[:, :, 0], arr_clean_dress[:, :, 3]])
Image.fromarray(rgba_pink).save(os.path.join(out_dir, 'dress_strawberry.png'))

# 2. Gothic Lolita
hsv_goth = hsv.copy()
hsv_goth[:, :, 2] = (hsv_goth[:, :, 2] * 0.42).astype(np.uint8)
hsv_goth[:, :, 1] = (hsv_goth[:, :, 1] * 1.3).clip(0, 255).astype(np.uint8)
bgr_goth = cv2.cvtColor(hsv_goth, cv2.COLOR_HSV2BGR)
rgba_goth = np.dstack([bgr_goth[:, :, 2], bgr_goth[:, :, 1], bgr_goth[:, :, 0], arr_clean_dress[:, :, 3]])
Image.fromarray(rgba_goth).save(os.path.join(out_dir, 'dress_gothic.png'))

# 3. Sweet Maid
gray = cv2.cvtColor(arr_clean_dress[:, :, :3], cv2.COLOR_RGB2GRAY)
is_light = gray > 215
maid_rgb = np.where(is_light[:, :, None], np.array([255, 255, 255], dtype=np.uint8), (gray[:, :, None] * 0.3).astype(np.uint8))
rgba_maid = np.dstack([maid_rgb[:, :, 0], maid_rgb[:, :, 1], maid_rgb[:, :, 2], arr_clean_dress[:, :, 3]])
Image.fromarray(rgba_maid).save(os.path.join(out_dir, 'dress_maid.png'))

# 4. Cozy Sweater
hsv_sw = hsv.copy()
hsv_sw[:, :, 0] = (hsv_sw[:, :, 0] + 160) % 180
hsv_sw[:, :, 1] = (hsv_sw[:, :, 1] * 0.6).astype(np.uint8)
bgr_sw = cv2.cvtColor(hsv_sw, cv2.COLOR_HSV2BGR)
rgba_sw = np.dstack([bgr_sw[:, :, 2], bgr_sw[:, :, 1], bgr_sw[:, :, 0], arr_clean_dress[:, :, 3]])
Image.fromarray(rgba_sw).save(os.path.join(out_dir, 'dress_cozy_sweater.png'))

print("Polygon precision clipped all dresses!")
