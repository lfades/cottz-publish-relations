Meteor.methods({
	'PR.changePagination': function (data) {
		check(data, {
			_id: String,
			field: String,
			skip: Number
		});

		Crossbar.fire(_.extend({
			collection: 'paginations',
			id: this.connection.id
		}, data));
	},
	'PR.fireListener': function (collection, options) {
		check(collection, String);

		Crossbar.fire(_.extend({
			collection: 'listen-' + collection,
			id: this.connection.id,
		}, options));
	}
});