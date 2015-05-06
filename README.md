#SVG Dash Meter

A no dependency SVG/JS widget. So small that once minified it has a size measured in negative kb.

SVG can make some really nice graphical UI elements but almost every library that uses SVG has a dependency of either D3, Raphael or Velocity. Whilst  all of these libraries are great I often don't want to include them for the sake of a simple UI element.

So here's the first of what I hope will be more no dependency SVG widgets.

Demo: http://codepen.io/MadeByMike/full/472b4b25c0ca707430e68dd2801fe822/

##Basic usage

```
var meter = svg_meter(elm, options);
```
###Example
```
var elm = document.getElementById('container');
var meter = svg_meter(elm, {
	value: 65,
	target: 75
});
```

##Update values

Once created you can update values without creating a new instance of the dash meter. The meter will animate from its current position to the new value.

```
setInterval(function(){
	meter.update(Math.random() * 100);
}, 4000);
```

##Options
```
{
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
}
```

Note: If you specify a `target` option the `target_shown` option will automatically be set to true. If not specified gradient stops will be set 15% either side of the target.
