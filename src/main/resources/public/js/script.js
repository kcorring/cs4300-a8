/**
 * Created by Kaila on 11/22/2015.
 */
var all_tracks, group_data, treemap_data;
var scale_by_function = function(d) { return d.playCount; };
var group_by = 'albumID';
var min_play_count = 0;
var show_treemap = false;

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
        if (!$(this).hasClass("disabled")) {
            var data = new FormData();
            data.append("file", file);
            upload(data);
        }
    });

    $.getJSON('sample', function(data) {
        all_tracks = data;
        sortDataBy();
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
                toggleFileInput(false);
                clearTreemap();
            },
            complete: function() {
                toggleFileInput(true);
            },
            success: function(response) {
                all_tracks = response;
                sortDataBy();
            },
            error: function() {
                $('#error-modal').openModal();
            }
        });
    }

    $('.modal-trigger').leanModal({
        dismissible: true, // Modal can be dismissed by clicking outside of the modal
        opacity: .5, // Opacity of modal background
        in_duration: 300, // Transition in duration
        out_duration: 200
    });

});

function clearTreemap() {
    show_treemap = false;

    $("#options > div:first-child").slideUp(TRANSITION_LENGTH, function () {
        $("#minPlays").val(0);
        $("#sbalbum").prop("checked", true);
        $("input[name=scaleBy]").prop("checked", true);

        scale_by_function = function(d) { return d.playCount; };
        min_play_count = 0;
        group_by = 'albumID';
    });

    $("#treemap-container > div:first-child").slideUp(TRANSITION_LENGTH, function() {
        $("#treemap").empty();
    });
}

function toggleFileInput(toggleFile) {
    if (toggleFile) {
        $("#file .btn").removeClass("disabled").find("input").val("");
        $("#file input[type=text]").removeAttr("disabled").val("");
        $("#upload-xml").addClass("disabled");
        $("#spinner").hide();
        $("#upload-xml").show();
    } else {
        $("#file .btn").addClass("disabled");
        $("#file input[type=text]").attr("disabled", "disabled").removeClass("valid");
        $("#spinner").show();
        $("#upload-xml").hide();
    }
}