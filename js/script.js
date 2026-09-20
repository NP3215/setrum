// --- DATA ---
const dataModes = {
    daily: {
        summary: {
            value: "20,8 kWh",
            desc: "-20% over day before",
            descColor: "#00C46C"
        },
        chart: {
            labels: ['06:00', '07:30', '09:00', '11:00'],
            data: [1.2, 2.5, 3.1, 4.0]
        },
        devices: [
            {
                img: "assets/ac.png",
                name: "Samsung WindFree Air Conditioner",
                usage: "Currently drawing 1,400 W",
                color: "#007AFF"
            },
            {
                img: "assets/tv.png",
                name: "Samsung Smart TV QLED",
                usage: "Currently off"
            },
            {
                img: "assets/pc.png",
                name: "Work PC",
                usage: "Currently drawing 400 W"
            },
            {
                img: "assets/lamp.png",
                name: "PHILIPS Living Room Lamp",
                usage: "Currently drawing 5 W"
            },
            {
                img: "assets/fridge.png",
                name: "Samsung BESPOKE Refrigerator",
                usage: "Currently drawing 100 W",
            },
            {
                img: "assets/airfryer.png",
                name: "PHILIPS Air Fryer",
                usage: "Currently off"
            }
        ]
    },
    monthly: {
        summary: {
            value: "1,610 kWh",
            desc: "-2% over month before",
            descColor: "#00C46C"
        },
        chart: {
            labels: ['1st January', '15th January', '31st January'],
            data: [400, 800, 900, 200]
        },
        devices: [
            {
                img: "assets/ac.png",
                name: "Samsung WindFree Air Conditioner",
                usage: "360 kWh this month"
            },
            {
                img: "assets/tv.png",
                name: "Samsung Smart TV QLED",
                usage: "12 kWh this month"
            },
            {
                img: "assets/pc.png",
                name: "Work PC",
                usage: "180 kWh this month"
            },
            {
                img: "assets/lamp.png",
                name: "PHILIPS Living Room Lamp",
                usage: "13.4 kWh this month"
            },
            {
                img: "assets/fridge.png",
                name: "Samsung BESPOKE Refrigerator",
                usage: "72 kWh this month"
            },
            {
                img: "assets/airfryer.png",
                name: "PHILIPS Air Fryer",
                usage: "13 kWh this month"
            }
        ]
    },
    annually: {
        summary: {
            value: "1,631 kWh",
            desc: "expected +5% over last year",
            descColor: "#FF6B00"
        },
        chart: {
            labels: ['January', 'February'],
            data: [600, 900]
        },
        devices: [
            {
                img: "assets/ac.png",
                name: "Samsung WindFree Air Conditioner",
                usage: "371.61 kWh this year"
            },
            {
                img: "assets/tv.png",
                name: "Samsung Smart TV QLED",
                usage: "12.39 kWh this year"
            },
            {
                img: "assets/pc.png",
                name: "Work PC",
                usage: "185.81 kWh this year"
            },
            {
                img: "assets/lamp.png",
                name: "PHILIPS Living Room Lamp",
                usage: "13.65 kWh this year"
            },
            {
                img: "assets/fridge.png",
                name: "Samsung BESPOKE Refrigerator",
                usage: "74.32kWh this year"
            },
            {
                img: "assets/airfryer.png",
                name: "PHILIPS Air Fryer",
                usage: "13.42 kWh this year"
            }
        ]
    }
};

// --- DROPDOWN OPTIONS ---
const dropdownOptions = {
    daily: [
        { value: "Real-Time", label: "Real-Time" },
        ...Array.from({ length: 30 }, (_, i) => ({ value: (i + 1).toString(), label: (i + 1).toString() }))
    ],
    monthly: [
        { value: "January", label: "January" },
        { value: "February", label: "February" },
        { value: "March", label: "March" },
        { value: "April", label: "April" },
        { value: "May", label: "May" },
        { value: "June", label: "June" },
        { value: "July", label: "July" },
        { value: "August", label: "August" },
        { value: "September", label: "September" },
        { value: "October", label: "October" },
        { value: "November", label: "November" },
        { value: "December", label: "December" }
    ],
    annually: [
        { value: "2022", label: "2022" },
        { value: "2023", label: "2023" },
        { value: "2024", label: "2024" }
    ]
};

// --- DOM ELEMENTS ---
const summaryValue = document.querySelector('.summary-card h2');
const summaryDesc = document.querySelector('.summary-desc');
const usageChartCanvas = document.getElementById('usageChart');
const deviceList = document.querySelector('.device-list');
const filterSelect = document.querySelector('.filters select');

// --- CHART ---
let usageChart;
function updateChart(mode) {
    const chartData = dataModes[mode].chart;
    if (usageChart) usageChart.destroy();
    usageChart = new Chart(usageChartCanvas.getContext('2d'), {
        type: 'line',
        data: {
            labels: chartData.labels,
            datasets: [{
                label: 'kWh',
                data: chartData.data,
                borderColor: '#007AFF',
                backgroundColor: 'rgba(0,122,255,0.08)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            plugins: { legend: { display: false } },
            scales: {
                x: { grid: { display: false } },
                y: { beginAtZero: true, grid: { color: '#eee' } }
            }
        }
    });
}

// --- SUMMARY ---
function updateSummary(mode) {
    const summary = dataModes[mode].summary;
    summaryValue.textContent = summary.value;
    summaryDesc.textContent = summary.desc;
    summaryDesc.style.color = summary.descColor;
}

// --- DEVICES ---
function updateDevices(mode) {
    const devices = dataModes[mode].devices;
    deviceList.innerHTML = '';
    devices.forEach(device => {
        const li = document.createElement('li');
        li.innerHTML = `
            <img src="${device.img}" alt="${device.name}" />
            <div>
                <span>${device.name}</span>
                <span>${device.usage}</span>
                ${device.status ? `<span class="device-status" style="color: ${device.statusColor};">${device.status}</span>` : ''}
            </div>
        `;
        deviceList.appendChild(li);
    });
}

// --- DROPDOWN UPDATE ---
function updateDropdown(mode) {
    filterSelect.innerHTML = '';
    dropdownOptions[mode].forEach(opt => {
        const option = document.createElement('option');
        option.value = opt.value;
        option.textContent = opt.label;
        filterSelect.appendChild(option);
    });
}

// --- TOGGLE LOGIC ---
document.querySelectorAll('.toggle').forEach((btn, idx) => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.toggle').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        let mode = 'daily';
        if (idx === 1) mode = 'monthly';
        if (idx === 2) mode = 'annually';
        updateSummary(mode);
        updateChart(mode);
        updateDevices(mode);
        updateDropdown(mode);
    });
});

// --- INITIALIZE ---
updateSummary('daily');
updateChart('daily');
updateDevices('daily');
updateDropdown('daily');

// --- BOTTOM NAV ---
document.querySelectorAll('.bottom-nav button').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.bottom-nav button').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
    });
});

// --- DEVICE SEARCH ---
const searchInput = document.querySelector('.devices-header input');
if (searchInput) {
    searchInput.addEventListener('input', function() {
        const filter = this.value.toLowerCase();
        document.querySelectorAll('.device-list li').forEach(li => {
            const text = li.innerText.toLowerCase();
            li.style.display = text.includes(filter) ? '' : 'none';
        });
    });
}