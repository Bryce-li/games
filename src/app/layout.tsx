import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { I18nProvider } from "../components/I18nProvider";
import { AuthProvider } from "../components/auth/AuthProvider";
import { ThemeProvider } from "next-themes";
import { GlobalLoadingProvider } from "../components/GlobalLoading";

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
            <head />
            <body
                className="font-sans antialiased"
                suppressHydrationWarning
                style={{
                    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                    '--font-geist-sans': 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                    '--font-geist-mono': 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace'
                } as React.CSSProperties}
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

                <I18nProvider>
                    <AuthProvider>
                        <ThemeProvider
                            attribute="class"
                            defaultTheme="system"
                            enableSystem
                            disableTransitionOnChange
                        >
                            <GlobalLoadingProvider>
                                {children}
                            </GlobalLoadingProvider>
                        </ThemeProvider>
                    </AuthProvider>
                </I18nProvider>
                <Script src="https://accounts.google.com/gsi/client" strategy="beforeInteractive" />
            </body>
        </html>
    );
}
