#!/usr/bin/env python3
"""Static server for local dev. Sends no-store cache headers so module
edits show up on a plain reload (no hard-refresh needed)."""

from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

PORT = 8000


class NoCacheHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, must-revalidate")
        super().end_headers()


if __name__ == "__main__":
    print(f"Serving on http://localhost:{PORT}")
    ThreadingHTTPServer(("", PORT), NoCacheHandler).serve_forever()
