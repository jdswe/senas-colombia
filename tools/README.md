# Herramientas de datos

Regeneran `data/` a partir de `recursos/Diccionario-lengua-de-senas.pdf`.

Requisitos: `poppler-utils` (pdftohtml, pdftoppm), Python 3 con `numpy` y `opencv-python-headless`.

```sh
python3 tools/build_data.py              # señas + ilustraciones (unos 5 min)
python3 tools/build_data.py --skip-images  # solo los JSON
python3 tools/build_alphabet.py          # alfabeto manual
```

- `build_data.py` separa cada entrada (palabra, acepciones, ejemplo, descripción) y recorta sus fotos.
- `illustrate.py` redibuja cada foto como caricatura plana con rostro genérico.
- `models/face_detection_yunet.onnx` es el detector de rostros YuNet de OpenCV Zoo.
- `sin-rostro-detectado.txt` lista las imágenes en las que no se halló rostro, para revisarlas a mano.
