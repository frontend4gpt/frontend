const messagesContainer = document.getElementById('messages');
const inputContainer = document.getElementById('input-container');
const input = document.getElementById('input');
const loading = document.getElementById('loading');
const loadingTime = document.getElementById('loading-time');
const token = document.getElementById('token');

// Message history
const messages = [];

// Input magic
const updateInputHeight = () => {
    input.style.height = 0;
    input.style.height = `${input.scrollHeight}px`;
};

input.addEventListener('input', updateInputHeight, false);

// Function to create a new message element
const createMessageElement = (message) => {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');

    const usernameElement = document.createElement('div');
    usernameElement.classList.add('username');
    usernameElement.innerText = message.role;

    const textElement = document.createElement('p');
    textElement.classList.add('content');
    textElement.innerText = message.content;

    messageElement.appendChild(usernameElement);
    messageElement.appendChild(textElement);

    return messageElement;
};

// Function to add a new message to the messages container
const addMessage = (message) => {
    const messageElement = createMessageElement(message);
    messagesContainer.appendChild(messageElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
};

// Event listener for send button
inputContainer.addEventListener('submit', async (event) => {
    event.preventDefault();

    const content = input.value.trim();

    // Check if the input field has a non-empty value
    if (content.length === 0) {
        return;
    }

    input.value = '';
    updateInputHeight();
    loading.dataset.loading = true;

    const message = { role: 'You', content: content };
    messages.push(message);
    addMessage(message);

    const start = Date.now();
    const timer = setInterval(() => {
        loadingTime.textContent = String(((Date.now() - start) / 1000).toFixed(1));
    }, 100);

    // Send a request to OpenAI API to get the response
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token.value}`,
        },
        body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: messages.map((message2) => ({
                role: message2.role === 'You' ? 'user' : 'assistant',
                content: message2.content,
            })),
            temperature: 0.7,
        }),
    });

    clearInterval(timer);

    loading.dataset.loading = false;

    if (!response.ok) {
        // If the response is not ok, display an error message in the chat
        const errorMessage = { role: 'AI', content: 'Something went wrong. Please try again.' };
        messages.push(errorMessage);
        addMessage(errorMessage);
        return;
    }

    const data = await response.json();

    // Extract the response message and add it to the messages
    const responseMessage = data.choices[0].message.content;
    messages.push({ role: 'AI', content: responseMessage });
    addMessage({ role: 'AI', content: responseMessage });
});

// Event listener for enter key press
input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey && !event.repeat) {
        const newEvent = new Event('submit', { cancelable: true });
        event.target.form.dispatchEvent(newEvent);
        event.preventDefault();
    }
});
