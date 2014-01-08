global.$ = $;

var fs = require('fs');
var path = require('path');
var shell = require('nw.gui').Shell;
var step = require('step');
var Datastore = require('nedb');
var path = require('path')
var db = new Datastore({ filename: path.join(require('nw.gui').App.dataPath, 'list.db') });
var logFetcher = require('./fetchGitLog.js');
var author = "jays";

var workingDirPath = "";
var logWithoutFeature = "";
var sinceDate = "2014-01-01";
var untilDate = "2014-01-08";

$(document).ready(function() {
  //init setting
  var jQuery = $;
  db.loadDatabase();


  loadRepositoryList(jQuery, function (err) {
  });

  addRepository(jQuery);

});

function loadRepositoryList(jQuery, callback) {
  step(
      function getAuthorName() {
        db.findOne({'author' : true}, this);
      }, function findRepositoryList(err, doc) {
        if (err) {
          return callback(err);
        }
        //author이름 없으면 입력 받고 저장.

        db.find({}, this);
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
    db.find({'name' : name} , function (err, docs) {
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
            db.remove({_id: docs[i]._id}, {}, group());
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

          db.find({"path": gitDirPath}, function (err, docs) {
            if (err) {
              console.log('err', err);
            }

            if (docs.length === 0) {
              db.insert(gitDirPathInfo, function (err, newDoc) {
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


