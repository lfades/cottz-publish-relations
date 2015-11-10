CursorMethods = function (sub, handler, _id, collection) {
	this.sub = sub;
	this.handler = handler;
	this._id = _id;
	this.collection = collection;
};

CursorMethods.prototype.cursor = function (cursor, collection, callbacks) {
	var sub = this.sub;

	if (typeof collection !== 'string') {
		callbacks = collection;
		collection = cursor._getCollectionName();
	}

	var handler = this.handler.add(cursor, {collection: collection});
	//if (handler.equalSelector)
	//	return handler;

	if (callbacks)
		callbacks = this._getCallbacks(callbacks);

	function applyCallback (id, doc, method) {
		var cb = callbacks && callbacks[method];

		if (cb) {
			var methods = new CursorMethods(sub, handler.addBasic(id), id, collection);
			var isChanged = method === 'changed';

			return cb.call(methods, id, doc, isChanged) || doc;
		} else
			return doc;
	};

	var observeChanges = cursor.observeChanges({
		added: function (id, doc) {
			sub.added(collection, id, applyCallback(id, doc, 'added'));
		},
		changed: function (id, doc) {
			sub.changed(collection, id, applyCallback(id, doc, 'changed'));
		},
		removed: function (id) {
			if (callbacks) {
				callbacks.removed(id);
				handler.remove(id);
			}
			
			sub.removed(collection, id);
		}
	});

	return handler.set(observeChanges);
};