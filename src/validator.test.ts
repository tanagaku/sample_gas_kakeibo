const validator = require('./validator');


//isDatePattern Test
test('yyyy/mm/dd', () => {
  expect(validator.isDatePattern('2021/12/21')).toBe(true);
});
