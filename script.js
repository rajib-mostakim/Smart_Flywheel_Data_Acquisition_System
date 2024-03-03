let data = [];
let holderMass;
let observationNo = 1;
let diameter;
let height;

function addData() {
    const attachedMass = parseFloat(document.getElementById('attachedMass').value);
    const time = parseFloat(document.getElementById('time').value);
    const diameter = parseFloat(document.getElementById('diameter').value);
    const height = parseFloat(document.getElementById('height').value);
    const holderMass = parseFloat(document.getElementById('holderMass').value);
    const flywheelMass = parseFloat(document.getElementById('flywheelMass').value);

    if (isNaN(attachedMass) || isNaN(time) || isNaN(diameter) || isNaN(height)) {
        alert('Please enter valid numeric values.');
        return;
    }

    const totalMass = holderMass + attachedMass;

    data.push({
        attachedMass: attachedMass,
        totalMass: totalMass,
        time: time,
        diameter: diameter,
        height: height,
        flywheelMass: flywheelMass,
        observationNo: observationNo
    });

    alert('Observation ' + observationNo + ' added.');
    observationNo++;

    // Clear attachedMass, time input for the next observation
    document.getElementById('attachedMass').value = '';
    document.getElementById('time').value = '';
}

function generateGraph() {
    if (data.length < 1) {
        alert('Please add data before generating the graph.');
        return;
    }

    const xData = data.map(item => item.time ** 2);
    const yData = data.map(item => item.totalMass * ((9.81 * item.time ** 2) - 2 * item.height));

    const trace = {
        x: xData,
        y: yData,
        mode: 'markers',
        type: 'scatter',
        name: 'Experimental Value'
    };

    const regression = fitLine(xData, yData);

    const layout = {
        title: 'Variation of m(gt<sup>2</sup>-2h) with t<sup>2</sup>',
        xaxis: {
            title: 't<sup>2</sup> (sec<sup>2</sup>)'
        },
        yaxis: {
            title: ' m(gt<sup>2</sup>-2h) (kg-m)'
        },
        legend: {
            x: 0,
            y: 1
        },
        autosize: true,
        width: 600,
        height: 500
    };

    Plotly.newPlot('graph', [trace, regression], layout);
}

function fitLine(xData, yData) {
    const xAvg = average(xData);
    const yAvg = average(yData);

    const numerator = xData.reduce((acc, x, i) => acc + (x - xAvg) * (yData[i] - yAvg), 0);
    const denominator = xData.reduce((acc, x) => acc + (x - xAvg) ** 2, 0);

    const slope = numerator / denominator;
    const intercept = yAvg - slope * xAvg;

    const line = xData.map(x => slope * x + intercept);

    const FLYWHEELMASS_DATA = data.map(item => item.flywheelMass);
    const DIAMETER_DATA = data.map(item => item.diameter);
    const HEIGHT_DATA= data.map(item => item.height);

    const FLYWHEELMASS = average(FLYWHEELMASS_DATA);
    const DIAMETER = average(DIAMETER_DATA);
    const HEIGHT = average(HEIGHT_DATA);



    const diameterSquared = DIAMETER ** 2;
    const heightFactor = 8 * HEIGHT;
    const MOI = (diameterSquared / heightFactor) * intercept;

    const ROG = Math.sqrt(MOI / FLYWHEELMASS);

    const FT = (DIAMETER / 2) * slope;


    // Display the equation
    document.getElementById('equation').innerHTML = `Best Fitted Line: y = ${slope.toFixed(3)}x + ${intercept.toFixed(2)}`;
    document.getElementById('inertia').innerHTML = `Mass Moment of Inertia, I = ${MOI.toFixed(3)} kg-m<sup>2</sup>`;
    document.getElementById('gyration').innerHTML = `Radius of Gyration, K = ${ROG.toFixed(3)} m`;
    document.getElementById('friction').innerHTML = `Frictional Torque, T<sub>f</sub> = ${FT.toFixed(3)} Nm`;

    return {
        x: xData,
        y: line,
        mode: 'lines',
        type: 'scatter',
        name: 'Best Fitted Linear Regression',
        line: {
            color: 'red'
        }
    };
}

function average(array) {
    return array.reduce((acc, val) => acc + val, 0) / array.length;
}

function saveGraphAsPDF() {
    alert('Graph saved as PDF.');
}

function resetHolderMass() {
    holderMass = parseFloat(document.getElementById('holderMass').value);
    if (isNaN(holderMass)) {
        alert('Please enter a valid numeric value for Holder Mass.');
        return;
    }
    document.getElementById('holderMass').value = '';
}
function resetDiameter() {
    diameter = parseFloat(document.getElementById('diameter').value);
    if (isNaN(diameter)) {
        alert('Please enter a valid numeric value for Diameter of the shaft.');
        return;
    }
    document.getElementById('diameter').value = '';
}
function resetHeight() {
    height = parseFloat(document.getElementById('height').value);
    if (isNaN(height)) {
        alert('Please enter a valid numeric value for Height.');
        return;
    }
    document.getElementById('height').value = '';
}

function resetflywheelMass() {
    flywheelMass = parseFloat(document.getElementById('flywheelMass').value);
    if (isNaN(flywheelMass)) {
        alert('Please enter a valid numeric value for Flywheel Mass.');
        return;
    }
    document.getElementById('flywheelMass').value = '';
}

function generateDatasheet() {
    let datasheet = '<table border="1">';
    datasheet += '<tr><th>Observation No</th><th>Attached Mass, m2 - (kg)</th>';
    datasheet += '<th>Total Mass, m=m1 + m2 - (kg)</th><th>Time of Fall, t - (sec)</th>';
    datasheet += '<th>t^2 (sec^2)</th><th>m(gt^2-2h) (kg-m)</th></tr>';

    data.forEach((observation, i) => {
        const attachedMass = observation.attachedMass;
        const totalMass = observation.totalMass;
        const time = observation.time;
        const tSquared = time ** 2;
        const calculatedValue = totalMass * ((9.81 * time ** 2) - 2 * observation.height);

        datasheet += `<tr><td>${i + 1}</td><td>${attachedMass}</td>`;
        datasheet += `<td>${totalMass.toFixed(2)}</td><td>${time}</td>`;
        datasheet += `<td>${tSquared.toFixed(2)}</td><td>${calculatedValue.toFixed(2)}</td></tr>`;
    });

    datasheet += '</table>';

    const datasheetWindow = window.open('', '_blank');
    datasheetWindow.document.write(datasheet);
    datasheetWindow.document.write('<button onclick="saveDatasheetAsPDF()">Save Datasheet as PDF</button>');
}

function saveDatasheetAsPDF() {
    alert('Datasheet saved as PDF.');
}