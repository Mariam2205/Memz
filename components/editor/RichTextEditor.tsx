"use client";

import { useEffect, useRef } from "react";

type RichTextEditorProps = {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

function ToolbarButton({
  title,
  onClick,
  children,
}: {
  title: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className="rounded-xl border border-[var(--memz-border)] bg-white px-3 py-2 text-sm font-medium text-[var(--memz-text)] shadow-sm transition hover:bg-[var(--memz-soft)]"
    >
      {children}
    </button>
  );
}

export default function RichTextEditor({
  label = "Description",
  value,
  onChange,
  placeholder = "Write here...",
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!editorRef.current) return;

    if (editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || "";
    }
  }, [value]);

  const runCommand = (command: string, commandValue?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, commandValue);
    onChange(editorRef.current?.innerHTML || "");
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-[var(--memz-text)]">
        {label}
      </label>

      <div className="overflow-hidden rounded-3xl border border-[var(--memz-border)] bg-white shadow-sm">
        <div className="flex flex-wrap gap-2 border-b border-[var(--memz-border)] bg-[var(--memz-soft)] p-3">
          <ToolbarButton title="Bold" onClick={() => runCommand("bold")}>
            <span className="font-bold">B</span>
          </ToolbarButton>

          <ToolbarButton title="Italic" onClick={() => runCommand("italic")}>
            <span className="italic">I</span>
          </ToolbarButton>

          <ToolbarButton
            title="Underline"
            onClick={() => runCommand("underline")}
          >
            <span className="underline">U</span>
          </ToolbarButton>

          <ToolbarButton
            title="Heading 1"
            onClick={() => runCommand("formatBlock", "<h1>")}
          >
            H1
          </ToolbarButton>

          <ToolbarButton
            title="Heading 2"
            onClick={() => runCommand("formatBlock", "<h2>")}
          >
            H2
          </ToolbarButton>

          <ToolbarButton
            title="Bullet List"
            onClick={() => runCommand("insertUnorderedList")}
          >
            • List
          </ToolbarButton>

          <ToolbarButton
            title="Numbered List"
            onClick={() => runCommand("insertOrderedList")}
          >
            1. List
          </ToolbarButton>

          <ToolbarButton
            title="Quote"
            onClick={() => runCommand("formatBlock", "<blockquote>")}
          >
            “ Quote
          </ToolbarButton>

          <ToolbarButton
            title="Magenta"
            onClick={() => runCommand("foreColor", "#d946ef")}
          >
            <span className="text-pink-500 font-bold">A</span>
          </ToolbarButton>

          <ToolbarButton
            title="Blue"
            onClick={() => runCommand("foreColor", "#2563eb")}
          >
            <span className="text-blue-600 font-bold">A</span>
          </ToolbarButton>

          <ToolbarButton
            title="Remove Formatting"
            onClick={() => runCommand("removeFormat")}
          >
            Clear
          </ToolbarButton>
        </div>

        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={() => onChange(editorRef.current?.innerHTML || "")}
          className="min-h-[220px] w-full p-4 text-[15px] text-[var(--memz-text)] outline-none"
          style={{ whiteSpace: "pre-wrap" }}
          data-placeholder={placeholder}
        />
      </div>

      <p className="text-xs text-[var(--memz-muted)]">
        Use this same editor in every description field across the website.
      </p>
    </div>
  );
}