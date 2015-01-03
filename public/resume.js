'use strict';

var assert = require('assert');
var c3 = require('c3');
var moment = require('moment');
var $ = require('jquery');

// from: YYYY-MM, to: YYYY-MM
function Range(start, end) {
  assert(this.start <= this.end);
  this.start = start
  this.end = end
}

Range.prototype = {
  fromJson: function(json) {
    asser(json.start && json.end);
    var toDate = function (d) {
      assert(d.length === 7);
      return new Date(start.substr(0, 4), start.substr(5, 7));
    }
    return new Range(toDate(json.start), toDate(json.end));
  },

  containsDate: function(d) {
    return this.start <= d && d <= this.end;
  },

  merge: function(other) {
    return new Range(min(this.start, other.start), max(this.end, other.end));
  },

  axisArray: function() {
    var arr = ['x'];
    var from = new Date(this.from.getTime());
    while (from < this.to) {
      arr.push(moment(from).format('YYYY-MM'));
      from.setMonth(from.getMonth() + 1);
    }
    return arr;
  }
}

function Tool(data) {
  assert(data.name && data.dates, 'Illegal data')
  this.data = data
  this.ranges = _.map(function (d) { return new Range(d); }, data.dates)
}

Tool.prototype = {
  id: function () {
    if (this.id) { return id; }
    else if (this.name) { return this.name; }
    else assert(false, 'No name or id')
  },

  name: function () { return this.name; },

  range: function() {
    return _.reduce(this.ranges, function (r1, r2) { return r1.merge(r2); });
  },

  usedDuringMonth: function (d) {
    return _.some(this.ranges, function (r) { return r.containsDate(d); });
  }
}

var data = {
  "tools": [

    {"name": "Ansible",
     "dates": [
       {"start": "20140801",
        "end": "now"}],
     "comments": "Awesome"
    },

    {"name": "C++",
     "dates": [
       {"start": "20120101",
        "end": "201404"}],
     "comments": "Awesome"
    },

    {"name": "Docker",
     "dates": [
       {"start": "20140401",
        "end": "now"}],
     "comments": "Awesome"
    }

  // ,

  // "Standard ML": {
  //   "start": "1998",
  //   "end": "now",
  //   "comments": "Awesome"
  // },

  // "Ocaml": {
  //   "start": "2010",
  //   "end": "2012",
  //   "comments": "Awesome"
  // },

  // "Puppet": {
  //   "start": "201404",
  //   "end": "201408",
  //   "comments": "Awesome"
  // },

  // "Python": {
  //   "start": "2012",
  //   "end": "now",
  //   "comments": "Awesome"
  // }

  ]
};

$(document).ready(function () {
  var chart = c3.generate({
    bindto: '#tools',
    data: {
      names: {
        cpp: 'C++'
      },
      x: 'x',
      xFormat: '%Y-%m',
      columns: [
        ['x', '2013-10', '2013-11', '2013-12', '2014-01', '2014-02', '2014-03'],
        ['Docker', null, null, null, 1, 1, null],
        ['Python', 2, 2, null, null, 2, 2],
        ['cpp', null, null, null, 3, 3, 3]
      ]
    },
    tooltip: {
      format: {
        value: function (value, ratio, id, index) {
          return '';
        }
      }
    },
    axis: {
      x: {
        type: 'timeseries',
        tick: {
          format: '%Y-%m'
        }
      },
      y: {
        show: false,
        tick: {
          values: [1, 2, 3]
        },
        max: 3,
        min: 1
        // padding: {top:0, bottom:0}
      }
    }
  });
});
