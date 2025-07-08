// --- machining.js ---
import { createMachineTaskView } from '../components/machineTaskView.js';
import { fetchMachinesForMachining } from './machiningService.js';
import { fetchTasksForMachining } from './machiningService.js';
import { initNavbar } from '../components/navbar.js';
import { guardRoute } from '../authService.js';
import { setCurrentMachineState } from './tasks/taskState.js';


document.addEventListener('DOMContentLoaded', async () => {
    if (!guardRoute()) {
        return;
    }
    initNavbar();

    // Get machine_id from URL
    const params = new URLSearchParams(window.location.search);
    const machineId = params.get('machine_id');
    let preselectedMachine = null;

    if (machineId) {
        const machines = await fetchMachinesForMachining();
        preselectedMachine = machines.find(m => String(m.id) === String(machineId));
        if (preselectedMachine) {
            setCurrentMachineState(preselectedMachine);
        }
    }

    await createMachineTaskView({
        containerId: 'main-view',
        fetchMachines: fetchMachinesForMachining,
        fetchTasks: fetchTasksForMachining,
        title: 'Talaşlı İmalat',
        machineLabel: 'Makine Seçimi',
        searchPlaceholder: 'TI numarası ile ara...',
        taskDetailBasePath: '/machining/tasks/',
        preselectedMachine // new prop for dropdown pre-selection
    });
});


// state.currentMachine = {
//     id: selectedOption.dataset.machineId,
//     name: selectedOption.textContent
// }