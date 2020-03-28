import {SourceFile, createSourceFile, ScriptTarget, ScriptKind, Statement, createPrinter, NewLineKind, Node, Printer, EmitHint, SyntaxKind, createNotEmittedStatement, addSyntheticLeadingComment} from "typescript";
import {writeFileSync} from "fs";
import {Dependency} from "./Dependency";


export class GenerateTSFile {
    private content: string[] = [];
    private printer: Printer;
    private file: SourceFile;
    private list: Statement[] = [];
    private deps: Dependency = new Dependency();

    constructor(fileName: string) {
        this.file = createSourceFile(fileName, "", ScriptTarget.Latest, false, ScriptKind.TS);
        this.printer = createPrinter({ newLine: NewLineKind.LineFeed });
    }

    private print(node: Node, newLine: boolean = true) {
        const content = this.printer.printNode(EmitHint.Unspecified, node, this.file);
        this.content.push(content + (newLine ? '\n' : ''));
        // newLine && this.content.push('\n');
    }

    addDependency(deps: Dependency) {
        this.deps.merge(deps);
    }

    addNode(node: Statement) {
        this.list.push(node);
    }

    save() {
        const commentText = 'Automatically generated by scripts.\nDO NOT MODIFY MANUALLY.';

        // this.list = [...this.deps.createImportsTS(this.file.fileName), ...this.list];

        this.print(
            addSyntheticLeadingComment(
                createNotEmittedStatement(this.file),
                SyntaxKind.MultiLineCommentTrivia,
                "*\n * " + commentText.replace(/\n/g, "\n * ") + "\n ",
                false
            )
        )

        this.deps.createImportsTS(this.file.fileName).forEach((node, index, arr) => {
            this.print(node, arr.length === index + 1);
        });

        this.list.forEach(node => {
            this.print(node);
        })

        // const content = this.list.reduce((data, node) => {
        //     return data + printer.printNode(EmitHint.Unspecified, node, this.file) + '\n\n';
        // }, '');

        writeFileSync(`${this.file.fileName}.ts`, this.content.join('\n'));
    }
}