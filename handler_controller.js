HandlerController = function () {
	this.handlers = [];
};

HandlerController.prototype.set = function (handler) {
	return this.handler = handler;
};

HandlerController.prototype.add = function (collection, handler) {
	var oldHandler = this.handlers[collection];
	if (oldHandler)
		oldHandler.stop();

	return this.handlers[collection] = handler || new HandlerController();
};

HandlerController.prototype.stop = function () {
	var handlers = this.handlers;

	this.handler && this.handler.stop();

	for (var key in handlers) {
		handlers[key].stop();
	};

	this.handlers = [];
};

HandlerController.prototype.remove = function (_id) {
	var handler = this.handlers[_id];
	if (handler) {
		handler.stop();
		delete this.handlers[_id];
	}
};