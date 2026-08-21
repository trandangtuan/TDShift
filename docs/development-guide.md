# Development Guide

This guide explains how to add features to the record-driven platform. The main rule is: define business behavior in module metadata, then let the backend registry and generic web client render it.

## Change Workflow

Before changing code, check how the change affects:

- module metadata
- database schema
- existing records
- install, upgrade, and uninstall behavior
- generic list/form rendering
- `CHANGELOG.md`

Every implemented change must be recorded in `CHANGELOG.md`.

After code changes, run:

```bash
npm run check
npm run build
```

## Module Structure

Use this structure for feature modules:

```text
modules/<module>/
|-- module.ts
|-- models/
|   |-- index.ts
|   `-- <model-name>.ts
|-- views/
|   |-- index.ts
|   `-- <model-name>.ts
`-- data/
    |-- index.ts
    `-- <records-name>.ts
```

`module.ts` should compose the manifest. Keep model, view, and seed data definitions in separate files.

## Create A New Module

Example module: `library`.

```text
modules/library/
|-- module.ts
|-- models/
|   |-- book.ts
|   `-- index.ts
|-- views/
|   |-- book.ts
|   `-- index.ts
`-- data/
    |-- books.ts
    `-- index.ts
```

Create `modules/library/models/book.ts`:

```ts
import type { ModelDefinition } from "@record-platform/core";

export const bookModel: ModelDefinition = {
  technicalName: "library.book",
  name: "Book",
  tableName: "library_book",
  fields: [
    { name: "name", label: "Title", type: "char", required: true, sequence: 10 },
    { name: "author", label: "Author", type: "char", sequence: 20 },
    { name: "isbn", label: "ISBN", type: "char", indexed: true, sequence: 30 },
    { name: "published_date", label: "Published Date", type: "date", sequence: 40 },
    { name: "active", label: "Active", type: "boolean", defaultValue: true, sequence: 50 }
  ]
};
```

Create `modules/library/models/index.ts`:

```ts
export { bookModel } from "./book";
```

## Create Views

Create `modules/library/views/book.ts`:

```ts
import type { ViewDefinition } from "@record-platform/core";

export const bookViews: ViewDefinition[] = [
  {
    technicalName: "library.book.list",
    name: "Books",
    model: "library.book",
    type: "list",
    architecture: {
      type: "list",
      model: "library.book",
      fields: ["name", "author", "isbn", "published_date", "active"]
    }
  },
  {
    technicalName: "library.book.form",
    name: "Book",
    model: "library.book",
    type: "form",
    architecture: {
      type: "form",
      model: "library.book",
      children: [
        {
          type: "group",
          children: [
            { type: "field", name: "name" },
            { type: "field", name: "author" },
            { type: "field", name: "isbn" },
            { type: "field", name: "published_date" },
            { type: "field", name: "active" }
          ]
        }
      ]
    }
  }
];
```

Create `modules/library/views/index.ts`:

```ts
export { bookViews } from "./book";
```

## Create Seed Data

Create `modules/library/data/books.ts`:

```ts
import type { DataRecordDefinition } from "@record-platform/core";

export const bookData: DataRecordDefinition[] = [
  {
    externalId: "library.book_clean_code",
    model: "library.book",
    values: {
      name: "Clean Code",
      author: "Robert C. Martin",
      isbn: "9780132350884",
      active: true
    }
  }
];
```

Create `modules/library/data/index.ts`:

```ts
export { bookData } from "./books";
```

## Create Action And Menu

Create `modules/library/module.ts`:

```ts
import { defineModule } from "@record-platform/core";
import { bookData } from "./data";
import { bookModel } from "./models";
import { bookViews } from "./views";

export default defineModule({
  technicalName: "library",
  displayName: "Library",
  version: "1.0.0",
  depends: ["base"],
  sequence: 40,
  models: [bookModel],
  views: bookViews,
  actions: [
    {
      technicalName: "library.action_books",
      name: "Books",
      type: "window",
      model: "library.book",
      viewModes: ["list", "form"]
    }
  ],
  menus: [
    {
      technicalName: "library.menu_root",
      name: "Library",
      icon: "book",
      sequence: 40
    },
    {
      technicalName: "library.menu_books",
      name: "Books",
      parent: "library.menu_root",
      action: "library.action_books",
      sequence: 10
    }
  ],
  data: bookData
});
```

Register the module in `apps/server/src/modules.ts`:

```ts
import library from "../../../modules/library/module";

export const moduleDefinitions: ModuleDefinition[] = [base, contacts, sale, saleDiscount, library];
```

See `modules/website` for a simple module with admin metadata plus a public route in `apps/server/src/main.ts`.

## Install Or Upgrade A Module

Start the app:

```bash
npm run dev
```

Open the web app, then:

1. Log in.
2. Go to `Settings > Technical > Modules`.
3. Open the module.
4. Click `Install` for a new module or `Upgrade` after code changes.

Install creates model metadata, views, actions, menus, database tables, fields, audit columns, and seed data.

Upgrade reconciles code with metadata:

- new fields are added to metadata and database tables
- removed module-owned stored fields are dropped from database tables
- removed module-owned views, actions, and menus are removed from active metadata

## Field Types

Supported field types are defined in `packages/core/src/index.ts`.

Common types:

- `char`
- `text`
- `integer`
- `decimal`
- `boolean`
- `date`
- `datetime`
- `selection`
- `many2one`
- `one2many`
- `json`

Example `selection` field:

```ts
{
  name: "state",
  label: "State",
  type: "selection",
  defaultValue: "draft",
  selectionOptions: [
    { label: "Draft", value: "draft" },
    { label: "Done", value: "done" }
  ]
}
```

Example `many2one` field:

```ts
{
  name: "partner_id",
  label: "Customer",
  type: "many2one",
  relationModel: "res.partner",
  required: true
}
```

Example `one2many` field:

```ts
{
  name: "line_ids",
  label: "Lines",
  type: "one2many",
  relationModel: "library.book.line",
  inverseField: "book_id",
  stored: false
}
```

## Add A Method

Methods are defined on a model and called through:

```text
POST /api/model/call
```

Example:

```ts
export const bookModel: ModelDefinition = {
  technicalName: "library.book",
  name: "Book",
  tableName: "library_book",
  fields: [],
  methods: {
    async archive(ctx) {
      await ctx.env.model("library.book").write(ctx.ids, { active: false });
      return { archived: ctx.ids.length };
    }
  }
};
```

The form UI currently has hard-coded buttons for some known methods. For a new model method to appear as a generic button, the web client needs a generic action/button metadata feature.

## Extend Another Module

Extension modules can add fields to an existing model.

Example: add `x_rating` to `library.book` from a module named `library_rating`:

```ts
export const bookRatingModel: ModelDefinition = {
  technicalName: "library.book",
  name: "Book",
  tableName: "library_book",
  fields: [
    { name: "x_rating", label: "Rating", type: "integer", sequence: 100 }
  ]
};
```

Add a view extension:

```ts
import type { ViewExtensionDefinition } from "@record-platform/core";

export const bookRatingViewExtensions: ViewExtensionDefinition[] = [
  {
    technicalName: "library_rating.book_form_rating",
    targetView: "library.book.form",
    operation: "after",
    target: "author",
    content: { type: "field", name: "x_rating" }
  }
];
```

When this module is installed, the field is added to `library_book`. When the module is uninstalled, its stored extension columns are dropped.

## Audit Fields

Every model table gets these fields automatically:

- `create_uid`
- `write_uid`
- `create_date`
- `write_date`

Do not add these manually to model definitions. The platform injects them into metadata and physical tables.

## Authentication

Most APIs require:

```text
Authorization: Bearer <token>
```

Login:

```bash
curl -X POST http://localhost:3100/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"login":"admin","password":"admin"}'
```

Registration:

```bash
curl -X POST http://localhost:3100/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"login":"demo","name":"Demo User","email":"demo@example.local","password":"demo123"}'
```

## Naming Rules

Use stable technical names:

- Module: `library`
- Model: `library.book`
- Table: `library_book`
- List view: `library.book.list`
- Form view: `library.book.form`
- Action: `library.action_books`
- Menu: `library.menu_books`
- External ID: `library.book_clean_code`

Do not rename technical names casually. Renaming can make upgrade look like delete plus create.

## Checklist

Before finishing a change:

- Add or update model files.
- Add or update views.
- Add or update actions and menus.
- Add seed data if needed.
- Register new modules in `apps/server/src/modules.ts`.
- Update `CHANGELOG.md`.
- Run `npm run check`.
- Run `npm run build`.
- Install or upgrade the module in the UI.
