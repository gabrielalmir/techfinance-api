import type { GetProductQuery, ProductRepository } from "../repositories/product.repository";

export class ProductService {
    constructor(
        private readonly productRepository: ProductRepository,
    ) { }

    async getProducts(query: GetProductQuery) {
        return await this.productRepository.getProducts(query);
    }
}

