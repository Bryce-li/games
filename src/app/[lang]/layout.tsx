import type { Metadata } from "next";
import "../globals.css";
import { i18n, type Locale } from '@/lib/i18n-config'

export const metadata: Metadata = {
  title: "Free Online Games on CrazyGames | Play Now!",
  description: "Play free online games at CrazyGames, the best place to play high-quality browser games. We add new games every day. Have fun!",
};

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ lang: locale }))
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { lang: Locale };
}) {
  // 等待 params 参数
  const { lang } = await params;
  const validLang = i18n.locales.includes(lang) ? lang : i18n.defaultLocale;

  return (
    <html lang={validLang}>
      <body suppressHydrationWarning className="antialiased">
        {children}
      </body>
    </html>
  );
} 