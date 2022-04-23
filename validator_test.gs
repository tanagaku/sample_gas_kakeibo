var exports = GASUnit.exports
var assert = GASUnit.assert

function Test_validateRegistMessage () {
  exports({
    'Array': {
      '#indexOf()': {
        '正常系': function () {
              parameter = ['食費','2000','2022/12/12','共通財布'];
              result = JSON.stringify(validateMessage(parameter))
              expected = JSON.stringify({'result': true,'message':''})
              assert(expected == result)
        },
        'リクエストが4項目未満の場合reulst=false,messageを返却': function () {
              parameter = []
              result = JSON.stringify(validateRegistMessage(parameter))
              expected = JSON.stringify({'result': false,'message':'カテゴリ、金額、購入日、支払いを入力してください。'})
              assert(expected == result)
        }
      }
    }
  })
}

function Test_isDatePattern(){
  exports({
    'Array': {
      '#indexOf()': {
        'yyyy/mm/dd': function () {
              parameter = '2021/12/21'
              result = isDatePattern(parameter)
              assert(result)
        },
        'd' : function () {
              parameter = '2'
              result = isDatePattern(parameter)
              assert(result)          
        },
        'dd' : function () {
              parameter = '28'
              result = isDatePattern(parameter)
              assert(result)          
        },
        'MMdd' : function () {
              parameter = '1228'
              result = isDatePattern(parameter)
              assert(result)          
        },
        'yyyy/mm/dd false': function () {
              parameter = '2021/13/32'
              result = isDatePattern(parameter)
              assert(!result)
        },
        'd false' : function () {
              parameter = '0'
              result = isDatePattern(parameter)
              assert(!result)          
        },
        'dd false' : function () {
              parameter = '32'
              result = isDatePattern(parameter)
              assert(!result)          
        },
        'MMdd false' : function () {
              parameter = '1332'
              result = isDatePattern(parameter)
              assert(!result)          
        }                    
      }
    }
  })
}