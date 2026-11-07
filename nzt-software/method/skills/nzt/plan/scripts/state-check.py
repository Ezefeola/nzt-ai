#!/usr/bin/env python3
"""Checks that Plan/state.json keeps the kernel's contract (macOS and Linux).

The same rules, messages and order as state-check.ps1 and `nzt-ai state check`; the
installer's checks run the three on the same states. Usage: state-check.py [project folder]
Exit 0: no state, or it keeps the contract. Exit 1: problems, one per line.
"""
import json
import os
import sys

STATUSES = ["todo", "doing", "done", "dropped"]
PHASES = ["discovery", "architecture", "design", "build", "verify", "ship"]
LEGACY_PHASES = ["analysis", "ux"]  # discovery and design before D88
DELEGATION_MODES = ["auto", "ask", "off"]
CADENCES = ["delivery", "upfront", "just-in-time"]
MODELS = ["small", "main"]
RELATIVE = os.path.join("Plan", "state.json")


def text(element, prop):
    if isinstance(element, dict):
        value = element.get(prop)
        if isinstance(value, str):
            return value
    return None


def raw(value):
    return value if isinstance(value, str) else json.dumps(value, ensure_ascii=False, separators=(",", ":"))


def shown(value):
    return "vacío" if value is None else f"'{value}'"


def raw_id(value):
    return json.dumps(value, ensure_ascii=False, separators=(",", ":"))


def check_phases(phases, where, ids, units_doing, group_phase, problems):
    phases_doing = []
    for index, phase in enumerate(phases, start=1):
        name = text(phase, "name")
        name = name if name is not None else f"#{index}"
        phase_status = text(phase, "status")

        if text(phase, "name") not in PHASES and text(phase, "name") not in LEGACY_PHASES:
            problems.append(f"la fase '{name}'{where} no es una fase de NZT: son {', '.join(PHASES)}")
        if phase_status not in STATUSES:
            problems.append(f"la fase '{name}'{where} tiene status {shown(phase_status)}")
        if phase_status == "doing":
            phases_doing.append(name)

        units = phase.get("units") if isinstance(phase, dict) else None
        if not isinstance(units, list):
            continue

        for unit in units:
            has_id = isinstance(unit, dict) and "id" in unit
            uid = raw_id(unit["id"]) if has_id else None
            label = f"una unidad de '{name}'{where}" if uid is None else f"la unidad {uid}"
            unit_status = text(unit, "status")

            if uid is None:
                problems.append(f"una unidad de la fase '{name}'{where} no tiene id")
            elif uid in ids:
                problems.append(f"el id {uid} se repite")
            else:
                ids.add(uid)

            if unit_status not in STATUSES:
                problems.append(f"{label} tiene status {shown(unit_status)}")

            group = text(unit, "group")
            here = name + where
            if isinstance(unit, dict) and "group" in unit and not group:
                problems.append(f"{label} tiene group {shown(raw(unit['group']))}: es el id de texto de su grupo en paralelo")
            elif group is not None:
                if group not in group_phase:
                    group_phase[group] = here
                elif group_phase[group] != here:
                    problems.append(f"el grupo {group} tiene unidades en '{group_phase[group]}' y en '{name}'{where}; un grupo vive en una fase")

            if isinstance(unit, dict) and "model" in unit:
                if text(unit, "model") not in MODELS:
                    problems.append(f"{label} tiene model {shown(raw(unit['model']))}: son {', '.join(MODELS)}")
                elif group is None:
                    problems.append(f"{label} tiene model sin group: el modelo es de una unidad en paralelo")

            if unit_status == "doing":
                units_doing.append((uid or "?", group))
                if phase_status != "doing":
                    problems.append(f"{label} está en doing, pero su fase '{name}'{where} está en {shown(phase_status)}")

            if phase_status == "done" and unit_status in ("todo", "doing"):
                problems.append(f"la fase '{name}'{where} está done con {label} en {unit_status}")
    return phases_doing


def check_slices(root, slices, ids, units_doing, group_phase, problems):
    if "cadence" in root and text(root, "cadence") not in CADENCES:
        problems.append(f"cadence es {shown(raw(root['cadence']))}: son {', '.join(CADENCES)}")
    if not isinstance(slices, list):
        problems.append("slices no es una lista")
        return

    slice_ids = set()
    slices_doing = []
    for index, slc in enumerate(slices, start=1):
        sid = text(slc, "id")
        name = sid if sid is not None else f"#{index}"
        slice_status = text(slc, "status")

        if sid is None:
            problems.append(f"el tramo #{index} no tiene id de texto")
        elif sid in slice_ids:
            problems.append(f"el tramo {sid} se repite")
        else:
            slice_ids.add(sid)

        if slice_status not in STATUSES:
            problems.append(f"el tramo {name} tiene status {shown(slice_status)}")
        if slice_status == "doing":
            slices_doing.append(name)

        phases = slc.get("phases") if isinstance(slc, dict) else None
        if not isinstance(phases, list):
            problems.append(f"el tramo {name} no tiene phases, o no es una lista")
            continue

        phases_doing = check_phases(phases, f" del tramo {name}", ids, units_doing, group_phase, problems)
        if len(phases_doing) > 1:
            problems.append(f"hay {len(phases_doing)} fases en doing en el tramo {name} ({', '.join(phases_doing)}); a lo sumo una")
        if phases_doing and slice_status != "doing":
            problems.append(f"la fase '{phases_doing[0]}' del tramo {name} está en doing, pero su tramo está en {shown(slice_status)}")

        seen = set()
        for phase in phases:
            phase_name = text(phase, "name")
            phase_status = text(phase, "status")
            if phase_name is not None:
                if phase_name in seen:
                    problems.append(f"la fase '{phase_name}' se repite en el tramo {name}")
                seen.add(phase_name)
            if slice_status == "done" and phase_status not in ("done", "dropped"):
                problems.append(f"el tramo {name} está done con su fase '{phase_name if phase_name is not None else '?'}' en {shown(phase_status)}")

    if len(slices_doing) > 1:
        problems.append(f"hay {len(slices_doing)} tramos en doing ({', '.join(slices_doing)}); a lo sumo uno")


def find_problems(root):
    if not isinstance(root, dict):
        return ["la raíz no es un objeto"]
    problems = []

    if not isinstance(root.get("approved"), bool):
        problems.append("approved tiene que ser true o false")
    if "delegation" in root and text(root, "delegation") not in DELEGATION_MODES:
        problems.append(f"delegation es {shown(raw(root['delegation']))}: son {', '.join(DELEGATION_MODES)}")

    ids, units_doing, group_phase = set(), [], {}
    has_phases, has_slices = "phases" in root, "slices" in root
    version = raw_id(root["version"]) if "version" in root else None

    if has_phases and has_slices:
        problems.append("phases y slices juntos en la raíz: con tramos, las fases van dentro de cada tramo")
        return problems
    if has_slices:
        if version != "2":
            problems.append(f"slices pide version 2, y version es {shown(version)}")
        check_slices(root, root["slices"], ids, units_doing, group_phase, problems)
    elif version == "2":
        problems.append("version 2 pide slices en lugar de phases")
        return problems
    elif not has_phases or not isinstance(root["phases"], list):
        problems.append("falta phases, o no es una lista")
        return problems
    else:
        phases_doing = check_phases(root["phases"], "", ids, units_doing, group_phase, problems)
        if len(phases_doing) > 1:
            problems.append(f"hay {len(phases_doing)} fases en doing ({', '.join(phases_doing)}); a lo sumo una")

    groups = list(dict.fromkeys(g for _, g in units_doing))
    if len(units_doing) > 1 and (len(groups) > 1 or groups[0] is None):
        problems.append(f"hay {len(units_doing)} unidades en doing ({', '.join(u for u, _ in units_doing)}); "
                        "a lo sumo una, o las de un mismo grupo en paralelo")

    if group_phase and not text(root, "work_branch"):
        problems.append("hay grupos en paralelo y falta work_branch, la rama de trabajo")

    autonomy = root.get("autonomy")
    if isinstance(autonomy, dict):
        for lst in ("units", "keep_stops"):
            named = autonomy.get(lst)
            if isinstance(named, list):
                for uid in named:
                    if raw_id(uid) not in ids:
                        problems.append(f"autonomy.{lst} nombra la unidad {raw_id(uid)}, que no está en el plan")
    return problems


def main():
    folder = sys.argv[1] if len(sys.argv) > 1 else "."
    path = os.path.join(folder, RELATIVE)
    if not os.path.isfile(path):
        print(f"No hay {RELATIVE} en esta carpeta: nada que revisar.")
        return 0
    try:
        with open(path, encoding="utf-8-sig") as f:
            root = json.load(f)
    except json.JSONDecodeError as ex:
        problems = [f"no es JSON válido, línea {ex.lineno}: {ex.msg}"]
    else:
        problems = find_problems(root)

    if not problems:
        print(f"{RELATIVE}: cumple el contrato del kernel.")
        return 0
    print(f"{RELATIVE}: {len(problems)} problema(s)")
    for problem in problems:
        print(f"  {problem}")
    return 1


if __name__ == "__main__":
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    sys.exit(main())
