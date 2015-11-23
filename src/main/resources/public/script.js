/**
 * Created by Kaila on 11/22/2015.
 */
$(document).ready(function() {
    var file;

    $("#upload-xml").addClass("disabled");

    $("#file input[type=text]").change(function () {
       if ($(this).val() != "") {
           $("#upload-xml").removeClass("disabled");
       } else {
           $("#upload-xml").addClass("disabled");
       }
    });

    $("#file input[type=file]").change(function () {
        file = this.files[0];

    });

    $("#upload-xml").click(function () {
        if (!$(this).hasClass("disabled")) {
            var data = new FormData();
            data.append("file", file);

            $.ajax({
                url: 'upload',
                type: 'POST',
                data: data,
                cache: false,
                dataType: 'json', // change when returing json
                processData: false,
                contentType: false,
                success: function(response) {
                    console.log("parsed " + response.length + " tracks");
                },
                error: function() {
                    console.log("ERROR");
                }
            });
        }
    });


});