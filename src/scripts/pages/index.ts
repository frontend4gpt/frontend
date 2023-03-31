import { Message } from '../structures/Message';

const messagesContainer = document.getElementById('messages') as HTMLDivElement;
const inputForm = document.getElementById('input-form') as HTMLDivElement;
const inputSend = document.getElementById('input-send') as HTMLInputElement;
const input = document.getElementById('input') as HTMLTextAreaElement;
const loading = document.getElementById('loading') as HTMLDivElement;
const loadingTime = document.getElementById('loading-time') as HTMLSpanElement;
const token = document.getElementById('token') as HTMLInputElement;

// Message history
const messages: Message[] = [];

// Input magic
const updateInputHeight = () => {
    input.style.height = '0px';
    input.style.height = `${input.scrollHeight}px`;
};

input.addEventListener('input', updateInputHeight, false);

// Function to create a new message element
const createMessageElement = (message: Message) => {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');

    const usernameElement = document.createElement('div');
    usernameElement.classList.add('username');
    usernameElement.innerText = message.getRole();

    const textElement = document.createElement('p');
    textElement.classList.add('content');
    textElement.innerText = message.getContent();

    messageElement.appendChild(usernameElement);
    messageElement.appendChild(textElement);

    return messageElement;
};

// Function to add a new message to the messages container
const addMessage = (message: Message) => {
    const messageElement = createMessageElement(message);
    messagesContainer.appendChild(messageElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
};

// Event listener for send button
inputForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const content = input.value.trim();

    // Check if the input field has a non-empty value
    if (content.length === 0) {
        return;
    }

    input.value = '';
    updateInputHeight();
    loading.dataset['loading'] = 'true';
    inputSend.disabled = true;
    input.disabled = true;

    const message = new Message({ role: 'You', content: content });
    messages.push(message);
    addMessage(message);

    const start = Date.now();
    const timer = setInterval(() => {
        loadingTime.textContent = String(((Date.now() - start) / 1000).toFixed(1));
    }, 100);

    // Send a request to OpenAI API to get the response
    let response: Response | null = null;

    try {
        response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token.value}`,
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: messages.map((message2) => ({
                    role: message2.getRole() === 'You' ? 'user' : 'assistant',
                    content: message2.getContent(),
                })),
                temperature: 0.7,
            }),
        });
    } catch (error) {

    }

    clearInterval(timer);

    loading.dataset['loading'] = 'false';
    input.disabled = false;

    if (!response?.ok) {
        // If the response is not ok, display an error message in the chat
        const errorMessage = new Message({
            role: 'AI',
            content: 'Something went wrong. Please try again.',
        });
        messages.push(errorMessage);
        addMessage(errorMessage);
        return;
    }

    const data = await response.json();

    // Extract the response message and add it to the messages
    const responseContent = data.choices[0].message.content;
    const messageMessage = new Message({ role: 'AI', content: responseContent });
    messages.push(messageMessage);
    addMessage(messageMessage);
});

// Event listener for enter key press
input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey && !event.repeat) {
        const newEvent = new Event('submit', { cancelable: true });
        // @ts-ignore good code!
        event.target!.form.dispatchEvent(newEvent);
        event.preventDefault();
    }
});

input.addEventListener('keyup', () => {
    inputSend.disabled = input.value.trim().length === 0;
})
