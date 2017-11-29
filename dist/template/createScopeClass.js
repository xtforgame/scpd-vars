'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.default = createScopeClass;

var _utils = require('../utils');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function createScopeClass(SvExpression) {
  var _class, _temp;

  var newScopeClass = (_temp = _class = function () {
    function SvScope(varData, options) {
      _classCallCheck(this, SvScope);

      this._varData = varData;
      this._options = options || {};
      this._findVarFunc = this._options.findVar || this.findVarLocal.bind(this);

      this._varMap = {};
      this._evaled = false;
      if (this._options.autoEval) {
        this.evalVars();
      }
    }

    _createClass(SvScope, [{
      key: '_evalVars',
      value: function _evalVars() {
        var _this = this;

        var result = {};
        Object.keys(this._varMap).forEach(function (key) {
          result[key] = _this._varMap[key].eval(new Set());
        });
        return result;
      }
    }, {
      key: 'evalVars',
      value: function evalVars() {
        var _this2 = this;

        Object.keys(this._varData).forEach(function (key) {
          _this2._varMap[key] = SvExpression.parse(_this2, key, _this2._varData[key]);
        });

        var result = this._evalVars();
        this._evaled = true;
        return result;
      }
    }, {
      key: 'getEvaledVars',
      value: function getEvaledVars() {
        if (!this._evaled) {
          return null;
        }
        return this._evalVars();
      }
    }, {
      key: 'evalVar',
      value: function evalVar(varName, evalingSet) {
        if (evalingSet.has(varName)) {
          throw new Error('Circular dependencies occured :' + varName);
        }
        evalingSet.add(varName);

        var findResult = this.findVarLocal(null, varName);
        if (!findResult.var) {
          evalingSet.delete(varName);
          throw new Error('Eval failed, var name not found :' + varName);
        }

        var newEvalingSet = findResult.var._scope === this ? evalingSet : new Set();
        var result = findResult.var.eval(newEvalingSet);
        evalingSet.delete(varName);
        return result;
      }
    }, {
      key: 'evalVarExternal',
      value: function evalVarExternal(varName, evalingSet) {
        var findResult = this.findVarExternal(varName);
        if (!findResult.var) {
          evalingSet.delete(varName);
          throw new Error('Eval failed, var name not found :' + varName);
        }

        var newEvalingSet = findResult.var._scope === this ? evalingSet : new Set();
        var result = findResult.var.eval(newEvalingSet);
        return result;
      }
    }, {
      key: 'findVarExternal',
      value: function findVarExternal(varName) {
        return this._findVarFunc(this, varName);
      }
    }, {
      key: 'findVarLocal',
      value: function findVarLocal(visitorScope, varName) {
        var result = (0, _utils.createEmplyFindVarResult)();

        if (visitorScope === this) {
          return result;
        }

        result.var = this._varMap[varName];
        if (result.var) {
          result.scope = this;
          return result;
        }

        return this.findVarExternal(varName);
      }
    }]);

    return SvScope;
  }(), _class.ExpressionClass = SvExpression, _temp);
  return newScopeClass;
}