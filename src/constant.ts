import * as line_fetch from './line_fetch';

export const CATEGORY_LIST = getProperties(1)
export const DAY_LIST = ['今日', '昨日', '一昨日']
export const PAYMENT_STATUS_LIST = getProperties(2)
export const HELP_MESSAGE_LIST = ['ヘルプ', 'カテゴリ', '支払い状況']
export const DELETE = '削除'
export const SHEET_NAME = 'List'
export const ACCOUNT_LIST = ['今月', '先月', '残高']
export const HELP_MESSAGE = '入力は\n1行目:カテゴリ\n2行目:金額\n3行目:購入日\n4行目:支払い状況\nを入力してください。\n残高確認は\n' + ACCOUNT_LIST + ',指定したい年月日(yyyy/MM/dd)\nを入力してください。'


//削除メッセージ受信時
export function getProperties(row: number): Array<string> {

  const categories: string[] = []

  if (line_fetch.SHEET_ID == null) {
    console.error('failed to get spreadsheet')
    return categories
  }

  var sheets = SpreadsheetApp.openById(line_fetch.SHEET_ID).getSheetByName(SHEET_NAME);
  if (sheets == null) {
    console.error('failed to get spreadsheet')
    return categories
  }

  const lastRow = sheets.getLastRow()

  for (let i = 1; i < lastRow; i++) {
    const record = sheets.getRange(i, row).getValue()
    if (!record) {
      break
    }
    categories.push(record)
  }
  return categories
}