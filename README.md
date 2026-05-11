# MVP de monetización real (legal y ejecutable)

Este repositorio ahora incluye una base de lanzamiento para monetizar una oferta digital con:

- Landing de conversión
- Checkout real por enlace (Stripe/PayPal)
- Página de éxito post-compra
- Captación de leads
- Tracking de embudo
- Consentimiento de cookies
- Páginas legales
- Plantillas de automatización (email/WhatsApp)

## Estructura

- `./index.html`
- `./success.html`
- `./legal.html`
- `./styles.css`
- `./app.js`

## Puesta en marcha rápida

1. Edita `app.js` y configura:
   - `STRIPE_PAYMENT_LINK`
   - `PAYPAL_PAYMENT_LINK`
   - `LEAD_ENDPOINT`
   - Importante: reemplaza todos los placeholders `replace_me`/`test_replace_me` por enlaces reales de producción antes de publicar.
2. Publica en hosting estático (GitHub Pages, Netlify, Vercel, etc.).
3. Usa campañas con UTM (`utm_source`, `utm_campaign`, `utm_content`) para medir.
4. Redirige tu pasarela de pago a:
   - `success.html?provider=stripe&status=success`
   - o `success.html?provider=paypal&status=success`

## Métricas clave incluidas

- `page_view`
- `lead_submit`
- `checkout_click`
- `purchase_success`
- `cookie_consent_accepted`
- `ab_variant_assigned`

## Nota importante

No se garantiza facturación ni resultados “instantáneos”. Este MVP implementa infraestructura comercial realista para validar oferta, captar demanda y escalar en función de datos.
