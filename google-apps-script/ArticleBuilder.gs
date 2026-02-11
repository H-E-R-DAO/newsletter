function _normalizeHeader(h) {
  return String(h || '').trim().toLowerCase().replace(/\s+/g, ' ');
}

function _isTitleHeader(header) {
  var n = _normalizeHeader(header);
  if (!n) return false;
  return n === 'headline/title' || n === 'headline' || n === 'title' || n === 'member name' || n.indexOf('headline') !== -1 || n.indexOf('member name') !== -1;
}

/**
 * Builds article text from one form response. Output is Q/A format.
 * Title is taken from a column headed "Headline/Title" or "Member Name" (or "Headline", "Title"), else first short value.
 *
 * @param {Array} values - new row from e.values
 * @param {Array} headers - header row (same length as values)
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
    if (_isTitleHeader(question)) {
      title = value;
    } else if (!title && value.length > 0 && value.length < 100) {
      title = value;
    }

    qaBlocks.push('Q: ' + (question || '') + '\nA: ' + value);
  }

  var body = qaBlocks.join('\n\n');
  if (!title) title = 'Article draft';
  return { title: title, body: body };
}

/**
 * Creates a new Google Doc with the given title and body; moves to Config.DRAFT_FOLDER_ID if set.
 * Doc name = date (YYYY-MM-DD) + optional Config.DOC_TITLE_PREFIX + title + optional nameSuffix.
 *
 * @param {string} title - used in file name (e.g. from Headline/Title or Member Name column)
 * @param {string} body - plain text body; newlines preserved
 * @param {string} [nameSuffix] - optional suffix for file name (e.g. ' - Q&A', ' - Draft')
 * @return {string} doc.getUrl()
 */
function createArticleDoc(title, body, nameSuffix) {
  var dateStr = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
  var suffix = (nameSuffix !== undefined && nameSuffix !== null) ? nameSuffix : '';
  var fullTitle = dateStr + ' - ' + (Config.DOC_TITLE_PREFIX || '') + (title || 'Article draft') + suffix;
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
