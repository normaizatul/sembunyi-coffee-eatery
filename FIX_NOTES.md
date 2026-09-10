# SmartDinePlus — Repair Notes

## Fixed

- Orders now save directly through the existing Firestore service instead of depending on `/api/orders` first.
- Duplicate order writes were removed.
- The order tracker is updated immediately after a successful save.
- Checkout now shows a visible error instead of silently failing.
- Customer name and Malaysian mobile number are validated before submission.
- Order IDs now use a timestamp-based value to greatly reduce collisions.
- SmartDine chat now falls back to a built-in menu recommendation engine when the AI/API endpoint is unavailable.
- The fallback uses the live menu and supports spicy, budget, drinks, burgers, western food, pasta/pizza, and dessert requests in BM or English.

## Verification

- `npm run lint` passed.
- `npm run build` passed.

## Deployment note

For live multi-device ordering, deploy `firestore.rules` to the same Firebase project/database configured in `firebase-applet-config.json`. For production, replace the current open development rules with authenticated role-based rules before collecting real customer data.
