# Week 1 — foundation, Login and Catalog

**24 October 2026** · Annex A, D2 (FULL)

## Done

- Vite + React 19 + TypeScript (strict) + Tailwind CSS v4 scaffolded;
  `typecheck`, `lint`, `build` and `preview` scripts in place and green.
- `PLAN.md` written before any feature code.
- Domain types, formatting and validation utilities, the product API.
- Layout, Header, Footer, routing, ScrollToTop and the Not found page.
- AuthContext and the Login controlled form.
- `ProtectedRoute` guarding `/checkout`.
- Catalogue loading from DummyJSON, rendered as ProductCards.

## Blockers

Two in the tooling, both written up in `DEBUG-LOG.md`: `@eslint/js` was pinned
to a version that does not exist (entry 1) and the react-hooks flat config
rejected its own documented shape (entry 2). Both cost more than the work they
were blocking.

## Hours

Roughly 18, against the 18 estimated in `PLAN.md` for epics A to C.

## Next

Product details, cart and checkout.
