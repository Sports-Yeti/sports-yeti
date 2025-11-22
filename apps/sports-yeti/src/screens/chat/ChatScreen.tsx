import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { HomeStackParamList, ChatMessage, ChatPoll } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import {
  getChatById,
  getMessagesByChat,
  getPollsByChat,
} from '../../mocks/data';
import Button from '../../components/common/Button';

type ChatScreenNavigationProp = StackNavigationProp<
  HomeStackParamList,
  'HomeScreen'
>;
type ChatScreenRouteProp = RouteProp<HomeStackParamList, 'HomeScreen'>;

interface Props {
  navigation: ChatScreenNavigationProp;
  route: ChatScreenRouteProp & { params: { chatId: string } };
}

const ChatScreen: React.FC<Props> = ({ navigation, route }) => {
  const { user } = useAuth();
  const { chatId } = route.params;
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [polls, setPolls] = useState<ChatPoll[]>([]);
  const [showPollModal, setShowPollModal] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    // Load chat messages
    const chatMessages = getMessagesByChat(chatId);
    const chatPolls = getPollsByChat(chatId);
    setMessages(chatMessages);
    setPolls(chatPolls);
  }, [chatId]);

  const handleSendMessage = () => {
    if (!message.trim() || !user) return;

    // TODO: Implement actual message sending API call
    const newMessage: ChatMessage = {
      id: `message-${Date.now()}`,
      chatId,
      userId: user.id,
      message: message.trim(),
      messageType: 'text',
      createdAt: new Date().toISOString(),
      user,
    };

    setMessages([...messages, newMessage]);
    setMessage('');

    // Scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleCreatePoll = () => {
    setShowPollModal(true);
    // TODO: Implement poll creation modal
  };

  const handleVotePoll = (pollId: string, optionId: string) => {
    // TODO: Implement poll voting
    console.log('Voting on poll:', pollId, 'option:', optionId);
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isMyMessage = item.userId === user?.id;

    return (
      <View
        style={[
          styles.messageContainer,
          isMyMessage
            ? styles.myMessageContainer
            : styles.otherMessageContainer,
        ]}
      >
        {!isMyMessage && (
          <Image
            source={{ uri: item.user.avatar }}
            style={styles.messageAvatar}
          />
        )}

        <View
          style={[
            styles.messageBubble,
            isMyMessage ? styles.myMessageBubble : styles.otherMessageBubble,
          ]}
        >
          {!isMyMessage && (
            <Text style={styles.messageSender}>
              {item.user.firstName} {item.user.lastName}
            </Text>
          )}
          <Text
            style={[
              styles.messageText,
              isMyMessage ? styles.myMessageText : styles.otherMessageText,
            ]}
          >
            {item.message}
          </Text>
          <Text
            style={[
              styles.messageTime,
              isMyMessage ? styles.myMessageTime : styles.otherMessageTime,
            ]}
          >
            {new Date(item.createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>

        {isMyMessage && <View style={styles.myMessageAvatarPlaceholder} />}
      </View>
    );
  };

  const renderPoll = ({ item }: { item: ChatPoll }) => (
    <View style={styles.pollContainer}>
      <Text style={styles.pollQuestion}>{item.question}</Text>
      <View style={styles.pollOptions}>
        {item.options.map((option) => {
          const totalVotes = item.votes.length;
          const percentage =
            totalVotes > 0 ? (option.voteCount / totalVotes) * 100 : 0;
          const hasVoted = item.votes.some(
            (vote) => vote.userId === user?.id && vote.optionId === option.id
          );

          return (
            <TouchableOpacity
              key={option.id}
              style={[styles.pollOption, hasVoted && styles.pollOptionVoted]}
              onPress={() => handleVotePoll(item.id, option.id)}
            >
              <View style={styles.pollOptionContent}>
                <Text style={styles.pollOptionText}>{option.text}</Text>
                <Text style={styles.pollOptionPercentage}>
                  {percentage.toFixed(0)}%
                </Text>
              </View>
              <View
                style={[styles.pollProgressBar, { width: `${percentage}%` }]}
              />
            </TouchableOpacity>
          );
        })}
      </View>
      <Text style={styles.pollFooter}>
        {item.votes.length} vote{item.votes.length !== 1 ? 's' : ''}
      </Text>
    </View>
  );

  const chat = getChatById(chatId);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Chat Header */}
        <View style={styles.chatHeader}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>←</Text>
          </TouchableOpacity>
          <View style={styles.chatHeaderContent}>
            <Text style={styles.chatTitle}>
              {chat?.type === 'game' ? 'Game Chat' : 'Team Chat'}
            </Text>
            <Text style={styles.chatSubtitle}>
              {chat?.participants.length} participants
            </Text>
          </View>
          <TouchableOpacity onPress={handleCreatePoll}>
            <Text style={styles.pollButton}>📊</Text>
          </TouchableOpacity>
        </View>

        {/* Messages List */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={() => (
            <>
              {polls.map((poll) => (
                <View key={poll.id}>{renderPoll({ item: poll })}</View>
              ))}
            </>
          )}
        />

        {/* Message Input */}
        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.attachButton}>
            <Text style={styles.attachButtonText}>📎</Text>
          </TouchableOpacity>

          <TextInput
            style={styles.messageInput}
            placeholder="Type a message..."
            value={message}
            onChangeText={setMessage}
            multiline
            maxLength={500}
            placeholderTextColor="#8E8E93"
          />

          <TouchableOpacity
            style={[
              styles.sendButton,
              !message.trim() && styles.sendButtonDisabled,
            ]}
            onPress={handleSendMessage}
            disabled={!message.trim()}
          >
            <Text style={styles.sendButtonText}>➤</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  backButton: {
    fontSize: 24,
    color: '#007AFF',
    marginRight: 12,
  },
  chatHeaderContent: {
    flex: 1,
  },
  chatTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
  },
  chatSubtitle: {
    fontSize: 12,
    color: '#6c757d',
  },
  pollButton: {
    fontSize: 24,
    color: '#007AFF',
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-end',
  },
  myMessageContainer: {
    justifyContent: 'flex-end',
  },
  otherMessageContainer: {
    justifyContent: 'flex-start',
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  myMessageAvatarPlaceholder: {
    width: 32,
    marginLeft: 8,
  },
  messageBubble: {
    maxWidth: '70%',
    borderRadius: 16,
    padding: 12,
  },
  myMessageBubble: {
    backgroundColor: '#007AFF',
    borderBottomRightRadius: 4,
  },
  otherMessageBubble: {
    backgroundColor: '#e9ecef',
    borderBottomLeftRadius: 4,
  },
  messageSender: {
    fontSize: 12,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  myMessageText: {
    color: '#ffffff',
  },
  otherMessageText: {
    color: '#212529',
  },
  messageTime: {
    fontSize: 10,
  },
  myMessageTime: {
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'right',
  },
  otherMessageTime: {
    color: '#6c757d',
  },
  pollContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  pollQuestion: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 12,
  },
  pollOptions: {
    gap: 8,
  },
  pollOption: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
    overflow: 'hidden',
    position: 'relative',
  },
  pollOptionVoted: {
    borderColor: '#007AFF',
  },
  pollOptionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    zIndex: 1,
  },
  pollOptionText: {
    fontSize: 14,
    color: '#212529',
  },
  pollOptionPercentage: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  pollProgressBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#e3f2fd',
    zIndex: 0,
  },
  pollFooter: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: 8,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    gap: 8,
  },
  attachButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 18,
    backgroundColor: '#f8f9fa',
  },
  attachButtonText: {
    fontSize: 20,
  },
  messageInput: {
    flex: 1,
    maxHeight: 100,
    minHeight: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#e9ecef',
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 16,
    color: '#212529',
    backgroundColor: '#f8f9fa',
  },
  sendButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 18,
    backgroundColor: '#007AFF',
  },
  sendButtonDisabled: {
    backgroundColor: '#8E8E93',
    opacity: 0.5,
  },
  sendButtonText: {
    fontSize: 20,
    color: '#ffffff',
  },
});

export default ChatScreen;
