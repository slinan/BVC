/**
 * Created by user on 3/12/2017.
 */

var el_id = 'chart';
var obj = document.getElementById(el_id);
var divWidth = obj.offsetWidth;
var margin = {top: 30, right: 0, bottom: 20, left: 0},
    width = divWidth -25,
    height = 500 - margin.top - margin.bottom,
    formatNumber = d3v4.format(","),
    transitioning;
// sets x and y scale to determine size of visible boxes
var x = d3v4.scaleLinear()
    .domain([0, width])
    .range([0, width]);
var y = d3v4.scaleLinear()
    .domain([0, height])
    .range([0, height]);
var treemap = d3v4.treemap()
    .size([width, height])
    .paddingInner(0)
    .round(false);
var svg = d3v4.select('#'+el_id).append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.bottom + margin.top)
    .style("margin-left", -margin.left + "px")
    .style("margin.right", -margin.right + "px")
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    .style("shape-rendering", "crispEdges");
var grandparent = svg.append("g")
    .attr("class", "grandparent");
grandparent.append("rect")
    .attr("y", -margin.top)
    .attr("width", width)
    .attr("height", margin.top)
    .attr("fill", '#bbbbbb');
grandparent.append("text")
    .attr("x", 6)
    .attr("y", 6 - margin.top)
    .attr("dy", ".75em");
var color = d3v4.scaleOrdinal().range(d3v4.schemeCategory20c);

var dataConst;

d3v4.csv("bvc_2016_2017.csv", function(error, data) {
    var fechaInicial = d3v4.select('#date1')['_groups'][0][0].value;
    var fechaFinal = d3v4.select('#date2')['_groups'][0][0].value;
    sectores = d3v4.map(data, function(d){return d.SECTOR;}).keys();
    console.log(sectores);
    sectores.forEach(function (d) {
        data.push({"NEMO": d, "SECTOR":"BVC"})
    })
    data.push({"NEMO": "BVC", "SECTOR":""})


    dataConst = data;


    fechaInicial = moment(fechaInicial, 'D/MM/YYYY', false);
    fechaFinal  = moment(fechaFinal, 'D/MM/YYYY', false);
    data = data.filter(function(d) {
        fecha = moment(d.FECHA, 'D/MM/YYYY', false);
        return fecha.isBetween(fechaInicial, fechaFinal, null, "[]") });



    var root = d3v4.stratify()
        .id(function(d){ return d.NEMO})
        .parentId(function (d) { return d.SECTOR })
        (data);

    root.sum(function (d) { return d.VOLUMEN })
    treemap(root
        .sort(function (a, b) {
            return b.height - a.height || b.value - a.value
        })
    );
    display(root);
});

function display(d) {
        // write text into grandparent
        // and activate click's handler
        grandparent
            .datum(d.parent)
            .on("click", transition)
            .select("text")
            .text(breadcrumbs(d));
        // grandparent color
        grandparent
            .datum(d.parent)
            .select("rect")
            .attr("fill", function () {
                return '#bbbbbb'
            });
        var g1 = svg.insert("g", ".grandparent")
            .datum(d)
            .attr("class", "depth");
        var g = g1.selectAll("g")
            .data(d.children)
            .enter().
            append("g");
        // add class and click handler to all g's with children
        g.filter(function (d) {return d.children;})
            .attr("class", "children")
            .style("cursor", "pointer")
            .on("click", transition);
        g.selectAll(".child")
            .data(function (d) {
                return d.children || [d];
            })
            .enter().append("rect")
            .attr("class", "child")
            .call(rect);
        // add title to parents
        g.append("rect")
            .attr("class", "parent")
            .call(rect)
            .append("title")
            .text(function (d){
                return name(d);
            });
        /* Adding a foreign object instead of a text object, allows for text wrapping */
        g.append("foreignObject")
            .call(rect)
            .attr("class", "foreignobj")
            .on("mouseover",function (d) {
                if(!(d.data.FECHA == undefined)){
                    createLineChart(d.data.NEMO, d.data.FECHA);
                }
            })
            .append("xhtml:div")
            .attr("title", function(d) {
                return name(d);
            })
            .html(function (d) {
                if(d.data.RAZON_SOCIAL  == undefined){
                    return '' +
                    '<p class="title">' + name(d) + '</p>' +
                    '<p>' + formatNumber(d.value) + '</p>'
                    ;
                }
                return '' +
                    '<p class="title">' + name(d) + '</p>' +
                    '<p class="title">' + d.data.RAZON_SOCIAL + '</p>' +
                    '<p>' + d.data.FECHA + '</p>'+
                    '<p>' + formatNumber(d.value) + '</p>'
                    ;
            })
            .attr("class", "textdiv"); //textdiv class allows us to style the text easily with CSS
        function transition(d) {
            if (transitioning || !d) return;
            transitioning = true;
            var g2 = display(d),
                t1 = g1.transition().duration(650),
                t2 = g2.transition().duration(650);
            // Update the domain only after entering new elements.
            x.domain([d.x0, d.x1]);
            y.domain([d.y0, d.y1]);
            // Enable anti-aliasing during the transition.
            svg.style("shape-rendering", null);
            // Draw child nodes on top of parent nodes.
            svg.selectAll(".depth").sort(function (a, b) {
                return a.depth - b.depth;
            });
            // Fade-in entering text.
            g2.selectAll("text").style("fill-opacity", 0);
            g2.selectAll("foreignObject div").style("display", "none");
            /*added*/
            // Transition to the new view.
            t1.selectAll("text").call(text).style("fill-opacity", 0);
            t2.selectAll("text").call(text).style("fill-opacity", 1);
            t1.selectAll("rect").call(rect);
            t2.selectAll("rect").call(rect);
            /* Foreign object */
            t1.selectAll(".textdiv").style("display", "none");
            /* added */
            t1.selectAll(".foreignobj").call(foreign);
            /* added */
            t2.selectAll(".textdiv").style("display", "block");
            /* added */
            t2.selectAll(".foreignobj").call(foreign);
            /* added */
            // Remove the old node when the transition is finished.
            t1.on("end.remove", function(){
                this.remove();
                transitioning = false;
            });
        }
        return g;
    }
    function text(text) {
        text.attr("x", function (d) {
            return x(d.x) + 6;
        })
            .attr("y", function (d) {
                return y(d.y) + 6;
            });
    }
    function rect(rect) {
        rect
            .attr("x", function (d) {
                return x(d.x0);
            })
            .attr("y", function (d) {
                return y(d.y0);
            })
            .attr("width", function (d) {
                return x(d.x1) - x(d.x0);
            })
            .attr("height", function (d) {
                return y(d.y1) - y(d.y0);
            })
            .attr("fill", function (d) {
                return color(d.data.SECTOR);
            });
    }
    function foreign(foreign) { /* added */
        foreign
            .attr("x", function (d) {
                return x(d.x0);
            })
            .attr("y", function (d) {
                return y(d.y0);
            })
            .attr("width", function (d) {
                return x(d.x1) - x(d.x0);
            })
            .attr("height", function (d) {
                return y(d.y1) - y(d.y0);
            });
    }
    function name(d) {
        return d.data.NEMO;
    }
    function breadcrumbs(d) {
        var res = "";
        var sep = " > ";
        d.ancestors().reverse().forEach(function(i){
            res += name(i) + sep;
        });
        res = res
            .split(sep)
            .filter(function(i){
                return i!== "";
            })
            .join(sep);
        return res +
            (d.parent
                ? " - Haga click aqui para reducir acercamiento"
                : " - Haga click dentro de un sector para hacer acercamiento");
    }

function changeDate(){
    var fechaInicial = d3v4.select('#date1')['_groups'][0][0].value;
    var fechaFinal = d3v4.select('#date2')['_groups'][0][0].value;
    fechaInicial = moment(fechaInicial, 'D/MM/YYYY', false);
    fechaFinal  = moment(fechaFinal, 'D/MM/YYYY', false);
    dataFilter= dataConst.filter(function(d) {
        fecha = moment(d.FECHA, 'D/MM/YYYY', false);
        return fecha.isBetween(fechaInicial, fechaFinal, null, "[]") });

    var root = d3v4.stratify()
        .id(function(d){ return d.NEMO})
        .parentId(function (d) { return d.SECTOR })
        (dataFilter);

    root.sum(function (d) { return d.VOLUMEN });
    treemap(root
        .sort(function (a, b) {
            return b.height - a.height || b.value - a.value
        })
    );
    svg.selectAll(".depth").remove();
    display(root);
}

