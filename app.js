global.$ = $;
global.settings = {
  author : ""
};
global.settings.alertMsg = window.alert;

var fs = require('fs');
var path = require('path');
var shell = require('nw.gui').Shell;
var step = require('step');
var Datastore = require('nedb');
var path = require('path');
var repoListDb = new Datastore({ filename: path.join(require('nw.gui').App.dataPath, 'list.db') });
var authorInfoDb = new Datastore({filename : path.join(require('nw.gui').App.dataPath, 'author.db') });
authorInfoDb.loadDatabase();
repoListDb.loadDatabase();
global.settings.authorInfoDb = authorInfoDb;
global.settings.repoListDb = repoListDb;

var sideEventLogic = require('./sideMenuEventLogic.js');
var utilLibs = require('./utils.js');
var eventTrigger = require('./eventTrigger.js');
var repositories = require('./repositories.js'); 
var logFetcher = require('./fetchGitLog.js');

var author = global.settings.author;
var inputAuthorName;
var duration = {
  
};

$(document).ready(function() {
  //init setting
  var jQuery = $;
  
  triggerInitDbModalEvent(jQuery);
  triggerEditAuthorInfoEvent(jQuery);
  triggerEditAuthorInfoModalEvent(jQuery);
  triggerInputAuthorInfoEvent(jQuery);
  eventTrigger.sortByDate(jQuery);

  step(
    function () {
      loadAuthorInfo(jQuery, this);
    },
    function getRepoList(err, runLoadRepository) {
      if (err) {
        alert(err);
      }

      if (runLoadRepository === true) {
        repositories.loadRepositoryList(jQuery, this);
      } else {
        return;
      }
    },
    function done(err) {
      if (err) {
        alert(err);
      }
    }
    );

  eventTrigger.addRepository(jQuery);
});


function triggerInitDbEvent(jQuery) {
  jQuery("#initConfigurationModal div.modal-footer button[type='submit']").on('click', function () {
  sideMenuEventLogic.initDbOnSubmit();
  });
}

function triggerInitDbModalEvent(jQuery) {
  jQuery("#initConfigurationModal div.modal-footer button[data-dismiss='modal']").on('click', function () {
    jQuery("#initConfigurationModal").modal('hide');
  });
  jQuery("#initDbBtn").on('click', function () {
    jQuery("#initConfigurationModal").modal();
  });
}

function triggerEditAuthorInfoEvent(jQuery) {
  jQuery("#editInfoBtn").on('click', function () {
          jQuery("#editAuthorInfoModal").modal();
  });
}

function triggerInputAuthorInfoEvent(jQuery) {
  jQuery("#inputAuthorInfoModal div.modal-footer button[type='submit']").on('click', function () {
    inputAuthorName = jQuery("#inputAuthorInfoModal div.modal-body form input").val();
    sideMenuEventLogic.inputAuthorInfo(jQuery, inputAuthorName);
  });
}

function triggerEditAuthorInfoModalEvent(jQuery) {
  jQuery("#editAuthorInfoModal div.modal-footer button[type='submit']").on('click', function () {
    sideMenuEventLogic.editAuthorInfoOnSubmit(jQuery);
  });
}

//
function loadAuthorInfo(jQuery, callback) {
  step(
      function getAuthorInfo() {
        authorInfoDb.findOne({'author' : true}, this);
      }, function (err, doc) {
        if (err) {
          return callback(err);
        }
        if (doc === null) {
          jQuery("#inputAuthorInfoModal").modal();

          return callback(null, false);
        } else {
          author = doc.authorName;
          global.settings.author = author;
          return callback(null, true);
        }
      }
      );
}

