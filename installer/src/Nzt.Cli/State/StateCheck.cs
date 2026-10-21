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
            problems.Add($"delegation es {Shown(delegation.ValueKind == JsonValueKind.String ? delegation.GetString() : delegation.GetRawText())}: "
                + $"son {string.Join(", ", DelegationModes)}");

        if (!root.TryGetProperty("phases", out var phases) || phases.ValueKind != JsonValueKind.Array)
        {
            problems.Add("falta phases, o no es una lista");
            return problems;
        }

        var ids = new HashSet<string>();
        var phasesDoing = new List<string>();
        var unitsDoing = new List<string>();

        var index = 0;
        foreach (var phase in phases.EnumerateArray())
        {
            index++;
            var name = Text(phase, "name") ?? $"#{index}";
            var phaseStatus = Text(phase, "status");

            if (!Phases.Contains(Text(phase, "name")))
                problems.Add($"la fase '{name}' no es una fase de NZT: son {string.Join(", ", Phases)}");

            if (!Statuses.Contains(phaseStatus))
                problems.Add($"la fase '{name}' tiene status {Shown(phaseStatus)}");
            if (phaseStatus == "doing") phasesDoing.Add(name);

            if (!phase.TryGetProperty("units", out var units) || units.ValueKind != JsonValueKind.Array)
                continue;

            foreach (var unit in units.EnumerateArray())
            {
                var id = unit.TryGetProperty("id", out var idValue) ? idValue.GetRawText() : null;
                var label = id is null ? $"una unidad de '{name}'" : $"la unidad {id}";
                var unitStatus = Text(unit, "status");

                if (id is null) problems.Add($"una unidad de la fase '{name}' no tiene id");
                else if (!ids.Add(id)) problems.Add($"el id {id} se repite");

                if (!Statuses.Contains(unitStatus))
                    problems.Add($"{label} tiene status {Shown(unitStatus)}");

                if (unitStatus == "doing")
                {
                    unitsDoing.Add(id ?? "?");
                    if (phaseStatus != "doing")
                        problems.Add($"{label} está en doing, pero su fase '{name}' está en {Shown(phaseStatus)}");
                }

                if (phaseStatus == "done" && unitStatus is "todo" or "doing")
                    problems.Add($"la fase '{name}' está done con {label} en {unitStatus}");
            }
        }

        if (phasesDoing.Count > 1)
            problems.Add($"hay {phasesDoing.Count} fases en doing ({string.Join(", ", phasesDoing)}); a lo sumo una");
        if (unitsDoing.Count > 1)
            problems.Add($"hay {unitsDoing.Count} unidades en doing ({string.Join(", ", unitsDoing)}); a lo sumo una");

        if (root.TryGetProperty("autonomy", out var autonomy) && autonomy.ValueKind == JsonValueKind.Object)
            foreach (var list in new[] { "units", "keep_stops" })
                if (autonomy.TryGetProperty(list, out var named) && named.ValueKind == JsonValueKind.Array)
                    foreach (var id in named.EnumerateArray())
                        if (!ids.Contains(id.GetRawText()))
                            problems.Add($"autonomy.{list} nombra la unidad {id.GetRawText()}, que no está en el plan");

        return problems;
    }

    private static string? Text(JsonElement element, string property) =>
        element.TryGetProperty(property, out var value) && value.ValueKind == JsonValueKind.String
            ? value.GetString()
            : null;

    private static string Shown(string? status) => status is null ? "vacío" : $"'{status}'";
}
