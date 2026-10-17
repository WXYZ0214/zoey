import cv2
import numpy as np
from PIL import Image, ImageEnhance, ImageFilter, ImageOps
import os

src_path = r'c:\Users\adi\Desktop\zoey\public\assets\chibi\doll_clean.png'
base_img = Image.open(src_path).convert('RGBA')
w, h = base_img.size

out_dir = r'c:\Users\adi\Desktop\zoey\public\assets\chibi'

# Convert to numpy for easy masking
arr = np.array(base_img)
r, g, b, a = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2], arr[:, :, 3]

def save_layer(mask, filename):
    layer_a = np.where(mask, a, 0).astype(np.uint8)
    layer = np.dstack([r, g, b, layer_a])
    img_out = Image.fromarray(layer)
    img_out.save(os.path.join(out_dir, filename))
    print(f"Saved: {filename}")
    return img_out

# Coordinates for 896 x 1200:
# 1. Hair ribbons (with star charms)
ribbon_mask = np.zeros((h, w), dtype=bool)
# Left ribbon around (250~360, 95~260)
ribbon_mask[95:260, 240:360] = True
# Right ribbon around (530~650, 95~260)
ribbon_mask[95:260, 530:650] = True
# Only pixels that have blue/purple ribbon color (high blue, lower red than hair)
is_ribbon_color = (b.astype(int) > r.astype(int) - 15) & (g.astype(int) > 170)
ribbon_mask = ribbon_mask & is_ribbon_color
save_layer(ribbon_mask, 'acc_ribbons.png')

# 2. Twintails (Back hair left & right)
twintail_mask = np.zeros((h, w), dtype=bool)
# Left twintail
twintail_mask[100:560, 110:325] = True
# Right twintail
twintail_mask[100:560, 570:785] = True
# Exclude ribbons
twintail_mask = twintail_mask & (~ribbon_mask) & (a > 50)
save_layer(twintail_mask, 'hair_twintails.png')

# 3. Front Hair (Bangs & side curls)
bangs_mask = np.zeros((h, w), dtype=bool)
bangs_mask[85:445, 300:595] = True
# Also include side curls down to 445
bangs_mask[220:445, 270:340] = True
bangs_mask[220:445, 555:625] = True
# Exclude eyes/brows area
eye_area = np.zeros((h, w), dtype=bool)
eye_area[270:370, 360:535] = True
bangs_mask = (bangs_mask & ~eye_area & (a > 50)) | (bangs_mask & (b > 180) & (r > 200))
save_layer(bangs_mask, 'hair_bangs.png')

# 4. Eyes & Eyebrows
eyes_mask = np.zeros((h, w), dtype=bool)
eyes_mask[260:375, 350:545] = True
# Keep only eyes/eyebrows and eyelashes (dark or purple eyes)
is_eye = (r.astype(int) + g.astype(int) + b.astype(int) < 680) & (a > 50)
eyes_mask = eyes_mask & is_eye
save_layer(eyes_mask, 'face_eyes.png')

# 5. Blush & Lips
blush_mask = np.zeros((h, w), dtype=bool)
blush_mask[340:415, 350:545] = True
is_blush_lip = (r > 230) & (g < 205) & (a > 50)
blush_mask = blush_mask & is_blush_lip
save_layer(blush_mask, 'face_blush.png')

# 6. Dress & Sleeves
dress_mask = np.zeros((h, w), dtype=bool)
dress_mask[420:850, 200:695] = True
dress_mask = dress_mask & (a > 50)
save_layer(dress_mask, 'dress_sailor_frill.png')

# 7. Shoes & Socks
shoes_mask = np.zeros((h, w), dtype=bool)
shoes_mask[850:1130, 340:555] = True
shoes_mask = shoes_mask & (a > 50)
save_layer(shoes_mask, 'shoes_mary_janes.png')

# 8. Base Body (Head, face skin, neck, arms, legs)
body_mask = (a > 50) & (~twintail_mask) & (~dress_mask) & (~shoes_mask) & (~ribbon_mask)
save_layer(body_mask, 'body_base.png')

print("All primary layers separated successfully!")
