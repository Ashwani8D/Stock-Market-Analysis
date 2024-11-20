
// Define the default stock symbol and time range
let st = "AAPL";
let currentRange = '5y';

// Fetch and display the initial data
FetchAndCreatChart(currentRange, st);
getStocks(st);
getStats(st);

// Event listeners for range buttons
document.getElementById('btn1d').addEventListener('click', () => updateChart('1mo'));
document.getElementById('btn1mo').addEventListener('click', () => updateChart('3mo'));
document.getElementById('btn1y').addEventListener('click', () => updateChart('1y'));
document.getElementById('btn5y').addEventListener('click', () => updateChart('5y'));

// Function to update the chart based on the selected time range
function updateChart(range) {
    currentRange = range; // Update the current range
    FetchAndCreatChart(currentRange, st); // Fetch and create chart for the new range
}

// Function to fetch and create the chart
async function FetchAndCreatChart(rang = "5y", symbol = "AAPL") {
    const url = "https://stocksapi-uhe1.onrender.com/api/stocks/getstocksdata";
    st = symbol;

    try {
        const response = await fetch(url);
        const result = await response.json();
        let chartdata = result.stocksData[0][symbol][rang].value;
        let label = result.stocksData[0][symbol][rang].timeStamp;
        label = label.map((timeStamp) => new Date(timeStamp * 1000).toLocaleDateString());

        drawChart(chartdata, label, symbol);
    } catch (err) {
        console.log(err);
    }
}

// ... Rest of your code remains the same




// let st = "AAPL";
// FetchAndCreatChart('5y', st);

// getStocks(st);
// getStats(st);

async function getStatusinList(symbol) {
    const url = "https://stocksapi-uhe1.onrender.com/api/stocks/getstockstatsdata";
    let bookvalue;
    let profit;

    try {
        const response = await fetch(url);
        const result = await response.json();
        bookvalue = result.stocksStatsData[0][symbol].bookValue;
        profit = result.stocksStatsData[0][symbol].profit;
    } catch (err) {
        console.log(err);
    }
    return {
        bookvalue,
        profit
    };
}

async function RenderList() {
    const list = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'PYPL', 'TSLA', 'JPM', 'NVDA', 'NFLX', 'DIS'];
    const listEl = document.getElementById('stock-list');

    for (let stock of list) {
        const { bookvalue, profit } = await getStatusinList(stock);
        const listItem = document.createElement('div');

        const name = document.createElement('button');
        name.classList.add('btn');
        const bookV = document.createElement('span');
        bookV.className = 'spnone';
        const proft = document.createElement('span');
        proft.className = 'spntwo';
        name.textContent = stock;
        bookV.textContent = `$${bookvalue}`;

        proft.textContent = `   ${profit}%`;
    

        

        if (profit > 0) {
            proft.setAttribute('style', 'color:green');
        } else {
            proft.setAttribute('style', 'color:red');
        }

        listItem.append(name, bookV, proft);
        listEl.append(listItem);

        name.addEventListener("click", () => {
            // Function call to update graph and description
            FetchAndCreatChart('5y', stock);
            getStocks(stock);
            getStats(stock);
        });
    }
}

RenderList();

async function FetchAndCreatChart(rang = "5y", symbol = "AAPL") {
    const url = "https://stocksapi-uhe1.onrender.com/api/stocks/getstocksdata";
    st = symbol;

    try {
        const response = await fetch(url);
        const result = await response.json();
        let chartdata = result.stocksData[0][symbol][rang].value;
        let label = result.stocksData[0][symbol][rang].timeStamp;
        label = label.map((timeStamp) => new Date(timeStamp * 1000).toLocaleDateString());

        drawChart(chartdata, label, symbol);
    } catch (err) {
        console.log(err);
    }

    // Function to draw the chart on the canvas
    function drawChart(data, labels, symbol) {
        const canvas = document.getElementById('chartCanvas');
        const ctx = canvas.getContext('2d');
        const chartHeight = canvas.height - 40;
        const chartWidth = canvas.width - 60;
        const dataMax = Math.max(...data);
        const dataMin = Math.min(...data);
        const dataRange = dataMax - dataMin;
        const dataStep = dataRange > 0 ? chartHeight / dataRange : 0;
        const stepX = chartWidth / (data.length - 1);

        // Clear the canvas at the beginning
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw the chart
        ctx.beginPath();
        ctx.moveTo(0, chartHeight - (data[0] - dataMin) * dataStep);
        for (let i = 1; i < data.length; i++) {
            ctx.lineTo(i * stepX, chartHeight - (data[i] - dataMin) * dataStep);
        }
        ctx.strokeStyle = '#39FF14';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw a dotted horizontal line for value 0
        ctx.beginPath();
        ctx.setLineDash([2, 2]);
        const zeroY = chartHeight - (0 - dataMin) * dataStep;
        ctx.moveTo(0, zeroY);
        ctx.lineTo(canvas.width, zeroY);
        ctx.strokeStyle = '#ccc';
        ctx.stroke();
        ctx.setLineDash([]); // Reset the line dash

        // Show tooltip and x-axis value on hover
        const tooltip = document.getElementById('tooltip');
        const xAxisLabel = document.getElementById('xAxisLabel');

        canvas.addEventListener('mousemove', (event) => {
            const x = event.offsetX;
            const y = event.offsetY;
            const dataIndex = Math.min(Math.floor(x / stepX), data.length - 1); // Ensure not to go out of bounds
            const stockValue = data[dataIndex].toFixed(2);
            const xAxisValue = labels[dataIndex];

            tooltip.style.display = 'block';
            tooltip.style.left = `${x + 10}px`;
            tooltip.style.top = `${y - 20}px`;
            tooltip.textContent = `${symbol}: $${stockValue}`;

            xAxisLabel.style.display = 'block';
            xAxisLabel.style.fontSize = '14px';
            xAxisLabel.style.fontWeight = 'bolder';
            xAxisLabel.style.left = `${x}px`;
            xAxisLabel.textContent = xAxisValue;

            // Clear the canvas except for the vertical line and data point
            ctx.clearRect(0, 0, canvas.width, chartHeight);
            ctx.clearRect(0, chartHeight + 20, canvas.width, canvas.height - chartHeight - 20);

            // Draw the chart again
            ctx.beginPath();
            ctx.moveTo(0, chartHeight - (data[0] - dataMin) * dataStep);
            for (let i = 1; i < data.length; i++) {
                ctx.lineTo(i * stepX, chartHeight - (data[i] - dataMin) * dataStep);
            }
            ctx.strokeStyle = '#39FF14';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Draw the dotted horizontal line for value 0
            ctx.beginPath();
            ctx.setLineDash([2, 2]);
            ctx.moveTo(0, zeroY);
            ctx.lineTo(canvas.width, zeroY);
            ctx.strokeStyle = '#ccc';
            ctx.stroke();
            ctx.setLineDash([]); // Reset the line dash

            // Draw a vertical line at the current x position when hovering over the chart
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, chartHeight);
            ctx.strokeStyle = '#ccc';
            ctx.stroke();

            // Draw the data point as a bolder ball
            ctx.beginPath();
            ctx.arc(x, chartHeight - (data[dataIndex] - dataMin) * dataStep, 6, 0, 2 * Math.PI);
            ctx.fillStyle = '#39FF14';
            ctx.fill();
        });

        canvas.addEventListener('mouseout', () => {
            tooltip.style.display = 'none';
            xAxisLabel.style.display = 'none';
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            drawChart(data, labels, symbol); // Recursive call to redraw the chart
        });
    }
}

async function getStocks(symbol) {
    const url = "https://stocksapi-uhe1.onrender.com/api/stocks/getstocksprofiledata";

    try {
        const response = await fetch(url);
        const result = await response.json();
        const stockSummary = document.getElementById('summary');
        stockSummary.querySelector('p').textContent = result.stocksProfileData[0][symbol].summary;
    } catch (error) {
        console.error(error);
    }
}

async function getStats(symbol) {
    const url = "https://stocksapi-uhe1.onrender.com/api/stocks/getstockstatsdata";

    try {
        const response = await fetch(url);
        const result = await response.json();
        const bookValue = result.stocksStatsData[0][symbol].bookValue;
        const profit = result.stocksStatsData[0][symbol].profit;

        const stockSummary = document.getElementById('summary');
        stockSummary.querySelector('#name').textContent = symbol;

        const profitElement = document.getElementById('profit');
        profitElement.textContent = `${profit}%`;
        profitElement.style.color = profit > 0 ? 'green' : 'red';

        document.getElementById('bookValue').textContent = `$${bookValue}`;
    } catch (err) {
        console.log(err);
    }
}


