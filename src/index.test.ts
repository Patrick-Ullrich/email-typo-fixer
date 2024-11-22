import { describe, expect, test } from "bun:test";
import { emailTypoFixer } from ".";

describe("emailTypoFixer", () => {
	describe("invalid cases", () => {
		test("should handle empty input", () => {
			const result = emailTypoFixer("");
			expect(result.hasCorrection).toBe(false);
			expect(result.original).toBe("");
		});

		test("should handle invalid email format", () => {
			const result = emailTypoFixer("notanemail");
			expect(result.hasCorrection).toBe(false);
			expect(result.original).toBe("notanemail");
		});
	});

	describe("space removal tests", () => {
		test("should remove spaces from email", () => {
			const result = emailTypoFixer("test user@gmail.com");
			expect(result.hasCorrection).toBe(true);
			expect(result.suggested).toBe("testuser@gmail.com");
		});

		test("should remove multiple spaces", () => {
			const result = emailTypoFixer("test  user @ gmail.com");
			expect(result.hasCorrection).toBe(true);
			expect(result.suggested).toBe("testuser@gmail.com");
		});
	});

	describe("comma replacement tests", () => {
		test("should replace comma with dot", () => {
			const result = emailTypoFixer("user@gmail,com");
			expect(result.hasCorrection).toBe(true);
			expect(result.suggested).toBe("user@gmail.com");

			const result2 = emailTypoFixer("us,er@gmail.com");
			expect(result2.hasCorrection).toBe(true);
			expect(result2.suggested).toBe("us.er@gmail.com");
		});

		test("should replace multiple commas", () => {
			const result = emailTypoFixer("us,er@sub,domain,com");
			expect(result.hasCorrection).toBe(true);
			expect(result.suggested).toBe("us.er@sub.domain.com");
		});
	});

	describe("multiple dots tests", () => {
		test("should fix multiple consecutive dots", () => {
			const result = emailTypoFixer("user@gmail..com");
			expect(result.hasCorrection).toBe(true);
			expect(result.suggested).toBe("user@gmail.com");

			const result2 = emailTypoFixer("us..er@gmail.com");
			expect(result2.hasCorrection).toBe(true);
			expect(result2.suggested).toBe("us.er@gmail.com");
		});

		test("should fix multiple dots throughout email", () => {
			const result = emailTypoFixer("user..name@gmail...com");
			expect(result.hasCorrection).toBe(true);
			expect(result.suggested).toBe("user.name@gmail.com");
		});
	});

	describe("repetitive domain tests", () => {
		test("should fix repetitive domain", () => {
			const result = emailTypoFixer("user@gmail.com@gmail.com");
			expect(result.hasCorrection).toBe(true);
			expect(result.suggested).toBe("user@gmail.com");
		});

		test("should fix repetitive domain with different cases", () => {
			const result = emailTypoFixer("user@Gmail.com@gmail.COM");
			expect(result.hasCorrection).toBe(true);
			expect(result.suggested).toBe("user@gmail.com");
		});
	});

	describe("domain typos", () => {
		test("should fix domain typos", () => {
			const result = emailTypoFixer("user@gmial.com");
			expect(result.hasCorrection).toBe(true);
			expect(result.suggested).toBe("user@gmail.com");
		});

		test("should work with custom domains", () => {
			const result = emailTypoFixer("user@custom,domian.com", {
				domains: ["custom.domain.com"],
			});
			expect(result.hasCorrection).toBe(true);
			expect(result.suggested).toBe("user@custom.domain.com");
		});

		test("should preserve local part case sensitivity", () => {
			const result = emailTypoFixer("TestUser@gmial.com");
			expect(result.hasCorrection).toBe(true);
			expect(result.suggested).toBe("TestUser@gmail.com");
		});
	});

	describe("prefix and suffix fixes", () => {
		test("should handle trailing/leading spaces", () => {
			const result = emailTypoFixer(" user@gmail.com ");
			expect(result.hasCorrection).toBe(true);
			expect(result.suggested).toBe("user@gmail.com");
		});

		test("should remove mailto: prefix", () => {
			const result = emailTypoFixer("mailto:user@gmail.com");
			expect(result.hasCorrection).toBe(true);
			expect(result.suggested).toBe("user@gmail.com");
		});

		test("should remove email: prefix", () => {
			const result = emailTypoFixer("email:user@gmail.com");
			expect(result.hasCorrection).toBe(true);
			expect(result.suggested).toBe("user@gmail.com");
		});

		test("should remove .html suffix", () => {
			const result = emailTypoFixer("user@gmail.com.html");
			expect(result.hasCorrection).toBe(true);
			expect(result.suggested).toBe("user@gmail.com");
		});
	});

	describe("character substitution fixes", () => {
		test("should replace [at] with @", () => {
			const result = emailTypoFixer("user[at]gmail.com");
			expect(result.hasCorrection).toBe(true);
			expect(result.suggested).toBe("user@gmail.com");
		});

		test("should replace (at) with @", () => {
			const result = emailTypoFixer("user(at)gmail.com");
			expect(result.hasCorrection).toBe(true);
			expect(result.suggested).toBe("user@gmail.com");
		});

		test("should replace [dot] with .", () => {
			const result = emailTypoFixer("user@gmail[dot]com");
			expect(result.hasCorrection).toBe(true);
			expect(result.suggested).toBe("user@gmail.com");
		});

		test("should remove brackets and parentheses", () => {
			const result = emailTypoFixer("(user)@[gmail].com");
			expect(result.hasCorrection).toBe(true);
			expect(result.suggested).toBe("user@gmail.com");
		});
	});

	describe("domain fixes", () => {
		test("should add missing @ symbol", () => {
			const result = emailTypoFixer("usergmail.com");
			expect(result.hasCorrection).toBe(true);
			expect(result.suggested).toBe("user@gmail.com");
		});
	});

	describe("outlook style emails", () => {
		test("should extract email from outlook format", () => {
			const result = emailTypoFixer("Patrick Ullrich <test@gmail.com>");
			expect(result.hasCorrection).toBe(true);
			expect(result.suggested).toBe("test@gmail.com");
		});

		test("should handle multiple angle brackets", () => {
			const result = emailTypoFixer("<<test@gmail.com>>");
			expect(result.hasCorrection).toBe(true);
			expect(result.suggested).toBe("test@gmail.com");
		});

		test("should handle name with special characters", () => {
			const result = emailTypoFixer("O'Neil, Patrick <patrick@example.com>");
			expect(result.hasCorrection).toBe(true);
			expect(result.suggested).toBe("patrick@example.com");
		});
	});

	describe("local part fixes", () => {
		test("should remove leading dots", () => {
			const result = emailTypoFixer(".user@gmail.com");
			expect(result.hasCorrection).toBe(true);
			expect(result.suggested).toBe("user@gmail.com");
		});

		test("should remove trailing dots", () => {
			const result = emailTypoFixer("user.@gmail.com");
			expect(result.hasCorrection).toBe(true);
			expect(result.suggested).toBe("user@gmail.com");
		});
	});

	describe("multiple @ handling", () => {
		test("should handle consecutive @ symbols", () => {
			const result = emailTypoFixer("user@@gmail.com");
			expect(result.hasCorrection).toBe(true);
			expect(result.suggested).toBe("user@gmail.com");
		});

		test("should handle multiple @ symbols by keeping last domain", () => {
			const result = emailTypoFixer("user@domain@gmail.com");
			expect(result.hasCorrection).toBe(true);
			expect(result.suggested).toBe("userdomain@gmail.com");
		});

		test("should handle complex multiple @ cases", () => {
			const result = emailTypoFixer("first@second@third@example.com");
			expect(result.hasCorrection).toBe(true);
			expect(result.suggested).toBe("firstsecondthird@example.com");
		});
	});

	describe("special character handling", () => {
		test("should remove invalid characters at end", () => {
			const result = emailTypoFixer("test@test.com$");
			expect(result.hasCorrection).toBe(true);
			expect(result.suggested).toBe("test@test.com");
		});

		test("should remove multiple special characters at end", () => {
			const result = emailTypoFixer("test@test.com$#!");
			expect(result.hasCorrection).toBe(true);
			expect(result.suggested).toBe("test@test.com");

			const result2 = emailTypoFixer("user@gmail.com$#");
			expect(result2.hasCorrection).toBe(true);
			expect(result2.suggested).toBe("user@gmail.com");
		});

		test("should remove problematic characters", () => {
			const result = emailTypoFixer("user&name@domain.com");
			expect(result.hasCorrection).toBe(true);
			expect(result.suggested).toBe("username@domain.com");

			const result2 = emailTypoFixer("user\\name@domain.com");
			expect(result2.hasCorrection).toBe(true);
			expect(result2.suggested).toBe("username@domain.com");

			const result3 = emailTypoFixer("user;name@domain.com");
			expect(result3.hasCorrection).toBe(true);
			expect(result3.suggested).toBe("username@domain.com");

			const result4 = emailTypoFixer("user^name@domain.com");
			expect(result4.hasCorrection).toBe(true);
			expect(result4.suggested).toBe("username@domain.com");

			const result5 = emailTypoFixer("user#name@domain.com");
			expect(result5.hasCorrection).toBe(true);
			expect(result5.suggested).toBe("username@domain.com");

			const result6 = emailTypoFixer("user*name@domain.com");
			expect(result6.hasCorrection).toBe(true);
			expect(result6.suggested).toBe("username@domain.com");

			const result7 = emailTypoFixer("user;^*%&#name@domain.com");
			expect(result7.hasCorrection).toBe(true);
			expect(result7.suggested).toBe("username@domain.com");
		});

		test("should preserve valid special characters", () => {
			const result = emailTypoFixer("user.name+tag@domain.com");
			expect(result.hasCorrection).toBe(false);
			expect(result.original).toBe("user.name+tag@domain.com");
		});
	});

	describe("combined fixes", () => {
		test("should fix multiple issues together", () => {
			const result = emailTypoFixer("mailto:.user[at]gmail[dot]con.");
			expect(result.hasCorrection).toBe(true);
			expect(result.suggested).toBe("user@gmail.com");
		});

		test("should handle complex combinations", () => {
			const result = emailTypoFixer("to: user (at) gmial[dot]co @gmail.com");
			expect(result.hasCorrection).toBe(true);
			expect(result.suggested).toBe("user@gmail.com");
		});
	});

	test("should fix multiple issues at once", () => {
		const result = emailTypoFixer("Patrick O'Neil <  test,user@@gmial..com$> ");
		expect(result.hasCorrection).toBe(true);
		expect(result.suggested).toBe("test.user@gmail.com");
	});
});
