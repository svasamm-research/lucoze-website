#!/usr/bin/env python3
"""
Local mock of Listmonk's public subscription API — for testing the SubscribeForm
UX (loading state, success/error messages) without hitting prod.

Why a mock and not the real server: prod CORS only allows the https://lucoze.com
origin, so a POST from http://localhost:4321 is blocked by the browser and you'd
only ever see the error state. This mock allows the dev origin and adds a small
delay so the "Subscribing…" state is actually visible.

Usage (two terminals):

    # 1) start the mock
    python3 scripts/mock-subscribe.py            # listens on :9999

    # 2) run the site pointed at it
    PUBLIC_MARKETING_URL=http://localhost:9999 PUBLIC_NEWSLETTER_LIST_UUID=test npm run dev

Then subscribe on the site. To see the ERROR path instead, submit an email
containing "fail" (e.g. fail@test.com) — the mock returns 500 for those.
"""

import json
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

PORT = 9999
DELAY_SECONDS = 0.8  # make the loading state visible


class Handler(BaseHTTPRequestHandler):
    def _cors(self):
        # Reflect the dev origin; allow the JSON preflight.
        self.send_header("Access-Control-Allow-Origin", self.headers.get("Origin", "*"))
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Access-Control-Max-Age", "86400")

    def do_OPTIONS(self):
        self.send_response(204)
        self._cors()
        self.end_headers()

    def do_POST(self):
        length = int(self.headers.get("Content-Length", 0))
        raw = self.rfile.read(length) if length else b"{}"
        try:
            email = json.loads(raw).get("email", "")
        except Exception:
            email = ""

        time.sleep(DELAY_SECONDS)

        fail = "fail" in email.lower()
        status = 500 if fail else 200
        print(f"  POST {email!r} -> {status}")

        self.send_response(status)
        self._cors()
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        body = {"data": {"email": email}} if not fail else {"message": "mock failure"}
        self.wfile.write(json.dumps(body).encode())

    def log_message(self, *args):
        pass  # quiet; we print our own line


if __name__ == "__main__":
    print(f"mock subscribe API on http://localhost:{PORT}  (Ctrl-C to stop)")
    print("  success: any email  |  error: email containing 'fail'")
    ThreadingHTTPServer(("127.0.0.1", PORT), Handler).serve_forever()
