# 02 Content Publishing

Use this guide when you want to update `Field Notes` or `Blog` content without damaging search visibility, internal linking, or Google Business Profile references.

## Goal

Publish useful content while keeping the app’s SEO identity stable:

- Keep the existing article slug if the article is already live.
- Keep links inside the Pro Construction Calc ecosystem when possible.
- Do not revive the retired `content/field-notes/` folder.

## Where content lives now

### Action

Use only these live content sources:

- `Field Notes`: `src/data/field-notes.ts`
- `Blog`: `src/data/blog.ts`

### Context

These are the active sources of truth. The older markdown field-notes folder was part of the retired structure and should stay retired.

### Verification

Before editing anything, confirm you are updating one of the two files above and not creating a new content folder somewhere else.

## Step 1: Decide whether the article belongs in Field Notes or Blog

### Action

Use this rule:

- `Field Notes` for field guidance, local rules, estimating decisions, tax context, and operator-useful construction guidance
- `Blog` for broader publishing, brand stories, updates, or longer marketing content

### Context

This keeps the practical contractor content grouped together and prevents the app from feeling split between two different voices.

### Verification

If the article helps a contractor do a job, price a job, or avoid a mistake, it usually belongs in `Field Notes`.

## Step 2: Update the article without changing the slug

### Action

When editing an article that already exists, update the title, description, body, or date as needed, but leave the `slug` alone.

### Context

The slug is the address search engines and shared links already know. Changing it creates avoidable SEO damage and can break existing references.

### Verification

Before saving, scan the article object and confirm the slug still matches the live URL.

## Step 3: Keep the identity aligned

### Action

When writing or editing content:

- Use `Pro Construction Calc` as the product name
- Use the tri-county framing where appropriate: `Oneida`, `Madison`, and `Herkimer`
- Keep Google Business Profile links exactly as they already appear if the article references them

### Context

This prevents old regional phrasing from drifting back into the app shell and protects the current business identity.

### Verification

Read the title, description, and first paragraph out loud. They should sound like the current brand, not the previous regional wording.

## Step 4: Protect on-page SEO basics

### Action

For every article, confirm it has:

- A clear title
- A short, human description
- A date
- A category
- A useful body
- At least one relevant internal link to a calculator, guide, glossary, or Field Note

### Context

This app is strongest when content leads the reader back into a useful workflow instead of sending them away.

### Verification

If the article reads well but does not point to a useful next step in the app, add one internal link before publishing.

## Step 5: Sanity-check the live experience

### Action

After the content update:

1. Open the Field Notes or Blog index.
2. Open the article itself.
3. Click the internal link inside the article.

### Context

This is the simplest way to catch a broken slug, missing route, or accidental copy error before anyone else sees it.

### Verification

The article should:

- Appear in the correct list
- Open on its own page
- Show the updated copy
- Link cleanly to the intended next step

## Publishing done when

You are done when all of the following are true:

- The article was updated in the active source file only.
- The slug stayed the same if the article already existed.
- The copy sounds current and tri-county aligned.
- The article opens correctly and links back into the app.
