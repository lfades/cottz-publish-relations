import { _ } from 'meteor/underscore';
// The aim of handler Controller is to keep all observers that can be created within methods
// its structure is very simple, has a 'handlers' object containing all observers children and
// the observer father is stored within 'handler'
export default class HandlerController {
  constructor () {
    this.handlers = {};
  }
  set (handler) {
    return this.handler = handler;
  }
  addBasic (collection, handler) {
    const oldHandler = this.handlers[collection];
    return oldHandler || (this.handlers[collection] = handler || new HandlerController());
  }
  add (cursor, options) {
    if (!cursor)
      throw new Error("you're not sending the cursor");

    const description = cursor._cursorDescription;
    const collection = options.collection || description.collectionName;
    const selector = description.selector;
    /*
      the selector uses references, in cases that a selector has objects inside
      this validation isn't gonna work

    let oldHandler = this.handlers[collection];
    if (oldHandler) {
      // when the selector equals method stops running, no change occurs and everything
      // will still work properly without running the same observer again
      oldHandler.equalSelector = _.isEqual(oldHandler.selector, selector);
      if (oldHandler.equalSelector)
        return oldHandler;

      oldHandler.stop();
    }*/

    const newHandler = options.handler
    ? cursor[options.handler](options.callbacks)
    : new HandlerController();

    newHandler.selector = selector;

    return this.handlers[collection] = newHandler;
  }
  stop () {
    let handlers = this.handlers;

    this.handler && this.handler.stop();

    for (let key in handlers) {
      handlers[key].stop();
    };

    this.handlers = [];
  }
  remove (_id) {
    let handler = this.handlers[_id];
    if (handler) {
      handler.stop();
      delete this.handlers[_id];
    }
  }
}