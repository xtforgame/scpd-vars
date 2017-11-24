/* eslint-disable no-unused-vars, no-undef, no-unused-expressions */

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

const expect = chai.expect;
const assert = chai.assert;

describe('Scope Chain test', () => {
  const _template = new SvTemplate(defaultExprTypesDefine);
  const SvScope = _template.getScopeClass();
  describe('Basic', () => {
    it('Should be able to eval vars by using an external search function', (done) => {
      const scopChain = new SvScopeChain();
      scopChain.pushBack();

      const scopeA = new SvScope(TestDataScopePartA01,
        {
          findVar: scopChain.findVar,
        });
      scopChain.pushBack(scopeA);
      scopeA.evalVars();

      const scopeB = new SvScope(TestDataScopePartB01,
        {
          findVar: scopChain.findVar,
        });
      scopChain.pushBack(scopeB);
      scopeB.evalVars();

      const var1ValueInB = scopeB.evalVar('var1', new Set());
      expect(var1ValueInB, `var1ValueInB is ${var1ValueInB}`).to.equal('B1B2B3B4B5B6B7A8A9');

      const var7ValueInA = scopeA.evalVar('var7', new Set());
      expect(var7ValueInA, `var7ValueInA is ${var7ValueInA}`).to.equal('A7A8A9');

      const var7ValueInB = scopeB.evalVar('var7', new Set());
      expect(var7ValueInB, `var7ValueInB is ${var7ValueInB}`).to.equal('B7A8A9');
      done();
    });
  });
});

