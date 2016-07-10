'use strict';

window.io = require('socket.io-client');
var axios = require('axios');
var d3 = require('d3');
var moment = require('moment');

function parse_link_header(header) {
  if (header.length === 0) {
    throw new Error('input must not be longer than 0');
  }

  // Split parts by comma
  var parts = header.split(',');
  var links = {};
  // Parse each part into a named link
  for (var i = 0; i < parts.length; i++) {
    var section = parts[i].split(';');
    if (section.length !== 2) {
      throw new Error("section could not be split on ';'");
    }
    var url = section[0].replace(/<(.*)>/, '$1').trim();
    var name = section[1].replace(/rel="(.*)"/, '$1').trim();
    links[name] = url;
  }
  return links;
}

function renderTable(data) {
  data.sort(function(a, b) {return (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0);});
  var app = d3.select('#app');
  var repoTable = app.append('table').classed('nio-table nio-table--striped', true);

  var tableHeader = repoTable.append('thead').append('tr');
  tableHeader.append('th').html('Block');
  tableHeader.append('th').html('Description'),
  tableHeader.append('th').html('Created'),
  tableHeader.append('th').html('Updated');

  var tableBody = repoTable.append('tbody');

  var rows = tableBody.selectAll('tr').data(data).enter()
  .append('tr');

  rows.selectAll('td')
  .data(function(row) {
    var link = '<a class="nio-link" href=' + row.html_url + '/blob/master/README.md>' + row.name + '</a>';
    var created = moment(row.created_at).format('MMM YYYY');
    var updated = moment(row.created_at).format('MMM YYYY');
    return [link, row.description, created, updated];
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
}

document.addEventListener('DOMContentLoaded', function init() {
  // this request will get the readme's html:
  // axios({
  //   method: 'get',
  //   url: '//api.github.com/repos/nio-blocks/hash_table/readme',
  //   headers: { 'Accept': 'application/vnd.github.html' }
  // }

  axios.get('//api.github.com/orgs/nio-blocks/repos?per_page=100')
  .then(function(response) {
    var data = response.data;
    var link_header = parse_link_header(response.headers.link);
    if (link_header.next) {
      axios.get(link_header.next)
      .then(function(nextResponse) {
        var newData = nextResponse.data;
        link_header = parse_link_header(nextResponse.headers.link);
        data = data.concat(newData);
        renderTable(data);
      });
    } else {
      renderTable(data);
    }
  })
  .catch(function(response) {
    console.log('error!');
  });
});
