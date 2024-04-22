import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ["src/index.ts"],
  dts: true,
  bundle: true,
  clean: true,
  minify: true,
  platform: 'node',
  format: ['esm', 'cjs']
});