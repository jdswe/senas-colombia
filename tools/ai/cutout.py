#!/usr/bin/env python3
"""Recorta el fondo liso de una ilustración generada y la deja lista para el sitio.

Quita el fondo que toca el borde y los huecos grandes encerrados (entre brazo y
cuerpo), pero conserva las zonas claras pequeñas, como el blanco de los ojos.

Uso: python3 tools/ai/cutout.py origen.png destino.webp      (solo requiere Pillow)
"""
from __future__ import annotations

import sys

from PIL import Image, ImageChops, ImageFilter

TOLERANCE = 16            # diferencia máxima por canal respecto al color de fondo
MIN_HOLE_SHARE = 0.0015   # los huecos más pequeños que esta fracción se conservan
OUTPUT_SIZE = 760


def background_mask(image: Image.Image) -> bytearray:
    """1 donde el píxel se parece al color de la esquina."""
    corner = Image.new("RGB", image.size, image.getpixel((3, 3)))
    difference = ImageChops.difference(image, corner)
    red, green, blue = difference.split()
    strongest = ImageChops.lighter(ImageChops.lighter(red, green), blue)
    return bytearray(strongest.point(lambda value: 1 if value < TOLERANCE else 0).tobytes())


def regions_to_remove(mask: bytearray, width: int, height: int) -> bytearray:
    """Marca los componentes de fondo que tocan el borde o son huecos grandes."""
    remove = bytearray(width * height)
    seen = bytearray(width * height)
    min_hole = MIN_HOLE_SHARE * width * height
    for start in range(width * height):
        if not mask[start] or seen[start]:
            continue
        seen[start] = 1
        stack, component, touches_edge = [start], [], False
        while stack:
            pixel = stack.pop()
            component.append(pixel)
            x, y = pixel % width, pixel // width
            if x == 0 or y == 0 or x == width - 1 or y == height - 1:
                touches_edge = True
            for neighbour in (pixel - 1 if x else -1, pixel + 1 if x < width - 1 else -1,
                              pixel - width if y else -1, pixel + width if y < height - 1 else -1):
                if neighbour >= 0 and mask[neighbour] and not seen[neighbour]:
                    seen[neighbour] = 1
                    stack.append(neighbour)
        if touches_edge or len(component) > min_hole:
            for pixel in component:
                remove[pixel] = 255
    return remove


def cutout(source: str, target: str) -> None:
    image = Image.open(source).convert("RGB")
    width, height = image.size
    remove = Image.frombytes("L", image.size, bytes(regions_to_remove(background_mask(image), width, height)))
    alpha = ImageChops.invert(remove).filter(ImageFilter.GaussianBlur(0.7))
    result = image.copy()
    result.putalpha(alpha)
    result = result.crop(alpha.point(lambda value: 255 if value > 8 else 0).getbbox())
    result.thumbnail((OUTPUT_SIZE, OUTPUT_SIZE), Image.LANCZOS)
    result.save(target, "WEBP", quality=84)


if __name__ == "__main__":
    cutout(sys.argv[1], sys.argv[2])
