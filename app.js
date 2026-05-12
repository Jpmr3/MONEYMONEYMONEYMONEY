const CONFIG = {
  STRIPE_PAYMENT_LINK: "https://buy.stripe.com/cNiaEWfy67UB7UZ02paZi09",
  STRIPE_REFERENCE_PARAM: "client_reference_id",
  STRIPE_PRO_LINK: "https://buy.stripe.com/dRm28qadM8YF7UZ6qNaZi0a",
  PAYPAL_PAYMENT_LINK: "https://www.paypal.com/paypalme/replace_me",
  LEAD_ENDPOINT: "https://formspree.io/f/replace_me",
  WHATSAPP_NUMBER: "34652334294",  // e.g. "34600000000" — sin + ni espacios
  WHATSAPP_TEMPLATE:
    "Hola, ya hice la compra del servicio. Comparto comprobante y espero siguientes pasos.",
  EMAIL_TEMPLATE: `Asunto: Bienvenida y activación de tu servicio

Gracias por tu compra.
En las próximas 24h te enviaremos formulario inicial y fecha de ejecución.
Soporte: responde a este correo o WhatsApp.`,
  PRICE: 49,
  PRICE_PRO: 147,
  CURRENCY: "EUR",
  URGENCY_HOURS: 72,     // horas de countdown desde primera visita
  INITIAL_SPOTS: 10,     // plazas visibles al inicio
  SPOTS_DECREASE_HOURS: 8, // horas entre cada reducción de plaza visible
  REFERRAL_PARAM: "ref", // parámetro URL para tracking de referidos
  REFERRAL_SHARE_MESSAGE: "🚀 Transformé mi negocio con este sistema de ventas. Consíguelo aquí: {link}",
  SOCIAL_PROOF_CLIENTS: "47+",
  SOCIAL_PROOF_REVENUE: "38 000 €",
  AB_VARIANTS: [
    "Lanza tu sistema de ventas digital y empieza a facturar en 7 días",
    "Implementación Comercial Express: estructura de ventas real en 7 días",
    "De 0 a tu primera venta online en 7 días — garantizado o devolvemos"
  ]
};

function warnIfPlaceholderConfig() {
  const configEntries = [
    ["STRIPE_PAYMENT_LINK", CONFIG.STRIPE_PAYMENT_LINK],
    ["STRIPE_PRO_LINK", CONFIG.STRIPE_PRO_LINK],
    ["PAYPAL_PAYMENT_LINK", CONFIG.PAYPAL_PAYMENT_LINK],
    ["LEAD_ENDPOINT", CONFIG.LEAD_ENDPOINT],
    ["WHATSAPP_NUMBER", CONFIG.WHATSAPP_NUMBER]
  ];
  for (const [key, value] of configEntries) {
    if (isPlaceholderValue(value)) {
      console.warn(`[MVP config] ${key} contiene un placeholder y debe configurarse para producción.`);
    }
  }
}

function isPlaceholderValue(value) {
  const asString = String(value);
  if (asString === "https://buy.stripe.com/test_replace_me") return true;
  if (asString === "https://buy.stripe.com/test_replace_me_pro") return true;
  if (asString === "https://www.paypal.com/paypalme/replace_me") return true;
  if (asString === "https://formspree.io/f/replace_me") return true;
  if (asString === "replace_me") return true;
  try {
    const parsed = new URL(asString);
    return parsed.pathname.endsWith("/replace_me") || parsed.pathname.endsWith("/test_replace_me");
  } catch {
    return false;
  }
}

function resolveCheckoutUrl(rawUrl) {
  if (isPlaceholderValue(rawUrl)) return null;
  try {
    return new URL(rawUrl);
  } catch {
    return null;
  }
}

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
  let variantIndex = localStorage.getItem("ab_variant_index");
  if (variantIndex === null) {
    variantIndex = String(Math.floor(Math.random() * CONFIG.AB_VARIANTS.length));
    localStorage.setItem("ab_variant_index", variantIndex);
    track("ab_variant_assigned", { variant: variantIndex });
  }
  return variantIndex;
}

function setHeadlineByVariant(variantIndex) {
  const headline = document.getElementById("headline");
  if (!headline) return;
  const idx = parseInt(variantIndex, 10);
  const text = CONFIG.AB_VARIANTS[idx] || CONFIG.AB_VARIANTS[0];
  headline.textContent = text;
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
  const accepted = localStorage.getItem("cookie_consent");
  const banner = document.getElementById("cookie-banner");
  const acceptButton = document.getElementById("accept-cookies");
  const rejectButton = document.getElementById("reject-cookies");
  if (!banner || !acceptButton) return;
  if (!accepted) banner.classList.remove("hidden");
  acceptButton.addEventListener("click", () => {
    localStorage.setItem("cookie_consent", "accepted");
    banner.classList.add("hidden");
    track("cookie_consent_accepted");
  });
  if (rejectButton) {
    rejectButton.addEventListener("click", () => {
      localStorage.setItem("cookie_consent", "essential");
      banner.classList.add("hidden");
    });
  }
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
  const stripe2 = document.getElementById("buy-stripe-2");
  const paypal = document.getElementById("buy-paypal");
  const stripePro = document.getElementById("buy-stripe-pro");
  const stickyCta = document.getElementById("sticky-buy");
  const exitCta = document.getElementById("exit-buy");

  function handleStripe() {
    const url = resolveCheckoutUrl(CONFIG.STRIPE_PAYMENT_LINK);
    if (!url) {
      alert("El sistema de pago Stripe no está disponible en este momento. Contacta con soporte.");
      return;
    }
    const tx = registerCheckoutIntent("stripe");
    url.searchParams.set(CONFIG.STRIPE_REFERENCE_PARAM, tx.id);
    window.location.href = url.toString();
  }

  function handlePaypal() {
    if (!resolveCheckoutUrl(CONFIG.PAYPAL_PAYMENT_LINK)) {
      alert("El sistema de pago PayPal no está disponible en este momento. Contacta con soporte.");
      return;
    }
    registerCheckoutIntent("paypal");
    window.location.href = CONFIG.PAYPAL_PAYMENT_LINK;
  }

  function handleStripePro() {
    const url = resolveCheckoutUrl(CONFIG.STRIPE_PRO_LINK);
    if (!url) {
      alert("El plan Pro no está disponible en este momento. Contacta con soporte.");
      return;
    }
    const tx = registerCheckoutIntent("stripe_pro");
    url.searchParams.set(CONFIG.STRIPE_REFERENCE_PARAM, tx.id);
    window.location.href = url.toString();
  }

  if (stripe) stripe.addEventListener("click", handleStripe);
  if (stripe2) stripe2.addEventListener("click", handleStripe);
  if (stickyCta) stickyCta.addEventListener("click", handleStripe);
  if (exitCta) exitCta.addEventListener("click", handleStripe);
  if (paypal) paypal.addEventListener("click", handlePaypal);
  if (stripePro) stripePro.addEventListener("click", handleStripePro);
}

// ─── Countdown timer ──────────────────────────────────────────────────────────

function getUrgencyDeadline() {
  let deadline = parseInt(localStorage.getItem("urgency_deadline") || "0", 10);
  if (!deadline) {
    deadline = Date.now() + CONFIG.URGENCY_HOURS * 3600 * 1000;
    localStorage.setItem("urgency_deadline", String(deadline));
  }
  return deadline;
}

function formatCountdown(ms) {
  if (ms <= 0) return "00:00:00";
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return [h, m, s].map(n => String(n).padStart(2, "0")).join(":");
}

function initCountdown() {
  const nodes = [
    document.getElementById("countdown-inline"),
    document.getElementById("countdown-success")
  ].filter(Boolean);
  if (!nodes.length) return;
  const deadline = getUrgencyDeadline();
  function tick() {
    const remaining = deadline - Date.now();
    const text = formatCountdown(remaining);
    nodes.forEach(n => { n.textContent = text; });
    if (remaining <= 0) {
      clearInterval(timer);
      nodes.forEach(n => { n.textContent = "EXPIRADO"; });
    }
  }
  tick();
  const timer = setInterval(tick, 1000);
}

// ─── Dynamic spots counter ─────────────────────────────────────────────────────

function getSpots() {
  const stored = localStorage.getItem("spots_remaining");
  if (stored === null) {
    // First visit — initialize
    localStorage.setItem("spots_remaining", String(CONFIG.INITIAL_SPOTS));
    localStorage.setItem("spots_ts", String(Date.now()));
    return CONFIG.INITIAL_SPOTS;
  }
  const spots = parseInt(stored, 10);
  const ts = parseInt(localStorage.getItem("spots_ts") || String(Date.now()), 10);
  const hoursElapsed = (Date.now() - ts) / 3600000;
  const decrease = Math.floor(hoursElapsed / CONFIG.SPOTS_DECREASE_HOURS);
  return Math.max(1, spots - decrease);
}

function initSpotsCounter() {
  const spots = getSpots();
  [
    document.getElementById("spots-left"),
    document.getElementById("sticky-spots")
  ].forEach(el => { if (el) el.textContent = String(spots); });
}

// ─── Sticky CTA bar ────────────────────────────────────────────────────────────

function initStickyBar() {
  const bar = document.getElementById("sticky-cta");
  if (!bar) return;
  let shown = false;
  window.addEventListener("scroll", () => {
    if (window.scrollY > 320 && !shown) {
      bar.classList.remove("hidden");
      shown = true;
    } else if (window.scrollY <= 320 && shown) {
      bar.classList.add("hidden");
      shown = false;
    }
  }, { passive: true });
}

// ─── Exit intent modal ─────────────────────────────────────────────────────────

function initExitIntent() {
  const modal = document.getElementById("exit-modal");
  const closeBtn = document.getElementById("exit-close");
  const dismissBtn = document.getElementById("exit-dismiss");
  if (!modal) return;
  let fired = false;
  const shownBefore = sessionStorage.getItem("exit_modal_shown");
  if (shownBefore) return;

  document.addEventListener("mouseleave", (e) => {
    if (fired || e.clientY > 20) return;
    fired = true;
    sessionStorage.setItem("exit_modal_shown", "1");
    modal.classList.remove("hidden");
    track("exit_intent_shown");
  });

  function closeModal() {
    modal.classList.add("hidden");
    track("exit_intent_dismissed");
  }
  if (closeBtn) closeBtn.addEventListener("click", closeModal);
  if (dismissBtn) dismissBtn.addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });
}

// ─── FAQ accordion ─────────────────────────────────────────────────────────────

function initFAQ() {
  document.querySelectorAll(".faq-q").forEach(btn => {
    btn.addEventListener("click", () => {
      const item = btn.closest(".faq-item");
      if (!item) return;
      const isOpen = item.classList.contains("open");
      document.querySelectorAll(".faq-item.open").forEach(i => i.classList.remove("open"));
      if (!isOpen) item.classList.add("open");
    });
  });
}

// ─── Scroll depth tracking ─────────────────────────────────────────────────────

function initScrollDepth() {
  const milestones = [25, 50, 75, 100];
  const reached = new Set();
  window.addEventListener("scroll", () => {
    const scrolled = window.scrollY + window.innerHeight;
    const total = document.documentElement.scrollHeight;
    const pct = Math.round((scrolled / total) * 100);
    milestones.forEach(m => {
      if (pct >= m && !reached.has(m)) {
        reached.add(m);
        track("scroll_depth", { depth: m });
      }
    });
  }, { passive: true });
}

// ─── Referral tracking ─────────────────────────────────────────────────────────

function getReferrer() {
  const params = new URLSearchParams(window.location.search);
  const ref = params.get(CONFIG.REFERRAL_PARAM);
  if (ref) {
    localStorage.setItem("referrer", ref);
    track("referral_visit", { ref });
  }
  return ref || localStorage.getItem("referrer") || null;
}

function generateReferralLink(txId) {
  const short = txId.slice(0, 8);
  const base = window.location.origin + window.location.pathname.replace(/success\.html$/, "index.html");
  const url = new URL(base);
  url.searchParams.set(CONFIG.REFERRAL_PARAM, short);
  return url.toString();
}

function getDirectWhatsAppUrl(message) {
  if (!CONFIG.WHATSAPP_NUMBER || isPlaceholderValue(CONFIG.WHATSAPP_NUMBER)) return null;
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${encoded}`;
}

// ─── Landing init ──────────────────────────────────────────────────────────────

function initLanding() {
  const utm = getUTM();
  saveJSON("utm", utm);
  getReferrer();
  const variantIndex = assignABVariant();
  setHeadlineByVariant(variantIndex);
  const variantNode = document.getElementById("ab-variant");
  if (variantNode) variantNode.textContent = variantIndex;
  // Dynamic social proof from CONFIG
  const spClients = document.getElementById("sp-clients");
  const spRevenue = document.getElementById("sp-revenue");
  if (spClients) spClients.textContent = CONFIG.SOCIAL_PROOF_CLIENTS;
  if (spRevenue) spRevenue.textContent = CONFIG.SOCIAL_PROOF_REVENUE;
  initCountdown();
  initSpotsCounter();
  initStickyBar();
  initExitIntent();
  initFAQ();
  initScrollDepth();
  initCookieConsent();
  initLeadForm();
  initCheckoutButtons();
  initLiveViewers();
  initPurchaseToasts();
  initAnimatedCounters();
  track("page_view", { variant: variantIndex, ...utm });
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
        ? `✅ Pago confirmado con ${provider}. ¡Gracias por tu compra!`
        : "⚠️ No se pudo confirmar automáticamente el pago. Si ya pagaste, envía el comprobante.";
  }

  const transactions = loadJSON("transactions", []);
  let currentTxId = txId;
  if (status === "success") {
    currentTxId = txId || crypto.randomUUID();
    transactions.push({
      id: currentTxId,
      provider,
      amount: CONFIG.PRICE,
      currency: CONFIG.CURRENCY,
      status: "success",
      createdAt: new Date().toISOString(),
      utm: loadJSON("utm", {}),
      referrer: localStorage.getItem("referrer") || null
    });
    saveJSON("transactions", transactions);
    track("purchase_success", { provider, txId: currentTxId, amount: CONFIG.PRICE, currency: CONFIG.CURRENCY });
  }

  const log = document.getElementById("transactions-log");
  if (log) log.textContent = JSON.stringify(transactions.slice(-10), null, 2);

  // Templates
  const waTemplate = document.getElementById("wa-template");
  const emailTemplate = document.getElementById("email-template");
  if (waTemplate) waTemplate.textContent = CONFIG.WHATSAPP_TEMPLATE;
  if (emailTemplate) emailTemplate.textContent = CONFIG.EMAIL_TEMPLATE;

  async function copyWithFeedback(text, button) {
    if (!button) return;
    const original = button.textContent;
    try {
      await navigator.clipboard.writeText(text);
      button.textContent = "Copiado ✅";
      setTimeout(() => { button.textContent = original; }, 1200);
    } catch {
      button.textContent = "No se pudo copiar";
      setTimeout(() => { button.textContent = original; }, 1500);
    }
  }

  const waButton = document.getElementById("copy-wa");
  const emailButton = document.getElementById("copy-email");
  if (waButton && waTemplate) waButton.addEventListener("click", () => copyWithFeedback(waTemplate.textContent || "", waButton));
  if (emailButton && emailTemplate) emailButton.addEventListener("click", () => copyWithFeedback(emailTemplate.textContent || "", emailButton));

  // Direct WhatsApp link
  const waDirectBtn = document.getElementById("wa-direct");
  if (waDirectBtn) {
    const waUrl = getDirectWhatsAppUrl(CONFIG.WHATSAPP_TEMPLATE);
    if (waUrl) {
      waDirectBtn.href = waUrl;
      waDirectBtn.classList.remove("hidden");
    } else {
      waDirectBtn.classList.add("hidden");
    }
  }

  // Referral link generator
  if (status === "success" && currentTxId) {
    const refLink = generateReferralLink(currentTxId);
    const refLinkEl = document.getElementById("referral-link");
    const refCopy = document.getElementById("copy-referral");
    const refSection = document.getElementById("referral-section");
    if (refLinkEl) refLinkEl.textContent = refLink;
    if (refSection) refSection.classList.remove("hidden");
    if (refCopy && refLinkEl) {
      refCopy.addEventListener("click", () => copyWithFeedback(refLink, refCopy));
    }
    const refShare = document.getElementById("share-wa-referral");
    if (refShare) {
      const shareMsg = CONFIG.REFERRAL_SHARE_MESSAGE.replace("{link}", refLink);
      const waUrl = getDirectWhatsAppUrl(shareMsg);
      if (waUrl) {
        refShare.href = waUrl;
        refShare.classList.remove("hidden");
      }
    }
  }

  // Upsell section
  const upsellSection = document.getElementById("upsell-section");
  const upsellBuy = document.getElementById("upsell-buy");
  if (upsellSection && provider !== "stripe_pro") {
    upsellSection.classList.remove("hidden");
  }
  if (upsellBuy) {
    upsellBuy.addEventListener("click", () => {
      const url = resolveCheckoutUrl(CONFIG.STRIPE_PRO_LINK);
      if (!url) { alert("Plan Pro no disponible. Contáctanos directamente."); return; }
      const tx = registerCheckoutIntent("stripe_pro");
      url.searchParams.set(CONFIG.STRIPE_REFERENCE_PARAM, tx.id);
      window.location.href = url.toString();
    });
  }

  // Countdown on success page too
  initCountdown();
}

// ─── Live viewer simulation ────────────────────────────────────────────────────

function initLiveViewers() {
  const el = document.getElementById("live-count");
  if (!el) return;
  function randomViewers() { return Math.floor(Math.random() * 10) + 4; } // 4–13
  let current = randomViewers();
  el.textContent = String(current);
  setInterval(() => {
    const delta = Math.random() < 0.5 ? 1 : -1;
    current = Math.max(3, Math.min(18, current + delta));
    el.textContent = String(current);
  }, Math.floor(Math.random() * 15000) + 20000); // every 20–35 s
}

// ─── Recent purchase toast notifications ──────────────────────────────────────

const TOAST_NAMES = [
  "Carlos (Madrid)", "Ana (Barcelona)", "David (Valencia)", "Laura (Sevilla)",
  "Miguel (Bilbao)", "Sofía (Málaga)", "Pablo (Zaragoza)", "Elena (Murcia)",
  "Javier (Córdoba)", "María (Valladolid)", "Roberto (Alicante)", "Lucía (Vigo)"
];
// TOAST_PLANS weights: Express appears 3× (75 %) vs Pro 1× (25 %)
const TOAST_PLANS = ["Express", "Express", "Express", "Pro"];

function showPurchaseToast(container) {
  const name = TOAST_NAMES[Math.floor(Math.random() * TOAST_NAMES.length)];
  const plan = TOAST_PLANS[Math.floor(Math.random() * TOAST_PLANS.length)];
  const price = plan === "Pro" ? "147 €" : "49 €";
  const toast = document.createElement("div");
  toast.className = "purchase-toast";
  toast.innerHTML = `🛒 <div><strong>${name}</strong><br><span>acaba de comprar plan ${plan} — ${price}</span></div>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add("hiding");
    setTimeout(() => { if (toast.parentNode) toast.remove(); }, 350);
  }, 5000);
}

function initPurchaseToasts() {
  const container = document.getElementById("toast-container");
  if (!container) return;
  // First toast after 8–15 s, then each subsequent toast uses a fresh random delay
  function scheduleNext() {
    const delay = Math.floor(Math.random() * 45000) + 45000; // 45–90 s
    setTimeout(() => { showPurchaseToast(container); scheduleNext(); }, delay);
  }
  setTimeout(() => { showPurchaseToast(container); scheduleNext(); }, Math.floor(Math.random() * 7000) + 8000);
}

// ─── Animated social proof counters ───────────────────────────────────────────

function animateCounter(el, target, duration) {
  const isPlus = String(target).includes("+");
  const raw = parseInt(String(target).replace(/\D/g, ""), 10);
  const suffix = isPlus ? "+" : "";
  let start = null;
  function step(ts) {
    if (!start) start = ts;
    const progress = Math.min((ts - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    const value = Math.floor(eased * raw);
    el.textContent = value + suffix;
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

function initAnimatedCounters() {
  const spClients = document.getElementById("sp-clients");
  const spRevenue = document.getElementById("sp-revenue");
  if (!spClients && !spRevenue) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      observer.unobserve(entry.target);
      if (entry.target === spClients) {
        animateCounter(spClients, CONFIG.SOCIAL_PROOF_CLIENTS, 1200);
      }
      if (entry.target === spRevenue) {
        // Animate revenue number separately
        const raw = parseInt(CONFIG.SOCIAL_PROOF_REVENUE.replace(/\D/g, ""), 10);
        let start = null;
        const el = spRevenue;
        function step(ts) {
          if (!start) start = ts;
          const p = Math.min((ts - start) / 1600, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          const val = Math.floor(eased * raw);
          el.textContent = val.toLocaleString("es-ES") + " €";
          if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      }
    });
  }, { threshold: 0.5 });

  if (spClients) observer.observe(spClients);
  if (spRevenue) observer.observe(spRevenue);
}

if (window.location.pathname.endsWith("success.html")) {
  warnIfPlaceholderConfig();
  initSuccessPage();
} else {
  warnIfPlaceholderConfig();
  initLanding();
}

