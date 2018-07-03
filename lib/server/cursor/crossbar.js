import { _ } from 'meteor/underscore';
import CursorMethods from './cursor';
import { DDPServer } from 'meteor/ddp-server';

const crossbar = DDPServer._InvalidationCrossbar;
// designed to paginate a list, works in conjunction with the methods
// do not call back to the main callback, only the array is changed in the collection
CursorMethods.prototype.paginate = function (fieldData, limit, infinite) {
  const sub = this.sub;
  const collection = this.collection;

  if (!this._id || !collection)
    throw new Error("you can't use this method without being within a document");

  const field = Object.keys(fieldData)[0];
  const copy = _.clone(fieldData)[field];
  const max = copy.length;
  const connectionId = sub.connection.id;

  fieldData[field] = copy.slice(0, limit);

  const listener = crossbar.listen({
    collection: 'paginations',
    id: connectionId,
  }, (data) => {
    if (!data.id || data.id !== connectionId) return;

    let skip = data.skip;

    if (skip >= max && !infinite)
      return;

    fieldData[field] = infinite ? copy.slice(0, skip + limit): copy.slice(skip, skip + limit);
    sub.changed(collection, data._id, fieldData);
  });

  this.handler.addBasic(field, listener);

  return fieldData[field];
};

CursorMethods.prototype.listen = function (options, callback, run) {
  const sub = this.sub;
  const name = 'listen-' + this._publicationName;

  const listener = crossbar.listen({
    collection: name,
    id: sub.connection.id
  }, (data) => {
    if (!data.id || data.id !== sub.connection.id) return;

    _.extend(options, _.omit(data, 'collection', 'id'));
    callback(false);
  });

  const handler = this.handler.addBasic(name);

  if (run !== false) callback(true);

  return handler.set(listener);
};