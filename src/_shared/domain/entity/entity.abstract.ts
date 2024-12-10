import { GeneratorIdUtils } from "../../utils/generator-id.utils";

export abstract class Entity<Props = any> {
    public readonly _id: string;

    constructor(public readonly props: Props, _id?: string) {
        this._id = _id || GeneratorIdUtils.execute();
    }

    toJSON(): Required<{ _id: string } & Props> {
        return {
            _id: this._id,
            ...this.props
        } as Required<{ _id: string } & Props>;
    }
}

export default Entity;
