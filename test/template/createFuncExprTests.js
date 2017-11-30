import chai from 'chai';

import {
  TestDataScopeFunctionDefine01,
  TestDataScopeFunctionCall01,
  TestDataScopeFunctionCall02,
  TestDataScopeFunctionCall03,
  TestDataScopeSimpleCall01,
  TestDataScopeSimpleCall02,
  TestDataScopeSimpleCall03,
} from '../test-data/test-data-scope';

const expect = chai.expect;

export default function createFuncExprTests(it, SvScope) {
  it('Should be able to eval \'@fndef\' expressions', (done) => {
    const scope = new SvScope(TestDataScopeFunctionDefine01);
    scope.evalVars();

    const fn01 = scope.evalVar('fn01', new Set());
    const callf = scope.evalVar('callf01', new Set());

    expect(fn01.define, `fn01.define is ${fn01.define}`).to.equal('@eexpr:${srcPath}${arg2}${arg1}');
    expect(callf, `callf01 is ${callf}`).to.equal('xxxxxxxxx');
    done();
  });

  it('Should be able to eval \'@fndef\' by using default values', (done) => {
    const scope = new SvScope(TestDataScopeFunctionCall01);
    scope.evalVars();

    const fn01 = scope.evalVar('fn01', new Set());
    const callf = scope.evalVar('callf01', new Set());

    expect(fn01.define, `fn01.define is ${fn01.define}`).to.equal('@eexpr:${srcPath}${arg2}${arg1}');
    expect(callf, `callf01 is ${callf}`).to.equal('xxxxxx15');
    done();
  });

  it('Should be able to overwrite args values by kvPairs while evaling \'@fndef\' expressions', (done) => {
    const scope = new SvScope(TestDataScopeFunctionCall02);
    scope.evalVars();

    const fn01 = scope.evalVar('fn01', new Set());
    const callf = scope.evalVar('callf01', new Set());

    expect(fn01.define, `fn01.define is ${fn01.define}`).to.equal('@eexpr:${srcPath}${arg2}${arg1}');
    expect(callf, `callf01 is ${callf}`).to.equal('xxxxxxpp');
    done();
  });

  it('Should be able to get exception while args of \'@fndef\' are missing ', (done) => {
    const scope = new SvScope(TestDataScopeFunctionCall03);

    let errorThrown = false;
    try {
      scope.evalVars();
    } catch (e) {
      if (e.message.indexOf('Argument missing') !== -1 && e.message.indexOf('arg2') !== -1) {
        errorThrown = true;
      }
    }
    expect(errorThrown).to.equal(true);
    done();
  });

  it('Should be able to eval \'@fndef\' by using default values(simple)', (done) => {
    const scope = new SvScope(TestDataScopeSimpleCall01);
    scope.evalVars();

    const fn01 = scope.evalVar('fn01', new Set());
    const callf = scope.evalVar('callf01', new Set());

    expect(fn01.define, `fn01.define is ${fn01.define}`).to.equal('@eexpr:${srcPath}${arg2}${arg1}');
    expect(callf, `callf01 is ${callf}`).to.equal('xxxxxx15');
    done();
  });

  it('Should be able to overwrite args values by kvPairs while evaling \'@fndef\' expressions(simple)', (done) => {
    const scope = new SvScope(TestDataScopeSimpleCall02);
    scope.evalVars();

    const fn01 = scope.evalVar('fn01', new Set());
    const callf = scope.evalVar('callf01', new Set());

    expect(fn01.define, `fn01.define is ${fn01.define}`).to.equal('@eexpr:${srcPath}${arg2}${arg1}');
    expect(callf, `callf01 is ${callf}`).to.equal('xxxxxxpp');
    done();
  });

  it('Should be able to get exception while args of \'@fndef\' are missing (simple)', (done) => {
    const scope = new SvScope(TestDataScopeSimpleCall03);

    let errorThrown = false;
    try {
      scope.evalVars();
    } catch (e) {
      if (e.message.indexOf('Argument missing') !== -1 && e.message.indexOf('arg2') !== -1) {
        errorThrown = true;
      }
    }
    expect(errorThrown).to.equal(true);
    done();
  });
}
