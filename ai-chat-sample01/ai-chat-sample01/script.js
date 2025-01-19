let llm_model = 'unknown'
let ip_address = ''

function isValidIPv4Address(ip) {
    // IPv4アドレスの正規表現パターン
    const regexPattern = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

    return regexPattern.test(ip);
}

function isValidIPv6Address(ip) {
    // IPv6アドレスの正規表現パターン
    const regexPattern = /^(?:[A-F0-9]{1,4}:){7}[A-F0-9]{1,4}$|^(?:[A-F0-9]{1,4}:){1,7}:$|^(?:[A-F0-9]{1,4}:){1,6}:[A-F0-9]{1,4}$|^(?:[A-F0-9]{1,4}:){1,5}(?::[A-F0-9]{1,4}){1,2}$|^(?:[A-F0-9]{1,4}:){1,4}(?::[A-F0-9]{1,4}){1,3}$|^(?:[A-F0-9]{1,4}:){1,3}(?::[A-F0-9]{1,4}){1,4}$|^(?:[A-F0-9]{1,4}:){1,2}(?::[A-F0-9]{1,4}){1,5}$|^[A-F0-9]{1,4}:(?:(?::[A-F0-9]{1,4}){1,6})$|^:(?:(?::[A-F0-9]{1,4}){1,7}|:)$|^(?:[A-F0-9]{1,4}:){1,7}:$|^(?:[A-F0-9]{1,4}:){7}[A-F0-9]{1,4}(?:(?:\.[A-F0-9]{1,3}){3}\.[A-F0-9]{1,3})?$/i;

    return regexPattern.test(ip);
}

document.getElementById('apply-button').addEventListener('click', async function() {
        llm_model = document.getElementById('llm-model-list').value;
        ip_address = document.getElementById('ip-address-input').value;
    
        if (ip_address.length === 0) {
            return;
        }

        if ((ip_address !== 'localhost') && (isValidIPv4Address(ip_address) === false) && (isValidIPv6Address(ip_address) === false)) {
            return;
        }

        // スクロールを最新のメッセージに合わせる
        const chatMessages = document.querySelector('.chat-messages');
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // AIからのメッセージの表示準備
        const receivedMessageContainer = document.createElement('div');
        receivedMessageContainer.className = 'message received';

        const receivedIconContainer = document.createElement('div');
        receivedIconContainer.className = 'icon';
        receivedIconContainer.style.backgroundImage = 'url(./operator-icon.png)';

        const receivedMessageTextContainer = document.createElement('div');
        receivedMessageTextContainer.className = 'message-text';

        receivedMessageContainer.appendChild(receivedIconContainer);
        receivedMessageContainer.appendChild(receivedMessageTextContainer);

        document.querySelector('.chat-messages').appendChild(receivedMessageContainer);

        // スクロールを最新のメッセージに合わせる
        chatMessages.scrollTop = chatMessages.scrollHeight;

        send_message(receivedMessageTextContainer, 'こんにちは');

});

document.getElementById('send-button').addEventListener('click', async function() {
    const messageInput = document.getElementById('message-input');
    const messageText = messageInput.value.trim();

    if (messageText === null) {
        return;
    }

    if (ip_address.length === 0) {
        return;
    }

    if ((ip_address !== 'localhost') && (isValidIPv4Address(ip_address) === false) && (isValidIPv6Address(ip_address) === false)) {
        return;
    }

    // 送信メッセージの表示
    const messageContainer = document.createElement('div');
    messageContainer.className = 'message sent';

    const messageTextContainer = document.createElement('div');
    messageTextContainer.className = 'message-text';
    messageTextContainer.textContent = messageText;

    messageContainer.appendChild(messageTextContainer);

    document.querySelector('.chat-messages').appendChild(messageContainer);
    messageInput.value = '';
    messageInput.focus();

    // スクロールを最新のメッセージに合わせる
    const chatMessages = document.querySelector('.chat-messages');
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // AIからのメッセージの表示準備
    const receivedMessageContainer = document.createElement('div');
    receivedMessageContainer.className = 'message received';

    const receivedIconContainer = document.createElement('div');
    receivedIconContainer.className = 'icon';
    receivedIconContainer.style.backgroundImage = 'url(./operator-icon.png)';

    const receivedMessageTextContainer = document.createElement('div');
    receivedMessageTextContainer.className = 'message-text';

    receivedMessageContainer.appendChild(receivedIconContainer);
    receivedMessageContainer.appendChild(receivedMessageTextContainer);

    document.querySelector('.chat-messages').appendChild(receivedMessageContainer);

    // スクロールを最新のメッセージに合わせる
    chatMessages.scrollTop = chatMessages.scrollHeight;

    send_message(receivedMessageTextContainer, messageText);
});

async function send_message(receivedMessageTextContainer, messageText) {

    //console.log(messageText);
    //console.log(ip_address);
    //console.log(llm_model);

    // POSTリクエストの送信
    try {

        const response = await fetch(`http://${ip_address}:11434/api/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: llm_model,
                prompt: messageText
            })
        });

        if (response.ok) {
            const chatMessages = document.querySelector('.chat-messages');
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let messageBuffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                messageBuffer += decoder.decode(value, { stream: true });

                try {
                    const jsonResponse = JSON.parse(messageBuffer);

                    if (jsonResponse.response) {
                        receivedMessageTextContainer.textContent += jsonResponse.response;
                        messageBuffer = ''; // Clear buffer after successful parse

                        // スクロールを最新のメッセージに合わせる
                        chatMessages.scrollTop = chatMessages.scrollHeight;
                    }
                } catch (e) {
                    // Ignore parse errors, continue buffering
                }
            }
        } else {
            console.error('Error:', response.statusText);
        }
    } catch (error) {
        console.error('Request failed', error);
    }
}
