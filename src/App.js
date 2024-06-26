import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {FaDelete,FaEdit} from 'react-icons';
import addBtn from './assets/add-30.png';
import editIcon from './assets/bookmark.svg';
import deleteIcon from './assets/rocket.svg';
import sendBtn from './assets/send.svg';
import userIcon from './assets/user-icon.png';
import gptImgLogo from './assets/logoooo.png';
import moment from 'moment';
import './App.css';

function App() {
  const [input, setInput] = useState("");
  const [chatSessions, setChatSessions] = useState(() => {
    const storedSessions = localStorage.getItem('chatSessions');
    return storedSessions ? JSON.parse(storedSessions) : [{ id: 1, name: 'Chat 1', messages: [{ text: "Hi there! How can I help you?", isBot: true }] }];
  });
  const [activeSessionId, setActiveSessionId] = useState(chatSessions[0]?.id || null);
  const [editingSessionId, setEditingSessionId] = useState(null);
  const [editedName, setEditedName] = useState("");

  useEffect(() => {
    localStorage.setItem('chatSessions', JSON.stringify(chatSessions));
  }, [chatSessions]);

  const activeSession = chatSessions.find(session => session.id === activeSessionId);

  const handleNewChat = () => {
    const newSessionId = chatSessions.length + 1;
    const newSession = {
      id: newSessionId,
      name: `Chat ${newSessionId}`,
      messages: [{ text: "Hi there! How can I help you?", isBot: true }]
    };
    setChatSessions([...chatSessions, newSession]);
    setActiveSessionId(newSessionId);
  };

  const handleDeleteChat = (id) => {
    const updatedSessions = chatSessions.filter(session => session.id !== id);
    setChatSessions(updatedSessions);
    if (id === activeSessionId && updatedSessions.length > 0) {
      setActiveSessionId(updatedSessions[0].id);
    } else if (updatedSessions.length === 0) {
      setActiveSessionId(null);
    }
  };

  const handleEditChat = (id) => {
    setEditingSessionId(id);
    const sessionToEdit = chatSessions.find(session => session.id === id);
    setEditedName(sessionToEdit.name);
  };

  const handleSaveEdit = () => {
    const updatedSessions = chatSessions.map(session =>
      session.id === editingSessionId ? { ...session, name: editedName } : session
    );
    setChatSessions(updatedSessions);
    setEditingSessionId(null);
  };

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
  const handleClearStorage = () => {
    localStorage.clear();
    setChatSessions([]);
    setActiveSessionId(null);
    alert('Local storage has been cleared!');
  };
  
  const sendMessage = async (text) => {
    if (!activeSession) return;

    setInput("");
    const newMessages = [...activeSession.messages, { text, isBot: false }];
    const updatedSession = { ...activeSession, messages: newMessages };

    setChatSessions(chatSessions.map(session =>
      session.id === activeSessionId ? updatedSession : session
    ));

    console.log("Sending request to Flask API with query:", text);

    try {
      const res = await axios.get('http://127.0.0.1:5000/api', {
        params: { Query: text }
      });

      console.log("Received response from Flask API:", res.data);

      const botMessage = { text: res.data.Answer, isBot: true };
      const updatedSessionWithBotMessage = {
        ...updatedSession,
        messages: [...newMessages, botMessage]
      };

      setChatSessions(chatSessions.map(session =>
        session.id === activeSessionId ? updatedSessionWithBotMessage : session
      ));
    } catch (error) {
      console.error('Error fetching data from Flask API', error);
    }
  };

  return (
    <div className="App">
      <div className='sideBar scrollbar'>
    <div className='sidebarContent'>
        <div className='upperSide'>
            <div className='upperSideTop'>
                <img src={gptImgLogo} className='logo' /><span className='brand'>ChatBot</span>
            </div>
            <button className='midBtn' onClick={handleNewChat}>
                <img src={addBtn} className='addBtn' alt="Add button" />New Chat
            </button>
            <button className='clearBtn' onClick={handleClearStorage}>
                Clear Storage
            </button>
            <div className="chatTabs">
                {chatSessions.map(session => (
                    <div
                        key={session.id}
                        className={`chatTab ${session.id === activeSessionId ? 'active' : ''}`}
                        onClick={() => setActiveSessionId(session.id)}
                    >
                        {session.id === editingSessionId ? (
                            <input
                                type="text"
                                value={editedName}
                                onChange={(e) => setEditedName(e.target.value)}
                                onBlur={handleSaveEdit}
                                onKeyPress={(e) => {
                                    if (e.key === "Enter") {
                                        handleSaveEdit();
                                    }
                                }}
                                autoFocus
                            />
                        ) : (
                            session.name
                        )}
                            <div className='sessionDate'>
                               {moment(session.created_at).calendar(null, {
                                    sameDay: '[Today]',
                                    lastDay: '[Yesterday]',
                                    lastWeek: '[Last] dddd',
                                     sameElse: 'MMMM Do YYYY',
                                   })}
                            </div>
{/* 
                        <button className="edit-btn" onClick={(e) => { e.stopPropagation(); handleEditChat(session.id); }}>
                            <img src={editIcon} alt="Edit" />
                        </button>
                        <button className="delete-btn" onClick={(e) => { e.stopPropagation(); handleDeleteChat(session.id); }}>
                            <img src={deleteIcon} alt="Delete" />
                            
                        </button> */}
                        <button className="edit-btn" onClick={(e) => { e.stopPropagation(); handleEditChat(session.id); }}><i class="fa-solid fa-pen-to-square fa-lg"></i></button>
                       <button className="delete-btn" onClick={(e) => { e.stopPropagation(); handleDeleteChat(session.id); }}><i class="fa-solid fa-trash fa-lg"></i></button> 
                    </div>
                ))}
            </div>
        </div>
    </div>
</div>
      <div className='main scrollbar'>
        <div className='chats'>
          {activeSession ? (
            activeSession.messages.map((message, i) => (
              <div key={i} className={`chat ${message.isBot ? 'bot' : 'user'}`}>
                <img
                  className='chatImg'
                  src={message.isBot ? gptImgLogo : userIcon}
                  alt={message.isBot ? "Chatbot avatar" : "User avatar"}
                />
                <p className='txt'>{message.text}</p>
              </div>
            ))
          ) : (
            <p>No active chat session</p>
          )}
        </div>
        <div className='chatFooter'>
          <div className='inp'>
            <input
              type='text'
              placeholder='Enter your prompt'
              value={input}
              onChange={(e) => { setInput(e.target.value) }}
              onKeyPress={handleKeyPress}
              disabled={!activeSession}
            />
            <button className='send' onClick={handleMessageSend} disabled={!activeSession}>
              <img src={sendBtn} alt="Send button" />
            </button>
          </div>
          <p>This ChatBot is now in trial phase</p>
        </div>
      </div>
    </div>
  );
}

export default App;
