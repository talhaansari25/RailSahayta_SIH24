import { useEffect, useState } from 'react'

import './App.css'

import Chatbot from './components/Chatbot'

function App() {
  const [bot_view, setbot_view] = useState(false);
  const [messages, setMessages] = useState([]);
  const [showPopUp, setShowPopUp] = useState(false);
  const [popUpMessage, setPopUpMessage] = useState("");

  const [field1, setField1] = useState("")
  const [field2, setField2] = useState("")
  const [field3, setField3] = useState("")

  const handleSubmit = (event) => {
    event.preventDefault();
    if (field1 == "" || field2 == "" || field3 == "") {
      setPopUpMessage(field1 == "" ? "⚠️ field1 👀" : (field2 == "" ? "⚠️field2 😎" : (field3 == "" ? "⚠️field3 😆" : "")))
      setShowPopUp(true)
    } else {
      setShowPopUp(true)
      setPopUpMessage("Good Hooman ! 😏")
      setTimeout(() => {
        setShowPopUp(false)
      }, 3000);
    }
  };

  return (
    <div>

      {!bot_view ? <form
        onSubmit={handleSubmit}
        style={{
          backgroundColor: "#f2f2f2",
          padding: "20px",
          borderRadius: "8px",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          maxWidth: "400px",
          margin: "0 auto",
          fontFamily: "Arial, sans-serif",
          marginTop: "100px",

        }}
      >
        <label style={{ display: "block", marginBottom: "10px" }}>
          <span
            style={{
              display: "inline-block",
              fontWeight: "bold",
              marginBottom: "5px",
              color: "#333",
            }}
          >
            Something something.. 👀
          </span>
          <input
            type="text"
            name="name"
            onChange={(e) => setField1(e.target.value)}
            style={{
              width: "100%",
              padding: "8px",
              borderRadius: "4px",
              border: "1px solid #ccc",
              marginTop: "5px",
            }}
          />
        </label>

        <label style={{ display: "block", marginBottom: "10px" }}>
          <span
            style={{
              display: "inline-block",
              fontWeight: "bold",
              marginBottom: "5px",
              color: "#333",
            }}
          >
            Nothing nothing 😎
          </span>
          <input
            type="text"
            name="name"
            onChange={(e) => setField2(e.target.value)}
            style={{
              width: "100%",
              padding: "8px",
              borderRadius: "4px",
              border: "1px solid #ccc",
              marginTop: "5px",
            }}
          />
        </label>

        <label style={{ display: "block", marginBottom: "10px" }}>
          <span
            style={{
              display: "inline-block",
              fontWeight: "bold",
              marginBottom: "5px",
              color: "#333",
            }}
          >
            Hahahahahaahahahaaaaaaaaa 😆
          </span>
          <input
            type="text"
            name="name"
            onChange={(e) => setField3(e.target.value)}
            style={{
              width: "100%",
              padding: "8px",
              borderRadius: "4px",
              border: "1px solid #ccc",
              marginTop: "5px",
            }}
          />
        </label>

        <button
          type="submit"
          style={{
            backgroundColor: "#4CAF50",
            color: "white",
            padding: "10px 20px",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Submit
        </button>
      </form>
        : ''}

      {bot_view ? <Chatbot setbot_view={setbot_view} bot_view={bot_view} messages={messages} setMessages={setMessages} field1={field1} field2={field2} field3={field3} /> : ''}

      <button className='bot_button' onClick={() => {
        setbot_view(!bot_view)
        setShowPopUp(false)
        setMessages((prev) => [
          ...prev,
          { sender: 'bot', text: field1 + " "+ field2 +" "+ field3 },
        ]);
      }}>
        <i className="fa-solid fa-robot"></i>
        {showPopUp ? <div className="popUp">
          {popUpMessage} ...
        </div> : ""}
      </button>
    </div>
  )
}

export default App
