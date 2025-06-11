# MiniPlayGame

A Next.js 15 based mini game platform.

## Features

- Next.js 15 with App Router
- TypeScript support
- Tailwind CSS for styling
- Internationalization (i18n) support
  - English and Simplified Chinese
  - Easy to add more languages
  - Language detection and switching
- Modern UI components with Shadcn UI
- Responsive design
- Game categories and filtering
- Featured games section
- Original games showcase

## Getting Started

```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Internationalization

The project uses react-i18next for internationalization. Currently supported languages:

- English (en)
- Simplified Chinese (zh)

Language files are located in `src/lib/i18n/locales/`.

To add a new language:
1. Create a new JSON file in the locales directory
2. Add the language to the languages array in `src/components/LanguageSelector.tsx`
3. Import and add the translation in `src/lib/i18n/config.ts`

## Project Structure

```
src/
  ├── app/              # Next.js app router pages
  ├── components/       # React components
  ├── lib/             # Utilities and configurations
  │   └── i18n/        # Internationalization setup
  └── styles/          # Global styles
```

## Contributing

Feel free to open issues and pull requests!

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
