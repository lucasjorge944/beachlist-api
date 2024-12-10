export class ConvertGander {
    static abbreviatedToComplete(gander: string): string {
        if (!gander) return "n-a";
        if (gander.toUpperCase() == "M") return "masculino";
        if (gander.toUpperCase() == "f") return "feminino";
    }
}
