# Sistema de Monetización Express 2026

[![Deploy to GitHub Pages](https://github.com/Jpmr3/MONEYMONEYMONEYMONEY/actions/workflows/deploy.yml/badge.svg)](https://github.com/Jpmr3/MONEYMONEYMONEYMONEY/actions/workflows/deploy.yml)

🌐 **URL en vivo:** [https://jpmr3.github.io/MONEYMONEYMONEYMONEY/](https://jpmr3.github.io/MONEYMONEYMONEYMONEY/)

Sistema de ventas digital de alto rendimiento listo para publicar. Diseñado para generar ingresos lo antes posible y crecer de forma exponencial.

## Qué incluye

- **Landing de alta conversión** con urgency bar, countdown timer, social proof, testimonios, 2 planes de precio y FAQ accordion
- **Checkout real** por enlace (Stripe / PayPal) con seguimiento de transacciones
- **Captación de leads** con envío a endpoint configurable
- **Página de éxito** con upsell al plan Pro, generador de enlace de referido y botón WhatsApp directo
- **Sistema de referidos viral** — cada comprador obtiene un enlace único; tus clientes traen más clientes
- **Tests A/B** — 3 variantes de headline asignadas aleatoriamente y persistidas
- **Exit intent modal** — recupera visitantes que abandonan
- **Sticky CTA bar** — visible al hacer scroll
- **Countdown personalizado** — 72 h desde la primera visita del usuario
- **Tracking de embudo completo**: `page_view`, `lead_submit`, `checkout_click`, `purchase_success`, `scroll_depth`, `exit_intent_shown`, `referral_visit`
- **Consentimiento de cookies** (RGPD)
- **Páginas legales**

## Estructura

```
./index.html      — Landing principal
./success.html    — Página post-compra con upsell y referidos
./legal.html      — Aviso legal, privacidad y términos
./styles.css      — Estilos
./app.js          — Toda la lógica (configurable en CONFIG)
```

## Checklist de puesta en marcha (empieza a facturar hoy)

### 1. Configura `app.js`

Edita el objeto `CONFIG` al inicio del archivo:

| Variable | Descripción | Ejemplo |
|---|---|---|
| `STRIPE_PAYMENT_LINK` | Enlace de pago Stripe (plan Express) | `https://buy.stripe.com/abc123` |
| `STRIPE_PRO_LINK` | Enlace de pago Stripe (plan Pro) | `https://buy.stripe.com/xyz456` |
| `PAYPAL_PAYMENT_LINK` | Enlace de pago PayPal | `https://www.paypal.com/paypalme/tunombre` |
| `PAYPAL_RECIPIENT_EMAIL` | Email de la cuenta PayPal para cobro directo (fallback) | `tu-cuenta@paypal.com` |
| `PAYPAL_ITEM_NAME` | Nombre del producto que verá el comprador en PayPal | `Implementación Comercial Express` |
| `LEAD_ENDPOINT` | Endpoint para captar leads (Formspree, Make, Zapier...) | `https://formspree.io/f/abcdefg` |
| `WHATSAPP_NUMBER` | Número de WhatsApp sin `+` ni espacios | `34600000000` |
| `PRICE` | Precio del plan Express en EUR | `49` |
| `PRICE_PRO` | Precio del plan Pro en EUR | `147` |
| `URGENCY_HOURS` | Duración del countdown en horas | `72` |
| `INITIAL_SPOTS` | Plazas visibles al inicio | `10` |

> **Importante:** Reemplaza todos los valores `replace_me` / `test_replace_me` antes de publicar.  
> Si `PAYPAL_PAYMENT_LINK` no está configurado, el sistema genera un checkout PayPal automáticamente usando `PAYPAL_RECIPIENT_EMAIL`.

### 2. Personaliza el contenido

- `index.html` — Titulares, beneficios, testimonios y preguntas frecuentes
- `legal.html` — Datos reales del titular (nombre, NIF, dirección, email)
- `success.html` — Mensajes post-compra y plantillas de WhatsApp / email

### 3. Publica en hosting estático

#### Opción A — GitHub Pages (automático, ya configurado)

Este repositorio ya incluye un workflow de GitHub Actions (`.github/workflows/deploy.yml`).

1. Ve a **Settings → Pages** en tu repositorio de GitHub.
2. En **Source**, selecciona **GitHub Actions**.
3. Haz push a `main` — el sitio se desplegará automáticamente en `https://jpmr3.github.io/MONEYMONEYMONEYMONEY/`.

#### Opción B — Netlify (60 segundos)

```bash
# Arrastra la carpeta a app.netlify.com/drop y listo
```

### 4. Configura tus pasarelas de pago

Redirige tu pasarela a estas URLs tras la compra:

```
success.html?provider=stripe&status=success
success.html?provider=paypal&status=success
```

Para Stripe, activa el parámetro `client_reference_id` en tu Payment Link para conectar cada pago con su ID de transacción.

### 5. Lanza tráfico con UTM

```
?utm_source=instagram&utm_medium=stories&utm_campaign=lanzamiento&utm_content=variante_a
```

### 6. Configura tu endpoint de leads

Opciones gratuitas/low-cost:
- **Formspree** — más sencillo, gratis hasta 50 envíos/mes
- **Make / Zapier** — enrutar leads a Airtable, Notion, Google Sheets, email...
- **Brevo / Mailchimp** — directamente a tu lista de email marketing

## Métricas de embudo incluidas

| Evento | Cuándo se dispara |
|---|---|
| `page_view` | Al cargar la landing |
| `scroll_depth` | Al pasar 25%, 50%, 75%, 100% de scroll |
| `lead_submit` | Al enviar el formulario |
| `checkout_click` | Al hacer clic en comprar |
| `purchase_success` | En la página de éxito con `status=success` |
| `exit_intent_shown` | Al detectar intención de salida |
| `referral_visit` | Al entrar con enlace de referido |
| `ab_variant_assigned` | Al asignar variante A/B al visitante |
| `cookie_consent_accepted` | Al aceptar cookies |

Todos los eventos se envían a `window.dataLayer` (Google Tag Manager) y, si están configurados, a `gtag`, `fbq` (Meta Pixel) y `ttq` (TikTok Pixel).

## Sistema de referidos

Tras cada compra, el cliente recibe un enlace único (`?ref=XXXXXXXX`). Cuando alguien compra usando ese enlace, el referido queda registrado en el evento `purchase_success`. El pago de comisiones es manual.

## Nota legal

Actualiza `legal.html` con los datos reales del titular antes de publicar.
