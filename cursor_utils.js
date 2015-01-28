CursorMethods.prototype._getCallbacks = function (cb, onRemoved) {
	var callbacks = {};

	if (typeof cb == 'function') {
		callbacks = {
			added: cb,
			changed: cb,
			removed: onRemoved || function () {}
		};
	} else {
		var methods = ['added', 'changed', 'removed'];
		for (var i = 0; i < methods.length; i ++) {
			var methodName = methods[i];
			callbacks[methodName] = cb[methodName] || function () {};
		}
	}

	return callbacks;
};