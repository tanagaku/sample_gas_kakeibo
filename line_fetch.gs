/**
 * Textメッセージを送信する
 */
function sendTextMessage(post_message,reply_token){
  console.log('sendTextMessage:'+ post_message)

  const messageObject = [{
    'type': 'text',
    'text': post_message
  }];
}

//メッセージを送信する
function sendMessage(messageObject,reply_token){
  const replyHeaders = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + ACCESS_TOKEN
  };

  const replyBody = {
    'replyToken': reply_token,
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
function getUserProfile(user_id){ 
  var url = 'https://api.line.me/v2/bot/profile/' + user_id;
  var userProfile = UrlFetchApp.fetch(url,{
    'headers': {
      'Authorization' :  'Bearer ' + ACCESS_TOKEN,
    },
  })
  return JSON.parse(userProfile).displayName;
}