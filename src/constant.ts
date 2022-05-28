import * as line_fetch from './line_fetch';

export const SCRIPT_PROPERTIES = PropertiesService.getScriptProperties();
export const SLACK_WEBHOOK_URL = SCRIPT_PROPERTIES.getProperty("SLACK_WEBHOOK_URL")
export const ACCESS_TOKEN = SCRIPT_PROPERTIES.getProperty("ACCESS_TOKEN")
export const LINE_URL = "https://api.line.me/v2/bot/message/reply"
export const SHEET_ID = SCRIPT_PROPERTIES.getProperty("SHEET_ID")
export const DAY_LIST = ['今日', '昨日', '一昨日']
export const HELP_MESSAGE_LIST = ['ヘルプ', 'カテゴリ', '支払い状況']
export const DELETE = '削除'
export const TOTAL_SHEET_NAME = 'List'
export const PROPERTY_SHEET_NAME = 'Category'
export const ACCOUNT_LIST = ['今月', '先月', '残高']
export const HELP_MESSAGE = '入力は\n1行目:カテゴリ\n2行目:金額\n3行目:購入日\n4行目:支払い状況\nを入力してください。\n残高確認は\n' + ACCOUNT_LIST + ',指定したい年月日(yyyy/MM/dd)\nを入力してください。'
export const CATEGORY_LIST = getProperties(1)
export const PAYMENT_STATUS_LIST = getProperties(2)

export function getProperties(row: number): Array<string> {

  const categories: string[] = []

  if (SHEET_ID == null) {
    console.error('failed to get spreadsheet')
    return categories
  }

  var sheets = SpreadsheetApp.openById(SHEET_ID).getSheetByName(PROPERTY_SHEET_NAME);
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