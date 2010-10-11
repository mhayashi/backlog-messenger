var backloglib = function(spec, my) {

  var that;
  my = my || {};

  if (!spec.spaceId || !spec.userId || !spec.password) {
    throw('Some option is invalid. (space: ' + spec.speceid + ' username: ' + spec.userid + ' password: ' + spec.password);
  }
  
  my.defaults = {
    url: 'https://' + spec.spaceId + '.backlog.jp/XML-RPC',
    username: spec.userId,
    password: spec.password,
    type: 'POST',
    dataType: 'xml',
    error: function (XMLHttpRequest, textStatus, errorThrown) {
      console.log(XMLHttpRequest);
      throw(textStatus + ':' + errorThrown);
    }
  };
  //console.log(spec);
  $.ajaxSetup(my.defaults);

  my.parseDataSolo = function(data) {
    var result = {};
    $(data).find('struct member').each(function(){
      result[$(this).find('name').text()] = $(this).find('value').text();
    });
    return result;
  };
  
  my.parseData = function(data) {
    var results = [];
    $(data).find('struct').each(function(){
      var result = {};
      $(this).find('member').each(function(){
        result[$(this).find('name').text()] = $(this).find('value').text();
      });
      results.push(result);
    });
    return results;
  };

  my.parseIssues = function(data) {
    var results = [];
    $(data).find('methodresponse params param value array data value').each(function(){
      var result = {};
      $(this).children('struct').children('member').each(function(){
        var name = $(this).children('name').text();
        if (name === 'summary') {
          result[name] = $(this).children('value').text();
        } else if (name === 'id') {
          if (result['summary']) {
            result[name] = parseInt($(this).children('value').text(), 10);
          }
        } else if (name === 'key') {
          result[name] = $(this).children('value').text();
        } else if (name === 'url') {
          result[name] = $(this).children('value').text();
        } else if (name === 'updated_on') {
          result[name] = $(this).children('value').text();
        }
      });
      if (result['summary']) {
        results.push(result);
      }
    });
    return results;
  };

  my.parseComments = function(data) {
    var results = [];
    $(data).find('methodresponse params param value array data value').each(function(){
      var result = {};
      $(this).children('struct').children('member').each(function(){
        var name = $(this).children('name').text();
        if (name === 'created_user') {
          result[name] = {
            id: $(this).find('value struct member value').eq(0).text(),
            name: $(this).find('value struct member value').eq(1).text()
          };
        } else if (name === 'created_on') {
          result[name] = $(this).children('value').text();
        } else if (name === 'content') {
          var text = $(this).children('value').text();
          text = text.replace(/\r\n/g, "<br />");
          text = text.replace(/(\n|\r)/g, "<br />");
          result[name] = text;
        } else if (name === 'updated_on') {
          result[name] = $(this).children('value').text();
        } else if (name === 'id' && ($(this).closest('data value struct').length === 1)) {
          result[name] = $(this).children('value').text();
        }
      });
      if (result['created_user']) {
        //console.log(result);
        results.push(result);
      }
    });
    return results;
  };

  var ownId = spec.userId;
  that = {
    ownId: ownId
  };
  
  var getProjects = function(callback) {
    var rpc = new XMLRPCMessage('backlog.getProjects');
    $.ajax({
      data: rpc.xml(),
      success: function(data, status, xhr) {
        callback(my.parseData(data));
      }
    });
  };
  that.getProjects = getProjects;
  
  var getUsers = function(projectId, callback) {
    projectId = parseInt(projectId, 10);
    if (!projectId) {
      throw('Project ID is ' + projectId);
    }
    var rpc = new XMLRPCMessage('backlog.getUsers');
    rpc.addParameter(projectId);
    $.ajax({
      data: rpc.xml(),
      success: function(data, status, xhr) {
        callback(my.parseData(data));
      }
    });
  };
  that.getUsers = getUsers;

  var findIssue = function(projectId, assignerId, updated_on_min, callback) {
    projectId = parseInt(projectId, 10);
    if (!projectId) {
      throw('Project ID is ' + projectId);
    }
    assignerId = parseInt(assignerId, 10);
    if (!assignerId) {
      throw('Assigner ID is ' + assignerId);
    }
    var rpc = new XMLRPCMessage('backlog.findIssue');
    if (updated_on_min) {
      rpc.addParameter({ projectId: projectId,
                         assignerId: assignerId,
                         updated_on_min: updated_on_min });
    } else {
      rpc.addParameter({ projectId: projectId, assignerId: assignerId });
    }
    $.ajax({
      data: rpc.xml(),
      success: function(data, status, xhr) {
        callback(my.parseIssues(data));
      }
    });
  };
  that.findIssue = findIssue;
  
  var getComments = function(issueId, callback) {
    issueId = parseInt(issueId, 10);
    if (!issueId) {
      throw('Issue ID is ' + issueId);
    }
    var rpc = new XMLRPCMessage('backlog.getComments');
    rpc.addParameter(issueId);
    $.ajax({
      data: rpc.xml(),
      success: function(data, status, xhr) {
        var comments = my.parseComments(data);
        if (comments) {
          callback(comments);
        }
      }
    });
  };
  that.getComments = getComments;

  var updateIssue = function(issueKey, comment, callback) {
    if (development) console.log(issueKey, comment);
    if (!issueKey) {
      throw('Issue key is ' + issueKey);
    }
    var rpc = new XMLRPCMessage('backlog.updateIssue');
    rpc.addParameter({ key: issueKey,
                       comment: comment });
    $.ajax({
      data: rpc.xml(),
      success: function(data, status, xhr) {
        callback(my.parseIssues(data)[0]);
      }
    });
  };
  that.updateIssue = updateIssue;
  
  var getUser = function(userId, callback) {
    userId = parseInt(userId, 10);
    if (!userId) {
      throw('User ID is ' + userId);
    }
    var rpc = new XMLRPCMessage('backlog.getUser');
    rpc.addParameter(userId);
    $.ajax({
      data: rpc.xml(),
      success: function(data, status, xhr) {
        callback(my.parseData(data));
      }
    });
  };
  that.getUser = getUser;

  var getUserIcon = function(userId, callback) {
    userId = parseInt(userId, 10);
    if (!userId) {
      throw('User ID is ' + userId);
    }
    var rpc = new XMLRPCMessage('backlog.getUserIcon');
    rpc.addParameter(userId);
    $.ajax({
      data: rpc.xml(),
      success: function(data, status, xhr) {
        callback(my.parseDataSolo(data));
      }
    });
  };
  that.getUserIcon = getUserIcon;
  
  return that;
};

