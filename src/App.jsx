import { useState } from 'react'
import reactLogo from './assets/react.svg' 
import './App.css' 
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';  
import {MainContainer, ChatContainer, MessageList, Message, MessageInput, TypingIndicator } from "@chatscope/chat-ui-kit-react" 

const API_KEY = import.meta.env.VITE_OPENAI_API_KEY; 

function App() { 
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState([
    {
      message: "Hello, I am Sonny!", 
      sender: "Sonny",
      direction: "incoming"
    }
  ]) 

  const handleSend = async (message) => { 
    const newMessage = {
      message: message, 
      sender: "user",
      direction: "outgoing"
    }   

    const newMessages = [...messages, newMessage]; // all old messages + new message 

    //update messages state  
    setMessages(newMessages);

    //set a typing indicator (Sonny is typing) 
    setTyping(true); 

    //process message to chatGPT (send to GPT api and see response)  
    await processMessagetoChatGPT(newMessages);
  } 

  async function processMessagetoChatGPT(chatMessages){ 

    let apiMessages = chatMessages.map((messageObject) => {
      let role = "";
      if(messageObject.sender == "Sonny"){
        role = "assistant"
      } 
      else{
        role = "user"
      }
      return { role: role, content: messageObject.message }
    })  

    //role: "user" -> message from user, "assistant" -> response from GPT 
    //"system" -> generally one initial message defining how we want GPT to talk 

    const systemMessage = {
      role: "system",
      content: "You are named Sonny. Sonny is a supportive, empathetic, and knowledgeable assistant designed to help Wellness Coordinators (WCs) effectively communicate with students. Sonny's tone is warm, approachable, and reassuring, while maintaining professionalism and clarity. The goal is to ensure a consistent and cohesive chat experience across all interactions, regardless of which WC is responding. You want to provide support when you can and create a natural conversation with the user."
    }



    const apiRequestBody = {
      "model": "gpt-3.5-turbo",
      "messages": [  
        systemMessage,
        ...apiMessages // [message1, message2, message3]
      ]
    }

    await fetch ("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization" : "Bearer " + API_KEY,
        "Content-Type" : "application/json"
      },
      body: JSON.stringify(apiRequestBody)
    }).then((data) => {
      return data.json();
    }).then((data) => {
      console.log(data); 
      console.log(data.choices[0].message.content); 
      setMessages(
        [...chatMessages,{
          message: data.choices[0].message.content,
          sender: "Sonny",
          direction: "incoming"
        }]
      );
      setTyping(false);
      
      
    });

  }

  return ( 

      <div className = "App">   
     


        <div style = {{position: "relative", height: "800px", width: "650px"}}>
          <MainContainer>
            <ChatContainer> 
              <MessageList   
              scrollBehavior = 'smooth'
              typingIndicator={typing ? <TypingIndicator content = "Sonny is typing" /> : null}> 

                {messages.map((message, i) => {
                  return <Message key = {i} model = {message} />
                })}
              </MessageList> 
              <MessageInput placeholder="Type message here" onSend={handleSend} />
            </ChatContainer> 
          </MainContainer>
        </div>
      </div>
     
  )
}

export default App; 