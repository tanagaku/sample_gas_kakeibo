const SCRIPT_PROPERTIES = PropertiesService.getScriptProperties();
const SLACK_WEBHOOK_URL = SCRIPT_PROPERTIES.getProperty("SLACK_WEBHOOK_URL")
const SHEET_ID = SCRIPT_PROPERTIES.getProperty("SHEET_ID")
const ACCESS_TOKEN = SCRIPT_PROPERTIES.getProperty("ACCESS_TOKEN")
const LINE_URL = "https://api.line.me/v2/bot/message/reply"

/**
 * Textメッセージを送信する
 */
function sendTextMessage(post_message: string, replyToken: any) {
  console.log('sendTextMessage:' + post_message)

  const messageObject = [{
    'type': 'text',
    'text': post_message
  }];

  sendMessage(messageObject, replyToken)
}

//メッセージを送信する
function sendMessage(messageObject: any, replyToken: any) {
  const replyHeaders = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + ACCESS_TOKEN
  };

  const replyBody = {
    'replyToken': replyToken,
    'messages': messageObject
  };

  const replyOptions: any = {
    'method': 'POST',
    'headers': replyHeaders,
    'payload': JSON.stringify(replyBody)
  };

  UrlFetchApp.fetch(LINE_URL, replyOptions);
}

// profileを取得してくる関数
function getUserProfile(user_id: string) {
  var url = 'https://api.line.me/v2/bot/profile/' + user_id;
  var userProfile = UrlFetchApp.fetch(url, {
    'headers': {
      'Authorization': 'Bearer ' + ACCESS_TOKEN,
    },
  })

  return JSON.parse(userProfile.getContentText()).displayName;
}