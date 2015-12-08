CursorMethods.prototype.join = function (...params) {
	return new CursorJoin(...params);
};

class CursorJoin {
	constructor (collection, options, name) {
		this.collection = collection;
		this.options = options;
		this.name = name;

		this.data = [];
		this.sent = false;
	}
	push (sub, _id) {
		if (!_id || _.contains(this.data, _id))
			return;

		this.data.push(_id);
		if (this.sent)
			return this._cursor(sub, _id);
	}
	send (sub) {
		this.sent = true;
		if (!this.data.length) return;
		
		return this._cursor(sub);
	}
	_selector (_id = {$in: this.data}) {
		return _.isFunction(this.selector) ? this.selector(_id): {_id: _id};
	}
	_cursor (sub, _id) {
		return sub.cursor(this.collection.find(this._selector(_id), this.options), this.name);
	}
};