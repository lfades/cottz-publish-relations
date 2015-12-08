CursorMethodsNR = class {
	constructor (sub) {
		this.sub = sub;
	}
	cursorNonreactive (cursor, collection, onAdded) {
		let sub = this.sub;

		if (!_.isString(collection)) {
			onAdded = collection;
			console.log('hola ? ')
			collection = cursor._getCollectionName();
		}
		if (!_.isFunction(onAdded))
			onAdded = function () {};

		cursor.forEach((doc) => {
			let _id = doc._id;
			sub.added(collection, onAdded.call(new CursorMethodsNR(sub), _id, doc) || doc);
		});
	}
};