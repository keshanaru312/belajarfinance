export default function ToolCard({
    title,
    description,
    children,
  }: {
    title: string;
    description: string;
    children: React.ReactNode;
  }) {
    return (
      <section className="p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="text-gray-600 mb-4">{description}</p>
        {children}
      </section>
    );
  }
  