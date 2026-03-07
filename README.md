# bitburner-scripts

Project that contains my bitburner scripts using the RFA/RemoteAPI for syncing and external editor support.

Project files are within the `bitremote/*` folder, scripts are within `bitremote/src/`

This project includes stuff like:
- `document` and `window` cheat for ram bypass. ([config.mjs](https://github.com/Ryokune/bitburner-scripts/blob/fc281d506beb24cb80cf8f696e30f39ec3f2dbb8/bitremote/config.mjs#L13))
  - ```mjs
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
    }
    ```
- Bi-Directional Remote sync for `remote <-> home` server
- Different file types for specific use cases. ([config.mjs](https://github.com/Ryokune/bitburner-scripts/blob/fc281d506beb24cb80cf8f696e30f39ec3f2dbb8/bitremote/config.mjs#L5))
  - `.ts|.js|.tsx|.jsx` for files that exist "outside the bitburner game" (gets bundled if they're imported by a `.ns.ts|tsx|js|jsx` file.)
  - `.ns.|ts|js|tsx|jsx` for files that get moved from the remote -> bitburner
  - all other files are ignored.
- Automatic script bundling ([config.mjs](https://github.com/Ryokune/bitburner-scripts/blob/fc281d506beb24cb80cf8f696e30f39ec3f2dbb8/bitremote/config.mjs#L37))
  - Allows bundled packages to work within bitburner eg: npm packages
  - Allows for just `.ts` files that don't get moved into the game as "files"
    - Example of this would be the `lib/main.ts`. This file does not get moved into the game, but is bundled into `*.ns.ts` scripts that import them.
- Global `NS`, `React` and `ReactDOM` types in ([global.d.ts](https://github.com/Ryokune/bitburner-scripts/blob/main/bitremote/global.d.ts))
- Allowed UMD access to allow use of `React` and `ReactDOM` without importing explicitly. ([tsconfig.json](https://github.com/Ryokune/bitburner-scripts/blob/fc281d506beb24cb80cf8f696e30f39ec3f2dbb8/bitremote/tsconfig.json#L16))
  - Most templates use a `lib/React.ts` script, which accesses `window`, which uses a ton of script ram, or imports react and bundles it.
    - I find this unneccessary as bitburner includes `React` and `ReactDOM` as globals.
   
TIPS
--

- Make your editor detect files with `*.ns.ts|tsx|js|jsx` extensions, and automatically populate it with a **Template**
  - nvim Example:
    - `*.ns.ts`
      - ```lua
      
        local utils = require("new-file-template.utils")
    
        local function base_template(relative_path, filename)
          return [[
        export async function main(ns: NS) {
        }
        
        export function autocomplete(data: AutocompleteData, args: string[]): string[] {
          return []
        }
          ]]
        end
        
        --- @param opts table
        ---   A table containing the following fields:
        ---   - `full_path` (string): The full path of the new file, e.g., "lua/new-file-template/templates/init.lua".
        ---   - `relative_path` (string): The relative path of the new file, e.g., "lua/new-file-template/templates/init.lua".
        ---   - `filename` (string): The filename of the new file, e.g., "init.lua".
        return function(opts)
          local template = {
            { pattern = ".*%.ns", content = base_template },
          }
        
        	return utils.find_entry(template, opts)
        end
  - `*.ns.tsx` and `*.tsx`
    - ```lua
      local utils = require("new-file-template.utils")

      local function base_template(relative_path, filename)
        return [[
      export async function main(ns: NS) {
      }
      
      export function autocomplete(data: AutocompleteData, args: string[]): string[] {
        return []
      }
        ]]
      end
      
      -- export const App: React.FC<AppProps> = ({ ns }) => {
      local function export_name(relative_path, filename)
        filename = vim.split(filename, "%.")[1]
        local props_name = filename .. "Props"
        local args = "{}"
        local type = "React.FC<"..props_name..">"
        return [[
      interface ]].. props_name ..[[ {}
      
      export const ]].. filename .. [[: ]]..type..[[ = (]]..args..[[)=>{
        return <></>
      }
              ]]
      end
      
      --- @param opts table
      ---   A table containing the following fields:
      ---   - `full_path` (string): The full path of the new file, e.g., "lua/new-file-template/templates/init.lua".
      ---   - `relative_path` (string): The relative path of the new file, e.g., "lua/new-file-template/templates/init.lua".
      ---   - `filename` (string): The filename of the new file, e.g., "init.lua".
      return function(opts)
        local template = {
          { pattern = ".*%.ns", content = base_template },
          { pattern = ".*", content = export_name}
        }
      
      	return utils.find_entry(template, opts)
      end

      ```
