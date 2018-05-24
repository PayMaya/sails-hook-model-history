'use strict';

var HistoryModelService = require('./HistoryModelService');

module.exports = function (sails) {
  var loader = require('sails-util-mvcsloader')(sails);

  return {
    initialize: function (next) {
      loader.inject(function (err) {
        HistoryModelService.createModels(sails, next);
      });
    }
  };
};
