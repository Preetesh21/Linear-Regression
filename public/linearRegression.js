var training = [];
const lrSlider = document.querySelector("#lrslider")
lrSlider.addEventListener('change', e => {
    document.querySelector('#lr').innerHTML = e.target.value
})
var b = 0;
var m = 0;
var iterations = 0;

function costFunction() {
    sum = 0;
    for (let i = 0; i < training.length; i++) {
        // Guess according to the current line
        guess = m * training[i].x + b
            // Error is the difference from the actual y value of our data
        error = guess - training[i].y
        sum += error * error
    }
    let avg = sum / training.length
    return avg
}

function gradientDescent() {
    let deltaB = 0;
    let deltaM = 0;
    // Iterate through training data, and update cost function
    for (let i = 0; i < training.length; i++) {
        let x = training[i].x
        let y = training[i].y
        let yguess = m * x + b
        let error = y - yguess
            // 
        deltaB += (1 / training.length) * error;
        deltaM += (1 / training.length) * error * x
    }
    let learning_rate = lrSlider.value
    b += (deltaB * learning_rate)
    m += (deltaM * learning_rate)
}

function handleClick(e) {
    const { clientX, clientY } = e
    const rect = dataPlot.getBoundingClientRect()
    let canvasX = clientX - rect.left
    let canvasY = clientY - rect.top
        // Convert canvas points to planar coordinates
    let { x, y } = convertPoint({ x: canvasX, y: canvasY }, rect)
        // Scale to the interval [0,1]
    x = x / rect.width
    y = y / rect.height
    training.push({ x, y })
    plotData()
}

function plotData() {
    const rect = dataPlot.getBoundingClientRect()
    let ctx = dataPlot.getContext('2d');

    for (let i = 0; i < training.length; i++) {
        let x = training[i].x * rect.width
        let y = training[i].y * rect.height
        let canvasPoint = convertPoint({ x, y }, rect)
        ctx.beginPath()
        ctx.arc(canvasPoint.x, canvasPoint.y, 4, 0, 2 * Math.PI, true)
        ctx.fill();
    }
}

function drawLine() {
    let rect = dataPlot.getBoundingClientRect()
    let ctx = dataPlot.getContext('2d');
    let lineStart = convertPoint({ x: 0, y: b * rect.height }, rect)
    let lineEnd = convertPoint({ x: rect.width, y: ((m * rect.width) + b * rect.height) }, rect)
    ctx.beginPath()
    ctx.moveTo(lineStart.x, lineStart.y)
    ctx.lineTo(lineEnd.x, lineEnd.y)
    ctx.strokeStyle = `rgb(${getRandomInt(0,256)},${getRandomInt(0,256)},${getRandomInt(0,256)})`
    ctx.stroke()
    ctx.closePath();
}

function clearLines() {
    clearCanvas(dataPlot)
    plotData()
}

function clearCanvas(canvas) {
    canvas.getContext('2d').clearRect(0, 0, dataPlot.width, dataPlot.height);
}

function convertPoint(point, canvas) {
    let { x, y } = point
    y = canvas.height - y
    return { x, y }
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}
const dataPlot = document.querySelector('#data-plot')
dataPlotCtx = dataPlot.getContext('2d')
dataPlotCtx.font = "15px Arial";
dataPlotCtx.fillText("Click to add some data", 10, 25);
dataPlot.addEventListener('click', handleClick)

function repeat() {
    let error = costFunction();
    gradientDescent();
    drawLine();
    document.querySelector('#line-eqn').innerHTML = `y = ${(m * 10).toPrecision(4)}x + ${(b * 10).toPrecision(4)}`;
    document.querySelector('#error').innerHTML = `Current Mean Squared Error: ${error.toPrecision(3)}`;
    iterations += 1;
    document.querySelector('#it').innerHTML = iterations;
}

const runBtn = document.querySelector('#run-btn')
runBtn.addEventListener('click', () => {
    if (training.length == 0) {
        return document.querySelector('#line-eqn').innerHTML = 'Try adding some data first';
    }
    perform();

})

function perform() {
    let cc = 10;

    while (cc > 0) {
        console.log(iterations);
        iterations = iterations + 1;
        cc = cc - 1;
        repeat();
        sleep(500)
    }
}


const clearLinesBtn = document.querySelector('#clear-lines')
clearLinesBtn.addEventListener('click', clearLines)

const clearAllBtn = document.querySelector('#clear-all')
clearAllBtn.addEventListener('click', () => {
    clearCanvas(dataPlot)
    training = []
    iterations = 0
    document.querySelector('#line-eqn').innerHTML = ''
})

function sleep(milliseconds) {
    var start = new Date().getTime();
    for (var i = 0; i < 1e7; i++) {
        if ((new Date().getTime() - start) > milliseconds) {
            break;
        }
    }
}