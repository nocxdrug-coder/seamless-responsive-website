export function getCardBrandImage(provider: string): string {
  switch ((provider || "").toLowerCase()) {
    case "visa":
      return "/assets/cards/visa.png";
    case "amex":
    case "american express":
      return "/assets/cards/amex.png";
    case "mastercard":
    case "master card":
    case "master":
      return "/assets/cards/mastercard.png";
    case "discover":
      return "/assets/cards/discover.png";
    default:
      return "/assets/cards/default.png";
  }
}
