
function observe(data,vm){
    if(!data || typeof data != 'object'){
        return;
    }
    return new Observer(data);
}

function Observer(data){
    this.data = data;
    this.walk(data);
}

Observer.prototype = {
    walk : function(data){
        var me = this;
        //遍历属性值
        Object.keys(data).forEach(function(key){
            me.defineResponce(data,key,data[key]);
        });
    },
    defineResponce: function(data,key,val){
        var dep = new Dep();
        var childObj = observe(val);                   //监听子属性

        Object.defineProperty(data,key,{
            configurable:false,         //不可以再定义
            enumerable:true,            //可枚举
            get:function(){
                //添加订阅者
                if(Dep.target){
                    dep.depend();
                }
                return val;
            },
            set:function(newVal){
                if(newVal == val){
                    return;
                }
                
                val = newVal;
                //新的值是Object就继续监听
                childObj = observe(newVal); 
                dep.notify();   //通知所有订阅者
            }
        })
    }
}

var uid = 0;

function Dep(){
    this.subs = [];
    this.id = uid++;
}
Dep.prototype = {
    addSub:function(sub){
        this.subs.push(sub);
    },

    depend:function(){
        Dep.target.addDep(this);
    },

    notify:function(){
        this.subs.forEach(function(sub){
            sub.update();
        })
    }
}
Dep.target = null;

