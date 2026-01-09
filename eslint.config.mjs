import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = [
  ...nextVitals,
  ...nextTs,
  {
    ignores: [".next/**", "out/**", "public/**", "next-env.d.ts", "components/ui/**"],
  },
  {
    rules: {
      // Block payloads come from a model: parsers take loose input on purpose
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      // Syncing local state to streamed messages is the job of these effects
      "react-hooks/set-state-in-effect": "warn",
    },
  },
];

export default eslintConfig;
