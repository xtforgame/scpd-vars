/*eslint-disable no-unused-vars, no-undef, no-unused-expressions */

import chai from 'chai';

import path from 'path';

import {
  escapeString,
  unescapeString,
  findContentInBracket,
  EscapeChar,
} from '../dist/utils';

var expect = chai.expect;
var assert = chai.assert;

describe('Utils test', () => {
  describe('escapeString', () => {
    it('Should be able to escape string with the EscapeChar:\'' + EscapeChar + '\'', done => {
      let rawString = EscapeChar + EscapeChar + '${ }';
      let escapedResult = escapeString(rawString);
      expect(escapedResult, `failed, the rawString is '${rawString}'`).to.equal(`${EscapeChar}${EscapeChar}${EscapeChar}${EscapeChar}${EscapeChar}` + '${ }');

      rawString = '${ }';
      escapedResult = escapeString(rawString);
      expect(escapedResult, `failed, the rawString is '${rawString}'`).to.equal(`${EscapeChar}` + '${ }');
      done();
    });
  });

  describe('unescapeString', () => {
    it('Should be able to unescape string with the EscapeChar:\'' + EscapeChar + '\'', done => {
      let rawString = `${EscapeChar}${EscapeChar}${EscapeChar}${EscapeChar}${EscapeChar}` + '${ }';
      let unescapedResult = unescapeString(rawString);
      expect(unescapedResult, `failed, the rawString is '${rawString}'`).to.equal(EscapeChar + EscapeChar + '${ }');

      rawString = `${EscapeChar}` + '${ }';
      unescapedResult = unescapeString(rawString);
      expect(unescapedResult, `failed, the rawString is '${rawString}'`).to.equal('${ }');
      done();
    });
  });

  describe('findContentInBracket', () => {
    it('Should be able to get the start, finsh, and trimmed content string', done => {
      let rawString = EscapeChar + EscapeChar + '${ }';
      let findResult = findContentInBracket(rawString);
      expect(findResult[0], `failed, the rawString is '${rawString}'`).to.equal(2);
      expect(findResult[1], `failed, the rawString is '${rawString}'`).to.equal(6);
      expect(findResult[2], `failed, the rawString is '${rawString}'`).to.equal('');

      rawString = 'sefsfe${ 	sss }srdgr';
      findResult = findContentInBracket(rawString);
      expect(findResult[0], `failed, the rawString is '${rawString}'`).to.equal(6);
      expect(findResult[1], `failed, the rawString is '${rawString}'`).to.equal(15);
      expect(findResult[2], `failed, the rawString is '${rawString}'`).to.equal('sss');
      done();
    });

    it('Should return null if left bracket is not found', done => {
      let rawString = '$ {';
      let findResult = findContentInBracket(rawString);
      expect(findResult, `failed, the rawString is '${rawString}'`).to.equal(null);

      rawString = EscapeChar + '${';
      findResult = findContentInBracket(rawString);
      expect(findResult, `failed, the rawString is '${rawString}'`).to.equal(null);
      done();
    });

    it('Should return -1 as finsh position, null as content string, if right bracket is not found', done => {
      let rawString = '${';
      let findResult = findContentInBracket(rawString);
      expect(findResult[0], `failed, the rawString is '${rawString}'`).to.equal(0);
      expect(findResult[1], `failed, the rawString is '${rawString}'`).to.equal(-1);
      expect(findResult[2], `failed, the rawString is '${rawString}'`).to.equal(null);
      done();
    });
  });
});
