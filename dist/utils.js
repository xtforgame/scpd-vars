'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.escapeString = escapeString;
exports.unescapeString = unescapeString;
exports.findContentInBracket = findContentInBracket;
exports.createEmplyFindVarResult = createEmplyFindVarResult;


function makeSearchReg(str) {
  return new RegExp(str.replace(/([/,!\\^${}[\]().*+?|<>\-&])/g, '\\$&'), 'g');
}

function normalizeReplacement(str) {
  return str.replace(/\$/g, '$$$$');
}

var EscapeChar = '$';
var DollarChar = '$';
var EscapeCharWithDollar = EscapeChar + '$';

var DollarCharReg = makeSearchReg(DollarChar);

var EscapeCharWithDollarReplacement = normalizeReplacement(EscapeCharWithDollar);

exports.EscapeChar = EscapeChar;
function escapeString(rawSrting) {
  return rawSrting.replace(DollarCharReg, EscapeCharWithDollarReplacement);
}

function unescapeString(escapedString) {
  var result = '';
  var substrStart = 0;
  for (var i = 0; i < escapedString.length; i++) {
    if (escapedString[i] === EscapeChar) {
      if (i >= escapedString.length - 1 || escapedString[i + 1] !== EscapeChar && escapedString[i + 1] !== DollarChar) {}
      result += escapedString.substr(substrStart, i - substrStart);
      i++;
      substrStart = i;
    }
  }
  result += escapedString.substr(substrStart, escapedString.length);
  return result;
}

function findContentInBracket(rawSrting) {
  var start = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

  var bracketStart = rawSrting.indexOf('${', start);
  while (bracketStart !== -1) {
    var i = bracketStart - 1;
    for (; i >= 0; i--) {
      if (rawSrting[i] !== EscapeChar) {
        break;
      }
    }
    if ((bracketStart - i) % 2) {
      var bracketFinish = rawSrting.indexOf('}', bracketStart + 1);
      if (bracketFinish === -1) {
        return [bracketStart, bracketFinish, null];
      }
      var content = rawSrting.substr(bracketStart + 2, bracketFinish - bracketStart - 2).trim();
      return [bracketStart, bracketFinish + 1, content];
    }
    bracketStart = rawSrting.indexOf('${', bracketStart + 1);
  }
  return null;
}

function createEmplyFindVarResult() {
  return {
    scope: null,
    var: null
  };
}