/**
 * Calculates the SIFT3 distance between two strings
 * Implementation based on Siderite Zackwehdex's work
 */
export function sift3Distance(s1: string, s2: string) {
	if (!s1 || !s2) return s1 ? s1.length : s2 ? s2.length : 0;
	if (s1 === s2) return 0;

	let c = 0;
	let offset1 = 0;
	let offset2 = 0;
	let lcs = 0;
	const maxOffset = 5;

	while (c + offset1 < s1.length && c + offset2 < s2.length) {
		if (s1[c + offset1] === s2[c + offset2]) {
			lcs++;
		} else {
			offset1 = offset2 = 0;
			for (
				let i = 0;
				i < maxOffset && (c + i < s1.length || c + i < s2.length);
				i++
			) {
				if (c + i < s1.length && s1[c + i] === s2[c]) {
					offset1 = i;
					break;
				}
				if (c + i < s2.length && s1[c] === s2[c + i]) {
					offset2 = i;
					break;
				}
			}
		}
		c++;
	}

	return (s1.length + s2.length) / 2 - lcs;
}

/**
 * Finds the closest match from an array of strings
 */
export function findClosestMatch(target: string, candidates: string[]) {
	let bestMatch = null;
	let bestDistance = Number.POSITIVE_INFINITY;

	for (const candidate of candidates) {
		const distance = sift3Distance(target, candidate);
		if (distance < bestDistance) {
			bestDistance = distance;
			bestMatch = candidate;
		}
	}

	return { match: bestMatch, distance: bestDistance };
}
