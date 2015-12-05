/**
 * Created by Kaila on 11/22/2015.
 */
var all_tracks, group_data, treemap_data;
var scale_by_function = function(d) { return d.playCount; };
var group_by = 'albumID';
var min_play_count = 0;
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
                all_tracks = response;

                var promise = $.Deferred();
                sortDataBy(promise);

                promise.then(
                  function() {
                    // TODO : handle done (after tooltips added and treemap container slid down)
                  },
                  function () {
                    // TODO : handle error
                  },
                  function () {
                      $("#options > div:first-child").slideDown();
                    // TODO : handle notified (notified when map ready to show)
                  }
                );
            },
            error: function() {
                console.log("ERROR");
            }
        });
    }

});

function clearTreemap() {
    clearOptions();
    $("#treemap-container > div:first-child").slideUp(options.animationTime, function() {
        $("#treemap").empty();
        toggleUploadButton(true);
    });
}

function toggleUploadButton(toggleUpload) {
    if (toggleUpload) {
        toggleFileInput(true);
        $("#upload-xml span").removeClass("fa-close").addClass("fa-upload");
    } else {
        $("#upload-xml span").removeClass("fa-upload").addClass("fa-close");
    }
    $("#upload-xml").data("upload", toggleUpload).tooltip(toggleUpload ? "disable" : "enable").show();
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

function clearOptions() {
    $("#options > div:first-child").slideUp(options.animationTime, function () {
        $("#minPlays").val(0);
        $("#sbalbum").prop("checked", true);
        $("input[name=scaleBy]").prop("checked", true);

        scale_by_function = function(d) { return d.playCount; };
        min_play_count = 0;
        group_by = 'albumID';
    });
}
