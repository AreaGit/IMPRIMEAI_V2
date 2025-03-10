/*const axios = require('axios');
const fs = require('fs');
const path = require('path');

const CLIENT_ID = 'JPgVjgFJdPC0hkMmn80w';
const CLIENT_SECRET = 'FpBK74VVyiSAHeTfzXCBy4Kz7ecOO4hZfEOVON4p';
const TOKEN_URL = 'https://auth.nuvemfiscal.com.br/oauth/token';
const BASE_URL = 'https://api.nuvemfiscal.com.br';

async function obterToken() {
    try {
        const response = await axios.post(
            TOKEN_URL,
            new URLSearchParams({
                grant_type: 'client_credentials',
                scope: 'conta empresa nfse'
            }),
            {
                auth: {
                    username: CLIENT_ID,
                    password: CLIENT_SECRET
                },
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );
        return response.data.access_token;
    } catch (error) {
        console.error('Erro ao obter token:', error.response ? error.response.data : error.message);
        throw new Error('Falha na autenticação');
    }
}

async function emitirNFe() {
    try {
        const token = await obterToken();
        console.log("Token obtido:", token);
        
        const response = await axios.post(
            `${BASE_URL}/nfse/dps`,
            {
                "provedor": "padrao",  // Não houve alteração
                "ambiente": "homologacao",  // Não houve alteração
                "referencia": "NF123456",  // Não houve alteração
                "infDPS": {
                    "tpAmb": 2,  // Não houve alteração
                    "dhEmi": "2025-03-05T14:15:22Z",  // Não houve alteração
                    "verAplic": "1.0",  // Não houve alteração
                    "dCompet": "2025-03-05",  // Não houve alteração
                    "subst": {
                        "chSubstda": "12345678901234567890123456789012345678901234567890",  // Não houve alteração
                        "cMotivo": "01",  // Não houve alteração
                        "xMotivo": "Substituição por correção de dados"  // Não houve alteração
                    },
                    "prest": {
                        "CNPJ": "54067133000104",  // Não houve alteração
                        "CPF": null  // Não houve alteração
                    },
                    "toma": {
                        "orgaoPublico": false,  // Não houve alteração
                        "CNPJ": "54067133000104",  // Não houve alteração
                        "CPF": null,  // Não houve alteração
                        "NIF": null,  // Não houve alteração
                        "cNaoNIF": 0,  // Não houve alteração
                        "CAEPF": null,  // Não houve alteração
                        "IM": "123456",  // Não houve alteração
                        "xNome": "Cliente Exemplo LTDA",  // Não houve alteração
                        "end": {
                            "endNac": {
                                "cMun": "3550308",  // Não houve alteração
                                "CEP": "09531190"  // Não houve alteração
                            },
                            "xLgr": "Avenida Paulista",  // Não houve alteração
                            "nro": "1000",  // Não houve alteração
                            "xCpl": "Conjunto 101",  // Não houve alteração
                            "xBairro": "Bela Vista"  // Não houve alteração
                        },
                        "fone": "(11) 99999-8888",  // Não houve alteração
                        "email": "contato@clienteexemplo.com.br"  // Não houve alteração
                    },
                    "serv": {
                        "locPrest": {
                            "cLocPrestacao": "3548807",  // Não houve alteração
                            "cPaisPrestacao": "BR"  // Não houve alteração
                        },
                        "cServ": {
                            "cTribNac": "1813-0/01",  // Não houve alteração
                            "cTribMun": "1001",  // Não houve alteração
                            "CNAE": "1813-0/01",  // Não houve alteração
                            "xDescServ": "Serviços gráficos e acabamentos",  // Não houve alteração
                            "cNBS": "123456789"  // Não houve alteração
                        }
                    },
                    "valores": {
                        "vServPrest": {
                            "vReceb": 500.00,  // Não houve alteração
                            "vServ": 500.00  // Não houve alteração
                        },
                        "trib": {
                            "tribMun": {
                                "tribISSQN": 1,  // Não houve alteração
                                "cLocIncid": "3548807",  // Não houve alteração
                                "vBC": 500.00,  // Não houve alteração
                                "pAliq": 2,  // Não houve alteração
                                "vISSQN": 10.00,  // Não houve alteração
                                "tpRetISSQN": 1,  // Não houve alteração
                                "vLiq": 490.00  // Não houve alteração
                            },
                            "tribFed": {
                                "piscofins": {
                                    "CST": "01",  // Não houve alteração
                                    "vBCPisCofins": 500.00,  // Não houve alteração
                                    "pAliqPis": 12.34,  // Não houve alteração
                                    "pAliqCofins": 0.03,  // Não houve alteração
                                    "vPis": 3.25,  // Não houve alteração
                                    "vCofins": 15.00,  // Não houve alteração
                                    "tpRetPisCofins": 1  // Não houve alteração
                                },
                                "vRetCP": 0,  // Não houve alteração
                                "vRetIRRF": 0,  // Não houve alteração
                                "vRetCSLL": 0  // Não houve alteração
                            },
                            "totTrib": {
                                "vTotTrib": {
                                    "vTotTribFed": 18.25,  // Não houve alteração
                                    "vTotTribEst": 0,  // Não houve alteração
                                    "vTotTribMun": 10.00  // Não houve alteração
                                },
                                "pTotTrib": {
                                    "pTotTribFed": 3.65,  // Não houve alteração
                                    "pTotTribEst": 0,  // Não houve alteração
                                    "pTotTribMun": 2  // Não houve alteração
                                },
                                "indTotTrib": 0,  // Não houve alteração
                                "pTotTribSN": 0  // Não houve alteração
                            }
                        }
                    }
                }
            },              
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json; charset=utf-8'
                }
            }
        );

        console.log('NFS-e emitida com sucesso:', response.data);
        return response.data.id;
    } catch (error) {
        if (error.response) {
            console.error('Erro ao emitir NFS-e:', error.response.status, JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('Erro inesperado:', error.message);
        }
    }
}

async function baixarNFe(chave) {
    if (!chave) {
        console.error('Erro: ID da NFS-e não foi informado.');
        return;
    }
    try {
        const token = await obterToken();
        const response = await axios.get(`${BASE_URL}/nfse/${chave}/pdf`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json; charset=utf-8'
            },
            responseType: 'arraybuffer' // Garante que o arquivo seja tratado corretamente
        });
        
        // Diretório onde o PDF será salvo
        const pastaDestino = path.join(__dirname, 'nfse_pdfs');
        
        // Criar a pasta se ela não existir
        if (!fs.existsSync(pastaDestino)) {
            fs.mkdirSync(pastaDestino, { recursive: true });
        }
        
        // Caminho do arquivo
        const caminhoArquivo = path.join(pastaDestino, `${chave}.pdf`);
        
        // Salvar o arquivo
        fs.writeFileSync(caminhoArquivo, response.data);
        console.log(`✅ NF-e baixada com sucesso: ${caminhoArquivo}`);
    } catch (error) {
        console.error('Erro ao baixar NF-e:', error.response ? error.response.data : error.message);
    }
}

emitirNFe().then(id => {
    if (id) {
        setTimeout(() => baixarNFe(id), 5000); // Aguarda 5 segundos antes de baixar
    }
});
*/
/*const axios = require('axios');
const fs = require('fs');
const path = require('path');

const CLIENT_ID = 'JPgVjgFJdPC0hkMmn80w';
const CLIENT_SECRET = 'FpBK74VVyiSAHeTfzXCBy4Kz7ecOO4hZfEOVON4p';
const TOKEN_URL = 'https://auth.nuvemfiscal.com.br/oauth/token';
const BASE_URL = 'https://api.nuvemfiscal.com.br';

async function obterToken() {
    try {
        const response = await axios.post(
            TOKEN_URL,
            new URLSearchParams({
                grant_type: 'client_credentials',
                scope: 'conta empresa nfse'
            }),
            {
                auth: {
                    username: CLIENT_ID,
                    password: CLIENT_SECRET
                },
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );
        return response.data.access_token;
    } catch (error) {
        console.error('Erro ao obter token:', error.response ? error.response.data : error.message);
        throw new Error('Falha na autenticação');
    }
}

async function baixarNFe(chave) {
    if (!chave) {
        console.error('Erro: ID da NFS-e não foi informado.');
        return;
    }
    try {
        const token = await obterToken();
        const response = await axios.get(`${BASE_URL}/nfse/${chave}/pdf`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json; charset=utf-8'
            },
            responseType: 'arraybuffer' // Garante que o arquivo seja tratado corretamente
        });
        
        // 🔥 Verifica se a resposta contém JSON (erro) em vez de um PDF
        if (response.headers['content-type'].includes('application/json')) {
            const jsonErro = JSON.parse(response.data.toString());
            console.error('❌ Erro ao baixar NF-e:', JSON.stringify(jsonErro, null, 2));
            return;
        }

        // Criar diretório para armazenar PDFs
        const pastaDestino = path.join(__dirname, 'nfse_pdfs');
        if (!fs.existsSync(pastaDestino)) {
            fs.mkdirSync(pastaDestino, { recursive: true });
        }

        // Caminho do arquivo
        const caminhoArquivo = path.join(pastaDestino, `${chave}.pdf`);

        // Salvar o arquivo
        fs.writeFileSync(caminhoArquivo, response.data);
        console.log(`✅ NF-e baixada com sucesso: ${caminhoArquivo}`);
    } catch (error) {
        if (error.response) {
            try {
                const jsonErro = JSON.parse(error.response.data.toString('utf8'));
                console.error('❌ Erro ao baixar NF-e:', JSON.stringify(jsonErro, null, 2));
            } catch (e) {
                console.error('❌ Erro ao baixar NF-e:', error.response.status, error.response.data.toString());
            }
        } else {
            console.error('❌ Erro inesperado ao baixar NF-e:', error.message);
        }
    }
}

async function verificarStatusNFe(id) {
    try {
        const token = await obterToken();
        const response = await axios.get(`${BASE_URL}/nfse/${id}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('📄 Status da NFS-e:', JSON.stringify(response.data, null, 2));
        return response.data.situacao;  // Retorna a situação da nota (ex: "aprovada", "rejeitada")
    } catch (error) {
        console.error('❌ Erro ao verificar status da NFS-e:', error.response ? error.response.data : error.message);
    }
}


// Chamar a função com o ID do evento gerado
baixarNFe('nfs_3a18600d462644edbead10d9fbc04ccc');*/

/*const axios = require('axios');
const fs = require('fs');

const CLIENT_ID = 'JPgVjgFJdPC0hkMmn80w';
const CLIENT_SECRET = 'FpBK74VVyiSAHeTfzXCBy4Kz7ecOO4hZfEOVON4p';
const TOKEN_URL = 'https://auth.nuvemfiscal.com.br/oauth/token';
const BASE_URL = 'https://api.nuvemfiscal.com.br';

async function obterToken() {
    try {
        const response = await axios.post(
            TOKEN_URL,
            new URLSearchParams({
                grant_type: 'client_credentials',
                scope: 'conta empresa nfe'
            }),
            {
                auth: {
                    username: CLIENT_ID,
                    password: CLIENT_SECRET
                },
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );
        return response.data.access_token;
    } catch (error) {
        console.error('Erro ao obter token:', error.response ? error.response.data : error.message);
        throw new Error('Falha na autenticação');
    }
}

async function consultarConfiguracaoNfse(cpfCnpj) {
    try {
        const token = await obterToken(); // Função para obter token OAuth2
        console.log("Token obtido:", token);

        const response = await axios.get(
            `https://api.nuvemfiscal.com.br/empresas/${cpfCnpj}/nfse`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json; charset=utf-8'
                }
            }
        );

        console.log('Configuração de NFS-e:', response.data);
        return response.data;
    } catch (error) {
        if (error.response) {
            console.error('Erro ao consultar configuração de NFS-e:', error.response.status, JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('Erro inesperado:', error.message);
        }
    }
}

// Exemplo de uso:
consultarConfiguracaoNfse("54067133000104");*/


const axios = require('axios')

const CLIENT_ID = 'JPgVjgFJdPC0hkMmn80w';
const CLIENT_SECRET = 'FpBK74VVyiSAHeTfzXCBy4Kz7ecOO4hZfEOVON4p';
const TOKEN_URL = 'https://auth.nuvemfiscal.com.br/oauth/token';
const BASE_URL = 'https://api.nuvemfiscal.com.br';

async function obterToken() {
    try {
        const response = await axios.post(
            TOKEN_URL,
            new URLSearchParams({
                grant_type: 'client_credentials',
                scope: 'conta empresa nfe'
            }),
            {
                auth: {
                    username: CLIENT_ID,
                    password: CLIENT_SECRET
                },
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );
        return response.data.access_token;
    } catch (error) {
        console.error('Erro ao obter token:', error.response ? error.response.data : error.message);
        throw new Error('Falha na autenticação');
    }
}

const data = {
  "provedor": "padrao",
  "ambiente": "homologacao",
  "referencia": "string", 
  "infDPS": {
    "tpAmb": 0,
    "dhEmi": "2025-03-05T14:15:22Z",
    "verAplic": "1.0",
    "dCompet": "2025-03-05",
    "subst": {
      "chSubstda": "string",
      "cMotivo": "string",
      "xMotivo": "string"
    },
    "prest": {
      "CNPJ": "54067133000104",
      "CPF": null
    },
    "toma": {
      "orgaoPublico": false,
      "CNPJ": "54067133000104",
      "CPF": null,
      "NIF": null,
      "cNaoNIF": 0,
      "CAEPF": null,
      "IM": "136069",
      "xNome": "IMPRIMEAI SERVIÇOS DE IMPRESSÃO LTDA",
      "end": {
        "endNac": {
          "cMun": "3550308",
          "CEP": "09531190"
        },
        "xLgr": "Terracota",
        "nro": "185",
        "xCpl": "Conj. Coml. 1121",
        "xBairro": "Cerâmica"
      },
      "fone": "(11) 6883-8997",
      "email": "vendas@areapromocional.com.br"
    },
    "serv": {
      "locPrest": {
        "cLocPrestacao": "3548807",
        "cPaisPrestacao": "BR"
      },
      "cServ": {
        "cTribNac": "1813-0/01",
        "cTribMun": "1001",
        "CNAE": "1813-0/01",
        "xDescServ": "Serviços gráficos e acabamentos",
        "cNBS": "123456789"
      }
    },
    "valores": {
      "vServPrest": {
        "vReceb": 500.00,
        "vServ": 500.00
      },
      "trib": {
        "tribMun": {
          "tribISSQN": 1,
          "cLocIncid": "3548807",
          "vBC": 500.00,
          "pAliq": 2,
          "vISSQN": 10.00,
          "tpRetISSQN": 1,
          "vLiq": 490.00
        },
        "tribFed": {
          "piscofins": {
            "CST": "01",
            "vBCPisCofins": 500.00,
            "pAliqPis": 12.34,
            "pAliqCofins": 0.03,
            "vPis": 3.25,
            "vCofins": 15.00,
            "tpRetPisCofins": 1
          },
          "vRetCP": 0,
          "vRetIRRF": 0,
          "vRetCSLL": 0
        },
        "totTrib": {
          "vTotTrib": {
            "vTotTribFed": 18.25,
            "vTotTribEst": 0,
            "vTotTribMun": 10.00
          },
          "pTotTrib": {
            "pTotTribFed": 3.65,
            "pTotTribEst": 0,
            "pTotTribMun": 2
          },
          "indTotTrib": 0,
          "pTotTribSN": 0
        }
      }
    }
  }
};

const token = `eyJ0eXAiOiJKV1QiLCJraWQiOiIwMWIwNDFkMWQ2MTU0NjA0NzNkMWI1NGFhOGRlNGQ1NyIsImFsZyI6IlJTMjU2In0.eyJzY29wZSI6ImNvbnRhIGVtcHJlc2EgbmZzZSIsImp0aSI6IjMxNGYzN2ViLWRkYmMtNGNlMS04ZGJmLWNlNjdkNDY2OWQ3OSIsImh0dHBzOlwvXC9udXZlbWZpc2NhbC5jb20uYnJcL3RlbmFudF9pZCI6IjNhMTg1NDYwLWY1YzEtNDhkMy1hMmI0LTRlMGQ4OGJlZjRkNSIsImlzcyI6Imh0dHBzOlwvXC9hdXRoLm51dmVtZmlzY2FsLmNvbS5iciIsImF1ZCI6Imh0dHBzOlwvXC9hcGkubnV2ZW1maXNjYWwuY29tLmJyXC8iLCJleHAiOjE3NDM3MTY3ODksImlhdCI6MTc0MTEyNDc4OSwiY2xpZW50X2lkIjoiSlBnVmpnRkpkUEMwaGtNbW44MHcifQ.v_jJFYx-K4u5atNksH7s42zO-rR5V8A8tMvtBus0BQu43cF2RQY63CUC6cxzdig0MmXu4qtiVsVaUpw_G3PJIFQx343IhDa2cnNd6BwbifzQVS-TcSSOXkZ4PvIe-iGWC8zd-CXYdEb4M0KrJchSombwMvkQ5XdlJS3EmiR5g_rJZ9yHeA4fxuJ_0c0_BnWvSBG8N_w5zEAk9ZFBABQvhByzWajkxJyDE7SmCtOZkWP0Jkvr7y0LuaDcHywPVQW7jEGKICwDY56nWwN8PlxZh5cS7-rscTbbeV-YHSevruC-DRWupCCiq_Hrh5WxxXls5anEXPODQrkLO3qZJKuRtQ`; // Função para obter token OAuth2
console.log("Token obtido:", token);

const config = {
     headers: {
    'Authorization': `Bearer ${token}`,  // Substitua 'seu_token_aqui' pelo seu token de autorização
    'Content-Type': 'application/json'
  }
};

axios.post('https://api.nuvemfiscal.com.br/nfse/dps', data, config)
  .then(response => {
    console.log('Resposta da API:', response.data);
  })
  .catch(error => {
    console.error('Erro na requisição:', error.response ? error.response.data : error.message);
  });
