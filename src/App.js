import './App.css';
import gptlogo from './assets/chatgpt.svg';
import addBtn from './assets/add-30.png';
import msgIcon from './assets/message.svg';
import home from './assets/home.svg';
import saved from './assets/bookmark.svg';
import rocket from './assets/rocket.svg';
import sendBtn from './assets/send.svg';
import userIcon from './assets/user-icon.png';
import gptImgLogo from './assets/chatbott.png';
import axios from 'axios';
import { useState } from 'react';

function App() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      text: "Hi there! How can I help you?",
      isBot: true,
    }
  ]);

  const handleMessageSend = () => {
    if (input.trim() !== "") {
      sendMessage(input);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleMessageSend();
    }
  };

  const sendMessage = async (text) => {
    setInput("");
    const newMessages = [...messages, { text, isBot: false }];
    setMessages(newMessages);

    console.log("Sending request to Flask API with query:", text);

    try {
      const res = await axios.get('http://127.0.0.1:5000/api', {
        params: { Query: text }
      });

      console.log("Received response from Flask API:", res.data);

      setMessages(prevMessages => [
        ...prevMessages,
        { text: res.data.Answer, isBot: true }
      ]);
    } catch (error) {
      console.error('Error fetching data from Flask API', error);
    }
  }

  return (
    <div className="App">
       <div className='appbar'>
          <p>CHAT BOT</p>
        </div>
      <div className='main'>
       
        <div className='chats'>
          {messages.map((message, i) => (
            <div key={i} className={`chat ${message.isBot ? 'bot' : 'user'}`}>
              <img
                className='chatImg'
                src={message.isBot ? gptImgLogo : userIcon}
                alt={message.isBot ? "Chatbot avatar" : "User avatar"}
              />
              <p className='txt'>{message.text}</p>
            </div>
          ))}
        </div>
        <div className='chatFooter'>
          <div className='inp'>
            <input
              type='text'
              placeholder='Enter your prompt'
              value={input}
              onChange={(e) => { setInput(e.target.value) }}
              onKeyPress={handleKeyPress} // Add this line
            />
            <button className='send' onClick={handleMessageSend}>
              <img src={sendBtn} alt="Send button" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
