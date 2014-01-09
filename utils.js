var fs = require('fs');

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

module.exports.parsingAuthinfoOnGitConfig = parsingAuthinfoOnGitConfig;
module.exports.getUserHome = getUserHome;
module.exports.fetchAbsolutePath = fetchAbsolutePath;
