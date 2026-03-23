import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn("Missing STRIPE_SECRET_KEY environment variable. Stripe checkout will fail.");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-06-20", // The latest API version required by the Stripe TS definitions
  appInfo: {
    name: "Pro Construction Calc",
    version: "1.0.0",
  },
});
