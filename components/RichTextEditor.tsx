"use client";

import { useRef } from "react";

export default function RichTextEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  function exec(command: string) {
    document.execCommand(command);
    onChange(ref.current?.innerHTML || "");
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <button onClick={() => exec("bold")}>B</button>
        <button onClick={() => exec("italic")}>I</button>
        <button onClick={() => exec("underline")}>U</button>
        <button onClick={() => exec("insertUnorderedList")}>• List</button>
      </div>

      <div
        ref={ref}
        contentEditable
        className="min-h-[120px] rounded-xl border p-3"
        dangerouslySetInnerHTML={{ __html: value }}
        onInput={() => onChange(ref.current?.innerHTML || "")}
      />
    </div>
  );
}