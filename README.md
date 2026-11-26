# @pcbulai/11ty-base

Shared Eleventy setup for my sites, so infrastructure fixes land in one place.
Templates, styles and front-end JS stay in each site.

## What it does

- Compiles every non-partial `.scss` file to `.css` next to it (dart-sass, compressed)
- Reads `.yml` / `.yaml` files in `_data/`
- Keeps repo docs (`README.md`, `SECURITY.md`, `CHANGELOG.md`, `LICENSE*`) out of the build
- Copies a root `CNAME` for GitHub Pages custom domains
- Provides a reusable workflow that builds the site and deploys it to GitHub Pages

## Use it in a site

```sh
npm i -D github:pcbulai/11ty-base#v1.0.0
```

```js
// eleventy.config.js
import base from "@pcbulai/11ty-base";

export default function (eleventyConfig) {
  eleventyConfig.addPlugin(base);
  // site-specific config
}
```

Options (all optional):

| Option    | Default                                   | Notes                                             |
| --------- | ----------------------------------------- | ------------------------------------------------- |
| `ignores` | `README.md`, `SECURITY.md`, `CHANGELOG.md`, `LICENSE*` | Replaces the list, doesn't extend it |
| `cname`   | `true`                                    | Copy `CNAME` to the output                         |
| `sass`    | `{}`                                      | Passed to `sass.compileString`, e.g. `{ silenceDeprecations: ["import"] }` |

The site needs a `build` script (`"build": "eleventy"`).

## Deploy workflow

`.github/workflows/deploy.yml` in the site:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [master]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  deploy:
    uses: pcbulai/11ty-base/.github/workflows/deploy.yml@v1
```

Inputs: `node-version` (default `24`), `build-command` (default `npm run build`),
`output-dir` (default `_site`). In the site's Settings → Pages, set Source to "GitHub Actions".

## Releasing

Tag every release (`v1.0.0`) and move the `v1` tag to the latest compatible one,
so sites calling `deploy.yml@v1` pick up fixes. Breaking changes get `v2`.
Sites pin the npm package to an exact tag and pick up new versions through Dependabot PRs.
