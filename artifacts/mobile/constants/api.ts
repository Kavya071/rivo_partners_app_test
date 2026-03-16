export const API_BASE_URL =
  "https://rivo-partners-backend-331738587654.asia-southeast1.run.app/api/v1";

export const COUNTRY_CODES = [
  { code: "+971", country: "UAE", flag: "🇦🇪", digits: 9 },
  { code: "+91", country: "India", flag: "🇮🇳", digits: 10 },
  { code: "+44", country: "UK", flag: "🇬🇧", digits: 10 },
  { code: "+1", country: "US", flag: "🇺🇸", digits: 10 },
  { code: "+966", country: "Saudi", flag: "🇸🇦", digits: 9 },
  { code: "+968", country: "Oman", flag: "🇴🇲", digits: 8 },
  { code: "+974", country: "Qatar", flag: "🇶🇦", digits: 8 },
  { code: "+973", country: "Bahrain", flag: "🇧🇭", digits: 8 },
  { code: "+965", country: "Kuwait", flag: "🇰🇼", digits: 8 },
  { code: "+92", country: "Pakistan", flag: "🇵🇰", digits: 10 },
  { code: "+63", country: "Philippines", flag: "🇵🇭", digits: 10 },
] as const;

export const CLIENT_STATUSES = [
  "SUBMITTED",
  "CONTACTED",
  "QUALIFIED",
  "SUBMITTED_TO_BANK",
  "PREAPPROVED",
  "FOL_RECEIVED",
  "DISBURSED",
  "DECLINED",
] as const;

export type ClientStatus = (typeof CLIENT_STATUSES)[number];
