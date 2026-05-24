import { useMemo, useState } from "react";

/**
 * RoiCalculator — interactive ROI estimator for the home page.
 *
 * Mounted via `client:visible` so the React runtime only loads when the
 * section scrolls into view. Reuses the existing .roi / .roi__inputs /
 * .roi__outputs CSS from subpages.css — markup is intentionally identical
 * to the static placeholder it replaces.
 *
 * Formulas are illustrative; tuned to land at roughly the prototype's
 * numbers at the default inputs (6 doctors, 45 patients/day, ₹800/bill,
 * 5 beds).
 */

interface SpecialtyOption {
	id: string;
	label: string;
}

const SPECIALTIES: SpecialtyOption[] = [
	{ id: "multispec", label: "Multi-specialty clinic" },
	{ id: "poly", label: "Polyclinic" },
	{ id: "hospital", label: "Hospital" },
	{ id: "dental", label: "Dental group" },
	{ id: "ivf", label: "IVF clinic" },
	{ id: "derm", label: "Dermatology" },
	{ id: "diag", label: "Diagnostic centre" },
];

const WORKING_DAYS = 25;
const STAFF_HOUR_VALUE_INR = 400;
const LEAKAGE_PCT = 0.03;
const NOSHOW_PCT = 0.0182;
const BED_OCCUPANCY = 0.7;
const BED_DAY_BILL_INR = 5000;
const BED_DAYS_PER_MONTH = 30;
const STAFF_HOURS_PER_BED = 5;

const fmtINR = (n: number): string => {
	const rounded = Math.round(n);
	if (rounded >= 100000) return `₹${(rounded / 100000).toFixed(1)}L`;
	return `₹${rounded.toLocaleString("en-IN")}`;
};

const fmtInt = (n: number): string => Math.round(n).toLocaleString("en-IN");

export default function RoiCalculator() {
	const [specialty, setSpecialty] = useState<string>("multispec");
	const [doctors, setDoctors] = useState<number>(6);
	const [perDay, setPerDay] = useState<number>(45);
	const [avgBill, setAvgBill] = useState<number>(800);
	const [beds, setBeds] = useState<number>(5);

	const calc = useMemo(() => {
		const monthlyOpdRevenue = perDay * WORKING_DAYS * avgBill;
		const monthlyIpdRevenue = beds * BED_OCCUPANCY * BED_DAYS_PER_MONTH * BED_DAY_BILL_INR;
		const monthlyRevenue = monthlyOpdRevenue + monthlyIpdRevenue;

		const staffHoursSaved = 50 + doctors * 30 + beds * STAFF_HOURS_PER_BED;
		const billingLeakage = monthlyRevenue * LEAKAGE_PCT;
		const noShowPrevention = monthlyOpdRevenue * NOSHOW_PCT;
		const total = staffHoursSaved * STAFF_HOUR_VALUE_INR + billingLeakage + noShowPrevention;
		return { staffHoursSaved, billingLeakage, noShowPrevention, total };
	}, [doctors, perDay, avgBill, beds]);

	const activeSpecialty = SPECIALTIES.find((s) => s.id === specialty) ?? SPECIALTIES[0];

	return (
		<div className="roi">
			<div className="roi__inputs">
				<div className="roi__field">
					<label htmlFor="roi-specialty">
						Specialty
						<strong
							style={{
								color: "var(--primary)",
								fontFamily: "var(--font-display)",
								fontSize: "16px",
							}}
						>
							{activeSpecialty.label}
						</strong>
					</label>
					<select
						id="roi-specialty"
						className="roi__select"
						value={specialty}
						onChange={(e) => setSpecialty(e.target.value)}
					>
						{SPECIALTIES.map((s) => (
							<option key={s.id} value={s.id}>
								{s.label}
							</option>
						))}
					</select>
				</div>

				<div className="roi__field">
					<label htmlFor="roi-doctors">
						Doctors <strong>{doctors}</strong>
					</label>
					<input
						id="roi-doctors"
						type="range"
						min={1}
						max={50}
						step={1}
						value={doctors}
						onChange={(e) => setDoctors(Number(e.target.value))}
						className="range"
					/>
				</div>

				<div className="roi__field">
					<label htmlFor="roi-perday">
						Patients per day <strong>{perDay}</strong>
					</label>
					<input
						id="roi-perday"
						type="range"
						min={5}
						max={200}
						step={1}
						value={perDay}
						onChange={(e) => setPerDay(Number(e.target.value))}
						className="range"
					/>
				</div>

				<div className="roi__field">
					<label htmlFor="roi-avgbill">
						Average bill per patient <strong>{`₹${avgBill.toLocaleString("en-IN")}`}</strong>
					</label>
					<input
						id="roi-avgbill"
						type="range"
						min={200}
						max={5000}
						step={50}
						value={avgBill}
						onChange={(e) => setAvgBill(Number(e.target.value))}
						className="range"
					/>
				</div>

				<div className="roi__field">
					<label htmlFor="roi-beds">
						Number of beds <strong>{beds}</strong>
					</label>
					<input
						id="roi-beds"
						type="range"
						min={0}
						max={300}
						step={1}
						value={beds}
						onChange={(e) => setBeds(Number(e.target.value))}
						className="range"
					/>
				</div>
			</div>

			<div className="roi__outputs" aria-live="polite">
				<div className="roi__metric">
					<div className="roi__metric-label">Estimated total monthly value</div>
					<div className="roi__metric-value roi__metric-value--accent">{fmtINR(calc.total)}</div>
					<div className="roi__metric-sub">
						Combined: staff hours + billing recovered + no-show prevention
					</div>
				</div>
				<div className="roi__metric">
					<div className="roi__metric-label">Staff hours saved</div>
					<div className="roi__metric-value">
						{fmtInt(calc.staffHoursSaved)}
						<span style={{ fontSize: "18px", marginLeft: "6px", opacity: 0.7 }}>hr/mo</span>
					</div>
					<div className="roi__metric-sub">
						Auto-reminders, one-click billing, no double-entry between modules
					</div>
				</div>
				<div className="roi__metric">
					<div className="roi__metric-label">Billing leakage recovered</div>
					<div className="roi__metric-value">{fmtINR(calc.billingLeakage)}</div>
					<div className="roi__metric-sub">
						Discounts not logged, items missed at billing, partial payments untracked
					</div>
				</div>
				<div className="roi__metric">
					<div className="roi__metric-label">No-show prevention</div>
					<div className="roi__metric-value">{fmtINR(calc.noShowPrevention)}</div>
					<div className="roi__metric-sub">WhatsApp + SMS reminders reduce no-shows by ~5-7%</div>
				</div>
			</div>
		</div>
	);
}
