/**
 * Crypto Scenario Simulator
 * Interactive AI module for stress-testing portfolios
 */

let simulationDebounceTimer;

/**
 * Initialize the Simulator UI events
 */
function initSimulator() {
    const shockInput = document.getElementById('simulatorShockInput');

    if (shockInput) {
        shockInput.addEventListener('input', (e) => {
            const val = e.target.value;
            updateShockDisplay(val);
            debouncedSimulation(val);
        });

        // Initialize display
        updateShockDisplay(0);
    }
}

/**
 * Update the badge display value
 */
function updateShockDisplay(val) {
    const badge = document.getElementById('simulatorShockValue');
    if (!badge) return;

    const numVal = parseInt(val);
    badge.innerText = `${numVal > 0 ? '+' : ''}${numVal}% Bitcoin Move`;

    // Color coding
    if (numVal > 0) {
        badge.className = 'badge bg-success bg-opacity-10 text-success fw-light px-3 py-2';
    } else if (numVal < 0) {
        badge.className = 'badge bg-danger bg-opacity-10 text-danger fw-light px-3 py-2';
    } else {
        badge.className = 'badge bg-white bg-opacity-10 text-white fw-light px-3 py-2';
    }
}

/**
 * Debounce the API call to avoid spamming while sliding
 */
function debouncedSimulation(percent) {
    clearTimeout(simulationDebounceTimer);
    simulationDebounceTimer = setTimeout(() => {
        runSimulation(percent);
    }, 500); // 500ms delay
}

/**
 * Call the backend simulation API
 */
async function runSimulation(percent) {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    // Reset if 0
    if (percent == 0) {
        document.getElementById('sim-current-value').innerText = '...';
        document.getElementById('sim-projected-value').innerText = '...';
        document.getElementById('sim-change-percent').innerText = '--';
        document.getElementById('simulation-impact-details').style.display = 'none';
        return;
    }

    try {
        const response = await fetch('/api/crypto/ml/simulate', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                shock_target: 'BTC',
                shock_percent: parseFloat(percent)
            })
        });

        if (!response.ok) throw new Error('Simulation failed');

        const result = await response.json();
        renderSimulationResults(result);

    } catch (error) {
        console.error('Simulation error:', error);
    }
}

/**
 * Render the simulation results
 */
function renderSimulationResults(data) {
    const currentVal = data.total_current_value;
    const projectVal = data.total_simulated_value;
    const changePct = data.total_change_percent;

    // Format Currency
    const fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

    document.getElementById('sim-current-value').innerText = fmt.format(currentVal);

    const projEl = document.getElementById('sim-projected-value');
    projEl.innerText = fmt.format(projectVal);
    projEl.className = `h3 fw-light mb-0 ${changePct >= 0 ? 'text-success' : 'text-warning'}`;

    const pctEl = document.getElementById('sim-change-percent');
    pctEl.innerText = `${changePct >= 0 ? '▲' : '▼'} ${Math.abs(changePct)}%`;
    pctEl.className = `small ${changePct >= 0 ? 'text-success' : 'text-warning'}`;

    // Render Breakdown Table
    const tableBody = document.getElementById('simulation-impact-body');
    if (tableBody && data.holdings) {
        tableBody.innerHTML = data.holdings.map(h => {
            // Skip small impacts for cleaner UI
            if (Math.abs(h.change_percent) < 0.1) return '';

            // Calculate a proxy correlation for display (Impact / Shock)
            // Avoid division by zero
            const shock = parseFloat(document.getElementById('simulatorShockInput').value);
            let correlation = shock !== 0 ? (h.change_percent / shock).toFixed(2) : '0.00';

            // Cap visual correlation to 1.0
            if (correlation > 1) correlation = '1.00';
            if (correlation < -1) correlation = '-1.00';

            return `
                <tr>
                    <td class="text-white-80">
                        <div class="d-flex align-items-center gap-2">
                             <div class="p-1 rounded bg-white bg-opacity-10">${h.symbol}</div>
                        </div>
                    </td>
                    <td class="text-end font-monospace small text-white-50">${correlation}</td>
                    <td class="text-end ${h.change_percent >= 0 ? 'text-success' : 'text-danger'}">
                        ${h.change_percent.toFixed(1)}%
                    </td>
                </tr>
            `;
        }).join('');

        // Show table
        document.getElementById('simulation-impact-details').style.display = 'block';
    }
}

// Export init
window.initSimulator = initSimulator;
