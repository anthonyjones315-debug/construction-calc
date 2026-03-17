# 05 PWA Management

Use this guide when you want to make sure a phone or tablet is running the latest live version of the app in the field.

## Goal

Make the device load the newest version of the app without guessing whether it is stuck on stale cached files.

## Important first note

### Action

Treat the current app as a live-web experience first.

### Context

The app currently clears stale service workers on launch. That means the safest way to get the latest version is to reopen the live site instead of assuming an old home-screen install is still current.

### Verification

If the device has been sitting on an old open tab or old install for a long time, plan to fully close it and reopen the app fresh.

## Step 1: Force a fresh open

### Action

Close the app or browser tab completely, then reopen the live site while connected to the internet.

### Context

This gives the app a chance to load the current release and clear stale service-worker state.

### Verification

Confirm the app reloads normally and that the newest visible content or workflow changes are present.

## Step 2: Check for stale install behavior

### Action

If the device is using a home-screen install and the screen looks old or broken, remove the old install and open the live site again in the browser first.

### Context

This is the fastest recovery path when a field device feels stuck on yesterday’s version.

### Verification

After reopening, compare the screen to a second device or a desktop browser. Both should show the same current UI.

## Step 3: Reinstall only after the live version looks correct

### Action

Use the install prompt or browser install option only after you confirm the live browser session looks current.

### Context

Installing from a stale session just bakes the confusion back onto the device.

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

Use this guide to confirm the latest live version, not guaranteed offline persistence.

### Context

The current setup is optimized to avoid stale versions in the field. It is not the same as a fully persistent offline-first install strategy.

### Verification

If the team needs dependable offline behavior instead of latest-version behavior, treat that as a separate product decision and not a device mistake.

## PWA check done when

You are done when all of the following are true:

- The device reopened the live site while online
- Old stale install behavior was cleared if needed
- The current version matches another fresh session
- A real route opens successfully on the device
