"use client";


import { useState } from "react";
import { usePathname } from "next/navigation";
import { getDictionary } from "@/lib/getDictionary";
import { usePersistentValue } from "@/hooks/usePersistentValue";

export const runtime = "edge";
export default function EmergencyFundCalculator() {
  const pathname = usePathname();
  const lang = pathname.split("/")[1] || "en";
  const dict = getDictionary(lang);

  const [monthly, setMonthly] = usePersistentValue("monthlyExpenses", 2500);
  const [goalMonths, setGoalMonths] = useState(3);
  const [current, setCurrent] = useState(4000);

  const required = monthly * goalMonths;
  const shortfall = Math.max(0, required - current);
  const monthlyTo6 = shortfall / 6;
  const monthlyTo12 = shortfall / 12;

  return (
    <section className="max-w-md mx-auto px-4 py-8">
      <h1 className="title mb-2">{dict.tools.ef.title}</h1>
      <p className="subtitle mb-6">{dict.tools.ef.desc}</p>

      <div className="card space-y-5">
      <label className="block">
          {dict.tools.ef.labels.monthly}{" "}
          {monthly !== 2500 && (
            <span className="text-xs text-blue-500">
              <em>{dict.general.savedFromLastInput}</em>
            </span>
          )}
          <input
            type="number"
            className="input mt-1"
            value={monthly}
            onChange={(e) => setMonthly(+e.target.value)}
          />
        </label>

        <label className="block">
          {dict.tools.ef.labels.goal}
          <select
            className="input mt-1"
            value={goalMonths}
            onChange={(e) => setGoalMonths(+e.target.value)}
          >
            <option value={1}>{dict.tools.ef.labels.one}</option>
            <option value={3}>{dict.tools.ef.labels.three}</option>
            <option value={6}>{dict.tools.ef.labels.six}</option>
          </select>
        </label>

        <label className="block">
          {dict.tools.ef.labels.current}
          <input
            type="number"
            className="input mt-1"
            value={current}
            onChange={(e) => setCurrent(+e.target.value)}
            min={0}
            placeholder="0"
          />
        </label>

        <div className="p-4 border rounded-lg dark:border-gray-700 bg-gray-50 dark:bg-neutral-800 space-y-2">
          <p>
            <span className="font-semibold">
              {dict.tools.ef.labels.required}:
            </span>{" "}
            RM{" "}
            {required.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
          <p>
            <span className="font-semibold">
              {dict.tools.ef.labels.shortfall}:
            </span>{" "}
            RM{" "}
            {shortfall.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
          <p>
            {dict.tools.ef.labels.save6}{" "}
            <strong>
              RM{" "}
              {monthlyTo6.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </strong>
          </p>
          <p>
            {dict.tools.ef.labels.save12}{" "}
            <strong>
              RM{" "}
              {monthlyTo12.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </strong>
          </p>
        </div>
      </div>
    </section>
  );
}