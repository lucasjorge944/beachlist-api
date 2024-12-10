export class RequisitNoComplert extends Error {
    constructor(paramName: string) {
        super(`Requisito não atendido: ${paramName}`);
        this.name = "RequisitNoComplert";
    }
}
