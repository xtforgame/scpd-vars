export class SvVariable {
  constructor(scope, name){
    this._scope = scope;
    this._name = name;
  }

  eval(evalingSet){
    return this._scope.evalVar(this._name, evalingSet);
  }

  toString(){
    return '${' + this._name + '}';
  }
}

export class SvExprInfo {
  constructor(typeName, exprBody, defaultValue, typeConfig, rawData){
    this.typeName = typeName;
    this.exprBody = exprBody;
    this.default = defaultValue;
    this.typeConfig = typeConfig;
    this.rawData = rawData;

    this.tokens = [];
  }

  setTokens(tokens){
    this.tokens = tokens;
  }

  toString(){
    return '${' + this._name + '}';
  }
}

