
interface IPropRef {
    $ref: string;
}

interface IPropString {
    type: 'string';
}

interface IPropInteger {
    type: 'integer';
}

interface IPropNumber {
    type: 'number';
}

interface IPropBoolean {
    type: 'boolean';
}

interface IPropArray {
    type: 'array';
    items: IPropRef;
}

interface IPropObject {
    type: 'object';
}


interface IPropEnum extends IPropString {
    enum: string[];
}

interface IPropUuid extends IPropString {
    format: 'uuid';
}

interface IPropDate extends IPropString {
    format: 'date';
}

interface IPropDateTime extends IPropString {
    format: 'date-time';
}

interface IPropDouble extends IPropNumber {
    format: 'double';
}

interface IPropInt32 extends IPropInteger {
    format: 'int32';
}

interface IPropInt64 extends IPropInteger {
    format: 'int64';
}

type TPropSimple = IPropObject | IPropString | IPropInteger | IPropNumber | IPropBoolean;
type TPropExtends = IPropUuid | IPropEnum | IPropDate | IPropDateTime | IPropDouble | IPropInt32 | IPropInt64;
export type TPropAll = TPropSimple | TPropExtends | IPropRef | IPropArray;

export interface IProperties {
    [key: string]: TPropAll & {
        required?: boolean;
    };
}

export interface IDefinition {
    type?: 'object';
    title?: string;
    properties: IProperties;
}

export interface IDefinitions {
    [key: string]: IDefinition;
}




export interface ISchema {
    $ref: string;
    type: string;
    // items: {
    //     $ref: string;
    //     type: string;
    // }
}

export interface IParameter {
    in: 'body' | 'path' | 'query';
    name: string;
    // format: string;
    // type: string;
    required: boolean;
    schema: ISchema;
}

export interface IPathData {
    parameters: (IParameter & TPropAll)[];
    responses: {
        [code: number]: {
            schema: ISchema;
        };
    };
}


export interface IPath {
    get: IPathData;
    post: IPathData;
    put: IPathData;
    delete: IPathData;
}

export interface IPaths {
    [path: string]: IPath;
}



//////////////////////

// interface ISchema {
//     $ref?: string;
//     type?: string;
// }

export interface ISwaggerHttpEndpoint {
    tags: string[];
    summary?: string;
    operationId: string;
    // consumes: Consumers[];
    // produces: Producers[];
    parameters: {
        name: string;
        in: 'path' | 'query' | 'body';
        required: boolean;
        description?: string;
        type?: string;
        schema?: ISchema;
        maxLength?: number;
        minLength?: number;
    }[];
    responses: {
        [httpStatusCode: string]: {
            description: string;
            schema: ISchema;
        }
    }
    deprecated: boolean;
}

export interface ISwaggerDefinitions {
    [namespace: string]: ISwaggerDefinition;
}

export interface ISwaggerDefinition extends ISchema {
    properties: ISwaggerDefinitionProperties;
    description?: string;
    required?: (keyof ISwaggerDefinitionProperties)[];
    allOf?: ISwaggerDefinition[];
    enum?: string[];
}

export interface ISwaggerDefinitionProperties {
    [propertyName: string]: ISwaggerPropertyDefinition;
}

export interface ISwaggerPropertyDefinition extends Omit<ISchema, 'items'> {
    description?: string;
    maxLength?: number;
    minLength?: number;
    maximum?: number;
    minimum?: number;
    format?: string;
    pattern?: string;
    items?: ISwaggerDefinition;
    readonly?: boolean;
    enum?: string[];
}

export interface ISwaggerPaths {
    [endpointPath: string]: {
        get: ISwaggerHttpEndpoint;
        post: ISwaggerHttpEndpoint;
        put: ISwaggerHttpEndpoint;
        delete: ISwaggerHttpEndpoint;
    }
}

export interface ISwagger {
    swagger: string;
    info: {
        version: string;
        title: string;
        description: string;
    };
    host: string;
    basePath: string;
    schemes: string[];
    paths: ISwaggerPaths;
    definitions: ISwaggerDefinitions;
}