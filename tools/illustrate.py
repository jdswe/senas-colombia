"""Dibuja un personaje de caricatura nuevo a partir de una foto de referencia.

De la foto solo se conserva la geometría de la seña (silueta, manos, flechas).
Todo lo demás se redibuja: colores planos, contorno de tinta, peinado recortado
y un rostro genérico de caricatura, de modo que el resultado no retrata a nadie.

Requiere numpy y opencv-python-headless, más el modelo YuNet de OpenCV Zoo.
"""
from __future__ import annotations

from pathlib import Path

import cv2
import numpy as np

MODEL = Path(__file__).resolve().parent / "models" / "face_detection_yunet.onnx"

# Colores en BGR
INK = (72, 36, 24)
SHIRT = (176, 92, 30)
SHIRT_SHADE = (150, 74, 22)
HAIR = (58, 44, 92)
SKIN = (178, 208, 250)
SKIN_SHADE = (140, 170, 232)
ARROW_ON_BG = (52, 40, 222)
ARROW_ON_BODY = (56, 208, 255)
WHITE = (255, 255, 255)
BLUSH = (150, 150, 246)

SCALE = 2                 # se dibuja al doble y se reduce para suavizar bordes
OUTPUT_SCALE = 1.35
BG_LEVEL, DARK_LEVEL, SHADE_LEVEL = 247, 96, 172
FACE_PAD = 48             # margen blanco para detectar rostros pegados al borde

_detector = None


def _find_face(gray: np.ndarray):
    global _detector
    if _detector is None:
        _detector = cv2.FaceDetectorYN.create(str(MODEL), "", (320, 320), 0.3, 0.3, 50)
    height, width = gray.shape
    for pad in (0, FACE_PAD):
        padded = cv2.copyMakeBorder(gray, pad, pad, pad, pad, cv2.BORDER_CONSTANT, value=255)
        _detector.setInputSize((width + 2 * pad, height + 2 * pad))
        _, faces = _detector.detect(cv2.cvtColor(padded, cv2.COLOR_GRAY2BGR))
        if faces is not None and len(faces):
            face = max(faces, key=lambda row: row[2] * row[3])
            return (face[4:14].reshape(5, 2) - pad) * SCALE
    return None


def _components(mask: np.ndarray):
    count, labels, stats, _ = cv2.connectedComponentsWithStats(mask.astype(np.uint8), connectivity=8)
    return count, labels, stats


def _ring_share(labels, index, stats, other: np.ndarray) -> float:
    """Fracción del contorno exterior del componente que toca la máscara `other`."""
    x, y, w, h = stats[index, :4]
    pad = 4
    y0, y1, x0, x1 = max(y - pad, 0), y + h + pad, max(x - pad, 0), x + w + pad
    part = (labels[y0:y1, x0:x1] == index).astype(np.uint8)
    ring = cv2.dilate(part, np.ones((7, 7), np.uint8)) - part
    total = int(ring.sum())
    return float((ring * other[y0:y1, x0:x1]).sum()) / total if total else 0.0


def _face_geometry(points):
    right_eye, left_eye, nose, mouth_r, mouth_l = points
    mouth = (mouth_r + mouth_l) / 2
    eyes = (right_eye + left_eye) / 2
    face_h = float(np.linalg.norm(mouth - eyes))
    eye_gap = max(float(np.linalg.norm(left_eye - right_eye)), face_h * 0.55)
    angle = float(np.degrees(np.arctan2(left_eye[1] - right_eye[1], left_eye[0] - right_eye[0])))
    return right_eye, left_eye, eyes, mouth, face_h, eye_gap, angle, nose


def _draw_face(canvas: np.ndarray, geometry) -> None:
    right_eye, left_eye, eyes, mouth, face_h, gap, angle, _ = geometry
    for eye in (right_eye, left_eye):
        centre = (int(eye[0]), int(eye[1]))
        cv2.ellipse(canvas, centre, (int(gap * 0.19), int(gap * 0.22)), angle, 0, 360, WHITE, -1, cv2.LINE_AA)
        cv2.ellipse(canvas, centre, (int(gap * 0.19), int(gap * 0.22)), angle, 0, 360, INK, max(2, int(gap * 0.035)), cv2.LINE_AA)
        cv2.circle(canvas, (int(eye[0]), int(eye[1] + gap * 0.03)), max(2, int(gap * 0.105)), INK, -1, cv2.LINE_AA)
        cv2.circle(canvas, (int(eye[0] + gap * 0.04), int(eye[1] - gap * 0.03)), max(1, int(gap * 0.035)), WHITE, -1, cv2.LINE_AA)
        cv2.ellipse(canvas, (int(eye[0]), int(eye[1] - gap * 0.36)), (int(gap * 0.2), int(gap * 0.07)),
                    angle, 200, 340, INK, max(2, int(gap * 0.05)), cv2.LINE_AA)
        cheek = eye + (mouth - eyes) * 0.62 + (eye - eyes) * 0.25
        cv2.circle(canvas, (int(cheek[0]), int(cheek[1])), max(2, int(gap * 0.11)), BLUSH, -1, cv2.LINE_AA)
    cv2.ellipse(canvas, (int(mouth[0]), int(mouth[1] - gap * 0.12)), (int(gap * 0.26), int(gap * 0.17)),
                angle, 20, 160, INK, max(2, int(gap * 0.05)), cv2.LINE_AA)


def illustrate(gray: np.ndarray) -> tuple[np.ndarray, bool]:
    """gray: recorte en grises. Devuelve (ilustración BGRA con fondo transparente, hay rostro)."""
    found = _find_face(gray)
    big = cv2.resize(gray, None, fx=SCALE, fy=SCALE, interpolation=cv2.INTER_CUBIC)
    big = cv2.bilateralFilter(big, 9, 45, 7)
    original = big
    height, width = big.shape

    geometry = _face_geometry(found) if found is not None else None
    face_mask = np.zeros(big.shape, np.uint8)      # óvalo del rostro: tono de piel plano
    feature_mask = np.zeros(big.shape, np.uint8)   # ojos, nariz y boca: sin ningún trazo original
    if geometry:
        right_eye, left_eye, eyes, mouth, face_h, gap, angle, nose = geometry
        centre = eyes * 0.5 + mouth * 0.5
        cv2.ellipse(face_mask, (int(centre[0]), int(centre[1])),
                    (int(gap * 0.98), int(face_h * 1.1 + gap * 0.38)), angle, 0, 360, 1, -1)
        for eye in (right_eye, left_eye):
            cv2.ellipse(feature_mask, (int(eye[0]), int(eye[1] - gap * 0.14)),
                        (int(gap * 0.5), int(gap * 0.5)), angle, 0, 360, 1, -1)
        cv2.ellipse(feature_mask, (int(nose[0]), int(nose[1])), (int(gap * 0.4), int(gap * 0.42)), angle, 0, 360, 1, -1)
        cv2.ellipse(feature_mask, (int(mouth[0]), int(mouth[1])), (int(gap * 0.62), int(gap * 0.36)), angle, 0, 360, 1, -1)
        big = np.where(face_mask == 1, np.clip(big, 200, 222), big).astype(np.uint8)

    white = cv2.medianBlur((big > BG_LEVEL).astype(np.uint8), 5)
    dark = cv2.medianBlur((big < DARK_LEVEL).astype(np.uint8), 5)

    # Blanco: fondo, huecos entre brazo y cuerpo o flechas dibujadas sobre la ropa.
    count, labels, stats = _components(white)
    background = np.zeros(big.shape, np.uint8)
    body_arrows = np.zeros(big.shape, np.uint8)
    for i in range(1, count):
        x, y, w, h, area = stats[i]
        touches_edge = x == 0 or y == 0 or x + w >= width or y + h >= height
        if not touches_edge and area < 0.02 * big.size and _ring_share(labels, i, stats, dark) > 0.6:
            body_arrows[labels == i] = 1
        else:
            background[labels == i] = 1

    # Oscuro: ropa y pelo (zonas grandes), flechas sobre el fondo o trazos finos.
    count, labels, stats = _components(dark)
    cloth = np.zeros(big.shape, np.uint8)
    bg_arrows = np.zeros(big.shape, np.uint8)
    strokes = np.zeros(big.shape, np.uint8)
    for i in range(1, count):
        if stats[i, cv2.CC_STAT_AREA] > 0.012 * big.size:
            cloth[labels == i] = 1
        elif _ring_share(labels, i, stats, background) > 0.75:
            bg_arrows[labels == i] = 1
        else:
            strokes[labels == i] = 1

    hair = np.zeros(big.shape, np.uint8)
    if geometry:
        eyes, mouth, gap = geometry[2], geometry[3], geometry[5]
        chin = mouth[1] + gap * 1.3
        count, labels, stats = _components(cloth)
        zone = np.zeros(big.shape, np.uint8)
        cv2.ellipse(zone, (int(eyes[0]), int(eyes[1])), (int(gap * 3.2), int(gap * 3.2)), 0, 0, 360, 1, -1)
        zone[int(max(chin, 0)):, :] = 0
        for i in range(1, count):
            part = labels == i
            above = float(part[:int(max(chin, 0))].sum()) / max(stats[i, cv2.CC_STAT_AREA], 1)
            if above > 0.7:
                hair[part] = 1                     # mechón separado de la ropa
            else:
                hair[part & (zone == 1)] = 1       # pelo unido a la ropa: se recorta en la mandíbula

    skin = 1 - np.clip(background + body_arrows + dark, 0, 1)
    shade = skin & cv2.medianBlur((big < SHADE_LEVEL).astype(np.uint8), 7)
    shirt_shade = cloth & (1 - hair) & cv2.medianBlur((big < 38).astype(np.uint8), 9)

    canvas = np.zeros((height, width, 3), np.uint8)
    for mask, colour in ((skin, SKIN), (shade, SKIN_SHADE), (cloth, SHIRT), (shirt_shade, SHIRT_SHADE),
                         (hair, HAIR), (strokes, INK), (body_arrows, ARROW_ON_BODY), (bg_arrows, ARROW_ON_BG)):
        canvas[mask == 1] = colour

    # Contorno de tinta entre regiones y líneas interiores de los dedos.
    regions = (background + 2 * skin + 3 * (cloth & (1 - hair)) + 4 * hair + 5 * body_arrows).astype(np.uint8)
    kernel = np.ones((3, 3), np.uint8)
    outline = (cv2.dilate(regions, kernel) != cv2.erode(regions, kernel)).astype(np.uint8)
    outline = cv2.dilate(outline, kernel) & (1 - bg_arrows)
    fine = cv2.adaptiveThreshold(cv2.GaussianBlur(original, (0, 0), 1.6), 1, cv2.ADAPTIVE_THRESH_MEAN_C,
                                 cv2.THRESH_BINARY_INV, 17, 7)
    fine = cv2.medianBlur(fine & skin & (1 - feature_mask), 3)
    canvas[(outline | fine) == 1] = INK

    if geometry:
        _draw_face(canvas, geometry)

    alpha = cv2.GaussianBlur((1 - cv2.erode(background, kernel)).astype(np.float32) * 255, (0, 0), 0.8)
    alpha[bg_arrows == 1] = 255
    out = np.dstack([canvas, alpha.astype(np.uint8)])
    size = (round(gray.shape[1] * OUTPUT_SCALE), round(gray.shape[0] * OUTPUT_SCALE))
    return cv2.resize(out, size, interpolation=cv2.INTER_AREA), geometry is not None
