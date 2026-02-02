/**
 * Calls Gemini API to turn Q/A form content into a newsletter article.
 * Store your API key in Script Properties: GEMINI_API_KEY (Project Settings → Script properties).
 */

/**
 * Generates article body from Q/A text using Gemini.
 * @param {string} qaText - Q/A format text from buildArticleFromResponse
 * @param {string} articleType - e.g. "Member Spotlight", "Event Recap" (for prompt context)
 * @return {string} generated article body (plain text), or empty string on error
 */
function generateArticleFromQa(qaText, articleType) {
  var apiKey = getGeminiApiKey();
  if (!apiKey) {
    Logger.log('GeminiArticle: GEMINI_API_KEY not set in Script Properties. Skipping AI.');
    return '';
  }

  var model = Config.GEMINI_MODEL || 'gemini-2.5-flash-lite';
  var url = 'https://generativelanguage.googleapis.com/v1beta/models/' + model + ':generateContent';
  Logger.log('GeminiArticle: calling ' + model + ' with Q/A length ' + (qaText ? qaText.length : 0));

  var prompt = 'You are writing a newsletter article for Substack. Below is a Q&A from a form submission.'
    + ' Turn it into a polished, readable article suitable for publishing.'
    + ' Article type: ' + (articleType || 'general') + '.'
    + ' Write in a warm, professional tone. Use the answers to build the narrative; do not repeat "Q:" and "A:" in the article.'
    + ' Output only the article body (no title, no labels). Use paragraphs and line breaks where appropriate.\n\n'
    + qaText;

  var payload = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 2048
    }
  };

  var options = {
    method: 'post',
    contentType: 'application/json',
    headers: { 'x-goog-api-key': apiKey },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  try {
    var response = UrlFetchApp.fetch(url, options);
    var code = response.getResponseCode();
    var body = response.getContentText();

    if (code === 429) {
      Logger.log('GeminiArticle: quota exceeded (429). Retrying once in 36s...');
      Utilities.sleep(36000);
      response = UrlFetchApp.fetch(url, options);
      code = response.getResponseCode();
      body = response.getContentText();
    }

    if (code !== 200) {
      Logger.log('GeminiArticle: API error HTTP ' + code);
      if (code === 429) {
        Logger.log('GeminiArticle: still over quota. Check https://ai.google.dev/gemini-api/docs/rate-limits or try again later.');
      }
      Logger.log('GeminiArticle: response body: ' + body);
      return '';
    }

    var data = JSON.parse(body);
    var text = data.candidates && data.candidates[0] && data.candidates[0].content
      && data.candidates[0].content.parts && data.candidates[0].content.parts[0]
      ? data.candidates[0].content.parts[0].text
      : '';

    text = (text || '').trim();
    if (text) {
      Logger.log('GeminiArticle: success, got ' + text.length + ' chars');
    } else {
      Logger.log('GeminiArticle: no text in response. candidates: ' + (data.candidates ? data.candidates.length : 0));
      if (data.candidates && data.candidates[0] && data.candidates[0].finishReason) {
        Logger.log('GeminiArticle: finishReason: ' + data.candidates[0].finishReason);
      }
      if (data.error) {
        Logger.log('GeminiArticle: data.error: ' + JSON.stringify(data.error));
      }
    }
    return text;
  } catch (err) {
    Logger.log('GeminiArticle: catch ' + err.message);
    Logger.log('GeminiArticle: stack ' + (err.stack || ''));
    return '';
  }
}

function getGeminiApiKey() {
  return PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY') || '';
}
