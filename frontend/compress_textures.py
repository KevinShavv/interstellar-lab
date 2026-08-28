"""批量压缩行星贴图到 1080P (长边 ≤ 1920px)
用法: python compress_textures.py
会覆盖原文件，建议先备份。
"""

import os
from PIL import Image

MODELS_DIR = os.path.join(os.path.dirname(__file__), "public", "assets", "simulation", "models")
MAX_SIZE = 1920   # 1080P 长边
JPEG_QUALITY = 85
PNG_OPTIMIZE = True

def compress_image(filepath: str) -> tuple[str, str, str]:
    """压缩单张图片, 返回 (文件名, 原始尺寸, 压缩后尺寸)"""
    fname = os.path.basename(filepath)
    orig_size = os.path.getsize(filepath)
    orig_mb = orig_size / (1024 * 1024)

    img = Image.open(filepath).convert("RGBA" if filepath.endswith(".png") else "RGB")
    w, h = img.size
    orig_dim = f"{w}x{h}"

    # 等比缩放使长边 ≤ MAX_SIZE
    if max(w, h) > MAX_SIZE:
        ratio = MAX_SIZE / max(w, h)
        new_w, new_h = int(w * ratio), int(h * ratio)
        img = img.resize((new_w, new_h), Image.LANCZOS)
        resized_dim = f"{new_w}x{new_h}"
    else:
        resized_dim = orig_dim

    ext = os.path.splitext(fname)[1].lower()
    if ext in (".jpg", ".jpeg"):
        img = img.convert("RGB")
        img.save(filepath, "JPEG", quality=JPEG_QUALITY, optimize=True)
    elif ext == ".png":
        img.save(filepath, "PNG", optimize=PNG_OPTIMIZE)
    elif ext == ".webp":
        img.save(filepath, "WEBP", quality=JPEG_QUALITY)

    new_size = os.path.getsize(filepath)
    new_mb = new_size / (1024 * 1024)
    return fname, orig_dim, resized_dim, f"{orig_mb:.1f} MB", f"{new_mb:.1f} MB"


def main():
    if not os.path.isdir(MODELS_DIR):
        print(f"目录不存在: {MODELS_DIR}")
        return

    images = [
        f for f in os.listdir(MODELS_DIR)
        if os.path.splitext(f)[1].lower() in (".jpg", ".jpeg", ".png", ".webp")
    ]

    if not images:
        print("没有找到图片文件")
        return

    # 先统计原始总大小
    total_orig = sum(os.path.getsize(os.path.join(MODELS_DIR, f)) for f in images)
    print(f"找到 {len(images)} 张图片, 原始总大小: {total_orig/(1024*1024):.1f} MB\n")
    print(f"{'文件':<25} {'原始':>12} {'压缩后':>12} {'压缩前':>10} {'压缩后':>10} {'节省':>8}")
    print("-" * 95)

    total_new = 0
    for fname in sorted(images):
        fp = os.path.join(MODELS_DIR, fname)
        try:
            name, orig_dim, new_dim, orig_mb, new_mb = compress_image(fp)
            total_new += os.path.getsize(fp)
            saved = (1 - float(new_mb.replace(" MB","")) / float(orig_mb.replace(" MB",""))) * 100
            print(f"{name:<25} {orig_dim:>12} {new_dim:>12} {orig_mb:>10} {new_mb:>10} {saved:>7.1f}%")
        except Exception as e:
            print(f"{fname:<25} 错误: {e}")

    total_new = sum(os.path.getsize(os.path.join(MODELS_DIR, f)) for f in images)
    print("-" * 95)
    total_saved = (1 - total_new / total_orig) * 100
    print(f"总计: {total_orig/(1024*1024):.1f} MB → {total_new/(1024*1024):.1f} MB, 节省 {total_saved:.1f}%")


if __name__ == "__main__":
    main()
