var logFetcher = require('./fetchGitLog.js');
var repositories = require('./repositories.js');
var step = require('step'); 
var author = global.settings.author;
var repoListDb = global.settings.repoListDb;
var alertMsg = global.settings.alertMsg;

function triggerDisplasyLogOnRepositoryEvent(jQuery, gitDirPath, name) {
  jQuery("a[value='" + gitDirPath + "']").on('click', function () {
    jQuery("#addressbar li p").remove();
    jQuery("#addressbar li").prepend("<p>" + name + "</p>");

    jQuery("div.row table.table tbody tr").remove();
    logFetcher.developLog(gitDirPath, author, function (err, logArr) {
      if (err) {
        //alertMsg('Fetch log ERR: ' + err);
        console.log(err);
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

function triggerDeleteRepositoryEvent(jQuery, value, name) {
  jQuery("a[value='" + value + "']").next().on('click', function () {
    repositories.deleteRepository(value, name, function (err) {
      if (err) {
        //alertMsg("Delete Repository ERR: " + err);
        console.log(err);
        return;
      }

      jQuery("a[value='" + value + "']").parent().remove();
    });
  });
}

function triggerAddRepositoryEvent(jQuery) {
  jQuery("#addRepo").on('click', function () {
    jQuery("#addRepoInput").click();
    jQuery("#addRepoInput").on('change', function () {
      var fileList = jQuery(this).val().split(/;/);
      repositories.insertRepository(fileList, function (err, dirInfo) {
        if (err) {
        //  alertMsg("Add Repository ERR: " + err);
        console.log('add Repo', err);
          return;
        }
        var liElement = "<li class='dirList' style='display: -webkit-inline-box;'><a href='#' value='" + dirInfo.path + "'><i class='icon-book'></i>" + dirInfo.name 
        + "</a><button class='btn btn-mini'><i class='icon-minus'></i></button></li>";

        jQuery("div.well ul.nav-list li.divider").before(liElement);
        triggerDisplasyLogOnRepositoryEvent(jQuery, dirInfo.path, dirInfo.name);
      });
    });
  });
}

function triggerDisplayRepositoryListEvent(jQuery, docs) {
  jQuery("div.well ul.nav-list li.dirList").remove();

  //insert repository element and trigger display and  delete event
  for (var i = 0, li = docs.length; i < li; i++) {
    var liElement = "<li class='dirList' style='display: -webkit-inline-box;'><a href='#' value='" + docs[i].path + "'><i class='icon-book'></i>" + docs[i].name 
      + "</a><button class='btn btn-mini'><i class='icon-minus'></i></button></li>";
    jQuery("div.well ul.nav-list li.divider").before(liElement);

    triggerDisplasyLogOnRepositoryEvent(jQuery, docs[i].path, docs[i].name);
    triggerDeleteRepositoryEvent(jQuery, docs[i].path, docs[i].name);
  }
}


module.exports.displasyLogOnRepository = triggerDisplasyLogOnRepositoryEvent;
module.exports.deleteRepository = triggerDeleteRepositoryEvent;
module.exports.addRepository = triggerAddRepositoryEvent;
module.exports.displayRepositoryList = triggerDisplayRepositoryListEvent;
