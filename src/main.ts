import * as validator from './validator';
import * as date_util from './date_util';
import * as line_fetch from './line_fetch';

import { CATEGORY_LIST, PAYMENT_STATUS_LIST, HELP_MESSAGE, HELP_MESSAGE_LIST, TOTAL_SHEET_NAME, DELETE, ACCOUNT_LIST, SHEET_ID, DAY_LIST } from './constant';


export function doPost(e: any) {

  // メッセージをjsonパースして取得
  var json = JSON.parse(e.postData.getDataAsString())
  console.info('doPost.event:' + e.postData.getDataAsString())

  //返信用のトークン取得
  var replyToken = json.events[0].replyToken;
  //トークンが取れなかったら終了
  if (typeof replyToken === 'undefined') {
    console.error('fail to get reply token')
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
    console.info("reply help message")
    //メッセージ送信
    line_fetch.sendTextMessage(setHelpMessage(message_parameter[0]), replyToken)
    return
  }

  //削除メッセージが送信されたとき
  if (DELETE.match(message_parameter[0])) {
    console.info("reply delete button message")
    sendDeleteButton(replyToken)
    return
  }

  //menuメッセージが入力された場合用のメッセージを詰める
  if (ACCOUNT_LIST.some(e => e.match(message_parameter[0]))) {
    console.info("reply menu message")
    //メッセージ送信
    line_fetch.sendTextMessage(setMenuMessage(message_parameter[0]), replyToken)
  }

  //メッセージのバリデートチェック
  console.info('validateMessage start. message_parameter:' + message_parameter)
  const validateResult = validator.validateRegistMessage(message_parameter, CATEGORY_LIST, PAYMENT_STATUS_LIST, DAY_LIST)
  console.info('validateMessage end results:' + validateResult.result)

  if (!validateResult.result) {
    //メッセージ送信
    line_fetch.sendTextMessage(validateResult.message, replyToken)
    return
  }

  //購入日をyyyy/MM/dd形式にformat
  var buy_date = date_util.setBuyDate(message_parameter[2])
  var buy_date_str = Utilities.formatDate(buy_date, 'JST', 'yyyy/MM/dd');

  //家計簿シートに登録
  console.info('regist sheet start')
  if (SHEET_ID == null) {
    console.error('failed to get spreadsheet')
    return
  }

  var register_sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(TOTAL_SHEET_NAME);

  if (register_sheet == null) {
    console.error('failed to get spreadsheet')
    return
  }

  var last_row = register_sheet.getLastRow() + 1;
  var user = line_fetch.getUserProfile(json.events[0].source.userId)
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
  line_fetch.sendTextMessage('登録完了', replyToken)
}

//postBack時の処理
function doPostBackData(postBackData: { action: any; row: string; }, replyToken: any) {
  switch (postBackData.action) {
    case 'delete':
      console.info('delete record:' + postBackData.row)
      deleteData(replyToken, Number(postBackData.row))
    default:
      console.error('Not assumed postData', postBackData.action)
  }
}

function setMenuMessage(post_message: any) {

  switch (post_message) {
    case '残高':
      return getBalance(new Date())
    case '今月':
      return getBalance(new Date())
    case '先月':
      const now = new Date()
      console.info(now)
      return getBalance(new Date(now.getFullYear(), now.getMonth() - 1, 1))
    default:
      return getBalance(new Date(post_message))
  }
}

function getBalance(date: Date): string {
  //家計簿シートから情報取得
  console.info('get sheet start')
  if (Number(date.getFullYear) < 2021) {
    console.warn('out of range year:' + date.getFullYear)
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

//削除メッセージ受信時
function sendDeleteButton(replyToken: any) {
  console.info('send delete button message')

  if (SHEET_ID == null) {
    console.error('failed to get spreadsheet')
    return
  }
  var register_sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(TOTAL_SHEET_NAME);
  if (register_sheet == null) {
    console.error('failed to get spreadsheet')
    return
  }
  const lastRow = register_sheet.getLastRow()

  const actions = []
  //3行分のデータを取得(ボタンテンプレートはMax4件まで)
  var count = 3
  if (lastRow < 3) {
    //1行目はヘッダーなので除外
    count = lastRow - 1
  }

  for (let i = 0; i < count; i++) {
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

  if (!actions.length) {
    //メッセージ送信
    line_fetch.sendTextMessage('削除対象のデータがありません', replyToken)
    return
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

  line_fetch.sendMessage(LineMessageObject, replyToken)
}

function deleteData(replyToken: any, row: number) {

  if (SHEET_ID == null) {
    console.error('failed to get spreadsheet')
    return
  }
  var sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(TOTAL_SHEET_NAME);
  //対象行の削除
  if (sheet == null) {
    console.error('failed to get spreadsheet')
    return
  }
  sheet.deleteRow(row)

  //メッセージ送信
  line_fetch.sendTextMessage('削除完了', replyToken)
}
