Meteor.methods({
	changePagination: function (_id, field, skip) {
		check(_id, String);
		check(field, String);
		check(skip, Number);

		var crossbar = DDPServer._InvalidationCrossbar;
		crossbar.fire({connection: this.connection.id, _id: _id, field: field, skip: skip});
	}
});