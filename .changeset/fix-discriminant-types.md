---
"@tenderlift/simap-client": patch
---

Fix discriminant literal types that used schema names instead of enum type references, breaking TypeScript discriminated union narrowing on PublicationDetail, PubDraftDetail, and PublicProjectHeaderDates unions
