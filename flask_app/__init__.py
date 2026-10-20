"""Aplicación local del portafolio de Akon Bustamante."""
from flask import Flask, render_template


def create_app():
    app = Flask(__name__)

    @app.get("/")
    def index():
        return render_template("index.html")

    return app
