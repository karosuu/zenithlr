# Setup: secretos de GitHub Actions (una sola vez)

Ya tienes la clave en tu PC:

- Pública (cPanel): `C:\Users\carlo\.ssh\zenith-deploy.pub`
- Privada (GitHub): `C:\Users\carlo\.ssh\zenith-deploy`

cPanel ya debe tener la pública importada y **Authorize**.

## Abrir la clave privada para copiarla

En PowerShell:

```powershell
notepad C:\Users\carlo\.ssh\zenith-deploy
```

Debes ver un bloque así (el medio será distinto):

```text
-----BEGIN OPENSSH PRIVATE KEY-----
...varias lineas...
-----END OPENSSH PRIVATE KEY-----
```

Copia **todo** ese bloque. No lo subas a Git. No lo pegues en chats.

## Crear los 6 secretos

1. Abre: https://github.com/karosuu/zenithlr/settings/secrets/actions
2. **New repository secret** — crea uno por uno.

### 1) SSH_HOST

- **Name:** `SSH_HOST`
- **Secret:** el host SSH del servidor (sin `https://`)

Ejemplos posibles:

```text
zenithlr.com
```

o el hostname que te dio TMDHosting (a veces `something.tmdhosting.com`).

### 2) SSH_USERNAME

- **Name:** `SSH_USERNAME`
- **Secret:**

```text
nicahost
```

### 3) SSH_PRIVATE_KEY

- **Name:** `SSH_PRIVATE_KEY`
- **Secret:** pega el contenido completo de `C:\Users\carlo\.ssh\zenith-deploy` (el bloque BEGIN…END).

### 4) SSH_PORT

- **Name:** `SSH_PORT`
- **Secret:**

```text
22
```

### 5) DEPLOY_PATH

- **Name:** `DEPLOY_PATH`
- **Secret:**

```text
/home/nicahost/repositories/zenithlr/zenithlr
```

### 6) NODEVENV

- **Name:** `NODEVENV`
- **Secret:**

```text
/home/nicahost/nodevenv/zenithlr/20/bin/activate
```

Si el deploy falla en este paso, por SSH en el servidor corre:

```bash
ls /home/nicahost/nodevenv
ls /home/nicahost/nodevenv/*/20/bin/activate
```

y actualiza el secret con la ruta real del `activate`.

## Checklist

- [ ] cPanel: clave `github-actions-zenith` importada
- [ ] cPanel: clave **Authorize**
- [ ] GitHub: `SSH_HOST`
- [ ] GitHub: `SSH_USERNAME` = `nicahost`
- [ ] GitHub: `SSH_PRIVATE_KEY` (privada completa)
- [ ] GitHub: `SSH_PORT` = `22`
- [ ] GitHub: `DEPLOY_PATH` = `/home/nicahost/repositories/zenithlr/zenithlr`
- [ ] GitHub: `NODEVENV` = `/home/nicahost/nodevenv/zenithlr/20/bin/activate`

## Después

1. Haz commit/push del workflow a `main`, o en GitHub → **Actions** → **Deploy to TMDHosting** → **Run workflow**.
2. Espera el check verde.
3. Revisa zenithlr.com y `/admin`.

Detalle del flujo: [DEPLOY-TMDHOSTING.md](./DEPLOY-TMDHOSTING.md).
