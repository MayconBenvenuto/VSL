// Função para formatar números menores que 10 com um zero à esquerda (ex: 09, 08)
function formatTime(time) {
    return time < 10 ? `0${time}` : time;
}

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