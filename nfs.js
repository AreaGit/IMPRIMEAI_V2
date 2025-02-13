const express = require('express');
const app = express();
const fs = require('fs');
const { DOMParser } = require('xmldom');
const { SignedXml } = require('xml-crypto');
const { readFileSync } = require('fs');
const path = require('path');
const forge = require('node-forge');
const axios = require('axios');

// Configuração do certificado digital A1
const certPath = path.join(__dirname, 'IMPRIMEAI_SERVICOS_DE_IMPRESSAO_LTDA_54067133000104_1739199014437633600.pfx');
const certPassword = 'Dna12345678';
const pfxBuffer = readFileSync(certPath);

// Extrair chave privada do certificado PFX
const pfxAsn1 = forge.asn1.fromDer(pfxBuffer.toString('binary'));
const pfx = forge.pkcs12.pkcs12FromAsn1(pfxAsn1, certPassword);
const keyBags = pfx.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag });
const privateKey = keyBags[forge.pki.oids.pkcs8ShroudedKeyBag][0].key;

// Função para assinar o XML
function assinarXML(xml) {
    const sig = new SignedXml();
    sig.addReference("/*", [
        "http://www.w3.org/2000/09/xmldsig#enveloped-signature",
        "http://www.w3.org/2001/10/xml-exc-c14n#"
    ], "http://www.w3.org/2000/09/xmldsig#sha1");
    
    sig.signingKey = forge.pki.privateKeyToPem(privateKey);
    sig.computeSignature(xml);
    return sig.getSignedXml();
}


// Exemplo de uso
const xmlOriginal = `<?xml version="1.0" encoding="UTF-8"?>
<NotaFiscal>
    <InfNfse Id="RPS235">
        <Numero>123</Numero>
        <Cnpj>54067133000104</Cnpj>
    </InfNfse>
</NotaFiscal>`;

const xmlAssinado = assinarXML(xmlOriginal);
console.log("XML Assinado:", xmlAssinado);

// Salvar o XML assinado para download
const xmlPath = path.join(__dirname, 'nfse_assinada.xml');
fs.writeFileSync(xmlPath, xmlAssinado);
console.log("XML assinado salvo em:", xmlPath);

// Enviar para o Ginfes via SOAP
async function enviarNFSe(xml) {
    const soapEnvelope = `<?xml version="1.0" encoding="UTF-8"?>
    <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:gin="http://www.ginfes.com.br/">
        <soapenv:Header/>
        <soapenv:Body>
            <gin:RecepcionarLoteRps>
                <gin:loteRps>${xml}</gin:loteRps>
            </gin:RecepcionarLoteRps>
        </soapenv:Body>
    </soapenv:Envelope>`;
    
    try {
        const response = await axios.post('https://saocaetanodosul.ginfes.com.br/ServiceGinfesImpl', soapEnvelope, {
            headers: {
                'Content-Type': 'text/xml; charset=utf-8',
                'SOAPAction': ''
            }
        });
        console.log("Resposta do Ginfes:", response.data);
    } catch (error) {
        console.error("Erro ao enviar NFS-e:", error.message);
    }
}

enviarNFSe(xmlAssinado);

module.exports = app;