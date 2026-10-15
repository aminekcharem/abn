"use client";

import { useMemo, useState } from "react";

const makes = ["Toutes les marques", "Genesis", "BMW", "Mercedes-Benz", "Porsche"];
const models = ["Tous les modèles", "G80", "X5", "EQE", "Cayenne"];
const prices = ["Tous les prix", "Moins de 70 M KRW", "70 M - 100 M KRW", "100 M KRW+"];
const bodyTypes = ["SUV", "Berline", "Compacte", "Coupé", "Hybride"];

export default function VehicleSearch() {
  const [condition, setCondition] = useState("Tous");
  const [make, setMake] = useState(makes[0]);
  const [model, setModel] = useState(models[0]);
  const [price, setPrice] = useState(prices[0]);

  const resultCount = useMemo(() => {
    let count = 9451;
    if (condition !== "Tous") count -= 1730;
    if (make !== makes[0]) count -= 2180;
    if (model !== models[0]) count -= 910;
    if (price !== prices[0]) count -= 1260;
    return Math.max(count, 248);
  }, [condition, make, model, price]);

  return (
    <div className="mx-auto mt-8 max-w-4xl rounded-full bg-white p-2 text-left shadow-xl shadow-[#1b1b1b]/8">
      <div className="hidden flex-wrap gap-2 border-b border-[#1b1b1b]/10 pb-4">
        {["Tous", "Neufs", "Occasions"].map((item) => (
          <button
            type="button"
            className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
              condition === item
                ? "bg-[#1b1b1b] text-white"
                : "bg-white text-[#1b1b1b]/62 hover:text-[#1b1b1b]"
            }`}
            key={item}
            onClick={() => setCondition(item)}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="grid gap-2 md:grid-cols-[1fr_1fr_1fr_auto]">
        <SearchSelect label="Marque" value={make} options={makes} onChange={setMake} />
        <SearchSelect label="Modèle" value={model} options={models} onChange={setModel} />
        <SearchSelect label="Prix" value={price} options={prices} onChange={setPrice} />
        <button
          type="button"
          className="rounded-full bg-[#a21d2f] px-7 py-4 text-sm font-semibold text-white transition hover:bg-[#1b1b1b]"
        >
          Rechercher {resultCount} véhicules
        </button>
      </div>

      <div className="hidden mt-6 flex-col gap-3 text-sm sm:flex-row sm:items-center">
        <span className="font-semibold text-[#1b1b1b]/52">Ou parcourir les modèles populaires</span>
        <div className="flex flex-wrap gap-2">
          {bodyTypes.map((type) => (
            <a
              href="#vehicules"
              className="rounded-full border border-[#1b1b1b]/10 px-4 py-2 font-semibold text-[#1b1b1b]/68 transition hover:border-[#a21d2f]/60 hover:text-[#1b1b1b]"
              key={type}
            >
              {type}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

function SearchSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="block rounded-full border border-transparent bg-white px-5 py-3">
      <span className="block text-xs font-semibold uppercase text-[#1b1b1b]/42">
        {label}
      </span>
      <select
        className="mt-1 w-full bg-transparent text-base font-semibold text-[#1b1b1b] outline-none"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}
