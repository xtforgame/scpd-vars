/*
https://github.com/leecrossley/replaceall

under MIT License

The MIT License (MIT)
Copyright © 2016 Lee Crossley <leee@hotmail.co.uk>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the “Software”), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/
// function replaceall(replaceThis, withThis, inThis) {
//   withThis = withThis.replace(/\$/g,'$$$$');
//   return inThis.replace(
//     new RegExp(
//       replaceThis.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|<>\-\&])/g,'\\$&'),
//       'g',
//     ),
//     withThis,
//   );
// };

function makeSearchReg(str) {
  return new RegExp(str.replace(/([/,!\\^${}[\]().*+?|<>\-&])/g, '\\$&'), 'g');
}

function normalizeReplacement(str) {
  return str.replace(/\$/g, '$$$$');
}

// const EscapeChar = '\\';
const EscapeChar = '$';
const DollarChar = '$';
const EscapeCharWithDollar = `${EscapeChar}$`;

// const EscapeCharReg = makeSearchReg(EscapeChar);
const DollarCharReg = makeSearchReg(DollarChar);
// const EscapeCharWithDollarReg = makeSearchReg(EscapeCharWithDollar);

// const EscapeCharReplacement = normalizeReplacement(EscapeChar);
// const DollarCharReplacement = normalizeReplacement(DollarChar);
const EscapeCharWithDollarReplacement = normalizeReplacement(EscapeCharWithDollar);

export {
  EscapeChar,
};

export function escapeString(rawSrting) {
  return rawSrting.replace(DollarCharReg, EscapeCharWithDollarReplacement);
}

export function unescapeString(escapedString) {
  let result = '';
  let substrStart = 0;
  for (let i = 0; i < escapedString.length; i++) {
    if (escapedString[i] === EscapeChar) {
      if (
          i >= escapedString.length - 1
          || (escapedString[i + 1] !== EscapeChar && escapedString[i + 1] !== DollarChar)
      ) {
        // [TODO] handle error
      }
      result += escapedString.substr(substrStart, i - substrStart);
      i++;
      substrStart = i;
    }
  }
  result += escapedString.substr(substrStart, escapedString.length);
  return result;
}

export function findContentInBracket(rawSrting, start = 0) {
  let bracketStart = rawSrting.indexOf('${', start);
  while (bracketStart !== -1) {
    let i = bracketStart - 1;
    for (; i >= 0; i--) {
      if (rawSrting[i] !== EscapeChar) {
        break;
      }
    }
    if ((bracketStart - i) % 2) {
      const bracketFinish = rawSrting.indexOf('}', bracketStart + 1);
      if (bracketFinish === -1) {
        return [bracketStart, bracketFinish, null];
      }
      const content = rawSrting.substr(bracketStart + 2, bracketFinish - bracketStart - 2).trim();
      return [bracketStart, bracketFinish + 1, content];
    }
    bracketStart = rawSrting.indexOf('${', bracketStart + 1);
  }
  return null;
}

export function createEmplyFindVarResult() {
  return {
    scope: null,
    var: null,
  };
}

