// ==UserScript==
// @name          Upload Automático de Documentos Obrigatórios v3
// @namespace     http://tampermonkey.net/
// @version       4.1.2
// @description   Automatiza o upload de documentos obrigatórios analisando nomes de arquivos (com upload real)
// @author        Jhonatan Aquino
// @match         https://*.sigeduca.seduc.mt.gov.br/ged/hwmconaluno.aspx*
// @match         http://*.sigeduca.seduc.mt.gov.br/ged/hwmconaluno.aspx*
// @grant         GM_xmlhttpRequest
// @grant         GM_setValue
// @grant         GM_getValue
// @grant         GM_addStyle
// @require       https://code.jquery.com/jquery-3.6.0.min.js
// @updateURL     https://raw.githubusercontent.com/Jhonatan-Aquino/Upload_documentos_GED/main/Upload-Automático-de-Documentos-Obrigatórios-v3.user.js
// @downloadURL   https://raw.githubusercontent.com/Jhonatan-Aquino/Upload_documentos_GED/main/Upload-Automático-de-Documentos-Obrigatórios-v3.user.js
// ==/UserScript==


//ATUALIZAR: 
// - Baixar o LOG quando ver que ta demorando muito;
// - Fazer a rolagem acompanahar o documento que esta sendo inserido
// - Mudar as classes e ID do html para evitar conflitos com outros Scripts
// - Exibir a versão embaixo do meu nome e não no titulo
// - Verificar se o arquivo já não esta inserido procurando nos spans span_vGRID_GEDDOCOBRIGID_000X


(function() {
    'use strict';

    // Estilos CSS personalizados (mantidos os mesmos) TESTANDO A VERSAO 4.0
    GM_addStyle(`
    .botaoSCT {
        background: #ebebeb;
        backdrop-filter: blur(6px);
        border-radius: 20px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.25);
        color: #087eff;
        font-size: 12px;
        font-weight: normal;
        padding: 9px 20px;
        min-width: 124.5px;
        margin: 5px;
        text-decoration: none;
        transition: all 0.15s ease-in-out;
    }
    .botaoSCT:hover {
        background: #3982f7;
        box-shadow: 0 3px 6px rgba(0, 0, 0, 0.2);
        transform: scale(1.02);
        color: #fff;
    }
    #fileInput {
        display: none;
    }
     #fileList {
        max-height: 200px;
        overflow-y: auto;
        margin: 20px 0;
        border: 1px dashed #ccc;
        padding: 10px;
        border-radius: 5px;
        scrollbar-width: none;
    }
    .fileItem {
        margin: 3px 0;
        padding: 7px 5px;
        background: rgba(255,255,255,0.5);
        border-radius: 5px;
        font-weight:normal;
        text-align:left;
    }
    .fileItem.error {
        background: rgba(255,200,200,0.7);
    }

    .divlog {
        background: rgba(244, 244, 244, 0.58);
        border-radius: 16px;
        box-shadow: 0 5px 10px rgba(0, 0, 0, 0);
        backdrop-filter: blur(6.6px);
        -webkit-backdrop-filter: blur(6.6px);
        border: 1px solid rgba(214, 214, 214, 0.27);
        color: #000;
        width: auto;
        text-align: center;
        font-weight: bold;
        position: absolute;
        z-index: 2002;
        padding: 5px 15px;
        bottom: 103%;
        min-height: 25px;
        min-width: 340px;
        color: #087eff;
        font-size: 14px;
        font-weight: normal;
        font-family: Helvetica, Arial, sans-serif !important;
        line-height: 25px;
        display: none;
    }
       #credito2 {
        background: rgba(214, 214, 214, 0.58);
        box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
        backdrop-filter: blur(6.6px);
        -webkit-backdrop-filter: blur(6.6px);
        border: 1px solid rgba(214, 214, 214, 0.27);
        border-radius: 16px;
        color: #000;
        width: auto;
        text-align: center;
        font-weight: bold;
        position: fixed;
        z-index: 2002;
        padding: 15px;
        bottom:33px;
        left: 30px;
        height: auto;
        min-width:350px;
    }
    #exibir1 {
        background: rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(20px);
        font-weight: 500;
        letter-spacing: 0.3px;
        padding: 5px 15px;
    }
    #exibir1:hover {
        background: rgba(0, 0, 0, 0.9);
    }
    #loadingBtn {
        position: relative;
        padding: 15px 20px;
        font-size: 14px;
        background: none;
        color: #087dff;
        cursor: pointer;
        border-radius: 5px;
        overflow: hidden;
        border: none;
        width: 100%;
        margin-top: 10px;
        display: none; /* Inicialmente oculto */
    }
    #loadingBtn.loading::after {
        content: "";
        position: absolute;
        width: 56px;
        height: 56px;
        border: 3px solid #087dff;
        border-top-color: transparent;
        border-radius: 50%;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        animation: spin 1.8s linear infinite;
    }
    @keyframes spin {
        from { transform: translate(-50%, -50%) rotate(0deg); }
        to { transform: translate(-50%, -50%) rotate(360deg); }
    }
    #uploadFrame {
        width: 1200px;
        height: 900px;
        border: none;
        position: fixed;
        left: 0px;
        bottom: 0px;
        z-index: 9999;
        display: none;
        visibility: hidden;
    }
    #progressArea {
        width: 100%;
        margin: 10px 0;
        display: none;
    }

     .progress-container {
        width: 100%;
        margin: 10px 0;
        display: none;
    }

    .progress-bar-wrapper {
        width: 100%;
        background-color: #f0f0f0;
        border-radius: 10px;
        padding: 3px;
        margin-bottom: 8px;
        overflow: hidden;
    }

    .progress-bar {
        height: 5px;
        background-color: #4BB543;
        border-radius: 8px;
        width: 0%;
        transition: width 0.5s ease-in-out;
        position: relative;
        overflow: hidden;
    }

    /* Efeito de brilho */
    .progress-bar::after {
        content: "";
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.4),
            transparent
        );
        animation: glowingEffect 2s infinite linear;
    }

    @keyframes glowingEffect {
        0% {
            left: -100%;
        }
        100% {
            left: 100%;
        }
    }

    .progress-text {
        text-align: center;
        color: #474e68;
        font-size: 12px;
        font-family: Helvetica, Arial, sans-serif;
        padding: 5px 0;
        font-weight:normal;
    }

    .divseletor {
        padding: 0;
        text-align: center;
        min-width: 460px;
    }

    .divseletor h3 {
        font-size: 28px !important;
        font-weight: 500 !important;
        margin-bottom: 15px;
        color: #1d1d1f;
        letter-spacing: -0.5px;
    }

    .divseletor p {
        font-size: 8pt !important;
        color: #86868b;
        line-height: 1.5;
        margin-bottom: 35px !important;
    }

    .divseletor p em {
        color: #2997ff;
        font-style: normal;
        font-weight: 500;
    }

    .divajuda {
        display: none;
        max-width: 460px;
        max-height: 700px;
        overflow: hidden;
        line-height: 20px;
        font-family: Helvetica, Arial, sans-serif !important;
        font-size: 11px;
        font-weight: normal;
        text-align: justify;
    }

    svg:hover path {
        fill: #087dff !important;
    }

    .btnscontrole {
        cursor: pointer;
        transition: all 0.2s ease-in-out;
    }

    .btnscontrole:hover path {
        fill: #087dff !important;
    }

    .tabela-docs {
        width: 100%;
        border-collapse: separate;
        border-spacing: 0;
        margin: 15px 0;
        font-family: Helvetica, Arial, sans-serif !important;
        font-size: 11px;
        border: 1px solid rgba(0, 0, 0, 0.08);
        border-radius: 8px;
        overflow: hidden;
    }

    .tabela-docs td {
        padding: 8px 10px;
        vertical-align: top;
        line-height: 1.4;
        border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    }

    .tabela-docs tr:last-child td {
        border-bottom: none;
    }

    .tabela-docs td:first-child {
        width: 30px;
        text-align: right;
        color: #666;
        font-weight: normal;
    }

    .tabela-docs tr:nth-child(even) {
        background-color: rgba(0, 0, 0, 0.01);
    }

    .tabela-docs tr:hover {
        background-color: rgba(0, 0, 0, 0.02);
    }

    .fileItem.success {
        background: rgb(126, 213, 126) !important;
        transition: background-color 0.3s ease;
    }

    .fileItem.failure {
        background: rgb(227, 122, 122) !important;
        transition: background-color 0.3s ease;
    }

    .divseletor {
        padding: 0;
        text-align: center;
    }

    .divseletor h3 {
        font-size: 28px !important;
        font-weight: 500 !important;
        margin-bottom: 15px;
        color: #1d1d1f;
        letter-spacing: -0.5px;
    }

    .divseletor p {
        font-size: 8pt !important;
        color: #86868b;
        line-height: 1.5;
        margin-bottom: 35px !important;
    }

    .divseletor p em {
        color: #2997ff;
        font-style: normal;
        font-weight: 500;
    }
    `);

    // Função para criar a interface do usuário
    function criarInterface() {
        // Primeiro, remover quaisquer instâncias existentes
        const elementosExistentes = document.querySelectorAll('#credito2, #exibir1');
        elementosExistentes.forEach(el => el.remove());

        console.log('Criando interface...'); // Debug

        // Criar o botão
        const btnExibir = document.createElement('input');
        btnExibir.type = 'button';
        btnExibir.id = 'exibir1';
        btnExibir.className = 'menuSCT';
        btnExibir.style.backgroundColor = "#474e68";
        btnExibir.style.color = "#ffffff";
        btnExibir.style.fontSize = "12px";
        btnExibir.style.border = "none";
        btnExibir.style.width = "auto";
        btnExibir.style.height = "30px";
        btnExibir.style.position = "fixed";
        btnExibir.style.zIndex = "2002";
        btnExibir.style.bottom = "1px";
        btnExibir.style.left = "30px";
        btnExibir.style.cursor = "pointer";
        btnExibir.style.transition = "background-color 0.1s ease-in-out";
        btnExibir.style.borderRadius = "15px";

        // Configurar estado do botão
        const estadoSalvo = getCookie('estadoMenu') || 'aberto';
        btnExibir.value = estadoSalvo === 'fechado' ? "ABRIR | Upload de documentos" : "MINIMIZAR";

        // Criar div principal
        const divCredit = document.createElement('div');
        divCredit.id = 'credito2';
        divCredit.className = 'menuSCT';

        // Configurar conteúdo
        divCredit.innerHTML = `
            <div class="divlog" id="divlog"></div>
            <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" title="Voltar" version="1.1" class="btnscontrole" width="20" height="20" style="display:none; float:left;margin: -6px;" id="btnvoltar" viewBox="0 0 256 256" xml:space="preserve">
                <defs></defs>
                <g style="stroke: none; stroke-width: 0; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill: none; fill-rule: nonzero; opacity: 1;" transform="translate(1.4065934065934016 1.4065934065934016) scale(2.81 2.81)">
                    <path d="M 4 49 h 82 c 2.209 0 4 -1.791 4 -4 s -1.791 -4 -4 -4 H 4 c -2.209 0 -4 1.791 -4 4 S 1.791 49 4 49 z" style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill: #666; fill-rule: nonzero; opacity: 1;" transform=" matrix(1 0 0 1 0 0) " stroke-linecap="round" />
                    <path d="M 16.993 61.993 c 1.023 0 2.048 -0.391 2.828 -1.172 c 1.563 -1.562 1.563 -4.095 0 -5.656 L 9.657 45 l 10.164 -10.164 c 1.563 -1.562 1.563 -4.095 0 -5.657 c -1.561 -1.562 -4.094 -1.562 -5.656 0 L 1.172 42.171 C 0.422 42.922 0 43.939 0 45 c 0 1.061 0.422 2.078 1.172 2.828 l 12.993 12.993 C 14.945 61.603 15.97 61.993 16.993 61.993 z" style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill: #666; fill-rule: nonzero; opacity: 1;" transform=" matrix(1 0 0 1 0 0) " stroke-linecap="round" />
                </g>
            </svg>
            <div class="divseletor">
                <h3 style="font-size:15pt;font-family: Helvetica, Arial, sans-serif !important;">Upload Automático de Documentos v3</h3>
                <p style="font-size: 10pt; font-family: Helvetica, Arial, sans-serif !important; font-weight: normal;margin-top: -15px;margin-bottom: 40px;">
                    Selecione os arquivos para upload!<br>
                    Exemplo: <em>1937175-3.pdf</em>
                </p>
                <input type="file" id="fileInput" multiple accept=".pdf,.jpg,.jpeg,.png,.gif,.bmp">
                <label for="fileInput" class="botaoSCT" style="cursor:pointer;">Selecionar Arquivos</label>
                <div id="fileList"></div>
                <input type='button' id='btnIniciarProcesso' value='Iniciar Upload' class='botaoSCT' style='display:none;'>
                <div id="progressArea">
                    <div class="progress-bar-wrapper">
                        <div class="progress-bar"></div>
                    </div>
                    <div class="progress-text">0% - Pronto para iniciar</div>
                </div>
            </div>
            <div class="divajuda">
                <h3 style="font-size:15pt;text-align:center; line-height: 10px;font-family: Helvetica, Arial, sans-serif !important;">Como usar?</h3>

                <p><b>1. Preparar os arquivos:</b> Prepare seus arquivos seguindo o padrão de nomenclatura CODIGOALUNO-IDDOCUMENTO.extensão (exemplo: 1937175-3.pdf).</p>

                <p><b>2. IDs dos documentos:</b></p>
                <table class="tabela-docs">
                    <tr>
                        <td>ID 1</td>
                        <td>Documentos pessoais do pai, mãe ou responsável</td>
                    </tr>
                    <tr>
                        <td>ID 2</td>
                        <td>Certidão de nascimento ou casamento do estudante</td>
                    </tr>
                    <tr>
                        <td>ID 3</td>
                        <td>Documentos pessoais do estudante (RG e CPF)</td>
                    </tr>
                    <tr>
                        <td>ID 4</td>
                        <td>Fatura atualizada de energia elétrica</td>
                    </tr>
                    <tr>
                        <td>ID 5</td>
                        <td>Tipo do grupo sanguíneo e fator RH do estudante</td>
                    </tr>
                    <tr>
                        <td>ID 6</td>
                        <td>Cartão atualizado de vacina do estudante</td>
                    </tr>
                    <tr>
                        <td>ID 7</td>
                        <td>Atestado médico oftalmológico ou avaliação técnica de optometria</td>
                    </tr>
                    <tr>
                        <td>ID 8</td>
                        <td>Histórico escolar ou atestado de transferência</td>
                    </tr>
                    <tr>
                        <td>ID 9</td>
                        <td>Documento PAED</td>
                    </tr>
                </table>

                <p><b>3. Selecionar arquivos:</b> Clique em "Selecionar Arquivos" e escolha todos os documentos que deseja enviar. O sistema validará automaticamente os nomes dos arquivos.</p>

                <p><b>4. Iniciar upload:</b> Após a validação, clique em "Iniciar Upload". Uma barra de progresso mostrará o andamento do processo.</p>

                <p><b>5. Acompanhamento:</b> O sistema processará cada arquivo automaticamente, exibindo mensagens de sucesso ou erro. Ao final, você poderá baixar um relatório completo do processo em formato CSV.</p>

                <p><b>Observações importantes:</b>
                - Tamanho máximo por arquivo: 5MB<br>
                - Formatos aceitos: PDF, JPG, PNG, GIF, BMP<br>
                - Em caso de erro, verifique a mensagem no log<br>
                - O relatório final mostrará detalhes de cada upload</p>
            </div>
            <div><span style='font-size:8pt;font-weight:normal;font-family: Helvetica, Arial, sans-serif !important;'>< Jhonatan Aquino /></span></div>
            <svg xmlns="http://www.w3.org/2000/svg" title="Ajuda" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="20" height="20" class="btnajuda" id="btnajuda" viewBox="0 0 256 256" style="float:left;margin: -6px;" xml:space="preserve">
                <defs></defs>
                <g style="stroke: none; stroke-width: 0; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill: none; fill-rule: nonzero; opacity: 1;" transform="translate(1.4065934065934016 1.4065934065934016) scale(2.81 2.81)">
                    <path d="M 45 58.88 c -2.209 0 -4 -1.791 -4 -4 v -4.543 c 0 -1.101 0.454 -2.153 1.254 -2.908 l 8.083 -7.631 c 1.313 -1.377 2.035 -3.181 2.035 -5.087 v -0.302 c 0 -2.005 -0.791 -3.881 -2.228 -5.281 c -1.436 -1.399 -3.321 -2.14 -5.342 -2.089 c -3.957 0.102 -7.175 3.523 -7.175 7.626 c 0 2.209 -1.791 4 -4 4 s -4 -1.791 -4 -4 c 0 -8.402 6.715 -15.411 14.969 -15.623 c 4.183 -0.109 8.138 1.439 11.131 4.357 c 2.995 2.918 4.645 6.829 4.645 11.01 v 0.302 c 0 4.027 -1.546 7.834 -4.354 10.72 c -0.04 0.041 -0.08 0.081 -0.121 0.12 L 49 52.062 v 2.818 C 49 57.089 47.209 58.88 45 58.88 z" style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill: #a5a5a5; fill-rule: nonzero; opacity: 1;" transform=" matrix(1 0 0 1 0 0) " stroke-linecap="round" />
                    <path d="M 45 71.96 c -1.32 0 -2.61 -0.53 -3.54 -1.46 c -0.23 -0.23 -0.43 -0.49 -0.62 -0.76 c -0.18 -0.271 -0.33 -0.561 -0.46 -0.86 c -0.12 -0.311 -0.22 -0.62 -0.28 -0.94 c -0.07 -0.32 -0.1 -0.65 -0.1 -0.98 c 0 -0.32 0.03 -0.65 0.1 -0.97 c 0.06 -0.32 0.16 -0.641 0.28 -0.94 c 0.13 -0.3 0.28 -0.59 0.46 -0.86 c 0.19 -0.279 0.39 -0.529 0.62 -0.76 c 1.16 -1.16 2.89 -1.7 4.52 -1.37 c 0.32 0.07 0.629 0.16 0.93 0.29 c 0.3 0.12 0.59 0.28 0.859 0.46 c 0.28 0.181 0.53 0.391 0.761 0.62 c 0.239 0.23 0.439 0.48 0.63 0.76 c 0.18 0.271 0.33 0.561 0.46 0.86 c 0.12 0.3 0.22 0.62 0.279 0.94 C 49.97 66.31 50 66.64 50 66.96 c 0 0.33 -0.03 0.66 -0.101 0.979 c -0.06 0.32 -0.159 0.63 -0.279 0.94 c -0.13 0.3 -0.28 0.59 -0.46 0.86 c -0.19 0.27 -0.391 0.529 -0.63 0.76 c -0.23 0.229 -0.48 0.439 -0.761 0.62 c -0.27 0.18 -0.56 0.34 -0.859 0.46 c -0.301 0.13 -0.61 0.22 -0.93 0.279 C 45.65 71.93 45.33 71.96 45 71.96 z" style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill: #a5a5a5; fill-rule: nonzero; opacity: 1;" transform=" matrix(1 0 0 1 0 0) " stroke-linecap="round" />
                    <path d="M 45 90 C 20.187 90 0 69.813 0 45 S 20.187 0 45 0 s 45 20.187 45 45 S 69.813 90 45 90 z M 45 8 C 24.598 8 8 24.598 8 45 s 16.598 37 37 37 s 37 -16.598 37 -37 S 65.402 8 45 8 z" style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill: #bebebe; fill-rule: nonzero; opacity: 1;" transform=" matrix(1 0 0 1 0 0) " stroke-linecap="round" />
                </g>
            </svg>
        `;

        // Adicionar elementos ao documento
        document.body.appendChild(btnExibir);
        document.body.appendChild(divCredit);

        // Configurar eventos
        btnExibir.onmouseover = () => btnExibir.style.backgroundColor = "#3982F7";
        btnExibir.onmouseout = () => btnExibir.style.backgroundColor = "#474e68";
        btnExibir.onclick = function() {
            const novoEstado = this.value === "MINIMIZAR" ? "fechado" : "aberto";
            $("#credito2").slideToggle();
            this.value = novoEstado === "fechado" ? "ABRIR | Upload de documentos" : "MINIMIZAR";
            setCookie('estadoMenu', novoEstado, 30);
        };

        // Configurar visibilidade inicial
        if (estadoSalvo === 'fechado') {
            $("#credito2").hide();
        }

        // Adicionar eventos da ajuda
        document.getElementById('btnajuda').addEventListener('click', ajuda);
        document.getElementById('fileInput').addEventListener('click', function() {
            $('.divajuda').slideUp(500, 'swing');
            $('.btnajuda').fadeIn(500);
            $('.divseletor').slideDown(500, 'swing');
        });

        // Criar barra de progresso
        const progressArea = document.getElementById('progressArea');
        if (progressArea) {
            progressArea.appendChild(criarBarraProgresso());
        }

        // Adicionar o evento de clique ao botão voltar
        document.getElementById('btnvoltar').addEventListener('click', voltar);

        console.log('Interface criada com sucesso!'); // Debug

        // Após criar a interface, inicializar o LogManager
        logManager.init();

        // Revinculando todos os eventos necessários
        document.getElementById('fileInput').addEventListener('change', function(e) {
            const fileList = document.getElementById('fileList');
            fileList.innerHTML = '';
            arquivosParaProcessar = [];

            const files = e.target.files;
            if (files.length === 0) return;

            let hasErrors = false;

            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const fileInfo = parseFileName(file.name);

                const fileItem = document.createElement('div');
                fileItem.className = 'fileItem';

                if (fileInfo.error) {
                    fileItem.classList.add('error');
                    fileItem.textContent = `❌ ${file.name}: ${fileInfo.error}`;
                    hasErrors = true;
                } else {
                    fileInfo.file = file;
                    arquivosParaProcessar.push(fileInfo);
                    fileItem.textContent = `   ${file.name} → Aluno: ${fileInfo.codAluno}, Doc: ${fileInfo.docName}`;
                }

                fileList.appendChild(fileItem);
            }

            if (hasErrors) {
                exibirLog('Alguns arquivos têm problemas. Corrija antes de continuar.', 5000, '#FF4B40');
            } else if (arquivosParaProcessar.length > 0) {
                exibirLog(`Pronto para processar ${arquivosParaProcessar.length} arquivos válidos.`, 3000, '#4BB543');
                document.getElementById('btnIniciarProcesso').style.display = 'inline-block';
                document.getElementById('progressArea').style.display = 'block';
            }
        });

        // Evento para iniciar o processo de upload
        document.getElementById('btnIniciarProcesso').addEventListener('click', function() {
            if (isProcessing || arquivosParaProcessar.length === 0) return;

            // Inicializar estatísticas
            estatisticasProcesso = {
                inicioProcesso: new Date(),
                fimProcesso: null,
                totalArquivos: arquivosParaProcessar.length,
                arquivosProcessados: 0
            };

            isProcessing = true;
            currentFileIndex = 0;

            // Esconder botão de iniciar
            this.style.display = 'none';
            $('.btnajuda').fadeOut(500);

            // Mostrar e inicializar barra de progresso
            atualizarProgresso(5, 'Iniciando processamento...');

            processarProximoArquivo();
        });

        // Eventos da ajuda
        document.getElementById('btnajuda').addEventListener('click', ajuda);
        document.getElementById('btnvoltar').addEventListener('click', voltar);

        // Evento para fechar ajuda ao clicar em selecionar arquivos
        document.querySelector('label[for="fileInput"]').addEventListener('click', function() {
            if (document.querySelector('.divajuda').style.display !== 'none') {
                voltar();
            }
        });

        console.log('Eventos revinculados com sucesso!'); // Debug
    }

    // Chamar a função apenas uma vez quando o documento estiver pronto
    $(document).ready(function() {
        criarInterface();
    });

    // Variáveis globais
    let arquivosParaProcessar = [];
    let currentFileIndex = 0;
    let isProcessing = false;
    let currentIframe = null;
    let registroLogs = [];
    let estatisticasProcesso = {
        inicioProcesso: null,
        fimProcesso: null,
        totalArquivos: 0,
        arquivosProcessados: 0
    };

    // Configurações globais
    const CONFIG = {
        TEMPO_ESPERA_PADRAO: 3000,
        TEMPO_ESPERA_ERRO: 5000,
        TAMANHO_MAXIMO_ARQUIVO: 5 * 1024 * 1024, // 5MB
        MAX_TENTATIVAS_UPLOAD: 30,
        MAX_TENTATIVAS_PROCESSAMENTO: 60,
        TIMEOUT_TOTAL: 180000, // 3 minutos
        COLUNAS_LOG: ['Nome do Arquivo', 'Tipo do Documento', 'Tipo do Retorno', 'Mensagem'],
        DELIMITADOR_CSV: ';'
    };

    // Tipos de documentos com seus IDs (com acentuação corrigida)
    const tiposDocumentos = {
        1: "DOCUMENTOS PESSOAIS DO PAI, DA MÃE OU DO RESPONSÁVEL",
        2: "CERTIDÃO DE NASCIMENTO OU CASAMENTO DO ESTUDANTE",
        3: "DOCUMENTOS PESSOAIS DO ESTUDANTE (RG E CPF)",
        4: "FATURA ATUALIZADA DE ENERGIA ELÉTRICA",
        5: "TIPO DO GRUPO SANGUÍNEO E FATOR RH DO ESTUDANTE",
        6: "CARTÃO ATUALIZADO DE VACINA DO ESTUDANTE",
        7: "ATESTADO MÉDICO OFTALMOLÓGICO OU AVALIAÇÃO TÉCNICA DE OPTOMETRIA (APENAS EF)",
        8: "HISTÓRICO ESCOLAR OU ATESTADO DE TRANSFERÊNCIA",
        9: "DOCUMENTO PAED"
    };

    // Sistema de Log melhorado
    class LogManager {
        constructor() {
            this.queue = [];
            this.isDisplaying = false;
            this.lastMessage = '';
            this.lastMessageTime = 0;
        }

        init() {
            this.divLog = document.getElementById('divlog');
            if (!this.divLog) {
                console.warn('Elemento divlog não encontrado, criando...');
                this.divLog = document.createElement('div');
                this.divLog.id = 'divlog';
                this.divLog.className = 'divlog';
                document.body.appendChild(this.divLog);
            }
        }

        async addLog(mensagem, tempo = 3000, cor = '#087eff') {
            if (!this.divLog) {
                this.init();
            }

            const now = Date.now();
            if (this.lastMessage === mensagem && (now - this.lastMessageTime) < 2000) {
                return;
            }

            this.lastMessage = mensagem;
            this.lastMessageTime = now;
            this.queue.push({ mensagem, tempo, cor });

            if (!this.isDisplaying) {
                this.processQueue();
            }
        }

        async processQueue() {
            if (!this.divLog) {
                this.init();
            }

            if (this.queue.length === 0) {
                this.isDisplaying = false;
                return;
            }

            this.isDisplaying = true;
            const { mensagem, tempo, cor } = this.queue.shift();

            this.divLog.style.display = 'block';
            this.divLog.style.color = cor;
            this.divLog.innerHTML = mensagem;

            await new Promise(resolve => setTimeout(resolve, tempo));
            this.divLog.style.display = 'none';

            await new Promise(resolve => setTimeout(resolve, 300));
            this.processQueue();
        }
    }

    // Criar instância do LogManager
    const logManager = new LogManager();

    // Função auxiliar de exibição de log
    function exibirLog(mensagem, tempo = 3000, cor = '#087eff') {
        if (logManager) {
            logManager.addLog(mensagem, tempo, cor);
        } else {
            console.warn('LogManager não está disponível');
        }
    }

    // Função para analisar o nome do arquivo
    function parseFileName(fileName) {
        const baseName = fileName.replace(/\.[^/.]+$/, "");
        const parts = baseName.split('-');

        if (parts.length !== 2) {
            return { error: `Formato inválido: ${fileName}. Use CODIGOALUNO-IDDOCUMENTO.extensão` };
        }

        const codAluno = parts[0];
        const docId = parseInt(parts[1]);

        if (!codAluno || isNaN(docId)) {
            return { error: `Formato inválido: ${fileName}. Use CODIGOALUNO-IDDOCUMENTO.extensão` };
        }

        if (!tiposDocumentos[docId]) {
            return { error: `ID de documento desconhecido: ${docId} no arquivo ${fileName}` };
        }

        return {
            codAluno: codAluno,
            docId: docId,
            docName: tiposDocumentos[docId],
            fileName: fileName,
            file: null
        };
    }

    // Função para validação de arquivo atualizada
    function validarArquivo(file, fileInfo) {
        const tiposPermitidos = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'image/bmp'];
        const erros = [];

        if (!tiposPermitidos.includes(file.type)) {
            const erro = 'Tipo de arquivo não permitido. Use apenas PDF, JPG, PNG, GIF ou BMP.';
            erros.push(erro);
            // Registra o erro no log
            registrarLog(
                fileInfo.fileName,
                tiposDocumentos[fileInfo.docId],
                'erro',
                `Erro de validação: ${erro} (Tipo: ${file.type})`
            );
        }

        if (file.size > CONFIG.TAMANHO_MAXIMO_ARQUIVO) {
            const erro = 'Arquivo muito grande. O tamanho máximo permitido é 5MB.';
            erros.push(erro);
            // Registra o erro no log
            registrarLog(
                fileInfo.fileName,
                tiposDocumentos[fileInfo.docId],
                'erro',
                `Erro de validação: ${erro} (Tamanho: ${(file.size / 1024 / 1024).toFixed(2)}MB)`
            );
        }

        return {
            valido: erros.length === 0,
            erros: erros
        };
    }

    // Função centralizada para atualizar o progresso
    function atualizarProgresso(porcentagem, texto) {
        const progressArea = document.getElementById('progressArea');
        const barra = progressArea.querySelector('.progress-bar');
        const textoElement = progressArea.querySelector('.progress-text');

        if (progressArea && barra && textoElement) {
            progressArea.style.display = 'block';
            barra.style.width = `${porcentagem}%`;
            textoElement.textContent = `${porcentagem}% - ${texto}`;
        }
    }

    // Função para processar o próximo arquivo
    function processarProximoArquivo() {
        if (currentFileIndex >= arquivosParaProcessar.length) {
            exibirLog('Processo concluído para todos os arquivos!', 5000, '#4BB543');
            atualizarProgresso(100, 'Processo concluído');
            isProcessing = false;

            setTimeout(() => {
                $('.btnajuda').fadeIn(500);
                criarBotaoExportacao();
            }, 1000);

            return;
        }

        const fileInfo = arquivosParaProcessar[currentFileIndex];
        const progresso = Math.round((currentFileIndex / arquivosParaProcessar.length) * 100);
        atualizarProgresso(progresso, `Processando: ${fileInfo.fileName}`);

        abrirPaginaAluno(fileInfo);
    }

    // Função para criar botão de exportação
    function criarBotaoExportacao() {
        // Remover botão existente se houver
        $('.botao-exportar').remove();

        const btnExportar = $('<input>', {
            type: 'button',
            value: 'Exportar LOG (CSV)',
            class: 'botaoSCT botao-exportar',
            css: {
                marginBottom: '15px'
            },
            click: exportarCSV
        });

        // Inserir antes do último elemento da divseletor
        const divSeletor = $('.divseletor');
        if (divSeletor.length) {
            btnExportar.insertBefore(divSeletor.children().last());
            btnExportar.hide().fadeIn(500);
        }
    }

    // Função para abrir a página do aluno
    function abrirPaginaAluno(fileInfo) {
        if (currentIframe && currentIframe.parentNode) {
            currentIframe.parentNode.removeChild(currentIframe);
        }

        currentIframe = document.createElement('iframe');
        currentIframe.id = 'uploadFrame';
        currentIframe.style.display = 'none';
        currentIframe.style.visibility = 'hidden';
        document.body.appendChild(currentIframe);

        const url = `http://sigeduca.seduc.mt.gov.br/ged/hwtmgedaluno2.aspx?${fileInfo.codAluno},,HWMConAluno,UPD,1,0,1`;
        currentIframe.src = url;

        currentIframe.onload = function() {
            setTimeout(() => {
                enviarDocumento(currentIframe, fileInfo);
            }, 3000);
        };
    }

    // Função principal de envio do documento atualizada
    async function enviarDocumento(iframe, fileInfo) {
        const docFrame = iframe.contentDocument || iframe.contentWindow.document;
        const timeout = setTimeout(() => {
            registrarLog(
                fileInfo.fileName,
                tiposDocumentos[fileInfo.docId],
                'erro',
                'Tempo total de processamento excedido'
            );
            throw new Error('Tempo total de processamento excedido');
        }, CONFIG.TIMEOUT_TOTAL);

        try {
            const validacao = validarArquivo(fileInfo.file, fileInfo);
            if (!validacao.valido) {
                throw new Error(validacao.erros.join('\n'));
            }

            const selectTipoDoc = docFrame.getElementById('vGEDDOCOBRIGID');
            if (!selectTipoDoc) {
                throw new Error('Elemento de seleção de documento não encontrado');
            }

            selectTipoDoc.value = fileInfo.docId;
            selectTipoDoc.dispatchEvent(new Event('change', { bubbles: true }));
            await esperar(1000);

            const fileInputGED = docFrame.querySelector('input[type="file"]');
            if (!fileInputGED) {
                throw new Error('Campo de upload não encontrado');
            }

            exibirLog(`Iniciando upload de ${fileInfo.fileName}...`, CONFIG.TEMPO_ESPERA_PADRAO, '#087eff');
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(fileInfo.file);
            fileInputGED.files = dataTransfer.files;
            fileInputGED.dispatchEvent(new Event('change', { bubbles: true }));

            let uploadCompleto = false;
            let tentativas = 0;

            while (!uploadCompleto && tentativas < CONFIG.MAX_TENTATIVAS_UPLOAD) {
                const spanTextoAdicionar = docFrame.getElementById('span_vTEXTOADICIONAR');
                const mensagemAdicionar = spanTextoAdicionar?.textContent?.trim() || '';

                if (mensagemAdicionar) {
                    if (mensagemAdicionar.toLowerCase().includes('sucesso')) {
                        uploadCompleto = true;
                        break;
                    } else if (mensagemAdicionar.toLowerCase().includes('erro') ||
                             mensagemAdicionar.toLowerCase().includes('falha') ||
                             mensagemAdicionar.toLowerCase().includes('inválido')) {
                        throw new Error(mensagemAdicionar);
                    }
                }

                if (tentativas % 10 === 0) {
                    const progressoAtual = Math.round(((currentFileIndex + 0.5) / arquivosParaProcessar.length) * 100);
                    atualizarProgresso(progressoAtual, `Processando: ${fileInfo.fileName}`);
                }
                await esperar(1000);
                tentativas++;
            }

            if (!uploadCompleto) {
                throw new Error('Tempo excedido aguardando upload do arquivo');
            }

            const btnAdicionar = docFrame.querySelector('input[name="BTNINCLUIRARQUIVO"]');
            if (!btnAdicionar) {
                throw new Error('Botão de adicionar não encontrado');
            }

            btnAdicionar.click();

            let processoConcluido = false;
            tentativas = 0;

            while (!processoConcluido && tentativas < CONFIG.MAX_TENTATIVAS_PROCESSAMENTO) {
                const avisoElement = docFrame.querySelector('.aviso');
                const erroElement = docFrame.querySelector('.erro');

                const mensagemAviso = avisoElement?.textContent?.trim() || '';
                const mensagemErro = erroElement?.textContent?.trim() || '';

                if (mensagemAviso || mensagemErro) {
                    const mensagemFinal = mensagemErro || mensagemAviso;
                    const palavrasErro = ['erro', 'falha', 'impossível', 'impossivel', 'inválido', 'invalido', 'atenção', 'atencao'];
                    const palavrasSucesso = ['sucesso', 'concluído', 'concluido', 'realizado'];

                    const ehSucesso = palavrasSucesso.some(palavra => mensagemFinal.toLowerCase().includes(palavra));
                    const ehErro = palavrasErro.some(palavra => mensagemFinal.toLowerCase().includes(palavra)) || !!mensagemErro;

                    // Registrar o log
                    registrarLog(
                        fileInfo.fileName,
                        tiposDocumentos[fileInfo.docId],
                        ehErro ? 'erro' : ehSucesso ? 'sucesso' : 'aviso',
                        mensagemFinal
                    );

                    exibirLog(mensagemFinal, CONFIG.TEMPO_ESPERA_PADRAO, ehSucesso ? '#4BB543' : ehErro ? '#FF4B40' : '#FFA500');
                    processoConcluido = true;

                    if (ehErro) {
                        throw new Error(mensagemFinal);
                    }

                    break;
                }

                await esperar(1000);
                tentativas++;

                if (tentativas % 10 === 0) {
                    exibirLog(`Aguardando processamento... (${tentativas}s)`, CONFIG.TEMPO_ESPERA_PADRAO, '#FFA500');
                }
            }

            if (!processoConcluido) {
                throw new Error('Tempo excedido aguardando resposta do servidor');
            }

            await esperar(2000);
            clearTimeout(timeout);
            finalizarProcesso(iframe, false);

        } catch (error) {
            clearTimeout(timeout);
            const progressoAtual = Math.round(((currentFileIndex + 1) / arquivosParaProcessar.length) * 100);
            atualizarProgresso(progressoAtual, `Erro: ${error.message}`);

            // Registrar erro no log se ainda não foi registrado
            if (!registroLogs.some(log => log.arquivo === fileInfo.fileName && log.mensagem === error.message)) {
                registrarLog(
                    fileInfo.fileName,
                    tiposDocumentos[fileInfo.docId],
                    'erro',
                    error.message
                );
            }
            exibirLog(error.message, CONFIG.TEMPO_ESPERA_ERRO, '#FF4B40');
            finalizarProcesso(iframe, true);
        }
    }

    // Função única de finalização do processo
    function finalizarProcesso(iframe, erro = false) {
        if (iframe && iframe.parentNode) {
            iframe.parentNode.removeChild(iframe);
        }

        // Atualizar progresso antes de continuar
        const progressoAtual = Math.round(((currentFileIndex + 1) / arquivosParaProcessar.length) * 100);
        atualizarProgresso(progressoAtual, 'Analisando próximo arquivo...');

        setTimeout(() => {
            currentFileIndex++;
            processarProximoArquivo();
        }, erro ? 3000 : 1000);
    }

    // Função auxiliar de espera
    function esperar(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Função para gerenciar cookies
    function setCookie(name, value, days) {
        const d = new Date();
        d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
        const expires = "expires=" + d.toUTCString();
        document.cookie = name + "=" + value + ";" + expires + ";path=/";
    }

    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null;
    }

    // Função para criar a barra de progresso
    function criarBarraProgresso() {
        const container = document.createElement('div');
        container.className = 'progress-container';
        container.innerHTML = `
            <div class="progress-bar-wrapper">
                <div class="progress-bar"></div>
            </div>
            <div class="progress-text">0% - Pronto para iniciar</div>
        `;
        return container;
    }

    // Adicionar a função de ajuda
    function ajuda() {
        $('.divbotoes').slideUp(500, 'swing');
        $('.divajuda').slideDown(500, 'swing');
        $('.btnajuda').fadeOut(500);
        $('.divseletor').slideUp(500, 'swing');
        $('.progress-container').slideUp(500, 'swing');
        $('#btnvoltar').slideDown(500, 'swing');
    }

    // Adicionar a função voltar
    function voltar() {
        $('.divajuda').slideUp(500, 'swing');
        $('#btnvoltar').fadeOut(500);
        $('.btnajuda').fadeIn(500);
        $('.divseletor').slideDown(500, 'swing');
    }

    // Função para registrar log
    function registrarLog(arquivo, tipoDoc, tipoRetorno, mensagem) {
        // Incrementar contador de arquivos processados
        estatisticasProcesso.arquivosProcessados++;

        // Registrar log
        registroLogs.push({
            arquivo: arquivo,
            tipoDoc: tipoDoc,
            tipoRetorno: tipoRetorno,
            mensagem: mensagem
        });

        // Atualizar o status visual do arquivo na lista
        atualizarStatusArquivo(arquivo, tipoRetorno);
    }

    // Função para atualizar o status visual do item na lista
    function atualizarStatusArquivo(fileName, status) {
        const fileItems = document.querySelectorAll('.fileItem');
        for (const item of fileItems) {
            if (item.textContent.includes(fileName)) {
                // Remover classes existentes
                item.classList.remove('success', 'failure');

                // Adicionar nova classe baseada no status
                if (status === 'sucesso') {
                    item.classList.add('success');
                } else if (status === 'erro') {
                    item.classList.add('failure');
                }
                break;
            }
        }
    }

    // Função para gerar relatório simplificado
    function gerarRelatorioEstatisticas() {
        if (!estatisticasProcesso || !estatisticasProcesso.inicioProcesso) {
            return [
                ['RESUMO DO PROCESSO'],
                ['Erro: Estatísticas não disponíveis'],
                [''],
                ['DETALHAMENTO DOS ARQUIVOS']
            ];
        }

        estatisticasProcesso.fimProcesso = new Date();
        const tempoTotal = (estatisticasProcesso.fimProcesso - estatisticasProcesso.inicioProcesso) / 1000;

        return [
            ['RESUMO DO PROCESSO'],
            ['Início', estatisticasProcesso.inicioProcesso.toLocaleString('pt-BR')],
            ['Fim', estatisticasProcesso.fimProcesso.toLocaleString('pt-BR')],
            ['Tempo Total', `${tempoTotal.toFixed(1)} segundos`],
            ['Total de Arquivos Processados', estatisticasProcesso.arquivosProcessados],
            [''],
            ['DETALHAMENTO DOS ARQUIVOS']
        ];
    }

    // Função para exportar CSV
    function exportarCSV() {
        const relatorio = gerarRelatorioEstatisticas();
        let csv = '';

        // Adicionar relatório resumido
        relatorio.forEach(linha => {
            if (Array.isArray(linha)) {
                csv += linha.join(CONFIG.DELIMITADOR_CSV) + '\n';
            } else {
                csv += linha + '\n';
            }
        });

        // Adicionar logs detalhados
        csv += CONFIG.COLUNAS_LOG.join(CONFIG.DELIMITADOR_CSV) + '\n';

        registroLogs.forEach(log => {
            const linha = [
                log.arquivo,
                log.tipoDoc,
                log.tipoRetorno,
                `"${log.mensagem.replace(/"/g, '""')}"`
            ].join(CONFIG.DELIMITADOR_CSV);

            csv += linha + '\n';
        });

        const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const dataHora = new Date().toLocaleString('pt-BR').replace(/[/:]/g, '-');

        const link = document.createElement('a');
        link.href = url;
        link.download = `relatorio_upload_${dataHora}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
})();
