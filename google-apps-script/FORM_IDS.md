# Script IDs (for clasp push)

**Use the Apps Script project ID (script ID), not the spreadsheet ID.**  
For a form response sheet: open that sheet → **Extensions → Apps Script** → in the script editor click the **gear (Project settings)** → copy **Script ID**. That is the value to put in `.clasp.json` as `scriptId`. If you use the spreadsheet ID (from the sheet URL) by mistake, clasp may push to the wrong project and you won’t see the files when you open the sheet’s Apps Script.

To push: set `scriptId` in `.clasp.json` to the project you want, then run `clasp push`.

- **Task tracker**: `1c62gNBOFxaFJR8m1AxQtemtd9RDmm65OIazwM0zi0OUktUznk9tQi6ie`
- **Member Spotlight** (form response sheet): `1-NJpbMgjVhbAHQNwrJH3y5GnyeUdeKzZpP1n_b1f4DlA1LKrhcI2a8fN`
- **Event Recap**: `1MW7BZoJBT5dphsS2t9jlGaTRyWpSJt3tISvbP0dVfdVSUjrJaS9w_YPQ`
- **Newsletter Submission**: `1xfuKp515wHMizXyBGcDJWtovSScCOVoi5KayR5VPN8H1KHjGRhNw7dF7`
- **Partnerships**: `1G7M8aDdZLKPrsDOVqWYB_G3O6VzM9T5zuogqhC6TqLjjLS4M8k2JxmsA`

Same codebase; change the ID in `.clasp.json` and push to whichever project you’re updating.

---

**When pushing to a form response sheet**, also set in [Config.gs](Config.gs) for that form:

| Form | `CURRENT_FORM_ARTICLE_TYPE` | `CURRENT_FORM_TASK_PREFIX` |
|------|-----------------------------|----------------------------|
| Member Spotlight | `'Member Spotlight'` | `'Member Spotlight'` |
| Event Recap | `'Event Recap'` | `'Event Recap'` |
| Newsletter Submission | `'Newsletter Submission'` | `'Newsletter Submission'` |
| Partnerships | `'Partnerships Announcement'` | `'Partnerships'` |

Those values set the task row label and the "From form: …" note. Optionally set `DOC_TITLE_PREFIX` (e.g. `'Member Spotlight - '`) if you want it in the draft Doc file name.
