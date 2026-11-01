# Packaging a .NET component as a container

With `nzt-ship`'s `references/release.md`.

## Steps

1. **Choose the build path**: an existing Dockerfile is kept and improved within scope —
   replacing it is the user's call. Without one, **SDK container publishing** (no Dockerfile,
   base image inferred, non-root `app` user on Linux from .NET 8). OS packages or `RUN` steps
   need a multi-stage Dockerfile or a custom base image.
2. **SDK path**: configure the image in the project file, publish with `-t:PublishContainer`
   (Git Bash on Windows rewrites `/t:` as a path).

   ```xml
   <PropertyGroup>
     <ContainerRepository>pedidos-api</ContainerRepository>
     <ContainerFamily>noble-chiseled</ContainerFamily>
   </PropertyGroup>
   ```

   ```bash
   dotnet publish src/Pedidos.Api -c Release --os linux --arch x64 \
     -t:PublishContainer -p ContainerImageTag=1.8.0-a1b2c3d
   ```

   | Property | Use |
   |---|---|
   | `ContainerImageTag(s)` | immutable versions — without one the tag is `latest`, which nothing deploys |
   | `ContainerRegistry` | destination; without it the image stays local |
   | `ContainerBaseImage` / `ContainerFamily` | a qualified base, or a variant — check the tag exists for this .NET version |
   | `ContainerUser` | keep non-root; `root` only with a stated reason |
   | `ContainerPort` | only when the ASP.NET Core port variables are absent |
   | `ContainerArchiveOutputPath` | a `.tar.gz` to scan and inspect (`tar -xf`: `User`, `ExposedPorts`, base label) before pushing |

   Chiseled images have no shell or package manager; without invariant globalisation the SDK
   picks `-extra`. Pushing authenticates with the registry login or federated identity — never
   credentials in the project file.
3. **Dockerfile path**: multi-stage (SDK to build, ASP.NET or runtime-deps to run — never the SDK
   in the runtime image); base images pinned by tag, by digest when the project does; project
   files copied and restored before the rest; `USER app`; a `.dockerignore` excluding `bin/`,
   `obj/`, `.git/`, local settings and secrets.
4. **Verify**: run it locally with its variables and disposable dependencies, call the health
   endpoints and one real request, confirm the user. A built image is not a working one.

## Rules

1. One process per image; **migrations run in their own job** (`ship-migrations.md`), never from
   the entrypoint.
2. Configuration and secrets come from the environment at runtime — no production `appsettings`,
   **no secret in a layer**.
3. **The same image is promoted across environments.**
4. Liveness and readiness endpoints exist (`ship-observability.md`); scan the image in CI when a
   scanner is adopted.

## Done when

The image runs non-root with no SDK, secret or production settings, carries an immutable tag,
keeps migrations out, and ran locally with its health endpoints answering.
