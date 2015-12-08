Meteor.publishRelations = function (name, callback) {
	return Meteor.publish(name, function (...params) {
		let handler = new HandlerController(),
		cursors = new CursorMethods(this, handler);

		this._publicationName = name;
		this.onStop(() => handler.stop());

		let cb = callback.apply(_.extend(cursors, this), params);
		// kadira show me alerts when I use this return (but works well)
		// return cb || (!this._ready && this.ready());
		return cb;
	});
};

Crossbar = DDPServer._InvalidationCrossbar;