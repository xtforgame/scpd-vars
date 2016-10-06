'use strict';

var _chai = require('chai');

var _chai2 = _interopRequireDefault(_chai);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _dist = require('../dist');

var _dist2 = _interopRequireDefault(_dist);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var expect = _chai2.default.expect;
var assert = _chai2.default.assert;

describe('Existence test', function () {
  it('Should include all exported name in the public interface', function (done) {
    expect(_dist.escapeString, 'escapeString is ' + _dist.escapeString).to.exist;
    expect(_dist.unescapeString, 'unescapeString is ' + _dist.unescapeString).to.exist;
    expect(_dist.findContentInBracket, 'findContentInBracket is ' + _dist.findContentInBracket).to.exist;
    expect(_dist.EscapeChar, 'EscapeChar is ' + _dist.EscapeChar).to.exist;
    expect(_dist.createEmplyFindVarResult, 'createEmplyFindVarResult is ' + _dist.createEmplyFindVarResult).to.exist;
    expect(_dist.SvVariable, 'SvVariable is ' + _dist.SvVariable).to.exist;
    expect(_dist.SvExprInfo, 'SvExprInfo is ' + _dist.SvExprInfo).to.exist;
    expect(_dist.SvTemplate, 'SvTemplate is ' + _dist.SvTemplate).to.exist;
    expect(_dist.defaultExprTypesDefine, 'defaultExprTypesDefine is ' + _dist.defaultExprTypesDefine).to.exist;
    expect(_dist.SvScopeChain, 'SvScopeChain is ' + _dist.SvScopeChain).to.exist;
    done();
  });
});