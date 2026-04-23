import { c as createProduct } from "./server-build-CIcFBEMW.js";
import "react/jsx-runtime";
import "node:stream";
import "@react-router/node";
import "react-router";
import "isbot";
import "react-dom/server";
import "@dazl/color-scheme/react";
import "react";
import "classnames";
import "node:crypto";
import "lucide-react";
import "ua-parser-js";
import "@supabase/supabase-js";
import "bcryptjs";
function countryCodeToFlag(iso2) {
  const m = {
    US: "🇺🇸",
    GB: "🇬🇧",
    UK: "🇬🇧",
    CA: "🇨🇦",
    AU: "🇦🇺",
    DE: "🇩🇪",
    FR: "🇫🇷",
    IN: "🇮🇳",
    ES: "🇪🇸",
    IT: "🇮🇹",
    BR: "🇧🇷",
    MX: "🇲🇽",
    JP: "🇯🇵"
  };
  return m[iso2.toUpperCase()] ?? "🏳️";
}
const CARD_HEADER = /^\s*CARD\s*\d*\s*:?\s*$/i;
function digitsOnly(s) {
  return s.replace(/\D/g, "");
}
function providerFromBin(bin) {
  const b = bin;
  if (b.startsWith("4")) return "VISA";
  if (b.startsWith("34") || b.startsWith("37")) return "AMEX";
  if (b.startsWith("6011") || b.startsWith("65") || b.startsWith("64") || b.startsWith("62")) return "DISCOVER";
  if (b.startsWith("5") || b.startsWith("2")) return "MASTERCARD";
  return "VISA";
}
function colorForProvider(provider) {
  switch (provider) {
    case "MASTERCARD":
      return "#f59e0b";
    case "AMEX":
      return "#eab308";
    case "DISCOVER":
      return "#f97316";
    default:
      return "#3b82f6";
  }
}
const RANDOM_COUNTRIES = ["US", "CA", "AE", "GB", "FR", "DE", "IT", "ES", "NL", "BE", "CH", "SE", "NO", "DK", "FI", "PL", "PT", "GR", "CZ", "RO", "HU", "SK", "RU", "UA", "CN", "JP", "KR", "SG", "HK", "TW", "TH", "ID", "MY", "PH", "VN", "PK", "BD", "LK", "SA", "IL", "TR", "EG", "ZA", "NG", "GH", "MX", "BR", "AR", "CO", "CL", "PE", "VE", "AU", "NZ", "IN"];
function getRandomState(iso2) {
  const map = {
    US: ["California", "Texas", "New York", "Florida", "Illinois"],
    CA: ["Ontario", "Quebec", "British Columbia", "Alberta"],
    GB: ["England", "Scotland", "Wales"],
    FR: ["Île-de-France", "Provence-Alpes-Côte d'Azur"],
    DE: ["Bavaria", "Berlin", "Hesse", "North Rhine-Westphalia"],
    IT: ["Lombardy", "Lazio", "Campania"],
    ES: ["Madrid", "Catalonia", "Andalusia"],
    IN: ["Maharashtra", "Delhi", "Karnataka"],
    AU: ["New South Wales", "Victoria", "Queensland"],
    AE: ["Dubai", "Abu Dhabi"],
    NL: ["North Holland", "South Holland"],
    BE: ["Brussels", "Flanders"],
    CH: ["Zurich", "Geneva"],
    SE: ["Stockholm", "Västra Götaland"],
    NO: ["Oslo", "Vestland"],
    DK: ["Capital Region", "Central Denmark"],
    FI: ["Uusimaa", "Pirkanmaa"],
    PL: ["Masovia", "Lesser Poland"],
    PT: ["Lisbon", "Porto"],
    GR: ["Attica", "Central Macedonia"],
    MX: ["Mexico City", "Jalisco", "Nuevo León"],
    BR: ["São Paulo", "Rio de Janeiro", "Minas Gerais"],
    AR: ["Buenos Aires", "Córdoba"],
    CO: ["Bogotá", "Antioquia"],
    CL: ["Santiago Metropolitan", "Valparaíso"],
    ZA: ["Gauteng", "Western Cape", "KwaZulu-Natal"],
    NG: ["Lagos", "Kano", "Rivers"],
    EG: ["Cairo", "Alexandria"],
    SA: ["Riyadh", "Mecca"],
    IL: ["Tel Aviv", "Jerusalem"],
    TR: ["Istanbul", "Ankara"],
    CN: ["Guangdong", "Shandong", "Zhejiang"],
    JP: ["Tokyo", "Osaka", "Kanagawa"],
    KR: ["Seoul", "Busan", "Gyeonggi"],
    SG: ["Central Region", "East Region"],
    HK: ["Hong Kong Island", "Kowloon", "New Territories"],
    TW: ["Taipei", "Kaohsiung"],
    TH: ["Bangkok", "Chiang Mai"],
    ID: ["Jakarta", "West Java", "East Java"],
    MY: ["Selangor", "Johor"],
    PH: ["Metro Manila", "Cebu"],
    VN: ["Ho Chi Minh City", "Hanoi"],
    NZ: ["Auckland", "Wellington"],
    PK: ["Punjab", "Sindh"],
    BD: ["Dhaka", "Chittagong"],
    LK: ["Western Province", "Central Province"]
  };
  const states = map[iso2];
  if (states && states.length > 0) {
    return states[Math.floor(Math.random() * states.length)];
  }
  return "Capital Region";
}
function extractBulkDataLines(raw) {
  return raw.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0 && !CARD_HEADER.test(l));
}
function parseBulkCardLine(line, opts) {
  const parts = line.split("|").map((p) => p.trim());
  let card_number = parts[0] || "";
  const cleanCard = (card_number || "").replace(/\D/g, "");
  console.log("FORCED CARD:", cleanCard);
  return { ok: true, parts, cardNumber: cleanCard };
}
async function bulkImportProductsFromText(raw, opts) {
  const lines = extractBulkDataLines(raw);
  const errors = [];
  let created = 0;
  let lineNo = 0;
  function getRandom(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  function getRandomType() {
    return Math.random() < 0.5 ? "DEBIT" : "CREDIT";
  }
  function generateRandomExpiry() {
    const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, "0");
    const year = Math.floor(Math.random() * 5) + 2026;
    return `${month}/${year}`;
  }
  for (const line of lines) {
    lineNo += 1;
    const parsed = parseBulkCardLine(line, { skipInvalid: opts.skipInvalid });
    let parts = parsed.parts;
    const firstPart = (parts[0] || "").toUpperCase();
    if (["VISA", "MASTERCARD", "AMEX", "DISCOVER", "UNIONPAY", "JCB"].includes(firstPart)) {
      parts.shift();
    }
    const cardNumberRaw = parts[0] || "";
    const cleanCard = digitsOnly(cardNumberRaw);
    const bin = cleanCard.length >= 6 ? cleanCard.slice(0, 6) : cleanCard.padEnd(6, "0");
    let expiryRaw = parts[1] || "";
    let finalExpiry = "";
    if (opts.pricing?.useRandomExpiry) {
      finalExpiry = generateRandomExpiry();
    } else {
      const m = expiryRaw.match(/(\d{2})[\/\-\s]*(\d{2,4})/);
      if (m) {
        let mm = m[1];
        let yy = m[2];
        if (yy.length === 2) yy = "20" + yy;
        finalExpiry = `${mm}/${yy}`;
      } else {
        finalExpiry = expiryRaw;
      }
    }
    let cvvRaw = parts[2] || "";
    let finalCvv = digitsOnly(cvvRaw).slice(0, 4);
    if (finalCvv.length < 3) finalCvv = finalCvv.padEnd(3, "0");
    let finalName = parts[3] ? parts[3].trim() : "";
    let finalAddress = parts[4] ? parts[4].trim() : "";
    let rawCountry = parts[5] ? parts[5].trim() : "";
    let finalCountry = rawCountry;
    let finalState = "N/A";
    if (opts.pricing?.useRandomCountry) {
      finalCountry = RANDOM_COUNTRIES[Math.floor(Math.random() * RANDOM_COUNTRIES.length)];
      finalState = getRandomState(finalCountry);
    } else {
      finalCountry = finalCountry ? finalCountry.slice(0, 2).toUpperCase() : "US";
      finalState = "N/A";
    }
    let finalZip = parts[6] ? parts[6].trim() : "";
    let finalExtras = null;
    if (opts.pricing?.useRandomAddressFlag) {
      finalExtras = Math.random() < 0.5 ? "YES" : "NO";
    }
    const banks = ["Chase Bank", "Bank of America", "Wells Fargo", "Citibank", "HSBC", "Barclays", "Capital One", "TD Bank", "PNC Bank", "US Bank"];
    let finalBank = "N/A";
    if (opts.pricing?.useRandomBank) {
      finalBank = banks[Math.floor(Math.random() * banks.length)];
    }
    const providerFromAuto = providerFromBin(bin === "000000" ? "411111" : bin);
    let finalPrice = 0;
    if (opts.pricing?.useRandomPrice && opts.pricing.priceMin && opts.pricing.priceMax) {
      finalPrice = getRandom(Number(opts.pricing.priceMin), Number(opts.pricing.priceMax));
    } else if (opts.pricing?.globalPrice) {
      finalPrice = Number(opts.pricing.globalPrice);
    }
    let finalLimit = 0;
    if (opts.pricing?.useRandomLimit && opts.pricing.limitMin && opts.pricing.limitMax) {
      finalLimit = getRandom(Number(opts.pricing.limitMin), Number(opts.pricing.limitMax));
    } else if (opts.pricing?.globalLimit) {
      finalLimit = Number(opts.pricing.globalLimit);
    }
    let finalType = "DEBIT";
    if (opts.pricing?.useRandomType) {
      finalType = getRandomType();
    }
    let finalStock = 1;
    if (opts.pricing?.useRandomStock && opts.pricing.stockMin && opts.pricing.stockMax) {
      finalStock = getRandom(Number(opts.pricing.stockMin), Number(opts.pricing.stockMax));
    }
    try {
      console.log(`[bulkImport] Line ${lineNo}: Creating product with bin=${bin}, price=${finalPrice}`);
      await createProduct({
        bin,
        provider: providerFromAuto,
        type: finalType,
        expiry: finalExpiry || "12/28",
        name: finalName || `${providerFromAuto} Card`,
        country: finalCountry,
        countryFlag: countryCodeToFlag(finalCountry),
        state: finalState,
        street: finalAddress || "N/A",
        city: "N/A",
        address: finalAddress || "N/A",
        zip: finalZip || "N/A",
        extras: finalExtras,
        bank: finalBank,
        priceUsdCents: Math.round(finalPrice * 100),
        limitUsd: Math.floor(finalLimit),
        validUntil: finalExpiry || "12/28",
        isValid: opts.isValid,
        tag: null,
        stock: finalStock,
        color: colorForProvider(providerFromAuto),
        cardNumber: cleanCard,
        cvv: finalCvv || void 0,
        fullName: finalName || void 0
      });
      console.log(`[bulkImport] Line ${lineNo}: SUCCESS`);
      created += 1;
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : String(e);
      console.error(`[bulkImport] Line ${lineNo}: FAILED - ${errorMsg}`);
      errors.push({
        line: lineNo,
        message: errorMsg
      });
    }
  }
  return { created, errors };
}
export {
  bulkImportProductsFromText,
  extractBulkDataLines,
  parseBulkCardLine
};
