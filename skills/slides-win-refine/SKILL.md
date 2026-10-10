---
name: slides-win-refine
description: Make focused edits and localizations to existing Slides.win creations while preserving approved facts, field locks, image identity and revision history.
---

Refine an existing creation without changing unrelated content.

## Read before changing

Identify the saved creation with `creation_list` or `workspace_get`. Read its full campaign or creative record and `director_locks_get`. Clarify only an ambiguity that materially changes the requested edit. Keep the user's chosen scope, language and existing approval preferences.

Use `director_edit` with kind `campaign` or `creative`, the current version, a stable requestId and explicit scope. Campaign copy fields are `headline`/`subtitle`; social fields are `text`/`subtext`. Example: select the opening slide's headline in `en-US` and change only that text. Explicit changes avoid a model call. If an AI edit is needed, use the existing approved spend ceiling and inspect the returned change summary. Shared visual fields affect all locales; check their locks under locale `*`.

For store localization, use `campaign_generate` with the selected existing locale and `localize:true`, preserving art direction and truthful screenshot-language mapping. For social, use `creative_translate` with the supported language. Translation costs the normal AI credit. Read the saved result, then review each translated destination. Do not assume a shorter original means the translation fits, or that translated marketing copy changes the screenshot's real language.

Inspect prior generation receipts when diagnosing an unwanted change. Reuse the existing suitable image rather than paying for another because the text changed. Retrieve the saved settings and references, and state when historical data is unavailable. For intended visual alternatives, retain the source creation and the reason for the new choice.

## Connect and preserve context

Connect an MCP client to `https://slides.win/api/mcp` with an account-scoped bearer token created after signing in at `/app/mcp`. Token creation requires the user's initial login. Never put credentials in a prompt or this skill. Read `workspace_get`, `capabilities_get` and `director_capabilities`; discover actual tool schemas before calling them. IDs and files are account-owned. If a required tool is unavailable, describe the missing capability instead of inventing one.

Resolve the existing product before creating anything. Read `product_memory_get` for reusable facts, original assets, preferences and legal copy. Keep persistent product identity separate from this campaign's direction. Save new memory only when it is user-approved context. Generated suggestions never verify product facts or screenshot provenance.

For local PNG/JPEG/WebP files, compute byte length and SHA-256 locally. Call `asset_upload_request` with a stable UUID, filename, contentType, byteLength, sha256 and kind. PUT raw bytes to its exact uploadUrl with the returned headers, then call `asset_upload_complete` with its id. Repeating identical requests is safe. Expired tickets need a fresh UUID; a changed file needs a new UUID. Never paste image bytes into chat. `asset_upload_svg` handles static SVG artwork separately. Research assets cannot be used as original publishing assets.

Use `asset_context_get` / `asset_context_save` to retain why an image was chosen, its search query or source URL, and its intended role. Preserve the context revision. This metadata does not grant publishing rights or confirm product truth.

## Review, repair and deliver

Call `creation_review` with kind `store` or `social` and the saved id. For social translations pass the language. It returns the saved version, text-fit issues, exact preview tool calls, an editor link and completed exports matching the current content. Run every returned preview call and actually inspect the images. A text-fit pass is not visual approval.

Review the opening promise, the purpose of each frame, image authenticity and quality, text contrast and overlap, repeated copy, repeated layouts, and whether the sequence pays off its opening. For app campaigns, ensure each screen illustrates a factual benefit. For social, use a hook, useful progression, restrained contextual product mention and a closer. Short hooks and transitions need less copy than a useful explanation. Do not repeat the heading in the body. User constraints override these defaults.

When text overflows, shorten it or redistribute its content. Never claim an export is ready while it fails. Do not shrink type or silently truncate words to make the report pass. Use the current document version with `director_edit` and the smallest relevant slide/field/locale scope. Explicit `changes` are free; an AI instruction uses a credit. Read locks first with `director_locks_get`. A revision conflict means reload and reconcile. `director_undo` can restore a change only while its resulting version is current. Re-review changed previews, and each destination and language before delivery.

If the user requested their own inspection before export, present the previews and wait for that decision. An agent’s visual inspection does not satisfy that requested checkpoint. The Director maxCredits limits that run only; include subsequent paid edits in the overall user-authorized budget.

To export a saved document call `export_start`, then follow `next` with `export_advance` / `export_finish` until complete. Reuse saved job IDs after interruption. The Director also supports durable exports through `director_export`; poll `director_status`, without resubmitting generation. Export credits are charged for distinct content, not reads. `file_read` downloads completed archives in bounded chunks. The returned file checksum verifies the actual download.

Deliver the exact editor link and completed export links from current results. Distinguish the editable draft, the rendered preview and the finished export. Report unresolved issues and actual returned usage values. Do not estimate a credit balance from the number of calls. `workspace_get` and `campaign_credit_balance` expose the different allowance pools.

Generation troubleshooting: `generation_list` by subjectId or requestId, then `generation_get` supplies the submitted prompt/settings and reference order. `generation_reference_view` inspects a saved referenceIndex. `returned` means the provider returned successfully; it does not prove that application validation accepted or saved the output. Older calls may have no record. Never reconstruct historical settings from today's defaults.

Store publication requires a separate approval of the exact content hash and destination returned by `publication_prepare`. Creation, export, asset selection and a prior publication do not authorize a new publication. Social publication is a manual handoff. Checkout tools return hosted links and never complete a payment. Preserve spending authorization already given; obtain a new ceiling only when expanding it.
