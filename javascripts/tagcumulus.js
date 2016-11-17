/**
 * An animated, rotating cloud of words, based on flash
 *
 * Usage prequisities:
 * - Include the js files http://word-cumulus-goog-vis.googlecode.com/svn/trunk/swfobject.js
 * and http://word-cumulus-goog-vis.googlecode.com/svn/trunk/wordcumulus.js
 *
 * Options:
 * - text_color (e.g., '#ff0000')
 * - hover_text_color
 * - height (in px, default = 300)
 * - width (in px, default = 400)
 * - speed (default = 100, higher means faster rotation)
 */

var gviz_word_cumulus = {};

gviz_word_cumulus.WordCumulus = function(container) {
  /**
   * The container on which to draw this chart.
   * @type {Element}
   * @private
   */
  this.container_ = container || {};
};

gviz_word_cumulus.WordCumulus.prototype.draw = function(data, options) {
  this.data_ = data;
  options = options || {};
  var url = "/assets/tagcloud.swf";
  var params = {};

  var attributes = {};
  attributes['allowScriptAccess'] = 'always';
  attributes['wmode'] = 'transparent'; // To resolve z-index issue on FF.
  attributes['id'] = this.container_.id;

  var flashvars = {
    'mode' : 'tags',
    'distr' : 'false',
    'tcolor' : (options.text_color || '#ff0000').replace('#', '0x'),
    'hcolor' : (options.hover_text_color || '#000000').replace('#','0x'),
    'speed' : (options.speed || 100)
  };
  var tags_xml = "<tags>";
  for (var row = 0; row < data.getNumberOfRows(); row++) {
    var label = data.getFormattedValue(row, 0);
    var uri = data.getFormattedValue(row, 1);
    var font_size = 10;
    if (data.getNumberOfColumns() > 2) {
      font_size = data.getFormattedValue(row, 2);
    }
    var tag = "<a href='" + uri + "' style='font-size:" +  String(font_size) + "pt;'>" + label + "</a>";
    tags_xml = tags_xml + tag;
  }
  tags_xml = tags_xml + "</tags>";
  flashvars["tagcloud"] = tags_xml;
  swfobject.embedSWF(url, this.container_.id, (options.width || 400), (options.height || 300), '10', '', flashvars, params,
      attributes);
};

// Straight Away!
google.load('visualization', '1', {'packages': ['annotatedtimeline']});

// Called when the Visualization API is loaded.
function drawVisualization(json_data) {
    // Create and populate a data table.
    var data = new google.visualization.DataTable();
    data.addColumn('string', 'Tag');
    data.addColumn('string', 'URL');
    data.addColumn('number', 'Font size');

    //Define an array of 3-part tuples below
    //We're substituting them in via Python so there's a placeholder
    data.addRows(json_data.length);
    for (var i = 0; i < json_data.length; i++) {
        var url = window.location.protocol + '//' + window.location.host + json_data[i][1];
        data.setCell(i, 0, json_data[i][0]); // Tag
        data.setCell(i, 1, url); // URL for tag
        data.setCell(i, 2, 2 + 1.5 * (parseInt(json_data[i][2]) || 10)); // Font size for tag
    }

    // Instantiate our table object.
    var vis = new gviz_word_cumulus.WordCumulus(document.getElementById('tag-cloud'));

    // Draw our table with the data we created locally.
    vis.draw(data, {text_color: '#4C4C4C', speed: 50, width:220, height:220});
}

$(document).ready(function(){
    $.ajax({
        'async': true,
        'global': false,
        'url': '/javascripts/tag.json',
        'dataType': "json",
        'success': function (data) {
            // Set callback to run when API is loaded
            google.setOnLoadCallback(drawVisualization(data));
        }
    });
});
