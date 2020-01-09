'use strict';

module.exports = function enableAuthentication(server) {
  // enable authentication
  server.enableAuth();


  // server.models.Role.create({
  //     name: 'admin'
  //   }, function(err, role) {

  //     role.principals.create({
  //       principalType: server.models.RoleMapping.USER,
  //       principalId: 1
  //     }, function(err, principal) {
  //     });
  //   });
};
