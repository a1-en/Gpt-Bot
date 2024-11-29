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
  Avatar,
  Box,
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Nightlight as NightlightIcon, WbSunny as SunIcon } from '@mui/icons-material';

const Chat = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false); // Add loading state

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
    },
  });

  const handleSend = async () => {
    if (!input) return;

    // Add user message
    setMessages((prev) => [...prev, { text: input, type: 'user' }]);
    setInput('');
    setLoading(true); // Set loading to true when the API call starts

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.REACT_APP_GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: input,
                },
              ],
            },
          ],
        }),
      });

      // Check if quota is exceeded (status 429)
      if (response.status === 429) {
        setMessages((prev) => [
          ...prev,
          { text: 'Limit exceeded, please try again later.', type: 'gpt' },
        ]);
        return;
      }

      if (!response.ok) {
        console.error('Error:', response.status, await response.text());
        return;
      }

      const data = await response.json();
      console.log('API Response:', data);

      if (data.candidates && data.candidates.length > 0 && data.candidates[0].content.parts.length > 0) {
        setMessages((prev) => [
          ...prev,
          { text: data.candidates[0].content.parts[0].text.trim(), type: 'gpt' },
        ]);
      } else {
        console.error('No content returned from API');
      }
    } catch (error) {
      console.error('Error fetching data from API:', error);
    } finally {
      setLoading(false); // Set loading to false when the API call is completed
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Paper style={{ maxWidth: '600px', margin: '20px auto', padding: '16px', borderRadius: '10px', backgroundColor: darkMode ? '#333' : '#f5f5f5' }}>
        <AppBar position="static" style={{ boxShadow: 'none', backgroundColor: 'transparent' }}>
          <Toolbar style={{ justifyContent: 'center' }}>
            <Avatar style={{ backgroundColor: darkMode ? '#555' : '#1976d2' }} />
            <Typography
              variant="h6"
              style={{
                marginLeft: '8px',
                fontWeight: 'bold',
                color: darkMode ? 'white' : 'black',
                textAlign: 'center',
              }}
            >
              Chat Assistant
            </Typography>
            <IconButton onClick={() => setDarkMode(!darkMode)} style={{ marginLeft: 'auto' }}>
              {darkMode ? <SunIcon /> : <NightlightIcon />}
            </IconButton>
          </Toolbar>
        </AppBar>
        <Container style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', height: '300px', overflowY: 'auto', padding: '8px' }}>
          {messages.map((msg, index) => (
            <Box
              key={index}
              display="flex"
              justifyContent={msg.type === 'user' ? 'flex-start' : 'flex-end'}
              mb={1}
            >
              <Typography
                style={{
                  backgroundColor: msg.type === 'user' ? '#e0e0e0' : darkMode ? '#555' : '#1976d2',
                  color: msg.type === 'user' ? 'black' : 'white',
                  borderRadius: '15px',
                  padding: '8px 12px',
                  maxWidth: '70%',
                  wordWrap: 'break-word',
                }}
              >
                {msg.text}
              </Typography>
            </Box>
          ))}
          {loading && (
            <Box display="flex" justifyContent="flex-end" mb={1}>
              <Typography
                style={{
                  backgroundColor: darkMode ? '#555' : '#1976d2',
                  color: 'white',
                  borderRadius: '15px',
                  padding: '8px 12px',
                  maxWidth: '70%',
                  wordWrap: 'break-word',
                }}
              >
                Typing...
              </Typography>
            </Box>
          )}
        </Container>
        <div style={{ display: 'flex', marginTop: '8px' }}>
          <TextField
            variant="outlined"
            size="small"
            fullWidth
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message here"
            style={{ marginRight: '8px' }}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <Button variant="contained" onClick={handleSend} style={{ backgroundColor: darkMode ? '#555' : '#1976d2' }}>
            Send
          </Button>
        </div>
      </Paper>
    </ThemeProvider>
  );
};

export default Chat;
