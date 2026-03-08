import { context } from 'esbuild';
import { BitburnerPlugin } from 'esbuild-bitburner-plugin';
import path from 'path'

const bitburnerPathPlugin = {
  name: 'bitburner-path-remapper',
  setup(build) {
    build.onResolve({ filter: /.*/ }, async (args) => {
      if (args.pluginData?.bbskip) return null;
      const result = await build.resolve(args.path, {
        resolveDir: args.resolveDir,
        kind: args.kind,
        pluginData: { bbskip: true }
      });

      if (result.errors.length > 0) return { errors: result.errors };
      if (result.path.endsWith('.ns.ts')) {
        let relativePath = path.relative(args.resolveDir, result.path);

        relativePath = relativePath.replace(/\.tsx?$/, '.js');

        let finalPath = relativePath.split(path.sep).join('/');
        if (!finalPath.startsWith('.')) {
          finalPath = './' + finalPath;
        }

        console.log(`[REMAPPED] ${args.path} -> ${finalPath} (${args.importer})`);

        return {
          path: finalPath,
          external: true
        };
      }


      // 3. If it's a normal .ts file or anything else, return null 
      // This tells esbuild: "Proceed with normal bundling"
      return null;
    });
  },
};

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
    bitburnerPathPlugin,
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
