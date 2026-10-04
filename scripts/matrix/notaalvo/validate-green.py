#!/usr/bin/env python3
"""Validação do NotaAlvo Green (Auth, RLS, isolamento, RPC, grants de anon e Storage).

Só toca no Green. As chaves de API chegam por variável de ambiente (ANON_KEY e SERVICE_KEY),
repassadas pelo chamador a partir do container de Storage do Green. Nunca são impressas.
Cria dois usuários de teste com e-mail descartável e os remove ao final.

Uso:
  ANON_KEY=... SERVICE_KEY=... python3 validate-green.py <base_url>
"""
import json, os, secrets, sys, urllib.error, urllib.parse, urllib.request

BASE = sys.argv[1].rstrip("/")

results = []


def check(name, ok, detail=""):
    results.append((name, bool(ok)))
    print(f"{'PASS' if ok else 'FAIL'} {name}{(' — ' + detail) if detail else ''}")


def http(method, url, headers=None, body=None):
    data = json.dumps(body).encode() if isinstance(body, (dict, list)) else body
    req = urllib.request.Request(url, data=data, method=method, headers=headers or {})
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            raw = r.read()
            return r.status, (json.loads(raw) if raw and raw[:1] in b"[{" else raw)
    except urllib.error.HTTPError as e:
        raw = e.read()
        try:
            return e.code, json.loads(raw)
        except Exception:
            return e.code, raw


ANON = os.environ["ANON_KEY"]
SERVICE = os.environ["SERVICE_KEY"]
H_ANON = {"apikey": ANON, "Authorization": f"Bearer {ANON}", "Content-Type": "application/json"}
H_SERVICE = {"apikey": SERVICE, "Authorization": f"Bearer {SERVICE}", "Content-Type": "application/json"}

# 1. Saúde das rotas públicas
for path in ("/auth/v1/health", "/rest/v1/", "/storage/v1/version"):
    code, _ = http("GET", BASE + path, {"apikey": ANON})
    check(f"rota {path} responde 200", code == 200, f"HTTP {code}")

# 2. Usuários de teste (somente Green)
created = []
pwd = secrets.token_urlsafe(18)
users = {}
for label in ("a", "b"):
    email = f"validacao-{label}-{secrets.token_hex(4)}@example.invalid"
    code, body = http("POST", f"{BASE}/auth/v1/admin/users", H_SERVICE,
                      {"email": email, "password": pwd, "email_confirm": True})
    ok = code in (200, 201) and isinstance(body, dict) and body.get("id")
    check(f"criar usuário de teste {label}", ok, f"HTTP {code}")
    if ok:
        created.append(body["id"])
        users[label] = {"id": body["id"], "email": email}

try:
    # 3. Login por senha e token de sessão
    tokens = {}
    for label, u in users.items():
        code, body = http("POST", f"{BASE}/auth/v1/token?grant_type=password", H_ANON,
                          {"email": u["email"], "password": pwd})
        ok = code == 200 and isinstance(body, dict) and body.get("access_token")
        check(f"login por senha usuário {label}", ok, f"HTTP {code}")
        if ok:
            tokens[label] = body["access_token"]

    # 4. Isolamento via RLS: cada usuário vê só o próprio profile
    if len(tokens) == 2:
        for label, other in (("a", "b"), ("b", "a")):
            code, rows = http("GET", f"{BASE}/rest/v1/profiles?select=id", {
                "apikey": ANON, "Authorization": f"Bearer {tokens[label]}"})
            ids = {r.get("id") for r in rows} if isinstance(rows, list) else set()
            check(f"RLS profiles: usuário {label} vê só o próprio registro",
                  code == 200 and ids == {users[label]["id"]}, f"HTTP {code}, linhas={len(ids)}")
            check(f"RLS profiles: usuário {label} não vê o registro de {other}",
                  users[other]["id"] not in ids)

    # 5. Anon não lê dados privados
    code, rows = http("GET", f"{BASE}/rest/v1/candidate_states?select=user_id", {"apikey": ANON, "Authorization": f"Bearer {ANON}"})
    check("anon não lê candidate_states", code in (200, 401, 403) and (not isinstance(rows, list) or rows == []), f"HTTP {code}")

    # 6. Grants: funções de token e billing não executáveis por anon nem authenticated
    for fn in ("apply_stripe_event", "process_asaas_event", "claim_essay_radar_week"):
        code, _ = http("POST", f"{BASE}/rest/v1/rpc/{fn}", H_ANON, {})
        check(f"anon não executa RPC {fn}", code in (401, 403, 404), f"HTTP {code}")
        if "a" in tokens:
            code, _ = http("POST", f"{BASE}/rest/v1/rpc/{fn}", {"apikey": ANON, "Authorization": f"Bearer {tokens['a']}"}, {})
            check(f"authenticated não executa RPC {fn}", code in (401, 403, 404), f"HTTP {code}")

    # 7. RPC de service_role responde (consume_rate_limit)
    code, body = http("POST", f"{BASE}/rest/v1/rpc/consume_rate_limit", H_SERVICE,
                      {"p_key_hash": secrets.token_hex(32), "p_limit": 5, "p_window_seconds": 60})
    check("RPC consume_rate_limit (service_role) executa", code == 200, f"HTTP {code}")

    # 8. Storage: upload, leitura e remoção no bucket privado editais-private (service_role)
    obj = f"validacao/{secrets.token_hex(6)}.pdf"
    payload = b"%PDF-1.4\n% validacao green\n%%EOF\n"
    code, _ = http("POST", f"{BASE}/storage/v1/object/editais-private/{obj}",
                   {"apikey": SERVICE, "Authorization": f"Bearer {SERVICE}", "Content-Type": "application/pdf"}, payload)
    check("storage: upload PDF no bucket privado", code in (200, 201), f"HTTP {code}")
    code, data = http("GET", f"{BASE}/storage/v1/object/authenticated/editais-private/{obj}",
                      {"apikey": SERVICE, "Authorization": f"Bearer {SERVICE}"})
    check("storage: download autenticado do PDF", code == 200 and data == payload, f"HTTP {code}")
    code, _ = http("GET", f"{BASE}/storage/v1/object/editais-private/{obj}", {"apikey": ANON})
    check("storage: bucket privado não é lido por anon", code in (400, 401, 403, 404), f"HTTP {code}")
    code, _ = http("DELETE", f"{BASE}/storage/v1/object/editais-private/{obj}",
                   {"apikey": SERVICE, "Authorization": f"Bearer {SERVICE}"})
    check("storage: remoção do objeto de teste", code in (200, 204), f"HTTP {code}")
finally:
    # 9. Limpeza: remove usuários de teste (somente Green)
    for uid in created:
        code, _ = http("DELETE", f"{BASE}/auth/v1/admin/users/{uid}", H_SERVICE)
        check(f"remover usuário de teste {uid[:8]}", code in (200, 204), f"HTTP {code}")

failed = [n for n, ok in results if not ok]
print(f"\nTOTAL {len(results)} | PASS {len(results) - len(failed)} | FAIL {len(failed)}")
sys.exit(1 if failed else 0)
