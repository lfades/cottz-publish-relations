publishRelations = function () {};
PublishRelations = new publishRelations();

publishRelations.prototype.changePag = function (data, options, cb) {
	Meteor.apply('PR.changePagination', [data], options, cb);
};

publishRelations.prototype.fire = function (collection, data, options, cb) {
	Meteor.apply('PR.fireListener', [collection, data], options, cb);
};