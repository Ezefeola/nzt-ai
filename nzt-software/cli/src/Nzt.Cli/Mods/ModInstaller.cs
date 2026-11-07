using Nzt.Cli.Install;

namespace Nzt.Cli.Mods;

public enum ModAction { Installed, Updated, Unchanged, Failed, Removed, Kept, Missing }

/// <summary>
/// Lo que pasó, o pasaría en una simulación, con un mod. `ByUser` es un mod que el
/// usuario instaló a mano: el instalador lo actualiza pero no lo hace suyo.
/// </summary>
public sealed record ModOutcome(string Name, ModAction Action, string? Version, bool ByUser, string? Detail = null);

public sealed record ModResult(
    ClaudeAvailability Claude,
    string? Problem,
    string? MarketplaceSource,
    bool MarketplaceAdded,
    IReadOnlyList<ModOutcome> Outcomes)
{
    /// <summary>Claude Code no se puede usar desde acá: no es una falla, se explica cómo seguir.</summary>
    public bool Skipped => !Claude.Usable;

    public bool Failed => Problem is not null || Outcomes.Any(o => o.Action == ModAction.Failed);

    public static ModResult Unavailable(ClaudeAvailability claude) => new(claude, null, null, false, []);
}

/// <summary>
/// Instala los mods de NZT con los comandos de Claude Code, como lo haría el
/// usuario: nunca copia archivos de un mod. Lo que el instalador hizo suyo queda
/// en el manifiesto de Claude Code; lo demás sigue siendo del usuario.
/// </summary>
public static class ModInstaller
{
    public static ModResult Install(ClaudePlugins claude, ModCatalog catalog, string providerId,
        string version, bool dryRun = false, string? manifestDirectory = null)
    {
        var availability = claude.Probe();
        if (!availability.Usable) return ModResult.Unavailable(availability);

        // ── Marketplace: uno solo en la máquina, lo haya agregado quien sea ─────
        // Si ya hay un `nzt` desde otra fuente —una carpeta local, un fork— se usa
        // ese: puede ser la copia de desarrollo de quien mantiene NZT.
        var marketplaces = claude.Marketplaces();
        if (marketplaces is null)
            return new ModResult(availability, "no se pudo leer la lista de marketplaces de Claude Code",
                null, false, []);

        var existing = marketplaces.FirstOrDefault(m => m.Name == ModCatalog.MarketplaceName);
        var source = existing?.Source ?? ModCatalog.MarketplaceSource;

        if (!dryRun)
        {
            var registered = existing is null
                ? claude.AddMarketplace(ModCatalog.MarketplaceSource)
                // Refrescarlo es lo que deja ver las versiones nuevas de los mods.
                : claude.RefreshMarketplace(ModCatalog.MarketplaceName);

            if (!registered.Ok && existing is null)
                return new ModResult(availability,
                    $"no se pudo agregar el marketplace {ModCatalog.MarketplaceSource}: {registered.Reason}",
                    source, false, []);
        }

        var before = InstalledVersions(claude);
        if (before is null)
            return new ModResult(availability, "no se pudo leer qué plugins tiene instalados Claude Code",
                source, existing is null, []);

        var manifest = Manifest.Load(providerId, manifestDirectory);
        var owned = manifest?.Mods ?? [];

        // ── Cada mod: instalar el que falta, actualizar el que está ─────────────
        var outcomes = new List<ModOutcome>();
        foreach (var name in catalog.Names)
        {
            var present = before.TryGetValue(name, out var current);
            var byUser = present && !owned.Contains(name);

            if (dryRun)
            {
                outcomes.Add(present
                    ? new ModOutcome(name, ModAction.Updated, current, byUser, "si hay una versión nueva")
                    : new ModOutcome(name, ModAction.Installed, null, false));
                continue;
            }

            var result = present ? claude.Update(ModCatalog.IdOf(name)) : claude.Install(ModCatalog.IdOf(name));
            outcomes.Add(result.Ok
                ? new ModOutcome(name, present ? ModAction.Updated : ModAction.Installed, current, byUser)
                : new ModOutcome(name, ModAction.Failed, current, byUser, result.Reason));
        }

        if (dryRun)
            return new ModResult(availability, null, source, existing is null, outcomes);

        // La versión que quedó se lee de Claude Code, no de lo que contestó cada comando.
        var after = InstalledVersions(claude) ?? before;
        outcomes = [.. outcomes.Select(o => Settle(o, after))];

        var newlyOwned = outcomes
            .Where(o => o.Action == ModAction.Installed)
            .Select(o => o.Name)
            .Where(name => !owned.Contains(name))
            .ToList();

        if (newlyOwned.Count > 0)
            SaveOwned(manifest, providerId, version, [.. owned, .. newlyOwned], manifestDirectory);

        return new ModResult(availability, null, source, existing is null, outcomes);
    }

    /// <summary>
    /// Saca, mod por mod, solo los que figuran en el manifiesto. Nunca quita el
    /// marketplace: quitarlo desinstalaría también los que el usuario instaló a mano.
    /// </summary>
    public static ModResult Uninstall(ClaudePlugins claude, ModCatalog catalog, string providerId,
        bool dryRun = false, string? manifestDirectory = null)
    {
        var manifest = Manifest.Load(providerId, manifestDirectory);
        var owned = manifest?.Mods ?? [];

        var availability = claude.Probe();
        if (!availability.Usable) return ModResult.Unavailable(availability);

        var installed = InstalledVersions(claude);
        if (installed is null)
            return new ModResult(availability, "no se pudo leer qué plugins tiene instalados Claude Code",
                null, false, []);

        var outcomes = new List<ModOutcome>();
        var stillOwned = new List<string>();

        // Los del catálogo y, además, uno que este CLI instaló y ya no está en el catálogo.
        foreach (var name in catalog.Names.Union(owned))
        {
            var present = installed.TryGetValue(name, out var current);
            var ours = owned.Contains(name);

            if (!ours)
            {
                if (present) outcomes.Add(new ModOutcome(name, ModAction.Kept, current, ByUser: true));
                continue;
            }

            if (!present)
            {
                // El usuario ya lo sacó: no hay nada que desinstalar, y deja de ser nuestro.
                outcomes.Add(new ModOutcome(name, ModAction.Missing, null, false, "ya no estaba instalado"));
                continue;
            }

            if (dryRun)
            {
                outcomes.Add(new ModOutcome(name, ModAction.Removed, current, false));
                continue;
            }

            var result = claude.Uninstall(ModCatalog.IdOf(name));
            if (result.Ok)
            {
                outcomes.Add(new ModOutcome(name, ModAction.Removed, current, false));
                continue;
            }

            outcomes.Add(new ModOutcome(name, ModAction.Failed, current, false, result.Reason));
            stillOwned.Add(name);
        }

        if (!dryRun && manifest is not null && owned.Count > 0)
        {
            var remaining = manifest with { Mods = stillOwned };
            if (remaining.IsEmpty) Manifest.Delete(providerId, manifestDirectory);
            else remaining.Save(manifestDirectory);
        }

        return new ModResult(availability, null, null, false, outcomes);
    }

    /// <summary>
    /// Cada mod del catálogo: si está instalado, en qué versión, y si lo instaló
    /// este CLI o el usuario a mano. No cambia nada.
    /// </summary>
    public static ModResult Status(ClaudePlugins claude, ModCatalog catalog, string providerId,
        string? manifestDirectory = null)
    {
        var availability = claude.Probe();
        if (!availability.Usable) return ModResult.Unavailable(availability);

        var installed = InstalledVersions(claude);
        if (installed is null)
            return new ModResult(availability, "no se pudo leer qué plugins tiene instalados Claude Code",
                null, false, []);

        var owned = Manifest.Load(providerId, manifestDirectory)?.Mods ?? [];
        var source = claude.Marketplaces()?.FirstOrDefault(m => m.Name == ModCatalog.MarketplaceName)?.Source;

        var outcomes = catalog.Names
            .Select(name => installed.TryGetValue(name, out var version)
                ? new ModOutcome(name, ModAction.Installed, version, ByUser: !owned.Contains(name))
                : new ModOutcome(name, ModAction.Missing, null, false,
                    owned.Contains(name) ? "lo había instalado NZT y ya no está" : null))
            .ToList();

        return new ModResult(availability, null, source, false, outcomes);
    }

    private static ModOutcome Settle(ModOutcome outcome, IReadOnlyDictionary<string, string> after)
    {
        if (outcome.Action == ModAction.Failed) return outcome;

        var now = after.GetValueOrDefault(outcome.Name, outcome.Version ?? "?");
        if (outcome.Action == ModAction.Updated && now == outcome.Version)
            return outcome with { Action = ModAction.Unchanged, Version = now };

        return outcome with { Version = now };
    }

    /// <summary>Versión instalada por nombre de mod, solo los del marketplace `nzt`.</summary>
    private static Dictionary<string, string>? InstalledVersions(ClaudePlugins claude)
    {
        var suffix = "@" + ModCatalog.MarketplaceName;
        return claude.Installed()?
            .Where(p => p.Id.EndsWith(suffix, StringComparison.Ordinal))
            .ToDictionary(p => p.Id[..^suffix.Length], p => p.Version, StringComparer.Ordinal);
    }

    private static void SaveOwned(Manifest? manifest, string providerId, string version,
        List<string> owned, string? manifestDirectory)
    {
        // Solo mods, sin el método: el manifiesto existe igual, para saber qué sacar.
        var updated = manifest is null
            ? new Manifest
            {
                Provider = providerId,
                Version = version,
                InstalledAt = DateTimeOffset.Now,
                Files = [],
                Mods = owned
            }
            : manifest with { Mods = owned };

        if (updated.IsEmpty) Manifest.Delete(providerId, manifestDirectory);
        else updated.Save(manifestDirectory);
    }
}
