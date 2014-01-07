global.$ = $;

$(document).ready(function() {
  var jQuery = $;

  jQuery("#addRepo").on('click', function () {
    console.log('clicked!!!!!!!!!!!!!!!!!!!!');
    jQuery("#addRepoInput").click();
    jQuery("#addRepoInput").on('change', function () {
      console.log('aaaaaaaaaaaaaaaaaa!!!!!!!!!!!!!!!!!!!!!!!!!!');
      var fileList = jQuery(this).val().split(/;/);
      var gitDirPath = fetchAbsolutePath(fileList);

      console.log('git Dir Path: ', gitDirPath);
    });
  });
  jQuery("#delRepo").on('click', function () {
    jQuery("#delRepoInput").click();
    jQuery("#delRepoInput").change(function () {
      var fileList = jQuery(this).val().split(/;/);
      var gitDirPath = fetchAbsolutePath(fileList);
    });
  });


  
});


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
