const Message = require('../models/Message');
class ChatService {
  async saveMessage(data) {
    const message = new Message(data);
    const res= await message.save();
    return res;

  }

  async getMessages(sender, receiver) {
    const res= await Message.find({
      $or: [
        { sender, receiver },
        { sender: receiver, receiver: sender }
      ]
    }).sort({ timestamp: 1 });
   return res;
  }
}

module.exports = new ChatService();
