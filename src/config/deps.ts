import { CustomerRepository } from "../repositories/customer.repository";
import { PaymentRepository } from "../repositories/payment.repository";
import { ProductRepository } from "../repositories/product.repository";
import { SalesRepository } from "../repositories/sales.repository";
import { CustomerService } from "../services/customer.service";
import { MCPService } from "../services/mcp/mcp.service";
import { PaymentService } from "../services/payment.service";
import { ProductService } from "../services/product.service";
import { OpenAIService } from "../services/prompt/openai.service";
import { SaleService } from "../services/sales.service";
import logger from './logger';

// Payment
export const paymentRepository = new PaymentRepository();
export const paymentService = new PaymentService(paymentRepository, new OpenAIService());

// Sales
export const salesRepository = new SalesRepository();
export const salesService = new SaleService(salesRepository);

// Products
export const productRepository = new ProductRepository();
export const productService = new ProductService(productRepository);

// Customers
export const customerRepository = new CustomerRepository();
export const customerService = new CustomerService(customerRepository);

// MCP Service
export const mcpService = new MCPService();

export { logger };

