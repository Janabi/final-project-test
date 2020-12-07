'use strict';
console.log('hhhhhhhhhhhhh');
$('.loadMore').submit(function(e) {
    e.preventDefault();
    let x = $('#title').val();
    
    $.ajax({
        type: 'POST',
        url: '/search',
        data: {
            searchResult: x,
            
        },
        contentType:"application/x-www-form-urlencoded",
        success: function(data) {
            console.log(data);
            $('.main').html(data.form);
        },
        error: function (jqXHR, textStatus, err) {
            alert('text status ' + textStatus + ', err ' + err)
        }
    })
})