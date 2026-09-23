import type { Metadata, Viewport } from "next";
import { Bagel_Fat_One, DM_Mono, Figtree } from "next/font/google";
import Link from "next/link";
import { HomeLink } from "@/features/game/HomeLink";
import { currentPlayer } from "@/features/identity/player";
import { ProfileMenu } from "@/features/identity/ProfileMenu";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

const display = Bagel_Fat_One({ variable: "--ff-display", weight: "400", subsets: ["latin"] });
const body = Figtree({ variable: "--ff-body", subsets: ["latin"] });
const mono = DM_Mono({ variable: "--ff-mono", weight: ["400", "500"], subsets: ["latin"] });

const description = "30 seconds of typing conyo chika to the GC. One leaderboard. Okayyy but like, can you make chika fast?";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "ConyoType", template: "%s · ConyoType" },
  description,
  openGraph: {
    title: "ConyoType",
    description,
    siteName: "ConyoType",
    type: "website",
    locale: "en_PH",
    url: "/",
  },
  twitter: { card: "summary_large_image", title: "ConyoType", description },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#EEF0E4" },
    { media: "(prefers-color-scheme: dark)", color: "#141913" },
  ],
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const player = await currentPlayer();
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body>
        <div className="app">
          <header>
            <div>
              <HomeLink className="mark">
                conyo<em>type</em>
              </HomeLink>
              <p className="tag">Like, type fast or you&apos;re so not invited to the GC.</p>
            </div>
            <nav>
              <HomeLink>Play</HomeLink>
              <Link href="/leaderboard">Leaderboard</Link>
              {player && <ProfileMenu username={player.username} school={player.school} />}
            </nav>
          </header>
          {children}
          <footer>
            made with <span className="heart" aria-label="love">♥</span> by{" "}
            <a href="https://edwarddiesta.com" target="_blank" rel="noopener noreferrer">
              Edward Diesta
            </a>
          </footer>
        </div>
      </body>
    </html>
  );
}
