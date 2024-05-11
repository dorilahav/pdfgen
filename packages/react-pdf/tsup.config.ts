import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ["src/index.ts"],
  dts: {
    resolve: true
  },
  bundle: true,
  clean: true,
  minify: true,
  platform: 'node',
  format: ['esm', 'cjs'],
});