import { _ } from 'meteor/underscore';

export default class CursorMethodsNR {
	constructor (sub) {
		this.sub = sub;
	}
	cursorNonreactive (cursor, collection, onAdded) {
		const sub = this.sub;

		if (!_.isString(collection)) {
			onAdded = collection;
			collection = cursor._getCollectionName();
		}
		if (!_.isFunction(onAdded))
			onAdded = function () {};

		cursor.forEach((doc) => {
			let _id = doc._id;
			sub.added(collection, _id, onAdded.call(new CursorMethodsNR(sub), _id, doc) || doc);
		});
	}
};