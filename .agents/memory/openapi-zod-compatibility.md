---
name: OpenAPI and Zod compatibility
description: Compatibility constraint between the workspace Orval generator and its installed Zod version.
---

The workspace Orval setup can generate `z.int()` for OpenAPI `integer` schemas, but the installed Zod major version may not expose that helper. Use `type: number` for API identifiers when generated Zod compatibility is required; application and database code can still enforce integer IDs.

**Why:** API codegen initially completed but the generated library typecheck failed because the installed Zod package did not provide `z.int()`.

**How to apply:** After changing the OpenAPI contract, run the API codegen and library typecheck together. If integer schemas trigger `z.int()`, prefer the compatible numeric schema rather than manually editing generated files.