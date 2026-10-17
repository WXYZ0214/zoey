import cv2
import numpy as np
from PIL import Image, ImageDraw
import os

out_dir = r'c:\Users\adi\Desktop\zoey\public\assets\chibi'

# 1. Winking eyes (left eye open, right eye closed)
eyes_sparkle = Image.open(os.path.join(out_dir, 'eyes_sparkle.png')).convert('RGBA')
arr_wink = np.array(eyes_sparkle)
# Erase right eye (x > 460)
arr_wink[:, 460:] = 0
wink_pil = Image.fromarray(arr_wink)
draw = ImageDraw.Draw(wink_pil)
# Draw cute closed winking arc on right eye: (480, 315) to (540, 315)
draw.arc([480, 295, 545, 335], start=0, end=180, fill=(75, 45, 60, 255), width=6)
# Cute eyelashes
draw.line([540, 315, 552, 305], fill=(75, 45, 60, 255), width=4)
draw.line([542, 320, 556, 318], fill=(75, 45, 60, 255), width=4)
wink_pil.save(os.path.join(out_dir, 'eyes_wink.png'))
print("Generated: eyes_wink.png")

# 2. Smiling closed eyes ^_^
arr_smile_eyes = np.zeros_like(arr_wink)
smile_eyes_pil = Image.fromarray(arr_smile_eyes)
draw_se = ImageDraw.Draw(smile_eyes_pil)
# Left eye arc
draw_se.arc([360, 295, 425, 335], start=0, end=180, fill=(75, 45, 60, 255), width=6)
draw_se.line([420, 315, 432, 305], fill=(75, 45, 60, 255), width=4)
# Right eye arc
draw_se.arc([480, 295, 545, 335], start=0, end=180, fill=(75, 45, 60, 255), width=6)
draw_se.line([540, 315, 552, 305], fill=(75, 45, 60, 255), width=4)
smile_eyes_pil.save(os.path.join(out_dir, 'eyes_smile.png'))
print("Generated: eyes_smile.png")

# 3. Heart Blush
arr_hearts = np.zeros_like(arr_wink)
hearts_pil = Image.fromarray(arr_hearts)
draw_h = ImageDraw.Draw(hearts_pil)
# Left heart
draw_h.polygon([(360, 365), (370, 355), (380, 365), (370, 375)], fill=(255, 140, 165, 220))
# Right heart
draw_h.polygon([(525, 365), (535, 355), (545, 365), (535, 375)], fill=(255, 140, 165, 220))
hearts_pil.save(os.path.join(out_dir, 'blush_hearts.png'))
print("Generated: blush_hearts.png")

# 4. Long Wavy Back Hair
twintails = Image.open(os.path.join(out_dir, 'hair_twintails.png')).convert('RGBA')
arr_tw = np.array(twintails)
# Fill central gap behind shoulders for long flowing hair
long_hair = arr_tw.copy()
# Blur and extend hair into middle
for y in range(300, 750):
    # Left hair strand width
    long_hair[y, 250:650] = np.where(long_hair[y, 250:650, 3:4] == 0, [250, 205, 220, 255], long_hair[y, 250:650])
# Edge shadow
Image.fromarray(long_hair).save(os.path.join(out_dir, 'hair_long_wave.png'))
print("Generated: hair_long_wave.png")
