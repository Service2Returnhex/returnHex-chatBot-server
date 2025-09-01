// services/parseText.ts
export function parseNameAndPrice(ocrText: string) {
  const txt = (ocrText || "").replace(/\r/g, " ").replace(/\n+/g, "\n").trim();
  if (!txt) return { name: "", price: null, ocrText: "" };

  // 1) price regex — support formats like: 1,250 / 1250 / Tk 1,250 / BDT 1250 / ৳1250 / 1250৳
  const priceRegex =
    /(?:(?:Tk|BDT|৳)\s*)?(\d{1,3}(?:[,\s]\d{3})*(?:\.\d+)?|\d+(?:\.\d+)?)(?:\s*(?:Tk|BDT|৳))?/i;
  const priceMatch = txt.match(priceRegex);
  let price: number | null = null;
  if (priceMatch) {
    // normalize number: remove commas/spaces
    const raw = priceMatch[1].replace(/[, ]+/g, "");
    price = parseFloat(raw);
    if (Number.isNaN(price)) price = null;
  }

  // 2) name heuristic:
  // - often name is first non-empty line or line containing alphabets not only digits
  const lines = txt
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  let name = "";
  if (lines.length) {
    // prefer a line that is largely letters and not price
    for (const l of lines) {
      if (!priceRegex.test(l) && /[A-Za-z\u0980-\u09FF]/.test(l)) {
        // english or bengali letters
        name = l;
        break;
      }
    }
    if (!name) name = lines[0];
  }

  return { name: name.trim(), price, ocrText: txt };
}
