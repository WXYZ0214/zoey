import cv2
import numpy as np
from PIL import Image
import os

out_dir = r'c:\Users\adi\Desktop\zoey\public\assets\chibi'

# 1. Clean up dress layer to remove any hair strands on left/right
dress_orig = Image.open(os.path.join(out_dir, 'dress_sailor_frill.png')).convert('RGBA')
arr_dress = np.array(dress_orig)

# The twintails are on left (x < 350, y < 580) and right (x > 540, y < 580)
# Pixels in twintail area that have pink hair color should be removed
is_hair = (arr_dress[:, :, 0] > 210) & (arr_dress[:, :, 1] > 160) & (arr_dress[:, :, 2] > 180) & (arr_dress[:, :, 0] < 255)
# Left twintail area
arr_dress[:580, :350][is_hair[:580, :350]] = 0
# Right twintail area
arr_dress[:580, 540:][is_hair[:580, 540:]] = 0

# Save pristine dress
pristine_dress = Image.fromarray(arr_dress)
pristine_dress.save(os.path.join(out_dir, 'dress_sailor_frill.png'))

# Re-derive color variations from pristine dress
# Strawberry Pink & Cream Dress
hsv = cv2.cvtColor(cv2.cvtColor(arr_dress, cv2.COLOR_RGBA2BGR), cv2.COLOR_BGR2HSV)
hsv_pink = hsv.copy()
# Shift mint/lavender to strawberry pink & warm peach
hsv_pink[:, :, 0] = (hsv_pink[:, :, 0] + 55) % 180
bgr_pink = cv2.cvtColor(hsv_pink, cv2.COLOR_HSV2BGR)
rgba_pink = np.dstack([bgr_pink[:, :, 2], bgr_pink[:, :, 1], bgr_pink[:, :, 0], arr_dress[:, :, 3]])
Image.fromarray(rgba_pink).save(os.path.join(out_dir, 'dress_strawberry.png'))

# Gothic Lolita Dress (Velvet Wine & Midnight)
hsv_goth = hsv.copy()
hsv_goth[:, :, 2] = (hsv_goth[:, :, 2] * 0.42).astype(np.uint8)
hsv_goth[:, :, 1] = (hsv_goth[:, :, 1] * 1.3).clip(0, 255).astype(np.uint8)
bgr_goth = cv2.cvtColor(hsv_goth, cv2.COLOR_HSV2BGR)
rgba_goth = np.dstack([bgr_goth[:, :, 2], bgr_goth[:, :, 1], bgr_goth[:, :, 0], arr_dress[:, :, 3]])
Image.fromarray(rgba_goth).save(os.path.join(out_dir, 'dress_gothic.png'))

# Sweet Maid Lolita Dress (Crisp White Apron & Obsidian Black)
gray = cv2.cvtColor(arr_dress[:, :, :3], cv2.COLOR_RGB2GRAY)
maid_bgr = np.dstack([gray, gray, gray])
# Darken mint/lavender parts to deep black-blue, keep frills white
is_light = gray > 215
maid_rgb = np.where(is_light[:, :, None], np.array([255, 255, 255], dtype=np.uint8), (gray[:, :, None] * 0.3).astype(np.uint8))
rgba_maid = np.dstack([maid_rgb[:, :, 0], maid_rgb[:, :, 1], maid_rgb[:, :, 2], arr_dress[:, :, 3]])
Image.fromarray(rgba_maid).save(os.path.join(out_dir, 'dress_maid.png'))

# Cozy Knit Sweater Dress
hsv_sw = hsv.copy()
hsv_sw[:, :, 0] = (hsv_sw[:, :, 0] + 160) % 180
hsv_sw[:, :, 1] = (hsv_sw[:, :, 1] * 0.6).astype(np.uint8)
bgr_sw = cv2.cvtColor(hsv_sw, cv2.COLOR_HSV2BGR)
rgba_sw = np.dstack([bgr_sw[:, :, 2], bgr_sw[:, :, 1], bgr_sw[:, :, 0], arr_dress[:, :, 3]])
Image.fromarray(rgba_sw).save(os.path.join(out_dir, 'dress_cozy_sweater.png'))

print("Cleaned up and re-exported all dress variations!")
