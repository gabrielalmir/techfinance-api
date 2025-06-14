export interface Produto {
    codigo: string;
    descricao_produto: string;
    descricao_grupo: string;
    id_grupo: string;
}

export interface Cliente {
    id_cliente: number;
    razao_cliente: string;
    nome_fantasia: string;
    cidade: string;
    uf: string;
    id_grupo: string;
    descricao_grupo: string;
}

export interface ContaReceber {
    idcr: number;
    documento: string;
    titulo: number;
    parcela: number;
    id_cliente: number;
    razao_cliente: string;
    nome_fantasi: string;
    id_grupo_clie: number;
    descricao_gru: string;
    cidade: string;
    uf: string;
    valor_titulo: string;
    valor_recebid: string;
    valor_saldo: string;
    data_emissao: string;
    data_entrada: string;
    data_vencimento: string;
}

export interface Venda {
    id_venda: number;
    data_emissao: string;
    tipo: number;
    descricao_tipo: string;
    id_cliente: number;
    razao_cliente: string;
    nome_fantasia: string;
    id_grupo_cliente: number;
    descricao_grupo_cliente: string;
    cidade: string;
    uf: string;
    codigo_produto: string;
    descricao_produto: string;
    id_grupo_produto: string;
    descricao_grupo_produto: string;
    qtde: number;
    valor_unitario: string;
    total: string;
}
