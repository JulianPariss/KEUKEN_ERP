#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script utilitario para revalidar y auditar discrepancias entre:
1. Constantes y servicios del frontend (`api.constants.ts`, `src/app/services/`)
2. Tipos de Backend definidos en el frontend (`packages/api-contracts/src/erp/backendTypes/`)
3. Especificación OpenAPI del backend (`contracts.json`)
4. Archivo de mapeos de pares dinámico (`audit-pairs.json`)
"""

import sys
import os
import json
import re
import argparse
from datetime import datetime
from pathlib import Path

# Configurar stdout a utf-8 para evitar errores de codificación en consolas Windows
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

SCRIPT_DIR = Path(__file__).resolve().parent
SKILL_DIR = SCRIPT_DIR.parent
DEFAULT_CONTRACTS_PATH = SKILL_DIR / "contracts.json"
DEFAULT_PAIRS_PATH = SKILL_DIR / "audit-pairs.json"
DEFAULT_RESULTS_DIR = SKILL_DIR / "results"
DEFAULT_OUTPUT_PATH = DEFAULT_RESULTS_DIR / "services-gaps.md"
DEFAULT_UNUSED_OUTPUT_PATH = DEFAULT_RESULTS_DIR / "services-unuseds.md"

# Ruta raíz del monorepo
WORKSPACE_ROOT = SKILL_DIR.parents[4]  # c:\Users\julia\Desktop\Proyectos\KEUKEN_UWS
ERP_SRC = WORKSPACE_ROOT / "apps" / "erp-next" / "src" / "app"
API_CONSTANTS_FILE = ERP_SRC / "lib" / "constants" / "api.constants.ts"
SERVICES_DIR = ERP_SRC / "services"
BACKEND_TYPES_DIR = WORKSPACE_ROOT / "packages" / "api-contracts" / "src" / "erp" / "backendTypes"


def parse_api_constants():
    """Lee api.constants.ts y resuelve el mapa de constantes a URLs relativas."""
    constants = {}
    if not API_CONSTANTS_FILE.exists():
        return constants
    
    with open(API_CONSTANTS_FILE, "r", encoding="utf-8") as f:
        content = f.read()

    # Extraer export const NAME = value;
    for match in re.finditer(r"export\s+const\s+([A-Z0-9_]+)\s*=\s*[`\"']([^`\"']+)[`\"'];", content):
        name, val = match.groups()
        constants[name] = val

    # Resolver referencias simples
    resolved = {
        "BASE_URL": "",
        "APIV1_URL": "/api/v1"
    }
    for k, v in constants.items():
        v_res = v.replace("${BASE_URL}", "").replace("${APIV1_URL}", "/api/v1")
        for sub_k, sub_v in list(resolved.items()):
            v_res = v_res.replace(f"${{{sub_k}}}", sub_v)
        resolved[k] = v_res

    return resolved


def load_openapi_spec(contracts_path):
    """Carga y valida el documento OpenAPI contracts.json."""
    path = Path(contracts_path)
    if not path.exists():
        raise FileNotFoundError(f"No se encontró el archivo de contratos en: {path}")
    
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def load_audit_pairs(pairs_path):
    """Carga la lista de pares a auditar desde el archivo JSON de configuración."""
    path = Path(pairs_path)
    if not path.exists():
        raise FileNotFoundError(
            f"No se encontró el archivo de pares en: {path}.\n"
            f"Consulta SKILL.md o crea el archivo siguiendo el schema 'schemas/audit-pairs.schema.json'."
        )
    
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
    
    pairs = data.get("pairs", [])
    if not pairs and isinstance(data, list):
        pairs = data
    return pairs


def parse_schema_properties(schema_def, all_schemas):
    """Analiza las propiedades de un schema OpenAPI resolviendo anyOf, allOf y refs."""
    if not schema_def:
        return {}
    
    props = {}
    required = set(schema_def.get("required", []))
    
    if "allOf" in schema_def:
        for sub in schema_def["allOf"]:
            if "$ref" in sub:
                ref_name = sub["$ref"].split("/")[-1]
                sub_props = parse_schema_properties(all_schemas.get(ref_name, {}), all_schemas)
                props.update(sub_props)
            elif "properties" in sub:
                for k, v in sub["properties"].items():
                    props[k] = v
                required.update(sub.get("required", []))

    if "properties" in schema_def:
        for k, v in schema_def["properties"].items():
            props[k] = v

    result = {}
    for p_name, p_def in props.items():
        nullable = False
        type_str = p_def.get("type", "any")
        
        if "anyOf" in p_def:
            types = []
            for item in p_def["anyOf"]:
                if item.get("type") == "null":
                    nullable = True
                elif "$ref" in item:
                    types.append(item["$ref"].split("/")[-1])
                elif "type" in item:
                    types.append(item["type"])
            type_str = "|".join(types) if types else "any"
        elif "$ref" in p_def:
            type_str = p_def["$ref"].split("/")[-1]

        is_req = p_name in required
        result[p_name] = {
            "type": type_str,
            "required": is_req,
            "nullable": nullable,
            "description": p_def.get("description", "")
        }

    return result


def parse_ts_interface(file_path, interface_name):
    """Extrae las propiedades, tipo, opcionalidad y nullability de una interfaz TypeScript."""
    if not file_path.exists():
        return {}
    
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    # Buscar bloque de interface exportada con posible herencia (extends)
    header_pattern = rf"export\s+interface\s+{re.escape(interface_name)}\b(?:\s+extends\s+([^{{]+))?\s*\{{"
    match = re.search(header_pattern, content)
    if not match:
        return {}

    props = {}
    extends_clause = match.group(1)
    if extends_clause:
        bases = [b.strip() for b in extends_clause.split(",") if b.strip()]
        for base in bases:
            base_clean = base.split("<")[0].strip()
            base_props = parse_ts_interface(file_path, base_clean)
            props.update(base_props)

    # Extraer el cuerpo balanceando llaves '{' y '}'
    start_idx = match.end() - 1  # posición de '{'
    depth = 0
    body_chars = []
    for idx in range(start_idx, len(content)):
        char = content[idx]
        if char == "{":
            depth += 1
            if depth > 1:
                body_chars.append(char)
        elif char == "}":
            depth -= 1
            if depth == 0:
                break
            else:
                body_chars.append(char)
        else:
            if depth >= 1:
                body_chars.append(char)

    body = "".join(body_chars)
    
    for raw_line in body.split("\n"):
        line = raw_line.strip()
        if not line or line.startswith("//") or line.startswith("/*") or line.startswith("*"):
            continue
        
        # Eliminar punto y coma o coma final
        if line.endswith(";") or line.endswith(","):
            line = line[:-1].strip()

        # Parse: prop?: type | null
        prop_match = re.match(r"^([a-zA-Z0-9_]+)(\?)?:\s*(.+)$", line)
        if not prop_match:
            continue
        
        name, optional, raw_type = prop_match.groups()
        is_optional = bool(optional)
        is_nullable = "null" in raw_type
        clean_type = raw_type.replace("| null", "").replace("null |", "").strip()

        props[name] = {
            "type": clean_type,
            "optional": is_optional,
            "nullable": is_nullable,
            "raw": raw_type
        }

    return props


def compare_models(label, ts_props, be_props):
    """Compara propiedades de Frontend vs Backend en los 4 cuadrantes."""
    missing_in_fe = []
    excess_in_fe = []
    type_diffs = []
    nullability_diffs = []

    # 1. Analizar campos del Backend
    for be_name, be_val in be_props.items():
        if be_name not in ts_props:
            missing_in_fe.append({
                "property": be_name,
                "be_type": be_val["type"],
                "required": be_val["required"],
                "nullable": be_val["nullable"]
            })
        else:
            ts_val = ts_props[be_name]
            be_t = be_val["type"]
            ts_t = ts_val["type"]

            # Comprobar discrepancia de tipo
            is_mismatch = False
            if be_t in ["integer", "number"] and not ("number" in ts_t or ts_t in ["number", "any"]):
                is_mismatch = True
            elif be_t == "boolean" and "boolean" not in ts_t:
                is_mismatch = True
            elif be_t == "string" and not ("string" in ts_t or "'" in ts_t or '"' in ts_t or ts_t.startswith("TB") or ts_t.startswith("ChartAccount")):
                is_mismatch = True

            if is_mismatch:
                type_diffs.append({
                    "property": be_name,
                    "fe_type": ts_t,
                    "be_type": be_t
                })

            # Comprobar nullability y optionality
            if be_val["nullable"] and not (ts_val["nullable"] or ts_val["optional"]):
                nullability_diffs.append({
                    "property": be_name,
                    "issue": "Backend envía null o es opcional, pero Frontend lo define obligatorio no-nulo",
                    "fe": f"{ts_t} (non-null, required)",
                    "be": f"{be_t} (nullable={be_val['nullable']})"
                })
            elif not be_val["nullable"] and be_val["required"] and (ts_val["optional"] or ts_val["nullable"]):
                nullability_diffs.append({
                    "property": be_name,
                    "issue": "Backend lo exige obligatorio no-nulo, pero Frontend lo permite opcional/nulo",
                    "fe": f"optional={ts_val['optional']}, nullable={ts_val['nullable']}",
                    "be": "required=True, nullable=False"
                })

    # 2. Analizar campos del Frontend
    for ts_name, ts_val in ts_props.items():
        if ts_name not in be_props:
            excess_in_fe.append({
                "property": ts_name,
                "fe_type": ts_val["type"]
            })

    return {
        "label": label,
        "missing_in_fe": missing_in_fe,
        "excess_in_fe": excess_in_fe,
        "type_diffs": type_diffs,
        "nullability_diffs": nullability_diffs
    }


def normalize_path(path: str) -> str:
    """Normaliza rutas de endpoint eliminando trailing slashes y unificando nombres de parámetros."""
    p = path.strip().rstrip("/")
    return re.sub(r'\{[^}]+\}', '{param}', p)


def extract_used_endpoints(audit_pairs):
    """Extrae el conjunto de endpoints (método, ruta_normalizada) declarados en audit-pairs.json."""
    used = set()
    for pair in audit_pairs:
        ep_field = pair.get("endpoint", "")
        if not ep_field:
            continue
        for part in re.split(r'\s*\|\s*|\s*,\s*', ep_field):
            part = part.strip()
            if not part:
                continue
            tokens = part.split()
            if len(tokens) == 2:
                method, path = tokens
                used.add((method.upper(), normalize_path(path)))
            elif len(tokens) == 1:
                used.add(("ALL", normalize_path(tokens[0])))
    return used


def find_unused_endpoints(openapi_spec, used_endpoints, domain_filter=None):
    """
    Cruza los endpoints definidos en openapi_spec['paths'] contra used_endpoints.
    Retorna (total_endpoints_count, used_endpoints_count, unused_list).
    """
    paths = openapi_spec.get("paths", {})
    all_endpoints = []
    unused_list = []

    for path, methods in paths.items():
        for method_name, op_info in methods.items():
            if method_name.lower() not in ["get", "post", "put", "patch", "delete", "options", "head"]:
                continue
            
            method_upper = method_name.upper()
            norm_p = normalize_path(path)
            key = (method_upper, norm_p)
            all_endpoints.append((method_upper, path))

            is_used = (key in used_endpoints) or (("ALL", norm_p) in used_endpoints)
            if not is_used:
                tags = op_info.get("tags", [])
                primary_tag = tags[0] if tags else "General / Sin Categoría"
                summary = op_info.get("summary", "")
                op_id = op_info.get("operationId", "")
                desc = op_info.get("description", "")

                if domain_filter:
                    d_lower = domain_filter.lower()
                    tag_match = any(d_lower in t.lower() for t in tags)
                    path_match = d_lower in path.lower()
                    sum_match = d_lower in summary.lower()
                    if not (tag_match or path_match or sum_match):
                        continue

                unused_list.append({
                    "method": method_upper,
                    "path": path,
                    "tag": primary_tag,
                    "tags": tags,
                    "summary": summary,
                    "operation_id": op_id,
                    "description": desc
                })

    return len(all_endpoints), len(used_endpoints), unused_list


def generate_unused_endpoints_report(out_path: Path, openapi_path: str, pairs_path: str, domain_filter: str, total_endpoints: int, used_count: int, unused_list: list):
    """Genera el reporte Markdown services-unuseds.md con los endpoints no consumidos."""
    from collections import defaultdict

    out_path.parent.mkdir(parents=True, exist_ok=True)
    grouped = defaultdict(list)
    for ep in unused_list:
        grouped[ep["tag"]].append(ep)

    unused_count = len(unused_list)
    coverage_pct = round((used_count / total_endpoints * 100), 2) if total_endpoints else 0.0

    with open(out_path, "w", encoding="utf-8") as f:
        f.write("# Reporte de Endpoints Backend No Consumidos en Frontend (Unused Services)\n\n")
        f.write(f"- **Fecha de Generación:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        f.write(f"- **Especificación OpenAPI (Backend):** `{openapi_path}`\n")
        f.write(f"- **Mapeo Frontend (Pares Auditados):** `{pairs_path}`\n")
        if domain_filter:
            f.write(f"- **Filtro de Dominio:** `{domain_filter}`\n")
        f.write("\n---\n\n")

        f.write("## 1. Resumen Ejecutivo de Cobertura de API\n\n")
        f.write("| Métrica | Valor |\n")
        f.write("| :--- | :---: |\n")
        f.write(f"| **Total Endpoints en Backend (OpenAPI)** | **{total_endpoints}** |\n")
        f.write(f"| **Endpoints Mapeados/Consumidos en Frontend** | **{used_count}** |\n")
        f.write(f"| **Endpoints Backend No Consumidos (`unused`)** | **{unused_count}** |\n")
        f.write(f"| **Cobertura de Consumo en Frontend** | **{coverage_pct}%** |\n\n")

        f.write("---\n\n")
        f.write("## 2. Resumen de Endpoints No Consumidos por Módulo / Categoría\n\n")
        f.write("| Módulo / Categoría Funcional | Cantidad de Endpoints |\n")
        f.write("| :--- | :---: |\n")
        for tag, eps in sorted(grouped.items(), key=lambda x: -len(x[1])):
            f.write(f"| {tag} | **{len(eps)}** |\n")
        f.write(f"| **TOTAL** | **{unused_count}** |\n\n")

        f.write("---\n\n")
        f.write("## 3. Inventario Detallado de Endpoints No Consumidos\n\n")
        for tag, eps in sorted(grouped.items(), key=lambda x: x[0]):
            f.write(f"### {tag} ({len(eps)} endpoints)\n\n")
            f.write("| Método | Ruta de API | Resumen / Descripción | Operation ID |\n")
            f.write("| :---: | :--- | :--- | :--- |\n")
            for ep in sorted(eps, key=lambda x: (x['path'], x['method'])):
                sum_text = ep['summary'].replace('|', '/') if ep['summary'] else '-'
                op_id = f"`{ep['operation_id']}`" if ep['operation_id'] else '-'
                f.write(f"| `{ep['method']}` | `{ep['path']}` | {sum_text} | {op_id} |\n")
            f.write("\n")

    print(f"[OK] Reporte de endpoints no consumidos guardado con exito en: {out_path}")


def main():
    parser = argparse.ArgumentParser(description="Auditoría y revalidación de contratos Frontend vs Backend")
    parser.add_argument("--contracts", default=str(DEFAULT_CONTRACTS_PATH), help="Ruta a contracts.json")
    parser.add_argument("--pairs", default=str(DEFAULT_PAIRS_PATH), help="Ruta a audit-pairs.json con el mapeo de modelos")
    parser.add_argument("--domain", default=None, help="Filtrar por dominio (ej: products, accounting, uom)")
    parser.add_argument("--output", default=str(DEFAULT_OUTPUT_PATH), help=f"Ruta de archivo markdown para guardar el reporte (por defecto: {DEFAULT_OUTPUT_PATH})")
    parser.add_argument("--unused-output", default=str(DEFAULT_UNUSED_OUTPUT_PATH), help=f"Ruta de archivo markdown para guardar endpoints no usados (por defecto: {DEFAULT_UNUSED_OUTPUT_PATH})")
    parser.add_argument("--no-output", action="store_true", help="No guardar el reporte en disco")
    args = parser.parse_args()

    print("=================================================================")
    print(" INICIANDO AUDITORÍA Y REVALIDACIÓN DE CONTRATOS API")
    print("=================================================================")

    api_constants = parse_api_constants()
    print(f"[*] Constantes API analizadas ({len(api_constants)} constantes encontradas)")

    spec = load_openapi_spec(args.contracts)
    schemas = spec.get("components", {}).get("schemas", {})
    print(f"[*] Especificación OpenAPI cargada ({len(schemas)} schemas disponibles)")

    audit_pairs = load_audit_pairs(args.pairs)
    print(f"[*] Mapeo de pares cargado desde '{Path(args.pairs).name}' ({len(audit_pairs)} pares registrados)")

    global_missing = 0
    global_excess = 0
    global_type_diffs = 0
    global_nullability = 0
    
    domain_missing = 0
    domain_excess = 0
    domain_type_diffs = 0
    domain_nullability = 0
    
    all_results = []
    filtered_count = 0

    for pair in audit_pairs:
        label = pair.get("label", "Sin etiqueta")
        ts_rel = pair.get("ts_file", "")
        ts_name = pair.get("ts_interface", "")
        be_name = pair.get("backend_schema", "")
        domain = pair.get("domain", "")

        ts_path = BACKEND_TYPES_DIR / ts_rel
        ts_props = parse_ts_interface(ts_path, ts_name)
        be_def = schemas.get(be_name, {})
        be_props = parse_schema_properties(be_def, schemas)

        if not be_def:
            print(f"[!] AVISO: Schema '{be_name}' no encontrado en OpenAPI components.schemas")

        diff = compare_models(label, ts_props, be_props)
        diff["ts_file"] = str(ts_rel)
        diff["ts_name"] = ts_name
        diff["be_name"] = be_name
        diff["domain"] = domain
        all_results.append(diff)

        m = len(diff["missing_in_fe"])
        e = len(diff["excess_in_fe"])
        t = len(diff["type_diffs"])
        n = len(diff["nullability_diffs"])

        global_missing += m
        global_excess += e
        global_type_diffs += t
        global_nullability += n

        # Filtrar solo para impresión en consola si se especificó --domain
        is_in_domain = True
        if args.domain:
            filter_lower = args.domain.lower()
            is_in_domain = (filter_lower in domain.lower() or filter_lower in label.lower() or filter_lower in ts_rel.lower())

        if is_in_domain:
            filtered_count += 1
            domain_missing += m
            domain_excess += e
            domain_type_diffs += t
            domain_nullability += n

            status_flag = "[DISCREPANCIAS]" if (m or e or t or n) else "[OK]"
            print(f"{status_flag:<16} {label:38} | [E1] +{m:2} | [E2] -{e:2} | [E3] ~{t:2} | [E4] ?{n:2}")

    print("\n-----------------------------------------------------------------")
    if args.domain:
        print(f"TOTALES DOMINIO '{args.domain}': [E1] Faltantes: {domain_missing} | [E2] Sobrantes: {domain_excess} | [E3] Tipos: {domain_type_diffs} | [E4] Nullability: {domain_nullability}")
        print(f"TOTALES GLOBALES SISTEMA:      [E1] Faltantes: {global_missing} | [E2] Sobrantes: {global_excess} | [E3] Tipos: {global_type_diffs} | [E4] Nullability: {global_nullability}")
    else:
        print(f"TOTALES GLOBALES: [E1] Faltantes: {global_missing} | [E2] Sobrantes: {global_excess} | [E3] Tipos: {global_type_diffs} | [E4] Nullability: {global_nullability}")
    print("-----------------------------------------------------------------")

    # Guardar reporte Markdown completo (SIEMPRE contiene todos los dominios del sistema)
    if args.output and not args.no_output:
        out_path = Path(args.output)
        out_path.parent.mkdir(parents=True, exist_ok=True)
        with open(out_path, "w", encoding="utf-8") as f:
            f.write("# Reporte de Auditoria y Revalidacion de Contratos (Frontend vs Backend)\n\n")
            f.write(f"- **Fecha:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
            f.write(f"- **Especificacion OpenAPI (Backend):** `{args.contracts}`\n")
            f.write(f"- **Mapeos Utilizados:** `{args.pairs}`\n")
            f.write(f"- **Total Modelos Auditados:** {len(all_results)}\n")
            f.write("\n---\n\n")

            f.write("## 1. Resumen Ejecutivo y Totales\n\n")
            f.write("| Codigo | Categoria de Hallazgo | Total Casos |\n")
            f.write("| :---: | :--- | :---: |\n")
            f.write(f"| [E1] | **Campos Faltantes en Frontend** | **{global_missing}** |\n")
            f.write(f"| [E2] | **Campos Sobrantes o Deprecados** | **{global_excess}** |\n")
            f.write(f"| [E3] | **Discrepancias de Tipo** | **{global_type_diffs}** |\n")
            f.write(f"| [E4] | **Nullability & Optionality Mismatch** | **{global_nullability}** |\n\n")

            f.write("---\n\n")
            f.write("## 2. Modelos Auditados\n\n")
            f.write("| Dominio | Entidad / Etiqueta | Frontend Interface | Backend Schema | Estado |\n")
            f.write("| :--- | :--- | :--- | :--- | :---: |\n")
            for item in all_results:
                m = len(item["missing_in_fe"])
                e = len(item["excess_in_fe"])
                t = len(item["type_diffs"])
                n = len(item["nullability_diffs"])
                status = "[OK]" if (m == 0 and e == 0 and t == 0 and n == 0) else f"[DISCREPANCIAS] (E1:{m} E2:{e} E3:{t} E4:{n})"
                f.write(f"| {item.get('domain') or '-'} | {item['label']} | `{item['ts_name']}` | `{item['be_name']}` | {status} |\n")

            f.write("\n---\n\n")
            f.write("## 3. Desglose Detallado por Entidad con Discrepancias\n\n")

            for item in all_results:
                m = len(item["missing_in_fe"])
                e = len(item["excess_in_fe"])
                t = len(item["type_diffs"])
                n = len(item["nullability_diffs"])
                if m == 0 and e == 0 and t == 0 and n == 0:
                    continue

                f.write(f"### {item['label']}\n\n")
                f.write(f"- **Frontend:** `{item['ts_name']}` (`packages/api-contracts/src/erp/backendTypes/{item['ts_file']}`)\n")
                f.write(f"- **Backend:** `{item['be_name']}`\n\n")

                if item["missing_in_fe"]:
                    f.write("#### [E1] Campos Faltantes en Frontend\n")
                    f.write("| Propiedad Backend | Tipo OpenAPI | Requerido | Nullable |\n")
                    f.write("| :--- | :--- | :---: | :---: |\n")
                    for m_item in item["missing_in_fe"]:
                        f.write(f"| `{m_item['property']}` | `{m_item['be_type']}` | {'Si' if m_item['required'] else 'No'} | {'Si' if m_item['nullable'] else 'No'} |\n")
                    f.write("\n")

                if item["excess_in_fe"]:
                    f.write("#### [E2] Campos Sobrantes o Deprecados en Frontend\n")
                    f.write("| Propiedad Frontend | Tipo Frontend |\n")
                    f.write("| :--- | :--- |\n")
                    for e_item in item["excess_in_fe"]:
                        f.write(f"| `{e_item['property']}` | `{e_item['fe_type']}` |\n")
                    f.write("\n")

                if item["type_diffs"]:
                    f.write("#### [E3] Discrepancias de Tipo\n")
                    f.write("| Propiedad | Tipo Frontend | Tipo Backend |\n")
                    f.write("| :--- | :--- | :--- |\n")
                    for td in item["type_diffs"]:
                        f.write(f"| `{td['property']}` | `{td['fe_type']}` | `{td['be_type']}` |\n")
                    f.write("\n")

                if item["nullability_diffs"]:
                    f.write("#### [E4] Nullability & Optionality Mismatch\n")
                    f.write("| Propiedad | Conflicto | Frontend | Backend |\n")
                    f.write("| :--- | :--- | :--- | :--- |\n")
                    for nd in item["nullability_diffs"]:
                        f.write(f"| `{nd['property']}` | {nd['issue']} | `{nd['fe']}` | `{nd['be']}` |\n")
                    f.write("\n")

                f.write("---\n\n")

        print(f"[OK] Reporte completo de gaps guardado con exito en: {out_path}")

    # 2. Analisis global de endpoints backend no consumidos (unused endpoints)
    used_endpoints = extract_used_endpoints(audit_pairs)
    total_be_endpoints, used_count, unused_endpoints = find_unused_endpoints(spec, used_endpoints, domain_filter=None)

    print("\n=================================================================")
    print(" ANALISIS DE ENDPOINTS BACKEND NO CONSUMIDOS EN FRONTEND")
    print("=================================================================")
    print(f"[*] Total Endpoints Backend en OpenAPI: {total_be_endpoints}")
    print(f"[*] Endpoints Mapeados en Frontend:     {used_count}")
    print(f"[*] Endpoints No Consumidos (Unused):   {len(unused_endpoints)}")

    if args.unused_output and not args.no_output:
        out_unused = Path(args.unused_output)
        generate_unused_endpoints_report(
            out_path=out_unused,
            openapi_path=args.contracts,
            pairs_path=args.pairs,
            domain_filter=None,
            total_endpoints=total_be_endpoints,
            used_count=used_count,
            unused_list=unused_endpoints
        )


if __name__ == "__main__":
    main()
