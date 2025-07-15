import { useState, useRef, useCallback, useEffect } from "react";
import { Project } from "./MainLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Send, Bot, User, Loader2, Plus, Mic, MicOff, Check, Paperclip } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  attachments?: string[];
}

interface ChatInterfaceProps {
  currentProject: Project;
  onCodeUpdate: (filename: string, content: string) => void;
}

export const ChatInterface = ({ currentProject, onCodeUpdate }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  // Load messages for current project
  const loadMessages = async (projectId: string) => {
    setIsLoadingMessages(true);
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const loadedMessages: Message[] = data.map(msg => ({
        id: msg.id,
        role: msg.role as "user" | "assistant",
        content: msg.content,
        timestamp: new Date(msg.created_at),
        attachments: msg.metadata && typeof msg.metadata === 'object' && 'attachments' in msg.metadata 
          ? (msg.metadata as any).attachments as string[]
          : undefined
      }));

      // If no messages exist, add the default assistant message
      if (loadedMessages.length === 0) {
        const defaultMessage: Message = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "Hello! I'm your AI assistant. I can help you build and modify your app, answer questions, brainstorm ideas, or just chat. What would you like to work on today?",
          timestamp: new Date()
        };
        
        // Save the default message to the database
        await saveMessageToDatabase(defaultMessage, projectId);
        setMessages([defaultMessage]);
      } else {
        setMessages(loadedMessages);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      toast({
        title: "Error",
        description: "Failed to load chat history",
        variant: "destructive",
      });
    } finally {
      setIsLoadingMessages(false);
    }
  };

  // Save message to database
  const saveMessageToDatabase = async (message: Message, projectId: string) => {
    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          id: message.id,
          project_id: projectId,
          role: message.role,
          content: message.content,
          metadata: message.attachments ? { attachments: message.attachments } : null,
          created_at: message.timestamp.toISOString()
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving message:', error);
      // Don't show toast for individual message save errors to avoid spam
    }
  };

  // Load messages when project changes
  useEffect(() => {
    if (currentProject) {
      loadMessages(currentProject.id);
    }
  }, [currentProject.id]);

  const handleSend = async () => {
    if ((!input.trim() && attachedFiles.length === 0) || isLoading) return;

    const fileNames = attachedFiles.map(file => file.name);
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: input,
      timestamp: new Date(),
      attachments: fileNames.length > 0 ? fileNames : undefined
    };

    setMessages(prev => [...prev, userMessage]);
    // Save user message to database
    await saveMessageToDatabase(userMessage, currentProject.id);
    
    const userInput = input;
    setInput("");
    setAttachedFiles([]);
    setIsLoading(true);

    try {
      // Detect if this is an app-building request
      const appBuildingKeywords = [
        'build', 'create', 'make', 'develop', 'generate',
        'app', 'application', 'website', 'page', 'tool',
        'resume builder', 'todo app', 'calculator', 'game',
        'landing page', 'portfolio', 'dashboard', 'form'
      ];

      const isAppBuildingRequest = appBuildingKeywords.some(keyword => 
        userInput.toLowerCase().includes(keyword)
      );

      if (isAppBuildingRequest) {
        // Use the generate-app function for app building
        const { data, error } = await supabase.functions.invoke('generate-app', {
          body: {
            prompt: userInput,
            projectId: currentProject.id
          }
        });

        if (error) {
          throw error;
        }

        if (data.success) {
          // Update the project files with the generated app
          onCodeUpdate('index.html', data.appData.files['index.html']);
          
          // Add assistant response to chat
          const aiMessage: Message = {
            id: crypto.randomUUID(),
            role: "assistant",
            content: data.assistantResponse,
            timestamp: new Date()
          };

          setMessages(prev => [...prev, aiMessage]);
          // Save AI response to database
          await saveMessageToDatabase(aiMessage, currentProject.id);
        } else {
          throw new Error(data.error || 'Failed to generate app');
        }
      } else {
        // Regular chat conversation
        const projectContext = `Current project: ${currentProject.name}
Available files: ${Object.keys(currentProject.files).join(", ")}
${fileNames.length > 0 ? `Attached files: ${fileNames.join(", ")}` : ""}`;

        const { data, error } = await supabase.functions.invoke('chat-with-ai', {
          body: {
            message: userInput,
            context: projectContext
          }
        });

        if (error) {
          throw error;
        }

        const aiMessage: Message = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: data.response,
          timestamp: new Date()
        };

        setMessages(prev => [...prev, aiMessage]);
        // Save AI response to database
        await saveMessageToDatabase(aiMessage, currentProject.id);
      }
    } catch (error) {
      console.error('Error calling AI:', error);
      
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "I apologize, but I encountered an error while processing your request. Please try again, and if the issue persists, check that your API key is configured correctly.",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAttachFile = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setAttachedFiles(prev => [...prev, ...files]);
      toast({
        title: "Files attached",
        description: `${files.length} file(s) attached successfully`,
      });
    }
  }, [toast]);

  const removeAttachedFile = useCallback((index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      
      toast({
        title: "Recording started",
        description: "Speak now, then click the check mark when done",
      });
    } catch (error) {
      toast({
        title: "Recording failed",
        description: "Could not access microphone. Please check permissions.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const stopRecording = useCallback(async () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsProcessingVoice(true);
      
      // Wait for the audio data to be available
      mediaRecorderRef.current.onstop = async () => {
        try {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          
          // Convert blob to base64
          const reader = new FileReader();
          reader.onloadend = async () => {
            const base64Audio = (reader.result as string).split(',')[1];
            
            try {
              const { data, error } = await supabase.functions.invoke('voice-to-text', {
                body: { audio: base64Audio }
              });

              if (error) {
                throw error;
              }

              if (data.error) {
                throw new Error(data.error);
              }

              // Insert transcribed text into input
              const transcribedText = data.text.trim();
              if (transcribedText) {
                setInput(prev => prev + (prev ? " " : "") + transcribedText);
                toast({
                  title: "Voice processed",
                  description: "Your voice has been converted to text",
                });
              } else {
                toast({
                  title: "No speech detected",
                  description: "Please try recording again",
                  variant: "destructive",
                });
              }
            } catch (error) {
              console.error('Speech-to-text error:', error);
              toast({
                title: "Transcription failed",
                description: "Unable to convert speech to text. Please try again.",
                variant: "destructive",
              });
            } finally {
              setIsProcessingVoice(false);
            }
          };
          
          reader.readAsDataURL(audioBlob);
        } catch (error) {
          console.error('Error processing audio:', error);
          toast({
            title: "Recording failed",
            description: "Unable to process audio recording",
            variant: "destructive",
          });
          setIsProcessingVoice(false);
        }
      };
    }
  }, [isRecording, toast]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-subtle">
      <div className="flex items-center gap-3 p-4 border-b bg-card/50 backdrop-blur-sm">
        <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
          <Bot className="w-4 h-4 text-white" />
        </div>
        <div>
          <h2 className="font-semibold">AI Assistant</h2>
          <p className="text-sm text-muted-foreground">Building {currentProject.name}</p>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {isLoadingMessages ? (
            <div className="flex justify-center items-center h-32">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-ai-primary" />
                <p className="text-sm text-muted-foreground">Loading chat history...</p>
              </div>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <Card className={`p-3 max-w-[80%] transition-smooth ${
                    message.role === "user" 
                      ? "bg-primary text-primary-foreground shadow-glow" 
                      : "bg-card"
                  }`}>
                    <div className="flex items-start gap-2">
                      {message.role === "assistant" && (
                        <Bot className="w-4 h-4 mt-1 text-ai-primary" />
                      )}
                      {message.role === "user" && (
                        <User className="w-4 h-4 mt-1" />
                      )}
                       <div className="flex-1">
                         <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                         {message.attachments && message.attachments.length > 0 && (
                           <div className="flex flex-wrap gap-1 mt-2">
                             {message.attachments.map((fileName, index) => (
                               <span key={index} className="inline-flex items-center gap-1 bg-muted/50 px-2 py-1 rounded text-xs">
                                 <Paperclip className="w-3 h-3" />
                                 {fileName}
                               </span>
                             ))}
                           </div>
                         )}
                         <p className="text-xs opacity-70 mt-1">
                           {message.timestamp.toLocaleTimeString()}
                         </p>
                       </div>
                    </div>
                  </Card>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <Card className="p-3 bg-card">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-ai-primary" />
                      <p className="text-sm text-muted-foreground">AI is thinking...</p>
                    </div>
                  </Card>
                </div>
              )}
            </>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t bg-card/50 backdrop-blur-sm">
        {/* Attached files display */}
        {attachedFiles.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {attachedFiles.map((file, index) => (
              <div key={index} className="flex items-center gap-2 bg-muted px-3 py-1 rounded-full text-sm">
                <Paperclip className="w-3 h-3" />
                <span className="truncate max-w-32">{file.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-destructive/20"
                  onClick={() => removeAttachedFile(index)}
                >
                  ×
                </Button>
              </div>
            ))}
          </div>
        )}
        
        <div className="flex gap-2">
          {/* Attachment button */}
          <Button
            variant="outline"
            size="sm"
            className="self-end"
            onClick={handleAttachFile}
            disabled={isLoading}
          >
            <Plus className="w-4 h-4" />
          </Button>
          
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything, describe what you want to build, or just chat..."
            className="min-h-[60px] resize-none transition-smooth focus:ring-2 focus:ring-primary/50"
            disabled={isLoading}
          />
          
          {/* Voice input button */}
          <Button
            variant="outline"
            size="sm"
            className={`self-end ${isRecording ? 'bg-red-500/20 border-red-500/50' : ''}`}
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isLoading || isProcessingVoice}
          >
            {isProcessingVoice ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isRecording ? (
              <Check className="w-4 h-4 text-red-500" />
            ) : (
              <Mic className="w-4 h-4" />
            )}
          </Button>
          
          <Button
            onClick={handleSend}
            disabled={(!input.trim() && attachedFiles.length === 0) || isLoading}
            className="self-end bg-gradient-primary hover:shadow-glow transition-spring"
            size="sm"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
        
        <div className="flex justify-between items-center mt-2">
          <p className="text-xs text-muted-foreground">
            Press Enter to send, Shift+Enter for new line
          </p>
          {isRecording && (
            <p className="text-xs text-red-500 animate-pulse">
              🔴 Recording... Click ✓ when done
            </p>
          )}
        </div>
        
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFileChange}
          accept="image/*,.pdf,.doc,.docx,.txt,.json,.js,.ts,.tsx,.jsx,.css,.html"
        />
      </div>
    </div>
  );
};