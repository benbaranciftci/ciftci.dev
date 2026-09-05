export const CONTACT_MAIL = "work.baranciftci@gmail.com";
export const FORMSPREE_ENDPOINT = "https://formspree.io/f/xkjnvwqp";
export const MESSAGE_MAX = 1600;

export const CONTACT_LINKS = [
  {
    name: "GitHub",
    handle: "benbaranciftci",
    href: "https://github.com/benbaranciftci",
    logo: "assets/github-logo.svg",
    pad: true,
  },
  {
    name: "LinkedIn",
    handle: "Baran Çiftçi",
    href: "https://www.linkedin.com/in/baran-%C3%A7ift%C3%A7i-a004b9283",
    logo: "assets/linkedin-logo.svg",
    pad: true,
  },
  {
    name: "Instagram",
    handle: "@benbaranciftci",
    href: "https://www.instagram.com/benbaranciftci/",
    logo: "assets/instagram-logo.svg",
    pad: true,
  },
];

export function isContactGene(g) {
  return g?.id === "contact" || !!g?.form;
}

export function isTypingTarget(el) {
  if (!el) return false;
  const tag = el.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  if (el.isContentEditable) return true;
  return !!el.closest?.(".contact-form, .contact-field");
}

export function contactRailHTML() {
  return CONTACT_LINKS.map((link) => {
    return `<a
      class="contact-card"
      href="${link.href}"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="${link.name}, ${link.handle}"
    >
      <span class="contact-card-plate is-padded">
        <img src="${link.logo}" alt="" />
      </span>
    </a>`;
  }).join("");
}

export function bindContactForm(form) {
  if (!form || form.dataset.bound === "1") return;
  form.dataset.bound = "1";

  const errorEl = form.querySelector("#contact-error");
  const statusEl = form.querySelector("#contact-status");
  const sendBtn = form.querySelector("#contact-send");

  function setError(msg) {
    if (!errorEl) return;
    errorEl.hidden = !msg;
    errorEl.textContent = msg || "";
  }

  function setStatus(msg) {
    if (!statusEl) return;
    statusEl.hidden = !msg;
    statusEl.textContent = msg || "";
  }

  function setBusy(busy) {
    if (!sendBtn) return;
    sendBtn.disabled = busy;
    sendBtn.textContent = busy ? "Transmit…" : "Transmit ▸";
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    setError("");
    setStatus("");

    const data = new FormData(form);
    if (String(data.get("_gotcha") || "").trim()) {
      setStatus("Sent.");
      form.reset();
      return;
    }

    const name = String(data.get("name") || "").trim();
    const email = String(data.get("email") || "").trim();
    const channel = String(data.get("channel") || "").trim() || "hello";
    let message = String(data.get("message") || "").trim();

    if (!name || !email || !message) {
      setError("Fill every blank before transmit.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Return address needs a real email.");
      return;
    }
    if (message.length > MESSAGE_MAX) message = `${message.slice(0, MESSAGE_MAX)}\n…`;

    data.set("name", name);
    data.set("email", email);
    data.set("channel", channel);
    data.set("message", message);
    data.set("_subject", `[ciftci.dev] ${channel} — ${name}`);
    data.delete("_gotcha");

    setBusy(true);
    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: data,
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        const fieldErr = payload.errors?.[0]?.message;
        setError(fieldErr || payload.error || "Transmit failed. Try again.");
        return;
      }
      form.reset();
      setStatus("Sent.");
    } catch {
      setError("Transmit failed. Check the connection and try again.");
    } finally {
      setBusy(false);
    }
  });
}
