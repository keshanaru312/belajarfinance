"use client";


import { usePathname } from "next/navigation";
import { getDictionary } from "@/lib/getDictionary";
import { usePersistentValue } from "@/hooks/usePersistentValue";

export const runtime = "edge";
export default function AnnualSavingsCalculator() {
  const pathname = usePathname();
  const lang = pathname.split("/")[1] || "en";
  const dict = getDictionary(lang);

  const [salary, setSalary] = usePersistentValue("salary", 5000);
  const [expenses, setExpenses] = usePersistentValue("monthlyExpenses", 3000);

  const monthlySavings = () => (salary && expenses ? salary - expenses : 0);
  const annualSavings = () => monthlySavings() * 12;

  return (
    <section className="max-w-md mx-auto px-4 py-8">
      <h1 className="title">{dict.tools.as.title}</h1>
      <p className="subtitle">{dict.tools.as.desc}</p>

      <div className="card space-y-4 mt-6">
        <div>
          <label className="block text-sm font-medium">
            {dict.tools.as.labels.salary}
          </label>
          <input
            type="number"
            value={salary}
            onChange={(e) => setSalary(Number(e.target.value) || 0)}
            className="input"
            placeholder={dict.tools.as.placeholders.salary}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">
            {dict.tools.as.labels.expenses}{" "}
            {expenses !== 3000 && (
              <span className="text-xs text-blue-500 italic">
                {dict.general.savedFromLastInput}
              </span>
            )}
          </label>
          <input
            type="number"
            value={expenses}
            onChange={(e) => setExpenses(Number(e.target.value) || 0)}
            className="input"
            placeholder={dict.tools.as.placeholders.expenses}
          />
        </div>

        <div className="p-4 border rounded-lg bg-gray-50 dark:bg-neutral-800">
          <h2 className="font-semibold text-lg">
            {dict.tools.as.labels.result}
          </h2>
          <p>
            {dict.tools.as.labels.monthly}{" "}
            <strong>
              {monthlySavings().toLocaleString("ms-MY", {
                style: "currency",
                currency: "MYR",
              })}
            </strong>
          </p>
          <p>
            {dict.tools.as.labels.annual}{" "}
            <strong>
              {annualSavings().toLocaleString("ms-MY", {
                style: "currency",
                currency: "MYR",
              })}
            </strong>
          </p>
        </div>
      </div>
    </section>
  );
}