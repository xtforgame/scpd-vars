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

import {
  SvScopeChain,
} from './scope-chain';

import path from './path';

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
  '@opath': {
    eval: (exprObj, evalingSet, ExpressionClass) => {
      let _path = ExpressionClass.stringEvaluator(exprObj, evalingSet).replace(/\\/g, '/');
      return path.normalize(_path);
    },
  },
  '@ppath': {
    eval: (exprObj, evalingSet, ExpressionClass) => {
      let _path = ExpressionClass.stringEvaluator(exprObj, evalingSet).replace(/\\/g, '/');
      return path.posix.normalize(_path);
    },
  },
  '@wpath': {
    eval: (exprObj, evalingSet, ExpressionClass) => {
      let _path = ExpressionClass.stringEvaluator(exprObj, evalingSet).replace(/\\/g, '/');
      return path.win32.normalize(_path);
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

    _evalVars(){
      let result = {};
      for(let key in this._varMap) {
        result[key] = this._varMap[key].eval(new Set());
      }
      return result;
    }

    evalVars(){
      for(let key in this._varData) {
        this._varMap[key] = SvExpression.parse(this, key, this._varData[key]);
      }

      let result = this._evalVars();
      this._evaled = true;
      return result;
    }

    getEvaledVars(){
      if(!this._evaled){
        return null;
      }
      return this._evalVars();
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
      // if scope is changed, reset the evalingSet
      let newEvalingSet = findResult.var._scope === this ? evalingSet : new Set();
      let result = findResult.var.eval(newEvalingSet);
      evalingSet.delete(varName);
      return result;
    }

    evalVarExternal(varName, evalingSet){
      let findResult = this.findVarExternal(varName);
      if(!findResult.var){
        evalingSet.delete(varName);
        throw new Error('Eval failed, var name not found :' + varName);
      }
      // if scope is changed, reset the evalingSet
      let newEvalingSet = findResult.var._scope === this ? evalingSet : new Set();
      let result = findResult.var.eval(newEvalingSet);
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
      let exprObj = newExpressionClass.parse(scope, name, rawData);
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

function createScopeLayerClass(SvExpression, SvScope){
  let newScopeLayerClass = class SvScopeLayer {
    static ExpressionClass = SvExpression;
    static ScopeClass = SvScope;
    static TempNodeNameForQuery = ['head', 'before', 'after'];

    constructor(scopChain, options){
      this._scopChain = scopChain;
      this._options = options;

      this._nodeDefines = {
        placeHolder: {
          insert: () => (null),
        },
        head: {
          insert: () => (this._scopChain.head),
        },
        main: {
          insert: () => (this.node('placeHolder')),
          onCreated: (node, scope) => {
            this._mainScope = scope;
            this._lastNode = node;
          },
        },
        before: {
          insert: () => (this.node('main')),
        },
        after: {
          insert: () => (this.node('main').next),
          onCreated: (node) => (this._lastNode = node),
        },
        queryBody: {
          insert: () => ((this.node('after') || this.node('main')).next),
          onCreated: (node) => (this._lastNode = node),
        },
      };
      this._mainScope = null;
      this._firstNode = this._scopChain.pushBack(new SvScopeChain.Placeholder());
      this._lastNode = this._firstNode;
    }

    node(nodeName){
      return this._nodeDefines[nodeName].node;
    }

    scope(nodeName){
      return this._nodeDefines[nodeName].scope;
    }

    _createNode(name, varData, options){
      this._removeNode(name);

      options = Object.assign({}, options || {}, {
        findVar: this._scopChain.findVar,
      });
      let scope = new SvScope(varData, options);
      
      let insertPosFunc = this._nodeDefines[name].insert || (() => null);
      let onCreated = this._nodeDefines[name].onCreated || (() => null);
      this._nodeDefines[name].scope = scope;
      let node = this._nodeDefines[name].node = this._scopChain.insert(scope, insertPosFunc());
      onCreated(node, scope, name);
      return node;
    }

    _removeNode(name){
      if(!this._nodeDefines[name].scope){
        return false;
      }
      let {scope, node} = this._nodeDefines[name];
      let onRemoved = this._nodeDefines[name].onRemoved || ((node) => this._lastNode === node ? this._lastNode = node.prev : null);
      this._scopChain.delete(this._nodeDefines[name].scope);
      this._nodeDefines[name].scope = null;
      this._nodeDefines[name].node = null;
      onRemoved(node, scope, name);
    }

    initScope(varData, options){
      return this._createNode('main', varData, options);
    }

    evalVars(){
      if(!this._mainScope){
        return null;
      }

      return this._mainScope.evalVars();
    }

    getEvaledVars(){
      if(!this._mainScope){
        return null;
      }

      return this._mainScope.getEvaledVars();
    }

    evalVar(varName){
      return this._lastNode.data.evalVar(varName, new Set());
    }

    eval(exprRawData){
      return SvExpression.parseAndEval(this._lastNode.data, '@one-off', exprRawData, new Set());
    }

    _setupNodesBeforeQuery(varDataMap){
      varDataMap = varDataMap || {};
      newScopeLayerClass.TempNodeNameForQuery.map(name => {
        if(name in varDataMap){
          let node = this._createNode(name, varDataMap[name]);
          node.data.evalVars();
        }
      });
    }

    _cleanNodesAfterQuery(){
      this._removeNode('queryBody');
      newScopeLayerClass.TempNodeNameForQuery.map(name => {
        this._removeNode(name);
      });
    }

    query(exprRawData, varDataMap){
      try{
        this._setupNodesBeforeQuery(varDataMap);
        return this.eval(exprRawData);
      }catch(e){
        this._cleanNodesAfterQuery();
        throw e;
      }
      this._cleanNodesAfterQuery();
      return result;
    }

    compile(srcVarData, varDataMap){
      try{
        this._setupNodesBeforeQuery(varDataMap);
        let node = this._createNode('queryBody', srcVarData);
        return node.data.evalVars();
      }catch(e){
        this._cleanNodesAfterQuery();
        throw e;
      }
      this._cleanNodesAfterQuery();
      return result;
    }
  };
  return newScopeLayerClass;
}

export class SvTemplate {
  constructor(config){
    this._config = config;
    this._ExpressionClass = createExpressionClass(this._config);
    this._ScopeClass = createScopeClass(this._ExpressionClass);
    this._ScopeLayerClass = createScopeLayerClass(this._ExpressionClass, this._ScopeClass);
  }

  getScopeLayerClass(){
    return this._ScopeLayerClass;
  }

  getScopeClass(){
    return this._ScopeClass;
  }

  getExpressionClass(){
    return this._ExpressionClass;
  }
}


