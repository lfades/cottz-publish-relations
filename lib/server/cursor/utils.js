function getCB (cb, method) {
	var callback = cb[method];
	if (callback && typeof callback !== 'function')
		throw new Error(method + ' should be a function or undefined');

	return callback || function () {};
};

CursorMethods.prototype._getCallbacks = function (cb, onRemoved) {
	if (typeof cb === 'function') {
		return {
			added: cb,
			changed: cb,
			removed: getCB({onRemoved: onRemoved}, 'onRemoved')
		};
	}

	return {
		added: getCB(cb, 'added'),
		changed: getCB(cb, 'changed'),
		removed: getCB(cb, 'removed')
	};
};