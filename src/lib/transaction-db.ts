import type { Transaction, TransactionType } from "./types";

const SELL_TYPES: TransactionType[] = ["SELL", "WITHDRAWAL"];

/** Normalisiert Transaktionen für Supabase (CHECK: BUY/SELL, quantity > 0). */
export function prepareTransactionForDatabase(tx: Transaction) {
  let dbType: "BUY" | "SELL" = SELL_TYPES.includes(tx.type) ? "SELL" : "BUY";
  let quantity = tx.quantity;
  let price = tx.price;
  let fees = tx.fees;
  let taxes = 0;

  if (quantity <= 0) quantity = 1;

  if (tx.type === "TAX") {
    taxes = tx.price > 0 ? tx.price : tx.fees;
    price = 0.00000001;
    fees = 0;
  } else if (tx.type === "FEE") {
    fees = tx.price > 0 ? tx.price : tx.fees;
    price = 0.00000001;
  } else if (tx.type === "DIVIDEND") {
    price = tx.price > 0 ? tx.price : 0.00000001;
    quantity = 1;
    fees = tx.fees;
  }

  const notes =
    tx.type === "BUY" || tx.type === "SELL"
      ? tx.notes ?? null
      : JSON.stringify({
          extendedType: tx.type,
          ...(tx.notes ? { note: tx.notes } : {}),
        });

  return { dbType, quantity, price, fees, taxes, notes };
}

export function isDividendTransaction(type: TransactionType) {
  return type === "DIVIDEND";
}
