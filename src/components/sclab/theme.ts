// SCLabalypse Radio design tokens — mirrors apoc-radio-design/colors_and_type.css

export const SCLAB = {
  ink: {
    '000': '#000000',
    '050': '#060606',
    '100': '#0B0B0C',
    '200': '#111113',
    '300': '#17171A',
    '400': '#1E1E22',
    '500': '#26262B',
    '600': '#34343B',
    '700': '#4A4A52',
  },
  bone: {
    '900': '#F7F3EA',
    '700': '#D8D2C2',
    '500': '#9A9385',
    '300': '#6A6558',
  },
  signal: {
    '500': '#FF5A1F',
    '400': '#FF7A45',
    '600': '#E14710',
    '050': '#2A130B',
  },
  phosphor: { '500': '#8CFF4B' },
  agent: { '500': '#C56BFF' },
  radio: { '500': '#5EE7FF' },
} as const;

export const SCLAB_FONTS = {
  serif: '"Instrument Serif", "Times New Roman", serif',
  sans: '"Space Grotesk", system-ui, sans-serif',
  mono: '"JetBrains Mono", ui-monospace, monospace',
} as const;
