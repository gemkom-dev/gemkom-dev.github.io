// --- machining.js ---
import { createMachineTaskView } from '../components/machineTaskView.js';
import { fetchMachinesForMachining } from './machiningService.js';
import { fetchTasksForMachining } from './machiningService.js';
import { initNavbar } from '../components/navbar.js';
import { guardRoute } from '../authService.js';


document.addEventListener('DOMContentLoaded', async () => {
    if (!guardRoute()) {
        return;
    }
    initNavbar();
    await createMachineTaskView({
        containerId: 'main-view',
        fetchMachines: fetchMachinesForMachining,
        fetchTasks: fetchTasksForMachining,
        title: 'Talaşlı İmalat',
        machineLabel: 'Makine Seçimi',
        searchPlaceholder: 'TI numarası ile ara...',
        taskDetailBasePath: '/machining/tasks/'
    });
});


// state.currentMachine = {
//     id: selectedOption.dataset.machineId,
//     name: selectedOption.textContent
// }