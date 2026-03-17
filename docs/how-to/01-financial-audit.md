# 01 Financial Audit

Use this guide when you want to confirm that the platform math is still cents-perfect and that county tax handling matches the job.

## Goal

Verify three things before you trust a live number:

1. The estimate total matches the saved record.
2. The saved record matches the PDF.
3. The county tax logic matches the project county and tax category.

## Step 1: Open the estimate you want to audit

### Action

Open the app, go to `Saved Estimates`, and open the job you want to review.

### Context

This is the cleanest place to audit because the saved record is what feeds the dashboard, the estimate detail page, and the PDF export workflow.

### Verification

Confirm you can see the estimate title, client name, job total, and current status on the saved job screen before moving on.

## Step 2: Check the live dashboard totals

### Action

Stay in the saved estimate area and review the financial dashboard cards:

- `Billed`
- `Unbilled`
- `Portfolio Margin`
- `Cost Variance Alerts`
- `Live Project Profit Margins`

### Context

The dashboard refreshes automatically every 15 seconds and shows a `Last sync` time. That makes it the fastest place to catch a mismatch between job records and the portfolio view.

### Verification

Wait for the sync time to refresh, then confirm the dashboard totals look reasonable against the estimate you just opened. If a large invoice was added or edited, you should see the billed and unbilled picture make sense after the refresh.

## Step 3: Confirm the estimate math is cents-perfect

### Action

On the estimate detail page, compare:

- Contract total
- Billed to date
- Remaining balance
- Any progress invoice amounts

Then download the estimate PDF and compare the PDF totals to the same numbers on screen.

### Context

The safest audit is not “does it look close?” It is “does every total match exactly down to the cent across screen and PDF?”

### Verification

The numbers should match exactly. If the app shows `$12,487.43`, the PDF should also show `$12,487.43`. No rounding drift is acceptable in this check.

## Step 4: Confirm the county tax choice

### Action

Open the `Tax Save` workflow or the `Financial Terms` page and verify the county default for the job:

- Oneida County: `8.75%`
- Madison County: `8.00%`
- Herkimer County: `8.25%`

### Context

Those are the live tri-county defaults currently wired into the app. Repairs and maintenance use the county rate. Capital improvement work should use the ST-124 path instead of charging sales tax to the customer.

### Verification

Make sure the county on the estimate matches the county for the real job site. Then confirm the tax category is also correct:

- `Repair / maintenance` means county sales tax applies.
- `Capital improvement` means ST-124 should be retained and customer sales tax should not be charged.

## Step 5: Check invoice math against the contract

### Action

If the estimate has progress billing, review every invoice row:

- Invoice number
- Amount
- Status
- Total billed
- Remaining balance

Download one invoice PDF if you need a final handoff check.

### Context

The invoice side is where owners usually catch duplicated billing, underbilling, or a remaining balance that no longer matches the contract.

### Verification

Use this quick formula:

`Contract total - total billed = remaining balance`

If that formula does not hold exactly, stop and review the invoice rows before sending anything out.

## Audit done when

You are done when all of the following are true:

- The saved estimate, dashboard, and PDF all match to the cent.
- The county rate matches the real job county.
- The ST-124 setting matches the real tax category.
- The remaining balance matches the invoice history exactly.
