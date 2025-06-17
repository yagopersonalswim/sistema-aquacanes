# Template de Contrato Digital

## Contrato de Prestação de Serviços Educacionais - Escola de Natação

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Contrato de Prestação de Serviços - {{nomeEscola}}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            margin: 20px;
            color: #333;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #0066cc;
            padding-bottom: 20px;
        }
        .clausula {
            margin-bottom: 20px;
        }
        .clausula-titulo {
            font-weight: bold;
            margin-bottom: 10px;
            color: #0066cc;
        }
        .assinatura {
            margin-top: 50px;
            border: 1px solid #ccc;
            padding: 20px;
            background-color: #f9f9f9;
        }
        .campo-assinatura {
            border: 1px solid #999;
            height: 150px;
            margin: 10px 0;
            background-color: white;
        }
        .dados-contrato {
            background-color: #f0f8ff;
            padding: 15px;
            border-left: 4px solid #0066cc;
            margin-bottom: 20px;
        }
        @media print {
            .assinatura {
                page-break-inside: avoid;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>CONTRATO DE PRESTAÇÃO DE SERVIÇOS EDUCACIONAIS</h1>
        <h2>ESCOLA DE NATAÇÃO</h2>
    </div>

    <div class="dados-contrato">
        <h3>DADOS DO CONTRATO</h3>
        <p><strong>Número do Contrato:</strong> {{numeroContrato}}</p>
        <p><strong>Data de Geração:</strong> {{dataGeracao}}</p>
        <p><strong>Plano Contratado:</strong> {{nomePlano}}</p>
        <p><strong>Valor Mensal:</strong> R$ {{valorPlano}}</p>
    </div>

    <p>Pelo presente instrumento, de um lado, a <strong>{{nomeEscola}}</strong>, inscrita no CNPJ sob nº <strong>{{cnpjEscola}}</strong>, com sede à <strong>{{enderecoEscola}}</strong>, doravante denominada <strong>CONTRATADA</strong>, e de outro, o(a) Sr(a). <strong>{{nomeResponsavel}}</strong>, residente e domiciliado(a) à <strong>{{enderecoResponsavel}}</strong>, CPF nº <strong>{{cpfResponsavel}}</strong>, doravante denominado(a) <strong>CONTRATANTE</strong>, têm entre si justo e contratado o seguinte:</p>

    <div class="clausula">
        <div class="clausula-titulo">CLÁUSULA 1 - DO OBJETO</div>
        <p>Prestação de aulas de natação ao(à) aluno(a) <strong>{{nomeAluno}}</strong>, nascido(a) em <strong>{{dataNascimentoAluno}}</strong>, nas turmas e horários definidos no ato da matrícula.</p>
    </div>

    <div class="clausula">
        <div class="clausula-titulo">CLÁUSULA 2 - DAS AULAS</div>
        <p>As aulas seguirão o calendário estabelecido pela CONTRATADA, sendo realizadas na unidade <strong>{{unidadeEscola}}</strong>.</p>
        <p><strong>Turma:</strong> {{nomeTurma}}</p>
        <p><strong>Horários:</strong> {{horariosAulas}}</p>
        <p><strong>Professor Responsável:</strong> {{nomeProfessor}}</p>
    </div>

    <div class="clausula">
        <div class="clausula-titulo">CLÁUSULA 3 - DO PAGAMENTO</div>
        <p>O CONTRATANTE pagará à CONTRATADA o valor de <strong>R$ {{valorMensal}}</strong>, mensalmente, até o dia <strong>{{diaVencimento}}</strong>, por meio de boleto bancário, PIX ou outro meio acordado.</p>
        <p><strong>Plano Contratado:</strong> {{tipoPlano}} - {{descricaoPlano}}</p>
    </div>

    <div class="clausula">
        <div class="clausula-titulo">CLÁUSULA 4 - DA INADIMPLÊNCIA</div>
        <p>Em caso de inadimplência superior a 15 dias, o aluno poderá ter sua participação suspensa até a regularização dos pagamentos.</p>
        <p>Após 30 dias de inadimplência, o contrato poderá ser rescindido automaticamente, sem prejuízo da cobrança dos valores em aberto.</p>
    </div>

    <div class="clausula">
        <div class="clausula-titulo">CLÁUSULA 5 - DA IMAGEM</div>
        <p>O CONTRATANTE <strong>{{autorizacaoImagem}}</strong> o uso da imagem do(a) aluno(a) para fins pedagógicos e de divulgação institucional.</p>
        <p>Esta autorização pode ser revogada a qualquer tempo mediante comunicação por escrito.</p>
    </div>

    <div class="clausula">
        <div class="clausula-titulo">CLÁUSULA 6 - DA RESCISÃO</div>
        <p>O contrato poderá ser rescindido a qualquer tempo por qualquer das partes, mediante aviso prévio de 30 dias.</p>
        <p>Em caso de rescisão pelo CONTRATANTE, não haverá devolução de valores já pagos, salvo em casos excepcionais a critério da administração.</p>
    </div>

    <div class="clausula">
        <div class="clausula-titulo">CLÁUSULA 7 - DA PROTEÇÃO DE DADOS (LGPD)</div>
        <p>Os dados pessoais fornecidos serão utilizados exclusivamente para fins administrativos, pedagógicos e legais, conforme previsto na Lei Geral de Proteção de Dados (Lei 13.709/2018).</p>
        <p>O CONTRATANTE tem direito ao acesso, correção, exclusão e portabilidade de seus dados, podendo exercer esses direitos através do e-mail: <strong>{{emailEscola}}</strong></p>
        <p>Os dados serão mantidos pelo prazo necessário para o cumprimento das finalidades para as quais foram coletados e das obrigações legais.</p>
    </div>

    <div class="clausula">
        <div class="clausula-titulo">CLÁUSULA 8 - DAS AULAS PERDIDAS E REPOSIÇÕES</div>
        <p>As aulas serão oferecidas conforme calendário da escola e não haverá reposição de aulas perdidas por iniciativa do(a) aluno(a), incluindo por motivo de saúde, viagem ou compromissos pessoais.</p>
        <p>A escola dispõe atualmente de apenas um professor, e por isso, em caso de ausência por parte da CONTRATADA (escola) por motivos de saúde, não haverá reposição de aulas. Situações excepcionais, como problemas técnicos nas instalações ou suspensão de atividades por responsabilidade exclusiva da escola, poderão ensejar reposição ou compensação, a critério da administração.</p>
        <p>O CONTRATANTE declara estar ciente dessa política, a qual respeita os princípios da boa-fé, transparência contratual e limitações operacionais da instituição, conforme prevê o artigo 6º, inciso III, e o artigo 20 do Código de Defesa do Consumidor.</p>
    </div>

    <div class="clausula">
        <div class="clausula-titulo">CLÁUSULA 9 - DAS RESPONSABILIDADES</div>
        <p>A CONTRATADA se responsabiliza pela qualidade das aulas e segurança das instalações durante o período de permanência do aluno na escola.</p>
        <p>O CONTRATANTE se responsabiliza por informar eventuais restrições médicas ou condições de saúde que possam afetar a participação do aluno nas atividades.</p>
        <p>É obrigatório o uso de equipamentos de segurança quando solicitado pela escola.</p>
    </div>

    <div class="clausula">
        <div class="clausula-titulo">CLÁUSULA 10 - DAS DISPOSIÇÕES GERAIS</div>
        <p>Este contrato entra em vigor na data de sua assinatura e permanece válido até sua rescisão conforme previsto neste instrumento.</p>
        <p>Eventuais alterações neste contrato deverão ser formalizadas por escrito e aceitas por ambas as partes.</p>
        <p>O não exercício de qualquer direito previsto neste contrato não implica em renúncia ao mesmo.</p>
    </div>

    <div class="clausula">
        <div class="clausula-titulo">CLÁUSULA 11 - DO FORO</div>
        <p>Fica eleito o foro da comarca de <strong>{{cidadeEscola}}/{{estadoEscola}}</strong>, para dirimir quaisquer dúvidas ou litígios oriundos deste contrato.</p>
    </div>

    <div class="assinatura">
        <h3>ACEITE E ASSINATURA DIGITAL</h3>
        
        <div style="margin: 20px 0;">
            <label>
                <input type="checkbox" id="aceiteTermos" required>
                Declaro que li e concordo com todos os termos deste contrato
            </label>
        </div>

        <div style="margin: 20px 0;">
            <label>
                <input type="checkbox" id="aceiteLGPD" required>
                Autorizo o tratamento dos meus dados pessoais conforme a LGPD
            </label>
        </div>

        <div style="margin: 20px 0;">
            <p><strong>Assinatura Digital:</strong></p>
            <div class="campo-assinatura" id="assinaturaCanvas">
                <!-- Canvas para assinatura será inserido aqui -->
            </div>
            <button type="button" onclick="limparAssinatura()">Limpar Assinatura</button>
        </div>

        <div style="margin: 20px 0;">
            <p><strong>Data da Assinatura:</strong> {{dataAssinatura}}</p>
            <p><strong>IP de Origem:</strong> {{ipAssinatura}}</p>
            <p><strong>Responsável:</strong> {{nomeResponsavel}}</p>
            <p><strong>CPF:</strong> {{cpfResponsavel}}</p>
        </div>

        <div style="text-align: center; margin-top: 30px;">
            <button type="button" onclick="assinarContrato()" id="btnAssinar" disabled>
                Assinar Contrato Digitalmente
            </button>
        </div>
    </div>

    <script>
        // Script para controle da assinatura digital
        document.getElementById('aceiteTermos').addEventListener('change', verificarAceite);
        document.getElementById('aceiteLGPD').addEventListener('change', verificarAceite);

        function verificarAceite() {
            const aceiteTermos = document.getElementById('aceiteTermos').checked;
            const aceiteLGPD = document.getElementById('aceiteLGPD').checked;
            const btnAssinar = document.getElementById('btnAssinar');
            
            btnAssinar.disabled = !(aceiteTermos && aceiteLGPD);
        }

        function limparAssinatura() {
            // Implementar limpeza do canvas de assinatura
            console.log('Limpar assinatura');
        }

        function assinarContrato() {
            // Implementar assinatura do contrato
            console.log('Assinar contrato');
        }
    </script>
</body>
</html>
```

## Variáveis do Template

### Dados da Escola
- `{{nomeEscola}}` - Nome da escola de natação
- `{{cnpjEscola}}` - CNPJ da escola
- `{{enderecoEscola}}` - Endereço completo da escola
- `{{unidadeEscola}}` - Unidade/endereço onde as aulas são realizadas
- `{{emailEscola}}` - Email de contato da escola
- `{{cidadeEscola}}` - Cidade da escola
- `{{estadoEscola}}` - Estado da escola

### Dados do Contrato
- `{{numeroContrato}}` - Número único do contrato
- `{{dataGeracao}}` - Data de geração do contrato
- `{{nomePlano}}` - Nome do plano contratado
- `{{valorPlano}}` - Valor do plano
- `{{tipoPlano}}` - Tipo do plano (mensal, trimestral, etc.)
- `{{descricaoPlano}}` - Descrição detalhada do plano
- `{{valorMensal}}` - Valor mensal a ser pago
- `{{diaVencimento}}` - Dia do vencimento da mensalidade

### Dados do Responsável
- `{{nomeResponsavel}}` - Nome completo do responsável
- `{{cpfResponsavel}}` - CPF do responsável
- `{{enderecoResponsavel}}` - Endereço completo do responsável

### Dados do Aluno
- `{{nomeAluno}}` - Nome completo do aluno
- `{{dataNascimentoAluno}}` - Data de nascimento do aluno
- `{{nomeTurma}}` - Nome da turma
- `{{horariosAulas}}` - Horários das aulas
- `{{nomeProfessor}}` - Nome do professor responsável

### Dados de Autorização
- `{{autorizacaoImagem}}` - "AUTORIZA" ou "NÃO AUTORIZA"

### Dados da Assinatura
- `{{dataAssinatura}}` - Data da assinatura digital
- `{{ipAssinatura}}` - IP de onde foi assinado

## Funcionalidades do Contrato Digital

### 1. Geração Automática
- Preenchimento automático com dados do aluno e responsável
- Inserção dos termos do plano contratado
- Numeração sequencial dos contratos

### 2. Assinatura Eletrônica
- Canvas para assinatura com mouse/touch
- Campos de aceite obrigatórios
- Validação antes da assinatura
- Captura do IP de origem

### 3. Armazenamento
- Conversão para PDF após assinatura
- Armazenamento no banco de dados
- Backup em sistema de arquivos
- Histórico de versões

### 4. Envio por Email
- Envio automático após assinatura
- Anexo em PDF
- Confirmação de recebimento
- Reenvio quando necessário

### 5. Conformidade LGPD
- Termos específicos sobre proteção de dados
- Direitos do titular dos dados
- Finalidades do tratamento
- Prazo de retenção

### 6. Segurança
- Hash da assinatura para verificação
- Timestamp da assinatura
- Log de auditoria
- Criptografia dos dados sensíveis

