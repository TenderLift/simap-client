# Changesets

This directory contains changesets for managing versioning and changelogs.

## How to use

When you make a change that should be included in the changelog and trigger a version bump, create a changeset:

```bash
pnpm changeset
```

This will prompt you to:
1. Select the type of change (patch/minor/major)
2. Write a summary of the change for the changelog

The changeset will be consumed during the release process and automatically:
- Update the package version
- Update the CHANGELOG.md
- Create a GitHub release

## Types of changes

- **Patch**: Bug fixes and small improvements (0.0.x)
- **Minor**: New features that are backwards compatible (0.x.0)
- **Major**: Breaking changes (x.0.0)

## For maintainers

The release process is automated via GitHub Actions. When changesets are merged to main:
1. A "Version Packages" PR is automatically created
2. Merging this PR will trigger a release to npm
3. A GitHub release will be created with the changelog

For more information, see the [changesets documentation](https://github.com/changesets/changesets).