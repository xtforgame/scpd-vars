'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SvTemplate = exports.defaultExprTypesDefine = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _defaultExprTypesDefine = require('./defaultExprTypesDefine');

var _defaultExprTypesDefine2 = _interopRequireDefault(_defaultExprTypesDefine);

var _createScopeClass = require('./createScopeClass');

var _createScopeClass2 = _interopRequireDefault(_createScopeClass);

var _createExpressionClass = require('./createExpressionClass');

var _createExpressionClass2 = _interopRequireDefault(_createExpressionClass);

var _createScopeLayerClass = require('./createScopeLayerClass');

var _createScopeLayerClass2 = _interopRequireDefault(_createScopeLayerClass);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

exports.defaultExprTypesDefine = _defaultExprTypesDefine2.default;

var SvTemplate = exports.SvTemplate = function () {
  function SvTemplate(config) {
    _classCallCheck(this, SvTemplate);

    this._config = config;
    this._ExpressionClass = (0, _createExpressionClass2.default)(this._config);
    this._ScopeClass = (0, _createScopeClass2.default)(this._ExpressionClass);
    this._ScopeLayerClass = (0, _createScopeLayerClass2.default)(this._ExpressionClass, this._ScopeClass);
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