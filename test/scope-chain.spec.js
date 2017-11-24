/*eslint-disable no-unused-vars, no-undef, no-unused-expressions */

import chai from 'chai';

import path from 'path';

import scpdVars, {
  escapeString,
  unescapeString,
  findContentInBracket,
  SvTemplate,
  defaultExprTypesDefine,
  EscapeChar,
  createEmplyFindVarResult,
} from '../dist';

import {
  SvScopeChain,
} from '../dist/scope-chain';

import {
  TestDataScopeNormal01,
  TestDataScopeRecu01,
  TestDataScopePartA01,
  TestDataScopePartB01,
} from './test-data/test-data-scope';

var expect = chai.expect;
var assert = chai.assert;

describe('Scope Chain test', () => {
  let _template = new SvTemplate(defaultExprTypesDefine);
  let SvScope = _template.getScopeClass();
  describe('Basic', () => {
    it('Should be able to eval vars by using an external search function', done => {
      let scopChain = new SvScopeChain();
      scopChain.pushBack();

      let scopeA = new SvScope(TestDataScopePartA01,
        {
          findVar: scopChain.findVar,
        });
      scopChain.pushBack(scopeA);
      scopeA.evalVars();

      let scopeB = new SvScope(TestDataScopePartB01,
        {
          findVar: scopChain.findVar,
        });
      scopChain.pushBack(scopeB);
      scopeB.evalVars();

      let var1ValueInB = scopeB.evalVar('var1', new Set());
      expect(var1ValueInB, 'var1ValueInB is ' + var1ValueInB).to.equal('B1B2B3B4B5B6B7A8A9');
      
      let var7ValueInA = scopeA.evalVar('var7', new Set());
      expect(var7ValueInA, 'var7ValueInA is ' + var7ValueInA).to.equal('A7A8A9');

      let var7ValueInB = scopeB.evalVar('var7', new Set());
      expect(var7ValueInB, 'var7ValueInB is ' + var7ValueInB).to.equal('B7A8A9');
      done();
    });
  });
});

