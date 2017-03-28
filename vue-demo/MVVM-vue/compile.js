function Compile(el,vm){
    this.$vm = vm;
    this.$el = this.isElementNode(el)?el:document.querySelector(el);
    if(this.$el){
        this.$fragment = this.node2fragment(this.$el);
        this.init();
        this.$el.appendChild(this.$fragment);
    }
    
}

Compile.prototype = {
    node2fragment:function(el){
        var fragment = document.createDocumentFragment(),
            child;

        while(child = el.firstChild){
            fragment.appendChild(child);
        }

        return fragment;
    },

    init:function(){
        this.compileElement(this.$fragment)
    },

    
    compileElement:function(el){
        var childNodes = el.childNodes,me = this;

        [].slice.call(childNodes).forEach(function(node){
            var text = node.textContent;
            var reg = /\{\{(.*)\}\}/;    // 表达式文本

            // 按元素节点方式编译
            if (me.isElementNode(node)) {
                me.compile(node);
            } else if (me.isTextNode(node) && reg.test(text)) {
                me.compileText(node, RegExp.$1);
            }
            // 遍历编译子节点
            if (node.childNodes && node.childNodes.length) {
                me.compileElement(node);
            }
        })
    },
    compile:function(node){
        var nodeAttrs = node.attributes,me = this;
        [].slice.call(nodeAttrs).forEach(function(attr){
            var attrName = attr.name;
            if(me.isDirective(attrName)){
                var exp = attr.value;
                var dir = attrName.substring(2);

                //事件指令
                if(me.isEventDirective(dir)){
                    compileUtil.eventHandler(node,me.$vm,exp,dir);
                }else{
                    //普通指令
                    compileUtil[dir] && compileUtil[dir](node,me.$vm,exp,dir);
                }

                node.removeAttribute(attrName);
            }
        })
    },

    compileText:function(node,exp){
        compileUtil.text(node,this.$vm,exp,dir)
    },
    isElementNode:function(node){
        return node.nodeType == 1;
    },
    isTextNode:function(node){
        return node.nodeType ==3;
    },
    isDirective:function(attr){
        return attr.indexOf('v-') == 0;
    },
    isEventDirective:function(dir){
        return dir.indexOf('on') === 0;
    }
}

//指令处理
var compileUtil = {

    text:function(node,vm,exp){
        this.bind(node,vm,exp,'text');
    },
    model:function(node,vm,exp){
        this.bind(node,vm,exp,'model');

        var me = this,
            val = this._getVMVal(vm,exp);
        
        node.addEventListener('input',function(e){
            var newVal = e.target.value;
            if(val == newVal){
                return;
            }

            me._setVMVal(vm,exp,newVal);
            val = newVal;
        })
    },
    bind:function(node,vm,exp,dir){
        var updateFn = updater[dir + 'Updater'];

        //第一次初始化视图
        updateFn && updateFn(node,this._getVMVal(vm,exp));

         // 实例化订阅者，该操作会在对应的属性消息订阅器中添加该订阅者watcher
        new Watcher(vm,exp,function(value,oldValue){
            updateFn && updateFn(node,value,oldValue);
        })
    },
    //事件处理
    eventHandler:function(node,vm,exp,dir){
        var eventType = dir.split(':')[1],
            fn = vm.$options.methods && vm.$options.methods[exp];
        
        if (eventType && fn) {
            node.addEventListener(eventType, fn.bind(vm), false);
        }
    },
    
    _getVMVal:function(vm,exp){
        var val = vm._data;
        exp = exp.split('.');
        exp.forEach(function(k){
            val = val[k];
        });
        return val;
    },

    _setVMVal:function(vm,exp,newVal){
        var val = vm._data;
        exp = exp.split('.');
        exp.forEach(function(k) {
            val[k] = newVal;
        });
    }
}


var updater = {
    textUpdater:function(node,value){
        node.textContent = typeof value == 'undefined'?'':value;
    },
    modelUpdater:function(node,value){
        node.value = typeof value == 'undefined'?'':value;
    }
}