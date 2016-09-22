'use strict';

var _dec, _class;

var _chai = require('chai');

var _chai2 = _interopRequireDefault(_chai);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var expect = _chai2.default.expect;

function az_decorator_test(value) {
  return function decorator(target) {
    target.az_decorator_test = value;
  };
}

var Es6Decorator = (_dec = az_decorator_test(true), _dec(_class = function Es6Decorator() {
  _classCallCheck(this, Es6Decorator);
}) || _class);


describe('Es6 features test', function () {
  describe('Decorator test 1: Add member to class', function () {

    var inst = new Es6Decorator();

    it('<class_name>.<var_name>', function (done) {
      expect(Es6Decorator.az_decorator_test).to.equal(true);
      done();
    });

    it('<inst_name>.constructor.<var_name>', function (done) {
      expect(inst.constructor.az_decorator_test).to.equal(true);
      done();
    });
  });

  describe('Promise test 1: Basic', function () {

    function promise_test_01() {
      return new Promise(function (resolve, reject) {
        resolve(true);
      });
    }

    function promise_test_02() {
      return new Promise(function (resolve, reject) {
        reject(true);
      });
    }

    it('.then()', function () {
      return promise_test_01().then(function (result) {
        expect(result).to.equal(true);
      });
    });

    it('.catch()', function () {
      return promise_test_02().then().catch(function (error) {
        expect(error).to.equal(true);
      });
    });
  });

  describe('Promise test 2: eachSeries', function () {

    function asyncEachSeries(in_array, in_func, start_value) {
      return in_array.reduce(function (previousPromise, currentValue, currentIndex, array) {
        return previousPromise.then(function (previousValue) {
          return in_func(previousValue, currentValue, currentIndex, array);
        });
      }, Promise.resolve(start_value));
    }

    it('asyncEachSeries', function () {
      return asyncEachSeries([0, 1, 2, 3, 4, 5, 6], function (previousValue, currentValue, currentIndex, array) {
        return previousValue + currentValue;
      }, 0).then(function (result) {
        expect(result).to.equal(21);
      });
    });
  });
});