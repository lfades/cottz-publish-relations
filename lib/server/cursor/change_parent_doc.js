// DEPRECATED
// designed to change something in the master document while the callbacks are executed
// changes to the document are sent to the main document with the return of the callbacks
CursorMethods.prototype.changeParentDoc = function (cursor, callbacks, onRemoved) {
	let sub = this.sub,
	_id = this._id,
	collection = this.collection,
	result = this;

	if (!_id || !collection)
		throw new Error("you can't use this method without being within a document");
	
	callbacks = this._getCallbacks(callbacks, onRemoved);

	this.handler.add(cursor, {
		handler: 'observeChanges',
		callbacks: {
			added (id, doc) {
				result._addedWithCPD = callbacks.added(id, doc);
			},
			changed (id, doc) {
				var changes = callbacks.changed(id, doc);
				if (changes)
					sub.changed(collection, _id, changes);
			},
			removed (id) {
				var changes = callbacks.removed(id);
				if (changes)
					sub.changed(collection, _id, changes);
			}
		}
	});

	return result._addedWithCPD || {};
};