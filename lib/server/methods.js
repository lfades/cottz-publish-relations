Meteor.methods({
	'PR.changePagination' (data) {
		check(data, {
			_id: String,
			field: String,
			skip: Match.Integer
		});

		Crossbar.fire(_.extend({
			collection: 'paginations',
			id: this.connection.id
		}, data));
	},
	'PR.fireListener' (collection, options) {
		check(collection, String);

		Crossbar.fire(_.extend({
			collection: 'listen-' + collection,
			id: this.connection.id,
		}, options));
	}
});