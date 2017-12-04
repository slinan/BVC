/**
 * Created by user on 3/12/2017.
 */
// set the dimensions and margins of the graph
var marginLine = {top: 20, right: 20, bottom: 30, left: 50},
    widthLine = 960 - marginLine.left - marginLine.right,
    heightLine= 500 - marginLine.top - marginLine.bottom;

// parse the date / time
var parseTime = d3v4.timeParse("%d/%m/%Y");

// set the ranges
var xLin = d3v4.scaleTime().range([0, widthLine]);
var yLin = d3v4.scaleLinear().range([heightLine, 0]);

// define the line
var valueline = d3v4.line()
    .x(function(d) { return xLin(d.date); })
    .y(function(d) { return yLin(d.PRE_MED); })
    .defined(function (d) {
        if(d.PRE_MED == 0){
            return false
        }else
            return true;
    });

// append the svg obgect to the body of the page
// appends a 'group' element to 'svg'
// moves the 'group' element to the top left margin
var svgLine = d3v4.select("#priceChart").append("svg")
    .attr("width", widthLine + marginLine.left + marginLine.right)
    .attr("height", heightLine + marginLine.top + marginLine.bottom)
    .append("g")
    .attr("transform",
        "translate(" + marginLine.left + "," + marginLine.top + ")");

function createLineChart(NEMO, fecha) {

    dataFilter= dataConst.filter(function(d) {
        return d.NEMO == NEMO });

// format the data
    dataFilter.forEach(function (d) {
        d.date = parseTime(d.FECHA);
        d.PRE_MED = +d.PRE_MED;
    });

// Scale the range of the data
    xLin.domain(d3v4.extent(dataFilter, function (d) {return d.date;}));
    yLin.domain([0, d3v4.max(dataFilter, function (d) {
        return d.PRE_MED;
    })]);
    svgLine.selectAll("*").remove();
// Add the valueline path.
    svgLine.append("path")
        .data([dataFilter])
        .attr("class", "line")
        .attr("d", valueline);
// Add the X Axis
    svgLine.append("g")
        .attr("transform", "translate(0," + heightLine + ")")
        .call(d3v4.axisBottom(xLin)
            .ticks(24)
            .tickFormat(d3v4.timeFormat("%b %d")));

// Add the Y Axis
    svgLine.append("g")
        .call(d3v4.axisLeft(yLin));

    svgLine.append("text")
        .attr("x", (widthLine / 2))
        .attr("y", 0 - (widthLine.top / 2))
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("text-decoration", "underline")
        .text("Precio historico de la acción "+NEMO);
    svgLine.append("line")
        .attr("x1", xLin(parseTime(fecha)))
        .attr("y1",0)
        .attr("x2", xLin(parseTime(fecha)))
        .attr("y2",heightLine - marginLine.top - marginLine.bottom)
        .style("stroke-width", 2)
        .style("stroke", "red")
        .style("fill", "none");

}