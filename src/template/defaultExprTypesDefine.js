import path from '../path';
import {
  SvVariable,
} from '../non-generics';

class FuncHelper
{
  static getCallInfo(exprObj){
    return exprObj.exprInfo.rawData.exprBody;
  }

  static getNormalizedArgInfo(funcDefExprBody){
    let args = funcDefExprBody.args || [];
    let argMap = {};
    args = args.map((arg, i) => {
      let normalizeArg = null;
      if (!Array.isArray(arg)) {
        normalizeArg = [arg];
      }else{
        normalizeArg = [...arg];
      }
      argMap[normalizeArg[0]] = i;
      return normalizeArg;
    });
    return {args, argMap};
  }
}

const defaultExprTypesDefine = {
  '@eexpr': {},
  '@nexpr': {
    tokenize: (exprObj, ExpressionClass) => [exprObj.exprInfo.rawData.substr('@nexpr:'.length)],
  },
  '@fndef': {
    tokenize: (exprObj, ExpressionClass) => [exprObj.exprInfo.rawData],
    eval: (exprObj, evalingSet, ExpressionClass) => {
      // let exprBody = exprObj.exprInfo.rawData.exprBody;
      // exprBody.args = exprBody.args || [];
      // exprBody.argMap = {};
      // exprBody.args = exprBody.args.map((arg, i) => {
      //   if (!Array.isArray(arg)) {
      //     arg = [arg];
      //   }
      //   exprBody.argMap[arg[0]] = i;
      //   return arg;
      // });
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
      const callInfo = FuncHelper.getCallInfo(exprObj);
      callInfo.args = callInfo.args || [];
      callInfo.kvPairs = callInfo.kvPairs || {};
      const funcDef = ExpressionClass.parseAndEval(exprObj.scope, '@funcDef', `@getfn:\${${callInfo.function}}`, evalingSet);
      const funcExpr = ExpressionClass.parse(exprObj.scope, '@funcExpr', funcDef.define);
      {
        // parse arg values
        const finalArgMap = {};
        const {args: defArgs, argMap: defArgMap} = FuncHelper.getNormalizedArgInfo(funcDef);
        callInfo.args.forEach((arg, i) => {
          const argDef = defArgs[i];
          if (argDef) {
            finalArgMap[argDef[0]] = ExpressionClass.parseAndEval(exprObj.scope, '@arg', arg, evalingSet);
          }
        });
        Object.keys(callInfo.kvPairs).forEach((key) => {
          const argDefIndex = defArgMap[key];
          if (argDefIndex != null) {
            finalArgMap[key] = ExpressionClass.parseAndEval(exprObj.scope, '@arg', callInfo.kvPairs[key], evalingSet);
          }
        });
        defArgs.forEach((argDef) => {
          if (finalArgMap[argDef[0]] == null && argDef[1] == null) {
            throw new Error(`Argument missing :${argDef[0]}`);
          }
        });
        funcExpr._exprInfo.tokens = funcExpr._exprInfo.tokens.map((part) => {
          // replace tokens
          if (part instanceof SvVariable) {
            const value = finalArgMap[part._name];
            if (value !== undefined) {
              return value;
            }

            const argDefIndex = defArgMap[part._name];
            if (argDefIndex != null) {
              const defaultValue = defArgs[argDefIndex][1];
              if (defaultValue) {
                return ExpressionClass.parseAndEval(exprObj.scope, '@arg', defaultValue, evalingSet);
              }
            }
            return part;
          }
          return part;
        });
      }

      const result = funcExpr.eval(evalingSet);
      return result;
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
