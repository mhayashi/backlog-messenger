$(function() {
    // TODO dummyデータ
    var adddata = [
        {
            created_user: 'agata',
            created_on: '20050606115644',
            content: 'コメントです3',
            updated_on: '20050606115644'
        },
        {
            created_user: 'hayashi',
            created_on: '20050606115644',
            content: 'コメントです4',
            updated_on: '20050606115644'
        }
    ];
    
    var model = {
        comments: [],
        init: function() {
            var commentids = JSON.parse(localStorage.getItem('commentIds'));
            for (var i in commentids) {
                var c = JSON.parse(localStorage.getItem('comment:'+commentids[i]));
                console.log(c);
                this.comments.push(c);
            }
            view.update();
        },
        setComment: function(comments) {
            this.comments = comments;
            view.update();
        },
        addComments: function(comments) {
            this.comments.concat(comments);
            view.update(comments);
        }
    };
    
    var view = {
        $comments: $('#comments'),
        update: function(comments) {
            if (comments) {
                this.appendComments(comments);            
            } else {
                view.$comments.html('');
                this.appendComments(model.comments);
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
        createCommentElement: function(comment) {
            return $('<div>')
            .append(
                $('<img>')
                .attr('class', 'comment_icon')
                .attr('src', 'img/' + comment.created_user + '.jpg')
            )
            .append(
                $('<div>')
                .attr('class', 'comment_header')
                .append(
                    $('<span>')
                    .attr('class', 'comment_created_user')
                    .text(comment.created_user)
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
            model.init();
            // TODO テスト用
            $('#add').click(function() {
                model.addComments(adddata);
            });
        }
    };
    
    controller.init();
});
