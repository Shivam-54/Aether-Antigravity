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

    // Render Breakdown Cards
    const cardContainer = document.getElementById('simulation-impact-body');
    if (cardContainer && data.holdings) {
        cardContainer.innerHTML = data.holdings.map(h => {
            // Skip small impacts for cleaner UI
            if (Math.abs(h.change_percent) < 0.1) return '';

            // Calculate a proxy correlation for display (Impact / Shock)
            const shock = parseFloat(document.getElementById('simulatorShockInput').value);
            let correlation = shock !== 0 ? (h.change_percent / shock).toFixed(2) : '0.00';

            // Cap visual correlation to 1.0
            if (correlation > 1) correlation = '1.00';
            if (correlation < -1) correlation = '-1.00';

            const isPositive = h.change_percent >= 0;

            return `
                <div class="col-4">
                    <div class="p-3 rounded" style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);">
                        <!-- Asset Symbol -->
                        <div class="text-center mb-3">
                            <div class="badge px-3 py-2" style="background: linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05)); border: 1px solid rgba(255,255,255,0.15); font-size: 0.9rem;">
                                ${h.symbol}
                            </div>
                        </div>
                        
                        <!-- Impact Percentage -->
                        <div class="text-center mb-3">
                            <div class="h4 mb-0" style="color: ${isPositive ? '#22d399' : '#ef4444'}; font-weight: 600;">
                                ${isPositive ? '▲' : '▼'} ${Math.abs(h.change_percent).toFixed(1)}%
                            </div>
                            <div class="text-white-40 small mt-1" style="font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.5px;">Impact</div>
                        </div>
                        
                        <!-- Correlation -->
                        <div class="text-center">
                            <div class="badge bg-white bg-opacity-10 text-white font-monospace px-2 py-1" style="font-size: 0.75rem;">
                                ${correlation}
                            </div>
                            <div class="text-white-40 small mt-1" style="font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.5px;">Correlation</div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        // Show cards
        document.getElementById('simulation-impact-details').style.display = 'block';
    }
}

// Export init
window.initSimulator = initSimulator;
