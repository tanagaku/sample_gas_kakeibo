const SCRIPT_PROPERTIES = PropertiesService.getScriptProperties();
var LINE_URL = "https://api.line.me/v2/bot/message/reply"

const CATEGORY_LIST = ['食費', '外食費', '日用品', 'ヘルスケア', '娯楽費', '電気代', 'ガス代', '水道代', '家賃', '入金', 'その他']
const DAY_LIST = ['今日', '昨日', '一昨日']
const PAYMENT_STATUS_LIST = ['共通財布', '精算済', '未精算']
const HELP_MESSAGE_LIST = ['ヘルプ', 'カテゴリ', '支払い状況']
const DELETE = '削除'
const ACCOUNT_LIST = ['今月', '先月', '残高']
const HELP_MESSAGE = '入力は\n1行目:カテゴリ\n2行目:金額\n3行目:購入日\n4行目:支払い状況\nを入力してください。\n残高確認は\n' + ACCOUNT_LIST + ',指定したい年月日(yyyy/MM/dd)\nを入力してください。'

function doPost(e) {

  // メッセージをjsonパースして取得
  var json = JSON.parse(e.postData.getDataAsString())
  console.log('doPost.event:' + e.postData.getDataAsString())

  //返信用のトークン取得
  var replyToken = json.events[0].replyToken;
  //トークンが取れなかったら終了
  if (typeof replyToken === 'undefined') {
    console.log('fail to get reply token')
    return;
  }

  if (json.events[0].postback) {
    postBackData = JSON.parse(json.events[0].postback.data)
    doPostBack(postBackData, replyToken)
    return
  }

  //送られたメッセージを取得
  var user_message = json.events[0].message.text;
  var message_parameter = user_message.split(/\r\n|\n/);

  //helpメッセージが入力された場合用のメッセージを詰める
  if (HELP_MESSAGE_LIST.some(e => e.match(message_parameter[0]))) {
    console.log("reply help message")
    //メッセージ送信
    sendTextMessage(setHelpMessage(message_parameter[0]), replyToken)
    return
  }

  //削除メッセージが送信されたとき
  if (DELETE.match(message_parameter[0])) {
    console.log("reply delete button message")
    sendDeleteButton(replyToken)
    return
  }

  //menuメッセージが入力された場合用のメッセージを詰める
  if (!isNaN(new Date(message_parameter[0])) || ACCOUNT_LIST.some(e => e.match(message_parameter[0]))) {
    console.log("reply menu message")
    //メッセージ送信
    sendTextMessage(setMenuMessage(message_parameter[0]), replyToken)
  }

  //メッセージのバリデートチェック
  console.log('validateMessage start. message_parameter:' + message_parameter)
  validateResult = validateRegistMessage(message_parameter)
  console.log('validateMessage end results:' + validateResult.result)

  if (!validateResult.result) {
    //メッセージ送信
    sendTextMessage(validateResult.message, replyToken)
    return
  }

  //購入日をyyyy/MM/dd形式にformat
  var buy_date = setBuyDate(message_parameter[2])
  var buy_date_str = Utilities.formatDate(buy_date, 'JST', 'yyyy/MM/dd');
  //年単位で記録するシートを分けているので振り分け
  var sheet_name = ''
  if (buy_date.getFullYear != '2022') {
    sheet_name = '2022_List'
  } else {
    sheet_name = '2021_List'
  }

  //家計簿シートに登録
  console.log('regist sheet start')
  var register_sheet = SpreadsheetApp.openById(scriptProperties.getProperty("SHEET_ID")).getSheetByName(sheet_name);
  var last_row = register_sheet.getLastRow() + 1;
  var user = getUserProfile(json.events[0].source.userId)
  var timestamp = Utilities.formatDate(new Date(), 'JST', 'yyyy/MM/dd HH:mm:ss');

  register_sheet.getRange(last_row, 1).setValue(timestamp)
  register_sheet.getRange(last_row, 2).setValue(message_parameter[0])//カテゴリ
  register_sheet.getRange(last_row, 3).setValue(message_parameter[1])//金額
  register_sheet.getRange(last_row, 4).setValue(buy_date_str)//購入日
  register_sheet.getRange(last_row, 5).setValue(user)//購入者
  if (message_parameter.length = 5) {
    register_sheet.getRange(last_row, 6).setValue(message_parameter[4])//メモ
  }
  register_sheet.getRange(last_row, 7).setValue(message_parameter[3])//支払い状況

  //メッセージ送信
  sendTextMessage('登録完了', replyToken)
}

//postBack時の処理
function doPostBackData(postBackData, replyToken) {
  switch (postBackData.action) {
    case 'delete':
      console.log('delete record:' + postBackData.row)
      deleteData(replyToken, postBackData.row)
    default:
      console.error('Not assumed postData', postBackData.action)
  }
}

function setBuyDate(post_message) {
  now = new Date()
  switch (post_message) {
    case '今日':
      return now
    case '昨日':
      return new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1)
    case '一昨日':
      return new Date(now.getFullYear(), now.getMonth(), now.getDate() - 2)
  }

  now = new Date()
  //1桁もしくは2桁の日付表記の場合
  if (post_message.match(/^[1-9]{1}$/) || post_message.match(/^\d{2}$/)) {
    return new Date(now.getFullYear(), now.getMonth(), post_message)
  }

  //4桁の月日表記の場合
  if (post_message.match(/^\d{4}$/)) {
    return new Date(now.getFullYear(), post_message.substring(0, 2) - 1, post_message.substring(2))
  }

  return new Date(post_message)
}

function setHelpMessage(post_message) {
  switch (post_message) {
    case 'カテゴリ':
      return 'カテゴリは、' + CATEGORY_LIST + 'のいずれかを入力してください。'
    case '支払い状況':
      return '支払い状況は、' + PAYMENT_STATUS_LIST + 'のいずれかを入力してください。'
    case 'ヘルプ':
      return HELP_MESSAGE
  }
}

function setMenuMessage(post_message) {

  switch (post_message) {
    case '残高':
      return getBalance(new Date())
    case '今月':
      return getBalance(new Date())
    case '先月':
      date = new Date()
      console.log(date)
      return getBalance(new Date(date.getFullYear(), date.getMonth() - 1, 1))
    default:
      return getBalance(new Date(post_message))
  }
}

function getBalance(date) {
  //家計簿シートから情報取得
  console.log('get sheet start')
  if (date.getFullYear < 2021) {
    console.log('out of range year:' + date.getFullYear)
    return ''
  }

  sheet = SpreadsheetApp.openById(scriptProperties.getProperty("SHEET_ID")).getSheetByName(String(date.getFullYear()));
  //対象月の列を取得
  row = date.getMonth() + 21
  //対象月の金額を取得
  money_range = sheet.getRange(row, 3, 1, 13)

  //返却値
  return_message = date.getFullYear() + '/' + String(date.getMonth() + 1) + 'の残高は'
  column = 3
  //取得したセルをループして返却値を追加
  money_range.getValues().forEach(e => {
    e.forEach(f => {
      return_message = return_message + '\n' + sheet.getRange(20, column).getValue() + ':' + f
      column++
    })
  })

  return return_message
}

//削除メッセージ受信時
function sendDeleteButton(replyToken) {
  console.log('send delete button message')

  sheet_name = '2022_List'
  var register_sheet = SpreadsheetApp.openById(scriptProperties.getProperty("SHEET_ID")).getSheetByName(sheet_name);
  lastRow = register_sheet.getLastRow()

  const actions = []
  //3行分のデータを取得(ボタンテンプレートはMax4件まで)
  for (i = 0; i < 3; i++) {
    records = register_sheet.getRange(lastRow - i, 2, 1, 3).getValues().map(e => {
      e[1] = e[1] + "円"
      if (date = new Date(e[2])) {
        e[2] = date.getMonth() + 1 + "/" + date.getDate()
      }
      return e
    })

    actions.push(
      {
        "type": "postback",
        "label": records.join(","),
        "data": JSON.stringify({ "action": "delete", "row": lastRow - i })
      }
    )
  }

  const LineMessageObject = [{
    "type": "template",
    "altText": "This is a buttons template",
    "template": {
      "type": "buttons",
      "title": "削除",
      "text": "削除する記録を選択してください",
      "actions": actions
    }
  }]

  sendMessage(LineMessageObject, replyToken)
}

function deleteData(replyToken, row) {

  sheet_name = '2022_List'
  var sheet = SpreadsheetApp.openById(scriptProperties.getProperty("SHEET_ID")).getSheetByName(sheet_name);
  //対象行の削除
  sheet.deleteRow(row)

  //メッセージ送信
  sendTextMessage('削除完了', replyToken)
}
