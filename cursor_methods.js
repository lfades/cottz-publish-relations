CursorMethods = function (sub, handlers, _id, collection) {
	this.sub = sub;
	this.handler = handlers;

	this._id = _id;
	this.collection = collection;
};

CursorMethods.prototype.observe = function (cursor, callbacks) {
	this.handler.add(cursor, {
		handler: 'observe',
		callbacks: callbacks
	});
};

CursorMethods.prototype.observeChanges = function (cursor, callbacks) {
	this.handler.add(cursor, {
		handler: 'observeChanges',
		callbacks: callbacks
	});
};

CursorMethods.prototype.cursor = function (cursor, collection, callbacks) {
	var sub = this.sub;

	if (typeof collection !== 'string') {
		callbacks = collection;
		collection = cursor._getCollectionName();
	}

	var handler = this.handler.add(cursor, {collection: collection});
	if (handler.equalSelector)
		return handler;

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
// designed to change something in the master document while the callbacks are executed
// changes to the document are sent to the main document with the return of the callbacks
CursorMethods.prototype.changeParentDoc = function (cursor, callbacks, onRemoved) {
	var sub = this.sub,
	_id = this._id,
	collection = this.collection,
	result = this;

	if (!_id) return;
	
	callbacks = this._getCallbacks(callbacks, onRemoved);

	this.handler.add(cursor, {
		handler: 'observeChanges',
		callbacks: {
			added: function (id, doc) {
				result._addedWithCPD = callbacks.added(id, doc);
			},
			changed: function (id, doc) {
				var changes = callbacks.changed(id, doc);
				if (changes)
					sub.changed(collection, _id, changes);
			},
			removed: function (id) {
				var changes = callbacks.removed(id);
				if (changes)
					sub.changed(collection, _id, changes);
			}
		}
	});

	return result._addedWithCPD || {};
};
// designed to paginate a list, works in conjunction with the methods
// do not call back to the main callback, only the array is changed in the collection
CursorMethods.prototype.paginate = function (fieldData, limit, infinite) {
	var sub = this.sub,
		_id = this._id,
		collection = this.collection;

	if (!_id) return;
		
	var crossbar = DDPServer._InvalidationCrossbar,
		field = Object.keys(fieldData)[0],
		copy = _.clone(fieldData)[field],
		max = copy.length,
		connectionId = sub.connection.id;

	fieldData[field] = copy.slice(0, limit);

	var listener = crossbar.listen({
		collection: 'paginations',
		connection: connectionId,
		_id: _id,
		field: field
	}, function (data) {
		if (connectionId == data.connection) {
			var skip = data.skip;

			if (skip >= max && !infinite)
				return;

			fieldData[field] = infinite ? copy.slice(0, skip): copy.slice(skip, skip + limit);
			sub.changed(collection, data._id, fieldData);
		}
	});

	this.handler.addBasic(field, listener);

	return fieldData[field];
};