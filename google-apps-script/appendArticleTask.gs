/**
 * Appends one article draft task to the "tasks <month>" table on the correct month tab.
 * Month: before the 4th → current month; on/after the 4th → next month.
 * Reads the table header and fills every column we have a value for.
 *
 * @param {string} articleType - label for notes (e.g. 'Member Spotlight' or Config.CURRENT_FORM_ARTICLE_TYPE)
 * @param {string} taskTitle - short title (e.g. "Member Spotlight: Jane Doe")
 * @param {string} docUrl - full url of the draft Google Doc
 * @param {string} [owner] - optional; who owns the task
 * @param {string} [monthName] - optional; override target month (e.g. "February")
 * @return {number} the row number where the task was appended
 */
function appendArticleTask(articleType, taskTitle, docUrl, owner, monthName) {
  var ss = SpreadsheetApp.openById(Config.TASK_TRACKER_ID);

  // target month: param override, else before 4th = current month, on/after 4th = next month
  var targetMonth = monthName || getTargetMonthName();
  var sheet = ss.getSheetByName(targetMonth);

  if (!sheet) {
    throw new Error('Sheet not found: "' + targetMonth + '". Check that the month tab exists and name matches.');
  }

  // find "tasks <month>" table by API name (Rename table dropdown)
  var tableInfo = findTasksTable(sheet, targetMonth);
  if (!tableInfo) {
    throw new Error('Table not found on "' + targetMonth + '" tab. The tab must have a table named "Tasks ' + targetMonth + '" (set via the table\'s Rename table dropdown). Enable Sheets API if needed.');
  }

  var headerRow = tableInfo.headerRow;
  var appendRow = tableInfo.appendRow;
  var headers = tableInfo.headers;
  var startCol = tableInfo.startCol;
  var numCols = headers.length;

  // values we want to write, keyed by header name (normalized: trim, lower)
  var today = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'M/d/yyyy');
  var valuesByHeader = {
    'priority': 'Medium',
    'task': taskTitle,
    'category': '',
    'owner': owner || '',
    'status': Config.STATUS_FOR_NEW_ARTICLE_TASK,
    'last touch': today,
    'due date': '',
    'link': '',
    'deliverable': docUrl,
    'deliverables': docUrl,
    'notes': 'From form: ' + articleType
  };

  // build one row matching the table’s column order; fill known columns, leave rest blank
  var row = [];
  for (var c = 0; c < numCols; c++) {
    var h = String(headers[c] || '').trim().toLowerCase();
    row.push(valuesByHeader[h] !== undefined ? valuesByHeader[h] : '');
  }

  sheet.getRange(appendRow, startCol, 1, numCols).setValues([row]);
  return appendRow;
}

/**
 * Resolves target month: before 4th → current month; on/after 4th → next month.
 * @return {string} month name (e.g. "February")
 */
function getTargetMonthName() {
  var now = new Date();
  var day = now.getDate();
  var monthIndex = now.getMonth();
  if (day >= Config.TASK_MONTH_CUTOFF_DAY) {
    monthIndex = (monthIndex + 1) % 12;
  }
  return Config.MONTH_NAMES[monthIndex];
}

/**
 * Finds the "tasks <month>" table by its API table name (the title from "Rename table" dropdown).
 * Uses Sheets API so the title is found regardless of cell position; works when rows are added above.
 * Requires Sheets API v4 advanced service enabled.
 * @param {Sheet} sheet - the month tab
 * @param {string} monthName - e.g. "February"
 * @return {Object|null} { headerRow, appendRow, headers, startCol } or null if not found
 */
function findTasksTableByApi(sheet, monthName) {
  var searchName = ('tasks ' + monthName).toLowerCase().trim();
  var ssId = Config.TASK_TRACKER_ID;
  var sheetId = sheet.getSheetId();

  try {
    var resp = Sheets.Spreadsheets.get(ssId, {
      fields: 'sheets(properties(sheetId,title),tables(name,range))'
    });
  } catch (e) {
    Logger.log('Sheets API get failed: ' + e.message);
    return null;
  }

  var targetSheet = null;
  var targetTable = null;
  for (var s = 0; s < resp.sheets.length; s++) {
    var sh = resp.sheets[s];
    if (sh.properties && sh.properties.sheetId === sheetId && sh.tables) {
      for (var t = 0; t < sh.tables.length; t++) {
        var tblName = String(sh.tables[t].name || '').trim().toLowerCase();
        if (tblName === searchName) {
          targetSheet = sh;
          targetTable = sh.tables[t];
          break;
        }
      }
    }
    if (targetTable) break;
  }

  if (!targetTable || !targetTable.range) {
    return null;
  }

  var r = targetTable.range;
  // range is 0-based: startRowIndex = header row, startColumnIndex = first column of table
  var headerRow = (r.startRowIndex || 0) + 1;
  var startCol = (r.startColumnIndex || 0) + 1;
  var numCols = (r.endColumnIndex || startCol) - (r.startColumnIndex || 0);
  if (numCols < 1) numCols = 10;

  var lastRow = Math.max(sheet.getLastRow(), headerRow);
  var headers = sheet.getRange(headerRow, startCol, 1, numCols).getValues()[0];

  // find first blank in Task column (second column of table)
  var colTask = startCol + 1;
  var appendRow = headerRow + 1;
  if (lastRow >= appendRow) {
    var range = sheet.getRange(appendRow, colTask, lastRow - appendRow + 1, 1);
    var values = range.getValues();
    var found = false;
    for (var i = 0; i < values.length; i++) {
      if (values[i][0] === '' || values[i][0] === null) {
        appendRow = headerRow + 1 + i;
        found = true;
        break;
      }
    }
    if (!found) {
      appendRow = lastRow + 1;
    }
  }

  return {
    headerRow: headerRow,
    appendRow: appendRow,
    headers: headers,
    startCol: startCol
  };
}

/**
 * Finds the "tasks <month>" table by API name (Rename table dropdown). Returns null if not found.
 */
function findTasksTable(sheet, monthName) {
  return findTasksTableByApi(sheet, monthName);
}

/**
 * Run this from the Apps Script editor to test appendArticleTask.
 * Picks current/next month by your cutoff rule; pass a month name in the code to force one.
 * Check the spreadsheet after running – you should see one new "TEST" row you can delete.
 */
function testAppendArticleTask() {
  var articleType = Config.ARTICLE_TYPES.MEMBER_SPOTLIGHT;
  var taskTitle = 'TEST – Member Spotlight: Jane Doe (delete me)';
  var docUrl = 'https://docs.google.com/document/d/example/edit'; // any valid-looking url is fine
  var owner = 'Test Runner';
  var monthName = null; // e.g. 'February' to force that tab

  var row = appendArticleTask(articleType, taskTitle, docUrl, owner, monthName);
  Logger.log('Appended test task at row ' + row + '. Check the sheet and delete the TEST row when done.');
}
