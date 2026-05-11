const CONFIG = {
  STRIPE_PAYMENT_LINK: "https://buy.stripe.com/test_replace_me",
  PAYPAL_PAYMENT_LINK: "https://www.paypal.com/paypalme/replace_me",
  LEAD_ENDPOINT: "https://formspree.io/f/replace_me",
  PRICE: 49,
  CURRENCY: "EUR"
};

function track(eventName, payload = {}) {
  const data = {
    event: eventName,
    ts: new Date().toISOString(),
    page: window.location.pathname,
    ...payload
  };
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(data);
  if (typeof window.gtag === "function") window.gtag("event", eventName, payload);
  if (typeof window.fbq === "function") window.fbq("trackCustom", eventName, payload);
  if (typeof window.ttq?.track === "function") window.ttq.track(eventName, payload);
}

function getUTM() {
  const params = new URLSearchParams(window.location.search);
  return {
    utm_source: params.get("utm_source") || "",
    utm_medium: params.get("utm_medium") || "",
    utm_campaign: params.get("utm_campaign") || "",
    utm_content: params.get("utm_content") || ""
  };
}

function saveJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function loadJSON(key, fallback) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function assignABVariant() {
  let variant = localStorage.getItem("ab_variant");
  if (!variant) {
    variant = Math.random() < 0.5 ? "A" : "B";
    localStorage.setItem("ab_variant", variant);
    track("ab_variant_assigned", { variant });
  }
  return variant;
}

function setHeadlineByVariant(variant) {
  const headline = document.getElementById("headline");
  if (!headline) return;
  headline.textContent =
    variant === "B"
      ? "Implementación Comercial Express para empezar a vender con estructura en 7 días"
      : "Servicio Express para transformar tu presencia digital en ventas en 7 días";
}

function registerCheckoutIntent(provider) {
  const tx = {
    id: crypto.randomUUID(),
    provider,
    amount: CONFIG.PRICE,
    currency: CONFIG.CURRENCY,
    status: "checkout_click",
    createdAt: new Date().toISOString(),
    utm: loadJSON("utm", {})
  };
  const transactions = loadJSON("transactions", []);
  transactions.push(tx);
  saveJSON("transactions", transactions);
  track("checkout_click", { provider, amount: CONFIG.PRICE, currency: CONFIG.CURRENCY });
  return tx;
}

function initCookieConsent() {
  const accepted = localStorage.getItem("cookie_consent") === "accepted";
  const banner = document.getElementById("cookie-banner");
  const acceptButton = document.getElementById("accept-cookies");
  if (!banner || !acceptButton) return;
  if (!accepted) banner.classList.remove("hidden");
  acceptButton.addEventListener("click", () => {
    localStorage.setItem("cookie_consent", "accepted");
    banner.classList.add("hidden");
    track("cookie_consent_accepted");
  });
}

function initLeadForm() {
  const form = document.getElementById("lead-form");
  if (!form) return;
  const status = document.getElementById("lead-status");
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());
    payload.utm = loadJSON("utm", {});

    try {
      const response = await fetch(CONFIG.LEAD_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error("Lead endpoint failed");
      if (status) status.textContent = "Gracias. Te contactaremos pronto.";
      track("lead_submit", { channel: "form", ok: true });
      form.reset();
    } catch {
      if (status) status.textContent = "No se pudo enviar ahora. Escríbenos por WhatsApp.";
      track("lead_submit", { channel: "form", ok: false });
    }
  });
}

function initCheckoutButtons() {
  const stripe = document.getElementById("buy-stripe");
  const paypal = document.getElementById("buy-paypal");

  if (stripe) {
    stripe.addEventListener("click", () => {
      const tx = registerCheckoutIntent("stripe");
      const url = new URL(CONFIG.STRIPE_PAYMENT_LINK);
      url.searchParams.set("client_reference_id", tx.id);
      window.location.href = url.toString();
    });
  }

  if (paypal) {
    paypal.addEventListener("click", () => {
      registerCheckoutIntent("paypal");
      window.location.href = CONFIG.PAYPAL_PAYMENT_LINK;
    });
  }
}

function initLanding() {
  const utm = getUTM();
  saveJSON("utm", utm);
  const variant = assignABVariant();
  setHeadlineByVariant(variant);
  const variantNode = document.getElementById("ab-variant");
  if (variantNode) variantNode.textContent = variant;
  initCookieConsent();
  initLeadForm();
  initCheckoutButtons();
  track("page_view", { variant, ...utm });
}

function initSuccessPage() {
  const params = new URLSearchParams(window.location.search);
  const status = params.get("status") || "unknown";
  const provider = params.get("provider") || "unknown";
  const txId = params.get("tx") || params.get("client_reference_id") || "";
  const message = document.getElementById("purchase-message");
  if (message) {
    message.textContent =
      status === "success"
        ? `Pago confirmado con ${provider}. Gracias por tu compra.`
        : "No se pudo confirmar automáticamente el pago. Si ya pagaste, envía comprobante.";
  }

  const transactions = loadJSON("transactions", []);
  if (status === "success") {
    transactions.push({
      id: txId || crypto.randomUUID(),
      provider,
      amount: CONFIG.PRICE,
      currency: CONFIG.CURRENCY,
      status: "success",
      createdAt: new Date().toISOString(),
      utm: loadJSON("utm", {})
    });
    saveJSON("transactions", transactions);
    track("purchase_success", { provider, txId: txId || null, amount: CONFIG.PRICE, currency: CONFIG.CURRENCY });
  }

  const log = document.getElementById("transactions-log");
  if (log) log.textContent = JSON.stringify(transactions.slice(-10), null, 2);

  const waButton = document.getElementById("copy-wa");
  const emailButton = document.getElementById("copy-email");
  const waTemplate = document.getElementById("wa-template");
  const emailTemplate = document.getElementById("email-template");

  async function copyWithFeedback(text, button) {
    if (!button) return;
    const original = button.textContent;
    try {
      await navigator.clipboard.writeText(text);
      button.textContent = "Copiado ✅";
      setTimeout(() => {
        button.textContent = original;
      }, 1200);
    } catch {
      button.textContent = "No se pudo copiar";
      setTimeout(() => {
        button.textContent = original;
      }, 1500);
    }
  }

  if (waButton && waTemplate) {
    waButton.addEventListener("click", () => {
      copyWithFeedback(waTemplate.textContent || "", waButton);
    });
  }
  if (emailButton && emailTemplate) {
    emailButton.addEventListener("click", () => {
      copyWithFeedback(emailTemplate.textContent || "", emailButton);
    });
  }
}

if (window.location.pathname.endsWith("success.html")) {
  initSuccessPage();
} else {
  initLanding();
}
