Cottz publish-relations
=============================

Edit your documents before sending without too much stress.
provides a number of methods to easily manipulate data using internally observe and observeChanges in the server

## Installation

```sh
$ meteor add cottz:publish-relations
```

## Quick Start
Assuming we have the following collections
```js
// Authors
{
  _id: 'someAuthorId',
  name: 'Luis',
  profile: 'someProfileId',
  bio: 'I am a very good and happy author',
  interests: ['writing', 'reading', 'others']
}

// Books
{
  _id: 'someBookId',
  authorId: 'someAuthorId',
  name: 'meteor for dummies'
}

// Comments
{
  _id: 'someCommentId',
  bookId: 'someBookId',
  text: 'This book is better than meteor for pros :O'
}
```
I want publish the autor with his books and comments of the books and I want to show only some interests of the author
```js
Meteor.publishRelations('author', function (authorId) {
  this.cursor(Authors.find(authorId), function (id, doc) {
    this.cursor(Books.find({authorId: id}), function (id, doc) {
      this.cursor(Comments.find({bookId: id}));
    });
    
    doc.interests = this.paginate({interests: doc.interests}, 5);
  });
  
  return this.ready();
});
// Client
// skip 5 interest and show the next 5
PublishRelations.changePag({_id: 'authorId', field: 'interests', skip: 5});
```
Note: The above code is very nice and works correctly, but I recommend that you read the Performance Notes
## Main API
to use the following methods you should use `Meteor.publishRelations` instead of `Meteor.publish`

### this.cursor (cursor, collection, callbacks(id, doc, changed))
publishes a cursor, `collection` is not required
* **collection** is the collection where the cursor will be sent. if not sent, is the default cursor collection name
* **callbacks** is an object with 3 functions (added, changed, removed) or a function that is called when it is added and changed and received in third parameter a Boolean value that indicates if is changed
* If you send `callbacks` you can use all the methods again and you can edit the document directly (doc.property = 'some') or send it in the return.

### this.join (Collection, options, name)
It allows you to collect a lot of _ids and then make a single query, only Collection is required.
* **Collection** is the Mongo Collection to be used
* **options** the options parameter in a Collection.find
* **name** the name of a different collection to receive documents there

After creating an instance of `this.join` you can do the following
```js
let comments = this.join(Comments, {});
// default query is {_id: _id} or {_id: {$in: _ids}}
// if you need to use another field use selector
comments.selector = function (_ids) {
  // _ids is {_id: {$in: _ids}} or a single _id
  return {bookId: _ids};
};
// Adds a new id to the query
comments.push(id);
comments.push(id2, id3, id4);
// Sends the query to the client, after sending the query each new push()
// send a new query, you do not have to worry about reactivity or
// performance with this method
comments.send();
```
Why use this and not `this.cursor`? because they are just 2 queries
```js
let comments = this.join(Comments, {});
comments.selector = _ids => {bookId: _ids};

this.cursor(Books.find(), function (id, doc) {
  comments.push(id);
});

comments.send();
```


### this.observe / this.observeChanges (cursor, callbacks)
observe or observe changes in a cursor without sending anything to the client, callbacks are the same as those used by meteor

## Nonreactive API
The following methods work much like their peers but they are not reactive

### this.cursorNonreactive (cursor, collection, callback)
It has 2 differences with `this.cursor`
- `callback` is only a function that executes when a document is added
-   you can only use non-reactive methods within the callback

### this.joinNonreactive (Collection, options, name)
Is exactly the same as `this.join` but non reactive

## Crossbar API
The following methods use `Meteor Crossbar` which allows the client to communicate with a publication without re-run the publication

### this.paginate (field, limit, infinite)
page within an array without re run the publication or callback

* returns the paginated array, be sure to change it in the document
* **field** is an object where the key is the field in the document and the value an array
* **limit** the total number of values in the array to show
* **infinite** if true the above values are not removed when the paging is increased
* **PublishRelations.changePag({_id, field, skip})** change the pagination of the document with that `id` and `field`. `skip` is the number of values to skip.

### this.listen (data, callback, run)
It allows you to execute a part of the publication when the client asks for it. It is easier to explain with an example
```js
Meteor.publishRelations('books', function (data) {
  let pattern = {
    authorId: String,
    skip: Match.Integer
  };
  check(data, pattern);

  if (!this.userId || !Meteor.users.findOne({_id: this.userId}))
    return this.ready();
  // Maybe you have roles or another validations here

  this.listen(data, function (runBeforeReady) {
    if (!runBeforeReady)
      check(data, pattern);
   
    this.cursor(Books.find({authorId: data.authorId}, {
      limit: 10,
      skip: data.skip
    }));
  });
  
  return this.ready();
});

// -- client --
Meteor.subscribe('books');
// skip 10 books and show the next 10
PublishRelations.fire('books', {authorId: 'authorId', skip: 10});
```
each time that you use `PublishRelations.fire` the listen callback is rerun, the param `data` that you sent in listen extends with the data sent in the `fire` event
- `run` is a boolean value (default true). if true `callback` is executed immediately within the publication before the first `fire`
- `callback` only receives the boolean parameter `runBeforeReady` that is only true when `run` is true and the `callback` runs for first time
-  you can have only one `listen` by publication

## Performance Notes
* all methods returns an object with the stop() method except for paginate
* all cursors are stopped when the publication stop
* when the parent cursor is stopped or a document with cursors is removed all related cursors are stopped
* all cursors use basic observeChanges as meteor does by default, performance does not come down
* if when the callback is re-executes not called again some method (within an If for example), the method continues to run normally, if you re-call method (because the selector is now different) the previous method is replaced with the new
```js
// For example we have a collection users and each user has a roomId
// we want to publish the users and their rooms
this.cursor(Meteor.users.find(), function (id, doc) {
  // this function is executed on added/changed
  this.cursor(Rooms.find({_id: doc.roomId}));
});
// the previous cursor is good but has a bug, when an user is changed we can't make sure 
// that the roomId is changed and 'doc' only comes with the changes, so roomId is undefined
// and our Rooms cursor no longer work anymore

// to fix the above problem we need to check the roomId
this.cursor(Meteor.users.find(), function (id, doc) {
  if (doc.roomId)
    this.cursor(Rooms.find({_id: doc.roomId}));
});
// or we can use an object with 'added' instead of a function
// this way is better than the above if we are sure that roomId is not going to change
this.cursor(Meteor.users.find(), {
  added: function (id, doc) {
    this.cursor(Rooms.find({_id: doc.roomId}));
  }
});
```
* As I said in Quick Start you can do this
```js
this.cursor(Authors.find(authorId), function (id, doc) {
  this.cursor(Books.find({authorId: id}), function (id, doc) {
    this.cursor(Comments.find({bookId: id}));
  });
});
```
but you will find that the publication is becoming increasingly slow, suppose you have 10 books for a given author and every book has 100 reviews, with this method would make the following queries:
1 author + 1 books + 10 comments = 12 queries, for each book found a query is made to find comments which creates a performance issue and publication could take seconds

The solution is to use `this.join` to join all the comments and send them in a single query, passing from 12 queries to 3 queries for mongo
```js
let comments = this.join(Comments);
comments.selector = _ids => {bookId: _ids};

this.cursor(Authors.find(authorId), function (id, doc) {
  // We not have to worry about the books cursor because we only have one author
  this.cursor(Books.find({authorId: id}), function (id, doc) {
    comments.push(id);
  });
});

comments.send();
```
* publications are completed as usual
```js
// you can do this to finish writing your publication
this.ready();
return this.ready();
return [];
return [cursor1, cursor2, cursor3];
```
