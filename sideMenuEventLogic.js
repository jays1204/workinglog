var logFetcher = require('./fetchGitLog.js');
var step = require('step');
var utilLibs = require('./utils.js');
var author = global.settings.author;
var authorInfoDb = global.settings.authorInfoDb;
var repoListDb = global.settings.repoListDb;

function editAuthorInfoOnSubmit(jQuery) {
    step(
      function getInfo() {
        authorInfoDb.findOne({}, this);
        }, 
        function removePreAuthorInfo(err, doc) {
          if (err) {
            alert("author info find ERR: " + err);
          }
          
          authorInfoDb.remove({"_id" : doc._id}, {}, this);
        }, 
        function (err, datas) {
          if (err) {
            alert("Edit Author Info ERR: " + err);
          }
          
          var editedAuthorName = jQuery("#editAuthorInfoModal div.modal-body form input").val();
          inputAuthorInfo(jQuery, editedAuthorName);
        }
      );
}

function inputAuthorInfo(jQuery, authorName) {
  jQuery("#inputAuthorInfoModal").modal("hide");
  jQuery("#editAuthorInfoModal").modal("hide");
  if (authorName === null) {

  }

  step(
      function getHomeGitConfig() {
        utilLibs.parsingAuthinfoOnGitConfig(this);
      }, 
      function compareGitConfigAuthorValue(err, configuredName) {
        if (err) {
          alert("Read ~/.gitconfig ERR: " + err);
        }

        if (authorName != configuredName) {
          alert("It doesn't match input name with configure name");
        }

        authorInfoDb.insert({"author" : true, "authorName" : authorName}, this);
      },
      function loadRepoList(err, newDoc) {
        if (err) {
          alert('authorInfo insert ERR: ' + err);
        }

        author = global.settings.author = authorName;
        loadRepositoryList(jQuery, function (err) {
          if (err) {
            alert(err);
          }
        });
      }
  );

}

function initDbOnSubmit() {
    step(
      function findAuthInfo() {
        authorInfoDb.find({}, this)
      },
      function deleteAuthInfo(err, docs) {
        if (err) {
          alert("Init Config Info ERR: " + err);
        }

        if (docs.length === 0) {
          alert("Information to delete not exist");

          return;
        }
        
        var group = this.group();
        for (var i = 0, li = docs.length; i < li; i++) {
          authorInfoDb.remove({"_id" : docs[i]._id}, {}, group());
        }
      },
      function findRepoList(err) {
        if (err) {
          alert("Init Config Info ERR: " + err);
        }

        repoListDb.find({}, this);
      },
      function deleteRepoList(err, docs) {
        if (err) {
          alert("Init Config Info ERR: " + err);
        }

        if (docs.length === 0) {
          alert("Information to delete not exist");

          return;
        }
  
        var group = this.group();
        for (var i = 0, li = docs.length; i < li; i++) {
          repoListDb.remove({"_id" : docs[i]._id}, {}, group());
        }
      },
      function done(err) {
        if (err) {
          alert("Init Config Info ERR: " + err);
        }

        return;
      }
      );
}

module.exports.editAuthorInfoOnSubmit = editAuthorInfoOnSubmit;
module.exports.inputAuthorInfo = inputAuthorInfo;
module.exports.initDbOnSubmit = initDbOnSubmit;
