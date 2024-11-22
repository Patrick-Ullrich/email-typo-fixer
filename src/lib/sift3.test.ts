import { describe, expect, test } from "bun:test";
import { findClosestMatch, sift3Distance } from "./sift3";

describe("sift3Distance", () => {
	test("should return 0 for identical strings", () => {
		expect(sift3Distance("hello", "hello")).toBe(0);
		expect(sift3Distance("", "")).toBe(0);
		expect(sift3Distance("gmail.com", "gmail.com")).toBe(0);
	});

	test("should handle empty inputs", () => {
		expect(sift3Distance("", "test")).toBe(4);
		expect(sift3Distance("test", "")).toBe(4);
		expect(sift3Distance("", "")).toBe(0);
	});

	test("should calculate distance for email domains with typos", () => {
		const result = sift3Distance("gmail.com", "gmial.com");
		expect(result).toBe(2);

		const result2 = sift3Distance("hotmail.com", "hotmial.com");
		expect(result2).toBe(2);

		const result3 = sift3Distance("yahoo.com", "yhaoo.com");
		expect(result3).toBe(2);
	});

	test("should handle completely different strings", () => {
		const result = sift3Distance("gmail.com", "yahoo.com");
		expect(result).toBeGreaterThan(3);
	});

	test("should be case sensitive", () => {
		const result = sift3Distance("Gmail.com", "gmail.com");
		expect(result).toBeGreaterThan(0);
	});
});

describe("findClosestMatch", () => {
	const commonDomains = [
		"gmail.com",
		"yahoo.com",
		"hotmail.com",
		"outlook.com",
	];

	test("should find exact matches", () => {
		const result = findClosestMatch("gmail.com", commonDomains);
		expect(result.match).toBe("gmail.com");
		expect(result.distance).toBe(0);
	});

	test("should find closest match for typos", () => {
		const result1 = findClosestMatch("gmial.com", commonDomains);
		expect(result1.match).toBe("gmail.com");

		const result2 = findClosestMatch("yhaoo.com", commonDomains);
		expect(result2.match).toBe("yahoo.com");

		const result3 = findClosestMatch("hotmial.com", commonDomains);
		expect(result3.match).toBe("hotmail.com");
	});

	test("should return best match even for non-similar strings", () => {
		const result = findClosestMatch("something.com", commonDomains);
		expect(result.match).toBeTruthy();
		expect(result.distance).toBeGreaterThan(3);
	});

	test("should handle empty candidates array", () => {
		const result = findClosestMatch("gmail.com", []);
		expect(result.match).toBeNull();
		expect(result.distance).toBe(Number.POSITIVE_INFINITY);
	});

	test("should work with arrays containing one element", () => {
		const result = findClosestMatch("gmail.com", ["gmail.com"]);
		expect(result.match).toBe("gmail.com");
		expect(result.distance).toBe(0);
	});
});

// Performance test
describe("performance", () => {
	test("should handle long strings efficiently", () => {
		const start = performance.now();
		const longString1 = "a".repeat(1000);
		const longString2 = `${"a".repeat(999)}b`;

		const result = sift3Distance(longString1, longString2);
		const duration = performance.now() - start;

		expect(duration).toBeLessThan(100); // Should complete in less than 100ms
		expect(result).toBeGreaterThan(0);
	});
});
