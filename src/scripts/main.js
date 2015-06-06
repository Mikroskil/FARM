// Require Node modules in the browser thanks to Browserify: http://browserify.org
var bespoke = require('bespoke'),
  cube = require('bespoke-theme-cube'),
  keys = require('bespoke-keys'),
  touch = require('bespoke-touch'),
<<<<<<< HEAD
  bullets = require('bespoke-bullets'),
  backdrop = require('bespoke-backdrop'),
  scale = require('bespoke-scale'),
=======
>>>>>>> dce431f93dfea355bc9785c9a374f24aef05b819
  hash = require('bespoke-hash'),
  progress = require('bespoke-progress');

// Bespoke.js
bespoke.from('article', [
  cube(),
  keys(),
  touch(),
<<<<<<< HEAD
  bullets('li, .bullet'),
  backdrop(),
  scale(),
=======
>>>>>>> dce431f93dfea355bc9785c9a374f24aef05b819
  hash(),
  progress()
]);
