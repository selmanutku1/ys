@import "tailwindcss";
@variant dark (&:is(.dark *));

@layer base {
  /* Scrollbar Styling for Dark Mode */
  .dark ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  .dark ::-webkit-scrollbar-track {
    background: #0b0f19; /* Deep Slate Track */
  }
  .dark ::-webkit-scrollbar-thumb {
    background: #1f2937; /* Gray-800 */
    border-radius: 4px;
    border: 2px solid #0b0f19;
  }
  .dark ::-webkit-scrollbar-thumb:hover {
    background: #10b981; /* Emerald Accent on Hover */
  }

  /* High Contrast Inputs and Selects in Dark Mode */
  .dark input:not([type="checkbox"]):not([type="radio"]):not([type="range"]):not([type="button"]):not([type="submit"]),
  .dark select,
  .dark textarea {
    background-color: #090d16 !important; /* Rich Dark Charcoal */
    border-color: #374151 !important;     /* Gray-700 for distinct visibility */
    color: #f9fafb !important;            /* High Contrast Gray-50 */
    font-weight: 500 !important;
    transition: all 0.2s ease-in-out !important;
    box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.4) !important;
  }

  .dark input:not([type="checkbox"]):not([type="radio"]):not([type="range"]):not([type="button"]):not([type="submit"])::placeholder,
  .dark textarea::placeholder {
    color: #9ca3af !important; /* Gray-400 for highly readable placeholders */
  }
  
  .dark input:not([type="checkbox"]):not([type="radio"]):not([type="range"]):not([type="button"]):not([type="submit"]):focus,
  .dark select:focus,
  .dark textarea:focus {
    border-color: #10b981 !important; /* Vibrant Emerald Focus */
    --tw-ring-color: #10b981 !important;
    ring-width: 2px !important;
    box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.25), inset 0 2px 4px 0 rgba(0, 0, 0, 0.4) !important;
    background-color: #0c1322 !important; /* Slightly accented slate on focus */
  }

  /* Dark Mode Labels and Help Text */
  .dark label {
    color: #e5e7eb !important; /* Gray-200 */
    font-weight: 600 !important;
  }

  .dark .text-muted,
  .dark .text-gray-500,
  .dark .text-gray-400 {
    color: #9ca3af !important; /* Keep secondary texts readable and high contrast */
  }

  /* High Contrast Table Header & Rows in Dark Mode */
  .dark table {
    border-color: #1f2937 !important; /* Clear inner-table boundaries */
  }

  .dark table th {
    background-color: #111827 !important; /* Solid Gray-900 for table headers */
    color: #f3f4f6 !important;            /* Gray-100 high-contrast text */
    border-bottom: 2px solid #374151 !important; /* Strong bottom border */
    border-color: #374151 !important;
    font-weight: 700 !important;
    text-transform: uppercase !important;
    letter-spacing: 0.05em !important;
  }

  .dark table tr {
    border-color: #1f2937 !important; /* Visible borders between rows */
  }

  /* Alternating Row Stripe Background for Data Clarity */
  .dark table tbody tr:nth-child(even) {
    background-color: rgba(17, 24, 39, 0.45) !important;
  }

  .dark table tbody tr:hover {
    background-color: #1f2937 !important; /* Highlight on hover for high readability */
  }

  .dark table td {
    color: #f3f4f6 !important;            /* High Contrast Gray-100 */
    border-color: #1f2937 !important;
  }
  
  /* Buttons in Dark Mode Input Fix */
  .dark input[type="button"],
  .dark input[type="submit"] {
    background-color: #047857 !important; /* Emerald-700 */
    color: #ffffff !important;
    border-color: #065f46 !important;     /* Emerald-800 */
  }

  /* Mobile Touch Target and Interaction Optimizations */
  @media (pointer: coarse), (max-width: 1024px) {
    /* Set minimum touch target size (44px) for interactive elements on mobile */
    button, 
    a, 
    select,
    input[type="button"],
    input[type="submit"],
    [role="button"],
    [role="tab"] {
      min-height: 44px;
      min-width: 44px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      touch-action: manipulation;
    }

    /* Remove native blue tap highlight overlay on mobile browsers */
    button, a, select, input, textarea, [role="button"] {
      -webkit-tap-highlight-color: transparent;
    }

    /* Style active tap feedback for interactive elements */
    button:active, 
    [role="button"]:active,
    a:active {
      transform: scale(0.97);
      opacity: 0.85;
      transition: transform 0.1s ease;
    }

    /* Make checkboxes and radio buttons larger and easier to toggle on mobile */
    input[type="checkbox"],
    input[type="radio"] {
      width: 22px !important;
      height: 22px !important;
      cursor: pointer;
    }

    /* Support generous tap spacing for sidebar and navigation tabs */
    aside nav a,
    .mobile-nav-item,
    [role="tab"] {
      padding-top: 12px !important;
      padding-bottom: 12px !important;
    }
  }
}

@media print {
  /* When printing-active is on body, hide the entire React root and show only print-section */
  body.printing-active > #root {
    display: none !important;
  }
  
  body.printing-active > #print-section {
    display: block !important;
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    margin: 0;
    padding: 0;
    background-color: white !important;
  }

  /* Hide sidebar and top header */
  #yesilay-kys-master-parent > div > aside,
  #yesilay-kys-master-parent > div > div > header {
    display: none !important;
  }
  
  /* Make main content full width */
  #yesilay-kys-master-parent > div > div {
    width: 100% !important;
    max-width: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
  }
  
  #yesilay-kys-master-parent {
    background-color: white !important;
  }
}
