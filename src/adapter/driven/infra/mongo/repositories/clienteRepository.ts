import { Cliente } from "@domain/entities/cliente";
import { ClienteRepository } from "@domain/repositories/clienteRepository.interface";
import { ClienteMapper } from "@mappers/clienteMapper";
import { ClienteModel } from "../models";

export class ClienteMongoRepository implements ClienteRepository {
    constructor(private readonly clienteModel: typeof ClienteModel) {}

    public async create(cliente: Cliente): Promise<Cliente> {
        const result = await this.clienteModel.create({
            nome: cliente.nome,
            email: cliente.email.value,
            cpf: cliente.cpf.value,
        });

        return ClienteMapper.toDomain(result);
    }

    public async getByCpf(cpf: string): Promise<Cliente | undefined> {
        const result = await this.clienteModel.findOne({
            cpf: cpf,
            deleted: { $ne: true },
        });

        if (!result) return undefined;

        return ClienteMapper.toDomain(result);
    }

    public async getByEmail(email: string): Promise<Cliente | undefined> {
        const result = await this.clienteModel.findOne({
            email: email,
            deleted: { $ne: true },
        });

        if (!result) return undefined;

        return ClienteMapper.toDomain(result);
    }

    public async checkDuplicate(args: {
        email: string;
        cpf?: string;
    }): Promise<boolean> {
        const result = await this.clienteModel.count({
            $or: [{ cpf: args.cpf, email: args.email }],
        });

        return result > 0;
    }
}
