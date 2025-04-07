import React, { useState, useRef, useEffect } from 'react';

export default function Chatbot({ setbot_view, bot_view, messages, setMessages, field1, field2, field3 }) {
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false); // Track if the AI is "thinking"
    const chatScreenRef = useRef(null); // Reference to the chat_screen div
    const fileInputRef = useRef(null); // Reference to the hidden file input

    // Scroll to the bottom whenever messages change
    

    useEffect(() => {
        if (chatScreenRef.current) {
            chatScreenRef.current.scrollTop = chatScreenRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = () => {
        if (input.trim()) {
            setMessages((prev) => [...prev, { sender: 'user', text: input }]);
            setInput(''); // Clear the input field
            setLoading(true); // Start the loader for AI response

            // Simulate a bot response
            setTimeout(() => {
                setMessages((prev) => [
                    ...prev,
                    { sender: 'bot', text: 'Hi, how can I help you?' },
                ]);
                setLoading(false); // Stop the loader after response
            }, 1000); // Simulate delay
        }
    };

    const handleImageClick = () => {
        // Trigger the file input click
        fileInputRef.current.click();
    };

    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setMessages((prev) => [
                    ...prev,
                    { sender: 'user', image: reader.result },
                ]);
            };
            reader.readAsDataURL(file);
            setTimeout(() => {
                setMessages((prev) => [
                    ...prev,
                    { sender: 'bot', text: 'Woah Man, Let me Breath ! This is out of my Experties 💀' },
                ]);
                setLoading(false); // Stop the loader after response
            }, 1000);
        }
    };

    return (
        <div className='chat_main'>
            <i className="fa-solid fa-xmark" onClick={() => setbot_view(!bot_view)}></i>

            <div className="chat_screen" ref={chatScreenRef}>
                {messages.map((msg, index) => (
                    <div key={index} className={msg.sender === 'user' ? 'client_msg' : 'chat_bot_msg'}>
                        {msg.sender === 'bot' && <i className="fa-solid fa-robot inchat"></i>}
                        {msg.image ? (
                            <img
                                src={msg.image}
                                alt="Uploaded"
                                className="uploaded_image"
                                style={{width:"200px"}}
                            />
                        ) : (
                            <p className={msg.sender === 'user' ? 'client_msg_body' : 'chat_bot_msg_body'}>
                                {msg.text}
                            </p>
                        )}
                        {msg.sender === 'user' && <i className="fa-regular fa-user inchat"></i>}
                    </div>
                ))}

                {/* Show loader when waiting for bot response */}
                {loading && (
                    <div className="chat_bot_msg">
                        <i className="fa-solid fa-robot inchat"></i>
                        <p className="chat_bot_msg_body">Thinking...</p>
                    </div>
                )}
            </div>

            <div className="input_fixed">
                <div className="img_up" onClick={handleImageClick}>
                    <i className="fa-solid fa-plus"></i>
                    {/* Hidden file input */}
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                    />
                </div>
                <input
                    className="input_field"
                    type="text"
                    placeholder="Ask Me Anything..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()} // Send on Enter key press
                />
                <button className="btn_send" type="button" onClick={handleSendMessage}>
                    <i className="fa-solid fa-paper-plane"></i>
                </button>
            </div>
        </div>
    );
}
