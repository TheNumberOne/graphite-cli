import { default as chalk } from 'chalk';
import prompts from 'prompts';
import { TContext } from '../lib/context';
import { KilledError } from '../lib/errors';
import { SCOPE } from '../lib/state/scope_spec';
import { deleteBranchAction, isSafeToDelete } from './delete_branch';
import { restackBranches } from './restack';

/**
 * This method is assumed to be idempotent -- if a merge conflict interrupts
 * execution of this method, we simply restart the method upon running `gt
 * continue`.
 */
// eslint-disable-next-line max-lines-per-function
export async function cleanBranches(
  opts: {
    showDeleteProgress: boolean;
    force: boolean;
  },
  context: TContext
): Promise<void> {
  context.splog.logInfo(
    `Checking if any branches have been merged/closed and can be deleted...`
  );
  context.splog.logTip(
    `Disable this behavior at any point in the future with --no-delete`
  );

  /**
   * To find and delete all of the merged/closed branches, we traverse all of
   * the stacks off of trunk, greedily deleting the base branches and rebasing
   * the remaining branches.
   *
   * To greedily delete the branches, we keep track of the branches we plan
   * to delete as well as a live snapshot of their children. When a branch
   * we plan to delete has no more children, we know that it is safe to
   * eagerly delete.
   *
   * This eager deletion doesn't matter much in small repos, but matters
   * a lot if a repo has a lot of branches to delete. Whereas previously
   * any error in `repo sync` would throw away all of the work the command did
   * to determine what could and couldn't be deleted, now we take advantage
   * of that work as soon as we can.
   */

  const branchesToProcess = context.metaCache.getChildren(
    context.metaCache.trunk
  );
  const branchesToDelete: Record<string, string[]> = {};
  const branchesToRestack: Set<string> = new Set();

  /**
   * Since we're doing a DFS, assuming rather even distribution of stacks off
   * of trunk children, we can trace the progress of the DFS through the trunk
   * children to give the user a sense of how far the repo sync has progressed.
   * Note that we only do this if the user has a large number of branches off
   * of trunk (> 50).
   */
  const progressMarkers = opts.showDeleteProgress
    ? getProgressMarkers(branchesToProcess)
    : {};

  while (branchesToProcess.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const branchName = branchesToProcess.pop()!;

    if (branchName in branchesToDelete) {
      continue;
    }

    if (branchName in progressMarkers) {
      context.splog.logInfo(
        `${progressMarkers[branchName]} done searching for merged/closed branches to delete...`
      );
    }

    const shouldDelete = await shouldDeleteBranch(
      {
        branchName: branchName,
        force: opts.force,
      },
      context
    );
    if (shouldDelete) {
      const children = context.metaCache.getChildren(branchName);

      // We concat children here (because we pop above) to make our search a DFS.
      branchesToProcess.concat(children);

      // Value is a list of descendants blocking deletion.
      branchesToDelete[branchName] = children;
    } else {
      // If we've reached this point, we know the branch shouldn't be deleted.
      // If its parent IS being deleted, we have to restack it.
      const parentBranchName = context.metaCache.getParent(branchName);
      if (parentBranchName && parentBranchName in branchesToDelete) {
        context.metaCache.setParent(branchName, parentBranchName);
        context.splog.logInfo(
          `Set parent of ${chalk.cyan(branchName)} to (${chalk.blue(
            parentBranchName
          )}).`
        );

        // We have to restack this branch and all of its recursive children.
        context.metaCache
          .getRelativeStack(branchName, SCOPE.UPSTACK)
          .forEach((b) => branchesToRestack.add(b));

        // This branch is no longer blocking its parent's deletion.
        branchesToDelete[parentBranchName] = branchesToDelete[
          parentBranchName
        ].filter((b) => b !== branchName);
      }
    }

    // With either of the paths above, we may have unblocked a branch that can
    // be deleted immediately. We recursively check whether we can delete a
    // branch (until we can't), because the act of deleting one branch may free
    // up another.
    let branchToDeleteName: string | undefined;
    do {
      branchToDeleteName = Object.keys(branchesToDelete).find(
        (branchToDelete) => branchesToDelete[branchToDelete].length === 0
      );
      if (branchToDeleteName === undefined) {
        continue;
      }

      // This branch is no longer blocking its parent's deletion.
      const parentBranchName = context.metaCache.getParent(branchToDeleteName);
      if (parentBranchName && parentBranchName in branchesToDelete) {
        branchesToDelete[parentBranchName] = branchesToDelete[
          parentBranchName
        ].filter((b) => b !== branchToDeleteName);
      }

      deleteBranchAction(
        { branchName: branchToDeleteName, force: true },
        context
      );
      delete branchesToDelete[branchToDeleteName];
    } while (branchToDeleteName);
  }
  while (branchesToProcess.length > 0);

  restackBranches(
    { relative: false, branchNames: Array.from(branchesToRestack) },
    context
  );
}

function getProgressMarkers(trunkChildren: string[]): Record<string, string> {
  const progressMarkers: Record<string, string> = {};
  trunkChildren
    // Ignore the first child - don't show 0% progress.
    .slice(1)
    .forEach(
      (child, i) =>
        (progressMarkers[child] = `${+(
          // Add 1 to the overall children length to account for the fact that
          // when we're on the last trunk child, we're not 100% done - we need
          // to go through its stack.
          ((i + 1 / (trunkChildren.length + 1)) * 100).toFixed(2)
        )}%`)
    );
  return progressMarkers;
}
async function shouldDeleteBranch(
  args: {
    branchName: string;
    force: boolean;
  },
  context: TContext
): Promise<boolean> {
  const reason = isSafeToDelete(args.branchName, context);
  if (!reason) {
    return false;
  }

  if (args.force) {
    return true;
  }

  if (!context.interactive) {
    return false;
  }

  return (
    (
      await prompts(
        {
          type: 'confirm',
          name: 'value',
          message: `${reason}. Delete it?`,
          initial: true,
        },
        {
          onCancel: () => {
            throw new KilledError();
          },
        }
      )
    ).value === true
  );
}
