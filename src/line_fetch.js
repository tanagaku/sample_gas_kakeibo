/**
 * Textメッセージを送信する
 */
function sendTextMessage(post_message, replyToken) {
  console.log('sendTextMessage:' + post_message)

  const messageObject = [{
    'type': 'text',
    'text': post_message
  }];

  sendMessage(messageObject, replyToken)
}

//メッセージを送信する
function sendMessage(messageObject, replyToken) {
  const replyHeaders = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + scriptProperties.getProperty("ACCESS_TOKEN")
  };

  const replyBody = {
    'replyToken': replyToken,
    'messages': messageObject
  };
  const replyOptions = {
    'method': 'POST',
    'headers': replyHeaders,
    'payload': JSON.stringify(replyBody)
  };

  UrlFetchApp.fetch(LINE_URL, replyOptions);
}

// profileを取得してくる関数
function getUserProfile(user_id) {
  var url = 'https://api.line.me/v2/bot/profile/' + user_id;
  var userProfile = UrlFetchApp.fetch(url, {
    'headers': {
      'Authorization': 'Bearer ' + scriptProperties.getProperty("ACCESS_TOKEN"),
    },
  })
  return JSON.parse(userProfile).displayName;
}