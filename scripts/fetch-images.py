"""Downloads the Unsplash gallery photos and writes the optimised WebP assets in public/images.
Usage: python -I scripts/fetch-images.py   (needs Pillow)"""
import io, os, urllib.request
from PIL import Image
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "public", "images")
# Only the stock gallery photos; every other image is client-supplied and must not be overwritten.
J = [
 ("gallery-kitchen-01","1507089947368-19c1da9775ae",1200,1000,""),
 ("gallery-kitchen-02","1556912167-f556f1f39fdf",1200,1000,""),
 ("gallery-bathroom-01","1620626011761-996317b8d101",1200,1000,""),
 ("gallery-bathroom-02","1576698483491-8c43f0862543",1200,1000,""),
 ("gallery-flooring","1560185007-cde436f6a4d0",1200,1000,""),
 ("gallery-cabinets","1565538810643-b5bdb714032a",1200,1000,""),
 ("gallery-shower","1629079447777-1e605162dc8d",1200,1000,""),
]
for name, pid, w, h, _ in J:
    u = f"https://images.unsplash.com/photo-{pid}?w={w}&h={h}&fit=crop&q=85&fm=jpg"
    im = Image.open(io.BytesIO(urllib.request.urlopen(u, timeout=90).read())).convert("RGB")
    if im.size != (w, h): im = im.resize((w, h), Image.LANCZOS)
    im.save(os.path.join(OUT, name + ".webp"), quality=78, method=6)
    print(name, im.size, flush=True)
