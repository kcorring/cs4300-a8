var treemap;
var color = d3.scale.category20c();

var width=900;
var height=500;

var treemap_div = d3.select("#treemap")
    .style("position", "relative")
    .style("height", height + "px")
    .style("width", width + "px")
    .style("margin", "auto");

function position() {
    this.style("left", function(d) { return d.x + "px"; })
        .style("top", function(d) { return d.y + "px"; })
        .style("width", function(d) { return Math.max(0, d.dx - 1) + "px"; })
        .style("height", function(d) { return Math.max(0, d.dy - 1) + "px"; });
}

function renderTreemap(data) {
    treemap = d3.layout.treemap()
        .size([width, height])
        .sticky(true)
        .value(function(d) { return d.playCount; });

    treemap_div.datum(data).selectAll(".node")
        .data(treemap.nodes)
        .enter().append("div")
        .attr("class", "node")
        .call(position)
        .style("background", function(d) { return d.children ? color(d.name) : null; })
        .text(function(d) { return d.children ? null : d.name; })
        .attr("text-anchor", "middle");

    d3.selectAll(".node").filter(function (d) {
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

    $("#treemap-container").slideDown();
    $(".tooltipped").tooltip();
    setChanger();
}

function createTooltip(data) {
    return "<div><ul>" +
        "<li><b>Song Title:</b> " + data.name + "</li>" +
        "<li><b>Artist:</b> " + data.artist + "</li>" +
        "<li><b>Album:</b> " + data.albumName + " (" + data.year + ")</li>" +
        "<li><b>Genre:</b> " + data.genre + "</li>" +
        "<li><b>Play Count:</b> " + data.playCount + "</li>" +
        "</ul></div>";
}

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