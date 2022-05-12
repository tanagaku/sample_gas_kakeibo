// sum.test.js
const validator = require('./validator');

test('adds 1 + 2 to equal 3', () => {
  expect(validator.isDatePattern('2021/12/21')).toBe(3);
});
