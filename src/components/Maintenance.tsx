import React, { useEffect } from 'react';
import './Maintenance.css';

declare global {
  interface Window {
    ATL_JQ_PAGE_PROPS: any;
    jQuery: any;
  }
}

const Maintenance: React.FC = () => {
  useEffect(() => {
    // Load jQuery first
    const jqueryScript = document.createElement('script');
    jqueryScript.src = 'https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js';
    jqueryScript.onload = () => {
      loadJiraCollector();
    };
    document.head.appendChild(jqueryScript);

    return () => {
      // Cleanup scripts on unmount
      const scripts = document.querySelectorAll('script[src*="atlassian.net"]');
      scripts.forEach(script => script.remove());
    };
  }, []);

  const loadJiraCollector = () => {
    // Set up the JIRA collector configuration
    window.ATL_JQ_PAGE_PROPS = {
      "triggerFunction": function(showCollectorDialog: () => void) {
        window.jQuery("#myCustomTrigger").click(function(e: Event) {
          e.preventDefault();
          showCollectorDialog();
        });
      }
    };

    // Load the JIRA Issue Collector script
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://gemkom-1.atlassian.net/s/d41d8cd98f00b204e9800998ecf8427e-T/xghl7j/b/9/c95134bc67d3a521bb3f4331beb9b804/_/download/batch/com.atlassian.jira.collector.plugin.jira-issue-collector-plugin:issuecollector/com.atlassian.jira.collector.plugin.jira-issue-collector-plugin:issuecollector.js?locale=tr-TR&collectorId=3eb49cb5';
    document.head.appendChild(script);
  };

  return (
    <div className="maintenance-container">
      <h1>Bakım Talebi</h1>
      
      <button id="myCustomTrigger" className="maintenance-button">
        📋 Bakım Talebi Gönder
      </button>

      <div className="image-container">
        <img src="/images/layout.png" alt="Layout" />
      </div>
    </div>
  );
};

export default Maintenance;