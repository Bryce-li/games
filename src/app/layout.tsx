import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientBody from "./ClientBody";
import { cookies } from 'next/headers';
import { headers } from 'next/headers';

const inter = Inter({
    subsets: ["latin"],
    display: 'swap',
});

export const metadata: Metadata = {
    title: "Free Online Games on CrazyGames | Play Now!",
    description: "Play free online games at CrazyGames, the best place to play high-quality browser games. We add new games every day. Have fun!",
};

export default async function RootLayout({
    children,
    searchParams,
}: Readonly<{
    children: React.ReactNode;
    searchParams?: { [key: string]: string | string[] | undefined };
}>) {
    // 获取请求中的语言参数
    const urlLang = typeof searchParams?.lang === 'string' ? searchParams.lang : undefined;
    
    // 从 cookie 中获取语言设置
    const cookieStore = await cookies();
    const cookieLang = cookieStore.get('i18next')?.value;
    
    // 按优先级使用：URL参数 > cookie > 默认值'en'
    const lang = urlLang || cookieLang || 'en';

    return (
        <html lang={lang} className={inter.className}>
            <body suppressHydrationWarning className="antialiased">
                <ClientBody lang={lang}>{children}</ClientBody>
            </body>
        </html>
    );
}
