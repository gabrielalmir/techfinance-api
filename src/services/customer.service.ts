import type { CustomerRepository, GetCustomersQuery } from "../repositories/customer.repository";

export class CustomerService {
    constructor(
        private readonly customerRepository: CustomerRepository,
    ) { }

    async getCustomers(query: GetCustomersQuery) {
        const customers = await this.customerRepository.getCustomers(query);
        return customers;
    }
}
