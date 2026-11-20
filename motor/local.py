#!/usr/bin/env python3
"""Bona Nota en local: http://localhost:8000, sempre al dia amb GitHub.

Ús (des de la carpeta del repo):   python3 motor/local.py [port]
  - Serveix la web a http://localhost:<port> (per defecte 8000).
  - Cada 20 segons fa «git pull»: el que es publica a GitHub arriba sol al teu localhost.
    Quan baixa canvis ho diu aquí; recarrega la pàgina per veure'ls.
  - Ctrl+C ho atura tot.
"""
import functools, http.server, pathlib, socketserver, subprocess, sys, threading, time

arrel = pathlib.Path(__file__).resolve().parent.parent
port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000


def git(*a):
    return subprocess.run(["git", "-C", str(arrel), *a], capture_output=True, text=True)


def sincronitza():
    darrer = git("rev-parse", "HEAD").stdout.strip()
    while True:
        r = git("pull", "--rebase", "--autostash", "-q")
        ara = git("rev-parse", "HEAD").stdout.strip()
        if r.returncode:
            print("⚠ No he pogut baixar de GitHub:", (r.stderr or r.stdout).strip()[:200], flush=True)
        elif ara != darrer:
            msg = git("log", "-1", "--format=%s").stdout.strip()
            print(time.strftime("%H:%M:%S"), "⬇ Canvis nous de GitHub:", msg, "→ recarrega la pàgina", flush=True)
            darrer = ara
        time.sleep(20)


class Pagina(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store")  # sempre l'última versió, sense memòria cau
        super().end_headers()

    def list_directory(self, path):
        # Com GitHub Pages: una carpeta sense index.html (p. ex. /sociales/) torna 404.html, no un llistat de fitxers
        self.send_error(404, "File not found")
        return None

    def send_error(self, code, message=None, explain=None):
        f404 = arrel / "404.html"
        if code == 404 and f404.is_file():
            body = f404.read_bytes()
            self.send_response(404)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            if self.command != "HEAD":
                self.wfile.write(body)
            return
        super().send_error(code, message, explain)

    def log_message(self, *a):
        pass


threading.Thread(target=sincronitza, daemon=True).start()
socketserver.ThreadingTCPServer.allow_reuse_address = True
with socketserver.ThreadingTCPServer(("127.0.0.1", port), functools.partial(Pagina, directory=str(arrel))) as srv:
    print(f"Bona Nota en local: http://localhost:{port}   (es posa al dia amb GitHub cada 20 s · Ctrl+C per aturar)", flush=True)
    try:
        srv.serve_forever()
    except KeyboardInterrupt:
        print("\nAturat.")
