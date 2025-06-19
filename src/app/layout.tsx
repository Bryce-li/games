import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { I18nProvider } from "../components/I18nProvider";

const geistSans = Geist({
    subsets: ["latin"],
    variable: "--font-geist-sans",
});

const geistMono = Geist_Mono({
    subsets: ["latin"],
    variable: "--font-geist-mono",
});

export const metadata: Metadata = {
    title: "MiniPlayGame",
    description: "A Next.js 15 based mini game platform",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body
                className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
                suppressHydrationWarning
            >
                {/* Google Analytics 脚本 - 在整个应用中生效 */}
                <Script
                    src="https://www.googletagmanager.com/gtag/js?id=G-EMGT22HG1L"
                    strategy="afterInteractive"
                />
                <Script id="google-analytics" strategy="afterInteractive">
                    {`
                        window.dataLayer = window.dataLayer || [];
                        function gtag(){dataLayer.push(arguments);}
                        gtag('js', new Date());
                        gtag('config', 'G-EMGT22HG1L');
                    `}
                </Script>

                <I18nProvider>{children}</I18nProvider>
            </body>
        </html>
    );
}
