# Publishing the package to npm

Package: `react-query-builder-antd`

Workflow: `.github/workflows/npm-publish.yml`

The workflow uses npm Trusted Publishing (OIDC) and does not use an `NPM_TOKEN`. A GitHub Release must target a commit merged into `main`; the release tag must exactly match the version in `package.json`.

## 1. Version 1.0.0 has been published

`react-query-builder-antd@1.0.0` now exists on npm. The manual bootstrap is complete and must not be repeated.

Verify the current version:

```bash
npm view react-query-builder-antd version
```

Do not run `npm publish` again with version `1.0.0`, because npm does not allow an existing version to be overwritten. Never commit a token or add one to the workflow.

## 2. Trusted Publisher is configured

The package currently has this Trusted Publisher configuration on npm:

- Provider: GitHub Actions
- Organization/User: `sonlhepuit`
- Repository: `react-query-builder-antd`
- Workflow filename: `npm-publish.yml`
- Environment: leave blank
- Allowed action: `npm publish`

If the configuration must be recreated, use npm CLI 11.15 or newer:

```bash
npm install --global "npm@^11.15.0"
npm trust github react-query-builder-antd \
  --repo sonlhepuit/react-query-builder-antd \
  --file npm-publish.yml \
  --allow-publish
```

OIDC is configured. Revoke old automation tokens and delete the `NPM_TOKEN` or `npm_token` repository secret if either still exists.

## 3. Deploy a new version from main

### 3.1. Choose the SemVer change

| Change | When to use it | Example | Command |
| --- | --- | --- | --- |
| Patch | Bug fixes, internal optimizations, or small changes that preserve the existing API | `1.0.0` → `1.0.1`; `1.1.0` → `1.1.1` | `npm version patch --no-git-tag-version` |
| Minor | New features or options that remain backward compatible | `1.0.0` → `1.1.0` | `npm version minor --no-git-tag-version` |
| Major | Removed or changed APIs, props, types, or behavior that may require consumer code changes | `1.x.x` → `2.0.0` | `npm version major --no-git-tag-version` |

Adding a `3DTile` option without breaking the existing API is a **minor** change. Starting from `1.0.0`, the new version should be `1.1.0`. A later bug fix for that feature is a patch from `1.1.0` to `1.1.1`.

Do not select patch based only on the number of changed lines; select it based on consumer impact. README-only or internal documentation changes usually do not require a new package release.

### 3.2. Release steps

1. Merge all changes intended for the release into `main`.
2. Synchronize `main` and create a release branch:

```bash
git checkout main
git pull --ff-only
git checkout -b release/vX.Y.Z
```

3. Run exactly one version command. For example, from `1.0.0`:

```bash
# Backward-compatible bug fix: 1.0.0 -> 1.0.1
npm version patch --no-git-tag-version

# Or backward-compatible feature: 1.0.0 -> 1.1.0
npm version minor --no-git-tag-version

# Or breaking change: 1.0.0 -> 2.0.0
npm version major --no-git-tag-version
```

The command updates both `package.json` and `package-lock.json`; commit both files. Do not run all three commands for one release.

4. Build and inspect exactly what will be sent to npm:

```bash
npm ci --ignore-scripts
npm run build-npm
npm run check-package
npm pack --dry-run
```

The tarball must not contain `.github/`, `docs/`, `examples/`, `scripts/`, or development configuration files.

5. Commit, open a pull request, and merge the release branch into `main`.
6. Create a GitHub Release from the latest `main` commit:
   - The tag must be `v` plus the version in `package.json`; for example, version `1.0.1` requires tag `v1.0.1`.
   - Use a stable release, not a prerelease.
   - Select **Publish release**; saving a draft does not trigger publishing.
7. Monitor the **Publish npm Package** workflow. It checks out the exact tag, compares the tag with the package version, builds, validates the tarball, and publishes through OIDC.
8. Verify the npm version:

```bash
npm view react-query-builder-antd version
```

OIDC automatically generates provenance for a public package published from a GitHub-hosted runner.

## 4. Rules and troubleshooting

- An existing npm version cannot be published again.
- If the workflow fails before publishing, fix it and rerun that release.
- If npm accepted the package, the next fix requires a new version.
- Do not delete or move a published tag.
- The workflow rejects a tag that does not equal `v` plus the version in `package.json`.
- For `ENEEDAUTH`, verify the workflow filename, repository, blank environment, `id-token: write`, GitHub-hosted runner, and `repository.url`.

Official documentation: [npm Trusted Publishing](https://docs.npmjs.com/trusted-publishers/) and [GitHub OIDC](https://docs.github.com/en/actions/reference/security/oidc).
