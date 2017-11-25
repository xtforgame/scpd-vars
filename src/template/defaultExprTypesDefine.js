import path from '../path';
import {
  SvVariable,
} from '../non-generics';

const defaultExprTypesDefine = {
  '@eexpr': {},
  '@nexpr': {
    tokenize: (exprObj, ExpressionClass) => [exprObj.exprInfo.rawData.substr('@nexpr:'.length)],
  },
  '@fndef': {
    tokenize: (exprObj, ExpressionClass) => [exprObj.exprInfo.rawData],
    eval: (exprObj, evalingSet, ExpressionClass) => {
      return exprObj.exprInfo.rawData.exprBody;
    },
  },
  '@getfn': {
    eval: (exprObj, evalingSet, ExpressionClass) => {
      const exprInfo = exprObj.exprInfo;
      return exprInfo.tokens.map((part) => {
        if (part instanceof SvVariable) {
          return part.eval(evalingSet);
        }
        return part;
      })[0];
    },
  },
  '@callf': {
    tokenize: (exprObj, ExpressionClass) => [exprObj.exprInfo.rawData],
    eval: (exprObj, evalingSet, ExpressionClass) => {
      const exprBody = exprObj.exprInfo.rawData.exprBody;
      const funcDef = ExpressionClass.parseAndEval(exprObj.scope, '@funcDef', exprBody.fndef, evalingSet);
      const callFunc = ExpressionClass.parseAndEval(exprObj.scope, '@callFunc', funcDef.fndef, evalingSet);
      const xxcallFunc = ExpressionClass.parse(exprObj.scope, '@callFunc', funcDef.fndef);
      console.log('xxcallFunc._exprInfo.tokens[0]._name :', xxcallFunc._exprInfo.tokens[0]._name);
      console.log('xxcallFunc._exprInfo.tokens[0].eval(evalingSet) :', xxcallFunc._exprInfo.tokens[0].eval(evalingSet));
      console.log('funcDef, callFunc :', funcDef, callFunc);
      return callFunc;
    },
  },
  '@dexpr': {
    tokenize: (exprObj, ExpressionClass) => [exprObj.exprInfo.rawData],
    eval: (exprObj, evalingSet, ExpressionClass) => {
      const exprBody = exprObj.exprInfo.rawData.exprBody;
      const switchValue = ExpressionClass.parseAndEval(exprObj.scope, '@switch', exprBody.switch, evalingSet);

      const exprSwitchCases = exprBody.cases;
      let valueExprRaw = null;
      let exprName = '';
      if (exprSwitchCases && switchValue in exprSwitchCases) {
        exprName = '@case';
        valueExprRaw = exprSwitchCases[switchValue];
      } else if ('default' in exprBody) {
        exprName = '@caseDefault';
        valueExprRaw = exprBody.default;
      }

      if (valueExprRaw) {
        return ExpressionClass.parseAndEval(exprObj.scope, exprName, valueExprRaw, evalingSet);
      }

      throw Error(`@dexpr: No matched case for switch value:${switchValue}`);
    },
  },
  '@opath': {
    eval: (exprObj, evalingSet, ExpressionClass) => {
      const _path = ExpressionClass.stringEvaluator(exprObj, evalingSet).replace(/\\/g, '/');
      return path.normalize(_path);
    },
  },
  '@ppath': {
    eval: (exprObj, evalingSet, ExpressionClass) => {
      const _path = ExpressionClass.stringEvaluator(exprObj, evalingSet).replace(/\\/g, '/');
      return path.posix.normalize(_path);
    },
  },
  '@wpath': {
    eval: (exprObj, evalingSet, ExpressionClass) => {
      const _path = ExpressionClass.stringEvaluator(exprObj, evalingSet).replace(/\\/g, '/');
      return path.win32.normalize(_path);
    },
  },
};

export default defaultExprTypesDefine;
