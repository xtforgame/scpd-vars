'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SvScopeChain = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _class, _temp;

var _linkedList = require('./linked-list');

var _utils = require('./utils');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SvScopeChainPlaceholder = function SvScopeChainPlaceholder() {
  _classCallCheck(this, SvScopeChainPlaceholder);
};

var SvScopeChain = exports.SvScopeChain = (_temp = _class = function () {
  function SvScopeChain() {
    _classCallCheck(this, SvScopeChain);

    this._map = new Map();
    this._chain = new _linkedList.LinkedList();
    this.findVar = this._findVar.bind(this);
  }

  _createClass(SvScopeChain, [{
    key: 'pushFront',
    value: function pushFront(data) {
      this.delete(data);
      var node = this._chain.pushFront(data);
      this._map.set(data, node);
      return node;
    }
  }, {
    key: 'pushBack',
    value: function pushBack(data) {
      this.delete(data);
      var node = this._chain.pushBack(data);
      this._map.set(data, node);
      return node;
    }
  }, {
    key: 'insert',
    value: function insert(data, tarNode) {
      this.delete(data);
      var node = this._chain.insert(data, tarNode);
      this._map.set(data, node);
      return node;
    }
  }, {
    key: 'popFront',
    value: function popFront() {
      var node = this._chain.popFront();
      if (node) {
        this._map.delete(node.data);
      }
      return node;
    }
  }, {
    key: 'popBack',
    value: function popBack() {
      var node = this._chain.popBack();
      if (node) {
        this._map.delete(node.data);
      }
      return node;
    }
  }, {
    key: 'delete',
    value: function _delete(data) {
      var node = this._map.get(data);
      if (node) {
        this._map.delete(node.data);
        this._chain.delete(node);
      }
      return node;
    }
  }, {
    key: 'clear',
    value: function clear() {
      this._map.clear();
      return this._chain.clear(tarNode);
    }
  }, {
    key: '_findVar',
    value: function _findVar(visitorScope, varName) {
      var result = (0, _utils.createEmplyFindVarResult)();
      var node = this._chain.tail;

      if (visitorScope) {
        var foundNode = this._map.get(visitorScope);
        if (foundNode) {
          node = foundNode.prev;
        }
      }

      var currentScope = null;

      while (node) {
        currentScope = node.data;
        if (currentScope && !(currentScope instanceof SvScopeChain.Placeholder)) {
          result = currentScope.findVarLocal(visitorScope, varName);
          if (result.var) {
            return result;
          }
        }
        node = node.prev;
      }

      return result;
    }
  }, {
    key: 'length',
    get: function get() {
      return this._chain.length;
    }
  }]);

  return SvScopeChain;
}(), _class.Node = _linkedList.LinkedList.Node, _class.Placeholder = SvScopeChainPlaceholder, _temp);