#!/usr/bin/env python3
"""Genera la biblioteca de señas a partir del Diccionario Básico de la LSC (INSOR / ICC, 2006).

Lee el PDF con poppler (pdftohtml + pdftoppm), separa cada entrada en palabra,
acepciones, ejemplos y descripción de la seña, y recorta las fotografías.

Uso:  python3 tools/build_data.py [--skip-images]
Requiere: poppler-utils, numpy y opencv-python-headless (ver tools/README.md).
"""
from __future__ import annotations

import argparse
import json
import re
import subprocess
import tempfile
import unicodedata
import xml.etree.ElementTree as ET
from dataclasses import dataclass, field
from pathlib import Path

import cv2

from illustrate import illustrate

ROOT = Path(__file__).resolve().parent.parent
PDF = ROOT / "recursos" / "Diccionario-lengua-de-senas.pdf"
DATA_DIR = ROOT / "data"
SIGN_IMG_DIR = DATA_DIR / "img" / "signs"

PAGE_OFFSET = 52            # página PDF = página impresa + 52
FIRST_PAGE, LAST_PAGE = 5, 548   # páginas impresas con entradas
HEAD_FONT = ("11", "BJPLFC")     # negrita de los lemas
RENDER_DPI = 150
CROP_INSET = 3              # px: descarta el borde y la sombra de la foto
WEBP_QUALITY = 76
BODY_TOP, BODY_BOTTOM = 85, 765

# (página impresa inicial, id, nombre, grupo)
MODULES = [
    (5, "ser-humano", "Personas y pronombres", "La persona"),
    (17, "cuerpo-humano", "Cuerpo humano", "La persona"),
    (31, "fisiologia", "Fisiología", "La persona"),
    (43, "frutas-verduras", "Frutas y verduras", "La persona"),
    (57, "comidas-bebidas", "Comidas y bebidas", "La persona"),
    (79, "vestuario", "Vestuario", "La persona"),
    (95, "aseo-personal", "Aseo personal", "La persona"),
    (103, "salud", "Salud", "La persona"),
    (115, "inteligencia", "Inteligencia", "La persona"),
    (125, "espacio", "Espacio", "La persona"),
    (131, "dias-semana", "Días de la semana", "La persona"),
    (135, "meses", "Meses del año", "La persona"),
    (141, "tiempo", "Expresiones de tiempo", "La persona"),
    (155, "numeros", "Números", "La persona"),
    (165, "cantidad", "Expresiones de cantidad", "La persona"),
    (169, "sentimientos", "Características y sentimientos", "La persona"),
    (205, "familia", "Familia y relaciones", "Sociedad"),
    (219, "profesiones", "Profesiones y oficios", "Sociedad"),
    (239, "acciones", "Acciones y distracciones", "Sociedad"),
    (271, "deportes", "Deportes", "Sociedad"),
    (283, "ciudad", "Ciudad", "Sociedad"),
    (307, "transporte", "Transporte", "Sociedad"),
    (319, "tecnologia", "Tecnología", "Sociedad"),
    (327, "hogar", "Hogar y vivienda", "Sociedad"),
    (369, "gobierno-comercio", "Gobierno y comercio", "Sociedad"),
    (395, "educacion", "Entorno educativo", "Sociedad"),
    (415, "utiles-escolares", "Útiles escolares", "Sociedad"),
    (425, "religion", "Religión", "Sociedad"),
    (433, "sanciones-vicios", "Sanciones sociales y vicios", "Sociedad"),
    (443, "comunicacion", "Comunicación", "Sociedad"),
    (463, "cultura-sorda", "Cultura sorda", "Sociedad"),
    (473, "calificar", "Calificar", "Sociedad"),
    (479, "interrogar", "Preguntas", "Sociedad"),
    (485, "cortesia", "Fórmulas de cortesía", "Sociedad"),
    (495, "naturaleza", "Naturaleza", "Entorno natural"),
    (505, "animales", "Animales", "Entorno natural"),
    (523, "geografia", "Geografía", "Entorno natural"),
    (531, "cualidades", "Cualidades de objetos", "Entorno natural"),
    (543, "colores", "Colores", "Entorno natural"),
]


@dataclass
class Line:
    top: int
    left: int
    bottom: int
    text: str
    italic: bool        # toda la línea en cursiva
    abbr: bool          # empieza con abreviatura gramatical en cursiva
    head: bool          # lema en negrita


@dataclass
class Entry:
    word: str
    page: int                       # página impresa
    top: int
    bottom: int
    lines: list[Line] = field(default_factory=list)
    images: list[tuple[int, tuple[int, int, int, int]]] = field(default_factory=list)


def module_for(page: int) -> str:
    current = MODULES[0][1]
    for start, mod_id, _, _ in MODULES:
        if page >= start:
            current = mod_id
    return current


def slugify(text: str) -> str:
    text = text.replace("ñ", "n~").replace("Ñ", "n~")
    text = unicodedata.normalize("NFD", text)
    text = "".join(c for c in text if unicodedata.category(c) != "Mn").replace("n~", "ni")
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")


def clean(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()


def read_layout(xml_path: Path):
    """Devuelve {página pdf: (ancho, líneas, fotos)}."""
    fonts: dict[str, tuple[str, str]] = {}
    pages = {}
    for page in ET.parse(xml_path).getroot():
        number = int(page.get("number"))
        items, photos = [], []
        for el in page:
            if el.tag == "fontspec":
                fonts[el.get("id")] = (el.get("size"), el.get("family")[:6])
            elif el.tag == "image":
                w, h = int(el.get("width")), int(el.get("height"))
                if el.get("src", "").endswith(".jpg") and w > 50 and h > 50:
                    photos.append((int(el.get("left")), int(el.get("top")), w, h))
            elif el.tag == "text":
                top = int(el.get("top"))
                if not BODY_TOP < top < BODY_BOTTOM:
                    continue
                font = fonts[el.get("font")]
                bold = el.find("b") is not None
                if int(font[0]) >= 13 or (bold and font != HEAD_FONT):
                    continue                      # títulos de sección
                text = "".join(el.itertext())
                items.append({
                    "top": top, "left": int(el.get("left")), "h": int(el.get("height")),
                    "text": text, "bold": bold, "italic": el.find("i") is not None,
                })
        pages[number] = (int(page.get("width")), build_lines(items), photos)
    return pages


def build_lines(items) -> list[Line]:
    items.sort(key=lambda i: (i["top"], i["left"]))
    rows: list[list[dict]] = []
    for item in items:
        if rows and abs(rows[-1][0]["top"] - item["top"]) <= 3:
            rows[-1].append(item)
        else:
            rows.append([item])
    lines = []
    for row in rows:
        row.sort(key=lambda i: i["left"])
        solid = [i for i in row if i["text"].strip()]
        if not solid:
            continue
        text = clean("".join(i["text"] for i in row))
        italic = all(i["italic"] for i in solid)
        lead = [i for i in solid if not re.fullmatch(r"\s*\d+\.\s*", i["text"])]
        abbr = bool(lead) and lead[0]["italic"] and not italic and len(lead[0]["text"].strip()) <= 14
        lines.append(Line(
            top=row[0]["top"], left=solid[0]["left"], bottom=row[0]["top"] + row[0]["h"],
            text=text, italic=italic, abbr=abbr, head=all(i["bold"] for i in solid),
        ))
    return lines


def collect_entries(pages) -> list[Entry]:
    entries: list[Entry] = []
    for number in range(FIRST_PAGE + PAGE_OFFSET, LAST_PAGE + PAGE_OFFSET + 1):
        if number not in pages:
            continue
        _, lines, photos = pages[number]
        page_entries: list[Entry] = []
        carry: Entry | None = None           # continuación de la página anterior
        previous_head: Line | None = None
        for line in lines:
            if line.head:
                if previous_head and line.top - previous_head.top <= 15 and not page_entries[-1].lines:
                    page_entries[-1].word = clean(page_entries[-1].word + " " + line.text)
                else:
                    page_entries.append(Entry(line.text, number - PAGE_OFFSET, line.top, line.bottom))
                previous_head = line
            elif page_entries:
                page_entries[-1].lines.append(line)
                page_entries[-1].bottom = line.bottom
            elif entries:
                if carry is None:
                    carry = Entry("", number - PAGE_OFFSET, line.top, line.bottom)
                carry.lines.append(line)
                carry.bottom = line.bottom
        owner_of_carry = entries[-1] if entries else None
        candidates = ([carry] if carry else []) + page_entries
        for left, top, w, h in sorted(photos, key=lambda p: (p[1], p[0])):
            if not candidates:
                target = owner_of_carry
            else:
                centre = top + h / 2
                target = min(candidates, key=lambda e: max(e.top - centre, centre - e.bottom, 0))
                if target is carry:
                    target = owner_of_carry
            if target is not None:
                target.images.append((number, (left, top, w, h)))
        if carry and owner_of_carry:
            if carry.lines and owner_of_carry.lines:
                carry.lines[0].top = owner_of_carry.lines[-1].top + 14   # sin salto de párrafo
            owner_of_carry.lines.extend(carry.lines)
        entries.extend(page_entries)
    return entries


def is_gloss(text: str) -> bool:
    letters = [c for c in text if c.isalpha()]
    return len(letters) >= 2 and sum(c.isupper() for c in letters) / len(letters) > 0.85


ABBR = re.compile(r"^(\d+\.\s*)?((?:[a-zñ]+\.\s*)+)(.*)$")


def structure(entry: Entry) -> dict:
    """Separa las líneas en acepciones (definición + ejemplo) y descripción de la seña."""
    paragraphs: list[list[Line]] = []
    last_top = None
    for line in entry.lines:
        if last_top is None or line.top - last_top > 17:
            paragraphs.append([])
        paragraphs[-1].append(line)
        last_top = line.top

    senses: list[dict] = []
    description: list[str] = []

    def sense() -> dict:
        if not senses:
            senses.append({"def": "", "type": "", "gloss": "", "tr": ""})
        return senses[-1]

    for para in paragraphs:
        body = [l for l in para if not l.italic and not is_gloss(l.text)]
        is_def = bool(body) and body[0].abbr
        text_parts: list[str] = []
        for line in para:
            if line.italic:
                s = sense(); s["tr"] = clean(s["tr"] + " " + line.text)
            elif is_gloss(line.text) and not text_parts:
                s = sense()
                if s["tr"]:                     # nuevo ejemplo para la misma acepción
                    senses.append({"def": "", "type": "", "gloss": "", "tr": ""}); s = senses[-1]
                s["gloss"] = clean(s["gloss"] + " " + line.text)
            else:
                text_parts.append(line.text)
        text = clean(" ".join(text_parts))
        if not text:
            continue
        if is_def:
            match = ABBR.match(text)
            kind, definition = (clean(match.group(2)), clean(match.group(3))) if match else ("", text)
            senses.append({"def": definition.lstrip(". "), "type": kind, "gloss": "", "tr": ""})
        else:
            description.append(re.sub(r"^(\d+)\.\s*", r"\1. ", text))

    senses = [s for s in senses if s["def"] or s["gloss"] or s["tr"]]
    return {"senses": senses, "how": description}


def export_images(entries: list[Entry], ids: list[str], pages, skip: bool) -> list[list[str]]:
    """Recorta cada foto de la página renderizada y la guarda ya ilustrada."""
    SIGN_IMG_DIR.mkdir(parents=True, exist_ok=True)
    names = [[f"{ids[i]}-{n + 1}.webp" for n in range(len(e.images))] for i, e in enumerate(entries)]
    if skip:
        return names
    by_page: dict[int, list[tuple[str, tuple[int, int, int, int]]]] = {}
    for entry, files in zip(entries, names):
        for (page, box), name in zip(entry.images, files):
            by_page.setdefault(page, []).append((name, box))
    without_face = []
    with tempfile.TemporaryDirectory() as tmp:
        for page, crops in sorted(by_page.items()):
            prefix = Path(tmp) / "p"
            subprocess.run(["pdftoppm", "-f", str(page), "-l", str(page), "-r", str(RENDER_DPI),
                            "-gray", "-singlefile", "-png", str(PDF), str(prefix)], check=True)
            img = cv2.imread(f"{prefix}.png", cv2.IMREAD_GRAYSCALE)
            scale = img.shape[1] / pages[page][0]
            for name, (left, top, w, h) in crops:
                x0, y0, x1, y1 = (round(v * scale) for v in (left, top, left + w, top + h))
                crop = img[y0 + CROP_INSET:y1 - 2 * CROP_INSET, x0 + CROP_INSET:x1 - CROP_INSET]
                picture, redrawn = illustrate(crop)
                if not redrawn:
                    without_face.append(name)
                cv2.imwrite(str(SIGN_IMG_DIR / name), picture, [cv2.IMWRITE_WEBP_QUALITY, WEBP_QUALITY])
    (ROOT / "tools" / "sin-rostro-detectado.txt").write_text("\n".join(without_face) + "\n", "utf-8")
    print(f"{len(without_face)} imágenes sin rostro detectado (ver tools/sin-rostro-detectado.txt)")
    return names


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--skip-images", action="store_true", help="solo regenera los JSON")
    args = parser.parse_args()

    with tempfile.TemporaryDirectory() as tmp:
        subprocess.run(["pdftohtml", "-xml", "-zoom", "1", str(PDF), f"{tmp}/d"],
                       check=True, capture_output=True)
        pages = read_layout(Path(tmp) / "d.xml")

    entries = [e for e in collect_entries(pages) if e.word.strip()]
    ids, seen = [], {}
    for entry in entries:
        entry.word = clean(entry.word).replace("–", "-")
        base = slugify(entry.word) or "sena"
        seen[base] = seen.get(base, 0) + 1
        ids.append(base if seen[base] == 1 else f"{base}-{seen[base]}")
    images = export_images(entries, ids, pages, args.skip_images)

    signs = []
    for entry, sign_id, files in zip(entries, ids, images):
        signs.append({"id": sign_id, "word": entry.word, "module": module_for(entry.page),
                      "page": entry.page, "images": files, **structure(entry)})

    counts: dict[str, int] = {}
    for sign in signs:
        counts[sign["module"]] = counts.get(sign["module"], 0) + 1
    modules = [{"id": mod_id, "name": name, "group": group, "page": start, "count": counts.get(mod_id, 0)}
               for start, mod_id, name, group in MODULES]

    DATA_DIR.mkdir(exist_ok=True)
    (DATA_DIR / "signs.json").write_text(json.dumps(signs, ensure_ascii=False, separators=(",", ":")), "utf-8")
    (DATA_DIR / "modules.json").write_text(json.dumps(modules, ensure_ascii=False, indent=1), "utf-8")
    print(f"{len(signs)} señas · {sum(len(f) for f in images)} imágenes · {len(modules)} módulos")


if __name__ == "__main__":
    main()
