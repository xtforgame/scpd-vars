import {
  // escapeString,
  unescapeString,
  findContentInBracket,
  // EscapeChar,
  // createEmplyFindVarResult,
} from '../utils';

import {
  SvVariable,
  SvExprInfo,
} from '../non-generics';

import defaultExprTypesDefine from './defaultExprTypesDefine';

export default function createExpressionClass(config) {
  const newExpressionClass = class SvExpression {
    static exprTypesDefine = config.exprTypesDefine || defaultExprTypesDefine;
    static normalizeExprInfo(data) {
      let exprTypeName = null;
      let exprBody = data;
      let defaultValue;

      const plainTextCfg = {
        tokenize: newExpressionClass.plainTextTokenizer,
        eval: newExpressionClass.plainTextEvaluator,
      };

      if (data instanceof SvExprInfo) {
        return data;
      } else if (typeof data === 'string') {
        // [TODO] if we precalculate the max length of exprTypeNames,
        // we can optimize the performance of parsing non-expr strings
        let sepPos = data.indexOf(':');
        if (sepPos === -1) {
          return new SvExprInfo('', data, defaultValue, plainTextCfg, data);
        }

        exprTypeName = data.substr(0, sepPos);
        sepPos++;
        exprBody = data.substr(sepPos, data.length - sepPos);
      } else {
        exprTypeName = data.exprType;
        exprBody = data.exprBody;
        defaultValue = data.default;
      }

      const exprTypeConfig = SvExpression.exprTypesDefine[exprTypeName];
      if (exprTypeConfig) {
        return new SvExprInfo(exprTypeName, exprBody, defaultValue, exprTypeConfig, data);
      }
      // exprType not found
      return new SvExprInfo('', data, defaultValue, plainTextCfg, data);
    }

    static plainTextTokenizer(exprObj) {
      const exprInfo = exprObj.exprInfo;
      return [exprInfo.exprBody];
    }

    static plainTextEvaluator(exprObj, evalingSet) {
      const exprInfo = exprObj.exprInfo;
      return exprInfo.tokens.join('');
    }

    static stringTokenizer(exprObj) {
      const exprInfo = exprObj.exprInfo;
      const retval = [];
      let result = findContentInBracket(exprInfo.exprBody);
      let currentPos = 0;

      while (result) {
        if (!result[2]) {
          throw Error(`Invalid string :${exprInfo.exprBody}`);
        }
        if (result[0] !== currentPos) {
          retval.push(unescapeString(exprInfo.exprBody.substr(currentPos, result[0] - currentPos)));
        }
        retval.push(new SvVariable(exprObj.scope, result[2]));
        currentPos = result[1];
        result = findContentInBracket(exprInfo.exprBody, currentPos);
      }

      if (currentPos < exprInfo.exprBody.length) {
        retval.push(unescapeString(exprInfo.exprBody.substr(currentPos, exprInfo.exprBody.length - currentPos)));
      }

      return retval;
    }

    static stringEvaluator(exprObj, evalingSet) {
      const exprInfo = exprObj.exprInfo;
      return exprInfo.tokens.map((part) => {
        if (part instanceof SvVariable) {
          return part.eval(evalingSet);
        }
        return part;
      }).join('');
    }

    static parse(scope, name, rawData) {
      const exprInfo = SvExpression.normalizeExprInfo(rawData);
      const exprObj = new SvExpression(scope, name, exprInfo);

      exprObj.tokenize();
      return exprObj;
    }

    static parseAndEval(scope, name, rawData, evalingSet) {
      const exprObj = newExpressionClass.parse(scope, name, rawData);
      return exprObj.eval(evalingSet);
    }

    constructor(scope, name, exprInfo) {
      this._scope = scope;

      // the name is for debugging only currently
      // it doesn't imply that the name should be included by the scope
      // becasue sometimes we create a temporary anonymous expression instance
      // which is not directly owned by the scope
      this._name = name;
      this._exprInfo = exprInfo;
    }

    tokenize() {
      const exprInfo = this.exprInfo;
      if (!exprInfo.typeName) {
        exprInfo.setTokens([this.exprInfo.exprBody]);
        return exprInfo;
      }
      const result = exprInfo.typeConfig.tokenize(this, newExpressionClass);
      // // may no need to force the result of tokenize to be a Array
      // if(!Array.isArray(result)){
      //   throw Error('Failed to tokenize' + exprInfo.rawData);
      // }
      exprInfo.setTokens(result);
      return exprInfo;
    }

    eval(evalingSet) {
      const exprInfo = this.exprInfo;
      if (this.isEvaled()) {
        return exprInfo.evaledValue;
      }
      let evaledValue = null;
      try {
        evaledValue = exprInfo.typeConfig.eval(this, evalingSet, newExpressionClass);
      } catch (e) {
        if (exprInfo.default !== undefined) {
          evaledValue = newExpressionClass.parseAndEval(this.scope, '@default', exprInfo.default, evalingSet);
        } else {
          throw e;
        }
      }
      exprInfo.evaledValue = evaledValue;
      return evaledValue;
    }

    isEvaled() {
      return this.exprInfo.evaledValue !== undefined;
    }

    get scope() {
      return this._scope;
    }

    get exprInfo() {
      return this._exprInfo;
    }

    toString() {
      return `\${${this._name}}`;
    }
  };

  // newExpressionClass.exprTypesDefine
  const typesDefine = newExpressionClass.exprTypesDefine;
  Object.keys(typesDefine).forEach((exprTypeName) => {
    typesDefine[exprTypeName].tokenize = typesDefine[exprTypeName].tokenize || newExpressionClass.stringTokenizer;
    typesDefine[exprTypeName].eval = typesDefine[exprTypeName].eval || newExpressionClass.stringEvaluator;
  });
  return newExpressionClass;
}
