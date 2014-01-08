global.$ = $;

var fs = require('fs');
var author = "jays";
var spawn = require('child_process').spawn;
var workingDirPath = "";
var developLog = "";
var logWithoutFeature = "";
var sinceDate = "2014-01-01";
var untilDate = "2014-01-08";
var abar = require('address_bar');
var folder_view = require('folder_view');
var path = require('path');
var shell = require('nw.gui').Shell;
var step = require('step');
var Datastore = require('nedb');
var path = require('path')
var db = new Datastore({ filename: path.join(require('nw.gui').App.dataPath, 'list.db') });

$(document).ready(function() {
  //init setting
  var jQuery = $;
  db.loadDatabase();
  loadRepositoryList(jQuery, function (err) {
  });

  addRepository(jQuery);

});

function loadRepositoryList(jQuery, callback) {
  db.find({}, function (err, docs) {
    if (err) {
      return callback(err);
    }

    //기존 dirList class모두 지우자.
    jQuery("div.well ul.nav-list li.dirList").remove();

    for (var i = 0, li = docs.length; i < li; i++) {
      var liElement = "<li class='dirList'><a href='#' value='" + docs[i].path + "'><i class='icon-book'></i>" + docs[i].name 
    + "<button class='btn btn-mini'><i class='icon-minus'></i></button></a></li>";
      jQuery("div.well ul.nav-list li.divider").before(liElement);
      // 삭제 버튼에 이벤트 달기
      // a[value=]이용해서 달자.
    triggerDeleteRepositoryEvenet(jQuery, docs[i].path, docs[i].name);
    }
    return callback(null);   
  });
}

function triggerDiplasyLogOnRepositoryEvenet(jQuery, gitDirPath, name) {

  fetchDevelopLog(gitDirPath, function (err, logArr) {
    if (err) {
      console.log('display log err', err);
    }

    console.log('view', logArr);
  });
}

function triggerDeleteRepositoryEvenet(jQuery, value, name) {
  jQuery("a[value='" + value + "'] i.icon-minus").on('click', function () {
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
          //alert 이 디렉토리는 git dir이 아니거나 git root dir이 아닙니다. .git을 찾을 수 없습니다.
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


var spawnDevelopLog = spawn("git", ["log", "--first-parent", "--author=" + author, "--pretty=format:{\"message\": \"%s\", \"date\": \"%ad\"}"], [{cwd: workingDirPath}]);
var spawnGitLogWithDuration = spawn("git", ["log", "--since=" + sinceDate, "--until=" + untilDate, "--author=" + author, "--pretty=format:{\"message\": \"%s\", \"date\": \"%ad\"}"], [{cwd : workingDirPath}]);
var spawnGitLogForTeamMeeting = spawn("git", ["log", "--since=1.weeks", "--author=" + author, "--pretty=format:{\"message\": \"%s\", \"date\": \"%ad\"}"], [{cwd : workingDirPath}]);

function fetchDevelopLog(gitDirPath, callback) {
  var spawnGitLog = spawn("git", ["log", "--author=" + author, "--pretty=format:{\"message\": \"%s\", \"date\": \"%ad\"}"], [{cwd : gitDirPath}]);
  spawnGitLog.stdout.on('data', function (data) {
    developLog += data;
  });

  spawnGitLog.stderr.on('data', function (data) {
    console.log('Err: ' + data);
    return callback(data);
  });

  spawnGitLog.on('close', function (code) {
    var developLogArr = logInfoToJson(developLog);

    return callback(null, developLogArr);
  });
}

function fetchLogWithoutFeatureBranch() {
  spawnDevelopLog.stdout.on('data', function (data) {
    logWithoutFeature += data;
  });

  spawnDevelopLog.stderr.on('data', function (data) {
    console.log('Err: ' + data);
  });

  spawnDevelopLog.on('close', function (code) {
    var logWithoutFeatureArr = logInfoToJson(logWithoutFeature);

    console.log(logWithoutFeatureArr);
    console.log('exit : ' + code);
  });

}

function logInfoToJson(logStr) {
  var logArr = logStr.split(/\n/);

  //FIXME 가끔가다 JSON Parse err occured. 
  if (logArr.length > 0) {
    var resultArr = [];
    for (var i=0, li = logArr.length; i < li; i++) {
      logArr[i].replace(/'/, '');
      console.log('errrr', logArr[i]);
      resultArr[i] = JSON.parse(logArr[i]);
    }

    return resultArr;
  } else {
    return null;
  }
}
