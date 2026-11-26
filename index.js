import path from "node:path";
import * as sass from "sass";
import { load as loadYaml } from "js-yaml";

const DEFAULT_IGNORES = ["README.md", "SECURITY.md", "CHANGELOG.md", "LICENSE*"];

/**
 * Shared Eleventy setup.
 *
 * @param {object} [options]
 * @param {string[]} [options.ignores] Input paths that aren't pages (repo docs).
 * @param {boolean} [options.cname] Copy a root CNAME file for GitHub Pages custom domains.
 * @param {object} [options.sass] Extra options for sass.compileString, e.g. `silenceDeprecations`.
 */
export default function base(eleventyConfig, options = {}) {
  eleventyConfig.versionCheck(">=3.0");

  const { ignores = DEFAULT_IGNORES, cname = true, sass: sassOptions = {} } = options;

  for (const glob of ignores) eleventyConfig.ignores.add(glob);
  if (cname) eleventyConfig.addPassthroughCopy("CNAME");

  eleventyConfig.addDataExtension("yml,yaml", (contents) => loadYaml(contents));

  // Compile every non-partial .scss file to a .css file next to it.
  eleventyConfig.addTemplateFormats("scss");
  eleventyConfig.addExtension("scss", {
    outputFileExtension: "css",
    useLayouts: false,
    compileOptions: {
      permalink: (contents, inputPath) => (path.basename(inputPath).startsWith("_") ? false : undefined),
    },
    compile(inputContent, inputPath) {
      if (path.basename(inputPath).startsWith("_")) return;
      const result = sass.compileString(inputContent, {
        style: "compressed",
        ...sassOptions,
        loadPaths: [path.dirname(inputPath), ...(sassOptions.loadPaths ?? [])],
      });
      this.addDependencies(inputPath, result.loadedUrls);
      return () => result.css;
    },
  });
}
