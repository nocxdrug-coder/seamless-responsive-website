/**
 * BIN Generator — Advanced BIN-Based Smart Card Autofill System
 *
 * All generated data is auto-generated for system use.
 * - BIN lookup returns only public metadata (provider, bank, country).
 * - Card numbers, CVV, names, and addresses are generated using BIN logic.
 */

import { useState, useCallback, useRef, type ChangeEvent } from "react";
import {
  CreditCard,
  Wand2,
  RefreshCw,
  Trash2,
  Plus,
  CheckCircle,
  Edit3,
  X,
  Package,
  Layers,
  Copy,
  Check,
  Loader2,
} from "lucide-react";
import styles from "./bin-generator.module.css";

// ─── Types ────────────────────────────────────────────────────────────────────

interface BinInfo {
  scheme: string;    // VISA / MASTERCARD / AMEX / DISCOVER / …
  type: string;      // DEBIT / CREDIT / PREPAID
  brand: string;
  bank: string;
  country: string;   // ISO2
  countryName: string;
}

type BinStatus = "idle" | "ok";
type CardStatus = "in_stock" | "sold_out";

interface GeneratedCard {
  id: string;
  bin: string;
  provider: string;
  type: string;
  bank: string;
  country: string;
  countryFlag: string;
  cardNumber: string;
  cvv: string;
  expiry: string;
  fullName: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  priceUsd: string;
  limitUsd: string;
  isValid: boolean;
  status: CardStatus;
}

interface BulkEntry {
  bin: string;
  qty: number;
}

// ─── Provider → emoji icon ────────────────────────────────────────────────────

const PROVIDER_ICON: Record<string, string> = {
  VISA: "💳",
  MASTERCARD: "🔴",
  AMEX: "🟦",
  DISCOVER: "🟠",
  UNIONPAY: "🇨🇳",
  JCB: "🇯🇵",
  MAESTRO: "🎵",
  CARD: "💳",
};

// ─── Country flag map (ISO-2 → flag emoji) ────────────────────────────────────

const COUNTRY_FLAGS: Record<string, string> = {
  US: "🇺🇸", GB: "🇬🇧", CA: "🇨🇦", AU: "🇦🇺", DE: "🇩🇪", FR: "🇫🇷", IT: "🇮🇹",
  ES: "🇪🇸", NL: "🇳🇱", BE: "🇧🇪", CH: "🇨🇭", SE: "🇸🇪", NO: "🇳🇴", DK: "🇩🇰",
  FI: "🇫🇮", PL: "🇵🇱", PT: "🇵🇹", IN: "🇮🇳", JP: "🇯🇵", KR: "🇰🇷", SG: "🇸🇬",
  HK: "🇭🇰", AE: "🇦🇪", SA: "🇸🇦", BR: "🇧🇷", MX: "🇲🇽", AR: "🇦🇷", ZA: "🇿🇦",
  NG: "🇳🇬", RU: "🇷🇺", CN: "🇨🇳", TR: "🇹🇷", IL: "🇮🇱", NZ: "🇳🇿", MY: "🇲🇾",
  PH: "🇵🇭", TH: "🇹🇭", ID: "🇮🇩", PK: "🇵🇰", EG: "🇪🇬", CO: "🇨🇴", CL: "🇨🇱",
  UA: "🇺🇦", GH: "🇬🇭", KE: "🇰🇪",
};

// ─── BIN prefix → country ISO-2 map ──────────────────────────────────────────
// 3-digit prefix lookup; more specific (4-6 digit) prefixes override below.

const BIN_COUNTRY_3: Record<string, string> = {
  // VISA 4xx
  "400": "US", "401": "US", "402": "CA", "403": "GB", "404": "AE", "405": "AE",
  "406": "SA", "407": "TR", "408": "AU", "409": "ZA", "410": "US", "411": "US",
  "412": "US", "413": "US", "414": "US", "415": "US", "416": "US", "417": "US",
  "418": "US", "419": "US", "420": "GB", "421": "GB", "422": "GB", "423": "FR",
  "424": "FR", "425": "DE", "426": "DE", "427": "NL", "428": "BE", "429": "CH",
  "430": "CA", "431": "CA", "432": "CA", "433": "CA", "434": "CA", "435": "CA",
  "436": "CA", "437": "CA", "438": "CA", "439": "CA", "440": "AU", "441": "AU",
  "442": "AU", "443": "NZ", "444": "SG", "445": "MY", "446": "PH", "447": "TH",
  "448": "ID", "449": "IN", "450": "US", "451": "US", "452": "US", "453": "US",
  "454": "US", "455": "US", "456": "US", "457": "US", "458": "US", "459": "US",
  "460": "CN", "461": "CN", "462": "JP", "463": "KR", "464": "HK", "465": "SG",
  "466": "TW", "467": "IN", "468": "PK", "469": "BR", "470": "MX", "471": "AR",
  "472": "CO", "473": "CL", "474": "BR", "475": "US", "476": "US", "477": "US",
  "478": "US", "479": "US", "480": "DE", "481": "FR", "482": "IT", "483": "ES",
  "484": "PT", "485": "SE", "486": "NO", "487": "DK", "488": "FI", "489": "PL",
  "490": "US", "491": "US", "492": "US", "493": "US", "494": "US", "495": "US",
  "496": "US", "497": "US", "498": "US", "499": "US",
  // MASTERCARD 5xx
  "510": "US", "511": "US", "512": "US", "513": "US", "514": "US", "515": "US",
  "516": "US", "517": "US", "518": "US", "519": "US", "520": "CA", "521": "CA",
  "522": "CA", "523": "CA", "524": "CA", "525": "CA", "526": "CA", "527": "CA",
  "528": "CA", "529": "CA", "530": "AE", "531": "AE", "532": "SA", "533": "SA",
  "534": "TR", "535": "TR", "536": "EG", "537": "NG", "538": "KE", "539": "GH",
  "540": "US", "541": "GB", "542": "DE", "543": "FR", "544": "IT", "545": "ES",
  "546": "NL", "547": "US", "548": "US", "549": "US", "550": "SA", "551": "US",
  "552": "US", "553": "AU", "554": "AU", "555": "AU",
  // MASTERCARD 2xxx
  "222": "US", "223": "US", "224": "GB", "225": "DE", "226": "FR", "227": "CA",
  "228": "AU", "229": "US", "230": "US", "231": "US", "232": "US", "233": "US",
  "234": "US", "235": "US", "236": "US", "237": "US", "238": "US", "239": "US",
  "240": "US", "241": "US", "242": "US", "243": "US", "244": "US", "245": "US",
  "246": "US", "247": "US", "248": "US", "249": "US", "250": "US", "251": "US",
  "252": "US", "253": "US", "254": "US", "255": "US", "256": "US", "257": "US",
  "258": "US", "259": "US", "260": "US", "261": "US", "262": "US", "263": "US",
  "264": "US", "265": "US", "266": "US", "267": "US", "268": "US", "269": "US",
  "270": "US", "271": "US",
  // AMEX 3xx
  "340": "US", "341": "US", "342": "US", "343": "US", "344": "US", "345": "US",
  "346": "GB", "347": "US", "348": "AU", "370": "US", "371": "US", "372": "US",
  "373": "US", "374": "US", "375": "US", "376": "CA", "377": "GB", "378": "DE",
  "379": "FR",
  // DISCOVER 6xx
  "601": "US", "602": "US", "603": "US", "604": "US", "605": "US", "606": "US",
  "607": "US", "608": "US", "609": "US", "644": "US", "645": "US", "646": "US",
  "647": "US", "648": "US", "649": "US", "650": "US", "651": "US", "652": "US",
  "653": "US", "654": "US", "655": "US", "656": "US", "657": "US", "658": "US",
  "659": "US",
  // UNIONPAY 62x
  "620": "CN", "621": "CN", "622": "CN", "623": "CN", "624": "CN", "625": "CN",
  "626": "CN", "627": "CN", "628": "CN", "629": "CN",
  // JCB 35x
  "352": "JP", "353": "JP", "354": "JP", "355": "JP", "356": "JP", "357": "JP",
  "358": "JP",
};

// ─── BIN prefix → bank name map ───────────────────────────────────────────────

const BIN_BANK_4: Record<string, string> = {
  // VISA — US
  "4111": "Chase Bank", "4012": "Bank of America", "4024": "Wells Fargo",
  "4532": "Citibank", "4539": "US Bank", "4916": "Capital One",
  "4929": "Barclays", "4000": "Bank of America", "4128": "TD Bank",
  "4147": "PNC Bank", "4744": "SunTrust Bank", "4234": "Regions Bank",
  "4556": "Wells Fargo", "4485": "Chase Bank", "4658": "Fifth Third Bank",
  // VISA — UK / EU
  "4026": "Barclays", "4041": "HSBC", "4508": "Lloyds Bank",
  "4569": "NatWest", "4600": "Deutsche Bank", "4607": "BNP Paribas",
  "4619": "Société Générale", "4715": "ING Bank", "4814": "Rabobank",
  // VISA — Canada
  "4300": "Royal Bank of Canada", "4317": "TD Canada Trust", "4335": "CIBC",
  "4344": "Scotiabank", "4360": "BMO Bank",
  // VISA — AUS
  "4400": "Commonwealth Bank", "4418": "Westpac", "4427": "ANZ Bank",
  "4433": "NAB",
  // VISA — Intl
  "4040": "HSBC", "4050": "Standard Chartered", "4060": "Citi International",
  "4070": "Emirates NBD", "4080": "Saudi National Bank", "4090": "First National Bank",
  // MASTERCARD — US
  "5100": "Chase Bank", "5110": "Citibank", "5120": "Bank of America",
  "5130": "Wells Fargo", "5140": "Capital One", "5150": "US Bank",
  "5160": "TD Bank", "5170": "PNC Bank", "5180": "American Express",
  "5190": "Discover Bank", "5200": "Royal Bank of Canada", "5210": "TD Canada Trust",
  "5220": "CIBC", "5230": "Scotiabank", "5300": "Emirates NBD",
  "5310": "Abu Dhabi Commercial Bank", "5320": "Saudi National Bank",
  "5330": "Riyad Bank", "5340": "Garanti Bank", "5350": "İş Bankası",
  "5400": "Chase Bank", "5410": "Barclays", "5420": "Deutsche Bank",
  "5430": "BNP Paribas", "5440": "Intesa Sanpaolo", "5450": "Santander",
  "5473": "Bank of America", "5474": "Bank of America",
  "5500": "Saudi National Bank", "5530": "Commonwealth Bank", "5540": "Westpac",
  // AMEX — US
  "3400": "American Express", "3411": "American Express", "3700": "American Express",
  "3711": "American Express", "3714": "American Express",
  // DISCOVER
  "6011": "Discover Bank", "6500": "Discover Bank",
  // UNIONPAY
  "6221": "Bank of China", "6225": "China Construction Bank", "6228": "Industrial & Commercial Bank",
};

// ─── BIN prefix → card type tendency ─────────────────────────────────────────
// Certain ranges are predominantly credit or debit.

const BIN_TYPE_4: Record<string, string> = {
  "4111": "CREDIT", "4532": "CREDIT", "4916": "CREDIT", "4929": "CREDIT",
  "5100": "CREDIT", "5140": "CREDIT", "5400": "CREDIT", "5410": "CREDIT",
  "5473": "CREDIT", "5474": "CREDIT",
  "3400": "CREDIT", "3700": "CREDIT",
  "6011": "CREDIT",
};

// ─── Fully offline BIN resolver ───────────────────────────────────────────────
// Never fails, never returns empty fields. Always returns a clean structured result.

function resolveBinProvider(bin: string): string {
  if (!bin || bin.length < 2) return "VISA";
  const n2 = parseInt(bin.slice(0, 2), 10);
  const n4 = parseInt(bin.slice(0, 4), 10);
  if (bin[0] === "4") return "VISA";
  if ((n2 >= 51 && n2 <= 55) || (n4 >= 2221 && n4 <= 2720)) return "MASTERCARD";
  if (bin[0] === "3" && (bin[1] === "4" || bin[1] === "7")) return "AMEX";
  if (bin.startsWith("6011") || (n4 >= 6440 && n4 <= 6599)) return "DISCOVER";
  if (bin.startsWith("65")) return "DISCOVER";
  if (bin.startsWith("62")) return "UNIONPAY";
  if (bin.startsWith("35")) return "JCB";
  if (bin.startsWith("50") || bin.startsWith("56") || bin.startsWith("57") || bin.startsWith("58")) return "MAESTRO";
  return "CARD";
}

function resolveBinCountry(bin: string): { code: string; name: string } {
  // Try 4-digit prefix first, then 3-digit
  const p4 = bin.slice(0, 4);
  const p3 = bin.slice(0, 3);
  const code = BIN_COUNTRY_3[p4] ?? BIN_COUNTRY_3[p3] ?? null;
  if (code) {
    const names: Record<string, string> = {
      US: "United States", GB: "United Kingdom", CA: "Canada", AU: "Australia",
      DE: "Germany", FR: "France", IT: "Italy", ES: "Spain", NL: "Netherlands",
      BE: "Belgium", CH: "Switzerland", SE: "Sweden", NO: "Norway", DK: "Denmark",
      FI: "Finland", PL: "Poland", PT: "Portugal", IN: "India", JP: "Japan",
      KR: "South Korea", SG: "Singapore", HK: "Hong Kong", AE: "UAE",
      SA: "Saudi Arabia", BR: "Brazil", MX: "Mexico", AR: "Argentina",
      ZA: "South Africa", NG: "Nigeria", RU: "Russia", CN: "China", TR: "Turkey",
      IL: "Israel", NZ: "New Zealand", MY: "Malaysia", PH: "Philippines",
      TH: "Thailand", ID: "Indonesia", PK: "Pakistan", EG: "Egypt",
      CO: "Colombia", CL: "Chile", UA: "Ukraine", GH: "Ghana", KE: "Kenya",
    };
    return { code, name: names[code] ?? code };
  }
  // Smart fallback based on provider prefix patterns
  const provider = resolveBinProvider(bin);
  if (provider === "UNIONPAY") return { code: "CN", name: "China" };
  if (provider === "JCB") return { code: "JP", name: "Japan" };
  return { code: "US", name: "International" };
}

function resolveBinBank(bin: string): string {
  const p4 = bin.slice(0, 4);
  if (BIN_BANK_4[p4]) return BIN_BANK_4[p4];
  // Smart fallback by provider
  const provider = resolveBinProvider(bin);
  const fallbacks: Record<string, string[]> = {
    VISA: ["Global Bank Network", "International Issuer", "Premier Card Services", "Horizon Bank"],
    MASTERCARD: ["Global Card Services", "International Bank Network", "Apex Financial", "Pinnacle Bank"],
    AMEX: ["American Express", "Amex Global Services"],
    DISCOVER: ["Discover Bank", "Discover Financial Services"],
    UNIONPAY: ["China UnionPay", "Bank of China"],
    JCB: ["JCB International"],
    MAESTRO: ["Maestro Card Services", "Global Bank Network"],
    CARD: ["Global Bank Network", "International Card Services"],
  };
  const list = fallbacks[provider] ?? fallbacks.CARD;
  // Use first 2 digits of BIN to pick deterministically (not random)
  return list[parseInt(bin.slice(0, 2), 10) % list.length];
}

function resolveBin(bin: string): BinInfo {
  const provider = resolveBinProvider(bin);
  const { code, name } = resolveBinCountry(bin);
  const bank = resolveBinBank(bin);
  const p4 = bin.slice(0, 4);
  const type = BIN_TYPE_4[p4] ?? "DEBIT";
  return { scheme: provider, brand: provider, type, bank, country: code, countryName: name };
}

// ─── Helper: provider display ─────────────────────────────────────────────────

function schemeToProvider(scheme: string): string {
  const s = scheme.toUpperCase();
  if (s.includes("VISA")) return "VISA";
  if (s.includes("MASTER")) return "MASTERCARD";
  if (s.includes("AMEX") || s.includes("AMERICAN")) return "AMEX";
  if (s.includes("DISCOVER")) return "DISCOVER";
  if (s.includes("UNIONPAY") || s.includes("CUP")) return "UNIONPAY";
  if (s.includes("JCB")) return "JCB";
  if (s.includes("MAESTRO")) return "MAESTRO";
  return scheme || "CARD";
}

// ─── Card generation helpers ──────────────────────────────────────────────────

/** Luhn algorithm — returns check digit for `partial` (without it). */
function luhnCheckDigit(partial: string): string {
  const digits = partial.split("").map(Number).reverse();
  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    let d = digits[i];
    if (i % 2 === 0) { d *= 2; if (d > 9) d -= 9; }
    sum += d;
  }
  return String((10 - (sum % 10)) % 10);
}

/** Generate a valid Luhn card number from BIN. AMEX = 15 digits, others = 16. */
function generateCardNumber(bin: string, provider: string): string {
  const total = provider === "AMEX" ? 15 : 16;
  const fillLen = total - bin.length - 1;
  let mid = "";
  for (let i = 0; i < fillLen; i++) mid += Math.floor(Math.random() * 10);
  const partial = bin + mid;
  return partial + luhnCheckDigit(partial);
}

/** Random CVV — 4 digits for AMEX, 3 for others. Never derived from BIN. */
function generateCvv(provider = "VISA"): string {
  const len = provider === "AMEX" ? 4 : 3;
  const min = Math.pow(10, len - 1);
  const max = Math.pow(10, len) - 1;
  return String(Math.floor(min + Math.random() * (max - min + 1)));
}

/** Random future expiry (+1..+5 years). Returns "MM/YY". Not derived from BIN. */
function generateExpiry(): string {
  const now = new Date();
  const yrs = 1 + Math.floor(Math.random() * 5);
  const mOs = Math.floor(Math.random() * 12);
  const t = new Date(now.getFullYear() + yrs, now.getMonth() + mOs, 1);
  return `${String(t.getMonth() + 1).padStart(2, "0")}/${String(t.getFullYear()).slice(-2)}`;
}

/** Validate "MM/YY" expiry — must be in the future. */
function isExpiryValid(e: string): boolean {
  const m = e.match(/^(\d{1,2})\/(\d{2})$/);
  if (!m) return false;
  const mo = parseInt(m[1], 10);
  const yr = 2000 + parseInt(m[2], 10);
  if (mo < 1 || mo > 12) return false;
  const now = new Date();
  return new Date(yr, mo - 1, 1) > new Date(now.getFullYear(), now.getMonth(), 1);
}

// ─── Name generators ──────────────────────────────────────────────────────────

const FIRST = [
  "JAMES", "JOHN", "ROBERT", "MICHAEL", "WILLIAM", "DAVID", "RICHARD", "JOSEPH", "THOMAS", "CHARLES",
  "CHRISTOPHER", "DANIEL", "MATTHEW", "ANTHONY", "MARK", "DONALD", "STEVEN", "PAUL", "ANDREW", "KENNETH",
  "JENNIFER", "PATRICIA", "LINDA", "BARBARA", "ELIZABETH", "SUSAN", "JESSICA", "SARAH", "KAREN", "LISA",
  "NANCY", "BETTY", "MARGARET", "SANDRA", "ASHLEY", "EMILY", "ANNA", "MARIA", "LAURA", "RACHEL",
];
const LAST = [
  "SMITH", "JOHNSON", "WILLIAMS", "BROWN", "JONES", "GARCIA", "MILLER", "DAVIS", "RODRIGUEZ", "MARTINEZ",
  "HERNANDEZ", "LOPEZ", "GONZALEZ", "WILSON", "ANDERSON", "THOMAS", "TAYLOR", "MOORE", "JACKSON", "MARTIN",
  "LEE", "PEREZ", "THOMPSON", "WHITE", "HARRIS", "SANCHEZ", "CLARK", "WALKER", "HALL", "YOUNG",
];

const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];
const rNum = (n: number) => Math.floor(Math.random() * n);

function generateName(): string {
  return `${pick(FIRST)} ${pick(LAST)}`;
}

// ─── Address data ─────────────────────────────────────────────────────────────

type AddrTpl = { streets: string[]; cities: string[]; states: string[]; zip: () => string };

const ADDR: Record<string, AddrTpl> = {
  US: {
    streets: ["Main St", "Oak Ave", "Maple Dr", "Cedar Ln", "Pine Rd", "Elm St", "Park Blvd", "Sunrise Dr", "Broadway", "Washington Blvd"],
    cities: ["Los Angeles", "New York", "Chicago", "Houston", "Phoenix", "Philadelphia", "San Antonio", "Dallas", "San Diego", "Austin", "Charlotte", "Columbus"],
    states: ["California", "Texas", "Florida", "New York", "Illinois", "Pennsylvania", "Ohio", "Georgia", "North Carolina", "Michigan"],
    zip: () => String(10000 + rNum(89999)),
  },
  GB: {
    streets: ["High Street", "Church Road", "Station Road", "London Road", "Park Lane", "Victoria Road", "King Street", "Queen Street"],
    cities: ["London", "Birmingham", "Manchester", "Leeds", "Glasgow", "Liverpool", "Bristol", "Sheffield", "Edinburgh", "Cardiff"],
    states: ["England", "Scotland", "Wales", "Northern Ireland"],
    zip: () => { const l = "ABCDEFGHIJKLMNOPRSTUW"; const r = (s: string) => s[rNum(s.length)]; return `${r(l)}${r(l)}${rNum(90) + 10} ${rNum(9) + 1}${r(l)}${r(l)}`; },
  },
  CA: {
    streets: ["Main St", "Yonge St", "Bloor St", "Queen St", "King St", "Bay St", "Dundas St", "College St"],
    cities: ["Toronto", "Vancouver", "Montreal", "Calgary", "Edmonton", "Ottawa", "Winnipeg", "Quebec City"],
    states: ["Ontario", "British Columbia", "Quebec", "Alberta", "Manitoba", "Nova Scotia"],
    zip: () => { const a = "ABCEGHJKLMNPRSTVXY", d = "0123456789", r = (s: string) => s[rNum(s.length)]; return `${r(a)}${r(d)}${r(a)} ${r(d)}${r(a)}${r(d)}`; },
  },
  AU: {
    streets: ["George St", "Collins St", "Pitt St", "Elizabeth St", "King St", "Queen St", "Flinders St"],
    cities: ["Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide", "Gold Coast", "Canberra", "Newcastle"],
    states: ["New South Wales", "Victoria", "Queensland", "Western Australia", "South Australia", "Tasmania"],
    zip: () => String(1000 + rNum(8999)),
  },
  DE: {
    streets: ["Hauptstraße", "Schulstraße", "Gartenstraße", "Bahnhofstraße", "Bergstraße", "Kirchstraße"],
    cities: ["Berlin", "Hamburg", "Munich", "Cologne", "Frankfurt", "Stuttgart", "Düsseldorf", "Leipzig"],
    states: ["Bavaria", "North Rhine-Westphalia", "Baden-Württemberg", "Hesse", "Saxony", "Berlin"],
    zip: () => String(10000 + rNum(89999)),
  },
  FR: {
    streets: ["Rue de la Paix", "Avenue des Champs", "Rue du Faubourg", "Boulevard Haussmann", "Rue Royale"],
    cities: ["Paris", "Marseille", "Lyon", "Toulouse", "Nice", "Nantes", "Strasbourg", "Bordeaux"],
    states: ["Île-de-France", "Provence-Alpes-Côte d'Azur", "Auvergne-Rhône-Alpes", "Hauts-de-France"],
    zip: () => String(10000 + rNum(89999)),
  },
  IN: {
    streets: ["MG Road", "Nehru Street", "Gandhi Nagar", "Connaught Place", "Linking Road", "Sector 15"],
    cities: ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Kolkata", "Pune", "Ahmedabad"],
    states: ["Maharashtra", "Delhi", "Karnataka", "Tamil Nadu", "Uttar Pradesh", "Gujarat", "Rajasthan"],
    zip: () => String(100000 + rNum(899999)),
  },
};

function generateAddress(country: string): { street: string; city: string; state: string; zip: string } {
  const t = ADDR[country];
  if (!t) return { street: `${1 + rNum(9999)} Main St`, city: "Capital City", state: "", zip: String(10000 + rNum(89999)) };
  return {
    street: `${1 + rNum(9999)} ${pick(t.streets)}`,
    city: pick(t.cities),
    state: pick(t.states),
    zip: t.zip(),
  };
}

// ─── Batch generator ──────────────────────────────────────────────────────────

function generateBatch(
  bin: string,
  info: { provider: string; type: string; bank: string; country: string; countryFlag: string },
  qty: number,
  defaults: { priceUsd: string; limitUsd: string; isValid: boolean },
): GeneratedCard[] {
  const seen = new Set<string>();
  const cards: GeneratedCard[] = [];
  const max = qty * 20;
  let attempts = 0;
  while (cards.length < qty && attempts++ < max) {
    const cardNumber = generateCardNumber(bin, info.provider);
    if (seen.has(cardNumber)) continue;
    seen.add(cardNumber);
    const addr = generateAddress(info.country);
    cards.push({
      id: crypto.randomUUID(),
      bin,
      provider: info.provider,
      type: info.type,
      bank: info.bank,
      country: info.country,
      countryFlag: info.countryFlag,
      cardNumber,
      cvv: generateCvv(info.provider),
      expiry: generateExpiry(),
      fullName: generateName(),
      ...addr,
      priceUsd: defaults.priceUsd,
      limitUsd: defaults.limitUsd,
      isValid: defaults.isValid,
      status: "in_stock",
    });
  }
  return cards;
}

// ─── Format card number with spaces ───────────────────────────────────────────

function formatCardNumber(num: string): string {
  const cleaned = num.replace(/\D/g, "");
  if (cleaned.length === 15) {
    // AMEX: 4-6-5
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 10)} ${cleaned.slice(10)}`;
  }
  return cleaned.replace(/(.{4})/g, "$1 ").trim();
}

// ─── Copy to clipboard helper ─────────────────────────────────────────────────

function useCopy() {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const copy = useCallback((text: string, id: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    });
  }, []);
  return { copiedId, copy };
}

// ─── Parse bulk BIN:QTY text ──────────────────────────────────────────────────

function parseBulkInput(raw: string): BulkEntry[] {
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      // Accept formats:
      //   547383          → qty defaults to 10
      //   547383 50       → bin + qty (space-separated)
      //   BIN: 547383     → with label prefix
      //   BIN: 547383, Qty: 50
      //   547383|50
      const clean = line.replace(/bin\s*[:=]?\s*/gi, "").replace(/qty\s*[:=]?\s*/gi, "|");
      const parts = clean.split(/[\s,|]+/).filter(Boolean);
      const bin = (parts[0] ?? "").replace(/\D/g, "").slice(0, 6);
      const qty = Math.max(1, Math.min(500, parseInt(parts[1] ?? "10", 10) || 10));
      return { bin, qty };
    })
    .filter((e) => e.bin.length === 6);
}

// ─── Component ────────────────────────────────────────────────────────────────

export function BinGenerator() {
  // ── Single BIN state ────────────────────────────────────────
  const [bin, setBin] = useState("");
  const [qty, setQty] = useState(10);
  const [priceUsd, setPriceUsd] = useState("");
  const [limitUsd, setLimitUsd] = useState("");
  const [isValid, setIsValid] = useState(false);

  const [binStatus, setBinStatus] = useState<BinStatus>("idle");
  const [binInfo, setBinInfo] = useState<BinInfo | null>(null);
  const lastBin = useRef("");

  // ── Generated cards state ───────────────────────────────────
  const [cards, setCards] = useState<GeneratedCard[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<Partial<GeneratedCard>>({});

  // ── Submit state ────────────────────────────────────────────
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  // ── Bulk BIN input state ────────────────────────────────────
  const [bulkText, setBulkText] = useState("");
  const [bulkPrice, setBulkPrice] = useState("");
  const [bulkLimit, setBulkLimit] = useState("");
  const [bulkIsValid, setBulkIsValid] = useState(false);
  const [bulkSubmitting, setBulkSubmitting] = useState(false);
  const [bulkMsg, setBulkMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [bulkGenerating, setBulkGenerating] = useState(false);

  // ── Copy state ──────────────────────────────────────────────
  const { copiedId, copy } = useCopy();

  // ── BIN resolver — fully offline, instant, always returns a result ──
  const triggerLookup = useCallback((b: string) => {
    if (b.length < 6) {
      setBinStatus("idle");
      setBinInfo(null);
      return;
    }
    if (b.length === 6) {
      if (lastBin.current === b) return;
      lastBin.current = b;
      const info = resolveBin(b);
      setBinInfo(info);
      setBinStatus("ok");
    }
  }, []);

  const handleBinChange = (e: ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.replace(/\D/g, "").slice(0, 6);
    setBin(v);
    setCards([]);
    setMsg(null);
    triggerLookup(v);
  };

  // ── Generate cards from single BIN ─────────────────────────
  const handleGenerate = useCallback(() => {
    if (bin.length !== 6) { setMsg({ type: "err", text: "Enter a valid 6-digit BIN." }); return; }
    if (!priceUsd) { setMsg({ type: "err", text: "Price per card is required." }); return; }
    // Always resolve offline — never fails
    const resolved = binInfo ?? resolveBin(bin);
    const provider = schemeToProvider(resolved.scheme || resolved.brand);
    const country = resolved.country || "US";
    const countryFlag = COUNTRY_FLAGS[country] || "🌐";
    const batch = generateBatch(bin, { provider, type: resolved.type || "DEBIT", bank: resolved.bank, country, countryFlag }, qty, { priceUsd, limitUsd, isValid });
    setCards(batch);
    setMsg(null);
  }, [bin, binInfo, qty, priceUsd, limitUsd, isValid]);

  // ── Card row operations ─────────────────────────────────────
  const updateCard = (id: string, key: keyof GeneratedCard, val: string | boolean) =>
    setCards((prev) => prev.map((c) => (c.id === id ? { ...c, [key]: val } : c)));

  const removeCard = (id: string) => setCards((prev) => prev.filter((c) => c.id !== id));

  const regenCard = (id: string) => {
    setCards((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const addr = generateAddress(c.country);
        return { ...c, cardNumber: generateCardNumber(c.bin, c.provider), cvv: generateCvv(c.provider), expiry: generateExpiry(), fullName: generateName(), ...addr };
      }),
    );
  };

  const toggleStatus = (id: string) =>
    setCards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: c.status === "in_stock" ? "sold_out" : "in_stock" } : c)),
    );

  // ── Edit overlay handlers ───────────────────────────────────
  const openEdit = (c: GeneratedCard) => { setEditingId(c.id); setEditDraft({ ...c }); };
  const closeEdit = () => { setEditingId(null); setEditDraft({}); };
  const saveEdit = () => {
    if (!editingId) return;
    setCards((prev) => prev.map((c) => (c.id === editingId ? { ...c, ...editDraft } : c)));
    closeEdit();
  };

  // ── Submit all cards to inventory ───────────────────────────
  const handleSubmit = async () => {
    if (cards.length === 0) { setMsg({ type: "err", text: "No cards to submit." }); return; }
    if (!priceUsd) { setMsg({ type: "err", text: "Price is required." }); return; }
    setSubmitting(true); setMsg(null);
    // Field order MUST match parseBulkCardLine (13-field branch) in bulk-cards.server.ts:
    // card_number | expiry | cvv | fullName | bank | country | state | city | zip | street | limit | price | type
    const lines = cards.map((c) => {
      const line = [
        c.cardNumber,
        c.expiry,
        c.cvv,
        c.fullName,
        c.bank,
        c.country,
        c.state,
        c.city,
        c.zip,
        c.street || "",      // position 9  → street
        c.limitUsd || "0",   // position 10 → limit
        c.priceUsd,          // position 11 → price
        c.type,              // position 12 → type
      ].join("|");
      console.log("[BIN submit] line:", line);
      return line;
    }).join("\n");
    try {
      const res = await fetch("/api/admin", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "bulk_import_products", text: lines, isValid }),
      });
      const data = await res.json();
      console.log("[BIN submit] response:", data);
      if (!res.ok) { setMsg({ type: "err", text: data.error ?? "Submit failed." }); return; }
      const created = data.created ?? 0;
      const errs = data.errors?.length ?? 0;
      setMsg({ type: "ok", text: `✓ ${created} card(s) added to inventory.${errs ? ` ${errs} skipped.` : ""}` });
      if (errs > 0) console.warn("[BIN submit] skipped errors:", data.errors);
      setCards([]);
    } catch (e) {
      console.error("[BIN submit] network error:", e);
      setMsg({ type: "err", text: "Network error." });
    } finally {
      setSubmitting(false);
    }
  };

  // ── Bulk BIN generate + submit ──────────────────────────────
  const handleBulkGenerate = useCallback(() => {
    const entries = parseBulkInput(bulkText);
    if (entries.length === 0) { setBulkMsg({ type: "err", text: "No valid BINs found. Format: BIN (space) Qty per line." }); return; }
    if (!bulkPrice) { setBulkMsg({ type: "err", text: "Price per card is required." }); return; }
    setBulkGenerating(true); setBulkMsg(null);

    const allCards: GeneratedCard[] = [];
    for (const { bin: b, qty: q } of entries) {
      // Use offline resolver — always returns clean structured data
      const resolved = resolveBin(b);
      const provider = schemeToProvider(resolved.scheme || resolved.brand);
      const country = resolved.country || "US";
      const countryFlag = COUNTRY_FLAGS[country] || "🌐";
      const batch = generateBatch(b, { provider, type: resolved.type || "DEBIT", bank: resolved.bank, country, countryFlag }, q,
        { priceUsd: bulkPrice, limitUsd: bulkLimit, isValid: bulkIsValid });
      allCards.push(...batch);
    }

    setCards((prev) => [...prev, ...allCards]);
    setBulkMsg({ type: "ok", text: `✓ ${allCards.length} card record${allCards.length !== 1 ? "s" : ""} generated from ${entries.length} BIN${entries.length !== 1 ? "s" : ""}. Review below and submit.` });
    setBulkGenerating(false);
  }, [bulkText, bulkPrice, bulkLimit, bulkIsValid]);

  const handleBulkSubmit = async () => {
    if (cards.length === 0) { setBulkMsg({ type: "err", text: "No cards to submit." }); return; }
    setBulkSubmitting(true); setBulkMsg(null);
    // Field order MUST match parseBulkCardLine (13-field branch) in bulk-cards.server.ts:
    // card_number | expiry | cvv | fullName | bank | country | state | city | zip | street | limit | price | type
    const lines = cards.map((c) => {
      const line = [
        c.cardNumber,
        c.expiry,
        c.cvv,
        c.fullName,
        c.bank,
        c.country,
        c.state,
        c.city,
        c.zip,
        c.street || "",      // position 9  → street
        c.limitUsd || "0",   // position 10 → limit
        c.priceUsd,          // position 11 → price
        c.type,              // position 12 → type
      ].join("|");
      console.log("[BIN bulk submit] line:", line);
      return line;
    }).join("\n");
    try {
      const res = await fetch("/api/admin", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "bulk_import_products", text: lines, isValid: bulkIsValid }),
      });
      const data = await res.json();
      console.log("[BIN bulk submit] response:", data);
      if (!res.ok) { setBulkMsg({ type: "err", text: data.error ?? "Submit failed." }); return; }
      const created = data.created ?? 0;
      const errs = data.errors?.length ?? 0;
      setBulkMsg({ type: "ok", text: `✓ ${created} cards added to inventory.${errs ? ` ${errs} skipped.` : ""}` });
      if (errs > 0) console.warn("[BIN bulk submit] skipped errors:", data.errors);
      setCards([]);
      setBulkText("");
    } catch (e) {
      console.error("[BIN bulk submit] network error:", e);
      setBulkMsg({ type: "err", text: "Network error." });
    } finally {
      setBulkSubmitting(false);
    }
  };

  // ── Totals ──────────────────────────────────────────────────
  const inStockCount = cards.filter((c) => c.status === "in_stock").length;
  const soldCount = cards.filter((c) => c.status === "sold_out").length;

  // ── BinInfoCard — always shows clean resolved data, never an error state ──
  const renderBinInfoCard = () => {
    if (!binInfo || binStatus !== "ok") return null;
    const provider = schemeToProvider(binInfo.scheme || binInfo.brand);
    return (
      <div className={styles.binInfoCard}>
        <div className={styles.binProviderLogo}>{PROVIDER_ICON[provider] ?? "💳"}</div>
        <div className={styles.binDetails}>
          <div className={styles.binScheme}>{provider}</div>
          <div className={styles.binMeta}>
            <span className={`${styles.binMetaChip} ${styles.typeChip}`}>{binInfo.type}</span>
            <span className={styles.binMetaChip}>{binInfo.bank}</span>
            <span className={styles.binMetaChip}>{COUNTRY_FLAGS[binInfo.country] ?? "🌐"} {binInfo.countryName}</span>
          </div>
        </div>
        <CheckCircle size={16} style={{ color: "#4ade80", flexShrink: 0 }} />
      </div>
    );
  };

  return (
    <div className={styles.wrap}>
      {/* ── Hero header ────────────────────────────────────────────────────── */}
      <div className={styles.hero}>
        <div className={styles.heroIcon}>
          <CreditCard size={26} />
        </div>
        <div className={styles.heroText}>
          <h2>Smart BIN Card Generator</h2>
          <p>
            Generate structured card records using BIN input, including card number, expiry, CVV, and associated details.
          </p>
        </div>
      </div>

      {/* ── Single BIN Generator ───────────────────────────────────────────── */}
      <div className={styles.panel}>
        <div className={styles.panelTitle}>
          <Wand2 size={15} />
          BIN Autofill Generator
          <span className={styles.titleBadge}>Single BIN</span>
        </div>
        <div className={styles.panelSubtitle}>
          Enter a 6-digit BIN — provider, bank, country, and card type are resolved automatically. Set quantity and price, then generate.
        </div>

        <div className={styles.controls}>
          {/* BIN input */}
          <div className={styles.fieldGroup}>
            <label className={styles.label}>BIN (6 digits) *</label>
            <input
              id="bin-generator-bin-input"
              className={styles.input}
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="e.g. 547383"
              value={bin}
              onChange={handleBinChange}
            />
            {binStatus === "ok" && (
              <span className={`${styles.binStatus} ${styles.binStatusOk}`}>
                <CheckCircle size={10} /> Resolved
              </span>
            )}
          </div>

          {/* Quantity */}
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Quantity</label>
            <div className={styles.qtyGroup}>
              {[10, 25, 50, 100].map((n) => (
                <button
                  key={n}
                  type="button"
                  id={`qty-btn-${n}`}
                  className={`${styles.qtyBtn} ${qty === n ? styles.qtyBtnActive : ""}`}
                  onClick={() => setQty(n)}
                >
                  {n}
                </button>
              ))}
              <input
                className={`${styles.input} ${styles.qtyCustom}`}
                type="number"
                min={1}
                max={500}
                value={qty}
                onChange={(e) => setQty(Math.max(1, Math.min(500, parseInt(e.target.value) || 1)))}
                title="Custom quantity (1–500)"
              />
            </div>
          </div>

          {/* Price */}
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Price (USD) *</label>
            <input
              className={styles.input}
              type="number"
              min="0.01"
              step="0.01"
              placeholder="36.00"
              value={priceUsd}
              onChange={(e) => setPriceUsd(e.target.value)}
            />
          </div>

          {/* Limit */}
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Limit (USD)</label>
            <input
              className={styles.input}
              type="number"
              min="0"
              placeholder="500"
              value={limitUsd}
              onChange={(e) => setLimitUsd(e.target.value)}
            />
          </div>
        </div>

        {/* BIN info display */}
        {renderBinInfoCard()}

        {/* Options row */}
        <div style={{ marginBottom: "1rem", display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
          <label className={styles.toggleLabel}>
            <input type="checkbox" checked={isValid} onChange={(e) => setIsValid(e.target.checked)} />
            Show in 100% Valid section
          </label>
        </div>

        {/* Action bar */}
        <div className={styles.actionBar}>
          <button
            id="bin-generate-btn"
            type="button"
            className={styles.genBtn}
            onClick={handleGenerate}
            disabled={bin.length !== 6 || !priceUsd}
          >
            <Wand2 size={14} />
            Generate {qty} Card{qty !== 1 ? "s" : ""}
          </button>

          {cards.length > 0 && (
            <>
              <button
                type="button"
                className={styles.submitBtn}
                onClick={handleSubmit}
                disabled={submitting}
              >
                <Plus size={13} />
                {submitting ? "Submitting…" : `Submit all ${cards.length} to Inventory`}
              </button>
              <button type="button" className={styles.clearBtn} onClick={() => { setCards([]); setMsg(null); }}>
                Clear all
              </button>
            </>
          )}
        </div>

        {msg && <div className={`${styles.msg} ${msg.type === "ok" ? styles.msgOk : styles.msgErr}`}>{msg.text}</div>}
      </div>

      {/* ── Bulk BIN Input ─────────────────────────────────────────────────── */}
      <div className={styles.panel}>
        <div className={styles.panelTitle}>
          <Layers size={15} />
          Bulk BIN Input
          <span className={styles.titleBadge}>Multi-BIN</span>
        </div>
        <div className={styles.panelSubtitle}>
          Paste multiple BINs with quantities. Each BIN generates independent cards. Supported formats:
          {" "}<code style={{ fontSize: "0.68rem", background: "rgba(99,102,241,0.1)", borderRadius: 4, padding: "1px 5px" }}>
            547383 50
          </code>{" "}or{" "}
          <code style={{ fontSize: "0.68rem", background: "rgba(99,102,241,0.1)", borderRadius: 4, padding: "1px 5px" }}>
            BIN: 547383, Qty: 50
          </code>
        </div>

        <textarea
          className={styles.bulkArea}
          rows={5}
          value={bulkText}
          onChange={(e) => { setBulkText(e.target.value); setBulkMsg(null); }}
          placeholder={"547383 50\n423456 25\nBIN: 411111, Qty: 100\n535120 10"}
        />

        {/* Parsed preview */}
        {bulkText.trim() && (
          <div className={styles.bulkParsed}>
            {parseBulkInput(bulkText).map((e, i) => (
              <span key={i} className={styles.bulkLine}>
                {PROVIDER_ICON[resolveBinProvider(e.bin)] ?? "💳"} {e.bin}
                {" → "}
                <span className={styles.bulkLineQty}>{e.qty} cards</span>
              </span>
            ))}
          </div>
        )}

        <div style={{ marginTop: "0.9rem", display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center" }}>
          <div className={styles.fieldGroup} style={{ flex: "0 0 120px" }}>
            <label className={styles.label}>Price (USD) *</label>
            <input
              className={styles.input}
              type="number"
              min="0.01"
              step="0.01"
              placeholder="36.00"
              value={bulkPrice}
              onChange={(e) => setBulkPrice(e.target.value)}
            />
          </div>
          <div className={styles.fieldGroup} style={{ flex: "0 0 120px" }}>
            <label className={styles.label}>Limit (USD)</label>
            <input
              className={styles.input}
              type="number"
              min="0"
              placeholder="500"
              value={bulkLimit}
              onChange={(e) => setBulkLimit(e.target.value)}
            />
          </div>
          <label className={styles.toggleLabel} style={{ marginTop: "1.1rem" }}>
            <input type="checkbox" checked={bulkIsValid} onChange={(e) => setBulkIsValid(e.target.checked)} />
            100% Valid section
          </label>
          <button
            type="button"
            className={styles.genBtn}
            style={{ marginTop: "1.1rem" }}
            onClick={handleBulkGenerate}
            disabled={bulkGenerating || !bulkText.trim() || !bulkPrice}
          >
            {bulkGenerating ? <Loader2 size={13} className={styles.spinIcon} /> : <Wand2 size={13} />}
            {bulkGenerating ? "Generating…" : "Generate from BINs"}
          </button>
          {cards.length > 0 && (
            <button
              type="button"
              className={styles.submitBtn}
              style={{ marginTop: "1.1rem" }}
              onClick={handleBulkSubmit}
              disabled={bulkSubmitting}
            >
              <Plus size={13} />
              {bulkSubmitting ? "Submitting…" : `Submit ${cards.length} cards`}
            </button>
          )}
        </div>

        {bulkMsg && (
          <div className={`${styles.msg} ${bulkMsg.type === "ok" ? styles.msgOk : styles.msgErr}`} style={{ marginTop: "0.75rem" }}>
            {bulkMsg.text}
          </div>
        )}
      </div>

      {/* ── Generated Cards Preview ────────────────────────────────────────── */}
      {cards.length > 0 && (
        <div className={styles.panel}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem", flexWrap: "wrap", gap: "0.5rem" }}>
            <div className={styles.panelTitle}>
              <Package size={15} />
              Generated Cards
              <span className={styles.titleBadge}>{cards.length} total</span>
            </div>
            <button type="button" className={styles.clearBtn} onClick={() => { setCards([]); setMsg(null); setBulkMsg(null); }}>
              <X size={11} style={{ display: "inline", marginRight: 3 }} /> Clear All
            </button>
          </div>

          {/* Stats */}
          <div className={styles.statsBar}>
            <div className={styles.statItem}>
              <span className={styles.statValue}>{cards.length}</span>
              <span className={styles.statLabel}>Total Generated</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statValue} style={{ color: "#4ade80" }}>{inStockCount}</span>
              <span className={styles.statLabel}>In Stock</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statValue} style={{ color: "#f87171" }}>{soldCount}</span>
              <span className={styles.statLabel}>Marked Sold</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statValue} style={{ color: "#fbbf24" }}>{[...new Set(cards.map((c) => c.bin))].length}</span>
              <span className={styles.statLabel}>Unique BINs</span>
            </div>
          </div>

          {/* Card grid */}
          <div className={styles.cardsGrid}>
            {cards.map((c, idx) => (
              <div key={c.id} className={styles.cardPreview}>
                <div className={styles.cardCircles} />

                {/* Edit overlay */}
                {editingId === c.id && (
                  <div className={styles.editOverlay}>
                    <div className={styles.editTitle}>Edit Card #{idx + 1}</div>
                    <div className={styles.editGrid}>
                      <div>
                        <div className={styles.editFieldLabel}>Card Number</div>
                        <input
                          className={styles.editInput}
                          value={String(editDraft.cardNumber ?? c.cardNumber)}
                          maxLength={19}
                          onChange={(e) => setEditDraft((d) => ({ ...d, cardNumber: e.target.value.replace(/\D/g, "") }))}
                        />
                      </div>
                      <div>
                        <div className={styles.editFieldLabel}>CVV</div>
                        <input
                          className={styles.editInput}
                          value={String(editDraft.cvv ?? c.cvv)}
                          maxLength={4}
                          onChange={(e) => setEditDraft((d) => ({ ...d, cvv: e.target.value.replace(/\D/g, "") }))}
                        />
                      </div>
                      <div>
                        <div className={styles.editFieldLabel}>Expiry (MM/YY)</div>
                        <input
                          className={styles.editInput}
                          value={String(editDraft.expiry ?? c.expiry)}
                          maxLength={5}
                          placeholder="MM/YY"
                          onChange={(e) => setEditDraft((d) => ({ ...d, expiry: e.target.value }))}
                        />
                      </div>
                      <div>
                        <div className={styles.editFieldLabel}>Price (USD)</div>
                        <input
                          className={styles.editInput}
                          type="number"
                          value={String(editDraft.priceUsd ?? c.priceUsd)}
                          onChange={(e) => setEditDraft((d) => ({ ...d, priceUsd: e.target.value }))}
                        />
                      </div>
                      <div style={{ gridColumn: "1 / -1" }}>
                        <div className={styles.editFieldLabel}>Cardholder Name</div>
                        <input
                          className={styles.editInput}
                          value={String(editDraft.fullName ?? c.fullName)}
                          onChange={(e) => setEditDraft((d) => ({ ...d, fullName: e.target.value.toUpperCase() }))}
                        />
                      </div>
                      <div>
                        <div className={styles.editFieldLabel}>Street</div>
                        <input
                          className={styles.editInput}
                          value={String(editDraft.street ?? c.street)}
                          onChange={(e) => setEditDraft((d) => ({ ...d, street: e.target.value }))}
                        />
                      </div>
                      <div>
                        <div className={styles.editFieldLabel}>City</div>
                        <input
                          className={styles.editInput}
                          value={String(editDraft.city ?? c.city)}
                          onChange={(e) => setEditDraft((d) => ({ ...d, city: e.target.value }))}
                        />
                      </div>
                      <div>
                        <div className={styles.editFieldLabel}>State</div>
                        <input
                          className={styles.editInput}
                          value={String(editDraft.state ?? c.state)}
                          onChange={(e) => setEditDraft((d) => ({ ...d, state: e.target.value }))}
                        />
                      </div>
                      <div>
                        <div className={styles.editFieldLabel}>ZIP</div>
                        <input
                          className={styles.editInput}
                          value={String(editDraft.zip ?? c.zip)}
                          onChange={(e) => setEditDraft((d) => ({ ...d, zip: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "0.4rem", marginTop: "0.25rem" }}>
                      <button className={styles.editDoneBtn} style={{ flex: 1 }} onClick={saveEdit}>Save</button>
                      <button className={styles.editDoneBtn} style={{ flex: 1, background: "rgba(239,68,68,0.1)", borderColor: "rgba(239,68,68,0.25)", color: "#f87171" }} onClick={closeEdit}>Cancel</button>
                    </div>
                  </div>
                )}

                {/* Card top row */}
                <div className={styles.cardTopRow}>
                  <span className={styles.cardIndex}>#{idx + 1} · BIN {c.bin}</span>
                  <div className={styles.cardProviderLogo}>
                    <span className={styles.providerIcon}>{PROVIDER_ICON[c.provider] ?? "💳"}</span>
                    {c.provider}
                  </div>
                </div>

                {/* Card number */}
                <div className={styles.cardNumber}>{formatCardNumber(c.cardNumber)}</div>

                {/* Mid row: expiry + CVV + bank */}
                <div className={styles.cardMidRow}>
                  <div className={styles.cardField}>
                    <div className={styles.cardFieldLabel}>Expires</div>
                    <div className={styles.cardFieldValue}>{c.expiry}</div>
                  </div>
                  <div className={styles.cardField}>
                    <div className={styles.cardFieldLabel}>CVV</div>
                    <div className={styles.cardFieldValue}>{c.cvv}</div>
                  </div>
                  <div className={styles.cardField}>
                    <div className={styles.cardFieldLabel}>Type</div>
                    <div className={styles.cardFieldValue} style={{ fontSize: "0.7rem" }}>{c.type}</div>
                  </div>
                  {c.bank && (
                    <div className={styles.cardField}>
                      <div className={styles.cardFieldLabel}>Bank</div>
                      <div className={styles.cardFieldValue} style={{ fontSize: "0.65rem", maxWidth: 90, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.bank}</div>
                    </div>
                  )}
                </div>

                {/* Cardholder name */}
                <div className={styles.cardName}>{c.fullName}</div>

                {/* Address */}
                <div className={styles.cardAddress}>
                  {c.street} · {c.city}{c.state ? `, ${c.state}` : ""} {c.zip}
                  <br />
                  {c.countryFlag} {c.country}
                </div>

                {/* Status + actions row */}
                <div className={styles.cardStatusRow}>
                  <button
                    type="button"
                    className={`${styles.cardStatusBadge} ${c.status === "in_stock" ? styles.badgeInStock : styles.badgeSold}`}
                    onClick={() => toggleStatus(c.id)}
                    title="Click to toggle In Stock / Sold Out"
                    style={{ cursor: "pointer", border: "none", fontFamily: "inherit" }}
                  >
                    {c.status === "in_stock" ? "✓ In Stock" : "✗ Sold Out"}
                  </button>

                  <div className={styles.cardActions}>
                    {/* Copy card data */}
                    <button
                      type="button"
                      className={`${styles.iconBtn} ${styles.iconBtnBlue}`}
                      title="Copy card data"
                      onClick={() =>
                        copy(
                          `${c.cardNumber}|${c.expiry}|${c.cvv}|${c.fullName}|${c.bank}|${c.country}|${c.state}|${c.city}|${c.zip}`,
                          c.id,
                        )
                      }
                    >
                      {copiedId === c.id ? <Check size={11} /> : <Copy size={11} />}
                    </button>

                    {/* Edit */}
                    <button
                      type="button"
                      className={`${styles.iconBtn} ${styles.iconBtnPurple}`}
                      title="Edit card"
                      onClick={() => openEdit(c)}
                    >
                      <Edit3 size={11} />
                    </button>

                    {/* Regenerate */}
                    <button
                      type="button"
                      className={`${styles.iconBtn}`}
                      title="Regenerate this card"
                      onClick={() => regenCard(c.id)}
                    >
                      <RefreshCw size={11} />
                    </button>

                    {/* Delete */}
                    <button
                      type="button"
                      className={`${styles.iconBtn} ${styles.iconBtnRed}`}
                      title="Remove card"
                      onClick={() => removeCard(c.id)}
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom submit bar */}
          <div style={{ marginTop: "1.25rem", display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "1rem" }}>
            <button
              type="button"
              className={styles.submitBtn}
              onClick={priceUsd ? handleSubmit : handleBulkSubmit}
              disabled={submitting || bulkSubmitting}
            >
              <Plus size={14} />
              {(submitting || bulkSubmitting) ? "Submitting…" : `Submit all ${cards.length} cards to Inventory`}
            </button>
            <button type="button" className={styles.clearBtn} onClick={() => { setCards([]); setMsg(null); setBulkMsg(null); }}>
              Clear all
            </button>
            <span style={{ fontSize: "0.68rem", color: "#555", marginLeft: "auto" }}>
              {inStockCount} in stock · {soldCount} sold — generated using BIN logic
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
