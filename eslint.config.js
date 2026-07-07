import noComments from "eslint-plugin-no-comments";
import tseslint from "typescript-eslint";

const customCommentsPlugin = {
    rules: {
        "no-emojis": {
            meta: { type: "layout", fixable: false },
            create(context) {
                return {
                    Program() {
                        const sourceCode = context.sourceCode;
                        const text = sourceCode.getText();
                        const emojiRegex =
                            /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{27BF}]|[\u{1F680}-\u{1F6FF}]/gu;
                        let match;

                        while ((match = emojiRegex.exec(text)) !== null) {
                            context.report({
                                loc: sourceCode.getLocFromIndex(match.index),
                                message: "Emojis are not allowed in code."
                            });
                        }
                    }
                };
            }
        }
    }
};

export default [
    {
        ignores: ["**/dist/", "**/node_modules/", "data/"]
    },
    ...tseslint.configs.recommended,
    {
        files: ["src/**/*.ts", "tests/**/*.ts", "*.config.ts", "**/*.js", "**/*.mjs"],
        plugins: {
            custom: customCommentsPlugin,
            "no-comments": noComments
        },
        rules: {
            "@typescript-eslint/consistent-type-imports": "error",
            "@typescript-eslint/no-explicit-any": "error",
            "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
            "complexity": ["error", { "max": 8 }],
            "custom/no-emojis": "error",
            "max-depth": ["error", 3],
            "max-lines": ["error", { "max": 250, "skipBlankLines": true, "skipComments": true }],
            "max-lines-per-function": [
                "error",
                { "max": 30, "skipBlankLines": true, "skipComments": true }
            ],
            "max-params": ["error", 4],
            "no-comments/disallowComments": "error",
            "no-console": "off",
            "no-nested-ternary": "error",
            "no-unneeded-ternary": "error"
        }
    },
    {
        files: ["tests/**/*.ts"],
        rules: {
            "max-lines-per-function": "off"
        }
    }
];
