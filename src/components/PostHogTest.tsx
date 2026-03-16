 "use client";

import { useState } from "react";
import { usePostHog } from "posthog-js/react";
import { captureServerPostHogTest } from "@/app/actions/posthog-test";

interface PostHogTestProps {
  onEventCaptured?: (eventName: string) => void;
}

export const PostHogTest = ({ onEventCaptured }: PostHogTestProps) => {
  const posthog = usePostHog();
  const [testEventSent, setTestEventSent] = useState(false);
  const [testEventStatus, setTestEventStatus] = useState("");
  const [serverTestStatus, setServerTestStatus] = useState<string | null>(null);

  const captureServerTest = async () => {
    setServerTestStatus("Sending…");
    const result = await captureServerPostHogTest();
    setServerTestStatus(result.ok ? result.message : result.message);
  };

  const captureTestEvent = () => {
    if (!posthog) {
      setTestEventStatus("PostHog not initialized");
      return;
    }

    const eventName = "test_event";
    const eventProperties = {
      test_property: "test_value",
      timestamp: new Date().toISOString(),
      page: window.location.pathname,
    };

    try {
      posthog.capture(eventName, eventProperties);
      setTestEventSent(true);
      setTestEventStatus("Event captured successfully");

      if (onEventCaptured) {
        onEventCaptured(eventName);
      }
    } catch (error) {
      setTestEventStatus(`Error capturing event: ${error}`);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h3 className="text-lg font-semibold mb-2">PostHog Test Component</h3>

      {!testEventSent ? (
        <div>
          <p className="text-sm text-gray-600 mb-2">
            Click the button below to capture a test event with PostHog.
          </p>
          <button
            onClick={captureTestEvent}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            Capture Test Event
          </button>
        </div>
      ) : (
        <div className="text-green-600">
          <p className="mb-2">{testEventStatus}</p>
          <div className="text-sm text-gray-500">
            Event: test_event
            <br />
            Properties: {JSON.stringify({ test_property: "test_value" })}
          </div>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-sm font-medium text-gray-700 mb-2">Server-side (posthog-node)</p>
        <button
          type="button"
          onClick={captureServerTest}
          className="bg-slate-600 text-white px-4 py-2 rounded hover:bg-slate-700 transition-colors text-sm"
        >
          Capture server-side test event
        </button>
        {serverTestStatus && (
          <p className={`mt-2 text-sm ${serverTestStatus.startsWith("Server-side") ? "text-green-600" : "text-amber-600"}`}>
            {serverTestStatus}
          </p>
        )}
      </div>
    </div>
  );
};

export default PostHogTest;
