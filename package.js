Package.describe({
  name: 'cottz:publish-relations',
  summary: "Edit your documents before sending without too much stress",
  version: "2.0.3",
  git: "https://github.com/Goluis/cottz-publish-relations"
});

Package.onUse(function (api) {
  configure(api);
});

Package.on_test(function (api) {
  configure(api);

  api.use(['ecmascript', 'tinytest', 'random', 'underscore']);

  api.addFiles('tests/data.js', 'server');
  api.addFiles('tests/basic.js', 'server');
  api.addFiles('tests/cursor_methods.js', 'server');
});

function configure (api) {
  api.versionsFrom('1.2.1');

  api.use(['ecmascript', 'check', 'ddp', 'underscore']);

  api.addFiles([
    'lib/server/publish_relations.js',
    'lib/server/handler_controller.js',
    'lib/server/methods.js',

    'lib/server/cursor/nonreactive/cursor.js',
    'lib/server/cursor/nonreactive/join.js',
    
    'lib/server/cursor/cursor.js',
    'lib/server/cursor/utils.js',
    'lib/server/cursor/observe.js',
    'lib/server/cursor/join.js',
    'lib/server/cursor/crossbar.js',
    'lib/server/cursor/change_parent_doc.js'
  ], 'server');
};