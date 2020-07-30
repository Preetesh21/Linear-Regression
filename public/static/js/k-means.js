let canvas = document.getElementsByTagName('canvas')[0],
    ctx = canvas.getContext('2d'),
    colors = [
        '#ED0A3F', '#0095B7', '#33CC99', '#00468C', '#0066FF', '#EE34D2', '#C88A65', '#A50B5E', '#733380', '#87421F'
    ],
    buttonAddDataPointsRandomly = document.getElementById('add-data-points-randomly'),
    buttonRemoveAllDataPoints = document.getElementById('remove-all-data-points'),
    buttonAddCentroidsManually = document.getElementById('add-centroids-manually'),
    buttonAddCentroidsRandomly = document.getElementById('add-centroids-randomly'),
    buttonRemoveAllCentroids = document.getElementById('remove-all-centroids'),
    buttonReassignDataPoints = document.getElementById('reassign-data-points'),
    buttonUpdateCentroidsPositions = document.getElementById('update-centroids-positions'),
    inputAddDataPointsRandomlyCount = document.getElementById('add-data-points-randomly-count'),
    inputAddCentroidsRandomlyCount = document.getElementById('add-centroids-randomly-count');
canvas.addEventListener('click', (e) => addNewPoint(getPointClickedOnCanvas(e)), false);
buttonAddDataPointsRandomly.addEventListener('click', () => addDataPointsRandomly(+inputAddDataPointsRandomlyCount.value), false);
buttonRemoveAllDataPoints.addEventListener('click', removeAllDataPoints, false);
buttonAddCentroidsManually.addEventListener('click', toggleAddingCentroidsManually, false);
buttonAddCentroidsRandomly.addEventListener('click', () => addCentroidsRandomly(+inputAddCentroidsRandomlyCount.value), false);
buttonRemoveAllCentroids.addEventListener('click', removeAllCentroids, false);
buttonReassignDataPoints.addEventListener('click', reassignDataPoints, false);
buttonUpdateCentroidsPositions.addEventListener('click', updateCentroidsPositions, false);
let dataPoints = [],
    centroids = [],
    dataPointsAssignedCentroids = {}, // { dataPointIndex: centroidIndex }
    addingDataPointsManually = true,
    addingCentroidsManually = false,
    steps = [
        reassignDataPoints, updateCentroidsPositions
    ];

function addNewPoint(point) {
    if (addingCentroidsManually) {
        if (tryAddNewCentroid(point)) {
            redrawAll();
        } else {
            showCentroidLimitReachedMessage();
            toggleAddingCentroidsManually();
        }
    } else if (addingDataPointsManually) {
        dataPoints.push(point);
        redrawAll();
    }
}

function drawDataPoint([x, y], index) {
    ctx.save();
    ctx.fillStyle = 'white';
    ctx.fillStyle = colors[dataPointsAssignedCentroids[index]];
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, 2 * Math.PI);
    ctx.fill();
    ctx.strokeStyle = 'white';
    ctx.restore();
}

function drawCentroid([x, y], index) {
    ctx.save()
    ctx.strokeStyle = ctx.fillStyle = colors[index];
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.save();
    ctx.arc(x, y, 8, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.restore();
    ctx.beginPath();
    ctx.arc(x, y, 6, 0, 2 * Math.PI);
    ctx.fill();
    ctx.strokeStyle = 'white';
    ctx.stroke();
    ctx.restore();
}

function getPointClickedOnCanvas(e) {
    let canvasRect = canvas.getBoundingClientRect();
    return [
        e.clientX - canvasRect.left - 1,
        e.clientY - canvasRect.top - 1
    ];
};

function addDataPointsRandomly(count) {
    for (let i = 0; i < count; ++i) {
        let newPoint;
        do {
            newPoint = [
                randInt(0, canvas.width - 1),
                randInt(0, canvas.height - 1)
            ];
        } while (newPoint in centroids);
        dataPoints.push(newPoint);
    }
    redrawAll();
}

function removeAllDataPoints() {
    dataPoints = [];
    dataPointsAssignedCentroids = {};
    redrawAll();
}

function toggleAddingCentroidsManually() {
    if (!addingCentroidsManually && isCentroidLimitReached()) {
        showCentroidLimitReachedMessage();
        return;
    }
    addingCentroidsManually = !addingCentroidsManually;
    toggleButtonText(buttonAddCentroidsManually);
    updateCanvasStyles();
}

function addCentroidsRandomly(count) {
    let limitReached = false;
    for (let i = 0; i < count; ++i) {
        let newPoint;
        do {
            newPoint = [
                randInt(0, canvas.width - 1),
                randInt(0, canvas.height - 1)
            ];
        } while (newPoint in centroids);
        if (!tryAddNewCentroid(newPoint)) {
            limitReached = true;
            break;
        }
    }
    redrawAll();
    if (limitReached) {
        showCentroidLimitReachedMessage();
    }
}

function removeAllCentroids() {
    centroids = [];
    dataPointsAssignedCentroids = {};
    redrawAll();
}

function reassignDataPoints() {
    dataPoints.map((point, pointIndex) => {
        let smallestDistance = Number.MAX_SAFE_INTEGER,
            closestCentroidIndex = undefined;
        centroids.map((centroid, centroidIndex) => {
            let dist = euclideanDistance(point, centroid);
            if (dist < smallestDistance) {
                smallestDistance = dist;
                closestCentroidIndex = centroidIndex;
            }
        });
        dataPointsAssignedCentroids[pointIndex] = closestCentroidIndex;
    });
    if (addingCentroidsManually == true) {
        addingCentroidsManually = false;
        toggleButtonText(buttonAddCentroidsManually);
    }
    redrawAll();
}

function updateCentroidsPositions() {
    centroids.map((centroid, centroidIndex) => {
        let assignedPoints = dataPoints.filter((_, pointIndex) => dataPointsAssignedCentroids[pointIndex] == centroidIndex),
            sumX = 0,
            sumY = 0;
        if (assignedPoints.length == 0)
            return;
        assignedPoints.map(([x, y]) => {
            sumX += x;
            sumY += y;
        });
        centroid[0] = sumX / assignedPoints.length;
        centroid[1] = sumY / assignedPoints.length;
    });
    if (addingCentroidsManually == true) {
        addingCentroidsManually = false;
        toggleButtonText(buttonAddCentroidsManually);
    }
    redrawAll();
}

function euclideanDistance(point1, point2) {
    return Math.sqrt(Math.pow(point1[0] - point2[0], 2) + Math.pow(point1[1] - point2[1], 2));
}

function redrawAll() {
    canvas.width = canvas.width;
    dataPoints.map(drawDataPoint);
    centroids.map(drawCentroid);
}

function tryAddNewCentroid(point) {
    if (isCentroidLimitReached()) {
        return false;
    }
    centroids.push(point);
    return true;
}

function isCentroidLimitReached() {
    return centroids.length >= colors.length;
}

function showCentroidLimitReachedMessage() {
    setTimeout(() => alert(`Sorry, reached limit of ${colors.length} colors.`), 50);
}

function toggleButtonText(button) {
    let currentText = button.innerHTML;
    button.innerHTML = button.getAttribute('data-toggle');
    button.setAttribute('data-toggle', currentText);
}

function randInt(min, max) {
    if (arguments.length == 1) {
        max = arguments[0];
        min = 0;
    }
    return Math.floor(Math.random() * (max - min + 1)) + min;
}