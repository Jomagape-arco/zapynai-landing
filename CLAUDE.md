# Proyecto n8n — Entorno de Desarrollo

## Instancia n8n

- **URL:** `https://n8n-n8n-n8n.pkzggw.easypanel.host`
- **API base:** `https://n8n-n8n-n8n.pkzggw.easypanel.host/api/v1`
- **API Key:** disponible en `~/.claude/settings.json` → `mcpServers.n8n-mcp.env.N8N_API_KEY`

## Cómo interactuar con n8n desde este entorno

### API REST (siempre disponible)

Todos los workflows, credenciales y ejecuciones se gestionan vía REST:

```bash
# Listar workflows
curl -H "X-N8N-API-KEY: <key>" https://n8n-n8n-n8n.pkzggw.easypanel.host/api/v1/workflows

# Crear workflow (POST con JSON)
curl -X POST -H "X-N8N-API-KEY: <key>" -H "Content-Type: application/json" \
  -d '{"name":"Nuevo workflow","nodes":[...],"connections":{}}' \
  https://n8n-n8n-n8n.pkzggw.easypanel.host/api/v1/workflows

# Activar/desactivar
curl -X PATCH -H "X-N8N-API-KEY: <key>" \
  https://n8n-n8n-n8n.pkzggw.easypanel.host/api/v1/workflows/<id>/activate

# Ejecutar workflow manualmente
curl -X POST -H "X-N8N-API-KEY: <key>" \
  https://n8n-n8n-n8n.pkzggw.easypanel.host/api/v1/workflows/<id>/run
```

### MCP n8n (herramientas de documentación — requiere reinicio de sesión)

El servidor `n8n-mcp` está configurado en `~/.claude/settings.json`.
Proporciona estas herramientas de desarrollo (no de gestión):

| Herramienta | Uso |
|---|---|
| `search_nodes` | Buscar nodos disponibles en n8n |
| `get_node` | Obtener schema/docs de un nodo concreto |
| `validate_node` | Validar configuración de un nodo |
| `search_templates` | Buscar plantillas de workflows |
| `get_template` | Obtener JSON de una plantilla |
| `validate_workflow` | Validar el JSON de un workflow completo |

## Credenciales configuradas en n8n

| ID | Tipo | Nombre |
|---|---|---|
| `Ea34gIzAY1eOzsdB` | `openAiApi` | OpenAI account |

## Workflows existentes

| ID | Nombre | Estado |
|---|---|---|
| `xdML5XRSdvPn0rpC` | My workflow | Activo |

## Cómo pedirle a Claude que construya workflows

Usa estas fórmulas para obtener el mejor resultado:

### Diseño completo
> "Diseña y crea en mi n8n un workflow que [objetivo]. Usa el nodo [X] para [paso]. El trigger debe ser [webhook / schedule / chat]. Publícalo activo."

### Modificar workflow existente
> "Modifica el workflow `xdML5XRSdvPn0rpC` para que [cambio concreto]. Actualízalo vía API."

### Workflow desde plantilla
> "Busca una plantilla de n8n para [caso de uso] y créala en mi instancia adaptada a mis credenciales."

### Debug / diagnóstico
> "Muéstrame las últimas ejecuciones del workflow `xdML5XRSdvPn0rpC` y dime si hay errores."

### Construir desde cero con detalle
> "Construye un workflow de n8n que:
> - Se active con [trigger]
> - Haga [paso 1]
> - Luego [paso 2]
> - Y al final [resultado]
> Usa la credencial OpenAI si se necesita IA."

## Reglas de trabajo

- Siempre leer el workflow actual antes de modificarlo.
- Nunca eliminar workflows sin confirmación explícita.
- Validar el JSON del workflow antes de enviarlo via API.
- Confirmar activación/desactivación antes de ejecutarla.
- Guardar el JSON de cada workflow creado en `./workflows/<nombre>.json` como backup.
