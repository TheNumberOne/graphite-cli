import yargs from 'yargs';
export declare const command = "create-stack";
export declare const canonical = "create-stack";
export declare const aliases: string[];
export declare const description = false;
declare const args: {};
export declare const builder: {};
declare type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export declare const handler: (argv: argsT) => Promise<void>;
export {};