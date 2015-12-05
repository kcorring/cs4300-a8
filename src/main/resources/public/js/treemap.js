var treemap;
var color = d3.scale.category20c();
var UNKNOWN = "Unknown";

var treemap_div = d3.select("#treemap")
    .style("position", "relative")
    .style("margin", "auto");

function position() {
    this.style("left", function(d) { return d.x + "px"; })
        .style("top", function(d) { return d.y + "px"; })
        .style("width", function(d) { return Math.max(0, d.dx - 1) + "px"; })
        .style("height", function(d) { return Math.max(0, d.dy - 1) + "px"; });
}

function renderTreemap(promise) {
    width = $("#treemap-container").width();
    height = width / 2;

    treemap_div
        .style("height", height + "px")
        .style("width", width + "px")
        .style("margin", "auto");

    treemap = d3.layout.treemap()
        .size([width, height])
        .value(scale_by_function);

    treemap_div.datum(treemap_data).selectAll(".node")
        .data(treemap.nodes)
        .enter().append("div")
        .attr("class", "node")
        .call(position)
        .style("background", function(d) { return d.children ? color(d.name) : null; })
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
                .attr("class", "node tooltipped")
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
        .duration(1500)
        .call(position)
        .style("background", function(d) { return d.children ? color(d.name) : null; })
        .text(function(d) { return d.children ? null : d.name; })
        .attr("text-anchor", "middle");

    removeTooltips();
    addTooltips();
});

$(window).resize(function () {
    $("#treemap").empty();
    renderTreemap($.Deferred());
});

function timeMe(promise, title) {
    var start = $.now();
    promise.done(function() {
        console.log(title.concat("\t".concat(String($.now() - start))));
    })
}