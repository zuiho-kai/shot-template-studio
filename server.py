import http.server
import json
import os
import urllib.parse
from pathlib import Path

PORT = 8090
BASE_DIR = Path(__file__).parent
TEMPLATES_DIR = BASE_DIR / "templates"
WEB_DIR = BASE_DIR / "web"


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(WEB_DIR), **kwargs)

    def do_GET(self):
        if self.path == "/api/templates":
            self.list_templates()
        elif self.path.startswith("/api/templates/"):
            raw = self.path[len("/api/templates/"):]
            if "?download=1" in raw:
                name = urllib.parse.unquote(raw.replace("?download=1", ""))
                self.download_template(name)
            else:
                name = urllib.parse.unquote(raw)
                self.get_template(name)
        else:
            super().do_GET()

    def do_POST(self):
        if self.path == "/api/templates":
            length = int(self.headers.get("Content-Length", 0))
            body = json.loads(self.rfile.read(length))
            self.save_template(body.get("name", ""), body.get("content", ""))
        else:
            self.send_error(404)

    def do_DELETE(self):
        if self.path.startswith("/api/templates/"):
            name = urllib.parse.unquote(self.path[len("/api/templates/"):])
            self.delete_template(name)
        else:
            self.send_error(404)

    def list_templates(self):
        TEMPLATES_DIR.mkdir(exist_ok=True)
        templates = []
        for f in sorted(TEMPLATES_DIR.glob("*.txt")):
            content = f.read_text(encoding="utf-8")
            templates.append({"name": f.stem, "content": content})
        self.json_response(templates)

    def get_template(self, name):
        path = TEMPLATES_DIR / f"{name}.txt"
        if not path.exists():
            self.send_error(404, "Template not found")
            return
        content = path.read_text(encoding="utf-8")
        self.json_response({"name": name, "content": content})

    def download_template(self, name):
        path = TEMPLATES_DIR / f"{name}.txt"
        if not path.exists():
            self.send_error(404, "Template not found")
            return
        content = path.read_bytes()
        self.send_response(200)
        self.send_header("Content-Type", "text/plain; charset=utf-8")
        self.send_header("Content-Disposition", f'attachment; filename="{urllib.parse.quote(name)}.txt"')
        self.send_header("Content-Length", str(len(content)))
        self.end_headers()
        self.wfile.write(content)

    def save_template(self, name, content):
        if not name or not content:
            self.send_error(400, "name and content required")
            return
        TEMPLATES_DIR.mkdir(exist_ok=True)
        path = TEMPLATES_DIR / f"{name}.txt"
        path.write_text(content, encoding="utf-8")
        self.json_response({"ok": True, "name": name})

    def delete_template(self, name):
        path = TEMPLATES_DIR / f"{name}.txt"
        if not path.exists():
            self.send_error(404, "Template not found")
            return
        path.unlink()
        self.json_response({"ok": True, "deleted": name})

    def json_response(self, data, status=200):
        body = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, format, *args):
        pass


if __name__ == "__main__":
    os.chdir(BASE_DIR)
    with http.server.HTTPServer(("127.0.0.1", PORT), Handler) as server:
        print(f"Shot Template Studio running at http://localhost:{PORT}")
        print("Press Ctrl+C to stop.")
        try:
            server.serve_forever()
        except KeyboardInterrupt:
            print("\nStopped.")
