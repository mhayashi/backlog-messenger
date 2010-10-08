var badgeCountLoadingText = '.';

function getBacklog() {
  return backloglib({
    spaceId: localStorage.getItem('spaceId'),
    userId: localStorage.getItem('userId'),
    password: localStorage.getItem('password')
  });
}

function countMessage() {
}

function updateBadgeLoading() {
  badgeCountLoadingText = badgeCountLoadingText == '.' ? '..' : 
                          badgeCountLoadingText == '..' ? '...' : '.';
  chrome.browserAction.setBadgeBackgroundColor({color:[190, 190, 190, 255]});
  chrome.browserAction.setBadgeText({text:badgeCountLoadingText});
}

function updateBadge() {
  
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
}

function findTab(url, callback) {
  chrome.tabs.getAllInWindow(undefined, function(tabs) {
    for (var i = 0, tab; tab = tabs[i]; i++) {
      if (tab.url && tab.url.substr(0, url.length) == url) {
        callback(tab);
        return;
      }
    }
    callback(null);
  });
}
