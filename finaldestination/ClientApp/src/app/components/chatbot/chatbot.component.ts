import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.css']
})
export class ChatbotComponent {
  showChat = signal(false);
  chatInput = '';
  chatMessages = signal<{text: string, isBot: boolean}[]>([
    { text: 'Hello! How can I help you today?', isBot: true }
  ]);

  toggleChat() {
    this.showChat.set(!this.showChat());
  }

  sendMessage() {
    if (!this.chatInput.trim()) return;
    
    this.chatMessages.update(msgs => [...msgs, { text: this.chatInput, isBot: false }]);
    
    setTimeout(() => {
      this.chatMessages.update(msgs => [...msgs, { 
        text: 'Thank you for your message! Our team will assist you shortly.', 
        isBot: true 
      }]);
    }, 1000);
    
    this.chatInput = '';
  }
}
