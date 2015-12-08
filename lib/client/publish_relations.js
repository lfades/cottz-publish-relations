class publishRelations {
	constructor () {}
	changePag (data, ...params) {
		Meteor.apply('PR.changePagination', [data], ...params);
	}
	fire (collection, data, ...params) {
		Meteor.apply('PR.fireListener', [collection, data], ...params);
	}
};
PublishRelations = new publishRelations();