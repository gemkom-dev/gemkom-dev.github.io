// --- machining.js ---
import {
  state,
  fetchIssuesByFilter
} from './machiningService.js';

import { MachiningView } from './machiningView.js';

const filters = [
  { id: '10698', name: 'BF-V10' },
  { id: '10697', name: 'BF-V13' },
  { id: '10696', name: 'BK-1580-L' },
  { id: '10699', name: 'Collet' },
  { id: '10694', name: 'Doosan CNC' },
  { id: '10692', name: 'Heckert' },
  { id: '10700', name: 'Hyundai CNC Torna' },
  { id: '10969', name: 'Hyundai Yatay İşleme' },
  { id: '10766', name: 'Manuel Torna 1' },
  { id: '10767', name: 'Manuel Torna 2' },
  { id: '10768', name: 'Manuel Torna 3' },
  { id: '10691', name: 'Schiess Froriep 1' },
  { id: '10690', name: 'Schiess Froriep 2' },
  { id: '10695', name: 'Toyoda Yatay' },
];

document.addEventListener('DOMContentLoaded', () => {
  if (!state.userId) {
    window.location.href = '/login';
    return;
  }

  const view = new MachiningView({
    setFilter: async (filterId) => {
      const issues = await fetchIssuesByFilter(filterId);
      view.renderTasks(issues);
    },
    setSearchTerm: (term) => {
      // Implement search functionality if needed
    }
  });

  // Initial load with first filter
  if (filters.length > 0) {
    view.renderFilterButtons(filters.map(f => ({
      label: f.name,
      value: f.id,
      active: false
    })));
    fetchIssuesByFilter(filters[0].id).then(issues => view.renderTasks(issues));
  }
});
