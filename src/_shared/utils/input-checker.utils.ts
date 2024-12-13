import _ from "lodash";
import {
    InvalidProps,
    MissingParamError,
    RequisitNoComplert
} from "../../domain/erros";

export class InputChecker {
    constructor(private readonly input: any) {
        this.input = input;
        this.isValid();
    }

    private isValid() {
        if (!this.input) throw new MissingParamError(`Input is required`);
    }

    public toErro(msg) {
        throw new RequisitNoComplert(msg);
    }

    public needToInclude(field: string, options: string[]) {
        if (!options.includes(_.get(this.input, field)))
            throw new InvalidProps(
                `${field} inválido: permitido somente ${options.join(", ")} `
            );
    }

    public isString(fields: string[]) {
        fields.forEach((field) => {
            if (!_.get(this.input, field))
                throw new MissingParamError(`${field} não informado!`);
            if (typeof _.get(this.input, field) != "string")
                throw new InvalidProps(`${field} inválido!`);
        });
    }

<<<<<<< HEAD
=======
    public isDate(fields: string[]) {
        fields.forEach((field) => {
            if (!Date.parse(_.get(this.input, field)))
                throw new InvalidProps(`${field} não é uma data válida!`);
        });
    }

>>>>>>> master
    public isArrayofType?(fields: string[], type: string) {
        fields.forEach((field) => {
            if (
                !_.get(this.input, field) ||
                !_.get(this.input, `${field}.length`)
            )
                throw new MissingParamError(`${field} não informado!`);
            if (!Array.isArray(_.get(this.input, field))) {
                throw new InvalidProps(`${field} inválido!`);
            }
            _.get(this.input, field).forEach((item) => {
                if (typeof item != type)
                    throw new InvalidProps(`${field} inválido!`);
            });
        });
    }

    public isNumber(fields: string[]) {
        fields.forEach((field) => {
            if (typeof _.get(this.input, field) == "undefined")
                throw new MissingParamError(`${field} não informado!`);

            if (typeof _.get(this.input, field) != "number")
                throw new InvalidProps(`${field} inválido!`);
        });
    }

    public isBooleans(fields: string[]) {
        fields.forEach((field) => {
            if (![true, false].includes(_.get(this.input, `${field}`)))
                throw new InvalidProps(`${field} inválido!`);
        });
    }

    public isArrayWithValues(field: string, options: any[]) {
        if (_.get(this.input, field)?.length) {
            _.get(this.input, field).forEach((item) => {
                if (!options.includes(item))
                    throw new InvalidProps(
                        `${field} inválido: permitido somente ${options.join(
                            ", "
                        )} `
                    );
            });
        }
    }

    public isArrayOfObject(field, options): boolean {
<<<<<<< HEAD
        for (let objectData of this.input[field]) {
=======
        for (let objectData of _.get(this.input, `${field}`)) {
>>>>>>> master
            return this.isObjectWithValues(objectData, options);
        }
        return true;
    }
<<<<<<< HEAD
=======

>>>>>>> master
    public isObjectWithValues(
        input: any = {},
        fields: string[],
        name?: string
    ) {
        for (let field of fields) {
            const param = field.split(":");
            if (
                (param.find((p) => p === "optional") &&
                    typeof _.get(input, param[0]) === "undefined") ||
                (Array.isArray(_.get(input, `${param[0]}`)) &&
                    !_.get(input, `${param[0]}.length`))
            ) {
                continue;
            }

            if (typeof _.get(input, param[0]) === "object") {
                if (!Array.isArray(_.get(input, param[0]))) {
                    throw new InvalidProps(
                        `${name}.${param[0]} não é um array`
                    );
                } else {
                    const [typeArrayField] = field.split(":").slice(2, 3);

                    if (
                        !_.get(input, param[0]).find(
                            (v) => typeof v === typeArrayField
                        )
                    )
                        throw new InvalidProps(
                            `${name}.${param[0]} informado é inválido!`
                        );
                    else return true;
                }
            }
            if (typeof _.get(input, param[0]) !== param[1])
                throw new InvalidProps(
                    `${name}.${param[0]} não é um(a) ${param[1]}.`
                );
        }

        return true;
    }
    public validate(
        input = {},
        fields: { name: string; type: string; required: boolean }[]
    ) {
        fields.forEach((field) => {
            if (!Object.keys(input).includes(field.name)) {
                if (field.required)
                    throw new MissingParamError(`${field} não informado!`);
            } else {
                if (typeof input[field.name] !== field.type)
                    throw new InvalidProps(`${field.name} inválido!`);
            }
        });
    }

    public throwError(msg: string) {
        throw new InvalidProps(msg);
    }
}

export class InputValidations {
    private fields: FieldValidation[] = [];
    private errors: any[] = [];

    addField(name: string, type: "boolean" | "number" | "string" | "date") {
        const field = new FieldValidation(name, type);
        this.fields.push(field);
        return field;
    }

    validate(input: any) {
        this.fields.forEach((field) => {
            if (!Object.keys(input).includes(field.name)) {
                // if (field.isRequired) throw new MissingParamError(`${field} não informado!`)
                if (field.isRequired)
                    this.errors.push(
                        new MissingParamError(`${field.name} não informado!`)
                    );
            } else {
                if (field.isArray) {
                    this.validateArray(input[field.name], field);
                } else {
                    this.validateField(input[field.name], field);
                }
            }
        });

        if (this.errors.length) {
            let message = [];

            this.errors.forEach((error) =>
                message.push({ tipo: error.name, message: error.message })
            );

            throw new Error(JSON.stringify(message, null, 2));
        }
    }

    private validateField(property: any, field: FieldValidation) {
        if (field.type === "date") {
            if (!Date.parse(property))
                this.errors.push(
                    new InvalidProps(
                        `o valor da propriedade ${field.name} não é uma data válida!`
                    )
                );
        } else {
            if (typeof property !== field.type)
                this.errors.push(
                    new InvalidProps(
                        `tipo da propridade ${field.name} inválido!`
                    )
                ); // throw new InvalidProps(`tipo da propridade ${field.name} inválido!`)
        }

        if (field.values) {
            if (!field.values.includes(property)) {
                this.errors.push(
                    new InvalidProps(
                        `o valor da propriedade ${
                            field.name
                        } é inválido! Permitido somente ${field.values.join(
                            ", "
                        )}`
                    )
                );
            }
        }

        if (field.isNonEmpty) {
            if (property === null)
                this.errors.push(
                    new InvalidProps(
                        `o valor da propriedade ${field.name} não pode ser vazio`
                    )
                ); //throw new InvalidProps(`o valor da propriedade ${field.name} não pode ser vazio`)

            if (typeof property === "undefined")
                this.errors.push(
                    new InvalidProps(
                        `o valor da propriedade ${field.name} não pode ser vazio`
                    )
                ); // throw new InvalidProps(`o valor da propriedade ${field.name} não pode ser vazio`)

            if (typeof property === "string" && !property?.length)
                this.errors.push(
                    new InvalidProps(
                        `o valor da propriedade ${field.name} não pode ser vazio`
                    )
                ); //throw new InvalidProps(`o valor da propriedade ${field.name} não pode ser vazio`)
        }
    }

    private validateArray(property: any[], field: FieldValidation) {
        if (!Array.isArray(property))
            this.errors.push(
                new InvalidProps(`tipo da propridade ${field.name} inválido!`)
            ); // throw new InvalidProps(`tipo da propridade ${field.name} inválido!`)
        if (field.isNonEmpty && !property.length)
            this.errors.push(
                new InvalidProps(
                    `o valor da propriedade ${field.name} não pode ser vazio`
                )
            );

        property.forEach((item) => {
            this.validateField(item, field);
        });
    }
}

export class FieldValidation {
    name: string;
    type: string;
    isRequired?: boolean;
    isNonEmpty?: boolean;
    isArray?: boolean;
    instanceType?: any;
    values?: any[];

    constructor(name: string, type: "boolean" | "number" | "string" | "date") {
        this.name = name;
        this.type = type;
        this.isRequired = true;
    }

    optional() {
        this.isRequired = false;
        return this;
    }

    nonEmpty() {
        this.isNonEmpty = true;
        return this;
    }

    array() {
        this.isArray = true;
        return this;
    }

    instanceOf(instanceName: string) {
        this.instanceType = instanceName;
    }

    onlyValues(values: any[]) {
        this.values = values;
    }
}
