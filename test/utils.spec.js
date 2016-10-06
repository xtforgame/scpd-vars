'use strict';

var _chai = require('chai');

var _chai2 = _interopRequireDefault(_chai);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _utils = require('../dist/utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var expect = _chai2.default.expect;
var assert = _chai2.default.assert;

describe('Utils test', function () {
  describe('escapeString', function () {
    it('Should be able to escape string with the EscapeChar:\'' + _utils.EscapeChar + '\'', function (done) {
      var rawString = _utils.EscapeChar + _utils.EscapeChar + '${ }';
      var escapedResult = (0, _utils.escapeString)(rawString);
      expect(escapedResult, 'failed, the rawString is \'' + rawString + '\'').to.equal('' + _utils.EscapeChar + _utils.EscapeChar + _utils.EscapeChar + _utils.EscapeChar + _utils.EscapeChar + '${ }');

      rawString = '${ }';
      escapedResult = (0, _utils.escapeString)(rawString);
      expect(escapedResult, 'failed, the rawString is \'' + rawString + '\'').to.equal('' + _utils.EscapeChar + '${ }');
      done();
    });
  });

  describe('unescapeString', function () {
    it('Should be able to unescape string with the EscapeChar:\'' + _utils.EscapeChar + '\'', function (done) {
      var rawString = '' + _utils.EscapeChar + _utils.EscapeChar + _utils.EscapeChar + _utils.EscapeChar + _utils.EscapeChar + '${ }';
      var unescapedResult = (0, _utils.unescapeString)(rawString);
      expect(unescapedResult, 'failed, the rawString is \'' + rawString + '\'').to.equal(_utils.EscapeChar + _utils.EscapeChar + '${ }');

      rawString = '' + _utils.EscapeChar + '${ }';
      unescapedResult = (0, _utils.unescapeString)(rawString);
      expect(unescapedResult, 'failed, the rawString is \'' + rawString + '\'').to.equal('${ }');
      done();
    });
  });

  describe('findContentInBracket', function () {
    it('Should be able to get the start, finsh, and trimmed content string', function (done) {
      var rawString = _utils.EscapeChar + _utils.EscapeChar + '${ }';
      var findResult = (0, _utils.findContentInBracket)(rawString);
      expect(findResult[0], 'failed, the rawString is \'' + rawString + '\'').to.equal(2);
      expect(findResult[1], 'failed, the rawString is \'' + rawString + '\'').to.equal(6);
      expect(findResult[2], 'failed, the rawString is \'' + rawString + '\'').to.equal('');

      rawString = 'sefsfe${ 	sss }srdgr';
      findResult = (0, _utils.findContentInBracket)(rawString);
      expect(findResult[0], 'failed, the rawString is \'' + rawString + '\'').to.equal(6);
      expect(findResult[1], 'failed, the rawString is \'' + rawString + '\'').to.equal(15);
      expect(findResult[2], 'failed, the rawString is \'' + rawString + '\'').to.equal('sss');
      done();
    });

    it('Should return null if left bracket is not found', function (done) {
      var rawString = '$ {';
      var findResult = (0, _utils.findContentInBracket)(rawString);
      expect(findResult, 'failed, the rawString is \'' + rawString + '\'').to.equal(null);

      rawString = _utils.EscapeChar + '${';
      findResult = (0, _utils.findContentInBracket)(rawString);
      expect(findResult, 'failed, the rawString is \'' + rawString + '\'').to.equal(null);
      done();
    });

    it('Should return -1 as finsh position, null as content string, if right bracket is not found', function (done) {
      var rawString = '${';
      var findResult = (0, _utils.findContentInBracket)(rawString);
      expect(findResult[0], 'failed, the rawString is \'' + rawString + '\'').to.equal(0);
      expect(findResult[1], 'failed, the rawString is \'' + rawString + '\'').to.equal(-1);
      expect(findResult[2], 'failed, the rawString is \'' + rawString + '\'').to.equal(null);
      done();
    });
  });
});