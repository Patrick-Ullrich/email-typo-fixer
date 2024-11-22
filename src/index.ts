import { findClosestMatch } from "./lib/sift3";

/**
 * Default list of common email domains used for corrections
 */
export const DEFAULT_DOMAINS = [
	"gmail.com",
	"yahoo.com",
	"hotmail.com",
	"outlook.com",
	"icloud.com",
	"aol.com",
];

interface EmailTypoFixerOptions {
	domains?: string[];
}

interface EmailTypoFixerResult {
	original: string;
	suggested?: string;
	hasCorrection: boolean;
}

/**
 * Fixes common email typos including spaces, repetitive domains, and punctuation issues
 * @param email Original email address
 * @param opts Configuration options including list of valid domains
 * @returns Object containing original and suggested email if correction found
 */
export const emailTypoFixer = (
	email: string,
	opts?: EmailTypoFixerOptions,
): EmailTypoFixerResult => {
	// Early return if email is empty
	if (!email) {
		return {
			original: email,
			hasCorrection: false,
		};
	}

	let correctedEmail = email.trim();
	let hasChanges = email !== correctedEmail;

	// Default domains if none provided
	const domains = opts?.domains || DEFAULT_DOMAINS;

	// Fix: Handle Outlook-style email format (e.g., "Firstname Lastname <test@test.com>")
	const outlookEmailPattern = /<([^<>]+)>/;
	const outlookMatch = correctedEmail.match(outlookEmailPattern);
	if (outlookMatch) {
		correctedEmail = outlookMatch[1];
		hasChanges = true;
	}

	// Fix: Remove spaces
	if (correctedEmail.includes(" ")) {
		correctedEmail = correctedEmail.replace(/\s+/g, "");
		hasChanges = true;
	}

	// Fix: Replace commas with dots
	if (correctedEmail.includes(",")) {
		correctedEmail = correctedEmail.replace(/,/g, ".");
		hasChanges = true;
	}

	// Fix: Multiple consecutive dots to single dot
	if (correctedEmail.includes("..")) {
		correctedEmail = correctedEmail.replace(/\.+/g, ".");
		hasChanges = true;
	}

	// Fix: Multiple consecutive @ to single @
	if (correctedEmail.includes("@@")) {
		correctedEmail = correctedEmail.replace(/@@+/g, "@");
		hasChanges = true;
	}

	// Fix: Repetitive domains (e.g., @gmail.com@gmail.com)
	for (const domain of domains) {
		const domainPattern = new RegExp(`@${domain}@${domain}$`, "i");
		if (domainPattern.test(correctedEmail)) {
			correctedEmail = correctedEmail.replace(domainPattern, `@${domain}`);
			hasChanges = true;
			break;
		}
	}

	// Fix: Handle multiple @
	if (correctedEmail.split("@").length > 2) {
		const parts = correctedEmail.split("@");
		const lastPart = parts.pop();
		correctedEmail = `${parts.join("")}@${lastPart}`;
		hasChanges = true;
	}

	// Fix: Remove non-alphanumeric ending if present
	const lastChar = correctedEmail[correctedEmail.length - 1];
	if (lastChar && !/[a-zA-Z0-9]/.test(lastChar)) {
		correctedEmail = correctedEmail.slice(0, -1);
		hasChanges = true;
	}

	// Fix: Replace common problematic characters
	const originalEmail = correctedEmail;
	correctedEmail = correctedEmail.replace(/[;^*%&#/\\]/g, "");
	if (correctedEmail !== originalEmail) {
		hasChanges = true;
	}

	// Fix: Remove common email prefix/suffix typos
	const prefixSuffixFixes = [
		{ pattern: /^mailto:/i, replacement: "" },
		{ pattern: /^email:/i, replacement: "" },
		{ pattern: /^to:/i, replacement: "" },
	];

	for (const fix of prefixSuffixFixes) {
		if (fix.pattern.test(correctedEmail)) {
			correctedEmail = correctedEmail.replace(fix.pattern, fix.replacement);
			hasChanges = true;
		}
	}

	// Fix: Common character substitutions
	const characterFixes = [
		{ pattern: /\[at\]/gi, replacement: "@" },
		{ pattern: /\(at\)/gi, replacement: "@" },
		{ pattern: / at /gi, replacement: "@" },
		{ pattern: /\[dot\]/gi, replacement: "." },
		{ pattern: /\(dot\)/gi, replacement: "." },
		{ pattern: / dot /gi, replacement: "." },
		{ pattern: /[\[\]{}()]/g, replacement: "" },
		{ pattern: /\,/g, replacement: "." },
	];

	for (const fix of characterFixes) {
		if (fix.pattern.test(correctedEmail)) {
			correctedEmail = correctedEmail.replace(fix.pattern, fix.replacement);
			hasChanges = true;
		}
	}

	// Fix: Remove any invalid characters at the end of the email
	if (correctedEmail.includes("@")) {
		const [localPart, domain] = correctedEmail.split("@");

		// Clean up local part - remove special characters except for valid email characters
		const cleanedLocalPart = localPart.replace(/[^a-zA-Z0-9.+_-]/g, "");
		if (cleanedLocalPart !== localPart) {
			hasChanges = true;
		}

		// Clean up domain part - remove invalid characters at the end and convert to lowercase
		const cleanedDomain = domain.replace(/[^a-zA-Z0-9.-]+/g, "").toLowerCase();
		if (cleanedDomain !== domain) {
			hasChanges = true;
		}

		correctedEmail = `${cleanedLocalPart}@${cleanedDomain}`;
	}

	// Fix: Domain without @
	if (!correctedEmail.includes("@")) {
		for (const domain of domains) {
			if (correctedEmail.toLowerCase().endsWith(domain)) {
				correctedEmail = `${correctedEmail.slice(0, -domain.length)}@${domain}`;
				hasChanges = true;
				break;
			}
		}
	}

	// Fix: Leading/trailing dots in local part
	if (correctedEmail.includes("@")) {
		const [localPart, domain] = correctedEmail.split("@");
		const trimmedLocalPart = localPart.replace(/^\.+|\.+$/g, "");
		if (trimmedLocalPart !== localPart) {
			correctedEmail = `${trimmedLocalPart}@${domain}`;
			hasChanges = true;
		}
	}

	// Only proceed with domain correction if we have a valid email format
	if (correctedEmail.includes("@")) {
		const [localPart, domain] = correctedEmail.split("@");

		// If no domain part, return current corrections
		if (!domain) {
			return {
				original: email,
				suggested: hasChanges ? correctedEmail : undefined,
				hasCorrection: hasChanges,
			};
		}

		// Find closest matching domain
		const domainMatch = findClosestMatch(domain.toLowerCase(), domains);

		// If domain is different and distance is acceptable, suggest correction
		if (
			domainMatch.distance <= 2.5 &&
			domain.toLowerCase() !== domainMatch.match?.toLowerCase()
		) {
			correctedEmail = `${localPart}@${domainMatch.match}`;
			hasChanges = true;
		}
	}

	return {
		original: email,
		suggested: hasChanges ? correctedEmail : undefined,
		hasCorrection: hasChanges,
	};
};
