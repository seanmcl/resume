/*global require, document*/
var $ = require('jquery');
var _ = require('lodash');
var assert = require('assert');
var c3 = require('c3');
var moment = require('moment');
var resumeData = require('./resume.json');

function Range(start, end, job) {
  'use strict';
  assert(start instanceof Date);
  assert(end instanceof Date);
  assert(start <= end);
  this.start = start;
  this.end = end;
  this.job = job;
}

Range.now = function () {
  'use strict';
  var now = new Date();
  return new Range(now, now);
};

Range.fromJson = function (json) {
  'use strict';
  assert(json.start && json.end && json.job);
  var toDate = function (d) {
    if (d === 'now') { return new Date(); }
    assert(d.length === 7, 'Date not of the form YYYY-MM: ' + d);
    // Months of Date object are 0-11, so subtract 1
    return new Date(d.substr(0, 4), d.substr(5, 7) - 1);
  };
  return new Range(toDate(json.start), toDate(json.end), json.job);
};

Range.prototype = {
  containsDate: function (d) {
    'use strict';
    assert (d instanceof Date);
    return this.start <= d && d <= this.end;
  },

  merge: function (other) {
    'use strict';
    assert (other instanceof Range);
    var start = this.start < other.start ? this.start : other.start;
    var end = this.end > other.end ? this.end : other.end;
    return new Range(start, end);
  },

  months: function () {
    'use strict';
    var i = new Date(this.start.getTime());
    var months = [];
    while (+i <= +this.end) {
      months.push(new Date(i.getTime()));
      i.setMonth(i.getMonth() + 1);
    }
    return months;
  },

  axisArray: function () {
    'use strict';
    var arr = ['x'];
    var start = new Date(this.start.getTime());
    while (start < this.end) {
      arr.push(moment(start).format('YYYY-MM'));
      start.setMonth(start.getMonth() + 1);
    }
    return arr;
  }
};

function Tool(data) {
  'use strict';
  assert(data.name && data.dates, 'Illegal data');
  this.data = data;
  this.ranges = _.map(data.dates, function (d) {
    return Range.fromJson(d);
  });
  this.kind = data.kind;
}

Tool.prototype = {
  id: function () {
    'use strict';
    return this.data.id || this.data.name;
  },

  name: function () {
    'use strict';
    return this.data.name;
  },

  range: function () {
    'use strict';
    return _.reduce(this.ranges, function (r1, r2) { return r1.merge(r2); });
  },

  rangeOfMonth: function (d) {
    'use strict';
    assert (d instanceof Date);
    return _.find(this.ranges, function (r) { return r.containsDate(d); });
  },

  monthArray: function (range, value) {
    'use strict';
    assert (range instanceof Range);
    var tool = this;
    // The column data begins with the id of the tool.  E.g.
    // ['Docker', null, null, 3, 3, 3, ...]
    var arr = [this.id()];
    _.each(range.months(), function (m) {
      arr.push(tool.rangeOfMonth(m) ? value : null);
    });
    return arr;
  },

  jobOfIndex: function (range, index) {
    'use strict';
    assert (range instanceof Range);
    return this.rangeOfMonth(range.months()[index]).job;
  }
};

function ToolSet(json, kind) {
  'use strict';
  var allTools = _.map(json, function (t) { return new Tool(t); });
  this.tools = kind ? _.filter(allTools, function (t) { return t.kind === kind; }) : allTools;
}

ToolSet.prototype = {
  length: function () {
    'use strict';
    return this.tools.length;
  },

  range: function () {
    'use strict';
    return _.reduce(this.tools, function (r, t) {
      return r.merge(t.range());
    }, Range.now());
  },

  names: function () {
    'use strict';
    return _.reduce(this.tools, function (obj, t) {
      obj[t.id()] = t.name();
      return obj;
    }, {});
  },

  columns: function () {
    'use strict';
    var range = this.range();
    var cols = [range.axisArray()];
    for (var i = 0; i < this.tools.length; i++) {
      cols.push(this.tools[i].monthArray(range, i));
    }
    return cols;
  },

  tooltip: function (value, index) {
    'use strict';
    return this.tools[value].jobOfIndex(this.range(), index) || '';
  },

  chart: function(bindto) {
    'use strict';
    var toolset = this;
    return c3.generate({
      bindto: bindto,
      data: {
        names: this.names(),
        x: 'x',
        xFormat: '%Y-%m',
        columns: this.columns()
      },
      tooltip: {
        format: {
          value: function (value, ratio, id, index) {
            return toolset.tooltip(value, index);
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
            values: _.range(this.length())
          }
        }
      }
    });
  }
};

$(document).ready(function () {
  'use strict';
  new ToolSet(resumeData.tools, 'Languages').chart('#languages');
  new ToolSet(resumeData.tools, 'Tools').chart('#tools');
});
