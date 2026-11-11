#!/usr/bin/env python3
"""Recorta el alfabeto manual (anexo del diccionario, p. 573) en una imagen por letra.

Los dibujos originales son de línea; se vuelven a entintar con el color del
proyecto sobre fondo transparente. Uso: python3 tools/build_alphabet.py
"""
from __future__ import annotations

import subprocess
import tempfile
from pathlib import Path

import cv2
import numpy as np

ROOT = Path(__file__).resolve().parent.parent
PDF = ROOT / "recursos" / "Diccionario-lengua-de-senas.pdf"
OUT = ROOT / "data" / "img" / "alphabet"
PDF_PAGE, DPI = 625, 200
ORIGIN = (318, 202)               # esquina interior del marco de la lámina (x, y)
INK = (72, 36, 24)                # BGR
PAD = 14

# fila: (y inicial, y final, [(letra, x inicial, x final), ...]) dentro del marco
GRID = [
    (146, 340, [("a", 130, 350), ("b", 383, 575), ("c", 619, 808), ("d", 838, 1020)]),
    (415, 675, [("e", 145, 358), ("f", 389, 578), ("g", 612, 790), ("h", 824, 995)]),
    (694, 890, [("i", 122, 322), ("j", 356, 583), ("k", 613, 790), ("l", 821, 1012)]),
    (984, 1153, [("m", 143, 347), ("n", 381, 574), ("ñ", 608, 808), ("o", 842, 985)]),
    (1194, 1386, [("p", 113, 340), ("q", 375, 570), ("r", 596, 758), ("s", 793, 970)]),
    (1425, 1610, [("t", 161, 338), ("u", 368, 561), ("v", 593, 777), ("w", 820, 947)]),
    (1673, 1844, [("x", 269, 452), ("y", 481, 700), ("z", 733, 930)]),
]
FILE_NAMES = {"ñ": "enie"}


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory() as tmp:
        subprocess.run(["pdftoppm", "-f", str(PDF_PAGE), "-l", str(PDF_PAGE), "-r", str(DPI), "-gray",
                        "-singlefile", "-png", str(PDF), f"{tmp}/p"], check=True)
        page = cv2.imread(f"{tmp}/p.png", cv2.IMREAD_GRAYSCALE)
    ox, oy = ORIGIN
    for y0, y1, cells in GRID:
        for letter, x0, x1 in cells:
            cell = page[oy + y0 - PAD:oy + y1 + PAD, ox + x0:ox + x1]
            ys, xs = np.where(cell < 140)
            cell = cell[max(ys.min() - PAD, 0):ys.max() + PAD, max(xs.min() - PAD, 0):xs.max() + PAD]
            alpha = 255 - cv2.GaussianBlur(cell, (0, 0), 0.6)
            alpha = np.clip(alpha.astype(np.float32) * 1.4, 0, 255).astype(np.uint8)
            image = np.dstack([np.full((*cell.shape, 3), INK, np.uint8), alpha])
            cv2.imwrite(str(OUT / f"{FILE_NAMES.get(letter, letter)}.webp"), image, [cv2.IMWRITE_WEBP_QUALITY, 90])
    print(f"{sum(len(c) for _, _, c in GRID)} letras en {OUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
