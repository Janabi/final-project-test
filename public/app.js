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
            console.log(data);
            data.forEach(element => {
                if (element.data_type === 'image'){
                    let animalTemplate = $("#image").html();
                    let showHtml = Mustache.render(animalTemplate, element);
                    $('.main').append(showHtml);

                } else if (element.data_type === 'video') {
                    let animalTemplate = $("#video").html();
                    let showHtml = Mustache.render(animalTemplate, element);
                    $('.main').append(showHtml);
                }
                
            });
        },
        error: function (jqXHR, textStatus, err) {
            alert('text status ' + textStatus + ', err ' + err)
        }
    })
})