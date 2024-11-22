# 📧 email-typo-fixer

A TypeScript library that fixes common email typos and formatting issues. It handles various advanced scenarios like Outlook-style emails, special characters, multiple @ symbols, and more.

## 🌟 Features

- Fixes common email typos and formatting issues
- Handles Outlook-style emails (e.g., "Name <email@example.com>")
- Handle common prefixes like "mailto:"
- Handles repeated domains (e.g., "user@gmail.com@gmail.com")
- Removes invalid special characters while preserving valid ones
- Preserves valid email characters (including +, _, -, .)
- Case-sensitive local part, lowercase domain
- No external dependencies
- Lightweight: ~2.4KB minified (ESM/CJS)

## Installation

```bash
npm install email-typo-fixer
# or
yarn add email-typo-fixer
# or
pnpm add email-typo-fixer
# or
bun add email-typo-fixer
```

## 🚀 Usage

```typescript
import { emailTypoFixer, DEFAULT_DOMAINS } from 'email-typo-fixer';

// Basic usage (using default domains)
const result = emailTypoFixer('user@gmial.com');
console.log(result.suggested); // 'user@gmail.com'

// Outlook-style email
const result2 = emailTypoFixer('John Doe <john.doe@@gmail.com>');
console.log(result2.suggested); // 'john.doe@gmail.com'

// With custom domains (overriding defaults)
const result3 = emailTypoFixer('user@company.internal', {
  domains: ['company.internal', 'corp.example.com']
});
console.log(result3.suggested); // 'user@company.internal'

// Combining default domains with custom domains
const result4 = emailTypoFixer('user@comapny.com', {
  domains: [...DEFAULT_DOMAINS, 'company.com']
});
console.log(result4.suggested); // 'user@comapny.com'
```

## 📘 API

### `emailTypoFixer(email: string, opts?: EmailTypoFixerOptions): EmailTypoFixerResult`

#### Parameters

- `email`: The email address to fix
- `opts` (optional): Configuration options
  - `domains`: Array of valid domains to use for corrections. Defaults to: 
    ```typescript
    [
      "gmail.com",
      "yahoo.com",
      "hotmail.com",
      "outlook.com",
      "icloud.com",
      "aol.com"
    ]
    ```

#### Returns

```typescript
interface EmailTypoFixerResult {
  original: string;       // Original input
  suggested?: string;     // Corrected email (if changes were made)
  hasCorrection: boolean; // Whether any corrections were made
}
```

### `DEFAULT_DOMAINS`

A constant array containing the default email domains used for corrections:

```typescript
export const DEFAULT_DOMAINS = [
  "gmail.com",
  "yahoo.com",
  "hotmail.com",
  "outlook.com",
  "icloud.com",
  "aol.com",
] as const;
```

You can use this constant to extend the default domains with your own:
```typescript
import { emailTypoFixer, DEFAULT_DOMAINS } from 'email-typo-fixer';

const customDomains = [...DEFAULT_DOMAINS, 'company.com', 'internal.corp'];
```

## ❤️ Credits

This project builds upon ideas from:
- [email-spell-checker](https://github.com/ZooTools/email-spell-checker) - Implementation of the Sift3 algorithm and configurable domains approach

## 📝 Examples of Fixes

Here are some common fixes the library handles:

- Outlook Format: `"John Doe <john.doe@example.com>"` → `"john.doe@example.com"`
- Multiple @: `"user@@gmail.com"` → `"user@gmail.com"`
- Special Characters: `"user.name+tag@domain.com$"` → `"user.name+tag@domain.com"`
- Domain Typos: `"user@gmial.com"` → `"user@gmail.com"`
- Multiple Fixes: `"John Smith <test,user@@gmial..com>"` → `"test.user@gmail.com"`

For a comprehensive list of examples and edge cases, check out our [test file](https://github.com/Patrick-Ullrich/email-typo-fixer/blob/main/src/index.test.ts)

## 📄 License

MIT

## 🤝 Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.
