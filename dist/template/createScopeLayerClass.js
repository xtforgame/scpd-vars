'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.default = createScopeLayerClass;

var _scopeChain = require('../scope-chain');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function createScopeLayerClass(SvExpression, SvScope) {
  var _class, _temp;

  var newScopeLayerClass = (_temp = _class = function () {
    function SvScopeLayer(scopChain, options) {
      var _this = this;

      _classCallCheck(this, SvScopeLayer);

      this._scopChain = scopChain;
      this._options = options;

      this._nodeDefines = {
        placeHolder: {
          insert: function insert() {
            return null;
          }
        },
        head: {
          insert: function insert() {
            return _this._scopChain.head;
          }
        },
        main: {
          insert: function insert() {
            return _this.node('placeHolder');
          },
          onCreated: function onCreated(node, scope) {
            _this._mainScope = scope;
            _this._lastNode = node;
          }
        },
        before: {
          insert: function insert() {
            return _this.node('main');
          }
        },
        after: {
          insert: function insert() {
            return _this.node('main').next;
          },
          onCreated: function onCreated(node) {
            return _this._lastNode = node;
          }
        },
        queryBody: {
          insert: function insert() {
            return (_this.node('after') || _this.node('main')).next;
          },
          onCreated: function onCreated(node) {
            return _this._lastNode = node;
          }
        }
      };
      this._mainScope = null;
      this._firstNode = this._scopChain.pushBack(new _scopeChain.SvScopeChain.Placeholder());
      this._lastNode = this._firstNode;
    }

    _createClass(SvScopeLayer, [{
      key: 'node',
      value: function node(nodeName) {
        return this._nodeDefines[nodeName].node;
      }
    }, {
      key: 'scope',
      value: function scope(nodeName) {
        return this._nodeDefines[nodeName].scope;
      }
    }, {
      key: '_createNode',
      value: function _createNode(name, varData, options) {
        this._removeNode(name);

        options = Object.assign({}, options || {}, {
          findVar: this._scopChain.findVar
        });
        var scope = new SvScope(varData, options);

        var insertPosFunc = this._nodeDefines[name].insert || function () {
          return null;
        };
        var onCreated = this._nodeDefines[name].onCreated || function () {
          return null;
        };
        this._nodeDefines[name].scope = scope;
        this._nodeDefines[name].node = this._scopChain.insert(scope, insertPosFunc());
        var node = this._nodeDefines[name].node;
        onCreated(node, scope, name);
        return node;
      }
    }, {
      key: '_removeNode',
      value: function _removeNode(name) {
        if (!this._nodeDefines[name].scope) {
          return false;
        }

        var _nodeDefines$name = this._nodeDefines[name],
            scope = _nodeDefines$name.scope,
            node = _nodeDefines$name.node;

        var prevNode = node.prev;
        var onRemoved = this._nodeDefines[name].onRemoved || function (_node) {
          return null;
        };
        this._scopChain.delete(this._nodeDefines[name].scope);
        this._nodeDefines[name].scope = null;
        this._nodeDefines[name].node = null;
        if (this._lastNode === node) {
          this._lastNode = prevNode;
        }
        onRemoved(node, scope, name);
        return true;
      }
    }, {
      key: 'initScope',
      value: function initScope(varData, options) {
        return this._createNode('main', varData, options);
      }
    }, {
      key: 'evalVars',
      value: function evalVars() {
        return this._mainScope && this._mainScope.evalVars();
      }
    }, {
      key: 'getEvaledVars',
      value: function getEvaledVars() {
        return this._mainScope && this._mainScope.getEvaledVars();
      }
    }, {
      key: 'evalVar',
      value: function evalVar(varName) {
        return this._lastNode.data.evalVar(varName, new Set());
      }
    }, {
      key: 'eval',
      value: function _eval(exprRawData) {
        return SvExpression.parseAndEval(this._lastNode.data, '@one-off', exprRawData, new Set());
      }
    }, {
      key: '_setupNodesBeforeQuery',
      value: function _setupNodesBeforeQuery(varDataMap) {
        var _this2 = this;

        varDataMap = varDataMap || {};
        newScopeLayerClass.TempNodeNameForQuery.forEach(function (name) {
          if (name in varDataMap) {
            var node = _this2._createNode(name, varDataMap[name]);
            node.data.evalVars();
          }
        });
      }
    }, {
      key: '_cleanNodesAfterQuery',
      value: function _cleanNodesAfterQuery() {
        var _this3 = this;

        this._removeNode('queryBody');
        newScopeLayerClass.TempNodeNameForQuery.forEach(function (name) {
          _this3._removeNode(name);
        });
      }
    }, {
      key: 'query',
      value: function query(exprRawData, varDataMap) {
        var _this4 = this;

        var result = null;
        try {
          this._setupNodesBeforeQuery(varDataMap);
          if (Array.isArray(exprRawData)) {
            result = exprRawData.map(function (expr) {
              return _this4.eval(expr);
            });
          } else {
            result = this.eval(exprRawData);
          }
        } catch (e) {
          this._cleanNodesAfterQuery();
          throw e;
        }
        this._cleanNodesAfterQuery();
        return result;
      }
    }, {
      key: 'compile',
      value: function compile(srcVarData, varDataMap) {
        var result = null;
        try {
          this._setupNodesBeforeQuery(varDataMap);
          var node = this._createNode('queryBody', srcVarData);
          result = node.data.evalVars();
        } catch (e) {
          this._cleanNodesAfterQuery();
          throw e;
        }
        this._cleanNodesAfterQuery();
        return result;
      }
    }]);

    return SvScopeLayer;
  }(), _class.ExpressionClass = SvExpression, _class.ScopeClass = SvScope, _class.TempNodeNameForQuery = ['head', 'before', 'after'], _temp);
  return newScopeLayerClass;
}