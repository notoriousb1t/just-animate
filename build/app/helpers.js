var ostring = Object.prototype.toString;
function isArray(a) {
    return a !== undefined && typeof a !== 'string' && typeof a.length === 'number';
}
exports.isArray = isArray;
function isFunction(a) {
    return ostring.call(a) === '[object Function]';
}
exports.isFunction = isFunction;
function each(items, fn) {
    for (var i = 0, len = items.length; i < len; i++) {
        fn(items[i]);
    }
}
exports.each = each;
function map(items, fn) {
    var results = [];
    for (var i = 0, len = items.length; i < len; i++) {
        var result = fn(items[i]);
        if (result !== undefined) {
            results.push(result);
        }
    }
    return results;
}
exports.map = map;
function extend(target) {
    var sources = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        sources[_i - 1] = arguments[_i];
    }
    for (var i = 1, len = arguments.length; i < len; i++) {
        var source = arguments[i];
        for (var propName in source) {
            if (source.hasOwnProperty(propName)) {
                target[propName] = source[propName];
            }
        }
    }
    return target;
}
exports.extend = extend;
function multiapply(targets, fnName, args, cb) {
    var errors = [];
    var results = [];
    for (var i = 0, len = targets.length; i < len; i++) {
        try {
            var target = targets[i];
            var result = target[fnName].apply(target, args);
            if (result !== undefined) {
                results.push(result);
            }
        }
        catch (err) {
            errors.push(err);
        }
    }
    if (typeof cb === 'function') {
        cb(errors);
    }
    return results;
}
exports.multiapply = multiapply;
