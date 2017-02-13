import { Meteor } from 'meteor/meteor';

class publishRelations {
  constructor () {}
  changePag (data, ...params) {
    Meteor.apply('PR.changePagination', [data], ...params);
  }
  fire (collection, data, ...params) {
    if ('collection' in data || 'id' in data)
      console.log('"collection" and "id" are reserved keys to Crossbar, please use another keys.');

    Meteor.apply('PR.fireListener', [collection, data], ...params);
  }
};

const PublishRelations = new publishRelations();
export default PublishRelations;
export { PublishRelations };