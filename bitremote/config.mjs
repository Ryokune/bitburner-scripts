import { context } from 'esbuild';
import { BitburnerPlugin } from 'esbuild-bitburner-plugin';

const createContext = async () => await context({
  entryPoints: [
    'src/servers/**/*.ns.js',
    'src/servers/**/*.ns.jsx',
    'src/servers/**/*.ns.ts',
    'src/servers/**/*.ns.tsx',
  ],
  outbase: "./src/servers",
  outdir: "./dist",
  // Cheat to not get RAM usage on `window` and `document`.
  // Personally for UI creation only. Maybe a few input manipulation too.
  banner: {
    js: `
const __win = eval("window");
const __doc = eval("document");
`
  },
  define: {
    window: "__win",
    document: "__doc"
  },
  plugins: [

    BitburnerPlugin({
      port: 12525,
      types: 'NetscriptDefinitions.d.ts',
      mirror: {
        'src/mirror': ['home']
      },
      distribute: {
      },
    })
  ],
  bundle: true,
  format: 'esm',
  target: 'esnext',
  platform: 'browser',
  logLevel: 'debug',
});

const ctx = await createContext();
ctx.watch();
