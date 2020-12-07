'use strict';
console.log('hhhhhhhhhhhhh');
$('.loadMore').click(function(e) {
    e.preventDefault();
    let x = $('#title').val();
    
    $.ajax({
        type: 'POST',
        url: '/loadMore',
        data: {
            searchResult: x,
            
        },
        contentType:"application/x-www-form-urlencoded",
        success: function(data) {
            data.forEach(element => {
                let animalTemplate = $("#main").html();
                let showHtml = Mustache.render(animalTemplate, element);
                $('.main').append(showHtml);
                
            });
        },
        error: function (jqXHR, textStatus, err) {
            alert('text status ' + textStatus + ', err ' + err)
        }
    })
})