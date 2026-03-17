# 04 Troubleshooting Proxy

Use this guide when you need to confirm that PostHog is actually receiving app activity through the ingest proxy.

## Goal

Verify that contractor activity is reaching analytics through `/ingest` and that you are testing from the right part of the app.

## Important first note

### Action

Do not test this from the homepage alone.

### Context

PostHog is intentionally not initialized on the homepage. That means a homepage-only test can look broken even when analytics is working correctly everywhere else.

### Verification

Start your check from a live app route such as:

- `Calculators`
- `Command Center`
- `Saved Estimates`
- `Field Notes`

## Step 1: Open a trackable route

### Action

Open the app on a non-homepage route and keep browser developer tools open on the `Network` tab.

### Context

You need to see the network request in real time. This is the fastest truth source for whether the ingest proxy is alive.

### Verification

Filter the network view for `ingest` and confirm requests begin appearing after the page loads.

## Step 2: Confirm the proxy path

### Action

Look for requests sent to `/ingest`.

### Context

The app is configured to use the ingest proxy path by default instead of sending browser traffic straight to a PostHog domain.

### Verification

If you see `/ingest` requests completing successfully, the proxy path is alive.

## Step 3: Trigger a pageview

### Action

Move between a few non-homepage screens.

### Context

The client captures `$pageview` events from route changes after PostHog initializes.

### Verification

You should see fresh `/ingest` traffic when you move between routes. If you have access to PostHog itself, confirm the `$pageview` event appears there too.

## Step 4: Trigger contractor actions

### Action

Perform one or more real actions:

- Run a calculator to trigger `calculator_calculated`
- Save an estimate to trigger `estimate_saved`
- Generate a PDF to trigger `pdf_generated`

### Context

These are better validation events than passive page loads because they prove real contractor workflows are being captured.

### Verification

For each action, confirm you see a matching burst of `/ingest` traffic. If you also have PostHog access, confirm the event names appear in the event stream.

## Step 5: Decide whether the problem is real

### Action

Use this quick rule:

- No `/ingest` traffic on non-homepage routes: likely a real analytics issue
- `/ingest` traffic exists but homepage shows nothing: expected behavior
- `$pageview` works but save/PDF events do not: likely workflow-specific tracking issue

### Context

This helps you avoid chasing a false alarm caused by testing from the wrong page.

### Verification

Write down which route you tested, which action you performed, and which event you expected. That gives you a clean handoff if a developer needs to investigate.

## Proxy check done when

You are done when all of the following are true:

- You tested from a non-homepage route
- `/ingest` requests appeared in the browser network log
- At least one real workflow event was triggered
- You can clearly tell whether the issue is homepage-only, workflow-specific, or a true proxy failure
