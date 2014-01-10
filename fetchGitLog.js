var spawn = require('child_process').spawn;
var step = require('step');

//depreacted
function _fetchDevelopLog(gitDirPath, author, callback) {
  var logs = "";
  var spawnGitLog = spawn("git", ["log", "--author=" + author, "--pretty=format:{\"message\":\"%s\",\"date\":\"%ad\",\"hash\":\"%h\"}"], {cwd : gitDirPath});

  spawnGitLog.stdout.on('data', function (data) {
    logs += data;
  });

  spawnGitLog.stderr.on('data', function (data) {
    console.log('Err: ' + data);
    return callback(data);
  });

  spawnGitLog.on('close', function (code) {
    var logsArr = null;
    logsArr = logInfoToJson(logs);

    return callback(null, logsArr);
  });
}

// handling with double quote, quote is so hard. So multiple call git commnad 
function fetchDevelopLog(gitDirPath, author, callback) {
  var logMsg;
  var logDate;
  var logHash;

  step(
    function msg() {
      fetchDevelopMsg(gitDirPath, author, this);
    },
    function date(err, logMsgArr) {
      if (err) {
        return callback(err);
      }

      logMsg = logMsgArr;
      fetchDevelopDate(gitDirPath, author, this);
    },
    function hash(err, logDateArr) {
      if (err) {
        return callback(err);
      }

      logDate = logDateArr;
      fetchDevelopHash(gitDirPath, author, this);
    },
    function done(err, logHashArr) {
      if (err) {
        return callback(err);
      }

      logHash = logHashArr;
      
      var msgLength = logMsg.length;
      if (logHash.length === msgLength && msgLength === logHash.length) {
        var resultArr = [];
        
        for (var i = 0, li = msgLength; i < li; i ++) {
          resultArr[i] = {
            "message" : logMsg[i],
            "date" : logDate[i],
            "hash" : logHash[i]
          };
        }

        //3개를 조합해서 하나로 만들자.
        //logInfoToJson();
        return callback(null, resultArr);
      } else {
        return callback("fetch Log ERR : Match list count");
      }
    }
      );
}

function fetchDevelopMsg(gitDirPath, author, callback) {
  var logMsg = "";
  var logMsgArr;
  var spawnGitLog = spawn("git", ["log", "--author=" + author, "--pretty=format:%s"], {cwd : gitDirPath});

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
      console.log(i, logMsgArr[i]);
    }

    return callback(null, logMsgArr);
  });
}

function fetchDevelopDate(gitDirPath, author, callback) {
  var logDate = "";
  var logDateArr;
  var spawnGitLogDate = spawn("git", ["log", "--author=" + author, "--pretty=format:%ad"], {cwd : gitDirPath});

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

function fetchDevelopHash(gitDirPath, author, callback) {
  var logHash = "";
  var logHashArr;
  var spawnGitLogHash = spawn("git", ["log", "--author=" + author, "--pretty=format:%h"], {cwd : gitDirPath});

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
  var spawnGitLogForTeamMeeting = spawn("git", ["log", "--since=1.weeks", "--author=" + author, "--pretty=format:{\"message\":\"%s\",\"date\":\"%ad\",\"hash\":\"%h\"}"], {cwd : workingDirPath});

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

  //FIXME 중간 중간 쿼테이션이 계속 들어가거나 해서 에러난다.
  //아무래도 message따로 date 따로 받아서 합치는게 나을거 같다. 
  if (logArr.length > 0) {
    var resultArr = [];
    for (var i=0, li = logArr.length; i < li; i++) {
      /*
      var quoteInquoteStr = logArr[i].match(/:\"[a-zA-Z0-9가-힣, *\"[a-zA-Z0-9가-힣, ]*\"]*\"/);
      console.log(logArr[i]);
      if (quoteInquoteStr != null) {  
        console.log(quoteInquoteStr);
        var strWitoutQinq = quoteInquoteStr[0].replace(/\"/g, "").replace(/:/, ':"');
        console.log(strWitoutQinq);
        logArr[i] = logArr[i].replace(quoteInquoteStr, strWitoutQinq);
      }
      */
      console.log(i, logArr[i]);
      resultArr[i] = JSON.parse(logArr[i]);
    }

    return resultArr;
  } else {
    return null;
  }
}

module.exports.developLog = fetchDevelopLog;
module.exports.logForOneWeek = fetchLogForOneWeek;
