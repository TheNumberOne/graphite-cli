import { TContext } from '../../lib/context';
import { uncommittedTrackedChangesPrecondition } from '../../lib/preconditions';
import { syncPRInfoForBranches } from '../../lib/sync/pr_info';
import { Branch } from '../../wrapper-classes/branch';
import { cleanBranches as cleanBranches } from '../clean_branches';
import { mergeDownstack } from './merge_downstack';
import { pull } from './pull';
export async function syncAction(
  opts: {
    pull: boolean;
    force: boolean;
    delete: boolean;
    showDeleteProgress: boolean;
    resubmit: boolean;
    downstackToSync?: string[];
  },
  context: TContext
): Promise<void> {
  uncommittedTrackedChangesPrecondition();
  const oldBranchName = context.metaCache.currentBranchPrecondition;
  if (!oldBranchName || context.metaCache.isTrunk(oldBranchName)) {
    context.metaCache.checkoutBranch(context.metaCache.trunk);
  }

  if (opts.pull) {
    pull(
      {
        oldBranchName,
        branchesToFetch: Branch.allBranches(context)
          .map((b) => b.name)
          .concat(opts.downstackToSync ?? []),
      },
      context
    );
  }

  if (opts.downstackToSync) {
    await mergeDownstack(opts.downstackToSync, context);
  }

  await syncPRInfoForBranches(
    Branch.allBranches(context).map((b) => b.name),
    context
  );

  if (opts.delete) {
    await cleanBranches(
      { showDeleteProgress: opts.showDeleteProgress, force: opts.force },
      context
    );
  }
}
