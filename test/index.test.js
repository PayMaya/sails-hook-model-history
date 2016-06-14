var assert = require('assert');
var Sails = require('sails');
var sails;

before(function(done) {
  // Hook will timeout in 10 seconds
  this.timeout(10000);
  Sails.models = {
    buyer: {
      identity: 'buyer',
      tableName: 'buyers',
      connection: ['memory'],
      migrate: 'safe',
      historyTableSuffix: '_history',
      historyTablePrefix: '',
      historyModelSuffix: 'History',
      history: true,
      attributes: {
        id: {
          type: 'string',
          primaryKey: true
        },
        name: {
          type: 'string',
          required: true,
          columnName: 'first_name'
        },
        createdAt: {
          type: 'date',
          columnName: 'created_at'
        },
        updatedAt: {
          type: 'date',
          columnName: 'updated_at'
        }
      },
      globalId: 'Buyer'
    }
  };
  Sails.lift({
    port: 1341,
    hooks: {
      // Load the hook
      "sails-hook-model-history": require('../lib/index.js')
    },
    connections: {
      memory: {
        adapter: 'sails-memory',
        host: 'localhost',
        port: 3306,
        user: 'root',
        database: 'root'
      }
    },
    models     : {
      migrate: 'safe'
    },
    log: {
      level: "error"
    }
  }, function(err, _sails) {
    if (err) {
      console.log(err)
      return done(err);}
    sails = _sails;
    return done();
  });
});

describe('sails-hook-model-history', function() {
  it('should initialize Buyer model', function() {
    assert(Buyer);
    assert(Buyer.attributes.name);
  });
  it('should initialize BuyerHistory model', function() {
    assert(BuyerHistory);
    assert(BuyerHistory.attributes.actionType);
  });
});

after(function(done) {
  if (sails) {
    return sails.lower(done);
  }
  return done();
});
