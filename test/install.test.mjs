import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  copyFile,
  cp,
  mkdtemp,
  readFile,
  realpath,
  rm,
  mkdir,
  writeFile,
  symlink,
  readdir,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const root = fileURLToPath(new URL("../", import.meta.url));
const cli = process.env.SLIDES_WIN_SKILLS_CLI || join(root, "bin/install.mjs");
const manifest = JSON.parse(
  await readFile(join(root, "manifest.json"), "utf8"),
);
const run = (cwd, args = []) =>
  spawnSync(process.execPath, [cli, ...args], { cwd, encoding: "utf8" });

async function isolated(fn) {
  const cwd = await mkdtemp(
    join(await realpath(tmpdir()), "slides-win-skills-"),
  );
  try {
    await fn(cwd);
  } finally {
    await rm(cwd, { recursive: true, force: true });
  }
}

test("installs the actual skill bytes and repeat installation is unchanged", () =>
  isolated(async (cwd) => {
    const first = run(cwd, ["install", "--agent", "codex"]);
    assert.equal(first.status, 0, first.stderr);
    for (const name of manifest.skills)
      assert.deepEqual(
        await readFile(join(cwd, ".agents/skills", name, "SKILL.md")),
        await readFile(join(root, "skills", name, "SKILL.md")),
      );
    assert.match(run(cwd).stdout, /0 updated/);
  }));

test("a conflict prevents all selected writes; explicit replacement preserves extra files", () =>
  isolated(async (cwd) => {
    const name = manifest.skills.at(-1),
      folder = join(cwd, ".agents/skills", name);
    await mkdir(folder, { recursive: true });
    await writeFile(join(folder, "SKILL.md"), "My reviewed instructions");
    await writeFile(join(folder, "notes.md"), "Keep my notes");
    const refused = run(cwd);
    assert.equal(refused.status, 1);
    assert.match(refused.stderr, /Local changes/);
    assert.deepEqual(await readdir(join(cwd, ".agents/skills")), [name]);
    assert.equal(
      await readFile(join(folder, "SKILL.md"), "utf8"),
      "My reviewed instructions",
    );
    assert.equal(run(cwd, ["install", "--force"]).status, 0);
    assert.equal(
      await readFile(join(folder, "notes.md"), "utf8"),
      "Keep my notes",
    );
  }));

test("selection and a custom directory install only the requested skill", () =>
  isolated(async (cwd) => {
    const target = join(cwd, "chosen-skills"),
      name = manifest.skills[0];
    const result = run(cwd, ["install", "--dir", target, "--skill", name]);
    assert.equal(result.status, 0, result.stderr);
    assert.deepEqual(await readdir(target), [name]);
    assert.equal(run(cwd, ["install", "--skill", "../../escape"]).status, 1);
    assert.equal(run(cwd, ["install", "--agent", "unknown"]).status, 1);
    assert.equal(run(cwd, ["install", "--dir"]).status, 1);
  }));

test("a symlinked destination cannot change files outside the selected directory", () =>
  isolated(async (cwd) => {
    const elsewhere = join(cwd, "elsewhere");
    await mkdir(elsewhere);
    await mkdir(join(cwd, ".agents"));
    await symlink(elsewhere, join(cwd, ".agents/skills"));
    const result = run(cwd, ["install", "--force"]);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /symbolic link/);
    assert.deepEqual(await readdir(elsewhere), []);
  }));

test("Claude Code uses its own directory, while listing writes nothing", () =>
  isolated(async (cwd) => {
    const listed = run(cwd, ["list"]);
    assert.equal(listed.status, 0);
    assert.deepEqual(listed.stdout.trim().split("\n"), manifest.skills);
    assert.deepEqual(await readdir(cwd), []);
    assert.equal(run(cwd, ["install", "--agent", "claude-code"]).status, 0);
    assert.deepEqual(
      (await readdir(join(cwd, ".claude/skills"))).sort(),
      manifest.skills,
    );
  }));

test("a damaged bundled skill is rejected before destination writes", () =>
  isolated(async (cwd) => {
    const damaged = join(cwd, "damaged-package"),
      target = join(cwd, "destination");
    await mkdir(join(damaged, "bin"), { recursive: true });
    await copyFile(cli, join(damaged, "bin/install.mjs"));
    await copyFile(join(root, "manifest.json"), join(damaged, "manifest.json"));
    await cp(join(root, "skills"), join(damaged, "skills"), {
      recursive: true,
    });
    await writeFile(
      join(damaged, "skills", manifest.skills.at(-1), "SKILL.md"),
      "Unexpected bytes",
    );
    const result = spawnSync(
      process.execPath,
      [join(damaged, "bin/install.mjs"), "install", "--dir", target],
      { cwd, encoding: "utf8" },
    );
    assert.equal(result.status, 1);
    assert.match(result.stderr, /checksum mismatch/);
    await assert.rejects(
      readFile(join(target, manifest.skills[0], "SKILL.md")),
      { code: "ENOENT" },
    );
  }));
