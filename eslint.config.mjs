import js from "@eslint/js";
import globals from "globals";

export default [
  js.configs.recommended,
  {
    files: ["public/js/*.js"],
    languageOptions: {
      sourceType: "script",
      globals: globals.browser,
    },
    rules: {
      // These are called from onclick and script tags in the HTML pages.
      "no-unused-vars": [
        "error",
        { varsIgnorePattern: "^(doLogin|doLogout|readCookie|addColor|searchColor)$" },
      ],
    },
  },
  {
    // Third-party library that also supports Node modules.
    files: ["public/js/md5.js"],
    languageOptions: { globals: { module: "readonly" } },
    linterOptions: { reportUnusedDisableDirectives: "off" },
  },
];
