var logFetcher = require('./fetchGitLog.js');
var repositories = require('./repositories.js');
var utilLibs = require('./utils.js');
var step = require('step'); 
var author = global.settings.author;
var repoListDb = global.settings.repoListDb;
var authorInfoDb = global.settings.authorInfoDb;
var alertMsg = global.settings.alertMsg;

//display all my local git repository log list
function triggerDefaultDisplayLogEvent(jQuery, infoArr, sortOption) {
  removeRepositoryNameOnAddressBar(jQuery);
  jQuery("div.row table.table tbody tr").remove();

  if (infoArr.length === 0) {
    //err handling
  }
  
  step(
      function selectAuthorInfo() {
        authorInfoDb.findOne({'author' : true}, this);
      },
      function fetchLogList(err, doc) {
        if (err) {
          return err;
        }

        global.settings.selected = infoArr;
        var group = this.group();

        for (var i = 0, li = infoArr.length; i < li; i++) {
          logFetcher.developLog(infoArr[i], doc.authorName, group());
        }
    },
    function done(err, data) {
      if (err) {
        return err;
      }

      var result = utilLibs.sortAndMergeLogList(data, sortOption.desc);

      //insert table header element
      var tableHeadRowElement = utilLibs.createTableHeadRowElement(result[0]);
      jQuery("div.row table.table thead tr").remove();
      jQuery("div.row table.table thead").append(tableHeadRowElement);

      for (var i = 0, li = result.length; i < li; i++) {
        var trElement = utilLibs.createTableBodyRowElement(result[i]);
        jQuery("div.row table.table tbody").append(trElement);
      }
      return;
    }
      );
}

function removeRepositoryNameOnAddressBar(jQuery) {
    jQuery("#selectedProjectName p").remove();
}

function triggerDisplayLogOnSpecificRepositoryEvent(jQuery, gitDir) {
  jQuery("a[value='" + gitDir.path + "']").on('click', function () {
    global.settings.selected = [gitDir];

    removeRepositoryNameOnAddressBar(jQuery);
    jQuery("#selectedProjectName").prepend('<p><button type="button" class="btn btn-large btn-primary" disabled>' + gitDir.name + '</button></p>');

    renderSpecificRepositoryLog(jQuery, gitDir, {"desc" : true});
  });
}

function renderSpecificRepositoryLog(jQuery, gitDir, sortOption) {
  step(
      function selectAuthorInfo() {
        authorInfoDb.findOne({'author' : true}, this);
      },
      function fetchLog(err, doc) {
        if (err) {
          return err;
        }

        logFetcher.developLog(gitDir, doc.authorName, this);
      },
      function done(err, logInfo) {
        if (err) {
          //alertMsg('Fetch log ERR: ' + err);
          console.log(err);
        }

        if (logInfo.logArr.length === 0) {
          jQuery("#myLog").append("<li><h3>Empty log</h3></li>");
        }

        //insert table header element
        var tableHeadRowElement = utilLibs.createTableHeadRowElement(logInfo.logArr[0]);
        jQuery("div.row table.table thead tr").remove();
        jQuery("div.row table.table thead").append(tableHeadRowElement);
        jQuery("div.row table.table tbody tr").remove();

        logInfo.logArr = utilLibs.sortByOption(logInfo.logArr, sortOption.desc);

        for (var i = 0, li = logInfo.logArr.length; i < li; i++) {
          var trElement = utilLibs.createTableBodyRowElement(logInfo.logArr[i]);
          jQuery("div.row table.table tbody").append(trElement);
        }
      }
  );
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
        triggerDisplayLogOnSpecificRepositoryEvent(jQuery, dirInfo);
      });
    });
  });
}

function triggerDisplayRepositoryListEvent(jQuery, docs) {
  jQuery("div.well ul.nav-list li.dirList").remove();

  triggerDefaultDisplayLogEvent(jQuery, docs, {"desc": true});
  //insert repository element and trigger display and  delete event
  for (var i = 0, li = docs.length; i < li; i++) {
    var liElement = "<li class='dirList' style='display: -webkit-inline-box;'><a href='#' value='" + docs[i].path + "'><i class='icon-book'></i>" + docs[i].name 
      + "</a><button class='btn btn-mini'><i class='icon-minus'></i></button></li>";
    jQuery("div.well ul.nav-list li.divider").before(liElement);

    triggerDisplayLogOnSpecificRepositoryEvent(jQuery, docs[i]);
    triggerDeleteRepositoryEvent(jQuery, docs[i].path, docs[i].name);
  }
}

function triggerSortByDateEvent(jQuery) {
  jQuery("#addressbar div.btn-group ul.dropdown-menu li a[value=Desc]").on('click', function () {
    //sort by desc
    var selectedGitRepoItem = global.settings.selected;
    if (selectedGitRepoItem.length === 1) {
      renderSpecificRepositoryLog(jQuery, selectedGitRepoItem[0], {"desc" : true});
    } else {
      triggerDefaultDisplayLogEvent(jQuery, selectedGitRepoItem, {"desc": true});
    }
  });

  jQuery("#addressbar div.btn-group ul.dropdown-menu li a[value=Asc]").on('click', function () {
    var selectedGitRepoItem = global.settings.selected;
    if (selectedGitRepoItem.length === 1) {
      console.log('hihihi asc');
      renderSpecificRepositoryLog(jQuery, selectedGitRepoItem[0], {"desc" : false});
    } else {
      triggerDefaultDisplayLogEvent(jQuery, selectedGitRepoItem, {"desc": false});
    }

  });
}


module.exports.displasyLogOnSpecificRepository = triggerDisplayLogOnSpecificRepositoryEvent;
module.exports.deleteRepository = triggerDeleteRepositoryEvent;
module.exports.addRepository = triggerAddRepositoryEvent;
module.exports.displayRepositoryList = triggerDisplayRepositoryListEvent;

module.exports.sortByDate = triggerSortByDateEvent;
