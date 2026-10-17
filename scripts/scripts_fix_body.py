from PIL import Image
import numpy as np

doll = Image.open('c:/Users/adi/Desktop/zoey/public/assets/chibi/doll_clean.png').convert('RGBA')
arr_doll = np.array(doll)

# Body should have:
# 1. Face & head skin & ears (Y: 150 to 440)
# 2. Legs (Y: 790 to 1120)
# All other parts covered by clothing
body_mask = np.zeros((1200, 896), dtype=bool)
# Head & face & neck:
body_mask[100:445, 280:615] = True
# Legs:
body_mask[780:1120, 340:555] = True

body_layer = np.zeros_like(arr_doll)
body_layer[body_mask] = arr_doll[body_mask]

# Save pristine body
Image.fromarray(body_layer).save('c:/Users/adi/Desktop/zoey/public/assets/chibi/body_base.png')
print("Body base cleaned to perfection!")
