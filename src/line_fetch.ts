export const SCRIPT_PROPERTIES = PropertiesService.getScriptProperties();
export const SLACK_WEBHOOK_URL = SCRIPT_PROPERTIES.getProperty("SLACK_WEBHOOK_URL")
export const SHEET_ID = SCRIPT_PROPERTIES.getProperty("SHEET_ID")
export const ACCESS_TOKEN = SCRIPT_PROPERTIES.getProperty("ACCESS_TOKEN")
export const LINE_URL = "https://api.line.me/v2/bot/message/reply"

/**
 * Textメッセージを送信する
 */
export function sendTextMessage(post_message: string, replyToken: any) {
  console.info('sendTextMessage:' + post_message)

  const messageObject = [{
    'type': 'text',
    'text': post_message
  }];

  sendMessage(messageObject, replyToken)
}

//メッセージを送信する
export function sendMessage(messageObject: any, replyToken: any) {
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
export function getUserProfile(user_id: string) {
  var url = 'https://api.line.me/v2/bot/profile/' + user_id;
  var userProfile = UrlFetchApp.fetch(url, {
    'headers': {
      'Authorization': 'Bearer ' + ACCESS_TOKEN,
    },
  })

  return JSON.parse(userProfile.getContentText()).displayName;
}