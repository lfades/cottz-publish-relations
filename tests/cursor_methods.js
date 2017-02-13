import { Tinytest } from 'meteor/tinytest';
import { Mongo } from 'meteor/mongo';
import { Random } from 'meteor/random';
import PublishRelations from 'meteor/cottz:publish-relations';
import { data, Client } from './data';

Tinytest.addAsync('Relations - observe', function (test, done) {
  var quotesName = Random.id(),
    quotes = new Mongo.Collection(quotesName),
    products = new Mongo.Collection(Random.id()),
    publish = Random.id(),
    names = data.names,
    docs = data.quotes;

  for (var doc in docs) {
    var quote = docs[doc];

    quotes.insert(quote);
    for (var i = 0; i < 3; i ++) {
      products.insert({
        quoteId: quote._id,
        name: names[i],
        price: 1000 * i
      });
    }
  };

  PublishRelations(publish, function () {
    this.cursor(quotes.find(), function (id, doc) {
      var productsCursor = products.find({quoteId: id});

      this.observe(productsCursor, {
        added: function (doc) {
          test.equal(doc.name, names[doc.price / 1000]);
        }
      });

      this.observeChanges(productsCursor, {
        added: function (prodId, doc) {
          test.equal(doc.name, names[doc.price / 1000]);
        }
      });
    });
  });

  var client = Client();

  client._livedata_data = function (msg) {
    if (msg.msg == 'added') {
      test.equal(msg.collection, quotesName);
    } else if (msg.msg == 'ready') {
      client.disconnect();
      done();
    }
  };

  client.subscribe(publish);
});

Tinytest.addAsync('Relations - cursor basic', function (test, done) {
  var quotesName = Random.id(),
    productsName = Random.id(),
    quotes = new Mongo.Collection(quotesName),
    products = new Mongo.Collection(productsName),
    names = data.names,
    publish = Random.id(),
    docs = data.quotes;

  for (var doc in docs) {
    var quote = docs[doc];

    quotes.insert(quote);
    for (var i = 0; i < 3; i ++) {
      products.insert({
        quoteId: quote._id,
        name: names[i],
        price: 1000 * i
      });
    }
  };

  PublishRelations(publish, function () {
    this.cursor(quotes.find(), function (id, doc) {
      this.cursor(products.find({quoteId: id}));
    });
  });

  var client = Client();
  client._livedata_data = function (msg) {
    if (msg.collection == productsName) {
      var fields = msg.fields;

      test.isTrue(quotes.findOne({_id: fields.quoteId}));
      test.equal(fields.name, names[fields.price / 1000]);

    } else if (msg.collection == quotesName) {
      test.equal(msg.fields, quotes.findOne({_id: msg.id}, {fields: {_id: 0}}));

    } else if (msg.msg == 'ready') {
      client.disconnect();
      done();
    }
  };

  client.subscribe(publish);
});

Tinytest.addAsync('Relations - cursor', function (test, done) {
  var quotesName = Random.id(),
    productsName = Random.id(),
    quotes = new Mongo.Collection(quotesName),
    products = new Mongo.Collection(productsName),
    productsInfo = new Mongo.Collection(Random.id()),
    names = data.names,
    colors = ['blue', 'black', 'red'],
    publish = Random.id(),
    docs = data.quotes;

  for (var doc in docs) {
    var quote = docs[doc];

    quotes.insert(quote);
    for (var i = 0; i < 3; i ++) {
      var prodId = products.insert({
        quoteId: quote._id,
        name: names[i],
        price: 1000 * i
      });

      productsInfo.insert({
        prodId: prodId,
        color: colors[i],
        info: 'this product is cool'
      });
    }
  };

  PublishRelations(publish, function () {
    this.cursor(quotes.find(), function (id, doc) {
      this.cursor(products.find({quoteId: id}), function (prodId, prod) {
        var prodInfo = this.changeParentDoc(productsInfo.find({prodId: prodId}), function (prodInfoId, prodInfo) {
          return prodInfo;
        });

        prod.color = prodInfo.color;
        prod.info = prodInfo.info;
      });
    });
  });

  var client = Client();
  client._livedata_data = function (msg) {
    if(msg.collection == productsName) {
      var fields = msg.fields;
      
      if(msg.msg == 'added') {
        test.isTrue(quotes.findOne({_id: fields.quoteId}));
        test.equal(fields.name, names[fields.price / 1000]);

        productsInfo.update({prodId: msg.id}, {$set: {info: 'This product is not cool now'}});
      } else {
        // changed
        test.equal(fields.info, 'This product is not cool now');
      }
    } else if (msg.collection == quotesName) {
      test.equal(msg.fields, quotes.findOne({_id: msg.id}, {fields: {_id: 0}}));

    } else if (msg.msg == 'ready') {
      client.disconnect();
      done();
    }
  };

  client.subscribe(publish);
});

Tinytest.addAsync('Relations - changeParentDoc', function (test, done) {
  var quotesName = Random.id(),
    quotes = new Mongo.Collection(quotesName),
    users = new Mongo.Collection(Random.id()),
    publish = Random.id(),
    docs = data.quotes;

  for (var doc in docs) {
    var quote = docs[doc];

    quotes.insert(quote);
    users.insert({
      _id: quote.user,
      profile: {
        age: quote._id * 2 + 15,
        postalCode: quote._id * 99 
      }
    });
  };

  PublishRelations(publish, function () {
    this.cursor(quotes.find(), function (id, doc) {
      var user = this.changeParentDoc(users.find({_id: doc.user}), function (id, doc) {
        return {userProfile: doc.profile};
      });

      doc.userProfile = user.userProfile;
    });
  });

  var client = Client();
  client._livedata_data = function (msg) {
    if (msg.msg == 'added') {
      test.equal(msg.collection, quotesName);

      var user = users.findOne({_id: msg.fields.user});
      users.update({_id: user._id}, {$set: {'profile.age': user.profile.age + 1}});

      test.equal(msg.fields.userProfile, user.profile);

    } else if (msg.msg == 'changed') {
      test.equal(msg.collection, quotesName);
      test.equal(msg.fields.userProfile.age, msg.id * 2 + 16);

    } else if (msg.msg == 'ready') {
      client.disconnect();
      done();
    }
  };

  client.subscribe(publish);
});

Tinytest.addAsync('Relations - paginate', function (test, done) {
  var quotesName = Random.id(),
    quotes = new Mongo.Collection(quotesName),
    names = data.names,
    publish = Random.id(),
    docs = data.quotes;

  for (var doc in docs) {
    var quote = docs[doc];

    quote.replies = [];
    quote.repliesInfinite = [];

    for (var i = 0; i < 4; i ++) {
      quote.replies.push(Random.id());
      quote.repliesInfinite.push(Random.id());
    }

    quotes.insert(quote);
  };

  PublishRelations(publish, function () {
    this.cursor(quotes.find(), function (id, doc) {
      doc.replies = this.paginate({replies: doc.replies}, 2);
      doc.repliesInfinite = this.paginate({repliesInfinite: doc.repliesInfinite}, 2, true);
    });
  });

  var client = Client();
  client._livedata_data = function (msg) {
    if (msg.msg == 'added') {
      test.equal(msg.collection, quotesName);
      client.call('changePagination', 'replies', msg.id, 2);
      
      var quote = quotes.findOne({_id: msg.id});
      test.equal(msg.fields.replies, quote.replies.slice(0, 2));

    } else if (msg.msg == 'changed') {
      test.equal(msg.collection, quotesName);

      var quote = quotes.findOne({_id: msg.id});
      test.equal(msg.fields.replies, quote.replies.slice(2, 4));

    } else if (msg.msg == 'updated') {
      client.disconnect();
    }
  };

  client.subscribe(publish);

  var client2 = Client();

  client2._livedata_data = function (msg) {
    if (msg.msg == 'added') {
      test.equal(msg.collection, quotesName);
      client2.call('changePagination', 'repliesInfinite', msg.id, 4);

      var quote = quotes.findOne({_id: msg.id});
      test.equal(msg.fields.repliesInfinite, quote.repliesInfinite.slice(0, 2));

    } else if (msg.msg == 'changed') {
      test.equal(msg.collection, quotesName);

      var quote = quotes.findOne({_id: msg.id});
      test.equal(msg.fields.repliesInfinite, quote.repliesInfinite.slice(0, 4));

    } else if (msg.msg == 'updated') {
      client2.disconnect();
      done();
    }
  };

  client2.subscribe(publish);
});