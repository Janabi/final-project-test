'use strict';
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
                if (element.data_type === 'image'){
                    let animalTemplate = $("#image").html();
                    let showHtml = Mustache.render(animalTemplate, element);
                    $('.main-load').append(showHtml);

                } else if (element.data_type === 'video') {
                    let animalTemplate = $("#video").html();
                    let showHtml = Mustache.render(animalTemplate, element);
                    $('.main-load').append(showHtml);
                }
                
            });
        },
        error: function (jqXHR, textStatus, err) {
            alert('text status ' + textStatus + ', err ' + err)
        }
    })
})

$('.main-load section:eq(0)').hide();


for (let i=0; i < 10; i++){
    $('.showUpdate:eq('+i+')').click(function(){
        $('.content:eq('+i+')').fadeToggle(200);
    });
    $('.close:eq('+i+')').click(function(){
        $('.content:eq('+i+')').fadeOut(200);
    })
}

for (let i=0; i < 10; i++){
    $('.destroy:eq('+i+')').click(function(){
        $('.delete-content:eq('+i+')').fadeToggle(200);
    });
    $('.close-delete:eq('+i+')').click(function(){
        $('.delete-content:eq('+i+')').fadeOut(200);
    })
    $('.no:eq('+i+')').click(function(){
        $('.delete-content:eq('+i+')').fadeOut(200);
    })
}