# Skill Metadata

Edit skill names and descriptions in `skills/skills.json`, then sync them into each `SKILL.md` frontmatter:

```bash
pnpm skills:apply
```

Check whether local JSON and Markdown frontmatter are already in sync:

```bash
pnpm skills:check
```

Pull metadata JSON from the server, save it locally, and apply it to `SKILL.md`:

```bash
pnpm skills:pull https://example.com/skills.json
```

Use `--no-apply` when you only want to refresh `skills/skills.json`:

```bash
pnpm skills:pull https://example.com/skills.json --no-apply
```
