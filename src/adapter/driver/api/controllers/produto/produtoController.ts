import { ProdutoUseCase } from "@useCases/produto/types";

import { Request, Response } from "express";

export class ProdutoController {
    private readonly produtoUseCase: ProdutoUseCase;

    constructor(produtoUseCase: ProdutoUseCase) {
        this.produtoUseCase = produtoUseCase;
    }

    public async post(req: Request, res: Response): Promise<Response> {
        const result = await this.produtoUseCase.createProduto();
        return res.status(200).json(result);
    }
}
