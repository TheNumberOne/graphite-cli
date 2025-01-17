import { TContext } from '../lib/context';
import { AbstractStackBuilder } from './abstract_stack_builder';
import { Branch } from './branch';

export class MetaStackBuilder extends AbstractStackBuilder {
  protected getBranchParent(
    branch: Branch,
    context: TContext
  ): Branch | undefined {
    return branch.getParentFromMeta(context);
  }

  protected getChildrenForBranch(branch: Branch, context: TContext): Branch[] {
    return branch.getChildrenFromMeta(context);
  }

  protected getParentForBranch(
    branch: Branch,
    context: TContext
  ): Branch | undefined {
    return branch.getParentFromMeta(context);
  }
}
