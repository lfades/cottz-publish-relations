CursorMethodsNR.prototype.joinNonreactive = function (...params) {
	return new CursorJoinNonreactive(this.sub, ...params);
};

class CursorJoinNonreactive {
	constructor (sub, collection, options, name) {
		this.sub = sub;
		this.collection = collection;
		this.options = options;
		this.name = name || collection._name;

		this.data = [];
		this.sent = false;
	}
	_selector (_id = {$in: this.data}) {
		return _.isFunction(this.selector) ? this.selector(_id): {_id: _id};
	}
	push (_id) {
		if (!_id || _.contains(this.data, _id))
			return;

		this.data.push(_id);
		if (this.sent)
			return this.added(_id);
	}
	send () {
		this.sent = true;
		if (!this.data.length) return;
		
		return this.added();
	}
	added (_id) {
		this.collection.find(this._selector(_id), this.options).forEach(doc => {
			this.sub.added(this.name, doc._id, _.omit(doc, '_id'));
		});
	}
};