// Função para formatar números menores que 10 com um zero à esquerda (ex: 09, 08)
function formatTime(time) {
    return time < 10 ? `0${time}` : time;
}

// Função para inicializar o temporizador
function initCountdown() {
    const hoursElement = document.getElementById('hours');
    const minutesElement = document.getElementById('minutes');
    const secondsElement = document.getElementById('seconds');

    if (!hoursElement || !minutesElement || !secondsElement) {
        console.warn('Elementos do temporizador não encontrados');
        return;
    }

    const localStorageKey = 'countdownStartTime'; // Key para armazenar o tempo de INÍCIO
    let startTimeMillis; // Tempo de início do ciclo de 24h

    // Tenta carregar o tempo de início do localStorage
    const savedStartTime = localStorage.getItem(localStorageKey);
    const nowMillis = Date.now();

    if (savedStartTime) {
        startTimeMillis = parseInt(savedStartTime);
        console.log('DEBUG TIMER: Tempo de início carregado (milissegundos):', startTimeMillis);
        console.log('DEBUG TIMER: Data/Hora de início carregada:', new Date(startTimeMillis));

        // Calcula a data de expiração com base no tempo de início salvo
        const calculatedExpirationTime = startTimeMillis + (24 * 60 * 60 * 1000);

        // Se a data de expiração calculada já passou, significa que o ciclo de 24h terminou.
        // Então, definimos um novo tempo de início (o "agora") e salvamos.
        if (calculatedExpirationTime <= nowMillis) {
            console.log('DEBUG TIMER: Ciclo de 24 horas anterior expirou. Iniciando novo ciclo.');
            startTimeMillis = nowMillis;
            localStorage.setItem(localStorageKey, startTimeMillis.toString());
            console.log('DEBUG TIMER: Novo tempo de início salvo após expiração:', new Date(startTimeMillis));
        }
    } else {
        // Se não há tempo de início salvo, define o agora como o tempo de início e salva.
        startTimeMillis = nowMillis;
        localStorage.setItem(localStorageKey, startTimeMillis.toString());
        console.log('DEBUG TIMER: Nenhum tempo de início encontrado. Salvando novo tempo de início:', new Date(startTimeMillis));
    }

    // A partir do tempo de início (seja ele carregado ou novo), calculamos o tempo final.
    let endTimeMillis = startTimeMillis + (24 * 60 * 60 * 1000);

    console.log('DEBUG TIMER: Data/Hora atual:', new Date(nowMillis));
    console.log('DEBUG TIMER: Data/Hora de expiração calculada:', new Date(endTimeMillis));
    console.log('DEBUG TIMER: Tempo restante inicial (milissegundos):', endTimeMillis - nowMillis);


    function updateTimer() {
        const currentNowMillis = Date.now();
        const timeLeft = endTimeMillis - currentNowMillis;

        if (timeLeft <= 0) {
            // O temporizador chegou a zero. Inicia um novo ciclo de 24 horas.
            console.log('DEBUG TIMER: Temporizador chegou a zero. Reiniciando para um novo ciclo de 24 horas.');
            startTimeMillis = currentNowMillis; // Novo tempo de início é o momento atual
            localStorage.setItem(localStorageKey, startTimeMillis.toString());
            endTimeMillis = startTimeMillis + (24 * 60 * 60 * 1000); // Novo tempo final
            console.log('DEBUG TIMER: Novo tempo de início salvo após reset:', new Date(startTimeMillis));
            console.log('DEBUG TIMER: Novo tempo de expiração após reset:', new Date(endTimeMillis));
            // Não é necessário `return` aqui, a próxima iteração do setInterval vai pegar o novo endTimeMillis
        }

        // Calcula horas, minutos e segundos a partir do tempo restante
        const hours = Math.floor(timeLeft / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

        // Atualiza os elementos do display com zeros à esquerda
        hoursElement.textContent = hours.toString().padStart(2, '0');
        minutesElement.textContent = minutes.toString().padStart(2, '0');
        secondsElement.textContent = seconds.toString().padStart(2, '0');
    }

    // Atualiza imediatamente e depois a cada segundo
    updateTimer();
    return setInterval(updateTimer, 1000);
}

// Função para inicializar o player do Vimeo
function initVimeoPlayer() {
    const player = new Vimeo.Player(document.querySelector('iframe[src*="vimeo.com"]'));
    const soundToggleBtn = document.getElementById('sound-toggle');
    const soundIcon = soundToggleBtn.querySelector('.sound-icon');
    const soundText = soundToggleBtn.querySelector('.sound-text');
    
    // Configurações para autoplay em dispositivos móveis
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    if (isMobile) {
        // Força o autoplay em dispositivos móveis
        player.setVolume(0); // Muda para mudo (necessário para autoplay em alguns dispositivos)
        player.play().catch(function(error) {
            console.log('Erro ao iniciar vídeo automaticamente:', error);
        });
    }

    // Função para alternar o som
    let isMuted = true;
    
    // Função para atualizar a interface
    function updateSoundUI() {
        soundIcon.textContent = isMuted ? '🔇' : '🔊';
        soundText.textContent = isMuted ? 'Ativar Som' : 'Desativar Som';
    }

    // Função para alternar o som
    async function toggleSound() {
        try {
            // Obtém o estado atual do volume
            const volume = await player.getVolume();
            
            // Alterna o estado
            isMuted = volume > 0;
            
            // Define o novo volume
            await player.setVolume(isMuted ? 0 : 1);
            
            // Atualiza a interface
            updateSoundUI();
            
            console.log('Volume alterado para:', isMuted ? 'Mudo' : 'Com som');
        } catch (error) {
            console.error('Erro ao alternar som:', error);
        }
    }

    // Adiciona o evento de clique
    soundToggleBtn.addEventListener('click', function(e) {
        e.preventDefault(); // Previne o comportamento padrão
        e.stopPropagation(); // Impede a propagação do evento
        
        // Adiciona uma classe para feedback visual
        this.classList.add('clicked');
        setTimeout(() => this.classList.remove('clicked'), 200);
        
        // Chama a função de alternar som
        toggleSound();
    });

    // Adiciona listener para eventos de volume
    player.on('volumechange', function(data) {
        console.log('Volume alterado:', data.volume);
        isMuted = data.volume === 0;
        updateSoundUI();
    });
    
    player.on('play', function() {
        // Rastreia visualização do vídeo
        if (typeof fbq !== 'undefined') {
            fbq('track', 'VideoPlay');
        }
    });

    player.on('ended', function() {
        // Rastreia conclusão do vídeo
        if (typeof fbq !== 'undefined') {
            fbq('track', 'VideoComplete');
        }
    });

    return player;
}

// Função para inicializar animações
function initAnimations() {
    const buttons = document.querySelectorAll('.btn-purchase');
    
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-3px) scale(1.03)';
        });

        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
}

// Função para inicializar o rastreamento de cliques
function initClickTracking() {
    const buttons = document.querySelectorAll('.btn-purchase');
    
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            const product = this.getAttribute('data-product');
            
            // Rastreia clique no botão
            if (typeof fbq !== 'undefined') {
                fbq('track', 'InitiateCheckout', {
                    content_name: product
                });
            }
        });
    });
}

// Função para verificar performance
function checkPerformance() {
    if ('performance' in window) {
        const timing = window.performance.timing;
        const loadTime = timing.loadEventEnd - timing.navigationStart;
        
        if (loadTime > 3000) {
            console.warn('Tempo de carregamento alto:', loadTime + 'ms');
        }
    }
}

// Função para lidar com erros
function handleErrors() {
    window.onerror = function(msg, url, lineNo, columnNo, error) {
        console.error('Erro:', msg, 'URL:', url, 'Linha:', lineNo, 'Coluna:', columnNo, 'Erro:', error);
        return false;
    };
}

// Função principal de inicialização
function init() {
    try {
        // Inicializa o temporizador
        const timerInterval = initCountdown();
        
        // Inicializa o player do Vimeo
        const player = initVimeoPlayer();
        
        // Inicializa animações
        initAnimations();
        
        // Inicializa rastreamento de cliques
        initClickTracking();
        
        // Verifica performance
        checkPerformance();
        
        // Configura tratamento de erros
        handleErrors();
        
        // Limpa o temporizador quando a página for fechada
        window.addEventListener('beforeunload', function() {
            if (timerInterval) {
                clearInterval(timerInterval);
            }
        });
    } catch (error) {
        console.error('Erro na inicialização:', error);
    }
}

// Inicializa quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', init);

// --- TEMPORIZADOR DE ESCASSEZ ---
document.addEventListener('DOMContentLoaded', function() {
    // Defina a duração do temporizador (exemplo: 2 horas)
    let durationInSeconds = 2 * 60 * 60; // 2 horas em segundos

    const hoursElement = document.getElementById('hours');
    const minutesElement = document.getElementById('minutes');
    const secondsElement = document.getElementById('seconds');
    const timerSection = document.getElementById('timer-section');

    if (hoursElement && minutesElement && secondsElement) {
        let timer = durationInSeconds;
        let hours, minutes, seconds;

        const intervalId = setInterval(function () {
            hours = parseInt(timer / 3600, 10);
            minutes = parseInt((timer % 3600) / 60, 10);
            seconds = parseInt(timer % 60, 10);

            hoursElement.textContent = formatTime(hours);
            minutesElement.textContent = formatTime(minutes);
            secondsElement.textContent = formatTime(seconds);

            if (--timer < 0) {
                clearInterval(intervalId);
                if (timerSection) {
                    timerSection.innerHTML = "<h3>TEMPO ESGOTADO!</h3><p>Esta oferta especial não está mais disponível.</p>";
                }
                // Aqui você pode adicionar lógica para ocultar botões de compra ou redirecionar
                console.log("Temporizador zerado!");
            }
        }, 1000);
    } else {
        console.warn("Elementos do temporizador não encontrados no DOM.");
    }

    // --- RASTREAMENTO DE CLIQUES NOS BOTÕES DE COMPRA ---
    const purchaseButtons = document.querySelectorAll('.btn-purchase');
    purchaseButtons.forEach(button => {
        button.addEventListener('click', function(event) {
            const product = this.dataset.product || 'Produto Desconhecido';
            const link = this.href;
            
            console.log(`Clique no botão de compra: ${product}, Link: ${link}`);
            
            // Exemplo de envio de evento para o Facebook Pixel (se configurado)
            // if (typeof fbq !== 'undefined') {
            //     fbq('track', 'AddToCart', { content_name: product });
            // }

            // Exemplo de envio de evento para Google Analytics (gtag.js)
            // if (typeof gtag !== 'undefined') {
            //  gtag('event', 'add_to_cart', {
            // 'event_category': 'VSL Engagement',
            //    'event_label': product,
            //    'value': PRECO_DO_PRODUTO // se aplicável
            //  });
            // }
            
            // Não previne o comportamento padrão do link, apenas registra o clique.
            // Se precisar de mais tempo para o rastreamento, pode usar event.preventDefault()
            // e depois window.location.href = link;
        });
    });

    // --- RASTREAMENTO DE INTERAÇÃO COM VÍDEO (Exemplo) ---
    // Para vídeos auto-hospedados (<video>)
    const localVideo = document.querySelector('video.embed-responsive-item');
    if (localVideo) {
        localVideo.addEventListener('play', function() {
            console.log('Vídeo local começou a ser reproduzido.');
            // Enviar evento de rastreamento (ex: vídeo iniciado)
            // if (typeof fbq !== 'undefined') { fbq('trackCustom', 'VideoPlay'); }
            // if (typeof gtag !== 'undefined') { gtag('event', 'video_play', { 'event_category': 'VSL Video', 'event_label': localVideo.src }); }
        });

        localVideo.addEventListener('ended', function() {
            console.log('Vídeo local terminou.');
            // Enviar evento de rastreamento (ex: vídeo concluído)
        });
        
        localVideo.addEventListener('pause', function() {
            if (!localVideo.ended) {
                console.log('Vídeo local pausado.');
            }
        });
    }

    // Para vídeos do YouTube/Vimeo em iframes:
    // O rastreamento de interações (play, pause, progress) em iframes de terceiros
    // geralmente requer o uso das APIs JavaScript específicas fornecidas por eles
    // (YouTube Player API, Vimeo Player API).
    // Isso envolve carregar seus scripts de API e registrar callbacks para eventos do player.
    // Exemplo conceitual (não funcional diretamente sem a API do YouTube carregada):
    const iframeVideo = document.querySelector('iframe.embed-responsive-item');
    if (iframeVideo && iframeVideo.src.includes('youtube.com')) {
        console.log('Vídeo do YouTube detectado. Para rastreamento avançado, integre a API do YouTube Player.');
        // Para rastrear o clique no iframe (não garante que o vídeo começou a tocar, apenas que a área do vídeo foi clicada):
        iframeVideo.addEventListener('focus', () => {
             console.log('Foco no iframe do vídeo (possível início de interação).');
        });
    } else if (iframeVideo) {
        console.log('Vídeo em iframe detectado (não YouTube). Para rastreamento, verifique a API do provedor.');
    }
});

/*
Considerações sobre Testes A/B:
Para testes A/B de manchetes, você pode:
1. Criar duas versões do `index.html` (ex: `index_vA.html`, `index_vB.html`) com manchetes diferentes.
2. Usar uma ferramenta de teste A/B (Google Optimize, Optimizely, VWO) para dividir o tráfego entre as versões e medir qual converte melhor.
3. Implementar a lógica no lado do servidor ou com JavaScript para exibir aleatoriamente uma das manchetes e registrar a versão junto com os eventos de conversão.

Exemplo simples com JavaScript (para demonstração, não ideal para produção robusta sem backend ou ferramenta dedicada):

const headlines = [
    { id: 'A', text: "🔥 O Segredo Quente dos Montes Gelados: Sua Chance ÚNICA! 🔥" },
    { id: 'B', text: "🚀 Descubra AGORA a Transformação que Milhares Já Vivem! 🚀" }
];
const randomHeadline = headlines[Math.floor(Math.random() * headlines.length)];
const headerH1 = document.querySelector('header h1');
if (headerH1) {
    headerH1.textContent = randomHeadline.text;
    console.log(`Teste A/B: Exibindo manchete ${randomHeadline.id}`);
    // Você precisaria enviar 'randomHeadline.id' junto com seus eventos de conversão.
}
*/ 