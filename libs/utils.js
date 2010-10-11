var development = true;

var getBacklog = function () {
  return backloglib({
    spaceId: localStorage.getItem('spaceId'),
    userId: localStorage.getItem('userId'),
    password: localStorage.getItem('password')
  });
};

var openTab = function(url) {
  if (url.match(/^www/i)) {
    url = "http://" + url;
  }
  window.open(url);
};

var findTab = function(url, callback) {
  chrome.tabs.getAllInWindow(undefined, function(tabs) {
    for (var i = 0, tab; tab = tabs[i]; i++) {
      if (tab.url && tab.url.substr(0, url.length) == url) {
        callback(tab);
        return;
      }
    }
    callback(null);
  });
};

var formatNum = function(keta, num) {
  var src = new String(num);
  var cnt = keta - src.length;
  if (cnt <= 0) return src;
  while (cnt-- > 0) src = "0" + src; return src;
};

var getComments = function(isInit) {

  if (!(localStorage.getItem('userId') &&
        localStorage.getItem('password') &&
        localStorage.getItem('spaceId'))) {
    return;
  }
  
  var updated_on_min = "";
  var lastChecked;
  var backlog = getBacklog();
  var haveGotUsers = 0;
  var ownId = localStorage.getItem('user:'+localStorage.getItem('userId')) || 0;
  var issueIds = [];
  var commentIds = [];
  var newComments = [];
  
  if (!isInit) {
    lastChecked = new Date(JSON.parse(localStorage.getItem('lastChecked')));
    updated_on_min = lastChecked.getFullYear().toString()
      + formatNum(2, (lastChecked.getMonth()+1).toString())
      + formatNum(2, lastChecked.getDate().toString());
  }
  
  backlog.getProjects(function(projects) {
    if (development) console.log(projects);
    for (var i = 0, leni = projects.length; i < leni; i++) {
      localStorage.setItem('project:'+projects[i].id, JSON.stringify(projects[i]));

      if (isInit) {
        backlog.getUsers(projects[i].id, function(users) {
          //console.log(users);
          for (var j = 0, lenj = users.length; j < lenj; j++) {
            if (users[j].name === localStorage.getItem('userId')) {
              ownId = users[j].id;
            }
            // get icon
            localStorage.setItem('user:'+users[j].name, users[j].id);
            getUserIcon(users[j])();
          }

          // if we've got all user information of every project, start find issues of the user.
          if (++haveGotUsers >= projects.length) {
            for (var k = 0, lenk = projects.length; k < lenk; k++) {
              backlog.findIssue(projects[k].id, ownId, updated_on_min, function(issues) {
                if (development) console.log(issues);
                for (var l = 0, lenl = issues.length; l < lenl; l++) {
                  localStorage.setItem('issue:'+issues[l].id, JSON.stringify(issues[l]));
                  issueIds.push(issues[l].id.toString());
                  // we should set interval per request, because requests are so many.
                  setTimeout(getIssueComments(issues[l], l===lenl-1 ), 5000*l);
                }
              });
            }
            localStorage.setItem('lastChecked', JSON.stringify(new Date().toString()));
          }
        });
        
      } else {
        for (var k = 0, lenk = projects.length; k < lenk; k++) {
          backlog.findIssue(projects[k].id, ownId, updated_on_min, function(issues) {
            if (development) console.log(issues);
            for (var l = 0, lenl = issues.length; l < lenl; l++) {
              localStorage.setItem('issue:'+issues[l].id, JSON.stringify(issues[l]));
              issueIds.push(issues[l].id.toString());
              // we should set interval per request, because requests are so many.
              setTimeout(getIssueComments(issues[l], l===lenl-1 ), 5000*l);
            }
          });
        }
        localStorage.setItem('lastChecked', JSON.stringify(new Date().toString()));
      }
    }
  });

  // コールバックが呼ばれるよりも先にループがまわって、インデックスがインクリメントされ、
  // 目的の変数にアクセスできなくなるので、関数で issue を束縛する
  var getIssueComments = function(issue, store) {
    return function() {
      backlog.getComments(issue.id, function(comments){
        if (development) console.log(comments);
        for (var i = 0, len = comments.length; i < len; i++) {
          comments[i].issueId = issue.id;
          localStorage.setItem('comment:'+(comments[i].id), JSON.stringify(comments[i]));
          commentIds.push(comments[i].id);

          var updated_on = comments[i].updated_on;
          updated_on = new Date(updated_on.slice(0,4), // year
                                parseInt(updated_on.slice(4,6), 10)-1, // month
                                updated_on.slice(6,8), // day
                                updated_on.slice(8,10), // hour
                                updated_on.slice(10,12), // min
                                updated_on.slice(12,14)); // sec

          if (!localStorage.getItem('user:' + comments[i].created_user.name)) {
            backlog.getUser(comments[i].created_user.id, function(user) {
              localStorage.setItem('user:'+comments[i].created_user.name, JSON.stringify(user));
              getUserIcon(user);
            });
          }
            
          if (updated_on > lastChecked) {
            newComments.push(comments[i].id);
          }
        }

        if (store) {
          // save issue id index and comment id index
          localStorage.setItem('issueIds', JSON.stringify(issueIds));
          localStorage.setItem('commentIds', JSON.stringify(commentIds));
          if (newComments.length > 0) {
            chrome.extension.sendRequest({ newComments: newComments });
            // update badge count
            chrome.browserAction.setBadgeText({ text: newComments.length.toString() });
          }
        }
      });
    };
  };

  var getUserIcon = function(user) {
    return function() {
      backlog.getUserIcon(user.id, function(icon) {
        if (development) console.log(icon);
        localStorage.setItem('icon:'+user.name, JSON.stringify(icon));
      });
    };
  };
  
};

var sendComment = function(issueKey, comment, callback) {
  var backlog = getBacklog();
  backlog.updateIssue(issueKey, comment, callback);
};
