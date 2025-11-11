import { describe, it, expect } from 'vitest';
import { generateTSX } from '../src/io/export';
import { createComponent } from '../src/schema';

describe('TSX Exporter', () => {
  it('exports a settings panel component with sliders and toggles', () => {
    const settingsPanel = createComponent('settings-panel', {
      x: 10, y: 10, w: 300, h: 400, region: 'main'
    }, {
      name: 'MySettings',
      props: {
        title: 'My Awesome Settings',
        children: [
          createComponent('slider', { x: 0, y: 0, w: 100, h: 50, region: '' }, { props: { label: 'Brightness' } }),
          createComponent('toggle', { x: 0, y: 0, w: 100, h: 50, region: '' }, { props: { label: 'Dark Mode', checked: true } })
        ]
      }
    });

    const tsxOutput = generateTSX(settingsPanel);

  expect(tsxOutput).toContain('const MySettingsComponent');
    expect(tsxOutput).toContain('My Awesome Settings');
    expect(tsxOutput).toContain('Brightness');
    expect(tsxOutput).toContain('Dark Mode');
    expect(tsxOutput).toContain('defaultChecked={true}');
  });
});
