import React, { useState, useRef, useEffect } from 'react';

export default function Chatbot({ setbot_view, bot_view, messages, setMessages, field1, setField1 }) {
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


    const handleSendMessage = async() => {
        if (input.trim()) {
            // Add user message to the chat
            setMessages((prev) => [...prev, { sender: 'user', text: input }]);
            setInput(''); // Clear the input field
            setLoading(true); // Start the loader for AI response



            // Function to get custom quick reply
            const getCustomReply = (userInput) => {
                const lowercaseInput = userInput.toLowerCase();

                // PNR detection using regular expression
                const pnrMatch = lowercaseInput.match(/(PNR\s*\d{10}|\d{10})/i);

                // Handle PNR presence
                if (pnrMatch) {
                    const pnrNumber = pnrMatch[0].replace("PNR:", "").trim();
                    setMessages((prev) => [
                        ...prev,
                        { sender: 'bot', text: `Your PNR: ${pnrNumber}` },
                    ]);
                    setField1(pnrMatch)
                }

                // Custom quick replies based on keywords
                const quickReplies = [
                    {
                        keywords: ['complaint', 'file complaint', 'submit complaint'],
                        replies: [
                            'You can file a complaint within 30 days of the incident. Please use the "Complaint Registration" section in the app and provide all necessary details.',
                            'To file a complaint, go to the "Complaint Registration" section. Make sure to include specifics like train number, date, and nature of the issue.',
                            'Complaints can be filed for various issues including delays, hygiene, ticket problems, or safety concerns. Please provide detailed information.'
                        ]
                    },
                    {
                        keywords: ['time', 'today', 'date'],
                        replies: [
                            `Today is ${new Date().toLocaleDateString()}. How can I help you?`,
                            `The current date is ${new Date().toLocaleDateString()}. What can I do for you?`
                        ]
                    },
                    {
                        keywords: ['complaint status', 'track complaint', 'check complaint'],
                        replies: [
                            'You can track your complaint by entering the reference number in the "Track Complaint" section. The app provides real-time updates.',
                            'The railway app allows you to view the status of your complaint. Use the complaint reference number in the tracking section.',
                            'Complaints are typically addressed within 30 days. You can check the progress in real-time through the app.'
                        ]
                    },
                    {
                        keywords: ['refund', 'ticket refund', 'unused ticket'],
                        replies: [
                            'Refunds for unused tickets can be requested through the "Refunds" section. Ensure you apply within the prescribed timeframe.',
                            'To request a refund, navigate to the "Manage Tickets" section and follow the refund process. Refunds are processed as per railway cancellation policy.',
                            'Refund eligibility depends on the type of ticket and time of cancellation. Check the app\'s refund guidelines for specific details.'
                        ]
                    },
                    {
                        keywords: ['emergency', 'help', 'sos'],
                        replies: [
                            'In case of emergency, use the "Emergency SOS" button in the app to immediately alert railway authorities. Helpline numbers are also provided.',
                            'For urgent assistance, use the live chat feature or press the emergency communication button. Safety is our top priority.',
                            'Railway stations are equipped with safety systems. If you feel unsafe, use the app\'s security section to report concerns.'
                        ]
                    },
                    {
                        keywords: ['ticket', 'booking', 'book ticket'],
                        replies: [
                            'You can book tickets between 12:20 AM and 11:45 PM. Max booking is 6 tickets per month per verified IRCTC user.',
                            'Booking options include Confirmed, RAC, and Waiting tickets. Different quotas are available including General, Ladies, Senior Citizen, and Tatkal.',
                            'Booking requires a valid ID proof. Acceptable IDs include Passport, Voter ID, Driving License, or PAN Card.'
                        ]
                    },
                    {
                        keywords: ['lost', 'luggage', 'lost property'],
                        replies: [
                            'File a lost property complaint through the app under the "Lost Luggage" section. Provide train number, date, and a detailed description of the luggage.',
                            'If you\'ve lost something on a train or at a station, use the app\'s lost property complaint feature with specific details.',
                            'Luggage allowance varies by class. Excess luggage can be booked in the luggage van for an additional fee.'
                        ]
                    },
                    {
                        keywords: ['contact', 'support', 'help'],
                        replies: [
                            `Customer Support: 24x7 Helpline at 0755-3934141, 0755-6610661\nEmail: care@irctc.co.in`,
                            'For any queries, contact our 24x7 customer support at 0755-3934141 or email care@irctc.co.in',
                            'Need help? Reach out to our customer support team through the app\'s help center or contact 0755-3934141.'
                        ]
                    }
                ];

                // Find matching quick replies
                for (const replySet of quickReplies) {
                    if (replySet.keywords.some(keyword => lowercaseInput.includes(keyword))) {
                        // Randomly select a reply from the matching set
                        return replySet.replies[Math.floor(Math.random() * replySet.replies.length)];
                    }
                }

                // Default response if no custom reply is found
                return ;
            };

            // Simulate a bot response with custom quick replies
            setTimeout(() => {
                const botReply = getCustomReply(input);
                setMessages((prev) => [
                    ...prev,
                    { sender: 'bot', text: botReply },
                ]);
                setLoading(false); // Stop the loader after response
            }, 2000); // Simulate delay

            try {
                // Fetch API logic
                const response = await fetch("http://127.0.0.1:1010/railbot", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ text: input }),
                });
    
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
    
                const data = await response.json();
    
                // Handle API response
                setMessages((prev) => [
                    ...prev,
                    { sender: 'bot', text: data.railBot || getCustomReply(input) },
                ]);
            } catch (error) {
                console.error("Error fetching API:", error);
                setMessages((prev) => [
                    ...prev,
                    { sender: 'bot', text: "Sorry, I couldn't process your request. Please try again later." },
                ]);
            } finally {
                setLoading(false); // Stop the loader after response
            }
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
                    { sender: 'bot', text: '' },
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
                                style={{ width: "200px" }}
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













