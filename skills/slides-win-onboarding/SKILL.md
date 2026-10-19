---
name: slides-win-onboarding
description: "Connect Slides.win and reach a first useful workspace, saved draft or reviewed creative brief."
---

# Slides Win onboarding

Reuse the user’s stated goal and current product state. Start in the installed app or the product page/preview they selected. If it is unavailable, identify the access prerequisite; do not deploy a service or start a development environment for a normal user walkthrough.

1. Reuse the user’s installed client and any existing Slides.win connection. If tools are missing, identify the client’s supported remote-MCP setup before changing configuration. Use the current OAuth plugin connection when available; the full account endpoint is https://slides.win/api/mcp and uses a private token created at https://slides.win/app/mcp. Do not paste a token into chat or into a skill file.

2. Discover live tool names and schemas. For the full account surface read workspace_get and capabilities_get; for the plugin use studio_workspace when exposed. Check director_capabilities before promising generation. Verify the connected account and available allowance rather than inferring them from a successful login.

3. Ask only for the missing result: store campaign, social creation or refinement. Reopen a selected draft first. For an existing product, read product_memory_get and reuse its confirmed facts and original assets. Keep sample projects distinct from the user’s actual app.

4. For a new creation, collect only the brief and authentic source assets necessary for the requested result. Prepare that brief or the explicitly requested editable draft. Obtain a concrete credit ceiling before generation, then continue with the available campaign/remix/refinement workflow. Inspect rendered previews before export.

First useful result: The correct workspace and existing draft are accessible, or a truthful brief is ready for the selected workflow.

Skill installation is not account authorization or spending approval. Preserve revision checks, source provenance, review and separate store-publication approval. If a capability/provider is unavailable, finish with its concrete setup step rather than invented tools.

Use only tools and controls actually exposed by the current client/product. Guide in writing when direct control is unavailable, and distinguish an explanation from an action verified in the app. Installing this skill does not create an account, connect a provider or authorize unrelated changes.
