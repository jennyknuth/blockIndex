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

function renderRows(data, targetElement, sortByKey, reversed) {

  var rows = targetElement.selectAll('tr')
  .data(data, function(d) {
    return d.name;
  }).sort(function(a, b) {
    if (reversed === true) {
      var temp = a;
      a = b;
      b = temp;
    }
    return d3.ascending(a[sortByKey], b[sortByKey]);
  });

  var row = rows.enter()
  .append('tr');

  row.selectAll('td').data(function(d) {
    var link = '<a class="nio-link" href=' + d.html_url + '/blob/master/README.md>' + d.name + '</a>';
    var created = moment(d.created_at).format('MMM YYYY');
    var updated = moment(d.updated_at).format('MMM YYYY');
    return [link, d.description, created, updated];
  })
  .enter()
  .append('td')
  .html(function(d) {
    return d;
  });

  rows.exit();
}

function renderTable(data) {
  var app = d3.select('#app');
  var repoTable = app.append('table').classed('nio-table nio-table--striped', true);
  var tableBody = repoTable.append('tbody');

  var tableHeader = repoTable.append('thead').append('tr');
  tableHeader.append('th').html('Block')
    .on('click', function() {
      renderRows(data, tableBody, 'name');
    });
  tableHeader.append('th').html('Description');
  tableHeader.append('th').html('Created')
    .on('click', function() {
      renderRows(data, tableBody, 'created_at', true);
    });
  tableHeader.append('th').html('Updated')
    .on('click', function() {
      renderRows(data, tableBody, 'updated_at', true);
    });

  renderRows(data, tableBody);

  return repoTable;
}

document.addEventListener('DOMContentLoaded', function init() {

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
    console.log('error connecting to github api');
  });
});
