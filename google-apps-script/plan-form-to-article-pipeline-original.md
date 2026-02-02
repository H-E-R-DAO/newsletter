---
name: Form-to-article pipeline step-by-step (event trigger, task sheet by ID)
overview: "Code runs from each form response sheet when a response is submitted (on form submit). Workflow: create article Doc, then call the task tracker by ID to add the task. Same codebase is deployed to each form response sheet so any form can trigger the same workflow."
---

# Form-to-article pipeline (step-by-step, event trigger + task sheet by ID)

**Event-driven: code runs in the response sheet on form submit; task tracker is written to by ID.**

When someone submits a form, the script runs **inside that form's response sheet** (the usual "on form submit" trigger). The workflow is the same every time: read the response → build article → create Doc → **call the task tracker by ID** to add a row with the Doc link. We don't poll; we don't run from a standalone project. The code lives in each form response sheet so the trigger can fire, but it **talks to the task sheet only by ID** ([Config.gs](Config.gs) `TASK_TRACKER_ID`, [appendArticleTask.gs](appendArticleTask.gs) opens it with `SpreadsheetApp.openById`). No code has to live in the task tracker sheet—we only write to it by ID.

**Deployment:** We use the **same codebase** for every form. We copy (or push) that code to each form's response sheet project—Member Spotlight response sheet, Event Recap response sheet, etc. In each project we set the same Config (at least `TASK_TRACKER_ID`); we can set the article type per form (e.g. Member Spotlight vs Event Recap) in Config or in the trigger. So: one repo, same files; push to each form response sheet's script ID so that when a response comes in to **any** form, the code in that sheet runs and runs the same workflow (create Doc, link in task tracker by ID).

---

## Step 1: Trigger + handler that runs on form submit (in the response sheet)

**Goal:** When a new form response is submitted, Google runs our function in **that response sheet's** script project.

**What we'll add:**

- In `FormTrigger.gs`: `function onFormSubmit(e) { ... }` with only `Logger.log('Form submitted')` (and optionally a toast so you see it in the sheet).

**How you'll test:**

1. Open the **response spreadsheet** for one form (e.g. Member Spotlight).
2. Put the project files in that sheet's Apps Script project (Extensions → Apps Script, or push via clasp with that sheet's script ID).
3. Triggers (clock icon) → Add Trigger → "On form submit" → select `onFormSubmit` → Save.
4. Submit a test response. Check Executions (or the toast). The function should run.

**Deliverable:** The trigger fires when the form is submitted; code runs in the response sheet.

---

## Step 2: Read the new response from the event

**Goal:** Get the new row (`e.values`) and the header row so we know the form's structure.

**What we'll add:**

- In `onFormSubmit(e)`: use `e.values` (the new row). Read the header row from the sheet (row 1). Log (or toast) both so you can confirm column order and names.

**How you'll test:**

1. Submit another test response. In Apps Script: View → Executions / Logs. Confirm you see the new row and headers.

**Deliverable:** We know which index/header corresponds to which form question for building the article.

---

## Step 3: Function that builds article text from one response

**Goal:** Turn one response (values + headers) into title + body for the Doc.

**What we'll add:**

- In `ArticleBuilder.gs`: `function buildArticleFromResponse(values, headers)` — returns a string (or title + body) from the form answers. No AI; simple template. Map by header name or position.

**How you'll test:**

1. Call `buildArticleFromResponse` manually with sample `values` and `headers` from the sheet. Confirm the result looks like a short article.

**Deliverable:** One response row → article text we can put in a Doc.

---

## Step 4: Function that creates a Google Doc with title and body

**Goal:** Create a new Doc, set title and body, return the Doc URL.

**What we'll add:**

- `function createArticleDoc(title, body)` — `DocumentApp.create(title)`, set body, return `doc.getUrl()`.

**How you'll test:**

1. Call `createArticleDoc('Test article', 'Hello world.\n\nParagraph 2.')` from the script editor. Confirm a Doc appears in Drive and the returned URL is correct.

**Deliverable:** We can create a draft Doc and get its link.

---

## Step 5: Wire form submit → create Doc → call task sheet by ID

**Goal:** When a form is submitted, the script (running in the response sheet) builds the article, creates the Doc, then **calls the task tracker by ID** to add a row with the Doc link.

**What we'll add:**

- In `onFormSubmit(e)`:
  1. Read `e.values` and the header row (Step 2).
  2. Call `buildArticleFromResponse(values, headers)` → title + body.
  3. Call `createArticleDoc(title, body)` → `docUrl`.
  4. Call `appendArticleTask(articleType, taskTitle, docUrl, owner)`. That function already opens the task tracker with `SpreadsheetApp.openById(Config.TASK_TRACKER_ID)` and appends the row. So we're **not** writing code in the task sheet—we're just calling our function, which talks to the task sheet by ID.
  5. Use the same [Config.gs](Config.gs) and [appendArticleTask.gs](appendArticleTask.gs) in this project (same repo). Set `TASK_TRACKER_ID` in Config. Set `articleType` per form (e.g. `Config.ARTICLE_TYPES.MEMBER_SPOTLIGHT` for the Member Spotlight form).

**How you'll test:**

1. Submit a real form response.
2. Check: a new Doc in Drive; a new row in the task tracker (correct month tab, "tasks &lt;month&gt;" table) with the Doc link.

**Deliverable:** End-to-end: form submit (in response sheet) → create Doc → task row added in task tracker (by ID). Same workflow from any form.

---

## Deployment: same code to each form response sheet

- **One codebase** in the repo (Config, FormTrigger, ArticleBuilder, appendArticleTask, etc.).
- **Push (or copy) to each form response sheet's Apps Script project** so each form has the same script and an "on form submit" trigger. You can use a script (e.g. push to multiple script IDs by swapping `.clasp.json` or using multi-clasp) to push the same code to Member Spotlight response sheet, Event Recap response sheet, etc.
- **Config per form:** In each project, set `Config.TASK_TRACKER_ID` (same for all). Optionally set or pass the article type for that form (Member Spotlight, Event Recap, etc.) so the task row is labeled correctly.
- **Task tracker sheet:** No script needs to run there. We only write to it by ID from the form response scripts.

---

## Summary

- **Trigger:** On form submit, in the **response sheet** (event-driven, no polling).
- **Workflow:** Create article from response → create Doc → call **task tracker by ID** to add the task with the Doc link (`appendArticleTask` + `Config.TASK_TRACKER_ID`).
- **Deployment:** Same code in each form response sheet project; push to each form's script ID so any form submission runs the same workflow.

---

## Later (not in this plan)

- **AI draft:** Replace the template in `buildArticleFromResponse` with Gemini (or another API); same flow (create Doc, append task).
- **Per-form article type:** In Config or in the trigger, set the right `ARTICLE_TYPES` value for each form so task rows are labeled correctly (Member Spotlight, Event Recap, etc.).

---

## Order of work

| Step | What | Test |
|------|------|------|
| 1 | `onFormSubmit(e)` in response sheet, log/toast | Trigger runs on form submit |
| 2 | Read `e.values` and headers, log them | You see response structure |
| 3 | `buildArticleFromResponse(values, headers)` → title + body | Manual call returns article text |
| 4 | `createArticleDoc(title, body)` → doc URL | Manual call creates Doc and returns URL |
| 5 | `onFormSubmit` → build → create Doc → `appendArticleTask` (task sheet by ID) | Submit form → Doc + task row appear |

We implement and test Step 1 first, then proceed one step at a time. Code runs in the response sheet; task tracker is only written to by ID.
