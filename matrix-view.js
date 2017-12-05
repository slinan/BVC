var margind = {top: 220, right: 180, bottom: 100, left: 220},
    widthd = 750,
    heightd = 750;

var x = d3.scale.ordinal().rangeBands([0, widthd]),
    z = d3.scale.linear().domain([0, 4]).clamp(true),
    c = d3.scale.category10().domain(d3.range(10))
    value = 0;

var svgd = d3.select("#header2").append("svg")
    .attr("id","svgd")
    .attr("width", widthd + margind.left + margind.right)
    .attr("height", heightd + margind.top + margind.bottom)
    .style("margin-left", -margind.left + "px")
    .append("g")
    .attr("transform", "translate(" + margind.left + "," + margind.top + ")");

var div = d3.select("body").append("div") 
    .attr("class", "tooltip")       
    .style("opacity", 0);

d3.json("miserables.json", function(miserables) {
  var matrix = [],
      nodes = miserables.nodes,
      links = miserables.links,
      n = nodes.length,
      sampleCategoricalData =[];

  // Compute index per node.
  nodes.forEach(function(node, i) {
    node.index = i;
    node.count = 0;
    console.log(node);
    matrix[i] = d3.range(n).map(function(j) { return {x: j, y: i, z: 0, value: node.index}; });
  });

  // Convert links to matrix; count character occurrences.
  links.forEach(function(link) {
    matrix[link.source][link.target].z = link.peso;
    // matrix[link.target][link.source].z += 4;
    // matrix[link.source][link.source].z += 4;
    // matrix[link.target][link.target].z += 4;
    nodes[link.source].count++;
    nodes[link.target].count++;
    sampleCategoricalData[nodes[link.source].group] = nodes[link.source].region;
  });

  verticalLegend = d3.svg.legend().labelFormat("none")
  .cellPadding(7).orientation("vertical")
  .units("Sector").cellWidth(25).cellHeight(18)
  .inputScale(c,sampleCategoricalData).cellStepping(10);

  d3.selectAll("#svgd")
  .append("g").attr("transform", "translate("+(widthd+300)+",250)")
  .attr("class", "legend").call(verticalLegend);

  


  // Precompute the orders.
  var orders = {
   name: d3.range(n).sort(function(a, b) { return d3.ascending(nodes[a].name, nodes[b].name); }),
   count: d3.range(n).sort(function(a, b) { return nodes[b].count - nodes[a].count; }),
   group: d3.range(n).sort(function(a, b) { return nodes[a].group - nodes[b].group; })
  };

  // The default sort order.
  x.domain(orders.name);

  svgd.append("rect")
      .attr("class", "bobson")
      .attr("fill", "#f7f7f7")
      .attr("width", widthd)
      .attr("height", heightd);

  var row = svgd.selectAll(".row")
      .data(matrix)
      .enter().append("g")
      .attr("class", "row")
      .attr("transform", function(d, i) { return "translate(0," + x(i) + ")"; })
      .each(row);

  row.append("line")
      .attr("x2", widthd)
      .attr("fill", "white");

  row.append("text")
      .attr("x", -6)
      .attr("y", x.rangeBand() / 2)
      .attr("dy", ".32em")
      .attr("text-anchor", "end")
      .text(function(d, i) { return nodes[i].name; });

  var column = svgd.selectAll(".column")
      .data(matrix)
    .enter().append("g")
      .attr("class", "column")
      .attr("transform", function(d, i) { return "translate(" + x(i) + ")rotate(-90)"; });

  column.append("line")
      .attr("x1", -widthd);

  column.append("text")
      .attr("x", 6)
      .attr("y", x.rangeBand() / 2)
      .attr("margin-left","20px")
      .attr("dy", ".32em")
      .attr("text-anchor", "start")
      .text(function(d, i) { return nodes[i].name; });

  function row(row) {
    var cell = d3.select(this).selectAll(".cell")
        .data(row.filter(function(d) { return d.z; }))
      .enter().append("rect")
        .attr("class", "cell")
        .attr("x", function(d) { return x(d.x); })
        .attr("width", x.rangeBand())
        .attr("height", x.rangeBand())
        .style("fill", function(d) { return c(d.z); })
        .on("mouseover", mouseover)
        .on("mouseout", mouseout);
  }

  
  function mouseover(p) {
    d3.selectAll(".row text").classed("active", function(d, i) { return i == p.y; });
    d3.selectAll(".column text").classed("active", function(d, i) { return i == p.x; });
    d3.select(this)
    .style("opacity", .6);
    div.transition()  
    .duration(200)    
    .style("opacity", .9);  
    var icon ='"ion-leaf"'  
    div.html("<i class=<b> Correlación</b></br>" + p.z)
    .style("left", (d3.event.pageX + 15 ) + "px")   
    .style("top", (d3.event.pageY - 45) + "px");
                                 
  }

  function mouseout() {
    d3.selectAll("text").classed("active", false);
     d3.select(this)
     .style("opacity", 1);
     div.transition()    
     .duration(500)    
     .style("opacity", 0);
  }

});