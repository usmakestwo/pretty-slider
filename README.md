angular-slider
==============

Slider implementation for AngularJS, without jQuery dependencies. Requires AngularJS v1.1.4 or higher.

License: MIT

### Example:

    <ul>
        <li ng-repeat="item in items">
            <p>Name: {{item.name}}</p>
            <p>Cost: {{item.cost}}</p>
            <div slider floor="100" ceiling="1000" step="50" precision="2" ng-model="item.cost"></div>
        </li>
    </ul>

And your HTML:

    <div slider floor="100" ceiling="1000" step="50" precision="2" ng-model="item.cost"></div>

### Usage:

Make sure to load AngularJS first, and then `angular-slider.js`. Also include the related `angular-slider.css`.

To build use `gulp watch`.

The module name is named `slider`. To enable it, you must simply list it as a dependency in your app. Example:

    var app = angular.module('app', ['uiSlider', 'ngResource', ...]);

You can then use it in your templates like so:

    <html ng-app='app'>
        ...
        <body>
            ...
            <div slider ...></div>
        </body>
    </html>

#### Parameters
|Param      |Type   |Required |Default |Details |
|-----------|-------|---------|--------|--------|
|ng-model   |expression |Yes  |none    |Assignable angular expression to which to data-bind the value. |
|floor      |float  |Yes      |none    |The lowest value possible |
|ceiling    |float  |Yes      |none    |The highest value possible |
|step       |float  |No       |inf     |The width between each tick. |
|precision  |integer|No       |0       |The numerical precision to which to round the value. |
--

### Demo

You can find a demo of the slider [here](http://gonzalovazquez.ca/projects/angular-slider/).

### Known issues:

1. When having a value great than zero as a floor the fill does not account for it.

### License: MIT