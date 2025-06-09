import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientBody from "./ClientBody";

const inter = Inter({
    subsets: ["latin"],
    display: 'swap',
});

export const metadata: Metadata = {
    title: "Free Online Games on CrazyGames | Play Now!",
    description: "Play free online games at CrazyGames, the best place to play high-quality browser games. We add new games every day. Have fun!",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className={inter.className}>
            <body suppressHydrationWarning className="antialiased">
                <ClientBody>{children}</ClientBody>
            </body>
        </html>
    );
}
