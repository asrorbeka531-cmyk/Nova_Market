"""
NOVA Market - Himoyalangan Mahalliy Veb-Server (Cybersecurity Hardened)
Ushbu server quyidagi kiberxavfsizlik himoya vositalari bilan jihozlangan:
1. Path Traversal (Katalogdan chiqib ketish) hujumlariga qarshi tekshiruv.
2. Maxfiy fayllarni (masalan, .py, .bat, .git, .env) brauzer orqali yuklab olishni taqiqlash.
3. Server bannerini yashirish (Server Fingerprinting va CVE exploitlarining oldini olish).
4. HTTP Security Headers:
   - Content-Security-Policy (CSP)
   - X-Frame-Options: SAMEORIGIN (Clickjacking hujumiga qarshi)
   - X-Content-Type-Options: nosniff (MIME-sniffing hujumiga qarshi)
   - X-XSS-Protection: 1; mode=block
   - Referrer-Policy: strict-origin-when-cross-origin
   - Permissions-Policy: kamera va mikrofon ruxsatlarini bloklash
5. Faqat xavfsiz HTTP metodlariga (GET, HEAD) ruxsat berish (Method Not Allowed).
"""

import http.server
import socketserver
import webbrowser
import os
import sys
import posixpath
import urllib.parse

PORT = 8000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

# Bloklanadigan maxfiy kengaytmalar va fayllar
FORBIDDEN_EXTENSIONS = {".py", ".bat", ".env", ".git", ".md", ".log"}
FORBIDDEN_FILENAMES = {"server.py", "run_store.bat", "run_admin.bat"}

class SecureHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    # Server identifikatori va versiyasini yashirish (Anti-fingerprinting)
    server_version = "NovaShield/2.0"
    sys_version = ""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        # Kiberxavfsizlik HTTP sarlavhalari (Enterprise Security Headers)
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("X-Frame-Options", "SAMEORIGIN")
        self.send_header("X-XSS-Protection", "1; mode=block")
        self.send_header("Referrer-Policy", "strict-origin-when-cross-origin")
        self.send_header(
            "Permissions-Policy", 
            "geolocation=(), camera=(), microphone=(), payment=()"
        )
        self.send_header(
            "Content-Security-Policy",
            "default-src 'self' 'unsafe-inline' https: data: blob:; "
            "connect-src 'self' https:; "
            "font-src 'self' https://fonts.gstatic.com; "
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
            "script-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com https://unpkg.com https://cdn.jsdelivr.net; "
            "img-src 'self' data: https: blob:; "
            "frame-ancestors 'self';"
        )
        super().end_headers()

    def translate_path(self, path):
        """
        Path Traversal (katalogdan chiqib ketish) hujumlarini qat'iy tekshirish
        """
        path = path.split('?', 1)[0]
        path = path.split('#', 1)[0]
        trailing_slash = path.rstrip().endswith('/')
        try:
            path = urllib.parse.unquote(path, errors='surrogatepass')
        except UnicodeDecodeError:
            path = urllib.parse.unquote(path)
        path = posixpath.normpath(path)
        words = path.split('/')
        words = filter(None, words)
        
        resolved_path = DIRECTORY
        for word in words:
            if os.path.dirname(word) or word in (os.curdir, os.pardir):
                # '..' yoki maxfiy belgilar aniqlansa, xavfsiz emas
                return None
            resolved_path = os.path.join(resolved_path, word)
            
        if trailing_slash:
            resolved_path += '/'
            
        # Resolved path asosiy DIRECTORY ichida ekanligini qat'iy kafolatlash
        try:
            real_resolved = os.path.realpath(resolved_path)
            real_base = os.path.realpath(DIRECTORY)
            if not real_resolved.startswith(real_base):
                return None
        except Exception:
            return None

        return resolved_path

    def do_GET(self):
        # 1. Path traversal tekshiruvi
        resolved = self.translate_path(self.path)
        if not resolved:
            self.send_error(403, "Kiberxavfsizlik qoidasi: Ruxsat berilmagan so'rov (Forbidden - Path Traversal Blocked)")
            return

        # 2. Maxfiy fayllarni himoyalash (.py, .bat, .env, va hk.)
        base_name = os.path.basename(resolved.rstrip("/\\"))
        _, ext = os.path.splitext(base_name)
        if ext.lower() in FORBIDDEN_EXTENSIONS or base_name in FORBIDDEN_FILENAMES or base_name.startswith('.'):
            self.send_error(403, "Kiberxavfsizlik qoidasi: Ushbu tizim fayliga kirish cheklangan (Protected System File)")
            return

        super().do_GET()

    def do_HEAD(self):
        resolved = self.translate_path(self.path)
        if not resolved:
            self.send_error(403, "Forbidden")
            return
        super().do_HEAD()

    def do_POST(self):
        # Statik veb serverda ruxsatsiz POST so'rovlarini rad etish
        self.send_error(405, "Ushbu resurs uchun POST so'rovi qo'llab-quvvatlanmaydi (Method Not Allowed)")

    def do_PUT(self):
        self.send_error(405, "Method Not Allowed")

    def do_DELETE(self):
        self.send_error(405, "Method Not Allowed")


def run():
    os.chdir(DIRECTORY)
    # Port band bo'lsa darhol qayta ishlatish (SO_REUSEADDR)
    socketserver.TCPServer.allow_reuse_address = True
    
    with socketserver.TCPServer(("", PORT), SecureHTTPRequestHandler) as httpd:
        url = f"http://localhost:{PORT}"
        print("=" * 65)
        print("🛡️  NOVA Market - Himoyalangan Veb-Server (Kiberxavfsizlik Faol)")
        print(f"🌐 Manzil: {url}")
        print("🔒 Himoyalar: CSP, XSS Shield, Anti-Clickjacking, Path-Traversal Guard")
        print("To'xtatish uchun: Ctrl + C bosing")
        print("=" * 65)
        try:
            webbrowser.open(url)
        except Exception:
            pass
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer xavfsiz to'xtatildi.")
            httpd.server_close()


if __name__ == "__main__":
    run()
