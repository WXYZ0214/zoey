import cv2
import numpy as np
import os
from PIL import Image

brain_dir = r"C:\Users\adi\.gemini\antigravity\brain\872f7ac1-4e3b-4856-b081-35af089a90cc"
out_dir = r"c:\Users\adi\Desktop\zoey\public\assets\chibi"
os.makedirs(out_dir, exist_ok=True)

def remove_white_bg(img_bgr, threshold=242):
    r = img_bgr[:, :, 2].astype(float)
    g = img_bgr[:, :, 1].astype(float)
    b = img_bgr[:, :, 0].astype(float)
    is_white = (r > threshold) & (g > threshold) & (b > threshold)
    
    h, w = img_bgr.shape[:2]
    mask = np.zeros((h + 2, w + 2), dtype=np.uint8)
    mask[1:-1, 1:-1] = np.where(is_white, 0, 1).astype(np.uint8)
    cv2.floodFill(mask, None, (0, 0), 2)
    is_bg = (mask[1:-1, 1:-1] == 2)
    
    alpha = np.where(is_bg, 0, 255).astype(np.uint8)
    alpha = cv2.GaussianBlur(alpha, (3, 3), 0)
    
    rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
    return np.dstack([rgb, alpha])

# 1. BASE MANNEQUIN
print("Extracting base mannequin...")
mannequin_bgr = cv2.imread(os.path.join(brain_dir, "chibi_nude_mannequin_1793284543050.jpg"))
mannequin_rgba = remove_white_bg(mannequin_bgr, threshold=245)
Image.fromarray(mannequin_rgba).save(os.path.join(out_dir, "body_base.png"))

# 2. STREETWEAR (Hoodie + Denim Shorts + Platform Sneakers + Cat Ears)
print("Extracting streetwear...")
street_bgr = cv2.imread(os.path.join(brain_dir, "chibi_outfit_streetwear_1793284614518.jpg"))
street_rgba = remove_white_bg(street_bgr, threshold=245)

# Hoodie
hoodie = np.zeros_like(street_rgba)
hoodie[415:625, 140:760] = street_rgba[415:625, 140:760]
# Exclude exposed midriff skin
skin_ref = mannequin_rgba[220, 448, :3]
mid = hoodie[575:625, 415:485]
diff_mid = np.linalg.norm(mid[:, :, :3].astype(float) - skin_ref.astype(float), axis=2)
mid[diff_mid < 45] = 0
hoodie[575:625, 415:485] = mid
Image.fromarray(hoodie).save(os.path.join(out_dir, "top_crop_hoodie.png"))

# Denim Shorts
shorts = np.zeros_like(street_rgba)
shorts[580:755, 310:590] = street_rgba[580:755, 310:590]
Image.fromarray(shorts).save(os.path.join(out_dir, "bottom_denim_shorts.png"))

# Platform Sneakers
sneakers = np.zeros_like(street_rgba)
sneakers[970:1165, 330:570] = street_rgba[970:1165, 330:570]
Image.fromarray(sneakers).save(os.path.join(out_dir, "shoes_sneakers.png"))

# 3. MAID DRESS (Down to y=840 to include all lace ruffles)
print("Extracting maid dress...")
maid_bgr = cv2.imread(os.path.join(brain_dir, "chibi_outfit_maid_1793284565678.jpg"))
maid_rgba = remove_white_bg(maid_bgr, threshold=245)

maid_dress = np.zeros_like(maid_rgba)
# Include dress from y=415 to y=840, x=170..730
maid_dress[415:840, 170:730] = maid_rgba[415:840, 170:730]
# Clean out any skin between skirt bottom and legs if any
# Skirt bottom at center is around y=835
Image.fromarray(maid_dress).save(os.path.join(out_dir, "dress_maid.png"))

# Mary Janes
maid_shoes = np.zeros_like(maid_rgba)
maid_shoes[970:1145, 330:570] = maid_rgba[970:1145, 330:570]
Image.fromarray(maid_shoes).save(os.path.join(out_dir, "shoes_black_loafers.png"))

# 4. YUKATA (Down to y=1020)
print("Extracting yukata...")
yukata_bgr = cv2.imread(os.path.join(brain_dir, "chibi_outfit_yukata_1793284588407.jpg"))
yukata_rgba = remove_white_bg(yukata_bgr, threshold=245)

yukata_dress = np.zeros_like(yukata_rgba)
yukata_dress[415:1020, 170:730] = yukata_rgba[415:1020, 170:730]
Image.fromarray(yukata_dress).save(os.path.join(out_dir, "dress_yukata.png"))

# Geta sandals
geta = np.zeros_like(yukata_rgba)
geta[1020:1155, 330:570] = yukata_rgba[1020:1155, 330:570]
Image.fromarray(geta).save(os.path.join(out_dir, "shoes_bear_slippers.png"))

# 5. PLUSH BUNNY
print("Extracting plush bunny...")
bunny_bgr = cv2.imread(os.path.join(brain_dir, "chibi_acc_plush_bunny_1793284636095.jpg"))
bunny_rgba = remove_white_bg(bunny_bgr, threshold=245)
ys, xs = np.where(bunny_rgba[:, :, 3] > 0)
bunny_tight = bunny_rgba[ys.min():ys.max()+1, xs.min():xs.max()+1]
bunny_pil = Image.fromarray(bunny_tight).resize((220, 270), Image.Resampling.LANCZOS)
bunny_full = Image.new("RGBA", (896, 1200), (0, 0, 0, 0))
bunny_full.paste(bunny_pil, (150, 480))
bunny_full.save(os.path.join(out_dir, "acc_bunny.png"))

print("Extracted all layers cleanly!")
