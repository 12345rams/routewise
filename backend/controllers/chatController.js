const chatService = require('../services/chatService');

class ChatController {
  async sendMessage(req, res) {
    try {
      const message = await chatService.saveMessage(req.body);
      res.status(201).json(message);
    } catch (error) {
      res.status(500).json({ error: 'Error sending message' });
    }
  }

  async getMessages(req, res) {
    try {
      const { sender, receiver } = req.params;
      const messages = await chatService.getMessages(sender, receiver);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching messages' });
    }
  }
}

module.exports = new ChatController();
