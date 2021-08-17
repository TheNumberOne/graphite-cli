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
exports.handler = exports.aliases = exports.builder = exports.description = exports.command = void 0;
const submit_1 = require("../../actions/submit");
const telemetry_1 = require("../../lib/telemetry");
exports.command = "submit";
exports.description = "Idempotently force push all branches in the current stack to GitHub, creating or updating distinct pull requests for each.";
const args = {};
exports.builder = args;
exports.aliases = ["s"];
const handler = (argv) => __awaiter(void 0, void 0, void 0, function* () {
    yield telemetry_1.profile(argv, () => __awaiter(void 0, void 0, void 0, function* () {
        yield submit_1.submitAction("FULLSTACK");
    }));
});
exports.handler = handler;
//# sourceMappingURL=submit.js.map