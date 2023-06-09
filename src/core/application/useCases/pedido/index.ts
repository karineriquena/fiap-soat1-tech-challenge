import { StatusPedidoEnum } from "@domain/entities/pedido";
import { AssertionConcern } from "@domain/base/assertionConcern";
import { PedidoRepository } from "@domain/repositories/pedidoRepository.interface";
import { ProdutoRepository } from "@domain/repositories/produtoRepository.interface";
import { ValorTotal } from "@domain/valueObjects/valorTotal";
import { ResourceNotFoundError } from "@domain/errors/resourceNotFoundError";
import { PedidoMapper } from "@mappers/pedidoMapper";
import { IPedidoUseCase } from "./pedido.interface";
import { PedidoDTO } from "./dto";

export class PedidoUseCase implements IPedidoUseCase {
    constructor(
        private readonly pedidoRepository: PedidoRepository,
        private readonly produtoRepository: ProdutoRepository,
    ) {}

    public async getAll(): Promise<PedidoDTO[]> {
        const results = await this.pedidoRepository.getAll();

        return results.map((result) => PedidoMapper.toDTO(result));
    }

    public async getById(id: string): Promise<PedidoDTO> {
        const result = await this.pedidoRepository.getById(id);

        if (!result) throw new ResourceNotFoundError("Pedido não encontrado");

        return PedidoMapper.toDTO(result);
    }

    public async create(pedido: PedidoDTO): Promise<PedidoDTO> {
        if (
            pedido.status &&
            pedido.status !== StatusPedidoEnum.Pagamento_pendente
        ) {
            throw new Error("Não é necessário informar o status");
        }

        const ids = pedido.itens.map((item) => item.produtoId);

        const itensPedido = await this.produtoRepository.getByIds(ids);

        const itensComPreco = pedido.itens.map((item) => ({
            ...item,
            preco: itensPedido.find((produto) => produto.id === item.produtoId)
                .preco,
        }));

        const valorTotal = ValorTotal.create(itensComPreco);

        const newPedido = {
            ...pedido,
            valorTotal: valorTotal.value,
            itens: itensComPreco,
        };

        const result = await this.pedidoRepository.create(newPedido);
        return PedidoMapper.toDTO(result);
    }

    public async update(
        id: string,
        pedido: Omit<Partial<PedidoDTO>, "id" | "cliente">,
    ): Promise<PedidoDTO> {
        AssertionConcern.assertArgumentNotEmpty(pedido, "Pedido is required");

        const doesPedidoExists = await this.pedidoRepository.getById(id);

        if (!doesPedidoExists) {
            throw new ResourceNotFoundError("Pedido não encontrado");
        }

        const result = await this.pedidoRepository.update(id, pedido);
        return PedidoMapper.toDTO(result);
    }

    public async updatePaymentStatus(id: string): Promise<PedidoDTO> {
        const pedidoToUpdateStatus = await this.pedidoRepository.getById(id);

        if (!pedidoToUpdateStatus) {
            throw new ResourceNotFoundError("Pedido não encontrado");
        }
        if (
            pedidoToUpdateStatus.status !== StatusPedidoEnum.Pagamento_pendente
        ) {
            throw new Error("Pedido já foi pago");
        }

        const result = await this.pedidoRepository.update(id, {
            status: StatusPedidoEnum.Recebido,
        });
        return PedidoMapper.toDTO(result);
    }
}
