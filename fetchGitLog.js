var spawn = require('child_process').spawn;
var step = require('step');
var utilLibs = require('./utils.js');

function fetchLogThisWeek(gitDir, author, callback) {
  var options = {
  };

  options.msgCmd = ["log", "--author=" + author, "--since=1.weeks", "--pretty=format:%s"];
  options.dateCmd = ["log", "--author=" + author, "--since=1.weeks", "--pretty=format:%ad"];
  options.hashCmd = ["log", "--author=" + author, "--since=1.weeks", "--pretty=format:%h"];
  
  fetchDevelopLog(gitDir, author, callback, options);
}

// handling with double quote, quote is so hard. So multiple call git commnad 
function fetchDevelopLog(gitDir, author, callback, options) {
  var logMsg;
  var logDate;
  var logHash;
  var gitDirPath = gitDir.path;

  if (options == null) {
    options = {
      msgCmd : null,
      dateCmd : null,
      hashCmd : null
    };
  }

  step(
    function msg() {
      fetchDevelopMsg(gitDirPath, author, this, options.msgCmd);
    },
    function date(err, logMsgArr) {
      if (err) {
        return callback(err);
      }

      logMsg = logMsgArr;
      fetchDevelopDate(gitDirPath, author, this, options.dateCmd);
    },
    function hash(err, logDateArr) {
      if (err) {
        return callback(err);
      }

      logDate = logDateArr;
      fetchDevelopHash(gitDirPath, author, this, options.hashCmd);
    },
    function done(err, logHashArr) {
      if (err) {
        return callback(err);
      }

      logHash = logHashArr;
      
      var msgLength = logMsg.length;
      if (logHash.length === msgLength && msgLength === logHash.length) {
        var resultArr = [];
        var today = new Date();

        for (var i = 0, li = msgLength; i < li; i ++) {
          var diffWeek = utilLibs.getDiffWeekWithToday(today, new Date(logDate[i]));
          resultArr[i] = {
            "message" : logMsg[i],
            "date" : logDate[i],
            "hash" : logHash[i],
            "diffWeek" : parseInt(diffWeek, 10)
          };
        }

        var result = {
          "repositoryName" : gitDir.name,
          "logArr" : resultArr
        };

        return callback(null, result);
      } else {
        return callback("fetch Log ERR : Match list count");
      }
    }
      );
}

function fetchDevelopMsg(gitDirPath, author, callback, msgOption) {
  var logMsg = "";
  var logMsgArr;
  var spawnGitLog = spawn("git", msgOption != null ? msgOption : ["log", "--author=" + author, "--pretty=format:%s"], {'cwd' : gitDirPath});

  spawnGitLog.stdout.on('data', function (data) {
    logMsg += data;
  });

  spawnGitLog.stderr.on('data', function (data) {
    console.log('Err: ' + data);
    return callback(data);
  });

  spawnGitLog.on('close', function (code) {
    logMsgArr = logMsg.split(/\n/);

    for (var i = 0, li = logMsgArr.length; i < li; i++) {
      logMsgArr[i] = logMsgArr[i].replace(/"/g, '\\"').replace(/'/g, "\\'");
    }

    return callback(null, logMsgArr);
  });
}

function fetchDevelopDate(gitDirPath, author, callback, dateOption) {
  var logDate = "";
  var logDateArr;
  var spawnGitLogDate = spawn("git", dateOption != null ? dateOption : ["log", "--author=" + author, "--pretty=format:%ad"], {'cwd' : gitDirPath});

  spawnGitLogDate.stdout.on('data', function (data) {
    logDate += data;
  });

  spawnGitLogDate.stderr.on('data', function (data) {
    console.log('Err: ' + data);
    return callback(data);
  });

  spawnGitLogDate.on('close', function (code) {
    logDateArr = logDate.split(/\n/);

    return callback(null, logDateArr);
  });
}

function fetchDevelopHash(gitDirPath, author, callback, hashOption) {
  var logHash = "";
  var logHashArr;
  var spawnGitLogHash = spawn("git", hashOption != null ? hashOption : ["log", "--author=" + author, "--pretty=format:%h"], {'cwd' : gitDirPath});

  spawnGitLogHash.stdout.on('data', function (data) {
    logHash += data;
  });

  spawnGitLogHash.stderr.on('data', function (data) {
    console.log('Err: ' + data);
    return callback(data);
  });

  spawnGitLogHash.on('close', function (code) {
    logHashArr = logHash.split(/\n/);
    return callback(null, logHashArr);
  });
}


function fetchLogForOneWeek(gitDirPath, author, callback) {
  var logs = "";
  var spawnGitLogForTeamMeeting = spawn("git", ["log", "--since=1.weeks", "--author=" + author, "--pretty=format:{\"message\":\"%s\",\"date\":\"%ad\",\"hash\":\"%h\"}"], {'cwd' : workingDirPath});

  spawnGitLogForTeamMeeting.stdout.on('data', function (data) {
    logs += data;
  });

  spawnGitLogForTeamMeeting.stderr.on('data', function (data) {
    console.log('Err: ' + data);
    return callback(data);
  });

  spawnGitLogForTeamMeeting.on('close', function (code) {
    var logsArr = null;
    logsArr = logInfoToJson(logs);

    return callback(null, logsArr);
  });
}

function logInfoToJson(logStr) {
  var logArr = logStr.split(/\n/);

  if (logArr.length > 0) {
    var resultArr = [];
    for (var i=0, li = logArr.length; i < li; i++) {
      resultArr[i] = JSON.parse(logArr[i]);
    }

    return resultArr;
  } else {
    return null;
  }
}

module.exports.developLog = fetchDevelopLog;
module.exports.logForOneWeek = fetchLogForOneWeek;
module.exports.thisWeekLog = fetchLogThisWeek;
