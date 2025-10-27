
"use client";

import { usePathname } from "next/navigation";
import { getDictionary } from "@/lib/getDictionary";
export const runtime = "edge";

export default function ContactForm() {
  const pathname = usePathname();
  const lang = pathname.split("/")[1] || "en";
  const dict = getDictionary(lang);
  return (
    <section className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="title text-center md:text-left">{dict.contact.title}</h1>
      <p className="subtitle text-center md:text-left">
        {dict.contact.desc}
      </p>

      <form
        className="card mt-6 space-y-4"
        onSubmit={(e) => e.preventDefault()}
      >
        <div>
          <label className="block text-sm font-medium">{dict.contact.form.name}</label>
          <input type="text" placeholder={dict.contact.form.name} className="input" required />
        </div>

        <div>
          <label className="block text-sm font-medium">{dict.contact.form.email}</label>
          <input
            type="email"
            placeholder={dict.contact.form.email}
            className="input"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium">{dict.contact.form.message}</label>
          <textarea
            placeholder={dict.contact.form.message}
            className="input h-28 resize-none"
            required
          />
        </div>

        <button type="submit" className="btn w-full">
          {dict.contact.form.send}
        </button>
      </form>
    </section>
  );
}
