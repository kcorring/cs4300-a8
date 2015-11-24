/**
 * Created by Kaila on 11/22/2015.
 */
//var div, treemap;
//var color = d3.scale.category20c();

$(document).ready(function() {
    var file;
    //div = d3.select("#treemap").append("div")
    //    .style("position", "relative")
    //    .style("width", (width + margin.left + margin.right) + "px")
    //    .style("height", (height + margin.top + margin.bottom) + "px")
    //    .style("left", margin.left + "px")
    //    .style("top", margin.top + "px");

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
                beforeSend: function() {
                  console.log("do initialization here");
                },
                complete: function() {
                    console.log("do complete here");
                },
                success: function(response) {
                    //var count = 0;
                    //for (var i = 0; i < response.children.length; i++) {
                    //    count += response.children[i].children.length;
                    //}
                    //console.log("parsed " + count + " tracks");
                    root = response;
                    console.log(response);
                    $("#treemap").empty();
                    treemap = d3.layout.treemap()
                        .size([width, height])
                        .sticky(true)
                        .value(function(d) { return d.playCount; });
                    div = d3.select("#treemap").append("div")
                        .style("position", "relative")
                        .style("width", (width + margin.left + margin.right) + "px")
                        .style("height", (height + margin.top + margin.bottom) + "px")
                        .style("left", margin.left + "px")
                        .style("top", margin.top + "px");

                    div.datum(root).selectAll(".node")
                        .data(treemap.nodes)
                        .enter().append("div")
                        .attr("class", "node")
                        .call(position)
                        .style("background", function(d) { return d['children'] ? color(d.name) : null; })
                        .text(function(d) { return d['children'] ? null : d.name; })
                        .on("click", function(d) {
                            console.log(d.albumName + " (" + d.albumID + ") " + d.playCount);
                        });

                    setChanger();
                },
                error: function() {
                    console.log("ERROR");
                }
            });
        }
    });

    function setChanger() {
        $("input[name=mode]").unbind().change(function () {
            var value = this.value === "count"
                ? function() { return 1; }
                : function(d) { return d.playCount; };
            d3.selectAll(".node")
                .data(treemap.value(value).nodes)
                .transition()
                .duration(1500)
                .call(position);
        });
    }


});