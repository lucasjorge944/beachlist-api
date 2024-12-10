export class CNPJUtils {
    static clear(CNPJ: string | number): string {
        return String(CNPJ).replace(/\D/g, "");
    }

    static validate(CNPJ: string | number): boolean {
        const regexCNPJ = /^\d{2}.\d{3}.\d{3}\/\d{4}-\d{2}$/;
        if (!CNPJ) return false;
        // Aceita receber o valor como string, número ou array com todos os dígitos
        const isString = typeof CNPJ === "string";
        const validTypes =
            isString || Number.isInteger(CNPJ) || Array.isArray(CNPJ);
        // Elimina valor de tipo inválido
        if (!validTypes) return false;
        // Filtro inicial para entradas do tipo string
        if (isString) {
            // Teste Regex para veificar se é uma string apenas dígitos válida
            const digitsOnly = /^\d{14}$/.test(CNPJ);
            // Teste Regex para verificar se é uma string formatada válida
            const validFormat = regexCNPJ.test(CNPJ);
            // Verifica se o valor passou em ao menos 1 dos testes
            const isValid = digitsOnly || validFormat;

            // Se o formato não é válido, retorna inválido
            if (!isValid) return false;
        }

        const matchNumbers = (value: string | number | number[] = "") => {
            const match = value.toString().match(/\d/g);
            return Array.isArray(match) ? match.map(Number) : [];
        };
        // Elimina tudo que não é dígito
        const numbers = matchNumbers(CNPJ);
        if (numbers.length !== 14) return false;
        // Elimina inválidos com todos os dígitos iguais
        const items = [...new Set(numbers)];
        if (items.length === 1) return false;

        // Separa os 2 últimos dígitos verificadores
        const digits = numbers.slice(12);

        const validCalc = (x: number, numbers: number[]) => {
            const slice = numbers.slice(0, x);
            let factor = x - 7;
            let sum = 0;
            for (let i = x; i >= 1; i--) {
                const n = slice[x - i];
                sum += n * factor--;
                if (factor < 2) factor = 9;
            }
            const result = 11 - (sum % 11);
            return result > 9 ? 0 : result;
        };
        // Valida 1o. dígito verificador
        const digit0 = validCalc(12, numbers);
        if (digit0 !== digits[0]) return false;
        // Valida 2o. dígito verificador
        const digit1 = validCalc(13, numbers);
        return digit1 === digits[1];
    }
}
