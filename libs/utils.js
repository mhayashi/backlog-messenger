var getBacklog = function () {
  return backloglib({
    spaceId: localStorage.getItem('spaceId'),
    userId: localStorage.getItem('userId'),
    password: localStorage.getItem('password')
  });
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
