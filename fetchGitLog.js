var spawn = require('child_process').spawn;

function fetchDevelopLog(gitDirPath, author, callback) {
  var logs = "";
  var spawnGitLog = spawn("git", ["log", "--author=" + author, "--pretty=format:{\"message\": \"%s\", \"date\": \"%ad\", \"hash\": \"%h\"}"], {cwd : gitDirPath});

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

function fetchLogForOneWeek(gitDirPath, author, callback) {
  var logs = "";
  var spawnGitLogForTeamMeeting = spawn("git", ["log", "--since=1.weeks", "--author=" + author, "--pretty=format:{\"message\": \"%s\", \"date\": \"%ad\", \"hash\": \"%h\"}"], {cwd : workingDirPath});

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

  //FIXME 가끔가다 JSON Parse err occured. 
  if (logArr.length > 0) {
    var resultArr = [];
    for (var i=0, li = logArr.length; i < li; i++) {
      logArr[i].replace(/'/, '');
      resultArr[i] = JSON.parse(logArr[i]);
    }

    return resultArr;
  } else {
    return null;
  }
}

module.exports.developLog = fetchDevelopLog;
module.exports.logForOneWeek = fetchLogForOneWeek;
