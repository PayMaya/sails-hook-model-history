require('sails-test-helper');

var rekuire = require('rekuire');
var HistoryModelService = rekuire('HistoryModelService');
var assert = require('assert');

describe('HistoryModelService', function() {
  var sandbox

  beforeEach(function() {
    sandbox = sinon.sandbox.create();
  });
  describe('.createModels', function() {
    var waterlineServiceStub;

    beforeEach(function() {
      sails.models = {
        buyer: {
          identity: 'buyer',
          tableName: 'buyers',
          connection: ['memoryDB'],
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
      sails.adapters = {
        'sails-memory': require('sails-memory')
      };
      sails.config.connections = {
        memoryDB: {
          adapter: 'sails-memory',
          host: 'localhost',
          port: 3306,
          user: 'root',
          database: 'root'
        }
      };
    });

    context('when error creation of history is raised', function() {
      beforeEach(function() {
        sails.config.connections = {};
      });
      it('should log error in creation of history model.', function() {
        var logSpy = sandbox.spy(sails.log, 'error');
        HistoryModelService.createModels(sails);
        logSpy.called.should.be.true;
        logSpy.calledWith('Error creating history models').should.be.true;
      });
    });
    context('when successful creation of history', function() {
      it('should load models.', function() {
        var logSpy = sandbox.spy(sails.log, 'info');
        HistoryModelService.createModels(sails);
        logSpy.calledOnce.should.be.true;
        logSpy.calledWith('History Table Name buyers').should.be.true;
      });

    });
    context('when history model is created', function(){
      it('should create of history model.', function() {
        assert(Buyer);
        assert(BuyerHistory);
        assert(BuyerHistory.attributes.name);
        assert(BuyerHistory.create);
      });
      it('should be able to invoke create', function() {
        BuyerHistory.create({ id: '1',
          name: 'name'
        }).exec(function createHistory(err, model) {
          assert(model.name === 'name');
        });
      });
      it('should be able to invoke update', function() {
        BuyerHistory.update({id: '1'}, {
          name: 'name2'
        }).exec(function updateHistory(err, model) {
          assert(model[0].name === 'name2');
        });
      });
      it('should be able to invoke destroy', function() {
        BuyerHistory.destroy({id: '1'}).exec(function deleteHistory(err) {
          assert(err == null);
        });
        BuyerHistory.findOne({
          id: '1'
        }).exec(function findMerchant(error, history) {
          assert(history == null);
        });
      });
    });
  });
});
after(function(done) {
  sails.lower(done);
});

