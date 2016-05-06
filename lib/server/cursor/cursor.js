import { _ } from 'meteor/underscore';
import CursorMethodsNR from './nonreactive';

export default class CursorMethods extends CursorMethodsNR {
	constructor (sub, handler, _id, collection) {
		super(sub);

		this.handler = handler;
		this._id = _id;
		this.collection = collection;
	}
	cursor (cursor, collection, callbacks) {
		const sub = this.sub;

		if (!_.isString(collection)) {
			callbacks = collection;
			collection = cursor._getCollectionName();
		}

		const handler = this.handler.add(cursor, {collection: collection});
		if (handler.equalSelector)
			return handler;

		if (callbacks)
			callbacks = this._getCallbacks(callbacks);

		function applyCallback (id, doc, method) {
			const cb = callbacks && callbacks[method];

			if (cb) {
				let methods = new CursorMethods(sub, handler.addBasic(id), id, collection),
				isChanged = method === 'changed';

				return cb.call(methods, id, doc, isChanged) || doc;
			} else
				return doc;
		};

		let observeChanges = cursor.observeChanges({
			added (id, doc) {
				sub.added(collection, id, applyCallback(id, doc, 'added'));
			},
			changed (id, doc) {
				sub.changed(collection, id, applyCallback(id, doc, 'changed'));
			},
			removed (id) {
				if (callbacks) {
					callbacks.removed(id);
					handler.remove(id);
				}
				
				sub.removed(collection, id);
			}
		});

		return handler.set(observeChanges);
	}
};