'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SvTemplate = exports.defaultExprTypesDefine = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _utils = require('./utils');

var _nonGenerics = require('./non-generics');

var _scopeChain = require('./scope-chain');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var defaultExprTypesDefine = {
  '@eexpr': {},
  '@nexpr': {
    tokenize: function tokenize(exprObj, ExpressionClass) {
      return [exprObj.exprInfo.rawData];
    }
  },
  '@dexpr': {
    tokenize: function tokenize(exprObj, ExpressionClass) {
      return [exprObj.exprInfo.rawData];
    },
    eval: function _eval(exprObj, evalingSet, ExpressionClass) {
      var exprBody = exprObj.exprInfo.rawData.exprBody;
      var switchValue = ExpressionClass.parseAndEval(exprObj.scope, '@switch', exprBody.switch, evalingSet);

      var exprSwitchCases = exprBody.cases;
      var valueExprRaw = null;
      var exprName = '';
      if (exprSwitchCases && switchValue in exprSwitchCases) {
        exprName = '@case';
        valueExprRaw = exprSwitchCases[switchValue];
      } else if ('default' in exprBody) {
        exprName = '@caseDefault';
        valueExprRaw = exprBody.default;
      }

      if (valueExprRaw) {
        return ExpressionClass.parseAndEval(exprObj.scope, exprName, valueExprRaw, evalingSet);
      }

      throw Error('@dexpr: No matched case for switch value:' + switchValue);
    }
  }
};

exports.defaultExprTypesDefine = defaultExprTypesDefine;


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
      key: 'evalVars',
      value: function evalVars() {
        for (var key in this._varData) {
          this._varMap[key] = SvExpression.parse(this, key, this._varData[key]);
        }

        for (var _key in this._varMap) {
          this._varMap[_key].eval(new Set());
        }
        this._evaled = true;
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
        var result = findResult.var.eval(evalingSet);
        evalingSet.delete(varName);
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

function createExpressionClass(config) {
  var _class2, _temp2;

  var newExpressionClass = (_temp2 = _class2 = function () {
    _createClass(SvExpression, null, [{
      key: 'normalizeExprInfo',
      value: function normalizeExprInfo(data) {
        var exprTypeName = null;
        var exprBody = data;
        var defaultValue = undefined;

        var plainTextCfg = {
          tokenize: newExpressionClass.plainTextTokenizer,
          eval: newExpressionClass.plainTextEvaluator
        };

        if (data instanceof _nonGenerics.SvExprInfo) {
          return data;
        } else if (typeof data === 'string') {
          var sepPos = data.indexOf(':');
          if (sepPos === -1) {
            return new _nonGenerics.SvExprInfo('', data, defaultValue, plainTextCfg, data);
          }

          exprTypeName = data.substr(0, sepPos);
          sepPos++;
          exprBody = data.substr(sepPos, data.length - sepPos);
        } else {
          exprTypeName = data.exprType;
          exprBody = data.exprBody;
          defaultValue = data.default;
        }

        var exprTypeConfig = SvExpression.exprTypesDefine[exprTypeName];
        if (exprTypeConfig) {
          return new _nonGenerics.SvExprInfo(exprTypeName, exprBody, defaultValue, exprTypeConfig, data);
        }

        return new _nonGenerics.SvExprInfo('', data, defaultValue, plainTextCfg, data);
      }
    }, {
      key: 'plainTextTokenizer',
      value: function plainTextTokenizer(exprObj) {
        return [exprInfo.exprBody];
      }
    }, {
      key: 'plainTextEvaluator',
      value: function plainTextEvaluator(exprObj, evalingSet) {
        var exprInfo = exprObj.exprInfo;
        return exprInfo.tokens.join('');
      }
    }, {
      key: 'stringTokenizer',
      value: function stringTokenizer(exprObj) {
        var exprInfo = exprObj.exprInfo;
        var retval = [];
        var result = (0, _utils.findContentInBracket)(exprInfo.exprBody);
        var currentPos = 0;

        while (result) {
          if (!result[2]) {
            throw Error('Invalid string :' + exprInfo.exprBody);
          }
          if (result[0] !== currentPos) {
            retval.push((0, _utils.unescapeString)(exprInfo.exprBody.substr(currentPos, result[0] - currentPos)));
          }
          retval.push(new _nonGenerics.SvVariable(exprObj.scope, result[2]));
          currentPos = result[1];
          result = (0, _utils.findContentInBracket)(exprInfo.exprBody, currentPos);
        }

        if (currentPos < exprInfo.exprBody.length) {
          retval.push((0, _utils.unescapeString)(exprInfo.exprBody.substr(currentPos, exprInfo.exprBody.length - currentPos)));
        }

        return retval;
      }
    }, {
      key: 'stringEvaluator',
      value: function stringEvaluator(exprObj, evalingSet) {
        var exprInfo = exprObj.exprInfo;
        return exprInfo.tokens.map(function (part) {
          if (part instanceof _nonGenerics.SvVariable) {
            return part.eval(evalingSet);
          }
          return part;
        }).join('');
      }
    }, {
      key: 'parse',
      value: function parse(scope, name, rawData) {
        var exprInfo = SvExpression.normalizeExprInfo(rawData);
        var exprObj = new SvExpression(scope, name, exprInfo);

        exprObj.tokenize();
        return exprObj;
      }
    }, {
      key: 'parseAndEval',
      value: function parseAndEval(scope, name, rawData, evalingSet) {
        var exprObj = newExpressionClass.parse(scope, name, rawData);
        return exprObj.eval(evalingSet);
      }
    }]);

    function SvExpression(scope, name, exprInfo) {
      _classCallCheck(this, SvExpression);

      this._scope = scope;

      this._name = name;
      this._exprInfo = exprInfo;
    }

    _createClass(SvExpression, [{
      key: 'tokenize',
      value: function tokenize() {
        var exprInfo = this.exprInfo;
        if (!exprInfo.typeName) {
          exprInfo.setTokens([this.exprInfo.exprBody]);
          return exprInfo;
        }
        var result = exprInfo.typeConfig.tokenize(this, newExpressionClass);

        exprInfo.setTokens(result);
        return exprInfo;
      }
    }, {
      key: 'eval',
      value: function _eval(evalingSet) {
        var exprInfo = this.exprInfo;
        if (this.isEvaled()) {
          return exprInfo.evaledValue;
        }
        var evaledValue = null;
        try {
          evaledValue = exprInfo.typeConfig.eval(this, evalingSet, newExpressionClass);
        } catch (e) {
          if (exprInfo.default !== undefined) {
            evaledValue = newExpressionClass.parseAndEval(this.scope, '@default', exprInfo.default, evalingSet);
          } else {
            throw e;
          }
        }
        exprInfo.evaledValue = evaledValue;
        return evaledValue;
      }
    }, {
      key: 'isEvaled',
      value: function isEvaled() {
        return this.exprInfo.evaledValue !== undefined;
      }
    }, {
      key: 'toString',
      value: function toString() {
        return '${' + this._name + '}';
      }
    }, {
      key: 'scope',
      get: function get() {
        return this._scope;
      }
    }, {
      key: 'exprInfo',
      get: function get() {
        return this._exprInfo;
      }
    }]);

    return SvExpression;
  }(), _class2.exprTypesDefine = config.exprTypesDefine || defaultExprTypesDefine, _temp2);

  var typesDefine = newExpressionClass.exprTypesDefine;
  for (var exprTypeName in typesDefine) {
    typesDefine[exprTypeName].tokenize = typesDefine[exprTypeName].tokenize || newExpressionClass.stringTokenizer;
    typesDefine[exprTypeName].eval = typesDefine[exprTypeName].eval || newExpressionClass.stringEvaluator;
  }
  return newExpressionClass;
}

function createScopeLayerClass(SvExpression, SvScope) {
  var _class3, _temp3;

  var newScopeLayerClass = (_temp3 = _class3 = function () {
    function SvScopeLayer(scopChain, options) {
      _classCallCheck(this, SvScopeLayer);

      this._scopChain = scopChain;
      this._options = options;
      this._mainScope = null;
      this._startNodeInChain = this._scopChain.pushBack(new _scopeChain.SvScopeChain.Placeholder());
    }

    _createClass(SvScopeLayer, [{
      key: 'initScope',
      value: function initScope(varData, options) {
        options = Object.assign({}, options || {}, {
          findVar: this._scopChain.findVar
        });
        this._mainScope = new SvScope(varData, options);
        this._mainNodeInChain = this._scopChain.insert(this._mainScope, this._startNodeInChain);
      }
    }, {
      key: 'evalVars',
      value: function evalVars() {
        if (!this._mainScope) {
          return false;
        }

        this._mainScope.evalVars();
      }
    }, {
      key: 'evalVar',
      value: function evalVar(varName) {
        return this._mainScope.evalVar(varName, new Set());
      }
    }, {
      key: 'eval',
      value: function _eval(exprRawData) {
        return SvExpression.parseAndEval(this._mainScope, '@one-off', exprRawData, new Set());
      }
    }]);

    return SvScopeLayer;
  }(), _class3.ExpressionClass = SvExpression, _class3.ScopeClass = SvScope, _temp3);
  return newScopeLayerClass;
}

var SvTemplate = exports.SvTemplate = function () {
  function SvTemplate(config) {
    _classCallCheck(this, SvTemplate);

    this._config = config;
    this._ExpressionClass = createExpressionClass(this._config);
    this._ScopeClass = createScopeClass(this._ExpressionClass);
    this._ScopeLayerClass = createScopeLayerClass(this._ExpressionClass, this._ScopeClass);
  }

  _createClass(SvTemplate, [{
    key: 'getScopeLayerClass',
    value: function getScopeLayerClass() {
      return this._ScopeLayerClass;
    }
  }, {
    key: 'getScopeClass',
    value: function getScopeClass() {
      return this._ScopeClass;
    }
  }, {
    key: 'getExpressionClass',
    value: function getExpressionClass() {
      return this._ExpressionClass;
    }
  }]);

  return SvTemplate;
}();