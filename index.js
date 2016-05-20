'use strict';

var HistoryModelService = require('./lib/HistoryModelService');

module.exports = function (sails) {
  var loader = require('sails-util-mvcsloader')(sails);

  loader.configure();
  return {
    initialize: function (next) {
      loader.inject(function (err) {
        HistoryModelService.createModel(sails);
        return next(err);
      });
    }
  };
};
