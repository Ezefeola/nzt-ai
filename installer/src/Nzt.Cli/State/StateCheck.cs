using System.Text.Json;

namespace Nzt.Cli.State;

/// <summary>`Found` falso es que no hay estado: no todo proyecto lo tiene, y no es un error.</summary>
public sealed record StateReport(bool Found, IReadOnlyList<string> Problems)
{
    public bool Ok => Problems.Count == 0;
}

/// <summary>
/// `nzt-ai state check` (RN-cli-state-check): si `Plan/state.json` cumple el contrato
/// del kernel. Lo escribe un modelo a mano, así que se revisa lo que el kernel pide y
/// nada más: un campo de más no es un problema.
/// </summary>
public static class StateCheck
{
    public static readonly string RelativePath = Path.Combine("Plan", "state.json");

    private static readonly string[] Statuses = ["todo", "doing", "done", "dropped"];

    private static readonly string[] Phases = ["analysis", "architecture", "ux", "build", "verify", "ship"];

    private static readonly string[] DelegationModes = ["auto", "ask", "off"];

    private static readonly string[] Cadences = ["delivery", "upfront", "just-in-time"];

    private static readonly string[] Models = ["small", "main"];

    public static StateReport Run(string projectDirectory)
    {
        var path = Path.Combine(projectDirectory, RelativePath);
        if (!File.Exists(path)) return new StateReport(false, []);

        JsonDocument document;
        try
        {
            document = JsonDocument.Parse(File.ReadAllText(path));
        }
        catch (JsonException ex)
        {
            return new StateReport(true, [$"no es JSON válido, línea {ex.LineNumber + 1}: {ex.Message}"]);
        }

        using (document)
            return new StateReport(true, Problems(document.RootElement));
    }

    private static List<string> Problems(JsonElement root)
    {
        var problems = new List<string>();

        if (root.ValueKind != JsonValueKind.Object)
            return ["la raíz no es un objeto"];

        if (!root.TryGetProperty("approved", out var approved)
            || approved.ValueKind is not (JsonValueKind.True or JsonValueKind.False))
            problems.Add("approved tiene que ser true o false");

        // Ausente es `ask` (D71); presente, tiene que ser uno de los tres.
        if (root.TryGetProperty("delegation", out var delegation)
            && !DelegationModes.Contains(Text(root, "delegation")))
            problems.Add($"delegation es {Shown(Raw(delegation))}: son {string.Join(", ", DelegationModes)}");

        var ids = new HashSet<string>();
        var unitsDoing = new List<(string Id, string? Group)>();
        var groupPhase = new Dictionary<string, string>();

        var hasPhases = root.TryGetProperty("phases", out var phases);
        var hasSlices = root.TryGetProperty("slices", out var slices);
        var version = root.TryGetProperty("version", out var versionValue) ? versionValue.GetRawText() : null;

        if (hasPhases && hasSlices)
        {
            problems.Add("phases y slices juntos en la raíz: con tramos, las fases van dentro de cada tramo");
            return problems;
        }

        if (hasSlices)
        {
            // `version` 2 es obligatorio para que una herramienta que solo entiende v1 falle
            // diciendo que no lo entiende, en vez de leerlo a medias (D73).
            if (version != "2")
                problems.Add($"slices pide version 2, y version es {Shown(version)}");
            CheckSlices(root, slices, ids, unitsDoing, groupPhase, problems);
        }
        else if (version == "2")
        {
            problems.Add("version 2 pide slices en lugar de phases");
            return problems;
        }
        else if (!hasPhases || phases.ValueKind != JsonValueKind.Array)
        {
            problems.Add("falta phases, o no es una lista");
            return problems;
        }
        else
        {
            var phasesDoing = CheckPhases(phases, "", ids, unitsDoing, groupPhase, problems);
            if (phasesDoing.Count > 1)
                problems.Add($"hay {phasesDoing.Count} fases en doing ({string.Join(", ", phasesDoing)}); a lo sumo una");
        }

        // Varias en doing solo si son todas de un mismo grupo en paralelo (D84).
        var doingGroups = unitsDoing.Select(u => u.Group).Distinct().ToList();
        if (unitsDoing.Count > 1 && (doingGroups.Count > 1 || doingGroups[0] is null))
            problems.Add($"hay {unitsDoing.Count} unidades en doing ({string.Join(", ", unitsDoing.Select(u => u.Id))}); " +
                "a lo sumo una, o las de un mismo grupo en paralelo");

        if (groupPhase.Count > 0 && Text(root, "work_branch") is not { Length: > 0 })
            problems.Add("hay grupos en paralelo y falta work_branch, la rama de trabajo");

        if (root.TryGetProperty("autonomy", out var autonomy) && autonomy.ValueKind == JsonValueKind.Object)
            foreach (var list in new[] { "units", "keep_stops" })
                if (autonomy.TryGetProperty(list, out var named) && named.ValueKind == JsonValueKind.Array)
                    foreach (var id in named.EnumerateArray())
                        if (!ids.Contains(id.GetRawText()))
                            problems.Add($"autonomy.{list} nombra la unidad {id.GetRawText()}, que no está en el plan");

        return problems;
    }

    private static void CheckSlices(JsonElement root, JsonElement slices, HashSet<string> ids,
        List<(string Id, string? Group)> unitsDoing, Dictionary<string, string> groupPhase, List<string> problems)
    {
        // Ausente es `upfront` (D73), como lo hacía NZT antes de los tramos.
        if (root.TryGetProperty("cadence", out var cadence) && !Cadences.Contains(Text(root, "cadence")))
            problems.Add($"cadence es {Shown(Raw(cadence))}: son {string.Join(", ", Cadences)}");

        if (slices.ValueKind != JsonValueKind.Array)
        {
            problems.Add("slices no es una lista");
            return;
        }

        var sliceIds = new HashSet<string>();
        var slicesDoing = new List<string>();

        var index = 0;
        foreach (var slice in slices.EnumerateArray())
        {
            index++;
            var id = Text(slice, "id");
            var name = id ?? $"#{index}";
            var sliceStatus = Text(slice, "status");

            if (id is null) problems.Add($"el tramo #{index} no tiene id de texto");
            else if (!sliceIds.Add(id)) problems.Add($"el tramo {id} se repite");

            if (!Statuses.Contains(sliceStatus))
                problems.Add($"el tramo {name} tiene status {Shown(sliceStatus)}");
            if (sliceStatus == "doing") slicesDoing.Add(name);

            if (!slice.TryGetProperty("phases", out var phases) || phases.ValueKind != JsonValueKind.Array)
            {
                problems.Add($"el tramo {name} no tiene phases, o no es una lista");
                continue;
            }

            var phasesDoing = CheckPhases(phases, $" del tramo {name}", ids, unitsDoing, groupPhase, problems);
            if (phasesDoing.Count > 1)
                problems.Add($"hay {phasesDoing.Count} fases en doing en el tramo {name} ({string.Join(", ", phasesDoing)}); a lo sumo una");
            if (phasesDoing.Count > 0 && sliceStatus != "doing")
                problems.Add($"la fase '{phasesDoing[0]}' del tramo {name} está en doing, pero su tramo está en {Shown(sliceStatus)}");

            var seen = new HashSet<string>();
            foreach (var phase in phases.EnumerateArray())
            {
                var phaseName = Text(phase, "name");
                var phaseStatus = Text(phase, "status");
                if (phaseName is not null && !seen.Add(phaseName))
                    problems.Add($"la fase '{phaseName}' se repite en el tramo {name}");
                if (sliceStatus == "done" && phaseStatus is not ("done" or "dropped"))
                    problems.Add($"el tramo {name} está done con su fase '{phaseName ?? "?"}' en {Shown(phaseStatus)}");
            }
        }

        if (slicesDoing.Count > 1)
            problems.Add($"hay {slicesDoing.Count} tramos en doing ({string.Join(", ", slicesDoing)}); a lo sumo uno");
    }

    /// <summary>Las reglas de una lista de fases, la de un v1 o la de cada tramo de un v2.</summary>
    /// <returns>Los nombres de las fases en doing.</returns>
    private static List<string> CheckPhases(JsonElement phases, string where, HashSet<string> ids,
        List<(string Id, string? Group)> unitsDoing, Dictionary<string, string> groupPhase, List<string> problems)
    {
        var phasesDoing = new List<string>();

        var index = 0;
        foreach (var phase in phases.EnumerateArray())
        {
            index++;
            var name = Text(phase, "name") ?? $"#{index}";
            var phaseStatus = Text(phase, "status");

            if (!Phases.Contains(Text(phase, "name")))
                problems.Add($"la fase '{name}'{where} no es una fase de NZT: son {string.Join(", ", Phases)}");

            if (!Statuses.Contains(phaseStatus))
                problems.Add($"la fase '{name}'{where} tiene status {Shown(phaseStatus)}");
            if (phaseStatus == "doing") phasesDoing.Add(name);

            if (!phase.TryGetProperty("units", out var units) || units.ValueKind != JsonValueKind.Array)
                continue;

            foreach (var unit in units.EnumerateArray())
            {
                var id = unit.TryGetProperty("id", out var idValue) ? idValue.GetRawText() : null;
                var label = id is null ? $"una unidad de '{name}'{where}" : $"la unidad {id}";
                var unitStatus = Text(unit, "status");

                if (id is null) problems.Add($"una unidad de la fase '{name}'{where} no tiene id");
                else if (!ids.Add(id)) problems.Add($"el id {id} se repite");

                if (!Statuses.Contains(unitStatus))
                    problems.Add($"{label} tiene status {Shown(unitStatus)}");

                var group = Text(unit, "group");
                if (unit.TryGetProperty("group", out var groupValue) && group is not { Length: > 0 })
                    problems.Add($"{label} tiene group {Shown(Raw(groupValue))}: es el id de texto de su grupo en paralelo");
                else if (group is not null && !groupPhase.TryAdd(group, name + where) && groupPhase[group] != name + where)
                    problems.Add($"el grupo {group} tiene unidades en '{groupPhase[group]}' y en '{name}'{where}; un grupo vive en una fase");

                if (unit.TryGetProperty("model", out var model))
                {
                    if (!Models.Contains(Text(unit, "model")))
                        problems.Add($"{label} tiene model {Shown(Raw(model))}: son {string.Join(", ", Models)}");
                    else if (group is null)
                        problems.Add($"{label} tiene model sin group: el modelo es de una unidad en paralelo");
                }

                if (unitStatus == "doing")
                {
                    unitsDoing.Add((id ?? "?", group));
                    if (phaseStatus != "doing")
                        problems.Add($"{label} está en doing, pero su fase '{name}'{where} está en {Shown(phaseStatus)}");
                }

                if (phaseStatus == "done" && unitStatus is "todo" or "doing")
                    problems.Add($"la fase '{name}'{where} está done con {label} en {unitStatus}");
            }
        }

        return phasesDoing;
    }

    private static string? Text(JsonElement element, string property) =>
        element.TryGetProperty(property, out var value) && value.ValueKind == JsonValueKind.String
            ? value.GetString()
            : null;

    private static string Raw(JsonElement value) =>
        value.ValueKind == JsonValueKind.String ? value.GetString()! : value.GetRawText();

    private static string Shown(string? status) => status is null ? "vacío" : $"'{status}'";
}
