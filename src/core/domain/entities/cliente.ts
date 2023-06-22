import { AssertionConcern } from "../base/assertionConcern";
import { Entity } from "../base/entity.interface";
import { Cpf, Email } from "../valueObjects";

interface ClienteProperties
    extends Omit<
        Cliente,
        "id" | "createdAt" | "updatedAt" | "deletedAt" | "validateEntity"
    > {
    id?: string;
}

export class Cliente implements Entity {
    id: string;
    nome: string;
    email: Email;
    cpf?: Cpf;

    constructor(fields: ClienteProperties) {
        this.id = fields?.id;
        this.nome = fields.nome;
        this.email = fields.email;
        this.cpf = fields?.cpf;

        this.validateEntity();
    }

    public validateEntity(): void {
        AssertionConcern.assertArgumentNotEmpty(this.nome, "Nome is required");
    }
}