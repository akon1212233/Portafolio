"""Exporta el portafolio estático a dist/ para GitHub Pages."""
from pathlib import Path
import shutil

root = Path(__file__).resolve().parent
output = root / "dist"
output.mkdir(exist_ok=True)
shutil.copy2(root / "flask_app/templates/index.html", output / "index.html")
shutil.copytree(root / "flask_app/static", output / "static", dirs_exist_ok=True)
(output / ".nojekyll").touch()
print(f"Portafolio exportado a {output}")
