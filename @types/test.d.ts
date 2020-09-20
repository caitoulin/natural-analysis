declare const name: string;
declare function getName(): string;
declare class Animal {
    constructor(name: string);
    sayHi(): string;
}
interface Options {
    data: any;
}

export { name, getName, Animal, Options };
