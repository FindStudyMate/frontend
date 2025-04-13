import React, { Component } from "react";
import "./Chat.css";



class Chat extends Component {
  constructor(props) {
    super(props);
    this.state = {
      messages: [],
      input: "",
      fakeIndex: 0
    };
    this.messagesEndRef = React.createRef();
  }

  

  scrollToBottom = () => {
    if (this.messagesEndRef.current) {
      this.messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  componentDidUpdate() {
    this.scrollToBottom();
  }

  setDate = () => {
    const now = new Date();
    return now.getHours() + ":" + String(now.getMinutes()).padStart(2, '0');
  };

  insertMessage = () => {
    const msg = this.state.input.trim();
    if (!msg) return;
    this.setState(
      prevState => ({
        messages: [...prevState.messages, { text: msg, personal: true }],
        input: ""
      }),
      () => 
    );
  };

  

    const loadingMessage = { text: "", loading: true };
    this.setState(
      prevState => ({ messages: [...prevState.messages, loadingMessage] }),
      () => {
        setTimeout(() => {
          this.setState(prevState => {
            const updatedMessages = [...prevState.messages];
            updatedMessages.pop();
            updatedMessages.push({
              text: ,
              avatar: true,
              timestamp: this.setDate()
            });
            return {
              messages: updatedMessages
            };
          });
        }, 1500);
      }
    );
  };

  handleKeyPress = e => {
    if (e.key === "Enter") {
      e.preventDefault();
      this.insertMessage();
    }
  };

  render() {
    return (
      <>
        <div className="chat">
          <div className="chat-title">
            <h1>Fabio Ottaviani</h1>
            <h2>Supah</h2>
            <figure className="avatar">
              <img
                src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/156381/profile/profile-80.jpg"
                alt="Avatar"
              />
            </figure>
          </div>
          <div className="messages">
            <div className="messages-content">
              {this.state.messages.map((msg, index) => (
                <div
                  key={index}
                  className={`message ${
                    msg.personal ? "message-personal" : ""
                  } ${msg.loading ? "loading" : "new"}`}
                >
                  {msg.avatar && (
                    <figure className="avatar">
                      <img
                        src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/156381/profile/profile-80.jpg"
                        alt="Avatar"
                      />
                    </figure>
                  )}
                  {msg.loading ? <span></span> : msg.text}
                  {msg.timestamp && (
                    <div className="timestamp">{msg.timestamp}</div>
                  )}
                </div>
              ))}
              <div ref={this.messagesEndRef}></div>
            </div>
          </div>
          <div className="message-box">
            <textarea
              type="text"
              className="message-input"
              placeholder="Type message..."
              value={this.state.input}
              onChange={e => this.setState({ input: e.target.value })}
              onKeyDown={this.handleKeyPress}
            ></textarea>
            <button
              type="submit"
              className="message-submit"
              onClick={this.insertMessage}
            >
              Send
            </button>
          </div>
        </div>
      </>
    );
  }
}

export default Chat;
