var restoreOptions = function () {
  $('input[name=spaceId]').val(localStorage.getItem('spaceId'));
  $('input[name=userId]').val(localStorage.getItem('userId'));
  $('input[name=password]').val(localStorage.getItem('password'));
};

var saveOptions = function () {

  var spaceId = $('input[name=spaceId]').val();
  var userId = $('input[name=userId]').val();
  var password = $('input[name=password]').val();
  
  localStorage.setItem('spaceId', spaceId);
  localStorage.setItem('userId', userId);
  localStorage.setItem('password', password);

  // get all comments
  
  var backlog = getBacklog();
  var projects = [], issues = [];
  var projects_len = 0;
  var getIssue = 0;
  var projectNo = 0, ownId = 0;
  var commentIds = [];

  projects = backlog.getProjects(function(projects) {
    console.log(projects);
    for (var i = 0, leni = projects.length; i < leni; i++) {
      localStorage.setItem('project:'+projects[i].id, JSON.stringify(projects[i]));
      backlog.getUsers(projects[i].id, function(users) {
        //console.log(users);
        for (var j = 0, lenj = users.length; j < lenj; j++) {
          localStorage.setItem('user:'+users[j].name, users[j].id);
          if (users[j].name === userId) {
            ownId = users[j].id;
          }
        }
        if (++getIssue >= projects.length) {
          for (var k = 0, lenk = projects.length; k < lenk; k++) {
            backlog.findIssue(projects[k].id, ownId, "", function(_issues) {
              console.log(_issues);
              //issues.concat(_issues);
              issues = _issues;
              for (var l = 0, lenl = issues.length; l < lenl; l++) {
                // we have to request so much, so we need to set intervals
                setTimeout(createTimeoutFunction(issues[l], l===lenl-1 ), 5000*l);
                // setTimeout(function(){
                //   console.log(issues);
                //   backlog.getComments(issues[l].id, function(comments){
                //     // TODO: save comments
                //     for (var m = 0, lenm = comments.length; m < lenm; m++) {
                //       localStorage.setItem('comment:'+(comments[m].id), comments[m]);
                //       commentIds.push(comments[m].id);
                //     }
                //   });
                // }, 1000*i);
              }
            });
          }
          localStorage.setItem('prevTime', JSON.stringify(new Date().toString()));
        }
      });
    }
  });

  // ループがコールバックを呼ぶより先にまわってしまうので関数で issue を閉じ込める
  var createTimeoutFunction = function(issue, store) {
    return function() {
      backlog.getComments(issue.id, function(comments){
        // TODO: save comments
        for (var m = 0, lenm = comments.length; m < lenm; m++) {
          localStorage.setItem('comment:'+(comments[m].id), JSON.stringify(comments[m]));
          commentIds.push(comments[m].id);
        }
        if (store) {
          localStorage.setItem('commentIds', JSON.stringify(commentIds));
        }
      });
    };
  };
};

restoreOptions();
