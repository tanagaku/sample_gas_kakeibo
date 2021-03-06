import * as validator from '../validator';
const CATEGORY_LIST = ['食費', '外食費', '日用品', 'ヘルスケア', '娯楽費', '電気代', 'ガス代', '水道代', '家賃', '入金', 'その他']
const PAYMENT_STATUS_LIST = ['共通財布', '精算済', '未精算']
export const DAY_LIST = ['今日', '昨日', '一昨日']

//validateRegistMessage Test
test('正常系', () => {
  const parameter = ['食費', '2000', '2022/12/12', '共通財布'];
  expect(validator.validateRegistMessage(parameter, CATEGORY_LIST, PAYMENT_STATUS_LIST, DAY_LIST))
    .toStrictEqual({ 'result': true, 'message': '' });
});
test('リクエストが4項目未満の場合reulst=false,messageを返却', () => {
  const parameter: never[] = [];
  expect(validator.validateRegistMessage(parameter, CATEGORY_LIST, PAYMENT_STATUS_LIST, DAY_LIST))
    .toStrictEqual({ 'result': false, 'message': 'カテゴリ、金額、購入日、支払いを入力してください。' });
});
test('1行目がカテゴリリストに存在しない文字列の場合reulst=false,messageを返却', () => {
  const parameter = ['test', '2000', '2022/12/12', '共通財布'];
  expect(validator.validateRegistMessage(parameter, CATEGORY_LIST, PAYMENT_STATUS_LIST, DAY_LIST))
    .toStrictEqual({ 'result': false, 'message': '1行目は、カテゴリを入力してください。\nカテゴリ:' + CATEGORY_LIST });
});
test('2行目が数値ではない場合reulst=false,messageを返却', () => {
  const parameter = ['食費', 'test', '2022/12/12', '共通財布'];
  expect(validator.validateRegistMessage(parameter, CATEGORY_LIST, PAYMENT_STATUS_LIST, DAY_LIST))
    .toStrictEqual({ 'result': false, 'message': '2行目は、金額を入力してください。' });
});
test('3行目が日付ではない場合reulst=false,messageを返却', () => {
  const parameter = ['食費', '2000', 'test', '共通財布'];
  expect(validator.validateRegistMessage(parameter, CATEGORY_LIST, PAYMENT_STATUS_LIST, DAY_LIST))
    .toStrictEqual({ 'result': false, 'message': '3行目は、購入日を入力してください。' });
});
test('4行目が支払い状況ではない場合reulst=false,messageを返却', () => {
  const parameter = ['食費', '2000', '2022/12/12', 'test'];
  expect(validator.validateRegistMessage(parameter, CATEGORY_LIST, PAYMENT_STATUS_LIST, DAY_LIST))
    .toStrictEqual({ 'result': false, 'message': '4行目は、支払い状況を入力してください。\n支払い状況:' + PAYMENT_STATUS_LIST });
});

//isDatePattern Test
test('yyyy/mm/dd true', () => {
  expect(validator.isDatePattern('2021/12/21', DAY_LIST)).toBe(true);
});
test('d true', () => {
  expect(validator.isDatePattern('2', DAY_LIST)).toBe(true);
});
test('dd true', () => {
  expect(validator.isDatePattern('28', DAY_LIST)).toBe(true);
});
test('MMdd true', () => {
  expect(validator.isDatePattern('1228', DAY_LIST)).toBe(true);
});
test('日付リストの文字列の場合 true', () => {
  expect(validator.isDatePattern('今日', DAY_LIST)).toBe(true);
});
test('値がセットされていない場合 false', () => {
  expect(validator.isDatePattern("", DAY_LIST)).toBe(false);
});
test('2021/13/32 false', () => {
  expect(validator.isDatePattern('2021/13/32', DAY_LIST)).toBe(false);
});
test('0 day false', () => {
  expect(validator.isDatePattern('0', DAY_LIST)).toBe(false);
});
test('32 day false', () => {
  expect(validator.isDatePattern('32', DAY_LIST)).toBe(false);
});
test('1332 date false', () => {
  expect(validator.isDatePattern('1332', DAY_LIST)).toBe(false);
});

