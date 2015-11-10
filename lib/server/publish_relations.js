Meteor.publishRelations = function (name, callback) {
	return Meteor.publish(name, function () {
		var handler = new HandlerController();
		var cursors = new CursorMethods(this, handler);

		this._publicationName = name;
		this.onStop(function () {
			handler.stop();
		});

		var cb = callback.apply(_.extend(cursors, this), arguments);
		// kadira show me alerts when I use this return (but works well)
		// return cb || (!this._ready && this.ready());
		return cb;
	});
};

Crossbar = DDPServer._InvalidationCrossbar;