'use strict';

var _chai = require('chai');

var _chai2 = _interopRequireDefault(_chai);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _linkedList = require('../dist/linked-list');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var expect = _chai2.default.expect;
var assert = _chai2.default.assert;

describe('Linked list test', function () {
  describe('Basic', function () {
    it('Should pass the basic pushBack test', function (done) {
      var list = new _linkedList.LinkedList();
      for (var i = 0; i < 15; i++) {
        list.pushBack(i);
      }

      var node = list.head;
      for (var _i = 0; _i < 15; _i++) {
        expect(node.data, 'node.data is ' + node.data).to.equal(_i);
        node = node.next;
      }

      expect(list.length, 'list.length is ' + list.length).to.equal(15);
      expect(list.head, 'list.head is ' + list.head).to.exist;
      expect(list.tail, 'list.tail is ' + list.tail).to.exist;
      done();
    });

    it('Should pass the basic popBack test', function (done) {
      var list = new _linkedList.LinkedList();
      for (var i = 0; i < 15; i++) {
        list.pushBack(i);
      }

      for (var _i2 = 0; _i2 < 15; _i2++) {
        var node = list.popBack();
        expect(node.data, 'node.data is ' + node.data).to.equal(15 - 1 - _i2);
        node = node.next;
      }

      expect(list.length, 'list.length is ' + list.length).to.equal(0);
      expect(list.head, 'list.head is ' + list.head).to.not.exist;
      expect(list.tail, 'list.tail is ' + list.tail).to.not.exist;
      done();
    });

    it('Should pass the basic pushFront test', function (done) {
      var list = new _linkedList.LinkedList();
      for (var i = 0; i < 15; i++) {
        list.pushFront(i);
      }

      var node = list.head;
      for (var _i3 = 0; _i3 < 15; _i3++) {
        expect(node.data, 'node.data is ' + node.data).to.equal(15 - 1 - _i3);
        node = node.next;
      }

      expect(list.length, 'list.length is ' + list.length).to.equal(15);
      expect(list.head, 'list.head is ' + list.head).to.exist;
      expect(list.tail, 'list.tail is ' + list.tail).to.exist;
      done();
    });

    it('Should pass the basic popFront test', function (done) {
      var list = new _linkedList.LinkedList();
      for (var i = 0; i < 15; i++) {
        list.pushFront(i);
      }

      for (var _i4 = 0; _i4 < 15; _i4++) {
        var node = list.popFront();
        expect(node.data, 'node.data is ' + node.data).to.equal(15 - 1 - _i4);
        node = node.next;
      }

      expect(list.length, 'list.length is ' + list.length).to.equal(0);
      expect(list.head, 'list.head is ' + list.head).to.not.exist;
      expect(list.tail, 'list.tail is ' + list.tail).to.not.exist;
      done();
    });

    it('Should pass the basic insert test', function (done) {
      var list = new _linkedList.LinkedList();
      var nodes = [];
      for (var i = 1; i < 30; i += 2) {
        nodes.push(list.pushBack(i));
      }

      for (var _i5 = 0; _i5 < 15; _i5++) {
        list.insert(_i5 * 2, nodes[_i5]);
      }

      var node = list.head;
      for (var _i6 = 0; _i6 < 30; _i6++) {
        expect(node.data, 'node.data is ' + node.data).to.equal(_i6);
        node = node.next;
      }

      expect(list.length, 'list.length is ' + list.length).to.equal(30);
      expect(list.head, 'list.head is ' + list.head).to.exist;
      expect(list.tail, 'list.tail is ' + list.tail).to.exist;
      done();
    });

    it('Should pass the basic delete test 1', function (done) {
      var list = new _linkedList.LinkedList();
      var nodes = [];
      for (var i = 0; i < 30; i += 2) {
        nodes.push(list.pushBack(i));
      }

      expect(list.length, 'list.length is ' + list.length).to.equal(15);
      expect(list.head, 'list.head is ' + list.head).to.exist;
      expect(list.tail, 'list.tail is ' + list.tail).to.exist;

      for (var _i7 = 0; _i7 < 15; _i7++) {
        var node = list.delete(nodes[_i7]);
        expect(node.data, 'node.data is ' + node.data).to.equal(_i7 * 2);
        node = node.next;
      }

      expect(list.length, 'list.length is ' + list.length).to.equal(0);
      expect(list.head, 'list.head is ' + list.head).to.not.exist;
      expect(list.tail, 'list.tail is ' + list.tail).to.not.exist;
      done();
    });

    it('Should pass the basic delete test 2', function (done) {
      var list = new _linkedList.LinkedList();
      var nodes = [];
      for (var i = 0; i < 30; i += 2) {
        nodes.push(list.pushBack(i));
      }

      expect(list.length, 'list.length is ' + list.length).to.equal(15);
      expect(list.head, 'list.head is ' + list.head).to.exist;
      expect(list.tail, 'list.tail is ' + list.tail).to.exist;

      for (var _i8 = 15 - 1; _i8 >= 0; _i8--) {
        var node = list.delete(nodes[_i8]);
        expect(node.data, 'node.data is ' + node.data).to.equal(_i8 * 2);
        node = node.next;
      }

      expect(list.length, 'list.length is ' + list.length).to.equal(0);
      expect(list.head, 'list.head is ' + list.head).to.not.exist;
      expect(list.tail, 'list.tail is ' + list.tail).to.not.exist;
      done();
    });
  });
});