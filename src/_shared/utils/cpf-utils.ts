export class CPFUtils {
    static clear(cpf: string | number): string {
        return String(cpf).replace(/\D/g, "");
    }

    static validate(CPF: string | number): boolean {
        CPF = String(CPF);
        CPF = CPF.replace(/[\s.-]*/gim, "");
        if (
            !CPF ||
            CPF.length != 11 ||
            !Array.from(CPF).filter((e) => e !== CPF[0]).length
        ) {
            return false;
        }
        let soma = 0;
        let resto;
        for (let i = 1; i <= 9; i++)
            soma = soma + parseInt(CPF.substring(i - 1, i)) * (11 - i);
        resto = (soma * 10) % 11;
        if (resto == 10 || resto == 11) resto = 0;
        if (resto != parseInt(CPF.substring(9, 10))) return false;
        soma = 0;
        for (let i = 1; i <= 10; i++)
            soma = soma + parseInt(CPF.substring(i - 1, i)) * (12 - i);
        resto = (soma * 10) % 11;
        if (resto == 10 || resto == 11) resto = 0;
        if (resto != parseInt(CPF.substring(10, 11))) return false;
        return true;
    }
}
