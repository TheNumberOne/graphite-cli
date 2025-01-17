import { submitAction } from '../../actions/submit/submit_action';
import { profile } from '../../lib/telemetry/profile';
import { argsT } from '../shared-commands/submit';

export { aliases, args, builder, command } from '../shared-commands/submit';
export const description =
  'Idempotently force push the upstack branches to GitHub, creating or updating pull requests as necessary.';
export const canonical = 'upstack submit';

export const handler = async (argv: argsT): Promise<void> => {
  await profile(argv, canonical, async (context) => {
    await submitAction(
      {
        scope: 'UPSTACK',
        editPRFieldsInline: argv.edit,
        draftToggle: argv.draft,
        dryRun: argv['dry-run'],
        updateOnly: argv['update-only'],
        reviewers: argv.reviewers,
        confirm: argv.confirm,
      },
      context
    );
  });
};
