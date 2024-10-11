// src/Chat.js
import React, { useState } from 'react';
import {
  Container,
  TextField,
  Button,
  Typography,
  Paper,
  AppBar,
  Toolbar,
  IconButton,
  Card,
  CardContent,
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Nightlight as NightlightIcon, WbSunny as SunIcon } from '@mui/icons-material';

const Chat = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
    },
  });

  const handleSend = async () => {
    if (!input) return;

    // Add user message
    setMessages((prev) => [...prev, { text: input, type: 'user' }]);

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=AIzaSyA49eQm9wPtbQwvl7fx-JFVn2hjjyPXaS8`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: input, // Using the user input as the text
                },
              ],
            },
          ],
        }),
      });

      if (!response.ok) {
        console.error('Error:', response.status, await response.text());
        return;
      }

      const data = await response.json();
      console.log('API Response:', data); // Log the data

      // Add Gemini response message
      if (data.candidates && data.candidates.length > 0 && data.candidates[0].content.parts.length > 0) {
        setMessages((prev) => [
          ...prev,
          { text: data.candidates[0].content.parts[0].text.trim(), type: 'gpt' }, // API response
        ]);
      } else {
        console.error('No content returned from API');
      }
    } catch (error) {
      console.error('Error fetching data from API:', error);
    } finally {
      setInput('');
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Paper style={{ height: '100vh', padding: '16px' }}>
        <AppBar position="static" style={{ backgroundColor: darkMode ? '#333' : '#1976d2', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', maxWidth: '94%', margin: '0 auto' }}>
          <Toolbar>
            <Typography variant="h6" style={{ flexGrow: 1, fontWeight: 'bold' }}>Chat Assistant</Typography>
            <IconButton onClick={() => setDarkMode(!darkMode)}>
              {darkMode ? <SunIcon /> : <NightlightIcon />}
            </IconButton>
          </Toolbar>
        </AppBar>
        <Container style={{ marginTop: '16px', height: '80%', display: 'flex', flexDirection: 'column' }}>
          <Card style={{ flexGrow: 1, overflowY: 'auto', marginBottom: '16px' }}>
            <CardContent>
              {messages.map((msg, index) => (
                <div key={index} style={{ display: 'flex', justifyContent: msg.type === 'user' ? 'flex-start' : 'flex-end' }}>
                  <Typography
                    style={{
                      backgroundColor: msg.type === 'user' ? '#e0e0e0' : '#1976d2', // Different background colors for user and GPT messages
                      color: msg.type === 'user' ? 'black' : 'white', // Text color based on the message type
                      borderRadius: '20px',
                      padding: '8px 12px',
                      margin: '4px 0',
                      maxWidth: msg.type === 'gpt' ? '75%' : '25%',
                      wordWrap: 'break-word',
                    }}
                    variant="body2"
                  >
                    {msg.text}
                  </Typography>
                </div>
              ))}
            </CardContent>
          </Card>
          <div style={{ display: 'flex' }}>
            <TextField
              variant="outlined"
              size="small"
              fullWidth
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              style={{ marginRight: '8px' }}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()} // Send on Enter key

            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleSend}
              size="small"
            >
              Send
            </Button>
          </div>
        </Container>
      </Paper>
    </ThemeProvider>
  );
};

export default Chat;
