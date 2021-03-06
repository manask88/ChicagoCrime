// This is a manifest file that'll be compiled into application.js, which will include all the files
// listed below.
//
// Any JavaScript/Coffee file within this directory, lib/assets/javascripts, vendor/assets/javascripts,
// or vendor/assets/javascripts of plugins, if any, can be referenced here using a relative path.
//
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// the compiled file.
//
// WARNING: THE FIRST BLANK LINE MARKS THE END OF WHAT'S TO BE PROCESSED, ANY BLANK LINE SHOULD
// GO AFTER THE REQUIRES BELOW.
//
//= require jquery
//= require jquery_ujs
//= require modernizr-2.6.2-respond-1.1.0.min
//= require underscore-min
//= require raphael-min
//= require kartograph.min
//= require_tree .


//= require bootstrap


function draw_tooltip_map(ward_data){
  // instantiate the map object
  var tooltip_ward_map = $K.map('#tooltip-map',800,600);
  
  // load the SVG file
  tooltip_ward_map.loadMap('wards.svg', function(){

  
// add the map layer
    tooltip_ward_map.addLayer('chicago', {
      // for a complete list of SVG style properties, consult: 
      // http://www.w3.org/TR/SVG/propidx.html
      styles : {

        // heavy border stroke
        'stroke-width': '1.5px'
      }
		})
    layer = tooltip_ward_map.getLayer('chicago');

    // for each ward, attach the ward data to the
    // DOM object for the ward's path. This data
    // is used to create the content for the tooltips
    for(ward in ward_data){
      var path = layer.getPaths({ward: ward});
      var node = path[0].svgPath.node;
      jQuery.data(node,"signups", ward_data[path[0].data.ward]);
      jQuery.data(node,"ward", path[0].data.ward);    
    }

    // same code as the heat map
    tooltip_ward_map.getLayer('chicago').style({
      fill: function(d){ 
            return color_for_value(ward_data[d.ward], ward_data);
        }
    });

    // when the user hovers over a ward, the fill
    // of the ward is set to hover_color
    var hover_color = "#ccc";
    $("#tooltip-map path.chicago").each(function(idx, obj){
      // for each ward, setup the hover actions
      $(obj).bind("mouseenter", function(){ 
        // store the color of the ward pre-hover, so we
        // can reset the color when the user hovers
        // over another ward.
        $(obj).data('previous-fill-color', $(obj).attr('fill'));
        $(obj).attr("fill", hover_color); 
      });

      $(obj).bind("mouseleave", function(){
        console.log($(obj).data('previous-fill-color'));
        $(obj).attr("fill", $(obj).data('previous-fill-color'));
      });

      var number_of_signups = $.data(obj,'signups');
      $(obj).tooltip({
        container: 'body', 
        animation: false, 
        placement: 'left', 
        title:     "Ward " + $.data(obj,'ward') + ": " +  
                   (number_of_signups || '0') + " crime" + 
                   (number_of_signups == 1 ? '' : 's') 
      });
    });      
  });        
}

// Given a value, val, find the appropriate color for it, 
// given the range of data points in all_values
function color_for_value(val, all_values){

  // colors for map, in increasing darkness
  var color_range = ["#4e8a21", "#91b52b",  
                    "#faec37", "#e78b21", "#da1903"];

  // find all uniq values in all_values, return them sorted
  var counts = _.sortBy(_.uniq(_.values(all_values)), 
    function(a){ return a; } 
  );

  // pop zeros, will plot as blank regions
  //if(counts[0] == 0 ){ counts.shift() }

  // find the index of the given value in 
  // the sorted collection of all values
  index_of_val = _.indexOf(counts, val);  

  // use the index of the value to calculate 
  // the index of the corresponding color
  color_index = Math.floor(
    (index_of_val / counts.length) * color_range.length
  );

  return color_range[color_index];
}

$.getJSON("output.json", function(data){
//50 wards. Put 0 if not present
   for(var i = 1; i<=50; i++){ 
	if(!data[i]){
		data[i]=0
	}
   }
   delete data[""];
   draw_tooltip_map(data);
});
