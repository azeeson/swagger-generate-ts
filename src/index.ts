
import {IOptions, getDefaultOptions, IHideOptions, TFuncResolve} from './configuration';
import {ISwagger} from './models';
import {readFileSync} from 'fs';
import { EnumsConstructor } from './Parts/Enums';
import { ModelGenerate } from './Parts/ModelGenerate';
import {resolve} from 'path';

export class Utils {
    private cfg: IHideOptions;

    constructor(options: IHideOptions) {
        this.cfg = options;
    }

    private runResolve(fn: TFuncResolve, name: string) {
        return fn && typeof fn === 'function' ? fn(name) : name;
    }

    resolveInterfaceName(name: string) {
        return name.replace(/^I?([A-Z].+)$/, 'I$1');
    }

    resolveInterfaceFileName(name: string) {
        const {resolveFileModel} = this.cfg;
        return resolve(
            this.cfg.files.models,
            this.runResolve(resolveFileModel, name.replace(/^I?([A-Z][a-z]+)(.+)?$/, '$1'))
        );
    }
}

function getSchemaFromFile(path: string): Promise<ISwagger> {
    try {
        const json: ISwagger = JSON.parse(readFileSync(path, 'utf-8'));
        if (json.swagger && ~json.swagger.indexOf('2.')) {
            return Promise.resolve(json);
        } else {
            return Promise.reject();
        }
    } catch {
        return Promise.reject();
    }
}

function parseSchemas(schema: ISwagger, options: IHideOptions) {
    const utils = new Utils(options);

    const enums = new EnumsConstructor(options.files.enums);
    const models = new ModelGenerate(utils, options, enums);
    models.parseDefinitions(schema.definitions);
    models.save();
    enums.save();
}

export default (function() {
    return function generateTSFiles(file: string, options: IOptions) {
        const cfg = getDefaultOptions(options);
        console.log(cfg);

        getSchemaFromFile(file).then((schema: ISwagger) => {
            parseSchemas(schema, cfg)
        }).finally(() => {
        //     console.log(('\n\n\n\n\n\n'));
        });
    }
})();