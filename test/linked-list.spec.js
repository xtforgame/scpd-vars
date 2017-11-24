/* eslint-disable no-unused-vars, no-undef, no-unused-expressions */

import chai from 'chai';

import path from 'path';
import {
  LinkedList,
} from '../dist/linked-list';


const expect = chai.expect;
const assert = chai.assert;

describe('Linked list test', () => {
  describe('Basic', () => {
    it('Should pass the basic pushBack test', (done) => {
      const list = new LinkedList();
      for (let i = 0; i < 15; i++) {
        list.pushBack(i);
      }

      let node = list.head;
      for (let i = 0; i < 15; i++) {
        expect(node.data, `node.data is ${node.data}`).to.equal(i);
        node = node.next;
      }

      expect(list.length, `list.length is ${list.length}`).to.equal(15);
      expect(list.head, `list.head is ${list.head}`).to.exist;
      expect(list.tail, `list.tail is ${list.tail}`).to.exist;
      done();
    });

    it('Should pass the basic popBack test', (done) => {
      const list = new LinkedList();
      for (let i = 0; i < 15; i++) {
        list.pushBack(i);
      }

      for (let i = 0; i < 15; i++) {
        let node = list.popBack();
        expect(node.data, `node.data is ${node.data}`).to.equal(15 - 1 - i);
        node = node.next;
      }

      expect(list.length, `list.length is ${list.length}`).to.equal(0);
      expect(list.head, `list.head is ${list.head}`).to.not.exist;
      expect(list.tail, `list.tail is ${list.tail}`).to.not.exist;
      done();
    });

    it('Should pass the basic pushFront test', (done) => {
      const list = new LinkedList();
      for (let i = 0; i < 15; i++) {
        list.pushFront(i);
      }

      let node = list.head;
      for (let i = 0; i < 15; i++) {
        expect(node.data, `node.data is ${node.data}`).to.equal(15 - 1 - i);
        node = node.next;
      }

      expect(list.length, `list.length is ${list.length}`).to.equal(15);
      expect(list.head, `list.head is ${list.head}`).to.exist;
      expect(list.tail, `list.tail is ${list.tail}`).to.exist;
      done();
    });

    it('Should pass the basic popFront test', (done) => {
      const list = new LinkedList();
      for (let i = 0; i < 15; i++) {
        list.pushFront(i);
      }

      for (let i = 0; i < 15; i++) {
        let node = list.popFront();
        expect(node.data, `node.data is ${node.data}`).to.equal(15 - 1 - i);
        node = node.next;
      }

      expect(list.length, `list.length is ${list.length}`).to.equal(0);
      expect(list.head, `list.head is ${list.head}`).to.not.exist;
      expect(list.tail, `list.tail is ${list.tail}`).to.not.exist;
      done();
    });

    it('Should pass the basic insert test', (done) => {
      const list = new LinkedList();
      const nodes = [];
      for (let i = 1; i < 30; i += 2) {
        nodes.push(list.pushBack(i));
      }

      for (let i = 0; i < 15; i++) {
        list.insert(i * 2, nodes[i]);
      }

      let node = list.head;
      for (let i = 0; i < 30; i++) {
        expect(node.data, `node.data is ${node.data}`).to.equal(i);
        node = node.next;
      }

      expect(list.length, `list.length is ${list.length}`).to.equal(30);
      expect(list.head, `list.head is ${list.head}`).to.exist;
      expect(list.tail, `list.tail is ${list.tail}`).to.exist;
      done();
    });

    it('Should pass the basic delete test 1', (done) => {
      const list = new LinkedList();
      const nodes = [];
      for (let i = 0; i < 30; i += 2) {
        nodes.push(list.pushBack(i));
      }

      expect(list.length, `list.length is ${list.length}`).to.equal(15);
      expect(list.head, `list.head is ${list.head}`).to.exist;
      expect(list.tail, `list.tail is ${list.tail}`).to.exist;

      for (let i = 0; i < 15; i++) {
        let node = list.delete(nodes[i]);
        expect(node.data, `node.data is ${node.data}`).to.equal(i * 2);
        node = node.next;
      }

      expect(list.length, `list.length is ${list.length}`).to.equal(0);
      expect(list.head, `list.head is ${list.head}`).to.not.exist;
      expect(list.tail, `list.tail is ${list.tail}`).to.not.exist;
      done();
    });

    it('Should pass the basic delete test 2', (done) => {
      const list = new LinkedList();
      const nodes = [];
      for (let i = 0; i < 30; i += 2) {
        nodes.push(list.pushBack(i));
      }

      expect(list.length, `list.length is ${list.length}`).to.equal(15);
      expect(list.head, `list.head is ${list.head}`).to.exist;
      expect(list.tail, `list.tail is ${list.tail}`).to.exist;

      for (let i = 15 - 1; i >= 0; i--) {
        let node = list.delete(nodes[i]);
        expect(node.data, `node.data is ${node.data}`).to.equal(i * 2);
        node = node.next;
      }

      expect(list.length, `list.length is ${list.length}`).to.equal(0);
      expect(list.head, `list.head is ${list.head}`).to.not.exist;
      expect(list.tail, `list.tail is ${list.tail}`).to.not.exist;
      done();
    });
  });
});

