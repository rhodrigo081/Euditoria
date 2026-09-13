package com.euditoria.service;

import com.euditoria.model.AuditDiagnostic;
import com.euditoria.model.DiagnosticSeverity;
import org.springframework.stereotype.Service;
import org.w3c.dom.Document;
import org.xml.sax.InputSource;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import java.io.StringReader;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class XsdValidationService {

    public List<AuditDiagnostic> validateXmlStructure(String xmlContent) {
        List<AuditDiagnostic> diagnostics = new ArrayList<>();
        if (xmlContent == null || xmlContent.trim().isEmpty()) {
            diagnostics.add(new AuditDiagnostic(
                    UUID.randomUUID().toString(),
                    1, 1, "root", "XML_EMPTY",
                    "O conteúdo XML está vazio ou nulo.",
                    "Envie um arquivo XML eSocial devidamente preenchido.",
                    DiagnosticSeverity.CRITICAL
            ));
            return diagnostics;
        }

        try {
            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            factory.setNamespaceAware(true);
            // Prevenção contra XXE (XML External Entity Injection) para segurança da aplicação
            factory.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true);
            factory.setFeature("http://xml.org/sax/features/external-general-entities", false);
            factory.setFeature("http://xml.org/sax/features/external-parameter-entities", false);

            DocumentBuilder builder = factory.newDocumentBuilder();
            Document doc = builder.parse(new InputSource(new StringReader(xmlContent)));

            // Validação de nó raiz
            String rootNode = doc.getDocumentElement().getNodeName();
            if (!rootNode.contains("eSocial")) {
                diagnostics.add(new AuditDiagnostic(
                        UUID.randomUUID().toString(),
                        1, 1, rootNode, "INVALID_ROOT_NODE",
                        "O elemento raiz deve ser <eSocial>, encontrado: <" + rootNode + ">",
                        "Ajuste o envelope XML para o padrão oficial do eSocial.",
                        DiagnosticSeverity.ERROR
                ));
            }

        } catch (Exception ex) {
            diagnostics.add(new AuditDiagnostic(
                    UUID.randomUUID().toString(),
                    1, 1, "xml", "MALFORMED_XML",
                    "Falha na análise sintática do XML: sintaxe malformada ou tags não fechadas.",
                    "Verifique o fechamento das tags e a codificação UTF-8.",
                    DiagnosticSeverity.CRITICAL
            ));
        }

        return diagnostics;
    }
}
