import os
import shutil
from pathlib import Path
from bing_image_downloader import downloader

SEARCH_TERMS = [
    "Indian ambulance white Bolero",
    "Delhi emergency ambulance road",
    "India ambulance 108 highway",
    "AIIMS ambulance New Delhi",
    "Ziqitza ambulance India",
    "ambulance India traffic intersection"
]

DATASET_DIR = Path('models/ambulance_dataset/images')
DATASET_DIR.mkdir(parents=True, exist_ok=True)
TEMP_DIR = Path('temp_bing')

def fetch_bing():
    for term in SEARCH_TERMS:
        print(f"\n======================================")
        print(f"Fetching images for: {term}")
        print(f"======================================")
        # Bing doesn't have the same strict rate-limit blocks as DDG
        downloader.download(term, limit=35, output_dir=str(TEMP_DIR), adult_filter_off=False, force_replace=False, timeout=10)
        
    print("\nMoving files to final dataset folder...")
    existing = list(DATASET_DIR.glob('*.jpg'))
    img_id = len(existing) + 1
    
    if TEMP_DIR.exists():
        for term_dir in TEMP_DIR.iterdir():
            if term_dir.is_dir():
                for img_file in term_dir.glob('*.*'):
                    if img_file.suffix.lower() in ['.jpg', '.jpeg', '.png']:
                        dest_file = DATASET_DIR / f"ambul_{img_id:04d}.jpg"
                        shutil.move(str(img_file), str(dest_file))
                        img_id += 1
                shutil.rmtree(str(term_dir))
        
        shutil.rmtree(str(TEMP_DIR), ignore_errors=True)
        
    final_count = len(list(DATASET_DIR.glob('*.jpg')))
    print(f"Done! Final image count in dataset folder: {final_count}")

if __name__ == '__main__':
    fetch_bing()
