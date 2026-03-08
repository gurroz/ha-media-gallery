import resolve from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";
import typescript from "@rollup/plugin-typescript";

export default {
  input: "src/ha-gallery.ts",
  output: {
    file: "dist/ha-media-gallery.js",
    format: "es",
    sourcemap: false,
  },
  plugins: [
    resolve(),
    typescript({
      tsconfig: "./tsconfig.json",
      declaration: false,
      declarationMap: false,
    }),
    terser({
      format: {
        comments: false,
      },
    }),
  ],
};
