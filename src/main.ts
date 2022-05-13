/// <reference path="line_fetch.ts" />
export const SCRIPT_PROPERTIES = PropertiesService.getScriptProperties();
export const SLACK_WEBHOOK_URL = SCRIPT_PROPERTIES.getProperty("SLACK_WEBHOOK_URL")
export const SHEET_ID = SCRIPT_PROPERTIES.getProperty("SHEET_ID")
export const ACCESS_TOKEN = SCRIPT_PROPERTIES.getProperty("ACCESS_TOKEN")
export const LINE_URL = "https://api.line.me/v2/bot/message/reply"

function doPost(e: any) {

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
    const postBackData = JSON.parse(json.events[0].postback.data)
    doPostBackData(postBackData, replyToken)
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
  if (!Number(message_parameter[0]) || ACCOUNT_LIST.some(e => e.match(message_parameter[0]))) {
    console.log("reply menu message")
    //メッセージ送信
    sendTextMessage(setMenuMessage(message_parameter[0]), replyToken)
  }

  //メッセージのバリデートチェック
  console.log('validateMessage start. message_parameter:' + message_parameter)
  const validateResult = validateRegistMessage(message_parameter)
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
  if (buy_date.getFullYear() != 2022) {
    sheet_name = '2022_List'
  } else {
    sheet_name = '2021_List'
  }

  //家計簿シートに登録
  console.log('regist sheet start')
  if (SHEET_ID == null) {
    console.error('failed to get spreadsheet')
    return
  }

  var register_sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(sheet_name);

  if (register_sheet == null) {
    console.error('failed to get spreadsheet')
    return
  }

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
function doPostBackData(postBackData: { action: any; row: string; }, replyToken: any) {
  switch (postBackData.action) {
    case 'delete':
      console.log('delete record:' + postBackData.row)
      deleteData(replyToken, Number(postBackData.row))
    default:
      console.error('Not assumed postData', postBackData.action)
  }
}

function setBuyDate(post_message: string) {
  const now = new Date()

  switch (post_message) {
    case '今日':
      return now
    case '昨日':
      return new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1)
    case '一昨日':
      return new Date(now.getFullYear(), now.getMonth(), now.getDate() - 2)
  }

  //1桁もしくは2桁の日付表記の場合
  if (post_message.match(/^[1-9]{1}$/) || post_message.match(/^\d{2}$/)) {
    return new Date(now.getFullYear(), now.getMonth(), Number(post_message))
  }

  //4桁の月日表記の場合
  if (post_message.match(/^\d{4}$/)) {
    return new Date(now.getFullYear(), Number(post_message.substring(0, 2)) - 1, Number(post_message.substring(2)))
  }

  //mm/dd形式の場合
  if (post_message.match(/^\d{1,2}\/\d{1,2}$/)) {
    const dateArray = post_message.split('/');
    return new Date(now.getFullYear(), Number(dateArray[0]) - 1, Number(dateArray[1]))
  }
  return new Date(post_message)
}

function setHelpMessage(post_message: any): string {
  switch (post_message) {
    case 'カテゴリ':
      return 'カテゴリは、' + CATEGORY_LIST + 'のいずれかを入力してください。'
    case '支払い状況':
      return '支払い状況は、' + PAYMENT_STATUS_LIST + 'のいずれかを入力してください。'
    case 'ヘルプ':
      return HELP_MESSAGE
  }
  return ''
}

function setMenuMessage(post_message: any) {

  switch (post_message) {
    case '残高':
      return getBalance(new Date())
    case '今月':
      return getBalance(new Date())
    case '先月':
      const now = new Date()
      console.log(now)
      return getBalance(new Date(now.getFullYear(), now.getMonth() - 1, 1))
    default:
      return getBalance(new Date(post_message))
  }
}

function getBalance(date: Date): string {
  //家計簿シートから情報取得
  console.log('get sheet start')
  if (Number(date.getFullYear) < 2021) {
    console.log('out of range year:' + date.getFullYear)
    return ''
  }

  if (SHEET_ID == null) {
    console.error('failed to get spreadsheet')
    return ''
  }
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(String(date.getFullYear()));
  //対象月の列を取得
  const row = date.getMonth() + 21
  if (sheet == null) {
    console.error('failed to get spreadsheet')
    return ''
  }

  //対象月の金額を取得
  const money_range = sheet.getRange(row, 3, 1, 13)

  //返却値
  let return_message = date.getFullYear() + '/' + String(date.getMonth() + 1) + 'の残高は'
  let column = 3
  //取得したセルをループして返却値を追加
  money_range.getValues().forEach((e: any[]) => {
    e.forEach((f: string) => {
      return_message = return_message + '\n' + sheet.getRange(20, column).getValue() + ':' + f
      column++
    })
  })

  return return_message
}

//削除メッセージ受信時
function sendDeleteButton(replyToken: any) {
  console.log('send delete button message')

  const sheet_name = '2022_List'
  if (SHEET_ID == null) {
    console.error('failed to get spreadsheet')
    return
  }
  var register_sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(sheet_name);
  if (register_sheet == null) {
    console.error('failed to get spreadsheet')
    return
  }
  const lastRow = register_sheet.getLastRow()

  const actions = []
  //3行分のデータを取得(ボタンテンプレートはMax4件まで)
  for (let i = 0; i < 3; i++) {
    const records = register_sheet.getRange(lastRow - i, 2, 1, 3).getValues().map(e => {
      e[1] = e[1] + "円"
      const date = new Date(e[2])
      e[2] = date.getMonth() + 1 + "/" + date.getDate()
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

function deleteData(replyToken: any, row: number) {

  const sheet_name = '2022_List'
  if (SHEET_ID == null) {
    console.error('failed to get spreadsheet')
    return
  }
  var sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(sheet_name);
  //対象行の削除
  if (sheet == null) {
    console.error('failed to get spreadsheet')
    return
  }
  sheet.deleteRow(row)

  //メッセージ送信
  sendTextMessage('削除完了', replyToken)
}
