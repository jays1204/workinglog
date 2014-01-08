global.$ = $;

var fs = require('fs');
var path = require('path');
var shell = require('nw.gui').Shell;
var step = require('step');
var Datastore = require('nedb');
var path = require('path')
var repoListDb = new Datastore({ filename: path.join(require('nw.gui').App.dataPath, 'list.db') });
var authorInfoDb = new Datastore({filename : path.join(require('nw.gui').App.dataPath, 'author.db') });
 
var logFetcher = require('./fetchGitLog.js');

var author;//= "jays";
var inputAuthorName;

$(document).ready(function() {
  //init setting
  var jQuery = $;
  authorInfoDb.loadDatabase();
  repoListDb.loadDatabase();
  triggerEditAuthorInfoEvent(jQuery);
  triggerEditAuthorInfoModalEvent(jQuery);
  triggerInputAuthorInfoEvent(jQuery);

  step(
    function () {
      loadAuthorInfo(jQuery, this);
    },
    function getRepoList(err, runLoadRepository) {
      if (err) {
        alert(err);
      }

      if (runLoadRepository === true) {
        loadRepositoryList(jQuery, this);
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

  addRepository(jQuery);

});

function parsingAuthinfoOnGitConfig(callback) {
  fs.readFile(getUserHome() + "/.gitconfig", {encoding: "utf-8"}, function (err, data) {
    if (err) {
      return callback(err);
    }

    var nameStrOnConfig = data.match(/name[ \t]*=[ \t]*[a-zA-Z0-9]+\n/);
    if (nameStrOnConfig === null) {
      return callback("Check Your name on gitconfig(path: ~/.gitconfig)");
    }

    var configuredName = nameStrOnConfig[0].split("=")[1].replace(" ", "").replace(/\n/, "");
    return callback(null, configuredName);
  });
}

function inputAuthorInfo(authorName) {
  jQuery("#inputAuthorInfoModal").modal("hide");
  jQuery("#editAuthorInfoModal").modal("hide");
  if (authorName === null) {

  }

  step(
      function getHomeGitConfig() {
        parsingAuthinfoOnGitConfig(this);
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

        author = authorName;
        loadRepositoryList(jQuery, function (err) {
          if (err) {
            alert(err);
          }
        });
      }
  );

}

function triggerEditAuthorInfoEvent(jQuery) {
  jQuery("div.setInfo button").on('click', function () {
          jQuery("#editAuthorInfoModal").modal();
  });
}

function triggerInputAuthorInfoEvent(jQuery) {
  jQuery("#inputAuthorInfoModal div.modal-footer button[type='submit']").on('click', function () {
    inputAuthorName = jQuery("#inputAuthorInfoModal div.modal-body form input").val();
    inputAuthorInfo(inputAuthorName);
  });
}

function triggerEditAuthorInfoModalEvent(jQuery) {
  jQuery("#editAuthorInfoModal div.modal-footer button[type='submit']").on('click', function () {

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
          inputAuthorInfo(editedAuthorName);

        }
      );
  });
}

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
          return callback(null, true);
        }
      }
      );
}

function loadRepositoryList(jQuery, callback) {
  step(
      function() {
        repoListDb.find({}, this);
      }, function displayRepositoryList(err, docs) {
        if (err) {
          return callback(err);
        }

        //기존 dirList class모두 지우자.
        jQuery("div.well ul.nav-list li.dirList").remove();

        //insert repository element and trigger display and  delete event
        for (var i = 0, li = docs.length; i < li; i++) {
          var liElement = "<li class='dirList' style='display: -webkit-inline-box;'><a href='#' value='" + docs[i].path + "'><i class='icon-book'></i>" + docs[i].name 
    + "</a><button class='btn btn-mini'><i class='icon-minus'></i></button></li>";
          jQuery("div.well ul.nav-list li.divider").before(liElement);

          triggerDiplasyLogOnRepositoryEvenet(jQuery, docs[i].path, docs[i].name);
          triggerDeleteRepositoryEvenet(jQuery, docs[i].path, docs[i].name);
        }
        return callback(null);   
      }
  );
}

function triggerDiplasyLogOnRepositoryEvenet(jQuery, gitDirPath, name) {
  jQuery("a[value='" + gitDirPath + "']").on('click', function () {
    jQuery("#addressbar li").remove();
    jQuery("#addressbar").append("<li>" + name + "</li>");

    console.log('llllll:' , author);
    jQuery("div.row table.table tbody tr").remove();
    logFetcher.developLog(gitDirPath, author, function (err, logArr) {
      if (err) {
        console.log('display log err', err);
      }

      if (logArr.length === 0) {
        jQuery("#myLog").append("<li><h3>Empty log</h3></li>");
      }

      for (var i = 0, li = logArr.length; i < li; i++) {
        var trElement = "<tr><td>"+ logArr[i].hash + "</td><td>" + logArr[i].message + "</td><td>" + logArr[i].date + "</td></tr>";
        jQuery("div.row table.table tbody").append(trElement);
      }
    });
  });
}

function triggerDeleteRepositoryEvenet(jQuery, value, name) {
  jQuery("a[value='" + value + "']").next().on('click', function () {
    //delete data on db;
    repoListDb.find({'name' : name} , function (err, docs) {
      if (err) {
        console.log(err);
      }
      if (docs.length == 0) {
        return null;
      }
      
      step(
        function () {
          var group = this.group();

          for (var i = 0, li = docs.length; i < li; i++) {
            repoListDb.remove({_id: docs[i]._id}, {}, group());
          }
        }, function (err, datas) {
          if (err) {
            console.log('Delete err', err);
          }
          
          loadRepositoryList(jQuery, function (err) {
          });
        }
        );
    });
  });
}

function addRepository(jQuery) {
  jQuery("#addRepo").on('click', function () {
    jQuery("#addRepoInput").click();
    jQuery("#addRepoInput").on('change', function () {
      var fileList = jQuery(this).val().split(/;/);
      var gitDirPath = fetchAbsolutePath(fileList);
      var isGitDir = false;
      
      fs.readdir(gitDirPath, function (err, files) {
        for (var i =0, li=files.length; i < li;i++) {
          if (".git" === files[i]) {
            isGitDir = true;
            break;
          }
        }

        if (isGitDir === true) {
          //해당 목록에 추가
          var dirSplit = gitDirPath.split("/");
          var dirName = dirSplit[dirSplit.length - 1];
          var gitDirPathInfo = {
            name : dirName,
            path : gitDirPath
          };

          repoListDb.find({"path": gitDirPath}, function (err, docs) {
            if (err) {
              console.log('err', err);
            }

            if (docs.length === 0) {
              repoListDb.insert(gitDirPathInfo, function (err, newDoc) {
                if (err) {
                  console.log(err);
                }

                loadRepositoryList(jQuery, function (err) {
                });
              });
            }
          });
        } else {
          alert("This Directory is not git repository. Can't find .git!");
        }
      });

    });
  });
}


function fetchAbsolutePath(fileList) {
 var path = null;

 if (fileList.length < 1) {
  return path;
 }
 
 for (var i = 0, li = fileList.length; i < li; i++) {
   var matchResult = fileList[i].match(/\.git/);
   if (matchResult != null) {
    path = fileList[i].substring(0, matchResult.index - 1);
    return path;
   }
 }

 return path;
}

function getUserHome() {
  return process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;
}

