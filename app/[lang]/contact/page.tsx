import ContactForm from "./ContactForm";
import { getDictionary } from "@/lib/getDictionary";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return {
    title: `${dict.contact.title} | BelajarFinance`,
    description: dict.contact.description,
  };
}

export default async function ContactPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return <ContactForm lang={lang} dict={dict} />;
}