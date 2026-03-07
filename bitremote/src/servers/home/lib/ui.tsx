import type { CSSProperties, FocusEventHandler, ReactNode } from "react";
import type { ReactNode as NSReactNode } from "@ns";

export function interpolateColor(c1: string, c2: string, t: number) {
  const r = Math.round(parseInt(c1.slice(1, 3), 16) + (parseInt(c2.slice(1, 3), 16) - parseInt(c1.slice(1, 3), 16)) * t)
  const g = Math.round(parseInt(c1.slice(3, 5), 16) + (parseInt(c2.slice(3, 5), 16) - parseInt(c1.slice(3, 5), 16)) * t)
  const b = Math.round(parseInt(c1.slice(5, 7), 16) + (parseInt(c2.slice(5, 7), 16) - parseInt(c1.slice(5, 7), 16)) * t)
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
}

export async function runOnTerminal(command: string) {
  const documentRef = document;
  const terminalInputEl = documentRef.getElementById("terminal-input");

  const terminalEventHandlerKey = Object.keys(terminalInputEl)[1];
  terminalInputEl.value = command;
  terminalInputEl[terminalEventHandlerKey].onChange({ target: terminalInputEl });
  terminalInputEl.focus();
  await terminalInputEl[terminalEventHandlerKey].onKeyDown({
    key: "Enter",
    preventDefault: () => 0,
  });
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


export function CreateWindow(ns: NS, app: () => NSReactNode, title: string, width: number, height: number, x: number, y: number): void {
  ns.disableLog("ALL");
  ns.ui.openTail();
  ns.ui.setTailTitle(title);
  ns.ui.resizeTail(width, height);
  ns.ui.moveTail(x, y);
  ns.printRaw(app());
  ns.atExit(() => ns.ui.closeTail(), "close")
}
