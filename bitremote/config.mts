
import { context, type Plugin, type BuildContext } from 'esbuild';
import { BitburnerPlugin } from 'esbuild-bitburner-plugin';
import path from 'path'

// --- Path Remapper Plugin ---
const bitburnerPathPlugin: Plugin = {
  name: 'bitburner-path-remapper',
  setup(build) {
    build.onResolve({ filter: /\.ns(\.(ts|tsx))?$/ }, async (args) => {
      if (args.pluginData?.bb_path_resolve) return null;

      const result = await build.resolve(args.path, {
        resolveDir: args.resolveDir,
        kind: args.kind,
        pluginData: { bb_path_resolve: true }
      });

      if (result.errors.length > 0) return { errors: result.errors };
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
    });
  },
};

const createContext = async (): Promise<BuildContext> =>
  await context({
    entryPoints: [
      'src/servers/**/*.ns.js',
      'src/servers/**/*.ns.jsx',
      'src/servers/**/*.ns.ts',
      'src/servers/**/*.ns.tsx',
    ],
    outbase: "./src/servers",
    outdir: "./dist",
    bundle: true,
    format: 'esm',
    platform: 'browser',
    logLevel: 'info',
    // Cheat to not get RAM usage on `window` and `document`.
    // Personally for UI creation only. Maybe a few input manipulation too.
    banner: {
      js: 'const __win = eval("window"); const __doc = eval("document");'
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
        extensions: [],
      })
    ],
  });

const ctx = await createContext();
await ctx.watch();
