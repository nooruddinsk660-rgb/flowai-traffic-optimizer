import os
import requests
import time
from pathlib import Path
from duckduckgo_search import DDGS
from requests.exceptions import RequestException

# Search terms given in playbook
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

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
}

def download_images():
    existing = list(DATASET_DIR.glob('*.jpg'))
    img_id = len(existing) + 1
    print(f"Found {len(existing)} images already. Resuming from ID {img_id}...")
    
    with DDGS() as ddgs:
        for term in SEARCH_TERMS:
            print(f"\nSearching for: '{term}'...")
            try:
                results = ddgs.images(term, region="wt-wt", safesearch="off", size="Medium", max_results=35)
                
                for res in results:
                    url = res.get('image')
                    if not url: continue
                    
                    try:
                        resp = requests.get(url, headers=HEADERS, timeout=5)
                        if resp.status_code == 200 and 'image' in resp.headers.get('content-type', '').lower():
                            file_path = DATASET_DIR / f"ambul_{img_id:04d}.jpg"
                            with open(file_path, 'wb') as f:
                                f.write(resp.content)
                            print(f"  Saved -> {file_path.name}")
                            img_id += 1
                        time.sleep(0.1)
                    except Exception:
                        pass
                
                print("Giving DuckDuckGo a 10 second break to reset rate limits...")
                time.sleep(10)
                
            except Exception as e:
                print(f"DuckDuckGo RateLimit hit: {e}. Waiting 30 seconds before next term...")
                time.sleep(30)

    print(f"\nFinished! Total images currently in folder: {len(list(DATASET_DIR.glob('*.jpg')))}")

if __name__ == "__main__":
    download_images()
