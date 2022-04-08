"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.passthrough = void 0;
const chalk_1 = __importDefault(require("chalk"));
const child_process_1 = __importDefault(require("child_process"));
const utils_1 = require("../utils");
const GIT_COMMAND_ALLOWLIST = [
    'add',
    'bisect',
    'clone',
    'diff',
    'fetch',
    'grep',
    'merge',
    'mv',
    'pull',
    'push',
    'rebase',
    'reset',
    'restore',
    'rm',
    'show',
    'sparse-checkout',
    'stash',
    'status',
    'switch',
    'tag',
];
function passthrough(args) {
    if (args.length <= 2) {
        return;
    }
    const command = args[2];
    if (!GIT_COMMAND_ALLOWLIST.includes(command)) {
        return;
    }
    utils_1.logInfo(chalk_1.default.grey([
        `Command: "${chalk_1.default.yellow(command)}" is not a Graphite command, but is supported by git. Passing command through to git...`,
        `Running: "${chalk_1.default.yellow(`git ${args.slice(2).join(' ')}`)}"\n`,
    ].join('\n')));
    try {
        child_process_1.default.spawnSync('git', args.slice(2), { stdio: 'inherit' });
    }
    catch (err) {
        utils_1.logError(err);
        // eslint-disable-next-line no-restricted-syntax
        process.exit(1);
    }
    // eslint-disable-next-line no-restricted-syntax
    process.exit(0);
}
exports.passthrough = passthrough;
//# sourceMappingURL=index.js.map