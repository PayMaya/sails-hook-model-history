'use strict';

module.exports = function (sails) {
  var loader = require('sails-util-mvcsloader')(sails);

  // Load policies under ./api/policies and config under ./config
  loader.configure();
  return {    initialize: function (next) {
      loader.inject(function (err) {
        HistoryReferenceService.createModel('PaymentToken', 'dbPostgresql2', 'payment_tokens_history');
        return next(err);
      });
    }
    };
};
