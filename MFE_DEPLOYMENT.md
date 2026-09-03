# Publicación de verticales MFE

Cada repositorio `jjlmoya-utils-*` migrado a MFE se publica con su propio
workflow de Cloudflare. El codemod debe dejar el workflow y la configuración
de Wrangler listos; no se debe acoplar el despliegue al repositorio `website`.

## Variables de GitHub Actions

En el entorno `production` de cada repositorio hay que configurar:

```text
Secret:   CLOUDFLARE_API_TOKEN  = token API de Cloudflare
Variable: CLOUDFLARE_ACCOUNT_ID = e11602a44026a48c5bd08c710f813934
```

El token se consume como `secrets.CLOUDFLARE_API_TOKEN` y el identificador de
cuenta como `vars.CLOUDFLARE_ACCOUNT_ID`. El token nunca se guarda en el repo.

## Flujo obligatorio

El codemod ejecuta `npm install --no-audit --no-fund` al aplicar la migración.
Esto sincroniza `package-lock.json`, instala `utils-shared` y ejecuta
`postinstall` para generar los CSS de las tools. Si falla, la migración se
detiene y no se debe hacer commit ni publicar.

Después de revisar el diff, los gates locales son:

```bash
npm install
npm run lint
npm run test
npm run build
```

La publicación oficial se inicia con `npm run minor`; GitHub Actions ejecuta
`npm ci`, QA, el build con `PUBLIC_APP_VERSION` y `wrangler deploy` usando las
dos entradas anteriores.
