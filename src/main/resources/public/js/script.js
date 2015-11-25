/**
 * Created by Kaila on 11/22/2015.
 */

$(document).ready(function() {
    var file;
    var $spinner    = $("#spinner");
    var $upload_xml = $("#upload-xml");
    var $file_text  = $("#file input[type=text]");
    var $file       = $("#file input[type=file]");

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
        var $this = $(this);
        var isUpload = $this.data("upload");
        if (isUpload && !$this.hasClass("disabled")) {
            var data = new FormData();
            data.append("file", file);
            upload(data);
        } else if (!isUpload) {
            clearTreemap();
        }
    });
});

function upload(data) {
    $.ajax({
        url: 'upload',
        type: 'POST',
        data: data,
        cache: false,
        dataType: 'json',
        processData: false,
        contentType: false,
        beforeSend: function() {
            $("#upload-xml").hide();
            $("#spinner").show();
            toggleFileInput(false);
        },
        complete: function() {
            $("#spinner").hide();
            toggleUploadButton(false);
        },
        success: function(response) {
            //var count = 0;
            //for (var i = 0; i < response.children.length; i++) {
            //    count += response.children[i].children.length;
            //}
            //console.log("parsed " + count + " tracks");
            renderTreemap(response);
        },
        error: function() {
            console.log("ERROR");
        }
    });
}

function clearTreemap() {
    $("#treemap-container").slideUp(options.animationTime, function() {
        $("#treemap").empty();
        toggleUploadButton(true);
    });
}

function toggleUploadButton(toggleUpload) {
    $("#upload-xml i").text(toggleUpload ? "open_in_browser" : "replay");
    $("#upload-xml").data("upload", toggleUpload).tooltip(toggleUpload ? "disable" : "enable").show();
    if (toggleUpload) {
        toggleFileInput(true);
    }
}

function toggleFileInput(toggleFile) {
    if (toggleFile) {
        $("#file .btn").removeClass("disabled").find("input").val("");
        $("#file input[type=text]").removeAttr("disabled").val("");
        $("#upload-xml").addClass("disabled");
    } else {
        $("#file .btn").addClass("disabled");
        $("#file input[type=text]").attr("disabled", "disabled").removeClass("valid");
    }
}
