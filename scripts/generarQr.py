"""Genera el código QR (PNG y SVG) de la URL pública de Huellitas Saludables PRO.

Uso:
    pip install "qrcode[pil]" segno opencv-python-headless
    python scripts/generarQr.py https://TU-FRONTEND.onrender.com

Antes de guardar, el script comprueba que la URL sea HTTPS y no sea localhost,
y después de guardar lee el PNG de vuelta para confirmar que el QR contiene
exactamente esa URL.
"""
import sys
from pathlib import Path
from urllib.parse import urlparse

import cv2
import qrcode
import segno
from qrcode.constants import ERROR_CORRECT_H


def validarUrl(url):
    partes = urlparse(url)
    if partes.scheme != "https" or not partes.netloc:
        sys.exit("Error: la URL debe empezar por https:// y tener dominio.")
    if partes.hostname in ("localhost", "127.0.0.1", "0.0.0.0") or partes.hostname.endswith(".local"):
        sys.exit("Error: la URL no puede ser localhost; usa la URL pública.")


def generarQr(url, carpetaSalida):
    carpetaSalida.mkdir(parents=True, exist_ok=True)
    rutaPng = carpetaSalida / "qr-huellitas.png"
    rutaSvg = carpetaSalida / "qr-huellitas.svg"

    qr = qrcode.QRCode(error_correction=ERROR_CORRECT_H, box_size=20, border=4)
    qr.add_data(url)
    qr.make(fit=True)
    qr.make_image(fill_color="black", back_color="white").save(rutaPng)

    segno.make(url, error="h").save(str(rutaSvg), scale=20, border=4)

    leido, _, _ = cv2.QRCodeDetector().detectAndDecode(cv2.imread(str(rutaPng)))
    if leido != url:
        sys.exit(f"Error: el QR leído ({leido!r}) no coincide con la URL.")
    return rutaPng, rutaSvg


if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit("Uso: python scripts/generarQr.py https://TU-FRONTEND.onrender.com")
    urlPublica = sys.argv[1].strip()
    validarUrl(urlPublica)
    png, svg = generarQr(urlPublica, Path("qr"))
    print(f"QR verificado: apunta a {urlPublica}\n  {png}\n  {svg}")
