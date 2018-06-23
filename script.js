//TODO: Add lines between DronePos
//IDEA: for grid scale: have div's along the edge protrude line depecting distance

var divWidth, divHeight, cellWidth, cellHeight;
var APToggled = 0, DroneToggled = 0, gridToggled = 0;
var gridArray;
var APs = [];
var DroneLocations = [];
var pi = 3.141592653589793238462643383279502884197;
var svgUsed = 0;
var AP_id = 0;
var Drone_id = 0;
//var colors = ["red", "orange", "yellow", "green", "blue", "purple"];
var droneImage = new Image(75, 35);
droneImage.src = '/res/drone_nobg.png';

$(document).ready(function() {

});

function gridData(dimensions) {

    var data = new Array();
    var xpos = 1;
    var ypos = 1;
    cellWidth = Math.floor(divWidth / dimensions);
    cellHeight = Math.floor(divHeight / dimensions);
    var clickCount = 0;
    var type = "blank";

    for (var row = 0; row < dimensions; row++) {
        data.push( new Array() );
        
        for (var col = 0; col < dimensions; col++) {
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
$('#onHoldGenerateMask').on('mousedown mouseup', function mouseState(e) {
    if (e.type == "mousedown") {
        //code triggers on hold
        console.log("redeux");
    }
});

var craftGrid = function() {

    if (gridToggled == 1) return;
    else if (gridToggled == 0) {
        document.getElementById("generateButton").disabled = true;
        $("#onHoldGenerateMask").show();
        
        //clearGrid();
        gridToggled = 1;
    } 

    var xDim = $("#xDim").val();
    var yDim = $("#yDim").val();
    var dimensions = $("#dimension").val();

    // Input validation
    var divFactor = 5;
    if (((dimensions % divFactor) !== 0) && (dimensions < 125)  && (dimensions > 5)){
        alert("Dimensions must be [5, 75] & evenly divisible by " + divFactor + ".");
        return;
    }

    // Create grid using
    gridArray = gridData(dimensions);
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
                var removeIndex = APs.map(function(AP) { return AP.AP_id; }).indexOf(d.AP_id);
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

function clearGrid() { 

}

function handleClick(d, i) {

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
    //console.log(APs);
    //console.log(DroneLocations);
}

function animateDrone() {
    /*var droneImg = document.getElementById("droneImg");
    droneImg.style.transitionDuration = 2 + 's';
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
        droneImg.style.x = newX + (droneWidth / 2) + 'px';
        droneImg.style.y = newY + (droneHeight / 2) + 'px';
        console.log(newX + ', ' + newY);
        //droneImg.style.transform = "translate(" + newX + "px," + newY + "px)"; 

        index++;

        }
    };*/
    DroneCoords = [];
    for (var i = 0; i < DroneLocations.length; i++) {
        var coord = [DroneLocations[i].x, DroneLocations[i].y];
        DroneCoords.push(coord);

    }
    if (DroneCoords.length < 2) {
        alert("At least 2 points needed to simulate flight.");
        return;
    }
    //var droneImg = document.getElementById("droneImg");
    //$("droneImg").style.display = "block";
    //droneImg.style.display = "block";

    var droneImg = document.getElementById("droneImg");
    //droneImg.style.top = DroneCoords[0][0] + 'px';
    //droneImg.style.left = DroneCoords[0][1] + 'px';
    droneImg.style.transitionDuration = 2 + 's';
    droneImg.style.display = "block";
    var droneWidth = droneImg.clientWidth;
    var droneHeight = droneImg.clientHeight;

    setInterval(function () {
        // those are the position and offset of the element during the animation
        var apX = $("#droneImg").position().left;
        var apY = $("#droneImg").position().top;
        var aoX = $("#droneImg").offset().left;
        var aoY = $("#droneImg").offset().top;
        //print status bar info
        //$("#status_div").html("BEFORE ATTACHING ANIMATION position: " + pX + "," + pY + "  offset: " + oX + "," + oY + " <br/> AFTER ATTACHING ANIMATION position: " + npX + "," + npY + "  offset: " + noX + "," + noY + "<br/> DURING ANIMATION position: " + apX + "," + apY + "  offset: " + aoX + "," + aoY);
        console.log(apX + ", " + apY + " aoX: " + aoX + " aoY: " + aoY);
    }, 100);

    for (var d = 0; d < DroneCoords.length; d++) {
        
        
        newX = DroneCoords[d][0];
        newY = DroneCoords[d][1];
        $("#droneImg").transition({
            x: (newX - droneWidth / 2) + 'px',
            y: (newY - droneHeight / 2) + 'px',
            duration: 500
         });
        /*$("#droneImg").velocity({
            x: newX,
            y: newY
        }, 100);*/

        //$('.box').transition({ x: '40px', y: '40px' });
        //.transition({x: newX })
        //.transition({y: newY });
        console.log("moving to: " + newX + ", " + newY);
    }

};

function generateSignalIndicators() {

    var radiusInBlocks = 4;
    var multFactor = 4;     // for changing radius on click
    var min = 0;            // lowerbound for color array range calculation

    var radius = (radiusInBlocks - 1) * cellWidth + (cellWidth / 2);
    if (svgUsed == 1) {
        d3.select("svg").remove();
        svgUsed = 0;
    }

    if (svgUsed == 0) {     // only need svgContainer creation once
        var svgContainer = d3.select("#gradients")
                             .append("svg")
                             .attr("width", 752)
                             .attr("height", 752);
        svgUsed = 1;
    }
    var colorRange = ['red', '#fc6a39', '#ffd589', 'blue'];
    var color = d3.scaleLinear().range(colorRange).domain([-1, 0, 1]);
    //var svgContainer = d3.select("#gradients");
    var radialGradient = svgContainer.append("defs")
                            .append("radialGradient")
                            .attr("id", "radial-gradient");
                            
    radialGradient.append("stop")
                            .attr("offset", "0%")
                            .attr("stop-color", color(-1));
          
    radialGradient.append("stop")
                            .attr("offset", "50%")
                            .attr("stop-color", color(0));
          
    radialGradient.append("stop")
                            .attr("offset", "100%")
                            .attr("stop-color", color(1));

    var circles = svgContainer.selectAll("circle")
                              .data(APs)
                              .enter()
                              .append("circle")
                              // remove on right click 
                              .on("contextmenu", function(e,i) {
                                d3.event.preventDefault();
                                if (e.type == "AP") {
                                    var removeIndex = APs.map(function(AP) { return AP.AP_id; }).indexOf(e.AP_id);
                                    ~removeIndex && APs.splice(removeIndex, 1);
                                    update();
                                    e.AP_id = 0;
                                    AP_id--;
                                    svgContainer.exit().remove();
                                }
                            })
                            .attr("cx", function(d){ return d.x + cellWidth / 2; })
                            .attr("cy", function(d){ return d.y + cellHeight / 2; })
                            .attr("r", function(d) { return ((d.clickCount + 1) % multFactor) * radius;})
                            .attr("id", function(d){ return d.AP_id; })
                            .style("fill-opacity", 0.4)
                            .attr("stroke-dasharray", "5 5")
                            .attr("stroke-width", "3px")
                            .attr("stroke", "#fc813a")
                            .style("fill", "url(#radial-gradient)");
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