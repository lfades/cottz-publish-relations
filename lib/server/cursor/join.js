import { _ } from 'meteor/underscore';
import CursorMethods from './cursor';

CursorMethods.prototype.join = function (...params) {
	return new CursorJoin(this, ...params);
};

class CursorJoin {
	constructor (methods, collection, options, name) {
		this.methods = methods;
		this.collection = collection;
		this.options = options;
		this.name = name;

		this.data = [];
		this.sent = false;
	}
	push (..._ids) {
		let changed;

		_.each(_ids, _id => {
			if (!_id || _.contains(this.data, _id))
				return;

			this.data.push(_id);
			changed = true;
		});

		if (this.sent && changed)
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
		return this.methods.cursor(this.collection.find(this._selector(), this.options), this.name);
	}
};