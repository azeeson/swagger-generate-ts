import {createIdentifier, createImportDeclaration, createImportClause, createNamedImports, createImportSpecifier, createLiteral} from "typescript";
import {dirname, relative, join} from 'path';
import {uniqueArray} from '../utils';

export class Dependency {
    private deps: {[file: string]: string[]} = {};

    add(file: string, name: string) {
        if (this.deps[file]) {
            this.deps[file].push(name);
        } else {
            this.deps[file] = [name];
        }
    }

    merge(deps: Dependency) {
        const _deps = deps.getDeps();
        this.deps = Object.keys(_deps).reduce((deps, dep) => {
            if (deps[dep]) {
                deps[dep] = [...deps[dep], ..._deps[dep]];
            } else {
                deps[dep] = _deps[dep];
            }
            return deps;
        }, this.deps);
    }

    getDeps() {
        return this.deps;
    }

    createImportsTS(fileName: string) {
        return Object.keys(this.deps).filter(imp => imp !== fileName).map(imp => {
            return createImportDeclaration(
                undefined,
                undefined,
                createImportClause(
                    undefined,
                    createNamedImports(
                        uniqueArray(this.deps[imp]).map(name => createImportSpecifier(undefined, createIdentifier(name)))
                    ),
                ),
                createLiteral('./' + relative(dirname(fileName), imp))
            );
        })
    }
}