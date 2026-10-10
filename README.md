# Slides.win agent skills

Create and refine App Store, Google Play and social campaigns through the Slides.win MCP API. The package contains three skills:

- `slides-win-campaigns`: create a complete store campaign from product facts and authentic screenshots, inspect previews, then export.
- `slides-win-social-remix`: adapt an authorized social reference into an original creation.
- `slides-win-refine`: make focused edits and localizations while preserving facts, locks and revisions.

## Install

Node.js 22 or later is required for the npm installer. Install all three skills for Codex in the current project:

```sh
npx @slides-win/skills@beta install --agent codex
```

Install for your user account:

```sh
npx @slides-win/skills@beta install --global --agent codex
npx @slides-win/skills@beta install --global --agent claude-code
```

The default target is `.agents/skills` in the current project. Global Codex uses `$CODEX_HOME/skills`, or `~/.codex/skills` when unset. Claude Code uses `.claude/skills`. Other agents can use `--dir PATH` to select their skills directory. To install one skill, add `--skill slides-win-campaigns`. `list` shows the available names.

The installer works from bundled files, without dependencies, network requests or install lifecycle scripts. Repeating an installation leaves identical files alone. It refuses changed local instructions unless you review them and add `--force`; unrelated files are preserved. Symbolic links in installation paths are refused.

Alternatively, use the open skills CLI from this public repository:

```sh
npx skills add slides-win/slides-win-skills -a codex
```

You can also copy the three folders from `skills/` into your agent's skills directory.

## Connect Slides.win

Sign in at [Slides.win MCP settings](https://slides.win/app/mcp), create an account-scoped token with permissions appropriate to your work, and configure your MCP client with `https://slides.win/api/mcp` and that bearer token. Store the token in your client's private configuration, outside the skills and source control. Installation does not grant account access or configure your client.

For example: “Use Slides.win to create an English App Store campaign for my existing product from these original screenshots. Show me the previews before exporting.” Give the agent an explicit credit ceiling when authorizing paid generation.

The skills discover the live tool schemas. They preserve original-image provenance, account isolation, revisions, field locks, credit budgets and the approval required for store publication. They do not turn generated interfaces into authentic screenshots, complete provider checkout or publish a store listing through installation. Social publication remains a manual handoff.

This first npm release is a beta. The instructions and installer are MIT licensed; a Slides.win account and the service's normal allowances are separate. Issues: [public tracker](https://github.com/slides-win/slides-win-skills/issues).

## Develop

```sh
npm test
npm pack --ignore-scripts
```

`manifest.json` records the bundled skill checksums. The npm package includes only the installer, three skills, manifest, package metadata, README and license. Tests remain in the public repository. Application code and private history are excluded.
