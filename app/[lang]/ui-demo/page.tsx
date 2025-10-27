import React from "react";

export default function UIDemo() {
  return (
    <main className="p-6 space-y-8 max-w-xl mx-auto">
      <h1 className="title text-3xl">🎨 UI Demo</h1>
      <p className="subtitle">This page helps verify fonts and component styles.</p>

      {/* Font preview section */}
      <section className="space-y-4">
        <h2 className="title text-xl">Font Preview</h2>

        <div className="p-4 border rounded-lg space-y-3 bg-gray-50 dark:bg-neutral-800">
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">
              Space Grotesk (Headings)
            </h3>
            <h1 className="title text-4xl">The quick brown fox jumps over the lazy dog</h1>
            <h2 className="title text-2xl mt-2">1234567890 — Headings Example</h2>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">
              Inter (Body)
            </h3>
            <p className="subtitle text-base">
              The quick brown fox jumps over the lazy dog — sample paragraph text for Inter.
            </p>
          </div>
        </div>
      </section>

      {/* Component examples */}
      <section className="card">
        <h2 className="title">Components</h2>
        <p className="subtitle">Try out inputs and buttons below.</p>

        <input type="text" placeholder="Type here..." className="input" />
        <select className="select mt-3">
          <option>Option 1</option>
          <option>Option 2</option>
        </select>

        <div className="flex gap-2 mt-4">
          <button className="btn">Primary</button>
          <button className="btn bg-gray-500 hover:bg-gray-600">Secondary</button>
        </div>
      </section>
    </main>
  );
}