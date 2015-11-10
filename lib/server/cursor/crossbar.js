// designed to paginate a list, works in conjunction with the methods
// do not call back to the main callback, only the array is changed in the collection
CursorMethods.prototype.paginate = function (fieldData, limit, infinite) {
	var sub = this.sub,
	_id = this._id,
	collection = this.collection;

	if (!_id || !collection)
		throw new Error("you can't use this method without being within a document");
		
	var field = Object.keys(fieldData)[0],
	copy = _.clone(fieldData)[field],
	max = copy.length,
	connectionId = sub.connection.id;

	fieldData[field] = copy.slice(0, limit);

	var listener = Crossbar.listen({
		collection: 'paginations',
		id: connectionId,
	}, function (data) {
		if (!data.id || data.id !== connectionId) return;
		
		var skip = data.skip;

		if (skip >= max && !infinite)
			return;

		fieldData[field] = infinite ? copy.slice(0, skip): copy.slice(skip, skip + limit);
		sub.changed(collection, data._id, fieldData);
	});

	this.handler.addBasic(field, listener);

	return fieldData[field];
};

CursorMethods.prototype.listen = function (options, pattern, callback, run) {
	var sub = this.sub,
	name = 'listen-' + this._publicationName,

	listener = Crossbar.listen({
		collection: name,
		id: sub.connection.id
	}, function (data) {
		if (!data.id || data.id !== sub.connection.id) return;
		
		_.extend(options, _.omit(data, 'collection', 'id'));
		check(options, pattern);
		callback.call(methods);
	}),

	handler = this.handler.addBasic(name),
	methods = new CursorMethods(sub, handler);

	if (run !== false) callback.call(methods);

	return handler.set(listener);
};