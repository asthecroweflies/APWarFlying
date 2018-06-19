//TODO: Create grid

var divWidth, divHeight;
var APToggled = 0;
var DroneToggled = 0;

$(document).ready(function() {
    console.log("loaded");
});

function gridData(xDim, yDim) {

    var data = new Array();
    var xpos = 1;
    var ypos = 1;
    var cellWidth = Math.floor(divWidth / xDim);
    var cellHeight = cellWidth;
    var click = 0;

    for (var row = 0; row < xDim; row++) {
        data.push( new Array() );
        
        for (var col = 0; col < yDim; col++) {
            data[row].push({
                x: xpos,
                y: ypos,
                width: cellWidth,
                height: cellHeight,
                click: click
            })
            xpos += cellWidth;
        }
        xpos = 1;
        ypos += cellHeight;
    }
    return data;
}

var craftGrid = function() {

    var xDim = $("#xDim").val();
    var yDim = $("#yDim").val();

    if ( ((xDim <= 0) || ((xDim % 5) != 0) ) ||
          (yDim <= 0) || ((yDim % 5) != 0) ) {
            alert("Dimensions must be > 0 & evenly divisible by 5.");
            return;
         }
    var gridArray = gridData(xDim, yDim);
    console.log(gridArray);

    var grid = d3.select("#grid")
        .append("svg")
        .attr("width", "750px")
        .attr("height", "750px");

    var row = grid.selectAll(".row")
        .data(gridArray)
        .enter().append("g")
        .attr("class", "row");

    var column = row.selectAll(".square")
        .data(function(d) { return d; })
        .enter().append("rect")
        .attr("class", "square")
        .attr("x", function(d) { return d.x; })
        .attr("y", function(d) { return d.y; })
        .attr("width", function(d) { return d.width; })
        .attr("height", function(d) { return d.height; })
        .style("fill", "#fff")
        .style("stroke", "#222")
        .on('click', function(d) {
            d.click++;
            d3.select(this).style("fill", "#23AC23");
        });
};

$("#toggleAP").click(function() {
    document.getElementById("toggleAP").attr("disabled", "disabled");
    document.getElementById("toggleDrone").removeAttribute("disabled");
    APToggled = (APToggled == 0) ? 1 : 0;
    if (APToggle == 1) {
        //var APButton = $()
    }
});

$("#toggleDrone").click(function() {
    document.getElementById("toggleDrone").attr("disabled", "disabled");
    document.getElementById("toggleAP").removeAttribute("disabled");
    DroneToggled = (DroneToggled == 0) ? 1 : 0;
    if (DroneToggled == 1) {
        //var APButton = $()
    }
});

function plotAP() {
    document.getElementById("toggleAP").disabled = true;
    document.getElementById("toggleDrone").disabled = false;
    APToggled = (APToggled == 0) ? 1 : 0;
    if (APToggled == 1) {
        //var APButton = $()
    }
}

function plotDrone() {
    document.getElementById("toggleDrone").disabled = true;
    document.getElementById("toggleAP").disabled = false;
    DroneToggled = (DroneToggled == 0) ? 1 : 0;
    if (DroneToggled == 1) {
        //var APButton = $()
    }
}

window.onload = function() {
    divWidth = document.getElementById("grid").offsetWidth;
    divHeight = document.getElementById("grid").offsetHeight;    
};