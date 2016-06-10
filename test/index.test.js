require('sails-test-helper');

var assert = require('assert');
var HistoryModelService = require('../lib/HistoryModelService')
var assert = require('assert');

describe('sails-hook-model-history', function() {
  var sandbox;
  var sails;
  beforeEach(function() {
    sandbox = sinon.sandbox.create();
    sails = {
      config: {
        paths: {
          policies: ''
        },
        globals: {
          services: {}
        }
      },
      modules: {
        loadPolicies: ''
      },
      log:{
        info: function(message){
        },
        error: function(message){
        }
      },
      util:{
        merge: function(obj, obj2){
          return {};
        }
      }
    };
  });

  afterEach(function() {
    sandbox.restore();
  });

  it('should call HistoryModelService.createModels;', function() {
    var sailsHookModelHistory = require('../lib')(sails);
    assert(sailsHookModelHistory.initialize);
  });
});
