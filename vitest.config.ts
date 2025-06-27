import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/tests/setup.ts'],
    coverage: {
      //reporter: ['text', 'json', 'html'],
      reporter: ['text'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.ts',
        '**/main.tsx',
        '**/App.tsx',
      ],
      include: ['src/**/*.{ts,tsx}'],
    },
  },
});
