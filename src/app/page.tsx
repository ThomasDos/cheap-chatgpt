'use client'
import { FormControl, FormControlLabel, FormLabel, Radio, RadioGroup, TextField } from '@mui/material'
import CircularProgress from '@mui/material/CircularProgress'
import Head from 'next/head'
import Image from 'next/image'
import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import styles from '../styles/Home.module.css'

export default function Home() {
  const [userInput, setUserInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState([{ role: 'assistant', content: 'Hi there! How can I help?' }])

  const [model, setModel] = useState('gpt-3.5-turbo') // ['gpt-3.5-turbo', 'gpt-4']
  const [role, setRole] = useState('You are a helpful assistant.')
  const messageListRef = useRef<HTMLDivElement>(null)
  const textAreaRef = useRef<HTMLTextAreaElement>(null)

  // Auto scroll chat to bottom
  useEffect(() => {
    if (messageListRef.current) {
      const messageList = messageListRef.current
      messageList.scrollTop = messageList.scrollHeight
    }
  }, [messages])

  // Focus on input field
  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.focus()
    }
  }, [])

  // Handle errors
  const handleError = () => {
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        role: 'assistant',
        content: 'Oops! There seems to be an error. Please try again.'
      }
    ])
    setLoading(false)
    setUserInput('')
  }

  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (userInput.trim() === '') {
      return
    }

    setLoading(true)
    const context = [...messages, { role: 'user', content: userInput }]
    setMessages(context)
    const messagesJSON = JSON.stringify({ messages: context, model, role_selected: role })
    try {
      // Send chat history to API
      const response = await fetch('/api/chat', {
        method: 'POST',
        body: messagesJSON
      })
      // Reset user input
      setUserInput('')

      const data = await response.json()

      if (!data || data.error) {
        handleError()
        return
      }

      setMessages((prevMessages) => [...prevMessages, { role: 'assistant', content: data.result.content }])
      setLoading(false)
    } catch (error) {
      console.log('ERROR >>>>>', error)
    }
  }

  // Prevent blank submissions and allow for multiline input
  const handleEnter = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && userInput) {
      if (!e.shiftKey && userInput) {
        handleSubmit(e)
      }
    } else if (e.key === 'Enter') {
      e.preventDefault()
    }
  }

  return (
    <>
      <Head>
        <title>Chat UI</title>
        <meta name='description' content='OpenAI interface' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <div className={styles.topnav}>
        <FormControl>
          <FormLabel
            id='demo-radio-buttons-group-label'
            style={{ color: 'black', fontSize: '24px', fontWeight: 'bold' }}>
            Chat GPT Model
          </FormLabel>
          <RadioGroup
            aria-labelledby='demo-radio-buttons-group-label'
            value={model}
            onChange={(e) => setModel(e.target.value)}
            name='radio-buttons-group'
            style={{ display: 'flex', gap: '1rem', flexDirection: 'row', fontSize: '24px' }}>
            <FormControlLabel value='gpt-3.5-turbo' control={<Radio />} label='gpt-3.5' style={{ color: 'black' }} />
            <FormControlLabel value='gpt-4' control={<Radio />} label='gpt-4' style={{ color: 'black' }} />
          </RadioGroup>
        </FormControl>
        <div style={{ width: '80%' }}>
          <TextField
            id='filled-basic'
            label="Assistant's role"
            variant='filled'
            placeholder='You are a helpful assistant.'
            value={role}
            fullWidth
            onChange={(e) => setRole(e.target.value)}
          />
        </div>
      </div>
      <main className={styles.main}>
        <div className={styles.cloud}>
          <div ref={messageListRef} className={styles.messagelist}>
            {messages.map((message, index) => {
              return (
                // The latest message sent by the user will be animated while waiting for a response
                <div
                  key={index}
                  className={
                    message.role === 'user' && loading && index === messages.length - 1
                      ? styles.usermessagewaiting
                      : message.role === 'assistant'
                      ? styles.apimessage
                      : styles.usermessage
                  }>
                  {/* Display the correct icon depending on the message type */}
                  {message.role === 'assistant' ? (
                    <Image
                      src='/einstein.jpg'
                      alt='AI'
                      width='40'
                      height='40'
                      className={styles.boticon}
                      priority={true}
                    />
                  ) : (
                    <Image src='/me.jpg' alt='Me' width='40' height='40' className={styles.usericon} priority={true} />
                  )}
                  <div className={styles.markdownanswer}>
                    {/* Messages are being rendered in Markdown format */}
                    <ReactMarkdown linkTarget={'_blank'}>{message.content}</ReactMarkdown>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        <div className={styles.center}>
          <div className={styles.cloudform}>
            <form onSubmit={handleSubmit}>
              <textarea
                disabled={loading}
                onKeyDown={handleEnter}
                ref={textAreaRef}
                autoFocus={false}
                id='userInput'
                name='userInput'
                placeholder={loading ? 'Waiting for response...' : 'Type your question...'}
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                className={styles.textarea}
              />
              <button type='submit' disabled={loading} className={styles.generatebutton}>
                {loading ? (
                  <div className={styles.loadingwheel}>
                    <CircularProgress color='inherit' size={20} />{' '}
                  </div>
                ) : (
                  // Send icon SVG in input field
                  <svg viewBox='0 0 20 20' className={styles.svgicon} xmlns='http://www.w3.org/2000/svg'>
                    <path d='M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z'></path>
                  </svg>
                )}
              </button>
            </form>
          </div>
        </div>
      </main>
    </>
  )
}
