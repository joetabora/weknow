"use client";

import { useState } from "react";

type ContractSide = "YES" | "NO";

type ContractCalculatorProps = {
  defaultYesPrice: number;
  defaultNoPrice: number;
};

const INVESTMENT_PRESETS = [20, 40, 100] as const;

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const currencyPreciseFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

function clampPrice(value: number): number {
  if (Number.isNaN(value) || value <= 0) {
    return 0;
  }
  return Math.min(value, 1);
}

function priceToCentsInput(price: number): string {
  const cents = Math.round(clampPrice(price) * 100);
  return String(cents);
}

function calculateOutcome(priceCents: string, investment: string) {
  const price = clampPrice(Number(priceCents) / 100);
  const stake = Number(investment);

  if (price <= 0 || Number.isNaN(stake) || stake <= 0) {
    return { kind: "invalid" as const };
  }

  const contracts = Math.floor(stake / price);
  if (contracts === 0) {
    return { kind: "tooSmall" as const, price, stake };
  }

  const payoutIfWin = contracts;
  const profitIfWin = payoutIfWin - stake;
  const lossIfLose = stake;
  const returnPctIfWin = (profitIfWin / stake) * 100;

  return {
    kind: "ok" as const,
    price,
    stake,
    contracts,
    payoutIfWin,
    profitIfWin,
    lossIfLose,
    returnPctIfWin,
  };
}

export function ContractCalculator({
  defaultYesPrice,
  defaultNoPrice,
}: ContractCalculatorProps) {
  const [side, setSide] = useState<ContractSide>("YES");
  const [priceCents, setPriceCents] = useState(() =>
    priceToCentsInput(defaultYesPrice),
  );
  const [investment, setInvestment] = useState("100");
  const result = calculateOutcome(priceCents, investment);

  function selectSide(next: ContractSide) {
    setSide(next);
    setPriceCents(
      priceToCentsInput(next === "YES" ? defaultYesPrice : defaultNoPrice),
    );
  }

  return (
    <div className="border border-slate-200 bg-white/70 p-5">
      <p className="text-sm leading-6 text-slate-500">
        Hypothetical outcomes only. Winning contracts pay $1.00; losing
        contracts pay $0. This does not place orders or connect to an account.
      </p>

      <div className="mt-5 grid gap-5 sm:grid-cols-3">
        <fieldset>
          <legend className="text-xs uppercase tracking-[0.12em] text-slate-500">
            Contract side
          </legend>
          <div className="mt-2 flex gap-2">
            {(["YES", "NO"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => selectSide(option)}
                className={
                  side === option
                    ? "flex-1 bg-cyan-700 px-3 py-2 text-sm font-medium text-white"
                    : "flex-1 border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
                }
              >
                {option}
              </button>
            ))}
          </div>
        </fieldset>

        <label className="block">
          <span className="text-xs uppercase tracking-[0.12em] text-slate-500">
            Current contract price (¢)
          </span>
          <input
            type="number"
            min={1}
            max={100}
            step={1}
            value={priceCents}
            onChange={(event) => setPriceCents(event.target.value)}
            className="mt-2 w-full border border-slate-300 bg-white px-3 py-2 font-mono text-sm text-slate-900 outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-600/20"
          />
        </label>

        <label className="block">
          <span className="text-xs uppercase tracking-[0.12em] text-slate-500">
            Investment amount ($)
          </span>
          <input
            type="number"
            min={1}
            step={1}
            value={investment}
            onChange={(event) => setInvestment(event.target.value)}
            className="mt-2 w-full border border-slate-300 bg-white px-3 py-2 font-mono text-sm text-slate-900 outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-600/20"
          />
          <div className="mt-2 flex flex-wrap gap-2">
            {INVESTMENT_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setInvestment(String(preset))}
                className={
                  investment === String(preset)
                    ? "border border-cyan-700 bg-cyan-50 px-3 py-1 text-xs font-medium text-cyan-900"
                    : "border border-slate-300 bg-white px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                }
              >
                ${preset}
              </button>
            ))}
          </div>
        </label>
      </div>

      <div className="mt-6 border-t border-slate-200 pt-5">
        {result.kind === "invalid" ? (
          <p className="text-sm text-slate-600">
            Enter a contract price above 0¢ and an investment above $0.
          </p>
        ) : result.kind === "tooSmall" ? (
          <p className="text-sm text-slate-600">
            At {Math.round(result.price * 100)}¢, ${result.stake} is not enough
            to buy one contract.
          </p>
        ) : (
          <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <dt className="text-xs uppercase tracking-[0.12em] text-slate-500">
                Contracts
              </dt>
              <dd className="mt-1 font-mono text-2xl text-slate-950">
                {result.contracts.toLocaleString("en-US")}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.12em] text-slate-500">
                If {side} wins — payout
              </dt>
              <dd className="mt-1 font-mono text-2xl text-slate-950">
                {currencyFormatter.format(result.payoutIfWin)}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.12em] text-slate-500">
                If {side} wins — profit
              </dt>
              <dd className="mt-1 font-mono text-2xl text-cyan-800">
                {currencyPreciseFormatter.format(result.profitIfWin)}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.12em] text-slate-500">
                If {side} loses — loss
              </dt>
              <dd className="mt-1 font-mono text-2xl text-rose-700">
                {currencyFormatter.format(result.lossIfLose)}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.12em] text-slate-500">
                Return if {side} wins
              </dt>
              <dd className="mt-1 font-mono text-2xl text-cyan-800">
                +{Math.round(result.returnPctIfWin)}%
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.12em] text-slate-500">
                Return if {side} loses
              </dt>
              <dd className="mt-1 font-mono text-2xl text-rose-700">-100%</dd>
            </div>
          </dl>
        )}
      </div>
    </div>
  );
}
