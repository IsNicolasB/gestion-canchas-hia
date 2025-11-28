#!/usr/bin/env python3
# test_fail2ban_no_deps.py
# No requiere paquetes externos
# Uso: python test_fail2ban_no_deps.py

import urllib.request
import urllib.error
import urllib.parse
import ssl
import time
import subprocess
import base64

TARGET = "https://jayme-subvesicular-paulene.ngrok-free.dev/"
VERIFY_SSL = True  # Cambiar a True en producción si el certificado es válido
HEADERS = {"User-Agent": "security-test-agent/1.0"}
TIMEOUT = 5

# Contexto SSL: permitir certificados autofirmados en entorno de pruebas
if VERIFY_SSL:
    ssl_context = None
else:
    ssl_context = ssl.create_default_context()
    ssl_context.check_hostname = False
    ssl_context.verify_mode = ssl.CERT_NONE

def safe_request(path, extra_headers=None, timeout=TIMEOUT):
    url = TARGET + path
    headers = HEADERS.copy()
    if extra_headers:
        headers.update(extra_headers)
    req = urllib.request.Request(url, headers=headers, method="GET")
    try:
        with urllib.request.urlopen(req, timeout=timeout, context=ssl_context) as resp:
            code = resp.getcode()
            body = resp.read(200).decode(errors="ignore")
            return code, body
    except urllib.error.HTTPError as e:
        # Respuesta HTTP con código (p. ej. 401, 403, 429)
        try:
            body = e.read(200).decode(errors="ignore")
        except Exception:
            body = ""
        return e.code, body
    except urllib.error.URLError as e:
        return None, f"URLError: {e.reason}"
    except Exception as e:
        return None, f"Error: {str(e)}"

def print_status(msg):
    print("\n---", msg)

# 1) nginx-4xx: generar 11 respuestas 4xx (maxretry=10)
print_status("nginx-4xx: generando 11 4xx")
for i in range(11):
    code, _ = safe_request(f"/nonexistent_{i}")  # 404 esperado
    print(i+1, "->", code)
    time.sleep(0.5)

# 2) nginx-badbots / nginx-botsearch: peticiones con UA sospechoso y paths de bots
print_status("nginx-badbots / botsearch: UA y paths sospechosos")
bad_ua = {"User-Agent": "curl/7.64.1 (bot) scanner"}
for path in ["/wp-login.php", "/xmlrpc.php", "/admin.php"]:
    code, info = safe_request(path, extra_headers=bad_ua)
    print(path, "->", code, "|", info.splitlines()[0] if info else "")
    time.sleep(0.3)

# 3) nginx-ddos: ráfaga de 60 peticiones en ~12s (maxretry=50 en 60s)
print_status("nginx-ddos: ráfaga de 60 peticiones")
for i in range(60):
    code, _ = safe_request(f"/?q=ddos_test_{i}")
    if i % 10 == 0:
        print("sent", i)
    time.sleep(0.2)

# 4) nginx-limit-req: generar 5 peticiones rápidas a endpoint limitable
print_status("nginx-limit-req: generando 5 peticiones rápidas a endpoint limitable")
for i in range(5):
    code, _ = safe_request("/rate_limited_endpoint")
    print(i+1, "->", code)
    time.sleep(0.5)

# 5) nginx-login-bruteforce: intentos de login fallidos (5+)
print_status("nginx-login-bruteforce: intentos de login fallidos")
for i in range(6):
    # Enviar POST /api/auth/login con credenciales inválidas para disparar el filtro nginx-login-bruteforce
    user = "admin"
    pwd = f"wrong{i}"
    payload = {"email": user, "password": pwd}
    body = urllib.parse.urlencode(payload).encode()

    url = TARGET + "/api/auth/login"
    headers = {
        "Content-Type": "application/x-www-form-urlencoded",
        **HEADERS,
    }

    req = urllib.request.Request(url, data=body, headers=headers, method="POST")

    try:
        with urllib.request.urlopen(req, timeout=TIMEOUT, context=ssl_context) as resp:
            code = resp.getcode()
            info = resp.read(200).decode(errors="ignore")
    except urllib.error.HTTPError as e:
        code = e.code
        try:
            info = e.read(200).decode(errors="ignore")
        except Exception:
            info = ""
    except Exception as e:
        code, info = None, str(e)

    print(i + 1, "->", code, "|", info.splitlines()[0] if info else "")
    time.sleep(0.5)

# 6) nginx-modsecurity: payloads típicos (URL-encoded)
print_status("nginx-modsecurity: payloads ModSecurity")
payloads = ["?q=<script>alert(1)</script>", "?q=1' OR '1'='1", "?q=;cat /etc/passwd"]
for p in payloads:
    encoded = urllib.parse.quote_plus(p)
    code, info = safe_request("/" + encoded)
    print(p, "->", code, "|", info.splitlines()[0] if info else "")
    time.sleep(0.5)

"""Sección final: consultar estado de Fail2Ban y de cada jail relevante."""

print_status("Esperando 3s y consultando fail2ban")
time.sleep(3)

try:
    out = subprocess.check_output(
        ["docker", "exec", "fail2ban", "fail2ban-client", "status"],
        stderr=subprocess.STDOUT,
        text=True,
    )
    print(out)
except subprocess.CalledProcessError as e:
    print("No se pudo consultar fail2ban:", e.output)

# Consultar el estado de cada jail configurada
jails = [
    "nginx-4xx",
    "nginx-badbots",
    "nginx-botsearch",
    "nginx-ddos",
    "nginx-limit-req",
    "nginx-login-bruteforce",
    "nginx-modsecurity",
    "nginx-noscript",
]

for jail in jails:
    print_status(f"Estado de la jail: {jail}")
    try:
        out_jail = subprocess.check_output(
            ["docker", "exec", "fail2ban", "fail2ban-client", "status", jail],
            stderr=subprocess.STDOUT,
            text=True,
        )
        print(out_jail)
    except subprocess.CalledProcessError as e:
        print(f"No se pudo consultar la jail {jail}:", e.output)