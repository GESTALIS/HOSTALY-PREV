# Contrats d'API — HOTALY PREV (Phase 0)

Préfixe: `/api/v1`

- GET `/health`
  - 200 `{ status: "ok" }`
  - En-têtes Helmet visibles, `X-Powered-By` absent

- POST `/auth/login`
  - body: `{ email: string, password: string }`
  - 200: `{ token: string }`

- GET `/scenarios` (protégé JWT)
  - 200: `Scenario[]`
- POST `/scenarios` (protégé JWT)
  - body: `{ name: string, horizonYears?: number, isActive?: boolean }`
  - 201: `Scenario`
- DELETE `/scenarios/:id` (protégé JWT)
  - 204: no content
- PUT `/scenarios/:id/assumptions` (protégé JWT)
  - body: `{ revenues: RevenueAssumption[], charges: ChargeAssumption[], payroll: PayrollAssumption[], openings: OpeningWindow[] }`
  - 200: `{ ok: true }`

- GET `/calendar/zone-a` (protégé JWT)
  - 200: `CalendarDate[]` (5 ans seedés)

- POST `/simulate/:id?from=YYYY-MM&to=YYYY-MM` (protégé JWT)
  - 501: `{ code: "NOT_IMPLEMENTED", message: string }`

- GET `/results/:id?granularity=monthly` (protégé JWT)
  - 200: `{ granularity: string, items: [], total: number, page: number, pageSize: number }` (vide)

Format d’erreur unique: `{ code, message, details? }`
