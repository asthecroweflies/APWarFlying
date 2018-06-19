
//http://www.d3noob.org/2014/02/styles-in-d3js.html
var divWidth, divHeight;
var APToggled = 0;
var DroneToggled = 0;
var generated = 0;
var gridArray;
var APs = {};
var DroneLocations = {};

$(document).ready(function() {

});

function gridData(xDim, yDim) {

    var data = new Array();
    var xpos = 1;
    var ypos = 1;
    var cellWidth = Math.floor(divWidth / xDim);
    var cellHeight = Math.floor(divHeight / yDim);
    var clickCount = 0;
    var type = "blank";

    for (var row = 0; row < xDim; row++) {
        data.push( new Array() );
        
        for (var col = 0; col < yDim; col++) {
            data[row].push({
                x: xpos,
                y: ypos,
                width: cellWidth,
                height: cellHeight,
                clickCount: clickCount,
                type: type
            })
            xpos += cellWidth;
        }
        xpos = 1;
        ypos += cellHeight;
    }
    return data;
}

var craftGrid = function() {
    if (generated == 1) return;
    if (generated == 0) generated = 1;

    var xDim = $("#xDim").val();
    var yDim = $("#yDim").val();

    if ( ((xDim <= 0) || ((xDim % 25) != 0) ) ||
          (yDim <= 0) || ((yDim % 25) != 0) ) {
            alert("Dimensions must be (0, 75] & evenly divisible by 25.");
            return;
         }
    gridArray = gridData(xDim, yDim);
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
        .style("fill", "#ffffff")
        .style("stroke", "#222")
        .on('mouseover', handleMouseOver)
        .on('mouseout', handleMouseOut)
        .on('click', handleClick);
        //.on('click', function(d) {
            
       // });
    document.getElementById("toggleDrone").disabled = false;
    document.getElementById("toggleAP").disabled = false;

};

function handleClick(d, i) {
    d.clickCount++;
    console.clear();
    console.log(gridArray);
    console.log(d.x + ", " + d.y);
    radius = 10;

    if (APToggled == 1) {
        d3.select(this).style("fill", "#23AC23");
        d.type = "AP";
        generateSignalGradient(radius);
    }
    if (DroneToggled == 1) {
        d3.select(this).style("fill", "#aa3c36");
        d.type = "DronePos";
    }
}

function generateSignalGradient(radius) {

}

function handleMouseOver(d, i) {
    if (d.type == "blank" && APToggled) {
        d3.select(this).style("fill", "#8cff8c");
    }
    else if (d.type == "blank" && DroneToggled) {
        d3.select(this).style("fill", "#ff928c");
    }
}

function handleMouseOut(d, i) {
    if (d.type == "blank") {
        d3.select(this).style("fill", "#fff");
    }
}

function plotAP() {
    DroneToggled = 0;
    document.getElementById("toggleAP").disabled = true;
    document.getElementById("toggleDrone").disabled = false;
    APToggled = (APToggled == 0) ? 1 : 0;
    console.log("APToggled: " + APToggled);
    console.log("DroneToggled: " + DroneToggled);

    if (APToggled == 1) {
        //var APButton = $()
    }
}

function plotDrone() {
    APToggled = 0;
    document.getElementById("toggleDrone").disabled = true;
    document.getElementById("toggleAP").disabled = false;
    DroneToggled = (DroneToggled == 0) ? 1 : 0;
    console.log("DroneToggled: " + DroneToggled);
    console.log("APToggled: " + APToggled);


    if (DroneToggled == 1) {
        //var APButton = $()
    }
}

window.onload = function() {
    divWidth = document.getElementById("grid").offsetWidth;
    divHeight = document.getElementById("grid").offsetHeight;    
    document.getElementById("toggleAP").disabled = true;
    document.getElementById("toggleDrone").disabled = true;

};