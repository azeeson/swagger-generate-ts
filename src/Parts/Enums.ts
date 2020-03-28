import {createEnumDeclaration, createToken, SyntaxKind, createIdentifier, createEnumMember, createStringLiteral, EnumDeclaration} from "typescript";
import {GenerateTSFile} from "./GenerateTSFile";

export class EnumsConstructor {
    private file: string;
    private enums: EnumDeclaration[] = [];

    constructor(file: string) {
        this.file = file.replace(/\.ts$/, '');
    }

    private createName(nameModel: string, nameVield: string): string {
        const name = nameVield.slice(0, 1).toUpperCase() + nameVield.slice(1);
        return 'E' + (name.indexOf(nameModel) === -1 ? nameModel : '') + name;
    }

    getFileName() {
        return this.file;
    }

    addEnum(space: string, name: string, variables: string[]) {
        const emunName = this.createName(space, name);
        const node = createEnumDeclaration(
            undefined,
            [createToken(SyntaxKind.ExportKeyword)],
            createIdentifier(emunName),
            variables.map(value => createEnumMember(
                value.replace(/^[^A-Z]+/g, ''),
                createStringLiteral(value)
            ))
        );
        this.enums.push(node);
        return emunName;
    }

    save() {
        const models = new GenerateTSFile(this.file);
        this.enums.forEach(item => models.addNode(item));
        models.save();
    }
}