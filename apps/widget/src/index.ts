import React from 'react';
import ReactDOM from 'react-dom/client';
import StandaloneWidget, { WidgetProps } from './Widget.js';

function initOmniAgentWidget() {
  if (typeof document === 'undefined') return;

  const CONTAINER_ID = 'omniagent-widget-root';
  if (document.getElementById(CONTAINER_ID)) {
    console.warn('[OmniAgent] Widget already initialized on page.');
    return;
  }

  // Find the invoking script tag to read configuration data attributes
  const currentScript = 
    document.currentScript || 
    document.querySelector('script[data-omniagent="true"]') ||
    document.querySelector('script[src*="widget.js"]');

  const config: WidgetProps = {
    apiUrl: currentScript?.getAttribute('data-api-url') || '',
    businessId: currentScript?.getAttribute('data-business-id') || 'apex-clinic',
    businessName: currentScript?.getAttribute('data-business-name') || undefined,
    primaryColor: currentScript?.getAttribute('data-primary-color') || undefined,
    accentColor: currentScript?.getAttribute('data-accent-color') || undefined,
  };

  // Create isolated container host
  const host = document.createElement('div');
  host.id = CONTAINER_ID;
  host.style.position = 'relative';
  host.style.zIndex = '2147483647';
  document.body.appendChild(host);

  // Attach Shadow DOM for complete CSS isolation
  const shadow = host.attachShadow({ mode: 'open' });

  // Injected scoped CSS styles & keyframe animations
  const styleTag = document.createElement('style');
  styleTag.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
    
    * {
      box-sizing: border-box;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.5; transform: scale(1.15); }
    }

    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(16px) scale(0.96);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    ::-webkit-scrollbar {
      width: 4px;
      height: 4px;
    }

    ::-webkit-scrollbar-track {
      background: rgba(3, 7, 18, 0.4);
    }

    ::-webkit-scrollbar-thumb {
      background: rgba(99, 102, 241, 0.4);
      border-radius: 9999px;
    }
  `;
  shadow.appendChild(styleTag);

  // Mount point inside shadow DOM
  const mountPoint = document.createElement('div');
  shadow.appendChild(mountPoint);

  // Mount React App
  const root = ReactDOM.createRoot(mountPoint);
  root.render(
    React.createElement(StandaloneWidget, config)
  );

  console.log(`%c[OmniAgent]%c Universal Chat & Booking Widget initialized.`, 'color: #6366f1; font-weight: bold;', 'color: #10b981;');
}

// Auto-run if loaded via script tag
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initOmniAgentWidget);
} else {
  initOmniAgentWidget();
}

export { StandaloneWidget, initOmniAgentWidget };
