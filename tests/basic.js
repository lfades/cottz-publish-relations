import { Tinytest } from 'meteor/tinytest';
import { Mongo } from 'meteor/mongo';
import { Random } from 'meteor/random';
import PublishRelations from 'meteor/cottz:publish-relations';
import { data, Client } from './data';

Tinytest.addAsync('Cursor', function (test, done) {
  var quotes = new Mongo.Collection(Random.id()),
    publish = Random.id(),
    docs = data.quotes;

  for (var doc in docs) {
    quotes.insert(docs[doc]);
  };

  PublishRelations(publish, function () {
    this.cursor(quotes.find());
  });

  var client = Client();
  client._livedata_data = function (msg) {
    if (msg.msg == 'added') {
      test.equal(msg.fields, quotes.findOne({_id: msg.id}, {fields: {_id: 0}}));
    } else if (msg.msg == 'ready') {
      client.disconnect();
      done();
    }
  };

  client.subscribe(publish);
});

Tinytest.addAsync('Observes', function (test, done) {
  var quotes = new Mongo.Collection(Random.id()),
    publish = Random.id(),
    publish2 = Random.id(),
    docs = data.quotes;

  for (var doc in docs) {
    quotes.insert(docs[doc]);
  }

  PublishRelations(publish, function () {
    this.observe(quotes.find(), {
      added: function (doc) {
        test.equal(doc, quotes.findOne(doc._id));
      }
    });
  });

  PublishRelations(publish2, function () {
    this.observeChanges(quotes.find(), {
      added: function (id, doc) {
        test.equal(doc, quotes.findOne(id, {fields: {_id: 0}}));
      }
    });
  });

  var client = Client();
  client._livedata_data = function (msg) {
    test.equal(msg.msg, 'ready');
    client.disconnect();
  };

  client.subscribe(publish);


  var client2 = Client();
  client2._livedata_data = function (msg) {
    test.equal(msg.msg, 'ready');
    client2.disconnect();
    done();
  };

  client2.subscribe(publish2);
});