'use strict';

window.io = require('socket.io-client');
// var axios = require('axios');
var d3 = require('d3');
var response = require('./response');

document.addEventListener('DOMContentLoaded', function init() {
  // this request will get the readme's html:
  // axios({
  //   method: 'get',
  //   url: '//api.github.com/repos/nio-blocks/hash_table/readme',
  //   headers: { 'Accept': 'application/vnd.github.html' }
  // })
  // axios.get('//api.github.com/orgs/nio-blocks/repos')
  // .then(function(response) {
    var data = response.data;

    var app = d3.select('#app')
    var repoTable= app.append('table').classed('nio-table nio-table--striped', true);

    var tableHeader = repoTable.append('thead').append('tr');
    tableHeader.append('th').html('Block');
    tableHeader.append('th').html('Description'),
    tableHeader.append('th').html('URL');

    var tableBody = repoTable.append('tbody')

    var rows = tableBody.selectAll('tr').data(data).enter()
        .append('tr')

    rows.selectAll('td')
      .data(function(row) {
        var link = '<a href=' + row.html_url + '/blob/master/README.md>' + row.name + '</a>';
        return [link, row.description, row.html_url];
      })
      .enter()
      .append('td')
      .html(function(d) { return d; });

  //     .append('div')
  //     .attr('class', 'tooltip')
  //     .style('opacity', 0.5)
  //     .data(function(d) {
  //       console.log('this is d', d);
  //       return d;
  //       // axios({
  //       //   method: 'get',
  //       //   url: '//api.github.com/repos/nio-blocks/' + d.name + '/readme',
  //       //   headers: { 'Accept': 'application/vnd.github.html' }
  //       // })
  //     }).html(function(d){
  //       return d.name;
  //     });
  //     rows.on("mouseover", function(){return tooltip.style("opacity", 1);})
  // .on("mousemove", function(){return tooltip.style("top",
  //   (d3.event.pageY-10)+"px").style("left",(d3.event.pageX+10)+"px");})
  // .on("mouseout", function(){return tooltip.style("opacity", 0.5);});

    return repoTable;
  // })
  // .catch(function(response) {
  //   console.log('error!');
  // });
});
