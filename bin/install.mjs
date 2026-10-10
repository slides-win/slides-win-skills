#!/usr/bin/env node
import { createHash, randomUUID } from "node:crypto";
import {
  lstat,
  mkdir,
  readFile,
  rename,
  rm,
  writeFile,
} from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, join, parse, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const digest = (bytes) => createHash("sha256").update(bytes).digest("hex");
const help = `Slides.win agent skills

Usage: slides-win-skills [install|list] [options]
  --global                 Install for this user instead of the current project
  --agent codex|claude-code|universal
                           Choose the skills directory (default: universal)
  --dir PATH               Install into this exact skills directory
  --skill NAME             Select one skill; repeat for several (default: all)
  --force                  Replace a locally changed SKILL.md after reviewing it
  --help                   Show this help

Installation copies instructions only. Connect your MCP client separately to
https://slides.win/api/mcp using a token from https://slides.win/app/mcp.
`;

async function stat(path) {
  try {
    return await lstat(path);
  } catch (error) {
    if (error.code === "ENOENT") return null;
    throw error;
  }
}

async function checkPath(path) {
  for (let part = resolve(path); ; part = dirname(part)) {
    const entry = await stat(part);
    if (entry?.isSymbolicLink())
      throw new Error(`Refusing a symbolic link: ${part}`);
    if (part === parse(part).root) break;
  }
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes("--help") || args.includes("-h")) {
    console.log(help);
    return;
  }
  const command =
    args[0] && !args[0].startsWith("-") ? args.shift() : "install";
  if (!["install", "list"].includes(command))
    throw new Error(`Unknown command: ${command}`);
  let global = false,
    force = false,
    agent = "universal",
    directory;
  const selected = [];
  while (args.length) {
    const option = args.shift();
    if (option === "--global") global = true;
    else if (option === "--force") force = true;
    else if (["--agent", "--dir", "--skill"].includes(option)) {
      const value = args.shift();
      if (!value || value.startsWith("--"))
        throw new Error(`Missing value for ${option}`);
      if (option === "--agent") agent = value;
      if (option === "--dir") directory = value;
      if (option === "--skill") selected.push(value);
    } else throw new Error(`Unknown option: ${option}`);
  }
  if (!["codex", "claude-code", "universal"].includes(agent))
    throw new Error(`Unknown agent: ${agent}`);
  if (directory && (global || agent !== "universal"))
    throw new Error("Use --dir without --global or --agent.");
  const manifest = JSON.parse(
    await readFile(join(root, "manifest.json"), "utf8"),
  );
  const names = manifest.skills;
  if (command === "list") {
    console.log(names.join("\n"));
    return;
  }
  for (const name of selected)
    if (!names.includes(name)) throw new Error(`Unknown skill: ${name}`);
  const chosen = [...new Set(selected.length ? selected : names)];
  const base = global ? homedir() : process.cwd();
  const target = resolve(
    directory ||
      (agent === "codex" && global
        ? join(process.env.CODEX_HOME || join(base, ".codex"), "skills")
        : join(
            base,
            agent === "claude-code" ? ".claude" : ".agents",
            "skills",
          )),
  );
  const planned = [];
  await checkPath(target);
  const targetStat = await stat(target);
  if (targetStat && !targetStat.isDirectory())
    throw new Error(`Expected a skills directory: ${target}`);
  // Read and validate every selected file before making any destination changes.
  for (const name of chosen) {
    const relative = `skills/${name}/SKILL.md`;
    const source = join(root, relative),
      destination = join(target, name, "SKILL.md");
    await checkPath(source);
    const bytes = await readFile(source);
    if (
      digest(bytes) !==
      manifest.files.find((file) => file.path === relative)?.sha256
    )
      throw new Error(`Package checksum mismatch: ${name}`);
    await checkPath(destination);
    const existing = await stat(destination);
    if (existing && !existing.isFile())
      throw new Error(`Expected a regular file: ${destination}`);
    const previous = existing ? await readFile(destination) : null;
    if (previous && !bytes.equals(previous) && !force)
      throw new Error(
        `Local changes in ${name}. Review them before using --force.`,
      );
    if (!previous || !bytes.equals(previous))
      planned.push({ destination, bytes });
  }
  for (const { destination, bytes } of planned) {
    await mkdir(dirname(destination), { recursive: true });
    const temporary = join(dirname(destination), `.slides-win-${randomUUID()}`);
    try {
      await writeFile(temporary, bytes, { flag: "wx" });
      await rename(temporary, destination);
    } finally {
      await rm(temporary, { force: true });
    }
  }
  console.log(
    `Installed ${chosen.length} Slides.win skills in ${target} (${planned.length} updated).`,
  );
  console.log(
    "Connect MCP: https://slides.win/api/mcp. Create your token at https://slides.win/app/mcp.",
  );
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
