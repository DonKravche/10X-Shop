/**
 * Password digests for the local account simulation (Annex A, P1.1 — FULL).
 *
 * What this is honest about
 * -------------------------
 * There is no server here (PRD rule 6), so nothing in this file is real
 * authentication. Anyone with devtools can read `shop_user`, replace a digest
 * or simply call the context's `login` directly. A check that runs on the
 * client can always be bypassed on the client.
 *
 * What it does buy: the password the visitor typed is never written down. A
 * SHA-256 digest is one-way, so a saved account cannot be read back as a
 * password — which matters because people reuse passwords, and a demo shop
 * has no business keeping one in plain text where the next script on the page
 * can read it.
 *
 * What it is not: there is no salt and no key-derivation function, so this
 * would not survive a real attacker with the stored digests. Production code
 * hashes on a server with Argon2 or bcrypt. This is the smallest thing that
 * is not plain text, and it is used because the alternative is worse, not
 * because it is sufficient.
 */

/**
 * SHA-256 of `password`, as lowercase hex.
 *
 * Throws when Web Crypto is unavailable. `crypto.subtle` exists only in a
 * secure context, which means https or localhost — both of which this
 * application runs in. Failing loudly beats silently storing something
 * weaker, so the caller turns this into a visible message instead.
 */
export async function hashPassword(password: string): Promise<string> {
  const subtle = globalThis.crypto?.subtle

  if (subtle === undefined) {
    throw new Error(
      'Web Crypto is unavailable, so accounts cannot be created. This page ' +
        'needs to be served over https or from localhost.',
    )
  }

  const digest = await subtle.digest('SHA-256', new TextEncoder().encode(password))

  return Array.from(new Uint8Array(digest))
    // taste-skill-ignore - zero-padding each byte to two hex digits, which is
    // how a digest is written down; nothing here reaches the interface.
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}
