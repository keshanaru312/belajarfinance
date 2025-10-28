

"use client";


import { useState } from "react";
import { usePathname } from "next/navigation";
import { getDictionary } from "@/lib/getDictionary";

export const runtime = "edge";
export default function FixedDepositCalculator() {
  const pathname = usePathname();
  const lang = pathname.split("/")[1] || "en";
  const dict = getDictionary(lang);

  const [amount, setAmount] = useState<number | "">(5000);
  const [rate, setRate] = useState<number | "">(2.2);
  const [months, setMonths] = useState<number | "">(6);

  const calculate = () => {
    if (!amount || !rate || !months) return 0;
    return (Number(amount) * (Number(rate) / 100) * (Number(months) / 12));
  };

  const maturityValue = () => {
    if (!amount || !rate || !months) return 0;
    return Number(amount) + calculate();
  };

  return (
    <section className="max-w-md mx-auto px-4 py-8">
      <h1 className="title text-center md:text-left">
        {dict.tools.fd.title}
      </h1>
      <p className="subtitle text-center md:text-left">
        {dict.tools.fd.desc}
      </p>

      <div className="card space-y-4 mt-6">
        <div>
          <label className="block text-sm font-medium">
            {dict.tools.fd.labels.amount}
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value) || "")}
            className="input"
            placeholder="e.g. 5000"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">
            {dict.tools.fd.labels.rate}
          </label>
          <input
            type="number"
            value={rate}
            onChange={(e) => setRate(Number(e.target.value) || "")}
            className="input"
            placeholder="e.g. 3.5"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">
            {dict.tools.fd.labels.duration}
          </label>
          <input
            type="number"
            value={months}
            onChange={(e) => setMonths(Number(e.target.value) || "")}
            className="input"
            placeholder="e.g. 12"
          />
        </div>

        <div className="p-4 border rounded-lg dark:border-gray-700 bg-gray-50 dark:bg-neutral-800">
          <h2 className="font-semibold text-lg">
            {dict.tools.fd.labels.interest}
          </h2>
          <p className="text-sm mt-1">
            {dict.tools.fd.labels.interest}:{" "}
            <strong>
              {calculate().toLocaleString("ms-MY", {
                style: "currency",
                currency: "MYR",
                maximumFractionDigits: 2,
              })}
            </strong>
          </p>
          <p className="text-sm">
            {dict.tools.fd.labels.total}:{" "}
            <strong>
              {maturityValue().toLocaleString("ms-MY", {
                style: "currency",
                currency: "MYR",
                maximumFractionDigits: 2,
              })}
            </strong>
          </p>
        </div>
      </div>
    </section>
  );
}
