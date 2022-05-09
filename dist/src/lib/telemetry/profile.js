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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.profile = void 0;
// Why does an open source CLI include telemetry?
// We the creators want to understand how people are using the tool
// All metrics logged are listed plain to see, and are non blocking in case the server is unavailable.
const chalk_1 = __importDefault(require("chalk"));
const package_json_1 = require("../../../package.json");
const init_1 = require("../../actions/init");
const exec_state_config_1 = require("../config/exec_state_config");
const context_1 = require("../context");
const errors_1 = require("../errors");
const fetch_pr_info_1 = require("../requests/fetch_pr_info");
const merge_conflict_help_1 = require("../utils/merge_conflict_help");
const parse_args_1 = require("../utils/parse_args");
const splog_1 = require("../utils/splog");
const validation_helper_message_1 = require("../utils/validation_helper_message");
const context_2 = require("./context");
const post_traces_1 = require("./post_traces");
const sigint_handler_1 = require("./sigint_handler");
const post_survey_1 = require("./survey/post_survey");
const tracer_1 = require("./tracer");
const upgrade_prompt_1 = require("./upgrade_prompt");
function initalizeContext() {
    const context = context_1.initContext();
    upgrade_prompt_1.fetchUpgradePromptInBackground(context);
    fetch_pr_info_1.refreshPRInfoInBackground(context);
    // We try to post the survey response right after the user takes it, but in
    // case they quit early or there's some error, we'll continue to try to post
    // it in the future until it succeeds.
    post_survey_1.postSurveyResponsesInBackground(context);
    return context;
}
function profile(args, canonicalName, handler) {
    return __awaiter(this, void 0, void 0, function* () {
        // Self heal repo config on all commands besides init:
        const parsedArgs = parse_args_1.parseArgs(args);
        const start = Date.now();
        sigint_handler_1.registerSigintHandler({
            commandName: parsedArgs.command,
            canonicalCommandName: canonicalName,
            startTime: start,
        });
        const context = initalizeContext();
        if (parsedArgs.command !== 'repo init' &&
            !context.repoConfig.graphiteInitialized()) {
            splog_1.logInfo(`Graphite has not been initialized, attempting to setup now...`);
            splog_1.logNewline();
            yield init_1.init(context);
        }
        let err = undefined;
        try {
            yield tracer_1.tracer.span({
                name: 'command',
                resource: parsedArgs.command,
                meta: {
                    user: context_2.getUserEmail() || 'NotFound',
                    version: package_json_1.version,
                    args: parsedArgs.args,
                    alias: parsedArgs.alias,
                },
            }, () => __awaiter(this, void 0, void 0, function* () {
                try {
                    yield handler(context);
                }
                catch (err) {
                    switch (err.constructor) {
                        case errors_1.ExitFailedError:
                            splog_1.logError(err.message);
                            throw err;
                        case errors_1.PreconditionsFailedError:
                            splog_1.logInfo(err.message);
                            throw err;
                        case errors_1.RebaseConflictError:
                            splog_1.logNewline();
                            splog_1.logError(`Rebase conflict. ${err.message}`);
                            splog_1.logNewline();
                            merge_conflict_help_1.printGraphiteMergeConflictStatus();
                            splog_1.logNewline();
                            splog_1.logInfo([
                                `To fix and continue your previous Graphite command:`,
                                `(1) resolve the listed merge conflicts`,
                                `(2) mark them as resolved with "git add"`,
                                `(3) run "gt continue" to continue executing your previous Graphite command`,
                            ]
                                .map((line) => chalk_1.default.yellow(line))
                                .join('\n'));
                            return;
                        case errors_1.ValidationFailedError:
                            splog_1.logError(`Validation: ${err.message}`);
                            splog_1.logInfo(validation_helper_message_1.VALIDATION_HELPER_MESSAGE);
                            throw err;
                        case errors_1.ConfigError:
                            splog_1.logError(`Bad Config: ${err.message}`);
                            throw err;
                        case errors_1.ExitCancelledError:
                            splog_1.logWarn(`Cancelled: ${err.message}`);
                            return;
                        case errors_1.SiblingBranchError:
                            splog_1.logError(err.message);
                            throw err;
                        case errors_1.MultiParentError:
                            splog_1.logError(err.message);
                            throw err;
                        case errors_1.KilledError:
                            return; // don't log output if user manually kills.
                        default:
                            splog_1.logError(err.message);
                            throw err;
                    }
                }
            }));
        }
        catch (e) {
            err = e;
        }
        const end = Date.now();
        post_traces_1.postTelemetryInBackground({
            canonicalCommandName: canonicalName,
            commandName: parsedArgs.command,
            durationMiliSeconds: end - start,
            err,
        });
        if (err) {
            if (exec_state_config_1.execStateConfig.outputDebugLogs()) {
                splog_1.logInfo(err);
                splog_1.logInfo(err.stack);
            }
            // eslint-disable-next-line no-restricted-syntax
            process.exit(1);
        }
    });
}
exports.profile = profile;
//# sourceMappingURL=profile.js.map