import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { DDPServer } from 'meteor/ddp-server';

const crossbar = DDPServer._InvalidationCrossbar;

Meteor.methods({
  'PR.changePagination' (data) {
    check(data, {
      _id: String,
      field: String,
      skip: Match.Integer
    });

    crossbar.fire(_.extend({
      collection: 'paginations',
      id: this.connection.id
    }, data));
  },
  'PR.fireListener' (collection, options) {
    check(collection, String);
    check(options, Object);

    crossbar.fire(_.extend({
      collection: 'listen-' + collection,
      id: this.connection.id,
    }, options));
  }
});