# H.E.R. DAO Newsletter pipeline

Google Apps Script pipeline that turns form responses into newsletter article drafts and tracks them in a spreadsheet.

**Purpose:** When something newsletter-worthy happens, we send a form to the organizer or lead. Their answers feed an AI draft; we do final editing, images, and publishing. This repo is for anyone who wants to replicate that style of automation (forms → drafts → task tracker, human in the loop).

**Flow:**
1. Someone submits one of four forms: newsletter submission, member spotlight, event recap, or partnerships announcement.
2. On submit, a script runs: it reads the response, calls an AI to write a Substack-style draft, creates a Google Doc with that draft, and appends a row to a task spreadsheet with the Doc link.
3. We edit the draft, add images, and publish to Substack; the spreadsheet stays the single place to see what’s in progress and what’s done.

**Form types (and intended article style):**
- **Newsletter submission** – general story or update for the newsletter.
- **Member spotlight** – feature on a member (e.g. leaders fill this out).
- **Event recap** – post-event summary from the person who ran it.
- **Partnerships announcement** – new partnership or collaboration.

Scripts are meant to live with the form response sheets (or the task tracker) and run on form submit; the exact setup (e.g. clasp, triggers) is left to how you deploy.

---

**Setup for developers (clasp)**

1. **Copy the example config**  
   `cp .clasp.example.json .clasp.json`  
   (`.clasp.json` is gitignored so your script ID is not committed.)

2. **Set your script ID**  
   Open `.clasp.json` and replace `YOUR_SCRIPT_ID_HERE` with the **Apps Script project (script) ID** you want to push to—not the spreadsheet ID. For a form response sheet: open the sheet → Extensions → Apps Script → Project settings (gear) → copy **Script ID**. See [FORM_IDS.md](FORM_IDS.md) for a list. The ID in `.clasp.json` must match the project that opens when you go to Apps Script from that sheet (or from the task tracker).

3. **Log in and push**  
   From the `google-apps-script` folder:  
   `clasp login`  
   then  
   `clasp push`  
   To push to a different project later, change `scriptId` in `.clasp.json` and run `clasp push` again.
