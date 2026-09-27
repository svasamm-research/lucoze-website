// Lucoze lead-form handler — Lambda (Node 20) behind a Lambda Function URL.
// Receives a POST from lucoze.com's lead forms and emails the lead via SES.
//
// It REPLACES the Frappe app admin.lucoze.com (lucoze_admin.api.contact.submit_lead),
// decided by Mithun on 27 September 2026 so the ERPNext stack running only to hold
// website leads can be retired. Same pattern as svasamm.com and t4suite.com.
//
// ⚠️ LUCOZE'S FORM IS NOT THE OTHER TWO'S. A lead gives a phone OR an email — either
// may be null — so neither is required on its own, and Reply-To is set only when
// there is an email to reply to. The fields are the ones lead-form.ts already sends,
// so the page changes only its endpoint.
//
// Env vars (set on the Lambda):
//   SES_REGION   "us-east-1"               (the region lucoze.com is verified in)
//   MAIL_FROM    "no-reply@lucoze.com"     (MUST be a verified SES identity)
//   MAIL_TO      "sales@lucoze.com"        (where leads land)
//   ALLOW_ORIGIN "https://lucoze.com,https://www.lucoze.com"
//
// IAM: the role needs ses:SendEmail (+ the default CloudWatch Logs policy).
import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";

const REGION = process.env.SES_REGION || "us-east-1";
const MAIL_FROM = process.env.MAIL_FROM || "no-reply@lucoze.com";
const MAIL_TO = process.env.MAIL_TO || "sales@lucoze.com";
const ALLOW_ORIGIN = (process.env.ALLOW_ORIGIN || "https://lucoze.com,https://www.lucoze.com")
	.split(",")
	.map((s) => s.trim());

const ses = new SESv2Client({ region: REGION });

const MAX = { name: 120, title: 20, email: 160, phone: 40, source: 60, visitor: 80 };
const validEmail = (v) =>
	typeof v === "string" &&
	v.length <= MAX.email &&
	/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(v);
const clip = (v, n) => (typeof v === "string" ? v.trim().slice(0, n) : "");
const esc = (s) =>
	String(s).replace(
		/[<>&"']/g,
		(c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&#39;" })[c],
	);

function cors(origin) {
	const allowed = ALLOW_ORIGIN.includes(origin) ? origin : ALLOW_ORIGIN[0];
	return {
		"Access-Control-Allow-Origin": allowed,
		"Access-Control-Allow-Methods": "POST, OPTIONS",
		"Access-Control-Allow-Headers": "Content-Type",
		"Content-Type": "application/json",
	};
}
const reply = (status, body, origin) => ({
	statusCode: status,
	headers: cors(origin),
	body: JSON.stringify(body),
});

export const handler = async (event) => {
	const origin = event?.headers?.origin || event?.headers?.Origin || "";
	const method = event?.requestContext?.http?.method || event?.httpMethod || "POST";
	if (method === "OPTIONS") return reply(204, {}, origin);
	if (method !== "POST") return reply(405, { ok: false, error: "Method not allowed" }, origin);

	let data;
	try {
		data = JSON.parse(event.body || "{}");
	} catch {
		return reply(400, { ok: false, error: "Invalid JSON" }, origin);
	}

	// Honeypot: real people leave `website` empty; bots fill every field.
	if (clip(data.website, 200)) return reply(200, { ok: true }, origin);

	const name = clip(data.name, MAX.name);
	const title = clip(data.title, MAX.title);
	const rawEmail = clip(data.email, MAX.email);
	const email = validEmail(rawEmail) ? rawEmail : "";
	const phone = clip(data.phone, MAX.phone);
	const phoneOk = phone.replace(/\D/g, "").length >= 8;
	const source = clip(data.source, MAX.source) || "Website Contact";
	const visitor = clip(data.visitor_id, MAX.visitor);

	if (!name) return reply(422, { ok: false, error: "Please give your name." }, origin);
	if (!email && !phoneOk) {
		return reply(
			422,
			{ ok: false, error: "Please give a phone number or an email so we can reach you." },
			origin,
		);
	}

	const who = [title, name].filter(Boolean).join(" ");
	const subject = `New lucoze.com lead — ${who} · ${source}`;
	const rows = [
		["Name", who],
		email ? ["Email", email] : null,
		phoneOk ? ["Phone", phone] : null,
		["Source", source],
		visitor ? ["Visitor", visitor] : null,
	].filter(Boolean);
	const text = rows.map(([k, v]) => `${k.padEnd(8)} ${v}`).join("\n");
	const html =
		`<h2 style="margin:0 0 12px">New lucoze.com lead</h2>` +
		`<table style="border-collapse:collapse;font:14px/1.5 system-ui,sans-serif">` +
		rows
			.map(([k, v]) => {
				const val =
					k === "Email"
						? `<a href="mailto:${esc(v)}">${esc(v)}</a>`
						: k === "Phone"
							? `<a href="tel:${esc(v.replace(/[^\d+]/g, ""))}">${esc(v)}</a>`
							: esc(v);
				return `<tr><td style="padding:2px 12px 2px 0;color:#666">${k}</td><td>${val}</td></tr>`;
			})
			.join("") +
		`</table>`;

	try {
		await ses.send(
			new SendEmailCommand({
				FromEmailAddress: MAIL_FROM,
				Destination: { ToAddresses: [MAIL_TO] },
				...(email ? { ReplyToAddresses: [email] } : {}),
				Content: {
					Simple: {
						Subject: { Data: subject, Charset: "UTF-8" },
						Body: {
							Text: { Data: text, Charset: "UTF-8" },
							Html: { Data: html, Charset: "UTF-8" },
						},
					},
				},
			}),
		);
		return reply(200, { ok: true }, origin);
	} catch (err) {
		console.error("SES send failed:", err);
		return reply(
			502,
			{ ok: false, error: "Could not send. Please email sales@lucoze.com." },
			origin,
		);
	}
};
