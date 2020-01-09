'use strict';

var clearBaseACLs = function(ModelType, ModelConfig) {
  ModelType.settings.acls.length = 0;
  ModelConfig.acls.forEach(function(r) {
    ModelType.settings.acls.push(r);
  });
};

module.exports = function(User) {
  var app = require('../../server/server');

  clearBaseACLs(User, require('./user.json'));

  
};
