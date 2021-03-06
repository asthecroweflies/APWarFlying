//TODO: 
//      Fix initial drone movement (or at least prevent probing until "arrived" at first AP)
//      Map feature: plot WP on all APs
//     

var gridWidth, gridHeight, cellWidth, cellHeight;
var APToggled = 0, DroneToggled = 0, gridToggled = 0, drawToggled = 0;
var gridArray;
var APs = [];
var totalAPStrengths = [];
var apsLoaded, wpsLoaded = false;

var WPs = [];
var pi = 3.1415926535897932384626433832795028841971693993751058209749445923078164;
var svgUsed = false;
var probeSvgUsed = false;
var AP_id = 0;
var Drone_id = 0;
var pathIndex = 0;                                              // Specifies AP location along drawn path
var pathDrawn = false;
var droneImage = new Image(75, 35);
var droneProbingLocations = [];
var plotted = false;
var dimensionality;
var loadedLayout = [];
var pathCoords = [];                                            // Contains locations of AP path
var grid, row, column;                                          // d3 grid elements
var APCount = 0;
var APSpeed = 0;
var APTimer = 0;
var newAPs = [];
var adjustedAP = 0;

window.onload = function() {
    gridWidth = document.getElementById("grid").offsetWidth;
    gridHeight = document.getElementById("grid").offsetHeight;    
    document.getElementById("toggleAP").disabled = true;
    document.getElementById("toggleDrone").disabled = true;
    //document.getElementById("plotOnAP").disabled = true;
    document.getElementById("toggleDraw").disabled = false;
    document.getElementById("csvData").disabled = true;
    //document.getElementById("saveAP").disabled = true;
    //document.getElementById("saveWP").disabled = true;
    document.getElementById("loadData").disabled = true;
    dimensionality = $("#dimension").val();
    APSpeed = $("#apSpeedSlider").val();
};

function sliderMoved(sliderValue) {
    APSpeed = sliderValue;
    var apSpeedText = document.getElementById("APSpeed");
    apSpeedText.innerHTML = "AP Speed: " + sliderValue + " m/s";
}

function clearGrid() { 
    APToggled = 0, DroneToggled = 0, gridToggled = 0;
    APs = [];
    WPs = [];
    svgUsed = 0;
    probeSvgUsed = 0;
    AP_id = 0;
    Drone_id = 0;

    craftGrid();
}

// Creates data object array for each grid square
function generateGridData(dimensionality) {

    var data = new Array();
    var xpos = 1;
    var ypos = 1;
    cellWidth = Math.floor(gridWidth / dimensionality);
    cellHeight = Math.floor(gridHeight / dimensionality);
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
                pathIndex: pathIndex,
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
    document.getElementById("toggleDrone").disabled = false;
    document.getElementById("toggleAP").disabled = false;
    document.getElementById("loadData").disabled = false;

    if (gridToggled === true) return;// should only make svg element once
    else if (gridToggled == false) {
        document.getElementById("generateButton").disabled = true;
        $("#genMask").show();
        gridToggled = true;
    } 

    // Input validation
    if ((750 % dimensionality !== 0) || dimensionality < 5) {
        alert("dimensionality must be a factor of 750 [10, 15, 25, 30, 50, 75, 125, 150, 250] & > 5")
        return;
    }

    // Create svg with D3.js using data array from generateGridData()
    gridArray = generateGridData(dimensionality);
    grid = d3.select("#grid")
        .append("svg")
        .attr("width", "752px")
        .attr("height", "752px");

    var rowID = 0;
    row = grid.selectAll(".row")
        .data(gridArray)
        .enter().append("g")
        .attr("class", "row")
        .attr("id", function(d) { return "row-" + rowID++; });

    var lineThickness = 1;
    if (dimensionality <= 15) 
        lineThickness = 5;
    
    var gridSquareID = 0;
    column = row.selectAll(".square")
        .data(function(d) { return d; })
        .enter().append("rect")
        .attr("class", "square")
        .attr("x", function(d) { return d.x; })
        .attr("y", function(d) { return d.y; })
        .attr("width", function(d) { return d.width; })
        .attr("height", function(d) { return d.height; })
        .attr("id", function(d) { return "square-" + gridSquareID++; })
        .style("fill", "#ffefd5")
        .style("stroke", "#222")
        .style("stroke-width", lineThickness)
        .on('mouseover', handleMouseOver)
        .on('mouseout', handleMouseOut)
        .on('contextmenu', function (d, i) {
            d3.event.preventDefault();
            if (d.type == "AP") {
                var removeIndex = APs.map(function(AP) { return AP.AP_id; }).indexOf(d.AP_id);
                ~removeIndex && APs.splice(removeIndex, 1);
                d.AP_id = 0;
                AP_id--;

                if(APs.length == 0) 
                    document.getElementById("saveAP").disabled = true;
                
                else if (APs.length >= 2) 
                    document.getElementById("saveAP").disabled = false; // Enable ability to save APs

                var svgContainer = d3.select("#gradients");
                svgContainer.exit().remove();
            }
            else if (d.type == "WP") {
                var removeIndex = WPs.map(function(WP) { return WP.Drone_id; }).indexOf(d.Drone_id);
                ~removeIndex && WPs.splice(removeIndex, 1);
                d.Drone_id = 0;
                Drone_id--;
                if(WPs.length == 0) {
                    document.getElementById("saveWP").disabled = true;
                }
            }
            d.type = "blank";
            d3.select(this).style("fill", "#ffefd5");
        })
        .on('click', handleClick);
};

// Determines square state on left click
function handleClick(d, i) {
    var svg = d3.select("svg")
                .call(d3.drag()
                .container(function() { return this; })
                .subject(function() { var p = [d3.event.x, d3.event.y]; return [p, p]; }));

    if (APToggled){                             // create new access point
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
        else if (d.type == "WP") {
            d.type = "both";
            d3.select(this).style("fill", "#f4ce42");
            APs.push(d);
        }
        //generateSignalIndicators();
    }
    else if (DroneToggled) {
        if (d.type == "blank") {
            d.Drone_id = Drone_id;
            Drone_id++;
            d3.select(this).style("fill", "#aa3c36");
            d.type = "WP";
            WPs.push(d);
            document.getElementById("saveWP").disabled = false;
        }
        else if (d.type == "WP") {
            //d3.select(this).style("fill", "#ffffff");
            //Drone spends x more time here?
            //consider darkening 
        }

        else if (d.type == "AP") {
            d.Drone_id = Drone_id;
            Drone_id++;
            d3.select(this).style("fill", "#f4ce42");
            d.type = "both";
            WPs.push(d);
        }
    }
}

function gaussianRandom(start, end) {
    var rand = 0;
    for (var i = 0; i < 6; i += 1)                      // 6 is pretty sufficient for dist.
      rand += Math.random();
    
    rand /= 6;
    return Math.floor(start + rand * (end - start + 1));
  }
  
function findPathLoss(d) {

    // Log Distance Path Loss Model:
    // d: distance
    // d0: pathloss at a reference distance (1 m)
    // n: path loss exponent (literature recommends ~2 for free space.)
    // X: signal noise; zero-mean Gaussian distributed random variable: X ~ N(0, o^2)
    //
    // P(d) = P(d0) + 10*n*log10(d) + X
    
    refLoss = 15;
    pathLossExponent = 2.2;
    var tuningParameter = 4;
    signalNoise = Math.floor(gaussianRandom(0, 100) / tuningParameter); 

    return (refLoss + 10 * pathLossExponent * Math.log10(d) + signalNoise);
};

function pixelToMeters(d) {
    var gridResolution = 750.0 / dimensionality;
    return (d / gridResolution);
} 

function flyDrone() {
    var droneImg = document.getElementById("droneImg");
    totalAPStrengths = [];
    droneImg.style.position = "absolute";               // Move drone to initial AP location
    droneImg.style.left = WPs[0].x + 'px';
    droneImg.style.top =  WPs[0].y + 'px';
    animateDrone();
    //generateSignalIndicators();
    if (APSpeed > 0) {
        APTimer = setInterval(animateAPs, 1000);
    }
    //console.log(APs);
    //console.log(WPs);
}

// Removes green AP square on grid & clears array
function clearAPs(oldAPs) {
    oldAPs.forEach(element => {
        squareID = "#square-" + findSquareID(element.x, element.y);
        //console.log("right-clicking " + squareID);
        d3.select(squareID).dispatch('contextmenu');                // Simulate right-clicking each AP (which resets square)
    });
    oldAPs = [];
}

function findClosestPathCoord(APx, APy, pathCoords) {
    var min = 9999;
    var closestIndex = 0;
    pathCoords.forEach(function(element, i) {
        d = euclideanDistance(APx, APy, element[0], element[1]);
        //console.log("APx: " + APx + " APy: " + APy + " path.x: " + element[0] + " path.y: " + element[1]);
        if (d < min) {
            min = d;
            closestIndex = i;
        }
    });
    return [pathCoords[closestIndex][0], pathCoords[closestIndex][1], closestIndex];
}

function animateAPs() {
    var resolutionConstant = 1;
    var jumpSize = Math.floor(findPathLength(pathCoords) / (APSpeed * resolutionConstant)); // How far each AP should jump in list of path coordinates for new location
    APToggled = true;
    var tempAPs = [];
    console.log("Jump size: " + jumpSize + " Path length: " + findPathLength(pathCoords));

    if (adjustedAP == 0) {                                                // Find closest point on path for each AP & put them there (once)

        newAPs = $.map(APs, function(obj) {
            return $.extend(true, {}, obj);
        });
        tempAPs = $.map(APs, function(obj) {
            return $.extend(true, {}, obj);
        });
        clearAPs(newAPs);
        APs = $.map(tempAPs, function(obj) {
            return $.extend(true, {}, obj);
        });

        APs.forEach(ap => {                                            // Also determine where AP begins on each path (pathIndex)   
            var newStartingCoords = findClosestPathCoord(ap.x, ap.y, pathCoords);
            ap.x = newStartingCoords[0];
            ap.y = newStartingCoords[1];
            ap.pathIndex = newStartingCoords[2];
            squareID = "#square-" + findSquareID(ap.x, ap.y);
            console.log("AP" + ap.AP_id + " will move to " + squareID);
            d3.select(squareID).dispatch('click');
        });

        //newAPs = [];
        adjustedAP = 1;
    } else {
        newAPs = $.map(APs, function(obj) {
            return $.extend(true, {}, obj);
        });
        tempAPs = $.map(APs, function(obj) {
            return $.extend(true, {}, obj);
        });
        clearAPs(newAPs);
        APs = $.map(tempAPs, function(obj) {
            return $.extend(true, {}, obj);
        });
        //console.log(newAPs);
        

        //console.log(new)
        APs.forEach(ap => {
            var nextPathIndex = (ap.pathIndex + jumpSize);
            //if (nextPathIndex > pathCoords.length)
                //nextPathIndex = nextPathIndex % pathCoords.length;

            ap.x = pathCoords[nextPathIndex][0];
            ap.y = pathCoords[nextPathIndex][1];
            ap.pathIndex = nextPathIndex;

            //console.log("New AP" + AP_id + " location: " + ap.x + " , " + ap.y);
            squareID = "#square-" + findSquareID(ap.x, Math.floor(ap.y));
            //console.log("clicking square" + squareID);
            d3.select(squareID).dispatch('click');
        });

        //newAPs = [];
    }



    //clearAPs(newAPs);
}

// Drone movement 
function animateDrone() {
    DroneCoords = [];                                               // Contain x & y coordinates for all waypoints
    
    for (var i = 0; i < WPs.length; i++) {
        var coord = [WPs[i].x, WPs[i].y];
        DroneCoords.push(coord);
    }

    var flightTime = $("#flightDuration").val();
    flightTime = Math.floor((flightTime * 1000) / DroneCoords.length);// total flight duration in ms
   
   // var waypointHangTime = $("#waypointDuration").val();
    if (DroneCoords.length < 2) {
        alert("At least 2 points needed to simulate flight.");
        return;
    }

    var droneImg = document.getElementById("droneImg");
    droneImg.style.display = "block";
    var droneWidth = droneImg.offsetWidth;              // Dimension of drone's div element
    var droneHeight = droneImg.offsetHeight;            //
    var probingInterval = $("#probeInterval").val();    // frequency of AP scanning
    var iterations = 0;                                 // number of scans
    var distance = 0;                                   // distance of current drone position to center of AP
    var apCenter = 0;                                   // center of AP
    var currentAPStrengths = [];                        // Array to hold distances to APs during scan
    var droneX, droneY, adjustedDroneX, adjustedDroneY; // Determine drone's center location with reference to grid
    droneProbingLocations = [];

    var scanForAPs = setInterval(function () {
                                                        // Position and offset of the element during the animation
        droneX = $("#droneImg").position().left;
        droneY = $("#droneImg").position().top;
        adjustedDroneX = droneX + droneImg.offsetWidth / 2;
        adjustedDroneY = droneY + droneImg.offsetHeight / 2;
        //console.log(apX + ", " + apY + " aoX: " + aoX + " aoY: " + aoY);
        //console.log("Drone x: " + adjustedDroneX.toFixed(2) + " Drone y: " + adjustedDroneY.toFixed(2));
        currentAPStrengths = [];                        // Reset on each probing

        for (var ap = 0; ap < APs.length; ap++) {       // Probe for AP signal strengths
            distance = 0;
            apCenter = [APs[ap].x + (cellWidth / 2), APs[ap].y + (cellHeight / 2)];
            // d = sqrt[(receiverX - AP's x)^2 + (recieverY - AP's y)^2]
            distance = Math.pow((Math.pow(adjustedDroneX - apCenter[0], 2) + Math.pow(adjustedDroneY - apCenter[1], 2)), 0.5);
            var pathLoss = findPathLoss(pixelToMeters(distance));

            currentAPStrengths.push(0 - pathLoss);
            //console.log("Path Loss from AP" + ap + ": " + pathLoss.toFixed(5) + " @ " + pixelToMeters(distance) + "m");
        }
        totalAPStrengths.push(currentAPStrengths);
        var droneLoc = [];                                                                            // Tuple location
        droneLoc.push(droneX + gaussianRandom(0, 50)); droneLoc.push(droneY + gaussianRandom(0, 50)); // Simulate probing location imprecision
        droneProbingLocations.push(droneLoc);

        if (iterations * probingInterval > flightTime * DroneCoords.length) {                         //end of flight, stop tracking
            clearInterval(scanForAPs);
            clearInterval(APTimer);
            generateProbeLocations(droneProbingLocations);
            plotDataPlotly(totalAPStrengths);
            document.getElementById("csvData").disabled = false;
            //csvify(totalAPStrengths);
        }
        iterations++;
    }, probingInterval);

    // Move droneImg
    for (var d = 0; d < DroneCoords.length; d++) {
        //console.log("Drone location: (" + adjustedDroneX + "," + adjustedDroneY + ")");
        newX = DroneCoords[d][0];
        newY = DroneCoords[d][1];
        droneX = $("#droneImg").position().left;
        droneY = $("#droneImg").position().top;
        adjustedDroneX = droneX + droneImg.offsetWidth / 2;
        adjustedDroneY = droneY + droneImg.offsetHeight / 2;
        $("#droneImg").transition({
            //x: newX - (droneWidth / 2) + (cellWidth / 2) + 'px',
            //y: newY - (droneHeight / 2) + (cellHeight / 2) + 'px',
            x: newX - droneX - (cellWidth / 1.5) + 'px',
            y: newY - droneY - (cellHeight / 1.5) +  'px',
            duration: flightTime,
            delay: 0
         });
    }
};

function generateProbeLocations(probeLocations) {
    var probeID = 0;
    var probeContainer;

    if (probeSvgUsed == 1) {
        d3.select("#probeSvg").remove();
        probeSvgUsed = false;
    }
    else if (probeSvgUsed == 0) {
        var probeContainer = d3.select("#probeLocations")
        .append("svg")
        .attr("id", "probeSvg")
        .attr("width", 752)
        .attr("height", 752);
        probeSvgUsed = true;
    }
    //console.log(probeLocations);

    var locs = probeContainer.selectAll("circle")
                            .data(probeLocations)
                            .enter()
                            .append("circle")
                            .attr("cx", function(d){ return d[0]; })
                            .attr("cy", function(d){ return d[1]; })
                            .attr("r", 5)
                            .style("fill-opacity", 0.4)
                            .attr("stroke", "#ba813a")
                            .attr("id", probeID++)
}

function generateSignalIndicators() {
    var radiusInBlocks = 6; // size of signal strength radius in terms of grid squares (visual only)
                            // Should use path attenuation model for coloring
    var multFactor = 4;     // for changing radius on click (or something else in the future)
    var radius = (radiusInBlocks - 1) * cellWidth + (cellWidth / 2);// radius is (n-1) + 1/2 where n: num. of blocks

    if (svgUsed == 1) {
        d3.select("svg").remove();
        svgUsed = 0;
    }

    if (svgUsed == 0) {     // only need svgContainer creation once
        var svgContainer = d3.select("#gradients")
                             .append("svg")
                             .attr("width", 752)
                             .attr("height", 752)
                             .on('mouseover', function(d) {
                                d3.select(this).moveToBack();
                            });
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
                            .attr("offset", "25%")
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
                            .style("fill-opacity", 0.3)
                            .attr("stroke-dasharray", "5 5")
                            .attr("stroke-width", "3px")
                            .attr("stroke", "#fc813a")
                            .style("fill", "url(#radial-gradient)");

    var text = svgContainer.selectAll("text")
                           .data(APs)
                           .enter()
                           .append("text")
    var apLabels = text
                    .attr("x", function(d) { return d.x - 10; })
                    .attr("y", function(d) { return d.y - 10; })
                    .text( function(d) { 
                        if (d.AP_id == 0) return "AP0";
                        else return "AP" + d.AP_id; })
                    .attr("font-family", "Trebuchet MS")
                    .attr("font-size", "24px")
                    

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

function drawPath() {
    drawToggled = (drawToggled == 0) ? 1 : 0;
    DroneToggled = 0;
    APToggled = 0;

    document.getElementById("toggleAP").disabled = false;
    document.getElementById("toggleDrone").disabled = false;
    //document.getElementById("toggleDraw").disabled = true;

    var line = d3.line()
                 .curve(d3.curveBasis);

    var svg = d3.select("svg")
                .call(d3.drag()
                .container(function() { return this; })
                .subject(function() { var p = [d3.event.x, d3.event.y]; return [p, p]; })
                .on("start", dragStarted)
                .on("end", dragFinished));

    function dragStarted() {
        //if (drawToggled === 0) return;
        if (pathDrawn) {
            d3.select("#linePath").remove();
            pathDrawn = false;
        }
        if (!pathDrawn) {
            pathCoords = [];
            var d = d3.event.subject,
                active = svg.append("path").datum(d).attr("id", "linePath"),
                x0 = d3.event.x,
                y0 = d3.event.y;

            d3.event.on("drag", function() {
            var x1 = d3.event.x,
                y1 = d3.event.y,
                dx = x1 - x0,
                dy = y1 - y0;
                var coordTuple = [];
                coordTuple.push(parseInt(x1), y1);
                pathCoords.push(coordTuple);

            if (dx * dx + dy * dy > 100)
                d.push([x0 = x1, y0 = y1]);
                
            else 
                d[d.length - 1] = [x1, y1];
                active.attr("d", line);
            });
        }
    }
    
    function dragFinished() {
        pathDrawn = true;                           // clear line after each click
        //findPathLength(pathCoords);
        //console.log("path saved.. " + pathCoords);
    }
}

function plotAP() {
    APToggled = (APToggled == 0) ? 1 : 0;
    DroneToggled = 0;
    drawToggled = 0;
    document.getElementById("toggleAP").disabled = true;
    document.getElementById("toggleDrone").disabled = false;
    //document.getElementById("toggleDraw").disabled = false;
    //console.log(drawToggled);
}

function plotDrone() {
    DroneToggled = (DroneToggled == 0) ? 1 : 0;
    APToggled = 0;
    drawToggled = 0;
    document.getElementById("toggleDrone").disabled = true;
    document.getElementById("toggleAP").disabled = false;
    //document.getElementById("toggleDraw").disabled = false;
    //console.log(drawToggled);
}

function transpose(matrix) { 
    return matrix[0].map((col, c) => matrix.map((row, r) => matrix[r][c]));
}

function fillArray(n) {
    a = [];
    for (var i = 0; i < n; i++)
        a[i] = i;
    return a;
}

function csvify() {
    console.log("Saving data to file.");
    var lineArray = [];
    lineArray.push("data:text/csv;charset=utf-8");
    lineArray.push("null,SSID,RSS,Unit,Time,Batch");         /// 1st entry (null) not saved for some reason
    transposedData = transpose(totalAPStrengths);

    transposedData.forEach(function (apArray, index1) {
        apArray.forEach(function (apData, index2) { 
            apEntry = "AP" + index1 + "," + apArray[index2] + ",dBm" + ",00:00:00" + "," + index2;
            lineArray.push(apEntry);
        });
    });

    var csvContent = lineArray.join("\n");
    var encodedURI = encodeURI(csvContent);
    var downloadLink = document.createElement("a");
    downloadLink.setAttribute("href", encodedURI);
    downloadLink.setAttribute("download", "aps.csv");
    document.body.appendChild(downloadLink);
    downloadLink.click();
}

//TODO: Dynamically populate grid with loaded layout
function loadWP(wpData) {
    var dataDimensionality = wpData.substring(0,2);
    if (dataDimensionality != dimensionality) {
        alert("Error: WP Data is for " + dataDimensionality + "x"
             + dataDimensionality + " grid, not " + dimensionality + "x" + dimensionality);
        return;
    }
    loadedWPs = [];
    var jsonData = JSON.parse(wpData.substring(3));
    
    console.log(jsonData);
}

function loadAP(apData) {
    var dataDimensionality = apData.substring(0,2);
    if (dataDimensionality != dimensionality) {
        alert("Error: AP Data is for " + dataDimensionality + "x"
             + dataDimensionality + " grid, not " + dimensionality + "x" + dimensionality);
        return;
    }
    console.log("populating grid with APs!");
    loadedAPs = [];
    var jsonData = JSON.parse(apData.substring(3));

    jsonData.forEach(function(ap) {
        loadedAPs.push(ap);
    });
    plotLayout(loadedAPs);
    //console.log(loadedAPs);
}

function saveLayout() {
    console.log("saving content");
    console.log(this.id);
    var saveContent = [];
    var saveName = "";
    saveContent.push("data:text/txt;charset=utf-8");
    saveContent.push(dimensionality);

    if (this.id == "saveAP"){
        console.log("saving aps");
        var APJSON = JSON.stringify(APs);
        saveContent.push(APJSON);
        saveName = "AP_layout[" + dimensionality + "]-" + gaussianRandom(0, 1000).toString() + ".txt";
    }
    else if (this.id == "saveWP") {
        var WPJSON = JSON.stringify(WPs);
        saveContent.push(WPJSON);
        saveName = "WP_layout[" + dimensionality + "]-" + gaussianRandom(0, 1000).toString() + ".txt";
    }

    var gridData = saveContent;
    var encodedURI = encodeURI(gridData);
    var downloadLink = document.createElement("a");
    downloadLink.setAttribute("href", encodedURI);
    downloadLink.setAttribute("download", saveName);
    document.body.appendChild(downloadLink);
    downloadLink.click();
}

function loadLayout() {
    var buttonType = this.id;
    var fileInput = document.getElementById("file-input");
    $("#file-input").trigger("click");
    var fileData;
    fileInput.addEventListener('change', function(e) {
        var file = fileInput.files[0];
        var textType = /text.*/;
        if (file.type.match(textType)) {
            var reader = new FileReader();
            reader.onload = function(e) {
                fileData = reader.result;
                var jsonData = JSON.parse(fileData.substring(3));
                plotLayout(jsonData);
                //console.log(jsonData);
            }
            reader.readAsText(file);
        }
    });  
}

// Calculates length of drawn path in meters
function findPathLength(pathCoords) {
    var length = 0;                                     // Total path length
    for (var pc = 0; pc < pathCoords.length-1; pc++) {
        // x1, y1, x2, y2
        length += euclideanDistance(pixelToMeters(pathCoords[pc][0]),
                                    pixelToMeters(Math.floor(pathCoords[pc][1])),
                                    pixelToMeters(Math.floor(pathCoords[pc+1][0])),
                                    pixelToMeters(Math.floor(pathCoords[pc+1][1])));
    }
    return length;
}

// Finds appropriate square id based on supplied coordinates
function findSquareID(x, y) {
    return Math.floor(y/cellHeight) * dimensionality + Math.floor(x/cellWidth);
}

// Load AP/WP onto grid from CSV file
function plotLayout(dataToPlot) {
    if (dataToPlot[0].type == "WP") {
        WP = [];
        DroneToggled = true;
        dataToPlot.forEach(element => {
            squareID = "#square-" + findSquareID(element.x, element.y);
            d3.select(squareID).dispatch('click');
            WPs.push(element);
        });
        DroneToggled = false;
        Drone_id = dataToPlot.length;
    }
    else if (dataToPlot[0].type == "AP") {
        APs = [];
        APToggled = true;
        dataToPlot.forEach(element => {
            squareID = "#square-" + findSquareID(element.x, element.y);
            d3.select(squareID).dispatch('click');
            APs.push(element);
        });
        APToggled = false;
        AP_id = dataToPlot.length;
        //console.log(APs);
        //generateSignalIndicators();
    }
    document.getElementById("toggleDrone").disabled = false;
    document.getElementById("toggleAP").disabled = false;
}

function findOrder (APs) {
    var displayOrder = document.getElementById("queueOrder");
    displayOrder.innerHTML = "Order of APs: ";
    displayOrder.style.display = "block";

    var AP_Strengths = transpose(APs);
    var strongestBatch = -1;
    var strongestAPStrength = [];

    for (var ap = 0; ap < AP_Strengths.length; ap++) {                  // Locate when max SS occurs f.e. AP
        var maxStrength = AP_Strengths[ap][0];
        strongestBatch = -1;
        strengthBatchPair = [];
        for (var batch = 0; batch < AP_Strengths[ap].length; batch++) { // Determine in which batch strongest measurement made
            if (AP_Strengths[ap][batch] > maxStrength) {
                maxStrength = AP_Strengths[ap][batch];
                strongestBatch = batch;
            }
        }
        strongestAPStrength.push({
            name: "AP" + ap,
            strength: maxStrength,
            batchLocation: strongestBatch
        });
    }

    strongestAPStrength.sort(function(a, b) {return a.batchLocation - b.batchLocation }); // Compare when AP's max SS occured with each other
    
    for (var a = 0; a < strongestAPStrength.length; a++) {
        var apName = strongestAPStrength[a].name + " "
        $("#queueOrder").append(apName); 
    }
}


function plotDataPlotly(totalAPStrengths) {

    $("path").css('dasharray','10,0');

    if (plotted)
        Plotly.purge('strengthChart');

    transposedData = transpose(totalAPStrengths);
    //console.log(totalAPStrengths);
    //console.log(transposedData);
    var data = [];

    for (var apIndex = 0; apIndex < transposedData.length; apIndex++) {
        var oneToN = fillArray(transposedData[apIndex].length);
        var individualAPStrength = { 
            x: oneToN,
            y: transposedData[apIndex],
            mode: 'lines+markers',
            line: {shape: "linear"},
        };
        data.push(individualAPStrength);
    }
    var layout = {
        title: "AP Signal Strength",
        xaxis: {
          title: 'Probe Number',
          titlefont: {
            family: 'Courier New, monospace',
            size: 14,
            color: '#7f7f7f'
          },
          ticks: 'outside',
          tick0: 0,
          dtick: 1,
          ticklen: 4,
          tickwidth: 2,
          tickcolor: '#000',
          range: [0, totalAPStrengths.length],
        },
        yaxis: {
          title: 'Signal Strength (dBm)',
          titlefont: {
            family: 'Courier New, monospace',
            size: 14,
            color: '#7f7f7f'
          },
          //range: [-100, 0]
        }
      };

    Plotly.newPlot('strengthChart', data, layout);
    findOrder(totalAPStrengths);
    plotted = true;
}

function euclideanDistance(x1, y1, x2, y2) {
    return Math.pow(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2), 0.5);
}