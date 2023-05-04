import React, { useState } from 'react';
import { GiftedChat, Bubble, InputToolbar, Send } from 'react-native-gifted-chat';
import { TouchableOpacity, Text } from 'react-native';


export default function ChatScreen() {
  const [messages, setMessages] = useState([]);

  const onSend = (newMessages = []) => {
    setMessages(previousMessages => GiftedChat.append(previousMessages, newMessages));

    // Simulate a response by copying the sent message
    setTimeout(() => {
      const copiedMessage = {
        ...newMessages[0],
        _id: Math.round(Math.random() * 1000000),
        createdAt: new Date(),
        user: {
          _id: 2,
          name: 'Bot',
        },
      };
      setMessages(previousMessages => GiftedChat.append(previousMessages, copiedMessage));
    }, 1000);
  };

  return (
    <GiftedChat
      messages={messages}
      onSend={newMessages => onSend(newMessages)}
      user={{
        _id: 1,
      }}
      listViewProps={{
        style: {
          backgroundColor: '#ececec', // Set the background color of the message list
        },
      }}
      renderBubble={props => {
        return (
          <Bubble
            {...props}
            wrapperStyle={{
              left: { backgroundColor: '#ffffff' }, // Style for received messages
              right: { backgroundColor: '#2f4f4f' }, // Style for sent messages
            }}
            textStyle={{
              left: { color: '#3a3a3a' }, // Text color for received messages
              right: { color: '#ffffff' }, // Text color for sent messages
            }}
          />
        );
      }}
      renderInputToolbar={props => (
        <InputToolbar
          {...props}
          containerStyle={{
            backgroundColor: '#ffffff', // Set the background color of the input toolbar
            }}
        />
      )}
      renderSend={props => (
        <Send {...props}>
          <TouchableOpacity
            style={{
              backgroundColor: '#2f4f4f',
              paddingHorizontal: 10,
              paddingVertical: 5,
              borderRadius: 20,
              marginRight: 10,
              marginBottom: 10,
            }}
            onPress={() => {
              props.onSend({ text: props.text.trim() }, true);
            }}
          >
            <Text style={{ color: '#ffffff' }}>Send</Text>
          </TouchableOpacity>
        </Send>
      )}
    />
  );
}
