import CursorMethods from './cursor';

CursorMethods.prototype.observe = function (cursor, callbacks) {
  this.handler.add(cursor, {
    handler: 'observe',
    callbacks: callbacks
  });
};

CursorMethods.prototype.observeChanges = function (cursor, callbacks) {
  this.handler.add(cursor, {
    handler: 'observeChanges',
    callbacks: callbacks
  });
};