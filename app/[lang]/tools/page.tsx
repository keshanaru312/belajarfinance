import Link from "next/link";
import { getDictionary } from "@/lib/getDictionary";

export default async function ToolsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const dict = getDictionary(lang);

  const calculators = [
    {
      name: dict.tools.fd.title,
      description: dict.tools.fd.desc,
      path: `/${lang}/tools/calculators/fixed-deposit`,
    },
    {
      name: dict.tools.ef.title,
      description: dict.tools.ef.desc,
      path: `/${lang}/tools/calculators/emergency-fund`,
    },
    {
      name: dict.tools.as.title,
      description: dict.tools.as.desc,
      path: `/${lang}/tools/calculators/annual-savings`,
    },
  ];

  return (
    <section className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="title text-center md:text-left">{dict.tools.title}</h1>
      <p className="subtitle text-center md:text-left">{dict.tools.subtitle}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        {calculators.map((tool) => (
          <Link
            key={tool.path}
            href={tool.path}
            className="card hover:shadow-md transition"
          >
            <h2 className="text-lg font-semibold text-foreground mb-2">
              {tool.name}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {tool.description}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}

export const metadata = {
  title: "Tools | BelajarFinance",
  description:
    "Use free, simple financial calculators from BelajarFinance — designed for Malaysians in English and BM.",
};