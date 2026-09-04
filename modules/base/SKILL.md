# Base Module Skill

Use this module when changing platform metadata, users, menus, actions, views, module lifecycle records, authentication-related core records, or generic technical administration.

## Scope

- Owns core metadata models: `core.module`, `core.model`, `core.model.field`, `core.view`, `core.action`, `core.menu`, `core.external.id`, `core.user`, and `ir.attachment`.
- Provides technical administration menus and views under Settings.
- Provides base routes for module install, upgrade, uninstall, refresh, authentication, and generic runtime metadata support.
- Every business model receives audit fields from base: `create_uid`, `write_uid`, `create_date`, `write_date`.
- `ir.attachment` stores file metadata in the database and stores new uploaded file bytes under `ATTACHMENT_STORAGE_PATH` (default `storage/attachments`). `datas` is accepted as base64 input, written to the local filesystem, then cleared from metadata. Existing MinIO attachments remain readable, and URL attachments may still use `storage = url`.

## User Workflows

- Module administration: go to Settings > Technical > Modules, use Refresh Modules to discover code modules, then Install or Upgrade from the module form.
- User administration: go to Settings > Users to create users, set passwords, reset API tokens, and activate/deactivate users.
- Technical metadata: use Models, Fields, Views, Actions, and Menus under Settings > Technical to inspect runtime metadata generated from code modules.
- Attachments: go to Settings > Technical > Attachments, choose a local file in Upload File, and the UI uploads it through `/api/attachments/upload` as multipart data. The server streams it to the local attachment directory, creates `ir.attachment`, and stores `bucket`, `object_name`, `file_size`, and `checksum`.
- Attachment downloads use `GET /api/attachments/:id/download`. URL attachments redirect when `storage = url`.

## Feature Map

- Generic CRUD APIs: `/api/model/search`, `/api/model/read`, `/api/model/search_read`, `/api/model/create`, `/api/model/write`, `/api/model/unlink`, `/api/model/call`.
- Module lifecycle APIs: `/api/modules/refresh`, `/api/modules/install`, `/api/modules/upgrade`, `/api/modules/uninstall`.
- Authentication APIs: `/api/auth/login`, `/api/auth/register`, `/api/auth/me`, `/api/auth/logout`, `/api/auth/reset-token`.
- Attachment APIs: `/api/attachments/upload` and `/api/attachments/:id/download`.

## Extension Guidance

- Preserve custom records. Do not remove or overwrite records where `is_custom = 1`.
- Treat install/upgrade/uninstall as the intentional point where code metadata reconciles with database metadata and physical tables.
- Startup discovery must remain lightweight: do not seed data, backfill all tables, or regenerate external ids unless install/upgrade is explicitly requested.
- Do not put business-domain logic in base unless it is genuinely generic platform behavior.
- When adding a new metadata table or lifecycle behavior, update the corresponding technical model, views, routes, registry/db handling, and changelog together.
- Large files must not be sent as base64 JSON. Use multipart upload and stream to the configured attachment directory.

## Verification

- Run `npm run check` and `npm run build` after code changes.
- Test module install/upgrade/uninstall paths when lifecycle behavior changes.
- Test a file upload larger than 10 MB after changing attachment storage or upload UI.
