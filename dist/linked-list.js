"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _class, _temp;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var LinkedListNode = function () {
  function LinkedListNode(list, data, prev, next) {
    _classCallCheck(this, LinkedListNode);

    this.list = list;
    this.data = data;
    this.prev = prev;
    this.next = next;
  }

  _createClass(LinkedListNode, [{
    key: "toString",
    value: function toString() {
      return this.data.toString();
    }
  }, {
    key: "get",
    value: function get() {
      return this.data;
    }
  }]);

  return LinkedListNode;
}();

var LinkedList = exports.LinkedList = (_temp = _class = function () {
  function LinkedList() {
    _classCallCheck(this, LinkedList);

    this.head = null;
    this.tail = null;
    this._size = 0;
  }

  _createClass(LinkedList, [{
    key: "pushFront",
    value: function pushFront(data) {
      return this.insert(data, this.head);
    }
  }, {
    key: "pushBack",
    value: function pushBack(data) {
      return this.insert(data);
    }
  }, {
    key: "insert",
    value: function insert(data, tarNode) {
      if (tarNode && tarNode.list !== this) {
        return null;
      }

      var newNode = new LinkedList.Node(this, data);
      if (!this.head) {
        this.head = newNode;
        this.tail = newNode;
      } else {
        if (!tarNode) {
          newNode.prev = this.tail;
          this.tail.next = newNode;
          this.tail = newNode;
        } else if (tarNode === this.head) {
          newNode.next = this.head;
          this.head.prev = newNode;
          this.head = newNode;
        } else {
          tarNode.prev.next = newNode;
          newNode.prev = tarNode.prev;
          newNode.next = tarNode;
          tarNode.prev = newNode;
        }
      }

      this._size++;
      return newNode;
    }
  }, {
    key: "popFront",
    value: function popFront() {
      return this.delete(this.head);
    }
  }, {
    key: "popBack",
    value: function popBack() {
      return this.delete(this.tail);
    }
  }, {
    key: "delete",
    value: function _delete(tarNode) {
      if (tarNode && tarNode.list !== this) {
        return null;
      }

      if (this.head === tarNode) {
        this.head = this.head.next;
        if (tarNode.next) {
          tarNode.next.prev = null;
          tarNode.next = null;
        }
      }

      if (this.tail === tarNode) {
        this.tail = this.tail.prev;
        if (tarNode.prev) {
          tarNode.prev.next = null;
          tarNode.prev = null;
        }
      }

      var myPrev = tarNode.prev;
      var myNext = tarNode.next;
      if (myPrev) {
        myPrev.next = myNext;
        tarNode.prev = null;
      }

      if (myNext) {
        myNext.prev = myPrev;
        tarNode.next = null;
      }

      this._size -= 1;
      return tarNode;
    }
  }, {
    key: "clear",
    value: function clear() {
      this.head = null;
      this.tail = null;
      this._size = 0;
    }
  }, {
    key: "length",
    get: function get() {
      return this._size;
    }
  }]);

  return LinkedList;
}(), _class.Node = LinkedListNode, _temp);