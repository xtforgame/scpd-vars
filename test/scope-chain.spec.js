'use strict';

var _chai = require('chai');

var _chai2 = _interopRequireDefault(_chai);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _dist = require('../dist');

var _dist2 = _interopRequireDefault(_dist);

var _scopeChain = require('../dist/scope-chain');

var _testDataScope = require('./test-data/test-data-scope');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var expect = _chai2.default.expect;
var assert = _chai2.default.assert;

describe('Scope Chain test', function () {
  var _template = new _dist.SvTemplate(_dist.defaultExprTypesDefine);
  var SvScope = _template.getScopeClass();
  describe('Basic', function () {
    it('Should be able to eval vars by using an external search function', function (done) {
      var scopChain = new _scopeChain.SvScopeChain();
      scopChain.pushBack();

      var scopeA = new SvScope(_testDataScope.TestDataScopePartA01, {
        findVar: scopChain.findVar.bind(scopChain)
      });
      scopChain.pushBack(scopeA);
      scopeA.evalVars();

      var scopeB = new SvScope(_testDataScope.TestDataScopePartB01, {
        findVar: scopChain.findVar.bind(scopChain)
      });
      scopChain.pushBack(scopeB);
      scopeB.evalVars();

      var var1ValueInB = scopeB.evalVar('var1', new Set());
      expect(var1ValueInB, 'var1ValueInB is ' + var1ValueInB).to.equal('B1B2B3B4B5B6B7A8A9');

      var var7ValueInA = scopeA.evalVar('var7', new Set());
      expect(var7ValueInA, 'var7ValueInA is ' + var7ValueInA).to.equal('A7A8A9');

      var var7ValueInB = scopeB.evalVar('var7', new Set());
      expect(var7ValueInB, 'var7ValueInB is ' + var7ValueInB).to.equal('B7A8A9');
      done();
    });
  });
});