# Script IDs (for clasp push)

This repo can push the same code to multiple Apps Script projects. Use this file to track which script ID belongs to which project.

**Every ID here is the Apps Script project ID.** Get it from the script editor: **Project settings** (gear icon) → **Script ID**. 

**How to push**  
Set `scriptId` in `.clasp.json` to the project you want, then run `clasp push` from this folder. Switch the ID and push again to update another project.

---

Copy this file to `FORM_IDS.md` and replace the placeholders with your real script IDs:

- **Main project** (e.g. task tracker or primary sheet): `YOUR_MAIN_SCRIPT_ID`
- **Form 1 response sheet**: `YOUR_FORM_1_SCRIPT_ID`
- **Form 2 response sheet**: `YOUR_FORM_2_SCRIPT_ID`
- **Form 3 response sheet**: `YOUR_FORM_3_SCRIPT_ID`
- **Form 4 response sheet**: `YOUR_FORM_4_SCRIPT_ID`

Add or remove rows to match how many projects you use. Keep `FORM_IDS.md` local only (it’s in `.gitignore`); don’t commit real IDs.

---

**When pushing to a form response sheet**, set in [Config.gs](Config.gs) the values for that form: `CURRENT_FORM_ARTICLE_TYPE` and `CURRENT_FORM_TASK_PREFIX` (they control the task row label and the “From form: …” note). Optionally set `DOC_TITLE_PREFIX` if you want a prefix in the draft Doc file name.
