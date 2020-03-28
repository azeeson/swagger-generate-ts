import {createInterfaceDeclaration, createToken, SyntaxKind, createIdentifier, TypeElement, createPropertySignature, createKeywordTypeNode, createArrayTypeNode, TypeNode, createTypePredicateNode} from "typescript";
import {ISwaggerPropertyDefinition} from '../models';
import {EnumsConstructor} from './Enums';
import {Dependency} from './Dependency';
import { Utils } from "../index";

export class ModelConstructor {
    private utils: Utils;
    private name: string = '';
    private properties: TypeElement[] = [];
    private enums: EnumsConstructor;
    private dependency: Dependency = new Dependency();

    constructor(utils: Utils, name: string, enums: EnumsConstructor) {
        this.utils = utils;
        this.name = this.utils.resolveInterfaceName(name.replace('«', '<').replace('»', '>'));
        this.enums = enums;
    }

    private convertType(name: string, definition: ISwaggerPropertyDefinition): TypeNode {
        const {$ref, type, items, enum: enums} = definition;
        if ($ref) {
            const type = $ref.replace('#/definitions/', '').replace('«', '<').replace('»', '>');
            const ref = this.utils.resolveInterfaceName(type);
            this.dependency.add(this.utils.resolveInterfaceFileName(type), ref);
            return createTypePredicateNode(createIdentifier(ref), undefined);
        } if (type === 'array' && items) {
            return createArrayTypeNode(this.convertType(name, items));
        } else if (['integer', 'number'].includes(type)) {
            return createKeywordTypeNode(SyntaxKind.NumberKeyword);
        } else if (type === 'boolean') {
            return createKeywordTypeNode(SyntaxKind.BooleanKeyword);
        } else if (type === 'string' && enums) {
            const nameEnum = this.enums.addEnum(this.name, name, enums);
            this.dependency.add(this.enums.getFileName(), nameEnum);
            return createTypePredicateNode(createIdentifier(nameEnum), undefined);
        } else if (type === 'object') {
            return createKeywordTypeNode(SyntaxKind.AnyKeyword);
        } else if (type === 'string') {
            return createKeywordTypeNode(SyntaxKind.StringKeyword);
        } else {
            return createKeywordTypeNode(SyntaxKind.NullKeyword);
        }
    }

    getFileName() {
        return this.utils.resolveInterfaceFileName(this.name);
    }

    addProperties(name: string, definition: ISwaggerPropertyDefinition) {
        const require = false;
        const property = createPropertySignature(
            undefined,
            createIdentifier(name),
            require ? undefined : createToken(SyntaxKind.QuestionToken),
            this.convertType(name, definition),
            undefined
        );
        this.properties.push(property);
    }

    getDependency() {
        return this.dependency;
    }

    createInterfaceTS() {
        return createInterfaceDeclaration(
            undefined,
            [createToken(SyntaxKind.ExportKeyword)],
            createIdentifier(this.name),
            [], [],
            this.properties
        );
    }
    
}