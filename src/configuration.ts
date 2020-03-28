import {resolve} from 'path';

var currentPath = process.cwd();
console.log(currentPath)

export type TFuncResolve = (name: string) => string;

export interface IOptions {
    definitions?: {
        exclude?: (string | RegExp)[];
    },
    paths?: {
        exclude?: (string | RegExp)[];
    }
    files?: {
        models?: string;
        enums?: string;
        api?: string;
    },
    defaultRequire?: boolean;
    rules?: [],
    resolveFileModel?: TFuncResolve;
}

export interface IHideOptions extends IOptions {
    splitInterface: boolean;
    files: {
        models: string;
        enums: string;
        api?: string;
    },
}

export function getDefaultOptions(options: IOptions = {}): IHideOptions {
    const {files = {}} = options;
    const fileEnums = (files.enums || './_TestEnums');
    const fileModels =  (files.models || './_TestModels');
    const splitInterface = !fileModels.match(/\.ts$/);


    return {
        defaultRequire: true,
        ...options,
        files: {
            enums: resolve(currentPath, fileEnums.replace(/\.ts$/, '')),
            models: resolve(currentPath, fileModels.replace(/\.ts$/, '')),
            ...options.files
        },
        splitInterface
    }
}