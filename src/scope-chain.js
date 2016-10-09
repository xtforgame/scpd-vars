import {
  LinkedList,
} from './linked-list';

import {
  createEmplyFindVarResult,
} from './utils';

class SvScopeChainPlaceholder {}

export class SvScopeChain {
  static Node = LinkedList.Node;
  static Placeholder = SvScopeChainPlaceholder;

  constructor(){
    this._map = new Map();
    this._chain = new LinkedList();
    this.findVar = this._findVar.bind(this);
  }

  get length(){
    return this._chain.length;
  }

  get head(){
    return this._chain.head;
  }

  get tail(){
    return this._chain.tail;
  }

  pushFront(data){
    this.delete(data);
    let node = this._chain.pushFront(data);
    this._map.set(data, node);
    return node;
  }

  pushBack(data){
    this.delete(data);
    let node = this._chain.pushBack(data);
    this._map.set(data, node);
    return node;
  }

  insert(data, tarNode){
    this.delete(data);
    let node = this._chain.insert(data, tarNode);
    this._map.set(data, node);
    return node;
  }

  popFront(){
    let node = this._chain.popFront();
    if(node){
      this._map.delete(node.data);
    }
    return node;
  }

  popBack(){
    let node = this._chain.popBack();
    if(node){
      this._map.delete(node.data);
    }
    return node;
  }

  delete(data){
    let node = this._map.get(data);
    if(node){
      this._map.delete(node.data);
      this._chain.delete(node);
    }
    return node;
  }

  clear(){
    this._map.clear();
    return this._chain.clear(tarNode);
  }

  _findVar(visitorScope, varName){
    let result = createEmplyFindVarResult();
    let node = this._chain.tail;

    if(visitorScope){
      let foundNode = this._map.get(visitorScope);
      if(foundNode){
        node = foundNode.prev;
      }
    }

    let currentScope = null;

    while(node){
      currentScope = node.data;
      if(currentScope && !(currentScope instanceof SvScopeChain.Placeholder)){
        result = currentScope.findVarLocal(visitorScope, varName);
        if(result.var){
          return result;
        }
      }
      node = node.prev;
    }

    return result;
  }
}
