'use strict';

var _chai = require('chai');

var _chai2 = _interopRequireDefault(_chai);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _dist = require('../dist');

var _dist2 = _interopRequireDefault(_dist);

var _testDataScope = require('./test-data/test-data-scope');

var _scopeChain = require('../dist/scope-chain');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var expect = _chai2.default.expect;
var assert = _chai2.default.assert;

describe('Template test', function () {
  describe('SvTemplate', function () {
    var _template = null;
    beforeEach(function (done) {
      _template = new _dist.SvTemplate(_dist.defaultExprTypesDefine);
      done();
    });

    afterEach(function (done) {
      _template = null;
      done();
    });

    it('Should has a method: getScopeClass', function (done) {
      expect(_template).to.have.property('getScopeClass').and.not.equal(null);
      done();
    });

    it('Should has a method: getExpressionClass', function (done) {
      expect(_template).to.have.property('getExpressionClass').and.not.equal(null);
      done();
    });
  });

  describe('SvExpression', function () {
    var _template = new _dist.SvTemplate(_dist.defaultExprTypesDefine);
    var SvExpression = null;
    beforeEach(function (done) {
      SvExpression = _template.getExpressionClass();
      done();
    });

    afterEach(function (done) {
      SvExpression = null;
      done();
    });

    it('Should be able to be created from SvTemplate', function (done) {
      expect(SvExpression, 'SvExpression is ' + SvExpression).not.to.equal(undefined);
      done();
    });

    describe('static method normalizeExprInfo', function () {
      it('Should return the correct typeName from rawData', function (done) {
        var exprInfo1 = SvExpression.normalizeExprInfo('@eexpr:ssss');
        expect(exprInfo1.typeName, 'exprInfo1.typeName is ' + exprInfo1.typeName).to.equal('@eexpr');

        var exprInfo2 = SvExpression.normalizeExprInfo('@seexpr:ssss');
        expect(exprInfo2.typeName, 'exprInfo2.typeName is ' + exprInfo2.typeName).to.equal('');
        done();
      });
    });

    describe('static method parse', function () {
      it('Should parse SvExpression from rawData', function (done) {
        var exprObj1 = SvExpression.parse(null, 'xxx', '@eexpr:ssss');
        expect(exprObj1.exprInfo.typeName, 'exprObj1.exprInfo.typeName is ' + exprObj1.exprInfo.typeName).to.equal('@eexpr');
        expect(exprObj1.exprInfo.tokens[0], 'exprObj1.exprInfo.tokens[0] is ' + exprObj1.exprInfo.tokens[0]).to.equal('ssss');

        var exprObj2 = SvExpression.parse(null, 'xxx', '@seexpr:ssss');
        expect(exprObj2.exprInfo.typeName, 'exprObj2.exprInfo.typeName is ' + exprObj2.exprInfo.typeName).to.equal('');
        expect(exprObj2.exprInfo.tokens[0], 'exprObj2.exprInfo.tokens[0] is ' + exprObj2.exprInfo.tokens[0]).to.equal('@seexpr:ssss');
        done();
      });
    });
  });

  describe('SvScope', function () {
    it('Should be able to be created from SvTemplate', function (done) {
      var _template = new _dist.SvTemplate(_dist.defaultExprTypesDefine);
      var SvScope = _template.getScopeClass();
      expect(SvScope, 'SvScope is ' + SvScope).not.to.equal(undefined);
      done();
    });

    it('Should be able to create instances', function (done) {
      var _template = new _dist.SvTemplate(_dist.defaultExprTypesDefine);
      var SvScope = _template.getScopeClass();
      var scope = new SvScope({});
      expect(scope, 'scope is ' + scope).not.to.equal(undefined);
      done();
    });

    describe('eval tests', function () {
      var _template = new _dist.SvTemplate(_dist.defaultExprTypesDefine);
      var SvScope = _template.getScopeClass();

      describe('test 1', function () {
        it('Should be able to create instances', function (done) {
          var scope = new SvScope({});
          expect(scope, 'scope is ' + scope).not.to.equal(undefined);
          expect(scope, 'scope is ' + scope).to.be.an.instanceof(SvScope);
          done();
        });

        it('Should be able to eval vars', function (done) {
          var scope = new SvScope(_testDataScope.TestDataScopeNormal01);
          scope.evalVars();
          var varValue = scope.evalVar('var1', new Set());
          expect(varValue, 'varValue is ' + varValue).to.equal('123456789');

          scope = new SvScope(_testDataScope.TestDataScopeNormal02);
          scope.evalVars();
          varValue = scope.evalVar('var1', new Set());
          expect(varValue, 'varValue is ' + varValue).to.equal('123456789');
          done();
        });

        it('Should be able to throw an error while evaling circular dependency vars', function (done) {
          var scope = new SvScope(_testDataScope.TestDataScopeRecu01);
          var errorThrown = false;
          try {
            scope.evalVars();
          } catch (e) {
            if (e.message.indexOf('Circular dependencies occured') !== -1) {
              errorThrown = true;
            }
          }
          expect(errorThrown).to.equal(true);

          scope = new SvScope(_testDataScope.TestDataScopeRecu02);
          errorThrown = false;
          try {
            scope.evalVars();
          } catch (e) {
            if (e.message.indexOf('Circular dependencies occured') !== -1) {
              errorThrown = true;
            }
          }
          expect(errorThrown).to.equal(true);
          done();
        });

        it('Should be able to eval vars by using an external search function', function (done) {
          var simpleStack = [];
          var simpleFind = function simpleFind(visitorScope, varName) {
            for (var i = simpleStack.length - 1; i >= 0; i--) {
              var result = simpleStack[i].findVarLocal(visitorScope, varName);
              if (result.var) {
                return result;
              }
            }
            return (0, _dist.createEmplyFindVarResult)();
          };

          var scopeA = new SvScope(_testDataScope.TestDataScopePartA01, {
            findVar: simpleFind
          });
          simpleStack.push(scopeA);
          scopeA.evalVars();

          var scopeB = new SvScope(_testDataScope.TestDataScopePartB01, {
            findVar: simpleFind
          });
          simpleStack.push(scopeB);
          scopeB.evalVars();

          var var1ValueInB = scopeB.evalVar('var1', new Set());
          expect(var1ValueInB, 'var1ValueInB is ' + var1ValueInB).to.equal('B1B2B3B4B5B6B7A8A9');

          var var7ValueInA = scopeA.evalVar('var7', new Set());
          expect(var7ValueInA, 'var7ValueInA is ' + var7ValueInA).to.equal('A7A8A9');

          var var7ValueInB = scopeB.evalVar('var7', new Set());
          expect(var7ValueInB, 'var7ValueInB is ' + var7ValueInB).to.equal('B7A8A9');
          done();
        });

        it('Should be able to eval \'@dexpr\' expressions (cases)', function (done) {
          var simpleStack = [];
          var simpleFind = function simpleFind(visitorScope, varName) {
            for (var i = simpleStack.length - 1; i >= 0; i--) {
              var result = simpleStack[i].findVarLocal(visitorScope, varName);
              if (result.var) {
                return result;
              }
            }
            return (0, _dist.createEmplyFindVarResult)();
          };

          var scopeA = new SvScope(_testDataScope.TestDataScopePartA02, {
            findVar: simpleFind
          });
          simpleStack.push(scopeA);
          scopeA.evalVars();

          var scopeB = new SvScope(_testDataScope.TestDataScopePartB02, {
            findVar: simpleFind
          });
          simpleStack.push(scopeB);
          scopeB.evalVars();

          var var1ValueInB = scopeB.evalVar('var1', new Set());
          expect(var1ValueInB, 'var1ValueInB is ' + var1ValueInB).to.equal('B1B2B3B4B5B6B7A8A9(cases)');

          var var5_2ValueInB = scopeB.evalVar('var5-2', new Set());
          expect(var5_2ValueInB, 'var5_2ValueInB is ' + var5_2ValueInB).to.equal('B5B6B7A8A9(default)');

          var var5_3ValueInB = scopeB.evalVar('var5-3', new Set());
          expect(var5_3ValueInB, 'var5_3ValueInB is ' + var5_3ValueInB).to.equal('B5B6B7A8A9(default)');
          done();
        });

        it('Should be able to eval vars while creating', function (done) {
          var scope = new SvScope(_testDataScope.TestDataScopeNormal01, {
            autoEval: true
          });
          var varValue = scope.evalVar('var1', new Set());
          expect(varValue, 'varValue is ' + varValue).to.equal('123456789');
          done();
        });
      });
    });
  });

  describe('SvScopeLayer', function () {
    it('Should be able to be created from SvTemplate', function (done) {
      var _template = new _dist.SvTemplate(_dist.defaultExprTypesDefine);
      var SvScopeLayer = _template.getScopeLayerClass();
      expect(SvScopeLayer, 'SvScopeLayer is ' + SvScopeLayer).not.to.equal(undefined);
      done();
    });

    it('Should be able to create instances', function (done) {
      var _template = new _dist.SvTemplate(_dist.defaultExprTypesDefine);
      var SvScopeLayer = _template.getScopeLayerClass();
      var scopeChain = new _scopeChain.SvScopeChain();
      var scopeLayer = new SvScopeLayer(scopeChain, {});
      expect(scopeLayer, 'scopeLayer is ' + scopeLayer).not.to.equal(undefined);
      done();
    });

    describe('eval tests', function () {
      var _template = new _dist.SvTemplate(_dist.defaultExprTypesDefine);
      var SvScopeLayer = _template.getScopeLayerClass();

      describe('test 1', function () {
        it('Should be able to create instances', function (done) {
          var scopeChain = new _scopeChain.SvScopeChain();
          var scopeLayer = new SvScopeLayer(scopeChain, {});
          expect(scopeLayer, 'scopeLayer is ' + scopeLayer).not.to.equal(undefined);
          expect(scopeLayer, 'scopeLayer is ' + scopeLayer).to.be.an.instanceof(SvScopeLayer);
          done();
        });

        it('Should be able to eval vars', function (done) {
          var scopeChain = new _scopeChain.SvScopeChain();
          var scopeLayer = new SvScopeLayer(scopeChain, {});
          scopeLayer.initScope(_testDataScope.TestDataScopeNormal01);
          scopeLayer.evalVars();
          var varValue = scopeLayer.evalVar('var1');
          expect(varValue, 'varValue is ' + varValue).to.equal('123456789');

          scopeChain = new _scopeChain.SvScopeChain();
          scopeLayer = new SvScopeLayer(scopeChain, {});
          scopeLayer.initScope(_testDataScope.TestDataScopeNormal02);
          scopeLayer.evalVars();
          varValue = scopeLayer.evalVar('var1');
          expect(varValue, 'varValue is ' + varValue).to.equal('123456789');
          done();
        });

        it('Should be able to eval expr', function (done) {
          var scopeChain = new _scopeChain.SvScopeChain();
          var scopeLayer = new SvScopeLayer(scopeChain, {});
          scopeLayer.initScope(_testDataScope.TestDataScopeNormal01);
          scopeLayer.evalVars();
          var exprValue = scopeLayer.eval('@eexpr:aa${var1}bb');
          expect(exprValue, 'exprValue is ' + exprValue).to.equal('aa123456789bb');

          scopeChain = new _scopeChain.SvScopeChain();
          scopeLayer = new SvScopeLayer(scopeChain, {});
          scopeLayer.initScope(_testDataScope.TestDataScopeNormal02);
          scopeLayer.evalVars();
          exprValue = scopeLayer.eval('@eexpr:aa${var1}bb');
          expect(exprValue, 'exprValue is ' + exprValue).to.equal('aa123456789bb');
          done();
        });

        it('Should be able to throw an error while evaling circular dependency vars', function (done) {
          var scopeChain = new _scopeChain.SvScopeChain();
          var scopeLayer = new SvScopeLayer(scopeChain, {});
          scopeLayer.initScope(_testDataScope.TestDataScopeRecu01);
          var errorThrown = false;
          try {
            scopeLayer.evalVars();
          } catch (e) {
            if (e.message.indexOf('Circular dependencies occured') !== -1) {
              errorThrown = true;
            }
          }
          expect(errorThrown).to.equal(true);

          scopeChain = new _scopeChain.SvScopeChain();
          scopeLayer = new SvScopeLayer(scopeChain, {});
          scopeLayer.initScope(_testDataScope.TestDataScopeRecu02);
          errorThrown = false;
          try {
            scopeLayer.evalVars();
          } catch (e) {
            if (e.message.indexOf('Circular dependencies occured') !== -1) {
              errorThrown = true;
            }
          }
          expect(errorThrown).to.equal(true);
          done();
        });

        it('Should be able to eval vars by using an external search function', function (done) {
          var simpleStack = [];
          var simpleFind = function simpleFind(visitorScope, varName) {
            for (var i = simpleStack.length - 1; i >= 0; i--) {
              var result = simpleStack[i].findVarLocal(visitorScope, varName);
              if (result.var) {
                return result;
              }
            }
            return (0, _dist.createEmplyFindVarResult)();
          };

          var scopeChain = new _scopeChain.SvScopeChain();
          var scopeLayerA = new SvScopeLayer(scopeChain, {});
          scopeLayerA.initScope(_testDataScope.TestDataScopePartA01);
          scopeLayerA.evalVars();

          var scopeLayerB = new SvScopeLayer(scopeChain, {});
          scopeLayerB.initScope(_testDataScope.TestDataScopePartB01);
          scopeLayerB.evalVars();

          var var1ValueInB_01 = scopeLayerB.evalVar('var1');
          expect(var1ValueInB_01, 'var1ValueInB_01 is ' + var1ValueInB_01).to.equal('B1B2B3B4B5B6B7A8A9');

          var var1ValueInB_02 = scopeLayerB.eval('@eexpr:aa${var1}bb');
          expect(var1ValueInB_02, 'var1ValueInB_02 is ' + var1ValueInB_02).to.equal('aaB1B2B3B4B5B6B7A8A9bb');

          var var7ValueInA_01 = scopeLayerA.evalVar('var7');
          expect(var7ValueInA_01, 'var7ValueInA_01 is ' + var7ValueInA_01).to.equal('A7A8A9');

          var var7ValueInA_02 = scopeLayerA.eval('@eexpr:aa${var7}bb');
          expect(var7ValueInA_02, 'var7ValueInA_02 is ' + var7ValueInA_02).to.equal('aaA7A8A9bb');

          var var7ValueInB_01 = scopeLayerB.evalVar('var7');
          expect(var7ValueInB_01, 'var7ValueInB_01 is ' + var7ValueInB_01).to.equal('B7A8A9');

          var var7ValueInB_02 = scopeLayerB.eval('@eexpr:aa${var7}bb');
          expect(var7ValueInB_02, 'var7ValueInB_02 is ' + var7ValueInB_02).to.equal('aaB7A8A9bb');
          done();
        });

        it('Should be able to eval \'@dexpr\' expressions (cases)', function (done) {
          var simpleStack = [];
          var simpleFind = function simpleFind(visitorScope, varName) {
            for (var i = simpleStack.length - 1; i >= 0; i--) {
              var result = simpleStack[i].findVarLocal(visitorScope, varName);
              if (result.var) {
                return result;
              }
            }
            return (0, _dist.createEmplyFindVarResult)();
          };

          var scopeChain = new _scopeChain.SvScopeChain();
          var scopeLayerA = new SvScopeLayer(scopeChain, {});
          scopeLayerA.initScope(_testDataScope.TestDataScopePartA02);
          scopeLayerA.evalVars();

          var scopeLayerB = new SvScopeLayer(scopeChain, {});
          scopeLayerB.initScope(_testDataScope.TestDataScopePartB02);
          scopeLayerB.evalVars();

          var var1ValueInB_01 = scopeLayerB.evalVar('var1');
          expect(var1ValueInB_01, 'var1ValueInB_01 is ' + var1ValueInB_01).to.equal('B1B2B3B4B5B6B7A8A9(cases)');

          var var1ValueInB_02 = scopeLayerB.eval('@eexpr:aa${var1}bb');
          expect(var1ValueInB_02, 'var1ValueInB_02 is ' + var1ValueInB_02).to.equal('aaB1B2B3B4B5B6B7A8A9(cases)bb');

          var var5_2ValueInB_01 = scopeLayerB.evalVar('var5-2');
          expect(var5_2ValueInB_01, 'var5_2ValueInB_01 is ' + var5_2ValueInB_01).to.equal('B5B6B7A8A9(default)');

          var var5_2ValueInB_02 = scopeLayerB.eval('@eexpr:aa${var5-2}bb');
          expect(var5_2ValueInB_02, 'var5_2ValueInB_02 is ' + var5_2ValueInB_02).to.equal('aaB5B6B7A8A9(default)bb');

          var var5_3ValueInB_01 = scopeLayerB.evalVar('var5-3');
          expect(var5_3ValueInB_01, 'var5_3ValueInB_01 is ' + var5_3ValueInB_01).to.equal('B5B6B7A8A9(default)');

          var var5_3ValueInB_02 = scopeLayerB.eval('@eexpr:aa${var5-3}bb');
          expect(var5_3ValueInB_02, 'var5_3ValueInB_02 is ' + var5_3ValueInB_02).to.equal('aaB5B6B7A8A9(default)bb');
          done();
        });

        it('Should be able to eval vars while initing', function (done) {
          var scopeChain = new _scopeChain.SvScopeChain();
          var scopeLayer = new SvScopeLayer(scopeChain, {});
          scopeLayer.initScope(_testDataScope.TestDataScopeNormal01, {
            autoEval: true
          });
          var varValue_01 = scopeLayer.evalVar('var1');
          expect(varValue_01, 'varValue_01 is ' + varValue_01).to.equal('123456789');

          var varValue_02 = scopeLayer.eval('@eexpr:aa${var1}bb');
          expect(varValue_02, 'varValue_02 is ' + varValue_02).to.equal('aa123456789bb');
          done();
        });
      });
    });
  });
});