var histcatexplong = [];

    d3.csv("procesado.csv", function(data) {
        a1 = {"key": "AGROCHAL", "values" : []};
        a2 = {"key": "BBVACOL", "values" : []};
        a3 = {"key": "BCOLOMBIA", "values" : []};
        a4 = {"key": "BIOMAX", "values" : []};
        a5 = {"key": "BMC", "values" : []};
        a6 = {"key": "BVC", "values" : []};
        a7 = {"key": "CARACOLTV", "values" : []};
        a8 = {"key": "CARTON", "values" : []};
        a9 = {"key": "CELSIA", "values" : []};
        a10 = {"key": "CEMARGOS", "values" : []};

        data.forEach(function(d) {
        a1.values.push([parseInt(d.year), parseFloat(d.AGROCHAL)]);
        a2.values.push([parseInt(d.year), parseFloat(d.BBVACOL)]);
        a3.values.push([parseInt(d.year), parseFloat(d.BCOLOMBIA)]);
        a4.values.push([parseInt(d.year), parseFloat(d.BIOMAX)]);
        a5.values.push([parseInt(d.year), parseFloat(d.BMC)]);
        a6.values.push([parseInt(d.year), parseFloat(d.BVC)]);
        a7.values.push([parseInt(d.year), parseFloat(d.CARACOLTV)]);
        a8.values.push([parseInt(d.year), parseFloat(d.CARTON)]);
        a9.values.push([parseInt(d.year), parseFloat(d.CELSIA)]);
        a10.values.push([parseInt(d.year), parseFloat(d.CEMARGOS)]);


    });
    histcatexplong.push(a1);
    histcatexplong.push(a2);
    histcatexplong.push(a3);
    histcatexplong.push(a4);
    histcatexplong.push(a5);
    histcatexplong.push(a6);
    histcatexplong.push(a7);
    histcatexplong.push(a8);
    histcatexplong.push(a9);
    histcatexplong.push(a10);
});




    var colors = d3.scale.category20();

    var chart2;
    nv.addGraph(function() {
        chart2 = nv.models.stackedAreaChart()
            .useInteractiveGuideline(true)
            .x(function(d) { return d[0] })
            .y(function(d) { return d[1] })
            .controlLabels({stacked: "Stacked"})
            .duration(100);

        chart2.xAxis.tickFormat(d3.format('d'));
        chart2.yAxis.tickFormat(d3.format('d'));

        chart2.legend.vers('furious');

        d3.select('#chart2')
            .datum(histcatexplong)
            .transition().duration(200)
            .call(chart2)
            .each('start', function() {
                setTimeout(function() {
                    d3.selectAll('#chart2 *').each(function() {
                        if(this.__transition__)
                            this.__transition__.duration = 1;
                    })
                }, 0)
            });

        nv.utils.windowResize(chart2.update);
        console.log("termina");
        return chart2;
    });

    document.addEventListener("DOMContentLoaded", function (event) {
                        window.dispatchEvent(new Event('resize'));

});

    $(document).ready(function(){ window.dispatchEvent(new Event('resize')); }) 




