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
I want publish the autor with his books
```js
Meteor.publishRelations('author', function (authorId) {
  this.cursor(Authors.find(authorId), function (id, doc) {
    this.cursor(Books.find({authorId: id}));
  });
});
```
and comments of the books
```js
Meteor.publishRelations('author', function (authorId) {
  this.cursor(Authors.find(authorId), function (id, doc) {
    this.cursor(Books.find({authorId: id}), function (id, doc) {
      this.cursor(Comments.find({bookId: id}));
    });
  });
});
```
I also want to bring the profile of the author but within the author not apart
```js
Meteor.publishRelations('author', function (authorId) {
  this.cursor(Authors.find(authorId), function (id, doc) {
    this.cursor(Books.find({authorId: id}), function (id, doc) {
      this.cursor(Comments.find({bookId: id}));
    });
    
    doc.profile = this.changeParentDoc(Profiles.find(doc.profile), function (profileId, profile) {
      return profile;
    });
  });
});
```
To finish I want to show only some interests of the author
```js
Meteor.publish('author', function (authorId) {
  this.cursor(Authors.find(authorId), function (id, doc) {
    this.cursor(Books.find({authorId: id}), function (id, doc) {
      this.cursor(Comments.find({bookId: id}));
    });
    
    doc.profile = this.changeParentDoc(Profiles.find(doc.profile), function (profileId, profile) {
      return profile;
    });
    
    doc.interests = this.paginate({interests: doc.interests}, 5);
  });
});
// Client
// skip 5 interest and show the next 5
Meteor.call('changePagination', 'authorId', 'interests', 5);
```
## API
to use the following methods you should use `Meteor.publishRelations` instead of `Meteor.publish`

### this.cursor (cursor, collection, callbacks(id, doc, changed))
publishes a cursor, `collection` is not required
* **collection** is the collection where the cursor will be sent. if not sent, is the default cursor collection name
* **callbacks** is an object with 3 functions (added, changed, removed) or a function that is called when it is added and changed and received in third parameter a Boolean value that indicates if is changed
* If you send `callbacks` you can use all the methods again and you can edit the document directly (doc.property = 'some') or send it in the return.

### this.observe / this.observeChanges (cursor, callbacks)
observe or observe changes in a cursor without sending anything to the client, callbacks are the same as those used by meteor

### this.changeParentDoc (callbacks, onRemoved)
designed to change something in the document with the return of the `callbacks`.
* **callbacks** is an object with `added``changed``removed` or a function that executes when it is added and changed
* **onRemoved** is a function that executes when is removed, is not used if callbacks is an object

### this.paginate (field, limit, infinite)
page within an array without re run the publication or callback
* returns the paginated array, be sure to change it in the document
* **field** is an object where the key is the field in the document and the value an array
* **limit** the total number of values in the array to show
* **infinite** if true the above values are not removed when the paging is increased
* **Meteor.call('changePagination', _id, field, skip)** change the pagination of the document with that `id` and `field`. skip is the number of values to skip

## Important
* all cursors returns an object with the stop() method except for changeParentDoc and paginate
* all cursors are stopped when the publication stop
* when the parent cursor is stopped or a document with cursors is removed all related cursors are stopped
* all cursors use basic observeChanges as meteor does by default, performance does not come down
* if when the callback is re-executes not called again some method (within an If for example), the method continues to run normally, if you re-call method (because the query is now different) the previous method is replaced with the new
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
