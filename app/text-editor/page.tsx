"use client";
import { RichTextEditorDemo } from "@/components/tiptap/rich-text-editor";
import { useState } from "react";

export default function Page() {
  const [value, setValue] = useState(
    `<h1>Welcome to the editor</h1>`
  );
  return (
    <div className="mx-auto w-full container flex flex-col justify-center items-center py-5">
      <RichTextEditorDemo
        value={value}
        onChange={setValue}
        className="w-full rounded-xl"
      />
    </div>
  );
}


