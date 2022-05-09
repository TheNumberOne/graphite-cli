"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.description = exports.canonical = exports.command = exports.builder = exports.args = exports.aliases = void 0;
const submit_action_1 = require("../../actions/submit/submit_action");
const profile_1 = require("../../lib/telemetry/profile");
var submit_1 = require("../shared-commands/submit");
Object.defineProperty(exports, "aliases", { enumerable: true, get: function () { return submit_1.aliases; } });
Object.defineProperty(exports, "args", { enumerable: true, get: function () { return submit_1.args; } });
Object.defineProperty(exports, "builder", { enumerable: true, get: function () { return submit_1.builder; } });
Object.defineProperty(exports, "command", { enumerable: true, get: function () { return submit_1.command; } });
exports.canonical = 'stack submit';
exports.description = 'Idempotently force push all branches in the current stack to GitHub, creating or updating distinct pull requests for each.';
const handler = (argv) => __awaiter(void 0, void 0, void 0, function* () {
    yield profile_1.profile(argv, exports.canonical, (context) => __awaiter(void 0, void 0, void 0, function* () {
        yield submit_action_1.submitAction({
            scope: 'FULLSTACK',
            editPRFieldsInline: argv.edit,
            draftToggle: argv.draft,
            dryRun: argv['dry-run'],
            updateOnly: argv['update-only'],
            reviewers: argv.reviewers,
            confirm: argv.confirm,
        }, context);
    }));
});
exports.handler = handler;
//# sourceMappingURL=submit.js.map