import cv2
import numpy as np
from PIL import Image

body = Image.open('c:/Users/adi/Desktop/zoey/public/assets/chibi/body_base.png').convert('RGBA')
arr_body = np.array(body)

# Mask for eyes and mouth to inpaint with skin color
inpaint_mask = np.zeros((1200, 896), dtype=np.uint8)
# Left eye
inpaint_mask[265:360, 365:445] = 255
# Right eye
inpaint_mask[265:360, 465:545] = 255
# Mouth
inpaint_mask[385:410, 435:475] = 255

# Inpaint RGB channels with Navier-Stokes
rgb = arr_body[:, :, :3]
inpainted = cv2.inpaint(rgb, inpaint_mask, 7, cv2.INPAINT_NS)

# Merge back with original alpha
body_blank_face = np.dstack([inpainted[:, :, 0], inpainted[:, :, 1], inpainted[:, :, 2], arr_body[:, :, 3]])
Image.fromarray(body_blank_face).save('c:/Users/adi/Desktop/zoey/public/assets/chibi/body_blank_face.png')
print("Created body_blank_face.png successfully!")
