import type { ReactNode as NSReactNode } from "@ns";
import type { FocusEventHandler, ReactNode } from "react";

export function interpolateColor(c1: string, c2: string, t: number) {
  const r = Math.round(parseInt(c1.slice(1, 3), 16) + (parseInt(c2.slice(1, 3), 16) - parseInt(c1.slice(1, 3), 16)) * t)
  const g = Math.round(parseInt(c1.slice(3, 5), 16) + (parseInt(c2.slice(3, 5), 16) - parseInt(c1.slice(3, 5), 16)) * t)
  const b = Math.round(parseInt(c1.slice(5, 7), 16) + (parseInt(c2.slice(5, 7), 16) - parseInt(c1.slice(5, 7), 16)) * t)
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
}

export async function runOnTerminal(command: string) {
  const terminalInputEl = document.getElementById("terminal-input") as HTMLInputElement | null;
  if (!terminalInputEl) return;

  const terminalEventHandlerKey = Object.keys(terminalInputEl)[1]
  const inputHandler = (terminalInputEl as unknown as Record<
    string,
    React.DOMAttributes<HTMLInputElement>>)[terminalEventHandlerKey] as React.DOMAttributes<HTMLInputElement>;
  terminalInputEl.value = command;
  inputHandler.onChange?.({ target: terminalInputEl } as React.ChangeEvent<HTMLInputElement>);
  terminalInputEl.focus();
  inputHandler.onKeyDown?.({
    key: "Enter",
    preventDefault: () => 0,
  } as unknown as React.KeyboardEvent<HTMLInputElement>);
}

interface CustomInputProps extends React.InputHTMLAttributes<HTMLInputElement> { }

export function flexRender<TProps extends object>(Comp: ((props: TProps) => ReactNode) | string | undefined, props: TProps): ReactNode {
  if (typeof Comp === 'string') {
    return Comp
  }
  return Comp?.(props)
}

export const CustomInput = ({ ...rest }: CustomInputProps) => {
  const onFocusHandler: FocusEventHandler<HTMLInputElement> = () => {
    // disable Bitburner terminal input so that we can write inside our custom widget instead of game's terminal
    const terminalInput = document.getElementById("terminal-input") as HTMLInputElement;
    if (terminalInput) terminalInput.disabled = true;
  };

  const onFocusOut: FocusEventHandler<HTMLInputElement> = () => {
    // enable Bitburner terminal input again after focusing out of our widget input
    const terminalInput = document.getElementById("terminal-input") as HTMLInputElement;
    if (terminalInput) terminalInput.disabled = false;
  };

  return (
    <input
      onFocusCapture={onFocusHandler}
      onBlur={onFocusOut}
      {...rest}
    />
  );
};


export function CreateWindow(ns: NS, app: () => NSReactNode, title: string, width: number, height: number, x: number, y: number, allowMultiple = false): void {
  if (!allowMultiple) {
    const c = ns.getRunningScript(ns.self().filename)
    if (c && c.pid != ns.pid) {
      if (!c.tailProperties) {
        ns.ui.openTail(c.pid)
        ns.ui.resizeTail(width, height, c.pid);
        ns.ui.moveTail(x, y, c.pid);
      }
      ns.exit()
    }
  }
  ns.disableLog("ALL");
  ns.ui.openTail();
  ns.ui.setTailTitle(title);
  ns.ui.resizeTail(width, height);
  ns.ui.moveTail(x, y);
  ns.printRaw(app());
  ns.atExit(() => ns.ui.closeTail(), "close")
}
