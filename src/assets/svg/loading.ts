export const motorcycleSpinnerSvg = `
    <style>
      .motorcycle {
        fill: var(--theme-color, #409eff);
        animation: drive 1s ease-in-out infinite alternate;
        transform-origin: center bottom;
      }
      .wheel {
        transform-origin: center;
        animation: spin 0.5s linear infinite;
      }
      @keyframes drive {
        0% { transform: translateY(0) rotate(-1deg); }
        100% { transform: translateY(-2px) rotate(1deg); }
      }
      @keyframes spin {
        100% { transform: rotate(360deg); }
      }
    </style>
    <g class="motorcycle">
      <!-- Body -->
      <path d="M19.44 9.03L15.41 5H11v2h3.59l2 2H5c-2.8 0-5 2.2-5 5 0 2.37 1.64 4.36 3.82 4.88C9.24 16.17 10 15 10 15H5v-2h2.82c.42-1.17 1.52-2 2.82-2 1.66 0 3 1.34 3 3 0 .15-.02.3-.04.44l4.22-.05c.01-.13.02-.26.02-.39 0-1.66-1.34-3-3-3-1.3 0-2.4-.83-2.82 2H19v-2h-2.82c.42 1.17 1.52 2 2.82 2 1.66 0 3 1.34 3 3s-1.34 3-3 3c-1.3 0-2.4-.83-2.82-2l-1.32.02c.4 1.14 1.48 2 2.8 2 2.46 0 4.45-1.69 4.9-4 0-2.28-1.55-4.17-3.66-4.82z"/>
      
      <!-- Left wheel -->
      <g transform="translate(6, 17)">
        <circle cx="0" cy="0" r="3" class="wheel"/>
        <circle cx="0" cy="0" r="1.5" fill="#fff"/>
      </g>
      
      <!-- Right wheel -->
      <g transform="translate(19, 17)">
        <circle cx="0" cy="0" r="3" class="wheel"/>
        <circle cx="0" cy="0" r="1.5" fill="#fff"/>
      </g>
    </g>
`;
