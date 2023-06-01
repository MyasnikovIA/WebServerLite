if (!Number.prototype.toLocaleString) {
    Number.prototype.toLocaleString = function () {
        return String(this);
    };
}

if (typeof Number.isFinite !== 'function') {
    Number.isFinite = function isFinite(value) {
        // 1. If Type(number) is not Number, return false.
        if (typeof value !== 'number') {
            return false;
        }
        // 2. If number is NaN, +?, or ??, return false.
        if (value !== value || value === Infinity || value === -Infinity) {
            return false;
        }
        // 3. Otherwise, return true.
        return true;
    };
}
if (!String.prototype.padStart) {
    String.prototype.padStart = function padStart(targetLength,padString) {
        targetLength = targetLength>>0;
        padString = String((typeof padString !== 'undefined' ? padString : ' '));
        if (this.length > targetLength) {
            return String(this);
        }
        else {
            targetLength = targetLength-this.length;
            if (targetLength > padString.length) {
                padString += padString.repeat(targetLength/padString.length); //append to original to ensure we are longer than needed
            }
            return padString.slice(0,targetLength) + String(this);
        }
    };
};
if (!String.prototype.padEnd) {
    String.prototype.padEnd = function padEnd(targetLength,padString) {
        targetLength = targetLength>>0;
        padString = String((typeof padString !== 'undefined' ? padString : ' '));
        if (this.length > targetLength) {
            return String(this);
        }
        else {
            targetLength = targetLength-this.length;
            if (targetLength > padString.length) {
                padString += padString.repeat(targetLength/padString.length); //append to original to ensure we are longer than needed
            }
            return String(this) + padString.slice(0,targetLength);
        }
    };
};
if (!String.prototype.replaceAll) {
    String.prototype.replaceAll = function(str, newStr){

        // если регулярное выражение
        if (Object.prototype.toString.call(str).toLowerCase() === '[object regexp]') {
            return this.replace(str, newStr);
        }

        // если строка
        return this.replace(new RegExp(str, 'g'), newStr);

    };
};
(function () {
    if(typeof window.Promise != 'function'){
        /**
         * @description Core Внутренние работы обещаний.
         * @param {function}
         **/
        function Promise(resolver){
            var fulFilleds = [];
            var reJecteds = [];
            this.result = null;
            this.reason = null;
            if(typeof resolver == 'function'){
                resolver(function(_value){
                    this.result = _value;
                    for(var i = 0, len = fulFilleds.length ; i < len ; i++){
                        try{
                            var res = fulFilleds[i]['FulFilled'](_value);
                            fulFilleds[i]['deferred'].resolve(res);
                        }catch (e) {
                            fulFilleds[i]['deferred'].reject(e);
                        }
                    }
                },function(_reason){
                    if (typeof _reason != 'undefined') {
                        this.reason = _reason;
                        for(var i = 0, len = reJecteds.length ; i < len ; i++){
                            try{
                                var res = reJecteds[i]['Rejected'](_reason);
                                reJecteds[i]['deferred'].resolve(res);
                            }catch (e) {
                                reJecteds[i]['deferred'].reject(e);
                            }
                        }
                    }
                });
            }
            this.then = function(onFulfilled,onRejected){
                var deferred = new Deferred();
                var promise = deferred.promise();
                if(typeof onFulfilled == 'function'){
                    fulFilleds.push({
                        'FulFilled' : onFulfilled,
                        'deferred' : deferred
                    })
                }
                if(typeof onRejected == 'function'){
                    reJecteds.push({
                        'Rejected' : onRejected,
                        'deferred' : deferred
                    });
                }
                if(this.result && onFulfilled){
                    try{
                        var result = onFulfilled(this.result);
                        deferred.resolve(result);
                    }catch (e) {
                        deferred.reject(e);
                    }
                }
                if(this.reason && onRejected){
                    try{
                        var result = onRejected(this.reason);
                        deferred.resolve(result);
                    }catch (e) {
                        deferred.reject(e);
                    }
                }
                return promise;
            }
            this.otherwise = function(onRejected){
                return this.then(null,onRejected);
            }
        }
        /**
         * @description Core внутренние работы отложенной функции.
         *
         **/
        function Deferred (){
            var promise = null;
            var resolveCallback = null;
            var rejectCallback = null;
            this.promise = function(){
                if(!promise){
                    promise = new Promise(function(_resolve, _reject){
                        resolveCallback = _resolve;
                        rejectCallback = _reject;
                    });
                }
                return promise;
            }
            this.resolve = function(_value){
                resolveCallback.call(promise,_value);
            }
            this.reject = function(_value){
                rejectCallback.call(promise,_value);
            }
        };

        /**
         * @description Объект для отложенных и асинхронных вычислений.
         * https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/Promise
         * @param {function} Функция выполнения
         * @return {Object} объет промис
         **/
        window.Promise = function(executor){
            var deferred = new Deferred();
            var promise = deferred.promise();
            if(typeof executor == 'function'){
                executor(deferred.resolve,deferred.reject);
            }
            return promise;
        };
        /**
         * @description Возвращает обещание, которое выполнится тогда, когда будут выполнены все обещания, переданные в виде перечисляемого аргумента, или отклонено любое из переданных обещаний.
         * https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/Promise/all
         * @param promiseList
         * @return {Object} объет промис
         **/
        window.Promise.all = function(promiseList){
            var fulFilleds = [];
            var reJecteds = [];
            var promise = new this(function(resolve,reject){
                for(var i = 0,len = promiseList.length ; i < len ; i++){
                    if(promiseList[i] instanceof Promise){
                        promiseList[i].then(function(_value){
                            fulFilleds.push(_value);
                        },function(_reason){
                            reJecteds.push(_reason);
                        });
                    }else{
                        fulFilleds.push(promiseList[i]);
                    }
                }
                if(reJecteds.length > 0){
                    reject(reJecteds);
                }else{
                    resolve(fulFilleds);
                }
            });

            return promise;
        };
        /**
         * @description возвращает Promise выполненый с переданным значением.
         * https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/Promise/resolve
         * @return {Object} объет промис
         **/
        window.Promise.resolve = function (_value) {
            return new this(function(resolve,reject){
                resolve(_value);
            });
        };
        /**
         * @description возвращает Promise, который был отклонен по указанной причине.
         * https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/Promise/reject
         * @return {Object} объет промис
         **/
        window.Promise.reject = function(_reason){
            return new this(function(resolve,reject){
                reject(_reason);
            });
        };
        /**
         * @description Возвращает обещание, которое было выполнено после того, как все обещания были выполнены или отклонены, и содержит массив объектов с описанием результата каждого обещания.
         * https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/Promise/allSettled
         * @return {Object} объет промис
         **/
        window.Promise.allSettled = function(iterable){
            var res = [];
            return new this(function(resolve){
                if(iterable instanceof Array){
                    for(var i = 0,len = resolve.length ; i < len ; i++){
                        if(resolve[i] instanceof Promise){
                            resolve[i].then(function(_val){
                                res.push({
                                    'status' : 'fulfilled',
                                    'value' : _val
                                });
                            },function(_reason){
                                res.push({
                                    'status' : 'rejected',
                                    'value' : _reason
                                });
                            })
                        }else{
                            res.push({
                                'status' : 'fulfilled',
                                'value' : resolve[i]
                            });
                        }
                    }
                    resolve(res);
                }
            });
        };
    }

    if (typeof window.CustomEvent === 'function') {
        return false;
    }

    function CustomEvent(name, params) {
        params = params || { bubbles: false, cancelable: false, detail: undefined };

        var event = document.createEvent('CustomEvent');
        event.initCustomEvent(name, params.bubbles, params.cancelable, params.detail);
        return event;
    }

    CustomEvent.prototype = window.Event.prototype;

    window.CustomEvent = CustomEvent;
})();