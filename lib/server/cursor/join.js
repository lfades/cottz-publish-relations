CursorMethods.prototype.join = function (collection, options, name) {
	return new CursorJoins(collection, options, name);
};

function CursorJoins (collection, options, name) {
	this.collection = collection;
	this.options = options;
	this.name = name;

	this.data = [];
	this.sent = false;
};

CursorJoins.prototype.push = function (sub, _id) {
	if (!_id || _.contains(this.data, _id))
		return;

	this.data.push(_id);
	if (this.sent)
		return this._cursor(sub, {_id: _id});
};

CursorJoins.prototype.send = function (sub) {
	this.sent = true;
	if (!this.data.length) return;
	
	return this._cursor(sub, {_id: {$in: this.data}});
};

CursorJoins.prototype._cursor = function (sub, selector) {
	return sub.cursor(this.collection.find(selector, this.options), this.name);
};