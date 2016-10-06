class LinkedListNode {
  constructor(list, data, prev, next){
    this.list = list;
    this.data = data;
    this.prev = prev;
    this.next = next;
  }

  toString(){
    return this.data.toString();
  }

  get(){
    return this.data;
  }
}

export class LinkedList {
  static Node = LinkedListNode;
  constructor(){
    this.head = null;
    this.tail = null;
    this._size = 0;
  }

  get length(){
    return this._size;
  }

  pushFront(data){
    return this.insert(data, this.head);
  }

  pushBack(data){
    return this.insert(data);
  }

  insert(data, tarNode){
    //console.log('insert :', id(data), tarNode and id(tarNode.data));
    if(tarNode && tarNode.list !== this){
      return null;
    }

    let newNode = new LinkedList.Node(this, data);
    if(!this.head){
      this.head = newNode;
      this.tail = newNode;
    }else{
      if(!tarNode){
        newNode.prev = this.tail;
        this.tail.next = newNode;
        this.tail = newNode;
      }else if(tarNode === this.head){
        newNode.next = this.head;
        this.head.prev = newNode;
        this.head = newNode;
      }else{
        tarNode.prev.next = newNode;
        newNode.prev = tarNode.prev;
        newNode.next = tarNode;
        tarNode.prev = newNode;
      }
    }

    this._size++;
    return newNode;
  }

  popFront(){
    return this.delete(this.head);
  }

  popBack(){
    return this.delete(this.tail);
  }

  delete(tarNode){
    //console.log('delete :', tarNode and id(tarNode.data) )
    if(tarNode && tarNode.list !== this){
      return null;
    }

    if(this.head === tarNode){
      this.head = this.head.next;
      if(tarNode.next){
        tarNode.next.prev = null;
        tarNode.next = null;
      }
    }

    if(this.tail === tarNode){
      this.tail = this.tail.prev;
      if(tarNode.prev){
        tarNode.prev.next = null;
        tarNode.prev = null;
      }
    }

    let myPrev = tarNode.prev;
    let myNext = tarNode.next;
    if(myPrev){
      myPrev.next = myNext;
      tarNode.prev = null;
    }

    if(myNext){
      myNext.prev = myPrev;
      tarNode.next = null;
    }

    this._size -= 1;
    return tarNode;
  }

  clear(){
    this.head = null;
    this.tail = null;
    this._size = 0;
  }
}
