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

//default desc
function sortAndMergeLogList(repositoryInfoArr, isDesc) {
  if (repositoryInfoArr.length === 0) {
    return "ERR : ";
  }
  var concatArr = []; 

  for (var i = 0, li = repositoryInfoArr.length; i < li; i++) {
    for (var j = 0, lj = repositoryInfoArr[i].logArr.length; j < lj; j++) {
      repositoryInfoArr[i].logArr[j].repositoryName = repositoryInfoArr[i].repositoryName;
    }
    concatArr = concatArr.concat(repositoryInfoArr[i].logArr);
  }
 
  //sort by option
  if (isDesc === true) {
    concatArr.sort(function (a,b) {
      a = new Date(a.date);
      b = new Date(b.date);

      return a > b ? -1 : a < b ? 1 : 0;
    });
  } else {
    concatArr.sort(function (a,b) {
      a = new Date(a.date);
      b = new Date(b.date);

      return a < b ? -1 : a > b ? 1 : 0;
    });
  }

  return concatArr;
}

function createTableHeadRowElement(log) {
  var tableHeadRowElement = "<tr>";
  for (var key in log) {
    tableHeadRowElement += ("<th>" + key + "</th>");
  }
  tableHeadRowElement += "</tr>";

  return tableHeadRowElement;
}

function createTableBodyRowElement(log) {
  var tableBodyRowElement = "<tr>";

  for (var key in log) {
    tableBodyRowElement += ("<td>" + log[key] + "</td>");
  }
  tableBodyRowElement += "</tr>";

  return tableBodyRowElement;
}


module.exports.parsingAuthinfoOnGitConfig = parsingAuthinfoOnGitConfig;
module.exports.getUserHome = getUserHome;
module.exports.fetchAbsolutePath = fetchAbsolutePath;
module.exports.sortAndMergeLogList = sortAndMergeLogList;
module.exports.createTableHeadRowElement = createTableHeadRowElement;
module.exports.createTableBodyRowElement = createTableBodyRowElement;
