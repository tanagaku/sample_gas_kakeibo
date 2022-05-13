const date_util = require('../date_util');

//setBuyDate Test
const now = new Date();
test('yyyy/mm/dd', () => {
  const parameter = '2021/12/21'
  expect(date_util.setBuyDate(parameter)).toStrictEqual(new Date(parameter));
});
test('d', () => {
  const parameter = '2'
  expect(date_util.setBuyDate(parameter))
    .toStrictEqual(new Date(now.getFullYear(), now.getMonth(), Number(parameter)));
});
test('dd', () => {
  const parameter = '28'
  expect(date_util.setBuyDate(parameter))
    .toStrictEqual(new Date(now.getFullYear(), now.getMonth(), Number(parameter)));
});
test('MMdd', () => {
  const parameter = '1228'
  expect(date_util.setBuyDate(parameter))
    .toStrictEqual(new Date(now.getFullYear(), Number(parameter.substring(0, 2)) - 1, Number(parameter.substring(2))));
});
test('今日', () => {
  const parameter = '今日'
  expect(date_util.setBuyDate(parameter)).toStrictEqual(new Date());
});
test('昨日', () => {
  const parameter = '昨日'
  expect(date_util.setBuyDate(parameter))
    .toStrictEqual(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1));
});
test('一昨日', () => {
  const parameter = '一昨日'
  expect(date_util.setBuyDate(parameter))
    .toStrictEqual(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 2));
});
