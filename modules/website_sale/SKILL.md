# Website Sale Module Skill

Use this module to publish active products from `product.product` on the public website.

## Scope

- Depends on `website` and `product`.
- Publishes `/products` and `/products/:slug` through the Next.js website app.
- Provides public product data through `/api/website-sale/products` and `/api/website-sale/products/:slug`.
- Does not duplicate or own product records; product data remains owned by the `product` module.

## Extension Guidance

- Add product fields to `modules/product` when the field is part of the shared product master data.
- Add presentation and catalog behavior here when it is specific to the public website.
- Keep public endpoints limited to active products and explicitly selected public fields.
- Upgrade this module after changing its views or seed pages.
