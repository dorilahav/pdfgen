import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ["src/index.ts"],
  dts: true,
  bundle: true,
  clean: true,
  minify: true,
  sourcemap: true,
  platform: 'neutral',
  format: ['esm', 'cjs']
});