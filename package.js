Package.describe({
  name: 'cottz:publish-relations',
  summary: "Edit your documents before sending without too much stress",
  version: "1.2.1",
  git: "https://github.com/Goluis/cottz-publish-relations"
});

Package.onUse(function(api) {
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
  api.versionsFrom('1.0.5');

  api.use('underscore', 'server');

  api.addFiles('publish_relations.js', 'server');
  api.addFiles('cursor_methods.js', 'server');
  api.addFiles('cursor_utils.js', 'server');
  api.addFiles('handler_controller.js', 'server');
  api.addFiles('methods.js', 'server');
};