const axios = require('axios');
require('dotenv').config();
const asaas_key = ('$aact_hmlg_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OmE2ZTM4MzBjLTM4OTYtNDE3NS05MzRjLWJmYjIyMzg3MzBlYjo6JGFhY2hfZmFkN2ZhMjctZjcwMi00NmZkLTg4YjYtYTc5YmI3MjhhMzIz');


/*

CLIENTE CRIADO EM AMBIENTE SANDBOX DO ASAAS

{
  object: 'customer',
  id: 'cus_000006781945',
  dateCreated: '2025-06-17',
  name: 'Cliente Teste',
  email: 'clienteteste@gmail.com',
  company: 'Empresa Teste',
  phone: '4738010919',
  mobilePhone: '47999376637',
  address: 'Av. Paulista',
  addressNumber: '150',
  complement: 'Sala 201',
  province: 'Centro',
  postalCode: '01310000',
  cpfCnpj: '24971563792',
  personType: 'FISICA',
  deleted: false,
  additionalEmails: null,
  externalReference: '12987382',
  notificationDisabled: true,
  observations: null,
  municipalInscription: null,
  stateInscription: null,
  canDelete: true,
  cannotBeDeletedReason: null,
  canEdit: true,
  cannotEditReason: null,
  city: 15873,
  cityName: 'São Paulo',
  state: 'SP',
  country: 'Brasil',
  groups: [ { name: 'Grupo Teste' } ]
}

*/

// Criação de Cliente
async function criarClienteAsaas(dadosCliente) {
    const options = {
    method: 'POST',
    url: 'https://api-sandbox.asaas.com/v3/customers',
    headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        access_token: asaas_key
    },
    data: {
        name: dadosCliente.name,
        cpfCnpj: dadosCliente.document,
        email: dadosCliente.email,
        phone: dadosCliente.phone,
        mobilePhone: dadosCliente.phone,
        address: dadosCliente.address,
        addressNumber: dadosCliente.addressNumber,
        complement: dadosCliente.complement,
        province: dadosCliente.province,
        postalCode: dadosCliente.postalCode,
        externalReference: dadosCliente.externalReference,
        notificationDisabled: true,
        groupName: 'Grupo IMPRIMEAI',
        company: 'IMPRIMEAI'
    }
    };

    try {
        const res = await axios.request(options);
        return res.data;
    } catch (err) {
        console.error(err);
        throw err;
    }
};

// criarClienteAsaas();

// Consultar um único cliente
async function consultarClienteAsaas() {
    const options = {
        method: 'GET',
        url: 'https://api-sandbox.asaas.com/v3/customers/cus_000006781945',
        headers: {
            accept: 'application/json',
            access_token: '$aact_hmlg_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6Ojg3YjA5YTE4LTM4ODYtNDQxNS1iYTY0LTM5ZDIyZTYyMWI3Mjo6JGFhY2hfZGFjZTM1YzktNTQ0NC00NjE2LTk5MTYtNGIzZWZmZTI0ZDhi'
        }
    };
    
    axios
    .request(options)
    .then(res => console.log(res.data))
    .catch(err => console.error(err));
};

// consultarClienteAsaas();

async function removerClienteAsaas() {
    const options = {
        method: 'DELETE',
        url: 'https://api.asaas.com/v3/customers/cus_000123749298',
        headers: {accept: 'application/json', access_token: asaas_key}
    };

    axios
    .request(options)
    .then(res => console.log(res.data))
    .catch(err => console.error(err));
}

// removerClienteAsaas();

// Cobranças via boleto
async function cobrancaBoletoAsaas(dadosCliente) {
    const options = {
        method: 'POST',
        url: 'https://api-sandbox.asaas.com/v3/payments',
        headers: {
            accept: 'application/json',
            'content-type': 'application/json',
            access_token:   '$aact_hmlg_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OjVhYmM1NGRjLTkwMmYtNDk5MC04Yzg3LThjMmNiNDQyZTM0OTo6JGFhY2hfZDZlYzZmOGYtNmFiZC00MzM4LTliZjUtYTFjY2RjNzFjNGU3'
        },
        data: {
            billingType: 'BOLETO',
            customer: dadosCliente.customer,
            value: dadosCliente.value,
            dueDate: dadosCliente.dueDate,
            description: 'Pedido Boleto IMPRIMEAI',
            daysAfterDueDateToRegistrationCancellation: 1
        }
    };
    
    try {
        const res = await axios.request(options);
        return res.data;
    } catch (err) {
        console.error(err);
        throw err;
    }
}

// cobrancaBoletoAsaas();

// Cobranças via Pix
async function cobrancaPixAsaas(dadosCliente) {
    const options = {
        method: 'POST',
        url: 'https://api-sandbox.asaas.com/v3/payments',
        headers: {
            accept: 'application/json',
            'content-type': 'application/json',
            access_token: asaas_key
        },
        data: {
            billingType: 'PIX',
            customer: dadosCliente.customer,
            value: dadosCliente.value,
            dueDate: dadosCliente.dueDate,
            description: 'Pedido Pix IMPRIMEAI'
        }
        };

    try {
        const res = await axios.request(options);
        return res.data;
    } catch (err) {
        console.error(err);
        throw err;
    }
}

// cobrancaPixAsaas();

// Cobrança via Cartão de Crédito
async function cobrancaCartaoAsaas(dadosCliente) {
    const options = {
    method: 'POST',
    url: 'https://api-sandbox.asaas.com/v3/payments/',
    headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        access_token: asaas_key
    },
    data: {
        billingType: 'CREDIT_CARD',
        value: dadosCliente.value,
        dueDate: dadosCliente.dueDate,
        description: 'Pedido Cartão IMPRIMEAI',
        remoteIp: '10.0.0.118',
        customer: dadosCliente.customer,
        creditCard: {
            holderName: dadosCliente.holder_name,
            number: dadosCliente.number,
            expiryMonth: dadosCliente.expiryMonth,
            expiryYear: dadosCliente.expiryYear,
            ccv: dadosCliente.ccv
        },
        creditCardHolderInfo: {
        name: dadosCliente.name,
        email: dadosCliente.email,
        cpfCnpj: dadosCliente.document,
        postalCode: dadosCliente.postalCode,
        addressNumber: dadosCliente.addressNumber,
        phone: dadosCliente.phone
    }
    }
    };

    try {
        const res = await axios.request(options);
        return res.data;
    } catch (err) {
        console.error(err);
        throw err;
    }
}

// cobrancaCartaoAsaas();

// Consultar status da cobrança Asaas
async function consultarCobranca(payment_id) {
    const options = {
    method: 'GET',
    url: `https://api-sandbox.asaas.com/v3/payments/${payment_id}/status`,
    headers: {
        accept: 'application/json',
        access_token: asaas_key
    }
    };

    try {
        const res = await axios.request(options);
        return res.data;
    } catch (err) {
        console.error(err);
        throw err;
    }
}

// Agendar NFS-e
async function agendarNfsAsaas(dadosNfs) {
    const options = {
        method: 'POST',
        url: 'https://api-sandbox.asaas.com/v3/invoices',
        headers: {
            accept: 'application/json',
            'content-type': 'application/json',
            access_token: asaas_key
        },
        data: {
            taxes: {retainIss: true, cofins: 1, csll: 1, inss: 1, ir: 1, pis: 1, iss: 5},
            payment: dadosNfs.payment,
            installment: null,
            customer: dadosNfs.customer,
            serviceDescription: 'Nf referente ao Pedido IMPRIMEAI',
            observations: 'Nf referente ao Pedido IMPRIMEAI',
            externalReference: dadosNfs.externalReference,
            value: dadosNfs.value,
            deductions: 0,
            effectiveDate: dadosNfs.effectiveDate,
            municipalServiceId: null,
            municipalServiceCode: '13.05',
            municipalServiceName: 'SEVICOS DE ACABAMENTOS GRAFICOS',
            updatePayment: null
        }
    };
    
    try {
        const res = await axios.request(options);
        console.log(res.data);  
        return res.data;
    } catch (err) {
        console.error(err);
        throw err;
    }
};

// Emitir NFS-e
async function emitirNfs(invoice) {
    const options = {
    method: 'POST',
    url: `https://api-sandbox.asaas.com/v3/invoices/${invoice}/authorize`,
    headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        access_token: asaas_key
    }
    };

    try {
        const res = await axios.request(options);
        console.log(res.data);  
        return res.data;
    } catch (err) {
        console.error(err);
        throw err;
    }
};
// Listar NFS-e
async function listarNfs(externalReference) {
    const options = {
    method: 'GET',
    url: `https://api-sandbox.asaas.com/v3/invoices?externalReference=${externalReference}`,
    headers: {
        accept: 'application/json',
        access_token: asaas_key
    }
    };

    try {
        const res = await axios.request(options);
        console.log(res.data);  
        return res.data;
    } catch (err) {
        console.error(err);
        throw err;
    }
}
// Loop para consulta de NF
async function consultarNf(externalReference) {
  while (true) {
    const response = await listarNfs(externalReference);

    if (Array.isArray(response.data)) {
      const nota = response.data.find(nf => nf.status === 'AUTHORIZED');
      if (nota) return nota;
    }

    await new Promise(resolve => setTimeout(resolve, 1000)); // aguarda 1s antes de tentar novamente
  }
}
// Transferências
async function transferenciasAsaas() {
    const options = {
        method: 'POST',
        url: 'https://api-sandbox.asaas.com/v3/transfers',
        headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        access_token: '$aact_hmlg_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6Ojg3YjA5YTE4LTM4ODYtNDQxNS1iYTY0LTM5ZDIyZTYyMWI3Mjo6JGFhY2hfZGFjZTM1YzktNTQ0NC00NjE2LTk5MTYtNGIzZWZmZTI0ZDhi'
    },
    data: {
        value: 1,
        bankAccount: {
            ownerName: 'Joao Silva',
            cpfCnpj: '99991111140',
            agency: '0001',
            account: '1234567',
            accountDigit: '8',
            bankAccountType: 'CONTA_CORRENTE',
            ispb: '99999004' // Identificador no Sistema de Pagamentos Brasileiro
        }
    }
    };

    axios
    .request(options)
    .then(res => console.log(res.data))
    .catch(err => console.error(err));
}

module.exports = { criarClienteAsaas, cobrancaPixAsaas, cobrancaBoletoAsaas, cobrancaCartaoAsaas, consultarCobranca, agendarNfsAsaas, emitirNfs, consultarNf };