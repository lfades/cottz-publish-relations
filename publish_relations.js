Meteor.publishRelations = function (name, callback) {
	return Meteor.publish(name, function () {
		var handler = new HandlerController();
		var cursors = new CursorMethods(this, handler);

		var cb = callback.apply(_.extend(cursors, this), arguments);

		this.onStop(function () {
			handler.stop();
		});

		return cb || this.ready();
	});
};