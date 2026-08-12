This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Code Formatting

This project uses **Prettier** and **ESLint** to ensure consistent code formatting across all developers.

### Automatic Formatting

- **Format on Save**: Prettier automatically formats your code when you save files in VS Code
- **Pre-commit Hooks**: Code is automatically formatted and linted before commits using Husky and lint-staged

### Manual Formatting

```bash
# Format all files
npm run format

# Check formatting without making changes
npm run format:check

# Fix ESLint issues
npm run lint:fix
```

### VS Code Setup

1. Install the [Prettier VS Code extension](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
2. The project includes `.vscode/settings.json` which configures format on save automatically
3. If you're using a different editor, ensure Prettier is configured to use the `.prettierrc` file

### What Gets Formatted

- All TypeScript/JavaScript files (`.ts`, `.tsx`, `.js`, `.jsx`)
- JSON, Markdown, CSS, and YAML files
- Code is automatically formatted on commit via pre-commit hooks

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
