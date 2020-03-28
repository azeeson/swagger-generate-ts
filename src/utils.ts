
export function checkExclude(value: string, rules: (string | RegExp)[]): boolean {
    return rules?.some((rule: string | RegExp) => {
        if (typeof rule === 'string') return value === rule;
        if (typeof rule === 'object' && rule.test) return rule.test(value);
        return false;
    })
}

export function uniqueArray(arr: any[]) {
    return arr.filter(function(elem, pos, arr) {
        return elem && arr.indexOf(elem) == pos;
    });
};

export function objForEach<T>(object: T, acc: (key: keyof T, value: T[keyof T]) => void) {
    const keys = Object.keys(object) as (keyof T)[];
    keys.forEach((key: keyof T) => acc(key, object[key]));
}