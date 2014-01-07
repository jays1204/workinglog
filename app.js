var fs = require('fs');
var gitDirPath = "";
var author = "jays";
var spawn = require('child_process').spawn;
var clog = console.log;
var workingDirPath = __dirname;
var authorLog = "";

//var spawnGitLog = spawn("git log --since=1.weeks --author="+ author + " --graph --pretty=format:'%Cred%h%Creset -%C(yellow)%d%Creset %s     %Cgreen(%cr) %C(bold blue)<%an>%Creset' --abbrev-commit --decorate");
var spawnGitLog = spawn("git", ["log"], [{cwd : workingDirPath}]);
spawnGitLog.stdout.on('data', function (data) {
  authorLog += data;
});

spawnGitLog.stderr.on('data', function (data) {
  clog('stderr: ' + data);
});

spawnGitLog.on('close', function (code) {
  console.log(authorLog);
  console.log('exit : ' + code);
});
