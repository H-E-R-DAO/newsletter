/**
 * Builds article text from one form response. Output is Q/A format so AI can turn it into prose later.
 * Returns { title, body } where body is explicit "Q: ... A: ..." pairs.
 *
 * @param {Array} values - new row from e.values (one value per form question)
 * @param {Array} headers - header row from the response sheet (same length as values)
 * @return {Object} { title, body }
 */
function buildArticleFromResponse(values, headers) {
  if (!values || !headers || values.length === 0) {
    return { title: 'Article draft', body: '' };
  }

  var qaBlocks = [];
  var title = '';

  for (var i = 0; i < values.length; i++) {
    var question = String(headers[i] || '').trim();
    var value = values[i] !== null && values[i] !== undefined ? String(values[i]).trim() : '';
    if (!value) continue;

    if (question.toLowerCase().indexOf('timestamp') !== -1) continue;
    if (!title && value.length > 0 && value.length < 100) title = value;

    qaBlocks.push('Q: ' + (question || '') + '\nA: ' + value);
  }

  var body = qaBlocks.join('\n\n');
  if (!title) title = 'Article draft';
  return { title: title, body: body };
}

/**
 * Creates a new Google Doc with the given title and body text; returns its URL.
 * Doc name = today's date (YYYY-MM-DD) + optional Config.DOC_TITLE_PREFIX + title.
 * Uses Config.DRAFT_FOLDER_ID for location if set.
 *
 * @param {string} title - document title (file name in Drive)
 * @param {string} body - plain text body; newlines preserved
 * @return {string} doc.getUrl()
 */
function createArticleDoc(title, body) {
  var dateStr = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
  var fullTitle = dateStr + ' - ' + (Config.DOC_TITLE_PREFIX || '') + (title || 'Article draft');
  var doc = DocumentApp.create(fullTitle);
  var docBody = doc.getBody();
  var text = (body || '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  docBody.setText(text);
  doc.saveAndClose();

  if (Config.DRAFT_FOLDER_ID) {
    var file = DriveApp.getFileById(doc.getId());
    file.moveTo(DriveApp.getFolderById(Config.DRAFT_FOLDER_ID));
  }

  return doc.getUrl();
}
