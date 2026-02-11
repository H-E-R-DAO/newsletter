/**
 * Test: run the pipeline using the last filled row in the active sheet.
 * Open the form response sheet, run this from the script editor (Run → testWithLastResponse).
 * Creates a Doc and adds a task row using that row's data.
 */
function testWithLastResponse() {
  Logger.log('testWithLastResponse: starting');
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getActiveSheet();
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    SpreadsheetApp.getActiveSpreadsheet().toast('No data rows. Need at least row 1 (headers) and row 2 (one response).');
    return;
  }
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var values = sheet.getRange(lastRow, 1, 1, sheet.getLastColumn()).getValues()[0];
  Logger.log('testWithLastResponse: lastRow=' + lastRow + ', building article');

  try {
    var article = buildArticleFromResponse(values, headers);
    if (!article || (!article.body && !article.title)) {
      SpreadsheetApp.getActiveSpreadsheet().toast('No article content from that row.');
      return;
    }
    Logger.log('testWithLastResponse: creating Q&A doc');
    var qaDocUrl = createArticleDoc(article.title, article.body, ' - Q&A');
    Logger.log('testWithLastResponse: calling Gemini for article...');
    var aiBody = generateArticleFromQa(article.body, Config.CURRENT_FORM_ARTICLE_TYPE);
    var draftBody = aiBody || article.body;
    Logger.log('testWithLastResponse: creating draft doc');
    var docUrl = createArticleDoc(article.title, draftBody, '');
    Logger.log('Doc created (draft): ' + docUrl + '; Q&A: ' + qaDocUrl);
    var articleType = Config.CURRENT_FORM_ARTICLE_TYPE || 'Member Spotlight';
    var prefix = Config.CURRENT_FORM_TASK_PREFIX || 'Member Spotlight';
    var taskTitle = prefix + ': ' + (article.title || 'Draft');
    Logger.log('testWithLastResponse: appending task to tracker');
    var appendedRow = appendArticleTask(articleType, taskTitle, docUrl, '');
    Logger.log('testWithLastResponse: task appended at row ' + appendedRow);
    SpreadsheetApp.getActiveSpreadsheet().toast('Q&A and draft docs created; task added. Check Drafts folder and task sheet.');
  } catch (err) {
    Logger.log('testWithLastResponse ERROR: ' + err.message);
    Logger.log(err.stack || err.toString());
    SpreadsheetApp.getActiveSpreadsheet().toast('Error: ' + err.message);
  }
}

/**
 * Runs when a new form response is submitted (install "On form submit" trigger).
 * Builds article from response, creates a Doc, appends task to the newsletter crew sheet.
 * For manual testing, use testWithLastResponse() instead.
 */
function onFormSubmit(e) {
  if (!e || !e.values || e.values.length === 0) {
    Logger.log('onFormSubmit: no event data. Use testWithLastResponse() to test with the last row.');
    return;
  }

  Logger.log('Form submitted');
  var values = e.values;
  var sheet = e.range ? e.range.getSheet() : SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

  try {
    var article = buildArticleFromResponse(values, headers);
    if (!article || (!article.body && !article.title)) {
      SpreadsheetApp.getActiveSpreadsheet().toast('No article content from response.');
      return;
    }
    Logger.log('onFormSubmit: creating Q&A doc');
    createArticleDoc(article.title, article.body, ' - Q&A');
    Logger.log('onFormSubmit: calling Gemini for article...');
    var aiBody = generateArticleFromQa(article.body, Config.CURRENT_FORM_ARTICLE_TYPE);
    var draftBody = aiBody || article.body;
    Logger.log('onFormSubmit: creating draft doc');
    var docUrl = createArticleDoc(article.title, draftBody, '');
    Logger.log('Doc created (draft): ' + docUrl);

    var articleType = Config.CURRENT_FORM_ARTICLE_TYPE || 'Member Spotlight';
    var prefix = Config.CURRENT_FORM_TASK_PREFIX || 'Member Spotlight';
    var taskTitle = prefix + ': ' + (article.title || 'Draft');
    appendArticleTask(articleType, taskTitle, docUrl, '');

    SpreadsheetApp.getActiveSpreadsheet().toast('Q&A and draft docs created; task added.');
  } catch (err) {
    Logger.log('onFormSubmit ERROR: ' + err.message);
    Logger.log(err.stack || err.toString());
    SpreadsheetApp.getActiveSpreadsheet().toast('Error: ' + err.message);
  }
}
