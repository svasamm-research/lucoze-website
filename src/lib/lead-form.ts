// Shared controller for the /in/contact and /in/design-partner forms.
//
// Contract:
//   - name is required
//   - phone (^[6-9]\d{9}$) OR email satisfies the gate — either one enables submit
//   - submit POSTs to lucoze_admin.api.contact.submit_lead with source="contact"
//     or source="design-partner". Admin de-dupes against CRM Lead by
//     email/mobile_no and pings support_email.
//   - on pre-launch builds (no PUBLIC_ADMIN_API_URL), we skip the network
//     and go straight to the success state so the page still feels alive.

type Source = "contact" | "design-partner";

interface InitOptions {
	source: Source;
	successHref: string;
}

interface LucozeTrackerGlobal {
	trackFormField?: (field: string, value: string) => void;
	trackFormAbandon?: () => void;
}

const PHONE_RE = /^[6-9]\d{9}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const getTracker = (): LucozeTrackerGlobal | undefined =>
	(window as unknown as { LucozeTracker?: LucozeTrackerGlobal }).LucozeTracker;

const getVisitorId = (): string | null => {
	try {
		return window.localStorage.getItem("lucoze-visitor-id");
	} catch {
		return null;
	}
};

const extractError = (data: unknown, status: number): string => {
	const payload = (data || {}) as Record<string, unknown>;
	const serverMessages = payload["_server_messages"];
	if (typeof serverMessages === "string") {
		try {
			const arr = JSON.parse(serverMessages) as string[];
			if (arr.length > 0) {
				const first = JSON.parse(arr[0]) as { message?: string };
				if (first.message) return first.message;
			}
		} catch {
			/* fall through */
		}
	}
	const msg = payload["message"];
	if (typeof msg === "string") return msg;
	return `Request failed (${status}).`;
};

export function initLeadForm({ source }: InitOptions): void {
	const form = document.querySelector<HTMLFormElement>("[data-contact-form]");
	if (!form) return;

	const card = document.querySelector<HTMLElement>("[data-contact-card]");
	const success = document.querySelector<HTMLElement>("[data-contact-success]");
	const submitBtn = form.querySelector<HTMLButtonElement>("[data-contact-submit]");
	const submitLabel = form.querySelector<HTMLElement>("[data-contact-submit-label]");
	const errorEl = form.querySelector<HTMLElement>("[data-contact-error]");
	const phoneInput = form.querySelector<HTMLInputElement>('input[name="phone"]');
	const phoneWrap = form.querySelector<HTMLElement>("[data-phone-wrap]");
	const phoneErr = form.querySelector<HTMLElement>("[data-phone-err]");
	const emailInput = form.querySelector<HTMLInputElement>('input[name="email"]');
	const emailErr = form.querySelector<HTMLElement>("[data-email-err]");
	const nameInput = form.querySelector<HTMLInputElement>('input[name="name"]');
	const resetBtn = document.querySelector<HTMLButtonElement>("[data-contact-reset");

	const ADMIN = import.meta.env.PUBLIC_ADMIN_API_URL as string | undefined;

	const originalSubmitText = submitLabel?.textContent ?? "Submit";

	const showError = (msg: string) => {
		if (!errorEl) return;
		errorEl.textContent = msg;
		errorEl.hidden = false;
	};
	const clearError = () => {
		if (errorEl) errorEl.hidden = true;
	};

	const setLoading = (loading: boolean) => {
		if (submitBtn) submitBtn.disabled = loading;
		if (submitLabel) submitLabel.textContent = loading ? "Sending…" : originalSubmitText;
		if (submitBtn) submitBtn.style.opacity = loading ? "0.6" : "1";
	};

	const showSuccess = () => {
		form.dataset.submitted = "true";
		if (card) card.hidden = true;
		if (success) {
			success.hidden = false;
			success.scrollIntoView({ behavior: "smooth", block: "center" });
		}
	};

	const showFormAgain = () => {
		form.dataset.submitted = "";
		if (success) success.hidden = true;
		if (card) card.hidden = false;
		if (nameInput) nameInput.focus();
	};

	// Strip non-digits, cap at 10. Mirrors the handoff's `setPhone`.
	if (phoneInput) {
		phoneInput.addEventListener("input", () => {
			const cleaned = phoneInput.value.replace(/\D/g, "").slice(0, 10);
			if (cleaned !== phoneInput.value) phoneInput.value = cleaned;
			updateValidity();
		});
	}
	if (emailInput) {
		emailInput.addEventListener("input", () => updateValidity());
	}
	if (nameInput) {
		nameInput.addEventListener("input", () => updateValidity());
	}

	const updateValidity = () => {
		const name = (nameInput?.value || "").trim();
		const phone = (phoneInput?.value || "").trim();
		const email = (emailInput?.value || "").trim();
		const phoneOk = PHONE_RE.test(phone);
		const emailOk = EMAIL_RE.test(email);

		// Show field-level errors only when the user has typed something invalid,
		// not when the field is empty (low-friction, matches the handoff).
		if (phoneWrap) phoneWrap.classList.toggle("reach-phone--bad", Boolean(phone && !phoneOk));
		if (phoneErr) phoneErr.hidden = !(phone && !phoneOk);
		if (emailInput)
			emailInput.style.borderColor = email && !emailOk ? "var(--error, #b1342a)" : "";
		if (emailErr) emailErr.hidden = !(email && !emailOk);

		const valid = Boolean(name && (phoneOk || emailOk));
		if (submitBtn) {
			submitBtn.disabled = !valid;
			submitBtn.style.opacity = valid ? "1" : "0.5";
		}
		return { name, phone, email, phoneOk, emailOk, valid };
	};

	// Wire LucozeTracker form-field hooks. The admin's FORM_FIELD_MAP
	// recognises `customer_name`, `phone`, `email` — we use those keys.
	const FIELD_KEYS: Record<string, string> = {
		name: "customer_name",
		phone: "phone",
		email: "email",
	};
	for (const [inputName, mappedName] of Object.entries(FIELD_KEYS)) {
		const input = form.querySelector<HTMLInputElement>(`[name="${inputName}"]`);
		if (!input) continue;
		input.addEventListener("blur", () => {
			const v = input.value.trim();
			if (v) getTracker()?.trackFormField?.(mappedName, v);
		});
	}

	// Form abandon — fires on tab close if user touched the form but never
	// reached the success state. Same pattern as the signup page.
	let formInteracted = false;
	form.addEventListener("input", () => {
		formInteracted = true;
	});
	window.addEventListener("beforeunload", () => {
		if (formInteracted && form.dataset.submitted !== "true") {
			getTracker()?.trackFormAbandon?.();
		}
	});

	form.addEventListener("submit", async (e) => {
		e.preventDefault();
		clearError();
		const { name, phone, email, phoneOk, emailOk, valid } = updateValidity();
		if (!valid) return;

		// Pass the salutation as a separate field so the admin can split
		// first/last name cleanly. Prepending it into `name` ends up filling
		// first_name with the title and leaves the CRM list view's Full
		// Name column showing just "Dr.".
		const titleSel = form.querySelector<HTMLSelectElement>('select[name="title"]');
		const title = (titleSel?.value || "").trim();

		// Pre-launch (no admin URL): skip network, fall straight through.
		if (!ADMIN) {
			showSuccess();
			return;
		}

		setLoading(true);
		try {
			const body = {
				name,
				title,
				source,
				phone: phoneOk ? phone : null,
				email: emailOk ? email : null,
				visitor_id: getVisitorId(),
			};
			const res = await fetch(
				`${ADMIN}/api/method/lucoze_admin.api.contact.submit_lead`,
				{
					method: "POST",
					headers: { "Content-Type": "application/json", Accept: "application/json" },
					body: JSON.stringify(body),
				},
			);
			let data: unknown = {};
			try {
				data = await res.json();
			} catch {
				/* non-JSON */
			}
			if (!res.ok) {
				showError(extractError(data, res.status));
				return;
			}
			showSuccess();
		} catch {
			showError(
				"Couldn't reach the server. Try again, or email hello@lucoze.com directly.",
			);
		} finally {
			setLoading(false);
		}
	});

	if (resetBtn) resetBtn.addEventListener("click", () => showFormAgain());

	// Run once on load in case the browser autofilled fields before our listeners attached.
	updateValidity();
}
