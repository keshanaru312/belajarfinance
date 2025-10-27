import ContactForm from "./ContactForm";
import { getDictionary } from "@/lib/getDictionary";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return {
    title: `${dict.contact.title} | BelajarFinance`,
    description: dict.contact.desc,
  };
}

// app/[lang]/contact/page.tsx
export default async function ContactPage() {
  return <ContactForm />;
}
