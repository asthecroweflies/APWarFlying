//TODO: Add lines between DronePos

var divWidth, divHeight, cellWidth, cellHeight;
var APToggled = 0;
var DroneToggled = 0;
var generated = 0;
var gridArray;
var APs = [];
var DroneLocations = [];
var pi = 3.141592653589793238462643383279502884197;
var svgUsed = 0;
var AP_id = 0;
var Drone_id = 0;

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
                AP_id: AP_id,
                Drone_id: Drone_id,
                gridX: Math.floor(xpos / cellWidth),
                gridY: Math.floor(ypos / cellHeight)
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
                d.AP_id = 0;
                d.Drone_id = 0;
                AP_id--;
                Drone_id--;
                var svgContainer = d3.select("#gradients");
                svgContainer.exit().remove();
            }
            d.type = "blank";
            d3.select(this).style("fill", "#ffffff");
        })
        .on('click', handleClick);
    document.getElementById("toggleDrone").disabled = false;
    document.getElementById("toggleAP").disabled = false;

};

function handleClick(d, i) {
    radius = cellWidth * pi;

    if (APToggled == 1) {
        if (d.type == "blank") {
            d.AP_id = AP_id;
            AP_id++;
            d3.select(this).style("fill", "#23AC23");
            d.type = "AP";
            APs.push(d);
        }
        else if (d.type == "AP") {
            d.clickCount++;
        }
        else if (d.type == "DronePos") {
            d.type = "both";
            d3.select(this).style("fill", "#f4ce42");
            APs.push(d);
        }
    }
    if (DroneToggled == 1) {
        if (d.type == "blank") {
            d.Drone_id = Drone_id;
            Drone_id++;
            d3.select(this).style("fill", "#aa3c36");
            d.type = "DronePos";
            DroneLocations.push(d);
        }
        else if (d.type == "DronePos") {
            //d3.select(this).style("fill", "#ffffff");
            //d.type = "blank";

            //Drone spends more time here?
            //consider darkening
            
        }

        else if (d.type == "AP") {
            d.Drone_id = Drone_id;
            Drone_id++;
            d3.select(this).style("fill", "#f4ce42");
            d.type = "both";
            DroneLocations.push(d);
        }
    }
    generateSignalIndicators();
}

function flyDrone() {//given array of all APs, create circles around them indicating signal strength
    animateDrone();
    generateSignalIndicators();
    console.log(APs);
    console.log(DroneLocations);
}

function animateDrone() {
    var droneImg = document.getElementById("droneImg");
    droneImg.style.transitionDuration = 3 + 's';
    droneImg.style.display = "block";
    var droneWidth = droneImg.clientWidth;
    var droneHeight = droneImg.clientHeight;
    DroneCoords = [];
    for (var i = 0; i < DroneLocations.length; i++) {
        var coord = [DroneLocations[i].x, DroneLocations[i].y];
        DroneCoords.push(coord)
    }
    
    var duration = setInterval(frame, 500);
    var index = 0;
    function frame() {
        if (index == DroneCoords.length)
            clearInterval(duration);
        else {
        var newX = DroneCoords[index][1];
        var newY = DroneCoords[index][0];
        droneImg.style.top = newX + (droneWidth / 2) + 'px';
        droneImg.style.left = newY + (droneHeight / 2) + 'px';
        console.log(newX + ', ' + newY);
        //droneImg.style.transform = "translate(" + newX + "px," + newY + "px)"; 

        index++;

        }
    };
};

function generateSignalIndicators() {
    var radiusFactor = 4 * cellWidth;
    if (svgUsed == 1) {
        d3.select("svg").remove();
        svgUsed = 0;
    }

    var svgContainer = d3.select("#gradients");

    if (svgUsed == 0) { //only create svgContainer once
        var svgContainer = d3.select("#gradients")
                             .append("svg")
                             .attr("width", 752)
                             .attr("height", 752);
        svgUsed = 1;
    }

    var circles = svgContainer.selectAll("circle")
                              .data(APs)
                              .enter()
                              .append("circle")
                              .on("contextmenu", function(e,i) {
                                d3.event.preventDefault();
                                if (e.type == "AP") {
                                    var removeIndex = APs.map(function(AP) { return AP.AP_id; }).indexOf(e.AP_id);
                                    ~removeIndex && APs.splice(removeIndex, 1);
                                    update();
                                    e.AP_id = 0;
                                    AP_id--;
                                }
                            })
                            .attr("cx", function(d){ return d.x + cellWidth / 2; })
                            .attr("cy", function(d){ return d.y + cellHeight / 2; })
                            .attr("r", function(d) { return ((d.clickCount % 3) + 1) * radiusFactor;})
                            .attr("id", function(d){ return d.AP_id; })
                            .style("fill", "green")
                            .style("fill-opacity", 0.2)
                            .style("stroke", "red");
    svgContainer.exit().remove();
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

    if (APToggled == 1) {
        //var APButton = $()
    }
}

function plotDrone() {
    APToggled = 0;
    document.getElementById("toggleDrone").disabled = true;
    document.getElementById("toggleAP").disabled = false;
    DroneToggled = (DroneToggled == 0) ? 1 : 0;
    //console.log("DroneToggled: " + DroneToggled);
    //console.log("APToggled: " + APToggled);

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