# Publicar en TMDHosting (reemplazar WordPress)

Este sitio es **Next.js** (Node). No se copia encima de WordPress como un tema PHP.

En cPanel el código debe vivir en una carpeta propia (por ejemplo `zenithlr`). **Setup Node.js App** apunta el dominio a esa app. Los cambios del día a día se publican con **GitHub Actions** (push a `main`); no copies `.next` a mano.

## Antes de tocar el servidor

1. En cPanel: **Backup** (o copia de `public_html` + export de MySQL).
2. Confirma que existe **Setup Node.js App**. Si no está, pide a TMDHosting que activen Node / CloudLinux Selector.
3. Cambia `ADMIN_PASSWORD` y `SESSION_SECRET` (no uses los valores de ejemplo).
4. El correo (`mail.zenithlr.com`) se puede dejar igual.

## Qué subir a GitHub

Este monorepo tiene la app en la carpeta `zenithlr/`. En el servidor el Application root suele ser `repositories/zenithlr/zenithlr`.

**Sí:** código, `data/db.example.json`, `public/` (sin fotos de listings), `server.js`, `.env.example`, `.github/workflows/`

**No:** `data/db.json`, `node_modules`, `.next`, `.env`, `.env.local`, `zenith-deploy.tar.gz`, `SMTP_PASS`, contraseñas

`data/db.json` es la base del sitio (textos, propiedades, reseñas). Vive **solo en el servidor y en tu PC**. GitHub guarda un semilla en `data/db.example.json`. Si `db.json` no existe, la app lo crea copiando el example.

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

### 4. Instalar y arrancar

Application root real: `repositories/zenithlr/zenithlr`.

1. **Run NPM Install**.
2. El build en TMDHosting suele abortar (`EAGAIN` / `SIGABRT`). Compila en tu PC:

```bash
cd zenithlr
npm run build
```

3. Sube la carpeta `.next` a `/home/nicahost/repositories/zenithlr/zenithlr/.next` (no subas `node_modules` de Windows).
4. **Restart** la aplicación.

### 5. Cuando el sitio nuevo cargue

En `public_html` puedes quitar `index.php`, `wp-admin`, `wp-content`, `wp-includes`, etc.

**No borres** el `.htaccess` que creó Node.js App.

`data/db.json` y `public/uploads` deben ser escribibles por la cuenta de cPanel (panel admin y formularios).

Instalación nueva: si no hay `data/db.json`, cópialo una vez:

```bash
cp data/db.example.json data/db.json
```

## Actualizar después (flujo normal)

**No subas `.next` a mano** ni mezcles File Manager con este flujo: eso vuelve a desincronizar CSS/JS y rompe el admin.

### Publicar un cambio

1. Commit y push a `main` (desde la raíz del repo, que incluye la carpeta `zenithlr/`).
2. Espera el check verde de **Actions → Deploy to TMDHosting** (unos minutos).
3. Confirma el build en [https://zenithlr.com/deploy-marker.txt](https://zenithlr.com/deploy-marker.txt). Debe coincidir con el `BUILD_ID` del log de Actions.
4. Abre el sitio en una ventana privada.

El workflow **detiene** la app Node, **borra `.next`**, extrae el paquete nuevo y **vuelve a arrancar**. Así Passenger no se queda sirviendo el proceso anterior.

Redeploy sin commits nuevos: en GitHub → **Actions** → **Deploy to TMDHosting** → **Run workflow**.

El paquete **no** incluye `data/db.json` ni `public/uploads`. El workflow hace backup de `db.json` antes de extraer.

### Setup una sola vez (SSH + secretos de GitHub)

Guía corta con valores exactos para copiar/pegar: [SETUP-GITHUB-SECRETS.md](./SETUP-GITHUB-SECRETS.md).

Hace falta para que Actions pueda entrar al servidor.

1. Genera una clave **solo para deploy** (no uses tu clave personal):

```bash
ssh-keygen -t ed25519 -C "github-actions-zenith" -f zenith-deploy -N ""
```

2. En cPanel → **SSH Access**: importa `zenith-deploy.pub` (Import Key) y pulsa **Authorize**.
3. En GitHub → repo → **Settings → Secrets and variables → Actions**, crea:

| Secret | Valor típico |
|---|---|
| `SSH_HOST` | host o IP del servidor |
| `SSH_USERNAME` | `nicahost` |
| `SSH_PRIVATE_KEY` | contenido completo de `zenith-deploy` (clave privada) |
| `SSH_PORT` | `22` (u otro si TMDHosting usa puerto distinto) |
| `DEPLOY_PATH` | `/home/nicahost/repositories/zenithlr/zenithlr` |
| `NODEVENV` | ruta al `activate`, p. ej. `/home/nicahost/nodevenv/repositories/zenithlr/zenithlr/20/bin/activate` |

Para confirmar `NODEVENV` por SSH:

```bash
ls /home/nicahost/nodevenv
```

Sin estos secretos, el build en Actions puede pasar pero fallará el paso de SSH.

### Plan B (emergencia, sin Actions)

Solo si GitHub Actions no puede desplegar:

```bash
cd zenithlr
npm run build
npm run deploy:pack
```

Sube **un solo** archivo `zenith-deploy.tar.gz` al servidor. Por SSH:

```bash
cd /home/nicahost/repositories/zenithlr/zenithlr
cp -a data/db.json data/db.json.bak
rm -rf .next
tar -xzf /ruta/a/zenith-deploy.tar.gz
source /home/nicahost/nodevenv/repositories/zenithlr/zenithlr/20/bin/activate
npm install --omit=dev
mkdir -p tmp
touch tmp/restart.txt
```

No hagas `git checkout -- data/db.json` ni restaures ese archivo desde GitHub.

## Si no arranca

- Startup file = `server.js` (no `app.js`).
- Node 20.x, modo Production.
- El workflow (o `npm run build` local) terminó sin error.
- Variables SMTP y `SESSION_SECRET` están en la app, no solo en un archivo local.
- stderr de la app Node en cPanel.
- En Actions, revisa el log del job fallido (secretos SSH / `DEPLOY_PATH` / `NODEVENV`).
