import { Level } from "../generated/prisma/client";

export function formatCurrency(amount: number, currency: string): string {
  const formatter = new Intl.NumberFormat(
    currency === "INR" ? "en-IN" : "en-US",
    {
      style: "currency",
      currency: currency,
      maximumFractionDigits: 0,
    }
  );
  return formatter.format(amount);
}

export function formatSalaryCompact(amount: number, currency: string): string {
  if (currency === "INR") {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    }
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)} L`;
    }
    return `₹${amount.toLocaleString("en-IN")}`;
  } else {
    const symbol = currency === "USD" ? "$" : currency === "GBP" ? "£" : "€";
    if (amount >= 1000000) {
      return `${symbol}${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `${symbol}${Math.round(amount / 1000)}k`;
    }
    return `${symbol}${amount}`;
  }
}

export function mapLevelToBadge(level: Level | string): string {
  switch (level) {
    case "L3":
    case "SDE_I":
      return "L3/SDE_I";
    case "L4":
    case "SDE_II":
      return "L4/SDE_II";
    case "L5":
    case "SDE_III":
      return "L5/SDE_III";
    case "L6":
    case "STAFF":
      return "L6/STAFF";
    case "PRINCIPAL":
      return "PRINCIPAL";
    default:
      return String(level);
  }
}
export function mapLevelToColor(level: string): string {
  switch (level) {
    case "L3":
    case "SDE_I":
      return "bg-slate-50 text-slate-700 border-slate-200";
    case "L4":
    case "SDE_II":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "L5":
    case "SDE_III":
      return "bg-indigo-50 text-indigo-700 border-indigo-200";
    case "L6":
    case "STAFF":
      return "bg-purple-50 text-purple-700 border-purple-200";
    case "PRINCIPAL":
      return "bg-rose-50 text-rose-700 border-rose-200";
    default:
      return "bg-gray-50 text-gray-700 border-gray-200";
  }
}
