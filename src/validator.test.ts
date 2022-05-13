const validator = require('./validator');


//isDatePattern Test
test('yyyy/mm/dd', () => {
  expect(validator.isDatePattern('2021/12/21')).toBe(true);
});
test('d', () => {
  expect(validator.isDatePattern('2')).toBe(true);
});
test('dd', () => {
  expect(validator.isDatePattern('28')).toBe(true);
});
test('MMdd', () => {
  expect(validator.isDatePattern('1228')).toBe(true);
});
test('2021/13/32 false', () => {
  expect(validator.isDatePattern('2021/13/32')).toBe(false);
});
test('0 day false', () => {
  expect(validator.isDatePattern('0')).toBe(false);
});
test('32 day false', () => {
  expect(validator.isDatePattern('32')).toBe(false);
});
test('1332 date false', () => {
  expect(validator.isDatePattern('1332')).toBe(false);
});

