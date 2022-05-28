function doPost() {
}/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/constant.ts":
/*!*************************!*\
  !*** ./src/constant.ts ***!
  \*************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ACCOUNT_LIST": () => (/* binding */ ACCOUNT_LIST),
/* harmony export */   "CATEGORY_LIST": () => (/* binding */ CATEGORY_LIST),
/* harmony export */   "DAY_LIST": () => (/* binding */ DAY_LIST),
/* harmony export */   "DELETE": () => (/* binding */ DELETE),
/* harmony export */   "HELP_MESSAGE": () => (/* binding */ HELP_MESSAGE),
/* harmony export */   "HELP_MESSAGE_LIST": () => (/* binding */ HELP_MESSAGE_LIST),
/* harmony export */   "PAYMENT_STATUS_LIST": () => (/* binding */ PAYMENT_STATUS_LIST),
/* harmony export */   "SHEET_NAME": () => (/* binding */ SHEET_NAME)
/* harmony export */ });
const CATEGORY_LIST = ['食費', '外食費', '日用品', 'ヘルスケア', '娯楽費', '電気代', 'ガス代', '水道代', '家賃', '入金', 'その他'];
const DAY_LIST = ['今日', '昨日', '一昨日'];
const PAYMENT_STATUS_LIST = ['共通財布', '精算済', '未精算'];
const HELP_MESSAGE_LIST = ['ヘルプ', 'カテゴリ', '支払い状況'];
const DELETE = '削除';
const SHEET_NAME = 'List';
const ACCOUNT_LIST = ['今月', '先月', '残高'];
const HELP_MESSAGE = '入力は\n1行目:カテゴリ\n2行目:金額\n3行目:購入日\n4行目:支払い状況\nを入力してください。\n残高確認は\n' + ACCOUNT_LIST + ',指定したい年月日(yyyy/MM/dd)\nを入力してください。';


/***/ }),

/***/ "./src/date_util.ts":
/*!**************************!*\
  !*** ./src/date_util.ts ***!
  \**************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "setBuyDate": () => (/* binding */ setBuyDate)
/* harmony export */ });
function setBuyDate(post_message) {
    const now = new Date();
    switch (post_message) {
        case '今日':
            return now;
        case '昨日':
            return new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
        case '一昨日':
            return new Date(now.getFullYear(), now.getMonth(), now.getDate() - 2);
    }
    //1桁もしくは2桁の日付表記の場合
    if (post_message.match(/^[1-9]{1}$/) || post_message.match(/^\d{2}$/)) {
        return new Date(now.getFullYear(), now.getMonth(), Number(post_message));
    }
    //4桁の月日表記の場合
    if (post_message.match(/^\d{4}$/)) {
        return new Date(now.getFullYear(), Number(post_message.substring(0, 2)) - 1, Number(post_message.substring(2)));
    }
    //mm/dd形式の場合
    if (post_message.match(/^\d{1,2}\/\d{1,2}$/)) {
        const dateArray = post_message.split('/');
        return new Date(now.getFullYear(), Number(dateArray[0]) - 1, Number(dateArray[1]));
    }
    return new Date(post_message);
}


/***/ }),

/***/ "./src/line_fetch.ts":
/*!***************************!*\
  !*** ./src/line_fetch.ts ***!
  \***************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ACCESS_TOKEN": () => (/* binding */ ACCESS_TOKEN),
/* harmony export */   "LINE_URL": () => (/* binding */ LINE_URL),
/* harmony export */   "SCRIPT_PROPERTIES": () => (/* binding */ SCRIPT_PROPERTIES),
/* harmony export */   "SHEET_ID": () => (/* binding */ SHEET_ID),
/* harmony export */   "SLACK_WEBHOOK_URL": () => (/* binding */ SLACK_WEBHOOK_URL),
/* harmony export */   "getUserProfile": () => (/* binding */ getUserProfile),
/* harmony export */   "sendMessage": () => (/* binding */ sendMessage),
/* harmony export */   "sendTextMessage": () => (/* binding */ sendTextMessage)
/* harmony export */ });
const SCRIPT_PROPERTIES = PropertiesService.getScriptProperties();
const SLACK_WEBHOOK_URL = SCRIPT_PROPERTIES.getProperty("SLACK_WEBHOOK_URL");
const SHEET_ID = SCRIPT_PROPERTIES.getProperty("SHEET_ID");
const ACCESS_TOKEN = SCRIPT_PROPERTIES.getProperty("ACCESS_TOKEN");
const LINE_URL = "https://api.line.me/v2/bot/message/reply";
/**
 * Textメッセージを送信する
 */
function sendTextMessage(post_message, replyToken) {
    console.info('sendTextMessage:' + post_message);
    const messageObject = [{
            'type': 'text',
            'text': post_message
        }];
    sendMessage(messageObject, replyToken);
}
//メッセージを送信する
function sendMessage(messageObject, replyToken) {
    const replyHeaders = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + ACCESS_TOKEN
    };
    const replyBody = {
        'replyToken': replyToken,
        'messages': messageObject
    };
    const replyOptions = {
        'method': 'POST',
        'headers': replyHeaders,
        'payload': JSON.stringify(replyBody)
    };
    UrlFetchApp.fetch(LINE_URL, replyOptions);
}
// profileを取得してくる関数
function getUserProfile(user_id) {
    var url = 'https://api.line.me/v2/bot/profile/' + user_id;
    var userProfile = UrlFetchApp.fetch(url, {
        'headers': {
            'Authorization': 'Bearer ' + ACCESS_TOKEN,
        },
    });
    return JSON.parse(userProfile.getContentText()).displayName;
}


/***/ }),

/***/ "./src/main.ts":
/*!*********************!*\
  !*** ./src/main.ts ***!
  \*********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "doPost": () => (/* binding */ doPost)
/* harmony export */ });
/* harmony import */ var _validator__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./validator */ "./src/validator.ts");
/* harmony import */ var _date_util__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./date_util */ "./src/date_util.ts");
/* harmony import */ var _line_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./line_fetch */ "./src/line_fetch.ts");
/* harmony import */ var _constant__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./constant */ "./src/constant.ts");




function doPost(e) {
    // メッセージをjsonパースして取得
    var json = JSON.parse(e.postData.getDataAsString());
    console.info('doPost.event:' + e.postData.getDataAsString());
    //返信用のトークン取得
    var replyToken = json.events[0].replyToken;
    //トークンが取れなかったら終了
    if (typeof replyToken === 'undefined') {
        console.error('fail to get reply token');
        return;
    }
    if (json.events[0].postback) {
        const postBackData = JSON.parse(json.events[0].postback.data);
        doPostBackData(postBackData, replyToken);
        return;
    }
    //送られたメッセージを取得
    var user_message = json.events[0].message.text;
    var message_parameter = user_message.split(/\r\n|\n/);
    //helpメッセージが入力された場合用のメッセージを詰める
    if (_constant__WEBPACK_IMPORTED_MODULE_3__.HELP_MESSAGE_LIST.some(e => e.match(message_parameter[0]))) {
        console.info("reply help message");
        //メッセージ送信
        _line_fetch__WEBPACK_IMPORTED_MODULE_2__.sendTextMessage(setHelpMessage(message_parameter[0]), replyToken);
        return;
    }
    //削除メッセージが送信されたとき
    if (_constant__WEBPACK_IMPORTED_MODULE_3__.DELETE.match(message_parameter[0])) {
        console.info("reply delete button message");
        sendDeleteButton(replyToken);
        return;
    }
    //menuメッセージが入力された場合用のメッセージを詰める
    if (_constant__WEBPACK_IMPORTED_MODULE_3__.ACCOUNT_LIST.some(e => e.match(message_parameter[0]))) {
        console.info("reply menu message");
        //メッセージ送信
        _line_fetch__WEBPACK_IMPORTED_MODULE_2__.sendTextMessage(setMenuMessage(message_parameter[0]), replyToken);
    }
    //メッセージのバリデートチェック
    console.info('validateMessage start. message_parameter:' + message_parameter);
    const validateResult = _validator__WEBPACK_IMPORTED_MODULE_0__.validateRegistMessage(message_parameter);
    console.info('validateMessage end results:' + validateResult.result);
    if (!validateResult.result) {
        //メッセージ送信
        _line_fetch__WEBPACK_IMPORTED_MODULE_2__.sendTextMessage(validateResult.message, replyToken);
        return;
    }
    //購入日をyyyy/MM/dd形式にformat
    var buy_date = _date_util__WEBPACK_IMPORTED_MODULE_1__.setBuyDate(message_parameter[2]);
    var buy_date_str = Utilities.formatDate(buy_date, 'JST', 'yyyy/MM/dd');
    //家計簿シートに登録
    console.info('regist sheet start');
    if (_line_fetch__WEBPACK_IMPORTED_MODULE_2__.SHEET_ID == null) {
        console.error('failed to get spreadsheet');
        return;
    }
    var register_sheet = SpreadsheetApp.openById(_line_fetch__WEBPACK_IMPORTED_MODULE_2__.SHEET_ID).getSheetByName(_constant__WEBPACK_IMPORTED_MODULE_3__.SHEET_NAME);
    if (register_sheet == null) {
        console.error('failed to get spreadsheet');
        return;
    }
    var last_row = register_sheet.getLastRow() + 1;
    var user = _line_fetch__WEBPACK_IMPORTED_MODULE_2__.getUserProfile(json.events[0].source.userId);
    var timestamp = Utilities.formatDate(new Date(), 'JST', 'yyyy/MM/dd HH:mm:ss');
    register_sheet.getRange(last_row, 1).setValue(timestamp);
    register_sheet.getRange(last_row, 2).setValue(message_parameter[0]); //カテゴリ
    register_sheet.getRange(last_row, 3).setValue(message_parameter[1]); //金額
    register_sheet.getRange(last_row, 4).setValue(buy_date_str); //購入日
    register_sheet.getRange(last_row, 5).setValue(user); //購入者
    if (message_parameter.length = 5) {
        register_sheet.getRange(last_row, 6).setValue(message_parameter[4]); //メモ
    }
    register_sheet.getRange(last_row, 7).setValue(message_parameter[3]); //支払い状況
    //メッセージ送信
    _line_fetch__WEBPACK_IMPORTED_MODULE_2__.sendTextMessage('登録完了', replyToken);
}
//postBack時の処理
function doPostBackData(postBackData, replyToken) {
    switch (postBackData.action) {
        case 'delete':
            console.info('delete record:' + postBackData.row);
            deleteData(replyToken, Number(postBackData.row));
        default:
            console.error('Not assumed postData', postBackData.action);
    }
}
function setMenuMessage(post_message) {
    switch (post_message) {
        case '残高':
            return getBalance(new Date());
        case '今月':
            return getBalance(new Date());
        case '先月':
            const now = new Date();
            console.info(now);
            return getBalance(new Date(now.getFullYear(), now.getMonth() - 1, 1));
        default:
            return getBalance(new Date(post_message));
    }
}
function getBalance(date) {
    //家計簿シートから情報取得
    console.info('get sheet start');
    if (Number(date.getFullYear) < 2021) {
        console.warn('out of range year:' + date.getFullYear);
        return '';
    }
    if (_line_fetch__WEBPACK_IMPORTED_MODULE_2__.SHEET_ID == null) {
        console.error('failed to get spreadsheet');
        return '';
    }
    const sheet = SpreadsheetApp.openById(_line_fetch__WEBPACK_IMPORTED_MODULE_2__.SHEET_ID).getSheetByName(String(date.getFullYear()));
    //対象月の列を取得
    const row = date.getMonth() + 21;
    if (sheet == null) {
        console.error('failed to get spreadsheet');
        return '';
    }
    //対象月の金額を取得
    const money_range = sheet.getRange(row, 3, 1, 13);
    //返却値
    let return_message = date.getFullYear() + '/' + String(date.getMonth() + 1) + 'の残高は';
    let column = 3;
    //取得したセルをループして返却値を追加
    money_range.getValues().forEach((e) => {
        e.forEach((f) => {
            return_message = return_message + '\n' + sheet.getRange(20, column).getValue() + ':' + f;
            column++;
        });
    });
    return return_message;
}
function setHelpMessage(post_message) {
    switch (post_message) {
        case 'カテゴリ':
            return 'カテゴリは、' + _constant__WEBPACK_IMPORTED_MODULE_3__.CATEGORY_LIST + 'のいずれかを入力してください。';
        case '支払い状況':
            return '支払い状況は、' + _constant__WEBPACK_IMPORTED_MODULE_3__.PAYMENT_STATUS_LIST + 'のいずれかを入力してください。';
        case 'ヘルプ':
            return _constant__WEBPACK_IMPORTED_MODULE_3__.HELP_MESSAGE;
    }
    return '';
}
//削除メッセージ受信時
function sendDeleteButton(replyToken) {
    console.info('send delete button message');
    if (_line_fetch__WEBPACK_IMPORTED_MODULE_2__.SHEET_ID == null) {
        console.error('failed to get spreadsheet');
        return;
    }
    var register_sheet = SpreadsheetApp.openById(_line_fetch__WEBPACK_IMPORTED_MODULE_2__.SHEET_ID).getSheetByName(_constant__WEBPACK_IMPORTED_MODULE_3__.SHEET_NAME);
    if (register_sheet == null) {
        console.error('failed to get spreadsheet');
        return;
    }
    const lastRow = register_sheet.getLastRow();
    const actions = [];
    //3行分のデータを取得(ボタンテンプレートはMax4件まで)
    var count = 3;
    if (lastRow < 3) {
        //1行目はヘッダーなので除外
        count = lastRow - 1;
    }
    for (let i = 0; i < count; i++) {
        const records = register_sheet.getRange(lastRow - i, 2, 1, 3).getValues().map(e => {
            e[1] = e[1] + "円";
            const date = new Date(e[2]);
            e[2] = date.getMonth() + 1 + "/" + date.getDate();
            return e;
        });
        actions.push({
            "type": "postback",
            "label": records.join(","),
            "data": JSON.stringify({ "action": "delete", "row": lastRow - i })
        });
    }
    const LineMessageObject = [{
            "type": "template",
            "altText": "This is a buttons template",
            "template": {
                "type": "buttons",
                "title": "削除",
                "text": "削除する記録を選択してください",
                "actions": actions
            }
        }];
    _line_fetch__WEBPACK_IMPORTED_MODULE_2__.sendMessage(LineMessageObject, replyToken);
}
function deleteData(replyToken, row) {
    const SHEET_NAME = '2022_List';
    if (_line_fetch__WEBPACK_IMPORTED_MODULE_2__.SHEET_ID == null) {
        console.error('failed to get spreadsheet');
        return;
    }
    var sheet = SpreadsheetApp.openById(_line_fetch__WEBPACK_IMPORTED_MODULE_2__.SHEET_ID).getSheetByName(SHEET_NAME);
    //対象行の削除
    if (sheet == null) {
        console.error('failed to get spreadsheet');
        return;
    }
    sheet.deleteRow(row);
    //メッセージ送信
    _line_fetch__WEBPACK_IMPORTED_MODULE_2__.sendTextMessage('削除完了', replyToken);
}


/***/ }),

/***/ "./src/validator.ts":
/*!**************************!*\
  !*** ./src/validator.ts ***!
  \**************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "isDatePattern": () => (/* binding */ isDatePattern),
/* harmony export */   "validateRegistMessage": () => (/* binding */ validateRegistMessage)
/* harmony export */ });
/* harmony import */ var _constant__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./constant */ "./src/constant.ts");

/**
 * 送られてきたメッセージのバリデートチェック
 */
function validateRegistMessage(message_parameter) {
    //message_parameterが指定の数かチェック
    if (message_parameter.length < 4) {
        return { 'result': false, 'message': 'カテゴリ、金額、購入日、支払いを入力してください。' };
    }
    //1行目の情報チェック(カテゴリ)
    if (!message_parameter[0] || !_constant__WEBPACK_IMPORTED_MODULE_0__.CATEGORY_LIST.some(e => e.match(message_parameter[0]))) {
        return { 'result': false, 'message': '1行目は、カテゴリを入力してください。\nカテゴリ:' + _constant__WEBPACK_IMPORTED_MODULE_0__.CATEGORY_LIST };
    }
    //2行目の情報チェック(金額)
    if (isNaN(message_parameter[1])) {
        return { 'result': false, 'message': '2行目は、金額を入力してください。' };
    }
    //3行目の情報チェック(購入日)
    if (!isDatePattern(message_parameter[2])) {
        return { 'result': false, 'message': '3行目は、購入日を入力してください。' };
    }
    //4行目の情報チェック(支払い状況)
    if (!message_parameter[3] || !_constant__WEBPACK_IMPORTED_MODULE_0__.PAYMENT_STATUS_LIST.some(e => e.match(message_parameter[3]))) {
        return { 'result': false, 'message': '4行目は、支払い状況を入力してください。\n支払い状況:' + _constant__WEBPACK_IMPORTED_MODULE_0__.PAYMENT_STATUS_LIST };
    }
    return { 'result': true, 'message': '' };
}
//日付入力パターン似合っているチェック
function isDatePattern(post_message) {
    if (!post_message) {
        return false;
    }
    if (_constant__WEBPACK_IMPORTED_MODULE_0__.DAY_LIST.some(e => e.match(post_message))) {
        return true;
    }
    const now = new Date();
    //1桁もしくは2桁の日付表記の場合
    if (post_message == '0') {
        return false;
    }
    if (post_message.match(/^[1-9]{1}$/) || post_message.match(/^\d{2}$/)) {
        const target_date = new Date(now.getFullYear(), now.getMonth(), Number(post_message));
        //存在しない日付の場合(現在月と差分が生まれる場合false)
        if (target_date.getMonth() != now.getMonth()) {
            return false;
        }
        return true;
    }
    //4桁の月日表記の場合
    if (post_message.match(/^\d{4}$/)) {
        const target_date = new Date(now.getFullYear(), Number(post_message.substring(0, 2)) - 1, Number(post_message.substring(2)));
        //存在しない日付の場合(年月が繰り上がりとうしている場合false)
        if (target_date.getFullYear() != now.getFullYear() || target_date.getMonth() + 1 != Number(post_message.substring(0, 2))) {
            return false;
        }
        return true;
    }
    if (Number((new Date(post_message)))) {
        return true;
    }
    return false;
}


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _main__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./main */ "./src/main.ts");

__webpack_require__.g.doPost = _main__WEBPACK_IMPORTED_MODULE_0__.doPost;

})();

/******/ })()
;