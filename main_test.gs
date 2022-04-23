var exports = GASUnit.exports
var assert = GASUnit.assert

function Test_setBuyDate(){
  now = new Date()

  exports({
    'Array': {
      '#indexOf()': {
        'yyyy/mm/dd': function () {
              parameter = '2021/12/21'
              result = setBuyDate(parameter)
              assert(result.valueOf() == new Date(parameter).valueOf())
        },
        'd' : function () {
              parameter = '2'
              result = setBuyDate(parameter)
              assert(result.valueOf() === new Date(now.getFullYear(),now.getMonth(),parameter).valueOf())
        },
        'dd' : function () {
              parameter = '28'
              result = setBuyDate(parameter)
              assert(result.valueOf() == new Date(now.getFullYear(),now.getMonth(),parameter).valueOf())
        },
        'MMdd' : function () {
              parameter = '1228'
              result = setBuyDate(parameter)
              assert(result.valueOf() == new Date(now.getFullYear(),parameter.substring(0,2)-1,parameter.substring(2)).valueOf())
        },
        '今日' : function () {
              parameter = '今日'
              result = setBuyDate(parameter)
              assert(result.valueOf() == new Date().valueOf())
        },
        '昨日' : function () {
              parameter = '昨日'
              result = setBuyDate(parameter)
              assert(result.valueOf() == new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1).valueOf())
        },
        '一昨日' : function () {
              parameter = '一昨日'
              result = setBuyDate(parameter)
              assert(result.valueOf() == new Date(now.getFullYear(), now.getMonth(), now.getDate() - 2).valueOf())
        }
      }
    }
  })
}