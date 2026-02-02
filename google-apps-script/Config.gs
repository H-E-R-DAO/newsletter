/**
 * H.E.R. DAO Newsletter – pipeline config
 * One object so appendArticleTask.gs can use Config.TASK_TRACKER_ID, Config.ARTICLE_TYPES, etc.
 */
var Config = {
  // task tracker spreadsheet (newsletter crew sheet)
  TASK_TRACKER_ID: '1NYwdSQGtvFPDn82kQ5Ot5EJGHBZjc_Otff0CK1zjQaw',

  // month tabs: names must match your sheet tab names (January, February, …)
  MONTH_NAMES: ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'],

  // cutoff day: before the 4th → current month's "tasks <month>"; on/after 4th → next month's
  TASK_MONTH_CUTOFF_DAY: 4,

  // status for new article tasks – must match the Status column dropdown options exactly
  STATUS_FOR_NEW_ARTICLE_TASK: 'To Do',

  // article types (for task title / notes)
  ARTICLE_TYPES: {
    NEWSLETTER: 'Newsletter Submission',
    MEMBER_SPOTLIGHT: 'Member Spotlight',
    EVENT_RECAP: 'Event Recap',
    PARTNERSHIPS: 'Partnerships Announcement'
  },

  // when pushing to a form response sheet, set these for that form (used by onFormSubmit / testWithLastResponse)
  // use the same label as in ARTICLE_TYPES (e.g. 'Member Spotlight', 'Event Recap', 'Newsletter Submission', 'Partnerships Announcement')
  CURRENT_FORM_ARTICLE_TYPE: 'Member Spotlight',  // change when pushing to a different form
  CURRENT_FORM_TASK_PREFIX: 'Member Spotlight',    // task title = "<prefix>: <title>"; change when pushing to a different form

  // new draft Doc: optional extra in file name (e.g. "Member Spotlight - "). Date (YYYY-MM-DD) is always prepended in code.
  DOC_TITLE_PREFIX: '',

  // optional: folder ID where new draft Docs go (root of Drive if blank)
  // get ID from the folder URL: drive.google.com/.../folders/FOLDER_ID
  DRAFT_FOLDER_ID: ''
};
