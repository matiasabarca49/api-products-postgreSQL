const MessageDTO = require('../dto/message.dto.js')
/* const Message = require('../model/messages.model.js')  */
const BaseService = require('./base.service.js')
const MongoRepository = require('../repositories/implementations/mongoRepository.js');
const PostgresRepository = require('../repositories/implementations/postgresRepository.js');

class MessageService extends BaseService {
    constructor(){
        /* const mongoRepository = new MongoRepository(Message) */
        const postgresRepository = new PostgresRepository('messages');
        super(postgresRepository)
    }

    /**
     * Wrapper Pattern
     */

    toFormatDTO(messageData) {
        return new MessageDTO(messageData)
    }
    
    toDTO(message) {
        return MessageDTO.toResponse(message) 
    }

    toManyDTO(messages) {
        return messages.map(message => MessageDTO.toResponse(message))  
    }

}

module.exports = MessageService
