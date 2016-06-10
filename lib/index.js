'use strict';

var HistoryModelService = require('./HistoryModelService');
var loader = require('sails-util-mvcsloader')(sails);

module.exports = function (sails) {
  loader.configure();
  return {
    initialize: function (next) {
      loader.inject(function (err) {
        HistoryModelService.createModels(sails);
        return next(err);
      });
    }
  };
};
