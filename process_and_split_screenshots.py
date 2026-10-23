import os
import glob
from PIL import Image, ImageStat

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
INPUT_DIR = os.path.join(BASE_DIR, "screenshots")
OUTPUT_DIR = os.path.join(BASE_DIR, "optimized_screenshots")

os.makedirs(OUTPUT_DIR, exist_ok=True)

def find_best_split_y(img, target_y, search_range=150):
    width, height = img.size
    min_y = max(50, target_y - search_range)
    max_y = min(height - 50, target_y + search_range)
    
    best_y = target_y
    lowest_diff = float('inf')
    
    for y in range(min_y, max_y, 2):
        row = img.crop((0, y, width, y + 1))
        stat = ImageStat.Stat(row)
        variance = sum(stat.stddev)
        if variance < lowest_diff:
            lowest_diff = variance
            best_y = y
            
    return best_y

def process_image(rel_path):
    full_in_path = os.path.join(INPUT_DIR, rel_path)
    if not os.path.exists(full_in_path):
        print(f"Missing: {rel_path}")
        return []

    img = Image.open(full_in_path)
    w, h = img.size
    aspect_ratio = h / w

    rel_dir = os.path.dirname(rel_path)
    base_name = os.path.splitext(os.path.basename(rel_path))[0]
    out_sub_dir = os.path.join(OUTPUT_DIR, rel_dir)
    os.makedirs(out_sub_dir, exist_ok=True)

    # Strategy based on aspect ratio and image type
    # 1. Extremely tall desktop page (> 2.5 aspect ratio, e.g. 6900px or 8800px)
    if w >= 1000 and aspect_ratio > 2.5:
        # Split into 3 logical parts
        num_parts = 3 if aspect_ratio > 3.5 else 2
        ideal_h = h / num_parts
        parts = []
        curr_y = 0
        for i in range(num_parts):
            if i == num_parts - 1:
                next_y = h
            else:
                next_y = find_best_split_y(img, int((i + 1) * ideal_h))
            
            chunk = img.crop((0, curr_y, w, next_y))
            out_name = f"{base_name}_part{i+1}.png"
            out_path = os.path.join(out_sub_dir, out_name)
            chunk.save(out_path)
            parts.append(os.path.join(rel_dir, out_name).replace("\\", "/"))
            print(f"Split {base_name} -> Part {i+1} ({w}x{next_y - curr_y})")
            curr_y = next_y
        return parts

    # 2. Moderately tall desktop page (1.2 to 2.5 aspect ratio, e.g. 1500-2500px)
    elif w >= 1000 and aspect_ratio > 1.2:
        # Split into 2 parts
        mid_y = find_best_split_y(img, int(h / 2))
        part1 = img.crop((0, 0, w, mid_y))
        part2 = img.crop((0, mid_y, w, h))
        
        out1_name = f"{base_name}_part1.png"
        out2_name = f"{base_name}_part2.png"
        
        path1 = os.path.join(out_sub_dir, out1_name)
        path2 = os.path.join(out_sub_dir, out2_name)
        
        part1.save(path1)
        part2.save(path2)
        print(f"Split {base_name} -> 2 parts ({w}x{mid_y}, {w}x{h - mid_y})")
        return [
            os.path.join(rel_dir, out1_name).replace("\\", "/"),
            os.path.join(rel_dir, out2_name).replace("\\", "/")
        ]

    # 3. Extremely tall mobile page (e.g. 390x11315)
    elif w < 1000 and aspect_ratio > 3.0:
        # Crop top 2 key scroll frames (e.g. top 1600px split into two 800px frames)
        max_h = min(h, 2400)
        num_parts = 2 if max_h > 1200 else 1
        ideal_h = max_h / num_parts
        parts = []
        curr_y = 0
        for i in range(num_parts):
            next_y = int((i + 1) * ideal_h)
            chunk = img.crop((0, curr_y, w, next_y))
            out_name = f"{base_name}_frame{i+1}.png"
            out_path = os.path.join(out_sub_dir, out_name)
            chunk.save(out_path)
            parts.append(os.path.join(rel_dir, out_name).replace("\\", "/"))
            print(f"Mobile Crop {base_name} -> Frame {i+1} ({w}x{next_y - curr_y})")
            curr_y = next_y
        return parts

    # 4. Standard aspect ratio -> Save directly
    else:
        out_path = os.path.join(out_sub_dir, os.path.basename(rel_path))
        img.save(out_path)
        return [rel_path.replace("\\", "/")]

print("Processing all 54 screenshots...")
processed_mapping = {}

files = glob.glob(f"{INPUT_DIR}/**/*.png", recursive=True)
for f in sorted(files):
    rel = os.path.relpath(f, INPUT_DIR).replace("\\", "/")
    res = process_image(rel)
    processed_mapping[rel] = res

print(f"\nProcessing Complete. Processed {len(processed_mapping)} source screenshots.")
