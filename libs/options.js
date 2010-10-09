var restoreOptions = function () {
  $('input[name=spaceId]').val(localStorage.getItem('spaceId'));
  $('input[name=userId]').val(localStorage.getItem('userId'));
  $('input[name=password]').val(localStorage.getItem('password'));
};

var saveOptions = function () {

  localStorage.setItem('spaceId', $('input[name=spaceId]').val());
  localStorage.setItem('userId', $('input[name=userId]').val());
  localStorage.setItem('password', $('input[name=password]').val());

  // get all comments
  
  var backlog = getBacklog();
  var projects, users, issues = [], comments;
  var getIssue = false;
  var projectNo = 0, ownId = 0;
  var commentIds = [];
  
  projects = backlog.getProjects(function(projects) {
    console.log(projects);
    localStorage.setItem('project:length', len);
    for (var i = 0, len = projects.length; i < len; i++) {
      localStorage.setItem('project:'+projects[i].id, JSON.stringify(projects[i]));

      users = backlog.getUsers(projects[i].id, function(users) {
        console.log(users);
      });
    }
    getIssue = true;
    for (i = 0, len = users.length; j < len; j++) {
      localStorage.setItem('user:'+users[j].name, users[j].id);
      if (users[j] === localStorage.getItem('userId')) {
        ownId = users[j];
      }
    }
  });

  // waiting getIssue turns on
  var timer = setInterval(function() {
    if (!getIssue) {
      return;
    } else {
      clearInterval(timer);
      for (var i = 0, len1 = projects.length; i < len1; i++) {
        issues = backlog.findIssue(i, ownId, "", function(issues) {
          console.log(issues);
          for (var j = 0, len2 = issues.length; j < len2; j++) {
            // we have to request so much, so we need to set intervals
            setTimeout(function(){
              backlog.getComments(issues[i].id, function(comments){
                // TODO: save comments
                for (var l = 0, len3 = comments.length; l < len3; l++) {
                  localStorage.setItem('comment:'+(comments[i].id), comments[i]);
                  commentIds.push(comments[i].id);
                }
              });
            }, 1000*i);
          }
        });
      }
      localStorage.setItem('commentIds', commentIds.toString());
      localStorage.setItem('prevTime', JSON.stringify(new Date().toString()));
    }
  }, 500);
};

restoreOptions();