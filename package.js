Package.describe({
  name: 'cottz:publish-relations',
  summary: "Edit your documents before sending without too much stress",
  version: "1.5.0.1",
  git: "https://github.com/Goluis/cottz-publish-relations"
});

Package.onUse(function (api) {
  configure(api);
});

Package.on_test(function (api) {
  configure(api);

  api.use(['tinytest', 'random']);

  api.addFiles('tests/data.js', 'server');
  api.addFiles('tests/basic.js', 'server');
  api.addFiles('tests/cursor_methods.js', 'server');
});

function configure (api) {
  api.versionsFrom('1.1.0.2');

  api.use('underscore', 'server');

  api.addFiles([
    'publish_relations.js',
    'cursor_methods.js',
    'cursor_utils.js',
    'handler_controller.js',
    'methods.js'
  ], 'server');
};