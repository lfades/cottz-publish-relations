Package.describe({
  name: 'cottz:publish-relations',
  summary: 'Edit your documents before sending without too much stress',
  version: '2.0.5',
  git: 'https://github.com/Goluis/cottz-publish-relations',
  documentation: 'README.md'
});

Package.onUse(function (api) {
  api.versionsFrom('1.3.2.4');

  api.use([
    'ecmascript',
    'check',
    'ddp-server',
    'underscore'
  ]);

  api.mainModule('lib/client/publish_relations.js', 'client');
  api.mainModule('lib/server/index.js', 'server');

  api.export('PublishRelations', 'server');
});

Package.onTest(function (api) {
  api.use([
    'ecmascript',
    'tinytest',
    'random',
    'mongo',
    'ddp',
    'cottz:publish-relations'
  ]);

  api.mainModule('tests/index.js');
});