#!/usr/bin/env python3
"""Render a self-contained infographic HTML file to PNG or PDF.

Uses Playwright (Chromium). If Playwright isn't installed, prints install
instructions and exits non-zero — the HTML is still fine to open in a browser
and print to PDF manually.

Usage:
    python render.py infographic.html                       # -> infographic.png (1600x900)
    python render.py infographic.html --format pdf
    python render.py infographic.html --width 1080 --height 1920
    python render.py infographic.html --selector ".infographic"  # tight-crop to an element
    python render.py infographic.html --scale 2             # 2x pixel density

Notes:
    - Default size 1600x900 (16:9). Common presets:
        16:9  1600x900     9:16  1080x1920
        1:1   1200x1200    A4    1240x1754
    - For PNG, the viewport is set to width x height and a full-page shot is
      taken; make the HTML body exactly that size (no scroll) for a clean crop.
    - --selector overrides width/height for PNG and screenshots just that node.
"""
import argparse
import pathlib
import sys


def main() -> int:
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("html", type=pathlib.Path, help="path to the infographic .html")
    p.add_argument("--format", choices=["png", "pdf"], default="png")
    p.add_argument("--width", type=int, default=1600)
    p.add_argument("--height", type=int, default=900)
    p.add_argument("--scale", type=float, default=2.0, help="device scale factor for PNG (default 2)")
    p.add_argument("--selector", default=None, help="CSS selector to tight-crop (PNG only)")
    p.add_argument("--out", type=pathlib.Path, default=None, help="output path (default: alongside input)")
    args = p.parse_args()

    if not args.html.exists():
        print(f"error: {args.html} not found", file=sys.stderr)
        return 2

    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        print(
            "Playwright not installed. Either:\n"
            "  pip install playwright && playwright install chromium\n"
            "or just open the HTML in a browser and use Cmd/Ctrl-P -> Save as PDF.",
            file=sys.stderr,
        )
        return 1

    out = args.out or args.html.with_suffix(f".{args.format}")
    url = args.html.resolve().as_uri()

    with sync_playwright() as pw:
        browser = pw.chromium.launch()
        page = browser.new_page(
            viewport={"width": args.width, "height": args.height},
            device_scale_factor=args.scale if args.format == "png" else 1,
        )
        page.goto(url, wait_until="networkidle")
        page.wait_for_timeout(400)  # let webfonts settle

        if args.format == "pdf":
            page.pdf(
                path=str(out),
                width=f"{args.width}px",
                height=f"{args.height}px",
                print_background=True,
                margin={"top": "0", "bottom": "0", "left": "0", "right": "0"},
            )
        else:
            if args.selector:
                el = page.query_selector(args.selector)
                if el is None:
                    print(f"error: selector {args.selector!r} matched nothing", file=sys.stderr)
                    browser.close()
                    return 3
                el.screenshot(path=str(out))
            else:
                page.screenshot(path=str(out), clip={"x": 0, "y": 0, "width": args.width, "height": args.height})

        browser.close()

    print(f"wrote {out}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
