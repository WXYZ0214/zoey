import cv2
import numpy as np
from PIL import Image, ImageEnhance, ImageFilter
import os

src_path = r'C:\Users\adi\.gemini\antigravity\brain\872f7ac1-4e3b-4856-b081-35af089a90cc\style_01_pastel_chibi_1792211860162.jpg'
img = cv2.imread(src_path)
h, w = img.shape[:2]

out_dir = r'c:\Users\adi\Desktop\zoey\public\assets\chibi'
os.makedirs(out_dir, exist_ok=True)

# 1. Clean background extraction
# Background color is ~ (250, 216, 226) in BGR
bg_bgr = np.array([250, 216, 226], dtype=np.float32)
dist = np.linalg.norm(img.astype(np.float32) - bg_bgr, axis=2)

# Glow color is ~ (252, 230, 240) which has dist < 22
# The character's outer outline is dark purple/pink with dist > 40
mask = np.zeros((h, w), dtype=np.uint8)
mask[dist > 25] = 255

# Remove stray noise in the background
num_labels, labels, stats, centroids = cv2.connectedComponentsWithStats(mask)
# Keep only the largest component (the doll)
largest_label = 1 + np.argmax(stats[1:, cv2.CC_STAT_AREA])
mask = np.where(labels == largest_label, 255, 0).astype('uint8')

# Fill internal holes (e.g. within arms/dress)
kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7))
mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel)

# Slight antialiasing
alpha = cv2.GaussianBlur(mask, (3, 3), 0)

b, g, r = cv2.split(img)
rgba = cv2.merge([r, g, b, alpha])
full_doll = Image.fromarray(rgba)
full_doll.save(os.path.join(out_dir, 'doll_clean.png'))

print("Extracted doll_clean.png successfully!")
