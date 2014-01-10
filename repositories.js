var fs = require('fs');
var step = require('step');
var utilLibs = require('./utils.js');
var eventTrigger = require('./eventTrigger.js');
var repoListDb = global.settings.repoListDb;

function insertRepository(fileList, callback) {
  var gitDirPath = utilLibs.fetchAbsolutePath(fileList);
  var isGitDir = false;
  var returnDirInfo;

  step(
    function readGitDir() {
      fs.readdir(gitDirPath, this);
    },
    function isGitDir(err, files) {
      if (err) {
        return callback(err);
      }

      for (var i = 0, li = files.length; i < li; i++) {
        if (".git" === files[i]) {
          isGitDir = true;
          break;
        }
      }

      if (isGitDir === false) {
        return callback("Not Found .git");
      }

      var dirSplit = gitDirPath.split("/");
      var dirName = dirSplit[dirSplit.length - 1];
      var gitDirPathInfo = {
        name : dirName,
        path : gitDirPath
      };

      returnDirInfo = gitDirPathInfo;
      repoListDb.find({"path" : gitDirPath}, this);
    },
    function insertGitDir(err, docs) {
        if (err) {
          return callback(err);
        }

        if (docs.length != 0) {
          return callback(gitDirPathInfo + " is exist!");
        }

        repoListDb.insert(returnDirInfo, this);
    },
    function done(err, newDoc) {
      if (err) {
        return callback(err);
      }
      
      return callback(null, newDoc);
    }
      );
}

function selectRepositoryList(callback) {
  repoListDb.find({}, function (err, docs) {
    if (err) {
      return callback(err);
    }

    return callback(null, docs);
  });
}

function deleteRepository(value, name, callback) {
  step(
      function findRepositoryByName() {
        repoListDb.find({'name' : name} , this);
      },
      function (err, docs) {
        if (err) {
          return callback(err);
        }
        if (docs.length == 0) {
          return(name + " is Not exist");
        }
        var group = this.group();

        for (var i = 0, li = docs.length; i < li; i++) {
          repoListDb.remove({_id: docs[i]._id}, {}, group());
        }
      }, function (err, datas) {
        if (err) {
          return callback(err);
        }

        return callback(null);
      }
        );
}

function loadRepositoryList(jQuery, callback) {
  step(
      function() {
        selectRepositoryList(this);
      }, function displayRepositoryList(err, docs) {
        if (err) {
          return callback(err);
        }

        eventTrigger.displayRepositoryList(jQuery, docs);
        return callback(null);   
      }
  );
}

module.exports.insertRepository = insertRepository;
module.exports.deleteRepository = deleteRepository;
module.exports.loadRepositoryList = loadRepositoryList;
