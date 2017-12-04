/**
 * Created by user on 3/12/2017.
 */

window.addEventListener('message', function(e) {
    var opts = e.data.opts,
        data = e.data.data;

    return main(opts, data);
});

var defaults = {
    margin: {top: 24, right: 0, bottom: 0, left: 0},
    rootname: "TOP",
    format: ",d",
    title: "",
    width: 960,
    height: 500
};
const margin = {top: 40, right: 10, bottom: 10, left: 10},
      width = 960 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom,
      color = d3.scaleOrdinal().range(d3.schemeCategory20c);

const treemap = d3.treemap().size([width, height]);

const div = d3.select("body").append("div")
    .style("position", "relative")
    .style("width", (width + margin.left + margin.right) + "px")
    .style("height", (height + margin.top + margin.bottom) + "px")
    .style("left", margin.left + "px")
    .style("top", margin.top + "px");

d3.csv("bvc_2016_2017.csv", function(error, data) {
  if (error) {throw error;}
  console.log(data[0]);
  var fecha = "4/01/2016";
  data = data.filter(function(d) { return d.FECHA  == fecha;});
  console.log(data);

  sectores = d3.map(data, function(d){return d.SECTOR;}).keys();
  console.log(sectores);
  sectores.forEach(function (d) {
     data.push({"NEMO": d, "SECTOR":"BVC"})
  })
  data.push({"NEMO": "BVC", "SECTOR":""})

  var root = d3.stratify()
      .id(function(d){ return d.NEMO})
      .parentId(function (d) { return d.SECTOR })
      (data);

  root.sum(function (d) { return d.VOLUMEN })
  const tree = treemap(root);

  const node = div.datum(root).selectAll(".node")
      .data(tree.leaves())
    .enter().append("div")
      .attr("class", "node")
      .style("left", (d) => d.x0 + "px")
      .style("top", (d) => d.y0 + "px")
      .style("width", (d) => Math.max(0, d.x1 - d.x0 - 1) + "px")
      .style("height", (d) => Math.max(0, d.y1 - d.y0  - 1) + "px")
      .style("background", (d) => color(d.parent.data.NEMO))
      .text((d) => d.data.NEMO);

  d3.selectAll("input").on("change", function change() {
    const value = this.value === "count"
        ? (d) => { return d.VOLUMEN ? 1 : 0;}
        : (d) => { return d.VOLUMEN; };

    var newRoot = d3.stratify()
      .id(function(d){ return d.NEMO})
      .parentId(function (d) { return d.SECTOR })
      (data);
    newRoot.sum(value)


    node.data(treemap(newRoot).leaves())
      .transition()
        .duration(1500)
        .style("left", (d) => d.x0 + "px")
        .style("top", (d) => d.y0 + "px")
        .style("width", (d) => Math.max(0, d.x1 - d.x0 - 1) + "px")
        .style("height", (d) => Math.max(0, d.y1 - d.y0  - 1) + "px")
  });
});
