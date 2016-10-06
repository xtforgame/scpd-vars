'use strict';

var _chai = require('chai');

var _chai2 = _interopRequireDefault(_chai);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _dist = require('../dist');

var _dist2 = _interopRequireDefault(_dist);

var _testDataScope = require('./test-data/test-data-scope');

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
});