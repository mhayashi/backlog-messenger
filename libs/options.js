(function () {
  var loadOptions = function () {
    $('input[name=spaceId]').val(localStorage.getItem('spaceId'));
    $('input[name=userId]').val(localStorage.getItem('userId'));
    $('input[name=password]').val(localStorage.getItem('password'));
    $('input[name=interval]').val(localStorage.getItem('refreshInterval'));
  };

  var saveOptions = function () {
    localStorage.setItem('spaceId', $('input[name=spaceId]').val());
    localStorage.setItem('userId', $('input[name=userId]').val());
    localStorage.setItem('password', $('input[name=password]').val());
    localStorage.setItem('refreshInterval', $('input[name=interval]').val());

    $('#message').text('Saved!');
    $('#message').fadeOut('slow');
    chrome.extension.getBackgroundPage().refresh(true);
  };

  $('button#save').click(saveOptions);
  loadOptions();
})();
