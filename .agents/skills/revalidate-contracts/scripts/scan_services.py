#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script utilitario para escanear y extraer las rutas de la API invocadas en @repo/erp-services.
Cruza las constantes de @repo/erp-api-client (constants.ts) con los métodos de servicio,
contracts.json (OpenAPI) y audit-pairs.json para identificar endpoints encolados vs pendientes.
"""

import sys
import os
import re
import json
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

SCRIPT_DIR = Path(__file__).resolve().parent
SKILL_DIR = SCRIPT_DIR.parent
WORKSPACE_ROOT = SKILL_DIR.parents[4]
SERVICES_DIR = WORKSPACE_ROOT / "packages" / "erp-services" / "src"
API_CONSTANTS_FILE = WORKSPACE_ROOT / "packages" / "erp-api-client" / "src" / "constants.ts"
CONTRACTS_FILE = SKILL_DIR / "contracts.json"
AUDIT_PAIRS_FILE = SKILL_DIR / "audit-pairs.json"
BACKEND_TYPES_DIR = WORKSPACE_ROOT / "packages" / "api-contracts" / "src" / "erp" / "backendTypes"


def resolve_api_constants():
    """Lee y resuelve recursivamente las constantes definidas en erp-api-client/constants.ts."""
    constants = {}
    if not API_CONSTANTS_FILE.exists():
        return constants

    with open(API_CONSTANTS_FILE, "r", encoding="utf-8") as f:
        code = f.read()

    raw = {}
    for m in re.finditer(r"export\s+const\s+([A-Z0-9_]+)\s*=\s*(?:process\.env\.[A-Z0-9_]+\s*\|\|\s*)?[`\"']?([^`\"';\n]+)[`\"']?;", code):
        k, v = m.groups()
        raw[k] = v.strip().strip("`\"'")

    resolved = {"BASE_URL": "", "APIV1_URL": "/api/v1"}
    for _ in range(5):
        for k, v in raw.items():
            val = v.replace("${BASE_URL}", "").replace("${APIV1_URL}", "/api/v1")
            for rk, rv in list(resolved.items()):
                val = val.replace(f"${{{rk}}}", rv)
            if not val.startswith("/") and val:
                val = "/" + val
            resolved[k] = val
    return resolved


def clean_url_template(expr, constants):
    """Convierte expresiones de URL en rutas estandarizadas /api/v1/.../{param}."""
    # Si la expresión es un ternario de asignación (ej: cond ? `${URL}/a` : URL)
    if ("?" in expr and ":" in expr) and not expr.startswith("http"):
        # Buscar template literals en el ternario
        literals = re.findall(r"[`\"']([^`\"'\n]+)[`\"']", expr)
        if literals:
            expr = literals[0]
        else:
            for c_name in sorted(constants.keys(), key=len, reverse=True):
                if c_name in expr:
                    expr = c_name
                    break

    for c_name, c_val in sorted(constants.items(), key=lambda x: len(x[0]), reverse=True):
        expr = expr.replace(f"${{{c_name}}}", c_val)
        expr = expr.replace(f"{c_name}", c_val)
    
    # Remover ternarios internos en template strings (ej: ${companyId ? `?company_id=...` : ''})
    expr = re.sub(r"\$\{[^}]*\?.*", "", expr)

    # Remover query parameters
    expr = re.sub(r"\?.*$", "", expr)

    # Normalizar interpolaciones ${id}, ${companyId} -> {id}, {company_id}
    expr = re.sub(r"\$\{\s*([a-zA-Z0-9_]+)\s*\}", r"{\1}", expr)

    # Remover comillas residuales y barras finales
    expr = expr.strip().strip("`\"'")
    if len(expr) > 1 and expr.endswith("/"):
        expr = expr[:-1]
    return expr


def load_audited_endpoints():
    """Carga los endpoints ya mapeados en audit-pairs.json."""
    if not AUDIT_PAIRS_FILE.exists():
        return set(), {}

    with open(AUDIT_PAIRS_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)

    audited_set = set()
    pairs_by_endpoint = {}
    for pair in data.get("pairs", []):
        ep_raw = pair.get("endpoint", "")
        for sub_ep in ep_raw.split("|"):
            sub_ep = sub_ep.strip()
            if not sub_ep:
                continue
            parts = sub_ep.split()
            if len(parts) >= 2:
                verb, path = parts[0], parts[1].rstrip("/")
                key = f"{verb} {path}"
                audited_set.add(key)
                pairs_by_endpoint[key] = pair

    return audited_set, pairs_by_endpoint


def load_openapi_schemas():
    """Carga los paths y schemas de contracts.json."""
    if not CONTRACTS_FILE.exists():
        return {}, {}

    with open(CONTRACTS_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)

    paths = data.get("paths", {})
    schemas = data.get("components", {}).get("schemas", {})

    # Crear expresiones regulares para matching flexible de paths con parámetros
    normalized_paths = {}
    for p, p_val in paths.items():
        # {id} -> [^/]+
        regex_p = re.sub(r"\{[a-zA-Z0-9_]+\}", r"[^/]+", p)
        pattern = re.compile(rf"^{regex_p}$")
        normalized_paths[p] = {
            "pattern": pattern,
            "details": p_val
        }

    return paths, normalized_paths, schemas


def extract_schema_from_operation(op, verb):
    """Extrae el Schema OpenAPI relevante para un método HTTP."""
    if not op:
        return None

    if verb.lower() == "get":
        resp = op.get("responses", {}).get("200", {})
        s_def = resp.get("content", {}).get("application/json", {}).get("schema", {})
        if "$ref" in s_def:
            return s_def["$ref"].split("/")[-1]
        if s_def.get("type") == "array" and "$ref" in s_def.get("items", {}):
            return s_def["items"]["$ref"].split("/")[-1]
        if "properties" in s_def and "items" in s_def["properties"]:
            items_s = s_def["properties"]["items"]
            if "$ref" in items_s:
                return items_s["$ref"].split("/")[-1]
            if items_s.get("type") == "array" and "$ref" in items_s.get("items", {}):
                return items_s["items"]["$ref"].split("/")[-1]
    elif verb.lower() in ["post", "patch", "put"]:
        rb = op.get("requestBody", {})
        s_def = rb.get("content", {}).get("application/json", {}).get("schema", {})
        if "$ref" in s_def:
            return s_def["$ref"].split("/")[-1]
    return None


def scan_services(filter_str=None):
    """Escanea todos los archivos *.service.ts y extrae métodos, endpoints y schemas."""
    constants = resolve_api_constants()
    audited_set, pairs_by_ep = load_audited_endpoints()
    openapi_paths, normalized_paths, schemas = load_openapi_schemas()

    services = []

    for file_path in sorted(SERVICES_DIR.rglob("*.service.ts")):
        rel_path = str(file_path.relative_to(SERVICES_DIR)).replace("\\", "/")
        if filter_str and filter_str.lower() not in rel_path.lower():
            continue

        with open(file_path, "r", encoding="utf-8") as f:
            code = f.read()

        imported_ib = sorted(list(set(re.findall(r"\b(IB[A-Za-z0-9_]+)\b", code))))

        # Identificar límites exactos de cada método async
        method_spans = []
        for m in re.finditer(r"(?:async\s+([a-zA-Z0-9_]+)\s*\(([^)]*)\)\s*(?::\s*Promise<([^>]+)>)?\s*\{)", code):
            method_spans.append({
                "name": m.group(1),
                "params": m.group(2).strip(),
                "ret_type": (m.group(3) or "").strip(),
                "start": m.end()
            })

        methods = []
        for idx, ms in enumerate(method_spans):
            m_name = ms["name"]
            m_params = ms["params"]
            m_ret = ms["ret_type"]
            start_pos = ms["start"]
            end_pos = method_spans[idx + 1]["start"] if idx + 1 < len(method_spans) else len(code)

            snippet = code[start_pos:end_pos]

            # Extraer variables url dentro del cuerpo de este método
            url_vars = {}
            for uv in re.finditer(r"(?:const|let|var)\s+([a-zA-Z0-9_]+)\s*=\s*([^;\n]+);", snippet):
                url_vars[uv.group(1)] = uv.group(2).strip()
            for uv in re.finditer(r"new\s+URL\s*\(\s*[`\"']([^`\"'\n]+)[`\"']", snippet):
                url_vars["url"] = uv.group(1)

            # Buscar llamadas apiFetch
            endpoints = []
            seen_calls = set()
            fetch_matches = list(re.finditer(r"apiFetch(?:<([^>]+)>)?\s*\(([^;]+?)\);", snippet, re.DOTALL))
            for fm in fetch_matches:
                type_arg = fm.group(1) or ""
                args_body = fm.group(2).strip()

                method_m = re.search(r"method:\s*[\"']([A-Z]+)[\"']", args_body)
                http_verb = method_m.group(1) if method_m else "GET"

                first_arg = args_body.split(",")[0].strip().strip("`\"'")
                raw_url = url_vars.get(first_arg, first_arg)
                cleaned_url = clean_url_template(raw_url, constants)

                if not cleaned_url.startswith("/"):
                    continue

                call_key = f"{http_verb} {cleaned_url}"
                if call_key in seen_calls:
                    continue
                seen_calls.add(call_key)

                # Match con OpenAPI
                matched_openapi_path = None
                matched_schema = None
                if cleaned_url in openapi_paths:
                    matched_openapi_path = cleaned_url
                else:
                    for op_path, op_info in normalized_paths.items():
                        if op_info["pattern"].match(cleaned_url):
                            matched_openapi_path = op_path
                            break

                if matched_openapi_path:
                    op = openapi_paths[matched_openapi_path].get(http_verb.lower())
                    matched_schema = extract_schema_from_operation(op, http_verb)

                # Chequeo si está encolado en audit-pairs.json
                is_enqueued = False
                matched_pair = None
                ep_key = f"{http_verb} {cleaned_url}"
                if ep_key in audited_set:
                    is_enqueued = True
                    matched_pair = pairs_by_ep.get(ep_key)
                else:
                    norm_key = re.sub(r"\{[a-zA-Z0-9_]+\}", "{id}", ep_key)
                    for a_ep in audited_set:
                        a_norm = re.sub(r"\{[a-zA-Z0-9_]+\}", "{id}", a_ep)
                        if a_norm == norm_key:
                            is_enqueued = True
                            matched_pair = pairs_by_ep.get(a_ep)
                            break

                endpoints.append({
                    "http_method": http_verb,
                    "url": cleaned_url,
                    "openapi_path": matched_openapi_path,
                    "backend_schema": matched_schema,
                    "type_param": type_arg,
                    "is_enqueued": is_enqueued,
                    "pair": matched_pair
                })

            if endpoints:
                methods.append({
                    "name": m_name,
                    "params": m_params,
                    "return_type": m_ret,
                    "endpoints": endpoints
                })

        services.append({
            "file": rel_path,
            "imported_ib": imported_ib,
            "methods": methods
        })

    return services


def main():
    filter_arg = None
    show_only_unmapped = "--unmapped" in sys.argv
    as_json = "--json" in sys.argv
    as_candidates = "--candidates" in sys.argv

    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    if args:
        filter_arg = args[0]

    services = scan_services(filter_arg)

    if as_json:
        print(json.dumps(services, indent=2, ensure_ascii=False))
        return

    if as_candidates:
        candidates = []
        for s in services:
            domain = s["file"].split("/")[0] if "/" in s["file"] else "common"
            service_name = Path(s["file"]).stem.replace(".service", "")
            for m in s["methods"]:
                for ep in m["endpoints"]:
                    if not ep["is_enqueued"] and ep["backend_schema"]:
                        # Sugerir ts_interface
                        ts_intf = None
                        if ep["type_param"] and ep["type_param"].startswith("IB"):
                            ts_intf = ep["type_param"]
                        elif s["imported_ib"]:
                            ts_intf = s["imported_ib"][0]

                        candidates.append({
                            "domain": domain,
                            "label": f"{service_name.capitalize()} - {m['name']}",
                            "ts_file": f"{service_name}.types.ts",
                            "ts_interface": ts_intf or f"IB{ep['backend_schema'].replace('Response', '').replace('Request', '')}",
                            "backend_schema": ep["backend_schema"],
                            "service_method": f"{service_name}Service.{m['name']}",
                            "endpoint": f"{ep['http_method']} {ep['openapi_path'] or ep['url']}"
                        })
        print(json.dumps(candidates, indent=2, ensure_ascii=False))
        return

    # Salida estándar formateada
    total_endpoints = sum(len(m["endpoints"]) for s in services for m in s["methods"])
    enqueued_count = sum(1 for s in services for m in s["methods"] for ep in m["endpoints"] if ep["is_enqueued"])
    pending_count = total_endpoints - enqueued_count

    print("=================================================================")
    print(f" ESCANEO INTEGRAL DE SERVICIOS ({len(services)} archivos analizados)")
    print(f" Total Endpoints Detectados: {total_endpoints}")
    print(f"   [ENCOLADOS  ✅]: {enqueued_count} endpoints ya auditados en audit-pairs.json")
    print(f"   [PENDIENTES ⏳]: {pending_count} endpoints pendientes de encolar")
    print("=================================================================")

    for s in services:
        endpoints_in_service = [ep for m in s["methods"] for ep in m["endpoints"]]
        if show_only_unmapped and all(ep["is_enqueued"] for ep in endpoints_in_service):
            continue

        print(f"\n📂 {s['file']}")
        if s["imported_ib"]:
            print(f"   🏷️  Tipos IB importados: {', '.join(s['imported_ib'])}")

        for m in s["methods"]:
            for ep in m["endpoints"]:
                if show_only_unmapped and ep["is_enqueued"]:
                    continue

                status_tag = "✅ ENCOLADO" if ep["is_enqueued"] else "⏳ PENDIENTE"
                schema_tag = f"-> Schema: {ep['backend_schema']}" if ep['backend_schema'] else ""
                fe_type_tag = f"[{ep['type_param']}]" if ep['type_param'] else ""

                print(f"   [{ep['http_method']:6}] {ep['url']:45} {status_tag} {schema_tag} {fe_type_tag}")


if __name__ == "__main__":
    main()

