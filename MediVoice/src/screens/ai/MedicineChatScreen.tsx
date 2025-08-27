import React, { useState } from 'react';
import { View, Text, TextInput, Button } from 'react-native';

const MedicineChatScreen = () => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');

  // Placeholder for AI Q&A logic
  const handleAsk = () => {
    setAnswer('AI answer will appear here.');
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 16 }}>Ask About Medicines</Text>
      <TextInput
        style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 8, marginBottom: 16 }}
        placeholder="Type your question..."
        value={question}
        onChangeText={setQuestion}
      />
      <Button title="Ask" onPress={handleAsk} />
      <Text style={{ marginTop: 24 }}>{answer}</Text>
    </View>
  );
};

export default MedicineChatScreen; 