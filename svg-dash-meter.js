function svg_meter(elm, options){
	var raf, rafID;
	var defaults = {
		target: 75,
		show_target: false,
		value: 1,
		min:0,
		max:100,
		width: 160,
		duration: 1000,
		gradient: [
			{r:0,g:200,b:0},
			{r:240,g:240,b:0},
			{r:200,g:0,b:0}
		],
		stops: [60, 75, 90]
	};
  	// If a target is set make sure the target indicator is shown
	if(!!options.target && !options.show_target){
		options.show_target = true;
	}
   	// If a target is set but no stops define the stops relative to the target
	if(!!options.target && !options.stops){
		options.stops = [
			options.target - (options.max || defaults.max) *0.15,
			options.target,
			options.target + (options.max || defaults.max )*0.15
		];
	}
   
	//This is not a complete Pollyfill of RAF - just enough to support older IE in this situation
	if(!!window.requestAnimationFrame){
		raf = window.requestAnimationFrame;
	} else {
		raf = function(cb){
			return window.setTimeout(cb, 16);
		};
	}
	
	// Utility function to extend options
	var extend = function ( defaults, options ) {
		var extended = {};
		var prop;
		for (prop in defaults) {
			if (Object.prototype.hasOwnProperty.call(defaults, prop)) {
				extended[prop] = defaults[prop];
			}
		}
		for (prop in options) {
			if (Object.prototype.hasOwnProperty.call(options, prop)) {
				extended[prop] = options[prop];
			}
		}
		return extended;
	};
	 
	options = extend(defaults, options);
	
	// Start createing the SVG elements
	var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");

	svg.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink");
	svg.setAttribute('width', options.width);
	svg.setAttribute('height', '30');
	
	// Using CSS for color tranistions cause smooth
	var styles = document.createElementNS('http://www.w3.org/2000/svg','style');
	styles.innerHTML = ".meter-fill{transition: fill "+options.duration/1000+"s ease; fill:green}";
	svg.appendChild(styles);

	var meter_bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
	meter_bg.setAttribute('fill', '#999999');
	meter_bg.setAttribute('x', '5');
	meter_bg.setAttribute('y', '5');
	meter_bg.setAttribute('width', options.width - 10);
	meter_bg.setAttribute('height', '20');
	svg.appendChild(meter_bg);

	var meter_fill = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
	meter_fill.setAttribute('class', 'meter-fill');
	meter_fill.setAttribute('style', 'fill:rgb(0,240,0)');
	meter_fill.setAttribute('x', '5');
	meter_fill.setAttribute('y', '5');
	meter_fill.setAttribute('width', '1');
	meter_fill.setAttribute('height', '20');
	svg.appendChild(meter_fill);

	var target_indicator = document.createElementNS('http://www.w3.org/2000/svg', 'line');
	target_indicator.setAttribute('stroke-dasharray', '2 2');
	target_indicator.setAttribute('stroke', '#555555');
	target_indicator.setAttribute('stroke-width', '2px');
	target_indicator.setAttribute('x1', 0);
	target_indicator.setAttribute('x2', 0);
	target_indicator.setAttribute('y1', '0');
	target_indicator.setAttribute('y2', '30');
	if(options.show_target){
		svg.appendChild(target_indicator);
	}
	
	elm.appendChild(svg);

	var animateMeter = function(targetWidth, targetColour){
		// Getting good preformance when setting SVG attributes with JS can be dificult
		// Comparing the current time for each frame to the time the animation started 
		// allows us to work out the percentage complete and ensure that the animation
		// always completed over a specified duration, skipping frames if required.
		meter_fill.setAttribute('style', 'fill:'+targetColour);
		var currentValue;
    var startValue = parseFloat(meter_fill.getAttribute('width'));
		var endValue = targetWidth;
		var timeStart = (new Date).getTime();
			
		var animationFrame = function() {

			var timeCurrent = (new Date).getTime();
			var percentComplete = Math.min((timeCurrent - timeStart) / options.duration, 1);

			if (percentComplete === 1) {
				currentValue = endValue;
				meter_fill.setAttribute('width', currentValue);
			} else {
				currentValue = startValue + ((endValue - startValue) * percentComplete);
				meter_fill.setAttribute('width', currentValue);
				rafID = raf(animationFrame);
			}
			
		};
		
		rafID = raf(animationFrame);
	}
	
	function pointOnGrad(n1,n2,p){
		// Returns a point between 2 numbers at a given %
		return Math.round(n1+((n2-n1)*p));
	}
	
	var update = function(value){
		
		options.value = value;
		var targetWidth, targetColour, indicatorPos, p;
		
		// If the target value is outside the min\max range set it to either the min or the max value
		value = (value < options.min) ? options.min : value;
		value = (value > options.max) ? options.max : value;
		
		targetWidth = (value/options.max)*(options.width-10);
		indicatorPos = ((options.target/options.max)*(options.width-10))+5;
		
		// Move the indicator
		target_indicator.setAttribute('x1', indicatorPos);
		target_indicator.setAttribute('x2', indicatorPos);
		
		// p representes the target point between 2 colors stops as a %
		// To mix a colour simply find the point between each of the 2 rgb values 
		if(value < options.stops[0] ){
			targetColour= 'rgb('+options.gradient[0].r+','+options.gradient[0].g+','+options.gradient[0].b+')';
		} else if (value < options.stops[1] ){
			p = (value - options.stops[0]) / (options.stops[1] - options.stops[0]);
			targetColour= 'rgb('+pointOnGrad(options.gradient[0].r,options.gradient[1].r,p)+','+pointOnGrad(options.gradient[0].g,options.gradient[1].g,p)+','+pointOnGrad(options.gradient[0].b,options.gradient[1].b,p)+')';
		} else if (value < options.stops[2] ){
			p = (value - options.stops[1]) / (options.stops[2] - options.stops[1]);
			targetColour= 'rgb('+pointOnGrad(options.gradient[1].r,options.gradient[2].r,p)+','+pointOnGrad(options.gradient[1].g,options.gradient[2].g,p)+','+pointOnGrad(options.gradient[1].b,options.gradient[2].b,p)+')';
		} else {
			targetColour= 'rgb('+options.gradient[2].r+','+options.gradient[2].g+','+options.gradient[2].b+')';
		}
		
		animateMeter(targetWidth, targetColour);
	}

	update(options.value);

	return { update:update };

}
