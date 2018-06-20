//TODO: Add lines between DronePos

var divWidth, divHeight, cellWidth, cellHeight;
var APToggled = 0;
var DroneToggled = 0;
var generated = 0;
var gridArray;
var APs = [];
var DroneLocations = {};
var pi = 3.141592653589793238462643383279502884197;
var spaceSelected = 0;
var id = 0;

$(document).ready(function() {

});

function gridData(xDim, yDim) {

    var data = new Array();
    var xpos = 1;
    var ypos = 1;
    cellWidth = Math.floor(divWidth / xDim);
    cellHeight = Math.floor(divHeight / yDim);
    var clickCount = 0;
    var type = "blank";
    var xCoord = 1;
    var yCoord = 1;

    for (var row = 0; row < xDim; row++) {
        data.push( new Array() );
        
        for (var col = 0; col < yDim; col++) {
            data[row].push({
                x: xpos,
                y: ypos,
                width: cellWidth,
                height: cellHeight,
                clickCount: clickCount,
                type: type,
                id: id,
                xCoord: xCoord,
                yCoord: yCoord
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
    if (generated == 0) {
        document.getElementById("generateButton").disabled = true;
        generated = 1;
    } 

    var xDim = $("#xDim").val();
    var yDim = $("#yDim").val();
    var divFactor = 5;

    if ( ((xDim <= 0) || ((xDim % divFactor) != 0) ) ||
          (yDim <= 0) || ((yDim % divFactor) != 0) ) {
            alert("Dimensions must be (0, 75] & evenly divisible by " + divFactor + ".");
            return;
         }
    gridArray = gridData(xDim, yDim);
    var grid = d3.select("#grid")
        .append("svg")
        .attr("width", "752px")
        .attr("height", "752px");

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
        .style("stroke-width", 2)
        .on('mouseover', handleMouseOver)
        .on('mouseout', handleMouseOut)
        .on('contextmenu', function (d, i) {
            d3.event.preventDefault();
            if (d.type == "AP") {
                var removeIndex = APs.map(function(AP) { return AP.id; }).indexOf(d.id);
                ~removeIndex && APs.splice(removeIndex, 1);
                d.id = 0;
                id--;
            }
            d.type = "blank";
            d3.select(this).style("fill", "#ffffff");
        })
        .on('click', handleClick);
    document.getElementById("toggleDrone").disabled = false;
    document.getElementById("toggleAP").disabled = false;

};

function handleClick(d, i) {
    //d.clickCount++;
    //console.clear();
    //console.log(gridArray);

    radius = cellWidth * pi;

    if (APToggled == 1) {
        //d.type = (d.type == "AP") ? "blank" : (d.type == "both") ? "both" : "AP";
        if (d.type == "blank") {
            id++;
            d.id = id;
            d3.select(this).style("fill", "#23AC23");
            d.type = "AP";
            //console.log("id: " + id + " dis.id: " + d.id);
            APs.push(d);
        }
        else if (d.type == "AP") {
            d3.select(this).style("fill", "#ffffff");
            d.type = "blank";
        }
        else if (d.type == "both") {
            //Already an AP
        }
    }
    if (DroneToggled == 1) {
        if (d.type == "blank") {
            d3.select(this).style("fill", "#aa3c36");
            d.type = "DronePos";
        }
        else if (d.type == "DronePos") {
            d3.select(this).style("fill", "#ffffff");
            d.type = "blank";
        }

        else if (d.type == "AP") {
            d3.select(this).style("fill", "#f4ce42");
            d.type = "both";
        }
    }
}

function flyDrone() {//given array of all APs, create circles around them indicating signal strength
    generateSignalIndicators(APs)
    console.log(APs);
}

function generateSignalIndicators(APs) {
    console.log("circle?");
    var gradientSpace = d3.select("#gradients")
                          .append("svg")
                          .attr("width", 752)
                          .attr("heigth", 752)
                          .selectAll("g")
                          .data(APs)
                          .enter()
                          .append("g")
                          .selectAll("circle")
                          .data(function(d) {
                              return d.id;
                          })
                          .enter()
                          .append("circle")
                          .attr("cx", function(d) {
                              return d.cX;
                          })
                          .attr("cy", function(d) {
                              return d.cY;
                          })
                          .attr("r", 20)
                          .style("stroke", "red")
                          .style("fill", "green");
}

function generateSignalGradient(d, radius) {
    var cX = d.x + d.width / 2;
    var cY = d.y + d.height / 2;
    APs.push(d);
    console.log("creating circle at: " + cX + ", " + cY);
    loadCircles(APs);
    var gradientSpace = d3.select("#gradients")
        .append("svg")
        .attr("width", "752px")
        .attr("height", "752px");

    var dataArr = [10, 20, 30, 40];
    //create circle
    /*gradientSpace.append("g").selectAll("circle")
        .data(eval("dataArr"))
        .append("circle")
        .attr("cx", cX)
        .attr("cy", cY)
        .attr("r", radius);
    */
    var circleSelection = gradientSpace.append("circle")
        .attr("cx", cX)
        .attr("cy", cY)
        .attr("r", radius)
        .style("fill-opacity", 0.2)
        .style("stroke", "red")
        .style("fill", "green");
    
}

function loadCircles(APs) {

}


function handleMouseOver(d, i) {
    if (d.type == "blank" && APToggled) {
        d3.select(this).style("fill", "#8cff8c");
    }
    else if (d.type == "blank" && DroneToggled) {
        d3.select(this).style("fill", "#ff928c");
    }
    else if (d.type == "AP" && DroneToggled) {
        d3.select(this).style("fill", "#f4ce42");
    }
}

function handleMouseOut(d, i) {
    if (d.type == "blank") {
        d3.select(this).style("fill", "#fff");
    } else if (d.type == "AP") {
        d3.select(this).style("fill", "#23AC23");

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