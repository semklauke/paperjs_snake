// -- Global Vars
var _settings = {
    backgroundColor: "black",
    numberOfSnakes: 120,
    snakeLength: 40,
    maxNewDegree: 75,
    minNewDegree: 20,
    minNewLength: 10,
    maxNewLength: 25,
    strokeWidth: 10,
    angleStep: 10
};

var _possibleAngles = [];
var _snakes = [];

// -- Helper functions

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomHexColor() {
    return '#'+Math.floor(Math.random()*16777215).toString(16);
}

function isInBounds(point, bounds) {
    if (point.x < 0 || point.y < 0 || point.x>bounds.width || point.y>bounds.height)
        return false;
    else
        return true;
}

function validateAngle(angle) {
    if (angle > 180)
        angle = angle-360;
    return angle;
}

function angleToPoint(angle) {
    let ratio;
    let y;
    angle = validateAngle(angle);
    if (angle >= 0) {
        y = 10;
    } else {
        y = -10;
    }
    return new paper.Point(Math.abs(y)*Math.abs(angle/180), y);
}

for (var pa=0; pa < 361; pa+=_settings.angleStep) _possibleAngles.push(pa <= 180 ? pa : pa-360);
function getPossibleAngle() {
    return _possibleAngles[Math.floor(Math.random()*_possibleAngles.length)];
}


function getNextPoint(snake) {
    
    let deltaAngle = randomInt(_settings.minNewDegree, _settings.maxNewDegree)
    if (Math.random() > 0.5)
        deltaAngle *= (-1);
    let newAngle = validateAngle(snake.angle+(deltaAngle));
    snake.angle=newAngle;
    let calcPoint = angleToPoint(newAngle);    
    calcPoint.length = randomInt(_settings.minNewLength, _settings.maxNewLength);
    let returnPoint = snake.path.firstSegment.point.add(calcPoint);
    return returnPoint;
}

function getNewSnake(bounds) {
    let angle = getPossibleAngle();
    let startingPositions = [];
    if (angle <= 170 && angle >= 10) //top
        startingPositions.push(new paper.Point(randomInt(10, bounds.width-10), 0));
    if (angle <= 100 && angle >= -100) //right
        startingPositions.push(new paper.Point(bounds.width, randomInt(10, bounds.height-10)));
    if (angle <= -10 && angle >= -170) //bottom
        startingPositions.push(new paper.Point(randomInt(10, bounds.width-10), bounds.height));
    if (angle <= 80 && angle >= -80) //left
        startingPositions.push(new paper.Point(0, randomInt(10, bounds.height-10)));

    if (startingPositions.length == 0)
        return getNewSnake(bounds);

    let startingPosition = startingPositions[randomInt(0, startingPositions.length-1)];
    var path = new paper.Path();
    path.strokeWidth = _settings.strokeWidth;
    path.strokeColor = randomHexColor();
    path.strokeCap = 'round';
    path.strokeJoin = 'round';
    path.insert(0,startingPosition);
    return { path: path, angle: angle };
}

function shiftSnake(snake) {
    if (snake.path.length < _settings.snakeLength) {
        let newPoint = getNextPoint(snake);
        snake.path.insert(0, newPoint);
    } else {
        snake.path.removeSegment(_settings.snakeLength-1);
        snake.path.insert(0, getNextPoint(snake));
    }
    snake.path.smooth();
    return isInBounds(snake.path.lastSegment.point, paper.view.bounds);
}


// -- Canvas drawing

let canvas = document.getElementById("snakepit");
paper.setup(canvas); // view is set up from here on

let background = new paper.Path.Rectangle({
    rectangle: paper.view.bounds,
    fillColor: _settings.backgroundColor
});

for (var init = 0; init <= _settings.numberOfSnakes; init++) {
    _snakes.push(getNewSnake(paper.view.bounds));
}
paper.view.draw();

function shift() {
    for (var i = 0; i < _settings.numberOfSnakes; i++) {
        var item = _snakes[i];
        shiftSnake(item);
    }
    paper.view.draw();
}
paper.view.onFrame = function(event) {
    if (event.count % 2 == 0) {
    for (var i = 0; i < _settings.numberOfSnakes; i++) {
        var item = _snakes[i];
        if(!shiftSnake(item)) {
            item.path.remove();
            _snakes[i]=getNewSnake(paper.view.bounds);
        }
    }
}
}