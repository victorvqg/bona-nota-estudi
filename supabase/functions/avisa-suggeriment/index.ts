// Bona Nota · Supabase Edge Function · Notificació per correu (Resend / Cloudflare Email Routing)
// Disparada per un Database Webhook de Supabase en INSERT sobre bn_priv.suggeriments.
//
// Configuració (un sol cop a Supabase):
//   1) supabase secrets set RESEND_API_KEY=re_xxx FROM_EMAIL="Bona Nota <bustia@bonanota.net>" DESTI_EMAIL="hola@bonanota.net" WEBHOOK_SECRET="un-secret-llarg"
//      (Nota: DESTI_EMAIL pot ser un àlies de Cloudflare Email Routing que reenvia al teu correu personal.)
//   2) supabase functions deploy avisa-suggeriment --no-verify-jwt
//   3) A Supabase Dashboard → Database → Webhooks → Create a new hook:
//      - Table: bn_priv.suggeriments · Events: INSERT
//      - URL: https://agippwtqvhpxdockuigl.supabase.co/functions/v1/avisa-suggeriment
//      - HTTP Header: x-webhook-secret: <WEBHOOK_SECRET>

const esc = (s: unknown) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const CAT_NOM: Record<string, string> = {
  error: "🐛 Error en pregunta o joc",
  idea: "💡 Idea o nou món",
  familia: "👨‍👩‍👧 Consulta de família o docent",
  privacitat: "🔒 Privacitat o perfil",
};

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const secret = Deno.env.get("WEBHOOK_SECRET");
  if (secret && req.headers.get("x-webhook-secret") !== secret) {
    return new Response("Unauthorized", { status: 401 });
  }

  const apiKey = Deno.env.get("RESEND_API_KEY");
  const from = Deno.env.get("FROM_EMAIL") || "Bona Nota <onboarding@resend.dev>";
  const to = Deno.env.get("DESTI_EMAIL");
  if (!apiKey || !to) {
    return new Response(JSON.stringify({ ok: false, error: "Falten RESEND_API_KEY o DESTI_EMAIL" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  let body: { record?: Record<string, unknown> };
  try {
    body = await req.json();
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const rec = body.record;
  if (!rec || !rec.id) {
    return new Response(JSON.stringify({ ok: true, skipped: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  const ref = `SUG-${String(rec.id).padStart(3, "0")}`;
  const cat = CAT_NOM[String(rec.categoria || "")] || String(rec.categoria || "Suggeriment");
  const mon = rec.mon ? String(rec.mon) : "General";
  const rol = rec.rol ? String(rec.rol) : "No indicat";
  const email = rec.email ? String(rec.email) : "";
  const msg = String(rec.missatge || "");

  const subject = `[Bona Nota · ${ref}] ${cat}${rec.mon ? ` (${mon})` : ""}`;
  const html = `
    <div style="font-family:system-ui,-apple-system,sans-serif;max-width:600px;margin:0 auto;color:#0f172a">
      <h2 style="margin:0 0 8px">Nou missatge a la Bústia · ${esc(ref)}</h2>
      <p style="margin:0 0 14px;color:#475569;font-size:14px">
        <b>Categoria:</b> ${esc(cat)} · <b>Món:</b> ${esc(mon)} · <b>Rol:</b> ${esc(rol)}
        ${email ? `<br><b>Correu de resposta:</b> <a href="mailto:${esc(email)}">${esc(email)}</a>` : ""}
      </p>
      <div style="padding:14px 16px;border-radius:10px;background:#f8fafc;border:1px solid #e2e8f0;white-space:pre-wrap;line-height:1.55">${esc(msg)}</div>
      <p style="margin:16px 0 0;font-size:13px">
        <a href="https://bonanota.net/admin/?v=bustia" style="color:#2563eb;font-weight:700">Obre la Bústia a /admin/ →</a>
      </p>
    </div>
  `;

  const payload: Record<string, unknown> = {
    from,
    to: [to],
    subject,
    html,
    text: `${subject}\nRol: ${rol}\nCorreu: ${email || "Anònim"}\n\n${msg}\n\nGestiona-ho a: https://bonanota.net/admin/?v=bustia`,
  };
  if (email) payload.reply_to = email;

  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!r.ok) {
    const errTxt = await r.text();
    return new Response(JSON.stringify({ ok: false, status: r.status, error: errTxt }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    });
  }

  const out = await r.json();
  return new Response(JSON.stringify({ ok: true, ref, resend_id: out.id }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
