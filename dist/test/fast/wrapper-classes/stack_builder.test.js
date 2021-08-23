"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const errors_1 = require("../../../src/lib/errors");
const wrapper_classes_1 = require("../../../src/wrapper-classes");
const scenes_1 = require("../../lib/scenes");
const utils_1 = require("../../lib/utils");
for (const scene of scenes_1.allScenes) {
    // eslint-disable-next-line max-lines-per-function
    describe(`(${scene}): stack builder class`, function () {
        utils_1.configureTest(this, scene);
        it("Can print stacks from git", () => {
            scene.repo.createAndCheckoutBranch("a");
            scene.repo.createChangeAndCommit("a");
            scene.repo.createAndCheckoutBranch("b");
            scene.repo.createChangeAndCommit("b");
            scene.repo.createAndCheckoutBranch("c");
            scene.repo.createChangeAndCommit("c");
            scene.repo.checkoutBranch("main");
            scene.repo.createAndCheckoutBranch("d");
            scene.repo.createChangeAndCommit("d");
            const gitStacks = new wrapper_classes_1.GitStackBuilder().allStacksFromTrunk();
            const metaStacks = new wrapper_classes_1.MetaStackBuilder().allStacksFromTrunk();
            chai_1.expect(gitStacks[0].equals(wrapper_classes_1.Stack.fromMap({ main: { a: { b: { c: {} } } } }))).to.be.true;
            chai_1.expect(gitStacks[1].equals(wrapper_classes_1.Stack.fromMap({ main: { d: {} } }))).to.be
                .true;
            // Expect default meta to be 4 stacks of 1 off main.
            chai_1.expect(metaStacks[0].equals(wrapper_classes_1.Stack.fromMap({ main: { a: {} } })));
            chai_1.expect(metaStacks[1].equals(wrapper_classes_1.Stack.fromMap({ main: { b: {} } })));
            chai_1.expect(metaStacks[2].equals(wrapper_classes_1.Stack.fromMap({ main: { c: {} } })));
            chai_1.expect(metaStacks[3].equals(wrapper_classes_1.Stack.fromMap({ main: { d: {} } })));
        });
        it("Can print stacks from meta", () => {
            scene.repo.createChange("a");
            scene.repo.execCliCommand(`branch create "a" -m "a" -q`);
            scene.repo.createChange("b");
            scene.repo.execCliCommand(`branch create "b" -m "b" -q`);
            scene.repo.checkoutBranch("main");
            scene.repo.createChange("d");
            scene.repo.execCliCommand(`branch create "d" -m "d" -q`);
            const metaStacks = new wrapper_classes_1.MetaStackBuilder().allStacksFromTrunk();
            const gitStacks = new wrapper_classes_1.GitStackBuilder().allStacksFromTrunk();
            chai_1.expect(metaStacks[0].equals(wrapper_classes_1.Stack.fromMap({ main: { a: { b: {} } } }))).to
                .be.true;
            chai_1.expect(metaStacks[1].equals(wrapper_classes_1.Stack.fromMap({ main: { d: {} } }))).to.be
                .true;
            // Expect git and meta stacks to equal
            chai_1.expect(gitStacks[0].equals(metaStacks[0])).to.be.true;
            chai_1.expect(gitStacks[1].equals(metaStacks[1])).to.be.true;
        });
        it("Can get full stack from a branch", () => {
            scene.repo.createChange("a");
            scene.repo.execCliCommand(`branch create "a" -m "a" -q`);
            scene.repo.createChange("b");
            scene.repo.execCliCommand(`branch create "b" -m "b" -q`);
            scene.repo.checkoutBranch("main");
            scene.repo.createChange("d");
            scene.repo.execCliCommand(`branch create "d" -m "d" -q`);
            const metaStack = new wrapper_classes_1.MetaStackBuilder().fullStackFromBranch(new wrapper_classes_1.Branch("a"));
            const gitStack = new wrapper_classes_1.GitStackBuilder().fullStackFromBranch(new wrapper_classes_1.Branch("a"));
            chai_1.expect(metaStack.equals(wrapper_classes_1.Stack.fromMap({ main: { a: { b: {} } } }))).to.be
                .true;
            chai_1.expect(metaStack.equals(gitStack)).to.be.true;
        });
        it("Can get full stack from trunk", () => {
            scene.repo.createChange("a");
            scene.repo.execCliCommand(`branch create "a" -m "a" -q`);
            scene.repo.createChange("b");
            scene.repo.execCliCommand(`branch create "b" -m "b" -q`);
            scene.repo.checkoutBranch("main");
            scene.repo.createChange("d");
            scene.repo.execCliCommand(`branch create "d" -m "d" -q`);
            const metaStack = new wrapper_classes_1.MetaStackBuilder().fullStackFromBranch(new wrapper_classes_1.Branch("main"));
            const gitStack = new wrapper_classes_1.GitStackBuilder().fullStackFromBranch(new wrapper_classes_1.Branch("main"));
            chai_1.expect(metaStack.equals(wrapper_classes_1.Stack.fromMap({ main: { a: { b: {} }, d: {} } })))
                .to.be.true;
            chai_1.expect(gitStack.equals(metaStack)).to.be.true;
        });
        it("Can find different git and meta stacks", () => {
            scene.repo.createChange("a");
            scene.repo.execCliCommand(`branch create "a" -m "a" -q`);
            scene.repo.checkoutBranch("main");
            scene.repo.createChangeAndCommit("b");
            const metaStack = new wrapper_classes_1.MetaStackBuilder().fullStackFromBranch(new wrapper_classes_1.Branch("a"));
            const gitStack = new wrapper_classes_1.GitStackBuilder().fullStackFromBranch(new wrapper_classes_1.Branch("a"));
            chai_1.expect(metaStack.equals(wrapper_classes_1.Stack.fromMap({ main: { a: {} } }))).to.be.true;
            chai_1.expect(gitStack.equals(wrapper_classes_1.Stack.fromMap({ a: {} }))).to.be.true;
        });
        it("Throws an error if two git branches point to the same commit", () => {
            scene.repo.createChange("a");
            scene.repo.execCliCommand(`branch create "a" -m "a" -q`);
            chai_1.expect(() => new wrapper_classes_1.GitStackBuilder().fullStackFromBranch(new wrapper_classes_1.Branch("a"))).to.not.throw(Error);
            scene.repo.execCliCommand(`branch create "b" -q`);
            chai_1.expect(() => new wrapper_classes_1.GitStackBuilder().fullStackFromBranch(new wrapper_classes_1.Branch("a"))).to.throw(errors_1.SiblingBranchError);
        });
    });
}
//# sourceMappingURL=stack_builder.test.js.map