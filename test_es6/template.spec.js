/*eslint-disable no-unused-vars, no-undef, no-unused-expressions */

import chai from 'chai';

import path from 'path';
import scpdVars, {
  SvTemplate,
  defaultExprTypesDefine,
  createEmplyFindVarResult,
} from '../dist';

import {
  TestDataScopeNormal01,
  TestDataScopeRecu01,
  TestDataScopeNormal02,
  TestDataScopeRecu02,
  TestDataScopePartA01,
  TestDataScopePartB01,
  TestDataScopePartA02,
  TestDataScopePartB02,
} from './test-data/test-data-scope';

var expect = chai.expect;
var assert = chai.assert;

describe('Template test', () => {
  describe('SvTemplate', () => {
    let _template = null;
    beforeEach(done => {
      _template = new SvTemplate(defaultExprTypesDefine);
      done();
    });

    afterEach(done => {
      _template = null;
      done();
    });

    it('Should has a method: getScopeClass', done => {
      expect(_template).to.have.property('getScopeClass')
        .and.not.equal(null);
      done();
    });

    it('Should has a method: getExpressionClass', done => {
      expect(_template).to.have.property('getExpressionClass')
        .and.not.equal(null);
      done();
    });
  });

  describe('SvExpression', () => {
    let _template = new SvTemplate(defaultExprTypesDefine);
    let SvExpression = null;
    beforeEach(done => {
      SvExpression = _template.getExpressionClass();
      done();
    });

    afterEach(done => {
      SvExpression = null;
      done();
    });

    it('Should be able to be created from SvTemplate', done => {
      expect(SvExpression, 'SvExpression is ' + SvExpression).not.to.equal(undefined);
      done();
    });

    describe('static method normalizeExprInfo', () => {
      it('Should return the correct typeName from rawData', done => {
        let exprInfo1 = SvExpression.normalizeExprInfo('@eexpr:ssss');
        expect(exprInfo1.typeName, 'exprInfo1.typeName is ' + exprInfo1.typeName).to.equal('@eexpr');

        let exprInfo2 = SvExpression.normalizeExprInfo('@seexpr:ssss');
        expect(exprInfo2.typeName, 'exprInfo2.typeName is ' + exprInfo2.typeName).to.equal('');
        done();
      });
    });

    describe('static method parse', () => {
      it('Should parse SvExpression from rawData', done => {
        let exprObj1 = SvExpression.parse(null, 'xxx', '@eexpr:ssss');
        expect(exprObj1.exprInfo.typeName, 'exprObj1.exprInfo.typeName is ' + exprObj1.exprInfo.typeName).to.equal('@eexpr');
        expect(exprObj1.exprInfo.tokens[0], 'exprObj1.exprInfo.tokens[0] is ' + exprObj1.exprInfo.tokens[0]).to.equal('ssss');

        let exprObj2 = SvExpression.parse(null, 'xxx', '@seexpr:ssss');
        expect(exprObj2.exprInfo.typeName, 'exprObj2.exprInfo.typeName is ' + exprObj2.exprInfo.typeName).to.equal('');
        expect(exprObj2.exprInfo.tokens[0], 'exprObj2.exprInfo.tokens[0] is ' + exprObj2.exprInfo.tokens[0]).to.equal('@seexpr:ssss');
        done();
      });
    });
  });

  describe('SvScope', () => {
    it('Should be able to be created from SvTemplate', done => {
      let _template = new SvTemplate(defaultExprTypesDefine);
      let SvScope = _template.getScopeClass();
      expect(SvScope, 'SvScope is ' + SvScope).not.to.equal(undefined);
      done();
    });

    it('Should be able to create instances', done => {
      let _template = new SvTemplate(defaultExprTypesDefine);
      let SvScope = _template.getScopeClass();
      let scope = new SvScope({});
      expect(scope, 'scope is ' + scope).not.to.equal(undefined);
      done();
    });

    describe('eval tests', () => {
      let _template = new SvTemplate(defaultExprTypesDefine);
      let SvScope = _template.getScopeClass();

      describe('test 1', () => {
        it('Should be able to create instances', done => {
          let scope = new SvScope({});
          expect(scope, 'scope is ' + scope).not.to.equal(undefined);
          expect(scope, 'scope is ' + scope).to.be.an.instanceof(SvScope);
          done();
        });

        it('Should be able to eval vars', done => {
          let scope = new SvScope(TestDataScopeNormal01);
          scope.evalVars();
          let varValue = scope.evalVar('var1', new Set());
          expect(varValue, 'varValue is ' + varValue).to.equal('123456789');

          scope = new SvScope(TestDataScopeNormal02);
          scope.evalVars();
          varValue = scope.evalVar('var1', new Set());
          expect(varValue, 'varValue is ' + varValue).to.equal('123456789');
          done();
        });

        it('Should be able to throw an error while evaling circular dependency vars', done => {
          let scope = new SvScope(TestDataScopeRecu01);
          let errorThrown = false;
          try{
            scope.evalVars();
          }catch(e){
            if(e.message.indexOf('Circular dependencies occured') !== -1){
              errorThrown = true;
            }
          }
          expect(errorThrown).to.equal(true);

          scope = new SvScope(TestDataScopeRecu02);
          errorThrown = false;
          try{
            scope.evalVars();
          }catch(e){
            if(e.message.indexOf('Circular dependencies occured') !== -1){
              errorThrown = true;
            }
          }
          expect(errorThrown).to.equal(true);
          done();
        });

        it('Should be able to eval vars by using an external search function', done => {
          let simpleStack = [];
          let simpleFind = (visitorScope, varName) => {
            for(var i = simpleStack.length - 1; i >= 0; i--) {
              let result = simpleStack[i].findVarLocal(visitorScope, varName);
              if(result.var){
                return result;
              }
            }
            return createEmplyFindVarResult();
          };

          let scopeA = new SvScope(TestDataScopePartA01,
            {
              findVar: simpleFind,
            });
          simpleStack.push(scopeA);
          scopeA.evalVars();

          let scopeB = new SvScope(TestDataScopePartB01,
            {
              findVar: simpleFind,
            });
          simpleStack.push(scopeB);
          scopeB.evalVars();

          let var1ValueInB = scopeB.evalVar('var1', new Set());
          expect(var1ValueInB, 'var1ValueInB is ' + var1ValueInB).to.equal('B1B2B3B4B5B6B7A8A9');
          
          let var7ValueInA = scopeA.evalVar('var7', new Set());
          expect(var7ValueInA, 'var7ValueInA is ' + var7ValueInA).to.equal('A7A8A9');

          let var7ValueInB = scopeB.evalVar('var7', new Set());
          expect(var7ValueInB, 'var7ValueInB is ' + var7ValueInB).to.equal('B7A8A9');
          done();
        });

        it('Should be able to eval \'@dexpr\' expressions (cases)', done => {
          let simpleStack = [];
          let simpleFind = (visitorScope, varName) => {
            for(var i = simpleStack.length - 1; i >= 0; i--) {
              let result = simpleStack[i].findVarLocal(visitorScope, varName);
              if(result.var){
                return result;
              }
            }
            return createEmplyFindVarResult();
          };

          let scopeA = new SvScope(TestDataScopePartA02,
            {
              findVar: simpleFind,
            });
          simpleStack.push(scopeA);
          scopeA.evalVars();

          let scopeB = new SvScope(TestDataScopePartB02,
            {
              findVar: simpleFind,
            });
          simpleStack.push(scopeB);
          scopeB.evalVars();

          let var1ValueInB = scopeB.evalVar('var1', new Set());
          expect(var1ValueInB, 'var1ValueInB is ' + var1ValueInB).to.equal('B1B2B3B4B5B6B7A8A9(cases)');
          
          let var5_2ValueInB = scopeB.evalVar('var5-2', new Set());
          expect(var5_2ValueInB, 'var5_2ValueInB is ' + var5_2ValueInB).to.equal('B5B6B7A8A9(default)');
          
          let var5_3ValueInB = scopeB.evalVar('var5-3', new Set());
          expect(var5_3ValueInB, 'var5_3ValueInB is ' + var5_3ValueInB).to.equal('B5B6B7A8A9(default)');
          done();
        });

        it('Should be able to eval vars while creating', done => {
          let scope = new SvScope(TestDataScopeNormal01,
            {
              autoEval: true,
            });
          let varValue = scope.evalVar('var1', new Set());
          expect(varValue, 'varValue is ' + varValue).to.equal('123456789');
          done();
        });
      });
    });
  });
});

