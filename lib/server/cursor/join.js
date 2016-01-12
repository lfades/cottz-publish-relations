CursorMethods.prototype.join = function (...params) {
	return new CursorJoin(this.sub, ...params);
};

class CursorJoin {
	constructor (sub, collection, options, name) {
		this.sub = sub;
		this.collection = collection;
		this.options = options;
		this.name = name;

		this.data = [];
		this.sent = false;
	}
	push (_id) {
		if (!_id || _.contains(this.data, _id))
			return;

		this.data.push(_id);
		if (this.sent)
			return this._cursor();
	}
	send () {
		this.sent = true;
		if (!this.data.length) return;
		
		return this._cursor();
	}
	_selector () {
		let _id = {$in: this.data};
		return _.isFunction(this.selector) ? this.selector(_id): {_id: _id};
	}
	_cursor () {
		return this.sub.cursor(this.collection.find(this._selector(), this.options), this.name);
	}
};