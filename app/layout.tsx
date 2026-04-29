import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NOI EDITORS — Raw to Royalty",
  description: "NOI EDITORS portfolio, client portal, and admin dashboard"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Cinzel:wght@400;600;700;800&family=Cinzel+Decorative:wght@700&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&family=IM+Fell+English:ital@0;1&family=Syne:wght@400;600;700;800&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
