'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.default = createExpressionClass;

var _utils = require('../utils');

var _nonGenerics = require('../non-generics');

var _defaultExprTypesDefine = require('./defaultExprTypesDefine');

var _defaultExprTypesDefine2 = _interopRequireDefault(_defaultExprTypesDefine);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function createExpressionClass(config) {
  var _class, _temp;

  var newExpressionClass = (_temp = _class = function () {
    _createClass(SvExpression, null, [{
      key: 'normalizeExprInfo',
      value: function normalizeExprInfo(data) {
        var exprTypeName = null;
        var exprBody = data;
        var defaultValue = void 0;

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
        var exprInfo = exprObj.exprInfo;
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
          if (result[2] == null) {
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
  }(), _class.exprTypesDefine = config.exprTypesDefine || _defaultExprTypesDefine2.default, _temp);

  var typesDefine = newExpressionClass.exprTypesDefine;
  Object.keys(typesDefine).forEach(function (exprTypeName) {
    typesDefine[exprTypeName].tokenize = typesDefine[exprTypeName].tokenize || newExpressionClass.stringTokenizer;
    typesDefine[exprTypeName].eval = typesDefine[exprTypeName].eval || newExpressionClass.stringEvaluator;
  });
  return newExpressionClass;
}