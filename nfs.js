const fs = require('fs');
const { SignedXml } = require('xml-crypto');
const forge = require('node-forge');

// Caminho para seu certificado A1 (arquivo .pfx ou .p12)
const pfxPath = './IMPRIMEAI_SERVICOS_DE_IMPRESSAO_LTDA_54067133000104_1739199014437633600.pfx';
const passphrase = 'Dna12345678';

// Carregar certificado
const pfxBuffer = fs.readFileSync(pfxPath);
const p12Asn1 = forge.asn1.fromDer(pfxBuffer.toString('binary'));
const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, passphrase);

const certBags = p12.getBags({ bagType: forge.pki.oids.certBag });
const keyBags = p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag });

const certificate = forge.pki.certificateToPem(certBags[forge.pki.oids.certBag][0].cert);
const privateKey = forge.pki.privateKeyToPem(keyBags[forge.pki.oids.pkcs8ShroudedKeyBag][0].key);

// Ler XML sem assinatura
const xml = fs.readFileSync('lote-rps.xml', 'utf-8');

// Criar e adicionar assinatura
const sig = new SignedXml();
// ** Definir os algoritmos antes de adicionar a referência **
sig.signatureAlgorithm = "http://www.w3.org/2001/04/xmldsig-more#rsa-sha256";
sig.canonicalizationAlgorithm = "http://www.w3.org/TR/2001/REC-xml-c14n-20010315";

// 🚀 Adicione a referência corretamente
sig.addReference({
    xpath: "//*[local-name(.)='EnviarLoteRpsEnvio']",
    transforms: ["http://www.w3.org/2000/09/xmldsig#enveloped-signature"],
    digestAlgorithm: "http://www.w3.org/2001/04/xmlenc#sha256" // SHA-256 para digest
});
sig.signingKey = privateKey;
sig.keyInfoProvider = {
    getKeyInfo: () => `<X509Data><X509Certificate>${certificate.replace(/-----BEGIN CERTIFICATE-----|-----END CERTIFICATE-----|\n/g, '')}</X509Certificate></X509Data>`,
};

// Assinar XML
sig.computeSignature(xml);

// Salvar XML assinado
fs.writeFileSync('lote-rps-assinado.xml', sig.getSignedXml());

console.log('✅ XML assinado com sucesso!');