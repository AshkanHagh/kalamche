import type { Metadata } from "next"
import { Geist, Geist_Mono, Poppins } from "next/font/google"
import "./globals.css"
import MainLayout from "@/components/layout/MainLayout"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"]
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"]
})

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: "500"
})

export const metadata: Metadata = {
  title: "Kalamche",
  authors: [
    { name: "Shahin Fallah", url: "https://github.com/ShahinFallah" },
    { name: "Ashkan Haghdoost", url: "https://github.com/AshkanHagh" }
  ]
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={`${poppins.variable} ${geistMono.variable} ${geistSans.variable} antialiased font-sans`}
      >
        <MainLayout>{children}</MainLayout>
      </body>
    </html>
  )
}
