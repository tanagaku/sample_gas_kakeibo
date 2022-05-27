import { CATEGORY_LIST, PAYMENT_STATUS_LIST, HELP_MESSAGE } from './constant';

export function setBuyDate(post_message: string) {
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
