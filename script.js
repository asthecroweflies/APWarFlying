//TODO: Add lines between DronePos
//IDEA: for grid scale: have div's along the edge protrude line depecting distance

var divWidth, divHeight, cellWidth, cellHeight;
var APToggled = 0, DroneToggled = 0, gridToggled = 0;
var gridArray;
var APs = [];
var DroneSquares = [];
var pi = 3.1415926535897932384626433832795028841971693993751058209749445923078164;
var svgUsed = false;
var AP_id = false;
var Drone_id = false;
//var colors = ["red", "orange", "yellow", "green", "blue", "purple"];
var droneImage = new Image(75, 35);
droneImage.src = '/res/drone_nobg.png';

$(document).ready(function(){
    $("#genMask").dblclick(function() {
        console.log("cLEARING");
        clearGrid();

    });
});

window.onload = function() {
    divWidth = document.getElementById("grid").offsetWidth;
    divHeight = document.getElementById("grid").offsetHeight;    
    document.getElementById("toggleAP").disabled = true;
    document.getElementById("toggleDrone").disabled = true;
};

function clearGrid() { 
    APToggled = 0, DroneToggled = 0, gridToggled = 0;
    APs = [];
    DroneSquares = [];
    svgUsed = 0;
    AP_id = 0;
    Drone_id = 0;
    //grid = d3.select("#grid").html("");
    //d3.select("g.parent").selectAll("*").remove();

    craftGrid();
}

function generateGridData(dimensionality) {

    var data = new Array();
    var xpos = 1;
    var ypos = 1;
    cellWidth = Math.floor(divWidth / dimensionality);
    cellHeight = Math.floor(divHeight / dimensionality);
    var clickCount = 0;
    var type = "blank";

    for (var row = 0; row < dimensionality; row++) {
        data.push( new Array() );
        
        for (var col = 0; col < dimensionality; col++) {
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

    if (gridToggled === true) return;// should only make svg element once
    else if (gridToggled === false) {
        document.getElementById("generateButton").disabled = true;
        $("#genMask").show();
        gridToggled = true;
    } 

    var dimensionality = $("#dimension").val();

    // Input validation
    var divFactor = 5;
    if (((dimensionality % divFactor) !== 0) && (dimensionality < 125)  && (dimensionality > 5)){
        alert("dimensionality must be [5, 75] & evenly divisible by " + divFactor + ".");
        return;
    }

    // Create svg with D3.js using data array from generateGridData()
    gridArray = generateGridData(dimensionality);
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
        .style("fill", "#ffefd5")
        .style("stroke", "#222")

       /* if (dimensionality > 100) {
            column = row.style("stroke-width", 0);
        }
        else {
            column = row.style("stroke-width", 2);
        }*/
        .style("stroke-width", 1)
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

// Determines square state on left click
function handleClick(d, i) {

    if (APToggled) {// create new access point
        if (d.type == "blank") {
            d.AP_id = AP_id;
            AP_id++;
            d3.select(this).style("fill", "#23AC23");
            d.type = "AP";
            APs.push(d);
        }
        else if (d.type == "AP") {
            d.clickCount++;// to handle multiple clicks on same square (e.g. increase signal power)
        }
        else if (d.type == "DronePos") {
            d.type = "both";
            d3.select(this).style("fill", "#f4ce42");
            APs.push(d);
        }
    }
    if (DroneToggled) {
        if (d.type == "blank") {
            d.Drone_id = Drone_id;
            Drone_id++;
            d3.select(this).style("fill", "#aa3c36");
            d.type = "DronePos";
            DroneSquares.push(d);
        }
        else if (d.type == "DronePos") {
            //d3.select(this).style("fill", "#ffffff");

            //Drone spends x more time here?
            //consider darkening 
            
        }

        else if (d.type == "AP") {
            d.Drone_id = Drone_id;
            Drone_id++;
            d3.select(this).style("fill", "#f4ce42");
            d.type = "both";
            DroneSquares.push(d);
        }
    }
    generateSignalIndicators();
}

 
function flyDrone() {
    var droneImg = document.getElementById("droneImg");
    //droneImg.style.top = DroneSquares[0].y;
    //droneImg.style.left = DroneSquares[0].x;

    animateDrone();
    generateSignalIndicators();
    //console.log(APs);
    //console.log(DroneSquares);
}

// Drone movement 
function animateDrone() {

    DroneCoords = [];
    
    for (var i = 0; i < DroneSquares.length; i++) {
        var coord = [DroneSquares[i].x, DroneSquares[i].y];
        DroneCoords.push(coord);
    }

    var flightTime = $("#flightDuration").val();
    flightTime = Math.floor((flightTime * 1000) / DroneCoords.length);

    var waypointHangTime = $("#waypointDuration").val();

    if (DroneCoords.length < 2) {
        alert("At least 2 points needed to simulate flight.");
        return;
    }

    var droneImg = document.getElementById("droneImg");
    //droneImg.style.top = DroneCoords[0][0] + 'px';
    //droneImg.style.left = DroneCoords[0][1] + 'px';
    //droneImg.style.transitionDuration = 2 + 's';
    droneImg.style.display = "block";
    var droneWidth = droneImg.offsetWidth;
    var droneHeight = droneImg.offsetHeight;

    var repeatCoords = 0;
    var cachedX = 0;
    var probingInterval = 300;
    var iterations = 0;
    var distance = 0;
    var apCenter = 0;
    var trackDrone = setInterval(function () {
        // those are the position and offset of the element during the animation
        var apX = $("#droneImg").position().left;
        var apY = $("#droneImg").position().top;
        var aoX = $("#droneImg").offset().left;
        var aoY = $("#droneImg").offset().top;
        var truX = apX + droneImg.offsetWidth / 2;
        var truY = apY + droneImg.offsetHeight / 2;
        //console.log(apX + ", " + apY + " aoX: " + aoX + " aoY: " + aoY);
        console.log("Tru x: " + truX.toFixed(2) + " Tru y: " + truY.toFixed(2));

        for (var ap = 0; ap < APs.length; ap++) {
            distance = 0;
            apCenter = [APs[ap].x + (cellWidth / 2), APs[ap].y + (cellHeight / 2)];
            // d = sqrt[(receiverX - AP's x)^2 + (recieverY - AP's y)^2]
            distance = Math.pow((Math.pow(truX - apCenter[0], 2) + Math.pow(truY - apCenter[1], 2)), 0.5);

            console.log("Distance to AP" + ap + ": " + distance.toFixed(3) + ".");
            
        }
        console.log("-------------------------")
        if (iterations * probingInterval > (flightTime * 1000)) {//end of flight, stop tracking
            clearInterval(trackDrone);
            // TODO: Link data with chart.js
            plotData();
        }
        iterations++;
    }, probingInterval);

    for (var d = 0; d < DroneCoords.length; d++) {
        newX = DroneCoords[d][0];
        newY = DroneCoords[d][1];
        $("#droneImg").transition({
            x: (newX - (droneWidth / 2)) + (cellWidth / 2) + 'px',
            y: (newY - (droneHeight / 2)) + (cellHeight / 2) + 'px',
            //x: newX + 'px',
            //y: newY + 'px',
            duration: flightTime,
            delay: waypointHangTime// happens at each AP? 
         });
    }
    plotData();
};

function generateSignalIndicators() {

    var radiusInBlocks = 4; // size of signal strength radius in terms of grid squares
    var multFactor = 4;     // for changing radius on click
    var min = 0;            // lowerbound for color array range calculation
    var radius = (radiusInBlocks - 1) * cellWidth + (cellWidth / 2);// radius is (n-1) + 1/2 where n: num. of blocks

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
        d3.select(this).style("fill", "#ffefd5");
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

function plotData() {
    var ctx = document.getElementById("strengthChart");

    var myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
            datasets: [{
                label: '# of Votes',
                data: [1, 4, 3, 5, 2, 3],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)'
                ],
                borderColor: [
                    'rgba(255,99,132,1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero:true
                    }
                }]
            }
        }
    });
}