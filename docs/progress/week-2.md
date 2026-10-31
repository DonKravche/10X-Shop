# Week 2 — Product, Cart and Checkout

**24–31 October 2026** · Annex A, D2 (FULL)

## Done

- Product details with the gallery and the quantity stepper.
- CartContext with immutable updates, wired to Add to cart everywhere.
- Cart page: quantities, removal, totals.
- Checkout: four controlled fields, validation, local order confirmation.
- Error Boundary around the routed page.
- README, REPORT and DEBUG-LOG.

CORE was complete at this point apart from the deploy, and then re-audited
against both PDFs line by line. That audit found four things the first pass
had missed and one it had introduced — recorded in `REPORT.md` §1.

## Blockers

The audit's own findings, in order of how much they mattered:

1. **The repository looked empty.** Seventeen commits had never been pushed.
   Nothing was lost; `git push` restored the lot.
2. **"Add to cart" reported the wrong number** on a fast double click
   (`DEBUG-LOG` entry 7).
3. **The cross-browser suite had been failing silently** for two commits
   after an accessibility fix changed a heading level (entry 8).

## Hours

Roughly 14, against the 14 estimated for epics D to F.

## Next

FULL: the catalogue toolbar, reviews, orders, profile.
