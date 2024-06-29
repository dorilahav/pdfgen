import { randomUUID } from 'crypto';
import { Application } from '../models';

export const createApplication = async (name: string) => {
  return await new Application({
    name,
    secret: randomUUID()
  }).save();
}

export const getApplicationById = async (applicationId: string) => {
  return await Application.findById(applicationId);
}