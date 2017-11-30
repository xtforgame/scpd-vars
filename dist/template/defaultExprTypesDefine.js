'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _path2 = require('../path');

var _path3 = _interopRequireDefault(_path2);

var _nonGenerics = require('../non-generics');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var FuncHelper = function () {
  function FuncHelper() {
    _classCallCheck(this, FuncHelper);
  }

  _createClass(FuncHelper, null, [{
    key: 'getSimpleFormCallInfo',
    value: function getSimpleFormCallInfo(tokens, evalingSet) {
      var _function = '';
      var args = [];
      var kvPairs = {};
      var getherFunctionName = function getherFunctionName(strPart) {
        _function += strPart;
      };

      var getherFunction = getherFunctionName;
      tokens.forEach(function (part, i) {
        if (part instanceof _nonGenerics.SvVariable) {
          if (part._type === _nonGenerics.SvVariable.Empty) {
            var index = args.length;
            getherFunction = function getherFunction(strPart) {
              args[index] += strPart;
            };
            return args.push('');
          } else if (part._name[0] === '@') {
            var key = part._name.substr(1);
            getherFunction = function getherFunction(strPart) {
              kvPairs[key] += strPart;
            };
            return kvPairs[key] = '';
          }
          return getherFunction(part.eval(evalingSet));
        }
        return getherFunction(part);
      });
      getherFunction('');

      if (!_function) {
        throw new Error('The simple form of @callf should at least provide a function name as the first arg.');
      }

      return {
        function: _function,
        args: args,
        kvPairs: kvPairs
      };
    }
  }, {
    key: 'getNormalizedCallInfo',
    value: function getNormalizedCallInfo(exprObj, evalingSet) {
      var tokens = exprObj.exprInfo.tokens;
      if (!tokens || tokens.length === 0) {
        var exprBody = exprObj.exprInfo.rawData.exprBody;
        var callInfo = {
          function: exprBody.function,
          args: exprBody.args || [],
          kvPairs: exprBody.kvPairs || {}
        };
        return callInfo;
      }
      return FuncHelper.getSimpleFormCallInfo(tokens, evalingSet);
    }
  }, {
    key: 'getNormalizedArgInfo',
    value: function getNormalizedArgInfo(funcDefExprBody) {
      var args = funcDefExprBody.args || [];
      var argMap = {};
      args = args.map(function (arg, i) {
        var normalizeArg = null;
        if (!Array.isArray(arg)) {
          normalizeArg = [arg];
        } else {
          normalizeArg = [].concat(_toConsumableArray(arg));
        }
        argMap[normalizeArg[0]] = i;
        return normalizeArg;
      });
      return { args: args, argMap: argMap };
    }
  }]);

  return FuncHelper;
}();

var defaultExprTypesDefine = {
  '@eexpr': {},
  '@nexpr': {
    tokenize: function tokenize(exprObj, ExpressionClass) {
      return [exprObj.exprInfo.rawData.substr('@nexpr:'.length)];
    }
  },
  '@fndef': {
    tokenize: function tokenize(exprObj, ExpressionClass) {
      return [exprObj.exprInfo.rawData];
    },
    eval: function _eval(exprObj, evalingSet, ExpressionClass) {
      return exprObj.exprInfo.rawData.exprBody;
    }
  },
  '@getfn': {
    eval: function _eval(exprObj, evalingSet, ExpressionClass) {
      var exprInfo = exprObj.exprInfo;
      return exprInfo.tokens.map(function (part) {
        if (part instanceof _nonGenerics.SvVariable) {
          return part.eval(evalingSet);
        }
        return part;
      })[0];
    }
  },
  '@callf': {
    tokenize: function tokenize(exprObj, ExpressionClass) {
      if (typeof exprObj.exprInfo.rawData === 'string') {
        return ExpressionClass.stringTokenizer(exprObj);
      }
      return [];
    },
    eval: function _eval(exprObj, evalingSet, ExpressionClass) {
      var callInfo = FuncHelper.getNormalizedCallInfo(exprObj, evalingSet);
      var funcDef = ExpressionClass.parseAndEval(exprObj.scope, '@funcDef', '@getfn:${' + callInfo.function + '}', evalingSet);
      var funcExpr = ExpressionClass.parse(exprObj.scope, '@funcExpr', funcDef.define);
      {
        var finalArgMap = {};

        var _FuncHelper$getNormal = FuncHelper.getNormalizedArgInfo(funcDef),
            defArgs = _FuncHelper$getNormal.args,
            defArgMap = _FuncHelper$getNormal.argMap;

        callInfo.args.forEach(function (arg, i) {
          var argDef = defArgs[i];
          if (argDef) {
            finalArgMap[argDef[0]] = ExpressionClass.parseAndEval(exprObj.scope, '@arg', arg, evalingSet);
          }
        });
        Object.keys(callInfo.kvPairs).forEach(function (key) {
          var argDefIndex = defArgMap[key];
          if (argDefIndex != null) {
            finalArgMap[key] = ExpressionClass.parseAndEval(exprObj.scope, '@arg', callInfo.kvPairs[key], evalingSet);
          }
        });
        defArgs.forEach(function (argDef) {
          if (finalArgMap[argDef[0]] == null && argDef[1] == null) {
            throw new Error('Argument missing :' + argDef[0]);
          }
        });
        funcExpr._exprInfo.tokens = funcExpr._exprInfo.tokens.map(function (part) {
          if (part instanceof _nonGenerics.SvVariable) {
            var value = finalArgMap[part._name];
            if (value !== undefined) {
              return value;
            }

            var argDefIndex = defArgMap[part._name];
            if (argDefIndex != null) {
              var defaultValue = defArgs[argDefIndex][1];
              if (defaultValue) {
                return ExpressionClass.parseAndEval(exprObj.scope, '@arg', defaultValue, evalingSet);
              }
            }
            return part;
          }
          return part;
        });
      }

      var result = funcExpr.eval(evalingSet);
      return result;
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
  },
  '@opath': {
    eval: function _eval(exprObj, evalingSet, ExpressionClass) {
      var _path = ExpressionClass.stringEvaluator(exprObj, evalingSet).replace(/\\/g, '/');
      return _path3.default.normalize(_path);
    }
  },
  '@ppath': {
    eval: function _eval(exprObj, evalingSet, ExpressionClass) {
      var _path = ExpressionClass.stringEvaluator(exprObj, evalingSet).replace(/\\/g, '/');
      return _path3.default.posix.normalize(_path);
    }
  },
  '@wpath': {
    eval: function _eval(exprObj, evalingSet, ExpressionClass) {
      var _path = ExpressionClass.stringEvaluator(exprObj, evalingSet).replace(/\\/g, '/');
      return _path3.default.win32.normalize(_path);
    }
  }
};

exports.default = defaultExprTypesDefine;