"use client";

import Link from "next/link";
import type { ReactNode } from "react";

/** Fired when someone clicks "home" while already on the game page: the game resets to its landing state. */
export const HOME_EVENT = "conyotype:home";

export function HomeLink({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <Link
      href="/"
      className={className}
      onClick={(e) => {
        if (window.location.pathname !== "/") return;
        e.preventDefault();
        window.dispatchEvent(new Event(HOME_EVENT));
      }}
    >
      {children}
    </Link>
  );
}
