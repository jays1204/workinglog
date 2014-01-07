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

$(document).ready(function() {
  var jQuery = $;
  
  addRepository(jQuery);

  jQuery("#delRepo").on('click', function () {
    jQuery("#delRepoInput").click();
    jQuery("#delRepoInput").change(function () {
      var fileList = jQuery(this).val().split(/;/);
      var gitDirPath = fetchAbsolutePath(fileList);
    });
  });

});

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
          fs.writeFile();
        } else {
          //alert 이 디렉토리는 git dir이 아니거나 git root dir이 아닙니다. .git을 찾을 수 없습니다.
        }
        
        fetchDevelopLog(gitDirPath);
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

function fetchDevelopLog(gitDirPath) {
  var spawnGitLog = spawn("git", ["log", "--author=" + author, "--pretty=format:{\"message\": \"%s\", \"date\": \"%ad\"}"], [{cwd : gitDirPath}]);
  spawnGitLog.stdout.on('data', function (data) {
    developLog += data;
  });

  spawnGitLog.stderr.on('data', function (data) {
    console.log('Err: ' + data);
  });

  spawnGitLog.on('close', function (code) {
    var developLogArr = logInfoToJson(developLog);

    console.log(developLogArr);
    console.log('exit : ' + code);
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

  if (logArr.length > 0) {
    for (var i=0, li = logArr.length; i < li; i++) {
      logArr[i].replace(/'/, '');
      logArr[i] = JSON.parse(logArr[i]);
    }

    return logArr;
  } else {
    return null;
  }
}
