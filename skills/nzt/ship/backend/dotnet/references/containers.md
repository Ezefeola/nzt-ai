# Packaging a .NET component as a container

## Choose the build path

- **The repository already has a Dockerfile:** keep it and improve it within scope. **Replacing
  the build path is the user's decision**, not a side effect of this unit.
- **No Dockerfile:** prefer the SDK's built-in container publishing. It needs no Dockerfile,
  infers the base image from the project, and on .NET 8 and later **runs as the non-root `app`
  user on Linux by default**.
- **OS packages or `RUN` steps are needed:** the SDK cannot run them. Use a multi-stage
  Dockerfile, or a custom base image the SDK then builds on.

## SDK container publishing

Configure the image **in the project file**, not in scattered command-line switches:

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

**Write the target as `-t:PublishContainer`**: Git Bash on Windows rewrites `/t:PublishContainer`
as a path and the command fails with something that looks unrelated.

| Property | Use |
|---|---|
| `ContainerRepository` | the image name; defaults to the assembly name |
| `ContainerImageTag` / `ContainerImageTags` | immutable version tags; **without one the tag is `latest`, which nothing should deploy** |
| `ContainerRegistry` | the destination registry; without it the image stays in the local container tool |
| `ContainerBaseImage` / `ContainerFamily` | a fully qualified base image, or a family variant of the inferred one |
| `ContainerUser` | keep the non-root default; `root` only with a stated reason |
| `ContainerPort` | inferred from the ASP.NET Core port variables; set it only when they are absent |
| `ContainerArchiveOutputPath` | write a `.tar.gz` to scan before pushing |

**Check that the family tag exists for this project's .NET version before using it.** Chiseled
images have no shell and no package manager; when the app does not use invariant globalisation
the SDK picks the `-extra` variant, which carries the globalisation libraries.

To inspect an archive before pushing, open it with `tar -xf` and read the image config: `User`,
`ExposedPorts`, the base image label. **Pushing authenticates through the registry's login or the
pipeline's federated identity — never with credentials in the project file.**

## Dockerfile, when that is the path

- **Multi-stage**: build with the SDK image, run on the ASP.NET or runtime-deps image. **The SDK
  never ships in the runtime image.**
- Pin base images by version tag, and by digest when the project pins digests.
- **Copy project files and restore before copying the rest**, so the restore layer caches.
- Run as a non-root user — `USER app` on the Microsoft images.
- A `.dockerignore` excludes `bin/`, `obj/`, `.git/`, local settings and secrets.

## Rules for any path

- **One process per image.** Migrations run from their own job
  (`nzt-ship-backend-dotnet-migrations`), **never from the application entrypoint**: every
  replica would run them at once.
- **Configuration and secrets come from the environment at runtime.** No `appsettings` with
  production values, and **no secret baked into a layer** — a layer is readable by anyone who
  pulls the image.
- **The same image is promoted across environments**; only the configuration changes. An image
  rebuilt per environment is a different artifact pretending to be the tested one.
- Liveness and readiness endpoints exist, so the platform can manage the container.
- Scan the image for known vulnerabilities in CI when the project adopted a scanner.

## Verify it

Build the image, **run it locally** with the environment variables it needs and disposable
dependencies, call its health endpoints and one real request, and confirm the user it runs as.
**Report what actually ran: an image that was only built is not a working image.**

## Closing checklist

- [ ] The existing build path was kept, or the SDK-versus-Dockerfile choice is justified.
- [ ] The image runs as non-root and carries no SDK, no secret and no production settings.
- [ ] Tags are immutable versions, and `latest` is not what gets deployed.
- [ ] Migrations stay out of the application entrypoint.
- [ ] The same image is what moves between environments.
- [ ] It ran locally, its health endpoints answered, and that is what was reported.
