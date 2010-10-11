$(function() {
  var model = {
    comments: [],
    init: function() {
      var commentids = JSON.parse(localStorage.getItem('commentIds'));
      commentids.sort();
      var end = commentids.length;
      var begin = end-100 < 0 ? 0 : end-100;
      this.getComments(commentids.slice(begin, end));
      view.update();
    },
    setComment: function(comments) {
      this.comments = comments;
      view.update();
    },
    addComments: function(commentids) {
      var _comments = this.getComments(commentids);
      view.update(_comments);
    },
    getComments: function(commentids) {
      if (!commentids) {
        return null;
      }
      var _comments = [];
      for (var i = 0, len = commentids.length; i < len; i++) {
        var c = JSON.parse(localStorage.getItem('comment:'+commentids[i]));
        c.issue = JSON.parse(localStorage.getItem('issue:'+c.issueId));
        console.log(c);
        this.comments.push(c);
        _comments.push(c);
      }
      return _comments;
    }
  };
  
  var view = {
    $editor: $('#editor'),
    $comments: $('#comments'),
    update: function(comments) {
      this.initEditor();
      if (comments) {
        this.appendComments(comments);            
      } else {
        view.$comments.html('');
        this.appendComments(model.comments);
      }
    },
    initEditor: function(){
      var issueIds = JSON.parse(localStorage.getItem('issueIds'));
      $('#issue').remove('option');
      for (var i = 0, len = issueIds.length; i < len; i++) {
        var issue = JSON.parse(localStorage.getItem('issue:'+issueIds[i]));
        $('#issue').append(
          $('<option>')
          .attr('value', issue.key)
          .text(issue.key + ' (' + issue.summary + ')'));
      }
    },
    appendComments: function(comments) {
      $.each(comments, function(i, comment) {
        var $c = view.createCommentElement(comment);
        $c.hide();
        view.$comments.prepend($c);
        $c.animate(
          {height: "toggle", opacity: "toggle"},
          {duration: "fast", easing: "linear"}
        );
      });        
    },
    getIcon: function(username) {
      return JSON.parse(localStorage.getItem('icon:' + username));
    },
    createCommentElement: function(comment) {
      var icon = this.getIcon(comment.created_user.name);
      var spaceId = localStorage.getItem('spaceId');
      var link = '';
      if (comment.issue) {
        link = '<a href="'+comment.issue.url+'#comment-'+comment.id+'" target="_blank">'+comment.issue.key+' ('+comment.issue.summary+')</a>';
      }
      return $('<div>')
        .attr('class', 'comment')
        .append(
          $('<div>')
            .attr('class', 'comment_icon')
            .append(
              $('<img>')
                .attr('src', 'data:'+icon.content_type+';base64,'+icon.data)
            )
        )
        .append(
          $('<div>')
            .attr('class', 'comment_header')
            .append(
              $('<div>')
                .attr('class', 'comment_created_user')
                .text(comment.created_user.name)
            )
            .append(
              $('<div>')
                .attr('class', 'comment_link')
                .html(link)
            )
        )
        .append(
          $('<div>')
            .attr('class', 'comment_content')
            .html(comment.content)
        )
        .append(
          $('<div>')
            .attr('class', 'comment_footer')
            .append(
              $('<span>')
                .attr('class', 'comment_updated_on')
                .text(comment.updated_on.replace(/(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, "$1-$2-$3 $4:$5:$6"))
            )
        );
    }
  };

  var controller = {
    init: function() {

      if (!(localStorage.getItem('userId') &&
            localStorage.getItem('password') &&
            localStorage.getItem('spaceId'))) {
        openTab(chrome.extension.getURL('options.html'));
        return;
      }
      
      $('#options').click(function() {
        openTab(chrome.extension.getURL('options.html'));
      });
      $('#refresh').click(function() {
        chrome.extension.getBackgroundPage().refresh();
      });
      $('#send').click(function() {
        var textarea = $('#editor textarea');
        if (textarea.val()) {
          sendComment($('#issue').val(), textarea.val(), function(issue) {
            chrome.extension.getBackgroundPage().refresh();
            textarea.val('');
          });
        }
      });

      model.init();
      
      chrome.browserAction.setBadgeText({ text: ''});

      chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
        if (request.newComments) {
          model.addComments(request.newComments);
          chrome.browserAction.setBadgeText({ text: '' });
        }
      });
    }
  };

  controller.init();
 
});
