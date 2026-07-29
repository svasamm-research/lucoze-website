/**
 * Single source of truth for public contact details.
 *
 * Update the number/email HERE only — everything (schema, footer, contact +
 * demo pages, the WhatsApp button) imports from this module. We previously had
 * three different numbers scattered across the site; this prevents that drift.
 *
 * Note: the public line below is the human-answered WhatsApp Business number.
 * The product's Meta WhatsApp *API* number (automated patient messages) is a
 * different number and lives in the backend, not here.
 */

export const PHONE = "+91 82178 20249"; // display form
export const PHONE_TEL = "+918217820249"; // tel: href + schema (E.164)
export const WHATSAPP = "918217820249"; // wa.me number (Business App)
export const SALES_EMAIL = "sales@lucoze.com";

const DEFAULT_WA_MSG = "Hi Lucoze, I'd like to know more about your clinic software.";

/** Click-to-chat deep link. Best on mobile — opens the app straight to the chat. */
export const waLink = (message: string = DEFAULT_WA_MSG): string =>
	`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(message)}`;

/**
 * WhatsApp Web link. On desktop this shows the QR-login → chat, whereas `wa.me`
 * shows a "download the app" landing. The FAB swaps to this on desktop.
 */
export const webWaLink = (message: string = DEFAULT_WA_MSG): string =>
	`https://web.whatsapp.com/send?phone=${WHATSAPP}&text=${encodeURIComponent(message)}`;
