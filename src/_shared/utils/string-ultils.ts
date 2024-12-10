export class StringUtils {
    static standardizeText(value: any): string {
        if (!value) return null;
        return String(value)
            .replace(/[\`\']/g, "")
            .trim();
    }

    static standardizeTitulo(value: any): string {
        if (!value) return null;
        return String(value)
            .replace(/\D/g, "")
            .replace(/[\`\']/g, "")
            .trim();
    }

    static standardizeNumero(value: any): string {
        if (!value) return null;
        const n = String(value)
            .replace(/\D/g, "")
            .replace(/[\`\']/g, "")
            .trim();
        if (!n) return null;
        return n;
    }

    static standardizeEmail(value: any): string {
        if (!value) return null;
        return String(value).toLowerCase().trim();
    }

    static standardizePhone(value: any): string {
        if (!value) return null;
        return String(value)
            .replace(/[\`\']/g, "")
            .replace(/[\s\-\(\)\.\,\!\?]/g, "");
    }

    static standardizeCEP(value: any): string {
        if (!value) return null;
        const cep = String(value).replace(/[\s\-\(\)\.\,\!\?]/g, "");
        if (cep.length != 8) return null;
        return cep;
    }

    static standardizeName(name: string): string {
        if (!name) return null;
        return name
            .trim()
            .replace(/[\`\']/g, "")
            .toUpperCase();
    }

    static isValidCEP(cep): boolean {
        return String(cep).length != 8 ? false : true;
    }

    static normalizeND(texto: string): string {
        return texto
            .toUpperCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/'/g, "");
    }

    static formatCurrencyToNumber(value: string): number {
        return parseFloat(
            value.replace(/\./g, "").replace(",", ".").replace("R$", "").trim()
        );
    }
}
