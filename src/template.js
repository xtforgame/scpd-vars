import {
  escapeString,
  unescapeString,
  findContentInBracket,
  EscapeChar,
  createEmplyFindVarResult,
} from './utils';

import {
  SvVariable,
  SvExprInfo,
} from './non-generics';

const defaultExprTypesDefine = {
  '@eexpr': {},
  '@nexpr': {
    tokenize: (exprObj, ExpressionClass) => {
      return [exprObj.exprInfo.rawData];
    },
  },
  '@dexpr': {
    tokenize: (exprObj, ExpressionClass) => {
      return [exprObj.exprInfo.rawData];
    },
    eval: (exprObj, evalingSet, ExpressionClass) => {
      let exprBody = exprObj.exprInfo.rawData.exprBody;
      let switchValue = ExpressionClass.parseAndEval(exprObj.scope, '@switch', exprBody.switch, evalingSet);

      let exprSwitchCases = exprBody.cases;
      let valueExprRaw = null;
      let exprName = '';
      if(exprSwitchCases && switchValue in exprSwitchCases){
        exprName = '@case';
        valueExprRaw = exprSwitchCases[switchValue];
      }else if('default' in exprBody){
        exprName = '@caseDefault';
        valueExprRaw = exprBody.default;
      }

      if(valueExprRaw){
        return ExpressionClass.parseAndEval(exprObj.scope, exprName, valueExprRaw, evalingSet);
      }

      throw Error('@dexpr: No matched case for switch value:' + switchValue);
    },
  },
};

export {
  defaultExprTypesDefine as defaultExprTypesDefine,
};

function createScopeClass(SvExpression){
  let newScopeClass = class SvScope {
    static ExpressionClass = SvExpression;

    constructor(varData, options){
      this._varData = varData;
      this._options = options || {};
      this._findVarFunc = this._options.findVar || this.findVarLocal.bind(this);
      
      this._varMap = {};
      this._evaled = false;
      if(this._options.autoEval){
        this.evalVars();
      }
    }

    evalVars(){
      for(let key in this._varData) {
        this._varMap[key] = SvExpression.parse(this, key, this._varData[key]);
      }

      for(let key in this._varMap) {
        this._varMap[key].eval(new Set());
      }
      this._evaled = true;
    }

    evalVar(varName, evalingSet){
      if(evalingSet.has(varName)){
        throw new Error('Circular dependencies occured :' + varName);
      }
      evalingSet.add(varName);

      let findResult = this.findVarLocal(null, varName);
      if(!findResult.var){
        evalingSet.delete(varName);
        throw new Error('Eval failed, var name not found :' + varName);
      }
      let result = findResult.var.eval(evalingSet);
      evalingSet.delete(varName);
      return result;
    }

    findVarExternal(varName){
      return this._findVarFunc(this, varName);
    }

    findVarLocal(visitorScope, varName){
      let result = createEmplyFindVarResult();

      if(visitorScope === this){
        // to prevent infinite loop
        return result;
      }

      result.var = this._varMap[varName];
      if(result.var){
        result.scope = this;
        return result;
      }

      return this.findVarExternal(varName);
    }
  };
  return newScopeClass;
}

function createExpressionClass(config){
  let newExpressionClass = class SvExpression {
    static exprTypesDefine = config.exprTypesDefine || defaultExprTypesDefine;
    static normalizeExprInfo(data) {
      let exprTypeName = null;
      let exprBody = data;
      let defaultValue = undefined;

      let plainTextCfg = {
        tokenize: newExpressionClass.plainTextTokenizer,
        eval: newExpressionClass.plainTextEvaluator,
      };

      if(data instanceof SvExprInfo){
        return data;
      }else if(typeof data === 'string'){
        // [TODO] if we precalculate the max length of exprTypeNames,
        // we can optimize the performance of parsing non-expr strings
        let sepPos = data.indexOf(':');
        if(sepPos === -1){
          return new SvExprInfo('', data, defaultValue, plainTextCfg, data);
        }

        exprTypeName = data.substr(0, sepPos);
        sepPos++;
        exprBody = data.substr(sepPos, data.length - sepPos);
      }else{
        exprTypeName = data.exprType;
        exprBody = data.exprBody;
        defaultValue = data.default;
      }

      let exprTypeConfig = SvExpression.exprTypesDefine[exprTypeName];
      if(exprTypeConfig){
        return new SvExprInfo(exprTypeName, exprBody, defaultValue, exprTypeConfig, data);
      }
      // exprType not found
      return new SvExprInfo('', data, defaultValue, plainTextCfg, data);
    }

    static plainTextTokenizer(exprObj){
      return [exprInfo.exprBody];
    }

    static plainTextEvaluator(exprObj, evalingSet){
      let exprInfo = exprObj.exprInfo;
      return exprInfo.tokens.join('');
    }

    static stringTokenizer(exprObj){
      let exprInfo = exprObj.exprInfo;
      let retval = [];
      let result = findContentInBracket(exprInfo.exprBody);
      let currentPos = 0;

      while(result){
        if(!result[2]){
          throw Error('Invalid string :' + exprInfo.exprBody);
        }
        if(result[0] !== currentPos){
          retval.push(unescapeString(exprInfo.exprBody.substr(currentPos, result[0] - currentPos)));
        }
        retval.push(new SvVariable(exprObj.scope, result[2]));
        currentPos = result[1];
        result = findContentInBracket(exprInfo.exprBody, currentPos);
      }

      if(currentPos < exprInfo.exprBody.length){
        retval.push(unescapeString(exprInfo.exprBody.substr(currentPos, exprInfo.exprBody.length - currentPos)));
      }

      return retval;
    }

    static stringEvaluator(exprObj, evalingSet){
      let exprInfo = exprObj.exprInfo;
      return exprInfo.tokens.map(part => {
        if(part instanceof SvVariable){
          return part.eval(evalingSet);
        }
        return part;
      }).join('');
    }

    static parse(scope, name, rawData){
      let exprInfo = SvExpression.normalizeExprInfo(rawData);
      let exprObj = new SvExpression(scope, name, exprInfo);

      exprObj.tokenize();
      return exprObj;
    }

    static parseAndEval(scope, name, rawData, evalingSet){
      let exprObj = newExpressionClass.parse(scope, name, rawData)
      return exprObj.eval(evalingSet);
    }

    constructor(scope, name, exprInfo){
      this._scope = scope;

      // the name is for debugging only currently
      // it doesn't imply that the name should be included by the scope
      // becasue sometimes we create a temporary anonymous expression instance
      // which is not directly owned by the scope
      this._name = name;
      this._exprInfo = exprInfo;
    }

    tokenize(){
      let exprInfo = this.exprInfo;
      if(!exprInfo.typeName){
        exprInfo.setTokens([this.exprInfo.exprBody]);
        return exprInfo;
      }
      let result = exprInfo.typeConfig.tokenize(this, newExpressionClass);
      // // may no need to force the result of tokenize to be a Array
      // if(!Array.isArray(result)){
      //   throw Error('Failed to tokenize' + exprInfo.rawData);
      // }
      exprInfo.setTokens(result);
      return exprInfo;
    }

    eval(evalingSet){
      let exprInfo = this.exprInfo;
      if(this.isEvaled()){
        return exprInfo.evaledValue;
      }
      let evaledValue = null;
      try{
        evaledValue = exprInfo.typeConfig.eval(this, evalingSet, newExpressionClass);
      }catch(e){
        if(exprInfo.default !== undefined){
          evaledValue = newExpressionClass.parseAndEval(this.scope, '@default', exprInfo.default, evalingSet);
        }else{
          throw e;
        }
      }
      exprInfo.evaledValue = evaledValue;
      return evaledValue;
    }

    isEvaled(){
      return this.exprInfo.evaledValue !== undefined;
    }

    get scope(){
      return this._scope;
    }

    get exprInfo(){
      return this._exprInfo;
    }

    toString(){
      return '${' + this._name + '}';
    }
  };

  // newExpressionClass.exprTypesDefine
  let typesDefine = newExpressionClass.exprTypesDefine;
  for(let exprTypeName in typesDefine){
    typesDefine[exprTypeName].tokenize = typesDefine[exprTypeName].tokenize || newExpressionClass.stringTokenizer;
    typesDefine[exprTypeName].eval = typesDefine[exprTypeName].eval || newExpressionClass.stringEvaluator;
  }
  return newExpressionClass;
}

export class SvTemplate {
  constructor(config){
    this._config = config;
    this._ExpressionClass = createExpressionClass(this._config);
    this._ScopeClass = createScopeClass(this._ExpressionClass);
  }

  getScopeClass(){
    return this._ScopeClass;
  }

  getExpressionClass(){
    return this._ExpressionClass;
  }
}


