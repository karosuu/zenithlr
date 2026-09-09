# Publicar en TMDHosting (reemplazar WordPress)

Este sitio es **Next.js** (Node). No se copia encima de WordPress como un tema PHP.

En cPanel el código debe vivir en una carpeta propia (por ejemplo `zenithlr`). **Setup Node.js App** apunta el dominio a esa app. GitHub solo guarda el código.

## Antes de tocar el servidor

1. En cPanel: **Backup** (o copia de `public_html` + export de MySQL).
2. Confirma que existe **Setup Node.js App**. Si no está, pide a TMDHosting que activen Node / CloudLinux Selector.
3. Cambia `ADMIN_PASSWORD` y `SESSION_SECRET` (no uses los valores de ejemplo).
4. El correo (`mail.zenithlr.com`) se puede dejar igual.

## Qué subir a GitHub

Sube **el contenido de esta carpeta** (`zenithlr`) como raíz del repositorio, para que en el servidor existan `package.json` y `server.js` en la raíz.

**Sí:** código, `data/db.json`, `public/` (sin fotos nuevas), `server.js`, `.env.example`

**No:** `node_modules`, `.next`, `.env`, `.env.local`, `SMTP_PASS`, contraseñas

## En cPanel (orden)

### 1. Traer el código

Carpeta recomendada: `/home/TUUSUARIO/zenithlr`  
**No** mezcles esto con `wp-admin` / `wp-content`.

- **Git Version Control:** clona el repo de GitHub en esa ruta, **o**
- **File Manager / FTP:** ZIP del proyecto **sin** `node_modules` ni `.next` → extraer en `zenithlr`.

No subas `node_modules` desde Windows. Hay que instalarlos en Linux.

### 2. Crear la app Node

**Setup Node.js App → Create Application:**

| Campo | Valor |
|---|---|
| Node.js version | **20.20.2** |
| Application mode | Production |
| Application root | `zenithlr` (la carpeta del paso 1, **no** `public_html`) |
| Application URL | `zenithlr.com` (ruta vacía o `/`) |
| Application startup file | `server.js` |

Al elegir el dominio raíz, cPanel escribe un `.htaccess` en `public_html`. WordPress dejará de mostrarse. Por eso el backup va primero.

Opción más segura: primero un subdominio (`new.zenithlr.com`), y cuando funcione cambias Application URL al dominio principal.

### 3. Variables de entorno

En la misma pantalla de la app Node, pega los valores de `.env.example` (con secretos reales). Incluye `NODE_ENV=production`.

No definas `PORT` a mano: Passenger lo asigna.

### 4. Instalar, compilar, arrancar

1. **Run NPM Install** (hace falta el install **completo**, no `--omit=dev`: el build usa TypeScript y Tailwind).
2. Terminal de cPanel o SSH, con el entorno de la app (el comando `source` que muestra Setup Node.js App), dentro de `zenithlr`:

```bash
npm run build
```

3. **Restart** la aplicación.

Si el build se queda sin memoria, compílalo en tu PC (`npm run build`) y sube la carpeta `.next` **además** del código. `node_modules` sigue teniéndose que instalar en el servidor.

### 5. Cuando el sitio nuevo cargue

En `public_html` puedes quitar `index.php`, `wp-admin`, `wp-content`, `wp-includes`, etc.

**No borres** el `.htaccess` que creó Node.js App.

`data/db.json` y `public/uploads` deben ser escribibles por la cuenta de cPanel (panel admin y formularios).

## Actualizar después

```text
git pull  →  npm install  →  npm run build  →  Restart (o touch tmp/restart.txt)
```

## Si no arranca

- Startup file = `server.js` (no `app.js`).
- Node 20.x, modo Production.
- `npm run build` terminó sin error.
- Variables SMTP y `SESSION_SECRET` están en la app, no solo en un archivo local.
- stderr de la app Node en cPanel.
