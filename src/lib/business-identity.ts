export const BUSINESS_NAME = "Pro Construction Calc";
export const BUSINESS_SITE_URL = "https://proconstructioncalc.com";
export const GOOGLE_BUSINESS_PROFILE_ID = "13342773189926392325";
export const GOOGLE_BUSINESS_PROFILE_URL =
  `https://www.google.com/maps?cid=${GOOGLE_BUSINESS_PROFILE_ID}`;
export const BUSINESS_EMAIL =
  process.env.NEXT_PUBLIC_BUSINESS_EMAIL ??
  process.env.BUSINESS_EMAIL ??
  "contact@proconstructioncalc.com";
export const BUSINESS_PHONE_E164 =
  process.env.NEXT_PUBLIC_BUSINESS_PHONE_E164 ??
  process.env.BUSINESS_PHONE_E164 ??
  null;
export const BUSINESS_WHATSAPP_URL =
  process.env.NEXT_PUBLIC_BUSINESS_WHATSAPP_URL ??
  process.env.BUSINESS_WHATSAPP_URL ??
  null;
export const BUSINESS_CITY_STATE = "Rome, NY";
export const BUSINESS_REGION = "Tri-County New York";
export const BUSINESS_STATE = "NY";
export const BUSINESS_COUNTRY = "US";

export const BUSINESS_AREAS_SERVED = [
  { "@type": "AdministrativeArea", name: "Oneida County, NY" },
  { "@type": "AdministrativeArea", name: "Madison County, NY" },
  { "@type": "AdministrativeArea", name: "Herkimer County, NY" },
  { "@type": "AdministrativeArea", name: "Tri-County New York" },
] as const;
