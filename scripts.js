// scripts.js
const apiUrl = 'https://fedskillstest.coalitiontechnologies.workers.dev';
const username = 'coalition';
const password = 'skills-test';
const auth = `Basic ${btoa(`${username}:${password}`)}`;

const headers = {
    'Authorization': auth,
    'Content-Type': 'application/json',
};

fetch(apiUrl, { headers })
    .then(response => response.json())
    .then(data => {
        const patientData = data.find(patient => patient.name === 'Jessica Taylor');
        console.log(patientData);
        if (patientData) {
            updatePatientInfo(patientData);
            updateVitalSigns(patientData);
            updateDiagnosticList(patientData);
            updateLabResults(patientData);
            createBloodPressureChart(patientData);
            updateBloodPressureLegend(patientData);
        }
    })
    .catch(error => console.error('Error fetching data:', error));

function updatePatientInfo(data) {
    console.log('profile picture updated:', data.profile_picture);

    // h2
    document.getElementById('patient-name-main').textContent = data.name;
    const mainAvatarElement = document.getElementById('patient-avatar-main');
    mainAvatarElement.src = data.profile_picture;
    mainAvatarElement.alt = data.name;

    // list
    document.getElementById('patient-name-list').textContent = data.name;
    const listAvatarElement = document.getElementById('patient-avatar-list');
    listAvatarElement.src = data.profile_picture;
    listAvatarElement.alt = data.name;
    document.getElementById('patient-subheading').textContent = `${data.gender}, ${data.age}`;

    const dateOfBirth = new Date(data.date_of_birth);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDateOfBirth = dateOfBirth.toLocaleDateString('en-US', options);

    document.getElementById('date-of-birth').textContent = formattedDateOfBirth;
    document.getElementById('gender').textContent = data.gender;
    document.getElementById('contact-info').textContent = data.phone_number;
    document.getElementById('emergency-contacts').textContent = data.emergency_contact;
    document.getElementById('insurance-provider').textContent = data.insurance_type;
}

function updateVitalSigns(data) {
    const latestDiagnosis = data.diagnosis_history[0];

    document.getElementById('respiratory-rate').textContent = latestDiagnosis.respiratory_rate.value;
    document.getElementById('respiratory-status').textContent = latestDiagnosis.respiratory_rate.levels;

    document.getElementById('temperature').textContent = latestDiagnosis.temperature.value;
    document.getElementById('temperature-status').textContent = latestDiagnosis.temperature.levels;

    document.getElementById('heart-rate').textContent = latestDiagnosis.heart_rate.value;
    document.getElementById('heart-rate-status').textContent = latestDiagnosis.heart_rate.levels;
}

function updateDiagnosticList(data) {
    const tbody = document.querySelector('#diagnostic-table tbody');
    data.diagnostic_list.forEach(diagnostic => {
        const row = tbody.insertRow();
        row.insertCell(0).textContent = diagnostic.name;
        row.insertCell(1).textContent = diagnostic.description;
        row.insertCell(2).textContent = diagnostic.status;
    });
}

function updateLabResults(data) {
    const labResultsList = document.getElementById('lab-results-list');
    data.lab_results.forEach(result => {
        const li = document.createElement('li');
        li.innerHTML = `
        <span>${result}</span>
        <a href="#" class="download-icon">
                <img src="img/download/download.png" alt="Download">
        </a>
        `;
        labResultsList.appendChild(li);
    });
}

function createBloodPressureChart(data) {
    const ctx = document.getElementById('blood-pressure-chart').getContext('2d');
    const lastSixMonths = (arr) => arr.slice(0, 6).reverse();
    const labels = lastSixMonths(data.diagnosis_history.map(entry => `${entry.month} ${entry.year}`));
    const systolicData = lastSixMonths(data.diagnosis_history.map(entry => entry.blood_pressure.systolic.value));
    const diastolicData = lastSixMonths(data.diagnosis_history.map(entry => entry.blood_pressure.diastolic.value));

    console.log("Full diagnosis history:", data.diagnosis_history);
    console.log(labels);
    console.log("systolic", systolicData);
    console.log("diastolic", diastolicData);
    
    requestAnimationFrame(() => {
        new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Systolic',
                    data: systolicData,
                    borderColor: '#E66FD2',
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    tension: 0.4,
                    pointRadius: 6,
                    pointBackgroundColor: '#E66FD2',
                    pointBorderWidth: 2,
                    pointHoverRadius: 8,

                },
                {
                    label: 'Diastolic',
                    data: diastolicData,
                    borderColor: '#8C6FE6',
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    tension: 0.4,
                    pointRadius: 6,
                    pointBackgroundColor: '#8C6FE6',
                    pointBorderWidth: 2,
                    pointHoverRadius: 8,
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false,
                },
            },
            scales: {
                x: {
                    grid: {
                        display: false,
                    },
                    ticks: {
                        callback: function (value, index, values) {
                            const label = this.getLabelForValue(value);
                            const [month, year] = label.split(' ');
                            return month.substring(0, 3) + ', ' + year;
                        },
                        font: {
                            size: 12,
                            weight: 400,
                        },
                    },
                },
                y: {
                    beginAtZero: false,
                    min: 60,
                    max: 180,
                    ticks: {
                        stepSize: 20,
                        font: {
                            size: 12,
                            weight: 400,
                        },
                    },
                    grid: {
                        color: '#E5E5E5',
                        drawBorder: false,
                    },
                }
            },
            elements: {
                line: {
                    borderWidth: 3,
                },
                point: {
                    radius: 6,
                    borderRadius: 8,
                }
            },
        }
    });
    });
}

function updateBloodPressureLegend(data) {
    const latestData = data.diagnosis_history[0];
    document.getElementById('systolic-value').textContent = latestData.blood_pressure.systolic.value;
    document.getElementById('systolic-status').textContent = latestData.blood_pressure.systolic.levels;
    document.getElementById('diastolic-value').textContent = latestData.blood_pressure.diastolic.value;
    document.getElementById('diastolic-status').textContent = latestData.blood_pressure.diastolic.levels;
}

document.addEventListener('DOMContentLoaded', function () {
    document.querySelector('.menu-toggle').addEventListener('click', function () {
        document.querySelector('nav ul').classList.toggle('show');
    });
});