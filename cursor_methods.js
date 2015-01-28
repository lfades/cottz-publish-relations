CursorMethods = function (sub, handlers, _id, collection) {
	this.sub = sub;
	this.handler = handlers;

	this._id = _id;
	this.collection = collection;
};

CursorMethods.prototype.observe = function (cursor, callbacks) {
	this.handler.add(cursor._getCollectionName(), cursor.observe(callbacks));
};

CursorMethods.prototype.observeChanges = function (cursor, callbacks) {
	this.handler.add(cursor._getCollectionName(), cursor.observeChanges(callbacks));
};

CursorMethods.prototype.cursor = function (cursor, collection, callbacks) {
	var sub = this.sub;

	if (typeof collection !== 'string') {
		callbacks = collection;
		collection = cursor._getCollectionName();
	}
	
	var handler = this.handler.add(collection);

	if (!cursor)
		throw new Error("you're not sending the cursor");

	if (callbacks)
		callbacks = this._getCallbacks(callbacks);

	function applyCallback (id, doc, method) {
		var cb = callbacks && callbacks[method];

		if (cb) {
			var methods = new CursorMethods(sub, handler.add(id), id, collection);
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
		result = {};

	if (!_id) return;
	
	callbacks = this._getCallbacks(callbacks, onRemoved);

	this.handler.add(cursor._getCollectionName(), cursor.observeChanges({
		added: function (id, doc) {
			result = callbacks.added(id, doc);
		},
		changed: function (id, doc) {
			var changes = callbacks.changed(id, doc);
			if(changes)
				sub.changed(collection, _id, changes);
		},
		removed: function (id) {
			var changes = callbacks.removed(id);
			if(changes)
				sub.changed(collection, _id, changes);
		}
	}));

	return result;
};
// I'm thinking of deleting this method, I do not find great usability
CursorMethods.prototype.group = function (cursor, callbacks, field, options) {
	var sub = this.sub,
		_id = this._id,
		collection = this.collection,
		result = [];

	if (!_id) return;

	if (options) {
		var sort = options.sort,
			sortField = options.sortField;
	}
	callbacks = this._getCallbacks(callbacks);
	
	this.handler.add(cursor._getCollectionName(), cursor.observe({
		addedAt: function (doc, atIndex) {
			if (sort) {
				atIndex = sort.indexOf(doc[sortField || '_id']);
				result[atIndex] = callbacks.added(doc, atIndex);
			} else
				result.push(callbacks.added(doc, atIndex));
		},
		changedAt: function (doc, oldDoc, atIndex) {
			if (sort)
				atIndex = sort.indexOf(doc[sortField || '_id']);

			var changes = callbacks.changed(doc, atIndex, oldDoc),
				changesObj = {};

			result[atIndex] = changes;
			changesObj[field] = result;

			sub.changed(collection, _id, changesObj);
		},
		removedAt: function (oldDoc, atIndex) {
			var cb = callbacks.removed;
			if (cb)
				sub.changed(collection, _id, cb(oldDoc, atIndex));
		}
	}));

	return result;
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

	var listener = crossbar.listen({connection: connectionId, _id: _id, field: field}, function (data) {
		if (connectionId == data.connection) {
			var skip = data.skip;

			if (skip >= max && !infinite)
				return;

			fieldData[field] = infinite ? copy.slice(0, skip): copy.slice(skip, skip + limit);
			sub.changed(collection, data._id, fieldData);
		}
	});

	this.handler.add(field, listener);

	return fieldData[field];
};