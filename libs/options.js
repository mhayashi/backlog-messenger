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
  
  // var backlog = getBacklog();
  // var projects, users, issues, comments;
  // var getIssue = false;
  // var projectNo = 0, idNo = 0;

  // projects = backlog.getProjects(function(projects) {
  //   console.log(projects);
  //   localStorage.setItem('projects:length', len);
  //   for (var i = 0, len = projects.length; i < len; i++) {
  //     localStorage.setItem('projects:'+projects[i].id, JSON.stringify(projects[i]));

  //     users = backlog.getUsers(projects[i].id, function(users) {
  //       console.log(users);
  //     });
  //   }
  //   getIssue = true;
  //   // TODO: create user list (name, id) and save it to localStorage
  //   // users
  //   // TODO: get user's own id (not name)
  //   // idNo = users[userId];
  //   idNo = 1;
  // });

  // // waiting getIssue turns on
  // setInterval(function() {
  //   if (getIssue) {
  //     for (var i = 0, len = projects.length; i < len; i++) {
  //       issues = backlog.findIssue(i, idNo, function(issues) {
  //         console.log(issues);
  //         for (var j = 0, len = projects.length; j < len; j++) {
  //           for (var k in issues) {
  //             // we have to request so much, so we need to set intervals
  //             setTimeout(function(){
  //               backlog.getComments(issues[i].id, function(comments){
  //                 // TODO: save comments
  //                 // tough work...
  //               });
  //             }, 1000*i);
  //           }
  //         };
  //       });
  //     }
  //   }
  // }, 500);
};

restoreOptions();