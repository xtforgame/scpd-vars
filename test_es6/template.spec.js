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
  TestDataScopePaths01,
} from './test-data/test-data-scope';

import {
  SvScopeChain,
} from '../dist/scope-chain';

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

        it('Should be able to eval \'@*path\' expressions (cases)', done => {
          let scope = new SvScope(TestDataScopePaths01);
          scope.evalVars();

          let srcPath = scope.evalVar('srcPath', new Set());
          let opath = scope.evalVar('opath', new Set());
          let ppath = scope.evalVar('ppath', new Set());
          let wpath = scope.evalVar('wpath', new Set());

          expect(opath, 'opath is ' + opath).to.equal(path.normalize(srcPath));
          expect(ppath, 'ppath is ' + ppath).to.equal('/a/b/e/f');
          expect(wpath, 'wpath is ' + wpath).to.equal('\\a\\b\\e\\f');
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

  describe('SvScopeLayer', () => {
    it('Should be able to be created from SvTemplate', done => {
      let _template = new SvTemplate(defaultExprTypesDefine);
      let SvScopeLayer = _template.getScopeLayerClass();
      expect(SvScopeLayer, 'SvScopeLayer is ' + SvScopeLayer).not.to.equal(undefined);
      done();
    });

    it('Should be able to create instances', done => {
      let _template = new SvTemplate(defaultExprTypesDefine);
      let SvScopeLayer = _template.getScopeLayerClass();
      let scopeChain = new SvScopeChain();
      let scopeLayer = new SvScopeLayer(scopeChain, {});
      expect(scopeLayer, 'scopeLayer is ' + scopeLayer).not.to.equal(undefined);
      done();
    });

    describe('eval tests', () => {
      let _template = new SvTemplate(defaultExprTypesDefine);
      let SvScopeLayer = _template.getScopeLayerClass();

      describe('test 1', () => {
        it('Should be able to create instances', done => {
          let scopeChain = new SvScopeChain();
          let scopeLayer = new SvScopeLayer(scopeChain, {});
          expect(scopeLayer, 'scopeLayer is ' + scopeLayer).not.to.equal(undefined);
          expect(scopeLayer, 'scopeLayer is ' + scopeLayer).to.be.an.instanceof(SvScopeLayer);
          done();
        });

        it('Should be able to eval vars', done => {
          let scopeChain = new SvScopeChain();
          let scopeLayer = new SvScopeLayer(scopeChain, {});
          scopeLayer.initScope(TestDataScopeNormal01);
          scopeLayer.evalVars();
          let varValue = scopeLayer.evalVar('var1');
          expect(varValue, 'varValue is ' + varValue).to.equal('123456789');

          scopeChain = new SvScopeChain();
          scopeLayer = new SvScopeLayer(scopeChain, {});
          scopeLayer.initScope(TestDataScopeNormal02);
          scopeLayer.evalVars();
          varValue = scopeLayer.evalVar('var1');
          expect(varValue, 'varValue is ' + varValue).to.equal('123456789');
          done();
        });

        it('Should be able to eval expr', done => {
          let scopeChain = new SvScopeChain();
          let scopeLayer = new SvScopeLayer(scopeChain, {});
          scopeLayer.initScope(TestDataScopeNormal01);
          scopeLayer.evalVars();
          let exprValue = scopeLayer.eval('@eexpr:aa${var1}bb');
          expect(exprValue, 'exprValue is ' + exprValue).to.equal('aa123456789bb');

          scopeChain = new SvScopeChain();
          scopeLayer = new SvScopeLayer(scopeChain, {});
          scopeLayer.initScope(TestDataScopeNormal02);
          scopeLayer.evalVars();
          exprValue = scopeLayer.eval('@eexpr:aa${var1}bb');
          expect(exprValue, 'exprValue is ' + exprValue).to.equal('aa123456789bb');
          done();
        });

        it('Should be able to throw an error while evaling circular dependency vars', done => {
          let scopeChain = new SvScopeChain();
          let scopeLayer = new SvScopeLayer(scopeChain, {});
          scopeLayer.initScope(TestDataScopeRecu01);
          let errorThrown = false;
          try{
            scopeLayer.evalVars();
          }catch(e){
            if(e.message.indexOf('Circular dependencies occured') !== -1){
              errorThrown = true;
            }
          }
          expect(errorThrown).to.equal(true);

          scopeChain = new SvScopeChain();
          scopeLayer = new SvScopeLayer(scopeChain, {});
          scopeLayer.initScope(TestDataScopeRecu02);
          errorThrown = false;
          try{
            scopeLayer.evalVars();
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

          let scopeChain = new SvScopeChain();
          let scopeLayerA = new SvScopeLayer(scopeChain, {});
          scopeLayerA.initScope(TestDataScopePartA01);
          scopeLayerA.evalVars();

          let scopeLayerB = new SvScopeLayer(scopeChain, {});
          scopeLayerB.initScope(TestDataScopePartB01);
          scopeLayerB.evalVars();

          let var1ValueInB_01 = scopeLayerB.evalVar('var1');
          expect(var1ValueInB_01, 'var1ValueInB_01 is ' + var1ValueInB_01).to.equal('B1B2B3B4B5B6B7A8A9');

          let var1ValueInB_02 = scopeLayerB.eval('@eexpr:aa${var1}bb');
          expect(var1ValueInB_02, 'var1ValueInB_02 is ' + var1ValueInB_02).to.equal('aaB1B2B3B4B5B6B7A8A9bb');

          let var7ValueInA_01 = scopeLayerA.evalVar('var7');
          expect(var7ValueInA_01, 'var7ValueInA_01 is ' + var7ValueInA_01).to.equal('A7A8A9');

          let var7ValueInA_02 = scopeLayerA.eval('@eexpr:aa${var7}bb');
          expect(var7ValueInA_02, 'var7ValueInA_02 is ' + var7ValueInA_02).to.equal('aaA7A8A9bb');

          let var7ValueInB_01 = scopeLayerB.evalVar('var7');
          expect(var7ValueInB_01, 'var7ValueInB_01 is ' + var7ValueInB_01).to.equal('B7A8A9');

          let var7ValueInB_02 = scopeLayerB.eval('@eexpr:aa${var7}bb');
          expect(var7ValueInB_02, 'var7ValueInB_02 is ' + var7ValueInB_02).to.equal('aaB7A8A9bb');
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

          let scopeChain = new SvScopeChain();
          let scopeLayerA = new SvScopeLayer(scopeChain, {});
          scopeLayerA.initScope(TestDataScopePartA02);
          scopeLayerA.evalVars();

          let scopeLayerB = new SvScopeLayer(scopeChain, {});
          scopeLayerB.initScope(TestDataScopePartB02);
          scopeLayerB.evalVars();

          let var1ValueInB_01 = scopeLayerB.evalVar('var1');
          expect(var1ValueInB_01, 'var1ValueInB_01 is ' + var1ValueInB_01).to.equal('B1B2B3B4B5B6B7A8A9(cases)');

          let var1ValueInB_02 = scopeLayerB.eval('@eexpr:aa${var1}bb');
          expect(var1ValueInB_02, 'var1ValueInB_02 is ' + var1ValueInB_02).to.equal('aaB1B2B3B4B5B6B7A8A9(cases)bb');

          let var5_2ValueInB_01 = scopeLayerB.evalVar('var5-2');
          expect(var5_2ValueInB_01, 'var5_2ValueInB_01 is ' + var5_2ValueInB_01).to.equal('B5B6B7A8A9(default)');

          let var5_2ValueInB_02 = scopeLayerB.eval('@eexpr:aa${var5-2}bb');
          expect(var5_2ValueInB_02, 'var5_2ValueInB_02 is ' + var5_2ValueInB_02).to.equal('aaB5B6B7A8A9(default)bb');

          let var5_3ValueInB_01 = scopeLayerB.evalVar('var5-3');
          expect(var5_3ValueInB_01, 'var5_3ValueInB_01 is ' + var5_3ValueInB_01).to.equal('B5B6B7A8A9(default)');

          let var5_3ValueInB_02 = scopeLayerB.eval('@eexpr:aa${var5-3}bb');
          expect(var5_3ValueInB_02, 'var5_3ValueInB_02 is ' + var5_3ValueInB_02).to.equal('aaB5B6B7A8A9(default)bb');
          done();
        });

        it('Should be able to eval vars while initing', done => {
          let scopeChain = new SvScopeChain();
          let scopeLayer = new SvScopeLayer(scopeChain, {});
          scopeLayer.initScope(TestDataScopeNormal01,
            {
              autoEval: true,
            });
          let varValue_01 = scopeLayer.evalVar('var1');
          expect(varValue_01, 'varValue_01 is ' + varValue_01).to.equal('123456789');

          let varValue_02 = scopeLayer.eval('@eexpr:aa${var1}bb');
          expect(varValue_02, 'varValue_02 is ' + varValue_02).to.equal('aa123456789bb');
          done();
        });
      });
    });

    describe('query tests', () => {
      let _template = new SvTemplate(defaultExprTypesDefine);
      let SvScopeLayer = _template.getScopeLayerClass();

      describe('test 1', () => {
        it('Should be able to eval vars with temp varData(before)', done => {
          let scopeChain = new SvScopeChain();
          let scopeLayer = new SvScopeLayer(scopeChain, {});
          scopeLayer.initScope(TestDataScopeNormal01);
          scopeLayer.evalVars();
          let varValue = scopeLayer.query('@eexpr:${var1}', {
            before: {var1: 'xx'},
          });
          expect(varValue, 'varValue is ' + varValue).to.equal('123456789');

          scopeChain = new SvScopeChain();
          scopeLayer = new SvScopeLayer(scopeChain, {});
          scopeLayer.initScope(TestDataScopeNormal02);
          scopeLayer.evalVars();
          varValue = scopeLayer.query('@eexpr:${var99}', {
            before: {var99: 'xx'},
          });
          expect(varValue, 'varValue is ' + varValue).to.equal('xx');
          done();
        });

        it('Should be able to eval vars with temp varData(after)', done => {
          let scopeChain = new SvScopeChain();
          let scopeLayer = new SvScopeLayer(scopeChain, {});
          scopeLayer.initScope(TestDataScopeNormal01);
          scopeLayer.evalVars();
          let varValue = scopeLayer.query('@eexpr:${var1}', {
            after: {var1: 'xx'},
          });
          expect(varValue, 'varValue is ' + varValue).to.equal('xx');

          scopeChain = new SvScopeChain();
          scopeLayer = new SvScopeLayer(scopeChain, {});
          scopeLayer.initScope(TestDataScopeNormal02);
          scopeLayer.evalVars();
          varValue = scopeLayer.query('@eexpr:${var1}', {
            after: {var1: 'xx'},
          });
          expect(varValue, 'varValue is ' + varValue).to.equal('xx');
          done();
        });

        it('Should be able to eval vars with temp varData(head)', done => {
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

          let scopeChain = new SvScopeChain();
          let scopeLayerA = new SvScopeLayer(scopeChain, {});
          scopeLayerA.initScope(TestDataScopePartA01);
          scopeLayerA.evalVars();

          let scopeLayerB = new SvScopeLayer(scopeChain, {});
          scopeLayerB.initScope(TestDataScopePartB01);
          scopeLayerB.evalVars();

          let var9ValueInB_02 = scopeLayerB.query('@eexpr:aa${var9}bb', {
            head: {var9: 'xx'},
          });
          expect(var9ValueInB_02, 'var9ValueInB_02 is ' + var9ValueInB_02).to.equal('aaA9bb');

          let var99ValueInB_02 = scopeLayerB.query('@eexpr:aa${var99}bb', {
            head: {var99: 'xx'},
          });
          expect(var99ValueInB_02, 'var99ValueInB_02 is ' + var99ValueInB_02).to.equal('aaxxbb');
          done();
        });

        it('Should be able to throw an error while evaling circular dependency vars', done => {
          let scopeChain = new SvScopeChain();
          let scopeLayer = new SvScopeLayer(scopeChain, {});
          scopeLayer.initScope(TestDataScopeNormal01);
          scopeLayer.evalVars();

          let errorThrown = false;
          try{
            scopeLayer.query('@eexpr:${var1}', {
              after: {var1: '@eexpr:${var1}'},
            });
          }catch(e){
            if(e.message.indexOf('Circular dependencies occured') !== -1){
              errorThrown = true;
            }
          }
          expect(errorThrown).to.equal(true);
          done();
        });

        it('Should be able to eval vars with temp varData(head)', done => {
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

          let scopeChain = new SvScopeChain();
          let scopeLayerA = new SvScopeLayer(scopeChain, {});
          scopeLayerA.initScope(TestDataScopePartA01);
          scopeLayerA.evalVars();

          let scopeLayerB = new SvScopeLayer(scopeChain, {});
          scopeLayerB.initScope(TestDataScopePartB01);
          scopeLayerB.evalVars();

          let result = scopeLayerB.compile({
            var1: 'var1queryBody',
            aavar1bb: '@eexpr:aa${var1}bb',  // use the 'var1' of 'queryBody'(the same scope of this entry)
            aaparentvar1bb: '@eexpr:aa${$parent.var1}bb', // use the 'var1' of 'after'
            aavar2bb: '@eexpr:aa${var2}bb', // use the 'var2' of 'main(LayerB)'
            aavar3bb: '@eexpr:aa${var3}bb', // use the 'var3' of 'main(LayerB)'
            aavar8bb: '@eexpr:aa${var8}bb', // use the 'var8' of 'before'
            aavar9bb: '@eexpr:aa${var9}bb', // use the 'var9' of 'main(LayerA)'
            aavar99bb: '@eexpr:aa${var99}bb', // use the 'var9' of 'head'
          }, {
            head: {
              var1: 'var1head',
              var2: 'var2head',
              var8: 'var8head',
              var9: 'var9head',
              var99: 'var99head',
            },
            before: {
              var1: 'var1before',
              var2: 'var2before',
              var8: 'var8before',
            },
            after: {
              var1: 'var1after',
              var3: '@eexpr:${$parent.var3}',
            },
          });
          expect(result.aavar1bb, 'result.aavar1bb is ' + result.aavar1bb).to.equal('aavar1queryBodybb');
          expect(result.aaparentvar1bb, 'result.aaparentvar1bb is ' + result.aaparentvar1bb).to.equal('aavar1afterbb');
          expect(result.aavar2bb, 'result.aavar2bb is ' + result.aavar2bb).to.equal('aaB2B3B4B5B6B7A8A9bb');
          expect(result.aavar3bb, 'result.aavar3bb is ' + result.aavar3bb).to.equal('aaB3B4B5B6B7A8A9bb');
          expect(result.aavar8bb, 'result.aavar8bb is ' + result.aavar8bb).to.equal('aavar8beforebb');
          expect(result.aavar9bb, 'result.aavar9bb is ' + result.aavar9bb).to.equal('aaA9bb');
          expect(result.aavar99bb, 'result.aavar99bb is ' + result.aavar99bb).to.equal('aavar99headbb');
          done();
        });
      });
    });
  });
});

