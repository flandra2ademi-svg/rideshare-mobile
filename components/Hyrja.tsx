"use client";

import { signIn, signOut } from "next-auth/react";

export default function Hyrja({ brenda }: { brenda: boolean }) {
  return brenda ? (
    <button className="action" onClick={() => signOut({ callbackUrl: "/panel" })}>Dil</button>
  ) : (
    <button className="action" onClick={() => signIn("github", { callbackUrl: "/panel" })}>Hyr me GitHub</button>
  );
}
