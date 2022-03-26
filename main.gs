var ACCESS_TOKEN = '<Line Messaging API ACCESS_TOKEN>'
var SHEET_ID = '<SPREAD SHEET ID>'
var LINE_URL = "https://api.line.me/v2/bot/message/reply"

const CATEGORY_LIST = ['食費','外食費','日用品','ヘルスケア','娯楽費','電気代','ガス代','水道代','家賃','その他']
const PAYMENT_STATUS = ['共通財布','精算済','未精算']
const HELP_MESSAGE_LIST = ['カテゴリ','支払い状況']

/**
 * 　Lineにメッセージをもとに家計簿登録
 */
function doPost(e){
  
  console.log('doPost.event:'+ e.postData.contents)
  
  var json = JSON.parse(e.postData.contents);
  
  //返信用のトークン取得
  var reply_token = json.events[0].replyToken;
  //トークンが取れなかったら終了
  if(typeof reply_token === 'undefined'){
      console.log('fail to get reply token')
    return;
  }

  //送られたメッセージを取得
  var user_message = json.events[0].message.text;
  var message_parameter = user_message.split(/\r\n|\n/);

  //helpメッセージが入力された場合用のメッセージを詰める
  if(HELP_MESSAGE_LIST.some(e => e.match(message_parameter[0]))){
    console.log("reply help message")
    //メッセージ送信
    sendMessage(setHelpMessage(message_parameter[0]),reply_token)
    return
  }

  //メッセージのバリデートチェック
  console.log('validateMessage start. message_parameter:'+ message_parameter)
  validateResult = validateMessage(message_parameter)
  console.log('validateMessage end results:' + validateResult.result)

  if(!validateResult.result){
    //メッセージ送信
    sendMessage(validateResult.message,reply_token)
    return
  }

  //購入日をyyyy/MM/dd形式にformat
  var buy_date = new Date(message_parameter[2])
  var buy_date_str = Utilities.formatDate(buy_date, 'JST', 'yyyy/MM/dd');
  //年単位で記録するシートを分けているので振り分け
  var sheet_name = ''
  if(buy_date.getFullYear != '2022'){
    sheet_name = '2022_List'
  }else{
    sheet_name = '2021_List'
  }

  //家計簿シートに登録
  console.log('regist sheet start')
  console.log(json.events[0].source.userId)
  var register_sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(sheet_name);
  var last_row = register_sheet.getLastRow() + 1;
  var user = getUserProfile(json.events[0].source.userId)
  var timestamp = Utilities.formatDate(new Date(), 'JST', 'yyyy/MM/dd HH:mm:ss');
  register_sheet.getRange(last_row,1).setValue(timestamp)
  register_sheet.getRange(last_row,2).setValue(message_parameter[0])//カテゴリ
  register_sheet.getRange(last_row,3).setValue(message_parameter[1])//金額
  register_sheet.getRange(last_row,4).setValue(buy_date_str)//購入日
  register_sheet.getRange(last_row,5).setValue(user)//購入者
  if(message_parameter.length = 5){
    register_sheet.getRange(last_row,6).setValue(message_parameter[4])//メモ
  }
  register_sheet.getRange(last_row,7).setValue(message_parameter[3])//支払い状況

  //メッセージ送信
  sendMessage('登録完了',reply_token)
  return

}

/**
 * 送られてきたメッセージのバリデートチェック
 */
function validateMessage(message_parameter){
  //debug
  //message_parameter = ['食費','2000','2022/12/12','共通財布'];

  //message_parameterが指定の数かチェック
  if(message_parameter.length < 4){
    return {'result':false,'message': 'カテゴリ、金額、購入日、支払いを入力してください。'}
  }
  
  //1行目の情報チェック(カテゴリ)
  if(!CATEGORY_LIST.some(e => e.match(message_parameter[0]))){
    return {'result':false,'message':'1行目は、カテゴリを入力してください。\nカテゴリ:' + CATEGORY_LIST}
  }
  //2行目の情報チェック(金額)
  if(isNaN(message_parameter[1])){
    return {'result':false,'message':'2行目は、金額を入力してください。'}
  }
  //3行目の情報チェック(購入日)
  if(isNaN(new Date(message_parameter[2]))){
    return {'result':false,'message':'3行目は、購入日(yyyy/MM/dd)を入力してください。'}
  }
  //4行目の情報チェック(支払い状況)
  if(!PAYMENT_STATUS.some(e => e.match(message_parameter[3]))){
    return {'result':false,'message':'4行目は、支払い状況を入力してください。\n支払い状況:' + PAYMENT_STATUS}
  }
  return {'result': true,'message':''}
}

/**
 * メッセージを送信する
 */
function sendMessage(post_message,reply_token){
  console.log('sendMessage:'+ post_message)

  const LineMessageObject = [{
    'type': 'text',
    'text': post_message
  }];

  const replyHeaders = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + ACCESS_TOKEN
  };

  const replyBody = {
    'replyToken': reply_token,
    'messages': LineMessageObject
  };
  const replyOptions = {
    'method': 'POST',
    'headers': replyHeaders,
    'payload': JSON.stringify(replyBody)
  };

  UrlFetchApp.fetch(LINE_URL, replyOptions);
}

function setHelpMessage(post_message){
  switch (post_message) {
    case 'カテゴリ':
      return 'カテゴリは、'+ CATEGORY_LIST + 'のいずれかを入力してください。'
    case '支払い状況':
      return '支払い状況は、'+PAYMENT_STATUS + 'のいずれかを入力してください。'
  }
}

// profileを取得してくる関数（コピペでOK）
function getUserProfile(user_id){ 
  var url = 'https://api.line.me/v2/bot/profile/' + user_id;
  var userProfile = UrlFetchApp.fetch(url,{
    'headers': {
      'Authorization' :  'Bearer ' + ACCESS_TOKEN,
    },
  })
  return JSON.parse(userProfile).displayName;
}