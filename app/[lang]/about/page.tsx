export const runtime = "edge";
import { getDictionary } from "@/lib/getDictionary";

export const metadata = {
  title: "About | BelajarFinance",
  description: "Learn about BelajarFinance — helping Malaysians master personal finance.",
};

export default async function AboutPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const dict = getDictionary(lang);

  return (
    <section className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="title text-center md:text-left">{dict.about.title}</h1>
      <p className="subtitle text-center md:text-left">
        {dict.about.subtitle}
      </p>

      <div className="card mt-6 space-y-4 text-sm leading-relaxed">
        <p>{dict.about.paragraphs.p1}</p>
        <p>{dict.about.paragraphs.p2}</p>
      </div>
    </section>
  );
}