Meteor.publishRelations = function (name, callback) {
	return Meteor.publish(name, function () {
		var handler = new HandlerController();
		var cursors = new CursorMethods(this, handler);

		var cb = callback.apply(_.extend(cursors, this), arguments);

		this.onStop(function () {
			handler.stop();
		});
		// kadira show me alerts when I use this return (but works well)
		// return cb || (!this._ready && this.ready());
		return cb;
	});
};