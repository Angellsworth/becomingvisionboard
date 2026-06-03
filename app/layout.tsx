import type React from "react"
import type { Metadata } from "next"
import { Inter, Cormorant_Garamond, Italiana } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { YearProvider } from "@/components/year-provider"
import { AuthProvider } from "@/components/auth-provider"
import { ThemeProvider } from "@/components/theme-provider"
import { PaletteProvider } from "@/components/palette-provider"
import { AudioProvider } from "@/components/audio-provider"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
})
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-serif",
})
const italiana = Italiana({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-display",
})

export const metadata: Metadata = {
  title: "Becoming",
  description:
    "A personal dashboard for women intentionally creating their next chapter. She is not starting over. She is becoming.",
  generator: "v0.app",
  icons: {
    icon: [
      { url: "/icon-light-32x32.png", media: "(prefers-color-scheme: light)" },
      { url: "/icon-dark-32x32.png", media: "(prefers-color-scheme: dark)" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-icon.png",
  },
}

// Inline script that runs before React hydrates so the html element gets
// the user's saved palette class immediately — prevents a flash of the
// wrong colors on first paint.
const SET_PALETTE_SCRIPT = `(function(){try{var p=localStorage.getItem('becoming-palette');var valid=['peony','sage-garden','coral-bloom','twilight'];if(!p||valid.indexOf(p)===-1)p='peony';document.documentElement.classList.add('palette-'+p);}catch(e){document.documentElement.classList.add('palette-peony');}})();`

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${cormorant.variable} ${italiana.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: SET_PALETTE_SCRIPT }} />
      </head>
      <body className="font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <PaletteProvider>
            <AudioProvider>
              <AuthProvider>
                <YearProvider>{children}</YearProvider>
              </AuthProvider>
            </AudioProvider>
          </PaletteProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
