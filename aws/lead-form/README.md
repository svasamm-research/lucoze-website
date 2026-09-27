# lucoze.com lead form — Lambda + Function URL + SES

Replaces the Frappe site `admin.lucoze.com` as the place lucoze.com's forms
submit to. Decided 27 September 2026: Lucoze is merging into Svasamm One and has
no clients, so a lead needs only to reach an inbox — the same as svasamm.com and
t4suite.com.

**Flow:** lead form or signup (browser) → `POST` Function URL → Lambda → SES →
**sales@lucoze.com** (Reply-To = the lead's email, when they gave one).

⚠️ **Unlike the other two sites, a lead gives a phone OR an email.** Either may be
missing, so neither is required on its own. The handler refuses only a lead with
no name, or one with no way to reach them.

## 1 · SES

`lucoze.com` must be a verified identity in **us-east-1** (Listmonk already sends
through it, so it most likely is). Check: SES console → Verified identities →
`lucoze.com` → _Verified_, DKIM _Successful_.

## 2 · IAM role — `lucoze-lead-form-role`

Trusted entity **Lambda**; attach **`AWSLambdaBasicExecutionRole`**; add inline:

```json
{
	"Version": "2012-10-17",
	"Statement": [{ "Effect": "Allow", "Action": "ses:SendEmail", "Resource": "*" }]
}
```

## 3 · The function — `lucoze-lead-form`

Author from scratch → **Node.js 20.x** → the role above. Paste
[`index.mjs`](./index.mjs) as `index.mjs` (handler `index.handler`, no zip, the
runtime bundles `@aws-sdk/client-sesv2`). Timeout 10 s.

| env var        | value                                                              |
| -------------- | ------------------------------------------------------------------ |
| `SES_REGION`   | `us-east-1`                                                        |
| `MAIL_FROM`    | `no-reply@lucoze.com`                                              |
| `MAIL_TO`      | `sales@lucoze.com`                                                 |
| `ALLOW_ORIGIN` | `https://lucoze.com,https://www.lucoze.com,https://uat.lucoze.com` |

## 4 · Function URL

Configuration → Function URL → Create → Auth **NONE** → CORS: origins as above,
methods `POST`, headers `content-type`. Copy the URL
(`https://<id>.lambda-url.us-east-1.on.aws/`) — it becomes the build argument
`PUBLIC_LEAD_URL`.

## 5 · Prove it before the site points at it

```sh
URL='https://<id>.lambda-url.us-east-1.on.aws/'
curl -s -X POST "$URL" -H 'content-type: application/json' -H 'origin: https://lucoze.com' \
  -d '{"name":"Test lead","phone":"+91 98300 12345","source":"curl test"}'
# → {"ok":true}, and an email in sales@lucoze.com
curl -s -X POST "$URL" -H 'content-type: application/json' -d '{"name":"No contact"}'
# → 422 {"ok":false,"error":"Please give a phone number or an email so we can reach you."}
```

## Tested before shipping

`index.mjs` was run against a stub SES in nine cases: CORS preflight, honeypot
(sends nothing), no name, no phone or email, too-short phone, phone-only (no
Reply-To), email (Reply-To set), HTML escaping, and an SES failure (502).
