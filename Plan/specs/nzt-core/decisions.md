# NZT — Riesgos y decisiones

> Esta spec está en cuatro archivos (D99): [README.md](README.md) (§1–11 y Fuentes, el
> diseño vigente) · [decisions.md](decisions.md) (§12, riesgos y decisiones D-NN) ·
> [temper-v3.md](temper-v3.md) (§13) · [build-status.md](build-status.md) (§14). Los números de
> sección son los de siempre.

## 12. Riesgos y decisiones abiertas

- **R1.** **El riesgo más serio: el presupuesto del listado de skills.** Medido, no
  estimado (2026-09-16, con el núcleo completo en disco):

  | | skills | chars de listado |
  |---|---|---|
  | Núcleo NZT, antes de comprimir | 45 | 10.435 |
  | **Núcleo NZT, después de D17** | **45** | **7.219** |
  | `development-*` de Temper, proxy de la capa de stack | 48 | 6.798 |
  | Proyección con capa de stack, a la densidad de D17 | ~95 | ~15.000 |
  | **Set completo, medido con la capa de stack terminada (2026-09-17)** | **91** | **17.634** |
  | Piso de Codex sin contexto conocido | — | 8.000 |

  La proyección se quedó corta por **menos skills y descriptions más largas** que lo previsto:
  91 en vez de ~95, pero la capa de stack escrita a ~189 chars en vez de ~140 (I4).

  **El núcleo entra; el catálogo completo no.** Y la mitigación que esta spec sostenía desde
  el principio —núcleo global, capa de stack por proyecto— **ya no existe: D18 instala todo
  global.** Quedan dos palancas, las dos sobre el tamaño del catálogo y no sobre dónde se
  instala: **la densidad de D17** y **la cantidad de skills de la capa de stack**. El piso de
  8.000 aplica cuando Codex no conoce el tamaño del contexto; con contexto conocido el
  presupuesto es 2% y da más aire, pero eso **hay que medirlo, no asumirlo**, y es la fase 9.

  **El modo de falla, verificado (C2), baja bastante el riesgo:** Codex no falla ni corta
  seco — acorta descriptions y después omite skills del listado con un warning. Como el
  ruteo de NZT está instruido y la tabla del kernel viaja en `AGENTS.md` —fuera de este
  presupuesto—, lo que tiene que entrar sí o sí son los **9 routers, ~1.500 chars**. R1 pasa
  de *"el set no entra"* a *"las hojas pueden no aparecer listadas, y hay que comprobar que
  su router las pueda cargar igual"*. **Esa comprobación es la fase 9** y sigue siendo la que
  decide.
  ~~**Del lado de Claude Code R1 no existe**: 122 skills de Temper instaladas midieron 17.022
  chars y pesan 0,8% del contexto de una sesión. El riesgo es específicamente Codex.~~
  **Corregido el 2026-10-03:** la documentación actual de Claude Code topea el listado al
  **1 % de la ventana** y, al pasarse, quita descriptions empezando por las menos usadas.
  Medido en una sesión con 1M de ventana: las skills ocupaban **9,9k tokens = 1,0 %**, justo
  en el tope. **R1 aplica a los dos proveedores.**
  **Mitigación adoptada: D50.** Las hojas pasan a referencias y el listado queda en 14 skills,
  unos 2.600 chars, que entran en cualquiera de los dos presupuestos.
- **R2.** Los routers pueden no dispararse y el modelo ir directo a una hoja. Mitigación:
  la tabla de ruteo del kernel, y hojas que digan "si no venís del router, cargalo".
- **R3.** Duplicación de disciplina entre kernel y skills ⇒ instrucciones contradictorias.
  Mitigación: el kernel nunca describe procedimientos.

### Decisiones cerradas

- **D1.** NZT se diseña como set autónomo. La convivencia con otros sets de skills
  instalados en la máquina no es problema de NZT: se resuelve fuera, a nivel instalación.
  El prefijo `nzt-` alcanza como higiene de nombres.
- **D2.** **Idioma:** todas las skills, el kernel y los nombres se escriben en **inglés**.
  El agente le responde al usuario **en el idioma en que el usuario le habla**. Esta regla
  vive en el kernel, no en cada skill. Los artefactos que el agente genera en el proyecto
  destino (specs, plan, pruebas) siguen el idioma del usuario.
- **D3.** **El techo de 200 líneas no se mueve, para ninguna capa.** Es decisión del owner
  y es **más estricta que la plataforma a propósito**: Anthropic recomienda < 500 (sección
  3). La razón es legibilidad — una skill de 500 líneas deja de leerse — y se suma a la del
  presupuesto de contexto. El desborde se resuelve **partiendo la skill**, nunca subiendo el
  techo. *Desde D50, partir una hoja es partirla en dos referencias, y el techo aplica igual a
  cada referencia.*
- **D4.** *(Derogada por D50, 2026-10-03.)* **`references/` queda como capa declarada y sin uso.** Sigue en la arquitectura
  (4.3) porque es parte del estándar abierto que los tres proveedores implementan, pero NZT
  **no la adopta como herramienta de rutina**. La razón la fija D3: si una hoja no entra en
  200 líneas, es más de un trabajo. Y el argumento de que "es la misma apuesta que cargar
  una skill" **es falso en NZT**: el ruteo a routers y hojas está instruido en tablas que ya
  están en contexto, mientras que un puntero a `references/` es una lectura extra que puede
  no ocurrir. Son dos modos de falla distintos, no el mismo. Si alguna hoja técnica la
  necesita, se decide caso por caso y con su disparador explícito.
- **D5.** **El análisis funcional tiene un archivo por altitud.** El de feature ya estaba
  definido (`Plan/specs/<feature>/analysis.md`); el de producto vive en `Docs/analysis.md`,
  que es donde va lo que sobrevive a cualquier feature. Decidido al escribir
  `nzt-discovery-analysis`, que no podía nombrar un destino inexistente.
- **D6.** **La carpeta de una feature es `F-NNN-<slug>`.** Sigue el patrón que ya usan las
  historias (`US-NNN-<slug>`) y los bugs (`BUG-NNN-<slug>`), y le da a la feature un
  identificador estable que se puede citar desde el plan y desde el alcance de otra feature.
  Donde esta spec escribe `<feature>`, se lee esa carpeta. Decidido al escribir
  `nzt-discovery-write-spec`.
- **D7.** **Los tres documentos de discovery en `Docs/` tienen nombre fijo**:
  `product.md`, `glossary.md` y `analysis.md`. El inventario de `Docs/` sigue siendo de
  `nzt-architecture` (y los de UX, de `nzt-ux-system`), pero el nombre de los archivos que
  discovery produce lo fija discovery: una hoja no puede escribir en un destino que no
  tiene nombre. Decidido al escribir `nzt-discovery-product`.
- **D8.** **Los hallazgos de ingeniería inversa llevan `R-NN` propio**, viven en el
  `analysis.md` de la feature y no son preguntas `Q-NN`. Una regla confirmada por el usuario
  cita `origen: inversa (R-NN)`, que es lo que hace visible de dónde salió sin diluir la
  distinción de 13.2 #13 entre dictada y reconstruida. Decidido al escribir
  `nzt-discovery-reverse`.
- **D9.** **El documento de stack tiene hoja propia: `nzt-architecture-stack`.** El
  catálogo pasa de 35 a 36. Lo fuerza la regla 1 de la sección 10: el stack es un trabajo
  distinto del diseño de producto — se escribe una vez por **componente y área**, declara
  las áreas del proyecto (T3), y un componente existente lo recibe desde evidencia antes de
  tocarle el código, sin que haya diseño de producto de por medio. Meterlo en
  `design-product` sería una skill con dos títulos. El costo de R1 es ~230 chars de
  listado, con el total en ~3.900 sobre un piso de 8.000. Decidido al escribir
  `nzt-architecture-design-product`; **reversible**: si se descarta, su contenido se pliega
  a `design-product`.
- **D10.** **La arquitectura de producto es un solo documento, `Docs/architecture.md`** —
  componentes, límites, sistemas externos y el razonamiento, juntos. Temper los separa en
  `product-design.md` y `system-architecture.md`; NZT no, porque el registro de componentes
  sin el razonamiento al lado es exactamente lo que hace que una decisión se vuelva a
  discutir. Los ADR viven aparte, en `Docs/adr/`. Decidido al escribir
  `nzt-architecture-design-product`.
- **D11.** **UX mantiene dos documentos, no tres**: `Docs/design-system.md` —dirección
  visual y roles juntos, porque la dirección es el *por qué* que los roles codifican y
  cambian a la vez— y `Docs/ui-components.md`, el inventario de componentes compartidos,
  aparte porque es el que se pudre más rápido y su única defensa es mantenerlo chico (13.6
  #30). Cada uno es una unidad. Decidido al escribir `nzt-ux-system`.
- **D12.** **`progress.md` lo crea `nzt-learn-plan`, en la misma unidad que la currícula, y
  su forma queda fijada ahí.** No tiene hoja propia — Temper sí la tiene
  (`learning-documents-write-progress`) — porque el catálogo de la rama son 8 skills y
  partirlo dejaría a `plan` escribiendo objetivos en un archivo cuya forma no puede nombrar.
  Quedan en `plan` las tres secciones (tabla por objetivo, calibración, bitácora) y el
  **vocabulario cerrado de estados**; **cómo se gana cada veredicto lo dice
  `nzt-learn-assess`**. Es el mismo corte que en el resto del set: quien crea el destino fija
  su forma, quien lo llena fija su contenido. El costo es el tamaño: la hoja salió en **174
  líneas**, la más grande después de `nzt-plan`. Decidido al escribir `nzt-learn-plan`.
- **D13.** **Cada archivo de un tema se nombra por lo que lo ancla**: la lección por su
  objetivo (`lessons/OA-NN-<slug>.md` — un objetivo puede llevar dos lecciones y el prefijo
  las agrupa), el ejercicio por su identificador propio (`exercises/EX-NN.md`) y **su
  solución con el mismo nombre en otra carpeta** (`solutions/EX-NN.md`, que es lo que hace
  obvio de un vistazo si una solución existe antes de tiempo — 13.8 #35), y la evaluación
  por fecha (`assessments/<YYYY-MM-DD>.md`, porque mide el tema en un momento y no un
  objetivo). En prosa se cita el identificador (`OA-02`, `EX-03`); el path agrega carpeta y
  extensión. **Cuándo se escribe la solución sigue siendo de `nzt-learn-exercises`**; acá
  solo se fijó dónde vive. Decidido al escribir `nzt-learn-teach`.
- **D14.** **La pista de escalón 4 se registra igual que una solución pedida.** T19 previó
  el caso en que la persona pide la solución; el resultado en el archivo es el mismo cuando
  la entrega el agente al final de la escalera: el objetivo queda `solved by the system` y
  salta al intervalo de repaso más corto. Sin esto la escalera tiene una salida que no deja
  rastro, y "desbloquear" sale gratis justo donde 13.8 #19 dice que es más caro. Decidido al
  escribir `nzt-learn-tutor`.
- **D15.** **En una serie de entrenamiento la confianza se pregunta dos veces**: en la
  primera repetición y en la que cierra la serie. 13.8 #18 la pide antes de cada corrección,
  y en el loop de enseñanza eso es una por entrega; en una serie de cinco repeticiones
  preguntarla cinco veces la convierte en un tic que se contesta sin pensar, y las filas de
  calibración dejan de ser dato. Un `high / wrong` en el medio igual abre su fila y salta la
  cola de repaso. Decidido al escribir `nzt-learn-train`.
- **D16.** **`## When to skip this phase` se queda en `nzt-architecture` y `nzt-ux`.**
  Cierra I3. No es el caso que prohíbe la regla 11: ahí el router **ya está cargado** y esa
  sección **cambia lo que hace** — le dice que la fase no corresponde y que diga por qué. La
  regla 11 prohíbe la sección que solo se puede leer después de que la decisión que explicaba
  ya se tomó; esta se lee justo cuando decide. Decidido por el usuario.
- **D17.** **La description apunta a ~130 chars en una hoja y ~170 en un router**, con el
  techo de 250 intacto como límite duro. Salió de medir: las 45 descriptions originales
  promediaban 231 chars y el listado daba 10.435, **1,3× el piso de 8.000 de Codex con el
  núcleo solo**. Comprimidas sin tocar el cuerpo de ninguna skill, el listado quedó en
  **7.219**. Lo que hace barata la compresión en NZT y cara en otros sets es R2: acá el ruteo
  está **instruido** en la tabla del kernel y en las tablas de hojas de los routers, así que
  la description no carga el peso del disparo. Los routers quedan más largos que las hojas
  porque son los que **sí** tienen que dispararse en frío. Decidido y aplicado en una pasada
  sobre las 45.
- **D18.** **Todo el set se instala global, incluida la capa de stack.** Cierra I1 y deroga
  la regla de 4.5 que la instalaba por proyecto. Decidido por el usuario: una sola
  instalación, sin flags ni alcance por repo. Tres consecuencias que hay que sostener:
  **(1)** el filtro pasa a ser el documento de stack — *una carpeta instalada no es una
  autorización* deja de ser una precaución y pasa a ser el mecanismo; **(2)** R1 se queda sin
  su mitigación de diseño y las únicas palancas son la densidad (D17) y **cuántas skills
  tiene la capa de stack**; **(3)** cada skill de stack se paga en todos los proyectos,
  también en los que no son .NET, así que partir una skill por cohesión ahora tiene un costo
  que antes no tenía.
  **[modify] 2026-11-01: derogada por D88.** La capa de stack pasa a packs por proyecto; el
  filtro de (1) sigue, ahora sobre los packs que `tech.md` lista.
- **D19.** **La forma del árbol de backend .NET**, decidida al escribir su router de área.
  **27 hojas más el router**, y aparte **tres hojas compartidas de C#**, con cuatro cambios
  respecto de Temper y sus razones:
  **(1)** las convenciones de C# salen del área y suben a **`nzt-build-csharp`**, con
  `nzt-build-csharp-linq` y `nzt-build-csharp-dtos`, porque Blazor también es C# y duplicarlas
  en dos áreas es garantizar que se contradigan; los dos routers de área las citan en
  *Required guidance*. **Son tres y no dos porque convenciones + LINQ no entran en 200
  líneas** (174 y 162): la regla 3 manda partir, no subir el techo.
  **(2)** `bulk-update` y `bulk-delete` se unen en **`ef-core-bulk`**: es el mismo mecanismo
  —`ExecuteUpdateAsync` / `ExecuteDeleteAsync`— con el mismo modo de falla. **(3)**
  `ef-core-ddd` y `ef-core-value-objects` se unen en **`ef-core-domain`**: las dos son mapear
  el modelo de dominio adoptado. **(4)** se cae el segmento `orm-` del path y las
  redundancias de nombre (`architecture-clean`, no `architecture-clean-architecture`;
  `endpoints-minimal`, no `endpoints-minimal-apis`): el nombre lo dicta el path (regla 8) y
  cada segmento se paga en el listado 26 veces. **EF Core no lleva sub-router**: sus ocho
  hojas se listan en la tabla del router de área, para que el ruteo siga siendo un salto.
- **D20.** *(Obsoleta desde D50: las referencias no llevan línea de R2, y lo que se lee junto
  lo dice la columna* Read with *de la tabla del router.)* **La línea de R2 de una hoja nombra todo lo que hay que cargar, no solo el
  router.** Las ocho hojas de EF Core abren con *Load `nzt-build-backend-dotnet` and
  `nzt-build-backend-dotnet-ef-core` before applying this*, y `pagination` nombra además
  `…-ef-core-queries`. Es la consecuencia directa de que EF Core **no tenga sub-router**
  (D19): la hoja común existe, el router de área dice que se carga con cualquiera de las
  ocho, y si la hoja solo nombrara al router, el tracking y la regla del loop quedarían
  dependiendo de que el router se haya leído completo. El costo son dos líneas por hoja; el
  modo de falla que evita es una hoja aplicada sin lo que la enmarca. **Cuando el árbol de
  Blazor tenga una hoja común equivalente, se escribe igual.** Decidido al escribir
  `nzt-build-backend-dotnet-ef-core-queries`.
- **D21.** **La forma del árbol de Blazor**, decidida al escribir su router de área, como D19.
  **9 hojas más el router**, con dos diferencias respecto de Temper:
  **(1)** `components` se parte en **`components` + `forms`**. En Temper es una sola de 184
  líneas; portada con la densidad de NZT no entra con margen, y sobre todo **son dos
  trabajos**: un formulario tiene modelo propio, doble validación, envío que no puede correr
  dos veces y antiforgery, y **la mayoría de los componentes no son formularios**. La regla 3
  manda partir, no subir el techo — mismo caso que `csharp` + `linq` en D19. El bonus:
  `render-static` ya no duplica la mecánica del POST, la nombra.
  **(2)** `rendering-performance` queda como **`performance`**: el segmento `rendering-` es
  redundante bajo `blazor` (regla 8).
  Lo que **no** cambió: **los cuatro modos de render son cuatro hojas**, porque son un eje
  excluyente —solo se carga uno— y juntos son 300 líneas de fuente; y **`prerendering` sigue
  siendo hoja propia**, porque las tres modalidades interactivas la referencian y duplicarla
  es garantizar que las tres se contradigan. **Arquitectura tiene una sola alternativa
  (`vertical-slice`)**: el router lo dice, y un stack que nombre otro concepto para el
  frontend es un hueco del documento de stack, no una invitación a improvisar.
- **D22.** **La forma del árbol de ship .NET**: **router de área más cuatro hojas** —
  `containers`, `migrations`, `pipeline`, `observability`. Las cuatro fuentes de Temper suman
  282 líneas y podrían caber en una sola, pero **cada una se carga en una unidad distinta**
  (empaquetar, aplicar esquema, tocar gates, instrumentar), así que una sola haría cargar
  cuatro temas para usar uno. El router es chico a propósito (51 líneas): lee el proyecto,
  fija la regla transversal —**el SDK es el que fija `global.json` y nada se sube para que
  algo pase**— y rutea. Dos nombres se acortan respecto de Temper: `ef-migrations-deploy` →
  **`migrations`** (bajo `ship` no hay otras) y el prefijo `ship-dotnet-` lo da el path.
  **Cada hoja nombra su práctica genérica en la línea de carga** (`nzt-ship-release`,
  `nzt-ship-pipeline`, `nzt-ship-observability`), que es D20 aplicado a esta área. Decidido
  al escribir `nzt-ship-backend-dotnet`.
- **D23.** **La fase 6 usa `claude plugin eval`, y su target es `dist/plugin/`**, el set
  aplanado como plugin que ahora arma `install/build.*`. Tres cosas que esto decide, con su
  razón (los hechos de plataforma están en C6):
  **(1) No se escribe harness propio.** El oficial ya trae lo que la fase 6 pide —arm de
  ablación con Δ, `tool_used: Skill` como *disparó*, `min/max 0` como *no tiene que
  disparar*— y un harness casero mediría lo mismo peor.
  **(2) El target es el build aplanado, no el repo.** El repo anida y el plugin del repo
  cargaría los nombres del árbol, no los que instala NZT. Evaluando `dist/plugin/` **se
  evalúan los nombres que se instalan**, y de paso la pregunta de C5 —hasta qué profundidad
  anida un plugin— deja de bloquear. El costo es que `dist/plugin/` se regenera: los
  resultados de una corrida se guardan afuera o se pierden.
  **(3) Cada caso siembra el kernel en su workspace.** Es la parte no obvia: sin
  `CLAUDE.md` en el workspace, la corrida mide matching de descriptions, que es exactamente
  lo que NZT decidió no usar como mecanismo de ruteo (R2). El caso `kernel-loaded` existe
  para que eso falle fuerte y temprano en vez de degradar en silencio todos los demás.
  **El plugin es para evaluar, no para distribuir**: si NZT además se distribuye como
  plugin en Claude Code es pregunta de la fase 10, y Codex no tiene plugins. Decidido al
  escribir la suite. **Cerrado por D24: no se distribuye como plugin.**
- **D24.** **NZT se instala global y sin plugins, con un CLI propio en .NET 10**
  (`installer/src/Nzt.Cli`, detalle en `specs/nzt-installer.md`). Decidido por el usuario:
  *"quiero que puedas instalar esto globalmente en Claude sin que conozcas plugins"*. Un
  plugin es un mecanismo que el usuario tendría que conocer, **no existe en Codex**, y
  namespacea las skills (`nzt:nzt-build`) rompiendo los nombres que nombran las tablas de
  ruteo. Lo que se instala son skills sueltas en la carpeta de usuario más un bloque
  delimitado en el archivo de instrucciones global.
  **Revisado el 2026-10-16** (el usuario preguntó plugin o mod; la decisión se mantiene,
  cambia el motivo): **Codex sí tiene plugins** (`.codex-plugin/plugin.json`, directorio
  compartido con ChatGPT), así que "no existe en Codex" ya no es cierto. Lo que sostiene
  D24 es que **ningún mecanismo de plugins carga el kernel igual en todos los proveedores**:
  en Claude Code un `CLAUDE.md` dentro de un plugin no se carga, un hook `SessionStart`
  corta en 10.000 caracteres (el kernel tiene ~12.300) y solo un mod (`prompt.compose`)
  podría inyectarlo; en Codex no hay forma documentada de que un plugin traiga
  instrucciones siempre cargadas. Un plugin daría un NZT distinto en cada proveedor; el
  archivo de instrucciones más la carpeta de skills existen en todos y dan el mismo.
  Decidido por el usuario: *"no vamos a hacer un plugin entonces para NZT"*. Fuentes, leídas
  el 2026-10-16: [plugins-reference](https://code.claude.com/docs/en/plugins-reference),
  [hooks](https://code.claude.com/docs/en/hooks),
  [mods reference](https://code.claude.com/docs/en/plugins/mods/reference),
  [skills](https://code.claude.com/docs/en/skills),
  [Codex build plugins](https://developers.openai.com/codex/plugins/build/).
  Tres consecuencias:
  **(1)** cierra **I3** —la versión sale del `<Version>` del `.csproj`— y **resuelve I2 sin
  eliminarla**: `install/build.*` sigue siendo el loop de desarrollo, el CLI es lo que
  instala, y lo que evita que diverjan es una comprobación que compara **byte a byte** el
  bloque del CLI contra el `dist/CLAUDE.md` del build.
  **Revisada por D91 el 2026-11-04**: en Claude Code NZT también se distribuye como plugin,
  con una skill de setup; esta decisión sigue vigente para `nzt-ai` y para Codex.
  **(2)** el contenido se **embebe al compilar**, así que el ejecutable es el set y su
  versión es la del set.
  **(3)** la regla que ordena todo el instalador: **nunca se pisa ni se borra un archivo que
  este CLI no escribió**, y una edición local del usuario se conserva incluso a través de
  reinstalaciones, porque el manifiesto guarda el último hash *instalado* y no el editado.

Las siete siguientes salen de la segunda pasada sobre Temper (13.12), todas decididas por
el usuario a partir de los huecos que esa pasada encontró.

- **D25.** **El cierre de feature tiene hoja propia, `nzt-plan-close`, y produce
  `Docs/history.md`.** El set ya prometía el barrido — `nzt-build`, `implement` y `remove`
  delegaban los marcadores a *"whoever closes the feature"* y la spec lo nombraba dos veces
  — y **ninguna de las 91 skills lo hacía**: era una referencia colgada, no una decisión.
  Cuelga de `nzt-plan` y no de una fase porque **es transversal a todas**: barre los
  marcadores de la spec, pasa la tabla de documentos afectados, escribe la historia y cierra
  el estado. Lo dispara **la aceptación del usuario**, no que el código compile.
  Consecuencias: `nzt-plan` gana su primera hoja, y el `history.md` es lo único que queda de
  una regla que el barrido borra de la spec, así que la entrada se escribe **antes** de
  reportar la feature como cerrada.
- **D26.** **El modelo de dominio y el mapa de contextos son dos hojas y dos documentos**:
  `nzt-architecture-domain` → `Docs/domain-model.md` y `nzt-architecture-contexts` →
  `Docs/context-map.md`. El router ya declaraba poseer *"the domain model in technical
  terms"* y el glosario ya mandaba el modelo a *"architecture's own document"*, pero
  **ninguna hoja lo escribía**: `design-product` produce componentes y límites, y
  `design-feature` solo datos por feature. Son dos y no una porque no entran en 200 líneas
  (D3) y **son dos trabajos**: adentro de un contexto, el agregado; entre contextos, el
  límite de significado. El de contextos **solo existe con más de un contexto o un
  tercero**, y el de dominio se escribe **después de las specs que modela**, porque los
  campos salen de los criterios.
- **D27.** **Los diagramas son un catálogo cerrado de siete, en cuatro skills, y son
  artefacto *ofrecido*.** `nzt-architecture-diagrams` decide cuál se gana y lleva las reglas
  compartidas; las tres hojas que dibujan se agrupan **por documento anfitrión** —
  `components` (contexto y componentes), `domain` (contextos acotados y agregados),
  `behavior` (secuencia, estado y flujo) — y no una por tipo como Temper, porque cuatro
  tipos por archivo entran en el techo y siete skills se pagan siete veces en R1. **Sin
  sub-router**: las nombra el router de fase, como EF Core (D19), y cada hoja abre con su
  línea de carga doble (D20). La regla que las hace usables la puso el usuario: **se ofrecen
  cuando la charla las gana, diciendo qué muestran que la prosa no, y si no los quiere no se
  dibujan.** Un diagrama que ya existe se mantiene con el cambio. En la misma decisión entra
  el arreglo de los `QT-NN`: **una pregunta respondida pasa a `Decided` en su mismo
  documento, con fecha, y no se borra** — eso da lo que Temper resolvía con un
  `design-decisions.md` aparte, sin un archivo más. *(Esta última parte queda superada por
  D41: el archivo de más se paga. Lo de los diagramas sigue vigente.)*
- **D28.** **Cambiar una feature que ya existe tiene hoja propia, `nzt-discovery-change`, y
  un archivo temporal `Plan/specs/<feature>/change.md`.** Faltaba el paso previo: el set
  tenía los marcadores `[modify]` y `[remove]` en build, pero **nadie explicaba quién los
  pone**, y editar una spec es destructivo y sin undo. La propuesta es el área de staging
  donde el usuario aprueba antes de tocar la fuente de verdad; se fusiona con marcadores y
  **se borra en la misma unidad**. Con esto los marcadores tienen ciclo completo:
  `change` los pone, `build` construye contra ellos y `close` (D25) los barre. Y queda
  cerrada la regla que faltaba: **un `remove` deja un criterio que verifica la ausencia, y
  ese test sobrevive al barrido**.
- **D29.** **`Docs/tech-debt.md` cuelga de arquitectura y no lleva checkboxes.** Es técnico
  —*"el caso de uso mezcla validación con persistencia"* no se escribe en lenguaje de
  negocio— así que vive en `Docs/`, cuyo inventario es de esa fase. Contra Temper, **sin
  checkboxes**: el avance en NZT se lee de los criterios de una historia, en un solo lugar
  (T1), y una casilla acá sería un segundo lugar donde algo parece hecho; una entrada se
  mueve de **Abiertas** a **Resueltas** y nada más. Y una regla que Temper deja implícita:
  **una entrada nace cuando el usuario decide diferir**, no cuando el agente encuentra algo
  — lo encontrado y no decidido vive en el reporte de la unidad.
- **D30.** **La rama `analyze-*` de Temper no se porta como rama: se reparte por dueño.**
  NZT no tiene fase de análisis técnico (4.4 decidió que el análisis funcional es una fase y
  lo técnico se resuelve en su fase), así que las cuatro lecturas que faltaban entran donde
  ya vive su trabajo: **`nzt-build-recon`** (relevamiento de impacto antes de tocar código
  que existe: quién más lo consume, con evidencia), **`nzt-verify-review`** (defectos
  leyendo código, que es lo que un escenario no encuentra porque la spec no lo cubre),
  **`nzt-verify-audit`** (documentos contra código, con sus dos barridos y sus tres
  veredictos) y **`nzt-architecture-review`** (mejoras estructurales sobre evidencia de
  dependencias, historia de cambios y runtime). `analyze-reverse` ya estaba en
  `nzt-discovery-reverse` y `analyze-verify` ya estaba repartido entre `nzt-verify` y el
  readiness de `nzt-ship`. **Las dos de verify no necesitan aplicación corriendo**, y el
  router lo dice para que no arrastren el freno del plan de pruebas.
- **D31.** **`nzt-research` es hoja de primer nivel y la nombra el guardrail del kernel.**
  El kernel ya tenía la regla —*"say what you checked, not what you believe"*— pero no el
  método, que es lo que hace la diferencia: fijar la versión en uso antes de buscar,
  la jerarquía de fuentes, y **etiquetar cada afirmación** (`documented` · `observed` ·
  `inferred` · `unverified`). No cuelga de ninguna fase porque cualquiera la necesita, y no
  paga ruteo por eso: **el guardrail que la nombra está en el archivo que siempre está en
  contexto**, así que se descubre sin ocupar una fila de la tabla.
- **D32.** **`development-testing-code-tests` se porta después de todo, como
  `nzt-build-tests`, y el set queda en 106.** Era la única decisión que la segunda pasada
  dejó abierta en vez de cerrada, y el usuario la cerró del otro lado. La razón que la tenía
  afuera no era mala —lo que hace valioso a un test se repartía entre `nzt-build-tdd` y
  `nzt-verify-test-design`— pero **los dos repartos son parciales**: `tdd` decide el *orden*
  y es opt-in del stack, así que un proyecto que no lo eligió no ve nada; y
  `verify-test-design` deriva casos de un criterio para el plan de pruebas de aplicación, no
  para los tests que viajan con el código. Lo que quedaba sin hogar era el **criterio**: qué
  se testea y qué no, las cuatro cualidades con la resistencia al refactor como no
  negociable, estado sobre interacción, un solo Act y sin lógica adentro, flaky = defecto,
  coverage como indicador y no objetivo, y **cuándo un cambio de comportamiento gana test**.
  Tres cosas que esta hoja fija y que la fuente de Temper no podía fijar:
  **(1) es de fase, no de stack**, así que **no lleva ejemplo de código** —la regla de 4.5:
  ningún router ni hoja de fase asume .NET— y la práctica concreta sigue siendo del área;
  **(2) la hoja de área la nombra en su línea de carga** (D20), que es lo que evita que un
  proyecto .NET lea la práctica sin el criterio; **(3) el límite con `tdd` queda escrito en
  las dos**: una decide el orden, la otra el valor, y el valor vale igual si el test se
  escribe antes o después. El precio que 13.12 había aceptado —un proyecto que no es .NET sin
  guía de tests— deja de pagarse, y el costo real son ~150 chars de listado.

Las tres últimas las pidió el usuario después de leer el reporte de la segunda pasada.

- **D33.** **Probar empieza por elegir el componente, y por chequear con qué se puede
  probar.** Pedido del usuario: *"siempre que se pida hacer tests pregunte qué componente
  queremos testear, si la api o el front, son distintas pruebas"*. Se resuelve **sin hoja
  nueva**, como T7 resolvió la mecánica de ejecución: el router `nzt-verify` gana una
  sección con la pregunta y una **tabla de tres filas —API, pantalla, las dos— que dice qué
  ejercita cada objetivo y, sobre todo, qué *no* puede probar**; `test-design` dice cómo
  cambia el caso según el objetivo (la técnica no cambia, lo observable sí); y `test-run`
  cómo se maneja cada uno. Dos cosas que esto fija:
  **(1) las opciones son las áreas que declara el stack** (T3), así que la pregunta se lee
  del proyecto y no se inventa;
  **(2) la capacidad del host se chequea antes de prometer**, y se escribe en capacidades y
  no en productos —*driving a browser depends on the host offering a tool for it*— porque
  una skill que asume una herramienta de un proveedor rompe la portabilidad (C1) y envejece
  con él. Cuando no hay browser manejable, las salidas honestas son dos: **la corre el
  usuario y el agente registra su evidencia como suya** —*executed by the user*, con fecha—
  o queda `blocked` con esa causa. Inventar el equivalente por API y marcar el escenario de
  pantalla como pasado es lo único prohibido, y ya era regla: *API evidence does not
  establish that the UI works*.
- **D34.** **La performance que se mide es la que espera el usuario: `nzt-verify-performance`.**
  Es hoja de verify y no de build porque **mide contra un requisito y produce evidencia**,
  que es el trabajo de esa fase; optimizar es de build, y la hoja lo dice. Lo que la hace
  útil y no un juguete: **el número se compara contra el requisito no funcional de la
  historia, y si no hay requisito lo que se produjo es una línea de base y el objetivo es una
  pregunta para el usuario** — el agente nunca declara *"esto es lento"* por su cuenta.
  Percentiles y no promedio, volumen de datos y entorno escritos al lado del número, frío y
  caliente distinguidos, y una tabla de cuatro lugares donde se va el tiempo para **localizar
  antes de proponer**. Incluye lo que el usuario pidió como *experiencia*: los tres estados
  de una pantalla que carga, y que **una mejora percibida se registra como percibida y no
  como aceleración** — un spinner hace legible la espera, no arregla la consulta. Se cierra
  el ciclo en los dos extremos: el requisito lo escribe `nzt-discovery-write-spec` (ahora con
  su condición: *a 5.000 órdenes*), y lo que solo aparece con tráfico real sigue siendo de
  `nzt-ship-observability`.
- **D35.** **El RFC es hoja de arquitectura y documento *a pedido*: `nzt-architecture-rfc`.**
  Pedido del usuario para los cambios que hay que acordar con más gente que él. El corte con
  el ADR es lo que justifica una hoja aparte y está escrito en las dos: **un RFC pregunta, un
  ADR registra**; el RFC vive mientras la decisión está abierta y guarda la discusión, el ADR
  se escribe cuando ya se tomó y guarda la decisión. **Un RFC aceptado produce su ADR** y el
  ADR lo nombra; nunca se edita un RFC para convertirlo en registro, porque lo que conserva
  —las objeciones con su autor— es justo lo que un ADR no conserva. Gana un RFC lo que cumple
  **las tres**: caro de revertir, afecta a gente que no está decidiendo, y hay elección real
  (con una sola opción es un anuncio, y un anuncio no necesita ventana de comentarios). Tres
  reglas que lo hacen honesto: **la ventana es una fecha, no una sensación**; **un RFC que
  nadie contestó no es consenso** y el resultado tiene que decirlo; y **el agente no es
  participante** — resume posiciones, no las inventa, y la decisión del usuario nunca se
  escribe como consenso. Mientras está abierto no se construye nada, y eso se registra en
  `waiting_on` del estado.
- **D36.** **Los datos de prueba son una hoja propia, con dos scripts por escenario:
  `nzt-verify-test-data`.** Segundo hallazgo de usar el set, no de leerlo (13.5, segundo
  hueco): el agente se frenó por falta de datos. 13.5 #31 ya obligaba a crearlos, pero no
  decía **cómo**, y sin eso la obligación se cumple de cualquier forma o no se cumple.
  Tres cosas quedan fijadas, y las tres salen del pedido del usuario:
  **(1) el mecanismo lo elige él, una sola vez.** Se pregunta con el plan —no por escenario,
  no en medio de una corrida— con una tabla de cuatro opciones que dice de cada una cuándo
  es la más barata, qué **no** puede alcanzar y qué cuesta: la semilla que el proyecto ya
  tiene, el alta por la API bajo prueba, SQL que corre el agente, SQL que corre la persona.
  La respuesta se escribe como opt-in `Test data` en el documento de stack del componente
  (T3 otra vez: lo que verify necesita saber del proyecto se lee del stack), y desde ahí se
  lee.
  **(2) Cada escenario tiene su par de scripts, escritos juntos y antes de correr**:
  `data/<historia>/E-NN-setup.*` y `E-NN-teardown.*`, aprobados con el plan. El teardown se
  escribe al mismo tiempo que el setup porque uno escrito después borra lo que el agente se
  acuerda de haber creado. Y **borra por la marca que puso el setup** —un tag que el
  escenario es dueño— nunca por fecha, nunca un `TRUNCATE`: el borrado ancho es el único
  modo de falla de esto que se lleva trabajo ajeno puesto.
  **(3) No poder ejecutar no es `blocked`.** Sin acceso al motor, el script se escribe igual
  y se entrega: qué correr, contra qué entorno, qué devolver — y esa ejecución se registra
  como del usuario, con fecha, igual que un escenario que corre él. Lo que sí se dice al
  proponer SQL es su precio: escribir por detrás del producto puede crear una fila que sus
  propias reglas nunca permitirían, y entonces el escenario prueba un estado que no puede
  existir. Para un estado que el producto sí sabe producir, su punto de entrada es el script
  más seguro. La verificación de la precondición después del setup cierra el círculo: un
  setup que corrió no es un estado que existe, y el escenario que arranca sin su precondición
  queda `blocked`, nunca `failed` — no se probó nada.
- **D37.** **El manual del usuario final es hoja de UX: `nzt-ux-manual`.** Pedido del
  usuario, con su filosofía explícita —*el software está pensado para el usuario final, hay
  que hacerlo sentir especial*— y una pregunta abierta: cuándo se arma. Las tres cosas que
  fija:
  **(1) Es de UX y no de ship ni de discovery.** Es la única superficie del set que lee
  alguien de afuera del equipo, usa el tema real de `Docs/design-system.md` —**nunca una
  segunda paleta**, la misma regla del mockup y por la misma razón: un manual con su propia
  identidad se lee como el documento de un tercero sobre tu producto— y su autoridad son los
  criterios verificados. Ship lo publica (una fila más en la lista de alistamiento), verify
  le presta la evidencia de donde salen las capturas.
  **(2) Cuándo: al final, no mientras se construye. Decisión del usuario**, sostenida
  después de que el agente propusiera lo contrario —un capítulo por feature cerrada— y se
  ejecuta como suya. El momento es el final de lo que se entrega: alcance terminado y
  aceptado, antes de que llegue a la gente que lo va a usar (una entrega, una capacitación,
  el release que lo abre a usuarios reales). Lo que hace que eso funcione en NZT y no sea
  arqueología es que **nada se escribe de memoria**: las historias con sus criterios, la
  evidencia de pruebas con sus capturas y las palabras del glosario ya están en disco. Se
  arma en una tanda cortada en unidades —primero el armazón (audiencias, índice, camino
  *empezá acá*), después un capítulo por tarea, y al final la pasada de coherencia, la única
  unidad cuyo sujeto es el archivo entero—, **con las capturas tomadas al escribirlo**, que
  es el riesgo concreto de escribir al final y la única mitigación que hacía falta. Pedido
  antes, se escribe antes. **Y desde que existe deja de ser un artefacto de final**: la
  feature que cambia lo que la persona hace pone su capítulo al día al cerrar
  (`nzt-plan-close` lleva la fila), pero **un cierre nunca crea el manual**.
  **(3) Qué lo hace ameno, escrito como reglas y no como gusto.** Capítulos que son objetivos
  dichos como los diría la persona (*"Cobrar un pedido"*, nunca *"Módulo de cobros"*: un
  manual ordenado como el menú es el índice del sistema, no el de ella); cada capítulo abre
  con lo que va a tener al final; un paso, una acción, y qué se ve después; prohibido
  `simplemente`, `obviamente` y `solo tenés que`, que el que está trabado lee como *el
  problema sos vos*; **nada es culpa del lector** —lo que suele salir mal se escribe como
  *esto pasa y así salís*, con el mensaje que va a ver de verdad—; y tampoco se lo
  infantiliza: una línea al final de la tarea nombrando lo que logró vale más que un emoji
  por título. Un archivo por audiencia, que abre de un pendrive sin red ni build, teclado y
  WCAG 2.2 AA, capturas **de la evidencia y recortadas**, nunca inventadas, porque la mentira
  visual es la que la gente cree. Y el freno que lo hace honesto: **solo se documenta lo que
  existe y pasó verificación**; lo construido sin verificar no tiene capítulo, lo planificado
  no tiene nada, y **ningún `TODO` llega a la página del usuario** — el hueco se le reporta a
  quien pidió el manual. Como el mockup, es a pedido y **si no se va a mantener no se crea**:
  vencido es el artefacto que más se cree justo porque parece terminado.

- **D38.** **Dos convenciones de código que salieron de usar NZT en un proyecto real, y van
  en la capa de stack, no en el kernel.** El usuario leyó el código generado de una entidad y
  encontró las dos:
  **(1) El constructor privado es vacío.** Uno que recibe cada campo es un segundo lugar que
  cambia cada vez que aparece una propiedad, no dice nada que `Create` no diga ya, y en la
  llamada `(guid, name, email, 0, null)` no le dice a nadie qué es cada valor. Queda
  `private Entidad() { }` —que además es con el que EF materializa (ya estaba escrito en la
  hoja de EF Core: *a parameterless private one is the simplest thing that works*)— y
  `Create` arma con **object initializer**, cada valor al lado del nombre de lo que es. Los
  setters privados se alcanzan desde ahí porque el código está adentro del tipo: no se hace
  público nada. En los value objects la misma regla implica `{ get; init; }` en vez de
  get-only, que sigue siendo inmutable para todo el que no sea `Create`.
  **(2) Los miembros van en un orden y cada grupo va junto.** En la entidad: constructor,
  `Rules`, `Errors`, **todas las propiedades juntas**, `Create`, y después el comportamiento.
  El caso real fue `PasswordHash` declarado abajo de `Create`, pegado al `DefinePassword` que
  lo usaba —el modo de falla es ese: la propiedad se escribe en la misma edición que el
  método que la necesitó, y queda donde terminó el archivo—. La regla general va en
  `nzt-build-csharp` como *agregar un miembro no es apendear al archivo*, con el orden de
  cualquier tipo; la de la entidad y la del value object, en sus hojas de dominio, que son
  las que mandan adentro del modelo. El modelo anémico también la lleva, sin métodos.
  **Dónde no van: en el kernel.** Son convenciones de C#, y el kernel no sabe de lenguajes.
  Se suma el caso `stack/entity-shape`, que mide las dos sobre código emitido.
- **D39.** **El `Result` se arma en cada return, nunca detrás de un método privado.** Tercer
  hallazgo del mismo proyecto: un `private static Result<SignInResponseDto> Rejected()` con
  tres llamadas. La regla va en `nzt-build-backend-dotnet-results-pattern` —que es la hoja
  dueña de cómo se usa `Result`— y se nombra en `nzt-build-backend-dotnet-use-cases`, que es
  donde el método se escribiría. Las razones, que son lo que impide que el modelo lo
  "mejore" de nuevo: **en un return lo que el lector vino a buscar son el status y el
  mensaje**, y el helper esconde justo esos dos detrás de un nombre; no ahorra nada, porque
  lo que reemplaza ya es una expresión; y **la repetición no es duplicación** —el mensaje
  vive una sola vez en el `Errors` de la entidad, lo que se repite es la decisión de
  contestar así, y son decisiones independientes que hoy coinciden: juntarlas es lo que
  sale caro el día que una cambia—. El corte que la hace aplicable sin daño: **es sobre el
  `Result`, no sobre los métodos privados** — uno que calcula algo está bien, uno que
  devuelve un `Result` no. Lo mide `stack/result-inline`, con un pedido de tres fallas
  distintas, que es donde el instinto de DRY del modelo se dispara.

- **D40.** **El estado se escribe para contexto cero, y cada corrida termina diciendo cómo
  viene el contexto.** Pedido del usuario después de usar NZT con Claude: *"podemos en
  cualquier momento limpiar contexto y continuar en limpio"*. Va **al kernel**, porque no es
  de una fase: es cómo termina cualquier corrida. Tres piezas:
  **(1) El estándar del estado deja de ser implícito.** No alcanza con escribir
  `Plan/state.json` al cerrar la unidad: se escribe **para un lector que no tiene nada de la
  conversación**, y la prueba es literal —si retomar necesitara algo que solo existe en el
  chat, va al archivo—. Sin eso, el archivo pasa el ojo del que sí se acuerda y falla con el
  que no, que es el único caso que importa.
  **(2) El reporte de cierre suma una línea: cómo viene el contexto y si conviene limpiar.**
  La escala es **sobre lo consumido**, y la fijó el usuario (es una elección, no una medición:
  D67): **debajo del 20% no se recomienda
  nada**, **desde el 20% se recomienda limpiar**, **en el 30% se dice que se está cerca de la
  zona donde las respuestas empeoran** —la *dumb zone*— y **pasado el 40% se recomienda
  fuerte**. Es deliberadamente temprano: la ventana llena degrada el trabajo mucho antes de
  agotarse, y lo que queda todavía tiene que alcanzar para lo que la próxima unidad va a
  leer. *(La primera redacción lo puso al revés —sobre contexto libre— y el usuario lo
  corrigió; queda anotado porque el número sin la palabra `consumido` es ambiguo y ya se leyó
  mal una vez.)*
  **(3) El número se lee de la señal que dé el host, y si no hay señal se dice** —nunca se
  inventa un porcentaje, que sería una recomendación apoyada en nada (C1: lo que cada
  proveedor expone no es igual, así que la regla es condicional y el comando concreto vive en
  el adapter, `/clear` en Claude Code). **El agente recomienda, no limpia**: limpiar es del
  usuario, y se aconseja siempre después de persistir, nunca antes. `nzt-plan` se alineó: el
  reporte siempre dice cómo viene, y *aconsejar limpiar* es otra cosa, con su ventana.
- **D41.** **Arquitectura deriva las preguntas antes de proponer, las resuelve por tipo, y
  el modo lo elige el usuario por feature.** Hallazgo de usar el set, no de leerlo: el
  diseño de F-001 del ToDoApp salió con **`Abierto: Nada` y cinco decisiones tomadas por el
  agente** —contratos compartidos, `Id` como orden, timeout de 10 s, sin índices— marcadas
  *(mía)* por invención de esa sesión, no por regla. El set conservaba de Temper el
  `QT-NN` y el *"se resuelve con el usuario"*, pero había perdido **las dos piezas que lo
  hacían funcionar**: derivar las preguntas **antes** de proponer, y la triage que dice
  cuál se pregunta. Sin ellas, *"escribí el diseño"* se cumple decidiendo todo solo. Cinco
  cosas quedan fijadas:
  **(1) Primero se derivan, después se propone.** De las reglas, las historias y el stack
  sale **toda** pregunta que el diseño tenga que contestar —incluido qué permite cada
  tercero y cómo falla— y se escribe como `QT-NN` abierta **antes** de redactar nada. Las
  notas técnicas son una entrada; la fuente son las reglas.
  **(2) Cada una se resuelve por su tipo, y el tipo no lo elige el usuario**: un **hecho
  verificable** se investiga en su fuente autoritativa y se responde con fuente y fecha
  —nunca se pregunta—; un **detalle dentro del alcance acordado** lo decide el agente y
  queda etiquetado; un **tradeoff o cambio material** se pregunta con opciones,
  consecuencias y recomendación —siempre, en cualquier modo—.
  **(3) El modo gobierna solo la fila del medio, y se elige por feature.** Después de
  derivar —nunca antes, o el usuario elige a ciegas sin saber si son 3 preguntas o 25— se
  dice cuántas salieron y de qué tipo, y se ofrecen tres: **propuestas** (el agente decide
  los detalles y el usuario objeta), **juntos** (los detalles también se preguntan,
  agrupados en una sola ronda, no sueltos) y **dictado** (el usuario dice cómo va). El
  dictado **no es taquigrafía**: se contrasta contra la spec y el stack y se levanta la
  contradicción antes de escribirla.
  **(4) El log es un archivo aparte y append-only**, con las etiquetas de origen que
  Temper tenía: respuesta del usuario, decisión del agente dentro del alcance, hecho
  investigado con su fuente, propuesta pendiente, observación. **El diseño es el presente y
  se reescribe; el log es la conversación y no se pisa** — un documento que se reescribe
  entero y además tiene que ser append-only en la mitad del cuerpo es la contradicción que
  D27 no había visto. `Docs/architecture-decisions.md` a nivel producto —los `QT-NN` del
  stack incluidos, como en Temper—, `design/decisions.md` por feature *(carpeta renombrada
  a `tech-design/` por D47)*, serie propia cada uno. La etiqueta de origen deja de ser invención de sesión y es regla.
  **(5) El diseño de feature es *ofrecido*, con criterio de cuándo se gana**: cruza
  componentes, mete un tercero, tiene estados con significado, tiene requisitos que
  condicionan la solución, o tiene alternativas cuyas consecuencias hay que explicar. Una
  pantalla derecha no se gana uno. **Lo que no cambia es el stack**: sigue obligatorio y
  sigue preguntando sus ejes como hasta ahora (D9); lo único que se mueve es dónde queda
  registrada la respuesta.
- **D42.** **Qué niveles de test se escriben es un opt-in del stack, y un campo ausente no
  habilita ninguno.** Hallazgo de usar el set: el agente armaba proyecto de integración,
  motor real y contenedores sin que nadie se lo hubiera pedido. La causa estaba en el
  contenido, no en el método: el TDD y el E2E ya eran opt-in duro, pero **la franja del
  medio era regla incondicional** —`nzt-build-tests` mandaba probar la base contra el motor
  real y tener su proyecto aparte, y la hoja .NET exigía `IntegrationTests`,
  `WebApplicationFactory` y motor de producción—. El *si hay tests* tampoco se preguntaba:
  se abría solo con la evidencia del repo, porque bastaba que existiera un proyecto de
  tests. Cinco cosas quedan fijadas:
  **(1) Un solo opt-in con niveles, no un eje por nivel**: unit, integración contra motor
  real, contenedores efímeros, API in-process y E2E, cada uno contestado. Se lee de un
  vistazo y obliga a contestarlos todos.
  **(2) Unit también se pregunta.** Que el repo tenga suite no es una decisión de escribir
  tests, igual que una herramienta instalada nunca fue una decisión de usarla.
  **(3) El campo ausente no habilita nada, tampoco unit.** El agente escribe el código,
  dice en una línea qué quedó sin cubrir y sigue: **nunca frena por esto**. Es la misma
  regla que el E2E ya tenía, ahora pareja para todos los niveles. En un componente que ya
  existe el caso es de transición y no de régimen, porque el stack es obligatorio y se
  escribe desde la evidencia **antes** de tocar su código: ahí se pregunta.
  **(4) El eje `Tests` es solo el framework.** El *si* y el *hasta dónde* viven en el
  opt-in. Estaban mezclados en la misma fila —`xUnit 3 + Testcontainers`—, y por esa mezcla
  la infraestructura entraba sin haber sido nunca una pregunta.
  **(5) La lista de opt-ins se enumera en `nzt-architecture-stack` y es cerrada.** Hasta
  hoy solo vivía dentro del ejemplo del documento, así que un stack escrito sin mirar el
  ejemplo no contestaba ninguno. **Lo que no cambia**: el `Test data` (D36) y el E2E siguen
  como están, y el TDD sigue siendo opt-in aparte porque decide el orden, no el nivel.
- **D43.** **Verify es QA: una fase aparte que corre después de implementar el incremento,
  y el criterio gana una marca `qa` que solo pone verify.** Hallazgo de usar el set: en un
  proyecto con solo unit (D42), el agente, en plena fase IMPLEMENT, cargó `nzt-verify` y
  escribió un guion manual de 16 escenarios con sus scripts SQL, en vez de seguir con la
  funcionalidad pendiente — que además era la que desbloqueaba la mitad de esos criterios.
  **La causa estaba en el contenido**: el orden de fases decía *build siempre, verify
  siempre*, pero no *cuándo*; el análisis va primero porque todo depende de él, y verify
  no tiene esa dependencia que lo empuje al final. Y la misma `✓` la marcaban dos fases,
  con implement obligado a no ponerla sin evidencia de ejecución: con los niveles apagados,
  la única evidencia posible era una prueba de aplicación. Cuatro cosas quedan fijadas:
  **(1) Verify corre después de implementar el incremento**, no story por story. El
  incremento es el tramo que el plan entrega junto —si no tiene más de uno, el producto—.
  El plan no intercala unidades de verify entre las de build **salvo que el usuario lo
  pida**; un bug reportado sigue su propio camino (reproducir, arreglar, verificar). El
  kernel cambia dos líneas por esto: el paso *Verify* del bucle pasa a ser *los chequeos que
  su fase posee* —decía *Test what you built*, y leído por unidad mandaba a testear en
  build— y la fila de `nzt-verify` en el ruteo dice *QA una vez construido el incremento*.
  **(2) La línea de cobertura suma `qa`**: `backend ✓ · frontend ✓ · qa —`. El área
  significa *construido*: compila y los tests que el stack habilitó pasan. `qa ✓` significa
  que pasaron los escenarios de **todas** las áreas con `✓` — si solo se probó la API, queda
  `qa —` y el archivo de testing dice qué falta. Una sola marca y no una por área porque se
  lee de un vistazo, y la regla de que una pantalla nunca pasa con evidencia de la API ya
  vive en el archivo de testing.
  **(3) Implement no diseña ni corre pruebas de aplicación.** Lo que los niveles del stack
  no cubren queda dicho como *no cubierto hasta QA* y el trabajo sigue: nada de guiones
  manuales, carpeta `testing/` ni datos de prueba en build.
  **(4) `[x]` pide áreas `✓`, `qa ✓` y la aceptación del usuario.** Tres dueños para tres
  preguntas: qué falta construir, qué falta probar, qué falta aceptar. **Lo que no cambia**:
  los tests que viajan con el código siguen siendo de build (D32, D42), y verify sigue
  diseñando antes de correr, con su plan aprobado y sus datos acordados (D36). Lo mide
  `evals/restraint/qa-unasked`: story que toca la base, stack con solo unit, plan con QA
  como unidad propia, y ni `nzt-verify` carga ni aparece un guion.
- **D44.** **Ningún paquete entra sin que el usuario lo confirme, el stack es una ficha
  liviana, y hasta dónde llega DDD es un opt-in.** Tres hallazgos de leer el stack que NZT
  generó en un proyecto real. **(1) Paquetes.** `nzt-build-dependencies` solo pedía
  decisión para lo que *cambia cómo se escribe el código*; el resto lo evaluaba e
  instalaba el agente — un cliente SMTP entró así. Ahora **todo paquete nuevo se propone
  con al menos una alternativa y su costo, y se instala recién confirmado**, técnicos
  incluidos (las abstracciones del framework también): eximir *lo técnico* le devuelve al
  agente la frontera que se quería sacarle. Para que no sea pesado, **los que necesita una
  unidad van en una sola pregunta**, y lo que no depende de ellos sigue. Actualizar o
  quitar un paquete ya adoptado no cambia: no es adoptar uno nuevo.
  **(2) Stack liviano.** El documento había crecido a documento de arquitectura: URLs de
  fuentes, fechas de soporte, la historia de un proyecto de tests borrado, la estructura de
  carpetas. La plantilla queda en cinco bloques: **tabla de ejes** (*Eje · Elección ·
  Cuándo*), **opt-ins de una línea**, **tabla de paquetes** (*Paquete · Para qué · Cuándo
  usarlo*, con la versión junto al nombre), **convenciones de una línea** y **una línea de
  evidencia**. Lo que sale tiene destino: fuentes e historia al log de decisiones con la
  `QT-NN` que respaldan, la estructura a la hoja de la arquitectura elegida. Se va la
  columna *Since* y la sección *Planned* se mantiene solo si tiene algo.
  **(3) Opt-in de DDD.** `nzt-architecture-domain` ya decía *value objects solo si el stack
  los adoptó*, pero el stack no tenía dónde decirlo. Con el eje de dominio en `ddd`, el
  stack pregunta **agregados · value objects · domain events · ids tipados**, cada uno con
  su costo, en una línea. **Lo que no está escrito no se usa**, igual que los niveles de
  test (D42). Es el quinto opt-in de la lista cerrada. Lo mide
  `evals/restraint/package-unasked`: una story que necesita mandar un email y el agente
  propone el paquete en vez de instalarlo.

- **D45.** **DTOs hijos propios de cada padre, con nombres simples y propiedades primero.**
  El usuario mostró un `ApplicationListItemDto` separado de `ListApplicationsResponseDto`
  y reportó otro DTO compartido en la raíz de una feature. La regla de anidación y de no
  compartir entre casos de uso ya existía; se refuerza sin atribuir el fallo a una causa
  no verificada. **Cada padre declara sus propios hijos aunque repitan campos**: no se
  extraen a la raíz, a `Dtos`, a `Shared` ni a otro padre para reutilizarlos. El contenedor
  genérico de paginación conserva su excepción; sus ítems pertenecen al caso de uso.
  **Primero las propiedades, después las declaraciones de DTOs anidados**, recursivamente:
  excepción explícita al orden general de C#. El padre termina en `RequestDto` o
  `ResponseDto`; el hijo, en concepto + `Dto`, sin repetir operación ni rol de colección:
  `ListApplicationsResponseDto.ApplicationDto`, no `ApplicationListItemDto`. Se corrigen
  el ejemplo de request y el checklist para que enseñen la misma regla.

- **D46.** **NZT se instala con una línea por proveedor, sin clonar el repo, sin .NET y sin
  dejar el instalador en la máquina.** El usuario lo pidió con el comando de Codex como
  modelo (`irm .../install.ps1 | iex`) y eligió, entre tres opciones, **un binario
  self-contained por plataforma publicado en GitHub Releases**. Las otras dos quedaron
  descartadas: una *global tool* de NuGet exige el SDK de .NET 10 a quien solo usa Codex o
  Claude, y un script que copie las skills él mismo reescribe en dos lenguajes el
  manifiesto, los marcadores y el backup, la misma divergencia que I2 contuvo con una
  comprobación. **Corregida antes de publicarse**: la primera versión instalaba el CLI en el
  PATH y abría el menú, y el usuario aclaró que el producto es NZT en un proveedor, no el
  instalador. Quedan **cuatro comandos** —`install-claude` e `install-codex`, en `.ps1` y
  `.sh`— que bajan el binario a una carpeta temporal, verifican el SHA256, corren
  `install --provider <id>` sin menú ni confirmación y lo borran; `NZT_UNINSTALL=1`
  desinstala con la misma línea. Las variantes salen de dos fuentes con
  `install/variants.sh`, y todo lo que se escribe en el proveedor sigue pasando por el CLI y
  sus reglas. Un tag `vX.Y.Z` que coincide con el `<Version>` del `.csproj` dispara el
  workflow que corre las mismas puertas que en local y publica seis binarios, `SHA256SUMS` y
  los cuatro scripts. **Sin trimming**: 38 MB contra 12 MB, porque el linker advierte sobre
  el manifiesto y sobre Spectre.Console y nada prueba el menú recortado; como cada corrida
  baja el binario entero, es lo primero a reabrir si el tamaño molesta. **Precondición
  abierta, del usuario: el repositorio tiene que ser público.** Detalle en la sección 10 de
  `specs/nzt-installer.md`.

- **D47.** **El diseño técnico y el diseño de pantalla de una feature viven en carpetas
  separadas: `tech-design/` y `ux-ui/`.** Hasta acá los dos caían en
  `Plan/specs/<feature>/design/`, y el nombre no decía cuál de los dos había adentro: un
  `design.md` de flujos y contratos al lado de un `screen-<slug>.md` y su mockup. El usuario
  pidió separarlos para que la carpeta diga qué contiene. **Siguen a nivel feature** y **los
  nombres de archivo no cambian**: `tech-design/design.md` y `tech-design/decisions.md` los
  escribe `nzt-architecture`; `ux-ui/screen-<slug>.md` y su `.html` los escribe `nzt-ux`.
  Los documentos de producto no se mueven: `Docs/architecture.md`, `Docs/design-system.md` y
  `Docs/ui-components.md` siguen donde estaban. **No migra proyectos existentes**: uno que
  ya tiene `design/` lo renombra a mano o en su próxima corrida.
  **[modify] 2026-11-01: D89.** `ux-ui/` pasa a `design/`, ahora que `tech-design/` dice qué
  contiene la otra; un proyecto con `ux-ui/` la sigue usando hasta que la mueva.

- **D48.** **Las excepciones que escapan de un caso de uso terminan en un único
  `GlobalExceptionHandler`, reconocidas solo por tipo.** Salió de leer FarmaPedia: cinco
  casos de uso con `catch (DbUpdateException) when (e.IsViolationOf(...))` y dos
  clasificadores en la raíz de `Persistence/` que comparaban `SqlException.Number` y
  buscaban el nombre del índice en el texto del mensaje. **No fue un desvío del modelo:**
  `ef-core-writes`, `ef-core-indexes`, `use-cases` y `persistence-direct` lo exigían ("the
  rule needs three parts"), y la regla se contradecía, porque prohibía el texto del mensaje
  y SQL Server no expone el nombre de la constraint en otro lado (verificado en la
  referencia de `SqlException` y en los mensajes 2601/2627). Además NZT nombraba
  *centralised handling* cinco veces sin decir cómo se construye. **Queda así:** lo
  esperado se chequea antes de escribir y vuelve como `Result` (unicidad con `AnyAsync`,
  versión comparada, dependientes contados), y la constraint de la base se queda; la
  carrera, la base caída y los bugs van a `nzt-build-backend-dotnet-exceptions`, una
  sola clase con un `switch` por tipo: `DbUpdateConcurrencyException` → 412,
  `DbUpdateException` → 500 con "no se pudo guardar", el resto → 500. **El usuario
  descartó** reconocer por códigos (2601/2627/547) por hardcodeados y una librería
  clasificadora (`EntityFrameworkCore.Exceptions`) por no depender de un tercero, y aceptó
  que la carrera de unicidad responda 500 con un mensaje claro en vez de 409. **También
  pidió** el texto de la excepción en la respuesta; quedó **solo en Development**, porque el
  mensaje útil es el del `InnerException` y expone tablas, constraints y valores, y Microsoft
  pide no mostrar detalle de excepciones en producción. La respuesta tiene la forma de un
  `Result` fallido (`Extensions["errors"]`), los textos base se acuerdan en cada proyecto, y
  `SuppressDiagnosticsCallback = _ => false` es obligatorio en .NET 10, que si no deja de
  loguear lo que un handler resolvió. **El try/catch en un caso de uso no se prohíbe**: el
  usuario lo quiere para casos excepcionales, nunca para traducir errores de base.
  **Descartado después, con el usuario: un `SaveChangesAsync` que devuelva `Result`.** Un
  override no puede cambiar `Task<int>`, y un método nuevo que capture adentro repite las
  dos respuestas del handler sin mejorar el mensaje (sin códigos no sabe qué constraint
  falló), suma un `if` de reenvío en cada caso de uso, y se traga la excepción antes de que
  el handler la loguee. Lo único que ganaba —reaccionar a un save fallido— ya lo cubre el
  catch de compensación que relanza. Se reabre solo con un caso que el handler no resuelva.

- **D49.** **Un solo `<Entity>MappingExtensions.cs` por entidad, a nivel feature, con el
  mapping a los DTOs de todas sus operaciones.** FarmaPedia tenía una copia de
  `AreaMappingExtensions` dentro de cada carpeta de operación (dos clases con el mismo
  nombre en namespaces distintos, y tres de `PageMappingExtensions`). **La regla ya era la
  correcta** —`csharp-dtos` nombra el archivo por la entidad y los tres árboles de
  arquitectura lo ponen un nivel arriba de la operación—, pero `vertical-slice` la
  contradecía en la misma página: *"lo compartido vive en `Domain/`, `Persistence/` o
  `Contracts/`, y lo que no entra en ninguno se escribe dos veces"*. El mapper no está en
  ninguno de esos tres, así que el modelo aplicó "se escribe dos veces". **Queda así:** el
  mapper de la entidad es la excepción declarada a esa regla, junto al endpoint de la
  feature, y `csharp-dtos` prohíbe copiarlo por operación o partirlo por caso de uso. En
  esta corrida se llegó a escribir el criterio opuesto (un mapper por caso de uso) por una
  lectura equivocada del pedido; el usuario lo corrigió antes de cerrarse la unidad y se
  revirtió.
- **D50.** **Las hojas son archivos de referencia de su router, y el listado son 14 skills.**
  Deroga D4 y deja obsoleta D20. Lo que la forzó: la doc de Claude Code (releída el
  2026-10-03) topea el listado al 1 % de la ventana, y una sesión real medía 1,0 %; con 111
  skills y 21.257 chars de listado, R1 dejó de ser un riesgo solo de Codex. Quedan como skill
  `nzt`, `nzt-plan`, `nzt-research`, los seis routers de fase, `nzt-learn` y los cuatro
  routers de área (`build-backend-dotnet`, `build-frontend-blazor`, `build-csharp`,
  `ship-backend-dotnet`); `build-csharp` queda porque la usan dos áreas, y `research` porque
  la nombra el guardrail del kernel. **La objeción de D4 sigue siendo cierta** —un puntero a
  un archivo es una lectura que puede no ocurrir— y se cubre así: la lectura es una fila de
  la tabla del router, tan instruida como el *load* de antes; las referencias van a un solo
  nivel (regla 12); y los evals pasan a medir la lectura del archivo en vez del disparo de la
  skill. **Lo que se pierde a cambio:** una hoja ya no se invoca como comando `/`, y el
  usuario decidió que no hace falta (el agente trabaja solo con skills). **Cómo se migra
  sin perder contenido:** cada hoja se mueve con cuatro cambios mecánicos —sin frontmatter,
  sin línea de R2, citas a otras hojas como mención, `## Contents` si pasa de 100 líneas— y
  un script falla si cambió cualquier otra línea. Opción descartada: mover solo la capa de
  stack (68 skills, ~11.500 chars), que seguía arriba del piso de Codex y no escalaba al
  sumar stacks. Decidido por el usuario; detalle en `Plan/mejoras/04-propuesta.md`.
- **D51.** *(Reemplazada por D58, 2026-10-10, salvo `stack-axes.md`, que D58 mantiene.)* **Hay un piso genérico de prácticas, liviano, debajo de la capa de stack.**
  `nzt-build/references/practices-backend.md` y `practices-frontend.md` llevan una línea por
  práctica con su porqué, sin código ni librerías: operación con una sola entrada, validar
  la forma en el borde, fallas esperadas como valor y excepciones a un manejador global,
  chequeo previo más restricción única, un solo guardado, paginar con orden único, la
  autoridad desde el servidor, componentes con parámetros que entran y eventos que salen,
  un envío que no corre dos veces, lo que llega al navegador es público, entre otras.
  `nzt-architecture/references/stack-axes.md` da los ejes del documento de stack con
  opciones genéricas. **Se leen cuando el componente no tiene router de área** para su
  tecnología; las referencias de .NET y Blazor no se tocan. Lo que la forzó: fuera de .NET el
  agente recibía método pero ninguna práctica, y la regla *seguí el código vecino* no ayuda
  en un proyecto nuevo. El riesgo es la deriva entre la línea genérica y la de área (R3), y
  lo cubre la regla 15. Decidido por el usuario.
- **D52.** **Una referencia leída no sobrevive a la compactación, y el kernel lo dice.** La
  doc de Claude Code documenta que al compactar se re-adjuntan las skills invocadas; un
  archivo leído es un resultado de herramienta y no vuelve. El kernel suma una línea: después
  de una compactación, volver a leer las referencias que usa la unidad en curso. Es la
  inversa de *no recargues una skill que ya tenés*, que sigue valiendo para las skills.
- **D53.** **Los disparadores de las hojas pasan a la cadena instruida: fila del kernel y
  fila del router.** Lo que la forzó: al migrar `plan-close`, "cerremos la feature" dejó de
  llegar a la guía de cierre (1 de 3 corridas), porque lo único que lo llevaba ahí era la
  descripción de la hoja, y ninguna fila del kernel cubría cerrar una feature. Antes de D50
  la hoja se alcanzaba 3 de 3, pero **siempre salteando el router**: funcionaba por
  description matching, que es justo de lo que el ruteo instruido (R2) existe para no
  depender. Opción descartada: agrandar la descripción del router (dio 3 de 3, pero vuelve a
  apoyar el ruteo en el matching y no escala a routers con 28 hojas en 250 chars). Con la
  fila del kernel ampliada: 5 de 6. Las trazas de las que fallaban mostraron el eslabón
  faltante: entraban por `nzt`, veían los marcadores de la spec y saltaban a
  `nzt-discovery-change` por su descripción, porque el *hand off* de `nzt` no nombraba el
  cierre. Con una línea ahí: **6 de 6 por `nzt` → `nzt-plan` → `close.md`**, verificado en
  las trazas. Regla 16 de §10. Decidido por el usuario el 2026-10-03.
- **D54.** **Cómo se lee una referencia lo dice el kernel una vez, no cada router.** Cuatro
  reglas en la sección Routing, cada una con la traza que la forzó: **(1)** la fila y toda su
  columna *Read with* se leen antes de la primera respuesta de la fase, aunque sea una
  pregunta (unidades 14 y 28: corridas que preguntaban sin haber leído la referencia; unidad
  20: 2 de 3 leían la fila y salteaban la base de EF Core); **(2)** se leen desde la carpeta
  de la skill, nunca buscándolas en el workspace con Glob; **(3)** un nombre `nzt-<x>` que no
  es una skill listada es una referencia: su router es el prefijo más largo que sí es skill
  (los nombres viejos que quedan dentro de las referencias, incluso de otro router, se
  resuelven así); **(4)** la línea de compactación de D52. Medido en la unidad 21: `tests.md`
  (*Read with* de `implement`) pasó de 0 de 3 a 3 de 3; `routing/ship` 0.89 → 1.00,
  `routing/build-story` 0.87 → 0.93. Las notas de nombres de cada router quedan: son la misma
  regla dicha localmente.
- **D55.** **La fila de Análisis del plan nombra la spec y sus historias.** Lo que la forzó:
  en uso real, un plan de producto nuevo puso en Análisis solo "la spec F-001", y al
  terminarla el agente propuso como cambio de plan dos unidades de historias que el método
  ya exigía (una unidad por historia). Las historias son parte del Análisis
  (`nzt-discovery`), no una fase aparte; cuántas son lo fija la spec, así que la fila las
  anuncia sin numerarlas, y cortarlas en unidades al cerrar la spec es seguir el plan, no
  apartarse de él. Una línea en *How the plan is shown* de `nzt-plan`. Caso
  `routing/plan-stories`. Decidido por el usuario el 2026-10-07.
- **D56.** **La definición de producto y el glosario son obligatorios, y el glosario se
  mantiene al día término por término.** Lo que la forzó: en uso real (un producto nuevo de
  una sola feature), el plan no incluyó el glosario porque nada lo exigía —el único
  obligatorio era el stack, y el glosario solo figuraba como ejemplo de unidad—, y build se
  frenó a mitad del código a preguntar cómo se llamaba "tarea", porque `nzt-build-csharp`
  le prohíbe inventar la traducción y la manda al glosario. **Había un consumidor sin
  productor**, el mismo patrón que D26 cerró para el modelo de dominio. Reglas: **(1)** en
  §6.1 los tres obligatorios son el stack, el producto y el glosario; **(2)** un producto
  nuevo escribe producto y glosario en Análisis antes de la primera spec, y uno existente
  sin ellos los obtiene cuando una feature entra a Análisis; **(3)** el glosario se
  actualiza en la misma unidad que introduce o cambia un término —spec, historia, cambio,
  cierre—, no en una unidad aparte al final; **(4)** un término que build necesita y no está
  en el glosario es una entrada que escribe discovery, no una pregunta de código ni un
  nombre inventado. La fila de Análisis de D55 suma el glosario. Decidido por el usuario el
  2026-10-08.
- **D57.** **`Docs/` se ordena por carpeta de tema, y el stack vive dentro de su
  componente.** Lo que la forzó: en uso real, los stacks quedaban en el `Docs/` de donde se
  abrió la sesión, sueltos junto al resto, y en un repositorio con varios componentes no
  viajaban con su proyecto. El orden: `Docs/Product/` (`product.md`, `analysis.md`,
  `history.md`), `Docs/Domain/` (`glossary.md`, `domain-model.md`, `context-map.md`),
  `Docs/Architecture/` (`architecture.md`, `architecture-decisions.md`, `adr/`, `rfc/`,
  `tech-debt.md`), `Docs/UX/` (`design-system.md`, `ui-components.md`), `Docs/Operations/`
  (`deployment.md`, `releases.md`) y `Docs/Manual/`. `history.md` va con el producto
  porque registra qué cambió el producto, no qué se desplegó (eso es `releases.md`). **El
  stack** *(qué es la carpeta del componente lo define D60)*: `<carpeta del componente>/Docs/Architecture/<área>-stack.md`, sin el nombre del
  componente en el archivo porque la carpeta ya lo dice. La carpeta la declara
  `Docs/Architecture/architecture.md` en la fila del componente, se fija al diseñarlo y es
  como el resto del set encuentra su stack. **Un documento fuera de este orden se propone
  reordenar y nunca se mueve sin aprobación**, y ninguna skill ni referencia describe un
  orden anterior: el set nombra solo el actual. Los nombres de archivo de D7, D10, D11, D25,
  D26, D29, D41 y T16 no cambian; cambian sus carpetas. Cómo quedó: el orden lo declara el
  router de arquitectura (dueño del inventario de `Docs/`), la regla de proponer y no mover
  es una línea del kernel porque vale en todas las fases, y `install/check-references.sh`
  aplica el mapa de rutas a la hoja de `main` antes de comparar, así una ruta movida no
  cuenta como pérdida y una mal movida sí (visto fallar con `glossary.md` en `Product/`).
  Decidido por el usuario el 2026-10-08.
  **[modify] 2026-11-01: D89.** `Docs/UX/` pasa a `Docs/Design/`; un proyecto que ya la tiene
  la sigue usando hasta que el usuario la mueva.
- **D58.** **La capa genérica es el principio, la de área es cómo se hace en esa tecnología,
  y lo genérico se extrae de las referencias de área.** Reemplaza a D51. Lo que la forzó: fuera
  de .NET y Blazor el agente recibía método pero ninguna práctica, mientras que las
  referencias de .NET ya estaban escritas casi en genérico (arquitecturas por roles,
  persistencia por "el handle del ORM"). Copiar el principio a un piso liviano dejaba la misma
  regla en dos lugares. Extraerla deja una sola versión. Inventario y destinos en
  `Plan/mejoras/07-extraccion.md`.
  - **Dónde vive:** 30 referencias en `nzt-build/references/`, con prefijo por grupo:
    `backend-` (arquitecturas, use cases, validación, resultados, errores, dominio,
    persistencia, API, seguridad), `data-` (acceso, consultas, paginación, escrituras,
    operaciones por criterio, mapeo, migraciones, índices), `code-` (reglas de código, DTOs,
    colecciones) y `frontend-` (arquitectura, componentes, formularios, rendering,
    performance). Lo genérico de los tests de .NET va a `tests.md`, que ya existe.
  - **Cómo se elige sin router de área:** dos índices, `references/practices-backend.md`
    (backend y datos) y `references/practices-frontend.md`, con los ejes del router de área y
    las filas por tarea. Los dos nombran las `code-*`. `nzt-build` los nombra en dos filas.
  - **Con router de área:** la fila del router .NET o Blazor pone la genérica en *Read with*,
    **obligatoria**. La referencia de área se queda con lo que no existe fuera de esa
    tecnología: los proyectos de la solution en clean y hexagonal, el `.csproj` único en
    vertical slice, el código C# exacto (Result, handler global), EF Core, ASP.NET Core y los
    render modes. **El código .NET que sale es el mismo de antes**. Lo que cambia es que otro
    lenguaje recibe la capa genérica.
  - **El límite entre capas en la genérica** es "el más fuerte que ofrezca el stack, escrito
    en su documento de stack", sin nombrar el mecanismo de cada lenguaje. Nombrarlo exige
    verificarlo en su fuente, y eso es de los ejes del stack (`stack-axes.md`, la parte de D51
    que esta decisión mantiene).
  - **Sin evals:** la no-pérdida se prueba sobre el texto. Por cada extracción, un script
    compara la referencia de área de `main` contra la recortada más su genérica (`install/check-extraction.sh`): toda regla
    que salió de la de área tiene que aparecer en la genérica, o queda listada para revisarla
    a mano. Un `check-references.sh` no sirve para esto: prueba movimientos mecánicos, no
    recortes.
  - Opciones descartadas: el piso liviano de D51 (deja la regla en dos lugares, R3), y
    borrar las referencias de arquitectura de .NET (se perderían los proyectos de la
    solution, que solo existen en .NET). Lo que se acepta: el agente .NET lee dos archivos
    donde antes leía uno, y la *Read with* salteada ya pasó con EF Core (unidad 20). Por eso
    es obligatoria desde la primera extracción. Volver atrás es reponer el texto de la
    genérica en cada referencia de área. Decidido por el usuario el 2026-10-09 y el
    2026-10-10, en las unidades 42 a 47.
- **D59.** **Los ejes del stack tienen una referencia propia, `stack-axes.md`, que no
  inventa opciones y pregunta con la herramienta del host si existe.** Es la parte de D51 que
  D58 mantuvo, con el alcance que pidió el usuario en `Plan/mejoras/06-capa-generica.md`.
  - **Una sola fuente de opciones:** los valores de cada eje son los de las tablas que
    seleccionan referencias en build (`practices-backend.md`, `practices-frontend.md` y la
    tabla de ejes excluyentes de cada router de área), escritos **exactamente** como ahí. Lo
    que la forzó: los routers comparan el texto del stack, y un sinónimo no selecciona nada.
    El ejemplo de `stack.md` tenía ese defecto (`minimal APIs` contra `minimal-apis`, y sin
    el eje `Result to HTTP`), y se corrigió en la misma unidad.
  - **Los ejes del router de área se suman a los genéricos**, y se preguntan recién cuando se
    eligió la tecnología. Así .NET conserva sus preguntas (endpoints y Result a HTTP; con EF
    Core, la persistencia directa o con repositorios sigue siendo un eje, genérico) y otra
    tecnología recibe solo los ejes genéricos. Un
    concepto que ninguna tabla ofrece es un hueco con su `QT-NN`, nunca un valor nuevo.
  - **Se lee siempre que se escribe un stack**, como *Read with* de la fila de `stack.md` en
    `nzt-architecture`. Esto cambia el "solo sin router de área" de D51: con router de área,
    la referencia manda a leer también la tabla de ese router.
  - **Formato de la pregunta, agnóstico del host:** la herramienta de preguntas de opción
    múltiple del host si la sesión la ofrece; si no, viñetas con la opción recomendada
    primero y su costo al lado. Una ronda, ordenada por dependencia. Verificado en la unidad
    61: Claude Code documenta `AskUserQuestion`, y Codex tiene `request_user_input` solo en
    Plan Mode (issue openai/codex#30150, abierto), así que nombrar cualquiera de las dos
    rompería en el otro host. Se reabre si Codex la habilita fuera de Plan Mode.
  - Riesgo aceptado: los costos de cada opción en `stack-axes.md` son una línea que resume
    la genérica de esa opción y pueden derivar de ella (R3); se revisan cuando se cambia una
    genérica de arquitectura, dominio o persistencia. Sin evals: el cambio en cómo pregunta
    architecture no se midió, por decisión del usuario. Pedido y aprobado por el usuario el
    2026-10-11 (unidades 61 y 62); el formato agnóstico y la fuente única de opciones son
    decisiones del agente dentro del alcance, por la verificación de la 61.
- **D60.** **La carpeta del componente es su raíz, nunca la de un proyecto de build.** Lo
  que la forzó: en un proyecto real (Todo, 2026-10-11) el stack quedó en
  `src/Todo.Api/Docs/Architecture/backend-stack.md`, y el agente hizo exactamente lo que el
  set decía: "carpeta del componente" no estaba definida, y el único ejemplo (D57, el árbol
  de §8, el router de arquitectura y `audit.md`) era `src/Pedidos.Api/`, la carpeta del
  `.csproj`. Ese ejemplo contradecía al propio set: los tests de .NET van en
  `tests/<Component>.UnitTests`, fuera del `.csproj`, y en clean o hexagonal un componente
  son cuatro proyectos, sin ninguno que lo represente.
  - **Definición:** la carpeta del componente es **su raíz, la que contiene todo lo suyo** —
    solution o manifiesto, `src/`, `tests/`— y ahí vive su `Docs/Architecture/`. **Con un
    solo componente en el repo, es la raíz del repo**, y el stack queda en
    `Docs/Architecture/<área>-stack.md`, junto al resto de `Docs/`.
  - **Con más de un componente, cada uno tiene su propia raíz** (`Pedidos.Api/`,
    `Pedidos.Web/`, cada una con su `src/`, `tests/` y `Docs/`), y una solution en la raíz
    del repo, si la hay, solo las referencia. Opción descartada: componentes que comparten
    `src/` y `tests/` con los stacks en el `Docs/` de la raíz, con el componente en el
    nombre del archivo (rompe la regla de D57 sobre el nombre y el stack deja de viajar con
    su proyecto). Se reabre si un proyecto real necesita componentes sin raíz propia.
  - **`architecture.md` es obligatorio desde el primer stack**, aunque sea una fila por
    componente con su carpeta: todo el set encuentra el stack a partir de esa fila, y en
    Todo no se escribió, así que la carpeta la fijó el ejemplo.
  - **La unidad de build y el componente son dos cosas.** El vertical slice decía "a
    component is one `.csproj`"; ahora dice un proyecto de build por componente, y su árbol
    nombra el proyecto aparte de la raíz.
  - Los `src/Pedidos.Api` de `nzt-ship-backend-dotnet` (contenedores, migraciones) no
    cambian: son rutas de proyecto para comandos `dotnet`, no carpetas de componente.
  - Pedido por el usuario el 2026-10-11 ("hacé estos cambios", sobre el análisis que
    recomendaba la opción a); aplicado en las unidades 64 a 66.
- **D61.** **El estado registra las fases de la corrida y su avance; `phase` desaparece.**
  Lo que la forzó: `nzt` elige las fases (§4 de su router) pero nada las guardaba, y
  `phase` se escribía una sola vez, al armar el plan, sin regla que la moviera. En este
  repo la corrida de la capa genérica terminó con `"phase": "architecture"` después de
  pasar por build, verify y ship, y el panel `nzt-state` no tenía cómo dibujar qué fases
  aplican ni cuáles terminaron.
  - **Forma:** `phases` es un array ordenado de `{ "name", "status" }`, con los estados de
    las unidades y como máximo una en `doing`. El orden es el del array; la actual, la que
    está en `doing`. Las reglas viven en §7.
  - **`phase` se saca**, porque repetía lo que dice el `doing` y dos lugares que dicen lo
    mismo se desincronizan (el mismo argumento de §7 para un solo archivo). Un estado
    viejo con `phase` y sin `phases` se reconcilia al retomar: la próxima escritura arma
    `phases` a partir del plan y de las unidades, y deja de escribir `phase`.
  - **La fase avanza al terminar su última unidad**, en la misma escritura que cierra la
    unidad, porque el estado se escribe al terminar unidades y no durante.
  - Opciones descartadas: una lista de nombres más `phase` como la actual (las terminadas
    se deducían del orden y `phase` seguía pudiendo quedar vieja), y una fase por unidad
    (B: las fases sin unidades todavía no aparecían, y el plan solo detalla la fase en
    curso).
  - Pedido y aprobado por el usuario el 2026-10-13: la opción A, como array ordenado con
    estado y fase actual, y sacar `phase`. Aplicado en las unidades 68 a 72.
  - **Ampliada por D62:** las unidades pasan a vivir dentro de su fase. La forma de
    `phases` y sus estados siguen como acá.
  - **Corregido el 2026-10-15 (unidad 163):** `core/kernel.md` no decía en forma explícita
    "como máximo una en `doing`" y se deducía de *"the one `doing`"*. La deducción falló:
    el estado de este repo quedó con `ux`, `build` y `verify` en `doing`, y el panel iluminó
    las tres con el personaje de UX (`specs/mods/nzt-state/testing/2026-10-15-dibujo.md`
    E-01). Ahora el kernel lo dice con las mismas palabras que esta spec. Pedido por el
    usuario.
- **D62.** **Cada unidad vive dentro de su fase, y una corrida nueva reescribe el estado.**
  Lo que la forzó: con D61 el panel `nzt-state` sabía qué fases tenía la corrida pero no a
  cuál pertenecía cada unidad, y `Plan/state.json` de este repo juntaba unas 65 unidades de
  varias corridas. El kernel dice que el estado nunca es un log, pero ninguna regla decía
  qué pasaba con las unidades al empezar una corrida nueva (`nzt` solo dice que es nueva),
  así que se acumulaban.
  - **Forma:** cada elemento de `phases` lleva su `units`, en orden de ejecución; la lista
    `units` de arriba desaparece. No se repite el nombre de la fase en cada unidad y
    ninguna unidad puede nombrar una fase que no esté. Los ids son únicos en el archivo.
  - **Corrida nueva:** con todo `done` o `dropped`, el estado se reescribe con la corrida
    nueva sola. Lo anterior vive en git y, si cerró una feature, en
    `Docs/Product/history.md` (D25), que es el log del proyecto. **Los ids siguen la
    numeración**, porque la spec y los documentos citan unidades por número y un id reusado
    las confundiría. Dentro de una corrida, nada `done` o `dropped` se borra (regla de
    `nzt-plan`).
  - Un estado con `units` arriba (D61 o anterior) se convierte en su próxima escritura,
    como un `phase` viejo: cada unidad va a la fase a la que pertenece. **Desde D65 el
    kernel ya no lo dice** (lo mismo para el `phase` de D61): el schema que muestra es el que
    se escribe, y el panel sigue leyendo los formatos viejos (RN-mod-lee-formatos-viejos).
  - Opción descartada: un campo `phase` en cada unidad (más carga en el archivo y una
    fase que puede no estar en `phases`).
  - Pedido por el usuario el 2026-10-13 ("que cada unidad vaya dentro de su fase", y la
    limpieza al empezar corrida sobre la propuesta del agente, con los ids siguiendo).
    Aplicado en las unidades 73 a 77; en este repo se limpió el estado dejando 68-72,
    todavía sin commit, y 1-67 quedan en `e29d0c6`.
- **D63.** **NZT trae mods: una capa aparte, opcional y solo de Claude Code.** Lo que la
  forzó: el panel `nzt-state` se construyó fuera del repo (unidades 71 y 76) y el usuario
  pidió que viva en el repo, documentado, y que más adelante el instalador ofrezca instalar
  los mods globales. Eso choca con dos cosas escritas: la sección 2 dejaba *"automatizaciones
  por hooks o MCP"* fuera de v1, y `specs/nzt-installer.md` dice *"sin plugins"*.
  - **Cómo se resuelve:** el núcleo sigue sin plugins y sin hooks. Un mod es una capa aparte
    —`mods/`, con su propia spec en `specs/nzt-mods.md`— que **el método no necesita**: nada
    del kernel ni de las skills le pide algo que solo un mod da. La sección 2 lo dice ahora.
  - **Solo Claude Code:** un mod es un plugin de *function hooks*, y Codex no tiene mods
    (sus plugins traen skills, MCP y apps, no código que dibuje en la interfaz; revisado
    el 2026-10-16, ver D24).
  - **Un mod lee los artefactos de NZT y no los escribe** (propuesta del agente, aceptada
    por el usuario el 2026-10-14): el estado tiene un solo dueño.
  - **El repo es el marketplace de los mods** (`.claude-plugin/marketplace.json` en la
    raíz), y cada mod lleva su propia versión (aceptadas por el usuario el 2026-10-14).
  - **Cada mod lleva su spec en `specs/mods/<mod>/spec.md`, su `README.md` y su fila en el
    catálogo** (`specs/nzt-mods.md` sección 5 y `README.md` del repo), pedido por el usuario.
  - **El nombre de la carpeta es el del plugin:** el panel queda `nzt-state` (usuario).
  - Opción descartada: meter el mod en `dist/plugin/`. Ese plugin existe solo para los evals
    (D23) y no se instala nunca.
  - Pedido por el usuario el 2026-10-13. Spec en la unidad 78; traer el mod y el catálogo,
    unidades 80 y 81; el instalador queda para otra corrida.
- **D64.** **Una pregunta con opciones se hace con la tool de preguntas del host cuando la
  sesión la ofrece, y si no, en una lista numerada con forma fija.** Lo que la forzó: el
  agente tiraba las `Q-NN` y `QT-NN` en el chat como prosa, varias juntas, y el usuario
  tenía que escribir un prompt para contestarlas una por una. Solo `stack-axes.md` pedía la
  tool del host, y solo para los ejes del stack. Pedido del usuario el 2026-10-17: *"corregir
  para que el agente pueda usar la tool de questions asi es transparente en cualquier
  proveedor"*.
  - **Dónde vive:** en el kernel, porque se pregunta en todas las fases (`Q-NN` en análisis,
    UX y verificación, `QT-NN` en arquitectura, los ejes del stack). Cada adapter nombra la
    tool de su host y sus límites; el kernel no nombra ninguna. `stack-axes.md` deja su
    versión propia y remite al kernel, para que no haya dos reglas sobre lo mismo.
  - **Con tool:** una pregunta por decisión, con su id al principio (`QT-03 · ¿…?`); las
    opciones con su consecuencia en la descripción, la recomendada primero y marcada. Si la
    tool toma pocas preguntas por vez, van varias llamadas seguidas, no una ronda por
    respuesta. Lo que no entra en la tool —lo investigado, el contexto largo— queda en el
    log y la pregunta lo cita.
  - **Sin tool:** un solo bloque, una pregunta por número con su id y en negrita
    (`**QT-03 · ¿…?**`), y debajo una viñeta por opción (`- **A · <opción>** — <consecuencia>`),
    la recomendada primero y marcada *(recomendada)*. Es la misma forma que ya usan los logs
    de preguntas. El mod `nzt-questions` la reconoce como un caso de su forma genérica (una
    línea que termina en `?` y la lista debajo), sin depender de ella ni la regla de él.
  - **La tool es cómo se pregunta, no dónde queda el registro.** La pregunta se escribe en
    su log antes de preguntarla y la respuesta se anota al llegar, como hasta ahora; una
    respuesta que llega por la tool se registra igual que una escrita en el chat.
  - **Una pregunta abierta, sin opciones, va como texto**: la tool es para elegir entre
    alternativas, no para todo lo que se pregunta.
  - **Lo que se investigó (unidad 197, leído el 2026-10-17):**
    - **Claude Code 2.1.302 · `AskUserQuestion`.** *documented*
      ([tools reference](https://code.claude.com/docs/en/tools-reference)): preguntas de
      opción múltiple, una fila **Other** y un campo de notas para texto libre, no pide
      permiso y la pregunta queda abierta hasta que se contesta (salvo `askUserQuestionTimeout`).
      *documented* (el esquema de la tool en los tipos que trae la 2.1.302): 1 a 4 preguntas
      por llamada, 2 a 4 opciones por pregunta con `label` y `description`, `header` de hasta
      12 caracteres, `multiSelect` y `preview` opcionales; **Other** lo agrega la tool.
    - **Codex CLI 0.154.0 · `request_user_input`.** *documented* (código oficial,
      [`openai/codex`](https://github.com/openai/codex) `main`,
      `codex-rs/core/src/tools/handlers/request_user_input.rs` y
      `codex-rs/protocol/src/request_user_input.rs`): bloquea al agente solo en modo Plan,
      la usa solo el hilo principal (no un subagente), y cada pregunta lleva `id`, `header`,
      `question`, `options` opcionales con `label` y `description`, `isOther` e `isSecret`.
      *observed* (`codex features list` en esta máquina): el flag
      `default_mode_request_user_input` está *under development* y apagado, así que en el
      modo por defecto el agente no tiene la tool. *unverified*: el tope de 1 a 3 preguntas
      por llamada (solo en un espejo del código y en artículos) y qué contesta la tool fuera
      de Plan sin el flag. No hay página oficial de la doc de Codex que la describa.
    - *inferred:* en Codex la regla cae casi siempre a la lista numerada, salvo en modo Plan o
      con el flag. Por eso la forma fija sin tool importa tanto como la tool.
  - **Fuera de alcance:** que el instalador active el flag de Codex. Escribiría la
    configuración del usuario por una función que Codex marca en desarrollo, por el mismo
    argumento de QT-03 B en `specs/nzt-mods.md`; el `README.md` lo explica. Propuesta del
    agente, aceptada por el usuario el 2026-10-17.
  - **Límite:** `CLAUDE.md` y `AGENTS.md` tenían 198 líneas (contado el 2026-10-17) y el tope
    es 200 (C3). Lo resolvió el recorte de D65: bajaron a 189 y la regla entra entera en el
    kernel, con su forma.
  - Opción descartada: que el mod `nzt-questions` registre su propia tool de preguntas. En
    Claude Code el agente tendría dos tools para lo mismo, y en Codex no existiría. Propuesta
    del agente, aceptada por el usuario el 2026-10-17 (opción C').
  - Spec en la unidad 198; el kernel, los adapters y `stack-axes.md`, en la unidad 206
    (2026-10-17): sección *Questions* del kernel, una línea por adapter con la tool y sus
    límites, y `stack-axes.md` remite a ella. `CLAUDE.md` y `AGENTS.md` quedaron en 200 líneas,
    el tope de C3: la próxima regla del kernel necesita recortar antes.
- **D65.** **El kernel dice cada regla una vez.** Lo que la forzó: D64 necesitaba lugar y
  `CLAUDE.md` estaba en 198 de 200 líneas (C3). El usuario pidió revisar el kernel *"a ver si
  tiene algo repetitivo o que este de mas, el funcionamiento debe ser tal cual no debemos
  perder nada"* (2026-10-17). Se sacaron solo frases que repetían otra que queda:
  - **La intro** enumeraba el loop que viene debajo; queda *"in the loop below"*.
  - **Esperar la aprobación** estaba en el loop, en `approved` y en las hard rules; el loop
    dice *"wait for approval"* y el candado sigue en `approved` y en la hard rule.
  - **La sección *Entry point*** repetía la fila de `nzt` en Routing y el *"which phases you
    are skipping and why"* del loop; la fila dice ahora *"classifying the request and picking
    its phases"*.
  - **"Specs are written one at a time"** repetía la hard rule *"Never write more than one spec
    in a unit"*.
  - **Decir el contexto al cerrar** estaba en el cierre de la unidad y al principio de
    *Context*; queda en el cierre, con *"and whether clearing the session is worth it"*.
  - **"Write `autonomy` when the user selects it, not when they approve the plan"** repetía
    *"approving the plan does not select it"*.
  - **"Write the file when a unit ends"** repetía el orden del cierre y la hard rule; queda
    *"Never write the file while you are inside a unit"*.
  - **La conversión de estados viejos** (`phase` de D61, `units` arriba de D62): era una nota
    de un formato que cambió. El agente escribe el schema que el kernel le muestra, y un estado
    viejo lo sigue leyendo el panel (RN-mod-lee-formatos-viejos). Lo pidió el usuario: *"no
    deberia estar, no? es como una nota de un funcionamiento que cambio"*.
  - **Se quedan** las justificaciones (*"a made up number is a recommendation resting on
    nothing"* y las otras): ayudan a que la regla se cumpla. También *"Keep every line to one
    line"*, que cubre `detail` y `notes`, no solo `do`.
  - **Opción descartada: pasar el schema de `Plan/state.json` a una referencia** (propuesta del
    usuario, 2026-10-17). El estado se escribe al cerrar cada unidad, también en trabajo chico
    que no carga `nzt-plan`. Sin el schema delante, el agente escribiría el formato de memoria,
    y si ese formato se corre, `nzt-state` y la retomada se rompen. Son 13 líneas, y es el
    contrato que más se usa. Objetado por el agente; el usuario siguió sin pedirlo de nuevo
    (*"ok perfecto entonces, con esto hecho"*, 2026-10-17), así que el schema queda en el kernel.
  - **Opción descartada: que Claude Code lea `AGENTS.md` en lugar de `CLAUDE.md`** (pregunta del
    usuario, 2026-10-17). *documented* ([memoria de Claude Code](https://code.claude.com/docs/en/memory),
    leído el 2026-10-17): desde la 2.1.277 lee el `AGENTS.md` de la carpeta de trabajo y las de
    arriba, y **solo si no hay un `CLAUDE.md` o `CLAUDE.local.md`** ahí; el `~/.claude/CLAUDE.md`
    global carga siempre. NZT se instala para toda la máquina, así que en un `AGENTS.md` se
    perdería en cualquier proyecto con su propio `CLAUDE.md`. Codex lee otra ruta
    (`~/.codex/AGENTS.md`) y los adapters dicen cosas distintas, así que tampoco unifica nada; el
    build ya arma los dos desde `core/kernel.md` (C3). Descartado por el usuario el 2026-10-17.
  - **Resultado:** `core/kernel.md` de 185 a 176 líneas; `CLAUDE.md` y `AGENTS.md` de 198 a 189.
    Unidad 212. La verificación con los evals de ruteo va en la 210.
- **D66.** **`AsNoTracking()` va donde el resultado trae entidades, no en toda lectura.** Lo
  que la forzó: un análisis externo de NZT (2026-10-21) señaló que `ef-core.md` pedía el
  marcador también para contar, con un motivo falso (*"no snapshot"*: `CountAsync` no
  materializa nada), y `ef-core-queries.md` se contradecía — *"nothing to untrack"* y el
  marcador en la línea siguiente. *documented* ([Tracking vs. No-Tracking Queries](https://learn.microsoft.com/en-us/ef/core/querying/tracking),
  leído el 2026-10-21): *"If the result set doesn't contain any entity types, then no tracking
  is done"*, y una proyección que pasa la entidad a un método del cliente la materializa y la
  rastrea.
  - **La regla:** cargar entidades para mostrar o exportar lleva el marcador; proyectar a DTO,
    contar, `Any` y agregados no; la proyección que entrega la entidad a un método del cliente
    se reescribe con las columnas, y si no se puede, lleva el marcador. Cargar para modificar
    sigue sin marcador.
  - **Lo que no cambió:** el tracking global sigue como viene (13.4 #9). El modo de falla del
    marcador de más es ruido; el de apagarlo global, pérdida de datos.
  - **El eval lo sigue:** `stack/ef-listado` pedía `AsNoTracking()` en un listado proyectado;
    ahora pide que no esté (`no-tracking-marker-on-a-projection`). Sin correr. Unidad 304.
- **D67.** **La escala de contexto se presenta como lo que es: una elección de NZT, no una
  medición.** Lo que la forzó: el mismo análisis externo (2026-10-21) marcó que el kernel
  afirmaba *"that is where the answers start getting worse"* sobre el 30% sin fuente, que es
  lo que su propio guardrail *"Say what you checked"* prohíbe.
  - **Qué cambió:** el kernel dice que la escala es *"NZT's choice, not a measurement"*, saca
    la afirmación del 30% y la de que la ventana llena degrada el trabajo, y deja la razón que
    no depende de una medición: lo que queda tiene que alcanzar para la próxima unidad, y un
    freno que no se dio no se recupera. Mismo número de líneas; `CLAUDE.md` sigue en 200 (C3).
  - **Lo que no cambió:** los umbrales 20/30/40 sobre lo consumido, que fijó el usuario (D40).
  - **Abierto, no adoptado:** el análisis señaló que el 20% de 1M no es el 20% de 200k, y
    propuso expresarlo en tokens absolutos o medirlo con evals. Cambiar los números es
    decisión del usuario; queda anotado para cuando haya una medición. Unidad 306.
- **D68.** **Después de escribir el estado, el agente corre `nzt-ai state check` donde esté
  instalado.** Revisada por D94: ahora corre el script de `nzt-plan`. Lo que la forzó: el análisis externo (2026-10-21) marcó que los invariantes de
  `Plan/state.json` —un `doing` por nivel, ids únicos, cerrar una fase abre la siguiente— los
  sostiene el modelo a mano y nada los revisa. El usuario eligió que lo revise el CLI, y que
  el CLI quede instalado como `nzt-ai` (sección 12 de `specs/nzt-installer.md`).
  - **Dónde vive:** en la hard rule del estado, en el kernel, porque el estado se escribe
    también en trabajo chico que no carga `nzt-plan` (D65). No se repite en `nzt-plan`: cada
    regla una vez, y `nzt-plan` está en 200 líneas.
  - **"Donde esté instalado":** una instalación vieja, o una corrida desde el repo, no tiene
    `nzt-ai`; el agente no frena por eso.
  - **C3 sigue en 200** (QT-22, usuario 2026-10-21): la recomendación de Anthropic es *"target
    under 200 lines per CLAUDE.md file"* por adherencia ([memoria de Claude Code](https://code.claude.com/docs/en/memory),
    leído el 2026-10-21). Subir a 250 se consideró y se descartó. La línea entró recortando
    la introducción de *State*, que perdió *"the user"* sin perder sentido. Unidad 311.
- **D69.** **El kernel nombra las seis fases válidas, y `state check` rechaza cualquier otra.**
  Lo que la forzó: el agente escribió una fase `discusion` en `Plan/state.json` y el panel
  avisó *"«discusion» no es una fase de NZT"* (usuario, 2026-10-21). Es la segunda vez:
  `RN-panel-fase-desconocida` nació el 2026-10-19 por lo mismo. La causa: la lista cerrada
  vivía solo en la sección 4 de `nzt`, y el kernel decía *"the phases `nzt` chose"* sin
  nombrarlas; un agente que entra directo a `nzt-plan` no tiene de dónde sacarlas.
  - **Qué cambió:** la línea de `phases` del kernel dice *"named `analysis`, `architecture`,
    `ux`, `build`, `verify` or `ship` and no other"*. Entró recortando *"You recommend; you
    never clear"* a una línea; C3 sigue en 200.
  - **El modo profesor no suma una fase:** sus *learning phases* no van a `Plan/state.json`
    (`nzt-learn`, *"there is no entry in `Plan/state.json`"*).
  - **El panel no cambia:** sigue leyendo sinónimos (`discovery`, `qa`) de estados viejos; el
    kernel pide solo los nombres canónicos. Unidades 312 y 313.
- **D70.** **NZT delega solo exploración de lectura, en un subagente propio, y construir en
  paralelo queda para un análisis aparte.** Lo que la forzó: el análisis externo (2026-10-21)
  señaló la contradicción entre cuidar el contexto (20/30/40) y prohibir subagentes (*"Never
  delegate NZT work to subagents"*). Discutido con el usuario en la unidad 307.
  - **Lo verificado** ([Claude Code](https://code.claude.com/docs/en/sub-agents) y
    [Codex](https://learn.chatgpt.com/codex/agent-configuration/subagents), leídos el
    2026-10-21): en Claude Code un subagente propio **carga los `CLAUDE.md`** salvo
    `omitClaudeMd` (Explore y Plan no), precarga skills enteras con `skills`, puede invocar las
    demás, anida hasta tres niveles por defecto, y Claude delega solo según el `description`;
    `isolation: worktree` existe. En Codex los agentes son TOML en `~/.codex/agents/`, las
    skills se heredan del padre y local delega solo si se le pide o lo pide un `AGENTS.md` o
    una skill. **Sin verificar:** si un subagente de Codex carga el `AGENTS.md` global.
  - **Delegar no ahorra tokens totales** (el subagente lee lo mismo, y el principal relee lo
    citado): ahorra la ventana principal, y plata si usa un modelo más chico. Razonamiento del
    agente, aceptado por el usuario.
  - **QT-27 · Alcance:** ahora, un explorador de solo lectura; construir en paralelo (qué
    cuenta como "no se pisan", worktrees, quién mergea y verifica) es un análisis propio,
    después. Lo que lo frena hoy: una unidad por vez, un solo escritor del estado, archivos
    compartidos (glosario, stack, `.csproj`, snapshot de migraciones).
  - **QT-28 · Quién decide:** el agente propone en el plan qué delega y por qué, y el usuario
    lo aprueba, como la autonomía. Explorar en las situaciones nombradas —relevar código
    desconocido, buscar en todo el repo sin saber dónde, investigar en la web— no pasa por el
    plan, porque solo lee. Lo que devuelve es un puntero que se lee antes de afirmarse.
  - **QT-29 · Cómo se definen:** un archivo corto por subagente, con su rol, sin el kernel
    (`omitClaudeMd`) y con las skills de NZT precargadas o heredadas; el método no se duplica.
    Los instala el instalador en los dos proveedores. Un subagente con el kernel cargado se
    comportaría como principal: leería el estado, propondría un plan, esperaría aprobación.
  - Respuestas del usuario: A en las tres, 2026-10-21. Pendiente de construir.
- **D71.** **Spec de la delegación: `nzt-delegate`, `nzt-explorer` y el modo en el estado.**
  Unidad 314; baja D70 a reglas que construyen las unidades 315 a 318. QT-30 y QT-31: plan
  aprobado tal cual, una unidad por vez (usuario, 2026-10-21).
  - **Los modos (QT-32, usuario: A).** `auto`: explora sin preguntar en las tres situaciones
    de D70 —relevar código desconocido, buscar en todo el repo sin saber dónde, investigar en
    la web—. `ask`: antes de cada exploración pregunta qué va a explorar y por qué, con la
    herramienta de preguntas, y sin un sí no delega. `off`: no delega, como antes de D70.
    Hoy solo se delega explorar; lo demás espera el análisis de construir en paralelo (D70
    QT-27).
  - **El campo (QT-35, usuario: A).** `"delegation": "auto" | "ask" | "off"`, en la raíz de
    `Plan/state.json`. Vale por proyecto. **Una corrida nueva lo conserva**: es la única
    clave que la reescritura del estado no borra. Lo cambia el usuario, a mano, desde el mod
    o pidiéndoselo al agente; el agente nunca lo cambia por su cuenta. Sin campo, o sin
    `Plan/state.json`, rige `ask` (QT-33, usuario: A): ningún proyecto existente pasa a
    delegar sin aviso. Un valor fuera de los tres lo rechaza `nzt-ai state check`, y el
    agente aplica `ask` mientras tanto.
  - **`nzt-delegate`, skill de primer nivel como `nzt-research` (D31).** La nombra la hard
    rule del kernel, no la tabla de ruteo, porque cualquier fase puede necesitarla. Dice:
    - *Cuándo*: solo en las tres situaciones, solo para leer, y solo si el modo lo permite.
      La unidad, el estado, las preguntas al usuario y toda decisión se quedan con el agente
      principal. Una lectura que el principal va a necesitar entera, la hace él.
    - *El prompt*: la pregunta y la decisión que alimenta, dónde mirar y dónde no, lo que ya
      se sabe, el formato de vuelta y cuándo parar. El subagente no vio la conversación: lo
      que no esté en el prompt no lo sabe.
    - *Lo que vuelve*: punteros (`ruta:línea` o URL) con una afirmación de una línea cada
      uno, marcada como vista o inferida, y lo que no miró. **Un puntero se lee antes de
      afirmarse** (D70): lo que vuelve es evidencia del subagente, no del principal.
  - **`nzt-explorer` (D70 QT-29).** Un archivo corto por proveedor (`~/.claude/agents/nzt-explorer.md`
    y `~/.codex/agents/nzt-explorer.toml`): el rol, las herramientas de solo lectura y la
    forma de la respuesta. Sin el kernel (`omitClaudeMd: true` en Claude Code) y con
    `nzt-research` precargada para la web; el método de leer código lo trae el prompt. Su
    texto dice que no corre el bucle de NZT: no lee ni escribe `Plan/state.json`, no propone
    planes, no pregunta. Su `description` limita la delegación automática de Claude Code a
    lo que el modo permite.
    - **Modelo (QT-34):** el mismo que el principal (`inherit`) por ahora. El usuario abrió
      *model routing*: elegir el modelo según la tarea. Se reabre cuando se analice construir
      en paralelo o cuando haya una medición de cuánto cuesta el explorador.
    - **Lo que leyó la 316** ([Claude Code](https://code.claude.com/docs/en/sub-agents),
      [Codex](https://learn.chatgpt.com/codex/agent-configuration/subagents) y su
      [AGENTS.md](https://learn.chatgpt.com/codex/guides/agents-md), leídos el 2026-10-21):
      en Claude Code, `tools: Read, Grep, Glob, WebFetch, WebSearch`, `model: inherit`,
      `skills: [nzt-research]` y `omitClaudeMd: true` están documentados. En Codex **no hay
      equivalente de `omitClaudeMd`** ni clave documentada que apague el `AGENTS.md`, y
      **no hay solo lectura por configuración**: *"Custom agent instructions can ask an agent
      to avoid edits, but they don't create a separate read-only sandbox"* (`sandbox_mode` no
      se puede pisar desde el agente). Las dos cosas quedan en `developer_instructions`, que
      dice que no corre el bucle *aunque las instrucciones de NZT estén cargadas*. Sin
      `model`, hereda el del padre (documentado). Apagar `features.shell_tool` lo dejaría sin
      forma de leer, así que no se apaga.
    - **En Codex se llama `nzt_explorer`**: la doc no dice qué caracteres acepta `name`, y
      sus ejemplos usan guion bajo (`pr_explorer`, en `pr-explorer.toml`). El archivo sigue
      siendo `nzt-explorer.toml`. Que `~/.codex/agents` siga a `CODEX_HOME` es inferido.
  - **La hard rule (317).** Reemplaza *"Never delegate NZT work to subagents"* por una que
    permite delegar solo exploración de lectura, según el modo del proyecto y `nzt-delegate`,
    con la unidad, el estado y las decisiones en el principal. El schema del kernel suma
    `delegation`, y la regla de la corrida nueva dice que lo conserva. Todo dentro de 200 (C3).
    Hecho: *"Delegate only reading, per `nzt-delegate`; the unit, the state and decisions stay
    yours"*, en una línea; los modos viven en la skill, no en el kernel. `core/kernel.md` de
    187 a 186 líneas, `CLAUDE.md` y `AGENTS.md` en 200; `state check` rechaza otro valor.
  - **El mod (318).** `nzt-state` suma una fila *Delegar* debajo de *Plan* y *Modo*: muestra
    el modo, con `ask` cuando no hay campo. Un click lo cambia `auto → ask → off → auto` y
    escribe solo esa clave, sin tocar el resto del archivo. Hecho en `nzt-state` 0.8.0
    (RN-panel-delegar, unidad 318): sin estado no hay fila, porque el panel no dibuja Plan ni
    Modo; reemplaza la propuesta de que el clic no hiciera nada. `RN-mod-lee-no-escribe`
    queda con esa única excepción.
  - **Fuera de alcance:** construir en paralelo (D70 QT-27), *model routing* (QT-34) y usar
    el Explore propio de Claude Code en lugar de `nzt-explorer` (D70 QT-29 eligió un agente
    propio). El set pasa de 14 a 15 skills; la 315 mide el listado contra el piso de Codex
    (D50).
- **D72.** **NZT trabaja por tramos: la entrega 1 se define en el producto, las historias se
  detallan por entrega y el QA cierra cada tramo.** Lo que la forzó: la crítica de que SDD es
  cascada (usuario, 2026-10-23). El análisis del set mostró que NZT no es cascada a nivel
  proyecto —fases elegidas por pedido, plan de lo visible, alcance en dos direcciones— pero
  sí una mini-cascada dentro de cada corrida: el análisis cierra con **todas** las historias
  escritas (`nzt-discovery`, *Done when*), las fases van en orden con una sola en curso, y el
  QA espera al final del incremento (D43). La unidad de entrega por defecto era la feature,
  no la historia, y no había concepto de MVP ni de primera entrega. Discutido con el
  usuario el 2026-10-23, unidad 320; todo lo de abajo es acuerdo suyo salvo lo marcado.
  - **Lo leído** (2026-10-23): el [Manifiesto ágil](https://agilemanifesto.org/principles.html)
    (*"early and continuous delivery of valuable software"*, *"maximizing the amount of work
    not done"*); la [Scrum Guide 2020](https://scrumguides.org/scrum-guide.html) (*"an
    Increment may be delivered to stakeholders prior to the end of the Sprint"*, el
    refinamiento es continuo, nada entra sin la *Definition of Done*); [Jeffries](https://ronjeffries.com/xprog/articles/expcardconversationconfirmation/)
    (la tarjeta es *"a token representing the requirement"*); [Wake](https://xp123.com/invest-in-good-stories-and-smart-tasks/)
    (INVEST, corte vertical de la torta); [Patton](https://www.jpattonassociates.com/the-new-backlog/)
    (un backlog plano es *"a bag of context-free mulch"*; columna vertebral, líneas de
    entrega, *walking skeleton* primero); [Ries](http://www.startuplessonslearned.com/2009/08/minimum-viable-product-guide.html)
    (el MVP es para *"validated learning"*, no siempre hace falta); [Kniberg](https://blog.crisp.se/2016/01/25/henrikkniberg/making-sense-of-mvp)
    (*earliest testable / usable / lovable*). El *walking skeleton* de Cockburn solo se
    encontró en fuentes secundarias: sin verificar en su fuente.
  - **Vocabulario.** **Tramo** (*slice*): lo que el plan corta para recorrer de punta a
    punta, con sus propias fases. **Por defecto una feature**; el plan la parte en tramos
    más chicos —una historia, o las mínimas que se prueban juntas— cuando conviene feedback
    más rápido, y el usuario lo aprueba (QT-01, usuario 2026-10-23). Es la rebanada vertical
    que el QA cierra. **Entrega**
    (*delivery*): los tramos que juntos cumplen un objetivo del producto; la **entrega 1**
    es el MVP. *Release* no se usa para esto porque es de `nzt-ship`. El **incremento** de
    D43 se retira en favor de *tramo*: dos palabras para lo mismo se desincronizan.
  - **La entrega 1 vive en el producto.** `product.md` suma la sección de la entrega 1: qué
    historias o capacidades entran, para qué objetivo, y cómo se sabe que funcionó (el
    *Known by* del objetivo). Al definirla, la pregunta es **"¿hay algo que necesitemos
    aprender de los usuarios antes de construir el resto?"**. Si sí, la entrega 1 es lo
    mínimo que lo enseña. Si no, **la entrega 1 es todo el alcance**, y queda escrito como
    decisión, no como omisión (Ries: el MVP no siempre hace falta). **El MVP recorta
    alcance, nunca la definición de terminado**: cobertura por área, `qa` y aceptación no
    cambian. Es una línea de alcance, no una prioridad, así que convive con *No priorities*
    de `write-stories`.
  - **Prototipo y esqueleto son dos cosas.** El **prototipo** es para aprender si es lo
    correcto: el mockup HTML de `nzt-ux`, descartable, ofrecido cuando la entrega 1 tiene
    algo que aprender. **Nunca se convierte en código de producción.** El **esqueleto** es
    código real: en un producto nuevo, el primer tramo recorre el sistema de punta a punta
    en su forma más fina, y los siguientes lo engordan.
  - **Cadencia de definición, elegida en el plan.** Tres modos: **por entrega** (default de
    un plan nuevo): se detallan las historias de la entrega en curso y después se larga a
    construir; las siguientes quedan como una línea *Como… quiero… para…* en el índice de
    la spec hasta su turno. **Todo al inicio**: lo que NZT hacía hasta D72, para cuando el
    problema está claro. **Justo a tiempo**: se detalla cada historia al tomarla, para
    cuando casi no se sabe nada. **En los tres, el alcance, las reglas de negocio y el índice
    de la feature se escriben completos antes del primer tramo**: lo que se difiere son los
    criterios de las historias, nunca las reglas, porque una regla cruza historias y
    definida tarde se define tres veces distinta. Lo que cambia después entra por
    `nzt-discovery-change`. El índice de historias es el backlog: no hay `backlog.md` suelto
    (Patton).
  - **El QA cierra cada tramo.** Construir el tramo → QA del tramo → siguiente tramo. **D43
    sigue en pie**: el QA es su propia unidad, después de que el tramo está construido en
    todas sus áreas, y build nunca diseña ni corre pruebas de aplicación. Lo que D43
    prohibió era probar en medio de construir lo que todavía no corre; un tramo terminado
    corre entero. Un bug reportado y las dos lecturas de `nzt-verify` siguen sin tramo.
  - **Quién hace el QA.** La IA o una persona. El de la IA se encadena dentro del lote
    autónomo; el de una persona es un freno conservado (`keep_stops`) en esa unidad.
    *Propuesto por el agente, no adoptado*: que la persona pruebe un tramo mientras la IA
    construye el siguiente. Queda fuera de esta corrida.
  - **Si el QA falla dentro del lote, el lote frena** (usuario: opción A, sobre B arreglar y
    seguir y C registrar y seguir). El bug queda en el archivo de testing, `waiting_on`
    dice qué tramo y qué bug, y se reporta. Nada se construye encima de algo que falló.
  - **El estado y el panel se organizan por tramo, y cada tramo lleva sus fases completas y
    separadas** (usuario): *"si lo que vamos a hacer es análisis de la spec 1 […] se haría
    la arquitectura, el build, QA y verificación de esa misma, al terminar se pasaría a la
    spec 2 que tiene sus x fases"*. Las fases no cambian; lo nuevo es el nivel de arriba. Se
    descartaron las fases alternadas `build → verify → build → verify` —pasan `state check`
    y el panel las dibuja (observado en `StateCheck.cs` y `phases.ts`), pero el usuario no
    quiere fases repetidas en el mod—, meter las unidades de QA en la fase `build`, que
    rompía *cada unidad vive en su fase*, y un primer diseño de D73 con los tramos dentro
    de `build`, que el usuario rechazó porque fundía verify en build. El panel muestra
    **objetivo, tramo** (cuál y cuántos van, con sus fases), **en curso** y **sigue**. El
    formato lo diseña D73.
  - **Lo que no cambia:** una unidad por turno con su freno, la autonomía tal cual (T22),
    la cobertura por criterio, no asumir (`[TO-DEFINE]`), las reglas en la feature, el
    cierre de la feature de una pasada (`close.md`) y la separación build/verify de D43.
  - **Restricción:** C3 mide `CLAUDE.md` y `AGENTS.md` armados —kernel más adaptador—, y
    estaban en 200 justas: lo que sume D72 al kernel entra recortando otro tanto.
  - **Fuera de alcance:** QA humano en paralelo, subir versión y publicar, y reescribir los
    estados v1 de otros proyectos (se siguen leyendo). Lo construyen las unidades 322 a 328.
- **D73.** **Formato de estado v2: el plan es una lista de tramos, y cada tramo lleva sus
  propias fases con sus unidades, como un v1 en chico.** Diseño de la unidad 321 sobre D72,
  rehecho tras la corrección del usuario (2026-10-23): un primer diseño metía los tramos
  dentro de `build` y fundía verify en build; el usuario lo rechazó porque las fases tienen
  que seguir separadas tal cual. El contrato queda en la sección 7.
  - **La forma.** Con tramos, la raíz lleva `slices` en lugar de `phases`. Cada tramo tiene
    `id`, `name`, `status` y `phases`, y cada fase de un tramo es exactamente una fase de
    v1: `name` de las seis de D69, `status`, `units`. Las reglas de fases de v1 valen dentro
    de cada tramo: en orden, sin repetir nombre, a lo sumo una `doing`, la que cierra pasa
    la siguiente a `doing` en la misma escritura.
  - **Un v1 es un plan de un tramo.** Un estado con `phases` en la raíz se lee como hoy y
    nadie lo reescribe. Un bug, un cambio chico o una feature sin cortar siguen siendo v1.
    `version: 2` es obligatorio con `slices`, para que una herramienta vieja detecte que no
    lo entiende en vez de leerlo a medias (hoy `StateCheck.cs` exige `phases` y fallaría
    con un mensaje claro: observado en el código). `phases` y `slices` juntos en la raíz es
    un error.
  - **Entre tramos.** A lo sumo un tramo `doing`; la unidad en curso está en la fase `doing`
    del tramo `doing`. Cuando cierra la última fase de un tramo, en la misma escritura el
    tramo pasa a `done` y el siguiente a `doing` con su primera fase en `doing`. La
    siguiente unidad es la primera `todo` de la fase en curso del tramo en curso.
  - **La cadencia es cómo se cortan los tramos** (D72). `delivery`: un primer tramo con el
    análisis de la entrega —las specs y sus historias— y después un tramo por feature, o
    más chico, con arquitectura, UX, build y verify; así se define primero y se larga
    después. `just-in-time`: cada tramo trae su propio análisis. `upfront`: todo el
    análisis de la corrida en el primer tramo, como NZT hacía. El campo `cadence` en la raíz
    registra lo elegido; ausente es `upfront`, como `delegation` (D71) no cambia nada sin
    aviso. Es del plan: una corrida nueva lo vuelve a decidir.
  - **Lo que es de toda la corrida** —la definición de producto, un release al final— va en
    su propio tramo (*Producto*, *Release*), con su fase. No hay fases sueltas fuera de
    tramos: un solo nivel de agrupamiento.
  - **El discovery es el primer tramo, y al cerrarlo el plan se reaprueba** (usuario,
    2026-10-23). Los tramos salen del discovery: un producto o una feature nueva arranca con
    un plan que solo conoce ese primer tramo y dibuja la forma del resto. Cuando cierra, el
    plan se reescribe con los tramos concretos —cuáles, en qué orden, de qué tamaño, con qué
    cadencia— y el usuario lo aprueba: ahí se decide el MVP y el lote. Un bug o un cambio
    chico no lo necesitan; una feature en un producto ya definido lleva su discovery en un
    tramo propio o dentro del de la feature, según la cadencia.
  - **El QA que falla** (D72, opción A): la unidad de verify queda `done` —corrió, y su
    resultado está en el archivo de testing—, la fase verify sigue `doing`, `waiting_on`
    nombra el tramo y el bug, y el lote frena. Cuando el usuario autoriza el arreglo, la
    fase `build` del tramo **se reabre** a `doing` con la unidad del arreglo, y verify vuelve
    a `todo` con una unidad nueva para la nueva corrida. Es el único caso en que una fase
    `done` vuelve atrás, y solo dentro del tramo en curso.
  - **Qué valida `state check` además de v1:** `version: 2` con `slices`; no `phases` y
    `slices` juntos; `cadence` dentro de sus tres valores; ids de tramo únicos y de unidad
    únicos en todo el archivo; a lo sumo un tramo `doing`; dentro de cada tramo, las reglas
    de fases de v1 (nombres de D69, sin repetir, a lo sumo una `doing`, una fase `done` sin
    unidades abiertas); una fase `doing` solo en el tramo `doing`; un tramo `done` con todas
    sus fases `done` o `dropped`.
  - **Qué dibuja el panel:** las filas **Objetivo · Tramo · En curso · Sigue**. *Tramo*
    dice *2 de 3 · nombre*, y debajo **la línea de tiempo de las fases de ese tramo**, la
    misma de hoy: ninguna fase aparece dos veces. Los tramos terminados y los que vienen se
    listan en una línea cada uno con su marca de estado. *Sigue* es la próxima unidad del
    tramo, o el próximo tramo si el actual termina. Un v1 se dibuja exactamente como antes.
  - **Kernel (322):** una viñeta de tres líneas suma `slices`, `version` 2 y `cadence`, y
    remite a `nzt-plan`; la fila de `nzt-verify` dice *QA once the slice is built*. Entró
    recortando tres: *one line each* se fundió en la viñeta de `status`, *write it for a
    session…* bajó a tres líneas, y la entrada de *Routing* a una. `CLAUDE.md` y `AGENTS.md`
    siguen en 200 (C3); el ejemplo JSON del kernel queda en v1. *"Si una unidad necesita un
    párrafo, es más de una unidad"* salió del kernel y queda solo en `nzt-plan`: el usuario
    lo aceptó (2026-10-23), porque cortar unidades es trabajo de `nzt-plan`.
  - **`nzt` y `nzt-plan` (323).** `nzt-plan` estaba en 200, así que el método va a una hoja
    nueva, `plan/references/slices.md` (94 líneas): cuándo cortar, qué es un tramo, el
    discovery primero con reaprobación, la entrega 1 con prototipo y esqueleto, las tres
    cadencias, QA dentro del tramo y quién lo hace, el QA que falla, y cómo se muestra el
    plan (columna *Tramo*). El router la nombra en *Building the plan* y queda en 200,
    fundiendo dos viñetas de autonomía. `nzt` §4 dice que verify corre al terminar el
    tramo y que el trabajo grande se corta en tramos empezando por discovery.
  - **`nzt-discovery` (324).** `product.md` suma la sección *Delivery 1* (para qué objetivo,
    qué entra, qué se aprende, *Known by*) con la pregunta de D72 y "todo el alcance" escrito
    como decisión. `write-spec.md`: el índice es el backlog, una historia diferida queda en
    una línea *As… I want… so that…*, y alcance, reglas e índice se escriben antes del primer
    tramo. `write-stories.md`: la entrega 1 no es prioridad, y *When a story is written*
    según la cadencia. El *Done when* del router y de `analysis.md` cambia "todas las
    historias" por "las que la cadencia detalla ahora", con todas las reglas.
  - **`nzt-verify` y `nzt-build` (325).** *When it runs* de verify dice *after build has
    finished the slice*, construido en todas sus áreas, y después el tramo siguiente; un
    párrafo nuevo: dentro del lote el QA de la IA se encadena, el de una persona es un freno
    conservado, y una falla frena el lote. `test-run.md` lo repite en *Do not fix while
    testing*. En build, `SKILL.md` e `implement.md` cambian *increment* por *slice*; D43
    queda igual. El eval `restraint/qa-unasked` todavía dice *increment* en su grader: no se
    tocó, su re-corrida era la 330, descartada.
  - **`nzt-ux` (326).** `mockup.md` suma *A prototype is a mockup that teaches*: parte del
    `Q-NN` de *To learn*, no de un diseño de pantalla; dibuja el flujo mínimo; valen todas
    las reglas del mockup; nunca pasa a producción; lo que la gente hizo va a
    `Docs/Product/analysis.md` y el archivo se borra. El router suma su fila (ofrecido por
    el plan) y su lugar. **Decisión del agente, dentro del alcance:** vive en
    `Plan/prototype/<slug>.html` —es temporal, como `change.md`, y no es de una feature
    porque se hace antes de que existan— y la sección 8 lo suma al árbol.
  - **`state check` (327).** `StateCheck.cs` saca las reglas de una lista de fases a un
    método que corren la raíz de un v1 y cada tramo de un v2, con los mismos mensajes para
    v1; suma las reglas v2 de arriba. Tres pruebas nuevas en `Nzt.Cli.Checks` (un v2 que
    cumple con las tres cadencias, cada invariante de tramo roto, mezcla y versión); 164
    comprobaciones en verde. **Decisión del agente:** "sin repetir nombre" se exige solo
    dentro de un tramo; un v1 con fases repetidas sigue pasando, porque D73 dice que v1 se
    lee como hoy. RN-cli-state-check de `specs/nzt-installer.md` suma las reglas.
  - **`nzt-state` 0.9.0 (328).** `parse.ts` lee `slices`: `phases` y `units` pasan a ser las
    del tramo en curso (el `doing`, si no el primer `todo`, si no el último) y `planUnits`
    todas, para la tanda. El panel suma la fila **Tramo** con cada tramo en un renglón, y
    AHORA cierra con *Sigue el tramo* cuando al tramo no le queda nada; *Plan completo* recién
    tras el último. Regla RN-panel-tramos `[add]` en la spec del mod; 54 tests y `tsc` en
    verde. Sin probar en vivo.
  - **Puertas locales (329), 2026-10-23.** Build sin avisos, `CLAUDE.md` y `AGENTS.md` en
    200; `check-references` sin movidas; 164 comprobaciones del instalador; lint con 0
    problemas; los seis mods validan y pasan sus tests (nzt-state 54). `state check` desde el
    código: el v1 de este repo y el ejemplo v2 de la sección 7 cumplen, y un v2 con un id de
    tramo repetido da el problema y código 1. El `nzt-ai` instalado (1.6.0) rechaza el v2 con
    *falta phases*, como D73 previó, hasta que se publique. `check-extraction` no aplica: es
    para extraer hojas de área. La 330 (evals) la descartó el usuario.
- **D74.** **El esquema y las reglas de `Plan/state.json` pasan al cuerpo de `nzt-plan`, que
  se carga siempre que se lee o se escribe el estado; el kernel suma una sección
  *Communication* con los principios, y cada formato queda en su skill.** Lo que la forzó: el
  kernel está en 200 justas (C3) desde D64, y cada regla nueva entró recortando otra (D67,
  D68, D69, D71, D73). El estado era su bloque más grande (~35 líneas) para un contrato que el
  agente usa al leer o escribir un archivo. Y la forma de comunicar estaba repartida —el
  reporte en `nzt-plan`, las preguntas en el kernel, el playback en `nzt-discovery`, *"report
  what actually happened"* en las hard rules— sin un lugar con lo que vale para toda
  respuesta. Acordado con el usuario el 2026-10-23, unidad 331.
  - **Revierte lo descartado en D65, con argumentos nuevos.** D65 dejó el esquema en el kernel
    porque el estado se escribe también en trabajo chico que no carga `nzt-plan`, y sin el
    esquema delante el agente lo escribiría de memoria. Lo que cambió: (1) el kernel dice que
    **leer o escribir `Plan/state.json` carga `nzt-plan`**, un disparador por el nombre del
    archivo que no depende de clasificar el trabajo; (2) desde D68 `nzt-ai state check`
    revisa lo escrito, así que un formato corrido aparece en la misma unidad. Costo: el
    trabajo chico carga `nzt-plan` al escribir el estado, lo mismo que ya paga cualquier
    corrida de más de una unidad.
  - **En el cuerpo de `SKILL.md`, no en una referencia** (unidad 333): una skill cargada
    sobrevive a la compactación y una referencia no (kernel, *Routing*). Retomar es leer el
    estado, así que el esquema no puede depender de releer un archivo.
  - **`nzt-plan` libera lugar** (332): está en 200 (D3). *How the plan is shown* y *The
    documents the plan produces* pasan a `plan/references/proposal.md`, que se lee al armar
    el plan, antes de mostrarlo: es el único momento en que se usan. Entran el ejemplo v1 y
    las reglas de v1 y v2 que hoy dice el kernel, sin cambiar ninguna. `slices.md` deja de
    decir que el formato está *in your instructions*.
  - **Qué queda en el kernel** (334): *State* en ~5 líneas —qué es el archivo, leerlo al
    empezar antes de preguntar, el disparador, cuándo se omite—. El candado de aprobación y
    el cierre de unidad con `state check` siguen en las hard rules y en *Work units and
    stops*, porque valen antes de que `nzt-plan` esté cargado. Se compactan, sin perder
    reglas, la autonomía (queda *acompañado por defecto*; cómo se ofrece ya lo dice
    `nzt-plan`), *Context* y las hard rules.
  - **El código de comunicación** (QT-01, usuario: principios en el kernel y formatos en sus
    skills). Una sección *Communication* (~15 líneas, 335) con lo que vale para toda
    respuesta: el idioma (absorbe *Language*), el resultado primero, lo que el usuario puede
    probar o decidir antes que qué archivos existen, lo que pasó tal cual (absorbe la hard
    rule *Report what actually happened*), ningún número inventado, y la forma de las
    preguntas (absorbe *Questions*). Cierra nombrando dónde vive cada formato: el plan
    (`nzt-plan-proposal`), el reporte de unidad y el bloque de contradicción (`nzt-plan`) y
    el playback (`nzt-discovery`). Cada formato se dice una vez, en su skill (D65).
  - QT-02: plan aprobado, en la rama `trabajo-por-tramos`. QT-03: autonomía completa de 331 a
    336 (usuario, 2026-10-23).
  - **Lo que no cambia:** el formato del estado (v1 y v2), `state check`, el panel y toda
    regla de comportamiento: lo que sale del kernel queda dicho una vez en `nzt-plan`, o
    repetía otra línea que queda.
  - **Riesgo:** el disparador lo cumple el modelo, no el host. Si no carga `nzt-plan` y
    escribe el estado de memoria, lo atrapa `state check` donde está instalado; donde no,
    nada. Lo mide la 336 con los evals de plan y estado.
  - **Hecho (332-335, 2026-10-23).** `nzt-plan` 200 → 169 con `proposal.md` (42 líneas) y
    de vuelta a 200 con *The state file*; su `description` nombra leer o escribir el estado.
    `core/kernel.md` 186 → 147; `CLAUDE.md` y `AGENTS.md` 200 → 161 (C3). Las citas que
    apuntaban al esquema o a *Questions* del kernel (`stack-axes.md`, comentarios de
    `parse.ts`, la spec del mod y RN-cli-state-check) quedan al día. **No cambiado:** el
    mensaje de `nzt-ai state check` sigue diciendo *"cumple el contrato del kernel"*;
    cambiarlo es del CLI y de una publicación.
  - **Puertas (336, 2026-10-24).** Build sin avisos, `check-references` sin movidas, 164
    comprobaciones del instalador, lint 0 problemas, `nzt-state` 54 tests, marketplace
    válido. **Evals** (juez sonnet, sin brazo de control, contra la u35): ruteo 16 casos y
    restraint 8. Iguales o mejor: `kernel-loaded`, `small-edit`, `trivial`, `foreign-repo`,
    `package-unasked`, `test-data` y diez de ruteo en 1.00. Bajas, todas leídas en la traza:
    `plan-stories` 1/3 (leyó `proposal.md`; llamó *casos de uso* al índice diferido de D72),
    `close-feature` (el fixture no tiene el código que la historia marca hecho),
    `qa-unasked`, `design-unasked` y `test-levels-unasked` (frenan por el glosario que los
    fixtures no tienen), `design-mode`, `no-diagram` y `build-story` (juez, 1 o 2 de 3).
    El disparador se vio andar: con estado, las corridas cargaron `nzt-plan`. **No corrieron**,
    por el límite de sesión: 2 de 3 de `route-verify` y `stack-not-dotnet`. Costo total
    ≈ US$27. Pendiente aparte: los fixtures sin glosario, y el grader de `qa-unasked` que dice
    *increment*.
  - **Corrección (2026-10-24).** La baja de `plan-stories` **sí era de D74**: la regla
    *"Plain words in the user's terms"* de *Communication* llevó a traducir "historias de
    usuario" por "casos de uso" en un proyecto sin glosario (la u34 decía "historia" 11
    veces). Decidido por el usuario: la aclaración va en `plan/references/proposal.md`, no en
    el kernel — *cada documento va por su nombre, con la explicación simple al lado; las
    palabras simples explican, no renombran*. Re-corrida: `plan-stories` 3/3, las tres dicen
    "historias de usuario", US$0.76 (`evals/results/2026-10-24-d74b-plan-stories.json`).
- **D75.** **El paso de la spec cubre sus historias: el plan las nombra sin contarlas, y al
  cerrar la spec se corta una unidad por historia sin volver a aprobar. El panel muestra los
  tramos en una línea, con la lista plegada.** Lo que la forzó: la prueba en vivo de D72–D74
  en un proyecto nuevo (usuario, 2026-10-24, `Systems/TodoList`). Con cadencia `delivery`, el
  plan del tramo de descubrimiento tenía producto, glosario, spec y prototipo, y **ninguna
  fila para las historias**; al cerrar la spec el agente lo notó y pidió aprobación para
  sumar cinco unidades. Y el panel repetía el nombre del tramo: en la fila **Tramo** y en la
  lista de debajo, que además no escala con muchos tramos.
  - **QT-05 (usuario).** El usuario objetó que la spec y sus historias son parte de lo mismo
    y que el plan no tiene por qué saber cuántas hay. Se acordó: **en el plan, un paso** —*la
    spec de F-001 y sus historias*—, sin número (*"una fila es un paso, no un archivo"*);
    **en la ejecución, una unidad por historia**, cortadas cuando el índice existe. Cortarlas
    es un paso ordinario de lo aprobado, no un cambio de plan: no pide aprobación. Descartado:
    spec e historias en una unidad (una revisión enorme, y una historia mal obliga a rehacer
    el bloque). Va en `nzt-plan` y en `slices.md`.
  - **QT-04 (usuario).** El panel muestra una línea fija, `Tramo  2 de 5 · F-001 Tareas`, y
    debajo la lista entera plegada en `▸ Tramos · 5`, que se abre con un clic como *Ver
    tareas*. Con un solo tramo, solo la línea. Descartados: una ventana con el anterior, el
    actual y el siguiente (3–4 líneas fijas), y la lista sola (se pierde el *n de m*). Va en
    RN-panel-tramos de `specs/mods/nzt-state/spec.md`.
  - **Hecho (337–341, 2026-10-24).** `slices.md` dice que la spec y sus historias son un paso
    y que cortarlo por historia no pide aprobación (queda en 100 líneas); `nzt-plan` no cambió.
    `nzt-state` 0.9.1: `▸ Tramos · n` plegado, abierto con un clic, sin lista con un tramo.
    **Puertas:** build sin avisos, `check-references` sin movidas, 164 comprobaciones, lint 0
    problemas, marketplace válido, `nzt-state` 55 tests. **Sin evals**, por decisión del
    usuario. **Sin probar en vivo** el panel.
- **D76.** **El prototipo es usable y aplica las reglas de negocio que muestra; al cerrarlo,
  el usuario decide si se borra o queda como prototipo mantenido. El design system se ofrece
  cuando el plan elige UX, con una sección de marca y voz.** Lo que la forzó: la prueba en
  `Systems/TodoList` (usuario, 2026-10-24). El agente iba a borrar el prototipo al anotar
  Q-19, y el plan no tenía diseño de pantalla: lo visual decidido se perdía con el archivo.
  El usuario quiere además un lugar mantenido para la marca —colores, logo, estilo— y un
  prototipo que la persona pueda usar, no solo un selector de estados.
  - **Destino al cerrar (usuario).** Lo que enseñó va siempre a `analysis.md`. Después el
    usuario elige: **borrarlo**, o **conservarlo** en `Docs/UX/prototype/<slug>.html`,
    mantenido. Si nadie lo va a mantener, se borra: un prototipo viejo miente con la
    autoridad de lo visual.
  - **Usable, con las reglas (usuario).** Un solo HTML, que se abre con doble clic, sin red,
    sin build ni imports; se usa de verdad y aplica las reglas de la spec que su flujo toca.
    **Objetado una vez:** las reglas quedan en dos lugares. Lo que lo contiene: la cabecera
    lista por slug las reglas que implementa y la fecha de la spec; conservado, cambiar una
    de esas reglas lo actualiza en la misma unidad, como a todo documento afectado. **Nunca
    pasa a código de producción**: la app se construye desde las historias. El mockup de
    una pantalla diseñada sigue sin lógica.
  - **Design system ofrecido, no obligatorio (usuario).** UX sigue opcional: obligarlo va
    contra la agilidad. Cuando el plan elige UX en un producto con pantalla, `proposal.md`
    ofrece `Docs/UX/design-system.md` con lo que se pierde sin él. `system.md` suma **marca**
    (logo como ruta a su archivo, tipografía, paleta por roles con valores
    `provisional` hasta que exista un tema en código, que desde ahí manda) y **voz de los
    textos**.
  - **Hecho (342–346, 2026-10-24).** `mockup.md` (130 líneas), `system.md` (132),
    `ux/SKILL.md`, `proposal.md`, `slices.md` y el árbol de §7. **Puertas:** build sin avisos,
    `check-references` sin movidas, 164 comprobaciones, lint 0 problemas, marketplace válido.
    **Sin evals** (usuario); ningún caso nombra el prototipo.
  **[modify] 2026-11-01: D89.** El prototipo conservado y el design system van en
  `Docs/Design/`.
- **D77.** **El plan muestra una tabla por tramo, bajo su título, y la palabra es *tramo*;
  el panel de preguntas cierra lo contestado fuera de él. D72–D74 quedan aceptadas.** Lo que
  la forzó: la prueba en `Systems/TodoList` (usuario, 2026-10-24). El plan de construcción
  salió en una tabla con columna *Porción*: celdas vacías en cada grupo y filas de cinco
  renglones en la terminal; el agente tradujo *slice* a su manera, y el panel y la spec dicen
  *tramo*. Y `nzt-questions` dejaba pendientes las preguntas contestadas por
  `AskUserQuestion` o escritas en el prompt, porque solo cerraba lo llevado desde el panel.
  - **QT-06 (usuario): *tramo*.** Fijado en `proposal.md` con los sinónimos prohibidos
    (*porción*, *etapa*). Descartadas *etapa* (se confunde con las fases) y *bloque*.
  - **QT-07 (usuario, opción A de tres ejemplos): una tabla por tramo**, con `S2 · Nombre`
    de título y tres columnas; el *por qué* en una línea, el detalle en el reporte de la
    unidad. Descartadas una tabla con el tramo repetido en cada fila (ancha) y una lista sin
    tabla (pierde las columnas). En `slices.md` (100 líneas) y `proposal.md`.
  - **QT-08 (usuario): cualquier mensaje cierra las preguntas.** RN-preg-contestadas-afuera,
    `nzt-questions` 0.2.0: un mensaje que no es comando cierra lo pendiente, salteadas
    incluidas; un turno con `AskUserQuestion` no deja sus preguntas en el panel; lo que el
    agente repite vuelve. Descartado: cerrar solo lo que el mensaje nombra por id (*"dale, la
    primera"* lo dejaría pendiente).
  - **Aceptación.** El usuario probó en vivo los puntos 3–13 de la lista de la unidad 336
    (plan, `nzt-plan` al tocar el estado, retomar tras `/clear`, comunicación, `state check`,
    tramos, QA por tramo, estado v2, panel 0.9.0 con Delegar, pregunta suelta y edición
    mínima): *"fueron todas perfectas así que queda bien todo"*. **D72, D73 y D74 quedan
    aceptadas**, y `nzt-state` 0.8.0 y 0.9.0. Después el usuario aceptó también **D75, D76 y
    D77**, `nzt-state` 0.9.1 y `nzt-questions` 0.2.0 (*"apruebo, acepto lo del cierre de
    mods"*, 2026-10-24) — estos dos últimos **sin probar en vivo**. Cierre de los mods: marcas
    `[add]`/`[modify]` barridas, encabezados, entradas de **Historia** y catálogo de
    `specs/nzt-mods.md` al día.
  - **Hecho (2026-10-24).** `nzt-questions` 27 tests (2 nuevos), validate pasa.
- **D78.** **`nzt` dimensiona todo pedido en tres tamaños —directo, estándar y completo— y el
  tamaño decide cuánta ceremonia lleva.** Lo que la forzó: una revisión externa del método
  (usuario, 2026-10-24, rama `ceremonia-por-nivel`) pensando en equipos de analistas y devs.
  Entre el *small change* y el flujo completo no había nada: una mejora o una feature de una
  historia entraba a `nzt-plan` con la misma forma que un producto nuevo, y eso es lo que más
  se usa en el día a día.
  - **Qué cambió:** sección *4. Size the work* de `nzt` con la tabla. **Directo:** un bug, un
    cambio chico, una tarea técnica; sin plan ni estado. **Estándar:** una mejora o una feature
    de una o dos historias que entra en la arquitectura actual —sin componente nuevo, sin
    decisión de stack, a lo sumo una pantalla nueva—; plan de `phases`, sin tramos, aprobado
    una vez, con la spec, sus historias y la primera versión de producto si falta.
    **Completo:** producto nuevo, feature de tres historias o más, componente nuevo, decisión
    de stack o varias pantallas; tramos, como hasta ahora. Ante la duda, el más liviano; si el
    trabajo crece, se dice y se propone el siguiente, nunca se agranda en silencio. **El tamaño
    recorta ceremonia, nunca la definición de terminado**: criterios, cobertura por área, `qa`
    y aceptación valen en los tres. El kernel lo nombra en su primer párrafo; `proposal.md`
    dice que el plan estándar es una tabla con sus declaraciones, sin tramos ni cadencia, y
    que el diseño técnico se ofrece en estándar solo si toca un contrato o el modelo de datos.
  - **Descartado:** la spec estándar con las historias adentro. El archivo de historia es el
    único lugar de donde se lee el avance (T1) y lo usan verify, el cierre y el panel:
    sacarlo en un tamaño partía el método en dos formatos.
  - **Revisado y sin cambio:** el glosario ya pide solo términos con significado propio
    (*What earns an entry*), y `analysis.md` ya se crea con la primera pregunta. La revisión
    los había marcado como peso; leídos, no lo eran.
- **D79.** **Acompañado sigue siendo el default; la autonomía se ofrece en dos formas, las dos
  una lista cerrada de unidades, y toda tanda frena pasado el 40% de contexto.** Lo que la
  forzó: la misma revisión, y la corrección del usuario sobre su primera versión.
  - **Primera versión, revertida.** Hacía default a *por hitos*: aprobado el plan, las
    unidades se encadenaban hasta el cierre de una fase. El usuario la objetó (2026-10-24):
    la persona puede querer seguir el trabajo punto por punto o cuidar el contexto; ante una
    compactación la IA trabaja mal, y si llega al 50% sin cerrar la fase y sigue, alucina más.
    *"No debe por default decir voy a frenar hasta que se termine este hito, porque si el
    trabajo es muy grande el riesgo a que salga mal también lo es."* La protección que tenía
    era débil: el kernel solo recomendaba limpiar, y en una tanda eso no frena nada.
  - **Las dos formas (usuario):** **las próximas N unidades**, o **hasta un hito** —el cierre
    de una fase de análisis, arquitectura o UX, un freno propio de una fase, la aceptación—.
    Las dos se escriben en `autonomy.units` por id, nunca abiertas. **Hasta un hito se ofrece
    siempre**, con todas sus unidades nombradas: la propuesta del agente de topearlo en cuatro
    unidades la descartó el usuario (*"no quiero tope de 4 unidades, que ofrezca siempre lo
    del hito"*); lo que acota un tramo largo es el freno del 40%. Una unidad que se corta
    después —una por historia— entra a la tanda solo si el usuario la suma.
  - **Frenos de toda tanda:** un fallo, una contradicción, una pregunta que traba, y **pasado
    el 40% de contexto**, al terminar la unidad en curso, le queden unidades o no. Es el freno
    duro que faltaba: la autonomía nunca pasa por encima del cuidado del contexto.
  - **Sin cambio de esquema:** `autonomy` sigue igual; `state check` y el panel `nzt-state`
    siguen valiendo.
  - **Qué cambió:** el kernel (*Work units and stops*), `nzt-plan` (*Approval and autonomy*,
    paso 5 de *Executing* y la regla de encadenar) y `slices.md` (la oferta bajo las tablas).
    `nzt-verify` y `test-run.md` quedaron como en `main`.
- **D80.** **La escala de contexto pasa a 30/40, y se dice al cruzar una marca, no en cada
  reporte.** Lo que la forzó: el usuario, 2026-10-24: *"me cierra lo que dijiste del contexto
  al 20% quizás estaría bueno que el umbral sea desde el 30 y 40"*. Es la decisión que D67
  dejó abierta.
  - **Qué cambió:** bajo el 30% no se dice nada; desde el 30% se recomienda limpiar; pasado
    el 40%, fuerte. Se dice en el reporte que cruza una marca y cuando se pregunta: una línea
    en cada reporte deja de leerse. Sin señal del host, se dice una vez. `nzt-plan` deja de
    exigir el contexto en todo reporte.
  - **Mods:** `nzt-look` 0.7.0 sigue al kernel —dos marcas, amarillo desde el 30 y rojo desde
    el 40, sin naranja; botón limpiar principal desde el 30; la línea al agente dice
    `30%+, recommend clearing`— y `nzt-hub` 0.4.1 cambia el texto de la tarjeta Aspecto.
    Reglas con `[modify]` en sus specs hasta probarlo en vivo. El mockup de la banda queda con
    tres marcas, anotado en la spec.
- **D81.** **Un tramo es por defecto una feature de hasta tres historias.** Lo que la forzó:
  la misma revisión. La regla de QA después del tramo está bien (probar contra algo a medio
  construir produce casos que salen mal); lo que la hacía lenta era el tamaño del tramo.
  `slices.md`: una feature más grande se corta en tramos de una a tres historias que se
  prueban juntas; un tramo más grande lo decide el usuario, nunca el default.
- **D82.** **La definición de producto puede empezar como primera versión.** Lo que la forzó:
  la misma revisión. En un producto existente, o en trabajo estándar, pedir la entrevista de
  producto entera antes de la primera feature frena el trabajo que se pidió. Sigue siendo
  obligatoria (D56). `product.md` suma *A first version*: objetivos (al menos el que sirve la
  feature), usuarios que toca, alcance en las dos direcciones y abiertos, con la línea
  `> First version: grows with each feature.`; módulos, restricciones y entrega 1 esperan a
  la entrevista de producto. Sigue siendo el acta: nada sale del repositorio.
  - **Hecho (D78–D82, 2026-10-24, rama `ceremonia-por-nivel`).** Kernel 149 líneas,
    `nzt` 113, `nzt-plan` 199, `product.md` 167, `slices.md` 101, `proposal.md` 57.
    `nzt-look` 190 tests y `nzt-hub` 18, validate pasa en los dos y en el marketplace.
    Casos nuevos `routing/size-standard` y `restraint/accompanied-default`. **Puertas:** build
    sin avisos, `check-references` sin movidas, 164 comprobaciones, lint 0 problemas,
    marketplace válido. **Sin probar en vivo.**
  - **Evals dirigidas (2026-10-24, una corrida por caso, sin brazo de ablación, juez haiku,
    US$1,96 en total; reportes en `evals/results/2026-10-24-ceremonia/`).** `kernel-loaded`,
    `small-edit` y `plan-stories` 1.0. `size-standard` 0.5: el plan sale estándar —una tabla,
    sin tramos ni cadencia, el diseño técnico ofrecido con su porqué— y el juez lo rechaza sin
    decir por qué; falta re-juzgarlo con sonnet. `accompanied-default` 0.67: la fixture
    `project.sh` tiene código de muestra sin comportamiento, el agente frena con una pregunta y
    el freno del kernel queda sin medir. La oferta de tanda (*"por defecto paro después de cada
    paso; si preferís, …de corrido"*) apareció en los tres planes. El freno del 40% no se midió.
- **D83.** **Tres reglas de autoría nuevas: genéricas, sin redundancia, mantenibles con pasos
  simples.** Pedido del usuario, 2026-10-25. Quedan como reglas 17, 18 y 19 de §10. Valen
  para lo que se escriba o se toque desde ahora; **no se aplicaron todavía al set existente**:
  revisarlo contra ellas es trabajo aparte, y lo decide el usuario.
- **D84.** **Un solo subagente que escribe, `nzt-worker`, para unidades aprobadas e
  independientes en paralelo.** Abre D70 QT-27. Lo que la forzó: el pedido del usuario
  (2026-10-25) de ganar agilidad sin perder calidad delegando construir, verificar o preparar
  un release, sin una lista larga de agentes. Un agente genérico y no uno por fase: el método
  vive en las skills y la fase va en el prompt (reglas 17 y 18).
  - **Lo verificado (unidad 370, leído el 2026-10-25; Claude Code 2.1.310, Codex 0.164.0
    instalados).** Fuentes: [sub-agents](https://code.claude.com/docs/en/sub-agents) y
    [worktrees](https://code.claude.com/docs/en/worktrees) de Claude Code;
    [subagents](https://learn.chatgpt.com/docs/agent-configuration/subagents),
    [AGENTS.md](https://learn.chatgpt.com/codex/guides/agents-md) y
    [worktrees](https://learn.chatgpt.com/docs/environments/git-worktrees) de Codex.
    - documented (CC): `isolation: worktree` corre el subagente en un worktree temporal bajo
      `.claude/worktrees/`. **Parte de la rama por defecto del remoto** (`worktree.baseRef:
      "fresh"`), no del `HEAD`; con `"head"` parte del `HEAD` local. Sin cambios se borra;
      con cambios queda en disco con su rama, **y nada se mergea solo**. Las ediciones y los
      comandos hacia el checkout principal se bloquean, pero un `cp` o una redirección del
      shell no.
    - inferred (CC, de lo anterior y de git): un worktree **no lleva el trabajo sin commitear**
      del checkout principal. Un worker que necesita lo que hicieron unidades anteriores sin
      commit no lo ve: o se commitea antes de repartir, o el worker trabaja sin worktree.
    - documented (CC): sin configurar, los subagentes corren **en segundo plano** y su resultado
      llega como notificación; tope de **20 concurrentes** por defecto
      (`CLAUDE_CODE_MAX_CONCURRENT_SUBAGENTS`); **anidan hasta tres niveles**, y se corta
      quitando `Agent` de `tools`. Los permisos que piden se muestran en la sesión principal.
    - documented (CC): **`AskUserQuestion` se quita a todo subagente**, aunque esté en `tools`.
      Los de segundo plano tienen `Edit`, `Write`, `Bash`, `PowerShell` y `Skill`, entre otros.
      `skills` precarga hasta 32; sin precarga puede invocarlas. `omitClaudeMd` (2.1.271+)
      sigue disponible. Devuelve solo su resumen final, marcado como salida sin autoridad.
    - documented (CC): un **fork** hereda toda la conversación y comparte la caché del
      principal, y también acepta `isolation: "worktree"`.
    - documented (Codex): los subagentes **heredan el sandbox y las herramientas del padre**:
      pueden escribir y no hay solo lectura por configuración. El tope es
      `agents.max_concurrent_threads_per_session`, sin número documentado. Local delega
      **solo si se pide**, o si lo pide un `AGENTS.md` o una skill. Las aprobaciones aparecen
      desde el hilo que las pide, y en modo no interactivo fallan.
    - documented (Codex): **no hay aislamiento por subagente**. La doc avisa que agentes
      editando código a la vez generan conflictos. Los worktrees de Codex son por chat
      (`$CODEX_HOME/worktrees`, HEAD separado), y en la CLI son experimentales.
    - unverified (Codex): si un subagente carga el `AGENTS.md` global. Ninguna de las dos
      páginas lo dice, igual que en D71. Se resolvería con una prueba: un subagente que cite
      una línea del bloque de NZT.
    - inferred: en Codex dos workers en paralelo comparten el checkout, así que solo son
      seguros con archivos disjuntos declarados; si no, todo es secuencial. En Claude Code el
      worktree protege los archivos, pero el merge es del principal.
  - **Las preguntas (unidad 371).** Derivadas de lo verificado y de las reglas que ya rigen
    (una unidad por spec, un solo escritor del estado, freno acompañado, D70 QT-28).
    - **QT-36 · Cuántos agentes:** uno genérico, `nzt-worker`, más `nzt-explorer`; la fase
      va en el prompt. *Usuario, 2026-10-25*, al aprobar el plan que lo proponía.
    - **QT-37 · Qué fases delega:** build y verify ejecutan; ship solo prepara (pipeline,
      borrador de changelog), sin push, tag ni deploy; análisis, arquitectura y UX no, porque
      son preguntas y decisiones. *Usuario, 2026-10-25*, al aprobar el mismo plan.
    - **QT-38 · Cómo se aíslan dos workers. Usuario, 2026-10-25: worktree más rama.** En
      Claude Code cada worker va en su worktree. Antes de repartir, el principal commitea el
      punto de partida en una rama de trabajo que el plan declara, porque el worktree no ve lo
      que no está commiteado y parte de `HEAD` con `worktree.baseRef: "head"`. Cada worker
      compila y testea en su worktree, y el principal mergea. En Codex, o sin git: archivos
      disjuntos declarados y sin builds en paralelo. Descartadas: el mismo checkout para los
      dos proveedores (el worker entrega sin verificarse) y paralelizar solo lo que no compila.
    - **QT-39 · Quién toca los archivos compartidos. Usuario, 2026-10-25: solo el
      principal.** El worker no los edita: anota en su reporte el cambio que haría falta y el
      principal lo aplica después del merge. Una unidad que necesita una migración nueva no va
      en paralelo. Descartada: sacar del paralelo a toda unidad que toque uno de esos archivos.
    - **QT-40 · Cómo se autoriza. Usuario, 2026-10-25: la aprueba el plan.** El plan marca los
      grupos en paralelo y aprobarlo los autoriza (D70 QT-28). `delegation` sigue siendo el
      interruptor general: con `off` no se delega nada; con `ask` y `auto`, la lectura se
      comporta como en D71 y la escritura sale del plan. Descartadas: preguntar además antes de
      cada grupo, y un campo `parallel` aparte.
    - **Detalles dentro del alcance. Modo elegido por el usuario el 2026-10-25: juntos**, en
      una ronda: el modelo del worker; si puede anidar subagentes; qué skills precarga; la
      forma de su reporte; cuántos en paralelo como máximo; y su nombre en Codex.
      - **QT-41 · Modelo.** Se ofreció `inherit` o Sonnet fijo. **El usuario reabrió QT-34**
        (2026-10-25): que el principal elija el modelo de cada unidad según su dificultad.
        documented (CC, [sub-agents](https://code.claude.com/docs/en/sub-agents), historial
        2.1.251): el modelo **por invocación** gana sobre el `model` del frontmatter, así que
        el principal puede elegirlo en cada llamada. unverified (Codex): la doc muestra
        `model` por archivo de agente y `agents.default_subagent_model`, pero no un modelo
        por llamada. **Usuario, 2026-10-25: tabla más plan.** Una tabla corta en
        `nzt-delegate`: lo mecánico y con criterios cerrados (docs, tests de escenarios ya
        escritos, un renombre) va a un modelo chico; una historia normal, al del principal; lo
        ambiguo o transversal no se delega. El plan muestra el modelo de cada unidad delegada y
        se aprueba con él (QT-40). En Codex, mientras no se verifique, el del principal. La
        eval de la 376 mide si el modelo chico sostiene la calidad. **Cierra QT-34** con esta
        regla. Descartadas: que el principal decida libre caso por caso, y `inherit` siempre.
      - **QT-42 · Si anida subagentes. Usuario, 2026-10-25: no.** Sin `Agent` en `tools`.
      - **QT-43 · Qué skills precarga. Usuario, 2026-10-25: ninguna.** Invoca la de la fase
        que nombra el prompt y lee sus referencias, como el principal.
      - **QT-44 · Tope. Usuario, 2026-10-25: tres a la vez.** Es una estimación del agente
        (el cuello pasa a ser el merge del principal), no una medición.
      - **QT-45 · Forma del reporte. Usuario, 2026-10-25: fija.** Los cuatro campos del
        reporte de unidad (`nzt-plan`), la rama y el worktree, los archivos tocados, los
        chequeos corridos con su resultado, los cambios a archivos compartidos que propone y lo
        que no pudo resolver. El principal rechaza una respuesta fuera de esa forma, como con
        `nzt-explorer`.
      - **QT-46 · Nombre en Codex. Usuario, 2026-10-25: `nzt_worker`**, por el mismo criterio
        que `nzt_explorer` (D71). El archivo es `nzt-worker.toml`.
  - **Lo que esto pide a las unidades 372–376.** 372: `nzt-worker` sin `Agent`, sin skills
    precargadas, `omitClaudeMd`, `isolation: worktree`; su texto dice que no corre el bucle y
    no toca los archivos compartidos; y la prueba de si Codex le carga el `AGENTS.md`. 373:
    `nzt-delegate` suma repartir unidades (requisitos de independencia, commit del punto de
    partida en la rama de trabajo, prompt, reporte de QT-45, merge y re-verificación del
    principal) y la tabla de modelos de QT-41. 374: el plan marca los grupos en paralelo y el
    modelo de cada unidad delegada; `state check` los valida. 375: la hard rule. 376: casos
    para el grupo en paralelo, para la unidad que no debe ir en paralelo, y para el modelo chico.
  - **Sin cambio de comportamiento sin subagentes:** con `off`, sin subagentes en el host o
    sin `nzt-worker` instalado, las mismas unidades corren una tras otra, como hasta D83
    (regla 6 de §10).
  - **Hecho (unidad 372, 2026-10-25).** `agents/nzt-worker.md` y `agents/nzt-worker.toml`;
    el instalador ya embebía todo `agents/` y no cambió (*"embebe los 4 agentes del repo"*,
    164 comprobaciones). Tablas de `installer/README.md` y `specs/nzt-installer.md` al día.
    - **Se apartó de QT-38 en el mecanismo, no en la decisión** (propuesta del agente):
      `worktree.baseRef: "head"` es un ajuste del usuario en `settings.json`, y cambiarlo es
      configuración persistente. En su lugar el worker arranca con `git reset --hard <commit>`
      sobre el commit que nombra el prompt (el worktree comparte el `.git`, así que lo tiene)
      y comprueba `HEAD`. Commitea en la rama de su worktree; el principal mergea.
    - **observed (Codex 0.164.0, 2026-10-25):** un `nzt_explorer` lanzado con `codex exec`
      respondió que en su contexto está el `# NZT` del bloque global, que identificó como
      *inherited user instructions*. Lo dice el propio subagente, no hay un log que lo
      muestre. Por eso el `.toml` del worker dice que no corre el bucle *aunque NZT esté
      cargado*. Cierra el unverified de D71.
    - **En Codex el worker comparte el checkout:** solo toca sus archivos declarados, no
      compila ni testea salvo que el prompt diga que es el único, y no commitea.
    - **Sin probar:** que Claude Code y Codex carguen los dos archivos nuevos. No se instaló
      en la máquina para no subir al resto del set sin commit.
  - **Hecho (unidad 373, 2026-10-25).** `nzt-delegate` pasa a router (61 líneas, description
    de 172 caracteres): el modo con una columna para lecturas y otra para unidades, lo que
    queda siempre en el principal, y la tabla que lleva a `references/reading.md` (77 líneas,
    el texto de lectura sin cambios de fondo) o a `references/units.md` (116 líneas: qué
    unidad puede ir, la tabla de modelos de QT-41, los archivos compartidos, el commit de
    partida, el prompt, el caso sin worktree, el merge con re-verificación y los frenos).
    `units.md` nombra la forma del estado para un grupo en paralelo como de `nzt-plan`, que la
    escribe la 374. Puertas: build sin avisos, `check-references` *0 moved*, 164
    comprobaciones, lint 0 problemas.
  - **Hecho (unidad 374, 2026-10-25).** `nzt-plan` suma `references/parallel.md` (53 líneas:
    cuándo se ofrece un grupo, `group`, `model`, `work_branch`, el grupo frena una vez al
    final, y cómo se ve en el estado) y lo nombra en su esquema; el `SKILL.md` sigue en 199.
    `proposal.md` muestra el grupo, el modelo de cada unidad y la rama, que se aprueban con
    el plan. §7 al día. `state check` acepta varias `doing` de un mismo grupo y rechaza dos
    grupos a la vez, `group` vacío, `model` fuera de `small`/`main` o sin `group`, un grupo
    en dos fases y grupos sin `work_branch`: 7 comprobaciones nuevas, 171 en total. El panel
    `nzt-state` ya filtraba todas las `doing`, así que no se rompe; mostrar los grupos queda
    fuera, como dijo el plan. Puertas: build sin avisos, lint 0 problemas.
  - **Hecho (unidad 375, 2026-10-25).** La hard rule del kernel pasa a *"Delegate only
    reading, and the units an approved plan marked parallel, per `nzt-delegate`; the plan,
    the state and decisions stay yours"*, en dos líneas: kernel en 150, `CLAUDE.md` y
    `AGENTS.md` en 164 (C3: 200). README: la fila de `nzt-delegate` y *"No usa agentes,
    subagentes ni MCP"*, que ya era falso desde D71, pasa a decir qué delega y que sin
    subagentes todo corre en la conversación. §2 y la regla 6 de §10 al día. 171
    comprobaciones, lint 0 problemas. **Sin probar en vivo:** que un plan real arme un grupo
    y lo reparta.
  - **La 376 (evals) la descartó el usuario** el 2026-10-25: lo prueba en local antes del
    release. Ningún caso de `evals/` mide los grupos en paralelo ni el modelo chico de QT-41.
    - **Hecho comprobable sin resolver:** si un subagente de Codex carga el `AGENTS.md`
      global (unverified arriba). No se pregunta: se prueba en la unidad 372.
- **D85.** **El set se revisa contra D83, y cada regla queda con un solo dueño.** Lo que la
  forzó: el pedido del usuario (2026-10-28) de revisar skills y references para que sean
  genéricas, sin redundancia, mantenibles, modulares y livianas en contexto, sin perder
  funcionamiento. Es la revisión que D83 dejó *"para que la decida el usuario"*. La revisión
  (unidades 377-386, sólo lectura) está en `Plan/mejoras/08-revision.md`: 52 hallazgos, 13
  errores y 7 patrones de repetición. El más grande: el router repite a sus referencias en
  seis fases. Las decisiones son las de ese documento (su log QT-01 a QT-12, una serie
  propia, distinta de la de esta spec). Todas las respondió el usuario el 2026-10-28 y en
  todas eligió la opción recomendada:
  - **Router transversal (QT-01):** regla 20 de §10.
  - **Un solo cierre (QT-02, corregida por QT-12):** regla 21. Los índices de la regla 14
    quedan: sacarlos contradecía esa regla, y el hallazgo que lo pedía (L6) estaba mal.
  - **Preguntas (QT-03):** `nzt-plan` es dueño de qué se pregunta, cómo y las dos salidas, en
    una referencia propia; el kernel conserva el formato visible. `nzt-architecture` conserva
    las tres clases, los modos y el log `QT`. Cada serie de ids la numera el log de la fase
    que responde: una pregunta de negocio que abre UX se escribe en `analysis.md` como `Q-NN`.
  - **Copias para el worker (QT-04):** regla 22.
  - **Ruteo de la capa genérica (QT-05, corregida por QT-13):** `practices-*` se quedan como
    las dos referencias índice de la regla 13, sin la cabecera y el cierre que repetían
    (G2). La columna de costo de `stack-axes.md` pasa a sus tablas, y `stack-axes.md` las
    lee. La tabla de stacks del router se deja. QT-05 las pasaba al router de build; en la
    394 el usuario notó que así toda unidad carga las tablas de las dos áreas (70 líneas
    medidas, también en .NET, que nunca las usa) y eligió volver.
  - **Etiquetas (QT-06):** regla 9. Un solo vocabulario de procedencia, el de `nzt-research`
    (`documented / observed / inferred / unverified`), que adopta el explorador.
  - **Kernel y `nzt-plan` (QT-07):** regla 23. `nzt-plan` baja del tope con
    `references/state.md`, que tiene el esquema y las reglas del estado.
  - **Clasificar (QT-08):** una sola tabla en `nzt` (tipo de pedido × terreno → tamaño y
    fase de inicio). `slices.md` y `proposal.md` citan el tamaño en vez de redefinirlo.
  - **Criterios con id (QT-09):** cada criterio lleva un `CA-NN` estable, que no se reusa.
    Lo que UX, verify y bug ya citaban pasa a ser correcto. `close.md` deja de decir que los
    criterios no tienen id.
  - **`nzt-learn` (QT-10):** sólo `assess` da el veredicto `achieved`.
  - **Filas de ruteo del kernel (QT-11):** sin cambio. Sin evals no se puede medir si
    recortarlas empeora el ruteo.
  - **Detalles dentro del alcance:** modo *propuestas*, elegido por el usuario. Son 20 (M1,
    M4, M9, D3, D4, D5, A1, A6, B3, B4, B6, G3, S1, S3, U4, U5, V2, V3, L2, L3), resueltos como
    los propone `08-revision.md` y marcados como del agente. M1 corrige la contradicción
    entre el kernel y el tamaño directo de D78: el directo no escribe estado.
  - **Dónde se aplica:** tramo S2, unidades 388-398, una por skill o capa; 399 corre las
    puertas del repo y 400 cruza cada hallazgo con lo hecho. Cada unidad trae al día la
    sección de esta spec que describe lo que cambia (§4.2 routers, §4.5 capa genérica, §7
    estado, §8 criterios). **No cambia el comportamiento**: es reestructura (D83, regla 18),
    salvo los 13 errores, que se arreglan.
  - **Hecho (388, 2026-10-28).** Kernel: el bucle se escala por tamaño y el directo no
    escribe estado aunque exista (M1); el cierre de unidad es una línea que remite a
    `nzt-plan` y los frenos de tanda se quedan (151 líneas; `CLAUDE.md` y `AGENTS.md` en 165).
    `nzt`: una tabla pedido → tamaño → dónde empieza, otra de tamaño → cómo corre, y la fase
    se llama siempre *analysis* (M4).
  - **Hecho (389, 2026-10-28).** `nzt-plan` baja de 200 a 149 líneas:
    `references/state.md` (48, el esquema; revisa D74, §7 al día) y
    `references/questions.md` (55: dónde surge, antes de preguntar, cómo, qué log numera cada
    serie, las dos salidas). *Resuming* remite a `nzt` §1. `slices.md` y `proposal.md` citan
    el tamaño y los obligatorios en vez de redefinirlos; *tramo de análisis* en lugar de
    *discovery*, también en `mockup.md`. **Desvío de V3** (propuesta del agente): el dueño de
    *verify después del tramo* es el paso 2 de *Building the plan* y no `slices.md`, porque
    un plan estándar no lee `slices.md`. Las fases que preguntan suman `questions.md` a su
    *Read with* en 391-393.
  - **Hecho (390, 2026-10-28).** El explorador etiqueta con las cuatro de `nzt-research`
    (`observed`, el proyecto lo mostró: una línea leída o un comando corrido; `documented`,
    `inferred` y `unverified`) en lugar de `seen / inferred`, en `.md` y `.toml` (QT-06).
    `reading.md` remite al archivo del agente para la forma de la respuesta, como `units.md`
    con el worker, y deja de repetir el lema del router (M9). El worker, en `.md` y `.toml`,
    carga un router de área sólo desde el de su fase (QT-04): los bloques largos quedan en el
    de build. Ningún test ni caso de `evals/` dependía del texto viejo.
  - **Hecho (391, 2026-10-28).** Router de discovery de 114 a 86 líneas: *Rules* queda con
    dos reglas de toda la fase (las reglas viven en la feature con slug y `origin:`; lo no
    sabido es un `Q-NN`) y un *Done when* que remite al de cada referencia; sin checklist.
    Las 10 reglas y los 7 ítems que salieron ya estaban en `analysis.md`, `write-spec.md`,
    `write-stories.md`, `product.md` y `reverse.md` (D1, QT-01, QT-02). Las filas de
    entrevista e ingeniería inversa leen `questions.md` de `nzt-plan` (QT-03). Criterios con
    `CA-NN` en `write-stories.md`, el ejemplo de `change.md` y `close.md` (QT-09, §8 al día).
    El ejemplo del merge lleva `qa —` (D4). `write-stories.md` y `write-spec.md` remiten la
    cadencia a `slices.md` (D3). `nzt-research` no cambia: ya era el dueño del vocabulario.
  - **Hecho (392, 2026-10-28).** Router de arquitectura de 200 a 166 líneas: conserva las
    tres clases de pregunta y los modos (QT-03), suma *Mandatory* con el stack obligatorio
    (regla 23; sale de `stack.md`), *Rules* con seis reglas de toda la fase y un *Done when*
    sin checklist (QT-01, QT-02). Nueva `references/decisions-log.md` (74): dónde vive el log,
    su forma, cómo se agrega y las etiquetas de origen (A1). Las filas de producto, stack y
    feature la leen junto con `questions.md` de `nzt-plan` (QT-03). Las etiquetas se fijan por
    su significado y se escriben en el idioma del proyecto; un hecho lleva la etiqueta de
    `nzt-research` en lugar de `investigado`, y el ejemplo queda en un solo idioma (A4,
    QT-06). Salen las aperturas *"load it first"* de las dos de diseño (QT-04) y sus copias
    de reglas del router: `design-product.md` 176→147, `design-feature.md` 200→166.
    `stack-axes.md` cierra con *Done when* y deja de repetir *no se re-pregunta*.
  - **Hecho (393, 2026-10-28).** Router de UX de 121 a 92 líneas: *Rules* con dos reglas de
    toda la fase (mecanismo en el sistema, contenido en la historia; lo indefinido es un
    `Q-NN` abierto en `analysis.md`) y un *Done when* que remite al de cada referencia, sin
    checklist (U2, QT-01, QT-02). Las otras nueve reglas ya estaban en `screen.md` y
    `system.md`. La fila de pantalla lee `questions.md` de `nzt-plan`, y `screen.md` abre el
    `Q-NN` en `analysis.md` (U6, QT-03). Las mediciones de un HTML (320 px, contraste sobre
    pares reales, teclado, no verificado si no se pudo abrir) viven sólo en `review.md`
    (*Measuring an HTML file*, con índice por pasar de 100); mockup, prototipo y manual la
    leen por *Read with*, y el ejemplo de `system.md` deja los umbrales y muestra cómo se
    cumplen (U4). El tono del manual se fija por lo que hace la palabra, no por una lista
    rioplatense (U3, QT-06). Cuándo se ofrece el prototipo queda en `slices.md`; `product.md`
    y `mockup.md` dejan de decirlo (U5). U1 ya se resolvió en la 391.
  - **Hecho (394, 2026-10-28).** Router de build de 169 a 144 líneas. Gana *Read the stack
    first* y *Two escapes*, los bloques largos que QT-04 deja sólo acá y en el worker, y la
    regla de que la referencia genérica dice qué vale y el stack cómo se hace, una sola vez
    para las dos áreas. *Rules* queda con ocho reglas de toda la fase y un *Done when* que
    remite al de cada referencia, sin checklist (B1, QT-01, QT-02). `practices-*` se quedan
    como índices (QT-13, que corrige QT-05: las tablas estuvieron en el router y lo dejaban en
    200 líneas cargadas en toda unidad), sin la cabecera, la línea de `code-code.md` ni el
    cierre que repetían (G2): 69→52 y 45→25. La convención de comentarios pasa a
    `code-code.md`, que lee todo camino que escribe código, incluido el de C# (**desvío de
    B1**, que la dejaba en el router; propuesta del agente, hecha por el tope de 200 y que se
    mantiene porque ése es su dueño). `implement.md` de 153 a 94: sin las copias del router,
    marcadores en una línea (`[modify]` y `[SPEC-CONFLICT]`, los que usa quien implementa;
    B4), sin las reglas de frontend, que ya tenían dueño (B6, G4), y un solo cierre (B3).
    `tdd.md` remite al *Done when* de `implement.md`; `refactor.md` y `remove.md` funden
    *Closing* en *Done when*; `tests.md` y `dependencies.md` dejan de repetir el límite con
    verify y la regla del manifiesto. Sin pérdida: `check-extraction.sh` contra `HEAD`, con
    lo reescrito revisado en `Plan/mejoras/extraccion/build-*.reviewed`.
  - **Hecho (395, 2026-10-28).** La columna de costo de cada valor de eje pasa a las tablas
    de `practices-*`, y `stack-axes.md` deja de copiar los valores: los lee de ahí, y la fila
    de stack del router de arquitectura suma el `practices-<area>.md` del área (A5, G5). Así
    un valor nuevo se agrega en un solo lugar y ya se ofrece al escribir el stack.
    `stack-axes.md` de 89 a 78. La guarda del agregado mínimo tiene un dueño,
    `backend-domain-ddd.md`; `data-mapping.md` se queda con cómo se carga y la nombra en una
    línea (G3). Las 30 referencias de la capa ya cerraban sólo con checklist, como pide la
    regla 21 para las de práctica de código, y las de más de 100 líneas ya tenían índice:
    nada que cambiar (QT-02). G2 se resolvió en la 394. Sin pérdida: `check-extraction.sh`,
    con lo reescrito en `Plan/mejoras/extraccion/*.reviewed`.
  - **Hecho (396, 2026-10-28).** Los routers de .NET, Blazor y ship .NET dejan *load it
    first*, las viñetas de *Read the stack first* y *Two escapes*: los dice el router de build
    (QT-04, regla 22). Cada uno conserva la ruta de su stack y una línea con su evidencia de
    versión (`TargetFramework`, el manifiesto, `global.json`) (S2). La tabla de Blazor gana el
    eje *Component organisation* (`inline` / `code-behind`), así se pregunta al escribir el
    stack (S1). Las filas de EF Core dejan de repetir `ef-core.md`, que el párrafo ya exige, y
    paginar cita la fila de lectura (S3). Las fórmulas de nombre quedan (S4, QT-04). Las
    checklists de los tres routers pasan a *Done when*; C# conserva la suya por ser práctica de
    código (regla 21). .NET 128→105, Blazor 100→79, C# 153→150, ship .NET 58→54.
  - **Hecho (397, 2026-10-28).** Router de verify de 195 a 141 y de ship de 133 a 89: *Rules*
    con lo de toda la fase y *Done when* que remite al de cada referencia, sin checklist (V1);
    *Authorisation* de ship queda en una línea que remite a `release.md`. El mecanismo de
    datos de prueba es la opt-in *Test data* del stack: se lee, y sólo si falta se pregunta con
    el plan (V2; router, `test-data.md`, `test-design.md`). *When it runs* cita `nzt-plan` y
    `slices.md` (V3). `bug.md` cita lo violado como `US-NNN CA-NN`.
  - **Hecho (398, 2026-10-28).** Router de learn de 118 a 93: la inversión, los bucles, la
    tabla, *Where it lands* y tres reglas; el registro de `progress.md` tiene dueño en
    `plan.md` (L4). Sólo `assess` escribe `achieved`: `tutor.md`, `teach.md` y el router lo
    dicen (L1, QT-10). Un repaso no escribe archivo y su evidencia es su línea del log (L2). Un
    veredicto nuevo entra al primer escalón y el ejemplo de `plan.md` pasa a 2026-09-26 (L3).
    La regla *"How much do you know?" devuelve una sensación* sólo estaba en el router y pasó a
    *Probe* de `plan.md`. L5 sin cambio (QT-04); L6 descartado (QT-12).
  - **Hecho (399, 2026-10-28).** `nzt-ai lint` (y `verify`, su alias), `build.sh`,
    `check-references.sh` y los 171 checks del instalador pasan; ningún `.md` supera 200
    líneas; las 336 citas a `references/*.md` y las 278 por nombre resuelven.
  - **Hecho (400, 2026-10-28).** Los 52 hallazgos, cruzados con lo hecho en
    `08-revision.md` §400. La entrada de esta spec para 396-398 se escribió en la 400: esas
    unidades no la habían agregado.
- **D86.** **Lo visual que produce NZT se revisa contra el aspecto por defecto de un modelo,
  con una sola guía que leen UX y build.** Lo que la forzó: el pedido del usuario
  (2026-10-29) de corregir el *AI slop* en las aplicaciones visuales. La investigación y el
  log de preguntas (QT-01 a QT-03, serie propia de ese documento) están en
  `Plan/mejoras/09-ai-slop.md`. Lo que sostiene la decisión:
  - documented: sin dirección, un modelo converge en las elecciones más comunes de su
    entrenamiento, y prohibir unas lleva a converger en las siguientes (Anthropic,
    *Improving frontend design through Skills*, 2025-11-12). inferred: una lista de
    prohibiciones usada para generar produce el próximo cliché; lo que lo evita es anclar
    cada decisión en el sujeto, y la lista sirve para revisar.
  - Lo que ya había: `system.md` hacía esa pasada con 6 señales, sólo al fijar la dirección
    visual de un producto que no tenía. Mockup, prototipo, manual, la revisión y el front que
    escribe build no la hacían (huecos H1 a H7 de `09-ai-slop.md`).
  - **Alcance (QT-01, opción B):** una referencia nueva, `ux/references/generic.md`, con el
    método (sujeto, plan visual antes de construir, revisión del plan contra el pedido,
    audacia en un lugar, nota de lo ya probado) y el catálogo de señales. `system.md` la cita
    en lugar de su lista; mockup, prototipo, manual y review la leen y la tienen en su *Done
    when*. **Queda afuera un detector determinista** en `nzt-ai` (H7): el usuario no lo eligió.
  - **Trabajo directo (QT-02):** `nzt-build` la lee siempre que escribe una pantalla de
    front, haya pasado o no por la fase UX. Es el caso más común y antes no leía nada de esto.
  - **Catálogo (QT-03):** nombra tipografías, paletas y patrones concretos (Inter, el
    indigo, crema con terracota, el `→` en cada botón), **sólo como lista de revisión**,
    nunca como prohibición al generar. Las fuentes viven en `09-ai-slop.md` y en esta
    entrada, no en la referencia: no cambian lo que el agente hace y envejecen (corregido
    el 2026-10-29 a pedido del usuario; ninguna otra referencia del set cita fuentes).
  - Respondidas por el usuario el 2026-10-29: QT-01 y QT-03 con la opción recomendada; QT-02
    con *sí, se lee siempre que se hace front, además de en UX*.
  - **Dónde se aplica:** unidades 402-405 (la referencia, `system.md`, el router de UX y sus
    tres referencias, `nzt-build`); 406 corre las puertas del repo y cruza cada hueco. **Cambia
    el comportamiento** de las fases UX y build: suman una lectura y un ítem de cierre.
  - **Hecho (402-405, 2026-10-29).** `generic.md` (98 líneas, sin sección de fuentes): plan visual de seis pasos (el
    design system es el plan si existe), revisión del plan contra el pedido, *Tried, not
    repeated*, la tabla de señales en 8 áreas como pregunta y la pasada en cuatro pasos.
    `system.md` 132→125: *Visual direction* en tres pasos y *Rejected directions* en *Brand
    and voice*. El router de UX la suma al *Read with* de system, mockup, prototipo, manual y
    review; los tres primeros archivos la corren sobre lo renderizado y la tienen en su *Done
    when*. Un tell del tema ya adoptado es propuesta al design system, nunca una segunda
    paleta; en review es `construction` o `missing convention`. El router de build (144→146)
    la lee al escribir lo que una persona ve, para todo camino, y `frontend-components.md`
    suma el ítem a su checklist.
  - **Hecho (406, 2026-10-29).** Puertas limpias (lint, build, 171 checks del instalador, tope
    de 200, citas), H1-H6 cruzados en `09-ai-slop.md` §406. **No medido:** que la guía mejore
    lo generado; no hay eval visual.
- **D87.** **`nzt-retro`: una skill a pedido que revisa sesiones y deja propuestas sobre el
  entorno en un md fuera del repo, sin cambiar nada.** Lo que la forzó: el pedido del usuario
  (2026-10-29) de analizar la skill `retro` de Matt Pocock y tener algo así en NZT, pensado
  para revisarlo en equipo. Nada en NZT convertía los tropiezos de una sesión en mejoras: las
  lecturas de `nzt-verify` miran el código y los documentos, no la sesión. Decisiones y log
  (QT-01 a QT-07, serie propia) en `Plan/mejoras/10-retro.md`:
  - **Skill propia** y no una referencia de `nzt-verify` (la recomendada por el agente). Su
    objeción, dicha una vez: suma una entrada al listado de skills y el frontmatter no puede
    llevar `disable-model-invocation` (C1), así que **la descripción es el único freno** y dice
    que corre sólo cuando el usuario pide una retro.
  - **Nunca se ofrece (QT-02)**: ni al cerrar una run ni al recomendar limpiar. Por eso no
    tiene fila en la tabla de ruteo del kernel, que es de fases (como `nzt-research` y
    `nzt-delegate`), y la unidad 410 se quitó.
  - **No modifica nada**: ni skills, ni referencias, ni código, ni documentos, ni el estado. Su
    único producto es el md. Aplicar una propuesta es otro pedido, con su propio tamaño.
  - **El md no va al repo (QT-01, QT-05)**: se escribe en la ruta que el usuario elige cada vez,
    con una sugerencia fuera del repo; si la ruta cae dentro de uno, lo avisa antes.
  - **Qué lee (QT-06)**: la sesión actual, o las últimas N si se pide. documented: Claude Code
    guarda cada sesión en `~/.claude/projects/<proyecto>/<id>.jsonl`, en un formato interno que
    cambia entre versiones, la borra a los 30 días y **guarda lo que una herramienta leyó o
    imprimió, credenciales incluidas** (https://code.claude.com/docs/en/claude-directory,
    leído 2026-10-29). Por eso varias sesiones son sólo de Claude Code, se leen de a una por
    subagente, y el md nunca copia un valor de la sesión. unverified: cómo guarda Codex sus
    sesiones; ahí, sólo la actual.
  - **Sobre qué propone (QT-07)**: el proyecto y NZT, en secciones separadas. Cada propuesta
    se ata a un momento de la sesión (lo genérico se descarta), dice si el error es mecánico
    (destino: un chequeo) o de criterio (destino: una regla), y queda en `estado: propuesta`
    para que el equipo la mueva. De Pocock vienen el atado al momento, chequeo antes que regla y
    que un repo sin chequeos sea un hallazgo; los destinos son los de NZT.
  - **Detalles (QT-04)**: propuestas del agente, en `10-retro.md` §Detalles.
  - **Dónde se aplica:** 409 la skill, 411 listado, build, README y eval de disparo, 412 las
    puertas y una retro real sobre la sesión que la diseñó.
  - **Hecho (409, 411, 2026-10-29).** `skills/nzt/retro/SKILL.md`, 141 líneas y sin referencia;
    description de 183 caracteres que dice que corre sólo a pedido. El listado pasa de ~2684 a
    ~2898 caracteres y de 15 a 16 skills (README al día). Caso `evals/routing/retro`: dispara
    por la descripción y pregunta la ruta antes de escribir. **No corrido**: que la descripción
    alcance para dispararla, y que no dispare sola, no está medido.
  - **Hecho (412, 2026-10-29).** Build sin avisos, 171 checks del instalador, ningún `.md` pasa
    de 200 líneas. **No corrido**: el chequeo de citas (no se encontró su comando). Retro real de
    esta sesión siguiendo la skill del repo: el md quedó en el escritorio del usuario, fuera de
    todo repo, con cinco propuestas (R-01 a R-05) y dos descartes; no se tocó nada más.
- **D88.** **Global queda solo el marco genérico; lo de una tecnología, una arquitectura o las
  reglas de código del usuario son packs que se instalan por proyecto con `nzt-ai project`, con
  sus MCP, y el documento técnico es uno solo: `Docs/Architecture/tech.md`.** Deroga D18. Lo
  que la forzó: el pedido del usuario (2026-11-01) de un marco que sirva para cualquier
  producto —juego, sistema, documento—, sin redundancia y corto, con lo propio de cada
  proyecto instalado en el proyecto igual que un MCP, y un CLI que haga el setup y que el
  agente sepa correr. Run `marco-generico`, unidades 413–424; traspaso y mapeo de nombres en
  `Plan/mejoras/11-marco-generico.md`.
  - **QT-01, packs medianos:** `code`, `backend`, `frontend`, `ddd`, `csharp`, `dotnet`,
    `blazor`, `unity`. Cada uno con `pack.json` (`description`, `requires`, `mcp`) y a lo sumo
    una skill `nzt-<pack>`; `unity` es solo el MCP oficial de Unity. Los MCP: Microsoft Learn
    (http) en `csharp`, `dotnet` y `blazor`; el relay de `com.unity.ai.assistant` (stdio, un
    comando por plataforma) en `unity`.
  - **QT-02, Claude Code y Codex:** skills en `.claude/skills/` o `.agents/skills/`, MCP en
    `.mcp.json` o en un bloque delimitado de `.codex/config.toml`. `.nzt/project.json`
    versiona qué se eligió y qué escribió `nzt-ai` (`specs/nzt-installer.md` sección 13).
    **[modify] 2026-11-01: D89.** El registro pasa a `.claude/nzt.json` y `.agents/nzt.json`.
  - **QT-03, sin migración** desde los `<area>-stack-<componente>.md`: quien quiera, pide
    armar `tech.md` a partir de los viejos.
  - **QT-04, `Docs/Architecture/tech.md`:** una sección por componente con su `root`, sus
    áreas, **sus packs**, una decisión por fila, los opt-ins (los del núcleo más los de cada
    pack), dependencias y convenciones. Lo escribe `nzt-architecture` (`references/tech.md`):
    deriva las decisiones de lo que es el componente, propone packs con `nzt-ai project packs`,
    los instala con `add` tras el sí, y pregunta los `## Axes` y `## Opt-ins` del `SKILL.md`
    de cada pack, escritos como el pack los nombra. Borradas `stack.md` y `stack-axes.md`.
  - **El filtro de D18 sigue, sobre los packs:** el kernel (*Packs*) carga los que `tech.md`
    lista para lo que se toca, y los que cada uno pide primero (`dotnet` lee `backend`,
    `csharp` y `code`); instalado y no listado no aplica. Así `tech.md` lista solo el de
    arriba. La regla genérica vive en `code`, `backend` o `frontend`, y en un pack de
    tecnología solo lo propio, que abre nombrando su genérica.
  - **Reescritura sin redundancia:** kernel, routers y referencias globales y de packs, con
    pasos numerados y un *Done when* de una o dos líneas en lugar de las listas de cierre. De
    6177 a ~3000 líneas en los packs y de 1187 a ~700 en `nzt-learn`, `nzt-research` y
    `nzt-retro`. Quedan 12 skills globales con 60 referencias y 8 packs con 77.
  - **Verificación:** 230 comprobaciones del instalador (20 de `project`, MCP y lint de
    packs); `install/build.*` valida `packs/` y los copia a los fixtures de evals;
    `check-extraction.sh` y `check-references.sh` se borraron, porque probaban migraciones
    contra `main` que este árbol ya no tiene. Los evals pasaron a `tech.md` y a los packs
    sembrados como skills de proyecto, con el caso nuevo `routing/pack-setup`. **Ningún eval
    corrido** (decisión del usuario, por costo).
  - **Sin verificar:** que Codex lea `url` para un MCP HTTP en el `config.toml` de proyecto, y
    que el relay de Unity acepte la ruta absoluta de `{home}` en Windows.
  - **Pendiente:** la unidad 424 (puertas y smoke de `project` en una carpeta temporal) y la
    versión: 4.0.0 propuesta, porque cambian nombres de skills y el documento técnico.
    **[modify] 2026-11-01:** la 424 se hizo; la versión la cierra D89.
- **D89.** **Antes de trabajar, el agente prepara el trabajo con el usuario como con alguien
  que no sabe nada; los MCP que no trae un pack van en el archivo del proyecto; el diseño
  vive en `Docs/Design/`; y la versión es 4.0.0.** Lo que la forzó: al explicarle QT-06, el
  usuario dijo lo que quería de verdad (2026-11-01): que el agente ofrezca y explique todo lo
  necesario para trabajar —packs, MCP, herramientas, lo que hace el usuario a mano, lo que el
  agente no puede, qué tener en cuenta—, como hizo Claude solo con un juego de Unity, escrito
  en términos de *el trabajo* y no de *el componente*. Run de las unidades 432–436; el debate
  en `Plan/mejoras/12-debate-marco.md`.
  - **Preparación para trabajar (432):** `nzt-architecture`'s `references/tech.md`, paso 4
    *Prepare the work*. En una ronda: qué hará el agente y qué necesita, cómo se cubre
    —catálogo e investigación siempre, con fuente y fecha, y la contradicción con un pack
    dicha—, lo que el usuario hace a mano paso a paso, lo que el agente no puede y qué tener en
    cuenta. Con el sí instala en el proyecto y guía; el paso 7 comprueba que cada herramienta
    responde (un MCP, en la sesión nueva). `tech.md` anota en *Agent tools* quién instaló cada
    cosa, en pocas palabras, nunca los pasos: el cómo vive en el pack o en la fuente citada.
    El eval `routing/tool-research` suma el grader `explained-for-a-newcomer` (433).
  - **QT-06, MCP que no vienen de un pack: A.** Queda en el archivo de MCP del proyecto
    (`.mcp.json` o `.codex/config.toml`) y viaja con git; `nzt-ai` no lo registra en su
    registro ni lo toca.
  - **El registro de `nzt-ai project`, en la carpeta del proveedor (437):** al probar 4.0.0 en
    local el usuario no quiso una carpeta `.nzt/` más en la raíz. `.nzt/project.json` pasa a
    `.claude/nzt.json` y `.agents/nzt.json`, el mismo en las dos, junto a las skills que
    describe; uno viejo se lee y el próximo `add`, `remove` o `sync` lo mueve. Se descartó
    sacarlo del todo: sin él, actualizar pisaría una skill de pack editada sin avisar y sacar
    un pack no distinguiría los pedidos de los requeridos. Modifica D88 (QT-02).
  - **QT-07, carpetas de diseño (434):** `Docs/UX/` pasa a `Docs/Design/` y
    `Plan/specs/<feature>/ux-ui/` a `design/`, en `nzt-design`, `nzt-architecture`,
    `plan/close`, el pack `frontend` y el eval `design-mockup`. **Un proyecto que ya tiene las
    carpetas viejas se sigue leyendo y escribiendo ahí** hasta que el usuario las mueva, nunca
    en las dos. Modifica D47, D57 y D76.
  - **QT-05, versión 4.0.0 (436):** mayor, porque se van las skills de stack globales, llegan
    los packs por proyecto y se renombran fases y carpetas (`ux` → `design`, `analysis` →
    `discovery`, `Docs/UX/` → `Docs/Design/`). En `Nzt.Cli.csproj`, `install/build.*`, `README.md`
    e `installer/README.md`. **Sin tag ni release**: el usuario lo prueba en local antes.
  - **Verificación (435):** build sin avisos, 235 comprobaciones, lint 0 en 12 skills y 8
    packs, los 36 scaffolds de evals corren, `state check` ok. **Ningún eval corrido.**
  - **Abiertos:** DB-01 (ceremonia) y DB-04 (protocolo y flujos) en el debate, para después.
- **D90.** **Skills, referencias y packs, reescritos genéricos, sin redundancia y en pasos
  simples, con `skill-creator`.** Lo que la forzó: el pedido del usuario (2026-11-01) de
  hacer menos y unificar mejor, con el ejemplo de los DTOs de C# en tres reglas. Run de las
  unidades 438–457; el relevamiento y las preguntas en `Plan/mejoras/13-refactor-skills.md`.
  - **QT-92, cómo se escribe: B.** Con `skill-creator` de Anthropic, sin referencia NZT de
    autoría: el §10 sigue siendo el dueño. Donde `skill-creator` choca con el §10 (explicar
    el porqué, 500 líneas) manda el §10.
  - **QT-93, el porqué de una regla: B.** Una cláusula corta solo donde sin ella la regla se
    aplicaría mal.
  - **QT-95, qué entra en un pack: A.** Regla 24 del §10: elecciones y errores, no
    documentación ni traducciones de una regla genérica.
  - **La forma en cada archivo:** una regla por línea; *Done when* que no repite reglas; un
    dueño por regla y los demás lo nombran por nombre de archivo o sección, nunca por número.
    Sin cambios de nombres, filas de ruteo ni ejes de packs, salvo dos referencias de
    `dotnet` borradas porque todo lo suyo era del genérico (`security.md`,
    `persistence-direct.md`; la fila del eje apunta a la de `backend`).
  - **Medido con `wc -l` contra 94976a0:** packs 3.387 → 3.070 líneas y 77 → 75
    referencias; skills 4.008 → 3.970; kernel 136 → 135. En las skills se sacaron duplicados
    entre router y referencias; las plantillas y los procedimientos quedan.
  - **QT-94, evidencia: B.** No-pérdida por unidad contra HEAD (cada regla quitada sigue en un
    solo dueño) y puertas: build sin avisos, 240 comprobaciones, lint 0 en 12 skills y 8
    packs, `state check` ok, los paths que nombran los evals existen. **Ningún eval corrido.**
  - **Versión:** sigue **4.0.0**, sin tag: el refactor entra en la misma versión que el
    usuario todavía prueba en local (D89).
- **D91.** **NZT también se distribuye como plugin de Claude Code, con una skill de setup
  que escribe el bloque del kernel en un `CLAUDE.md`; `nzt-ai` sigue siendo la forma común a
  los dos proveedores.** Revisa D24 sin derogarla. Estado: **aceptada** el 2026-11-04,
  decidida por el usuario: la idea de la skill de setup es suya (2026-11-03), aprobó el plan
  cuya unidad 463 es esta decisión, y contestó Q-01 a Q-08 de `specs/nzt-plugin.md`. Rama
  `nzt-plugin-for-claude`, unidades 461–464.
  - **Lo que la forzó:** el usuario preguntó si NZT puede ser un plugin. D24 lo descartaba
    sobre todo porque el kernel (~12.300 caracteres) no entraba en el tope de 10.000 de un
    hook `SessionStart`. El refactor de D90 lo bajó: **`dist/CLAUDE.md` mide 7.946**
    (medido el 2026-11-03). Lo que sigue en pie de D24: un `CLAUDE.md` dentro de un plugin no
    se carga y las skills de un plugin llevan su nombre delante (C7).
  - **Opciones** (hechos de plataforma en C7 y C8):

    | Opción | Por qué perdió, o qué cuesta |
    |---|---|
    | Seguir sin plugin (D24) | Quien instala todo desde `/plugin` no tiene cómo traer NZT; el usuario pidió esa vía |
    | Plugin cuyo hook `SessionStart` inyecta el kernel | Quedan ~2.000 caracteres de margen y, si se pasa, el modelo recibe solo una vista previa sin aviso; el kernel llega como recordatorio y no como el `CLAUDE.md` que miden las evals; en Codex no sirve, porque sus hooks no corren sin revisión del usuario |
    | Output style con `force-for-plugin` | Pisa el estilo que eligió el usuario y saca las instrucciones de código de Claude Code salvo `keep-coding-instructions` |
    | `agent` en el `settings.json` del plugin | Reemplaza el system prompt entero de Claude Code |
    | **Plugin con skill de setup que escribe el bloque con un script** (elegida) | Ver *lo que se acepta* |

  - **Decisión:** el plugin trae las skills de NZT con los nombres `nzt:…`, una sola skill
    `/nzt:setup` que instala, actualiza, quita y muestra el bloque, global o en el `CLAUDE.md`
    del proyecto, y un aviso al empezar la sesión cuando el bloque quedó viejo. **El bloque lo
    escribe un script, no el modelo**: copiar ~8.000 caracteres a mano puede resumir o cortar
    una línea sin que nadie lo note (propuesta del agente, aceptada con el plan). Solo Claude
    Code: Codex queda `[TO-DEFINE]` hasta probar lo que C8 deja sin verificar (Q-01).
  - **Lo que se acepta:** **(1)** dos variantes del kernel que tienen que decir lo mismo salvo
    los nombres de las skills y la línea de guarda, controladas por el build (RN-plugin-mismo-kernel);
    **(2)** el bloque es una copia que queda vieja cuando el plugin se actualiza, hasta que el
    usuario corre `/nzt:setup` (Q-05); **(3)** desinstalar el plugin sin quitar el bloque lo
    deja huérfano, y la guarda del kernel lo anula con aviso (Q-07); **(4)** un bloque de
    proyecto viaja con el repo a compañeros sin el plugin: el agente propuso
    `CLAUDE.local.md` y el usuario eligió el `CLAUDE.md` del proyecto (Q-06); **(5)** un
    segundo canal de distribución que se mantiene y se prueba aparte.
  - **Revertirla:** sacar el plugin del marketplace. Quien lo tenga corre `/nzt:setup` para
    quitar el bloque, o la guarda lo anula cuando las skills desaparecen; `nzt-ai` no cambia.
  - **Reemplaza:** nada. D24 queda vigente para `nzt-ai` y para Codex; lo que cambia de D24 es
    que "NZT no se distribuye como plugin" ya no vale en Claude Code.
  - **Revisada por D92 el 2026-11-05**: el plugin no lleva setup ni escribe el bloque; el
    kernel va dentro de la skill `nzt:nzt`.
- **D92.** **En el plugin de Claude Code, el kernel va dentro de la skill `nzt:nzt`, que carga
  primero en toda sesión por su descripción: sin `/nzt:setup`, sin hook y sin escribir en
  archivos del usuario.** Revisa D91. Estado: **aceptada** el 2026-11-05, decidida por el
  usuario (QT-109, QT-110 en `specs/nzt-plugin.md`). Rama `nzt-plugin-for-claude`, unidades
  473–476.
  - **Lo que la forzó:** con el diseño de D91 nada le decía a quien instalaba el plugin que
    tenía que correr `/nzt:setup`, y desactivar el plugin no apagaba NZT, porque el bloque
    seguía en el `CLAUDE.md`. El usuario quería activar y desactivar NZT como cualquier plugin.
  - **Opciones** (investigadas en las docs de skills y hooks, `explanatory-output-style` de
    Anthropic y Superpowers):

    | Opción | Por qué perdió, o qué cuesta |
    |---|---|
    | D91 con un aviso del hook cuando no hay bloque | Sigue sin apagado limpio: el bloque queda en el archivo |
    | Hook `SessionStart` que inyecta el kernel (como `explanatory-output-style`) | Tope de 10.000 caracteres por texto y una pieza más que mantener; el usuario prefirió no depender de un hook |
    | Hook que inyecta una skill con el kernel (como Superpowers) | Mismo tope y mismas piezas |
    | **Skill `nzt:nzt` con el kernel, cargada por su descripción** (elegida) | Ver *lo que se acepta* |

  - **Decisión:** el build arma `nzt:nzt` con el kernel y `core/adapter-claude-skill.md`, y
    pasa la entrada de `skills/nzt` a su referencia `references/entry.md`. Se retiraron
    `/nzt:setup`, el hook, el bloque, sus pruebas y sus evals (unidad 476).
  - **Lo que se midió:** evals sin `CLAUDE.md`, 4 pedidos × 3 corridas: `nzt:nzt` fue la
    primera herramienta en 12 de 12 (474). En vivo, tras `/compact` Claude Code re-adjuntó
    `nzt:nzt`, y sin el plugin no quedó rastro de NZT (475).
  - **Lo que se acepta:** **(1)** que cargue depende de la descripción, no de una garantía de
    la plataforma: si un modelo futuro deja de cargarla primero, lo detectan los evals
    `skill/`, y el plan B es un hook de una línea que diga que se cargue; **(2)** ~2.200 tokens
    (estimación) en cada sesión, también para una pregunta (QT-110); **(3)** el kernel tiene que
    seguir entrando en los 5.000 tokens que Claude Code conserva de una skill al compactar.
  - **Revertirla:** volver a D91 desde el commit `db92912`.
  - **Reemplaza:** la parte de D91 sobre `/nzt:setup`, el bloque y el hook. Lo demás de D91
    —el plugin en el marketplace, los nombres `nzt:…`, `nzt-ai` como forma común— sigue.
- **D93.** **Las reglas de los packs viajan con el marco, en una skill por dominio:
  `nzt-software` y `nzt-games`, cada una con todas sus referencias a un nivel de su
  `SKILL.md`; `tech.md` sigue decidiendo qué pack aplica, y `packs/` queda como catálogo de
  MCP.** Revisa D88. Estado: **aceptada** el 2026-11-05, decidida por el usuario en el debate
  de la rama `nzt-plugin-for-claude`, unidades 478–484.
  - **Lo que la forzó:** con D92 el plugin no instala packs por proyecto, y sin `nzt-ai` no
    había cómo traerlos. Además, una historia .NET cargaba 4 o 5 skills en cadena (`dotnet` →
    `backend`, `csharp` → `code`) y siete descripciones de pack estaban siempre en contexto.
  - **Opciones** (hechos en las docs de plugins y en *Skill authoring best practices* de
    Anthropic, leídas el 2026-11-05):

    | Opción | Por qué perdió, o qué cuesta |
    |---|---|
    | Un plugin por pack, habilitado por proyecto, con `dependencies` | La misma cadena de skills y más piezas que publicar y versionar |
    | Un plugin por tecnología con lo genérico copiado | Varios plugins para instalar; el usuario quiere uno |
    | Dos plugins, software y juegos | La frontera no es del proyecto: un juego puede tener un backend |
    | Una skill `nzt-stack` con un índice por pack | Tres saltos de lectura: la guía pide referencias a un nivel del `SKILL.md` |
    | **Una skill por dominio, todo a un nivel** (elegida) | Ver *lo que se acepta* |

  - **Decisión:** `skills/nzt/software/` (`code`, `backend`, `frontend`, `csharp`, `ddd`,
    `dotnet`, `blazor`) y `skills/nzt/games/` (`unity`), con `references/<pack>/`. El orden
    genérico → específico lo dice el `SKILL.md`; ninguna referencia manda a leer otra primero.
    El dominio es del componente en `tech.md`: un proyecto mixto carga las dos. `packs/<pack>/`
    queda con `pack.json` solo donde hay MCP (`dotnet`, `blazor`, `unity`), y los MCP se
    proponen como cualquier herramienta (DB-03): en Claude Code con `claude mcp add --scope
    project`, en Codex con `nzt-ai project`.
  - **Lo que se acepta:** **(1)** `nzt-software` carga entero (~145 líneas; los costos de cada opción, solo al elegir, en `references/choosing.md`) en vez de solo los
    packs listados; **(2)** las reglas de todos los packs están en toda instalación, inertes
    hasta que `tech.md` las lista; **(3)** pasados los 500 líneas, `nzt-software` se parte por
    dominio otra vez.
  - **Revertirla:** devolver las referencias a `packs/<pack>/` con su `SKILL.md`.
  - **Reemplaza:** de D88, las skills de pack instaladas por proyecto. Siguen `tech.md`, sus
    packs por componente y "instalado no es autorización".
- **D94.** **El state check vive en `nzt-plan` como scripts (`scripts/state-check.ps1` en
  Windows, `state-check.py` en macOS y Linux), y el CLI `nzt-ai` queda como instalador.**
  Revisa D68. Estado: **aceptada** el 2026-11-06, decidida por el usuario. Rama
  `nzt-plugin-for-claude`, unidades 485–490 (tramo S2d).
  - **Lo que la forzó:** con D92 el plugin no instala `nzt-ai`, así que la hard rule de D68
    (*"donde esté instalado"*) no corría nunca en el plugin: los invariantes del estado
    volvían a depender del modelo.
  - **Decisión:** los dos scripts aplican las reglas, mensajes y orden de `StateCheck.cs`; la
    paridad la comprueban los checks del instalador (`StateScriptsMatchTheCli`, 69 corridas
    iguales con python, powershell y pwsh). La hard rule del kernel dice correr el state
    check de `nzt-plan`; `nzt-plan` dice cómo, y que si el script no corre (sin intérprete, o
    macOS pide las Command Line Tools) se revisa contra `references/state.md` y se avisa. El
    build y el instalador copian `scripts/` de cada skill byte a byte (el `.ps1` con BOM,
    porque PowerShell 5.1 lee sin él como ANSI).
  - **Lo que se acepta:** **(1)** dos implementaciones más de las mismas reglas, sostenidas
    por la prueba de paridad; **(2)** en un Mac sin Command Line Tools el chequeo es a mano
    (ver *El state check en macOS* en `specs/nzt-plugin.md`); **(3)** `nzt-ai state check`
    sigue existiendo, pero nada en el método lo nombra.
  - **Revertirla:** volver la hard rule a `nzt-ai state check` y quitar `scripts/`.
  - **Reemplaza:** de D68, el CLI como el que revisa. Siguen la regla en el kernel y lo que
    revisa.
- **D95.** **Una sola vía de instalación: también con `nzt-ai` (el `irm`), el kernel va
  dentro de la skill `nzt`, en Claude Code y en Codex, y nada se escribe en `CLAUDE.md` ni
  en `AGENTS.md`.** Revisa D92 y la nota del 2026-11-06 que dejaba el `irm` con el bloque.
  Estado: **aceptada** el 2026-11-06, decidida por el usuario (QT-113 en
  `specs/nzt-plugin.md`). Rama `nzt-plugin-for-claude`, unidades 491–496 (tramo S2e).
  - **Lo que la forzó:** el usuario quiere que las dos formas de instalar funcionen por la
    misma vía. Con el bloque, el `irm` y el plugin cargaban el método distinto, se medían
    distinto (las evals ya miden la skill, QT-111) y el `irm` escribía en archivos del usuario.
  - **Decisión:** la skill `nzt` es, en las tres formas, el mismo frontmatter
    (`core/skill-nzt.md`, la descripción que la hace cargar primero), el kernel y el
    adaptador del host: `adapter-claude-skill.md` en el plugin (nombres `nzt:`),
    `adapter-claude.md` en Claude Code y `adapter-codex.md` en Codex con el `irm` (nombres
    `nzt-`). El cuerpo de `skills/nzt` pasa a su `references/entry.md`. El build arma las
    tres (`dist/plugin/skills/nzt/`, `dist/claude-code/nzt/`, `dist/codex/nzt/`) y el
    instalador compone la misma, comprobada byte a byte contra el build. El instalador ya no
    planea el archivo de instrucciones: un bloque de una instalación anterior sale como
    huérfano (se quita entre sus marcadores y queda el texto del usuario), y un bloque
    editado se conserva y se informa, como antes.
  - **Lo que se acepta:** **(1)** en Codex no hay evidencia de que una skill cargue primero
    sin `AGENTS.md` (C8): si no carga, sus usuarios se quedan sin el método hasta corregirlo;
    el usuario lo probó en la 496 (2026-11-06) y cargó bien; **(2)** en Claude Code vale lo que D92 aceptó: que cargue
    depende de la descripción; **(3)** un `CLAUDE.md`/`AGENTS.md` con marcadores y sin
    manifiesto ya no se toca: si alguien lo tiene, el kernel llega dos veces.
  - **Revertirla:** volver a planear el bloque en el instalador desde el commit `2680c14`.
  - **Reemplaza:** de D92, que el bloque siga siendo la forma de `nzt-ai`. Siguen la skill
    con el kernel, su descripción y lo medido en 474 y 475.
- **D96.** **Sin packs: el agente ofrece las herramientas que el trabajo necesita, en
  cualquier fase, buscándolas en las fuentes oficiales; `tech.md` nombra solo tecnologías y
  prácticas; se van `packs/`, `nzt-games` y `nzt-ai project`.** Revisa D88, D89 y D93.
  Estado: **aceptada** el 2026-11-07, decidida por el usuario (QT-114 a QT-118). Rama
  `pendientes-post-v5`, unidades 497–507 (tramo S1), punto 1 de `specs/pendientes.md`.
  - **Lo que la forzó:** desde D93, `packs/` era solo un catálogo de cuatro MCP (Microsoft
    Learn en `csharp`, `dotnet` y `blazor`; el relay de Unity) que instalaba `nzt-ai
    project`: no instalaba skills y era una lista fija que envejece. Recomendar herramientas
    vivía solo en el paso 4 de `architecture/references/tech.md`, atado a elegir
    tecnologías, y ninguna regla decía cuándo usar la herramienta instalada ni qué gana si
    contradice una decisión. La línea `packs:` de `tech.md` repetía lo que ya dicen sus filas
    de tecnología y práctica. Y el usuario decidió que NZT queda para software (QT-114):
    `nzt-games` solo explicaba cómo conectar el MCP de Unity.
  - **Decisión:**
    - **El kernel tiene el *cuándo*** (sección *Agent tools*): `Docs/agent-tools.md` lista
      las herramientas del proyecto (MCP, plugins o ambos) y para qué sirve cada una. Si una
      cubre el trabajo de la unidad, se trabaja a través de ella. NZT y `Docs/` dicen lo
      decidido: ante una contradicción gana la decisión y se avisa. Cuando el trabajo, en
      cualquier fase, iría mejor con una herramienta que no está, el agente la **ofrece**,
      buscada en las fuentes oficiales y nunca de una lista de NZT; una rechazada no se
      vuelve a ofrecer.
    - **`nzt-research`'s `references/tools.md` tiene el *cómo*:** mirar lo instalado,
      buscar en fuentes oficiales, proponer con lo que hace y lo que instala, instalar en el
      proyecto con el sí del usuario (nunca con alcance de usuario ni global), comprobar que
      responde y registrarlo en `Docs/agent-tools.md` (*Use it for* / *Not for* /
      *Declined*).
    - **`tech.md` sin `packs:`.** La tarjeta declara áreas, tecnologías, las decisiones de
      arquitectura, las prácticas (*opt-ins*), dependencias y convenciones. Las *Agent tools*
      salen a `Docs/agent-tools.md`. `nzt-software` elige sus columnas por esas filas
      (`csharp` por *Language*, `dotnet` y `blazor` por *Framework*, `backend` y `frontend`
      por las áreas, `ddd` por *Domain model*), y el kernel pasa de *Packs* a *Software
      rules*.
    - **Se borran** `packs/`, `skills/nzt/games/` y el subcomando `nzt-ai project` (QT-115)
      con su catálogo, sus checks y el recurso embebido. En Codex, el agente escribe el MCP
      en `.codex/config.toml`, como ya hacía con los que investigaba.
  - **QT del run:** QT-114 · `nzt-games` se borra: NZT queda para software. QT-115 · `nzt-ai
    project` se va con los packs. QT-116 · todo el método pasa a un plugin `nzt-software`,
    y un `nzt-games` futuro sería otro plugin entero. QT-117 · se instala como
    `nzt-software` (skills `nzt-software:…`). QT-118 · primero este tramo; el reempaquetado
    (QT-116, QT-117) es el tramo S2.
  - **Lo que se acepta:** **(1)** sin catálogo, que el agente encuentre la herramienta
    depende de su búsqueda: nada la garantiza; **(2)** `routing/pack-setup` pasa a
    `routing/tool-setup` y su historial no es comparable; **(3)** los evals se arman pero no
    se corren (decisión del usuario, por costo).
  - **Revertirla:** volver `core/`, `skills/`, `agents/`, `packs/`, `installer/`,
    `install/` y `evals/` al commit `fcdbb4f`.
- **D97.** **El plugin de Claude Code pasa a llamarse `nzt-software`, y dentro de él las
  skills y los subagentes pierden el prefijo `nzt-`: `nzt-software:build`,
  `nzt-software:software`, `nzt-software:explorer`; el kernel queda `nzt-software:nzt`.**
  Revisa D91 y D92 (los nombres `nzt:…`). Estado: **aceptada** el 2026-11-07, decidida por
  el usuario (QT-116, QT-117 y la aprobación del plan del tramo S2). Rama
  `pendientes-post-v5`, unidades 509–515.
  - **Lo que la forzó:** QT-116 y QT-117 ya decidieron que el método se instala como un
    plugin `nzt-software`, para que un `nzt-games` futuro sea otro plugin. Con el prefijo,
    las skills quedarían `nzt-software:nzt-build` y la de reglas de código
    `nzt-software:nzt-software`: el nombre del plugin repetido en cada una.
  - **Decisión:**
    - **Solo cambia el plugin.** En el repo, en `dist/claude-code/` y `dist/codex/`, y en
      lo que instala `nzt-ai`, las skills siguen llamándose `nzt-<fase>`: ahí no hay
      espacio de nombres que las separe de las de otros. El método sigue nombrándolas
      `nzt-<x>`, y la regla del prefijo más largo para las references no cambia.
    - **El build hace el cambio** al armar `dist/plugin/`: la carpeta y el `name:` de cada
      skill `nzt-<x>` pasan a `<x>`, el `nzt` del kernel se queda como está, y el `skills:`
      de cada subagente apunta a `nzt-software:<x>`. Los subagentes se renombran igual
      (`explorer`, `worker`).
    - **El adapter del plugin traduce:** donde NZT nombra una skill o un subagente
      `nzt-<x>`, se carga `nzt-software:<x>`; `nzt` es `nzt-software:nzt`. El usuario
      invoca `/nzt-software:<name>`.
    - **El marketplace sigue llamándose `nzt`** y los mods (`nzt-state`, `nzt-changes`,
      `nzt-files`, `nzt-look`) mantienen su nombre: se instala `nzt-software@nzt`.
    - **Versión 6.0.0.** Cambia cómo se instala: quien tiene `nzt@nzt` lo desinstala e
      instala `nzt-software@nzt`; las notas de la v6.0.0 lo dicen.
  - **Lo que se acepta:** **(1)** el nombre de una skill en el plugin ya no es el del repo:
    al leer un log del plugin hay que traducir `verify` a `nzt-verify`; **(2)** los evals
    que esperan `nzt:nzt-…` se reescriben y su historial deja de ser comparable por nombre;
    no se corren (decisión del usuario, por costo); **(3)** quien no migre se queda en la
    v5 hasta que lo haga.
  - **Revertirla:** volver `install/`, `core/adapter-claude-skill.md`,
    `.claude-plugin/`, `installer/src/Nzt.Cli/Mods/` y `evals/` al commit `bc7ae46`.
- **D98.** **Cada producto en su carpeta: todo lo de hoy pasa a `nzt-software/`, las specs a
  `Plan/specs/`, y la raíz queda con lo que vale para todo el repo.** Revisa la sección 9.
  Estado: **aceptada** el 2026-11-07, decidida por el usuario (aprobó la propuesta en
  modo autónomo). Rama `pendientes-post-v5`, unidades 516–524 (tramo S3), punto 2 de
  `Plan/specs/pendientes.md`.
  - **Lo que la forzó:** `nzt-ai` va a tener otros productos además del método para
    software, y la raíz mezclaba el método, el CLI, los mods (que son solo de Claude Code),
    una demo y notas de runs viejos. `install/` e `installer/` tenían casi el mismo nombre.
  - **Decisión:**
    - **En la raíz:** `.claude-plugin/marketplace.json` (Claude Code lo lee de ahí),
      `.github/workflows/`, `Plan/` con `state.json` y `specs/`, el `README.md` como índice
      y `LICENSE`.
    - **En `nzt-software/`:** `method/` (`core/`, `skills/`, `agents/`), `evals/`, `mods/`,
      `build/` (lo que era `install/build.*`), `cli/` (lo que era `installer/`, con los
      scripts de una línea en `cli/install/`), `release/` (el README del plugin y las notas
      de cada versión), `presentation/`, `dist/` y su `README.md`.
    - **El CLI se queda en `nzt-software/cli/`**: hoy solo instala este producto. Si otro
      producto lo necesita, se saca entonces.
    - **El workflow pasa a `nzt-software-release.yml`** y el plugin se publica en la rama
      `plugin-nzt-software`: `plugin/nzt-software` no puede existir mientras exista la rama
      `plugin` de la v5, porque git no deja una rama y una carpeta con el mismo nombre.
    - **Los tags siguen siendo `vX.Y.Z`.** Los comandos de una línea bajan de
      `releases/latest/download/`, y GitHub tiene un solo *latest* por repo: si otro
      producto publica releases acá, rompe esos comandos. Se decide cuando haya un segundo
      producto (otro repo o tags con prefijo).
    - **`Plan/mejoras/` se borra**: eran notas de runs viejos; quedan en la historia.
    - **No cambia** el árbol `skills/nzt/<fase>` (los nombres salen de esa ruta) ni el
      contenido de las specs; partir este documento es otro punto.
  - **Lo que se acepta:** **(1)** los enlaces viejos a archivos del repo (`specs/…`,
    `install/…`) dejan de andar fuera de las tags anteriores; **(2)** que un mod ya
    instalado se actualice con la ruta nueva del marketplace no se probó en vivo.
  - **Revertirla:** volver el árbol al commit `d4dc246`.
- **D99.** **La spec fundacional se parte en cuatro archivos dentro de `Plan/specs/nzt-core/`,
  y el *latest* de los releases del repo queda fijo en nzt-software.** Cierra los dos puntos
  que D98 dejó abiertos. Estado: **aceptada** el 2026-11-08, decidida por el usuario (QT-119,
  QT-120). Rama `pendientes-post-v5`, unidades 525–529 (tramo S4).
  - **Lo que la forzó:** `nzt-core.md` tenía 5529 líneas: el diseño vigente (§1–11) quedaba
    enterrado bajo 4500 líneas de historia. Y los comandos de una línea bajan de
    `releases/latest/download/`: GitHub tiene un solo *latest* por repo, así que el release de
    un segundo producto los rompería.
  - **Decisión:**
    - **QT-119 · cuatro archivos**, con los números de sección intactos para que las citas
      viejas sigan valiendo: `README.md` (§1–11 y Fuentes, el diseño vigente),
      `decisions.md` (§12, riesgos y decisiones D1–D99), `temper-v3.md` (§13) y
      `build-status.md` (§14). Una decisión nueva se agrega al final de `decisions.md`.
    - **QT-120 · *latest* fijo en nzt-software.** Verificado en el manual de `gh release
      create` (cli.github.com, 2026-11-08): acepta `--latest` y `--latest=false`, y sin el
      flag GitHub elige el *latest* solo, por fecha y versión. nzt-software sigue con tags
      `vX.Y.Z` y su workflow publica con `--latest`. **Regla para cualquier producto
      futuro:** tags `<producto>-vX.Y.Z` y releases con `--latest=false`; sus comandos de
      instalación no usan `latest`.
  - **Lo que se acepta:** **(1)** quien busque una decisión por "nzt-core.md" la encuentra en
    `nzt-core/decisions.md`; **(2)** la regla de QT-120 depende de que el workflow del producto
    nuevo la cumpla: nada la hace cumplir sola.
  - **Revertirla:** volver `Plan/specs/` y el workflow al commit `9249e97`.
