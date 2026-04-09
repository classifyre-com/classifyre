import { CliRunnerController } from './cli-runner.controller';
import { ALLOW_IN_DEMO_MODE_KEY } from '../demo-mode.decorator';

describe('CliRunnerController demo mode metadata', () => {
  it('allows internal runner status updates in demo mode', () => {
    expect(
      Reflect.getMetadata(
        ALLOW_IN_DEMO_MODE_KEY,
        CliRunnerController.prototype.updateRunnerStatus,
      ),
    ).toBe(true);
  });

  it('keeps runner creation endpoints blocked in demo mode', () => {
    expect(
      Reflect.getMetadata(
        ALLOW_IN_DEMO_MODE_KEY,
        CliRunnerController.prototype.startRunner,
      ),
    ).toBeUndefined();
    expect(
      Reflect.getMetadata(
        ALLOW_IN_DEMO_MODE_KEY,
        CliRunnerController.prototype.createExternalRunner,
      ),
    ).toBeUndefined();
  });
});
