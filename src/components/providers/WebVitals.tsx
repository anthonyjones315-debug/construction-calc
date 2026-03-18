"use client";

import { useReportWebVitals } from "next/web-vitals";
import posthog from "posthog-js";
import * as Sentry from "@sentry/nextjs";

export function WebVitals() {
  useReportWebVitals((metric) => {
    if (metric.name === "LCP") {
      posthog.capture("web_vital_lcp", {
        value: metric.value,
        id: metric.id,
        rating: metric.rating,
        navigation_type: metric.navigationType,
      });

      Sentry.setMeasurement("lcp", metric.value, "millisecond");
      if (metric.rating === "poor") {
        Sentry.captureMessage("LCP threshold exceeded", {
          level: "warning",
          tags: { web_vital: "LCP" },
          extra: {
            id: metric.id,
            value: metric.value,
            rating: metric.rating,
            navigationType: metric.navigationType,
          },
        });
      }
    }
  });

  return null;
}
