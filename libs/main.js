var badgeCountLoadingText = '.';

var setup = function () {
  
}

var getBacklog = function () {
  return backloglib({
    spaceId: localStorage.getItem('spaceId'),
    userId: localStorage.getItem('userId'),
    password: localStorage.getItem('password')
  });
};

var countMessage = function () {
};

var updateBadgeLoading = function () {
  badgeCountLoadingText = badgeCountLoadingText == '.' ? '..' : 
                          badgeCountLoadingText == '..' ? '...' : '.';
  chrome.browserAction.setBadgeBackgroundColor({color:[190, 190, 190, 255]});
  chrome.browserAction.setBadgeText({text:badgeCountLoadingText});
};

var updateBadge = function() {
  
  badgeCountLoadingText = '';
  
  updateBadgeCountLoading();
  
  var timer = setInterval(updateBadgeCountLoading(), 1000);
  
  try {
    var count = countIssue();
    if (count > 0) {
      chrome.browserAction.setBadgeBackgroundColor({color: [208, 0, 24, 255]});
      chrome.browserAction.setBadgeText({text: count.toString()});
    } else if (count == 0) {
      chrome.browserAction.setBadgeText({text: ''});
    }
  } catch (e) {
    chrome.browserAction.setBadgeBackgroundColor({color:[190, 190, 190, 255]});
    chrome.browserAction.setBadgeText({text:"?"});
    console.log(e);
  }
  
  // Loading Clear
  clearInterval(timer);
};

var checkComment = function() {
  var backlog = getBacklog();
  var projects, users, issues = [], comments;
  var getIssue = false;
  var projectNo = 0, ownId = 0;

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
        var prevTime = new Date(localStorage.getItem('prevTime'));
        var updated_on_min = prevTime.getFullYear().toString() + prevTime.getMonth().toString() + prevTime.getDate().toString();
        localStorage.setItem('prevTime', prevTime.toString());
        issues = backlog.findIssue(i, ownId, updated_on_min, function(issues) {
          console.log(issues);
          for (var j = 0, len2 = issues.length; j < len2; j++) {
            // we have to request so much, so we need to set intervals
            setTimeout(function(){
              backlog.getComments(issues[i].id, function(comments){
                // TODO: save comments
                var commentLength = localStorage.getItem('comment:length') || 0;
                for (var l = 0, len3 = comments.length; l < len3; l++) {
                  localStorage.setItem('comment:'+(i+commentLength), comments[i]);
                }
              });
            }, 1000*i);
          }
        });
      }
    }
  }, 500);
};

