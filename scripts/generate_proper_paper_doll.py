import os
import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

out_dir = r"c:\Users\adi\Desktop\zoey\public\assets\chibi"
os.makedirs(out_dir, exist_ok=True)

# Load original
orig_path = r"C:\Users\adi\.gemini\antigravity\brain\872f7ac1-4e3b-4856-b081-35af089a90cc\style_01_pastel_chibi_1792211860162.jpg"
orig_bgr = cv2.imread(orig_path)
orig_rgb = cv2.cvtColor(orig_bgr, cv2.COLOR_BGR2RGB)
h, w = orig_rgb.shape[:2]

LINE_COLOR = (72, 50, 68, 255)
SKIN_BASE = (255, 240, 234, 255)
SKIN_SHADOW = (248, 218, 210, 255)
SKIN_BLUSH = (255, 185, 195, 180)
WHITE_UNDERWEAR = (255, 252, 250, 255)
UNDERWEAR_LACE = (255, 225, 235, 255)
UNDERWEAR_LINE = (210, 175, 190, 255)

def blank():
    return np.zeros((h, w, 4), dtype=np.uint8)

def save_layer(img_arr, filename):
    Image.fromarray(img_arr).save(os.path.join(out_dir, filename))
    print(f"Saved: {filename}")

# ==============================================================================
# 1. CLEAN CHIBI MANNEQUIN BASE BODY (Head + Torso + Undergarment + Legs + Hands)
# ==============================================================================
# Head from original (face cleaned: eyes/mouth removed for makeup system)
base_img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
draw = ImageDraw.Draw(base_img)

# Head & neck from original
# Read existing body_base if available or orig
existing_base_path = os.path.join(out_dir, "body_base.png")
if os.path.exists(existing_base_path):
    existing_base = Image.open(existing_base_path).convert("RGBA")
    # Take head and neck (y=150..470)
    head_crop = existing_base.crop((280, 150, 616, 470))
    base_img.paste(head_crop, (280, 150))
    # Calves & feet (y=860..1150)
    legs_crop = existing_base.crop((340, 860, 560, 1150))
    base_img.paste(legs_crop, (340, 860))

# Now draw continuous smooth chibi torso, waist, underwear, and thighs
# Torso & Shoulders: y=465..620
# Shoulders at y=480: x=365 to 531
# Waist at y=580: x=395 to 501
# Hips at y=650: x=375 to 521
# Thighs down to y=870: left thigh x=365..440, right thigh x=456..531

# Underwear Camisole & Panties + Skin
torso_skin = [
    (410, 465), (365, 485), (350, 520), (385, 580),
    (375, 650), (360, 720), (365, 870), (442, 870),
    (446, 750), (450, 750), (454, 870), (531, 870),
    (536, 720), (521, 650), (511, 580), (546, 520),
    (531, 485), (486, 465)
]
draw.polygon(torso_skin, fill=SKIN_BASE)

# Thigh shadows & soft inner contours
draw.polygon([(435, 740), (446, 750), (457, 740), (452, 870), (444, 870)], fill=SKIN_SHADOW)
draw.ellipse([435, 680, 461, 740], fill=SKIN_SHADOW)

# Cute Pastel Underwear Top (Camisole: y=505..590)
draw.polygon([(368, 510), (355, 540), (385, 585), (511, 585), (541, 540), (528, 510), (480, 525), (448, 528), (416, 525)], fill=WHITE_UNDERWEAR, outline=UNDERWEAR_LINE, width=2)
# Tiny cute ribbon on camisole
draw.polygon([(444, 525), (436, 520), (438, 532)], fill=UNDERWEAR_LACE)
draw.polygon([(452, 525), (460, 520), (458, 532)], fill=UNDERWEAR_LACE)
draw.ellipse([445, 523, 451, 529], fill=LINE_COLOR)

# Cute Pastel Panties / Bloomers (y=610..695)
draw.polygon([(380, 615), (516, 615), (528, 665), (465, 700), (448, 695), (431, 700), (368, 665)], fill=WHITE_UNDERWEAR, outline=UNDERWEAR_LINE, width=2)
# Lace frill border on panties
for lx in range(375, 520, 8):
    draw.arc([lx, 610, lx+8, 620], start=0, end=180, fill=UNDERWEAR_LACE, width=2)
draw.arc([370, 660, 440, 705], start=45, end=180, fill=UNDERWEAR_LACE, width=2)
draw.arc([456, 660, 526, 705], start=0, end=135, fill=UNDERWEAR_LACE, width=2)

# Torso & Thigh Outlines
draw.line([(365, 485), (350, 520), (385, 580), (375, 650), (360, 720), (365, 870)], fill=LINE_COLOR, width=3)
draw.line([(531, 485), (546, 520), (511, 580), (521, 650), (536, 720), (531, 870)], fill=LINE_COLOR, width=3)
draw.line([(442, 870), (446, 750), (450, 750), (454, 870)], fill=LINE_COLOR, width=3)

# Knees blush & highlight (around y=850)
draw.ellipse([385, 835, 420, 865], fill=SKIN_BLUSH)
draw.ellipse([476, 835, 511, 865], fill=SKIN_BLUSH)

# Clasped hands at y=640..730, x=405..491
# Forearms
draw.polygon([(360, 530), (410, 655), (440, 655), (375, 530)], fill=SKIN_BASE)
draw.polygon([(536, 530), (486, 655), (456, 655), (521, 530)], fill=SKIN_BASE)
draw.line([(360, 530), (410, 655)], fill=LINE_COLOR, width=3)
draw.line([(536, 530), (486, 655)], fill=LINE_COLOR, width=3)

# Clasped cute chibi fingers (clean hands)
draw.ellipse([412, 645, 484, 715], fill=SKIN_BASE, outline=LINE_COLOR, width=3)
# Finger detail lines
draw.line([(435, 665), (455, 680)], fill=LINE_COLOR, width=2)
draw.line([(440, 675), (460, 690)], fill=LINE_COLOR, width=2)
draw.line([(445, 685), (465, 700)], fill=LINE_COLOR, width=2)

base_img.save(os.path.join(out_dir, "body_base.png"))
print("Saved clean mannequin body_base.png!")

# ==============================================================================
# 2. DISTINCT SPLIT TOPS (Each has unique cut, sleeves & details)
# ==============================================================================

# A. top_sailor.png - Classic Sailor Blouse with Navy Collar & Bow
img_ts = Image.new("RGBA", (w, h), (0, 0, 0, 0))
d = ImageDraw.Draw(img_ts)
# Bodice
d.polygon([(400, 465), (350, 500), (375, 615), (521, 615), (546, 500), (496, 465)], fill=(255, 255, 255, 255), outline=LINE_COLOR, width=3)
# Short Puffed Sleeves
d.ellipse([325, 485, 385, 575], fill=(255, 255, 255, 255), outline=LINE_COLOR, width=3)
d.ellipse([511, 485, 571, 575], fill=(255, 255, 255, 255), outline=LINE_COLOR, width=3)
# Sleeve cuffs with stripe
d.rectangle([335, 560, 375, 575], fill=(130, 180, 240, 255), outline=LINE_COLOR, width=2)
d.rectangle([521, 560, 561, 575], fill=(130, 180, 240, 255), outline=LINE_COLOR, width=2)
# Sailor Flap Collar
d.polygon([(390, 465), (345, 515), (410, 555), (448, 565), (486, 555), (551, 515), (506, 465)], fill=(130, 180, 240, 255), outline=LINE_COLOR, width=3)
# White stripes on collar
d.line([(352, 510), (410, 548)], fill=(255, 255, 255, 255), width=3)
d.line([(544, 510), (486, 548)], fill=(255, 255, 255, 255), width=3)
# Red Tie / Ribbon
d.polygon([(435, 550), (410, 600), (435, 625), (448, 565)], fill=(255, 90, 115, 255), outline=LINE_COLOR, width=2)
d.polygon([(461, 550), (486, 600), (461, 625), (448, 565)], fill=(255, 90, 115, 255), outline=LINE_COLOR, width=2)
d.ellipse([438, 550, 458, 568], fill=(255, 90, 115, 255), outline=LINE_COLOR, width=2)
img_ts.save(os.path.join(out_dir, "top_sailor.png"))

# B. top_off_shoulder.png - Off-Shoulder Frill Ruffled Blouse (exposes collarbones)
img_os = Image.new("RGBA", (w, h), (0, 0, 0, 0))
d = ImageDraw.Draw(img_os)
# Main body below shoulders
d.polygon([(380, 520), (370, 615), (526, 615), (516, 520)], fill=(255, 235, 245, 255), outline=LINE_COLOR, width=3)
# Ruffled dropped bubble sleeves
d.ellipse([315, 515, 385, 610], fill=(255, 235, 245, 255), outline=LINE_COLOR, width=3)
d.ellipse([511, 515, 581, 610], fill=(255, 235, 245, 255), outline=LINE_COLOR, width=3)
# Off-shoulder ruffled top trim
for rx in range(330, 550, 14):
    d.arc([rx, 508, rx+14, 526], start=0, end=180, fill=(255, 160, 195, 255), width=3)
d.line([(340, 515), (556, 515)], fill=(255, 140, 180, 255), width=4)
# Gold Heart Pendant at center
d.ellipse([442, 530, 454, 542], fill=(255, 215, 100, 255), outline=LINE_COLOR, width=2)
img_os.save(os.path.join(out_dir, "top_off_shoulder.png"))

# C. top_sweater.png - Cozy Cable Knit Sweater
img_sw = Image.new("RGBA", (w, h), (0, 0, 0, 0))
d = ImageDraw.Draw(img_sw)
# Baggy sleeves & body
d.polygon([(395, 465), (330, 510), (345, 630), (390, 630), (405, 665), (491, 665), (506, 630), (551, 630), (566, 510), (501, 465)], fill=(245, 225, 205, 255), outline=LINE_COLOR, width=3)
# Cable knit vertical ribs
for kx in [425, 448, 471]:
    for ky in range(485, 640, 18):
        d.arc([kx-8, ky, kx+8, ky+16], start=180, end=360, fill=(225, 200, 175, 255), width=3)
# Ribbed hem & collar
d.rectangle([400, 645, 496, 665], fill=(230, 205, 180, 255), outline=LINE_COLOR, width=2)
d.ellipse([410, 460, 486, 485], fill=(230, 205, 180, 255), outline=LINE_COLOR, width=3)
img_sw.save(os.path.join(out_dir, "top_sweater.png"))

# D. top_crop_hoodie.png - Streetwear Cropped Hoodie with Kangaroo Pocket
img_hd = Image.new("RGBA", (w, h), (0, 0, 0, 0))
d = ImageDraw.Draw(img_hd)
# Hood silhouette behind neck
d.ellipse([365, 445, 531, 505], fill=(160, 190, 225, 255), outline=LINE_COLOR, width=3)
# Hoodie body (cropped high)
d.polygon([(390, 470), (335, 505), (360, 580), (536, 580), (561, 505), (506, 470)], fill=(185, 215, 245, 255), outline=LINE_COLOR, width=3)
# Front Kangaroo Pocket
d.polygon([(405, 545), (491, 545), (480, 580), (416, 580)], fill=(160, 195, 230, 255), outline=LINE_COLOR, width=2)
# Drawstrings hanging down
d.line([(430, 485), (426, 550)], fill=(255, 255, 255, 255), width=3)
d.line([(466, 485), (470, 550)], fill=(255, 255, 255, 255), width=3)
d.ellipse([422, 548, 430, 556], fill=(255, 215, 100, 255))
d.ellipse([466, 548, 474, 556], fill=(255, 215, 100, 255))
img_hd.save(os.path.join(out_dir, "top_crop_hoodie.png"))

# E. top_cardigan.png - Buttoned School Cardigan + Inner Collared Shirt
img_cd = Image.new("RGBA", (w, h), (0, 0, 0, 0))
d = ImageDraw.Draw(img_cd)
# Inner white shirt & tie
d.polygon([(420, 465), (448, 520), (476, 465)], fill=(255, 255, 255, 255))
d.polygon([(444, 480), (438, 540), (448, 555), (458, 540), (452, 480)], fill=(220, 50, 70, 255), outline=LINE_COLOR, width=2)
# Cardigan body & sleeves
d.polygon([(395, 470), (330, 510), (365, 620), (425, 620), (448, 525), (471, 620), (531, 620), (566, 510), (501, 470)], fill=(225, 215, 240, 255), outline=LINE_COLOR, width=3)
# Cardigan buttons
for by in [545, 575, 605]:
    d.ellipse([444, by, 452, by+8], fill=(255, 215, 120, 255), outline=LINE_COLOR, width=2)
img_cd.save(os.path.join(out_dir, "top_cardigan.png"))

print("Saved all 5 distinct split tops!")

# ==============================================================================
# 3. DISTINCT SPLIT BOTTOMS (Skirts & Pants with Real Folds, Cut & Shading)
# ==============================================================================

# A. bottom_pleated_skirt.png - Classic High-Waist Flared Tennis Skirt
img_ps = Image.new("RGBA", (w, h), (0, 0, 0, 0))
d = ImageDraw.Draw(img_ps)
# Skirt trapezoid
d.polygon([(385, 605), (511, 605), (560, 755), (336, 755)], fill=(75, 95, 155, 255), outline=LINE_COLOR, width=3)
# Vertical pleat fold shadows
for px in range(355, 545, 18):
    d.line([(px, 608), (int(px * 1.08 - 35), 755)], fill=(50, 68, 115, 255), width=3)
    d.line([(px+5, 608), (int((px+5) * 1.08 - 35), 755)], fill=(110, 135, 205, 255), width=2)
# Hem white racing stripe
d.line([(342, 742), (554, 742)], fill=(255, 255, 255, 255), width=3)
img_ps.save(os.path.join(out_dir, "bottom_pleated_skirt.png"))

# B. bottom_ruffle_skirt.png - Tiered Lolita Cupcake Ruffle Skirt
img_rs = Image.new("RGBA", (w, h), (0, 0, 0, 0))
d = ImageDraw.Draw(img_rs)
# Tier 1
d.polygon([(385, 605), (511, 605), (535, 675), (361, 675)], fill=(255, 215, 230, 255), outline=LINE_COLOR, width=3)
# Tier 2
d.polygon([(361, 670), (535, 670), (565, 745), (331, 745)], fill=(255, 185, 210, 255), outline=LINE_COLOR, width=3)
# Scalloped lace hem
for lx in range(330, 560, 16):
    d.arc([lx, 735, lx+16, 755], start=0, end=180, fill=(255, 255, 255, 255), width=4)
# Cute bow at waistband
d.polygon([(448, 610), (432, 600), (434, 620)], fill=(255, 90, 130, 255))
d.polygon([(448, 610), (464, 600), (462, 620)], fill=(255, 90, 130, 255))
d.ellipse([444, 606, 452, 614], fill=(255, 255, 255, 255))
img_rs.save(os.path.join(out_dir, "bottom_ruffle_skirt.png"))

# C. bottom_denim_shorts.png - Real Anime Denim Shorts (with pockets & cuffs)
img_ds = Image.new("RGBA", (w, h), (0, 0, 0, 0))
d = ImageDraw.Draw(img_ds)
# Denim body
d.polygon([(385, 605), (511, 605), (536, 725), (460, 725), (448, 680), (436, 725), (360, 725)], fill=(100, 150, 215, 255), outline=LINE_COLOR, width=3)
# Rolled cuffs
d.rectangle([356, 712, 438, 730], fill=(185, 215, 248, 255), outline=LINE_COLOR, width=2)
d.rectangle([458, 712, 540, 730], fill=(185, 215, 248, 255), outline=LINE_COLOR, width=2)
# Front fly & bronze button
d.line([(448, 608), (448, 665)], fill=(65, 105, 165, 255), width=3)
d.ellipse([444, 612, 452, 620], fill=(245, 195, 75, 255), outline=LINE_COLOR, width=2)
# Curved pocket seams
d.arc([385, 615, 425, 665], start=0, end=90, fill=(245, 205, 115, 255), width=2)
d.arc([471, 615, 511, 665], start=90, end=180, fill=(245, 205, 115, 255), width=2)
img_ds.save(os.path.join(out_dir, "bottom_denim_shorts.png"))

# D. bottom_cargo_pants.png - Baggy Pastel Cargo Streetwear Pants
img_cp = Image.new("RGBA", (w, h), (0, 0, 0, 0))
d = ImageDraw.Draw(img_cp)
# Wide baggy legs down to ankles (y=605..1030)
d.polygon([(385, 605), (511, 605), (546, 1030), (465, 1030), (448, 710), (431, 1030), (350, 1030)], fill=(215, 235, 225, 255), outline=LINE_COLOR, width=3)
# Big Flap Cargo Pockets on sides
d.rounded_rectangle([340, 770, 375, 855], radius=6, fill=(195, 220, 205, 255), outline=LINE_COLOR, width=2)
d.rounded_rectangle([521, 770, 556, 855], radius=6, fill=(195, 220, 205, 255), outline=LINE_COLOR, width=2)
# Pocket flap buttons
d.ellipse([355, 775, 361, 781], fill=(85, 105, 95, 255))
d.ellipse([535, 775, 541, 781], fill=(85, 105, 95, 255))
# Tapered ankle cuff elastics
d.rectangle([348, 1018, 433, 1032], fill=(175, 200, 185, 255), outline=LINE_COLOR, width=2)
d.rectangle([463, 1018, 548, 1032], fill=(175, 200, 185, 255), outline=LINE_COLOR, width=2)
img_cp.save(os.path.join(out_dir, "bottom_cargo_pants.png"))

# E. bottom_plaid_skirt.png - Tartan Plaid Schoolgirl Pleated Skirt
img_pls = Image.new("RGBA", (w, h), (0, 0, 0, 0))
d = ImageDraw.Draw(img_pls)
d.polygon([(385, 605), (511, 605), (555, 755), (341, 755)], fill=(185, 65, 80, 255), outline=LINE_COLOR, width=3)
# Plaid intersecting lines
for x_g in range(355, 545, 22):
    d.line([(x_g, 605), (int(x_g * 1.08 - 35), 755)], fill=(70, 20, 30, 255), width=3)
for y_g in range(630, 755, 24):
    d.line([(345 + (y_g-605)*0.2, y_g), (551 - (y_g-605)*0.2, y_g)], fill=(245, 215, 120, 200), width=2)
img_pls.save(os.path.join(out_dir, "bottom_plaid_skirt.png"))

print("Saved all 5 distinct split bottoms!")

# ==============================================================================
# 4. DISTINCT FULL DRESSES (Maid, Strawberry, Gothic, Yukata, Sweater Dress)
# ==============================================================================

# A. dress_maid.png - French Maid Dress with White Frill Apron & Bows
img_md = Image.new("RGBA", (w, h), (0, 0, 0, 0))
d = ImageDraw.Draw(img_md)
# Black dress base
d.polygon([(390, 470), (335, 510), (355, 610), (330, 790), (566, 790), (541, 610), (561, 510), (506, 470)], fill=(45, 45, 55, 255), outline=LINE_COLOR, width=3)
# White lace shoulder frills
for fy in range(485, 550, 10):
    d.arc([330, fy, 375, fy+14], start=90, end=270, fill=(255, 255, 255, 255), width=3)
    d.arc([521, fy, 566, fy+14], start=270, end=90, fill=(255, 255, 255, 255), width=3)
# White Apron Bib & Skirt Overlap
d.polygon([(416, 500), (480, 500), (475, 615), (421, 615)], fill=(255, 255, 255, 255), outline=LINE_COLOR, width=2)
d.polygon([(410, 615), (486, 615), (521, 760), (375, 760)], fill=(255, 255, 255, 255), outline=LINE_COLOR, width=2)
# Apron pocket & lace bottom
for ax in range(375, 520, 12):
    d.arc([ax, 752, ax+12, 766], start=0, end=180, fill=(255, 255, 255, 255), width=3)
# Red center ribbon
d.ellipse([442, 515, 454, 527], fill=(245, 65, 85, 255))
d.polygon([(444, 520), (430, 535), (442, 540)], fill=(245, 65, 85, 255))
d.polygon([(452, 520), (466, 535), (454, 540)], fill=(245, 65, 85, 255))
img_md.save(os.path.join(out_dir, "dress_maid.png"))

# B. dress_strawberry.png - Strawberry Cottagecore Sundress
img_sb = Image.new("RGBA", (w, h), (0, 0, 0, 0))
d = ImageDraw.Draw(img_sb)
# Soft pink dress with gingham pattern
d.polygon([(390, 480), (335, 515), (365, 615), (325, 795), (571, 795), (531, 615), (561, 515), (506, 480)], fill=(255, 230, 235, 255), outline=LINE_COLOR, width=3)
# Puffed bubble sleeves
d.ellipse([320, 490, 375, 580], fill=(255, 245, 248, 255), outline=LINE_COLOR, width=3)
d.ellipse([521, 490, 576, 580], fill=(255, 245, 248, 255), outline=LINE_COLOR, width=3)
# Strawberry embroideries on skirt
strawberries = [(380, 710), (448, 730), (516, 710), (410, 660), (486, 660)]
for sx, sy in strawberries:
    d.polygon([(sx, sy-8), (sx-7, sy+4), (sx+7, sy+4)], fill=(245, 55, 75, 255))
    d.polygon([(sx-4, sy-10), (sx, sy-6), (sx+4, sy-10)], fill=(85, 175, 95, 255))
# Scalloped hemline
for hx in range(325, 570, 16):
    d.arc([hx, 786, hx+16, 804], start=0, end=180, fill=(255, 255, 255, 255), width=3)
img_sb.save(os.path.join(out_dir, "dress_strawberry.png"))

# C. dress_gothic.png - Gothic Lolita Velvet Dress with Corset Lacing
img_gt = Image.new("RGBA", (w, h), (0, 0, 0, 0))
d = ImageDraw.Draw(img_gt)
# Dark wine purple dress
d.polygon([(395, 465), (325, 510), (355, 615), (315, 835), (581, 835), (541, 615), (571, 510), (501, 465)], fill=(55, 35, 50, 255), outline=LINE_COLOR, width=3)
# Victorian high neck lace collar
d.rectangle([415, 460, 481, 480], fill=(225, 215, 230, 255), outline=LINE_COLOR, width=2)
# Front bodice corset cross lacing
for cy in range(510, 600, 16):
    d.line([(426, cy), (470, cy+14)], fill=(215, 75, 105, 255), width=3)
    d.line([(470, cy), (426, cy+14)], fill=(215, 75, 105, 255), width=3)
# Tiered bottom lace ruffles
d.line([(325, 775), (571, 775)], fill=(35, 20, 30, 255), width=5)
d.line([(315, 830), (581, 830)], fill=(215, 205, 220, 255), width=4)
img_gt.save(os.path.join(out_dir, "dress_gothic.png"))

# D. dress_yukata.png - Japanese Summer Festival Kimono / Yukata
img_yk = Image.new("RGBA", (w, h), (0, 0, 0, 0))
d = ImageDraw.Draw(img_yk)
# Kimono wrap crossover collar (Right over left)
d.polygon([(400, 465), (448, 550), (465, 520), (500, 465)], fill=(235, 245, 255, 255), outline=LINE_COLOR, width=3)
d.line([(400, 465), (465, 560)], fill=(75, 95, 155, 255), width=4)
# Wide hanging kimono sleeves (y=490..660, dropping past elbows)
d.polygon([(350, 490), (300, 520), (305, 670), (370, 670), (375, 580)], fill=(215, 235, 255, 255), outline=LINE_COLOR, width=3)
d.polygon([(546, 490), (596, 520), (591, 670), (526, 670), (521, 580)], fill=(215, 235, 255, 255), outline=LINE_COLOR, width=3)
# Long Kimono Skirt down to shins (y=640..950)
d.polygon([(385, 640), (511, 640), (526, 950), (370, 950)], fill=(215, 235, 255, 255), outline=LINE_COLOR, width=3)
# Cherry blossom prints on yukata
for px, py in [(410, 720), (480, 760), (430, 840), (490, 880), (340, 580), (560, 580)]:
    for ang in range(0, 360, 72):
        rad = np.radians(ang)
        d.ellipse([px + np.cos(rad)*10 - 4, py + np.sin(rad)*10 - 4, px + np.cos(rad)*10 + 4, py + np.sin(rad)*10 + 4], fill=(255, 185, 205, 255))
# Big Wide Coral Pink Obi Sash (y=560..645)
d.rectangle([380, 560, 516, 645], fill=(255, 125, 140, 255), outline=LINE_COLOR, width=3)
# Golden Obijime cord with flower knot
d.line([(380, 602), (516, 602)], fill=(255, 220, 90, 255), width=4)
d.ellipse([442, 595, 454, 607], fill=(255, 255, 255, 255), outline=LINE_COLOR, width=2)
img_yk.save(os.path.join(out_dir, "dress_yukata.png"))

# E. dress_cozy_sweater.png - Slouchy Bunny Oversized Sweater Dress
img_cs = Image.new("RGBA", (w, h), (0, 0, 0, 0))
d = ImageDraw.Draw(img_cs)
# Long oversized sweater silhouette down to mid-thigh (y=465..780)
d.polygon([(390, 465), (320, 510), (335, 660), (385, 780), (511, 780), (561, 660), (576, 510), (506, 465)], fill=(255, 240, 245, 255), outline=LINE_COLOR, width=3)
# Turtle neck collar
d.ellipse([405, 460, 491, 490], fill=(245, 225, 235, 255), outline=LINE_COLOR, width=3)
# Big cute bunny pocket on belly (y=620..710)
d.ellipse([415, 620, 481, 700], fill=(255, 255, 255, 255), outline=LINE_COLOR, width=2)
# Bunny ears on pocket
d.polygon([(425, 625), (420, 590), (435, 620)], fill=(255, 255, 255, 255), outline=LINE_COLOR, width=2)
d.polygon([(471, 625), (476, 590), (461, 620)], fill=(255, 255, 255, 255), outline=LINE_COLOR, width=2)
# Bunny face
d.ellipse([436, 650, 442, 656], fill=LINE_COLOR)
d.ellipse([454, 650, 460, 656], fill=LINE_COLOR)
d.polygon([(446, 660), (450, 660), (448, 664)], fill=(255, 140, 160, 255))
img_cs.save(os.path.join(out_dir, "dress_cozy_sweater.png"))

print("Saved all 5 distinct full dresses!")

# ==============================================================================
# 5. HANDHELD PROPS (Properly Illustrated Cute Bunny Plushie, Boba, Wand)
# ==============================================================================

# A. acc_bunny.png - Adorable Fluffy Plush Bunny with Shading & Pink Ears
img_bn = Image.new("RGBA", (w, h), (0, 0, 0, 0))
d = ImageDraw.Draw(img_bn)
# Bunny placed in front of arm / right side: center around (325, 480..620)
# Long soft ears
d.polygon([(300, 480), (285, 360), (315, 360), (318, 480)], fill=(255, 255, 255, 255), outline=LINE_COLOR, width=3)
d.polygon([(290, 460), (292, 380), (308, 380), (305, 460)], fill=(255, 195, 215, 255))

d.polygon([(345, 480), (340, 360), (370, 360), (358, 480)], fill=(255, 255, 255, 255), outline=LINE_COLOR, width=3)
d.polygon([(348, 460), (347, 380), (363, 380), (355, 460)], fill=(255, 195, 215, 255))

# Fluffy round head
d.ellipse([275, 435, 375, 525], fill=(255, 255, 255, 255), outline=LINE_COLOR, width=3)
# Chubby plush body
d.ellipse([285, 505, 365, 605], fill=(255, 255, 255, 255), outline=LINE_COLOR, width=3)
# Tiny cute paws
d.ellipse([280, 530, 305, 555], fill=(255, 255, 255, 255), outline=LINE_COLOR, width=2)
d.ellipse([345, 530, 370, 555], fill=(255, 255, 255, 255), outline=LINE_COLOR, width=2)
# Feet
d.ellipse([285, 590, 315, 615], fill=(255, 255, 255, 255), outline=LINE_COLOR, width=2)
d.ellipse([335, 590, 365, 615], fill=(255, 255, 255, 255), outline=LINE_COLOR, width=2)

# Embroidered button eyes & cute face
d.ellipse([305, 468, 315, 478], fill=(65, 50, 60, 255))
d.ellipse([335, 468, 345, 478], fill=(65, 50, 60, 255))
# Eye gleams
d.ellipse([307, 469, 310, 472], fill=(255, 255, 255, 255))
d.ellipse([337, 469, 340, 472], fill=(255, 255, 255, 255))
# Pink nose & mouth
d.polygon([(322, 478), (328, 478), (325, 482)], fill=(255, 140, 165, 255))
d.arc([318, 480, 325, 488], start=0, end=180, fill=LINE_COLOR, width=2)
d.arc([325, 480, 332, 488], start=0, end=180, fill=LINE_COLOR, width=2)
# Rosy blush
d.ellipse([292, 478, 308, 488], fill=(255, 175, 195, 180))
d.ellipse([342, 478, 358, 488], fill=(255, 175, 195, 180))
# Cute Red Neck Ribbon Bow
d.polygon([(325, 512), (310, 504), (312, 520)], fill=(255, 75, 100, 255))
d.polygon([(325, 512), (340, 504), (338, 520)], fill=(255, 75, 100, 255))
d.ellipse([321, 508, 329, 516], fill=(255, 235, 100, 255))
img_bn.save(os.path.join(out_dir, "acc_bunny.png"))
print("Saved cute illustrated acc_bunny.png!")
