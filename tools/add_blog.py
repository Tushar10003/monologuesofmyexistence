#!/usr/bin/env python3
"""Add a PDF blog and its metadata to this GitHub Pages site.

Run from the project root:
python tools/add_blog.py --title "A Thoughtful Title" --pdf "C:/path/to/blog.pdf" \
  --cover "C:/path/to/cover.jpg" --category "Reflections" \
  --excerpt "A short description of this piece." --read-time "6 MIN READ"

Only the Python standard library is required. The generated files still need to
be committed and pushed to GitHub for the live website to update.
"""
from __future__ import annotations

import argparse
import json
import re
import shutil
import sys
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BLOGS_FILE = ROOT / "blogs.json"
PDF_DIR = ROOT / "pdfs"
COVER_DIR = ROOT / "covers"
DEFAULT_COVER = "assets/cover-default.svg"
ALLOWED_COVERS = {".jpg", ".jpeg", ".png", ".webp", ".avif"}


def slugify(value: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")
    return slug[:70].rstrip("-") or "new-monologue"


def load_posts() -> list[dict]:
    if not BLOGS_FILE.exists():
        return []
    try:
        data = json.loads(BLOGS_FILE.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        raise ValueError(f"blogs.json is not valid JSON: {exc}") from exc
    if not isinstance(data, list):
        raise ValueError("blogs.json must contain a JSON array.")
    return data


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Add a PDF blog to Monologues of my existence.")
    parser.add_argument("--title", required=True, help="Title shown on the website")
    parser.add_argument("--pdf", required=True, type=Path, help="Path to the PDF file")
    parser.add_argument("--cover", type=Path, help="Optional cover image (JPG, PNG, WEBP, or AVIF)")
    parser.add_argument("--category", default="Monologue", help="Category label")
    parser.add_argument("--excerpt", default="A page from the ongoing story.", help="Short description")
    parser.add_argument("--published", default=date.today().isoformat(), help="Publication date, YYYY-MM-DD")
    parser.add_argument("--read-time", default="PDF EDITION", help="Small label, e.g. 6 MIN READ")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    title = args.title.strip()
    if not title:
        print("Error: title cannot be empty.", file=sys.stderr)
        return 2
    pdf_source = args.pdf.expanduser().resolve()
    if not pdf_source.is_file() or pdf_source.suffix.lower() != ".pdf":
        print("Error: --pdf must point to an existing PDF file.", file=sys.stderr)
        return 2
    if args.cover:
        cover_source = args.cover.expanduser().resolve()
        if not cover_source.is_file() or cover_source.suffix.lower() not in ALLOWED_COVERS:
            print("Error: --cover must be an existing JPG, PNG, WEBP, or AVIF image.", file=sys.stderr)
            return 2
    else:
        cover_source = None

    try:
        posts = load_posts()
    except ValueError as exc:
        print(f"Error: {exc}", file=sys.stderr)
        return 2

    slug = slugify(title)
    existing_ids = {str(post.get("id", "")) for post in posts if isinstance(post, dict)}
    base_slug = slug
    suffix = 2
    while slug in existing_ids or (PDF_DIR / f"{slug}.pdf").exists():
        slug = f"{base_slug}-{suffix}"
        suffix += 1

    PDF_DIR.mkdir(parents=True, exist_ok=True)
    COVER_DIR.mkdir(parents=True, exist_ok=True)
    pdf_destination = PDF_DIR / f"{slug}.pdf"
    shutil.copy2(pdf_source, pdf_destination)

    if cover_source:
        cover_destination = COVER_DIR / f"{slug}{cover_source.suffix.lower()}"
        shutil.copy2(cover_source, cover_destination)
        cover_path = cover_destination.relative_to(ROOT).as_posix()
    else:
        cover_path = DEFAULT_COVER

    post = {
        "id": slug,
        "title": title,
        "excerpt": args.excerpt.strip(),
        "category": args.category.strip() or "Monologue",
        "published": args.published.strip(),
        "readTime": args.read_time.strip() or "PDF EDITION",
        "pdf": pdf_destination.relative_to(ROOT).as_posix(),
        "cover": cover_path,
    }
    posts.insert(0, post)
    BLOGS_FILE.write_text(json.dumps(posts, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    print("Blog added successfully.")
    print(f"  PDF:    {post['pdf']}")
    print(f"  Cover:  {post['cover']}")
    print("  List:   blogs.json")
    print("\nNext: commit and push these changes to GitHub to publish the post.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
