/**
 * 送られてきたメッセージのバリデートチェック
 */
export function validateRegistMessage(message_parameter: any[], categoryList: string[], paymentStatusList: string[], dayList: string[]): { result: boolean; message: string } {

  //message_parameterが指定の数かチェック
  if (message_parameter.length < 4) {
    return { 'result': false, 'message': 'カテゴリ、金額、購入日、支払いを入力してください。' }
  }

  //1行目の情報チェック(カテゴリ)
  if (!message_parameter[0] || !categoryList.some(e => e.match(message_parameter[0]))) {
    return { 'result': false, 'message': '1行目は、カテゴリを入力してください。\nカテゴリ:' + categoryList }
  }
  //2行目の情報チェック(金額)
  if (isNaN(message_parameter[1])) {
    return { 'result': false, 'message': '2行目は、金額を入力してください。' }
  }
  //3行目の情報チェック(購入日)
  if (!isDatePattern(message_parameter[2], dayList)) {
    return { 'result': false, 'message': '3行目は、購入日を入力してください。' }
  }
  //4行目の情報チェック(支払い状況)
  if (!message_parameter[3] || !paymentStatusList.some(e => e.match(message_parameter[3]))) {
    return { 'result': false, 'message': '4行目は、支払い状況を入力してください。\n支払い状況:' + paymentStatusList }
  }
  return { 'result': true, 'message': '' }
}

//日付入力パターン似合っているチェック
export function isDatePattern(post_message: string, dayList: string[]) {
  if (!post_message) {
    return false
  }

  if (dayList.some(e => e.match(post_message))) {
    return true
  }

  const now = new Date()
  //1桁もしくは2桁の日付表記の場合
  if (post_message == '0') {
    return false
  }

  if (post_message.match(/^[1-9]{1}$/) || post_message.match(/^\d{2}$/)) {
    const target_date = new Date(now.getFullYear(), now.getMonth(), Number(post_message))

    //存在しない日付の場合(現在月と差分が生まれる場合false)
    if (target_date.getMonth() != now.getMonth()) {
      return false
    }
    return true
  }

  //4桁の月日表記の場合
  if (post_message.match(/^\d{4}$/)) {
    const target_date = new Date(now.getFullYear(), Number(post_message.substring(0, 2)) - 1, Number(post_message.substring(2)))

    //存在しない日付の場合(年月が繰り上がりとうしている場合false)
    if (target_date.getFullYear() != now.getFullYear() || target_date.getMonth() + 1 != Number(post_message.substring(0, 2))) {
      return false
    }
    return true
  }

  if (Number((new Date(post_message)))) {
    return true
  }

  return false
}