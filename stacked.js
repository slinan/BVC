
var stackedData = []
var mapai = {}
var chart2;
var empresas = {'CEMARGOS':'CEMARGOS','BCOLOMBIA':'CEMARGOS','BIOMAX':'CEMARGOS'}
var fechas = {}

loadGraph();

function updateSuperComparison()
{   
    var values = $('#tablela').val();
    values.forEach(function(value) {
        empresas[value] = value
    });
    chart2 = {}

     d3.select('#chart2').html("");

    loadGraph();

}

function loadData()
{
d3.csv('bvc.csv', function(data)
{
    fechas = {}
    data.forEach(function(entry) {
    fecha = new Date((entry.FECHA.trim()).split("/").reverse().join("/")).getTime();
    nemo = entry.NEMO.trim();

        if(empresas[nemo])
        {
        fechas[fecha] = fechas[fecha] || {'arreglo':[], 'fecha':fecha}
        fechas[fecha]['arreglo'].push(nemo)
        }


    });

        fechasArray = Object.values(fechas);

        for (var i = 0; i < fechasArray.length; i++) {
            
            if(fechasArray[i]['arreglo'].length != Object.values(empresas).length)
           {
            delete fechas[fechasArray[i]['fecha']]
           }       
        }

        console.log(fechas)


    data.forEach(function(entry) {
    nemo = entry.NEMO.trim();
    fecha = new Date((entry.FECHA.trim()).split("/").reverse().join("/")).getTime();
    volumen = entry.VOLUMEN.trim();

        if(!mapai[nemo] && (empresas[nemo]))
        {
            mapai[nemo] = {"key": nemo, "values":[]}
        }

        if(empresas[nemo] && fechas[fecha])
        {
        mapai[nemo].values.push([fecha, volumen])

        }
});


        delete mapai['ICOLRISK']
        delete mapai['GRUBOLIVAR']
        delete mapai['TITAN']

        stackedData = Object.values(mapai);
        d3.select('#chart2')
      .datum(stackedData)
      .call(chart2);

    nv.utils.windowResize(chart2.update);
});
}


function loadGraph()
{
    loadData();
  nv.addGraph(function() {
    chart2 = nv.models.stackedAreaChart()
                  .margin({right: 100})
                  .x(function(d) { return d[0] })   //We can modify the data accessor functions...
                  .y(function(d) { return d[1] })   //...in case your data is formatted differently.
                  .useInteractiveGuideline(true)    //Tooltips which show all data points. Very nice!
                  .rightAlignYAxis(true)      //Let's move the y-axis to the right side.
                  .showControls(true)       //Allow user to choose 'Stacked', 'Stream', 'Expanded' mode.
                  .clipEdge(true);

    //Format x-axis labels with custom function.
    chart2.xAxis
        .tickFormat(function(d) { 
          return d3.time.format('%x')(new Date(d)) 
    });

    chart2.yAxis
        .tickFormat(d3.format(',.2f'));

    nv.utils.windowResize(chart2.update);

    return chart2;
  });
}




