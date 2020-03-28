import { EnumsConstructor } from "./Enums";
import { IHideOptions } from "../configuration";
import { ModelConstructor } from "./Model";
import {ISwaggerDefinitions, ISwaggerPropertyDefinition} from '../models';
import { checkExclude, objForEach } from "../utils";
import { Utils } from "../index";
import { existsSync, mkdirSync } from "fs";
import { GenerateTSFile } from "./GenerateTSFile";

export class ModelGenerate {
    private utils: Utils;
    private options: IHideOptions;
    private enums: EnumsConstructor;
    private models = new Map<string, ModelConstructor>();

    constructor(utils: Utils, options: IHideOptions, enums: EnumsConstructor) {
        this.options = options;
        this.enums = enums;
        this.utils = utils;
        
    }

    parseDefinitions(definitions: ISwaggerDefinitions) {
        objForEach(definitions, (name: string, definition) => {
            if (name.indexOf('Page«') !== -1) return void 0;

            const {exclude = []} = this.options.definitions || {};
            const {type, properties} = definition;

            if (type !== 'object') return void 0;
            if (exclude.length > 0 && checkExclude(name, exclude)) return void 0;

            const model = new ModelConstructor(this.utils, name, this.enums);

            objForEach(properties, (property: string, definition: ISwaggerPropertyDefinition) => {
                model.addProperties(property, definition);
            });

            this.models.set(name, model);
        });
    }

    save() {
        const {splitInterface, files} = this.options;
        if (splitInterface) {
            !existsSync(files.models) && mkdirSync(files.models);
            const _files: {[file: string]: GenerateTSFile} = {};
            this.models.forEach((model) => {
                const fileName = model.getFileName();
                console.log(fileName);
                if (!_files[fileName]) 
                    _files[fileName] = new GenerateTSFile(fileName);

                _files[fileName].addDependency(model.getDependency())
                _files[fileName].addNode(model.createInterfaceTS());

                // console.log('fileName', fileName);
            });
            Object.values(_files).forEach(file => {
                file.save()
            })
        } else {
            const file = new GenerateTSFile(files.models);
            this.models.forEach(model => {
                file.addDependency(model.getDependency())
                file.addNode(model.createInterfaceTS());
            });
            file.save();
        }
    }
}