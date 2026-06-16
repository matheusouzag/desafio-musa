// CONFIGURAÇÃO
const CONFIG = {
    API_URL: 'http://localhost:8000', 
    ENDPOINT: '/processar-mtrs',
    MAX_FILE_SIZE_MB: 10,
    TIPOS_PERMITIDOS: ['image/jpeg', 'image/png', 'image/webp']
};

const state = {
    imagens: [],
    contadorImagens: 1,
    processando: false
};

const elementos = {
    telaUpload: document.getElementById('tela-upload'),
    telaResultado: document.getElementById('tela-resultado'),
    
    formUpload: document.getElementById('form-upload'),
    pesoReal: document.getElementById('peso-real'),
    listaImagens: document.getElementById('lista-imagens'),
    btnAdicionarImagem: document.getElementById('btn-adicionar-imagem'),
    btnProcessar: document.getElementById('btn-processar'),
    btnTexto: document.querySelector('.btn-texto'),
    btnLoading: document.querySelector('.btn-loading'),
    
    cardPesoReal: document.getElementById('card-peso-real'),
    cardSomaDeclarada: document.getElementById('card-soma-declarada'),
    cardDiferenca: document.getElementById('card-diferenca'),
    cardPercentual: document.getElementById('card-percentual'),
    cardStatus: document.getElementById('card-status'),
    statusIcon: document.getElementById('status-icon'),
    cardStatusTexto: document.getElementById('card-status-texto'),
    
    tbodyMtrs: document.getElementById('tbody-mtrs'),
    secaoProblemas: document.getElementById('secao-problemas'),
    tbodyProblemas: document.getElementById('tbody-problemas'),
    
    btnNovaAnalise: document.getElementById('btn-nova-analise'),
    
    toast: document.getElementById('toast'),
    toastMensagem: document.getElementById('toast-mensagem')
};

// INICIALIZAÇÃO

document.addEventListener('DOMContentLoaded', () => {
    inicializarEventos();
    inicializarPrimeiroCampoImagem();
});

function inicializarEventos() {
    // Formulário
    elementos.formUpload.addEventListener('submit', handleSubmit);
    
    // Adicionar imagem
    elementos.btnAdicionarImagem.addEventListener('click', adicionarCampoImagem);
    
    // Nova análise
    elementos.btnNovaAnalise.addEventListener('click', reiniciarAplicacao);
}

// GESTÃO DE IMAGENS

function inicializarPrimeiroCampoImagem() {
    const input = document.getElementById('imagem-0');
    const previewArea = document.getElementById('preview-0');
    
    configurarInputImagem(input, 0, previewArea);
}

function configurarInputImagem(input, index, previewArea) {
    previewArea.addEventListener('click', (e) => {
        if (e.target !== input) {
            input.click();
        }
    });
    
    previewArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        previewArea.style.background = '#e5e7eb';
    });
    
    previewArea.addEventListener('dragleave', () => {
        previewArea.style.background = '';
    });
    
    previewArea.addEventListener('drop', (e) => {
        e.preventDefault();
        previewArea.style.background = '';
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            input.files = files;
            handleFileSelect(input, index);
        }
    });
    
    input.addEventListener('change', () => handleFileSelect(input, index));
}

function handleFileSelect(input, index) {
    const file = input.files[0];
    if (!file) return; 
    
    state.imagens[index] = file;
    
    const itemImagem = input.closest('.item-imagem');
    const previewArea = itemImagem.querySelector('.preview-area');
    const nomeArquivo = document.getElementById(`nome-${index}`);
    
    itemImagem.classList.add('tem-arquivo');
    
    // preview da imagem
    const reader = new FileReader();
    reader.onload = (e) => {
        previewArea.innerHTML = `
            <img src="${e.target.result}" alt="Preview" class="preview-imagem">
        `;
    };
    reader.readAsDataURL(file);
    
    nomeArquivo.textContent = file.name;
    
    const btnRemover = itemImagem.querySelector('.btn-remover-imagem');
    btnRemover.style.opacity = '1';
}

function adicionarCampoImagem() {
    const index = state.contadorImagens++;
    const div = document.createElement('div');
    div.className = 'item-imagem';
    div.dataset.index = index;
    div.innerHTML = `
        <div class="preview-area" id="preview-${index}">
            <svg class="icone-upload" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
            <span>Clique para selecionar ou arraste uma imagem</span>
            <span class="formatos-suportados">JPG, PNG, WEBP</span>
        </div>
        <input 
            type="file" 
            name="imagens" 
            accept="image/jpeg,image/png,image/webp"
            required
            class="input-imagem"
            id="imagem-${index}"
        >
        <button type="button" class="btn-remover-imagem" onclick="removerImagem(${index})" title="Remover imagem">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
        </button>
        <span class="nome-arquivo" id="nome-${index}"></span>
    `;
    
    elementos.listaImagens.appendChild(div);
    
    const input = document.getElementById(`imagem-${index}`);
    const previewArea = document.getElementById(`preview-${index}`);
    configurarInputImagem(input, index, previewArea);
    
    div.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function removerImagem(index) {
    const item = document.querySelector(`.item-imagem[data-index="${index}"]`);
    if (!item) return;
    
    const todosItens = elementos.listaImagens.querySelectorAll('.item-imagem');
    if (todosItens.length === 1) {
        limparCampoImagem(item, index);
        return;
    }
    
    item.remove();
    delete state.imagens[index];
}

function limparCampoImagem(item, index) {
    const input = item.querySelector('.input-imagem');
    const previewArea = item.querySelector('.preview-area');
    const nomeArquivo = document.getElementById(`nome-${index}`);
    
    input.value = '';
    delete state.imagens[index];
    item.classList.remove('tem-arquivo');
    
    previewArea.innerHTML = `
        <svg class="icone-upload" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="17 8 12 3 7 8"></polyline>
            <line x1="12" y1="3" x2="12" y2="15"></line>
        </svg>
        <span>Clique para selecionar ou arraste uma imagem</span>
        <span class="formatos-suportados">JPG, PNG, WEBP</span>
    `;
    
    nomeArquivo.textContent = '';
}

// SUBMISSÃO E API

async function handleSubmit(e) {
    e.preventDefault();
    
    if (state.processando) return;
    
    // Validações
    const pesoReal = parseFloat(elementos.pesoReal.value);
    if (isNaN(pesoReal) || pesoReal < 0) {
        mostrarToast('Informe um peso real válido.', 'erro');
        return;
    }
    
    const imagensValidas = Object.values(state.imagens).filter(f => f instanceof File);
    if (imagensValidas.length === 0) {
        mostrarToast('Adicione pelo menos uma imagem de MTR.', 'erro');
        return;
    }
    
    // Iniciar processamento
    setProcessando(true);
    
    try {
        const formData = new FormData();
        formData.append('peso_real', pesoReal);
        
        imagensValidas.forEach((file, i) => {
            formData.append('imagens', file);
        });

        console.log("URL:", `${CONFIG.API_URL}${CONFIG.ENDPOINT}`);
        console.log("Peso:", pesoReal);
        console.log("Imagens:", imagensValidas);
        
        const response = await fetch(`${CONFIG.API_URL}${CONFIG.ENDPOINT}`, {
            method: 'POST',
            body: formData
        });

        console.log("Status:", response.status);
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || `Erro ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        renderizarResultado(data);
        navegarPara('resultado');
        
    } catch (error) {
        console.error('Erro ao processar MTRs:', error);
        mostrarToast(`Erro: ${error.message}`, 'erro');
    } finally {
        setProcessando(false);
    }
}

function setProcessando(processando) {
    state.processando = processando;
    elementos.btnProcessar.disabled = processando;
    elementos.btnTexto.style.display = processando ? 'none' : 'inline';
    elementos.btnLoading.style.display = processando ? 'inline-flex' : 'none';
}

// RESULTADOS

function renderizarResultado(data) {
    elementos.cardPesoReal.textContent = formatarPeso(data.peso_real);
    elementos.cardSomaDeclarada.textContent = formatarPeso(data.soma_declarada);
    elementos.cardDiferenca.textContent = formatarPeso(Math.abs(data.diferenca));
    elementos.cardPercentual.textContent = `${data.percentual_diferenca.toFixed(2).replace('.', ',')}%`;
    
    const statusConfig = {
        'correto': { texto: 'Peso Correto', classe: 'correto' },
        'veio_a_mais': { texto: 'Peso Excedido', classe: 'veio-a-mais' },
        'veio_a_menos': { texto: 'Peso Faltante', classe: 'veio-a-menos' }
    };
    
    const status = statusConfig[data.status] || statusConfig['correto'];
    elementos.cardStatusTexto.textContent = status.texto;
    elementos.cardStatus.className = `card-resumo card-status ${status.classe}`;
    
    renderizarTabelaMtrs(data.mtrs);
    
    if (data.faltantes_mtrs && data.faltantes_mtrs.length > 0) {
        renderizarTabelaProblemas(data.faltantes_mtrs);
        elementos.secaoProblemas.style.display = 'block';
    } else {
        elementos.secaoProblemas.style.display = 'none';
    }
}

function renderizarTabelaMtrs(mtrs) {
    elementos.tbodyMtrs.innerHTML = '';
    
    if (!mtrs || mtrs.length === 0) {
        elementos.tbodyMtrs.innerHTML = `
            <tr>
                <td colspan="5" class="text-center">Nenhum MTR processado</td>
            </tr>
        `;
        return;
    }
    
    mtrs.forEach(mtr => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${escapeHtml(mtr.mtr)}</td>
            <td>${escapeHtml(mtr.gerador)}</td>
            <td>${escapeHtml(mtr.tipo_residuo)}</td>
            <td>${formatarPeso(mtr.peso_declarado)}</td>
            <td>
                <span class="badge-revisao ${mtr.revisao_manual ? 'sim' : 'nao'}">
                    ${mtr.revisao_manual ? 'Sim' : '✓ Não'}
                </span>
            </td>
        `;
        elementos.tbodyMtrs.appendChild(tr);
    });
}

function renderizarTabelaProblemas(faltantes) {
    elementos.tbodyProblemas.innerHTML = '';
    
    faltantes.forEach(item => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${escapeHtml(item.mtr)}</td>
            <td>
                <ul style="margin: 0; padding-left: 18px;">
                    ${item.problemas.map(p => `<li>${escapeHtml(p)}</li>`).join('')}
                </ul>
            </td>
        `;
        elementos.tbodyProblemas.appendChild(tr);
    });
}


function navegarPara(tela) {
    elementos.telaUpload.classList.remove('ativa');
    elementos.telaResultado.classList.remove('ativa');
    
    if (tela === 'upload') {
        elementos.telaUpload.classList.add('ativa');
    } else if (tela === 'resultado') {
        elementos.telaResultado.classList.add('ativa');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function reiniciarAplicacao() {
    elementos.formUpload.reset();
    elementos.listaImagens.innerHTML = '';
    state.imagens = [];
    state.contadorImagens = 0;
    
    adicionarCampoImagem();
    
    navegarPara('upload');
}

function formatarPeso(valor) {
    if (valor === undefined || valor === null) return '--';
    return `${valor.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} kg`;
}

function escapeHtml(text) {
    if (text === undefined || text === null) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function mostrarToast(mensagem, tipo = 'info') {
    elementos.toastMensagem.textContent = mensagem;
    elementos.toast.className = `toast ${tipo} visivel`;
    
    setTimeout(() => {
        elementos.toast.classList.remove('visivel');
    }, 4000);
}

