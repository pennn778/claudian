@AGENTS.md

## Claude Code

Claude-specific instructions belong here only when they do not apply to other agents.

## Branching & Upstream Sync

This repo is a fork. `origin` is the upstream (`YishenTu/claudian`); `myfork` is the working remote (`pennn778/claudian`). Two long-lived branches:

- `main` — pristine mirror of `origin/main`. Never commit here.
- `custom` — where local customizations live; periodically rebased onto fresh `main`.

`branch.{main,custom}.pushRemote` is set to `myfork`, so `git push` never reaches upstream.

**Sync upstream** (when `origin/main` advances):

```bash
git fetch origin
git checkout main
git merge --ff-only origin/main
git checkout custom
git rebase main                           # resolve conflicts if any
git push myfork custom --force-with-lease
```

**Adding a customization**: commit on `custom`, then `git push` (defaults to `myfork`).
