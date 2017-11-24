/* eslint-disable no-unused-vars, no-undef, no-unused-expressions */

import chai from 'chai';

import path from 'path';

import scpdVars, {
  escapeString,
  unescapeString,
  findContentInBracket,
  EscapeChar,
  createEmplyFindVarResult,
  SvVariable,
  SvExprInfo,
  SvTemplate,
  defaultExprTypesDefine,
  SvScopeChain,
} from '../dist';

const expect = chai.expect;
const assert = chai.assert;

describe('Existence test', () => {
  it('Should include all exported name in the public interface', (done) => {
    expect(escapeString, `escapeString is ${escapeString}`).to.exist;
    expect(unescapeString, `unescapeString is ${unescapeString}`).to.exist;
    expect(findContentInBracket, `findContentInBracket is ${findContentInBracket}`).to.exist;
    expect(EscapeChar, `EscapeChar is ${EscapeChar}`).to.exist;
    expect(createEmplyFindVarResult, `createEmplyFindVarResult is ${createEmplyFindVarResult}`).to.exist;
    expect(SvVariable, `SvVariable is ${SvVariable}`).to.exist;
    expect(SvExprInfo, `SvExprInfo is ${SvExprInfo}`).to.exist;
    expect(SvTemplate, `SvTemplate is ${SvTemplate}`).to.exist;
    expect(defaultExprTypesDefine, `defaultExprTypesDefine is ${defaultExprTypesDefine}`).to.exist;
    expect(SvScopeChain, `SvScopeChain is ${SvScopeChain}`).to.exist;
    done();
  });
});

