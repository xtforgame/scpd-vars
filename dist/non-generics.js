'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _class, _temp;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SvVariable = exports.SvVariable = (_temp = _class = function () {
  function SvVariable(scope, name) {
    _classCallCheck(this, SvVariable);

    this._scope = scope;
    var parentPrefixString = '$parent.';
    if (name.length > parentPrefixString.length && name.substr(0, parentPrefixString.length) === parentPrefixString) {
      this._type = SvVariable.ParentVariable;
      this._name = name.substr(parentPrefixString.length);
    } else if (name === '') {
      this._type = SvVariable.Empty;
      this._name = name;
    } else {
      this._name = name;
    }
  }

  _createClass(SvVariable, [{
    key: 'eval',
    value: function _eval(evalingSet) {
      if (this._type === 'parent') {
        return this._scope.evalVarExternal(this._name, evalingSet);
      } else if (this._type === 'empty') {
        return '';
      }
      return this._scope.evalVar(this._name, evalingSet);
    }
  }, {
    key: 'toString',
    value: function toString() {
      return '${' + (this._name || '<empty>') + '}';
    }
  }]);

  return SvVariable;
}(), _class.ParentVariable = 'parent', _class.Empty = 'empty', _temp);

var SvExprInfo = exports.SvExprInfo = function () {
  function SvExprInfo(typeName, exprBody, defaultValue, typeConfig, rawData) {
    _classCallCheck(this, SvExprInfo);

    this.typeName = typeName;
    this.exprBody = exprBody;
    this.default = defaultValue;
    this.typeConfig = typeConfig;
    this.rawData = rawData;

    this.tokens = [];
  }

  _createClass(SvExprInfo, [{
    key: 'setTokens',
    value: function setTokens(tokens) {
      this.tokens = tokens;
    }
  }, {
    key: 'toString',
    value: function toString() {
      return '${' + this._name + '}';
    }
  }]);

  return SvExprInfo;
}();