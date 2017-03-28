function Watcher(vm,exp,cb){
    this.vm = vm;
    this.exp = exp;
    this.cb = cb;
    this.depIds = {};
    //
    this.val = this.get();
}

Watcher.prototype = {
    addDep:function(dep){
        if(!this.depIds.hasOwnProperty(dep.id)){
            dep.addSub(this);
            this.depIds[dep.id] = dep;
        }
    },
    update:function(){
        this.run();             // 属性值变化收到通知
    },
    run:function(){
        var val = this.get();       //获取最新值
        var oldVal = this.val;

        if(val !== oldVal){
            this.val = val;
            this.cb.call(this.vm,val,oldVal);           //执行compile中绑定的回调，更新视图
        }
    },
    get:function(){
        Dep.target = this;                  // 将当前订阅者指向自己
        var val = this.getVMVal();          // 触发getter，添加自己到属性订阅器中
        Dep.target = null;                  // 添加完毕，重置
        return val;

    },
    getVMVal: function() {
        var exp = this.exp.split('.');
        var val = this.vm._data;
        exp.forEach(function(k) {
            val = val[k];
        });
        return val;
    }
}