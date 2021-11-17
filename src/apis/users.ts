import { NewUserI, UserI, UserQuery } from '../models/users/users.interface';
import { UserFactoryDAO } from '../models/users/users.factory';
import { TipoPersistencia } from '../models/users/users.factory';
import { CartAPI } from './carts';
import { EmailService } from '../services/email';
import { loggers } from 'winston';
import { Logger } from '../services/logger';
import { SmsService } from '../services/twilio';
/**
 * Con esta variable elegimos el tipo de persistencia
 */
const tipo = TipoPersistencia.MongoAtlas;

class User {
  private users;

  constructor() {
    this.users = UserFactoryDAO.get(tipo);
  }

  async getUsers(id?: string): Promise<UserI[]> {
    if (id) return this.users.get(id);

    return this.users.get();
  }

  async addUser(productData: NewUserI): Promise<UserI> {
    const newUser = await this.users.add(productData);
    const content = `${newUser.firstName} ${newUser.lastName} se ha registrado correctamente`
    await CartAPI.createCart(newUser._id);

    try {
      const response = await EmailService.sendEmail(
        newUser.email,
        "Registro Exitoso",
        content
      );
      Logger.info(`${newUser.email} Se ha registrado correctamente`); 
      
    } catch (err) {
      Logger.error(`Error al enviar el mail ${newUser.email} -> ${err}`); 
    }

    try {
      const response = await SmsService.sendMessage(
        newUser.cellphone,
        "Registro Exitoso"
      );
  
      Logger.info(`Se  mando el sms: ${response}`); 
    } catch (err) {
      Logger.error(`Error al enviar sms ${newUser.email} -> ${err}`);
    }


    return newUser;
  }

  async updateUser(id: string, userData: NewUserI) {
    const updatedUser = await this.users.update(id, userData);
    return updatedUser;
  }

  async deleteUser(id: string) {
    await this.users.delete(id);
    //Borrar carrito tambien
  }

  async query(username?: string, email?: string): Promise<UserI> {
    const query = {
      $or: [] as UserQuery[],
    };

    if (username) query.$or.push({ username });

    if (email) query.$or.push({ email });

    return this.users.query(query);
  }

  async ValidatePassword(username: string, password: string) {
    return this.users.validateUserPassword(username, password);
  }
}

export const UserAPI = new User();
