var treemap;
var color = d3.scale.category20c();
var UNKNOWN = "Unknown";
var TRANSITION_LENGTH = 1500;
var width, height;

var treemap_div = d3.select("#treemap")
    .style("position", "relative")
    .style("margin", "auto");
var no_songs_div = $("#no-songs")
    .css({"position" : "relative",
        "margin" : "auto"});

function position() {
    this.style("left", function(d) { return d.x + "px"; })
        .style("top", function(d) { return d.y + "px"; })
        .style("width", function(d) { return Math.max(0, d.dx - 1) + "px"; })
        .style("height", function(d) { return Math.max(0, d.dy - 1) + "px"; });
}

function toggleTreemapAndMessage() {
    if (show_treemap) {
        console.log("toggling hide treemap");
        $("#no-songs")
            .height(height)
            .width(width)
            .css("visibility", 0)
            .show()
            .fadeTo(TRANSITION_LENGTH, 1);
        $("#treemap")
            .css("visibility", 1)
            .fadeTo(TRANSITION_LENGTH, 0)
            .hide();
    } else {
        console.log("toggling show treemap");
        $("#no-songs")
            .css("visibility", 1)
            .fadeTo(TRANSITION_LENGTH, 0)
            .hide();
        $("#treemap")
            .height(height)
            .width(width)
            .css("visibility", 0)
            .show()
            .fadeTo(TRANSITION_LENGTH, 1);
    }

    show_treemap = !show_treemap;

}

function renderTreemap(promise) {
    width = $("#treemap-container").width();
    height = width / 2;

    if (treemap_data.children.length == 0) {
        console.log("no-kids");
        if (show_treemap) {
            toggleTreemapAndMessage();
        } else {
            console.log("show treemap, no toggle");
            $("#no-songs")
                .height(height)
                .width(width)
                .show();
            $("#treemap")
                .css("visibility", 1)
                .hide();
            show_treemap = false;
        }
        promise.notify();
        $("#treemap-container > div:first-child").slideDown();
        promise.resolve();
        return;
    }

    if (!show_treemap) {
        toggleTreemapAndMessage();
    }

    treemap = d3.layout.treemap()
        .size([width, height])
        .value(scale_by_function);

    treemap_div.datum(treemap_data).selectAll(".node")
        .data(treemap.nodes)
        .enter().append("div")
        .attr("class", "node center-align")
        .call(position)
        .style("background", function(d) { return d.children ? generateColor(d.name) : null; })
        .text(function(d) { return d.children ? null : d.name; });

    promise.notify();

    addTooltips();
    $("#treemap-container > div:first-child").slideDown();
    promise.resolve();
}

function addTooltips() {
    treemap_div.selectAll(".node").filter(function (d) {
        if (!d.children) {
            d3.select(this)
                .attr("class", "node center-align tooltipped")
                .attr("data-toggle", "tooltip")
                .attr("data-placement", "top")
                .attr("data-html", true)
                .attr("data-title", function(d, i) {
                    return createTooltip(d);
                });
        }
    });
    $(".tooltipped").tooltip();
}

function removeTooltips() {
    $(".tooltipped").removeClass("tooltipped")
        .removeAttr("data-toggle data-placement data-html data-selector data-title")
        .tooltip('destroy');
}

function createTooltip(data) {
    var name = data.name || UNKNOWN;
    var artist = data.artist || UNKNOWN;
    var album = data.albumName || UNKNOWN;
    var year = data.year && data.year > 0 ? data.year : UNKNOWN;
    var genre = data.genre || UNKNOWN;
    var playCount = data.playCount && data.playCount > 0 ? data.playCount : 0;
    var unknown = album == UNKNOWN && year == UNKNOWN;
    return "<div><ul>" +
        "<li><b>Song Title:</b> " + name + "</li>" +
        "<li><b>Artist:</b> " + artist + "</li>" +
        (unknown ? "<li><b>Album:</b> " + UNKNOWN + "</li>" :
        "<li><b>Album:</b> " + album + " (" + year + ")</li>") +
        "<li><b>Genre:</b> " + genre + "</li>" +
        "<li><b>Play Count:</b> " + playCount + "</li>" +
        "</ul></div>";
}

$("#minPlays").change(function() {
    var promise = $.Deferred();
    //timeMe(promise, "min");
    min_play_count = $(this).val();
    var new_groups = [];
    var group, track;
    for (var i = 0; i < group_data.children.length; i++) {
        group = group_data.children[i];
        var new_children = [];
        for (var j = 0; j < group.children.length; j++) {
            track = group.children[j];
            if (track.playCount >= min_play_count) {
                new_children.push(track);
            }
        }
        if (new_children.length > 0) {
            new_groups.push({name : group.name, children : new_children});
        }
    }

    treemap_data = {children : new_groups};
    $("#treemap").empty();
    renderTreemap(promise);
});

$("input[name=groupBy]").change(function () {
    var group_by_val = $(this).val();
    if (group_by_val === 'album') {
        group_by = 'albumID';
    } else {
        group_by = group_by_val;
    }
    sortDataBy($.Deferred());
});

function sortDataBy(promise) {
    //timeMe(promise, "sort by");
    var parent = {children : []};
    var group = {children : []};
    var group_ids = [];
    var parent_ids = [];
    var index;
    $.each(all_tracks, function(i, track) {
        // put everything in the group
        addTrackToGroup(track, group_ids, group);
        // put only display in the parent
        if (track.playCount >= min_play_count) {
            addTrackToGroup(track, parent_ids, parent);
        }
    });

    treemap_data = parent;
    group_data = group;
    $("#treemap").empty();
    renderTreemap(promise);
}

function addTrackToGroup(track, ids, group) {
    var index = $.inArray(track[group_by], ids);
    if (index >= 0) {
        group.children[index].children.push(track);
    } else {
        ids.push(track[group_by]);
        group.children.push({name: track[group_by], children: [track]});
    }
}

$("input[name=scaleBy]").change(function () {
    scale_by_function = $(this).is(':checked')
        ? function(d) { return d.playCount; }
        : function() { return 1; };

    treemap_div.selectAll(".node")
        .data(treemap.value(scale_by_function).nodes)
        .transition()
        .duration(TRANSITION_LENGTH)
        .call(position)
        .style("background", function(d) { return d.children ? generateColor(d.name) : null; })
        .text(function(d) { return d.children ? null : d.name; });

    removeTooltips();
    addTooltips();
});

$(window).resize(function () {
    if (show_treemap) {
        $("#treemap").empty();
        renderTreemap($.Deferred());
    } else {
        width = $("#treemap-container").width();
        height = width / 2;
        $("#no-songs").animate({height: height, width: width});
    }
});

function timeMe(promise, title) {
    var start = $.now();
    promise.done(function() {
        console.log(title.concat("\t".concat(String($.now() - start))));
    })
}

var colors = {};

function generateColor(name) {
    if (name) {
        var color_name = String(name);
        var color = colors[color_name];
        if (color) {
            return color;
        } else {
            var hash = color_name.hashCode();
            color = "rgb(" + ((Math.abs(hash) % 200) + 55) + "," + (Math.abs((hash * 73) % 200) + 55) + "," + (Math.abs((hash * 13) % 200) + 55) + ")";
            colors[color_name] = color;
            return color;
        }
    }
}

// http://werxltd.com/wp/2010/05/13/javascript-implementation-of-javas-string-hashcode-method/
String.prototype.hashCode = function(){
    var hash = 0;
    if (this.length == 0) return hash;
    for (i = 0; i < this.length; i++) {
        char = this.charCodeAt(i);
        hash = ((hash<<5)-hash)+char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
}
