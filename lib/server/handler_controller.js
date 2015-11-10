// The aim of handler Controller is to keep all observers that can be created within methods
// its structure is very simple, has a 'handlers' object containing all observers children and
// the observer father is stored within 'handler'
HandlerController = function () {
	this.handlers = {};
};

HandlerController.prototype.set = function (handler) {
	return this.handler = handler;
};

HandlerController.prototype.addBasic = function (collection, handler) {
	var oldHandler = this.handlers[collection];
	if (oldHandler)
		return oldHandler;

	return this.handlers[collection] = handler || new HandlerController();
};

HandlerController.prototype.add = function (cursor, options) {
	if (!cursor)
		throw new Error("you're not sending the cursor");

	var description = cursor._cursorDescription,
	collection = options.collection || description.collectionName,
	selector = description.selector;

	var oldHandler = this.handlers[collection];
	if (oldHandler) {
		// when the selector equals method stops running, no change occurs and everything
		// will still work properly without running the same observer again
		oldHandler.equalSelector = _.isEqual(oldHandler.selector, selector);
		if (oldHandler.equalSelector)
			return oldHandler;

		oldHandler.stop();
	}

	var newHandler = options.handler
	? cursor[options.handler](options.callbacks)
	: new HandlerController();

	newHandler.selector = selector;

	return this.handlers[collection] = newHandler;
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