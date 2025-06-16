import { proxyBase, backendBase } from './base';
import { getCurrentUserId } from './loginService';

export interface Issue {
  key: string;
  fields: {
    summary: string;
    customfield_10117?: any; // Machine field
    customfield_10184?: any; // Custom field
    customfield_10185?: any; // Custom field
    customfield_10187?: any; // Custom field
  };
}

export interface TimerState {
  base: string;
  timerActive: boolean;
  intervalId: number | null;
  currentIssueKey: string | null;
  startTime: number | null;
  finish_time: number | null;
  userId: string | null;
  selectedMachine: string | null;
  allIssues: Issue[];
}

export const state: TimerState = {
  base: 'https://gemkom-1.atlassian.net',
  timerActive: false,
  intervalId: null,
  currentIssueKey: null,
  startTime: null,
  finish_time: null,
  userId: getCurrentUserId(),
  selectedMachine: null,
  allIssues: []
};

export function formatTime(secs: number): string {
  const hrs = Math.floor(secs / 3600).toString().padStart(2, '0');
  const mins = Math.floor((secs % 3600) / 60).toString().padStart(2, '0');
  const sec = (secs % 60).toString().padStart(2, '0');
  return `${hrs}:${mins}:${sec}`;
}

export function formatJiraDate(ms: number): string {
  const d = new Date(ms);
  const pad = (n: number) => (n < 10 ? '0' + n : n);
  const yyyy = d.getFullYear();
  const MM = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mm = pad(d.getMinutes());
  const ss = pad(d.getSeconds());
  const msms = (d.getMilliseconds() + '').padStart(3, '0');
  const offset = -d.getTimezoneOffset();
  const sign = offset >= 0 ? '+' : '-';
  const offsetHours = pad(Math.floor(Math.abs(offset) / 60));
  const offsetMinutes = pad(Math.abs(offset) % 60);
  return `${yyyy}-${MM}-${dd}T${hh}:${mm}:${ss}.${msms}${sign}${offsetHours}${offsetMinutes}`;
}

export async function fetchIssuesByFilter(filterId: string): Promise<Issue[]> {
  const url = `${state.base}/rest/api/3/search?jql=filter=${filterId}&fields=summary,customfield_10117,customfield_10184,customfield_10185,customfield_10187`;
  const res = await fetch(proxyBase + encodeURIComponent(url), {
    headers: { 'Content-Type': 'application/json' }
  });
  const data = await res.json();
  state.allIssues = data.issues;
  return data.issues;
}

export function saveTimerState(): void {
  if (state.timerActive && state.startTime && state.currentIssueKey) {
    localStorage.setItem('jira-timer-state', JSON.stringify({
      startTime: state.startTime,
      issueKey: state.currentIssueKey
    }));
  } else {
    localStorage.removeItem('jira-timer-state');
  }
}

export async function restoreTimerState(): Promise<{ issue: Issue; wasRestored: boolean } | null> {
  const saved = localStorage.getItem('jira-timer-state');
  if (saved) {
    const { startTime, issueKey } = JSON.parse(saved);
    state.startTime = startTime;
    state.currentIssueKey = issueKey;
    try {
      const res = await fetch(proxyBase + encodeURIComponent(`${state.base}/rest/api/3/issue/${issueKey}`));
      const issue = await res.json();
      return { issue, wasRestored: true };
    } catch (error) {
      console.error('Failed to restore timer state:', error);
      localStorage.removeItem('jira-timer-state');
      return null;
    }
  }
  return null;
}