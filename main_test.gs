var exports = GASUnit.exports
var assert = GASUnit.assert

function Test_validateMessage () {
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
              result = JSON.stringify(validateMessage(parameter))
              expected = JSON.stringify({'result': false,'message':'カテゴリ、金額、購入日、支払いを入力してください。'})
              assert(expected == result)
        }
      }
    }
  })
}
