# 05 PWA Management

Use this guide when you want to make sure a phone or tablet is running the latest version of the app in the field without losing the installed PWA experience.

## Goal

Make the device pick up the newest release without guessing whether it is stuck on older cached assets.

## Important first note

### Action

Treat the current app as an installable PWA with an update-aware service worker.

### Context

The app now keeps a proper service worker registered for faster repeat loads, install support, and offline fallback. If a device has been sitting on an old tab or old install for a long time, reopening while online is still the fastest way to let the newest release take over.

### Verification

If the device has been idle for a while, fully close it and reopen it with a live internet connection before the crew relies on it.

## Step 1: Force a fresh open

### Action

Close the app or browser tab completely, then reopen the installed app or live site while connected to the internet.

### Context

This gives the app a chance to load the current release and let the service worker refresh cached files cleanly.

### Verification

Confirm the app reloads normally and that the newest visible content or workflow changes are present.

## Step 2: Check for stale install behavior

### Action

If the device is using a home-screen install and the screen looks old or broken, first reopen it while online. If it still looks stale, remove the install and open the live site in the browser once before reinstalling.

### Context

This is the fastest recovery path when a field device feels stuck on yesterday's version or a partially cached release.

### Verification

After reopening, compare the screen to a second device or a desktop browser. Both should show the same current UI.

## Step 3: Reinstall only after the live version looks correct

### Action

Use the install prompt or browser install option only after you confirm the live browser session looks current.

### Context

Installing from a stale browser session just carries old confusion back onto the device.

### Verification

Once reinstalled, reopen from the icon and confirm the same current version still appears.

## Step 4: Use a simple field check

### Action

Before a crew relies on the app for the day, quickly verify one live workflow:

- Open a calculator
- Open `Saved Estimates`
- Open the `User Guide` or `Field Notes`

### Context

If those routes open cleanly, the device is usually safe for normal field use.

### Verification

The app should load without obvious missing styles, blank panels, or old copy that was already removed from the current release.

## Step 5: Know what this guide does and does not promise

### Action

Use this guide to confirm the latest release, not to guarantee every route will behave the same offline as it does with a strong connection.

### Context

The current setup supports installability and offline fallback, but it is still designed around a live connected workflow for estimates, account actions, and other server-backed features.

### Verification

If the team needs dependable offline behavior instead of latest-version behavior, treat that as a separate product decision and not a device mistake.

## PWA check done when

You are done when all of the following are true:

- The device reopened the installed app or live site while online
- Old stale install behavior was cleared if needed
- The current version matches another fresh session
- A real route opens successfully on the device
